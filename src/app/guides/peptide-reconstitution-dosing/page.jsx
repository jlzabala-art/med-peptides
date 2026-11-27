import React from 'react';
import Link from 'next/link';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PageHeroCard from '@/components/ui/PageHeroCard';
import InlineAlert from '@/components/ui/InlineAlert';
import GuideReferenceTable from '@/components/guides/GuideReferenceTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);

  return buildBilingualMetadata({
    lang,
    topic: 'recon-guide',
    path: '/guides/peptide-reconstitution-dosing',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Clinical Peptide Reconstitution, U-100 Syringe & Click-Dial Dosing Guide',
      description:
        'Evidence-based reference tables for bacteriostatic water reconstitution (1–3 mL), U-100 insulin syringe unit math, 3 mL multi-dose pen click-dial dosing, and 28-day cold-chain stability.',
    },
    es: {
      title: 'Guía Clínica de Reconstitución de Péptidos, Jeringa U-100 y Plumas Click-Dial',
      description:
        'Tablas clínicas de referencia para reconstitución con agua bacteriostática (1–3 mL), equivalencia en unidades U-100, dosificación por clics en plumas de 3 mL y estabilidad en frío de 28 días.',
    },
  });
}

const RECONSTITUTION_ROWS = [
  { vial: '5 mg Vial', water: '1.0 mL BAC', conc: '5,000 mcg / mL', per10Units: '500 mcg (0.5 mg)', per5Units: '250 mcg' },
  { vial: '5 mg Vial', water: '2.0 mL BAC', conc: '2,500 mcg / mL', per10Units: '250 mcg (0.25 mg)', per5Units: '125 mcg' },
  { vial: '10 mg Vial', water: '2.0 mL BAC', conc: '5,000 mcg / mL', per10Units: '500 mcg (0.5 mg)', per5Units: '250 mcg' },
  { vial: '10 mg Vial', water: '3.0 mL BAC', conc: '3,333 mcg / mL', per10Units: '333 mcg', per5Units: '167 mcg' },
  { vial: '15 mg Vial', water: '3.0 mL BAC', conc: '5,000 mcg / mL', per10Units: '500 mcg (0.5 mg)', per5Units: '250 mcg' },
  { vial: '30 mg Vial', water: '3.0 mL BAC', conc: '10,000 mcg / mL', per10Units: '1,000 mcg (1.0 mg)', per5Units: '500 mcg' },
  { vial: '50 mg Vial (e.g. GHK-Cu)', water: '3.0 mL BAC', conc: '16,667 mcg / mL', per10Units: '1,667 mcg (1.67 mg)', per5Units: '833 mcg' },
];

const PEN_CLICK_ROWS = [
  { pen: 'BPC-157 / TB-500 Pen (3 mL)', strength: '10 mg total', perClick: '33.3 mcg / click', commonDose: '15 clicks = 500 mcg' },
  { pen: 'MOTS-c 30 mg Pen (3 mL)', strength: '30 mg total', perClick: '100 mcg / click', commonDose: '50 clicks = 5 mg' },
  { pen: 'SS-31 (Elamipretide) 30 mg Pen (3 mL)', strength: '30 mg total', perClick: '100 mcg / click', commonDose: '40 clicks = 4 mg' },
  { pen: 'GHK-Cu 60 mg Pen (3 mL)', strength: '60 mg total', perClick: '200 mcg / click', commonDose: '10 clicks = 2 mg' },
  { pen: 'NAD+ 750 mg Pen (3 mL)', strength: '750 mg total', perClick: '2.5 mg / click', commonDose: '20 clicks = 50 mg' },
];

export default async function PeptideReconstitutionGuidePage({ searchParams }) {
  const resolved = await searchParams;
  const isEs = normalizeMetaLang(resolved) === 'es';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        name: isEs
          ? 'Guía Clínica de Reconstitución y Dosificación de Péptidos'
          : 'Clinical Peptide Reconstitution & Dosing Guide',
        url: 'https://www.atlashealth-services.com/guides/peptide-reconstitution-dosing',
        publisher: {
          '@type': 'MedicalOrganization',
          name: 'Atlas Health Services',
          url: 'https://www.atlashealth-services.com',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: isEs
              ? '¿Cuántos microgramos hay en 10 unidades (0,1 mL) al reconstituir un vial de 10 mg con 2 mL de agua bacteriostática?'
              : 'How many micrograms are in 10 units (0.1 mL) when reconstituting a 10 mg peptide vial with 2 mL of bacteriostatic water?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs
                ? '10 mg en 2,0 mL equivale a 5.000 mcg/mL. Por tanto, 10 unidades en una jeringa de insulina U-100 (0,10 mL) contienen exactamente 500 mcg (0,5 mg), y 5 unidades contienen 250 mcg.'
                : '10 mg in 2.0 mL equals 5,000 mcg/mL. Therefore, 10 units on a U-100 insulin syringe (0.10 mL) delivers exactly 500 mcg (0.5 mg), and 5 units delivers 250 mcg.',
            },
          },
          {
            '@type': 'Question',
            name: isEs
              ? '¿Cómo se calculan los clics en una pluma precargada multidosis de péptidos de 3 mL?'
              : 'How do click-dial doses work on a 3 mL pre-filled multi-dose peptide pen?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs
                ? 'Cada cartucho de 3 mL contiene 300 unidades/clics estándar (100 clics = 1 mL). Por ejemplo, una pluma de MOTS-c 30 mg (3 mL) administra exactamente 100 mcg por clic, por lo que 50 clics equivalen a 5 mg.'
                : 'Each 3 mL cartridge contains 300 standard dial clicks (100 clicks = 1 mL). For example, a 30 mg MOTS-c 3 mL pen delivers 100 mcg per click, so 50 clicks equals 5 mg.',
            },
          },
          {
            '@type': 'Question',
            name: isEs
              ? '¿Cuánto dura un péptido reconstituido en refrigeración?'
              : 'How long does a reconstituted peptide remain stable under refrigeration?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs
                ? 'Una vez reconstituido con agua bacteriostática estéril (0,9% alcohol bencílico), los viales liofilizados cGMP mantienen su potencia clínica durante 28 días refrigerados entre 2 °C y 8 °C sin agitar.'
                : 'Once reconstituted with sterile bacteriostatic water (0.9% benzyl alcohol), cGMP lyophilized peptide vials retain clinical potency for up to 28 days refrigerated at 2°C–8°C without vigorous shaking.',
            },
          },
        ],
      },
    ],
  };

  const breadcrumb = [
    { label: isEs ? 'Catálogo' : 'Catalog', href: '/catalog' },
    { label: isEs ? 'Péptidos' : 'Peptides', href: '/pricing/peptides' },
    { label: isEs ? 'Guía de Reconstitución' : 'Reconstitution Guide' },
  ];

  const reconColumns = [
    { key: 'vial', header: isEs ? 'Vial' : 'Vial' },
    { key: 'water', header: isEs ? 'Diluyente (BAC)' : 'Diluent' },
    { key: 'conc', header: isEs ? 'Concentración' : 'Concentration' },
    { key: 'per10Units', header: isEs ? '10 Unidades (0,10 mL)' : '10 Units (0.10 mL)' },
    { key: 'per5Units', header: isEs ? '5 Unidades (0,05 mL)' : '5 Units (0.05 mL)' },
  ];

  const penColumns = [
    { key: 'pen', header: isEs ? 'Pluma Precargada' : 'Pen Formulation' },
    { key: 'strength', header: isEs ? 'Contenido Total' : 'Total Fill' },
    { key: 'perClick', header: isEs ? 'Dosis / Clic' : 'Dose / Click' },
    { key: 'commonDose', header: isEs ? 'Dosificación Habitual' : 'Standard Clinical Dial' },
  ];

  return (
    <div className="atlas-page-bg">
      <PublicUnifiedHeader purePublic={true} lang={isEs ? 'es' : 'en'} breadcrumb={breadcrumb} />
      <main className="atlas-page-shell" style={{ paddingTop: '20px', paddingBottom: '64px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <PageHeroCard
          brandLeft="ATLAS HEALTH"
          brandRight={isEs ? 'REFERENCIA CLÍNICA' : 'CLINICAL REFERENCE'}
          badges={[isEs ? 'cGMP · 28 Días Frío' : 'cGMP · 28-Day Cold Chain']}
          title={
            isEs
              ? 'Guía Clínica de Reconstitución, Jeringa U-100 y Plumas Click-Dial'
              : 'Clinical Peptide Reconstitution, U-100 Syringe & Click-Dial Dosing Guide'
          }
          subtitle={
            isEs
              ? 'Referencia estandarizada sobre reconstitución estéril con agua bacteriostática (BAC), cálculo en jeringas U-100 (100 UI = 1 mL) y plumas precargadas de 3 mL (300 clics).'
              : 'Standardized clinical reference covering sterile bacteriostatic water (BAC) reconstitution, U-100 syringe unit math (100 IU = 1 mL), and 3 mL multi-dose click-dial pens (300 clicks).'
          }
          actions={
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                href={isEs ? '/guides/peptide-reconstitution-dosing?lang=en' : '/guides/peptide-reconstitution-dosing?lang=es'}
                className="gcp-btn-secondary"
                style={{ padding: '7px 10px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
              >
                {isEs ? 'EN' : 'ES'}
              </Link>
              <Link href="/pricing/pens" className="gcp-btn-secondary" style={{ padding: '7px 12px', fontSize: '0.76rem', textDecoration: 'none' }}>
                {isEs ? 'Plumas 3 mL' : '3 mL Pens'}
              </Link>
              <Link href="/proto" className="gcp-btn-secondary" style={{ padding: '7px 12px', fontSize: '0.76rem', textDecoration: 'none' }}>
                {isEs ? 'Protocolos' : 'Protocols'}
              </Link>
              <Link href="/pricing/peptides" className="gcp-btn-primary" style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, textDecoration: 'none' }}>
                {isEs ? 'Ver Tarifa de Péptidos' : 'View Peptide Schedule'}
              </Link>
            </div>
          }
        />

        <section style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
            {isEs ? '1. Tabla de Reconstitución de Viales 10R (Jeringa U-100)' : '1. 10R Vial Reconstitution Reference (U-100 Insulin Syringe)'}
          </h2>
          <GuideReferenceTable
            columns={reconColumns}
            data={RECONSTITUTION_ROWS}
            accentKeys={{ vial: '#0f172a', per10Units: '#003666' }}
          />
        </section>

        <section style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
            {isEs ? '2. Equivalencia por Clics en Plumas Precargadas de 3 mL (100 clics = 1 mL)' : '2. Pre-Filled 3 mL Peptide Pen Click-Dial Reference (100 clicks = 1 mL)'}
          </h2>
          <GuideReferenceTable
            columns={penColumns}
            data={PEN_CLICK_ROWS}
            accentKeys={{ pen: '#0f172a', perClick: '#0d9488' }}
          />
        </section>

        <section style={{ background: '#fff', border: '1px solid #dadce0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
            {isEs ? '3. Estabilidad en Cadena de Frío y Buenas Prácticas (28 Días)' : '3. Cold-Chain & 28-Day In-Use Stability Standards'}
          </h2>
          <InlineAlert compact variant="warning" title={isEs ? 'Manejo Estéril:' : 'Sterile Handling:'}>
            {isEs
              ? 'Reconstituir dejando resbalar el agua bacteriostática suavemente por la pared del vidrio; girar con suavidad sin agitar para evitar desnaturalización.'
              : 'Direct bacteriostatic water gently down the glass wall; swirl softly without shaking to prevent peptide denaturation.'}
          </InlineAlert>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.65 }}>
            <li>{isEs ? 'Pureza analítica estándar: ≥99.0% HPLC (viales liofilizados 10R) y ≥99.2% HPLC (plumas precargadas).' : 'Analytical purity standard: ≥99.0% HPLC (10R lyophilized vials) and ≥99.2% HPLC (pre-filled pens).'}</li>
            <li>{isEs ? 'Conservar tras reconstitución entre 2 °C y 8 °C protegido de la luz durante un máximo de 28 días.' : 'Store reconstituted vials and active cartridges at 2°C–8°C protected from light for up to 28 days.'}</li>
          </ul>
        </section>
      </div>
      </main>
      <PublicUnifiedFooter lang={isEs ? 'es' : 'en'} />
    </div>
  );
}
