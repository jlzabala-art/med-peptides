import React from 'react';
import { fetchBrandPricingProductsAction } from '@/actions/pricingActions';
import { getPharmapolisHormonesCatalog } from '@/data/pharmapolisHormonesRegistry';
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
      title: 'Pharmapolis Bulgaria & NP LABS Hormones (BHRT, Pellets & TRT) • Official B2B Schedule',
      description:
        'Official EU GMP Bioidentical Hormone Replacement Therapy (BHRT creams, oral capsules, subcutaneous pellets, vaginal suppositories & TRT) catalog from Pharmapolis Bulgaria and NP LABS in EUR.',
    },
    es: {
      title: 'Hormonas Pharmapolis Bulgaria y NP LABS (BHRT, Pellets y TRT) • Tarifa Oficial B2B',
      description:
        'Catálogo oficial EU GMP de Terapia Hormonal Bioidéntica (cremas transdérmicas, cápsulas orales, pellets subcutáneos, supositorios vaginales y TRT) de Pharmapolis Bulgaria y NP LABS en EUR.',
    },
  });
}

export default async function NplabHormonesPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const initialLab = String(resolvedSearch?.lab || 'pharmapolis').toLowerCase();

  const [pharmapolisProducts, nplabProducts] = await Promise.all([
    fetchBrandPricingProductsAction({
      brand: 'pharmapolis',
      fallbackProducts: getPharmapolisHormonesCatalog(),
      excludeCombos: false,
      limitCount: 100,
    }),
    fetchBrandPricingProductsAction({
      brand: 'nplab',
      fallbackProducts: [],
      excludeCombos: false,
      limitCount: 450,
    }),
  ]);

  return (
    <NplabHormonesPriceClient
      pharmapolisProducts={pharmapolisProducts}
      nplabProducts={nplabProducts}
      initialLab={initialLab}
      initialCategory={resolvedSearch?.category || 'all'}
      initialCurrency={initialCurrency}
    />
  );
}
