"use client";

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  Clock,
  Droplet,
  ShieldCheck,
  Sun,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  FlaskConical,
  ExternalLink
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import './BloodoSuiteNav.css';

/**
 * 6 Core Bloodo™ Diagnostic Biomarker Panels
 */
export const BLOODO_DIAGNOSTIC_TESTS = [
  {
    id: 'bloodo-nad-level-test',
    slug: 'bloodo-nad-level-test',
    nameEn: 'Bloodo™ NAD+ Level Test',
    nameEs: 'Bloodo™ Test de Nivel NAD+',
    shortName: 'NAD+ Cellular',
    biomarkerEn: 'Total Intracellular NAD (NAD⁺ & NADH)',
    biomarkerEs: 'NAD Celular Total (NAD⁺ y NADH)',
    categoryEn: 'Cellular Bioenergetics & Longevity',
    categoryEs: 'Bioenergética Celular y Longevidad',
    focusEn: 'Mitochondrial Redox & Sirtuin Tone',
    focusEs: 'Balance Redox Mitocondrial y Sirtuinas',
    technology: 'Capillary DBS UHPLC Enzymatic Cycling',
    tag: 'Bioenergética',
    accentColor: '#0284c7', // Sky Blue
    icon: Activity,
    subtitleEn: 'UHPLC • NAD⁺ & NADH',
    subtitleEs: 'UHPLC • NAD⁺ y NADH',
    synergyWithOthersEn: 'Establishes baseline mitochondrial redox capacity to guide peptide dosing.',
    synergyWithOthersEs: 'Determina la capacidad redox mitocondrial basal para calibrar dosis de péptidos.'
  },
  {
    id: 'testosterone-test',
    slug: 'testosterone-test',
    nameEn: 'Bloodo™ Testosterone+ Test',
    nameEs: 'Bloodo™ Testosterona+ Test',
    shortName: 'Testosterona Total & Libre',
    biomarkerEn: 'Total & Free Testosterone, SHBG, FAI',
    biomarkerEs: 'Testosterona Total, Libre, SHBG e Índice FAI',
    categoryEn: 'Endocrine Vitality & HPTA Axis',
    categoryEs: 'Vitalidad Endocrina y Eje HPTA',
    focusEn: 'Leydig Steroidogenesis & Androgenic Tone',
    focusEs: 'Esteroidogénesis de Leydig y Tono Androgénico',
    technology: 'Capillary DBS LC-MS/MS Gold Standard',
    tag: 'Eje HPTA',
    accentColor: '#ea580c', // Orange Amber
    icon: Zap,
    subtitleEn: 'LC-MS/MS • SHBG & FAI',
    subtitleEs: 'LC-MS/MS • SHBG y FAI',
    synergyWithOthersEn: 'Assesses endocrine recovery without suppression during secretagogue protocols.',
    synergyWithOthersEs: 'Evalúa la reactivación endógena sin atrofia en protocolos con secretagogos.'
  },
  {
    id: 'cortisol-test',
    slug: 'cortisol-test',
    nameEn: 'Bloodo™ Cortisol Test',
    nameEs: 'Bloodo™ Cortisol Ritmo Test',
    shortName: 'Cortisol Ritmo Diurno',
    biomarkerEn: 'Free Bioactive Cortisol (CAR & PM)',
    biomarkerEs: 'Cortisol Libre Bioactivo (Ritmo CAR y Tarde)',
    categoryEn: 'HPA Axis & Circadian Adrenal Health',
    categoryEs: 'Eje HPA y Salud Suprarrenal Circadiana',
    focusEn: 'Allostatic Load & Neuro-Endocrine Stress',
    focusEs: 'Carga Alostática y Estrés Neuroendocrino',
    technology: 'Capillary DBS LC-MS/MS / Solid-Phase ELISA',
    tag: 'Eje HPA',
    accentColor: '#8b5cf6', // Violet Purple
    icon: Clock,
    subtitleEn: 'CAR Rhythm • AM/PM Diurnal',
    subtitleEs: 'Ritmo CAR • Diurno AM/PM',
    synergyWithOthersEn: 'Differentiates primary mitochondrial fatigue from secondary adrenal exhaustion.',
    synergyWithOthersEs: 'Distingue la fatiga mitocondrial pura del agotamiento suprarrenal secundario.'
  },
  {
    id: 'hemoglobin-a1c-hba1c-test',
    slug: 'hemoglobin-a1c-hba1c-test',
    nameEn: 'Bloodo™ HbA1c Glycation Test',
    nameEs: 'Bloodo™ Test HbA1c Glicación',
    shortName: 'HbA1c & Glucosa Media',
    biomarkerEn: 'Glycated Hemoglobin & Mean Glucose',
    biomarkerEs: 'Hemoglobina Glicada y Glucosa Media 90 Días',
    categoryEn: 'Metabolic Health & Glycemic Control',
    categoryEs: 'Salud Metabólica y Control Glicémico',
    focusEn: 'Endothelial Glycation & Insulin Sensitivity',
    focusEs: 'Glicación Endotelial y Sensibilidad a la Insulina',
    technology: 'Capillary DBS Affinity Micro-Chromatography',
    tag: 'Metabolismo',
    accentColor: '#e11d48', // Rose Red
    icon: Droplet,
    subtitleEn: 'Affinity • 90-Day Glycation',
    subtitleEs: 'Afinidad • Glicación 90 Días',
    synergyWithOthersEn: 'Direct biomarker verification for GLP-1/GIP and MOTS-c metabolic protocols.',
    synergyWithOthersEs: 'Verificación directa de biomarcadores para protocolos con GLP-1/GIP y MOTS-c.'
  },
  {
    id: 'omega-ratio-test',
    slug: 'omega-ratio-test',
    nameEn: 'Bloodo™ Omega-3/6 Ratio Test',
    nameEs: 'Bloodo™ Ratio Omega-3/6 Test',
    shortName: 'Ratio Omega-3 / Omega-6',
    biomarkerEn: 'Omega-3 Index, AA/EPA Ratio, Trans Fats',
    biomarkerEs: 'Índice Omega-3, Ratio AA/EPA y Ácidos Grasos Trans',
    categoryEn: 'Cell Membrane & Systemic Inflammation',
    categoryEs: 'Membrana Celular e Inflamación Sistémica',
    focusEn: 'Lipid Bilayer Fluidity & Resolvin Substrates',
    focusEs: 'Fluidez de Membrana Celular y Sustratos de Resolvinas',
    technology: 'Capillary DBS Gas Chromatography (GC-MS)',
    tag: 'Inflamación',
    accentColor: '#0d9488', // Emerald Teal
    icon: ShieldCheck,
    subtitleEn: 'GC-MS • Index & AA/EPA',
    subtitleEs: 'GC-MS • Índice y AA/EPA',
    synergyWithOthersEn: 'Monitors microvascular inflammation and cellular membrane repair alongside BPC/TB.',
    synergyWithOthersEs: 'Monitoriza la inflamación microvascular y reparación celular junto a BPC-157 y TB-500.'
  },
  {
    id: 'vitamin-d-test',
    slug: 'vitamin-d-test',
    nameEn: 'Bloodo™ Vitamin D3 (25-OH) Test',
    nameEs: 'Bloodo™ Vitamina D3 (25-OH) Test',
    shortName: 'Vitamina D3 (25-OH)',
    biomarkerEn: '25-Hydroxyvitamin D3 & D2 (Total)',
    biomarkerEs: '25-Hidroxivitamina D3 y D2 Total',
    categoryEn: 'Innate Immunity & VDR Genomic Axis',
    categoryEs: 'Inmunidad Innata y Eje Genómico VDR',
    focusEn: 'Cathelicidin Induction & T-Cell Maturation',
    focusEs: 'Inducción de Catelicidina (LL-37) y Linfocitos T',
    technology: 'Capillary DBS LC-MS/MS Isotope Dilution',
    tag: 'Inmunidad',
    accentColor: '#d97706', // Gold Amber
    icon: Sun,
    subtitleEn: 'Isotope Dilution • 25(OH)D',
    subtitleEs: 'Dilución Isotópica • 25(OH)D',
    synergyWithOthersEn: 'Essential co-factor for thymic peptide efficacy (Thymosin Alpha-1, LL-37).',
    synergyWithOthersEs: 'Cofactor indispensable para la eficacia de péptidos tímicos (Tα1 y LL-37).'
  }
];

/**
 * Match a raw slug to canonical Bloodo test
 */
export function getBloodoTestBySlug(slug = '') {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  if (s.includes('nad')) return BLOODO_DIAGNOSTIC_TESTS[0];
  if (s.includes('testosterone') || s.includes('testosterona')) return BLOODO_DIAGNOSTIC_TESTS[1];
  if (s.includes('cortisol')) return BLOODO_DIAGNOSTIC_TESTS[2];
  if (s.includes('hba1c') || s.includes('hemoglobin') || s.includes('hemoglobina')) return BLOODO_DIAGNOSTIC_TESTS[3];
  if (s.includes('omega')) return BLOODO_DIAGNOSTIC_TESTS[4];
  if (s.includes('vitamin-d') || s.includes('vitamina-d')) return BLOODO_DIAGNOSTIC_TESTS[5];
  return null;
}

/**
 * Check if a product represents a Bloodo diagnostic kit
 */
export function isBloodoProduct(product = {}, slug = '') {
  const target = `${product?.id || ''} ${product?.slug || ''} ${product?.supplierId || ''} ${product?.canonicalKey || ''} ${slug || ''}`.toLowerCase();
  return target.includes('bloodo') || 
         target.includes('supplier-bloodo') || 
         target.includes('nad-level-test') || 
         target.includes('testosterone-test') || 
         target.includes('cortisol-test') || 
         target.includes('hemoglobin-a1c') || 
         target.includes('omega-ratio') || 
         target.includes('vitamin-d-test');
}

/**
 * BloodoSuiteNav Component
 * 
 * Supports 3 layout variants:
 * - 'drawer': Compact vertical list for the TOC drawer & desktop sidebar
 * - 'chips': Horizontal pill carousel for hero / sub-headers
 * - 'section': Full comprehensive clinical comparison grid for on-page #bloodo-suite
 */
export default function BloodoSuiteNav({
  currentSlug = '',
  lang = 'en',
  variant = 'drawer', // 'drawer' | 'chips' | 'section'
  onSelect = null
}) {
  const isEs = lang === 'es';
  const currentTest = getBloodoTestBySlug(currentSlug);
  const activeSlug = currentTest?.slug || currentSlug;

  const handleNavClick = () => {
    triggerHaptic('light');
    if (onSelect) onSelect();
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIANT 1: CHIPS (Full-Width Responsive Grid - No Horizontal Scroll)
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'chips') {
    return (
      <div className="bloodo-suite-chips" role="navigation" aria-label="Bloodo Diagnostic Suite">
        <div className="bloodo-suite-chips__header">
          <div className="bloodo-suite-chips__title-group">
            <Sparkles size={13} className="bloodo-suite-chips__icon" />
            <span className="bloodo-suite-chips__label">
              {isEs ? 'Suite Diagnóstica Bloodo™ (6 Paneles Clínicos):' : 'Bloodo™ Diagnostic Suite (6 Clinical Panels):'}
            </span>
          </div>
          <span className="bloodo-suite-chips__subtag">
            {isEs ? 'Capilar DBS LC-MS/MS' : 'Capillary DBS LC-MS/MS'}
          </span>
        </div>
        <div className="bloodo-suite-chips__grid">
          {BLOODO_DIAGNOSTIC_TESTS.map((test) => {
            const isActive = test.slug === activeSlug;
            const Icon = test.icon;
            const testLabel = test.shortName || (isEs ? test.nameEs : test.nameEn).replace(/^Bloodo™\s*/i, '');
            const subText = isEs ? test.subtitleEs : test.subtitleEn;
            
            if (isActive) {
              return (
                <div
                  key={test.id}
                  className="bloodo-suite-chip bloodo-suite-chip--active"
                  style={{ '--chip-accent': test.accentColor }}
                  title={`${test.nameEn} (Active Test)`}
                >
                  <Icon size={14} className="bloodo-suite-chip__icon" />
                  <div className="bloodo-suite-chip__body">
                    <span className="bloodo-suite-chip__text">{testLabel}</span>
                    {subText && <span className="bloodo-suite-chip__sub">{subText}</span>}
                  </div>
                  <span className="bloodo-suite-chip__badge">{isEs ? 'Activo' : 'Active'}</span>
                </div>
              );
            }

            return (
              <Link
                key={test.id}
                href={`/p/${test.slug}`}
                onClick={handleNavClick}
                className="bloodo-suite-chip"
                style={{ '--chip-accent': test.accentColor }}
                title={`${isEs ? 'Ir al panel de' : 'View'} ${isEs ? test.nameEs : test.nameEn}`}
              >
                <Icon size={14} className="bloodo-suite-chip__icon" />
                <div className="bloodo-suite-chip__body">
                  <span className="bloodo-suite-chip__text">{testLabel}</span>
                  {subText && <span className="bloodo-suite-chip__sub">{subText}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIANT 2: DRAWER / SIDEBAR (Table of Contents Integration)
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === 'drawer') {
    return (
      <div className="bloodo-suite-drawer-widget">
        <div className="bloodo-suite-drawer-widget__header">
          <div className="bloodo-suite-drawer-widget__title-group">
            <FlaskConical size={14} className="bloodo-suite-drawer-widget__icon" />
            <span className="bloodo-suite-drawer-widget__title">
              {isEs ? 'SUITE DIAGNÓSTICA BLOODÔ (6)' : 'BLOODÔ DIAGNOSTIC SUITE (6)'}
            </span>
          </div>
          <span className="bloodo-suite-drawer-widget__badge">DBS LC-MS</span>
        </div>

        <p className="bloodo-suite-drawer-widget__subtitle">
          {isEs
            ? 'Navega directamente a otros paneles capilares validados:'
            : 'Direct access to validated capillary biomarker panels:'}
        </p>

        <div className="bloodo-suite-drawer-widget__list">
          {BLOODO_DIAGNOSTIC_TESTS.map((test) => {
            const isActive = test.slug === activeSlug;
            const Icon = test.icon;

            if (isActive) {
              return (
                <div
                  key={test.id}
                  className="bloodo-suite-drawer-item bloodo-suite-drawer-item--active"
                  style={{ '--item-accent': test.accentColor }}
                >
                  <div className="bloodo-suite-drawer-item__icon-box">
                    <Icon size={14} />
                  </div>
                  <div className="bloodo-suite-drawer-item__content">
                    <div className="bloodo-suite-drawer-item__title-row">
                      <span className="bloodo-suite-drawer-item__title">
                        {test.shortName || (isEs ? test.nameEs : test.nameEn).replace(/^Bloodo™\s*/i, '')}
                      </span>
                    </div>
                    <span className="bloodo-suite-drawer-item__biomarker">
                      {isEs ? test.categoryEs : test.categoryEn}
                    </span>
                  </div>
                  <span className="bloodo-suite-drawer-item__current-badge">
                    {isEs ? 'Actual' : 'Current'}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={test.id}
                href={`/p/${test.slug}`}
                onClick={handleNavClick}
                className="bloodo-suite-drawer-item"
                style={{ '--item-accent': test.accentColor }}
                title={`${isEs ? 'Ver test' : 'View test'} ${test.nameEn}`}
              >
                <div className="bloodo-suite-drawer-item__icon-box">
                  <Icon size={14} />
                </div>
                <div className="bloodo-suite-drawer-item__content">
                  <div className="bloodo-suite-drawer-item__title-row">
                    <span className="bloodo-suite-drawer-item__title">
                      {test.shortName || (isEs ? test.nameEs : test.nameEn).replace(/^Bloodo™\s*/i, '')}
                    </span>
                  </div>
                  <span className="bloodo-suite-drawer-item__biomarker">
                    {isEs ? test.categoryEs : test.categoryEn}
                  </span>
                </div>
                <ChevronRight size={14} className="bloodo-suite-drawer-item__arrow" />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VARIANT 3: SECTION (On-Page Comprehensive Comparison Grid)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <section id="bloodo-suite" className="bloodo-suite-section">
      <div className="bloodo-suite-section__header">
        <div className="bloodo-suite-section__pre-title">
          <Sparkles size={15} />
          <span>{isEs ? 'ECOSISTEMA DE BIOMARCADORES DBS • BLOODÔ BIOINFORMATICS' : 'DBS BIOMARKER ECOSYSTEM • BLOODÔ BIOINFORMATICS'}</span>
        </div>
        <h2 className="bloodo-suite-section__title">
          {isEs ? 'Otros Paneles Diagnósticos (Suite Bloodo™)' : 'Other Diagnostic Panels (Bloodo™ Suite)'}
        </h2>
        <p className="bloodo-suite-section__subtitle">
          {isEs
            ? 'Explore otros ensayos cuantitativos validados en micro-volumen capilar de sangre seca (DBS), analizados por LC-MS/MS y UHPLC en instalaciones certificadas CE-IVDR / ISO 15189.'
            : 'Explore additional quantitative assays validated in capillary dried blood spot (DBS) micro-volumes, analyzed via LC-MS/MS and UHPLC in certified CE-IVDR / ISO 15189 facilities.'}
        </p>
      </div>

      <div className="bloodo-suite-grid">
        {BLOODO_DIAGNOSTIC_TESTS.map((test) => {
          const isActive = test.slug === activeSlug;
          const Icon = test.icon;

          return (
            <article
              key={test.id}
              className={`bloodo-suite-card ${isActive ? 'bloodo-suite-card--active' : ''}`}
              style={{ '--card-accent': test.accentColor }}
            >
              <div className="bloodo-suite-card__top">
                <div className="bloodo-suite-card__icon-box">
                  <Icon size={18} />
                </div>
                <div className="bloodo-suite-card__tags">
                  <span className="bloodo-suite-card__tag-category">
                    {test.tag}
                  </span>
                  <span className="bloodo-suite-card__tag-tech">
                    {test.technology.split(' ')[1] || 'DBS'}
                  </span>
                </div>
              </div>

              <h3 className="bloodo-suite-card__name">
                {isEs ? test.nameEs : test.nameEn}
              </h3>

              <div className="bloodo-suite-card__biomarker-box">
                <span className="bloodo-suite-card__biomarker-label">
                  {isEs ? 'Parámetros cuantificados:' : 'Quantified analytes:'}
                </span>
                <strong className="bloodo-suite-card__biomarker-val">
                  {isEs ? test.biomarkerEs : test.biomarkerEn}
                </strong>
              </div>

              <p className="bloodo-suite-card__desc">
                {isEs ? test.focusEs : test.focusEn}
              </p>

              <div className="bloodo-suite-card__synergy">
                <strong className="bloodo-suite-card__synergy-title">
                  {isEs ? 'Sinergia Clínica:' : 'Clinical Synergy:'}
                </strong>
                <p className="bloodo-suite-card__synergy-text">
                  {isEs ? test.synergyWithOthersEs : test.synergyWithOthersEn}
                </p>
              </div>

              <div className="bloodo-suite-card__footer">
                {isActive ? (
                  <div className="bloodo-suite-card__active-state">
                    <CheckCircle2 size={15} />
                    <span>{isEs ? 'Monografía Actual en Pantalla' : 'Current Active Monograph'}</span>
                  </div>
                ) : (
                  <Link
                    href={`/p/${test.slug}`}
                    onClick={handleNavClick}
                    className="bloodo-suite-card__link-btn"
                  >
                    <span>{isEs ? 'Explorar Monografía Técnica' : 'Explore Technical Monograph'}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
