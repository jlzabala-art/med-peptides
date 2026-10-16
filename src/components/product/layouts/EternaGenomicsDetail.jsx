"use client";

import React, { useState } from 'react';
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
  ChevronDown
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import toast from 'react-hot-toast';
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
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: '', title: '' });

  const isEs = lang === 'es';

  // Identifiers
  const name = product.name || 'ETERNA® DNA & Epigenetic Longevity Platform';
  const effectiveBatchCode = initialBatch || product.batch || 'AS-ETR-EUR01-2610';

  const handleCopyBatch = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(effectiveBatchCode);
      setCopiedBatch(true);
      toast.success(isEs ? `Lote ${effectiveBatchCode} copiado ✓` : `Batch ${effectiveBatchCode} copied ✓`);
      setTimeout(() => setCopiedBatch(false), 2500);
    }
  };

  const handleOpenModal = (src, title) => {
    setModalImage({ src, title });
    setIsImageModalOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

      {/* Master 2-Column Responsive Layout with Sticky Right Sidebar */}
      <div className="eterna-master-layout">
        
        {/* ====================================================================
            LEFT / MAIN COLUMN: Exact Replica of Eterna DX Content & Experience
           ==================================================================== */}
        <main className="eterna-main-content">
          
          {/* ── 1. Hero Section: Tri-Device 3D Mockup ── */}
          <section id="inicio" className="eterna-hero-section">
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
                onClick={() => handleOpenModal('/images/products/eterna/img_hero_eterna2.png', 'Eterna DX Web Platform')}
                style={{ cursor: 'pointer' }}
                title={isEs ? 'Ampliar plataforma web' : 'Inspect web platform'}
              >
                <img 
                  src="/images/products/eterna/img_hero_eterna2.png" 
                  alt="Eterna DX Web App Interface" 
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

          {/* ── 4. Section: Your Wearable Gives Data. Eterna Gives Answers ── */}
          <section className="eterna-biometrics-section">
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
                onClick={() => handleOpenModal('/images/products/eterna/biometrica1.jpeg', 'Eterna App - Pace of Aging')}
                title={isEs ? 'Ampliar pantalla' : 'Inspect screen'}
                style={{ cursor: 'pointer' }}
              >
                <img src="/images/products/eterna/biometrica1.jpeg" alt="Biometric Telemetry 1" />
              </div>

              <div 
                className="eterna-phone-card"
                onClick={() => handleOpenModal('/images/products/eterna/biometrica2.jpeg', 'Eterna App - Longitudinal Clocks')}
                title={isEs ? 'Ampliar pantalla' : 'Inspect screen'}
                style={{ cursor: 'pointer' }}
              >
                <img src="/images/products/eterna/biometrica2.jpeg" alt="Biometric Telemetry 2" />
              </div>

              <div 
                className="eterna-phone-card featured"
                onClick={() => handleOpenModal('/images/products/eterna/biometrica5.jpeg', 'Eterna App - Biomarker Dashboard')}
                title={isEs ? 'Ampliar pantalla destacada' : 'Inspect featured screen'}
                style={{ cursor: 'pointer' }}
              >
                <img src="/images/products/eterna/biometrica5.jpeg" alt="Biometric Telemetry 5" />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setIsB2BPortalModalOpen(true)}
              >
                <span>{isEs ? 'Explorar la app Eterna Diagnostics' : 'Discover the Eterna Diagnostics app'}</span>
                <ExternalLink size={14} />
              </button>
            </div>

            {/* ── 5. Visualize Your Genetics & 5 Pillars ── */}
            <div className="eterna-genetics-showcase">
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
            </div>
          </section>

          {/* ── 6. Section: How It Works (4-Step Process with Official Icons) ── */}
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

          {/* ── 7. In-House Research & Scientific Quality ── */}
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

            <div className="eterna-science-cards-grid">
              <div className="eterna-science-card">
                <div className="eterna-science-card-icon">
                  <Activity size={22} />
                </div>
                <h3 className="eterna-science-card-title">
                  {isEs ? 'Fundamento Científico' : 'Scientific foundation'}
                </h3>
                <p className="eterna-science-card-text">
                  {isEs 
                    ? 'Algoritmo proteómico y epigenético propietario patentado. Desarrollado en colaboración directa con departamentos de genética de universidades europeas líderes.' 
                    : 'Proprietary patented proteomic and epigenetic algorithms developed in direct collaboration with European university genomics faculties.'}
                </p>
              </div>

              <div className="eterna-science-card">
                <div className="eterna-science-card-icon">
                  <Dna size={22} />
                </div>
                <h3 className="eterna-science-card-title">
                  {isEs ? 'Trayectoria e I+D' : 'Scientific track record'}
                </h3>
                <p className="eterna-science-card-text">
                  {isEs 
                    ? 'Equipo multidisciplinar de biólogos moleculares, bioinformáticos y clínicos especializados en biomarcadores de senescencia celular y medicina de precisión.' 
                    : 'Multidisciplinary research consortium of molecular biologists, bioinformaticians and clinicians specialized in senescence biomarkers.'}
                </p>
              </div>

              <div className="eterna-science-card">
                <div className="eterna-science-card-icon">
                  <Layers size={22} />
                </div>
                <h3 className="eterna-science-card-title">
                  {isEs ? 'Kit Certificado CE-IVD' : 'Certified collection kit'}
                </h3>
                <p className="eterna-science-card-text">
                  {isEs 
                    ? 'Dispositivo de recolección de saliva certificado CE-IVD con buffer estabilizador a temperatura ambiente (estable hasta 24 meses sin degradación).' 
                    : 'CE-IVD marked sample collection kit with room-temperature preservative buffer preserving nucleic acid integrity up to 24 months.'}
                </p>
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

          {/* ── 8. Product Suite Catalog (STRICTLY NO PRICES) ── */}
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

            {/* Active Batch Box (Copy-on-Click) */}
            <div className="eterna-sidebar-batch-box">
              <span className="eterna-batch-label">{isEs ? 'Lote de Laboratorio:' : 'Lab Batch:'}</span>
              <button 
                type="button"
                className="eterna-batch-code-btn"
                onClick={handleCopyBatch}
                title={isEs ? 'Copiar código de lote' : 'Copy batch code'}
              >
                <span>{effectiveBatchCode}</span>
                {copiedBatch ? <Check size={12} color="#81c995" /> : <Copy size={12} />}
              </button>
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
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.5rem' }}>
              {isEs ? 'Navegación Rápida' : 'Quick Navigation'}
            </div>
            <div className="eterna-sidebar-nav-list">
              <button 
                type="button" 
                className="eterna-sidebar-nav-link"
                style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => scrollToSection('inicio')}
              >
                <ChevronRight size={14} color="var(--gcp-blue-light)" />
                <span>{isEs ? 'Visión General & Mockup 3D' : 'Overview & 3D Mockup'}</span>
              </button>
              <button 
                type="button" 
                className="eterna-sidebar-nav-link"
                style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => scrollToSection('como-funciona')}
              >
                <ChevronRight size={14} color="var(--gcp-blue-light)" />
                <span>{isEs ? 'Proceso en 4 Pasos' : 'How It Works (4 Steps)'}</span>
              </button>
              <button 
                type="button" 
                className="eterna-sidebar-nav-link"
                style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => scrollToSection('investigacion')}
              >
                <ChevronRight size={14} color="var(--gcp-blue-light)" />
                <span>{isEs ? 'I+D Propio & Calidad ISO' : 'In-House Research & Quality'}</span>
              </button>
              <button 
                type="button" 
                className="eterna-sidebar-nav-link"
                style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                onClick={() => scrollToSection('productos')}
              >
                <ChevronRight size={14} color="var(--gcp-blue-light)" />
                <span>{isEs ? 'Gama de Tests & Asignación B2B' : 'Test Suite & B2B Allocation'}</span>
              </button>
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
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
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
    </div>
  );
}
