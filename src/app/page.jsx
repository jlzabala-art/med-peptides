import React from 'react';
import HomeClientWrapper from './HomeClientWrapper';
import { getCatalog } from '../repositories/productRepository';

export const metadata = {
  title: 'Atlas Health | Premium Research Peptides & Research Protocols',
  description: 'Atlas Health provides high-purity research peptides and advanced research protocols for scientific professionals. Global logistics and verified analytical standards.',
};

export default async function HomePage() {
  // Fetch data natively on the server, saving the client from having to do it
  const catalog = await getCatalog();
  // Next.js Server Components require absolutely plain JSON objects to pass to Client Components.
  // Using JSON.parse(JSON.stringify()) ensures all prototype methods (like Firestore Timestamp's toJSON)
  // are completely stripped and safely passed.
  const serializedCatalog = JSON.parse(JSON.stringify(catalog));
  
  return (
    <HomeClientWrapper initialProducts={serializedCatalog} />
  );
}

// Force dynamic if you rely on live Firestore reads, 
// or remove to allow Static Generation (SSG) with revalidate
export const dynamic = 'force-dynamic';
