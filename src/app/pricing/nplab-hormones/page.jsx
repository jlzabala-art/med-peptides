import React from 'react';
import { fetchBrandPricingProductsAction } from '@/actions/pricingActions';
import NplabHormonesPriceListClient from './NplabHormonesPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  return buildBilingualMetadata({
    lang,
    path: '/pricing/nplab-hormones',
    siteName: 'Atlas Health Services',
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

export default async function NplabHormonesPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const initialLab = String(resolvedSearch?.lab || 'nplab').toLowerCase();

  const nplabProducts = await fetchBrandPricingProductsAction({
    brand: 'nplab',
    fallbackProducts: [],
    excludeCombos: false,
    limitCount: 450,
  });

  return (
    <NplabHormonesPriceListClient
      pharmapolisProducts={[]}
      nplabProducts={nplabProducts}
      supplierLock="nplab"
      initialLab={initialLab}
      initialCategory={resolvedSearch?.category || 'all'}
      initialCurrency={initialCurrency}
    />
  );
}
