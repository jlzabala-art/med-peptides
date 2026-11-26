import React from 'react';
import QatarGenomicsPriceListClient from './QatarGenomicsPriceListClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const revalidate = 60;

export async function generateMetadata({ searchParams }) {
  const resolvedSearch = await searchParams;
  const lang = normalizeMetaLang(resolvedSearch);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';

  return buildBilingualMetadata({
    lang,
    path: '/pricing/24genomics-qatar',
    siteName: 'Atlas Health Services',
    images: [{ url: `${appUrl}/og-genomics.png`, width: 1200, height: 630, alt: '24Genomics Nutrition Clinical DNA Schedule' }],
    en: {
      title: '24Genomics Nutrition • Clinical DNA, Precision Nutrigenomics & Compounding Schedule',
      description: 'Official B2B schedule for 24Genomics Nutrition saliva DNA testing kits, clinical nutrition reports, personalized 3-capsule compounding protocols and ongoing clinical consultations.',
    },
    es: {
      title: '24Genomics Nutrition • Tarifa Clínica de ADN, Nutrigenómica y Formulación Magistral',
      description: 'Tarifa oficial B2B para kits de ADN en saliva 24Genomics Nutrition, informes nutricionales clínicos y protocolos personalizados de formulación magistral.',
    },
  });
}

export default function QatarGenomicsPricingPage() {
  return <QatarGenomicsPriceListClient />;
}

