import React from 'react';
import { unstable_cache } from 'next/cache';
import { verifySignedQuoteToken } from '@/services/dynamicPricingEngine';
import { adminDb } from '@/lib/firebaseAdmin';
import { sanitizeForClient } from '@/utils/sanitizeForClient';
import { filterProductVariantsStrictly } from '@/utils/strictFilterEngine';
import { resolveVariantPrice } from '@/utils/resolvePrice';
import { PRICING_TIER } from '@/constants/productEnums';
import { AlertTriangle } from 'lucide-react';
import SharedCatalogClientView from './SharedCatalogClientView';

// ── F-E: ISR with 10-min revalidation instead of force-dynamic ────────────────
// Prices refresh every 10 minutes on the CDN edge. For live pricing, revert to
// `export const dynamic = 'force-dynamic'` and remove this line.
export const revalidate = 600;

export async function generateMetadata({ params }) {
  const title = 'Official Formulations & Product Portfolio | Atlas Health';
  const description = 'Access the verified clinical portfolio of analytical grade peptide formulations, multi-dose presentations, 10-vial kits, and Ex-Works (EXW) pricing for authorized healthcare clinics and providers.';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides-app.web.app';
  const ogImageUrl = `${appUrl}/og-preview.png`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Atlas Health • Clinical Portfolio',
      locale: 'en_US',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImageUrl] },
    other: { 'whatsapp:title': title, 'whatsapp:description': description }
  };
}

// ── F-A/F-C/F-D: Canonical price resolver using schema-defined pricing tiers ──

/**
 * Resolves the canonical unit price and kit price for a variant.
 * Uses resolveVariantPrice() as the SINGLE source of truth, reading from
 * variant.pricing.{tier}.perUnit and variant.pricing.{tier}.kit per schema.
 * Applies markup ONLY when priceSource === 'cost' (master tier = supplier cost).
 */
function resolveCanonicalPrice(variant, { canonicalTier, markupFactor, markupPercent }) {
  const resolved = resolveVariantPrice(variant, {
    tier: canonicalTier,
    targetCurrency: null, // FX handled client-side
  });

  // resolved.perUnit is already from pricing.{tier}.perUnit (schema-canonical)
  let unitPrice = resolved?.perUnit ?? 0;

  // Apply markup ONLY if using the master cost tier as base
  // (i.e., the priceSource is 'cost' and we need to derive a sell price)
  if (markupPercent > 0 && canonicalTier === PRICING_TIER.MASTER && unitPrice > 0) {
    unitPrice = unitPrice * markupFactor;
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
    if (markupPercent > 0 && canonicalTier === PRICING_TIER.MASTER) {
      markedKit = markedKit * markupFactor;
    }
    // Determine if kit is stored as per-unit or as pack-total
    if (markedKit > unitPrice * 2) {
      // Stored as full pack price (e.g. $1,300 for 10 units)
      kitTotalPrice = markedKit;
      tier10UnitPrice = markedKit / 10;
    } else {
      // Stored as discounted per-unit price (e.g. $130/unit for 10+)
      tier10UnitPrice = markedKit;
      kitTotalPrice = markedKit * 10;
    }
  } else if (legacyCost10 != null && Number(legacyCost10) > 0) {
    // Legacy fallback: cost_tiers.cost_10 is always a per-unit discounted price
    let marked10 = Number(legacyCost10);
    if (markupPercent > 0 && canonicalTier === PRICING_TIER.MASTER) {
      marked10 = marked10 * markupFactor;
    }
    tier10UnitPrice = marked10;
    kitTotalPrice = marked10 * 10;
  } else if (unitPrice > 0) {
    // No kit price at all: apply standard 15% volume discount for 10+ units
    tier10UnitPrice = unitPrice * 0.85;
    kitTotalPrice = tier10UnitPrice * 10;
  }

  return { unitPrice, tier10UnitPrice, kitTotalPrice };
}

// ── F-D: Cached Firestore fetch (TTL = 10 min, keyed by supplierId + category) ─

const fetchCatalogData = unstable_cache(
  async (supplierId, category, catalogueFilter) => {
    let productsQuery = adminDb.collection('products')
      .where('status', 'in', ['active', 'published', 'out of stock']);

    if (supplierId && supplierId !== 'all') {
      const sCore = String(supplierId).toLowerCase().replace(/^supplier-/, '');
      // If filtering by specific supplier, use array-contains on supplierIds if available
      productsQuery = productsQuery.where('supplierIds', 'array-contains', supplierId.startsWith('supplier-') ? supplierId : `supplier-${supplierId}`);
    }

    let productsSnapshot, protosSnapshot;
    try {
      [productsSnapshot, protosSnapshot] = await Promise.all([
        productsQuery.get(),
        adminDb.collection('protocols').limit(60).get()
      ]);
    } catch (queryErr) {
      // Fallback to unindexed query if composite index is pending
      const fallbackQuery = adminDb.collection('products').where('status', 'in', ['active', 'published', 'out of stock']);
      [productsSnapshot, protosSnapshot] = await Promise.all([
        fallbackQuery.get(),
        adminDb.collection('protocols').limit(60).get()
      ]);
    }

    // Build variants map grouped by productId directly from each product's subcollection
    const variantsByProduct = {};
    await Promise.all(
      productsSnapshot.docs.map(async (doc) => {
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

    return {
      productDocs: productsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })),
      variantsByProduct,
      protoDocs: protosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  },
  ['shared-catalog-data'],
  { revalidate: 600, tags: ['catalog', 'products', 'variants', 'protocols'] }
);

// ── Page Component ─────────────────────────────────────────────────────────────

export default async function SharedCatalogPage({ params }) {
  const resolvedParams = await params;
  const token = resolvedParams?.token;
  const verification = verifySignedQuoteToken(token);

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
            {verification.expired ? 'Catalog Link Expired' : 'Invalid Catalog Link'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: '1.5', marginBottom: '24px' }}>
            {verification.expired
              ? 'This shared product portfolio link has exceeded its validity period. Please contact your account manager to request an updated access link.'
              : 'The security signature on this catalog link is invalid or has been revoked.'}
          </p>
        </div>
      </div>
    );
  }

  const payload = verification.payload || {};

  // F-B: Guarantee catalogId is always defined — derive from token if missing
  const catalogId = payload.catalogId ||
    `CAT-${(payload.supplierId || 'ATL').toUpperCase().slice(0, 6)}-${Date.now().toString(36).toUpperCase()}`;

  // Check Firestore for remote revocation & update visit analytics
  if (catalogId) {
    try {
      const linkDocRef = adminDb.collection('shared_catalog_links').doc(catalogId);
      const linkSnap = await linkDocRef.get();
      if (linkSnap.exists && linkSnap.data().status === 'revoked') {
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

      // Record visit count asynchronously
      linkDocRef.set({
        visitsCount: (linkSnap.data()?.visitsCount || 0) + 1,
        lastVisitedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    } catch (err) {
      // Non-blocking fallback
    }
  }

  const catalogMeta = { ...payload, catalogId };

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

  // F-D: Use cached Firestore fetch
  let productDocs, variantsByProduct, protoDocs;
  try {
    ({ productDocs, variantsByProduct, protoDocs } = await fetchCatalogData(
      supplierId || 'all',
      category || 'all',
      catalogueFilter || 'all'
    ));
  } catch (err) {
    console.error('[SharedCatalogPage] fetchCatalogData failed:', err);
    productDocs = []; variantsByProduct = {}; protoDocs = [];
  }

  // ── Build Products ───────────────────────────────────────────────────────────
  const products = [];

  for (const data of productDocs) {
    const productVariants = variantsByProduct[data.id] ||
      (Array.isArray(data.variants) ? data.variants : []);

    // Supplier filter — loose match to support both 'supplier-lotusland', 'lotusland', and supplierId 'OLlBbQjgrj6tY7GmM2Jo'
    if (supplierId) {
      const sIdLower = String(supplierId).toLowerCase();
      const sIdCore  = sIdLower.replace(/^supplier-/, ''); // strip prefix
      const matchSupplier =
        (data.supplierId && String(data.supplierId).toLowerCase().includes(sIdCore)) ||
        (Array.isArray(data.supplierIds) && data.supplierIds.some(s =>
          String(s).toLowerCase().includes(sIdCore))) ||
        productVariants.some(v => {
          const vSupplierText = `${v.supplier || ''} ${v.supplierName || ''} ${v.supplierId || ''}`.toLowerCase();
          return vSupplierText.includes(sIdCore) || (sIdCore === 'lotusland' && v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo');
        });
      if (!matchSupplier) continue;
    }

    const variants = filterProductVariantsStrictly(
      { ...data, variants: productVariants },
      { 
        supplierId, 
        supplierFilter: supplierId,
        catalogueFilter,
        categoryFilter: category !== 'all' ? category : null 
      }
    );

    if (variants.length === 0) continue;

    // F-A: Resolve prices using canonical schema
    const resolvedVariants = variants.map(v => {
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
        purity:          v.purity || data.purity || '≥ 99.0% (HPLC Verified)',
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

    if (pricedVariants.length === 0) continue;

    const minPrice = includePrices ? Math.min(...pricedVariants.map(v => v.price)) : 0;
    const maxPrice = includePrices ? Math.max(...pricedVariants.map(v => v.price)) : 0;

    products.push({
      id:               data.id,
      canonicalName:    data.canonicalName || data.name || 'Product',
      description:      data.aiDescription || data.description || '',
      category:         data.categoryId || data.category || 'Peptides',
      purity:           data.purity || '≥ 99.0% HPLC',
      hasCOA:           Boolean(data.hasCOA),
      coaUrl:           data.coaUrl || null,
      requiresColdChain: Boolean(data.requiresColdChain),
      goals:            Array.isArray(data.goals) ? data.goals : [],
      tags:             Array.isArray(data.tags) ? data.tags : [],
      minPrice,
      maxPrice,
      variants:         pricedVariants
    });
  }

  // Sort by name for deterministic output (helps CDN cache stability)
  products.sort((a, b) => a.canonicalName.localeCompare(b.canonicalName));

  // ── Build Protocols ──────────────────────────────────────────────────────────
  const protocols = protoDocs
    .filter(p => p.status !== 'archived' && p.status !== 'draft')
    .map(p => ({
      id:           p.id,
      title:        p.title || p.name || 'Clinical Protocol',
      goal:         p.goal || p.category || 'Therapeutic Optimization',
      targetSystem: p.targetSystem || p.indication || 'Cellular System',
      duration:     p.duration || '8 – 12 Weeks',
      compounds:    Array.isArray(p.compounds) ? p.compounds : (Array.isArray(p.drugs) ? p.drugs : []),
      description:  p.summary || p.description || p.clinicalRationale || '',
      phasesCount:  Array.isArray(p.phases) ? p.phases.length : 1
    }));

  return (
    <SharedCatalogClientView
      catalogMeta={sanitizeForClient(catalogMeta)}
      products={sanitizeForClient(products)}
      protocols={sanitizeForClient(protocols)}
      currency={currency}
      priceSource={priceSource}
      includePrices={includePrices}
    />
  );
}
