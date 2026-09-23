/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { adminDb } from '../../../lib/firebaseAdmin';
import { processProductVariants } from '../../../utils/productVariantProcessing';
import { sanitizePublicProduct } from '../../../repositories/publicDataSanitizer';
import { deriveCanonicalIdentity } from '../../../utils/canonicalProductRegistry';
import PublicDatasheetView from '../../../components/product/PublicDatasheetView';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const BASE_URL = 'https://med-peptides.com';

// ⚡ Layer 1 In-Memory Server RAM Cache (Golden Rule #2)
const PUBLIC_PRODUCT_RAM_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidatePublicProductCache(slug) {
  if (!slug) {
    PUBLIC_PRODUCT_RAM_CACHE.clear();
  } else {
    const s = decodeURIComponent(slug).toLowerCase().trim();
    for (const key of PUBLIC_PRODUCT_RAM_CACHE.keys()) {
      if (key.startsWith(s)) PUBLIC_PRODUCT_RAM_CACHE.delete(key);
    }
  }
}

async function getPublicProduct(slug, supplierFilter = null) {
  if (!adminDb || !slug) return null;
  const target = decodeURIComponent(slug).toLowerCase().trim();
  const cacheKey = `${target}::${supplierFilter || 'all'}`;

  // 1. Layer 1 Check: Instant RAM Cache (< 0.1ms)
  const cached = PUBLIC_PRODUCT_RAM_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let doc = null;

  // 1b. Canonical registry resolution (e.g. 'tb-500-thymosin-beta-4' -> 'tb-500')
  const canonicalIdent = deriveCanonicalIdentity({ id: target, name: target });
  if (canonicalIdent.isRecognized && canonicalIdent.canonicalKey && canonicalIdent.canonicalKey !== target) {
    const canonicalDoc = await adminDb.collection('products').doc(canonicalIdent.canonicalKey).get().catch(() => null);
    if (canonicalDoc?.exists && canonicalDoc.data().status !== 'archived' && canonicalDoc.data().status !== 'hidden') {
      doc = canonicalDoc;
    }
  }

  // 2. Try by doc ID
  if (!doc) {
    const byId = await adminDb.collection('products').doc(target).get().catch(() => null);
    if (byId?.exists) doc = byId;
  }

  // 3. Try slug field
  if (!doc) {
    const bySlug = await adminDb.collection('products').where('slug', '==', target).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  // 4. Try prefix match
  if (!doc) {
    const byPrefix = await adminDb.collection('products')
      .where('slug', '>=', target).where('slug', '<=', target + '\uf8ff')
      .limit(1).get().catch(() => null);
    if (byPrefix && !byPrefix.empty) doc = byPrefix.docs[0];
  }

  if (!doc) return null;

  const raw = { id: doc.id, ...doc.data() };
  raw.slug = raw.slug || doc.id || slug;

  // 🔄 Transparent redirection for archived duplicates / alias documents
  if (raw.status === 'hidden' || raw.status === 'archived') {
    const fallbackTarget = raw.redirectSlug || raw.canonicalKey;
    if (fallbackTarget && fallbackTarget !== target) {
      return getPublicProduct(fallbackTarget, supplierFilter);
    }
    return null;
  }

  // 🛡️ Clinical Guardrail: Public Monograph & Reconstitution is strictly for Peptides
  const rawType = (raw.type || raw.product_type || '').toLowerCase();
  const rawCategory = (raw.category || raw.therapeutic_category || '').toLowerCase();
  const isNonPeptide = rawType === 'device' || rawType === 'supply' || rawCategory.includes('device') || rawCategory.includes('syringe');
  if (isNonPeptide) return null;

  // Load variant data: use embedded variants first for 0ms subcollection overhead
  let rawVariants = Array.isArray(raw.variants) && raw.variants.length > 0 ? raw.variants : null;
  if (!rawVariants) {
    const varSnap = await doc.ref.collection('variants').get().catch(() => null);
    rawVariants = (varSnap?.docs || []).map(v => ({ id: v.id, ...v.data() }));
  }

  function matchSupplier(v, targetFilter) {
    if (!targetFilter) return false;
    const normalize = (s) => String(s || '').toLowerCase().replace(/^supplier[-_]/, '').replace(/[-_\s]+/g, '');
    const cleanTarget = normalize(targetFilter);
    if (!cleanTarget) return false;

    const suppId = normalize(v.supplierId);
    const suppName = normalize(v.supplierName);
    const supp = normalize(v.supplier);

    return (
      suppId === cleanTarget ||
      suppName === cleanTarget ||
      supp === cleanTarget ||
      (suppId && cleanTarget && (suppId.includes(cleanTarget) || cleanTarget.includes(suppId))) ||
      (suppName && cleanTarget && (suppName.includes(cleanTarget) || cleanTarget.includes(suppName))) ||
      (supp && cleanTarget && (supp.includes(cleanTarget) || cleanTarget.includes(supp)))
    );
  }

  // Discover all distinct suppliers available for this product across its raw variants
  const allAvailableSuppliers = [];
  const seenSupplierKeys = new Set();
  for (const v of (rawVariants || [])) {
    const sId = v.supplierId || '';
    if (!sId) continue;
    const cleanId = sId.startsWith('supplier-') ? sId : `supplier-${sId}`;
    if (!seenSupplierKeys.has(cleanId)) {
      seenSupplierKeys.add(cleanId);
      const isMagenta = cleanId.includes('magenta');
      const isLotusland = cleanId.includes('lotus');
      const sName = v.supplierName || (isMagenta ? 'Magenta' : isLotusland ? 'Lotusland' : cleanId);
      const pStr = String(v.presentation || '').toLowerCase();
      allAvailableSuppliers.push({
        id: cleanId,
        name: sName,
        isPen: isMagenta || pStr.includes('pen') || pStr.includes('cartridge'),
        isSpray: pStr.includes('spray') || pStr.includes('nasal')
      });
    }
  }

  // Filter variants strictly for target supplier to prevent cross-supplier contamination.
  // Clinical standard: Default to product's own supplier, or Lotusland Limited if multi-supplier,
  // or the supplier of the available variants.
  const inherentSupplier = raw.supplierId || (rawVariants && rawVariants[0]?.supplierId) || (rawVariants && rawVariants[0]?.supplier);
  const targetSupplier = (supplierFilter && supplierFilter.toLowerCase() !== 'all')
    ? supplierFilter
    : (inherentSupplier && !String(inherentSupplier).toLowerCase().includes('unknown') ? inherentSupplier : 'supplier-lotusland');

  let filtered = (rawVariants || []).filter(v => matchSupplier(v, targetSupplier));
  // If target supplier was 'unknown_supplier', match variants that have unknown/undefined supplier or fall back to inherent
  if (filtered.length === 0 && (targetSupplier === 'unknown_supplier' || targetSupplier.includes('unknown'))) {
    filtered = rawVariants || [];
  }

  if (filtered.length > 0) {
    rawVariants = filtered;
    const matchedSupp = filtered[0].supplierName || filtered[0].supplier || raw.supplierName || raw.supplier || targetSupplier;
    const matchedSuppId = filtered[0].supplierId || raw.supplierId || (targetSupplier.startsWith('supplier-') ? targetSupplier : `supplier-${targetSupplier}`);
    raw.supplierName = matchedSupp;
    raw.supplier = matchedSupp;
    raw.supplierId = matchedSuppId;
    raw.suppliers = [matchedSuppId];
    raw.supplierIds = [matchedSuppId];
    raw.isSingleSupplierLocked = true;
  } else {
    // 🛡️ Graceful Fallback: If requested/default supplier has no active variants,
    // fallback to available variants rather than returning 404 (Golden UX Rule)
    const fallbackSupp = raw.supplierName || raw.supplier || (rawVariants && rawVariants[0]?.supplierName) || (rawVariants && rawVariants[0]?.supplier);
    const fallbackSuppId = raw.supplierId || (rawVariants && rawVariants[0]?.supplierId);
    if (fallbackSupp && fallbackSuppId) {
      raw.supplierName = fallbackSupp;
      raw.supplier = fallbackSupp;
      raw.supplierId = fallbackSuppId;
      raw.suppliers = [fallbackSuppId];
      raw.supplierIds = [fallbackSuppId];
      raw.isSingleSupplierLocked = true;
    } else {
      raw.isSingleSupplierLocked = false;
      raw.supplierName = 'Certified Clinical Laboratories';
      raw.supplier = 'Multi-Source';
    }
  }

  // 🛡️ Zero-Trust Sanitization
  const sanitized = sanitizePublicProduct(raw, rawVariants);

  // Build processedHierarchy on sanitized variants
  const processedHierarchy = processProductVariants(sanitized.variants || []);

  const result = {
    ...sanitized,
    isSingleSupplierLocked: Boolean(raw.isSingleSupplierLocked),
    availableSuppliers: allAvailableSuppliers,
    activeSupplierId: raw.supplierId || targetSupplier,
    processedHierarchy,
  };

  // Populate Layer 1 RAM Cache
  PUBLIC_PRODUCT_RAM_CACHE.set(cacheKey, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return result;
}

export async function generateStaticParams() {
  // Pre-render only the top flagship compounds at build time for instant initial load.
  // All other compounds render seamlessly on-demand via ISR in <100ms and get cached.
  return [
    { slug: 'tirzepatide' },
    { slug: 'semaglutide' },
    { slug: 'retatrutide' },
    { slug: 'bpc-157' },
    { slug: 'tb-500' },
    { slug: 'cjc-1295' },
    { slug: 'ipamorelin' },
    { slug: 'nad-plus' },
  ];
}

export async function generateMetadata({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const supplierFilter = resolvedSearchParams?.supplier || resolvedSearchParams?.supplierId || null;
  const formatParam = resolvedSearchParams?.format || null;
  const doseParam = resolvedSearchParams?.dose || resolvedSearchParams?.strength || null;
  const product = await getPublicProduct(slug, supplierFilter);

  if (!product) {
    return {
      title: 'Pharmaceutical Monograph | Atlas Services',
      description: 'Clinical and pharmaceutical peptide monographs.',
    };
  }

  const name = product.canonicalName || product.name || product.title || slug;
  const isLotus = (product.supplierName || product.supplier || '').toLowerCase().includes('lotusland');
  const supplierName = product.isSingleSupplierLocked
    ? (product.supplierName || product.supplier || supplierFilter || 'Certified Laboratory')
    : 'Certified Clinical Laboratories';
  const purity = product.purity || '≥ 99.0% (RP-HPLC & ESI-MS)';

  const formatSuffix = formatParam ? ` [${formatParam.toUpperCase()}]` : '';
  const doseSuffix = doseParam ? ` (${doseParam.replace(/_/g, ' ')})` : '';

  const { resolveSocialImage, resolveSocialContent } = await import('../../../utils/socialImageResolver');
  const resolvedSocial = resolveSocialContent({
    product,
    variant: { dose: doseParam, format: formatParam },
    recipient: null
  });

  const pageTitle = resolvedSocial.title || `${name}${formatSuffix}${doseSuffix} — Clinical Monograph`;
  const pageDesc = resolvedSocial.description;
  const previewImageUrl = resolveSocialImage(product, formatParam);
  const isPng = previewImageUrl.toLowerCase().endsWith('.png');
  const imageType = isPng ? 'image/png' : 'image/jpeg';
  const canonicalUrl = `${BASE_URL}/p/${slug}${supplierFilter ? `?supplier=${encodeURIComponent(supplierFilter)}` : ''}`;

  return {
    title: pageTitle,
    description: pageDesc,
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: 'Clinical Reference Library',
      images: [
        {
          url: previewImageUrl,
          width: 1200,
          height: 630,
          type: imageType,
          alt: pageTitle,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [previewImageUrl],
    },
    other: {
      'og:image': previewImageUrl,
      'og:image:secure_url': previewImageUrl,
      'og:image:type': imageType,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': pageTitle,
      'article:section': 'Clinical Reference Documentation',
    },
    robots: { index: true, follow: true },
  };
}

import { sanitizeForClient } from '../../../utils/sanitizeForClient';
import { generateProductJsonLd } from '../../../utils/seoStructuredData';

async function getAssociatedProtocols(productId, productSlug, productName) {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('protocols')
      .where('status', 'in', ['active', 'published'])
      .limit(100)
      .get()
      .catch(() => null);
    
    if (!snap || snap.empty) return [];

    const matched = [];
    const pIdLower = String(productId || '').toLowerCase().trim();
    const pSlugLower = String(productSlug || '').toLowerCase().trim();
    const pNameLower = String(productName || '').toLowerCase().trim();

    snap.forEach(doc => {
      const data = doc.data();
      const allItems = [
        ...(Array.isArray(data.bom) ? data.bom : []),
        ...(Array.isArray(data.items) ? data.items : []),
        ...(Array.isArray(data.products) ? data.products : []),
        ...(Array.isArray(data.peptides) ? data.peptides : []),
        ...(Array.isArray(data.compounds) ? data.compounds : []),
        ...(Array.isArray(data.phases) ? data.phases.flatMap(ph => [...(ph.compounds || []), ...(ph.drugs_used || []), ...(ph.products || [])]) : [])
      ];

      const hasItemMatch = allItems.some(it => {
        const itId = String(it.productId || it.id || '').toLowerCase();
        const itSlug = String(it.slug || it.product_slug || '').toLowerCase();
        const itName = String(it.product_name || it.name || it.title || it.canonicalName || '').toLowerCase();
        return (
          (itId && (itId === pIdLower || itId.includes(pSlugLower) || pSlugLower.includes(itId))) ||
          (itSlug && (itSlug === pSlugLower || pSlugLower.includes(itSlug))) ||
          (itName && (itName.includes(pNameLower) || pNameLower.includes(itName)))
        );
      });

      const protoNameLower = String(data.name || data.title || '').toLowerCase();
      const protoDescLower = String(data.overview_summary || data.summary || data.description || data.clinicalRationale || data.metadata?.description || '').toLowerCase();
      const protoSlugLower = String(data.protocol_slug || data.slug || '').toLowerCase();

      const hasTextMatch = (
        protoNameLower.includes(pSlugLower) ||
        protoNameLower.includes(pNameLower) ||
        protoSlugLower.includes(pSlugLower) ||
        protoDescLower.includes(pSlugLower)
      );

      if (hasItemMatch || hasTextMatch) {
        // Clinical Relevance Scoring to identify the Flagship / Primary Blueprint
        let clinicalScore = 0;
        if (data.isFlagship || data.featured) clinicalScore += 60;
        if (protoNameLower.includes(pNameLower) || protoNameLower.includes(pSlugLower)) clinicalScore += 35;
        if (protoNameLower.startsWith(pNameLower)) clinicalScore += 25;
        if (protoNameLower.includes('titration') || protoNameLower.includes('recomposition') || protoNameLower.includes('metabolic')) clinicalScore += 20;
        const phasesCount = Array.isArray(data.phases) ? data.phases.length : 1;
        clinicalScore += phasesCount * 8;
        const durWeeks = Number(data.durationWeeks) || 8;
        clinicalScore += Math.min(durWeeks, 30);

        matched.push({
          id: doc.id,
          slug: data.slug || data.protocol_slug || doc.id,
          name: data.name || data.title || 'Clinical Pathway',
          category: data.category || data.goal || data.therapeutic_category || 'Clinical Protocol',
          duration: data.durationWeeks ? `${data.durationWeeks} Weeks` : (data.duration || '8 Weeks'),
          durationWeeks: durWeeks,
          phasesCount,
          description: (data.overview_summary || data.summary || data.description || data.clinicalRationale || '').substring(0, 180),
          clinicalScore,
          phases: Array.isArray(data.phases) ? data.phases : [],
          bom: Array.isArray(data.bom) ? data.bom : [],
          dosage_schedule: data.dosage_schedule || [],
          phasesSummary: Array.isArray(data.phases)
            ? data.phases.slice(0, 4).map((ph, idx) => ({
                label: ph.phaseLabel || ph.name || `Phase ${idx + 1}`,
                dose: ph.dose || ph.dosage || null,
                unit: ph.unit || 'mg'
              }))
            : []
        });
      }
    });

    // Sort by clinical relevance score descending
    matched.sort((a, b) => b.clinicalScore - a.clinicalScore);

    // Flag the top protocol as the Primary Reference Blueprint
    return matched.slice(0, 5).map((item, idx) => ({
      ...item,
      isPrimary: idx === 0
    }));
  } catch (err) {
    console.warn('[getAssociatedProtocols] Error:', err);
    return [];
  }
}

export default async function PublicProductRoute({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const rawTarget = decodeURIComponent(slug || '').toLowerCase().trim();
  if (rawTarget.includes('verified coa') || rawTarget.includes('coa attached') || rawTarget === 'verified coa attached') {
    redirect('/c/CAT-MU9L9GBN');
  }

  const supplierFilter = resolvedSearchParams?.supplier || resolvedSearchParams?.supplierId || null;
  const initialFormat = resolvedSearchParams?.format || resolvedSearchParams?.presentation || null;
  const initialStrength = resolvedSearchParams?.dose || resolvedSearchParams?.strength || null;
  const initialLang = resolvedSearchParams?.lang || null;
  const initialBatch = resolvedSearchParams?.batch || resolvedSearchParams?.vialCode || null;
  const product = await getPublicProduct(slug, supplierFilter);

  if (!product) {
    notFound();
  }

  const safeProduct = sanitizeForClient(product);
  const associatedProtocols = await getAssociatedProtocols(safeProduct.id, slug, safeProduct.canonicalName || safeProduct.name);
  const jsonLd = generateProductJsonLd(safeProduct, BASE_URL);

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicDatasheetView 
        product={safeProduct} 
        slug={slug} 
        baseUrl={BASE_URL}
        initialSupplierFilter={supplierFilter}
        initialFormat={initialFormat}
        initialStrength={initialStrength}
        initialLang={initialLang}
        initialBatch={initialBatch}
        associatedProtocols={associatedProtocols}
      />
    </>
  );
}
