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

async function getPublicProduct(slug, supplierFilter = 'lotusland') {
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

  // Filter variants strictly for target supplier (e.g. Lotusland) to prevent cross-supplier contamination
  const activeSupplier = (supplierFilter || raw.supplierName || raw.supplier || raw.supplierId || '').toLowerCase().trim();
  if (activeSupplier.includes('lotusland')) {
    const lotusVariants = (rawVariants || []).filter(v => {
      const vSupp = (v.supplierName || v.supplier || v.supplierId || '').toLowerCase();
      return vSupp.includes('lotusland');
    });
    if (lotusVariants.length > 0) {
      rawVariants = lotusVariants;
    }
    raw.supplierName = 'Lotusland';
    raw.supplier = 'Lotusland Limited';
    raw.supplierId = 'supplier-lotusland';
  } else if (supplierFilter) {
    const filtered = (rawVariants || []).filter(v => {
      const vSupp = (v.supplierName || v.supplier || v.supplierId || '').toLowerCase();
      return vSupp.includes(supplierFilter.toLowerCase());
    });
    if (filtered.length > 0) rawVariants = filtered;
  }

  // 🛡️ Zero-Trust Sanitization
  const sanitized = sanitizePublicProduct(raw, rawVariants);

  // Build processedHierarchy on sanitized variants
  const processedHierarchy = processProductVariants(sanitized.variants || []);

  const result = {
    ...sanitized,
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
  const supplierFilter = resolvedSearchParams?.supplier || resolvedSearchParams?.supplierId || 'lotusland';
  const product = await getPublicProduct(slug, supplierFilter);

  if (!product) {
    return {
      title: 'Pharmaceutical Monograph | RegenPept',
      description: 'Official clinical and pharmaceutical peptide monographs.',
    };
  }

  const name = product.name || product.displayName || 'Clinical Peptide';
  const targetSystem = product.targetSystem || product.target || 'Physiological Incretin / Glucagon Receptor Axis';
  const supplierName = 'Lotusland (cGMP / ISO 9001:2015)';
  const purity = product.purity || '≥ 99.0% (RP-HPLC & ESI-MS)';

  const pharmaTitle = `${name} (Lyophilized SubQ Vial) — Official Monograph & Clinical Specs | RegenPept × Lotusland`;
  const pharmaDesc = `Official Pharmaceutical Monograph & Analytical Specifications for ${name}. Formulated as a sterile lyophilized subcutaneous vial. Synthesized under certified cGMP & ISO 9001:2015 standards by Lotusland for RegenPept. Features dual-stage RP-HPLC purity ${purity}, ESI-MS molecular validation, peptide reconstitution protocols, cold-chain storage parameters, and clinical administration guidelines.`;

  // Universal dynamic scannable barcode/QR image directing to this page for WhatsApp & social platforms
  const barcodeImageUrl = `${BASE_URL}/api/barcode/${encodeURIComponent(slug)}?supplier=${encodeURIComponent(supplierFilter || 'lotusland')}`;
  const canonicalUrl = `${BASE_URL}/p/${slug}${supplierFilter ? `?supplier=${encodeURIComponent(supplierFilter)}` : ''}`;

  return {
    title: pharmaTitle,
    description: pharmaDesc,
    openGraph: {
      title: `${name} (Lyophilized SubQ Vial) — Official Monograph | RegenPept × Lotusland`,
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
      title: `${name} (SubQ Vial) — Official Monograph & Specs`,
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
      'article:tag': `${name}, Lotusland, cGMP, SubQ Vial, Peptide Monograph, RegenPept`,
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
  const supplierFilter = resolvedSearchParams?.supplier || resolvedSearchParams?.supplierId || 'lotusland';
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
      <PublicDatasheetView product={safeProduct} slug={slug} baseUrl={BASE_URL} />
    </>
  );
}
