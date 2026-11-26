import React from 'react';
import PelletImplantationGuideClient from './PelletImplantationGuideClient';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const lang = normalizeMetaLang(sp);
  const isEs = lang === 'es';

  const meta = buildBilingualMetadata({
    lang,
    topic: 'pellet-guide',
    path: '/guides/hormone-pellets-implantation',
    siteName: 'Atlas Health Services',
    type: 'article',
    en: {
      title: 'Subcutaneous Hormone Pellet Trocar Implantation Guide • Clinical Best Practices | Atlas Health Services',
      description:
        'Interactive surgical trocar procedure, local tumescence protocol, anatomy mapping, dosing matrix, and patient discharge instructions for bioidentical hormone subcutaneous pellets.',
    },
    es: {
      title: 'Guía Clínica de Implantación de Pellets Hormonales y Trócar (BHRT) | Atlas Health Services',
      description:
        'Protocolo clínico interactivo para médicos: técnica quirúrgica con trócar estéril (3.2 mm y 4.5 mm), anestesia tamponada pH 7.2, abanico radial, calculadora de titulación, analítica de control (4–6 sem) y pautas post-implante.',
    },
  });

  return {
    ...meta,
    keywords: isEs
      ? [
          'pellets hormonales',
          'implantación de pellets',
          'trócar 3.2 mm',
          'trócar 4.5 mm',
          'terapia hormonal bioidéntica',
          'BHRT',
          'estradiol subcutáneo',
          'testosterona pellets',
          'guía clínica médicos',
        ]
      : [
          'hormone pellets',
          'trocar implantation guide',
          'BHRT protocol',
          'subcutaneous pellet therapy',
          'bioidentical estradiol testosterone pellets',
        ],
  };
}

export default async function HormonePelletsImplantationPage({ searchParams }) {
  const sp = await searchParams;
  const initialLang = normalizeMetaLang(sp);
  return <PelletImplantationGuideClient initialLang={initialLang} />;
}
