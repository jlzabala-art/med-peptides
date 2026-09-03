import React from 'react';
import ProductClientWrapper from './ProductClientWrapper';
import { adminDb } from '@/lib/firebaseAdmin';
import { processProductVariants } from '@/utils/productVariantProcessing';
import { sanitizeForClient } from '@/utils/sanitizeForClient';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  return {
    title: `${slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Product'} - Atlas App`,
    description: `View ${slug} details.`
  };
}

async function getProductBySlugServer(slug) {
  if (!slug || !adminDb) return null;
  const targetSlug = slug.toLowerCase().trim();

  // Helper to resolve variants: prefer embedded variants for 0ms subcollection overhead
  const extractVariants = async (docRef, data) => {
    if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
      return data.variants;
    }
    try {
      const variantsSnap = await docRef.collection('variants').get();
      return variantsSnap.docs.map(v => ({ id: v.id, ...v.data() }));
    } catch {
      return [];
    }
  };

  // 1. Fast path: exact doc ID match
  const docRef = adminDb.collection('products').doc(targetSlug);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const data = docSnap.data() || {};
    const rawVariants = await extractVariants(docRef, data);
    const productData = { id: docSnap.id, ...data, variants: rawVariants };
    productData.processedHierarchy = processProductVariants(rawVariants);
    return productData;
  }

  // 2. Parallel fallback: 'slug' and 'canonicalName' queries
  const [slugSnap, nameSnap] = await Promise.all([
    adminDb.collection('products').where('slug', '==', targetSlug).limit(1).get().catch(() => ({ empty: true })),
    adminDb.collection('products').where('canonicalName', '==', slug).limit(1).get().catch(() => ({ empty: true }))
  ]);

  const foundDoc = (!slugSnap.empty && slugSnap.docs) ? slugSnap.docs[0] : ((!nameSnap.empty && nameSnap.docs) ? nameSnap.docs[0] : null);
  if (foundDoc) {
    const data = foundDoc.data() || {};
    const rawVariants = await extractVariants(foundDoc.ref, data);
    const productData = { id: foundDoc.id, ...data, variants: rawVariants };
    productData.processedHierarchy = processProductVariants(rawVariants);
    return productData;
  }

  return null;
}

export default async function NextProductPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const initialProduct = await getProductBySlugServer(slug);
  const safeProduct = sanitizeForClient(initialProduct);

  return (
    <ProductClientWrapper serverParams={resolvedParams} initialProduct={safeProduct} />
  );
}
export const revalidate = 3600;
