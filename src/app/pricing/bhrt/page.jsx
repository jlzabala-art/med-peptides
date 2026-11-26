import React from 'react';
import { fetchBrandPricingProductsAction } from '@/actions/pricingActions';
import { getPharmapolisHormonesCatalog } from '@/data/pharmapolisHormonesRegistry';
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
    path: '/pricing/bhrt',
    siteName: 'Atlas Health Services',
    images: [{ url: `${appUrl}/og-hormones.png`, width: 1200, height: 630, alt: 'EU GMP Bioidentical HRT Schedule' }],
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

export default async function BhrtPricingPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const rawCur = String(resolvedSearch?.cur || resolvedSearch?.currency || '').toUpperCase();
  const initialCurrency = ['EUR', 'AED', 'USD'].includes(rawCur) ? rawCur : 'EUR';
  const rawView = String(resolvedSearch?.view || 'pharmapolis').toLowerCase();
  const initialLab = ['pharmapolis', 'pharmapolis_bulk', 'pharmapolis_all'].includes(rawView)
    ? rawView
    : 'pharmapolis';

  const isAdmin = await isAdminServerSession();
  const pharmapolisProducts = (await fetchBrandPricingProductsAction({
    brand: 'pharmapolis',
    fallbackProducts: getPharmapolisHormonesCatalog(),
    excludeCombos: false,
    limitCount: 120,
  })).map((p) => sanitizePublicProductForViewer(p, { isAdmin }));

  const jsonLd = buildPricingPageJsonLd({
    path: '/pricing/bhrt',
    name: 'EU GMP Bioidentical HRT (BHRT, Capsules, Creams & Pellets)',
    description: 'Official EU GMP Bioidentical Hormone Replacement Therapy catalog covering Topi-CLICK transdermal creams, oral micronized capsules, vaginal preparations, and subcutaneous pellets.',
    currency: initialCurrency,
    category: 'Bioidentical Hormone Replacement Therapy',
    products: pharmapolisProducts,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <NplabHormonesPriceListClient
        pharmapolisProducts={pharmapolisProducts}
        nplabProducts={[]}
        supplierLock="pharmapolis"
        initialLab={initialLab}
        initialCategory={resolvedSearch?.category || 'all'}
        initialCurrency={initialCurrency}
      />
    </>
  );
}
