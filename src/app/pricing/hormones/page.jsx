import React from 'react';
import { fetchBrandPricingProductsAction } from '@/actions/pricingActions';
import NplabHormonesPriceListClient from '../nplab-hormones/NplabHormonesPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import { isAdminServerSession } from '@/lib/serverAdminAuth';
import { sanitizePublicProductForViewer } from '@/lib/supplierSanitizer';
import { buildPricingPageJsonLd } from '@/lib/seoPricingJsonLd';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/hormones',
    siteName: 'Atlas Health Services',
    images: [{ url: `${appUrl}/og-hormones.png`, width: 1200, height: 630, alt: 'Compounded Hormones & BHRT Schedule' }],
    en: {
      title: 'Compounded Hormones (TRT, BHRT & Subcutaneous Pellets) • Official B2B Schedule',
      description:
        'Official Compounded Hormones schedule (TRT injectables, BHRT transdermal creams, oral capsules & subcutaneous pellets) in EUR.',
    },
    es: {
      title: 'Hormonas Compuestas (TRT, BHRT y Pellets Subcutáneos) • Tarifa Oficial B2B',
      description:
        'Tarifa oficial de hormonas compuestas (TRT inyectables, cremas transdérmicas BHRT, cápsulas orales y pellets subcutáneos) en EUR.',
    },
  });
}

export default async function HormonesPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const initialLab = String(resolvedSearch?.lab || 'nplab').toLowerCase();

  const isAdmin = await isAdminServerSession();
  const nplabProducts = (await fetchBrandPricingProductsAction({
    brand: 'nplab',
    fallbackProducts: [],
    excludeCombos: false,
    limitCount: 450,
  })).map((p) => sanitizePublicProductForViewer(p, { isAdmin }));

  const jsonLd = buildPricingPageJsonLd({
    path: '/pricing/hormones',
    name: 'Compounded Hormones (TRT, BHRT & Subcutaneous Pellets)',
    description: 'Official Compounded Hormones B2B schedule for TRT injectables, BHRT transdermal creams, oral capsules, and subcutaneous pellets.',
    currency: initialCurrency,
    category: 'Compounded Hormones',
    products: nplabProducts,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NplabHormonesPriceListClient
        pharmapolisProducts={[]}
        nplabProducts={nplabProducts}
        supplierLock="nplab"
        initialLab={initialLab}
        initialCategory={resolvedSearch?.category || 'all'}
        initialCurrency={initialCurrency}
      />
    </>
  );
}
