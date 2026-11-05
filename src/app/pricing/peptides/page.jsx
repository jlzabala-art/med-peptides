import React from 'react';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import PeptidesPriceListClient from './PeptidesPriceListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeLang(rawLang) {
  return String(rawLang || '').toLowerCase() === 'es' ? 'es' : 'en';
}

function normalizeCurrency(rawCurrency) {
  const upper = String(rawCurrency || '').toUpperCase();
  return ['USD', 'EUR', 'AED'].includes(upper) ? upper : 'USD';
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawRef = resolvedSearch?.ref || resolvedSearch?.code || '';
  const lang = normalizeLang(resolvedSearch?.lang);
  const currency = normalizeCurrency(resolvedSearch?.currency);
  const isEs = lang === 'es';
  const appUrl = 'https://www.atlashealth-services.com';

  const title = isEs
    ? `Péptidos Clínicos Liofilizados • Tarifa Oficial B2B (${currency}) | Atlas Health`
    : `Clinical Lyophilized Peptides • Official B2B Price Schedule (${currency}) | Atlas Health`;

  const description = isEs
    ? `Tarifa oficial institucional y mayorista en ${currency} para viales de péptidos bioactivos liofilizados estériles (10R). Pureza analítica ≥99.0% HPLC, certificación cGMP y ahorro por volumen en Pack ×10.`
    : `Official institutional and wholesale price schedule in ${currency} for sterile lyophilized bioactive peptide vials (10R). ≥99.0% HPLC purity, cGMP certified, with Pack ×10 volume savings.`;

  const params = new URLSearchParams();
  if (rawRef) params.set('ref', rawRef);
  if (lang === 'es') params.set('lang', 'es');
  if (currency !== 'USD') params.set('currency', currency);
  const qs = params.toString();
  const canonicalUrl = `${appUrl}/pricing/peptides${qs ? `?${qs}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: isEs ? 'es_ES' : 'en_US',
      url: canonicalUrl,
      images: [
        {
          url: `${appUrl}/og-catalog.png`,
          width: 1200,
          height: 630,
          alt: isEs ? `Tarifa Oficial de Péptidos Clínicos (${currency})` : `Clinical Peptides Price Schedule (${currency})`
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
  const initialLang = normalizeLang(resolvedSearch?.lang);
  const initialCurrency = normalizeCurrency(resolvedSearch?.currency);
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
      initialLang={initialLang}
      initialCurrency={initialCurrency}
    />
  );
}
