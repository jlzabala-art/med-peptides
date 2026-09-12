/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '../../../lib/firebaseAdmin';
import { processProductVariants } from '../../../utils/productVariantProcessing';
import { sanitizePublicProduct } from '../../../repositories/publicDataSanitizer';
import PublicDatasheetView from '../../../components/product/PublicDatasheetView';

export const revalidate = 3600; // ⚡ Multi-Tier ISR (1 hour Edge Cache)
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://med-peptides-app-27a3a.web.app';

// ⚡ Layer 1 In-Memory Server RAM Cache (Golden Rule #2)
const PUBLIC_PRODUCT_RAM_CACHE = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

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

  // 2. Try by doc ID
  const byId = await adminDb.collection('products').doc(target).get().catch(() => null);
  if (byId?.exists) doc = byId;

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
  if (raw.status === 'hidden' || raw.status === 'archived') return null;

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

  // Filter variants strictly for target supplier to prevent cross-supplier contamination
  const isSpecificSupplierRequested = Boolean(supplierFilter && supplierFilter.toLowerCase() !== 'all');

  if (isSpecificSupplierRequested) {
    const filtered = (rawVariants || []).filter(v => matchSupplier(v, supplierFilter));
    if (filtered.length > 0) {
      rawVariants = filtered;
      const matchedSupp = filtered[0].supplierName || filtered[0].supplier || supplierFilter;
      const matchedSuppId = filtered[0].supplierId || (supplierFilter.startsWith('supplier-') ? supplierFilter : `supplier-${supplierFilter}`);
      raw.supplierName = matchedSupp;
      raw.supplier = matchedSupp;
      raw.supplierId = matchedSuppId;
      raw.suppliers = [matchedSuppId];
      raw.supplierIds = [matchedSuppId];
      raw.isSingleSupplierLocked = true;
    } else {
      // 🛡️ Zero-Leakage: If a specific supplier was requested that does NOT offer this product,
      // return null so it renders 404/notFound instead of leaking all other suppliers!
      return null;
    }
  } else {
    // 🌐 Institutional Multi-Supplier View:
    // Retain all legitimate variants across all authorized suppliers
    raw.isSingleSupplierLocked = false;
    raw.supplierName = 'Certified Clinical Laboratories';
    raw.supplier = 'Multi-Source';
  }

  // 🛡️ Zero-Trust Sanitization
  const sanitized = sanitizePublicProduct(raw, rawVariants);

  // Build processedHierarchy on sanitized variants
  const processedHierarchy = processProductVariants(sanitized.variants || []);

  const result = {
    ...sanitized,
    isSingleSupplierLocked: Boolean(raw.isSingleSupplierLocked),
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
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('products')
      .where('status', '==', 'published')
      .limit(200)
      .get()
      .catch(() => adminDb.collection('products').limit(200).get());

    return snap.docs.map(d => ({
      slug: d.data().slug || d.id
    })).filter(p => Boolean(p.slug));
  } catch (err) {
    console.warn('[generateStaticParams] Could not pre-generate slugs:', err.message);
    return [];
  }
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
      title: 'Pharmaceutical Monograph | RegenPept',
      description: 'Official clinical and pharmaceutical peptide monographs.',
    };
  }

  const name = product.canonicalName || product.name || product.title || slug;
  const isLotus = (product.supplierName || product.supplier || '').toLowerCase().includes('lotusland');
  const supplierName = product.isSingleSupplierLocked
    ? (isLotus ? 'Lotusland (cGMP / ISO 9001:2015)' : (product.supplierName || product.supplier || supplierFilter || 'Official Laboratory'))
    : 'Certified Clinical Laboratories';
  const purity = product.purity || '≥ 99.0% (RP-HPLC & ESI-MS)';

  const formatSuffix = formatParam ? ` [${formatParam.toUpperCase()}]` : '';
  const doseSuffix = doseParam ? ` (${doseParam.replace(/_/g, ' ')})` : '';

  const pharmaTitle = `${name}${doseSuffix}${formatSuffix} — Official Clinical Monograph & Specs | RegenPept`;
  const pharmaDesc = `Official Pharmaceutical Monograph & Analytical Specifications for ${name}. Formulated and synthesized under certified cGMP standards by ${supplierName} for RegenPept. Features dual-stage RP-HPLC purity ${purity}, ESI-MS molecular validation, peptide reconstitution protocols, cold-chain storage parameters, and clinical administration guidelines.`;

  // Universal dynamic scannable barcode/QR image directing to this page for WhatsApp & social platforms
  const barcodeImageUrl = `${BASE_URL}/api/barcode/${encodeURIComponent(slug)}?supplier=${encodeURIComponent(supplierFilter || product.supplierId || 'lotusland')}`;
  const canonicalUrl = `${BASE_URL}/p/${slug}${supplierFilter ? `?supplier=${encodeURIComponent(supplierFilter)}` : ''}`;

  return {
    title: pharmaTitle,
    description: pharmaDesc,
    openGraph: {
      title: pharmaTitle,
      description: pharmaDesc,
      url: canonicalUrl,
      siteName: 'RegenPept Clinical Monographs',
      images: [
        {
          url: barcodeImageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: `Barcode & QR Direct Link for ${name} — Official Clinical Monograph`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Official Monograph & Specs`,
      description: pharmaDesc,
      images: [barcodeImageUrl],
    },
    other: {
      'og:image': barcodeImageUrl,
      'og:image:type': 'image/png',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:alt': `Barcode & QR Direct Link for ${name} — Official Clinical Monograph`,
      'article:section': 'Pharmaceutical & Clinical Peptides',
      'article:tag': `${name}, ${supplierName}, cGMP, Peptide Monograph, RegenPept`,
    },
    robots: { index: true, follow: true },
  };
}

import { sanitizeForClient } from '../../../utils/sanitizeForClient';
import { generateProductJsonLd } from '../../../utils/seoStructuredData';

export default async function PublicProductRoute({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams?.slug;
  const supplierFilter = resolvedSearchParams?.supplier || resolvedSearchParams?.supplierId || null;
  const initialFormat = resolvedSearchParams?.format || null;
  const initialStrength = resolvedSearchParams?.dose || resolvedSearchParams?.strength || null;
  const initialLang = resolvedSearchParams?.lang || null;
  const product = await getPublicProduct(slug, supplierFilter);

  if (!product) {
    notFound();
  }

  const safeProduct = sanitizeForClient(product);
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
      />
    </>
  );
}
