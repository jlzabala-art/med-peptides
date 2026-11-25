import React from 'react';
import { fetchBrandPricingProductsAction } from '@/actions/pricingActions';
import { getPharmapolisHormonesCatalog } from '@/data/pharmapolisHormonesRegistry';
import NplabHormonesPriceListClient from '../nplab-hormones/NplabHormonesPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  return buildBilingualMetadata({
    lang,
    path: '/pricing/pharmapolis-hrt',
    siteName: 'Atlas Health Services',
    en: {
      title: 'EU GMP Bioidentical HRT (BHRT, Capsules, Creams & Pellets) • Official Schedule',
      description:
        'Official EU GMP Bioidentical Hormone Replacement Therapy (BHRT Topi-CLICK creams, oral capsules, vaginal preparations & subcutaneous pellets) catalog.',
    },
    es: {
      title: 'HRT Bioidéntica EU GMP (BHRT, Cápsulas, Cremas y Pellets) • Tarifa Oficial',
      description:
        'Catálogo oficial EU GMP de Terapia Hormonal Bioidéntica (cremas Topi-CLICK, cápsulas orales, óvulos vaginales y pellets subcutáneos).',
    },
  });
}

export default async function PharmapolisHrtPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const rawView = String(resolvedSearch?.view || 'pharmapolis').toLowerCase();
  const initialLab = ['pharmapolis', 'pharmapolis_bulk', 'pharmapolis_all'].includes(rawView)
    ? rawView
    : 'pharmapolis';

  const pharmapolisProducts = await fetchBrandPricingProductsAction({
    brand: 'pharmapolis',
    fallbackProducts: getPharmapolisHormonesCatalog(),
    excludeCombos: false,
    limitCount: 120,
  });

  return (
    <NplabHormonesPriceListClient
      pharmapolisProducts={pharmapolisProducts}
      nplabProducts={[]}
      supplierLock="pharmapolis"
      initialLab={initialLab}
      initialCategory={resolvedSearch?.category || 'all'}
      initialCurrency={initialCurrency}
    />
  );
}
