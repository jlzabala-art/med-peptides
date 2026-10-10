"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Dna,
  ShieldCheck,
  Sparkles,
  Activity,
  Heart,
  Clock,
  CheckCircle2,
  Download,
  Smartphone,
  Cpu,
  ArrowRight,
  Layers,
  FlaskConical,
  ZoomIn,
  Copy,
  Check,
  FileText,
  HelpCircle,
  Package,
  Calendar,
  Share2,
  ExternalLink,
  Info
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
  initialBatch = 'AS-FAG-TR01-2610',
  initialStrength = '1 test / kit',
  baseUrl = 'https://med-peptides.com'
}) {
  const [lang, setLang] = useState('es');
  const [activeTab, setActiveTab] = useState('biological-age');
  const [activePillar, setActivePillar] = useState('longevity');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [copiedBatch, setCopiedBatch] = useState(false);

  const { updateCart } = useCart() || {};

  const isEs = lang === 'es';

  // Core identifiers
  const name = product.name || 'ETERNA® DNA & Epigenetic Longevity Test';
  const effectiveBatchCode = initialBatch || product.batch || 'AS-FAG-TR01-2610';
  const price = product.price || product.min_unit_price || 199.00;
  const currency = product.currency || 'EUR';
  const currencySymbol = currency === 'EUR' ? '€' : '$';

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
        supplierId: 'supplier-eternadx'
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
    { id: 'biological-age', label: isEs ? 'Edad Biológica & Algoritmo' : 'Biological Age & Clocks', icon: Clock },
    { id: 'five-pillars', label: isEs ? '5 Pilares Genómicos (+700K SNPs)' : '5 Genomic Pillars (+700K SNPs)', icon: Dna },
    { id: 'wearables-sync', label: isEs ? 'Integración Wearables' : 'Wearables Telemetry', icon: Smartphone },
    { id: 'saliva-protocol', label: isEs ? 'Protocolo de Saliva (2 Min)' : '2-Min Saliva Protocol', icon: Layers },
    { id: 'traceability', label: isEs ? 'Certificación & Lab Europeo' : 'Lab Certification & Traceability', icon: ShieldCheck },
    { id: 'companion-protocols', label: isEs ? 'Protocolos de Longevidad' : 'Companion Protocols', icon: FlaskConical }
  ];

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
        : 'Caffeine clearance genetics, plant Omega-3 EPA/DHA conversion, folate methylation cycle, and micronutrient transport.',
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
        supplierName="ETERNA DX · Fagron Genomics"
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
          {/* Left Column: Scientific Value Proposition */}
          <div>
            <div className="eterna-hero-badges">
              <span className="eterna-badge-brand">
                <Dna size={13} /> ETERNA DX · Fagron Genomics
              </span>
              <span className="eterna-badge-saliva">
                <Layers size={13} /> {isEs ? '100% Saliva (Sin Agujas)' : '100% Saliva (Needle-Free)'}
              </span>
              <span className="eterna-badge-ce">
                <ShieldCheck size={13} /> CE-IVD Marked · ISO 15189 Lab
              </span>
            </div>

            <h1 className="eterna-hero-title">
              ETERNA® DNA & Epigenetic Longevity Test
            </h1>

            <div className="eterna-hero-tagline">
              {isEs 
                ? '«Tu ADN es el mapa. Tu reloj, tu brújula.»'
                : '“Your DNA is the map. Your watch, your compass.”'}
            </div>

            <p className="eterna-hero-subtitle">
              {isEs
                ? 'La única plataforma médica de precisión que unifica tu genoma completo (+700.000 variantes SNPs), proteómica de órganos, analíticas sanguíneas y biomarcadores en tiempo real de tu wearable (Apple Health, Garmin, Oura) para guiar tu longevidad.'
                : 'The only precision medicine platform that combines your complete genome (+700,000 SNPs), organ-level proteomics, blood biochemistry, and continuous wearable telemetry (Apple Health, Garmin, Oura) into an actionable healthspan trajectory.'}
            </p>

            {/* 4 KPIs Row */}
            <div className="eterna-hero-stats-row">
              <div className="eterna-stat-card">
                <div className="eterna-stat-num teal">+700K</div>
                <div className="eterna-stat-label">{isEs ? 'Variantes Genéticas' : 'Genetic SNPs'}</div>
              </div>
              <div className="eterna-stat-card">
                <div className="eterna-stat-num gold">183</div>
                <div className="eterna-stat-label">{isEs ? 'Métricas de Salud' : 'Health Biomarkers'}</div>
              </div>
              <div className="eterna-stat-card">
                <div className="eterna-stat-num cyan">2 Min</div>
                <div className="eterna-stat-label">{isEs ? 'Muestreo en Casa' : 'Saliva at Home'}</div>
              </div>
              <div className="eterna-stat-card">
                <div className="eterna-stat-num purple">.TXT Raw</div>
                <div className="eterna-stat-label">{isEs ? 'Propiedad de Datos' : '100% Data Owner'}</div>
              </div>
            </div>

            {/* Manufacturer credentials */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                <CheckCircle2 size={15} color="#2dd4bf" />
                <span>{isEs ? '+15 Años de experiencia médica' : '+15 Years Precision Medicine'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                <CheckCircle2 size={15} color="#2dd4bf" />
                <span>{isEs ? 'Investigación Cambridge UK' : 'Cambridge UK Research'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                <CheckCircle2 size={15} color="#2dd4bf" />
                <span>{isEs ? 'Cumplimiento RGPD & HIPAA' : 'GDPR & HIPAA Compliant'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Kit Packaging Showcase & Procurement */}
          <div className="eterna-hero-media-card">
            <div 
              className="eterna-media-viewport"
              onClick={() => setIsImageModalOpen(true)}
              title={isEs ? 'Haz clic para ampliar la caja del kit oficial' : 'Click to inspect official kit box'}
            >
              <img
                src="/images/products/eterna/eterna-kit-box.png"
                alt="ETERNA DX DNA & Epigenetic Longevity Test Kit"
                className="eterna-kit-img"
              />
              <div className="eterna-zoom-overlay">
                <ZoomIn size={13} />
                <span>{isEs ? 'Inspeccionar Kit CE' : 'Inspect CE Kit'}</span>
              </div>
            </div>

            <div className="eterna-hero-procurement-bar">
              <div className="eterna-price-row">
                <div>
                  <div className="eterna-price-val">{currencySymbol}{price.toFixed(2)}</div>
                  <div className="eterna-price-sub">
                    {isEs ? 'PVP Incluye Kit de Saliva + Análisis Completo' : 'Includes Saliva Kit + Full Genetic Report'}
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
                  <span>{isEs ? 'Consulta Médica' : 'Inquire'}</span>
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
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Tab Content Modules ── */}

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
                      ? 'Basado en los algoritmos epigenéticos patentados de metilación del ADN y proteómica funcional de ETERNA DX.'
                      : 'Driven by ETERNA DX patented DNA methylation algorithms and organ-level functional proteomics.'}
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
                    <span className="eterna-rate-unit">{isEs ? 'Años Biol. / Año Cronol.' : 'Biol. Years / Chron. Year'}</span>
                  </div>
                  <div className="eterna-rate-pill">
                    <CheckCircle2 size={13} />
                    <span>{isEs ? 'ENVEJECIMIENTO DESACELERADO (-18%)' : 'DECELERATED AGING VELOCITY (-18%)'}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, margin: '1.25rem 0 0 0' }}>
                  {isEs
                    ? 'Por cada 365 días en tu reloj cronológico, tu organismo acumula únicamente el desgaste biológico equivalente a 0.82 años. Tu epigenoma muestra una resiliencia protectora que retrasa la senescencia celular sistémica.'
                    : 'For every calendar year elapsed, your physiological profile accumulates only 0.82 years of biological wear. Your epigenetic state demonstrates significant protective resilience delaying cellular senescence.'}
                </p>
              </div>

              {/* Organ Ages List */}
              <div className="eterna-organ-age-list">
                {[
                  {
                    organ: isEs ? 'Sistema Nervioso Central & Cognición' : 'Central Nervous System & Brain',
                    delta: '-4.2 Años',
                    status: isEs ? 'Óptimo' : 'Optimal',
                    desc: isEs ? 'Protección frente al declive neurodegenerativo' : 'High cognitive reserve & neuroprotection'
                  },
                  {
                    organ: isEs ? 'Sistema Cardiovascular & Endotelio' : 'Cardiovascular System & Endothelium',
                    delta: '-2.8 Años',
                    status: isEs ? 'Favorable' : 'Favorable',
                    desc: isEs ? 'Elasticidad arterial y baja rigidez de pulso' : 'Arterial elasticity and low pulse wave velocity'
                  },
                  {
                    organ: isEs ? 'Sistema Inmune & Senescencia (Inmunosenescencia)' : 'Immune & Inflammatory Age',
                    delta: '-5.1 Años',
                    status: isEs ? 'Excelente' : 'Excellent',
                    desc: isEs ? 'Ratio CD4/CD8 equilibrado y baja carga SASP' : 'Balanced CD4/CD8 ratio and low SASP cytokine burden'
                  },
                  {
                    organ: isEs ? 'Metabolismo & Sensibilidad a la Insulina' : 'Metabolic & Glycemic Regulation',
                    delta: '-3.4 Años',
                    status: isEs ? 'Optimizado' : 'Optimized',
                    desc: isEs ? 'Flexibilidad mitocondrial y control glicémico' : 'Mitochondrial flexibility and glucose disposal'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="eterna-organ-row">
                    <div>
                      <div className="eterna-organ-name">{item.organ}</div>
                      <div className="eterna-organ-meta">{item.desc}</div>
                    </div>
                    <div>
                      <div className="eterna-organ-delta">{item.delta}</div>
                      <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700, display: 'block', textAlign: 'right' }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THE 5 GENOMIC PILLARS */}
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
                      ? 'Analizador exhaustivo de polimorfismos que determinan tu respuesta individual a nutrientes, entrenamiento y fármacos.'
                      : 'Comprehensive genotyping across the 5 human regulatory axes governing performance and longevity.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pillar Buttons */}
            <div className="eterna-pillars-selector">
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
                      ? 'Sincronización continua de datos biométricos dinámicos con tu código genético estático.'
                      : 'Continuous synchronization uniting dynamic biometric telemetry with your static DNA blueprint.'}
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
                  {isEs ? 'Tu Reloj es tu Brújula Diaria' : 'Your Watch Is Your Daily Compass'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                  {isEs
                    ? 'La genética te dice cuál es tu predisposición innata, pero tu reloj inteligente te muestra lo que le ocurre a tu organismo en tiempo real. ETERNA DX cruza tu variabilidad de frecuencia cardíaca (VFC), fases de sueño profundo y VO2 máx con tus variantes genéticas para calcular tu salud funcional cada día.'
                    : 'Genetics define your baseline predispositions, but your smartwatch captures what is happening in vivo right now. ETERNA DX cross-references your Heart Rate Variability (HRV), slow-wave delta sleep architecture, and VO2 max against your genetic SNPs to calculate your functional health score.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    {
                      title: isEs ? 'Variabilidad del Ritmo Cardíaco (HRV)' : 'Heart Rate Variability (HRV)',
                      desc: isEs ? 'Monitorea la recuperación simpático/parasimpática guiada por el gen IL6.' : 'Tracks autonomic nervous balance aligned to your IL6 inflammatory genotype.'
                    },
                    {
                      title: isEs ? 'Arquitectura del Sueño (Fases REM y Profundo)' : 'Sleep Architecture & Delta Waves',
                      desc: isEs ? 'Sincronizado con tus polimorfismos CLOCK y PER3 para optimizar tu descanso.' : 'Synchronized against CLOCK and PER3 variants to calculate sleep latency targets.'
                    },
                    {
                      title: isEs ? 'Carga de Entrenamiento & Recuperación' : 'Training Load & Strain Score',
                      desc: isEs ? 'Calibrado con tu perfil ACTN3 de fibras musculares para evitar el sobreentrenamiento.' : 'Calibrated to your ACTN3 muscle fiber profile to prevent overtraining syndrome.'
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

              <div className="eterna-wearables-img-card">
                <img
                  src="/images/products/eterna/eterna-hero-app.png"
                  alt="ETERNA DX App Dashboard"
                  className="eterna-wearables-img"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 2-MINUTE SALIVA PROTOCOL & KIT CONTENTS */}
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
                      ? 'Sin agujas, sin extracciones dolorosas. Estabilizador de ADN líquido certificado CE-IVD estable a temperatura ambiente.'
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
                  desc: isEs ? 'Agitar suavemente 5 veces e introducir el tubo en el sobre prefranqueado para el laboratorio europeo.' : 'Invert tube 5 times and place inside prepaid courier envelope for the certified European lab.'
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
                <div>• {isEs ? 'Sobre de retorno urgente prefranqueado' : 'Prepaid express return envelope to accredited lab'}</div>
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
                    {isEs ? 'Certificación, Acreditación & Trazabilidad' : 'Lab Accreditation & Batch Traceability'}
                  </h2>
                  <p className="eterna-section-subtitle">
                    {isEs
                      ? 'Fabricado por ETERNA Diagnostics S.L. y distribuido bajo acuerdo con Fagron Genomics.'
                      : 'Manufactured by ETERNA Diagnostics S.L. and distributed in partnership with Fagron Genomics.'}
                  </p>
                </div>
              </div>
            </div>

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
                  <td>{isEs ? 'Fabricante Oficial' : 'Official Manufacturer'}</td>
                  <td>ETERNA Diagnostics S.L. (Paseo de la Castellana / Barcelona, Spain)</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Distribuidor & Partner' : 'Distribution Partner'}</td>
                  <td>Fagron Genomics S.L.U.</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Marcado Regulatorio' : 'Regulatory Compliance'}</td>
                  <td>CE-IVD Marked (Directiva EU 2017/746 sobre diagnóstico in vitro)</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Procesamiento Analítico' : 'Processing Facility'}</td>
                  <td>European Molecular Genetics Consortium · ISO 15189 / ISO 13485</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Tecnología de Genotipado' : 'Genotyping Platform'}</td>
                  <td>High-Density DNA Microarray (+700,000 SNPs en GRCh38 / hg38)</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Tipo de Muestra' : 'Specimen Matrix'}</td>
                  <td>Saliva humana estabilizada (2 mL de saliva total)</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Tiempo de Respuesta' : 'Clinical Turnaround Time'}</td>
                  <td>15–20 {isEs ? 'días hábiles desde recepción en laboratorio' : 'business days from lab accessioning'}</td>
                </tr>
                <tr>
                  <td>{isEs ? 'Propiedad de los Datos' : 'Data Privacy & Ownership'}</td>
                  <td>
                    100% {isEs ? 'Propiedad del paciente. Descarga libre de archivo genético bruto (.TXT)' : 'Patient owned. Free full raw DNA data export (.TXT) · GDPR / HIPAA'}
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
          imageUrl="/images/products/eterna/eterna-kit-box.png"
          altText="ETERNA DX DNA & Epigenetic Longevity Test Kit Box"
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
            supplierName: 'ETERNA DX · Fagron Genomics',
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
            supplierName: 'ETERNA Diagnostics'
          }}
          lang={lang}
        />
      )}
    </div>
  );
}
