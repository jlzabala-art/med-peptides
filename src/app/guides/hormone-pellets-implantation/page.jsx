import React from 'react';
import PelletImplantationGuideClient from './PelletImplantationGuideClient';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const isEs = (sp?.lang || '').toLowerCase() === 'es';

  const title = isEs
    ? 'Guía Clínica de Implantación de Pellets Hormonales y Trócar (BHRT) | Atlas Health Services'
    : 'Subcutaneous Hormone Pellet Trocar Implantation Guide • Clinical Best Practices | Atlas Health Services';

  const description = isEs
    ? 'Protocolo clínico interactivo para médicos: técnica quirúrgica con trócar estéril (3.2 mm y 4.5 mm), anestesia tamponada pH 7.2, abanico radial, calculadora de titulación, analítica de control (4–6 sem) y pautas post-implante.'
    : 'Interactive surgical trocar procedure, local tumescence protocol, anatomy mapping, dosing matrix, and patient discharge instructions for bioidentical hormone subcutaneous pellets.';

  const canonicalUrl = isEs
    ? 'https://www.atlashealth-services.com/guides/hormone-pellets-implantation?lang=es'
    : 'https://www.atlashealth-services.com/guides/hormone-pellets-implantation';

  return {
    title,
    description,
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
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Atlas Health Services',
      locale: isEs ? 'es_ES' : 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function HormonePelletsImplantationPage() {
  return <PelletImplantationGuideClient />;
}
