import React from 'react';
import { fetchBrandPricingProductsAction } from '@/actions/pricingActions';
import NplabHormonesPriceClient from './NplabHormonesPriceClient';
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
      title: "NP LABS Hormones (Men's TRT & BHRT) • Official B2B Compounding Schedule",
      description:
        "Complete NP LABS International Compounding Pharmacy catalog for Men's TRT, Bioidentical Hormone Replacement Therapy (BHRT creams, vaginal pessaries, troches, capsules, suppositories) with EUR cost pricing.",
    },
    es: {
      title: 'NP LABS Hormonas (TRT y BHRT) • Tarifa Oficial B2B de Formulación Magistral',
      description:
        'Catálogo completo de NP LABS para TRT masculino y terapia hormonal bioidéntica (cremas BHRT, óvulos, troches sublinguales, cápsulas y supositorios) con precios de coste en EUR.',
    },
  });
}

export default async function NplabHormonesPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';

  const products = await fetchBrandPricingProductsAction({
    brand: 'nplab',
    fallbackProducts: [],
    excludeCombos: false,
    limitCount: 450,
  });

  return (
    <NplabHormonesPriceClient
      initialProducts={products}
      initialCategory={resolvedSearch?.category || 'all'}
      initialCurrency={initialCurrency}
    />
  );
}
