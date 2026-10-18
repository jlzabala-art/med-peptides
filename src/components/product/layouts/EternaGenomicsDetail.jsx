"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Dna,
  ShieldCheck,
  Sparkles,
  Activity,
  Heart,
  Clock,
  CheckCircle2,
  Smartphone,
  Layers,
  FlaskConical,
  ZoomIn,
  Copy,
  Check,
  Package,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Users,
  FileText,
  Download,
  ExternalLink,
  Share2,
  X,
  HeartPulse,
  Brain,
  Zap,
  Star,
  Microscope,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowLeft
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import ProductSectionFooterNav from '@/components/product/ProductSectionFooterNav';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import DataTable from '@/components/ui/DataTable';
import './EternaGenomicsDetail.css';

export default function EternaGenomicsDetail({
  product = {},
  slug = 'eterna-epigenetic-age-test',
  initialBatch = 'AS-ETR-EUR01-2610',
  initialStrength = '1 test / kit',
  baseUrl = 'https://www.atlashealth-services.com'
}) {
  // English by default as requested
  const [lang, setLang] = useState('en');
  const [activePillar, setActivePillar] = useState('sport');
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isB2BPortalModalOpen, setIsB2BPortalModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: '', title: '' });

  const isEs = lang === 'es';

  // Identifiers
  const name = product.name || 'ETERNA® DNA & Epigenetic Longevity Platform';
  const effectiveBatchCode = initialBatch || product.batch || 'AS-ETR-EUR01-2610';

  const handleOpenModal = (src, title) => {
    setModalImage({ src, title });
    setIsImageModalOpen(true);
  };

  const eternaSections = useMemo(() => [
    { id: 'overview', label: isEs ? 'Visión General' : 'Overview & 3D Stage', icon: Sparkles },
    { id: 'biometrics', label: isEs ? 'Biometría & Wearables' : 'Biometrics & Wearables', icon: Smartphone },
    { id: 'pilares', label: isEs ? '5 Pilares Genómicos' : '5 Genomic Pillars', icon: Layers },
    { id: 'snp-table', label: isEs ? 'SNPs & Datos Técnicos' : 'SNPs & Technical Data', icon: BarChart3 },
    { id: 'como-funciona', label: isEs ? 'Cómo Funciona' : 'How It Works (4 Steps)', icon: Clock },
    { id: 'investigacion', label: isEs ? 'Rigor Científico' : 'Scientific Backing & Rigor', icon: ShieldCheck },
    { id: 'integracion', label: isEs ? 'Protocolos Clínicos' : 'Clinical Protocols Integration', icon: Activity },
    { id: 'productos', label: isEs ? 'Gama Eterna DX' : 'Product Suite & Formats', icon: Package }
  ], [isEs]);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'inicio') return 'overview';
      if (hash) return hash;
    }
    return 'overview';
  });

  const [snpSearch, setSnpSearch] = useState('');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState('all');

  const scrollToSection = useCallback((id) => {
    if (!id) return;
    const targetId = id === 'inicio' ? 'overview' : id;
    setActiveTab(targetId);
    if (typeof window !== 'undefined') {
      if (window.history?.replaceState) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'inicio' || hash === 'overview') {
        setActiveTab('overview');
      } else if (hash) {
        setActiveTab(hash);
      } else {
        setActiveTab('overview');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const effectiveActiveTab = useMemo(() => {
    if (!activeTab || activeTab === 'overview' || activeTab === 'inicio') return 'overview';
    const exists = eternaSections.some(s => s.id === activeTab);
    return exists ? activeTab : 'overview';
  }, [activeTab, eternaSections]);

  const currentSectionIndex = useMemo(() => {
    return eternaSections.findIndex(s => s.id === effectiveActiveTab);
  }, [eternaSections, effectiveActiveTab]);

  const currentSectionObj = useMemo(() => {
    return eternaSections[currentSectionIndex] || eternaSections[0];
  }, [eternaSections, currentSectionIndex]);

  // Structured High-Impact Genomic SNPs Analyzed
  const snpData = [
    {
      id: 'actn3',
      gene: 'ACTN3',
      rsid: 'rs1815739',
      pillar: isEs ? 'Deporte' : 'Sport',
      pillarId: 'sport',
      effect: isEs 
        ? 'Genotipo R577X. Determina proporción de alfa-actinina-3 en fibras musculares rápidas tipo II.' 
        : 'R577X polymorphism modulating alpha-actinin-3 in fast-twitch Type IIx muscle fibers.',
      intervention: isEs 
        ? 'Protocolo de fuerza explosiva / Adaptación de cargas pliométricas + BPC-157 / TB-500' 
        : 'High-velocity power resistance training + BPC-157 / TB-500 recovery protocol'
    },
    {
      id: 'cyp1a2',
      gene: 'CYP1A2',
      rsid: 'rs762551',
      pillar: isEs ? 'Nutrición' : 'Nutrition',
      pillarId: 'nutrition',
      effect: isEs 
        ? 'Metabolizador hepático de cafeína (alelo A rápido vs C lento). Tasa de aclaramiento citocromo P450.' 
        : 'Hepatic caffeine metabolism (A allele rapid vs C allele slow metabolizer). CYP450 clearance rate.',
      intervention: isEs 
        ? 'Ajuste de ventana pre-entrenamiento (>8h antes del descanso para metabolizadores lentos)' 
        : 'Pre-workout timing adjustment (>8h pre-bedtime cutoff for slow metabolizers)'
    },
    {
      id: 'apoe',
      gene: 'APOE',
      rsid: 'rs429358',
      pillar: isEs ? 'Prevención' : 'Prevention',
      pillarId: 'prevention',
      effect: isEs 
        ? 'Isoformas ε2/ε3/ε4. Modula aclaramiento lipídico endotelial y riesgo cardiovascular / aterosclerosis.' 
        : 'ApoE ε2/ε3/ε4 isoforms regulating vascular lipid clearance and atherogenic LDL particle residence.',
      intervention: isEs 
        ? 'Restricción de grasas saturadas, ratio EPA/DHA >2:1 y monitorización trimestral de ApoB / Lp(a)' 
        : 'Saturated fat restriction, EPA/DHA >2:1 protocol and quarterly ApoB / Lp(a) surveillance'
    },
    {
      id: 'foxo3',
      gene: 'FOXO3',
      rsid: 'rs2802292',
      pillar: isEs ? 'Longevidad' : 'Longevity',
      pillarId: 'longevity',
      effect: isEs 
        ? 'Alelo G de longevidad excepcional. Estimula autofagia celular, resistencia a estrés oxidativo y SIRT1.' 
        : 'G-allele promoter associated with exceptional human lifespan, autophagy activation and SIRT1 synergy.',
      intervention: isEs 
        ? 'Activación de sirtuinas, restricción calórica intermitente y protocolo Epitalon / NAD+ infusión' 
        : 'Sirtuin upregulation, intermittent fasting cycles and Epitalon / NAD+ cellular longevity protocol'
    },
    {
      id: 'clock',
      gene: 'CLOCK',
      rsid: 'rs1801260',
      pillar: isEs ? 'Bienestar' : 'Social',
      pillarId: 'social',
      effect: isEs 
        ? 'Polimorfismo 3111T/C. Regula amplitud del oscilador circadiano del núcleo supraquiasmático.' 
        : '3111T/C circadian master clock variant modulating chronotype and phase delay tendency.',
      intervention: isEs 
        ? 'Terapia de fotobiomodulación matutina (>10.000 lux) y magnesio bisglicinato + DSIP nocturno' 
        : 'Morning blue light exposure (>10,000 lux) and evening magnesium glycinate + DSIP sleep protocol'
    },
    {
      id: 'mthfr',
      gene: 'MTHFR',
      rsid: 'rs1801133',
      pillar: isEs ? 'Nutrición' : 'Nutrition',
      pillarId: 'nutrition',
      effect: isEs 
        ? 'Variante C677T. Reducción de hasta un 65% en la actividad de transmetilación del folato y homocisteína.' 
        : 'C677T variant. Up to 65% reduction in enzymatic methylation efficiency of folate to 5-MTHF.',
      intervention: isEs 
        ? 'Sustitución estricta de ácido fólico sintético por L-Metilfolato activo + Metilcobalamina B12' 
        : 'Strict avoidance of synthetic folic acid; therapeutic L-Methylfolate + Methyl-B12 clinical stack'
    }
  ];

  const filteredSnps = snpData.filter((snp) => {
    const matchesFilter = selectedPillarFilter === 'all' || snp.pillarId === selectedPillarFilter;
    const matchesSearch = !snpSearch || 
      snp.gene.toLowerCase().includes(snpSearch.toLowerCase()) ||
      snp.rsid.toLowerCase().includes(snpSearch.toLowerCase()) ||
      snp.effect.toLowerCase().includes(snpSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const snpColumns = useMemo(() => [
    {
      key: 'gene',
      label: isEs ? 'Gen' : 'Gene Symbol',
      width: '14%',
      render: (row) => <span className="eterna-gene-tag">{row.gene}</span>
    },
    {
      key: 'rsid',
      label: 'dbSNP / Locus',
      width: '18%',
      render: (row) => <CopyableId value={row.rsid} />
    },
    {
      key: 'pillar',
      label: isEs ? 'Dominio' : 'Clinical Domain',
      width: '18%',
      render: (row) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--gcp-text-primary)', fontWeight: 500 }}>
          {row.pillar}
        </span>
      )
    },
    {
      key: 'effect',
      label: isEs ? 'Impacto Fenotípico' : 'Phenotypic Impact',
      width: '25%',
      render: (row) => (
        <span style={{ fontSize: '0.79rem', lineHeight: 1.45 }}>
          {row.effect}
        </span>
      )
    },
    {
      key: 'intervention',
      label: isEs ? 'Intervención Protocolo' : 'Protocol Action',
      width: '25%',
      render: (row) => (
        <span style={{ fontSize: '0.79rem', color: 'var(--gcp-blue-light)', lineHeight: 1.45 }}>
          {row.intervention}
        </span>
      )
    }
  ], [isEs]);

  // 5 Genetic Pillars definitions (Original Eterna)
  const pillars = [
    {
      id: 'sport',
      title: isEs ? 'Deporte' : 'Sport',
      desc: isEs 
        ? 'Resistencia aeróbica, fuerza, velocidad de recuperación y tolerancia a la carga de entrenamiento' 
        : 'Endurance, strength, recovery and training load tolerance',
      icon: HeartPulse,
      color: '#8ab4f8',
      bg: 'rgba(138, 180, 248, 0.1)',
      border: 'rgba(138, 180, 248, 0.3)'
    },
    {
      id: 'nutrition',
      title: isEs ? 'Nutrición' : 'Nutrition',
      desc: isEs 
        ? 'Metabolismo basal, tolerancias alimentarias, asimilación de vitaminas y utilización de nutrientes' 
        : 'Metabolism, food tolerances, vitamins and nutrient use',
      icon: FlaskConical,
      color: '#81c995',
      bg: 'rgba(129, 201, 149, 0.1)',
      border: 'rgba(129, 201, 149, 0.3)'
    },
    {
      id: 'prevention',
      title: isEs ? 'Prevención' : 'Prevention',
      desc: isEs 
        ? 'Variantes asociadas al metabolismo lipídico, presión arterial, glucosa y salud de la piel' 
        : 'Variants associated with lipid metabolism, blood pressure, glucose metabolism and skin',
      icon: Brain,
      color: '#c58af9',
      bg: 'rgba(197, 138, 249, 0.1)',
      border: 'rgba(197, 138, 249, 0.3)'
    },
    {
      id: 'longevity',
      title: isEs ? 'Longevidad' : 'Longevity',
      desc: isEs 
        ? 'Envejecimiento celular, longitud telomérica, estrés oxidativo y capacidad de reparación del ADN' 
        : 'Cellular aging, telomeres, oxidative stress and DNA repair',
      icon: Zap,
      color: '#fdd663',
      bg: 'rgba(253, 214, 99, 0.1)',
      border: 'rgba(253, 214, 99, 0.3)'
    },
    {
      id: 'social',
      title: isEs ? 'Bienestar' : 'Social',
      desc: isEs 
        ? 'Calidad del sueño, cronotipo circadiano, respuesta al estrés y equilibrio neuroquímico' 
        : 'Sleep, chronotype, stress response and emotional wellbeing',
      icon: Star,
      color: '#ff8bcb',
      bg: 'rgba(255, 139, 203, 0.1)',
      border: 'rgba(255, 139, 203, 0.3)'
    }
  ];

  // 4 Steps Process Data
  const processSteps = [
    {
      step: '01',
      title: isEs ? 'Pide tu test genético' : 'Take your genetic test',
      desc: isEs 
        ? 'Tu kit llega a casa en 24-48h. Una sola muestra de saliva indolora para resultados de por vida.' 
        : 'Your kit arrives home. One painless saliva sample for lifelong actionable results.',
      icon: '/images/products/eterna/01_icon.png'
    },
    {
      step: '02',
      title: isEs ? 'Descarga la app ETERNA' : 'Download the ETERNA app',
      desc: isEs 
        ? 'Tu centro de control de salud personal y telemetría biológica interactiva sin coste añadido.' 
        : 'Your personal health control center, free from day one to visualize your biomarkers.',
      icon: '/images/products/eterna/02_icon.png'
    },
    {
      step: '03',
      title: isEs ? 'Conecta tu smartwatch' : 'Connect your smartwatch',
      desc: isEs 
        ? 'Vincula Garmin, Fitbit, Oura Ring o Apple Watch para contextualizar tus métricas diarias en tiempo real.' 
        : 'Link Garmin, Fitbit, Oura or Apple Watch for real physiological context in real time.',
      icon: '/images/products/eterna/03_icon.png'
    },
    {
      step: '04',
      title: isEs ? 'Monitoriza, comparte y mejora' : 'Monitor, share and improve',
      desc: isEs 
        ? 'Revisa tus datos biológicos organizados, compártelos con tu médico y optimiza tus hábitos.' 
        : 'Review your biological data organized and visualized in one place, share with your doctor.',
      icon: '/images/products/eterna/04_icon.png'
    }
  ];

  // Compatible Wearables Logos
  const wearableLogos = [
    { name: 'Garmin Connect', src: '/images/products/eterna/garmin_logo.png' },
    { name: 'Fitbit', src: '/images/products/eterna/fitbit_logo.png' },
    { name: 'Oura Ring', src: '/images/products/eterna/oura_logo.png' },
    { name: 'Polar', src: '/images/products/eterna/polar_logo.png' },
    { name: 'Withings', src: '/images/products/eterna/withings_logo.png' },
    { name: 'Health Connect', src: '/images/products/eterna/health_connect_logo.png' },
    { name: 'Apple Health', src: '/images/products/eterna/apple_health_logo.jpg' },
  ];

  return (
    <div className="eterna-page-root">
      {/* Background Ambience */}
      <div className="eterna-hero-bg-texture" />
      <div className="eterna-radial-glow" />

      {/* Global Product Header */}
      <PublicUnifiedHeader
        track="peptides"
        lang={lang}
        onLangChange={setLang}
        copyUrl={typeof window !== 'undefined' ? window.location.href : `${baseUrl}/p/${slug}`}
        supplierName="ETERNA DX · Eurofins Lab"
        currentSlug={slug}
        inquiryContextType="product"
        inquiryEntity={{
          name,
          slug,
          code: effectiveBatchCode,
          strength: initialStrength,
          category: 'Precision Genomics & Epigenetics'
        }}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
        hideTier2={true}
        breadcrumb={[
          { label: isEs ? 'Catálogo' : 'Catalog', href: '/catalog' },
          { label: isEs ? 'Diagnóstico & Genómica' : 'Diagnostics & Genomics', href: '/collection/diagnostics' },
          { label: name }
        ]}
      />

      {/* ── 1. Google Cloud Console Command Header ── */}
      <div className="eterna-gcp-header-wrapper">
        <div className="eterna-gcp-header-inner">
          <div className="eterna-gcp-breadcrumb-bar">
            <Link href="/catalog">{isEs ? 'Consola Atlas Health' : 'Atlas Health Console'}</Link>
            <span>/</span>
            <Link href="/collection/diagnostics">{isEs ? 'Diagnóstico & Genómica' : 'Genomics & Precision Diagnostics'}</Link>
            <span>/</span>
            <span style={{ color: 'var(--gcp-text-primary)' }}>ETERNA® Platform</span>
          </div>

          <div className="eterna-gcp-title-row">
            <div className="eterna-gcp-title-left">
              <div className="eterna-gcp-icon-box">
                <Dna size={22} />
              </div>
              <div>
                <h1 className="eterna-gcp-h1">{name}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <StatusBadge status="active" />
                  <span className="gcp-badge green" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span className="gcp-badge-dot" /> CE-IVDR Certified
                  </span>
                  <span className="gcp-badge blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Microscope size={12} /> Illumina Infinium GSA
                  </span>
                  <span className="gcp-badge amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={12} /> ISO 15189 / 17025
                  </span>
                </div>
              </div>
            </div>

            <div className="eterna-gcp-actions-toolbar">
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => setIsInquiryDrawerOpen(true)}
              >
                <span>{isEs ? 'Solicitar Kit / Consulta' : 'Request Kit / Inquiry'}</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => window.open('/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf', '_blank')}
                title={isEs ? 'Descargar muestra de informe' : 'Download sample PDF report'}
              >
                <FileText size={14} />
                <span>{isEs ? 'Informe Muestra' : 'Sample Report'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setIsB2BPortalModalOpen(true)}
              >
                <Activity size={14} />
                <span>{isEs ? 'Portal Clínico B2B' : 'B2B Clinical Console'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setIsShareDrawerOpen(true)}
                title={isEs ? 'Compartir ficha' : 'Share monograph'}
              >
                <Share2 size={14} />
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, minWidth: '42px' }}
                title={isEs ? 'Switch to English' : 'Cambiar a Español'}
              >
                {lang === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>

          <div className="eterna-gcp-meta-bar">
            <div className="eterna-gcp-meta-item">
              <span className="eterna-gcp-meta-label">RESOURCE ID:</span>
              <CopyableId value={slug} />
            </div>
            <div className="eterna-gcp-meta-item">
              <span className="eterna-gcp-meta-label">ASSAY BATCH:</span>
              <CopyableId value={effectiveBatchCode} />
            </div>
            <div className="eterna-gcp-meta-item">
              <span className="eterna-gcp-meta-label">ARRAY SPEC:</span>
              <span className="eterna-gcp-meta-value">Illumina Infinium GSA (+700k SNPs)</span>
            </div>
            <div className="eterna-gcp-meta-item">
              <span className="eterna-gcp-meta-label">CENTRAL LAB:</span>
              <span className="eterna-gcp-meta-value">Eurofins Genomics DE/FR</span>
            </div>
            <div className="eterna-gcp-meta-item">
              <span className="eterna-gcp-meta-label">TAT:</span>
              <span className="eterna-gcp-meta-value">14–21 Business Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Top 4 GCP KPI Metrics Cards (Golden Rule #22) ── */}
      {effectiveActiveTab === 'overview' && (
        <div className="eterna-kpis-container">
          <div className="eterna-kpi-grid">
            <div className="eterna-kpi-card" style={{ '--card-accent': '#8ab4f8' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Cobertura Genómica' : 'Genomic Coverage'}</span>
                <Dna size={15} style={{ color: '#8ab4f8' }} />
              </div>
              <div className="eterna-kpi-value">692K+</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Polimorfismos analizados (Illumina Infinium)' : 'High-density SNPs analyzed (Illumina GSA)'}
              </div>
            </div>

            <div className="eterna-kpi-card" style={{ '--card-accent': '#81c995' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Conformidad Regulatoria' : 'Regulatory Approval'}</span>
                <ShieldCheck size={15} style={{ color: '#81c995' }} />
              </div>
              <div className="eterna-kpi-value" style={{ fontSize: '1.45rem' }}>CE-IVDR</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Tubo estabilizador 24m temp. ambiente' : 'Room-temp 24 mo preservation buffer'}
              </div>
            </div>

            <div className="eterna-kpi-card" style={{ '--card-accent': '#c58af9' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Dominios Clínicos' : 'Clinical Domains'}</span>
                <Layers size={15} style={{ color: '#c58af9' }} />
              </div>
              <div className="eterna-kpi-value">5 Pillars</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Deporte, Nutrición, Prevención, Longevidad, Bienestar' : 'Sport, Nutrition, Prevention, Longevity, Social'}
              </div>
            </div>

            <div className="eterna-kpi-card" style={{ '--card-accent': '#fdd663' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Tiempo de Respuesta (TAT)' : 'Turnaround Time'}</span>
                <Clock size={15} style={{ color: '#fdd663' }} />
              </div>
              <div className="eterna-kpi-value">14–21 d</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Recepción de muestra a informe digital' : 'Courier sample intake to verified report'}
              </div>
            </div>
          </div>

          <div className="eterna-kpi-scope-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#81c995' }} />
              <span>
                {isEs 
                  ? 'Alcance: Activo de Laboratorio Certificado · Eurofins Genomics Central Laboratory · Encriptación RGPD' 
                  : 'Scope: Certified Laboratory Asset · Eurofins Genomics Central Laboratory · GDPR Encrypted'}
              </span>
            </div>
            <span style={{ fontFamily: 'ui-monospace, monospace' }}>VERIFIED ASSAY v2.4</span>
          </div>
        </div>
      )}

      {/* ── 3. GCP Sticky Navigation Ribbon (Tabs) ── */}
      <nav className="eterna-gcp-tab-ribbon" aria-label="Page Sections">
        <div className="eterna-gcp-tab-ribbon-inner">
          {eternaSections.map((sec) => {
            const IconComp = sec.icon || Sparkles;
            const isActive = effectiveActiveTab === sec.id;
            return (
              <button 
                key={sec.id}
                type="button" 
                className={`eterna-gcp-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => scrollToSection(sec.id)}
              >
                <IconComp size={14} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Master 2-Column Responsive Layout with Sticky Right Sidebar */}
      <div className="eterna-master-layout">
        
        {/* ====================================================================
            LEFT / MAIN COLUMN: Exact Replica of Eterna DX Content & Experience
           ==================================================================== */}
        <main className="eterna-main-content">
          
          {/* GCP Single-Section Header Strip (Golden Rule) */}
          {effectiveActiveTab !== 'overview' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: 'var(--gcp-surface)',
              border: '1px solid var(--gcp-border)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <button
                type="button"
                onClick={() => scrollToSection('overview')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'var(--gcp-surface-card)',
                  border: '1px solid var(--gcp-border)',
                  color: 'var(--gcp-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} />
                <span>{isEs ? 'Volver a Visión General' : 'Back to Overview'}</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--gcp-text-muted)' }}>{isEs ? 'Plataforma Eterna' : 'Eterna Platform'}</span>
                <span style={{ color: 'var(--gcp-border)' }}>/</span>
                <span style={{ fontWeight: 700, color: 'var(--gcp-blue-light)' }}>{currentSectionObj?.label}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gcp-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                {isEs ? `Sección ${currentSectionIndex + 1} de ${eternaSections.length}` : `Section ${currentSectionIndex + 1} of ${eternaSections.length}`}
              </div>
            </div>
          )}

          {/* ── Section: Overview & 3D Stage (Golden Rule) ── */}
          {effectiveActiveTab === 'overview' && (
            <>
              {/* ── 1. Hero Section: Tri-Device 3D Mockup ── */}
              <section id="overview" className="eterna-hero-section">
                <div className="eterna-pill-tag">
                  <Dna size={13} style={{ color: 'var(--gcp-blue-light)' }} />
                  <span>{isEs ? 'Test Genético · Envío a domicilio incluido' : 'Genetic test · Home delivery included'}</span>
                </div>

                {/* Tri-Device 3D Stage (Center Desktop App + 2 Tilted Phones) */}
                <div className="eterna-tri-device-stage">
                  {/* Left Mobile (-13deg) */}
                  <div 
                    className="eterna-floating-device-left"
                    onClick={() => handleOpenModal('/images/products/eterna/img_hero_movil_2.png', 'Eterna Mobile App - Left View')}
                    style={{ cursor: 'pointer' }}
                    title={isEs ? 'Ampliar pantalla móvil' : 'Inspect mobile screen'}
                  >
                    <div className="device-shell">
                      <img 
                        src="/images/products/eterna/img_hero_movil_2.png" 
                        alt="Eterna Mobile App Screen 2" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>

                  {/* Center Web App Desktop Screen */}
                  <div 
                    className="eterna-floating-device-center"
                    onClick={() => handleOpenModal('/images/products/eterna/img_hero_eterna2_en.png', 'Eterna DX Web Platform (English)')}
                    style={{ cursor: 'pointer' }}
                    title={isEs ? 'Ampliar plataforma web' : 'Inspect web platform'}
                  >
                    <img 
                      src="/images/products/eterna/img_hero_eterna2_en.png" 
                      alt="Eterna DX Web App Interface (English)" 
                    />
                  </div>

                  {/* Right Mobile (+13deg) */}
                  <div 
                    className="eterna-floating-device-right"
                    onClick={() => handleOpenModal('/images/products/eterna/img_hero_movil.png', 'Eterna Mobile App - Right View')}
                    style={{ cursor: 'pointer' }}
                    title={isEs ? 'Ampliar pantalla móvil' : 'Inspect mobile screen'}
                  >
                    <div className="device-shell">
                      <img 
                        src="/images/products/eterna/img_hero_movil.png" 
                        alt="Eterna Mobile App Screen 1" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Main Copy */}
                <h1 className="eterna-hero-h1">
                  {isEs ? (
                    <>Tu ADN es el mapa. <span className="mint-accent">Tu reloj, tu brújula.</span></>
                  ) : (
                    <>Your DNA is the map. <span className="mint-accent">Your watch, your compass.</span></>
                  )}
                </h1>

                <p className="eterna-hero-desc">
                  {isEs 
                    ? 'La única plataforma que reúne tu genética, proteínas, analíticas y wearable para mostrarte tus datos biológicos de forma clara y organizada.' 
                    : 'The only platform that brings together your genetics, proteins, analytics and wearable to show you your biological data clearly and in an organized way.'}
                </p>

                {/* CTAs (Strictly No Prices - Google Cloud UX) */}
                <div className="eterna-hero-cta-group">
                  <button
                    type="button"
                    className="gcp-btn-primary"
                    onClick={() => setIsInquiryDrawerOpen(true)}
                  >
                    <span>{isEs ? 'Solicitar test genético' : 'Request your genetic test'}</span>
                    <ArrowRight size={15} />
                  </button>
                  
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => scrollToSection('como-funciona')}
                  >
                    <span>{isEs ? 'Cómo funciona' : 'How it works'}</span>
                    <ChevronRight size={15} />
                  </button>
                </div>

                <div className="eterna-social-proof">
                  <span>{isEs ? '+74.500 personas midiendo su biología' : '+74,500 people measuring their biology'}</span>
                </div>
              </section>

              {/* ── 2. Infinite Compatible Wearables Marquee ── */}
              <section className="eterna-wearables-section">
                <div className="eterna-wearables-label">
                  {isEs ? 'Compatible con' : 'Compatible with'}
                </div>
                
                <div className="eterna-marquee-wrapper">
                  <div className="eterna-marquee-track">
                    {/* Render twice for seamless continuous loop */}
                    {[...wearableLogos, ...wearableLogos, ...wearableLogos].map((item, idx) => (
                      <div key={idx} className="eterna-wearable-item" title={item.name}>
                        <img src={item.src} alt={item.name} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ── 3. Key Metric Stat Counters (692K+ / 88%) ── */}
              <section className="eterna-stats-section">
                <div className="eterna-stat-box">
                  <div className="eterna-stat-value amber">692K+</div>
                  <div className="eterna-stat-title">
                    {isEs ? 'polimorfismos analizados' : 'polymorphisms analyzed'}
                  </div>
                  <div className="eterna-stat-sub">
                    {isEs ? 'en cada test genético' : 'in each genetic test'}
                  </div>
                </div>

                <div className="eterna-stat-box">
                  <div className="eterna-stat-value mint">88%</div>
                  <div className="eterna-stat-title">
                    {isEs ? 'desconoce su perfil genético' : 'unaware of their genetic profile'}
                  </div>
                  <div className="eterna-stat-sub">
                    {isEs ? 'de salud personal' : 'personal health'}
                  </div>
                </div>
              </section>

              {/* ── Executive Summary & Direct Jump Directory (Google Cloud UX) ── */}
              <div className="eterna-sidebar-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--gcp-blue-light)" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gcp-blue-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {isEs ? 'Directorio de Secciones de la Plataforma' : 'Platform Clinical Directory'}
                    </span>
                  </div>
                  <span className="gcp-badge green" style={{ fontSize: '0.72rem' }}>
                    CE-IVDR Accredited
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gcp-text-primary)', margin: '0 0 0.5rem 0' }}>
                  {isEs ? 'Arquitectura de Datos Genómicos & Monografías ETERNA DX' : 'Genomic Data Architecture & ETERNA DX Monograph'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--gcp-text-secondary)', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                  {isEs 
                    ? 'Haz clic en cualquiera de las secciones técnicas a continuación para visualizarla en pantalla completa o utiliza la barra de pestañas superior y el menú lateral.' 
                    : 'Click any of the technical sections below to inspect it in isolated view, or use the top tabs and right sidebar navigation.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {eternaSections.filter(s => s.id !== 'overview').map((sec, idx) => {
                    const IconComp = sec.icon || Sparkles;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        role="button"
                        tabIndex={0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1.15rem',
                          background: 'var(--gcp-surface)',
                          border: '1px solid var(--gcp-border)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gcp-blue-light)';
                          e.currentTarget.style.backgroundColor = 'var(--gcp-surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--gcp-border)';
                          e.currentTarget.style.backgroundColor = 'var(--gcp-surface)';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 24,
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--gcp-text-muted)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            fontFamily: 'monospace'
                          }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '4px',
                            background: 'var(--gcp-blue-surface)',
                            color: 'var(--gcp-blue-light)'
                          }}>
                            <IconComp size={15} />
                          </span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gcp-text-primary)' }}>
                              {sec.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gcp-text-secondary)', marginTop: '2px' }}>
                              {sec.id === 'biometrics' && (isEs ? 'Telemetría de smartwatch, ritmo de envejecimiento y biomarcadores' : 'Smartwatch telemetry, pace of aging, and live biomarker clocks')}
                              {sec.id === 'pilares' && (isEs ? 'Deporte, Nutrición, Prevención, Longevidad y Bienestar celular' : 'Sport, Nutrition, Prevention, Longevity, and Emotional wellbeing')}
                              {sec.id === 'snp-table' && (isEs ? 'Base de datos de polimorfismos y marcadores genéticos clave' : 'Actionable SNP database, dbSNP loci, and Illumina assay data')}
                              {sec.id === 'como-funciona' && (isEs ? 'Proceso clínico en 4 etapas desde la toma de saliva al informe' : '4-step clinical methodology from saliva collection to actionable app')}
                              {sec.id === 'investigacion' && (isEs ? 'Algoritmo epigenético patentado, calidad ISO y laboratorios Eurofins' : 'Proprietary epigenetic algorithm, ISO quality standards, and Eurofins lab')}
                              {sec.id === 'integracion' && (isEs ? 'Conexión directa con protocolos terapéuticos y péptidos regenerativos' : 'Direct synergy with personalized peptide and regenerative longevity stacks')}
                              {sec.id === 'productos' && (isEs ? 'Formatos individual, pack dúo y suite Eterna Pro para clínicas' : 'Individual kits, duo packs, and Eterna Pro B2B clinical allocation')}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gcp-blue-light)', fontSize: '0.76rem', fontWeight: 600 }}>
                          <span>{isEs ? 'Inspeccionar' : 'Inspect'}</span>
                          <ExternalLink size={13} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── Section: Biometrics & Wearables ── */}
          {effectiveActiveTab === 'biometrics' && (
            <section id="biometrics" className="eterna-biometrics-section">
              <div className="eterna-section-heading">
                <h2 className="eterna-section-h2">
                  {isEs ? (
                    <>Tu wearable te da datos. <span className="mint">Eterna te da respuestas.</span></>
                  ) : (
                    <>Your wearable gives you data. <span className="mint">Eterna gives you answers.</span></>
                  )}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Las apps de wearables muestran pasos, sueño y frecuencia cardíaca. Datos aislados sin contexto biológico. Eterna integra toda tu información con tu genética y analíticas en una vista comprensiva y accionable.' 
                    : 'Wearable apps show steps, sleep and heart rate. Random data points with no biological context. Eterna brings all your data together with your genetics and lab tests into an organized, actionable view.'}
                </p>
              </div>

              {/* 3 Physical Phones with Real Biometric Telemetry */}
              <div className="eterna-phones-showcase">
                <div 
                  className="eterna-phone-card"
                  onClick={() => handleOpenModal('/images/products/eterna/biometrica1_en.jpg', 'Eterna App - Heart Rate & Pace of Aging')}
                  title={isEs ? 'Ampliar pantalla' : 'Inspect screen'}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/images/products/eterna/biometrica1_en.jpg" alt="Eterna Telemetry - Heart Rate & Pace of Aging" />
                </div>

                <div 
                  className="eterna-phone-card"
                  onClick={() => handleOpenModal('/images/products/eterna/biometrica2_en.jpg', 'Eterna App - Longitudinal Heart Rate Clocks')}
                  title={isEs ? 'Ampliar pantalla' : 'Inspect screen'}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/images/products/eterna/biometrica2_en.jpg" alt="Eterna Telemetry - Longitudinal Clocks" />
                </div>

                <div 
                  className="eterna-phone-card featured"
                  onClick={() => handleOpenModal('/images/products/eterna/biometrica5_en.jpg', 'Eterna App - Habits & Longevity Dashboard')}
                  title={isEs ? 'Ampliar pantalla destacada' : 'Inspect featured screen'}
                  style={{ cursor: 'pointer' }}
                >
                  <img src="/images/products/eterna/biometrica5_en.jpg" alt="Eterna Telemetry - Habits & Longevity Dashboard" />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <button
                  type="button"
                  className="gcp-btn-secondary"
                  onClick={() => setIsB2BPortalModalOpen(true)}
                >
                  <span>{isEs ? 'Explorar la app Eterna Diagnostics' : 'Discover the Eterna Diagnostics app'}</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </section>
          )}

          {/* ── Section: 5 Genomic Pillars ── */}
          {effectiveActiveTab === 'pilares' && (
            <section id="pilares" className="eterna-genetics-showcase">
              <div className="eterna-genetics-header">
                <div className="eterna-badge-kicker">
                  <Dna size={16} />
                  <span>{isEs ? 'Informe Genético' : 'Genetic Report'}</span>
                </div>
                
                <h3 className="eterna-section-h2" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)' }}>
                  {isEs ? (
                    <>Visualiza tu <span className="amber">Genética</span></>
                  ) : (
                    <>Visualize your <span className="amber">Genetics</span></>
                  )}
                </h3>

                <p className="eterna-section-p" style={{ fontSize: '0.88rem' }}>
                  {isEs 
                    ? 'Tu informe genético cuenta con 5 secciones principales. Cada bloque agrupa los marcadores analizados para que interpretes tu ADN de manera visual e intuitiva.' 
                    : 'Your Genetics report has 5 main sections. Each section brings together the markers analysed so you can see your DNA information clearly and visually.'}
                </p>
              </div>

              {/* 5 Pillars Selector Cards */}
              <div className="eterna-pillars-grid">
                {pillars.map((pillar) => {
                  const Icon = pillar.icon;
                  const isActive = activePillar === pillar.id;
                  return (
                    <div 
                      key={pillar.id}
                      className={`eterna-pillar-card ${isActive ? 'active' : ''}`}
                      onClick={() => setActivePillar(pillar.id)}
                    >
                      <div 
                        className="eterna-pillar-icon-wrap"
                        style={{
                          background: pillar.bg,
                          border: `1px solid ${pillar.border}`,
                          color: pillar.color,
                          boxShadow: isActive ? `0 0 16px ${pillar.bg}` : 'none'
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <h4 className="eterna-pillar-title">{pillar.title}</h4>
                      <p className="eterna-pillar-desc">{pillar.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Real Genetic Profile vs Detailed Markers 2-Column Demo */}
              <div className="eterna-profile-demo-grid">
                
                {/* Column A: Your Genetic Profile (Real User Profile) */}
                <div className="eterna-profile-box">
                  <div className="eterna-box-header">
                    <div className="eterna-box-icon" style={{ background: 'var(--gcp-blue-surface)', border: '1px solid rgba(138, 180, 248, 0.3)', color: 'var(--gcp-blue-light)' }}>
                      <BarChart3 size={18} />
                    </div>
                    <h4 className="eterna-box-title">{isEs ? 'Tu perfil genético' : 'Your genetic profile'}</h4>
                  </div>
                  
                  <div className="eterna-box-subtitle">
                    {isEs ? 'Este es el perfil de un usuario real. El tuyo puede sorprenderte.' : "This is a real user's profile. Yours might surprise you."}
                  </div>

                  <div className="eterna-traits-group">
                    <div className="eterna-trait-category">{isEs ? 'Deporte & Rendimiento' : 'Sport'}</div>
                    <div className="eterna-trait-question">{isEs ? '¿Tu cuerpo está diseñado para resistir o para explotar?' : 'Is your body built to endure or to explode?'}</div>
                    <div className="eterna-trait-list">
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Capacidad aeróbica y VO2 Max' : 'Your aerobic endurance'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Fuerza isométrica y potencia' : 'Your strength and power'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Velocidad de recuperación muscular' : 'Your recovery speed'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Tolerancia a cargas elevadas' : 'Your training load tolerance'}</div>
                    </div>
                  </div>

                  <div className="eterna-traits-group">
                    <div className="eterna-trait-category">{isEs ? 'Nutrición & Metabolismo' : 'Nutrition'}</div>
                    <div className="eterna-trait-question">{isEs ? 'Descubre si tu pauta alimentaria se adapta a tu genética.' : 'Find out if your diet is working for you.'}</div>
                    <div className="eterna-trait-list">
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Asimilación de vitamina D y B12' : 'Your vitamin uptake'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Procesamiento lipídico y grasas saturadas' : 'How you process fats'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Tolerancia a carbohidratos refinados' : 'How you tolerate different foods'}</div>
                    </div>
                  </div>

                  <div className="eterna-traits-group" style={{ marginBottom: 0 }}>
                    <div className="eterna-trait-category">{isEs ? 'Longevidad & Senescencia' : 'Longevity'}</div>
                    <div className="eterna-trait-question">{isEs ? '¿Cuál es tu potencial basal de juventud celular?' : 'How much cellular youth potential do you have?'}</div>
                    <div className="eterna-trait-list">
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Ritmo intrínseco de envejecimiento' : 'Your biological aging rate'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Eficiencia de reparación del ADN' : 'Your cellular repair capacity'}</div>
                    </div>
                  </div>
                </div>

                {/* Column B: Detailed Markers (ACTN3, CYP1A2) */}
                <div className="eterna-profile-box highlight">
                  <div className="eterna-box-header">
                    <div className="eterna-box-icon" style={{ background: 'var(--gcp-blue-surface)', border: '1px solid rgba(138, 180, 248, 0.3)', color: 'var(--gcp-blue-light)' }}>
                      <Microscope size={18} />
                    </div>
                    <h4 className="eterna-box-title">{isEs ? 'Marcadores detallados' : 'Detailed markers'}</h4>
                  </div>

                  <div className="eterna-box-subtitle">
                    {isEs ? 'Algunos de los marcadores clave analizados en tu secuenciación.' : 'Some of the primary markers your genetic test analyses.'}
                  </div>

                  {/* Marker 1: ACTN3 */}
                  <div className="eterna-marker-card">
                    <h5 className="eterna-marker-h5">
                      {isEs ? '¿Entrenas a favor o en contra de tu genética?' : 'Are you training for your body or against it?'}
                    </h5>
                    <span className="eterna-marker-gene-badge">Gene · ACTN3 (rs1815739)</span>
                    <p className="eterna-marker-desc">
                      {isEs 
                        ? 'Esta variante determina la presencia de alfa-actinina-3 en fibras musculares rápidas, asociada en literatura a perfiles de fuerza explosiva y sprints.' 
                        : 'This variant is associated in the literature with an explosive strength and fast-twitch power profile.'}
                    </p>
                    <div className="eterna-marker-insight">
                      <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        {isEs 
                          ? 'Con este genotipo, el trabajo de fuerza pesada, pliometría y aceleraciones ofrece máxima adaptación fisiológica.' 
                          : 'With this profile, high-load resistance training and sprints tend to yield optimal adaptations.'}
                      </span>
                    </div>
                  </div>

                  {/* Marker 2: CYP1A2 */}
                  <div className="eterna-marker-card" style={{ marginBottom: 0 }}>
                    <h5 className="eterna-marker-h5">
                      {isEs ? '¿Por qué el café te afecta de forma distinta?' : 'Why does coffee hit you differently?'}
                    </h5>
                    <span className="eterna-marker-gene-badge">Gene · CYP1A2 (rs762551)</span>
                    <p className="eterna-marker-desc">
                      {isEs 
                        ? 'Regula la enzima hepática citocromo P450 encargada del 95% del aclaramiento de cafeína en sangre (metabolizador rápido vs lento).' 
                        : 'Governs the liver enzyme responsible for 95% of caffeine clearance from your circulation.'}
                    </p>
                    <div className="eterna-marker-insight">
                      <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        {isEs 
                          ? 'Metabolizador rápido: la cafeína actúa como un ergogénico potente sin alterar la calidad del sueño nocturno.' 
                          : 'Rapid metabolizer: caffeine functions as an effective performance aid without degrading deep sleep architecture.'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* ── Section: Key Genomic Variants & dbSNP Registry ── */}
          {effectiveActiveTab === 'snp-table' && (
            <section id="snp-table" className="eterna-snp-section" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
              <div className="eterna-snp-table-card">
                <div className="eterna-snp-table-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={16} color="var(--gcp-blue-light)" />
                      <strong style={{ fontSize: '0.95rem', color: 'var(--gcp-text-primary)' }}>
                        {isEs ? 'Registro de Variantes Genómicas & SNPs Clave' : 'Key Genomic Variants & dbSNP Registry'}
                      </strong>
                      <span style={{ fontSize: '0.72rem', background: 'var(--gcp-blue-surface)', color: 'var(--gcp-blue-light)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {filteredSnps.length} SNPs
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--gcp-text-muted)', marginTop: '4px' }}>
                      {isEs 
                        ? 'Polimorfismos clínicamente accionables analizados en la secuenciación Illumina Infinium GSA' 
                        : 'Clinically actionable polymorphisms genotyped via Illumina Infinium GSA assay'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Pillar filter */}
                    <select
                      value={selectedPillarFilter}
                      onChange={(e) => setSelectedPillarFilter(e.target.value)}
                      style={{
                        background: 'var(--gcp-surface)',
                        border: '1px solid var(--gcp-border)',
                        color: 'var(--gcp-text-primary)',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontFamily: 'inherit',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">{isEs ? 'Todos los Dominios (5)' : 'All Domains (5)'}</option>
                      <option value="sport">{isEs ? 'Deporte & Fuerza' : 'Sport & Performance'}</option>
                      <option value="nutrition">{isEs ? 'Nutrición & Metabolismo' : 'Nutrition & Metabolism'}</option>
                      <option value="prevention">{isEs ? 'Prevención Cardiovascular' : 'Cardiovascular Prevention'}</option>
                      <option value="longevity">{isEs ? 'Longevidad & Senescencia' : 'Longevity & Autophagy'}</option>
                      <option value="social">{isEs ? 'Bienestar & Sueño' : 'Wellbeing & Sleep'}</option>
                    </select>

                    {/* Search input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--gcp-text-muted)' }} />
                      <input
                        type="text"
                        value={snpSearch}
                        onChange={(e) => setSnpSearch(e.target.value)}
                        placeholder={isEs ? 'Buscar gen o rsID...' : 'Search gene or rsID...'}
                        style={{
                          background: 'var(--gcp-surface)',
                          border: '1px solid var(--gcp-border)',
                          color: 'var(--gcp-text-primary)',
                          borderRadius: '4px',
                          padding: '6px 10px 6px 30px',
                          fontSize: '0.78rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          width: '180px'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="eterna-table-container">
                  <DataTable
                    columns={snpColumns}
                    data={filteredSnps}
                    keyField="id"
                    emptyMessage={isEs ? 'No se encontraron variantes que coincidan con la búsqueda.' : 'No genetic variants matching filter criteria.'}
                  />
                </div>

                <div style={{ padding: '8px 14px', background: 'var(--gcp-surface-card)', borderTop: '1px solid var(--gcp-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--gcp-text-muted)' }}>
                  <span>{isEs ? 'Base de Referencia: GRCh38 / Ensembl dbSNP 155' : 'Reference Genome: GRCh38 / Ensembl dbSNP 155'}</span>
                  <span style={{ fontFamily: 'ui-monospace, monospace' }}>Illumina Infinium Global Screening Array v3.0</span>
                </div>
              </div>
            </section>
          )}

          {/* ── Section: How It Works (4-Step Process) ── */}
          {effectiveActiveTab === 'como-funciona' && (
            <section id="como-funciona" className="eterna-process-section">
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <Clock size={15} />
                  <span>{isEs ? 'Metodología' : 'Process'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? 'Cómo funciona' : 'How it works'}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Desde una toma de saliva no invasiva hasta decisiones que transforman tu salud celular y longevidad.' 
                    : 'From a non-invasive saliva sample to decisions that change your health and biological age trajectory.'}
                </p>
              </div>

              <div className="eterna-process-grid">
                {processSteps.map((stepItem, idx) => (
                  <div key={idx} className="eterna-process-card">
                    <div className="eterna-process-icon-box">
                      <img src={stepItem.icon} alt={stepItem.title} />
                    </div>
                    <div className="eterna-process-step-num">{stepItem.step}</div>
                    <h3 className="eterna-process-card-h3">{stepItem.title}</h3>
                    <p className="eterna-process-card-p">{stepItem.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <button
                  type="button"
                  className="gcp-btn-primary"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                >
                  <span>{isEs ? 'Solicitar Kit · Envío Incluido' : 'Request Kit · Shipping Included'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </section>
          )}

          {/* ── Section: Scientific Quality & Backing ── */}
          {effectiveActiveTab === 'investigacion' && (
            <section id="investigacion" className="eterna-science-section">
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <ShieldCheck size={16} />
                  <span>{isEs ? 'Respaldo Científico' : 'Scientific Backing'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? 'Investigación propia y rigor molecular' : 'In-house research'}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Desarrollamos ciencia traslacional avanzada para ofrecerte respuestas reproducibles, validadas y clínicamente contrastadas.' 
                    : 'We develop advanced multi-omics science to give you reliable, reproducible and actionable clinical answers.'}
                </p>
              </div>

              {/* Stacked lines instead of cards for 3 items (Golden Rule) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{
                  background: 'var(--gcp-surface)',
                  border: '1px solid var(--gcp-border)',
                  borderRadius: '6px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div className="eterna-science-card-icon" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <Activity size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 className="eterna-science-card-title" style={{ margin: 0, fontSize: '0.95rem' }}>
                        {isEs ? 'Fundamento Científico' : 'Scientific foundation'}
                      </h3>
                      <span className="gcp-badge blue" style={{ fontSize: '0.72rem' }}>PATENTED ALGORITHM</span>
                    </div>
                    <p className="eterna-science-card-text" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {isEs 
                        ? 'Algoritmo proteómico y epigenético propietario patentado. Desarrollado en colaboración directa con departamentos de genética de universidades europeas líderes.' 
                        : 'Proprietary patented proteomic and epigenetic algorithms developed in direct collaboration with European university genomics faculties.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'var(--gcp-surface)',
                  border: '1px solid var(--gcp-border)',
                  borderRadius: '6px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div className="eterna-science-card-icon" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <Dna size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 className="eterna-science-card-title" style={{ margin: 0, fontSize: '0.95rem' }}>
                        {isEs ? 'Trayectoria e I+D' : 'Scientific track record'}
                      </h3>
                      <span className="gcp-badge amber" style={{ fontSize: '0.72rem' }}>MULTIDISCIPLINARY R&D</span>
                    </div>
                    <p className="eterna-science-card-text" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {isEs 
                        ? 'Equipo multidisciplinar de biólogos moleculares, bioinformáticos y clínicos especializados en biomarcadores de senescencia celular y medicina de precisión.' 
                        : 'Multidisciplinary research consortium of molecular biologists, bioinformaticians and clinicians specialized in senescence biomarkers.'}
                    </p>
                  </div>
                </div>

                <div style={{
                  background: 'var(--gcp-surface)',
                  border: '1px solid var(--gcp-border)',
                  borderRadius: '6px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div className="eterna-science-card-icon" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <Layers size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 className="eterna-science-card-title" style={{ margin: 0, fontSize: '0.95rem' }}>
                        {isEs ? 'Kit Certificado CE-IVD' : 'Certified collection kit'}
                      </h3>
                      <span className="gcp-badge green" style={{ fontSize: '0.72rem' }}>CE-IVD BUFFER 24M</span>
                    </div>
                    <p className="eterna-science-card-text" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {isEs 
                        ? 'Dispositivo de recolección de saliva certificado CE-IVD con buffer estabilizador a temperatura ambiente (estable hasta 24 meses sin degradación).' 
                        : 'CE-IVD marked sample collection kit with room-temperature preservative buffer preserving nucleic acid integrity up to 24 months.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Standard Badges */}
              <div className="eterna-cert-badges-row">
                <div className="eterna-cert-pill">
                  <ShieldCheck size={14} color="#81c995" />
                  <span>ISO 13485:2016 {isEs ? 'Dispositivos de Diagnóstico' : 'Medical Devices'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <ShieldCheck size={14} color="#81c995" />
                  <span>ISO 9001:2015 {isEs ? 'Gestión de Calidad' : 'Quality Management'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <CheckCircle2 size={14} color="#8ab4f8" />
                  <span>Illumina Infinium GSA {isEs ? 'Tecnología de Secuenciación' : 'Genotyping Array'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <CheckCircle2 size={14} color="#8ab4f8" />
                  <span>{isEs ? '100% Conforme GDPR · Datos Encriptados' : '100% GDPR Compliant · Encrypted'}</span>
                </div>
              </div>

              {/* Medical Disclaimer Note */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--gcp-text-muted)', maxWidth: '780px', margin: '1.5rem auto 0' }}>
                {isEs 
                  ? 'Información importante: Esta prueba proporciona información de bienestar genético y no constituye un diagnóstico médico sustitutivo de la valoración de un profesional de la salud colegiado.' 
                  : 'Important notice: This test provides personalized genetic wellness intelligence and does not replace medical diagnosis by a licensed healthcare professional.'}
              </div>
            </section>
          )}

          {/* ── Section: Clinical Protocol Integration ── */}
          {effectiveActiveTab === 'integracion' && (
            <section id="integracion" className="eterna-integration-section" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <Activity size={15} />
                  <span>{isEs ? 'Medicina Traslacional' : 'Translational Medicine'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? 'Integración Directa con Protocolos Clínicos' : 'Direct Integration with Clinical Protocols'}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Los hallazgos del test Eterna no se quedan en datos teóricos. Se conectan directamente con protocolos peptídicos y de medicina regenerativa validados en la plataforma Atlas Health.' 
                    : 'Eterna DNA findings do not remain abstract data. They directly bridge to clinically validated peptide and longevity protocols within the Atlas Health ecosystem.'}
                </p>
              </div>

              {/* Stacked lines instead of cards for 3 items (Golden Rule) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
                <div style={{
                  background: 'var(--gcp-surface)',
                  border: '1px solid var(--gcp-border)',
                  borderRadius: '6px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">FOXO3 / SIRT1</span>
                      <StatusBadge status="active" />
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.95rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Senescencia & Autofagia' : 'Senescence & Autophagy Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Activación de telomerasa y reparación celular vía Epitalon + NAD+ bi-semanal con monitorización de longitud telomérica.' 
                        : 'Telomerase upregulation and DNA repair via bi-weekly Epitalon + NAD+ protocol guided by baseline senescence metrics.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge blue" style={{ fontSize: '0.74rem' }}>Epitalon + NAD+</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Consultar Protocolo' : 'Inquire Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--gcp-surface)',
                  border: '1px solid var(--gcp-border)',
                  borderRadius: '6px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">ACTN3 / MSTN</span>
                      <StatusBadge status="active" />
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.95rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo Musculoesquelético & Cargas' : 'Musculoskeletal Load Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Sinergia de reparación tisular con BPC-157 + TB-500 adaptada a la tasa intrínseca de daño muscular según alelo R577X.' 
                        : 'Targeted tissue repair synergy combining BPC-157 + TB-500 calibrated to individual mechanical muscle strain risk.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge green" style={{ fontSize: '0.74rem' }}>BPC-157 + TB-500</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Consultar Protocolo' : 'Inquire Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--gcp-surface)',
                  border: '1px solid var(--gcp-border)',
                  borderRadius: '6px',
                  padding: '1.15rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">CLOCK / PER2</span>
                      <StatusBadge status="active" />
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.95rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo Circadiano & Pineal' : 'Circadian & Pineal Optimization'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Regulación del eje hipotálamo-pineal mediante péptido inductor del sueño profundo (DSIP) y modulación de cronotipo.' 
                        : 'Hypothalamic-pineal regulation utilizing Deep Sleep Inducing Peptide (DSIP) aligned with circadian gene expression.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge amber" style={{ fontSize: '0.74rem' }}>DSIP Peptide</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Consultar Protocolo' : 'Inquire Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Section: Product Suite Catalog (STRICTLY NO PRICES) ── */}
          {effectiveActiveTab === 'productos' && (
            <section id="productos" className="eterna-catalog-section">
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <Package size={15} />
                  <span>{isEs ? 'Gama Eterna DX' : 'Product Suite'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? 'Elige cómo quieres comprender tu biología' : 'Choose how you want to understand your biology'}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Soluciones integrales de genómica y monitorización longitudinal para pacientes individuales, parejas y clínicas médicas.' 
                    : 'Comprehensive genomics and longitudinal monitoring solutions for individuals, families, and clinical practices.'}
                </p>
              </div>

              {/* 3 Tier Cards (Strictly No Prices - Google Cloud UX) */}
              <div className="eterna-tiers-grid">
                
                {/* Tier 1: Individual Kit */}
                <div className="eterna-tier-card">
                  <h3 className="eterna-tier-title">{isEs ? 'Test Genético Individual' : 'Individual Genetic Test'}</h3>
                  <div className="eterna-tier-subtitle">
                    {isEs ? 'Analiza tu ADN una sola vez en la vida con acceso continuo a la plataforma.' : 'Analyze your DNA once in a lifetime with continuous telemetry access.'}
                  </div>
                  <ul className="eterna-tier-features">
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? '1 Kit de toma de saliva CE-IVD' : '1 CE-IVD Saliva collection kit'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? '+700.000 variantes genéticas analizadas' : '+700,000 genetic SNPs analyzed'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Informe interactivo en app de por vida' : 'Lifetime interactive report in app'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Descarga de datos brutos (.raw / .txt)' : 'Downloadable raw data (.raw / .txt)'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Envío y recogida a domicilio incluidos' : 'Home delivery and pickup included'}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="gcp-btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setIsInquiryDrawerOpen(true)}
                  >
                    <Package size={15} />
                    <span>{isEs ? 'Solicitar Kit Individual' : 'Request Individual Kit'}</span>
                  </button>
                </div>

                {/* Tier 2: Pack Dúo (Featured) */}
                <div className="eterna-tier-card featured">
                  <span className="eterna-tier-badge">{isEs ? 'Más Solicitado' : 'Most Popular'}</span>
                  <h3 className="eterna-tier-title">{isEs ? 'Pack Dúo' : 'Duo Pack'}</h3>
                  <div className="eterna-tier-subtitle">
                    {isEs ? '2 kits completos de toma de saliva con analítica independiente para cada usuario.' : '2 complete saliva kits with separate independent genomic reports for each person.'}
                  </div>
                  <ul className="eterna-tier-features">
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? '2 Kits de recolección de saliva' : '2 Saliva collection kits included'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Cuentas independientes en App Eterna' : 'Independent accounts in Eterna App'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Sincronización simultánea de wearables' : 'Simultaneous wearable smartwatch syncing'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Secuenciación Illumina Eurofins completa' : 'Full Illumina Eurofins sequencing'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Soporte prioritario de interpretación' : 'Priority clinical support'}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="gcp-btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => setIsInquiryDrawerOpen(true)}
                  >
                    <Package size={15} />
                    <span>{isEs ? 'Solicitar Pack Dúo' : 'Request Duo Pack'}</span>
                  </button>
                </div>

                {/* Tier 3: Eterna Pro Longitudinal */}
                <div className="eterna-tier-card">
                  <h3 className="eterna-tier-title">{isEs ? 'Eterna Pro (Clínicas & Médicos)' : 'Eterna Pro (Clinical Practice)'}</h3>
                  <div className="eterna-tier-subtitle">
                    {isEs ? 'Monitorización longitudinal de edad biológica y telemetría médica en el tiempo.' : 'Longitudinal biological age tracking & multi-omics telemetry over time.'}
                  </div>
                  <ul className="eterna-tier-features">
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Re-tests periódicos de tasa de envejecimiento' : 'Periodic pace of aging re-testing'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Panel proteómico de órganos vitales' : 'Vital organ proteomics panel'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Portal B2B de gestión de pacientes' : 'B2B physician patient portal'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Protocolos de longevidad personalizados' : 'Personalized longevity protocols'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Asignación institucional por lote' : 'Institutional volume batch pricing'}</span>
                    </li>
                  </ul>
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => setIsInquiryDrawerOpen(true)}
                  >
                    <ExternalLink size={15} />
                    <span>{isEs ? 'Consultar Asignación B2B' : 'Consult B2B Allocation'}</span>
                  </button>
                </div>

              </div>

              {/* Institutional Backing / Partner Seals */}
              <div className="eterna-partners-section">
                <div className="eterna-partners-label">
                  {isEs ? 'Con el respaldo institucional y financiación de' : 'Institutional Backing & Funding'}
                </div>
                <div className="eterna-partners-row">
                  <img 
                    src="/images/products/eterna/gijon_impulsa.jpg" 
                    alt="Gijón Impulsa" 
                    className="eterna-partner-badge" 
                  />
                  <img 
                    src="/images/products/eterna/gijon_futuro.jpg" 
                    alt="Gijón Futuro" 
                    className="eterna-partner-badge" 
                  />
                  <img 
                    src="/images/products/eterna/enisa_logo.jpg" 
                    alt="Empresa Innovadora ENISA - Gobierno de España" 
                    className="eterna-partner-badge" 
                  />
                </div>
              </div>
            </section>
          )}

          {/* Product Section Footer Navigation (Golden Rule) */}
          {effectiveActiveTab !== 'overview' && (
            <ProductSectionFooterNav
              activeSection={effectiveActiveTab}
              sections={eternaSections}
              onSelectSection={scrollToSection}
              lang={lang}
            />
          )}

        </main>

        {/* ====================================================================
            RIGHT COLUMN: Sticky Institutional & Clinical Sidebar Console
           ==================================================================== */}
        <aside className="eterna-sticky-sidebar">
          
          {/* Card 1: Clinical Console & Order CTAs (Strictly No Prices - Google Cloud UX) */}
          <div className="eterna-sidebar-card">
            <div className="eterna-sidebar-header">
              <div className="eterna-sidebar-brand">
                ETERNA <span>DX</span>
              </div>
              <span className="gcp-badge green">
                <span className="gcp-badge-dot" />
                CE-IVD
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--gcp-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {isEs 
                ? 'Plataforma oficial de genómica, telemetría y biomarcadores de longevidad.' 
                : 'Official precision genomics, wearable telemetry, and epigenetic longevity platform.'}
            </div>

            {/* Active Batch Box (Copy-on-Click - Golden Rule #11) */}
            <div className="eterna-sidebar-batch-box">
              <span className="eterna-batch-label">{isEs ? 'Lote de Laboratorio:' : 'Lab Batch:'}</span>
              <CopyableId value={effectiveBatchCode} />
            </div>

            {/* Sidebar CTAs (NO PRICES - Google Cloud UX) */}
            <div className="eterna-sidebar-actions">
              <button
                type="button"
                className="gcp-btn-primary"
                style={{ width: '100%' }}
                onClick={() => setIsInquiryDrawerOpen(true)}
              >
                <Package size={16} />
                <span>{isEs ? 'Solicitar Kit / Pedido Clínico' : 'Request Kit / Clinical Inquiry'}</span>
              </button>

              <a
                href="/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="gcp-btn-secondary"
                style={{ width: '100%' }}
              >
                <Download size={15} />
                <span>{isEs ? 'Informe de Muestra (PDF · 34 Págs)' : 'Sample Report (PDF · 34 Pgs)'}</span>
              </a>

              <button
                type="button"
                className="gcp-btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setIsB2BPortalModalOpen(true)}
              >
                <ExternalLink size={15} />
                <span>{isEs ? 'Demo Portal Clínico B2B' : 'B2B Clinical Portal Demo'}</span>
              </button>
            </div>

            {/* Technical Specifications */}
            <div className="eterna-sidebar-specs-list">
              <div className="eterna-sidebar-spec-row">
                <span className="label">{isEs ? 'Muestra:' : 'Sample:'}</span>
                <span className="value">{isEs ? 'Saliva (No invasiva)' : 'Saliva (Needle-Free)'}</span>
              </div>
              <div className="eterna-sidebar-spec-row">
                <span className="label">{isEs ? 'Buffer:' : 'Buffer:'}</span>
                <span className="value">{isEs ? 'Estable a Tª ambiente (24m)' : 'Ambient Stable (24 Mo)'}</span>
              </div>
              <div className="eterna-sidebar-spec-row">
                <span className="label">{isEs ? 'Genotipado:' : 'Genotyping:'}</span>
                <span className="value">Illumina Infinium GSA</span>
              </div>
              <div className="eterna-sidebar-spec-row">
                <span className="label">{isEs ? 'Plazo informe:' : 'Turnaround:'}</span>
                <span className="value">{isEs ? '2 - 3 Semanas' : '2 - 3 Weeks'}</span>
              </div>
              <div className="eterna-sidebar-spec-row">
                <span className="label">{isEs ? 'Laboratorio:' : 'Laboratory:'}</span>
                <span className="value">Eurofins (ISO 15189 / 17025)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Jump Navigation */}
          <div className="eterna-sidebar-card" style={{ padding: '1.25rem 1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gcp-text-primary)', marginBottom: '0.75rem' }}>
              {isEs ? 'Navegación Rápida' : 'Quick Navigation'}
            </div>
            <div className="eterna-sidebar-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {eternaSections.map((sec) => {
                const isActive = effectiveActiveTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    className={`eterna-sidebar-nav-link ${isActive ? 'active' : ''}`}
                    style={{
                      background: isActive ? 'var(--gcp-blue-surface)' : 'transparent',
                      border: isActive ? '1px solid rgba(138, 180, 248, 0.4)' : '1px solid transparent',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: isActive ? 'var(--gcp-blue-light)' : 'var(--gcp-text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => scrollToSection(sec.id)}
                  >
                    <ChevronRight size={14} color={isActive ? 'var(--gcp-blue-light)' : 'var(--gcp-text-muted)'} />
                    <span style={{ fontSize: '0.78rem' }}>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

      </div>

      {/* ── High-Resolution Image Inspection Modal ── */}
      {isImageModalOpen && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={modalImage.src}
          altText={modalImage.title || "ETERNA DX Showcase Image"}
        />
      )}

      {/* ── Institutional Inquiry Drawer (Strictly No Prices) ── */}
      {isInquiryDrawerOpen && (
        <PublicInstitutionalInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          product={{
            name,
            slug,
            batch: effectiveBatchCode,
            supplierName: 'ETERNA DX · Eurofins Lab',
            presentation: 'Saliva Collection Kit'
          }}
          lang={lang}
        />
      )}

      {/* ── Share Monograph Drawer ── */}
      {isShareDrawerOpen && (
        <ShareProductMonographDrawer
          isOpen={isShareDrawerOpen}
          onClose={() => setIsShareDrawerOpen(false)}
          product={{
            name,
            slug,
            category: 'Precision Genomics & Epigenetics',
            supplierName: 'ETERNA Diagnostics · Eurofins Lab'
          }}
          lang={lang}
        />
      )}

      {/* ── Live Eterna B2B Portal Demo Modal ── */}
      {isB2BPortalModalOpen && (
        <div className="eterna-b2b-modal-overlay" onClick={() => setIsB2BPortalModalOpen(false)}>
          <div className="eterna-b2b-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="eterna-b2b-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gcp-blue-light)' }} />
                <strong style={{ color: 'var(--gcp-text-primary)', fontSize: '0.9rem' }}>
                  {isEs ? 'Eterna · Portal de Salud Preventiva (Demo B2B)' : 'Eterna · Preventive Health Clinic Portal (Live B2B Demo)'}
                </strong>
                <span style={{ fontSize: '0.72rem', background: 'var(--gcp-blue-surface)', color: 'var(--gcp-blue-light)', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                  INTERACTIVE B2B DEMO
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="/eterna/eterna-b2b-portal.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gcp-btn-secondary"
                  style={{ height: '30px', padding: '0 10px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ExternalLink size={12} />
                  <span>{isEs ? 'Abrir en pestaña completa' : 'Open in New Tab'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsB2BPortalModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src="/eterna/eterna-b2b-portal.html"
              title="Eterna B2B Preventive Clinic Portal Demo"
              className="eterna-b2b-modal-iframe"
            />
          </div>
        </div>
      )}

      {/* ── Google Cloud Console Standard Unified Footer ── */}
      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
