import React from 'react';
import HomeClientWrapper from './HomeClientWrapper';
import { getFeaturedProductsServer } from '../repositories/productRepository';

export const metadata = {
  metadataBase: new URL('https://www.atlashealth-services.com'),
  title: 'Atlas Health Services | Accredited Diagnostics, Clinical Protocols & Precision Formulations',
  description: 'Atlas Health Services provides certified CE-IVDR capillary blood diagnostics (Bloodo DBS, LifeLab1 ISO 15189), physician clinical intake workflows, high-purity peptides, and advanced health protocols.',
  alternates: {
    canonical: 'https://www.atlashealth-services.com/',
  },
  openGraph: {
    title: 'Atlas Health Services | Accredited Diagnostics & Clinical Protocols',
    description: 'Precision Dried Blood Spot (DBS) tests, physician prescription workflows, and medical-grade protocols backed by ISO 15189 reference laboratory standards.',
    url: 'https://www.atlashealth-services.com/',
    siteName: 'Atlas Health Services',
    type: 'website',
  },
};

import { sanitizeForClient } from '../utils/sanitizeForClient';
import { sanitizePublicProduct } from '../repositories/publicDataSanitizer';

export default async function HomePage() {
  const catalog = await getFeaturedProductsServer();
  const safeCatalog = (catalog || []).map(p => sanitizePublicProduct(p, p.variants || []));
  const serializedCatalog = sanitizeForClient(safeCatalog);
  
  return (
    <HomeClientWrapper initialProducts={serializedCatalog} />
  );
}

// Use ISR to drastically improve TTFB and reduce Firestore reads
export const revalidate = 3600;
