/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '../../../lib/firebaseAdmin';
import { sanitizePublicProduct } from '../../../repositories/publicDataSanitizer';
import { sanitizeForClient } from '../../../utils/sanitizeForClient';
import { deriveCanonicalIdentity } from '../../../utils/canonicalProductRegistry';
import { KNOWN_PEPTIDE_DATA } from '../../../utils/knownPeptideData';
import { CURATED_CAS_REGISTRY } from '../../../utils/casResolver';
import RawApiDatasheetView from '../../../components/product/layouts/RawApiDatasheetView';
import { generateBreadcrumbJsonLd } from '../../../utils/seoStructuredData';

export const revalidate = 3600; // ISR: regenerate at most every 60 min
export const dynamicParams = true;

const BASE_URL = 'https://www.atlashealth-services.com';

const RAW_API_CACHE = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getRawApiProduct(slug) {
  if (!slug) return null;
  const target = decodeURIComponent(slug).toLowerCase().trim();
  const cacheKey = `raw::${target}`;

  const cached = RAW_API_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const canonicalIdent = deriveCanonicalIdentity({ id: target, name: target });
  const cleanKey = canonicalIdent.canonicalKey || target.replace(/^api-/, '').replace(/-bulk$/, '');
  const peptideData = KNOWN_PEPTIDE_DATA[cleanKey] || null;

  let doc = null;

  // 1. Try dedicated bulk API doc ID: e.g. 'api-retatrutide-bulk' or 'api-semaglutide-bulk'
  if (adminDb) {
    const bulkId = `api-${cleanKey}-bulk`;
    const bulkDoc = await adminDb.collection('products').doc(bulkId).get().catch(() => null);
    if (bulkDoc?.exists && bulkDoc.data().status !== 'hidden' && bulkDoc.data().status !== 'archived') {
      doc = bulkDoc;
    }
  }

  // 2. Try direct doc ID: target or cleanKey (e.g. 'sodium-selenite' or 'retatrutide')
  if (!doc && adminDb) {
    const directDoc = await adminDb.collection('products').doc(target).get().catch(() => null);
    if (directDoc?.exists) doc = directDoc;
  }

  if (!doc && adminDb && cleanKey !== target) {
    const cleanDoc = await adminDb.collection('products').doc(cleanKey).get().catch(() => null);
    if (cleanDoc?.exists) doc = cleanDoc;
  }

  // 3. Try slug search
  if (!doc && adminDb) {
    const bySlug = await adminDb.collection('products').where('slug', '==', target).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  let raw = null;
  if (doc?.exists) {
    raw = { id: doc.id, ...doc.data() };
  } else if (peptideData) {
    // Synthetic fallback from authentic scientific peptide registry
    raw = {
      id: `api-${cleanKey}-bulk`,
      slug: cleanKey,
      canonicalKey: cleanKey,
      canonicalName: canonicalIdent.canonicalName || cleanKey.toUpperCase(),
      name: `${canonicalIdent.canonicalName || cleanKey} (Bulk API Powder)`,
      category: 'Active Pharmaceutical Ingredients (API)',
      productType: 'raw_api',
      type: 'raw_api',
      is_raw_api: true,
      is_peptide: true,
      casNumber: peptideData.casNumber || CURATED_CAS_REGISTRY[cleanKey],
      molecularFormula: peptideData.molecularFormula,
      molecularWeight: peptideData.molecularWeight ? `${peptideData.molecularWeight} g/mol` : undefined,
      description: peptideData.mechanismOfAction || 'High-purity synthetic peptide active pharmaceutical ingredient for licensed compounding.',
      purity: '≥98.5% (RP-HPLC)',
      grade: 'USP / Ph. Eur. Compounding Reference Grade',
      format: 'Lyophilized Solid Powder',
      packSize: '10g',
      status: 'active'
    };
  } else {
    return null;
  }

  // Ensure raw API flags are applied
  raw.is_raw_api = true;
  raw.type = 'raw_api';
  if (!raw.casNumber) {
    raw.casNumber = CURATED_CAS_REGISTRY[cleanKey] || peptideData?.casNumber || null;
  }
  if (!raw.molecularFormula) {
    raw.molecularFormula = peptideData?.molecularFormula || null;
  }
  if (!raw.molecularWeight) {
    raw.molecularWeight = peptideData?.molecularWeight ? `${peptideData.molecularWeight} g/mol` : null;
  }

  const sanitized = sanitizePublicProduct(raw, raw.variants || []);
  const safe = sanitizeForClient({
    ...raw,
    ...sanitized,
    canonicalKey: cleanKey,
    canonicalName: raw.canonicalName || canonicalIdent.canonicalName || raw.name
  });

  RAW_API_CACHE.set(cacheKey, {
    data: safe,
    expiresAt: Date.now() + CACHE_TTL_MS
  });

  return safe;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await getRawApiProduct(slug);

  if (!product) {
    return {
      title: 'Active Pharmaceutical Ingredients (API) | Atlas Health B2B',
      robots: { index: false, follow: true }
    };
  }

  const cleanName = product.canonicalName || product.name || 'Raw Active Ingredient';
  const pageTitle = `${cleanName} (Bulk API & Raw Material) | Atlas Health Solutions`;
  const pageDesc = `Pharmaceutical-grade ${cleanName} active raw material (API) for licensed compounding pharmacies and CDMO manufacturing. High-purity bulk powder with verified CoA.`;
  const canonicalUrl = `${BASE_URL}/raw/${product.canonicalKey || slug}`;

  return {
    title: pageTitle,
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      siteName: 'Atlas Health Solutions — Active Pharmaceutical Ingredients',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description: pageDesc,
    },
    robots: { index: true, follow: true }
  };
}

export default async function PublicRawApiRoute({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await getRawApiProduct(slug);

  if (!product) {
    notFound();
  }

  const cleanName = product.canonicalName || product.name || slug;
  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'Compounding APIs & Raw Materials', url: '/catalog' },
    { name: `${cleanName} (Bulk API)`, url: `/raw/${slug}` }
  ], BASE_URL);

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <RawApiDatasheetView product={product} slug={slug} baseUrl={BASE_URL} />
    </>
  );
}
