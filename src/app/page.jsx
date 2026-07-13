import React from 'react';
import HomeClientWrapper from './HomeClientWrapper';
import { getFeaturedProductsServer } from '../repositories/productRepository';

export const metadata = {
  title: 'Atlas Health | Premium Research Peptides & Research Protocols',
  description: 'Atlas Health provides high-purity research peptides and advanced research protocols for scientific professionals. Global logistics and verified analytical standards.',
};

export default async function HomePage() {
  // Fetch a lightweight subset of products natively on the server for the home page
  const catalog = await getFeaturedProductsServer();
  // Next.js Server Components require absolutely plain JSON objects to pass to Client Components.
  // Using JSON.parse(JSON.stringify()) ensures all prototype methods (like Firestore Timestamp's toJSON)
  // are completely stripped and safely passed.
  const serializedCatalog = JSON.parse(JSON.stringify(catalog));
  
  return (
    <HomeClientWrapper initialProducts={serializedCatalog} />
  );
}

// Use ISR to drastically improve TTFB and reduce Firestore reads
export const revalidate = 3600;
