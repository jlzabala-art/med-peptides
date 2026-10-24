import React from 'react';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import { SUPPORTED_COLLECTIONS } from '@/constants/supportedCollections';
import VialsCatalogClient from './VialsCatalogClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * OpenGraph Metadata for WhatsApp & Social Preview
 * Supports all clinical collections with strict white-label protection.
 */
export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCollection = String(resolvedSearch?.collection || resolvedSearch?.c || 'vials').toLowerCase();
  const collectionKey = rawCollection === 'ultraperson' ? 'ultraman' : (SUPPORTED_COLLECTIONS[rawCollection] ? rawCollection : 'vials');
  const colMeta = SUPPORTED_COLLECTIONS[collectionKey] || SUPPORTED_COLLECTIONS.vials;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

  return {
    title: `${colMeta.title} • Direct Supply`,
    description: `${colMeta.description} Direct institutional terms, verified batch quality & expedited dispatch.`,
    openGraph: {
      title: `${colMeta.title} • Direct Supply`,
      description: `${colMeta.description} Direct institutional terms, verified batch quality & expedited dispatch.`,
      type: 'website',
      siteName: 'Clinical Formulations Directory',
      url: `${appUrl}/vials?collection=${collectionKey}`,
      locale: 'en_US',
      images: [
        {
          url: `${appUrl}/og-catalog.png`,
          width: 1200,
          height: 630,
          alt: colMeta.name,
          type: 'image/png'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${colMeta.title} • Direct Supply`,
      description: colMeta.description
    }
  };
}

/**
 * Server Component (RSC) for Universal Public Collection Catalog
 * Implements Golden Rule #21 (Promote read-only / prefetch modules to RSC).
 */
export default async function VialsPublicPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCollection = String(resolvedSearch?.collection || resolvedSearch?.c || 'vials').toLowerCase();
  const collection = rawCollection === 'ultraperson' ? 'ultraman' : (SUPPORTED_COLLECTIONS[rawCollection] ? rawCollection : 'vials');
  
  const ref = resolvedSearch?.ref || resolvedSearch?.referral || null;
  const code = resolvedSearch?.code || ref;

  // Track referral visit asynchronously on server
  if (ref) {
    trackReferralVisitAction({
      wholesalerId: ref,
      referralCode: code,
      collection
    }).catch(() => {});
  }

  // Pre-fetch collection products directly on server
  const initialProducts = await fetchCollectionProductsAction(collection);

  const referralInfo = ref ? { wholesalerId: ref, referralCode: code, collection } : null;

  return (
    <VialsCatalogClient
      initialVials={initialProducts}
      initialCollection={collection}
      referralInfo={referralInfo}
    />
  );
}
