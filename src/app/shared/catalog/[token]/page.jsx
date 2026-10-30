import React from 'react';
import { unstable_cache } from 'next/cache';
import { verifySignedQuoteToken } from '@/services/dynamicPricingEngine';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldPath } from 'firebase-admin/firestore';
import { sanitizeForClient } from '@/utils/sanitizeForClient';
import { filterProductVariantsStrictly, isApiOrRawMaterialVariant } from '@/utils/strictFilterEngine';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { PRICING_TIER } from '@/constants/productEnums';
import { sortVariantsAscending, deduplicateVariants } from '@/utils/variantSorter';
import { AlertTriangle } from 'lucide-react';
import SharedCatalogClientView from './SharedCatalogClientView';

// ── Live Pricing & Stock: Fetch directly from Firestore on request ─────────────
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const token = resolvedParams?.token;

  let catalogData = {};
  if (token) {
    const v = verifySignedQuoteToken(token);
    if (v.valid && v.payload) {
      catalogData = v.payload;
    } else {
      try {
        const snap = await adminDb.collection('shared_catalog_links').doc(token).get();
        if (snap.exists) {
          catalogData = snap.data() || {};
        }
      } catch (e) {
        // Fallback to default
      }
    }
  }

  const recipientName = catalogData.recipientName;
  const currency = catalogData.currency || 'USD';
  const supplierTitle = 'Clinical Directory';

  const cleanBrandText = (txt) => {
    if (!txt) return '';
    return String(txt)
      .replace(/\b(?:lotusland|lotus\s*land|nplabs|np\s*labs|regenpept|psathas|nikolaos)\b/gi, '')
      .replace(/\s*[•\-–]\s*Medical\b/gi, '')
      .replace(/\bMedical\s*[•\-–]\s*/gi, '')
      .replace(/\s*[•\-–]\s*$/g, '')
      .replace(/^\s*[•\-–]\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // ── Dynamic Filter Metadata for WhatsApp / Social Unfurling ────────────────
  const goal = resolvedSearch?.g || resolvedSearch?.goals;
  const fda = resolvedSearch?.fda;
  const q = resolvedSearch?.q;
  const fmt = resolvedSearch?.fmt;
  const dose = resolvedSearch?.dose;

  const filterLabels = [];
  if (goal) {
    const GOAL_LABELS = {
      fat_loss: 'Weight Management',
      tissue_repair: 'Tissue Repair',
      anti_aging: 'Longevity & Anti-Aging',
      cognitive: 'Cognitive & Neuro',
      muscle_growth: 'Hypertrophy & Growth',
      libido_wellness: 'Hormonal & Sexual Wellness',
      general_health: 'General Health & Immunity',
      supplies: 'Clinical Solvents & Supplies'
    };
    const mapped = goal.split(',').map(k => GOAL_LABELS[k] || k.replace(/_/g, ' ')).join(', ');
    if (mapped) filterLabels.push(mapped);
  }
  if (fda === 'approved' || fda === '1') filterLabels.push('FDA Approved');
  if (q) filterLabels.push(`"${q}"`);
  if (fmt && fmt !== 'all') filterLabels.push(fmt);
  if (dose && dose !== 'all') filterLabels.push(dose);

  const filterSummary = filterLabels.join(' • ');
  const hasFilter = filterSummary.length > 0;

  const hasSpecificProductIds = Array.isArray(catalogData.productIds) && catalogData.productIds.length > 0;
  const isColwayOrCosmeticMeta = 
    catalogData.category === 'cosmetics' ||
    String(catalogData.title || '').toLowerCase().includes('colway') ||
    (hasSpecificProductIds && catalogData.productIds.every(id => String(id).toLowerCase().includes('colway')));

  // Generic metadata definition — never leaks partner, wholesaler, or supplier brand names
  let title = '';
  let description = '';
  let ogSiteName = '';

  if (isColwayOrCosmeticMeta) {
    ogSiteName = 'Colway Clinical Portfolio';
    title = hasFilter
      ? `Curated Dermocosmetics: ${filterSummary} • Formulations Directory`
      : 'Dermocosmetic & Nutricosmetic Portfolio • Formulations Directory';
    description = `Biologically active tropocollagen, botanical complexes and specialized dermocosmetic systems in ${currency}. Verified institutional delivery terms. Live synchronized stock and registered safety dossiers.`;
  } else {
    // Standard generic peptide catalog metadata
    ogSiteName = 'Clinical Peptide Catalog';
    title = hasFilter
      ? `Clinical Peptide Catalog: ${filterSummary} • Formulations Directory`
      : 'Clinical Peptide Formulations • Specialized Portfolio';
    description = `Clinical peptide portfolio and analytical-grade lyophilized formulations in ${currency}. Verified institutional delivery terms. Live synchronized stock, batch traceability & verified analytical assays.`;
  }

  // Ensure strict brand sanitization across all metadata strings
  title = cleanBrandText(title);
  description = cleanBrandText(description);

  const appUrl = 'https://www.atlashealth-services.com';
  const catalogCode = catalogData.catalogId || token || '';
  const ogImageUrl = `${appUrl}/og-catalog.png`;

  const queryParts = [];
  if (goal) queryParts.push(`g=${encodeURIComponent(goal)}`);
  if (fda && fda !== 'all') queryParts.push(`fda=${encodeURIComponent(fda)}`);
  if (q) queryParts.push(`q=${encodeURIComponent(q)}`);
  if (fmt && fmt !== 'all') queryParts.push(`fmt=${encodeURIComponent(fmt)}`);
  if (dose && dose !== 'all') queryParts.push(`dose=${encodeURIComponent(dose)}`);
  const qs = queryParts.join('&');
  const canonicalUrl = `${appUrl}/c/${catalogCode}${qs ? `?${qs}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: ogSiteName,
      url: canonicalUrl,
      locale: 'en_US',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${ogSiteName} Verification`,
          type: 'image/png',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl]
    },
    other: {
      'whatsapp:title': title,
      'whatsapp:description': description
    }
  };
}

// ── F-A/F-C/F-D: Canonical price resolver using schema-defined pricing tiers ──

/**
 * Resolves the canonical unit price and kit price for a variant.
 * Uses resolveVariantPrice() as the SINGLE source of truth, reading from
 * variant.pricing.{tier}.perUnit and variant.pricing.{tier}.kit per schema.
 * Applies markup when priceSource === 'cost' (master tier) OR when priceSource === 'wholeseller'
 * (where wholesale tier already includes +15% Mediluxe margin, and markupPercent adds the wholeseller's own +15% margin).
 */
function resolveCanonicalPrice(variant, { canonicalTier, markupFactor, markupPercent }) {
  const resolved = resolveVariantPrice(variant, {
    tier: canonicalTier,
    targetCurrency: null, // FX handled client-side
  });

  // resolved.perUnit is already from pricing.{tier}.perUnit (schema-canonical)
  let unitPrice = resolved?.perUnit ?? 0;

  // Apply markup when using master cost tier OR wholesale tier (e.g. Mediluxe +15% base + Nikolas +15% wholeseller margin)
  const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const shouldApplyMarkup = markupPercent > 0 && (canonicalTier === PRICING_TIER.MASTER || canonicalTier === PRICING_TIER.WHOLESALE);
  if (shouldApplyMarkup && unitPrice > 0) {
    unitPrice = round2(unitPrice * markupFactor);
  }

  // Kit price: prefer canonical resolved.kit (pricing.{tier}.kit) first.
  // Fall back to legacy cost_tiers fields only as last resort.
  let tier10UnitPrice = null;
  let kitTotalPrice = null;

  const canonicalKit = resolved?.kit; // pricing.{tier}.kit — pack of 10 total price
  const legacyCost10 = variant.cost_tiers?.cost_10 ?? variant.cost_10 ?? null;

  if (canonicalKit != null && Number(canonicalKit) > 0) {
    // Schema-compliant: kit is the total price for a pack of 10
    let markedKit = Number(canonicalKit);
    if (shouldApplyMarkup) {
      markedKit = round2(markedKit * markupFactor);
    }
    // Determine if kit is stored as per-unit or as pack-total
    if (markedKit > unitPrice * 2) {
      // Stored as full pack price (e.g. $1,300 for 10 units)
      kitTotalPrice = markedKit;
      tier10UnitPrice = round2(markedKit / 10);
    } else {
      // Stored as discounted per-unit price (e.g. $130/unit for 10+)
      tier10UnitPrice = markedKit;
      kitTotalPrice = round2(markedKit * 10);
    }
  } else if (legacyCost10 != null && Number(legacyCost10) > 0) {
    // Legacy fallback: cost_tiers.cost_10 is always a per-unit discounted price
    let marked10 = Number(legacyCost10);
    if (shouldApplyMarkup) {
      marked10 = round2(marked10 * markupFactor);
    }
    tier10UnitPrice = marked10;
    kitTotalPrice = round2(marked10 * 10);
  } else if (unitPrice > 0) {
    // No kit price at all: apply standard 15% volume discount for 10+ units
    tier10UnitPrice = round2(unitPrice * 0.85);
    kitTotalPrice = round2(tier10UnitPrice * 10);
  }

  return { unitPrice, tier10UnitPrice, kitTotalPrice };
}

// ⚡ Golden Rule #2: Layer 1 In-Memory RAM Cache (TTL: 10 minutes)
const CATALOG_RAM_CACHE = new Map();
const CATALOG_CACHE_TTL_MS = 10 * 60 * 1000;

export function invalidateSharedCatalogCache(key = null) {
  if (key) {
    CATALOG_RAM_CACHE.delete(key);
  } else {
    CATALOG_RAM_CACHE.clear();
  }
}

async function fetchCatalogData(supplierId, category, catalogueFilter, productIds = []) {
  const hasSpecificIds = Array.isArray(productIds) && productIds.length > 0;
  const cacheKey = hasSpecificIds
    ? `pids_${[...productIds].sort().join(',')}`
    : `${Array.isArray(supplierId) ? supplierId.join(',') : supplierId || 'all'}_${category || 'all'}_${catalogueFilter || 'all'}`;
  const cached = CATALOG_RAM_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let productDocs = [];
  let protosSnapshot;

  if (hasSpecificIds) {
    const CHUNK = 30;
    const fetchDocPromises = [];
    for (let i = 0; i < productIds.length; i += CHUNK) {
      const chunk = productIds.slice(i, i + CHUNK);
      fetchDocPromises.push(
        adminDb.collection('products').where(FieldPath.documentId(), 'in', chunk).get()
      );
    }
    const [snaps, protos] = await Promise.all([
      Promise.all(fetchDocPromises),
      adminDb.collection('protocols').limit(60).get()
    ]);
    protosSnapshot = protos;
    snaps.forEach(snap => {
      snap.docs.forEach(d => productDocs.push(d));
    });

    // If any IDs were not found by documentId in chunk (e.g. custom IDs or slugs), attempt direct doc gets
    if (productDocs.length < productIds.length) {
      const foundIds = new Set(productDocs.map(d => d.id));
      const missingIds = productIds.filter(id => !foundIds.has(id));
      if (missingIds.length > 0) {
        const directSnaps = await Promise.all(
          missingIds.map(id => adminDb.collection('products').doc(id).get())
        );
        directSnaps.forEach(d => {
          if (d.exists && !foundIds.has(d.id)) {
            productDocs.push(d);
            foundIds.add(d.id);
          }
        });
      }
    }
  } else {
    let productsQuery = adminDb.collection('products')
      .where('status', 'in', ['active', 'published', 'out of stock'])
      .limit(200); // Safety ceiling: prevents full-collection scans that hang the catalog

    const rawList = Array.isArray(supplierId)
      ? supplierId
      : String(supplierId || '').split(',').map(s => s.trim()).filter(Boolean);

    const cleanSuppliers = rawList.filter(s => s !== 'all' && s !== 'All');

    if (cleanSuppliers.length === 1) {
      const s = cleanSuppliers[0];
      const sFormatted = s.startsWith('supplier-') ? s : `supplier-${s}`;
      productsQuery = productsQuery.where('supplierIds', 'array-contains', sFormatted);
    } else if (cleanSuppliers.length > 1) {
      const sFormattedList = cleanSuppliers.map(s => s.startsWith('supplier-') ? s : `supplier-${s}`);
      productsQuery = productsQuery.where('supplierIds', 'array-contains-any', sFormattedList);
    }

    try {
      const [productsSnap, protos] = await Promise.all([
        productsQuery.get(),
        adminDb.collection('protocols').limit(60).get()
      ]);
      productDocs = productsSnap.docs;
      protosSnapshot = protos;
    } catch (queryErr) {
      // Fallback to unindexed query if composite index is pending
      const fallbackQuery = adminDb.collection('products').where('status', 'in', ['active', 'published', 'out of stock']);
      const [fallbackSnap, protos] = await Promise.all([
        fallbackQuery.get(),
        adminDb.collection('protocols').limit(60).get()
      ]);
      productDocs = fallbackSnap.docs;
      protosSnapshot = protos;
    }
  }

  // Build variants map with controlled concurrency (batch of 25) to avoid
  // N+1 Firestore fan-out that exhausts connection limits and freezes the page.
  const CONCURRENT_BATCH_SIZE = 25;
  const variantsByProduct = {};
  for (let i = 0; i < productDocs.length; i += CONCURRENT_BATCH_SIZE) {
    const batch = productDocs.slice(i, i + CONCURRENT_BATCH_SIZE);
    await Promise.all(
      batch.map(async (doc) => {
        const vSnap = await doc.ref.collection('variants').get();
        const activeVars = [];
        vSnap.docs.forEach(vd => {
          const vData = vd.data();
          if (vData.isActive !== false && vData.status !== 'archived') {
            activeVars.push({ id: vd.id, ...vData });
          }
        });
        variantsByProduct[doc.id] = activeVars;
      })
    );
  }

  const result = {
    productDocs: productDocs.map(d => ({ id: d.id, ...d.data() })),
    variantsByProduct,
    protoDocs: (protosSnapshot?.docs || []).map(d => ({ id: d.id, ...d.data() }))
  };

  CATALOG_RAM_CACHE.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CATALOG_CACHE_TTL_MS
  });

  return result;
}

async function resolveTokenVerification(token) {
  let verification = verifySignedQuoteToken(token);
  let resolvedDoc = null;

  if (!verification.valid && token) {
    try {
      const linkSnap = await adminDb.collection('shared_catalog_links').doc(token).get();
      if (linkSnap.exists) {
        resolvedDoc = linkSnap.data() || {};
        if (resolvedDoc.status === 'revoked') {
          verification = { valid: false, revoked: true };
        } else {
          const isExpired = resolvedDoc.expiresAt && new Date(resolvedDoc.expiresAt) < new Date();
          if (isExpired) {
            verification = { valid: false, expired: true };
          } else if (resolvedDoc.token) {
            const v = verifySignedQuoteToken(resolvedDoc.token);
            if (v.valid) {
              verification = { valid: true, payload: { ...(v.payload || {}), ...resolvedDoc } };
            } else {
              verification = { valid: true, payload: resolvedDoc };
            }
          } else {
            verification = { valid: true, payload: resolvedDoc };
          }
        }
      }
    } catch (docErr) {
      console.warn('[SharedCatalogPage] Error loading short link document:', docErr);
    }
  }

  return { verification, resolvedDoc };
}

async function verifyRevocationAndRecordVisit(catalogId, resolvedDoc) {
  let linkData = resolvedDoc || {};
  let isRevoked = false;
  if (catalogId) {
    try {
      const linkDocRef = adminDb.collection('shared_catalog_links').doc(catalogId);
      const linkSnap = resolvedDoc ? { exists: true, data: () => resolvedDoc } : await linkDocRef.get();
      if (linkSnap.exists) {
        linkData = linkSnap.data() || {};
        if (linkData.status === 'revoked') {
          isRevoked = true;
        } else {
          const now = new Date().toISOString();
          const newVisitsCount = (linkData.visitsCount || 0) + 1;
          linkDocRef.set({
            visitsCount: newVisitsCount,
            lastVisitedAt: now
          }, { merge: true }).catch(() => {});

          // If this catalog belongs to a wholesaler (such as Nikolas / NP Labs CAT-RX-7482), also record the referral visit
          const wId = linkData.wholesalerId || (catalogId === 'CAT-RX-7482' ? 'np-labs-international' : null);
          if (wId) {
            const isNikolas = wId === 'np-labs-international' || catalogId === 'CAT-RX-7482';
            const refDoc = adminDb.collection('wholesaler_referrals').doc(wId);
            refDoc.set({
              wholesalerId: wId,
              wholesalerName: isNikolas ? 'Nikolaos Psathas (NP Labs)' : (linkData.recipientName || wId),
              attributedTo: isNikolas ? 'Por atención de Nikolaos Psathas (NP Labs)' : `Referred by ${linkData.recipientName || wId}`,
              referralCode: catalogId,
              visitsCount: newVisitsCount,
              lastVisitedAt: now,
              updatedAt: now
            }, { merge: true }).catch(() => {});

            refDoc.collection('visits').add({
              wholesalerId: wId,
              wholesalerName: isNikolas ? 'Nikolaos Psathas (NP Labs)' : (linkData.recipientName || wId),
              attributedTo: isNikolas ? 'Por atención de Nikolaos Psathas (NP Labs)' : `Referred by ${linkData.recipientName || wId}`,
              referralCode: catalogId,
              source: 'shared_catalog_ssr',
              visitedAt: now
            }).catch(() => {});
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }
  return { linkData, isRevoked };
}

async function fetchCatalogAndFacets(supplierId, category, catalogueFilter, productIds) {
  try {
    const [catalogDataResult, facetsDoc] = await Promise.all([
      fetchCatalogData(
        supplierId || 'all',
        category || 'all',
        catalogueFilter || 'all',
        productIds || []
      ),
      adminDb.collection('_meta').doc('catalog_facets').get().catch(() => null)
    ]);
    const metaFacets = (facetsDoc && facetsDoc.exists) ? facetsDoc.data() : null;
    return {
      productDocs: catalogDataResult.productDocs || [],
      variantsByProduct: catalogDataResult.variantsByProduct || {},
      protoDocs: catalogDataResult.protoDocs || [],
      metaFacets
    };
  } catch (err) {
    console.error('[SharedCatalogPage] fetchCatalogData failed:', err);
    return { productDocs: [], variantsByProduct: {}, protoDocs: [], metaFacets: null };
  }
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default async function SharedCatalogPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;
  const { verification, resolvedDoc } = await resolveTokenVerification(token);

  if (!verification.valid) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#f8fafc',
        padding: '24px', fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          border: '1px solid #fee2e2', padding: '40px',
          maxWidth: '520px', width: '100%', textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#fef2f2', color: '#dc2626',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '20px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            {verification.revoked ? 'Catalog Link Revoked' : verification.expired ? 'Catalog Link Expired' : 'Invalid Catalog Link'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.5', marginBottom: '24px' }}>
            {verification.revoked
              ? 'This shared price list has been revoked or updated by the account manager. Please request a new access link.'
              : verification.expired
              ? 'This shared product portfolio link has exceeded its validity period. Please contact your account manager to request an updated access link.'
              : 'The security signature on this catalog link is invalid or has been revoked.'}
          </p>
        </div>
      </div>
    );
  }

  const payload = verification.payload || resolvedDoc || {};

  // F-B: Guarantee catalogId is always defined — derive deterministically if missing
  const catalogId = payload.catalogId || (resolvedDoc?.catalogId) ||
    `CAT-${(payload.supplierId || 'ATL').toUpperCase().slice(0, 6)}-${String(token || 'SHARED').slice(0, 10).toUpperCase()}`;

  // Check Firestore for remote revocation & update visit analytics
  const { linkData, isRevoked } = await verifyRevocationAndRecordVisit(catalogId, resolvedDoc);

  if (isRevoked) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          border: '1px solid #fee2e2', padding: '40px',
          maxWidth: '520px', width: '100%', textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: '#fef2f2', color: '#dc2626',
            display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '20px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Catalog Link Access Revoked
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.5', marginBottom: '24px' }}>
            This shared price list has been revoked or updated by the account manager. Please request a new access link.
          </p>
        </div>
      </div>
    );
  }

  // Live Firestore linkData takes precedence over JWT token payload
  const catalogMeta = { ...payload, ...linkData, catalogId };

  const priceSource     = catalogMeta.priceSource || 'cost';
  const includePrices   = catalogMeta.includePrices !== false;
  const currency        = catalogMeta.currency || 'USD';
  const supplierId      = catalogMeta.supplierId;
  const catalogueFilter = catalogMeta.catalogueFilter || null;
  const category        = catalogMeta.category || 'all';
  const markupPercent   = Number(catalogMeta.priceMarkupPercent) || 0;
  const markupFactor    = markupPercent > 0 ? (1 + markupPercent / 100) : 1;

  // Map priceSource → canonical PRICING_TIER constant
  const canonicalTier = priceSource === 'wholeseller' ? PRICING_TIER.WHOLESALE
    : priceSource === 'clinic'      ? PRICING_TIER.CLINIC
    : priceSource === 'retail'      ? PRICING_TIER.RETAIL
    : priceSource === 'cost'        ? PRICING_TIER.MASTER
    : PRICING_TIER.WHOLESALE;

  // F-D: Use cached Firestore fetch + pre-aggregated _meta/catalog_facets for Golden Rule #22 Server-side KPIs
  const hasSpecificProductIds = Array.isArray(catalogMeta.productIds) && catalogMeta.productIds.length > 0;
  const { productDocs, variantsByProduct, protoDocs, metaFacets } = await fetchCatalogAndFacets(
    supplierId,
    category,
    catalogueFilter,
    hasSpecificProductIds ? catalogMeta.productIds : []
  );

  // ── Build Products ───────────────────────────────────────────────────────────
  const products = [];

  for (const data of productDocs) {
    if (hasSpecificProductIds && !catalogMeta.productIds.includes(data.id)) {
      continue;
    }

    // Clinical Vials Catalog Guard: Exclude bulk chemical raw materials (API powders by the gram)
    // from clinical finished vial catalogs unless explicitly configured as a raw material catalog or specific products.
    const isRawMaterial = data.productType === 'raw_material' ||
      data.category === 'raw_material' ||
      data.type === 'raw_material' ||
      (data.name || '').toLowerCase().includes('(bulk api)') ||
      (data.canonicalName || '').toLowerCase().includes('(bulk api)');

    if (!hasSpecificProductIds && isRawMaterial && catalogueFilter !== 'raw_material' && catalogueFilter !== 'api' && category !== 'raw_material') {
      continue;
    }

    const subVariants = variantsByProduct[data.id] || [];
    const docVariants = Array.isArray(data.variants) ? data.variants : [];
    const combinedVariants = [...docVariants, ...subVariants].filter(v => v && (v.id || v.dosage || v.dose));
    const productVariants = deduplicateVariants(combinedVariants);

    // Supplier filter — supports single or multiple suppliers (e.g. ['supplier-lotusland', 'supplier-magenta'] or 'supplier-lotusland,supplier-magenta')
    if (!hasSpecificProductIds && supplierId && supplierId !== 'all') {
      const allowedSuppliers = (Array.isArray(supplierId) ? supplierId : String(supplierId).split(','))
        .map(s => s.trim().toLowerCase().replace(/^supplier-/, ''))
        .filter(Boolean);

      if (allowedSuppliers.length > 0) {
        const matchSupplier = allowedSuppliers.some(sIdCore => {
          return (
            (data.supplierId && String(data.supplierId).toLowerCase().includes(sIdCore)) ||
            (Array.isArray(data.supplierIds) && data.supplierIds.some(s =>
              String(s).toLowerCase().includes(sIdCore))) ||
            productVariants.some(v => {
              const vSupplierText = `${v.supplier || ''} ${v.supplierName || ''} ${v.supplierId || ''}`.toLowerCase();
              return vSupplierText.includes(sIdCore) || (sIdCore === 'lotusland' && v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo');
            })
          );
        });
        if (!matchSupplier) continue;
      }
    }

    const variants = (hasSpecificProductIds && (!supplierId || supplierId === 'all'))
      ? (productVariants.length > 0 ? productVariants : [data])
      : filterProductVariantsStrictly(
          { ...data, variants: productVariants },
          { 
            supplierId, 
            supplierFilter: supplierId,
            catalogueFilter,
            categoryFilter: category !== 'all' ? category : null 
          }
        );

    const isExplicitApiCatalog = catalogueFilter === 'raw_material' || catalogueFilter === 'api' || category === 'raw_material';
    const cleanVariants = isExplicitApiCatalog ? variants : variants.filter(v => !isApiOrRawMaterialVariant(v, data));
    if (cleanVariants.length === 0) continue;

    const catLower = String(data.categoryId || data.category || '').toLowerCase();
    const slugLower = String(data.slug || data.id || '').toLowerCase();
    const suppLower = String(data.supplierId || '').toLowerCase();
    const nameLower = String(data.canonicalName || data.name || '').toLowerCase();
    const isCosmeticOrHair =
      catLower.includes('cosmetic') || catLower.includes('skincare') ||
      catLower.includes('trichology') || catLower.includes('nutricosmetic') ||
      catLower.includes('hair') || slugLower.startsWith('colway-') ||
      suppLower.includes('lotusland') || nameLower.includes('shampoo') ||
      nameLower.includes('conditioner') || nameLower.includes('collagen');

    // F-A: Resolve prices using canonical schema
    const resolvedVariants = cleanVariants.map(v => {
      const { unitPrice, tier10UnitPrice, kitTotalPrice } = resolveCanonicalPrice(v, {
        canonicalTier,
        markupFactor,
        markupPercent
      });

      // Stock: prefer structured stock.available/quantity, fall back to legacy
      const stockObj   = typeof v.stock === 'object' ? v.stock : null;
      const stockQty   = stockObj?.quantity ?? (typeof v.stock === 'number' ? v.stock : null)
        ?? (data.inStock ? 50 : 0);
      const inStock     = stockObj?.available !== false && stockQty !== 0;

      return {
        id:              v.id,
        name:            v.name || data.canonicalName || 'Standard Variant',
        dosage:          v.dosage || data.dosage || 'Standard Dose',
        presentation:    v.presentation || v.format || 'Vial',
        route:           v.route || null, // Phase 3 route filter support
        purity:          isCosmeticOrHair ? (v.purity || null) : (v.purity || data.purity || '≥ 99.0% (HPLC Verified)'),
        stock:           inStock ? stockQty : 0,
        coaUrl:          v.coaUrl || data.coaUrl || null,
        price:           unitPrice > 0 ? Number(unitPrice.toFixed(2)) : 0,
        tier10UnitPrice: tier10UnitPrice ? Number(tier10UnitPrice.toFixed(2)) : null,
        kitPrice:        kitTotalPrice ? Number(kitTotalPrice.toFixed(2)) : null,
        currency
      };
    });

    const pricedVariants = includePrices
      ? resolvedVariants.filter(v => v.price > 0)
      : resolvedVariants; // Unpriced vademecum — show all

    const uniqueVariants = deduplicateVariants(pricedVariants);
    if (uniqueVariants.length === 0) continue;

    const minPrice = includePrices ? Math.min(...uniqueVariants.map(v => v.price)) : 0;
    const maxPrice = includePrices ? Math.max(...uniqueVariants.map(v => v.price)) : 0;

    products.push({
      id:               data.id,
      slug:             data.slug || data.id,
      canonicalName:    data.canonicalName || data.name || 'Product',
      description:      data.aiDescription || data.description || '',
      category:         data.categoryId || data.category || 'Peptides',
      purity:           isCosmeticOrHair ? (data.purity || null) : (data.purity || '≥ 99.0% HPLC'),
      supplierId:       data.supplierId || null,
      productType:      data.productType || null,
      hasCOA:           Boolean(data.hasCOA),
      coaUrl:           data.coaUrl || null,
      requiresColdChain: Boolean(data.requiresColdChain),
      goals:            Array.isArray(data.goals) ? data.goals : [],
      tags:             Array.isArray(data.tags) ? data.tags : [],
      minPrice,
      maxPrice,
      variants:         sortVariantsAscending(uniqueVariants)
    });
  }

  // Sort by name for deterministic output (helps CDN cache stability)
  products.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

  // ── Build Protocols (Clinical Dossier Only — Zero Economic Data) ───────────
  // If this is a curated custom view with specific productIds, only attach protocols referencing those products
  const productIdsSet = hasSpecificProductIds ? new Set((catalogMeta.productIds || []).map(id => String(id).toLowerCase())) : null;
  const productNamesSet = hasSpecificProductIds ? new Set(products.flatMap(pr => [
    String(pr.id || '').toLowerCase(),
    String(pr.canonicalName || '').toLowerCase(),
    String(pr.name || '').toLowerCase()
  ]).filter(Boolean)) : null;

  const filteredProtoDocs = protoDocs.filter(p => {
    if (p.status === 'archived' || p.status === 'draft') return false;
    if (!hasSpecificProductIds) return true;

    // In a custom curated view, only keep protocols referencing the curated products
    const protoItems = [
      ...(Array.isArray(p.items) ? p.items.map(it => String(it.productId || it.id || it.name || '').toLowerCase()) : []),
      ...(Array.isArray(p.compounds) ? p.compounds.map(c => String(c.id || c.name || c.compound || c).toLowerCase()) : []),
      ...(Array.isArray(p.products) ? p.products.map(pr => String(pr.id || pr.productId || pr.name || '').toLowerCase()) : []),
      ...(Array.isArray(p.drugs) ? p.drugs.map(d => String(d.id || d.name || d).toLowerCase()) : [])
    ];
    return protoItems.some(item => 
      productIdsSet.has(item) || 
      productNamesSet.has(item) ||
      [...productIdsSet].some(pid => item.includes(pid)) ||
      [...productNamesSet].some(pname => pname.length > 4 && item.includes(pname))
    );
  });

  const protocols = filteredProtoDocs.map(p => ({
    id:                  p.id,
    title:               p.title || p.name || 'Clinical Protocol',
    goal:                p.goal || p.category || 'Therapeutic Optimization',
    targetSystem:        p.targetSystem || p.indication || 'Cellular System',
    duration:            p.duration || '8 – 12 Weeks',
    compounds:           Array.isArray(p.compounds) ? p.compounds : (Array.isArray(p.drugs) ? p.drugs : []),
    description:         p.summary || p.description || p.clinicalRationale || '',
    phasesCount:         Array.isArray(p.phases) ? p.phases.length : 1,
    phases:              Array.isArray(p.phases) ? p.phases : [],
    dosage:              p.dosage || p.dose || '',
    frequency:           p.frequency || p.schedule || '',
    administrationRoute: p.administrationRoute || p.route || 'Subcutaneous (SubQ)',
    cautions:            p.cautions || p.contraindications || '',
    scientificRationale: p.scientificRationale || p.mechanism || ''
  }));

  // ── Server-Side KPIs Calculation (Golden Rule #22 — O(1) in client, zero render performance penalty) ──
  let totalCatalogVariants = 0;
  let readyStockVariants = 0;
  let coaVerifiedCount = 0;

  for (const p of products) {
    const vList = p.variants || [];
    totalCatalogVariants += vList.length;
    for (const v of vList) {
      if ((v.stock || 0) > 0) readyStockVariants++;
      if (v.coaUrl || p.hasCOA || p.coaUrl) coaVerifiedCount++;
    }
  }

  const isCosmeticCatalog = products.length > 0 && products.every(p => {
    const cat = String(p.category || '').toLowerCase();
    const id = String(p.id || '').toLowerCase();
    const name = String(p.canonicalName || p.name || '').toLowerCase();
    const brand = String(p.brand || '').toLowerCase();
    return (
      cat === 'cosmetics' ||
      cat === 'cosmeceuticals' ||
      cat === 'skincare' ||
      brand.includes('colway') ||
      name.includes('colway') ||
      id.startsWith('colway')
    );
  });

  const hasPeptides = products.some(p => {
    const cat = String(p.category || '').toLowerCase();
    const type = String(p.productType || p.type || '').toLowerCase();
    const slug = String(p.slug || p.id || '').toLowerCase();
    const name = String(p.canonicalName || p.name || '').toLowerCase();
    const isCosm = (
      slug.startsWith('colway-') ||
      cat.includes('cosmetic') || cat.includes('skincare') || cat.includes('trichology') ||
      type.includes('cosmetic') || name.includes('shampoo') || name.includes('conditioner') ||
      name.includes('blue diamond') || name.includes('peeling')
    );
    const isDiag = slug.includes('eterna') || slug.includes('bloodo') || cat.includes('diagnostic');
    return !isCosm && !isDiag;
  });

  const normCatFilter = String(catalogueFilter || '').toLowerCase().trim();
  const isCompoundingCatalog = !isCosmeticCatalog && (
    normCatFilter === 'magenta-compounding' ||
    normCatFilter === 'compounding' ||
    catalogMeta?.category === 'compounding'
  );

  const isCuratedCustomView = hasSpecificProductIds && !hasPeptides && !isCosmeticCatalog;

  if (!catalogMeta.title) {
    if (isCosmeticCatalog) {
      catalogMeta.title = 'Colway Cellular Bio-Cosmetics & Nutricosmetics';
    } else if (normCatFilter === 'magenta-peptides') {
      catalogMeta.title = 'Magenta Medical — Clinical Peptides Portfolio';
    } else if (normCatFilter === 'magenta-compounding') {
      catalogMeta.title = 'Magenta Medical — Compounding & Wellness Portfolio';
    } else if (isCuratedCustomView) {
      catalogMeta.title = 'Curated Clinical Formulations Portfolio';
    }
  }

  const serverKpis = isCosmeticCatalog ? {
    // 1. Authoritative Global Database Facets (from _meta/catalog_facets)
    globalTotalProducts: metaFacets?.totals?.products || 430,
    globalTotalVariants: metaFacets?.totals?.variants || 830,
    globalActiveProducts: metaFacets?.totals?.activeProducts || 429,

    // 2. Pre-calculated Catalog-slice Metrics
    catalogTotalProducts: products.length,
    catalogTotalVariants: totalCatalogVariants,
    readyStockCount: readyStockVariants,
    coaVerifiedCount,

    // 3. Dermocosmetics & Nutricosmetics Benchmarks
    isCosmetic: true,
    formulasTitle: 'Cellular Formulations',
    formulasSubtitle: 'Registered CPNP dermocosmetics & nutricosmetics',
    purityTitle: 'Formulation Integrity',
    purityValue: 'CPNP / EU',
    purityBadge: 'EU 1223/2009',
    puritySubtitle: 'Biologically active native tropocollagen',
    dispatchTitle: 'Fulfillment',
    dispatchSlaValue: '24-48h',
    dispatchBadge: 'Ready Stock',
    dispatchSubtitle: 'Immediate warehouse fulfillment',
    traceabilityTitle: 'Quality Certification',
    traceabilityValue: 'CPNP Registered',
    traceabilityBadge: 'Batch Trace',
    traceabilitySubtitle: 'Dermatologically certified & safety dossiers',
    updatedAt: metaFacets?.updatedAt || new Date().toISOString()
  } : isCompoundingCatalog ? {
    // 1. Authoritative Global Database Facets (from _meta/catalog_facets)
    globalTotalProducts: metaFacets?.totals?.products || 430,
    globalTotalVariants: metaFacets?.totals?.variants || 830,
    globalActiveProducts: metaFacets?.totals?.activeProducts || 429,

    // 2. Pre-calculated Catalog-slice Metrics
    catalogTotalProducts: products.length,
    catalogTotalVariants: totalCatalogVariants,
    readyStockCount: readyStockVariants,
    coaVerifiedCount,

    // 3. Clinical & Compounding Benchmarks
    isCompounding: true,
    formulasTitle: 'Compounding Formulations',
    formulasSubtitle: 'Pharmaceutical compounding & cosmeceuticals',
    purityTitle: 'Pharmaceutical Grade',
    purityValue: 'USP / Ph. Eur.',
    purityBadge: 'API Monograph',
    puritySubtitle: 'Pharmacopeial raw materials & vehicles',
    dispatchTitle: 'Compounding SLA',
    dispatchSlaValue: '24-48h',
    dispatchBadge: 'Compounded to Order',
    dispatchSubtitle: 'Cleanroom preparation & quality release',
    traceabilityTitle: 'Delivery Systems',
    traceabilityValue: 'TrichoSol™ & Lipoderm®',
    traceabilityBadge: 'Advanced Vehicles',
    traceabilitySubtitle: 'Transdermal & follicular delivery',
    updatedAt: metaFacets?.updatedAt || new Date().toISOString()
  } : isCuratedCustomView ? {
    // 1. Authoritative Global Database Facets (from _meta/catalog_facets)
    globalTotalProducts: metaFacets?.totals?.products || 430,
    globalTotalVariants: metaFacets?.totals?.variants || 830,
    globalActiveProducts: metaFacets?.totals?.activeProducts || 429,

    // 2. Pre-calculated Catalog-slice Metrics
    catalogTotalProducts: products.length,
    catalogTotalVariants: totalCatalogVariants,
    readyStockCount: readyStockVariants,
    coaVerifiedCount,

    // 3. Neutral Curated Benchmarks
    isCompounding: false,
    formulasTitle: 'Curated Formulations',
    formulasSubtitle: 'Specialized clinical formulations',
    purityTitle: 'Quality Standard',
    purityValue: 'Verified Grade',
    purityBadge: 'Certified',
    puritySubtitle: 'Quality-verified active ingredients',
    dispatchTitle: 'Fulfillment',
    dispatchSlaValue: '24-48h',
    dispatchBadge: 'Priority',
    dispatchSubtitle: 'Institutional fulfillment terms',
    traceabilityTitle: 'Traceability',
    traceabilityValue: 'Verified Lot',
    traceabilityBadge: 'Batch Trace',
    traceabilitySubtitle: 'Full batch verification & release',
    updatedAt: metaFacets?.updatedAt || new Date().toISOString()
  } : {
    // 1. Authoritative Global Database Facets (from _meta/catalog_facets)
    globalTotalProducts: metaFacets?.totals?.products || 430,
    globalTotalVariants: metaFacets?.totals?.variants || 830,
    globalActiveProducts: metaFacets?.totals?.activeProducts || 429,

    // 2. Pre-calculated Catalog-slice Metrics
    catalogTotalProducts: products.length,
    catalogTotalVariants: totalCatalogVariants,
    readyStockCount: readyStockVariants,
    coaVerifiedCount,

    // 3. Clinical & Analytical Benchmarks (Institutional SLAs)
    isCompounding: false,
    formulasTitle: 'Active Formulations',
    formulasSubtitle: 'Lyophilized peptide formulations',
    purityTitle: 'Analytical Purity',
    purityValue: '≥99.2%',
    purityBadge: 'Dual HPLC',
    puritySubtitle: 'Dual-wavelength HPLC & MS',
    dispatchTitle: 'Dispatch SLA',
    dispatchSlaValue: '24-48h Dispatch',
    dispatchBadge: 'Express Transit',
    dispatchSubtitle: 'Lyophilized formulation packaging',
    traceabilityTitle: 'Batch Traceability',
    traceabilityValue: '100% CoA',
    traceabilityBadge: 'Batch Trace',
    traceabilitySubtitle: 'Lot analysis & chromatography',
    updatedAt: metaFacets?.updatedAt || new Date().toISOString()
  };

  return (
    <SharedCatalogClientView
      catalogMeta={sanitizeForClient(catalogMeta)}
      products={sanitizeForClient(products)}
      protocols={sanitizeForClient(protocols)}
      currency={currency}
      priceSource={priceSource}
      includePrices={includePrices}
      serverKpis={sanitizeForClient(serverKpis)}
    />
  );
}
