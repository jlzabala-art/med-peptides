import React from 'react';
import QatarColwayPriceListClient from './QatarColwayPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const revalidate = 60;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  return buildBilingualMetadata({
    lang,
    path: '/pricing/colway-qatar',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Colway Trichology Hair Care • Official Qatar Distributor Price Schedule',
      description: 'Exclusive B2B commercial schedule and landed cost breakdown for Colway Hair Strengthening Shampoo & Conditioner in Qatar.',
    },
    es: {
      title: 'Colway Trichology Cuidado Capilar • Tarifa Oficial de Distribución en Qatar',
      description: 'Tarifa comercial exclusiva B2B y desglose de costes para champú y acondicionador fortalecedor Colway en Qatar.',
    },
  });
}

export default function QatarColwayPricingPage() {
  return <QatarColwayPriceListClient />;
}

