"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DataTable from '@/components/ui/DataTable';
import UniversalQrCard from '@/components/ui/UniversalQrCard';
import {
  ShieldCheck,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
  Download,
  Share2,
  Building2,
  ExternalLink,
  AlertTriangle,
  Info,
  Droplets,
  Activity,
  Thermometer,
  Lock,
  Check,
  ChevronRight,
  ChevronLeft,
  HeartPulse,
  Syringe,
  Brain,
  TrendingUp,
  Zap,
  Flame,
  Scale,
  Microscope,
  Dna,
  Sparkles,
  FlaskConical,
  X,
  Layers,
  Calendar,
  List,
  QrCode
} from '@/lib/icons';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import CopyableId from '@/components/ui/CopyableId';
import { getPharmapolisPelletBySlug } from '@/data/pharmapolisPelletsRegistry';
import './HormonePelletDetail.css';

const TABS = [
  {
    id: 'overview',
    number: '1',
    titleEn: 'Clinical Profile & Indications',
    titleEs: 'Perfil Clínico & Indicaciones',
    shortEn: '1. Profile',
    shortEs: '1. Perfil',
    icon: Sparkles
  },
  {
    id: 'pharmacokinetics',
    number: '2',
    titleEn: 'Pharmacokinetics & Kinetics',
    titleEs: 'Farmacocinética & Cinética',
    shortEn: '2. Kinetics',
    shortEs: '2. Cinética',
    icon: TrendingUp
  },
  {
    id: 'procedure',
    number: '3',
    titleEn: 'Trocar Implantation Technique',
    titleEs: 'Técnica de Implante con Trócar',
    shortEn: '3. Procedure',
    shortEs: '3. Implante',
    icon: Syringe
  },
  {
    id: 'monitoring',
    number: '4',
    titleEn: 'Safety & Telemetry Monitoring',
    titleEs: 'Seguridad & Monitorización',
    shortEn: '4. Safety',
    shortEs: '4. Seguridad',
    icon: HeartPulse
  },
  {
    id: 'specifications',
    number: '5',
    titleEn: 'Galenic Specs & EU GMP Quality',
    titleEs: 'Galénica & Calidad EU GMP',
    shortEn: '5. Galenics',
    shortEs: '5. Galénica',
    icon: Microscope
  },
  {
    id: 'evidence',
    number: '6',
    titleEn: 'Clinical Evidence & Citations',
    titleEs: 'Evidencia Científica & Ensayos',
    shortEn: '6. Evidence',
    shortEs: '6. Evidencia',
    icon: FileText
  },
  {
    id: 'b2b',
    number: '7',
    titleEn: 'B2B Tariffs & Allocation',
    titleEs: 'Tarifas B2B & Adquisición',
    shortEn: '7. B2B Pricing',
    shortEs: '7. Tarifas B2B',
    icon: Building2
  }
];

export default function HormonePelletDetail({
  product = {},
  slug = 'estradiol-12-5mg-pellet',
  _baseUrl = 'https://www.atlashealth-services.com'
}) {
  const [lang, setLang] = useState('en'); // Default to English as requested
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'pharmacokinetics' | 'procedure' | 'monitoring' | 'specifications' | 'evidence' | 'b2b'
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);

  const isEs = lang === 'es';

  // Listen to bottom dock QR trigger
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleGlobalQr = () => setIsShareDrawerOpen(true);
    window.addEventListener('open-global-qr-modal', handleGlobalQr);
    return () => window.removeEventListener('open-global-qr-modal', handleGlobalQr);
  }, []);

  const canonicalUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/p/${slug}`;
    }
    return `${_baseUrl}/p/${slug}`;
  }, [slug, _baseUrl]);

  // Merge authoritative registry data with Firestore/page props
  const p = useMemo(() => {
    const fromRegistry = getPharmapolisPelletBySlug(slug) || getPharmapolisPelletBySlug(product?.id) || getPharmapolisPelletBySlug(product?.slug) || {};
    return {
      ...fromRegistry,
      ...product,
      composition: { ...(fromRegistry?.composition || {}), ...(product?.composition || {}) },
      galenicSpecs: { ...(fromRegistry?.galenicSpecs || {}), ...(product?.galenicSpecs || {}) },
      clinicalDossier: { ...(fromRegistry?.clinicalDossier || {}), ...(product?.clinicalDossier || {}) },
      pricing: { ...(fromRegistry?.pricing || {}), ...(product?.pricing || {}) }
    };
  }, [slug, product]);

  const dossier = p.clinicalDossier || {};
  const galenic = p.galenicSpecs || {};
  const composition = p.composition || {};
  const pricing = p.pricing || {};
  const isEstrogen = p.hormoneType === 'estrogen' || (p.name || '').toLowerCase().includes('estradiol');
  const isTestosterone = p.hormoneType === 'androgen' || (p.name || '').toLowerCase().includes('testosterone');

  const currentTabIndex = useMemo(() => {
    const idx = TABS.findIndex((t) => t.id === activeTab);
    return idx >= 0 ? idx : 0;
  }, [activeTab]);

  const currentTabObj = TABS[currentTabIndex];

  const handlePrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id);
      document.getElementById('monograph-content-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
      document.getElementById('monograph-content-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'hormone_pellet',
        name: p.name || 'Hormone Pellet',
        brand: 'Pharmapolis Compounding Pharmacy',
      },
      bottomBar: {
        summaryTitle: p.commercialName || p.name || 'Bioidentical Hormone Pellet',
        summarySubtitle: `${p.strength || ''} · Subcutaneous Trocar Implant · EU GMP Bulgaria`,
        badge: 'Pharmapolis EU GMP',
        atlasAiLabel: isEs ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        showSections: true,
        sectionsLabel: isEs ? 'Secciones' : 'Sections',
        onOpenSections: () => {
          document.getElementById('monograph-sidebar-nav')?.scrollIntoView({ behavior: 'smooth' });
        },
        showQr: true,
        qrLabel: isEs ? 'Código QR' : 'QR Code',
        onOpenQr: () => setIsShareDrawerOpen(true),
        primaryAction: {
          label: isEs ? 'Solicitar Asignación Clínica' : 'Request Allocation',
          onClick: () => setIsInquiryDrawerOpen(true),
        },
      },
    },
    [p.name, p.commercialName, p.strength, isEs]
  );

  return (
    <div className="pellet-page-container">
      {/* ── UNIFIED ATLAS PUBLIC HEADER ── */}
      <PublicUnifiedHeader currentApp="services" />

      {/* ── INSTITUTIONAL REGULATORY & TRUST BAR (STICKY) ── */}
      <div className="pellet-institutional-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="pellet-badge-pill pellet-badge-gmp">
            <ShieldCheck size={13} />
            <span>Pharmapolis EU GMP · Plovdiv (Bulgaria)</span>
          </span>

          <span className="pellet-badge-pill pellet-badge-category">
            <Layers size={13} />
            <span>{isEs ? 'Cat. C · Pellets Hormonales Subcutáneos' : 'Cat. C · Subcutaneous Hormone Pellets'}</span>
          </span>

          <span className="pellet-badge-pill pellet-badge-rx">
            <Lock size={12} />
            <span>{isEs ? 'Uso Médico Exclusivo (POM)' : 'Prescription Only Medicine (POM)'}</span>
          </span>

          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            SKU: <CopyableId value={p.sku || 'SKU-PHARM-HORM'} displayValue={p.sku || 'SKU-PHARM-HORM'} />
          </span>
        </div>

        {/* Right Actions: Language Switcher & Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: lang === 'en' ? '#003666' : '#ffffff',
                color: lang === 'en' ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang('es')}
              style={{
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: lang === 'es' ? '#003666' : '#ffffff',
                color: lang === 'es' ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              ES
            </button>
          </div>

          <button
            onClick={() => setIsShareDrawerOpen(true)}
            className="gcp-btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} />
            <span>{isEs ? 'Compartir' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="pellet-content-grid">
        {/* Left Column: Monograph Body */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Hero Card */}
          <div className="pellet-hero-card">
            <div className="pellet-hero-category">
              <Sparkles size={14} />
              <span>{isEs ? 'Terapia de Reemplazo Hormonal Bioidéntica (BHRT) · Pellet Subcutáneo' : 'Bioidentical Hormone Replacement Therapy (BHRT) · Subcutaneous Pellet'}</span>
            </div>

            <h1 className="pellet-hero-title">
              {p.commercialName || p.canonicalName || p.name}
            </h1>

            <p className="pellet-hero-subtitle">
              {p.shortDescription || p.description}
            </p>

            {/* Strength Switcher & Cross-Hormone Synergy Bar */}
            <div className="pellet-strength-nav">
              <span className="pellet-strength-label">
                {isEs ? 'Dosis Disponible:' : 'Available Strength:'}
              </span>

              {isEstrogen && (
                <>
                  <Link
                    href="/p/estradiol-12-5mg-pellet"
                    className={`pellet-strength-btn ${p.strength === '12.5 mg' ? 'active' : ''}`}
                  >
                    <span>12.5 mg</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({isEs ? 'Iniciación / Conservador' : 'Conservative Initiation'})</span>
                  </Link>
                  <Link
                    href="/p/estradiol-25mg-pellet"
                    className={`pellet-strength-btn ${p.strength === '25 mg' ? 'active' : ''}`}
                  >
                    <span>25 mg</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({isEs ? 'Estándar Clínico' : 'Clinical Standard'})</span>
                  </Link>

                  <Link href="/p/testosterone-50mg-pellet" className="pellet-synergy-link">
                    <span>{isEs ? 'Ver Testosterona Sinergia' : 'View Synergistic Testosterone'}</span>
                    <ArrowRight size={13} />
                  </Link>
                </>
              )}

              {isTestosterone && (
                <>
                  <Link
                    href="/p/testosterone-50mg-pellet"
                    className={`pellet-strength-btn ${p.strength === '50 mg' ? 'active' : ''}`}
                  >
                    <span>50 mg</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({isEs ? 'Mujer / Micro-Titulación' : 'Female / Micro-Titration'})</span>
                  </Link>
                  <Link
                    href="/p/testosterone-100mg-pellet"
                    className={`pellet-strength-btn ${p.strength === '100 mg' ? 'active' : ''}`}
                  >
                    <span>100 mg</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>({isEs ? 'Base TRT Hombre / Alta Demanda' : 'Male TRT / High Demand'})</span>
                  </Link>

                  <Link href="/p/estradiol-12-5mg-pellet" className="pellet-synergy-link">
                    <span>{isEs ? 'Ver Estradiol Sinergia' : 'View Synergistic Estradiol'}</span>
                    <ArrowRight size={13} />
                  </Link>
                </>
              )}
            </div>

            {/* Key Metric Grid */}
            <div className="pellet-metric-grid">
              <div className="pellet-metric-box">
                <div className="pellet-metric-label">{isEs ? 'Duración de Liberación' : 'Therapeutic Duration'}</div>
                <div className="pellet-metric-value">{galenic.averageDurationMonths || (isEs ? '3.5 - 5 Meses' : '3.5 - 5 Months')}</div>
                <div className="pellet-metric-sub">{isEs ? 'Liberación continua orden cero' : 'Zero-order steady release'}</div>
              </div>

              <div className="pellet-metric-box">
                <div className="pellet-metric-label">{isEs ? 'Nivel Sérico Objetivo' : 'Target Serum Window'}</div>
                <div className="pellet-metric-value">{galenic.targetSerumLevel?.split('(')[0]?.trim() || (isEs ? 'Fisiológico' : 'Physiologic')}</div>
                <div className="pellet-metric-sub">{isEs ? 'Meseta terapéutica sin picos' : 'Steady therapeutic plateau'}</div>
              </div>

              <div className="pellet-metric-box">
                <div className="pellet-metric-label">{isEs ? 'Pureza y Fabricación' : 'Purity & Grade'}</div>
                <div className="pellet-metric-value">≥ 99.5% USP</div>
                <div className="pellet-metric-sub">Pharmapolis EU GMP (Bulgaria)</div>
              </div>

              <div className="pellet-metric-box">
                <div className="pellet-metric-label">{isEs ? 'Paso Hepático' : 'First-Pass Metabolism'}</div>
                <div className="pellet-metric-value">0% (Bypassed)</div>
                <div className="pellet-metric-sub">{isEs ? 'Biodisponibilidad 100% capilar' : '100% capillary subcutaneous uptake'}</div>
              </div>
            </div>
          </div>

          {/* Anchor for Section Scrolling */}
          <div id="monograph-content-anchor" style={{ scrollMarginTop: '110px' }} />

          {/* Mobile Navigation Pills (Visible only on mobile screens <= 960px) */}
          <div className="pellet-mobile-nav-bar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    document.getElementById('monograph-content-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`pellet-mobile-nav-pill ${isActive ? 'active' : ''}`}
                >
                  <Icon size={13} />
                  <span>{isEs ? tab.shortEs : tab.shortEn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Section Banner with Step Progression */}
          <div className="pellet-section-indicator-bar">
            <div className="pellet-section-indicator-left">
              <span className="pellet-section-pill">
                {isEs ? `Sección ${currentTabIndex + 1} de ${TABS.length}` : `Section ${currentTabIndex + 1} of ${TABS.length}`}
              </span>
              <span className="pellet-section-current-title">
                {isEs ? currentTabObj.titleEs : currentTabObj.titleEn}
              </span>
            </div>

            <div className="pellet-section-nav-actions">
              <button
                type="button"
                onClick={handlePrevTab}
                disabled={currentTabIndex === 0}
                className="pellet-section-nav-btn"
                title={isEs ? 'Sección anterior' : 'Previous section'}
              >
                <ChevronLeft size={13} />
                <span>{isEs ? 'Anterior' : 'Previous'}</span>
              </button>

              <button
                type="button"
                onClick={handleNextTab}
                disabled={currentTabIndex === TABS.length - 1}
                className="pellet-section-nav-btn"
                title={isEs ? 'Siguiente sección' : 'Next section'}
              >
                <span>{isEs ? 'Siguiente' : 'Next'}</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* ── TAB 1: OVERVIEW & CLINICAL PROFILE ── */}
          {activeTab === 'overview' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <Sparkles size={18} color="#003666" />
                <span>{isEs ? 'Objetivo Terapéutico & Perfil del Paciente' : 'Therapeutic Objective & Patient Phenotype'}</span>
              </h2>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: '#334155', marginBottom: '1.25rem' }}>
                {p.objective}
              </p>

              <div className="pellet-callout pellet-callout-info">
                <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{isEs ? 'Perfil Clínico del Paciente Candidato:' : 'Target Patient Phenotype:'}</strong>{' '}
                  {dossier.targetPatientProfile}
                </div>
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '1.5rem 0 0.85rem' }}>
                {isEs ? 'Indicaciones y Metas Clínicas Primarias' : 'Primary Clinical Indications & Goals'}
              </h3>

              <div className="pellet-goals-grid">
                {(p.goals || []).map((goal, idx) => (
                  <div key={idx} className="pellet-goal-item">
                    <CheckCircle2 size={16} />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '1.5rem 0 0.85rem' }}>
                {isEs ? 'Posología Médica Recomendada' : 'Physician Posology Directives'}
              </h3>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.86rem', lineHeight: 1.6, color: '#334155' }}>
                {dossier.recommendedPosology}
              </div>
            </div>
          )}

          {/* ── TAB 2: PHARMACOKINETICS & RELEASE PROFILE ── */}
          {activeTab === 'pharmacokinetics' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <TrendingUp size={18} color="#003666" />
                <span>{isEs ? 'Dinámica de Disolución Subcutánea & Cinética de Orden Cero' : 'Subcutaneous Dissolution Dynamics & Zero-Order Kinetics'}</span>
              </h2>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: '#334155', marginBottom: '1.25rem' }}>
                {isEs
                  ? 'A diferencia de los comprimidos orales (que sufren una degradación hepática masiva de primer paso) o los geles/parches transdérmicos (que dependen de la variabilidad de la barrera del estrato córneo), los pellets subcutáneos de Pharmapolis actúan como micro-depósitos de disolución constante.'
                  : 'Unlike oral pills (which undergo heavy hepatic first-pass degradation) or transdermal patches/gels (which suffer from erratic stratum corneum barrier variability), Pharmapolis subcutaneous pellets provide continuous micro-vascular diffusion.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '1.25rem 0' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                    {isEs ? 'Cinética de Liberación' : 'Release Mechanism'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {galenic.releaseProfile || 'Orden Cero Constante'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {isEs ? 'Erosión micro-cristalina proporcional a la superficie del pellet' : 'Surface-area dependent crystalline dissolution into capillary beds'}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>
                    {isEs ? 'Tiempo al Pico Máximo (Tmax)' : 'Time to Peak (Tmax)'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {galenic.tmax || '24 a 72 Horas'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {isEs ? 'Leve pico inicial seguido de una meseta estable prolongada' : 'Transient absorption initiation followed by flat sustained plateau'}
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#6b21a8', textTransform: 'uppercase' }}>
                    {isEs ? 'Meseta Terapéutica' : 'Therapeutic Plateau'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {galenic.steadyStatePlateau || 'Día 7 a Mes 4-5'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {isEs ? 'Sin fluctuaciones diarias ni caídas abruptas de humor' : 'Complete absence of diurnal valleys and mood crashes'}
                  </div>
                </div>
              </div>

              {isEstrogen && (
                <div className="pellet-callout pellet-callout-success">
                  <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>{isEs ? 'Preservación de la Relación Fisiológica E2:E1 (1.5:1 a 2:1):' : 'Preservation of Physiological E2:E1 Ratio (1.5:1 to 2:1):'}</strong>{' '}
                    {isEs
                      ? 'La administración oral eleva artificialmente la estrona (E1) hasta 5 veces por encima del estradiol (E2). Los pellets de 17β-estradiol mantienen la estrona en rango normal, evitando la sobrecarga metabólica hepática y la síntesis excesiva de factores de coagulación o SHBG.'
                      : 'Oral estrogen artificially inflates estrone (E1) up to 5-fold higher than estradiol (E2). Subcutaneous estradiol pellets maintain estrone within baseline, eliminating hepatic clotting factor stimulation.'}
                  </div>
                </div>
              )}

              {isTestosterone && (
                <div className="pellet-callout pellet-callout-info">
                  <Activity size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>{isEs ? 'Eliminación del Efecto Montaña Rusa de las Inyecciones:' : 'Elimination of Injection Rollercoaster Effect:'}</strong>{' '}
                    {isEs
                      ? 'A diferencia de las inyecciones intramusculares periódicas (que producen picos suprafisiológicos en el día 2 seguidos de caídas sintomáticas en el día 10-14), el implante de testosterona asegura niveles eugonadales sin picos ni valles durante 4 a 6 meses.'
                      : 'Unlike weekly or bi-weekly testosterone injections that cause supraphysiologic surges followed by deep fatigue valleys, subcutaneous implants maintain stable eugonadal levels without intervention for 4 to 6 months.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: TROCAR IMPLANTATION PROCEDURE ── */}
          {activeTab === 'procedure' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <Syringe size={18} color="#003666" />
                <span>{isEs ? 'Protocolo Quirúrgico de Inserción mediante Trócar' : 'Clinical Trocar Implantation Surgical Protocol'}</span>
              </h2>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#334155', marginBottom: '1.25rem' }}>
                {isEs
                  ? 'Procedimiento ambulatorio estéril de 10 minutos realizado bajo anestesia local en consultorio médico especializado.'
                  : 'Outpatient 10-minute sterile procedure performed under local infiltrative anesthesia in an accredited clinical setting.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="pellet-procedure-step">
                  <div className="pellet-step-number">1</div>
                  <div className="pellet-step-content">
                    <div className="pellet-step-title">{isEs ? 'Preparación del Campo y Selección Anatómica' : 'Anatomic Site Selection & Prep'}</div>
                    <div className="pellet-step-desc">
                      {dossier.insertionProcedure?.site || 'Cuadrante superior externo del glúteo, 4-5 cm posterior a la cresta ilíaca anterior.'}
                    </div>
                  </div>
                </div>

                <div className="pellet-procedure-step">
                  <div className="pellet-step-number">2</div>
                  <div className="pellet-step-content">
                    <div className="pellet-step-title">{isEs ? 'Anestesia Local Infiltrativa' : 'Local Infiltration Anesthesia'}</div>
                    <div className="pellet-step-desc">
                      {dossier.insertionProcedure?.anesthesia || 'Infiltración con 2.0 mL de Lidocaína al 2% con Epinefrina 1:100.000 para vasoconstricción y hemostasia.'}
                    </div>
                  </div>
                </div>

                <div className="pellet-procedure-step">
                  <div className="pellet-step-number">3</div>
                  <div className="pellet-step-content">
                    <div className="pellet-step-title">{isEs ? 'Micro-incisión Quirúrgica' : 'Surgical Micro-incision'}</div>
                    <div className="pellet-step-desc">
                      {dossier.insertionProcedure?.incision || 'Micro-incisión de 3.5 a 5.0 mm con bisturí #11 a través de la dermis.'}
                    </div>
                  </div>
                </div>

                <div className="pellet-procedure-step">
                  <div className="pellet-step-number">4</div>
                  <div className="pellet-step-content">
                    <div className="pellet-step-title">{isEs ? 'Canalización con Trócar y Depósito' : 'Trocar Cannulation & Pellet Deployment'}</div>
                    <div className="pellet-step-desc">
                      {isEs
                        ? `Trócar especializado ${dossier.insertionProcedure?.trocarSize || '3.2 mm / 4.5 mm'}. Se avanza a 30° en la grasa subcutánea y luego se coloca paralelo a la fascia glútea. Los pellets se introducen mediante el obturador sin presión forzada.`
                        : `Specialized ${dossier.insertionProcedure?.trocarSize || '3.2 mm / 4.5 mm'} trocar. Advanced at 30° into subcutaneous fat, then lowered parallel to fascia. Pellets deployed smoothly using blunt obturator.`}
                    </div>
                  </div>
                </div>

                <div className="pellet-procedure-step">
                  <div className="pellet-step-number">5</div>
                  <div className="pellet-step-content">
                    <div className="pellet-step-title">{isEs ? 'Cierre sin Sutura y Vendaje Compresivo' : 'Sutureless Closure & Pressure Dressing'}</div>
                    <div className="pellet-step-desc">
                      {dossier.insertionProcedure?.closure || 'Aproximación de bordes cutáneos con Steri-Strips y apósito compresivo impermeable. No se requieren suturas.'}
                    </div>
                  </div>
                </div>

                <div className="pellet-procedure-step">
                  <div className="pellet-step-number">6</div>
                  <div className="pellet-step-content">
                    <div className="pellet-step-title">{isEs ? 'Cuidados Postoperatorios Obligatorios' : 'Mandatory Post-Op Precautions'}</div>
                    <div className="pellet-step-desc">
                      {dossier.insertionProcedure?.postOpCare || 'Mantener seco por 48 horas. Evitar sentadillas pesadas, ciclismo o inmersión en agua caliente por 5 días para evitar extrusión.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: SAFETY, LAB TELEMETRY & MONITORING ── */}
          {activeTab === 'monitoring' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <HeartPulse size={18} color="#003666" />
                <span>{isEs ? 'Panel Obligatorio de Telemetría Analítica & Seguridad' : 'Mandatory Laboratory Telemetry & Safety Surveillance'}</span>
              </h2>

              {/* CRITICAL SAFETY CALLOUTS */}
              {isEstrogen && (
                <div className="pellet-callout pellet-callout-warning">
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isEs ? 'Mandato Clínico de Protección Endometrial:' : 'Mandatory Endometrial Protection Protocol:'}
                    </strong>
                    {dossier.endometrialSafetyProtocol || 'En mujeres con útero intacto, el estrógeno sistémico sin oposición induce proliferación del endometrio. La administración concomitante de progesterona micronizada bioidéntica (100–200 mg/noche) es clínicamente obligatoria para mantener la quiescencia endometrial.'}
                  </div>
                </div>
              )}

              {isTestosterone && (
                <div className="pellet-callout pellet-callout-warning">
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isEs ? 'Vigilancia de Hematocrito y Eritrocitosis (Seguridad TRT):' : 'Hematocrit & Erythrocytosis Surveillance (TRT Safety):'}
                    </strong>
                    {isEs
                      ? 'La estimulación androgénica incrementa la eritropoyetina. En hombres y mujeres se debe monitorizar el hematocrito. Si el hematocrito supera el 52% (mujeres) o el 54% (hombres), se debe diferir la siguiente inserción y considerar optimización de hidratación o flebotomía terapéutica.'
                      : 'Androgenic therapy stimulates erythropoietin. Hematocrit must be monitored. If hematocrit exceeds 52% (women) or 54% (men), the next implantation must be deferred until normalized.'}
                  </div>
                </div>
              )}

              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#003666', margin: '1.5rem 0 0.85rem' }}>
                {isEs ? 'Cronograma de Telemetría en Sangre' : 'Bloodwork Telemetry Schedule'}
              </h3>

              <div style={{ margin: '1rem 0' }}>
                <DataTable
                  columns={[
                    {
                      key: 'timeline',
                      header: isEs ? 'Fase Temporal' : 'Timeline Phase',
                      render: (val) => <strong style={{ color: '#003666' }}>{val}</strong>,
                      width: '28%'
                    },
                    {
                      key: 'labs',
                      header: isEs ? 'Biomarcadores y Análisis Obligatorios' : 'Required Biomarker Surveillance',
                      render: (val) => <span style={{ color: '#1e293b', lineHeight: 1.5 }}>{val}</span>
                    }
                  ]}
                  data={(dossier.monitoringTelemetry || []).map((row, idx) => ({ id: String(idx), ...row }))}
                  pagination={false}
                  searchable={false}
                />
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991b1b', margin: '1.5rem 0 0.85rem' }}>
                {isEs ? 'Contraindicaciones Médicas Absolutas' : 'Absolute Medical Contraindications'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                {(dossier.contraindications || []).map((c, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.80rem', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <X size={14} style={{ flexShrink: 0 }} />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: GALENIC SPECS & EU GMP QUALITY ── */}
          {activeTab === 'specifications' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <Microscope size={18} color="#003666" />
                <span>{isEs ? 'Especificaciones Galénicas & Certificación EU GMP' : 'Galenic Specifications & EU GMP Quality Standard'}</span>
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{isEs ? 'Principio Activo (API)' : 'Active Ingredient'}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{composition.activeSubstance}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>Dosis exacta: <strong>{composition.activeDose}</strong></div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{isEs ? 'Excipientes & Aglutinantes' : 'Excipient Formulation'}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{isEs ? 'Zero-Binder Crystalline' : 'Zero-Binder Crystalline'}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>{composition.excipients}</div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{isEs ? 'Método de Esterilización' : 'Sterilization Assurance'}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>E-Beam / Gamma SAL 10⁻⁶</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>{composition.sterilizationMethod}</div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{isEs ? 'Dimensiones Físicas' : 'Physical Dimensions'}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{composition.dimensions}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>{composition.appearance}</div>
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 800, fontSize: '0.90rem', marginBottom: '6px' }}>
                  <ShieldCheck size={18} />
                  <span>Laboratorio Fabricante: Pharmapolis Compounding Pharmacy (Plovdiv, Bulgaria EU)</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0, lineHeight: 1.55 }}>
                  {isEs
                    ? 'Fabricado bajo normas de correcta fabricación de la Unión Europea (EU GMP). Cada lote se somete a cromatografía líquida de alta resolución (HPLC) para verificación de potencia y ensayo de endotoxinas bacterianas (< 0.2 EU/mg) antes de su liberación clínica.'
                    : 'Manufactured under European Good Manufacturing Practices (EU GMP). Each batch undergoes RP-HPLC potency assay and bacterial endotoxin testing (< 0.2 EU/mg) prior to clinical release.'}
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 6: CLINICAL EVIDENCE & REFERENCES ── */}
          {activeTab === 'evidence' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <FileText size={18} color="#003666" />
                <span>{isEs ? 'Evidencia Científica & Bibliografía Médica Indexada' : 'Peer-Reviewed Clinical Literature & Scientific Evidence'}</span>
              </h2>

              <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#334155', marginBottom: '1.25rem' }}>
                {isEs
                  ? 'La terapia hormonal mediante pellets subcutáneos cuenta con más de 70 años de documentación clínica en Europa, el Reino Unido y los Estados Unidos, destacando por su eficacia sostenida sobre la densidad ósea y la sintomatología vasomotora.'
                  : 'Subcutaneous hormone pellet implants have over 70 years of peer-reviewed clinical data across Europe, the UK, and the US, proving superior compliance and sustained bone mineral density preservation.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(dossier.clinicalTrialsCitations || []).map((citation, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', lineHeight: 1.5, color: '#1e293b', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#003666', color: '#fff', fontSize: '0.70rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div>{citation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 7: B2B TARIFFS & CLINICAL SUPPLY ── */}
          {activeTab === 'b2b' && (
            <div className="pellet-tab-card">
              <h2 className="pellet-tab-title">
                <Building2 size={18} color="#003666" />
                <span>{isEs ? 'Tarifas Clínicas Oficiales & Asignación B2B' : 'Official Clinical Tariff & B2B Procurement'}</span>
              </h2>

              <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                {isEs
                  ? 'Precios oficiales validados del catálogo de Pharmapolis (Bulgaria EU GMP). Disponibilidad directa para clínicas y médicos autorizados en la Unión Europea, GCC y red médica global.'
                  : 'Official validated pricing from Pharmapolis (Bulgaria EU GMP) catalog schedule. Available for accredited medical clinics and registered physicians across EU, GCC, and global partner networks.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    {isEs ? 'Coste Base Fabricación (EUR)' : 'Base Manufacturing Cost (EUR)'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#003666', margin: '4px 0' }}>
                    €{pricing.costPriceEur ? pricing.costPriceEur.toFixed(2) : '50.00'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>EU GMP Cleanroom Plovdiv</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
                    {isEs ? 'Coste Landed GCC (AED)' : 'GCC Landed Cost (AED)'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0284c7', margin: '4px 0' }}>
                    {pricing.landedCostAed ? `${pricing.landedCostAed.toFixed(2)} AED` : '200.00 AED'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Fulfillment & Logistics included</div>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                    {isEs ? 'Tarifa Mayorista / Clínica (AED)' : 'Wholesale / Clinic Tier (AED)'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#166534', margin: '4px 0' }}>
                    {pricing.wholesalePriceAed ? `${pricing.wholesalePriceAed.toFixed(2)} AED` : '230.00 AED'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#166534' }}>Accredited Medical Doctors</div>
                </div>

                <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#6b21a8', fontWeight: 800, textTransform: 'uppercase' }}>
                    {isEs ? 'PVP Orientativo Paciente (AED)' : 'Estimated Patient Retail (AED)'}
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#6b21a8', margin: '4px 0' }}>
                    {pricing.retailPriceAed ? `${pricing.retailPriceAed.toFixed(2)} AED` : '310.00 AED'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6b21a8' }}>Clinic Dispensing Reference</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setIsInquiryDrawerOpen(true)}
                  className="gcp-btn-primary"
                  style={{ width: 'auto', padding: '11px 24px' }}
                >
                  <Building2 size={15} />
                  <span>{isEs ? 'Solicitar Asignación Clínica de Lote' : 'Request Clinic Batch Allocation'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Sidebar */}
        <div className="pellet-sidebar">
          {/* Action & Pricing Card */}
          <div className="pellet-sidebar-card">
            <div className="pellet-sidebar-header">
              <Package size={14} />
              <span>{isEs ? 'Adquisición Clínica' : 'Clinical Procurement'}</span>
            </div>

            <div className="pellet-price-display">
              <span className="pellet-price-value">
                €{pricing.costPriceEur ? pricing.costPriceEur.toFixed(2) : '50.00'}
              </span>
              <span className="pellet-price-currency">
                / {isEs ? 'pellet estéril' : 'sterile pellet'}
              </span>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.4 }}>
              {pricing.wholesalePriceAed
                ? `${pricing.wholesalePriceAed.toFixed(2)} AED ${isEs ? 'tarifa clínica GCC' : 'GCC clinic rate'}`
                : (isEs ? 'Tarifa profesional mayorista disponible' : 'Official wholesale clinic tier')}
            </div>

            <button
              onClick={() => setIsInquiryDrawerOpen(true)}
              className="gcp-btn-primary pellet-sidebar-btn-primary"
            >
              <Building2 size={16} />
              <span>{isEs ? 'Solicitar Asignación' : 'Request Allocation'}</span>
            </button>

            <button
              onClick={() => setIsShareDrawerOpen(true)}
              className="gcp-btn-secondary pellet-sidebar-btn-secondary"
            >
              <Share2 size={15} />
              <span>{isEs ? 'Compartir Monografía' : 'Share Monograph'}</span>
            </button>
          </div>

          {/* Navigation Sections in Sidebar */}
          <div id="monograph-sidebar-nav" className="pellet-sidebar-card pellet-sidebar-nav-card">
            <div className="pellet-sidebar-header">
              <List size={14} />
              <span>{isEs ? 'Secciones del Expediente' : 'Monograph Sections'}</span>
            </div>

            <div className="pellet-sidebar-nav-list">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      document.getElementById('monograph-content-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`pellet-sidebar-nav-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="pellet-sidebar-nav-item-left">
                      <span className="pellet-sidebar-nav-num">{tab.number}</span>
                      <Icon size={14} className="pellet-sidebar-nav-icon" />
                      <span className="pellet-sidebar-nav-title">
                        {isEs ? tab.titleEs : tab.titleEn}
                      </span>
                    </div>
                    {isActive && <ChevronRight size={14} className="pellet-sidebar-nav-arrow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Official Monograph Verified QR Card */}
          <div style={{ marginBottom: '1.25rem' }}>
            <UniversalQrCard
              value={canonicalUrl}
              title={isEs ? 'ACCESO QR VERIFICADO' : 'VERIFIED MONOGRAPH QR'}
              subtitle={isEs ? 'Escanear para acceder a la monografía clínica en móvil' : 'Scan to open clinical monograph dossier on mobile'}
              badge="EU GMP"
              lang={lang}
              size={110}
            />
          </div>

          {/* Quick Galenic Summary Card */}
          <div className="pellet-sidebar-card">
            <div className="pellet-sidebar-header">
              <Microscope size={14} />
              <span>{isEs ? 'Ficha Técnica Rápida' : 'Quick Galenic Specs'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>{isEs ? 'Molécula:' : 'Molecule:'}</span>
                <strong style={{ color: '#0f172a' }}>{composition.activeSubstance?.split('(')[0] || p.canonicalName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>{isEs ? 'Concentración:' : 'Strength:'}</span>
                <strong style={{ color: '#003666' }}>{p.strength}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>{isEs ? 'Vía:' : 'Route:'}</span>
                <span style={{ color: '#0f172a' }}>{isEs ? 'Subcutánea (Trócar)' : 'Subcutaneous (Trocar)'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>{isEs ? 'Duración:' : 'Duration:'}</span>
                <span style={{ color: '#0f172a' }}>{galenic.averageDurationMonths || (isEs ? '3.5 - 5 Meses' : '3.5 - 5 Months')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>{isEs ? 'Esterilidad:' : 'Sterility:'}</span>
                <span style={{ color: '#166534', fontWeight: 700 }}>E-Beam SAL 10⁻⁶</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{isEs ? 'Laboratorio:' : 'Lab:'}</span>
                <span style={{ color: '#0f172a' }}>Pharmapolis (EU GMP)</span>
              </div>
            </div>
          </div>

          {/* Sibling Pellets in Catalog */}
          <div className="pellet-sidebar-card">
            <div className="pellet-sidebar-header">
              <Layers size={14} />
              <span>{isEs ? 'Pellets de la Colección' : 'Sister Pellets'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(p.siblingPellets || []).map((sib, idx) => (
                <Link
                  key={idx}
                  href={`/p/${sib.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    textDecoration: 'none',
                    fontSize: '0.78rem',
                    color: '#334155'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#003666' }}>{sib.name}</div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{sib.role}</div>
                  </div>
                  <ChevronRight size={14} color="#94a3b8" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DRAWERS ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="product"
        brandType="hormone_pellet"
        lang={lang}
        initialEntity={{
          name: p.commercialName || p.canonicalName || p.name,
          slug: slug,
          code: p.sku || 'SKU-PHARM-HORM',
          strength: p.strength,
          category: 'Pellets Hormonales Subcutáneos (BHRT)',
          supplier: 'Pharmapolis Compounding Pharmacy',
          brand: 'Pharmapolis (Bulgaria EU GMP)',
          galenicForm: 'Pellet Subcutáneo Estéril (Blister Individual)',
          inquiryGoal: 'hospital_clinic_allocation'
        }}
      />

      <ShareProductMonographDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        product={{
          id: p.id || slug,
          name: p.commercialName || p.canonicalName || p.name,
          slug: slug,
          strength: p.strength,
          category: p.category || 'Hormone Pellets',
          brand: 'Pharmapolis Compounding Pharmacy',
          supplier: 'Pharmapolis (Bulgaria EU GMP)'
        }}
      />

      {/* ── UNIFIED ATLAS PUBLIC FOOTER ── */}
      <PublicUnifiedFooter />
    </div>
  );
}
