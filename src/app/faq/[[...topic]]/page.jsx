import React from 'react';
import FAQTemplate from '../../../templates/FAQTemplate';
import { getFeaturedProductsServer } from '../../../repositories/productRepository';
import { sanitizePublicProduct } from '../../../repositories/publicDataSanitizer';
import { sanitizeForClient } from '../../../utils/sanitizeForClient';

export const revalidate = 3600; // 1-hour ISR

export const metadata = {
  title: 'Clinical Knowledge & Frequently Asked Questions | Atlas Health',
  description: 'Evidence-based answers on clinical peptide protocols, quality standards (HPLC & MS testing), cold-chain logistics, and physician workflows.',
  alternates: {
    canonical: 'https://www.atlashealth-services.com/faq',
  },
};

export default async function FAQPage() {
  const catalog = await getFeaturedProductsServer();
  const safeCatalog = (catalog || []).map(p => sanitizePublicProduct(p, p.variants || []));
  const serializedCatalog = sanitizeForClient(safeCatalog);

  return <FAQTemplate initialProducts={serializedCatalog} />;
}
