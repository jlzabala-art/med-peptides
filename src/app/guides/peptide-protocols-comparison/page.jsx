import React from 'react';
import Link from 'next/link';
import { buildBilingualMetadata, normalizeMetaLang } from '@/utils/metadataHelper';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const lang = normalizeMetaLang(resolved);

  return buildBilingualMetadata({
    lang,
    topic: 'compare-guide',
    path: '/guides/peptide-protocols-comparison',
    siteName: 'Atlas Health Services',
    en: {
      title: 'Clinical Peptide Comparisons: BPC-157 vs TB-500, Tirzepatide vs Retatrutide, MOTS-c vs SS-31',
      description:
        'Objective clinical comparison guide for physicians and longevity clinics: BPC-157 vs TB-500, Semaglutide vs Tirzepatide vs Retatrutide, MOTS-c vs SS-31, and 10R lyophilized vials vs 3 mL pre-filled peptide pens.',
    },
    es: {
      title: 'Comparativa Clínica de Péptidos: BPC-157 vs TB-500, Tirzepatida vs Retatrutida, MOTS-c vs SS-31',
      description:
        'Guía clínica comparativa para médicos y clínicas de longevidad: BPC-157 vs TB-500, Semaglutida vs Tirzepatida vs Retatrutida, MOTS-c vs SS-31, y viales liofilizados 10R vs plumas precargadas de 3 mL.',
    },
  });
}

const COMPARISONS = [
  {
    titleEn: '1. BPC-157 vs TB-500 (Tissue, Tendon & Gut Repair)',
    titleEs: '1. BPC-157 vs TB-500 (Reparación Tisular, Tendinosa y Digestiva)',
    rows: [
      {
        dimEn: 'Primary Mechanism',
        dimEs: 'Mecanismo Principal',
        aEn: 'BPC-157: Angiogenesis (VEGF), NO pathway modulation, focal tendon-to-bone & GI mucosal healing.',
        aEs: 'BPC-157: Angiogénesis (VEGF), modulación de óxido nítrico y reparación focal tendinosa y mucosa GI.',
        bEn: 'TB-500 (Thymosin β4): Systemic actin sequestration, cell migration & anti-fibrotic remodeling.',
        bEs: 'TB-500 (Timosina β4): Secuestro sistémico de actina, migración celular y remodelado antifibrótico.',
      },
      {
        dimEn: 'Clinical Synergy',
        dimEs: 'Sinergia Clínica',
        aEn: 'Often co-formulated (e.g. Wolverine / GLOW / KLOW stacks) for complementary local + systemic repair.',
        aEs: 'Frecuentemente combinados (p. ej. GLOW / KLOW) para unir reparación focal y sistémica.',
        bEn: 'Ideal alongside physical therapy and Bloodo™ hs-CRP / inflammatory monitoring.',
        bEs: 'Ideal junto a fisioterapia y seguimiento inflamatorio con Bloodo™.',
      },
    ],
  },
  {
    titleEn: '2. Semaglutide vs Tirzepatide vs Retatrutide (Metabolic & Incretin Pathways)',
    titleEs: '2. Semaglutida vs Tirzepatida vs Retatrutida (Vías Incretinas y Metabólicas)',
    rows: [
      {
        dimEn: 'Receptor Targets',
        dimEs: 'Receptores Diana',
        aEn: 'Semaglutide: Selective GLP-1 receptor agonist.',
        aEs: 'Semaglutida: Agonista selectivo del receptor GLP-1.',
        bEn: 'Tirzepatide: Dual GIP + GLP-1 agonist | Retatrutide: Triple GLP-1 + GIP + Glucagon agonist.',
        bEs: 'Tirzepatida: Agonista dual GIP + GLP-1 | Retatrutida: Agonista triple GLP-1 + GIP + Glucagón.',
      },
      {
        dimEn: 'Clinical Focus',
        dimEs: 'Enfoque Clínico',
        aEn: 'Gradual glycemic & appetite control with established cardiovascular profile.',
        aEs: 'Control glucémico y de saciedad gradual con perfil metabólico consolidado.',
        bEn: 'Enhanced insulin sensitivity, visceral adiposity reduction & hepatic lipid clearance.',
        bEs: 'Mayor sensibilidad a la insulina, reducción de grasa visceral y aclaramiento lipídico hepático.',
      },
    ],
  },
  {
    titleEn: '3. MOTS-c vs SS-31 (Elamipretide) (Mitochondrial Longevity)',
    titleEs: '3. MOTS-c vs SS-31 (Elamipretida) (Longevidad Mitocondrial)',
    rows: [
      {
        dimEn: 'Cellular Target',
        dimEs: 'Diana Celular',
        aEn: 'MOTS-c: Mitochondrial-derived peptide activating AMPK & skeletal muscle glucose uptake.',
        aEs: 'MOTS-c: Péptido derivado mitocondrial que activa AMPK y captación muscular de glucosa.',
        bEn: 'SS-31: Binds cardiolipin on the inner mitochondrial membrane to stabilize ETC complexes & ATP output.',
        bEs: 'SS-31: Se une a la cardiolipina en la membrana mitocondrial interna estabilizando la síntesis de ATP.',
      },
      {
        dimEn: 'Biomarker Pairing',
        dimEs: 'Biomarcadores Asociados',
        aEn: 'Track HbA1c, fasting insulin & Intracellular NAD+/NADH via Bloodo™ DBS.',
        aEs: 'Seguimiento con HbA1c, insulina basal y NAD+/NADH intracelular mediante Bloodo™.',
        bEn: 'Often sequenced after SS-31 membrane stabilization before NAD+ / MOTS-c optimization.',
        bEs: 'Suele secuenciarse SS-31 primero para estabilizar membrana antes de optimizar con MOTS-c / NAD+.',
      },
    ],
  },
  {
    titleEn: '4. 10R Lyophilized Vials vs 3 mL Pre-Filled Multi-Dose Pens',
    titleEs: '4. Viales Liofilizados 10R vs Plumas Precargadas Multidosis de 3 mL',
    rows: [
      {
        dimEn: 'Preparation & Dosing',
        dimEs: 'Preparación y Dosificación',
        aEn: '10R Vials: Require sterile BAC water reconstitution + U-100 insulin syringe; flexible custom titration.',
        aEs: 'Viales 10R: Requieren reconstitución con agua bacteriostática + jeringa U-100; titulación flexible.',
        bEn: '3 mL Pens: Ready-to-use cartridge with 100 clicks/mL dial; zero manual reconstitution error.',
        bEs: 'Plumas 3 mL: Cartucho listo para usar con dial de 100 clics/mL; cero error de reconstitución.',
      },
      {
        dimEn: 'Purity & Stability',
        dimEs: 'Pureza y Estabilidad',
        aEn: '≥99.0% HPLC cGMP lyophilized powder; stable 28 days at 2°C–8°C once reconstituted.',
        aEs: 'Polvo liofilizado cGMP ≥99,0% HPLC; estable 28 días a 2–8 °C tras reconstituir.',
        bEn: '≥99.2% HPLC sterile cartridge solution; cold-chain dispatched.',
        bEs: 'Solución estéril ≥99,2% HPLC en cartucho; envío en cadena de frío.',
      },
    ],
  },
];

export default async function PeptideProtocolsComparisonPage({ searchParams }) {
  const resolved = await searchParams;
  const isEs = normalizeMetaLang(resolved) === 'es';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        name: isEs
          ? 'Comparativa Clínica de Péptidos: BPC-157 vs TB-500, Tirzepatida vs Retatrutida, MOTS-c vs SS-31'
          : 'Clinical Peptide Comparisons: BPC-157 vs TB-500, Tirzepatide vs Retatrutide, MOTS-c vs SS-31',
        url: 'https://www.atlashealth-services.com/guides/peptide-protocols-comparison',
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
            name: isEs ? '¿Cuál es la diferencia entre BPC-157 y TB-500?' : 'What is the difference between BPC-157 and TB-500?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs
                ? 'BPC-157 actúa principalmente de forma focal favoreciendo la angiogénesis (VEGF) y la reparación tendinosa y mucosa GI, mientras que TB-500 actúa de forma sistémica promoviendo la migración celular y reduciendo la fibrosis.'
                : 'BPC-157 works primarily via focal angiogenesis (VEGF) and tendon/GI mucosal repair, whereas TB-500 acts systemically via actin sequestration to drive cell migration and anti-fibrotic remodeling.',
            },
          },
          {
            '@type': 'Question',
            name: isEs ? '¿Qué diferencia a Tirzepatida de Retatrutida?' : 'How does Tirzepatide differ from Retatrutide?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs
                ? 'Tirzepatida es un agonista dual GIP + GLP-1, mientras que Retatrutida es un agonista triple que añade activación del receptor de Glucagón para incrementar el gasto energético y el aclaramiento lipídico hepático.'
                : 'Tirzepatide is a dual GIP + GLP-1 receptor agonist, while Retatrutide is a triple GLP-1 + GIP + Glucagon agonist that adds glucagon-mediated energy expenditure and hepatic lipid clearance.',
            },
          },
          {
            '@type': 'Question',
            name: isEs ? '¿Cuándo elegir viales liofilizados 10R frente a plumas precargadas de 3 mL?' : 'When should clinics choose 10R lyophilized vials vs 3 mL pre-filled peptide pens?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEs
                ? 'Los viales 10R ofrecen máxima flexibilidad de titulación y coste por mg en clínica; las plumas precargadas de 3 mL (100 clics/mL) eliminan pasos de reconstitución y mejoran la adherencia domiciliaria del paciente.'
                : '10R lyophilized vials offer maximum titration flexibility and cost efficiency in-clinic; 3 mL pre-filled click-dial pens (100 clicks/mL) eliminate reconstitution errors and maximize patient home adherence.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="atlas-page-bg">
      <PublicUnifiedHeader />
      <main className="atlas-page-shell" style={{ paddingTop: '24px', paddingBottom: '64px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <section style={{ background: '#003666', color: '#fff', borderRadius: '14px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#7dd3fc' }}>
              Atlas Health Services · {isEs ? 'Comparativa Clínica' : 'Clinical Comparison Guide'}
            </div>
            <div style={{ display: 'inline-flex', gap: '6px' }}>
              <Link
                href="/guides/peptide-protocols-comparison?lang=en"
                style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', background: !isEs ? '#fff' : 'rgba(255,255,255,0.14)', color: !isEs ? '#003666' : '#fff' }}
              >
                EN
              </Link>
              <Link
                href="/guides/peptide-protocols-comparison?lang=es"
                style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', background: isEs ? '#fff' : 'rgba(255,255,255,0.14)', color: isEs ? '#003666' : '#fff' }}
              >
                ES
              </Link>
            </div>
          </div>
          <h1 style={{ margin: '8px 0', fontSize: '1.5rem', fontWeight: 800 }}>
            {isEs
              ? 'Comparativa Clínica de Péptidos y Formatos (Viales vs Plumas)'
              : 'Clinical Peptide & Format Comparisons (Vials vs Multi-Dose Pens)'}
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#dbeafe', lineHeight: 1.5 }}>
            {isEs
              ? 'Resumen técnico objetivo sobre mecanismos, sinergias clínicas y selección de formato para medicina de longevidad y endocrinología.'
              : 'Objective clinical summary covering mechanisms of action, pathway synergies, and presentation selection for longevity and endocrine practice.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '14px' }}>
            <Link href="/tools/peptide-calculator" style={{ background: '#fff', color: '#003666', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 750, textDecoration: 'none' }}>
              {isEs ? 'Calculadora de Reconstitución' : 'Open Dosing Calculator'}
            </Link>
            <Link href="/pricing/peptides" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.28)' }}>
              {isEs ? 'Tarifa Péptidos 10R' : '10R Peptides Schedule'}
            </Link>
            <Link href="/pricing/pens" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.28)' }}>
              {isEs ? 'Plumas Precargadas 3 mL' : '3 mL Peptide Pens'}
            </Link>
          </div>
        </section>

        {COMPARISONS.map((block, idx) => (
          <section key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '1.08rem', fontWeight: 800, color: '#0f172a' }}>
              {isEs ? block.titleEs : block.titleEn}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {block.rows.map((r, rIdx) => (
                <div key={rIdx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {isEs ? r.dimEs : r.dimEn}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5, marginBottom: '4px' }}>
                    {isEs ? r.aEs : r.aEn}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    {isEs ? r.bEs : r.bEn}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      </main>
      <PublicUnifiedFooter lang={isEs ? 'es' : 'en'} />
    </div>
  );
}
