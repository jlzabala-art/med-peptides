import React from 'react';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import PeptidesPriceListClient from './PeptidesPriceListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawRef = resolvedSearch?.ref || resolvedSearch?.code || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const title = 'Clinical Lyophilized Peptides • Official B2B & Clinic Price Schedule';
  const description = 'Official wholesale and institutional price list for certified clinical peptide vials. ≥99.0% HPLC analytical purity, sterile lyophilization, and volume tier packaging.';

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
  const rawRef = resolvedSearch?.ref || resolvedSearch?.referral || null;
  const isPartnerAlias = !rawRef || ['np-labs-international', 'nikolaos-psathas', 'nplabs', 'nplab', 'cat-rx-7482', 'nikolas', 'partner-7482'].includes(String(rawRef).toLowerCase());
  const referralCode = resolvedSearch?.code || (isPartnerAlias ? 'CAT-RX-7482' : rawRef);

  // Track referral visit server-side without exposing wholesaler identities to client
  if (referralCode) {
    trackReferralVisitAction({
      wholesalerId: isPartnerAlias ? 'np-labs-international' : referralCode,
      referralCode,
      collection: 'vials'
    }).catch(() => {});
  }

  // Pre-fetch 127 vials with double margin (Mediluxe + Wholeseller)
  const initialProducts = await fetchCollectionProductsAction('vials', referralCode);

  return (
    <PeptidesPriceListClient
      initialProducts={initialProducts || []}
      referralCode={referralCode}
    />
  );
}

