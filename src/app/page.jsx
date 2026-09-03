/* eslint-disable react-refresh/only-export-components -- Next.js App Router: metadata exports must live in page/layout files */
import React from 'react';
import HomeClientWrapper from './HomeClientWrapper';
import { getFeaturedProductsServer } from '../repositories/productRepository';

export const metadata = {
  title: 'Atlas Health | Premium Research Peptides & Research Protocols',
  description: 'Atlas Health provides high-purity research peptides and advanced research protocols for scientific professionals. Global logistics and verified analytical standards.',
};

import { sanitizeForClient } from '../utils/sanitizeForClient';

export default async function HomePage() {
  const catalog = await getFeaturedProductsServer();
  const serializedCatalog = sanitizeForClient(catalog || []);
  
  return (
    <HomeClientWrapper initialProducts={serializedCatalog} />
  );
}

// Use ISR to drastically improve TTFB and reduce Firestore reads
export const revalidate = 3600;
