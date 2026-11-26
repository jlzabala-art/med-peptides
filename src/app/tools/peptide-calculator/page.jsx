import React from 'react';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import PeptideCalculatorClient from './PeptideCalculatorClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);

  return buildBilingualMetadata({
    lang,
    path: '/tools/peptide-calculator',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Free Peptide Reconstitution & U-100 / Click-Dial Dosing Calculator',
      description:
        'Instant clinical peptide reconstitution calculator for 10R lyophilized vials (U-100 insulin syringe units) and 3 mL pre-filled multi-dose peptide pens (100 clicks/mL).',
    },
    es: {
      title: 'Calculadora Gratuita de Reconstitución de Péptidos, Jeringa U-100 y Clics',
      description:
        'Calculadora clínica instantánea para viales liofilizados 10R (unidades en jeringa U-100) y plumas precargadas multidosis de 3 mL (100 clics/mL).',
    },
  });
}

export default async function PeptideCalculatorPage({ searchParams }) {
  const resolved = await searchParams;
  const initialLang = normalizeMetaLang(resolved);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Atlas Health Services Peptide Reconstitution & Click-Dial Calculator',
    url: 'https://www.atlashealth-services.com/tools/peptide-calculator',
    applicationCategory: 'MedicalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PeptideCalculatorClient initialLang={initialLang} />
    </>
  );
}
