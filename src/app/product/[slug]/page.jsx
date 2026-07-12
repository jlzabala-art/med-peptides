import React from 'react';
import ProductClientWrapper from './ProductClientWrapper';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';


export async function generateMetadata({ params }) {
  const slug = params?.slug;
  return {
    title: `${slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Product'} - RegenPept`,
    description: `View ${slug} details.`
  };
}

async function getProductBySlugServer(slug) {
  if (!slug) return null;
  const targetSlug = slug.toLowerCase().trim();

  // 1. Try exact doc ID match
  let docRef = doc(db, 'products', targetSlug);
  let docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }

  // 2. Try 'slug' field match
  const q1 = query(collection(db, 'products'), where('slug', '==', targetSlug));
  const snap1 = await getDocs(q1);
  if (!snap1.empty) {
    return { id: snap1.docs[0].id, ...snap1.docs[0].data() };
  }

  return null;
}

export default async function NextProductPage({ params }) {
  const slug = params?.slug;
  const initialProduct = await getProductBySlugServer(slug);

  return (
    <ProductClientWrapper serverParams={params} initialProduct={initialProduct} />
  );
}
export const dynamic = 'force-dynamic';
