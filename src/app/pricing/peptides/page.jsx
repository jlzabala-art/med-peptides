import React from 'react';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import PeptidesPriceListClient from './PeptidesPriceListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawRef = resolvedSearch?.ref || resolvedSearch?.code || '';
  const appUrl = 'https://www.atlashealth-services.com';
  const title = 'Clinical Lyophilized Peptides • Official B2B Price Schedule';
  const description = 'Official institutional price schedule for sterile lyophilized bioactive peptide vials. ≥99.0% HPLC purity, cGMP certified, volume box savings.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${appUrl}/pricing/peptides${rawRef ? `?ref=${encodeURIComponent(rawRef)}` : ''}`,
      images: [
        {
          url: `${appUrl}/og-catalog.png`,
          width: 1200,
          height: 630,
          alt: 'Clinical Peptides Price Schedule'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}

export default async function PeptidesPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawRef = resolvedSearch?.ref || resolvedSearch?.referral || resolvedSearch?.tier || null;
  const isDistributor = String(rawRef || '').toLowerCase().includes('distrib') || resolvedSearch?.margin === '15';
  const isWholesalerExplicit = String(rawRef || '').toLowerCase().includes('whole');
  const isPartnerAlias = !rawRef || ['np-labs-international', 'nikolaos-psathas', 'nplabs', 'nplab', 'cat-rx-7482', 'nikolas', 'partner-7482', 'wholesaler'].includes(String(rawRef).toLowerCase());
  const referralCode = isDistributor ? 'DISTRIBUTOR-15' : (isWholesalerExplicit ? 'WHOLESALER-B2B' : (resolvedSearch?.code || (isPartnerAlias ? 'CAT-RX-7482' : rawRef)));

  // Track referral visit server-side without exposing wholesaler identities to client
  if (referralCode) {
    trackReferralVisitAction({
      wholesalerId: isDistributor ? 'distributor' : (isWholesalerExplicit ? 'wholesaler' : (isPartnerAlias ? 'np-labs-international' : referralCode)),
      referralCode,
      collection: 'vials'
    }).catch(() => {});
  }

  // Pre-fetch vials with distributor schedule (+15% margin) or standard wholesale (+15% + 15%)
  const initialProducts = await fetchCollectionProductsAction('vials', referralCode);

  return (
    <PeptidesPriceListClient
      initialProducts={initialProducts || []}
      referralCode={referralCode}
      isDistributor={isDistributor}
    />
  );
}

