import React from 'react';
import { fetchCollectionProductsAction, trackReferralVisitAction } from '@/actions/vialsCatalogActions';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import PeptidesPriceListClient from './PeptidesPriceListClient';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';
import { buildPricingPageJsonLd } from '@/lib/seoPricingJsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeCurrency(rawCurrency) {
  const upper = String(rawCurrency || '').toUpperCase();
  return ['USD', 'EUR', 'AED'].includes(upper) ? upper : 'USD';
}

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);
  const currency = normalizeCurrency(resolvedSearch?.currency || resolvedSearch?.cur);
  const rawDest = String(resolvedSearch?.dest || resolvedSearch?.region || '').toUpperCase();
  const destLabel = rawDest === 'US' ? 'USA' : rawDest === 'AE' ? 'UAE / GCC' : 'EU';
  const rawRef = String(resolvedSearch?.ref || '').toLowerCase();
  const isWholesaler = rawRef.includes('whole');

  return buildBilingualMetadata({
    lang,
    topic: 'peptides',
    currency,
    path: '/pricing/peptides',
    siteName: 'Atlas Health Services',
    en: {
      title: isWholesaler
        ? `Clinical Lyophilized Peptides • ${destLabel} Wholesale Price Schedule (${currency})`
        : `Clinical Lyophilized Peptides • Official B2B Price Schedule (${currency})`,
      description: `Official ${destLabel} wholesale & clinic price schedule in ${currency} for sterile lyophilized peptide vials (10R). ≥99.0% RP-HPLC purity, third-party CoA, cold-pack dispatch & Pack ×10 volume savings.`,
    },
    es: {
      title: isWholesaler
        ? `Péptidos Clínicos Liofilizados • Tarifa Mayorista ${destLabel} (${currency})`
        : `Péptidos Clínicos Liofilizados • Tarifa Oficial B2B (${currency})`,
      description: `Tarifa oficial mayorista y para clínicas (${destLabel}) en ${currency} para viales de péptidos liofilizados estériles (10R). Pureza analítica ≥99,0% HPLC, CoA por lote y ahorro en Pack ×10.`,
    },
  });
}

export default async function PeptidesPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawRef = resolvedSearch?.ref || resolvedSearch?.referral || resolvedSearch?.tier || null;
  const initialLang = normalizeMetaLang(resolvedSearch);
  const initialCurrency = normalizeCurrency(resolvedSearch?.currency);
  const rawDest = String(resolvedSearch?.dest || resolvedSearch?.region || '').toUpperCase();
  const initialDest = ['EU', 'US', 'AE'].includes(rawDest) ? rawDest : 'EU';
  const trackingCode = resolvedSearch?.tc || resolvedSearch?.track || resolvedSearch?.sid || null;

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
  const isAdmin = await isAdminServerSession();
  const rawProducts = await fetchCollectionProductsAction('vials', referralCode);
  const initialProducts = Array.isArray(rawProducts)
    ? rawProducts.map((p) => sanitizePublicProductForViewer(p, { isAdmin }))
    : [];

  const jsonLd = buildPricingPageJsonLd({
    path: '/pricing/peptides',
    name: 'Clinical Lyophilized Peptides • Official B2B Price Schedule',
    description: 'Official institutional and wholesale price schedule for sterile lyophilized bioactive peptide vials (10R, ≥99.0% HPLC purity, cGMP) with Pack ×10 volume pricing.',
    currency: initialCurrency,
    category: 'Clinical Lyophilized Peptides',
    products: initialProducts,
    faqs: [
      {
        q: 'What analytical purity standard applies to Atlas Health Services peptide vials?',
        a: 'All clinical 10R lyophilized peptide vials meet ≥99.0% HPLC purity with cGMP sterile manufacturing and batch CoA traceability.',
      },
      {
        q: 'How are volume Pack ×10 discounts applied?',
        a: 'Clinics ordering 10-vial packs receive automatic B2B volume tier pricing across EUR, USD, and AED schedules.',
      },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PeptidesPriceListClient
        initialProducts={initialProducts || []}
        referralCode={referralCode}
        isDistributor={isDistributor}
        initialLang={initialLang}
        initialCurrency={initialCurrency}
        initialDest={initialDest}
        trackingCode={trackingCode}
      />
    </>
  );
}
