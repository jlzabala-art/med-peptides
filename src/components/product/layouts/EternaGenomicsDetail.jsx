"use client";

import React, { useState, useEffect } from 'react';
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
  HelpCircle,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  FileText,
  Lock,
  ChevronRight,
  ChevronLeft,
  Download,
  ExternalLink,
  X,
  Sparkle
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
import { useCart } from '@/context/CartProvider';
import toast from 'react-hot-toast';
import './EternaGenomicsDetail.css';

export default function EternaGenomicsDetail({
  product = {},
  slug = 'eterna-epigenetic-age-test',
  initialBatch = 'AS-ETR-EUR01-2610',
  initialStrength = '1 test / kit',
  baseUrl = 'https://med-peptides.com'
}) {
  // Default strictly to English as requested
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('patient-tracking');
  const [activePillar, setActivePillar] = useState('longevity');
  
  // Media Gallery State
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: '', title: '' });
  
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isB2BPortalModalOpen, setIsB2BPortalModalOpen] = useState(false);
  const [quantity] = useState(1);
  const [copiedBatch, setCopiedBatch] = useState(false);

  // Interactive Epigenetic Pace of Aging Simulator State
  const [simAge, setSimAge] = useState(48);
  const [simPace, setSimPace] = useState(0.82);
  const [simYears, setSimYears] = useState(3);

  const { updateCart } = useCart() || {};

  const isEs = lang === 'es';

  // Core identifiers
  const name = product.name || 'ETERNA® DNA & Epigenetic Longevity Test';
  const effectiveBatchCode = initialBatch || product.batch || 'AS-ETR-EUR01-2610';
  const price = product.price || product.min_unit_price || 199.00;
  const currency = product.currency || 'EUR';
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  // Original Media Showcase Items
  const galleryItems = [
    {
      src: '/images/products/eterna/eterna-kit-box.png',
      thumb: '/images/products/eterna/eterna-kit-box.png',
      tag: isEs ? 'Kit de Muestreo' : 'Sample Kit',
      title: isEs ? 'Caja Oficial del Kit de Saliva ETERNA® (CE-IVD)' : 'Official ETERNA® Saliva Collection Kit Box (CE-IVD)',
      desc: isEs ? 'Kit de recolección de saliva en 2 minutos con buffer estabilizador de ADN a temperatura ambiente.' : 'Non-invasive 2-minute saliva kit with ambient-stable DNA preservative buffer.'
    },
    {
      src: '/images/products/eterna/biometrica1.jpeg',
      thumb: '/images/products/eterna/biometrica1.jpeg',
      tag: isEs ? 'App: Tasa Envejecimiento' : 'App: Pace of Aging',
      title: isEs ? 'App ETERNA: Tasa de Envejecimiento Celular y Relojes Epigenéticos' : 'ETERNA App: Cellular Pace of Aging & Epigenetic Clocks',
      desc: isEs ? 'Seguimiento del ritmo biológico (0.82 años biológicos / año cronológico) y velocidad de senescencia.' : 'Real-time telemetry showing biological aging velocity (0.82 yrs/yr) and epigenetic deceleration.'
    },
    {
      src: '/images/products/eterna/biometrica2.jpeg',
      thumb: '/images/products/eterna/biometrica2.jpeg',
      tag: isEs ? 'App: Edad por Órganos' : 'App: Organ Age',
      title: isEs ? 'App ETERNA: Desglose de Edad Biológica por Sistemas y Órganos' : 'ETERNA App: Multi-Organ & System Biological Age Telemetry',
      desc: isEs ? 'Edad biológica funcional de cerebro, corazón, hígado, riñones y sistema inmune.' : 'Functional biological ages across brain, cardiovascular, hepatic, renal, and immune axes.'
    },
    {
      src: '/images/products/eterna/biometrica5.jpeg',
      thumb: '/images/products/eterna/biometrica5.jpeg',
      tag: isEs ? 'App: Telemetría Diaria' : 'App: Daily Telemetry',
      title: isEs ? 'App ETERNA: Telemetría Biométrica Continua y Sincronización con Wearables' : 'ETERNA App: Continuous Biometric Telemetry & Wearable Sync',
      desc: isEs ? 'Monitoreo 24/7 de variabilidad cardíaca (HRV), fases de sueño delta y carga de entrenamiento.' : '24/7 tracking of autonomic HRV, restorative slow-wave sleep, and lifestyle strain.'
    },
    {
      src: '/images/products/eterna/eterna-hero-app.png',
      thumb: '/images/products/eterna/eterna-hero-app.png',
      tag: isEs ? 'Portal Médico & Paciente' : 'Doctor & Patient Portal',
      title: isEs ? 'Portal Clínico ETERNA DX: Cuadro de Mando Integral' : 'ETERNA DX Clinical Portal: Comprehensive Longevity Dashboard',
      desc: isEs ? 'Integración clínica de genómica fija, proteómica dinámica y analíticas sanguíneas.' : 'Complete clinical integration linking static genetics, dynamic proteomics, and lab blood work.'
    }
  ];

  const currentMedia = galleryItems[selectedMediaIdx] || galleryItems[0];

  const handleOpenModal = (src, title) => {
    setModalImage({ src, title });
    setIsImageModalOpen(true);
  };

  const handleCopyBatch = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(effectiveBatchCode);
      setCopiedBatch(true);
      toast.success(isEs ? 'Código de lote copiado ✓' : 'Batch code copied ✓');
      setTimeout(() => setCopiedBatch(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (updateCart) {
      updateCart(name, quantity, {
        productId: product.id || slug,
        variantId: product.variants?.[0]?.id || 'var_eterna-epigenetic-test',
        name,
        price,
        presentation: 'kit',
        dose: initialStrength,
        batch: effectiveBatchCode,
        supplierId: 'supplier-etherna'
      });
      toast.success(
        isEs 
          ? `Añadido ${quantity} kit ETERNA® a la orden ✓` 
          : `Added ${quantity} ETERNA® kit to cart ✓`
      );
    }
  };

  // Nav tabs
  const tabs = [
    { id: 'patient-tracking', label: isEs ? 'App de Seguimiento del Paciente' : 'Patient Wellness App & Tracking', icon: TrendingUp },
    { id: 'sample-report', label: isEs ? 'Informe Clínico PDF (34 Páginas)' : 'Sample Clinical Report (34-Page PDF)', icon: FileText },
    { id: 'biological-age', label: isEs ? 'Edad Biológica & Algoritmo' : 'Biological Age & Epigenetic Clocks', icon: Clock },
    { id: 'five-pillars', label: isEs ? '5 Pilares Genómicos (+700K SNPs)' : '5 Genomic Pillars (+700K SNPs)', icon: Dna },
    { id: 'wearables-sync', label: isEs ? 'Integración Wearables' : 'Wearables Telemetry Integration', icon: Smartphone },
    { id: 'saliva-protocol', label: isEs ? 'Protocolo de Saliva (2 Min)' : '2-Min Saliva Protocol', icon: Layers },
    { id: 'traceability', label: isEs ? 'Acreditación Lab Eurofins' : 'Eurofins Lab Accreditation', icon: ShieldCheck },
    { id: 'companion-protocols', label: isEs ? 'Protocolos de Longevidad' : 'Companion Longevity Protocols', icon: FlaskConical }
  ];

  // Hash deep-linking
  useEffect(() => {
    const handleHashSync = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hashId = window.location.hash.replace('#', '');
        const validIds = ['patient-tracking', 'sample-report', 'biological-age', 'five-pillars', 'wearables-sync', 'saliva-protocol', 'traceability', 'companion-protocols'];
        if (validIds.includes(hashId)) {
          setActiveTab(hashId);
        }
      }
    };
    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${tabId}`);
    }
  };

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyNav = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') {
        setSelectedMediaIdx((prev) => (prev + 1) % galleryItems.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedMediaIdx((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
      }
    };
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [galleryItems.length]);

  // Epigenetic Pace of Aging Simulator Calculations
  const simBioYearsPassed = Math.round(simPace * simYears * 100) / 100;
  const simYearsSaved = Math.round((simYears - simBioYearsPassed) * 100) / 100;
  const simNewBioAge = Math.round((simAge - simYearsSaved) * 10) / 10;
  
  const simStatus = simPace < 0.92 
    ? { label: isEs ? 'Desaceleración Celular Óptima' : 'Optimal Cellular Deceleration', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', border: 'rgba(45, 212, 191, 0.4)' }
    : simPace <= 1.05
    ? { label: isEs ? 'Ritmo Poblacional Normal' : 'Standard Population Aging Rate', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.4)' }
    : { label: isEs ? 'Senescencia Celular Acelerada' : 'Accelerated Cellular Senescence', color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)' };

  // 5 Pillars Detailed Science
  const pillarsData = {
    longevity: {
      name: isEs ? 'Longevidad & Envejecimiento Celular' : 'Longevity & Cellular Aging',
      color: '#2dd4bf',
      summary: isEs
        ? 'Relojes epigenéticos de metilación (Horvath / Hannum), tasa de acortamiento telomérico, senescencia celular y activación de sirtuinas.'
        : 'Epigenetic DNA methylation clocks (Horvath / Hannum), telomere shortening velocity, cellular senescence and sirtuin activation.',
      genes: [
        {
          symbol: 'TERT & TERC',
          name: isEs ? 'Subunidad Catalítica de Telomerasa' : 'Telomerase Reverse Transcriptase',
          finding: isEs ? 'Genotipo concordante con protección telomérica superior al percentil 75.' : 'Favorable genotype associated with preserved telomere length.',
          action: isEs ? 'Protocolo semestral de bioregulador pineal (Epithalon) para mantener estabilidad cromosómica.' : 'Biannual pineal bioregulator (Epithalon) course to support telomeric stability.'
        },
        {
          symbol: 'FOXO3 (rs2802292)',
          name: isEs ? 'Eje de Longevidad Celular Humana' : 'Forkhead Box O3 Longevity Axis',
          finding: isEs ? 'Portador del alelo G protector contra la senescencia y apoptosis temprana.' : 'G-allele carrier associated with exceptional longevity & autophagic resilience.',
          action: isEs ? 'Activación de autofagia con ayuno intermitente y péptidos mitocondriales (MOTS-c).' : 'Autophagy enhancement with intermittent fasting and mitochondrial peptides (MOTS-c).'
        },
        {
          symbol: 'SIRT1 & PARP1',
          name: isEs ? 'Reparación de ADN & Dinámica NAD+' : 'DNA Repair & Sirtuin Tone',
          finding: isEs ? 'Cinética de recambio acelerado de coenzima NAD+ ante estrés oxidativo.' : 'Elevated NAD+ turnover rate requiring targeted sirtuin cofactor repletion.',
          action: isEs ? 'Repleción con precursores NAD+ / NMN para sostener la reparación génica.' : 'Optimized NAD+ / NMN replenishing therapy to sustain enzymatic repair.'
        }
      ]
    },
    nutrition: {
      name: isEs ? 'Nutrigenómica & Metabolismo' : 'Nutrigenomics & Metabolism',
      color: '#38bdf8',
      summary: isEs
        ? 'Cinética de depuración hepática de cafeína, conversión endógena de Omega-3 vegetal, ciclo de metilación y asimilación de vitaminas D y C.'
        : 'Caffeine clearance kinetics, plant Omega-3 EPA/DHA conversion, folate methylation cycle, and micronutrient transport.',
      genes: [
        {
          symbol: 'CYP1A2 (*1F)',
          name: isEs ? 'Citocromo de Metabolismo de Cafeína' : 'Hepatic Caffeine Metabolism',
          finding: isEs ? 'Metabolizador rápido: efecto ergogénico sin elevación de presión arterial.' : 'Fast metabolizer: significant ergogenic benefit without cardiovascular risk.',
          action: isEs ? 'Uso estratégico de cafeína pre-entrenamiento hasta 400 mg diarios.' : 'Strategic morning caffeine up to 400 mg without sleep latency disruption.'
        },
        {
          symbol: 'FADS1 / FADS2',
          name: isEs ? 'Desaturasas de Ácidos Grasos' : 'Fatty Acid Desaturase Cluster',
          finding: isEs ? 'Baja conversión de ALA (vegetal) a EPA/DHA biológicamente activos.' : 'Low endogenous conversion of plant ALA to active anti-inflammatory EPA/DHA.',
          action: isEs ? 'Suplementación obligatoria directa con Omega-3 marino triglicérido reesterificado (rTG).' : 'Direct marine re-esterified triglyceride (rTG) Omega-3 supplementation required.'
        },
        {
          symbol: 'MTHFR (C677T & A1298C)',
          name: isEs ? 'Metilentetrahidrofolato Reductasa' : 'Methylenetetrahydrofolate Reductase',
          finding: isEs ? 'Eficiencia enzimática al 65%: tendencia a homocisteína elevada.' : '65% enzymatic efficiency: predisposes to elevated plasma homocysteine.',
          action: isEs ? 'Prescripción de folato activo (L-Metilfolato 5-MTHF) y Metilcobalamina (B12).' : 'Prescribe bioavailable L-Methylfolate (5-MTHF) and Methylcobalamin (B12).'
        }
      ]
    },
    cardio: {
      name: isEs ? 'Prevención Cardiovascular' : 'Cardiovascular Genetics',
      color: '#f43f5e',
      summary: isEs
        ? 'Genotipo ApoE, riesgo genético de elevación de Lipoproteína(a), sensibilidad vascular a la sal y disfunción endotelial.'
        : 'ApoE lipid transport, genetic Lipoprotein(a) risk, endothelial nitric oxide synthase, and arterial stiffness.',
      genes: [
        {
          symbol: 'APOE (ε3/ε3)',
          name: isEs ? 'Genotipo de Apolipoproteína E' : 'Apolipoprotein E Isoforms',
          finding: isEs ? 'Alelo neutral/estándar: perfil aterogénico basal sin susceptibilidad ε4.' : 'Neutral baseline: standard lipid clearance without elevated Alzheimer/CAD risk.',
          action: isEs ? 'Monitoreo anual de partículas ApoB y mantenimiento de dieta normolipídica.' : 'Annual ApoB particle titration and cardioprotective Mediterranean diet.'
        },
        {
          symbol: 'LPA (rs10455872)',
          name: isEs ? 'Riesgo de Lipoproteína(a)' : 'Lipoprotein(a) Genetic Expression',
          finding: isEs ? 'Alelo normal sin sobreexpresión de partículas Lp(a) hiper-aterogénicas.' : 'Non-carrier for high-risk variants driving elevated Lipoprotein(a).',
          action: isEs ? 'Medición basal confirmatoria por ELISA una vez en la vida.' : 'Single lifetime baseline ELISA serum validation.'
        },
        {
          symbol: 'NOS3 (Glu298Asp)',
          name: isEs ? 'Óxido Nítrico Sintasa Endotelial' : 'Endothelial Nitric Oxide Synthase',
          finding: isEs ? 'Variante con reactividad endotelial y vasodilatación optimizada.' : 'Favorable microvascular perfusion and healthy arterial compliance.',
          action: isEs ? 'Soporte con precursores de óxido nítrico (L-Citrulina y nitratos naturales).' : 'Support with L-Citrulline and dietary nitrates for endothelial longevity.'
        }
      ]
    },
    sport: {
      name: isEs ? 'Deporte & Rendimiento Muscular' : 'Sport & Muscular Performance',
      color: '#c084fc',
      summary: isEs
        ? 'Ratio de fibras musculares de contracción rápida vs resistencia (ACTN3), elasticidad del colágeno tendinoso y tiempo de recuperación tisular.'
        : 'ACTN3 fast-twitch vs endurance fiber ratio, collagen elasticity in tendons/ligaments, and systemic post-exertion recovery.',
      genes: [
        {
          symbol: 'ACTN3 (R577X)',
          name: isEs ? 'Alfa-Actinina-3 Sarcomérica' : 'Sarcomeric Alpha-Actinin-3',
          finding: isEs ? 'Genotipo RR: 100% expresión de actina en fibras tipo IIx (fuerza y potencia pura).' : 'RR genotype: full alpha-actinin-3 expression in type IIx fast-twitch fibers.',
          action: isEs ? 'Capacidad élite para hipertrofia, sprints y levantamiento de alta intensidad.' : 'Elite adaptation for sprint, hypertrophy and explosive resistance training.'
        },
        {
          symbol: 'COL1A1 (Sp1 binding)',
          name: isEs ? 'Colágeno Tipo I Cadena Alfa 1' : 'Type I Alpha-1 Collagen Matrix',
          finding: isEs ? 'Mayor resistencia biomecánica en ligamentos con menor tasa de desgarro.' : 'Superior tensile ligament strength with reduced propensity for cruciate rupture.',
          action: isEs ? 'Sinergia preventiva con BPC-157 y Péptidos de Colágeno bioactivos.' : 'Preventive support with BPC-157 and bioactive hydrolyzed collagen peptides.'
        },
        {
          symbol: 'IL6 (rs1800795)',
          name: isEs ? 'Interleucina-6 & Respuesta Inflamatoria' : 'Interleukin-6 Exercise Response',
          finding: isEs ? 'Genotipo G/G: modulación balanceada de la inflamación muscular post-carga.' : 'G/G genotype: balanced inflammatory cascade following eccentric load.',
          action: isEs ? 'Ventana de descanso de 48h entre sesiones de máxima intensidad.' : 'Standard 48-hour recovery window between maximal eccentric loading.'
        }
      ]
    },
    chronobiology: {
      name: isEs ? 'Cronobiología & Arquitectura del Sueño' : 'Chronobiology & Sleep Architecture',
      color: '#fbbf24',
      summary: isEs
        ? 'Genética del cronotipo circadiano molecular (CLOCK), profundidad de sueño delta de ondas lentas y resiliencia emocional ante el estrés.'
        : 'Circadian CLOCK molecular chronotype, slow-wave delta sleep depth, and neurotransmitter stress resilience.',
      genes: [
        {
          symbol: 'CLOCK (rs1801260)',
          name: isEs ? 'Regulador Maestro Circadiano' : 'Circadian Locomotor Output Cycles',
          finding: isEs ? 'Cronotipo intermedio/matutino: pico de cortisol y agudeza cognitiva temprano.' : 'Intermediate/morning chronotype with early cortisol peak and peak AM focus.',
          action: isEs ? 'Exposición a luz solar antes de las 9:00 AM para sincronizar ritmos periféricos.' : 'Direct sunlight exposure before 9:00 AM to lock in suprachiasmatic nucleus rhythm.'
        },
        {
          symbol: 'PER3 (VNTR)',
          name: isEs ? 'Homólogo de Period Circadiano 3' : 'Period Circadian Protein 3',
          finding: isEs ? 'Alelo 5-repeat: alta presión homeostática de sueño y necesidad de 7.5-8h.' : '5-repeat allele: high homeostatic sleep pressure requiring 7.5-8h restorative sleep.',
          action: isEs ? 'Higiene del sueño estricta con magnesio treonato y apigenina 1h antes de acostarse.' : 'Strict sleep hygiene with Magnesium L-Threonate and Apigenin 60 min before bed.'
        },
        {
          symbol: 'COMT (Val158Met)',
          name: isEs ? 'Catecol-O-Metiltransferasa' : 'Catechol-O-Methyltransferase',
          finding: isEs ? 'Genotipo Met/Met ("Warrior/Worrier"): dopamina frontal basal alta y enfoque profundo.' : 'Met/Met genotype: elevated prefrontal dopamine, superior cognitive focus under low stress.',
          action: isEs ? 'Evitar estimulantes en la tarde; incorporar protocolos de reducción de cortisol (Ashwagandha).' : 'Avoid late stimulants; support with adaptogens and breathwork under acute load.'
        }
      ]
    }
  };

  return (
    <div className="eterna-page-root">
      <div className="eterna-bg-glow-top" />
      <div className="eterna-bg-glow-amber" />

      {/* Fixed Executive Top Header */}
      <PublicUnifiedHeader
        track="peptides"
        lang={lang}
        onLangChange={setLang}
        copyUrl={typeof window !== 'undefined' ? window.location.href : `${baseUrl}/p/${slug}`}
        supplierName="ETHERNA DX · Eurofins Lab"
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
          { label: isEs ? 'Catálogo' : 'Catalog', href: '/c/CAT-MU9L9GBN' },
          { label: isEs ? 'Genómica & Longevidad' : 'Genomics & Longevity', href: '/c/CAT-MU9L9GBN' },
          { label: name }
        ]}
      />

      <div className="eterna-container">
        {/* ── 1. Hero Showcase ── */}
        <section className="eterna-hero-grid">
          {/* Left Column: Scientific Value Proposition & Clinical Positioning */}
          <div>
            <div className="eterna-hero-badges">
              <span className="eterna-badge-brand">
                <Dna size={13} /> ETERNA DX · Eurofins Lab
              </span>
              <span className="eterna-badge-saliva">
                <Layers size={13} /> {isEs ? '100% Saliva (Sin Agujas)' : '100% Saliva (Needle-Free)'}
              </span>
              <span className="eterna-badge-ce">
                <ShieldCheck size={13} /> CE-IVD Marked · Eurofins ISO 15189 / 17025
              </span>
            </div>

            <h1 className="eterna-hero-title">
              {isEs 
                ? 'Plataforma ETERNA®: Telemetría de Longevidad y Seguimiento del Paciente'
                : 'ETERNA® Patient Wellness & Epigenetic Longevity Tracking Platform'}
            </h1>

            <div className="eterna-hero-tagline">
              {isEs 
                ? '«Tu genoma es el mapa basal. La telemetría de tu paciente, su brújula diaria.»'
                : '“Your genome is the baseline map. Patient biometric telemetry is the clinical compass.”'}
            </div>

            <p className="eterna-hero-subtitle">
              {isEs
                ? 'Una solución integral para que médicos y profesionales de la salud realicen un seguimiento continuo del bienestar, envejecimiento biológico y biomarcadores epigenéticos de sus pacientes. Conecta genómica fija (+700.000 SNPs), proteómica de órganos, analíticas y wearables (Oura, Apple Health, Garmin) para cuantificar la efectividad de las terapias en el tiempo.'
                : 'A comprehensive medical tracking platform enabling physicians to longitudinally monitor patient wellness, biological rate of aging, and longevity biomarkers over time. Combines a fixed genomic baseline (+700,000 SNPs), organ proteomics, blood labs, and continuous wearable telemetry (Oura, Apple Health, Garmin) to scientifically quantify treatment outcomes.'}
            </p>

            {/* 4 KPIs Row */}
            <div className="eterna-hero-stats-row">
              <div className="eterna-stat-card">
                <div className="eterna-stat-num teal">+700K</div>
                <div className="eterna-stat-label">{isEs ? 'Variantes Genéticas' : 'Genetic SNPs'}</div>
              </div>
              <div className="eterna-stat-card">
                <div className="eterna-stat-num gold">0.82x</div>
                <div className="eterna-stat-label">{isEs ? 'Tasa de Envejecimiento' : 'Pace of Aging Target'}</div>
              </div>
              <div className="eterna-stat-card">
                <div className="eterna-stat-num cyan">2 Min</div>
                <div className="eterna-stat-label">{isEs ? 'Muestreo No Invasivo' : 'Painless Saliva Kit'}</div>
              </div>
              <div className="eterna-stat-card">
                <div className="eterna-stat-num purple">6-12 Mo</div>
                <div className="eterna-stat-label">{isEs ? 'Intervalo Re-Test' : 'Tracking Interval'}</div>
              </div>
            </div>

            {/* Manufacturer & Lab Credentials */}
            <div className="eterna-credentials-row">
              <div className="eterna-credential-item">
                <CheckCircle2 size={15} color="#2dd4bf" />
                <span>{isEs ? 'Laboratorios Eurofins (Acreditación ISO 15189 / 17025)' : 'Eurofins Laboratory (ISO 15189 / 17025 Accredited)'}</span>
              </div>
              <div className="eterna-credential-item">
                <CheckCircle2 size={15} color="#2dd4bf" />
                <span>{isEs ? 'Proveedor Autorizado: ETERNA DX' : 'Authorized Provider: ETERNA DX'}</span>
              </div>
              <div className="eterna-credential-item">
                <CheckCircle2 size={15} color="#2dd4bf" />
                <span>{isEs ? '100% Propiedad del Paciente (Descarga .TXT Raw)' : '100% Patient Owned Data (Full .TXT Raw Export)'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Photo Interactive Media Showcase */}
          <div className="eterna-hero-media-card">
            <div 
              className="eterna-media-viewport"
              onClick={() => handleOpenModal(currentMedia.src, currentMedia.title)}
              title={isEs ? 'Haz clic para inspeccionar en alta resolución' : 'Click to inspect in high resolution'}
            >
              <img
                src={currentMedia.src}
                alt={currentMedia.title}
                className="eterna-kit-img"
              />
              <div className="eterna-media-tag-overlay">
                <span className="eterna-media-pill-tag">{currentMedia.tag}</span>
              </div>
              <div className="eterna-zoom-overlay">
                <ZoomIn size={13} />
                <span>{isEs ? 'Ampliar Imagen' : 'Inspect High-Res'}</span>
              </div>

              {/* Prev / Next Arrows */}
              <button
                type="button"
                className="eterna-media-arrow left"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMediaIdx((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="eterna-media-arrow right"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMediaIdx((prev) => (prev + 1) % galleryItems.length);
                }}
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Media Thumbnails Selector (Original App & Kit Photos) */}
            <div className="eterna-media-thumbs-strip">
              {galleryItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`eterna-thumb-btn ${selectedMediaIdx === idx ? 'active' : ''}`}
                  onClick={() => setSelectedMediaIdx(idx)}
                  title={item.title}
                >
                  <img src={item.thumb} alt={item.tag} className="eterna-thumb-img" />
                  <span className="eterna-thumb-label">{item.tag}</span>
                </button>
              ))}
            </div>

            {/* Quick Hero Procurement bar */}
            <div className="eterna-hero-procurement-bar">
              <div className="eterna-price-row">
                <div>
                  <div className="eterna-price-val">{currencySymbol}{price.toFixed(2)}</div>
                  <div className="eterna-price-sub">
                    {isEs ? 'Incluye Kit de Saliva + Análisis Completo Eurofins' : 'Includes Saliva Kit + Full Eurofins Lab Analysis'}
                  </div>
                </div>
                <div className="eterna-batch-tag">
                  <span style={{ color: '#94a3b8' }}>{isEs ? 'Lote Asignado:' : 'Assigned Batch:'}</span>
                  <div 
                    className="eterna-batch-code" 
                    onClick={handleCopyBatch}
                    title={isEs ? 'Copiar código de lote' : 'Copy batch code'}
                  >
                    {effectiveBatchCode}
                    {copiedBatch ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                  </div>
                </div>
              </div>

              <div className="eterna-order-actions">
                <button
                  type="button"
                  className="eterna-btn-primary"
                  onClick={handleAddToCart}
                >
                  <Package size={17} />
                  <span>{isEs ? 'Añadir Kit a la Orden' : 'Add Kit to Order'}</span>
                </button>
                <button
                  type="button"
                  className="eterna-btn-secondary"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                >
                  <HelpCircle size={15} />
                  <span>{isEs ? 'Consulta Médica' : 'Clinical Inquiry'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Segmented Navigation Bar ── */}
        <div className="eterna-tabs-wrapper">
          <div className="eterna-tabs-scroll">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`eterna-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabSelect(tab.id)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Dual-Column Architecture: Main Tab Content + Dedicated Right Sidebar ── */}
        <div className="eterna-layout-grid">
          {/* ── LEFT COLUMN: MAIN CLINICAL CONTENT MODULES ── */}
          <div className="eterna-main-content">
            
            {/* TAB: PATIENT WELLNESS APP & LONGITUDINAL TRACKING (FEATURED) */}
            {activeTab === 'patient-tracking' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <TrendingUp size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Aplicación de Seguimiento Clínico y Bienestar del Paciente' : 'Patient Wellness & Longitudinal Tracking Application'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Diseñada para que médicos y clínicas monitoricen el impacto de protocolos, estilo de vida y péptidos en tiempo real.'
                          : 'Engineered for practitioners to monitor longevity progress, lifestyle habits, and peptide protocol efficacy in real-time.'}
                      </p>
                    </div>
                  </div>
                  <span className="eterna-badge-brand">
                    {isEs ? 'Telemetría Clínica' : 'Clinical Telemetry'}
                  </span>
                </div>

                {/* Key Pillars of Patient Tracking */}
                <div className="eterna-tracking-features-grid">
                  <div className="eterna-tracking-feature-box">
                    <div className="eterna-feature-header">
                      <Clock size={18} color="#2dd4bf" />
                      <h4>{isEs ? '1. Velocidad de Envejecimiento (Pace of Aging)' : '1. Epigenetic Pace of Aging Tracking'}</h4>
                    </div>
                    <p>
                      {isEs 
                        ? 'Cuantifica cuántos años biológicos envejece el paciente por cada año cronológico (ej. 0.82x). Permite medir científicamente la desaceleración del envejecimiento tras intervenciones terapéuticas.'
                        : 'Measures how many biological years a patient ages per calendar year (e.g. 0.82x). Quantifies cellular aging deceleration following lifestyle and peptide interventions.'}
                    </p>
                  </div>
                  <div className="eterna-tracking-feature-box">
                    <div className="eterna-feature-header">
                      <Heart size={18} color="#f43f5e" />
                      <h4>{isEs ? '2. Telemetría de Edad Biológica por Órganos' : '2. Multi-Organ Biological Age Telemetry'}</h4>
                    </div>
                    <p>
                      {isEs
                        ? 'Desglosa la edad funcional de sistemas críticos: cerebro, corazón, riñones, hígado y sistema inmune, detectando divergencias orgánicas antes de que se manifiesten como patología.'
                        : 'Calculates specific biological ages across critical organ systems: brain, cardiovascular, kidney, liver, and immune, identifying tissue vulnerabilities early.'}
                    </p>
                  </div>
                  <div className="eterna-tracking-feature-box">
                    <div className="eterna-feature-header">
                      <Activity size={18} color="#fbbf24" />
                      <h4>{isEs ? '3. Sincronización Biométrica Diaria' : '3. Daily Biometric Wearable Telemetry'}</h4>
                    </div>
                    <p>
                      {isEs
                        ? 'Conecta con Apple Health, Oura, Garmin y Whoop para registrar variabilidad cardíaca (HRV), fases de sueño profundo y VO2 máx, ajustados al perfil genético del paciente.'
                        : 'Syncs continuously with Apple Health, Oura, Garmin, and Whoop to track HRV recovery, restorative slow-wave sleep, and strain aligned to personal genetics.'}
                    </p>
                  </div>
                  <div className="eterna-tracking-feature-box">
                    <div className="eterna-feature-header">
                      <FlaskConical size={18} color="#38bdf8" />
                      <h4>{isEs ? '4. Re-Testing Periódico (6 a 12 Meses)' : '4. Longitudinal Re-Testing (6 to 12 Mo)'}</h4>
                    </div>
                    <p>
                      {isEs
                        ? 'La genética fija (+700K SNPs) se mide una sola vez. Las re-evaluaciones epigenéticas cada 6–12 meses permiten al médico validar si el paciente rejuvenece biológicamente.'
                        : 'The fixed DNA code (+700K SNPs) is tested once. Subsequent saliva re-tests at 6–12 month intervals prove whether therapies are reversing cellular biological age.'}
                    </p>
                  </div>
                </div>

                {/* Original App Showcase Cards (Photos from Original Application) */}
                <div className="eterna-app-gallery-section">
                  <div className="eterna-app-gallery-title">
                    <Smartphone size={18} color="#2dd4bf" />
                    <span>{isEs ? 'Capturas de la Aplicación del Paciente (Datos Biométricos Reales)' : 'Original Patient Application Screenshots & Biometric Views'}</span>
                  </div>
                  
                  <div className="eterna-app-screenshots-grid">
                    {/* Screen 1 */}
                    <div 
                      className="eterna-app-screen-card"
                      onClick={() => handleOpenModal('/images/products/eterna/biometrica1.jpeg', 'Pace of Aging Screen')}
                    >
                      <div className="eterna-app-img-wrap">
                        <img 
                          src="/images/products/eterna/biometrica1.jpeg" 
                          alt="Pace of Aging Screen"
                          className="eterna-app-screen-img"
                        />
                        <div className="eterna-app-zoom-badge">
                          <ZoomIn size={14} />
                        </div>
                      </div>
                      <div className="eterna-app-screen-caption">
                        <strong>{isEs ? 'Velocidad de Envejecimiento' : 'Cellular Pace of Aging'}</strong>
                        <span>{isEs ? 'Visualización de 0.82 años biológicos / año' : '0.82 biological yrs / chronological yr'}</span>
                      </div>
                    </div>

                    {/* Screen 2 */}
                    <div 
                      className="eterna-app-screen-card"
                      onClick={() => handleOpenModal('/images/products/eterna/biometrica2.jpeg', 'Multi-Organ Biological Age Screen')}
                    >
                      <div className="eterna-app-img-wrap">
                        <img 
                          src="/images/products/eterna/biometrica2.jpeg" 
                          alt="Organ Biological Age Screen"
                          className="eterna-app-screen-img"
                        />
                        <div className="eterna-app-zoom-badge">
                          <ZoomIn size={14} />
                        </div>
                      </div>
                      <div className="eterna-app-screen-caption">
                        <strong>{isEs ? 'Edad Biológica por Órganos' : 'Multi-Organ Biological Age'}</strong>
                        <span>{isEs ? 'Desglose funcional de cerebro, corazón y riñón' : 'Functional brain, cardiac, and renal ages'}</span>
                      </div>
                    </div>

                    {/* Screen 3 */}
                    <div 
                      className="eterna-app-screen-card"
                      onClick={() => handleOpenModal('/images/products/eterna/biometrica5.jpeg', 'Daily Biometric Tracking Screen')}
                    >
                      <div className="eterna-app-img-wrap">
                        <img 
                          src="/images/products/eterna/biometrica5.jpeg" 
                          alt="Daily Biometric Tracking Screen"
                          className="eterna-app-screen-img"
                        />
                        <div className="eterna-app-zoom-badge">
                          <ZoomIn size={14} />
                        </div>
                      </div>
                      <div className="eterna-app-screen-caption">
                        <strong>{isEs ? 'Telemetría Diaria y Wearables' : 'Daily Biometrics & Sleep'}</strong>
                        <span>{isEs ? 'Sincronización 24/7 con smartwatch y Oura' : '24/7 continuous wearable synchronization'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Interactive Epigenetic Pace of Aging Simulator ── */}
                <div className="eterna-simulator-card">
                  <div className="eterna-simulator-header">
                    <div className="eterna-simulator-title">
                      <TrendingUp size={18} color="#2dd4bf" />
                      <span>{isEs ? 'Simulador Clínico de Desaceleración Epigenética' : 'Epigenetic Pace of Aging & Deceleration Simulator'}</span>
                    </div>
                    <span 
                      className="eterna-simulator-badge"
                      style={{ 
                        color: simStatus.color, 
                        background: simStatus.bg, 
                        border: `1px solid ${simStatus.border}` 
                      }}
                    >
                      {simStatus.label}
                    </span>
                  </div>

                  <div className="eterna-simulator-body">
                    {/* Controls */}
                    <div className="eterna-simulator-controls">
                      <div className="eterna-sim-control-group">
                        <div className="eterna-sim-label-row">
                          <span>{isEs ? 'Edad Cronológica Actual' : 'Current Chronological Age'}:</span>
                          <span className="eterna-sim-val">{simAge} {isEs ? 'años' : 'yrs'}</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="85"
                          step="1"
                          value={simAge}
                          onChange={(e) => setSimAge(Number(e.target.value))}
                          className="eterna-sim-slider"
                        />
                      </div>

                      <div className="eterna-sim-control-group">
                        <div className="eterna-sim-label-row">
                          <span>{isEs ? 'Velocidad de Envejecimiento (Pace of Aging)' : 'Pace of Aging Velocity'}:</span>
                          <span className="eterna-sim-val" style={{ color: simStatus.color }}>
                            {simPace.toFixed(2)}x {isEs ? 'años biol./año cron.' : 'bio yrs/calendar yr'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.65"
                          max="1.35"
                          step="0.01"
                          value={simPace}
                          onChange={(e) => setSimPace(Number(e.target.value))}
                          className="eterna-sim-slider"
                        />
                      </div>

                      <div className="eterna-sim-control-group">
                        <div className="eterna-sim-label-row">
                          <span>{isEs ? 'Duración del Protocolo de Longevidad' : 'Follow-up Protocol Duration'}:</span>
                          <span className="eterna-sim-val">{simYears} {isEs ? 'años' : 'years'}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={simYears}
                          onChange={(e) => setSimYears(Number(e.target.value))}
                          className="eterna-sim-slider"
                        />
                      </div>
                    </div>

                    {/* Results Card */}
                    <div className="eterna-simulator-results">
                      <div className="eterna-sim-kpi-grid">
                        <div className="eterna-sim-kpi-item">
                          <div className="eterna-sim-kpi-num" style={{ color: '#2dd4bf' }}>
                            {simNewBioAge}
                          </div>
                          <div className="eterna-sim-kpi-label">
                            {isEs ? 'Edad Biológica Proyectada' : 'Projected Bio Age'}
                          </div>
                        </div>

                        <div className="eterna-sim-kpi-item">
                          <div 
                            className="eterna-sim-kpi-num" 
                            style={{ color: simYearsSaved >= 0 ? '#4ade80' : '#f87171' }}
                          >
                            {simYearsSaved >= 0 ? `-${simYearsSaved}` : `+${Math.abs(simYearsSaved)}`}
                          </div>
                          <div className="eterna-sim-kpi-label">
                            {isEs ? 'Años Biológicos Ganados' : 'Biological Yrs Saved'}
                          </div>
                        </div>
                      </div>

                      <div className="eterna-sim-summary-box">
                        {simPace < 1.0 ? (
                          <span>
                            {isEs
                              ? `Con un ritmo de ${simPace.toFixed(2)}x, el paciente acumula solo ${simBioYearsPassed} años de envejecimiento celular en ${simYears} años reales, frenando la senescencia en ${simYearsSaved} años biológicos.`
                              : `At ${simPace.toFixed(2)}x velocity, your patient accumulates only ${simBioYearsPassed} years of cellular damage over ${simYears} calendar years, preserving ${simYearsSaved} biological years.`}
                          </span>
                        ) : (
                          <span>
                            {isEs
                              ? `A un ritmo de ${simPace.toFixed(2)}x, el paciente envejece a velocidad acelerada (+${Math.abs(simYearsSaved)} años biológicos añadidos). Se recomienda intervención inmediata con péptidos biorreguladores y analítica Eurofins.`
                              : `At ${simPace.toFixed(2)}x velocity, biological age advances faster than chronological time (+${Math.abs(simYearsSaved)} accelerated biological years). Targeted peptide bioregulator protocols recommended.`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Doctor Clinical Value Callout */}
                <div className="eterna-doctor-callout-box">
                  <div className="eterna-doctor-callout-icon">
                    <Users size={24} color="#2dd4bf" />
                  </div>
                  <div>
                    <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 800, margin: '0 0 0.35rem 0' }}>
                      {isEs ? 'Para Médicos: Prescripción Personalizada con Evidencia Objetiva' : 'For Medical Practices: Evidence-Based Longevity Management'}
                    </h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6, margin: 0 }}>
                      {isEs
                        ? 'Permite a los prescriptores diseñar protocolos de péptidos (Epithalon, MOTS-c, NAD+), nutracéuticos y optimización de estilo de vida basados en el perfil molecular del paciente, con datos cuantificables de antes y después.'
                        : 'Empowers clinicians to tailor peptide regimens (Epithalon, MOTS-c, NAD+), nutraceuticals, and lifestyle adjustments directly to each patient’s molecular blueprint, providing clear before-and-after biological metrics.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SAMPLE CLINICAL REPORT (34 PAGES BREAKDOWN & DIRECT DOWNLOAD) */}
            {activeTab === 'sample-report' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <FileText size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Informe Genómico Oficial ETERNA® (Muestra de 34 Páginas)' : 'Official ETERNA® ProGen 34-Page Clinical Report'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Estructura analítica completa entregada al médico y paciente: radar de 5 dominios, cribado de 10 sistemas orgánicos, farmacogenética y polimorfismos maestros de longevidad.'
                          : 'Complete diagnostic dossier delivered to clinicians and patients: 5-domain executive radar, 10-system pathology screening, pharmacogenetics, and master longevity polymorphisms.'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a
                      href="/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eterna-badge-brand"
                      style={{ textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                      <Download size={13} />
                      <span>{isEs ? 'Descargar PDF (7.7 MB)' : 'Download PDF (7.7 MB)'}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsB2BPortalModalOpen(true)}
                      className="eterna-badge-saliva"
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(20, 184, 166, 0.15)', borderColor: 'rgba(20, 184, 166, 0.4)', color: '#2dd4bf' }}
                    >
                      <ExternalLink size={13} />
                      <span>{isEs ? 'Demo Portal B2B' : 'Launch B2B Portal Demo'}</span>
                    </button>
                  </div>
                </div>

                {/* 5-Domain Radar Score Breakdown */}
                <div className="eterna-report-radar-grid">
                  <div className="eterna-report-radar-card">
                    <div className="eterna-radar-score" style={{ color: '#38bdf8' }}>54/100</div>
                    <div className="eterna-radar-name">Sports & Performance</div>
                    <div className="eterna-radar-tag">Under Review</div>
                  </div>
                  <div className="eterna-report-radar-card">
                    <div className="eterna-radar-score" style={{ color: '#f59e0b' }}>46/100</div>
                    <div className="eterna-radar-name">Longevity & Aging</div>
                    <div className="eterna-radar-tag">Under Review</div>
                  </div>
                  <div className="eterna-report-radar-card">
                    <div className="eterna-radar-score" style={{ color: '#a855f7' }}>47/100</div>
                    <div className="eterna-radar-name">Nutrigenomics & Diet</div>
                    <div className="eterna-radar-tag">Under Review</div>
                  </div>
                  <div className="eterna-report-radar-card">
                    <div className="eterna-radar-score" style={{ color: '#10b981' }}>55/100</div>
                    <div className="eterna-radar-name">Prevention & Pathology</div>
                    <div className="eterna-radar-tag">Adequate Balance</div>
                  </div>
                  <div className="eterna-report-radar-card">
                    <div className="eterna-radar-score" style={{ color: '#ec4899' }}>45/100</div>
                    <div className="eterna-radar-name">Social & Neurogenetics</div>
                    <div className="eterna-radar-tag">Under Review</div>
                  </div>
                </div>

                {/* Detailed Sections Grid of the 34-page report */}
                <div className="eterna-report-sections-list">
                  {/* Section 1 */}
                  <div className="eterna-report-section-box">
                    <div className="eterna-report-section-header">
                      <div className="eterna-report-section-badge">PAGES 5–12</div>
                      <h4>1. Systemic Pathology Risk Screening (10 Biological Systems)</h4>
                    </div>
                    <p>
                      Longitudinal predisposition across 10 vital axes: <strong>Musculoskeletal</strong> (Osteoporosis 40.9%, Inguinal hernia 40.8%), <strong>Excretory</strong> (Chronic renal disease 45%), <strong>Integumentary</strong> (Androgenetic alopecia 99%, Melanoma), <strong>Nervous</strong> (Restless legs, Depression), <strong>Immune</strong> (Hodgkin 99%, Sjögren 61.6%), <strong>Endocrine</strong> (Metabolic syndrome 54%, T2D), <strong>Respiratory</strong> (Sleep apnea, COPD), <strong>Digestive</strong> (Ulcerative colitis, NAFLD), <strong>Reproductive</strong>, and <strong>Circulatory</strong> (Hypertension 15.8%, Myocardial infarction 21.7%, Venous thrombosis 40.9%).
                    </p>
                  </div>

                  {/* Section 2 */}
                  <div className="eterna-report-section-box">
                    <div className="eterna-report-section-header">
                      <div className="eterna-report-section-badge">PAGES 13–15</div>
                      <h4>2. Precision Pharmacogenetics (Drug Response & Toxicity)</h4>
                    </div>
                    <p>
                      Tailors medication efficacy and flags adverse metabolic risks: <strong>Analgesics & NSAIDs (22/100 Priority)</strong> with 100% NSAID/Opioid sensitivity, <strong>Anti-Allergics (100/100 Excellent)</strong>, <strong>Anti-Asthmatics (Salbutamol response)</strong>, <strong>Antibiotics (Amoxicillin 100/100)</strong>, and <strong>Cardiovascular Statins (Atorvastatin therapy 99%)</strong>.
                    </p>
                  </div>

                  {/* Section 3 */}
                  <div className="eterna-report-section-box">
                    <div className="eterna-report-section-header">
                      <div className="eterna-report-section-badge">PAGES 16–19</div>
                      <h4>3. Nutrigenomics, Intolerances & Micronutrient Transport</h4>
                    </div>
                    <p>
                      Analyzes food sensitivities: <strong>Histamine intolerance (99.0%)</strong>, <strong>Egg intolerance (99.0%)</strong>, and <strong>Celiac disease (-83.5%)</strong>. Examines micronutrient processing including Folate (MTHFR cycle), Beta-Carotene to Vitamin A conversion (BCO1 deficit), Vitamin D/E/K, Iron transport (99%), and Visceral Adipose Tissue propensity (54.6%).
                    </p>
                  </div>

                  {/* Section 4 */}
                  <div className="eterna-report-section-box">
                    <div className="eterna-report-section-header">
                      <div className="eterna-report-section-badge">PAGES 20–23</div>
                      <h4>4. Sports Biomechanics, Injury Susceptibility & Recovery</h4>
                    </div>
                    <p>
                      Quantifies cardiorespiratory efficiency (VO2 max response), muscle fiber dynamics (ACTN3 fast-twitch vs endurance), tendon vulnerability (Achilles & Tendinitis 99.0%), and post-exercise recovery kinetics (Creatine Kinase 100%, sleep duration recovery).
                    </p>
                  </div>

                  {/* Section 5 */}
                  <div className="eterna-report-section-box">
                    <div className="eterna-report-section-header">
                      <div className="eterna-report-section-badge">PAGES 24–31</div>
                      <h4>5. Master Longevity Polymorphisms & Epigenetic Clocks</h4>
                    </div>
                    <p>
                      Specific genotyping for key human longevity genes: <strong>ACE (ID)</strong> blood pressure & vascular tone, <strong>FOXO3 (GT)</strong> autophagy & cellular resilience, <strong>APOE</strong> neuronal lipid clearance, <strong>COL1A1 / COL5A1 (-/CT)</strong> fibrillar collagen synthesis, <strong>CETP (B1/B1)</strong> HDL cholesterol remodeling, <strong>CYP1A2 (AA)</strong> rapid caffeine clearance, and <strong>BRCA1/2 (86/100)</strong> genomic stability.
                    </p>
                  </div>

                  {/* Section 6 */}
                  <div className="eterna-report-section-box">
                    <div className="eterna-report-section-header">
                      <div className="eterna-report-section-badge">PAGES 32–34</div>
                      <h4>6. Social Neurogenetics & Medical Validation Signature</h4>
                    </div>
                    <p>
                      Evaluates neurochemical and behavioral traits (dopamine/serotonin stress resilience, circadian stability). Concludes with official medical validation signed by <strong>Dr. Alberto Melón Fernández (College of Physicians #333706994)</strong> and continuous real-time monitoring through the ETERNA app.
                    </p>
                  </div>
                </div>

                {/* Embedded PDF Preview / Download Banner */}
                <div className="eterna-report-download-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                        ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Official 34-Page Diagnostic Dossier · 7.7 MB · CE-IVD Marked & Eurofins ISO 15189
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <a
                      href="/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="eterna-btn-primary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={15} />
                      <span>{isEs ? 'Ver Informe en el Navegador' : 'View Full PDF in Browser'}</span>
                    </a>
                    <a
                      href="/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                      download="ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                      className="eterna-btn-secondary"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={15} />
                      <span>{isEs ? 'Descargar Archivo' : 'Download File'}</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: BIOLOGICAL AGE & EPIGENETIC CLOCKS */}
            {activeTab === 'biological-age' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <Clock size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Velocidad de Envejecimiento & Edad Biológica' : 'Biological Rate of Aging & Epigenetic Clocks'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Basado en los algoritmos epigenéticos patentados de metilación del ADN y proteómica funcional de ETERNA DX procesados por Eurofins.'
                          : 'Driven by ETERNA DX patented DNA methylation algorithms and organ-level functional proteomics processed by Eurofins.'}
                      </p>
                    </div>
                  </div>
                  <span className="eterna-badge-brand">
                    Horvath & Hannum Clocks
                  </span>
                </div>

                <div className="eterna-bioage-grid">
                  {/* Rate of Aging Card */}
                  <div className="eterna-rate-meter-box">
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {isEs ? 'TASA DE ENVEJECIMIENTO CELULAR' : 'CELLULAR PACE OF AGING'}
                      </span>
                      <div className="eterna-rate-val-row">
                        <span className="eterna-rate-huge">0.82</span>
                        <div className="eterna-rate-subtext">
                          <span className="eterna-rate-status-good">
                            {isEs ? 'Envejecimiento Lento' : 'Slow Aging Velocity'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {isEs ? '0.82 años biológicos por año real' : '0.82 biological yrs per calendar yr'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>
                      {isEs
                        ? 'Tu organismo envejece un 18% más despacio que la media poblacional. Por cada 12 meses cronológicos, tus células avanzan únicamente 9.8 meses biológicos.'
                        : 'Your biological cellular clock ticks 18% slower than average. For every 12 calendar months, your cells only advance by 9.8 biological months.'}
                    </p>
                  </div>

                  {/* Biological Age vs Chronological Card */}
                  <div className="eterna-bio-compare-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          {isEs ? 'DISCREPANCIA DE EDAD BIOLÓGICA' : 'EPIGENETIC AGE DELTA'}
                        </span>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#2dd4bf', lineHeight: 1.1, marginTop: '0.25rem' }}>
                          - 6.4 <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#94a3b8' }}>{isEs ? 'Años' : 'Years'}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isEs ? 'Edad Cronológica' : 'Chronological Age'}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>45 {isEs ? 'Años' : 'Yrs'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#2dd4bf', marginTop: '0.35rem' }}>{isEs ? 'Edad Biológica' : 'Biological Age'}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#2dd4bf' }}>38.6 {isEs ? 'Años' : 'Yrs'}</div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', paddingTop: '0.85rem', marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                        {isEs ? 'Proteómica de Órganos Analizada por Eurofins:' : 'Organ-Level Proteomics Analyzed by Eurofins:'}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="eterna-organ-pill">• {isEs ? 'Cerebro' : 'Brain'}: 37.1 {isEs ? 'a' : 'y'}</span>
                        <span className="eterna-organ-pill">• {isEs ? 'Corazón' : 'Heart'}: 39.4 {isEs ? 'a' : 'y'}</span>
                        <span className="eterna-organ-pill">• {isEs ? 'Inmune' : 'Immune'}: 36.8 {isEs ? 'a' : 'y'}</span>
                        <span className="eterna-organ-pill">• {isEs ? 'Hígado' : 'Liver'}: 40.2 {isEs ? 'a' : 'y'}</span>
                        <span className="eterna-organ-pill">• {isEs ? 'Riñón' : 'Kidney'}: 38.0 {isEs ? 'a' : 'y'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 5 GENOMIC PILLARS */}
            {activeTab === 'five-pillars' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <Dna size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Los 5 Pilares Genómicos (+700.000 SNPs)' : 'The 5 Genomic Pillars (+700,000 SNPs)'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Mapeo masivo en microarrays de alta densidad procesados por Eurofins Genomics (GRCh38 / hg38).'
                          : 'High-density genome-wide microarray profiling processed by Eurofins Genomics (GRCh38 / hg38).'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pillar Switcher */}
                <div className="eterna-pillars-nav">
                  {Object.keys(pillarsData).map(key => {
                    const item = pillarsData[key];
                    const isSelected = activePillar === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`eterna-pillar-card-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setActivePillar(key)}
                      >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                        <div className="eterna-pillar-title">{item.name}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Pillar Dossier */}
                {pillarsData[activePillar] && (
                  <div className="eterna-pillar-dossier">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pillarsData[activePillar].color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {isEs ? 'INFORME CLÍNICO SECTORIAL' : 'SECTORIAL CLINICAL DOSSIER'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                      {pillarsData[activePillar].name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                      {pillarsData[activePillar].summary}
                    </p>

                    {/* Genes Grid */}
                    <div className="eterna-gene-grid">
                      {pillarsData[activePillar].genes.map((g, idx) => (
                        <div key={idx} className="eterna-gene-card">
                          <div className="eterna-gene-symbol">{g.symbol}</div>
                          <div className="eterna-gene-name">{g.name}</div>
                          <div className="eterna-gene-finding">{g.finding}</div>
                          <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(51, 65, 85, 0.5)', fontSize: '0.72rem', color: '#2dd4bf', lineHeight: 1.45 }}>
                            <strong>{isEs ? 'Pauta Clínica:' : 'Clinical Action:'}</strong> {g.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WEARABLES & TELEMETRY INTEGRATION */}
            {activeTab === 'wearables-sync' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Ecosistema Conectado con Wearables' : 'Wearables Telemetry Integration'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Sincronización continua de datos biométricos dinámicos con el código genético del paciente.'
                          : 'Continuous synchronization uniting dynamic biometric telemetry with static DNA blueprints.'}
                      </p>
                    </div>
                  </div>
                  <span className="eterna-badge-saliva">
                    {isEs ? 'Telemetría 24/7' : '24/7 Telemetry'}
                  </span>
                </div>

                <div className="eterna-wearables-showcase">
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
                      {isEs ? 'El Smartwatch como Brújula Diaria del Paciente' : 'Smartwatches as the Daily Clinical Compass'}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                      {isEs
                        ? 'La genética revela la predisposición innata del paciente, mientras que el reloj inteligente o anillo Oura registra su respuesta fisiológica en tiempo real. ETERNA DX correlaciona variabilidad de pulso (HRV), sueño delta y VO2 máx con variantes genéticas (IL6, CLOCK, ACTN3) para modular la dosis del protocolo en el día a día.'
                        : 'Genetics define baseline predispositions, but your patient’s smartwatch captures daily in vivo adaptations. ETERNA DX cross-references Heart Rate Variability (HRV), slow-wave delta sleep architecture, and VO2 max against genetic SNPs (IL6, CLOCK, ACTN3) to dynamically calibrate clinical recovery targets.'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {[
                        {
                          title: isEs ? 'Variabilidad del Ritmo Cardíaco (HRV)' : 'Heart Rate Variability (HRV)',
                          desc: isEs ? 'Monitorea el equilibrio simpático/parasimpático guiado por el perfil IL6.' : 'Tracks autonomic nervous balance aligned to personal IL6 inflammatory genetics.'
                        },
                        {
                          title: isEs ? 'Arquitectura del Sueño (Fases REM y Profundo)' : 'Sleep Architecture & Delta Waves',
                          desc: isEs ? 'Sincronizado con polimorfismos CLOCK y PER3 para optimizar descanso.' : 'Synchronized against CLOCK and PER3 variants to calculate sleep latency targets.'
                        },
                        {
                          title: isEs ? 'Carga de Entrenamiento & Recuperación' : 'Training Load & Strain Score',
                          desc: isEs ? 'Calibrado con el perfil ACTN3 para evitar sobreentrenamiento.' : 'Calibrated to ACTN3 muscle fiber profile to prevent overtraining syndrome.'
                        }
                      ].map((w, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <CheckCircle2 size={16} color="#2dd4bf" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>{w.title}: </strong>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{w.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="eterna-devices-strip">
                      {['Apple Health', 'Garmin Connect', 'Oura Ring', 'Whoop 4.0', 'Fitbit', 'Polar', 'Withings', 'Google Health Connect'].map((dev, idx) => (
                        <span key={idx} className="eterna-device-pill">
                          {dev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div 
                    className="eterna-wearables-img-card"
                    onClick={() => handleOpenModal('/images/products/eterna/eterna-hero-app.png', 'ETERNA DX Telemetry Hub')}
                  >
                    <img
                      src="/images/products/eterna/eterna-hero-app.png"
                      alt="ETERNA DX App Dashboard"
                      className="eterna-wearables-img"
                    />
                    <div className="eterna-zoom-overlay">
                      <ZoomIn size={14} />
                      <span>{isEs ? 'Ampliar Telemetría' : 'Inspect Portal'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 2-MINUTE SALIVA PROTOCOL */}
            {activeTab === 'saliva-protocol' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <Layers size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Protocolo de Muestreo de Saliva en 2 Minutos' : '2-Minute Non-Invasive Saliva Protocol'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Sin agujas, sin extracciones dolorosas. Buffer estabilizador de ADN líquido certificado CE-IVD estable a temperatura ambiente.'
                          : 'Painless, needle-free collection. CE-IVD certified stabilization buffer stable at room temperature for 12 months.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="eterna-protocol-steps">
                  {[
                    {
                      step: 1,
                      title: isEs ? '1. Ayuno Pre-Toma (30 Min)' : '1. Pre-Sampling Fast (30 Min)',
                      desc: isEs ? 'No comer, beber, mascar chicle ni fumar durante los 30 minutos previos a la recogida de la muestra de saliva.' : 'Do not eat, drink, chew gum, or smoke for 30 minutes prior to saliva collection.'
                    },
                    {
                      step: 2,
                      title: isEs ? '2. Llenar Tubo de Recogida' : '2. Fill Collection Funnel',
                      desc: isEs ? 'Depositar saliva en el embudo colector hasta alcanzar exactamente la línea de nivel indicada (2 mL).' : 'Spit into collection funnel until liquid saliva reaches the fill line (2 mL, excluding bubbles).'
                    },
                    {
                      step: 3,
                      title: isEs ? '3. Liberar Buffer Estabilizador' : '3. Release DNA Buffer',
                      desc: isEs ? 'Cerrar el tapón con firmeza para liberar la solución de lisis y preservación del ADN genómico.' : 'Screw cap tightly to release stabilization buffer directly into the saliva specimen.'
                    },
                    {
                      step: 4,
                      title: isEs ? '4. Mezclar & Envío Gratuito' : '4. Invert & Express Return',
                      desc: isEs ? 'Agitar suavemente 5 veces e introducir el tubo en el sobre prefranqueado para el laboratorio Eurofins.' : 'Invert tube 5 times and place inside prepaid courier envelope for the accredited Eurofins lab.'
                    }
                  ].map(s => (
                    <div key={s.step} className="eterna-step-card">
                      <div className="eterna-step-number">{s.step}</div>
                      <h4 className="eterna-step-title">{s.title}</h4>
                      <p className="eterna-step-desc">{s.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Kit Contents Box */}
                <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#111724', borderRadius: '14px', border: '1px solid rgba(51, 65, 85, 0.5)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2dd4bf', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'CONTENIDO DEL KIT CERTIFICADO' : 'CERTIFIED KIT INCLUDED ITEMS'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <div>• {isEs ? 'Tubo colector con embudo de alta precisión' : 'High-precision funnel saliva collection tube'}</div>
                    <div>• {isEs ? 'Solución estabilizadora de ADN líquido (CE-IVD)' : 'Liquid DNA stabilization buffer (CE-IVD)'}</div>
                    <div>• {isEs ? 'Etiqueta con código de barras de muestra' : 'Sample identification barcode tracking label'}</div>
                    <div>• {isEs ? 'Guía ilustrada paso a paso en español e inglés' : 'Step-by-step illustrated manual in ES / EN'}</div>
                    <div>• {isEs ? 'Bolsa de seguridad biológica con desecante' : 'Biohazard specimen bag with absorbent pad'}</div>
                    <div>• {isEs ? 'Sobre de retorno urgente prefranqueado a Eurofins' : 'Prepaid express return envelope to Eurofins Lab'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CERTIFICATION & LAB TRACEABILITY */}
            {activeTab === 'traceability' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Acreditación del Laboratorio Eurofins & Trazabilidad' : 'Eurofins Lab Accreditation & Batch Traceability'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Proveedor ETERNA DX con procesamiento analítico centralizado en la red de laboratorios genómicos Eurofins.'
                          : 'Official provider ETERNA DX with centralized analytical testing executed by the Eurofins Clinical Diagnostics lab network.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* eslint-disable-next-line no-restricted-syntax */}
                <table className="eterna-traceability-table">
                  <tbody>
                    <tr>
                      <td>{isEs ? 'Producto & Referencia' : 'Product & Reference'}</td>
                      <td>ETERNA® DNA & Epigenetic Longevity Test (SKU: MP-LON-ETERNAE)</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Código de Lote Activo' : 'Active Batch Number'}</td>
                      <td>
                        <span 
                          className="eterna-batch-code" 
                          onClick={handleCopyBatch}
                        >
                          {effectiveBatchCode}
                          {copiedBatch ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Proveedor Autorizado' : 'Authorized Provider'}</td>
                      <td>ETHERNA / ETERNA DX</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Laboratorio Analítico' : 'Testing Laboratory'}</td>
                      <td>Eurofins Genomics & Clinical Diagnostics Network (European Facilities)</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Acreditaciones del Laboratorio' : 'Laboratory Accreditations'}</td>
                      <td>{isEs ? 'ISO 15189 (Laboratorios Clínicos) · ISO 17025 (Ensayos de Calibración) · CAP / CLIA' : 'ISO 15189 (Medical Diagnostic Labs) · ISO 17025 (Testing & Calibration) · CAP / CLIA'}</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Marcado Regulatorio' : 'Regulatory Compliance'}</td>
                      <td>{isEs ? 'Marcado CE-IVD (Directiva EU 2017/746 sobre diagnóstico in vitro)' : 'CE-IVD Marked (EU 2017/746 In Vitro Diagnostic Regulation)'}</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Tecnología de Genotipado' : 'Genotyping Platform'}</td>
                      <td>{isEs ? 'Microarray de ADN de Alta Densidad (+700.000 SNPs en GRCh38 / hg38)' : 'High-Density DNA Microarray (+700,000 SNPs on GRCh38 / hg38)'}</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Tipo de Muestra' : 'Specimen Matrix'}</td>
                      <td>{isEs ? 'Saliva humana estabilizada (2 mL de saliva total, sin punción)' : 'Preserved human saliva (2 mL total volume, painless needle-free)'}</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Tiempo de Respuesta' : 'Clinical Turnaround Time'}</td>
                      <td>15–20 {isEs ? 'días hábiles desde recepción en laboratorio Eurofins' : 'business days from Eurofins lab accessioning'}</td>
                    </tr>
                    <tr>
                      <td>{isEs ? 'Propiedad de los Datos' : 'Data Privacy & Ownership'}</td>
                      <td>
                        100% {isEs ? 'Propiedad del paciente. Descarga libre de archivo genético bruto (.TXT) · RGPD / HIPAA' : 'Patient owned. Free full raw DNA data export (.TXT) · GDPR / HIPAA'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 6: COMPANION LONGEVITY PROTOCOLS */}
            {activeTab === 'companion-protocols' && (
              <div className="eterna-section-card">
                <div className="eterna-section-header">
                  <div className="eterna-section-title-wrap">
                    <div className="eterna-section-icon">
                      <FlaskConical size={22} />
                    </div>
                    <div>
                      <h2 className="eterna-section-title">
                        {isEs ? 'Protocolos de Longevidad Alineados al Perfil Genético' : 'Companion Longevity Peptide Protocols'}
                      </h2>
                      <p className="eterna-section-subtitle">
                        {isEs
                          ? 'Intervenciones clínicas de precisión vinculadas a las variantes detectadas por el test ETERNA®.'
                          : 'Precision clinical interventions linked directly to variants identified in the ETERNA® report.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="eterna-protocols-grid">
                  {[
                    {
                      target: isEs ? 'Mantenimiento Telomérico & Rejuvenecimiento Epigenético' : 'Telomere Biology & Epigenetic Reset',
                      name: 'Epithalon (Pineal Bioregulator)',
                      desc: isEs ? 'Estimula la actividad de la transcriptasa inversa de telomerasa y sincroniza el eje neuroendocrino pineal.' : 'Upregulates telomerase reverse transcriptase activity and restores pineal neuroendocrine tone.',
                      href: '/p/epithalon'
                    },
                    {
                      target: isEs ? 'Biogénesis Mitocondrial & Flexibilidad Metabólica' : 'Mitochondrial Biogenesis & AMPK',
                      name: 'MOTS-c (Mitochondrial Peptide)',
                      desc: isEs ? 'Péptido codificado en el ADN mitocondrial que activa AMPK y mimetiza los efectos del ejercicio intenso.' : 'Mitochondrial-derived peptide activating AMPK, enhancing insulin sensitivity and metabolic flexibility.',
                      href: '/p/mots-c'
                    },
                    {
                      target: isEs ? 'Reparación de Tejido Conectivo & Ligamentos (COL1A1)' : 'Connective Tissue & Tendon Tensile (COL1A1)',
                      name: 'BPC-157 + TB-500 Synergy Course',
                      desc: isEs ? 'Angiogénesis rápida y regeneración de colágeno fibrilar para personas con variantes de riesgo articular.' : 'Accelerates VEGFR2 angiogenesis and fibrillar collagen synthesis for genetic joint susceptibility.',
                      href: '/p/bpc-157'
                    },
                    {
                      target: isEs ? 'Reparación de ADN & Sirtuinas (SIRT1 / PARP1)' : 'DNA Repair & Sirtuin Tone (SIRT1 / PARP1)',
                      name: 'NAD+ Coenzyme Injectable / NMN',
                      desc: isEs ? 'Restaura el dinucleótido de nicotinamida consumido por las enzimas de reparación del ADN celular.' : 'Replenishes intracellular NAD+ pools demanded by PARP1 and sirtuin longevity enzymes.',
                      href: '/p/nad-plus'
                    }
                  ].map((p, idx) => (
                    <div key={idx} className="eterna-protocol-card">
                      <div>
                        <div className="eterna-protocol-target">{p.target}</div>
                        <div className="eterna-protocol-name">{p.name}</div>
                        <p className="eterna-protocol-desc">{p.desc}</p>
                      </div>
                      <Link href={p.href} className="eterna-protocol-link">
                        <span>{isEs ? 'Ver Ficha' : 'View'}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: DEDICATED CLINICAL SIDEBAR ── */}
          <aside className="eterna-sidebar">
            
            {/* Sidebar Widget 1: Physician Longitudinal Wellness Companion */}
            <div className="eterna-sidebar-card highlight">
              <div className="eterna-sidebar-card-badge">
                <Activity size={12} />
                <span>{isEs ? 'Seguimiento Clínico' : 'Longitudinal Telemetry'}</span>
              </div>
              <h3 className="eterna-sidebar-title">
                {isEs ? 'Plataforma para Médicos' : 'Physician Patient Tracker'}
              </h3>
              <p className="eterna-sidebar-desc">
                {isEs 
                  ? 'Permite a clínicas monitorear el progreso del paciente comparando su línea base genética con re-tests semestrales.'
                  : 'Enables practices to track biological age velocity, validating lifestyle and peptide therapy outcomes over time.'}
              </p>

              <div className="eterna-sidebar-specs-list">
                <div className="eterna-sidebar-spec-row">
                  <span className="eterna-spec-label">{isEs ? 'Mapa Genético Basal:' : 'Genomic Baseline:'}</span>
                  <span className="eterna-spec-val">+700,000 SNPs</span>
                </div>
                <div className="eterna-sidebar-spec-row">
                  <span className="eterna-spec-label">{isEs ? 'Intervalo Re-Test:' : 'Tracking Interval:'}</span>
                  <span className="eterna-spec-val">6–12 {isEs ? 'Meses' : 'Months'}</span>
                </div>
                <div className="eterna-sidebar-spec-row">
                  <span className="eterna-spec-label">{isEs ? 'Sincronización Wearables:' : 'Wearable Telemetry:'}</span>
                  <span className="eterna-spec-val">24/7 HRV & Sleep</span>
                </div>
                <div className="eterna-sidebar-spec-row">
                  <span className="eterna-spec-label">{isEs ? 'Laboratorio Analítico:' : 'Accredited Lab:'}</span>
                  <span className="eterna-spec-val">Eurofins (ISO 15189)</span>
                </div>
              </div>
            </div>

            {/* Sidebar Widget 2: Kit Procurement & Batch Ordering */}
            <div className="eterna-sidebar-card">
              <div className="eterna-sidebar-header-row">
                <div>
                  <div className="eterna-sidebar-price">{currencySymbol}{price.toFixed(2)}</div>
                  <div className="eterna-sidebar-price-sub">{isEs ? 'PVP Incluye Kit + Análisis' : 'All-Inclusive Kit + Full Lab Report'}</div>
                </div>
                <span className="eterna-badge-saliva" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                  CE-IVD
                </span>
              </div>

              <div className="eterna-sidebar-batch-box">
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{isEs ? 'Lote Activo:' : 'Active Batch:'}</span>
                <span 
                  className="eterna-batch-code" 
                  onClick={handleCopyBatch}
                  title={isEs ? 'Copiar código de lote' : 'Copy batch code'}
                >
                  {effectiveBatchCode}
                  {copiedBatch ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                </span>
              </div>

              <div className="eterna-sidebar-cta-group">
                <button
                  type="button"
                  className="eterna-btn-primary full-width"
                  onClick={handleAddToCart}
                >
                  <Package size={16} />
                  <span>{isEs ? 'Añadir Kit a la Orden' : 'Add Kit to Order'}</span>
                </button>
                <button
                  type="button"
                  className="eterna-btn-secondary full-width"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                >
                  <HelpCircle size={15} />
                  <span>{isEs ? 'Consulta para Médicos' : 'Physician Inquiry'}</span>
                </button>
                <a
                  href="/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eterna-btn-secondary full-width"
                  style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderColor: 'rgba(45, 212, 191, 0.4)', color: '#2dd4bf', background: 'rgba(45, 212, 191, 0.05)' }}
                >
                  <Download size={14} />
                  <span>{isEs ? 'Ver Informe Clínico (PDF · 34 Págs)' : 'Sample Clinical Report (PDF · 34 Pgs)'}</span>
                </a>
                <button
                  type="button"
                  className="eterna-btn-secondary full-width"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderColor: 'rgba(234, 179, 8, 0.35)', color: '#facc15', background: 'rgba(234, 179, 8, 0.05)' }}
                  onClick={() => setIsB2BPortalModalOpen(true)}
                >
                  <ExternalLink size={14} />
                  <span>{isEs ? 'Demo Portal B2B Interactivo' : 'Live B2B Clinic Portal Demo'}</span>
                </button>
              </div>

              <div className="eterna-sidebar-guarantee-note">
                <Lock size={13} color="#2dd4bf" />
                <span>{isEs ? 'Envío 24-48h con retorno prefranqueado' : '24-48h dispatch with prepaid express return'}</span>
              </div>
            </div>

            {/* Sidebar Widget 3: Eurofins Laboratory Credentials */}
            <div className="eterna-sidebar-card">
              <h4 className="eterna-sidebar-section-heading">
                <ShieldCheck size={15} color="#2dd4bf" />
                <span>{isEs ? 'Credenciales de Laboratorio' : 'Laboratory Credentials'}</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                {isEs
                  ? 'Todas las muestras son procesadas en instalaciones europeas acreditadas de Eurofins Scientific, garantizando los más estrictos estándares de calidad analítica.'
                  : 'All patient specimens are accessioned and processed in Eurofins Scientific European diagnostic facilities under strict ISO standards.'}
              </p>
              
              <ul className="eterna-sidebar-checks-list">
                <li>
                  <CheckCircle2 size={13} color="#2dd4bf" />
                  <span>ISO 15189 (Medical Laboratories)</span>
                </li>
                <li>
                  <CheckCircle2 size={13} color="#2dd4bf" />
                  <span>ISO 17025 (Testing & Calibration)</span>
                </li>
                <li>
                  <CheckCircle2 size={13} color="#2dd4bf" />
                  <span>CE-IVD Directive EU 2017/746</span>
                </li>
                <li>
                  <CheckCircle2 size={13} color="#2dd4bf" />
                  <span>100% GDPR & HIPAA Compliant</span>
                </li>
              </ul>
            </div>

            {/* Sidebar Widget 4: Quick Nav Shortcuts */}
            <div className="eterna-sidebar-card">
              <h4 className="eterna-sidebar-section-heading">
                <BarChart3 size={15} color="#38bdf8" />
                <span>{isEs ? 'Secciones Rápidas' : 'Quick Navigation'}</span>
              </h4>
              <div className="eterna-sidebar-quick-links">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`eterna-quick-nav-btn ${activeTab === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    <span>{t.label}</span>
                    <ChevronRight size={12} />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── 4. Comprehensive Institutional Dark Footer ── */}
      <footer className="eterna-footer">
        <div className="eterna-footer-inner">
          <div className="eterna-footer-grid">
            {/* Column 1: Brand & Clinical Purpose */}
            <div className="eterna-footer-col">
              <div className="eterna-footer-brand">
                <span className="eterna-footer-logo-text">ETERNA® DX</span>
                <span className="eterna-footer-tag">Longevity Platform</span>
              </div>
              <p className="eterna-footer-text">
                {isEs
                  ? 'Plataforma médica de longevidad celular y genómica de precisión. Seguimiento continuo de la velocidad de envejecimiento, epigenética de órganos y telemetría biométrica de pacientes.'
                  : 'Medical precision genomics and cellular longevity tracking platform. Longitudinal telemetry monitoring biological pace of aging, organ epigenetics, and patient wellness.'}
              </p>
              <div className="eterna-footer-badge-pill">
                <ShieldCheck size={13} color="#2dd4bf" />
                <span>Eurofins Lab Network · ISO 15189</span>
              </div>
            </div>

            {/* Column 2: Analytical Pillars */}
            <div className="eterna-footer-col">
              <h5 className="eterna-footer-heading">{isEs ? 'Pilares Clínicos' : 'Clinical Pillars'}</h5>
              <ul className="eterna-footer-links">
                <li><button type="button" onClick={() => setActiveTab('biological-age')}>{isEs ? 'Relojes Epigenéticos Horvath/Hannum' : 'Horvath & Hannum Epigenetic Clocks'}</button></li>
                <li><button type="button" onClick={() => setActiveTab('patient-tracking')}>{isEs ? 'Seguimiento Longitudinal del Paciente' : 'Longitudinal Patient Telemetry'}</button></li>
                <li><button type="button" onClick={() => setActiveTab('five-pillars')}>{isEs ? 'Genotipado de +700.000 SNPs' : '+700,000 SNPs Microarray Mapping'}</button></li>
                <li><button type="button" onClick={() => setActiveTab('wearables-sync')}>{isEs ? 'Integración Oura / Apple Health' : 'Oura & Apple Health Sync'}</button></li>
                <li><button type="button" onClick={() => setActiveTab('companion-protocols')}>{isEs ? 'Protocolos Péptidos de Precisión' : 'Precision Peptide Protocols'}</button></li>
              </ul>
            </div>

            {/* Column 3: Quality & Lab Certification */}
            <div className="eterna-footer-col">
              <h5 className="eterna-footer-heading">{isEs ? 'Laboratorio & Calidad' : 'Laboratory & Standards'}</h5>
              <ul className="eterna-footer-links">
                <li><span>Eurofins Genomics Europe</span></li>
                <li><span>ISO 15189 Medical Lab Accredited</span></li>
                <li><span>ISO 17025 Certified Testing Facility</span></li>
                <li><span>CE-IVD In Vitro Diagnostic Directive</span></li>
                <li><span>100% Patient Data Ownership (.TXT Raw)</span></li>
              </ul>
            </div>

            {/* Column 4: Privacy & Security */}
            <div className="eterna-footer-col">
              <h5 className="eterna-footer-heading">{isEs ? 'Privacidad & Seguridad' : 'Privacy & Security'}</h5>
              <ul className="eterna-footer-links">
                <li><span>European GDPR (EU 2016/679) Compliant</span></li>
                <li><span>HIPAA Security Standards Aligned</span></li>
                <li><span>AES-256 Encryption at Rest & Transit</span></li>
                <li><span>Zero Genetic Data Commercialization</span></li>
                <li><span>Right to Erasure & Immediate Export</span></li>
              </ul>
            </div>
          </div>

          <div className="eterna-footer-disclaimer-box">
            <p>
              <strong>{isEs ? 'Aviso Médico & Uso Profesional:' : 'Professional Clinical Notice:'} </strong>
              {isEs
                ? 'El test ETERNA® DNA & Epigenetic Longevity Test y sus informes telemetricos asociados están orientados a la optimización del bienestar, medicina de longevidad preventiva e investigación de biomarcadores bajo supervisión médica cualificada. No constituyen una herramienta diagnóstica para patologías agudas aisladas.'
                : 'The ETERNA® DNA & Epigenetic Longevity Test and associated telemetry reports are intended for preventative health optimization, longevity research, and clinical tracking under the guidance of qualified healthcare professionals. Not intended to diagnose or treat acute pathology in isolation.'}
            </p>
          </div>

          <div className="eterna-footer-bottom">
            <div>
              © 2026 ETERNA DX · Analytical Processing by Eurofins Scientific SE. In partnership with Atlas Services.
            </div>
            <div className="eterna-footer-bottom-links">
              <Link href="/c/CAT-MU9L9GBN">{isEs ? 'Catálogo' : 'Catalog'}</Link>
              <Link href="/proto">{isEs ? 'Protocolos' : 'Protocols'}</Link>
              <button type="button" onClick={() => setIsInquiryDrawerOpen(true)}>
                {isEs ? 'Contacto Clínico' : 'Clinical Contact'}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Sticky Action Bar on Mobile/Desktop ── */}
      <PublicStickyActionBar
        productName={name}
        price={price}
        currency={currency}
        dose={initialStrength}
        batch={effectiveBatchCode}
        onAddToCart={handleAddToCart}
        onInquire={() => setIsInquiryDrawerOpen(true)}
        onShare={() => setIsShareDrawerOpen(true)}
        lang={lang}
      />

      {/* ── Modals & Drawers ── */}
      {isImageModalOpen && (
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={modalImage.src}
          altText={modalImage.title || "ETERNA DX Showcase Image"}
        />
      )}

      {isInquiryDrawerOpen && (
        <PublicInstitutionalInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          product={{
            name,
            slug,
            batch: effectiveBatchCode,
            supplierName: 'ETERNA DX · Eurofins Lab',
            price,
            presentation: 'kit'
          }}
          lang={lang}
        />
      )}

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

      {/* ── Live Eterna B2B Portal Modal ── */}
      {isB2BPortalModalOpen && (
        <div className="eterna-b2b-modal-overlay" onClick={() => setIsB2BPortalModalOpen(false)}>
          <div className="eterna-b2b-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="eterna-b2b-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2dd4bf' }} />
                <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                  {isEs ? 'Eterna · Portal de Salud Preventiva (Demo B2B)' : 'Eterna · Preventive Health Clinic Portal (Live B2B Demo)'}
                </strong>
                <span style={{ fontSize: '0.72rem', background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  INTERACTIVE B2B DEMO
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="/eterna/eterna-b2b-portal.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eterna-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
