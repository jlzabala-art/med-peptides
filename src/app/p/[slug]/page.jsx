/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import { notFound } from 'next/navigation';
import { adminDb } from '../../../lib/firebaseAdmin';
import { processProductVariants } from '../../../utils/productVariantProcessing';
import { sanitizePublicProduct } from '../../../repositories/publicDataSanitizer';
import PublicProductPage from './PublicProductPage';

export const revalidate = 3600; // ⚡ Multi-Tier ISR (1 hour Edge Cache)
export const dynamicParams = true;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://regenpept.com';

async function getPublicProduct(slug) {
  if (!adminDb || !slug) return null;
  const target = decodeURIComponent(slug).toLowerCase().trim();

  let doc = null;

  // 1. Try by doc ID
  const byId = await adminDb.collection('products').doc(target).get().catch(() => null);
  if (byId?.exists) doc = byId;

  // 2. Try slug field
  if (!doc) {
    const bySlug = await adminDb.collection('products').where('slug', '==', target).limit(1).get().catch(() => null);
    if (bySlug && !bySlug.empty) doc = bySlug.docs[0];
  }

  // 3. Try prefix match
  if (!doc) {
    const byPrefix = await adminDb.collection('products')
      .where('slug', '>=', target).where('slug', '<=', target + '\uf8ff')
      .limit(1).get().catch(() => null);
    if (byPrefix && !byPrefix.empty) doc = byPrefix.docs[0];
  }

  if (!doc) return null;

  const raw = { id: doc.id, ...doc.data() };
  if (raw.status === 'hidden' || raw.status === 'archived') return null;

  // Load variant data: use embedded variants first for 0ms subcollection overhead
  let rawVariants = Array.isArray(raw.variants) && raw.variants.length > 0 ? raw.variants : null;
  if (!rawVariants) {
    const varSnap = await doc.ref.collection('variants').get().catch(() => null);
    rawVariants = (varSnap?.docs || []).map(v => ({ id: v.id, ...v.data() }));
  }

  // 🛡️ Zero-Trust Sanitization
  const sanitized = sanitizePublicProduct(raw, rawVariants);

  // Build processedHierarchy on sanitized variants
  const processedHierarchy = processProductVariants(sanitized.variants || []);

  return {
    ...sanitized,
    processedHierarchy,
  };
}

export async function generateStaticParams() {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('products')
      .where('status', '==', 'published')
      .limit(30)
      .get()
      .catch(() => adminDb.collection('products').limit(30).get());

    return snap.docs.map(d => ({
      slug: d.data().slug || d.id
    })).filter(p => Boolean(p.slug));
  } catch (err) {
    console.warn('[generateStaticParams] Could not pre-generate slugs:', err.message);
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await getPublicProduct(slug);

  if (!product) {
    return {
      title: 'Product Information | Atlas App',
      description: 'Clinical peptide product information.',
    };
  }

  const name = product.name || product.displayName || 'Clinical Peptide';
  const category = product.category || product.therapeutic_category || 'Peptide';
  const desc = (product.description || product.desc || product.objective || 'Clinical product information and administration guidance.').substring(0, 160);
  
  // 🎨 Dynamic OpenGraph preview card
  const ogImageUrl = `${BASE_URL}/api/og-card?type=product&title=${encodeURIComponent(name)}&badge=${encodeURIComponent(category)}&subtitle=${encodeURIComponent('Clinical Datasheet · No Login Required')}`;

  return {
    title: `${name} — Clinical Information | Atlas App`,
    description: desc,
    openGraph: {
      title: `${name} — Clinical Information | Atlas App`,
      description: desc,
      url: `${BASE_URL}/p/${slug}`,
      siteName: 'Atlas Health Clinical',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${name} Clinical Datasheet`,
        }
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} — Clinical Information`,
      description: desc,
      images: [ogImageUrl],
    },
    robots: { index: true, follow: true },
  };
}

import { sanitizeForClient } from '../../../utils/sanitizeForClient';
import { generateProductJsonLd } from '../../../utils/seoStructuredData';

export default async function PublicProductRoute({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const product = await getPublicProduct(slug);

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
      <PublicProductPage product={safeProduct} slug={slug} baseUrl={BASE_URL} />
    </>
  );
}
