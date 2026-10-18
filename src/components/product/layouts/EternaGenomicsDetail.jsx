"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Monitor,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sun,
  Moon
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
import EternaRiskScoreBar from '@/components/diagnostic/eterna/EternaRiskScoreBar';
import './EternaGenomicsDetail.css';

export default function EternaGenomicsDetail({
  product = {},
  slug = 'eterna-epigenetic-age-test',
  initialBatch = 'AS-ETR-EUR01-2610',
  initialStrength = '1 test / kit',
  baseUrl = 'https://www.atlashealth-services.com'
}) {
  // English by default as requested in platform standards
  const [lang, setLang] = useState('en');
  const [activePillar, setActivePillar] = useState('sport');
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isB2BPortalModalOpen, setIsB2BPortalModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ src: '', title: '' });

  const isEs = lang === 'es';

  // Identifiers
  const name = product.name || (isEs ? 'Plataforma Genómica & Epigenética ETERNA®' : 'ETERNA® DNA & Epigenetic Longevity Platform');
  const effectiveBatchCode = initialBatch || product.batch || 'AS-ETR-EUR01-2610';

  const handleOpenModal = (src, title) => {
    setModalImage({ src, title });
    setIsImageModalOpen(true);
  };

  // Reorganized Physician-Directed Sections
  const eternaSections = useMemo(() => [
    { id: 'overview', label: isEs ? 'Visión General' : 'Overview & Diagnostic Stage', icon: Sparkles },
    { id: 'flujo-clinico', label: isEs ? 'Flujo de Prescripción (5 Pasos)' : 'Clinical Prescribing Flow', icon: Clock },
    { id: 'pilares', label: isEs ? '5 Pilares Genómicos' : '5 Clinical Pillars', icon: Layers },
    { id: 'snp-table', label: isEs ? 'Directorio SNPs & dbSNP' : 'Actionable SNPs Directory', icon: BarChart3 },
    { id: 'integracion', label: isEs ? 'Matriz de Prescripción Atlas' : 'Translational Prescribing Matrix', icon: Activity },
    { id: 'biometrics', label: isEs ? 'Biometría & ActivAge' : 'Biometrics & ActivAge', icon: Smartphone },
    { id: 'portal-demo', label: isEs ? 'Consola Médica B2B' : 'B2B Clinical Console', icon: Monitor, badge: 'LIVE DEMO' },
    { id: 'investigacion', label: isEs ? 'Rigor Analítico & Lab' : 'Analytical Rigor & Lab', icon: ShieldCheck },
    { id: 'productos', label: isEs ? 'Gama Clínica & Asignación' : 'Clinical Suite & Practice Packs', icon: Package }
  ], [isEs]);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'inicio' || hash === 'overview') return 'overview';
      if (hash === 'como-funciona') return 'flujo-clinico';
      if (hash === 'demo' || hash === 'b2b-portal' || hash === 'portal-demo') return 'portal-demo';
      if (hash) return hash;
    }
    return 'overview';
  });

  const [snpSearch, setSnpSearch] = useState('');
  const [selectedPillarFilter, setSelectedPillarFilter] = useState('all');

  // Interactive B2B Clinical Console & B2C Patient Mobile Demo State
  const demoIframeRef = useRef(null);
  const [demoTheme, setDemoTheme] = useState('light');
  const [demoIframeKey, setDemoIframeKey] = useState(0);
  const [demoViewMode, setDemoViewMode] = useState('b2b'); // 'b2b' | 'b2c_mobile' | 'b2c_web'

  const handleToggleDemoTheme = useCallback(() => {
    const nextTheme = demoTheme === 'light' ? 'dark' : 'light';
    setDemoTheme(nextTheme);
    if (demoIframeRef.current && demoIframeRef.current.contentWindow) {
      demoIframeRef.current.contentWindow.postMessage({
        type: 'eterna-theme',
        theme: nextTheme
      }, '*');
    }
  }, [demoTheme]);

  const handleResetDemo = useCallback(() => {
    setDemoIframeKey(k => k + 1);
  }, []);

  // Atlas <-> Eterna Demo Two-Way PostMessage Listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMessage = (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'eterna-download-pdf') {
        window.open('/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf', '_blank', 'noopener,noreferrer');
      } else if (event.data.type === 'eterna-import-test') {
        setIsInquiryDrawerOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const scrollToSection = useCallback((id) => {
    if (!id) return;
    const targetId = id === 'inicio' ? 'overview' : (id === 'como-funciona' ? 'flujo-clinico' : (id === 'demo' || id === 'b2b-portal' ? 'portal-demo' : id));
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
      } else if (hash === 'como-funciona') {
        setActiveTab('flujo-clinico');
      } else if (hash === 'demo' || hash === 'b2b-portal' || hash === 'portal-demo') {
        setActiveTab('portal-demo');
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
    if (activeTab === 'como-funciona') return 'flujo-clinico';
    if (activeTab === 'demo' || activeTab === 'b2b-portal') return 'portal-demo';
    const exists = eternaSections.some(s => s.id === activeTab);
    return exists ? activeTab : 'overview';
  }, [activeTab, eternaSections]);

  const currentSectionIndex = useMemo(() => {
    return eternaSections.findIndex(s => s.id === effectiveActiveTab);
  }, [eternaSections, effectiveActiveTab]);

  const currentSectionObj = useMemo(() => {
    return eternaSections[currentSectionIndex] || eternaSections[0];
  }, [eternaSections, currentSectionIndex]);

  // Structured High-Impact Genomic SNPs Analyzed (Physician Reference)
  const snpData = useMemo(() => [
    {
      id: 'actn3',
      gene: 'ACTN3',
      rsid: 'rs1815739',
      pillar: isEs ? 'Deporte' : 'Sport',
      pillarId: 'sport',
      effect: isEs 
        ? 'Genotipo R577X. Modula la presencia de alfa-actinina-3 en fibras musculares rápidas tipo IIx; condiciona potencia explosiva vs fatiga.' 
        : 'R577X polymorphism modulating alpha-actinin-3 in fast-twitch Type IIx muscle fibers; dictates explosive power vs endurance.',
      intervention: isEs 
        ? 'Ajuste de cargas pliométricas + Sinergia de regeneración tisular BPC-157 / TB-500' 
        : 'High-velocity power resistance training + BPC-157 / TB-500 recovery protocol'
    },
    {
      id: 'col1a1',
      gene: 'COL1A1',
      rsid: 'rs1800012',
      pillar: isEs ? 'Deporte' : 'Sport',
      pillarId: 'sport',
      effect: isEs 
        ? 'Polimorfismo Sp1 (+1245G/T). Altera la proporción alfa-1/alfa-2 del colágeno tipo I; mayor susceptibilidad a roturas tendinosas y ligamentosas.' 
        : 'Sp1 polymorphism (+1245G/T) altering collagen type I alpha-1/alpha-2 ratio; elevated susceptibility to cruciate ligament and Achilles tears.',
      intervention: isEs 
        ? 'Protocolo de fortalecimiento excéntrico tendinoso + Péptidos de Colágeno bioactivos tipo I/III + Vitamina C' 
        : 'Eccentric tendon loading protocol + Bioactive type I/III collagen peptides + High-dose Ascorbic Acid'
    },
    {
      id: 'mthfr',
      gene: 'MTHFR',
      rsid: 'rs1801133',
      pillar: isEs ? 'Nutrición' : 'Nutrition',
      pillarId: 'nutrition',
      effect: isEs 
        ? 'Variante C677T. Reducción de hasta un 65% en la transmetilación del folato a 5-MTHF; riesgo de hiperhomocisteinemia y bloqueo de desintoxicación.' 
        : 'C677T variant. Up to 65% loss in enzymatic conversion of folate to active 5-MTHF; elevated plasma homocysteine and impaired methylation.',
      intervention: isEs 
        ? 'Evitar ácido fólico sintético; prescribir L-Metilfolato cálcico (1.000 mcg) + Metilcobalamina B12 + TMG' 
        : 'Avoid synthetic folic acid; prescribe Calcium L-Methylfolate (1,000 mcg) + Methyl-B12 + TMG'
    },
    {
      id: 'cyp1a2',
      gene: 'CYP1A2',
      rsid: 'rs762551',
      pillar: isEs ? 'Nutrición' : 'Nutrition',
      pillarId: 'nutrition',
      effect: isEs 
        ? 'Metabolismo hepático de cafeína (alelo A rápido vs C lento). Tasa de aclaramiento del citocromo P450 1A2 en sangre.' 
        : 'Hepatic caffeine clearance rate via Cytochrome P450 1A2 (A allele rapid vs C allele slow metabolizer).',
      intervention: isEs 
        ? 'En metabolizadores lentos, suspender cafeína >8h antes del descanso para preservar arquitectura del sueño profundo' 
        : 'Slow metabolizers: strict caffeine cutoff >8h pre-bedtime to protect deep restorative sleep architecture'
    },
    {
      id: 'vdr',
      gene: 'VDR',
      rsid: 'rs2228570',
      pillar: isEs ? 'Nutrición' : 'Nutrition',
      pillarId: 'nutrition',
      effect: isEs 
        ? 'Polimorfismo FokI (T/C). Modifica la afinidad del receptor nuclear de Vitamina D y la densidad mineral ósea.' 
        : 'FokI polymorphism (T/C) altering nuclear Vitamin D Receptor transcriptional affinity and bone mineral density.',
      intervention: isEs 
        ? 'Dosificación terapéutica de Vitamina D3 (5.000 UI/día) + K2 MK-7 (100 mcg) + monitorización sérica de 25-OH-D3' 
        : 'Therapeutic Vitamin D3 titration (5,000 IU/day) + K2 MK-7 (100 mcg) + 25-OH-D3 serum surveillance'
    },
    {
      id: 'apoe',
      gene: 'APOE',
      rsid: 'rs429358',
      pillar: isEs ? 'Prevención' : 'Prevention',
      pillarId: 'prevention',
      effect: isEs 
        ? 'Isoformas ε2/ε3/ε4. Modula el aclaramiento endotelial de partículas ricas en ApoB y riesgo aterogénico vascular.' 
        : 'ApoE ε2/ε3/ε4 isoforms regulating vascular clearance of ApoB-rich atherogenic particles and neurovascular risk.',
      intervention: isEs 
        ? 'Optimización de ácidos grasos EPA/DHA de alta concentración (ratio 2:1) + monitorización trimestral de ApoB y Lp(a)' 
        : 'High-concentration EPA/DHA protocol (2:1 ratio) + quarterly ApoB and Lp(a) surveillance'
    },
    {
      id: 'lpa',
      gene: 'LPA',
      rsid: 'rs10455872',
      pillar: isEs ? 'Prevención' : 'Prevention',
      pillarId: 'prevention',
      effect: isEs 
        ? 'Variante intrónica asociada a niveles plasmáticos genéticamente elevados de Lipoproteína(a) y calcificación aórtica.' 
        : 'Intronic variant linked to lifelong genetically elevated Lipoprotein(a) [Lp(a)] levels and aortic valve calcification.',
      intervention: isEs 
        ? 'Control intensivo de ApoB residual (<60 mg/dL), coenzima Q10 Ubiquinol (200 mg) y cribado vascular precoz' 
        : 'Intensive baseline ApoB lowering (<60 mg/dL), CoQ10 Ubiquinol (200 mg), and early cardiovascular screening'
    },
    {
      id: 'foxo3',
      gene: 'FOXO3',
      rsid: 'rs2802292',
      pillar: isEs ? 'Longevidad' : 'Longevity',
      pillarId: 'longevity',
      effect: isEs 
        ? 'Alelo promotor G de longevidad excepcional. Estimula transcripción de factores de autofagia celular y resistencia a senescencia.' 
        : 'G-promoter allele associated with human exceptional longevity, autophagy induction and oxidative stress resilience.',
      intervention: isEs 
        ? 'Protocolo bimensual de activación telomérica Epitalon (10mg) + Inyección/Infusión de NAD+ + Ciclos de ayuno' 
        : 'Bi-monthly Epitalon telomeric cycle (10mg) + NAD+ injection/infusion + Sirtuin activation protocol'
    },
    {
      id: 'tcf7l2',
      gene: 'TCF7L2',
      rsid: 'rs7903146',
      pillar: isEs ? 'Longevidad' : 'Longevity',
      pillarId: 'longevity',
      effect: isEs 
        ? 'Variante C>T en el gen factor de transcripción 7-like 2. Principal predictor genético de sensibilidad insulínica e incretinas (GLP-1).' 
        : 'C>T variant in transcription factor 7-like 2. Primary genomic predictor of beta-cell function and GLP-1 incretin sensitivity.',
      intervention: isEs 
        ? 'Protocolo de modulación metabólica con agonistas GLP-1/GIP (Tirzepatida/Semaglutida) + Berberina / Metformina' 
        : 'Targeted metabolic modulation with dual GLP-1/GIP agonists (Tirzepatide/Semaglutide) + Berberine / Metformin'
    },
    {
      id: 'clock',
      gene: 'CLOCK',
      rsid: 'rs1801260',
      pillar: isEs ? 'Bienestar' : 'Social',
      pillarId: 'social',
      effect: isEs 
        ? 'Polimorfismo 3111T/C. Regula la amplitud del oscilador maestro en el núcleo supraquiasmático y la latencia del sueño.' 
        : '3111T/C polymorphism modulating master suprachiasmatic oscillator amplitude, chronotype delay, and sleep latency.',
      intervention: isEs 
        ? 'Terapia de sincronización circadiana: fotobiomodulación matutina (>10.000 lux) + Péptido DSIP nocturno + Bisglicinato de Magnesio' 
        : 'Circadian photobiomodulation (>10,000 lux) + evening DSIP deep sleep peptide + Magnesium Bisglycinate'
    },
    {
      id: 'comt',
      gene: 'COMT',
      rsid: 'rs4680',
      pillar: isEs ? 'Bienestar' : 'Social',
      pillarId: 'social',
      effect: isEs 
        ? 'Polimorfismo Val158Met (G>A). Determina tasa de degradación enzimática de catecolaminas (dopamina, adrenalina) en córtex prefrontal.' 
        : 'Val158Met polymorphism (G>A). Dictates enzymatic clearance rate of prefrontal dopamine and catecholamines (Worrier vs Warrior).',
      intervention: isEs 
        ? 'Met/Met (lento): soporte con L-Teanina y adaptógenos reguladores de cortisol; Val/Val (rápido): precursores tirosina/dopamina' 
        : 'Met/Met (slow): support with L-Theanine and cortisol adaptogens; Val/Val (fast): tyrosine and dopamine precursors'
    }
  ], [isEs]);

  const filteredSnps = useMemo(() => {
    return snpData.filter((snp) => {
      const matchesFilter = selectedPillarFilter === 'all' || snp.pillarId === selectedPillarFilter;
      const matchesSearch = !snpSearch || 
        snp.gene.toLowerCase().includes(snpSearch.toLowerCase()) ||
        snp.rsid.toLowerCase().includes(snpSearch.toLowerCase()) ||
        snp.effect.toLowerCase().includes(snpSearch.toLowerCase()) ||
        snp.intervention.toLowerCase().includes(snpSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [snpData, selectedPillarFilter, snpSearch]);

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
      width: '16%',
      render: (row) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--gcp-text-primary)', fontWeight: 500 }}>
          {row.pillar}
        </span>
      )
    },
    {
      key: 'effect',
      label: isEs ? 'Impacto Fenotípico' : 'Phenotypic Impact',
      width: '26%',
      render: (row) => (
        <span style={{ fontSize: '0.79rem', lineHeight: 1.45, color: 'var(--gcp-text-secondary)' }}>
          {row.effect}
        </span>
      )
    },
    {
      key: 'intervention',
      label: isEs ? 'Acción Clínica Atlas' : 'Atlas Protocol Action',
      width: '26%',
      render: (row) => (
        <span style={{ fontSize: '0.79rem', color: 'var(--gcp-blue-primary)', fontWeight: 500, lineHeight: 1.45 }}>
          {row.intervention}
        </span>
      )
    }
  ], [isEs]);

  // 5 Genetic Pillars definitions (Original EternaRx & EternaDX)
  const pillars = [
    {
      id: 'sport',
      title: isEs ? 'Deporte & Tejido Conectivo' : 'Sport & Musculoskeletal',
      desc: isEs 
        ? 'Resistencia aeróbica, potencia de contracción rápida, vulnerabilidad de tendones y velocidad de recuperación' 
        : 'Aerobic capacity, fast-twitch power, soft tissue resilience and muscle damage recovery rate',
      icon: HeartPulse,
      color: '#1a73e8',
      bg: 'rgba(26, 115, 232, 0.08)',
      border: 'rgba(26, 115, 232, 0.25)'
    },
    {
      id: 'nutrition',
      title: isEs ? 'Nutrición & Metilación' : 'Nutrition & Methylation',
      desc: isEs 
        ? 'Transmetilación del folato (MTHFR), aclaramiento hepático citocromo P450, absorción de vitamina D y cinética lipídica' 
        : 'One-carbon folate transmethylation (MTHFR), CYP1A2 clearance, Vitamin D nuclear receptor and lipid assimilation',
      icon: FlaskConical,
      color: '#15803d',
      bg: 'rgba(21, 128, 61, 0.08)',
      border: 'rgba(21, 128, 61, 0.25)'
    },
    {
      id: 'prevention',
      title: isEs ? 'Prevención Cardiovascular' : 'Cardiovascular Prevention',
      desc: isEs 
        ? 'Isoformas ApoE ε2/ε3/ε4, residencia endotelial de partículas aterogénicas, Lipoproteína(a) y rigidez arterial' 
        : 'ApoE ε2/ε3/ε4 lipid handling, atherogenic vascular residence, Lipoprotein(a) and endothelial compliance',
      icon: Brain,
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.08)',
      border: 'rgba(124, 58, 237, 0.25)'
    },
    {
      id: 'longevity',
      title: isEs ? 'Longevidad & Senescencia' : 'Longevity & Autophagy',
      desc: isEs 
        ? 'Alelos promotores FOXO3, activación de sirtuinas (SIRT1), mantenimiento de telómeros y degradación de ADN' 
        : 'FOXO3 longevity alleles, sirtuin signaling, telomerase maintenance and cellular senescence defense',
      icon: Zap,
      color: '#b45309',
      bg: 'rgba(180, 83, 9, 0.08)',
      border: 'rgba(180, 83, 9, 0.25)'
    },
    {
      id: 'social',
      title: isEs ? 'Cronobiología & Bienestar' : 'Circadian & Neuroendocrine',
      desc: isEs 
        ? 'Oscilador circadiano CLOCK 3111T/C, aclaramiento catecolaminérgico COMT, eje HPA y fases de sueño profundo delta' 
        : 'Circadian CLOCK 3111T/C master oscillator, COMT catecholamine clearance, HPA axis and delta sleep stability',
      icon: Star,
      color: '#0d9488',
      bg: 'rgba(13, 148, 136, 0.08)',
      border: 'rgba(13, 148, 136, 0.25)'
    }
  ];

  // 5 Steps Physician Clinical Workflow Data
  const clinicalSteps = [
    {
      step: '01',
      title: isEs ? 'Toma de Muestra Salival CE-IVDR' : 'CE-IVDR Saliva Sample Collection',
      badge: isEs ? 'Clínica o Domicilio' : 'In-Clinic or Mail',
      desc: isEs 
        ? 'Muestreo no invasivo sin aguja mediante tubo con tampón estabilizador de ADN a temperatura ambiente (estable 24 meses). Trazabilidad digital mediante código de barras 2D.' 
        : 'Painless needle-free saliva collection kit with room-temperature nucleic acid preservative buffer (stable 24 months). Full 2D barcode digital chain of custody.'
    },
    {
      step: '02',
      title: isEs ? 'Secuenciación en Eurofins Genomics' : 'High-Density Eurofins Genotyping',
      badge: 'Illumina Infinium GSA',
      desc: isEs 
        ? 'Extracción automatizada de ADN y genotipado masivo mediante microarrays Illumina Infinium GSA (>692.000 SNPs) en laboratorios centrales europeos acreditados ISO 15189 / 17025.' 
        : 'Automated DNA isolation and high-density microarray genotyping on Illumina Infinium GSA (>692k SNPs) in ISO 15189 / 17025 accredited European central laboratories.'
    },
    {
      step: '03',
      title: isEs ? 'Estratificación Fenotípica & Monografía' : 'Phenotypic Monograph & Risk Scoring',
      badge: isEs ? '5 Dominios Médicos' : '5 Clinical Domains',
      desc: isEs 
        ? 'El algoritmo bioinformático genera una monografía clínica estructurada en 5 pilares, catalogando variantes dbSNP, puntuación de riesgo poligénico (PRS) y recomendaciones operativas.' 
        : 'Bioinformatic pipeline synthesizes variants across 5 medical pillars, compiling dbSNP registry annotations, polygenic risk scores (PRS), and actionable therapeutic guidance.'
    },
    {
      step: '04',
      title: isEs ? 'Prescripción de Precisión Atlas' : 'Targeted Precision Prescribing',
      badge: isEs ? 'Formulación & Péptidos' : 'Compounding & Peptides',
      desc: isEs 
        ? 'El médico conecta los hallazgos genéticos directamente con formulaciones magistrales de Atlas (Epitalon, BPC-157, TB-500, DSIP, L-Metilfolato, TRH) elaboradas bajo estándares GMP.' 
        : 'Physicians bridge identified SNPs to targeted Atlas formulations (Epitalon, BPC-157, TB-500, DSIP, L-Methylfolate, HRT) prepared under strict cGMP compounding pharmacy standards.'
    },
    {
      step: '05',
      title: isEs ? 'Telemetría & Seguimiento ActivAge' : 'Biometric Telemetry & ActivAge',
      badge: isEs ? 'Reloj Epigenético' : 'Epigenetic Clocks',
      desc: isEs 
        ? 'Integración continua de wearables (Apple Health, Garmin, Oura, Whoop) junto con re-tests de edad epigenética (ActivAge) para medir objetivamente la respuesta celular en el tiempo.' 
        : 'Continuous multi-device biometric sync (Apple Health, Garmin, Oura, Whoop) paired with periodic ActivAge epigenetic clock re-testing to quantify patient clinical response.'
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
        supplierName="ETERNA DX · Eurofins Central Lab"
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
                <span>{isEs ? 'Solicitar Kit / Pedido Clínico' : 'Request Kit / Clinical Inquiry'}</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => window.open('/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf', '_blank')}
                title={isEs ? 'Descargar muestra de informe' : 'Download sample PDF report'}
              >
                <FileText size={14} />
                <span>{isEs ? 'Informe Muestra (PDF)' : 'Sample Report (PDF)'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => scrollToSection('portal-demo')}
              >
                <Monitor size={14} />
                <span>{isEs ? 'Consola Médica B2B' : 'B2B Clinical Console'}</span>
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
            <div className="eterna-kpi-card" style={{ '--card-accent': '#1a73e8' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Cobertura Genómica' : 'Genomic Coverage'}</span>
                <Dna size={15} style={{ color: '#1a73e8' }} />
              </div>
              <div className="eterna-kpi-value">692K+</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Polimorfismos analizados (Illumina Infinium GSA)' : 'High-density SNPs genotyped (Illumina GSA)'}
              </div>
            </div>

            <div className="eterna-kpi-card" style={{ '--card-accent': '#15803d' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Conformidad Regulatoria' : 'Regulatory Approval'}</span>
                <ShieldCheck size={15} style={{ color: '#15803d' }} />
              </div>
              <div className="eterna-kpi-value" style={{ fontSize: '1.45rem' }}>CE-IVDR</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Tubo estabilizador 24m a temp. ambiente' : 'Room-temp 24 mo preservation buffer'}
              </div>
            </div>

            <div className="eterna-kpi-card" style={{ '--card-accent': '#7c3aed' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Dominios Clínicos' : 'Clinical Domains'}</span>
                <Layers size={15} style={{ color: '#7c3aed' }} />
              </div>
              <div className="eterna-kpi-value">5 Pillars</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Deporte, Nutrición, Prevención, Longevidad, Bienestar' : 'Sport, Nutrition, Prevention, Longevity, Social'}
              </div>
            </div>

            <div className="eterna-kpi-card" style={{ '--card-accent': '#b45309' }}>
              <div className="eterna-kpi-header">
                <span>{isEs ? 'Tiempo de Respuesta (TAT)' : 'Turnaround Time'}</span>
                <Clock size={15} style={{ color: '#b45309' }} />
              </div>
              <div className="eterna-kpi-value">14–21 d</div>
              <div className="eterna-kpi-sub">
                {isEs ? 'Recepción de muestra a informe digital' : 'Courier sample intake to verified report'}
              </div>
            </div>
          </div>

          <div className="eterna-kpi-scope-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#15803d' }} />
              <span>
                {isEs 
                  ? 'Alcance: Plataforma Médica de Diagnóstico Genómico · Eurofins Genomics Central Laboratory · Encriptación RGPD' 
                  : 'Scope: Medical Diagnostic Platform · Eurofins Genomics Central Laboratory · GDPR Encrypted'}
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
                {sec.badge && (
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '8.5px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isActive ? '#1a73e8' : 'rgba(26, 115, 232, 0.12)',
                    color: isActive ? '#ffffff' : 'var(--gcp-blue-primary)',
                    textTransform: 'uppercase',
                    lineHeight: 1.3
                  }}>
                    {sec.badge}
                  </span>
                )}
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
                <span style={{ fontWeight: 700, color: 'var(--gcp-blue-primary)' }}>{currentSectionObj?.label}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gcp-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                {isEs ? `Sección ${currentSectionIndex + 1} de ${eternaSections.length}` : `Section ${currentSectionIndex + 1} of ${eternaSections.length}`}
              </div>
            </div>
          )}

          {/* ── Section 1: Overview & Diagnostic Stage ── */}
          {effectiveActiveTab === 'overview' && (
            <>
              {/* ── 1. Hero Section: Tri-Device 3D Mockup with Physician Framing ── */}
              <section id="overview" className="eterna-hero-section">
                <div className="eterna-pill-tag">
                  <Dna size={13} style={{ color: 'var(--gcp-blue-primary)' }} />
                  <span>{isEs ? 'Diagnóstico Genómico Traslacional · Prescripción Médica de Precisión' : 'Translational Genomic Diagnostics · Physician Precision Prescribing'}</span>
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

                {/* Hero Main Copy: Medical Translation from EternaRx */}
                <h1 className="eterna-hero-h1">
                  {isEs ? (
                    <>Del Diagnóstico Genómico a la <span className="mint-accent">Prescripción Terapéutica Dirigida</span></>
                  ) : (
                    <>From Genomic Diagnostics to <span className="mint-accent">Targeted Therapeutic Prescriptions</span></>
                  )}
                </h1>

                <p className="eterna-hero-desc">
                  {isEs 
                    ? 'La plataforma clínica que conecta más de 692.000 variantes genéticas Illumina GSA con protocolos de formulación magistral, péptidos regenerativos, monitorización de edad biológica (ActivAge) y telemetría continua de wearables en una consola médica unificada.' 
                    : 'The clinical platform that bridges >692,000 Illumina GSA genetic variants with physician-directed compounding protocols, regenerative peptides, epigenetic biological age tracking (ActivAge), and longitudinal wearable telemetry in one unified medical console.'}
                </p>

                {/* CTAs (Strictly No Prices - Google Cloud UX) */}
                <div className="eterna-hero-cta-group">
                  <button
                    type="button"
                    className="gcp-btn-primary"
                    onClick={() => setIsInquiryDrawerOpen(true)}
                  >
                    <span>{isEs ? 'Solicitar Kit / Pedido Clínico' : 'Request Clinical Kit / Order'}</span>
                    <ArrowRight size={15} />
                  </button>
                  
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => scrollToSection('flujo-clinico')}
                  >
                    <span>{isEs ? 'Ver Flujo Clínico en 5 Pasos' : 'Inspect 5-Step Clinical Workflow'}</span>
                    <ChevronRight size={15} />
                  </button>

                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => scrollToSection('portal-demo')}
                  >
                    <Monitor size={14} />
                    <span>{isEs ? 'Demo Consola Médica B2B' : 'Live B2B Clinical Console'}</span>
                  </button>
                </div>

                <div className="eterna-social-proof">
                  <span>
                    {isEs 
                      ? 'Validado en cohortes europeas · Certificación CE-IVDR · Laboratorios Eurofins Genomics (ISO 15189 / 17025)' 
                      : 'Validated in European cohorts · CE-IVDR Certified · Eurofins Genomics Laboratories (ISO 15189 / 17025)'}
                  </span>
                </div>
              </section>

              {/* ── 2. Infinite Compatible Wearables Marquee ── */}
              <section className="eterna-wearables-section">
                <div className="eterna-wearables-label">
                  {isEs ? 'Sincronización de Telemetría Biológica Continua' : 'Continuous Biological Telemetry Synchronization'}
                </div>
                
                <div className="eterna-marquee-wrapper">
                  <div className="eterna-marquee-track">
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
                    {isEs ? 'polimorfismos accionables analizados' : 'actionable polymorphisms analyzed'}
                  </div>
                  <div className="eterna-stat-sub">
                    {isEs ? 'en cada ensayo Illumina Infinium GSA' : 'in every Illumina Infinium GSA assay'}
                  </div>
                </div>

                <div className="eterna-stat-box">
                  <div className="eterna-stat-value mint">5 Dominios</div>
                  <div className="eterna-stat-title">
                    {isEs ? 'estratificación de riesgo clínico' : 'clinical risk stratification'}
                  </div>
                  <div className="eterna-stat-sub">
                    {isEs ? 'deporte, nutrición, cardiovascular, longevidad y cronobiología' : 'sport, nutrition, cardiovascular, longevity, and chronobiology'}
                  </div>
                </div>
              </section>

              {/* ── Executive Summary & Direct Jump Directory (Google Cloud UX) ── */}
              <div className="eterna-sidebar-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--gcp-blue-primary)" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--gcp-blue-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {isEs ? 'Directorio Clínico de la Plataforma' : 'Clinical Platform Directory'}
                    </span>
                  </div>
                  <span className="gcp-badge green" style={{ fontSize: '0.72rem' }}>
                    CE-IVDR Accredited
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gcp-text-primary)', margin: '0 0 0.5rem 0' }}>
                  {isEs ? 'Arquitectura Diagnóstica & Monografías ETERNA DX / RX' : 'Diagnostic Architecture & ETERNA DX / RX Monograph'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--gcp-text-secondary)', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                  {isEs 
                    ? 'Seleccione cualquiera de los módulos clínicos especializados a continuación para acceder a su monografía técnica detallada o utilice la barra superior de navegación.' 
                    : 'Select any of the specialized clinical modules below to inspect the technical monograph or use the top navigation tabs.'}
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
                          e.currentTarget.style.borderColor = 'var(--gcp-blue-primary)';
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
                            background: 'rgba(0,0,0,0.03)',
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
                            color: 'var(--gcp-blue-primary)'
                          }}>
                            <IconComp size={15} />
                          </span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gcp-text-primary)' }}>
                              {sec.label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gcp-text-secondary)', marginTop: '2px' }}>
                              {sec.id === 'flujo-clinico' && (isEs ? 'El ciclo clínico completo para médicos: toma de saliva, Eurofins, monografía y prescripción' : 'Full 5-step clinical prescribing workflow from saliva sampling to Atlas formulas')}
                              {sec.id === 'pilares' && (isEs ? 'Deporte, Nutrición, Prevención, Longevidad y Cronobiología con dianas moleculares' : 'Sport, Nutrition, Prevention, Longevity, and Chronobiology with gene targets')}
                              {sec.id === 'snp-table' && (isEs ? 'Directorio interactivo con 11 polimorfismos clave (ACTN3, MTHFR, APOE, FOXO3, etc.)' : 'Interactive searchable directory of 11 actionable SNPs and clinical indications')}
                              {sec.id === 'integracion' && (isEs ? 'Conexión directa con formulaciones magistrales y protocolos peptídicos de Atlas' : 'Translational prescribing matrix connecting genotypes to specific Atlas peptide stacks')}
                              {sec.id === 'biometrics' && (isEs ? 'Telemetría de smartwatch, ritmo de envejecimiento y biomarcadores' : 'Smartwatch telemetry, pace of aging, and live biomarker clocks')}
                              {sec.id === 'investigacion' && (isEs ? 'Acreditación Eurofins, microarrays Illumina, ISO 15189 y certificación CE-IVDR' : 'Eurofins lab accreditation, Illumina microarrays, ISO 15189, and CE-IVDR buffer')}
                              {sec.id === 'productos' && (isEs ? 'Formatos clínicos: individual, pack dúo y suite Eterna Pro para clínicas' : 'Individual kits, duo packs, and Eterna Pro B2B clinical allocation')}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gcp-blue-primary)', fontSize: '0.76rem', fontWeight: 600 }}>
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

          {/* ── Section 2: Physician Clinical Prescribing Workflow (5 Steps) ── */}
          {effectiveActiveTab === 'flujo-clinico' && (
            <section id="flujo-clinico" className="eterna-process-section">
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <Clock size={15} />
                  <span>{isEs ? 'Flujo de Trabajo Médico' : 'Physician Prescribing Loop'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? (
                    <>El Ciclo Clínico EternaRx en <span className="mint">5 Etapas</span></>
                  ) : (
                    <>The 5-Step EternaRx <span className="mint">Clinical Prescribing Loop</span></>
                  )}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Diseñado específicamente para facultativos y centros de medicina preventiva: desde la toma salival no invasiva en consulta hasta la formulación personalizada y el seguimiento de la longevidad biológica.' 
                    : 'Engineered specifically for medical practitioners and preventive health clinics: from non-invasive in-clinic saliva collection to custom precision compounding and longitudinal biological monitoring.'}
                </p>
              </div>

              {/* 5 Clinical Step Cards */}
              <div className="eterna-clinical-timeline-grid">
                {clinicalSteps.map((st, idx) => (
                  <div key={idx} className="eterna-clinical-step-card">
                    <div className="eterna-step-header">
                      <span className="eterna-step-number">{st.step}</span>
                      <span className="gcp-badge blue" style={{ fontSize: '0.7rem' }}>
                        {st.badge}
                      </span>
                    </div>
                    <h3 className="eterna-step-title">{st.title}</h3>
                    <p className="eterna-step-desc">{st.desc}</p>
                    <div className="eterna-step-footer">
                      {idx === 0 && <span className="eterna-step-metric">{isEs ? 'Buffer estable 24 meses' : '24-Mo Ambient Stability'}</span>}
                      {idx === 1 && <span className="eterna-step-metric">{isEs ? '+692.000 SNPs en Eurofins' : '>692,000 SNPs at Eurofins'}</span>}
                      {idx === 2 && <span className="eterna-step-metric">{isEs ? 'Informe clínico 34 páginas' : '34-Page Clinical Report'}</span>}
                      {idx === 3 && <span className="eterna-step-metric">{isEs ? 'Formulación magistral cGMP' : 'cGMP Custom Compounding'}</span>}
                      {idx === 4 && <span className="eterna-step-metric">{isEs ? 'Reloj epigenético ActivAge' : 'ActivAge Epigenetic Clock'}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Clinical Architecture Banner */}
              <div style={{
                margin: '2rem 1.5rem 0',
                padding: '1.25rem 1.5rem',
                background: 'var(--gcp-surface-card)',
                border: '1px solid var(--gcp-border)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: 'var(--gcp-blue-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gcp-blue-primary)'
                  }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--gcp-text-primary)' }}>
                      {isEs ? 'Monografía de Muestra para Profesionales de la Salud' : 'Sample Monograph for Healthcare Professionals'}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gcp-text-secondary)', marginTop: '2px' }}>
                      {isEs 
                        ? 'Descargue el informe genómico completo de 34 páginas para comprobar cómo se estructuran las variantes y las recomendaciones clínicas.' 
                        : 'Download the comprehensive 34-page genomic report to review variant classifications and clinical recommendations.'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => window.open('/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf', '_blank')}
                  >
                    <Download size={14} />
                    <span>{isEs ? 'Descargar Muestra PDF' : 'Download Sample PDF'}</span>
                  </button>

                  <button
                    type="button"
                    className="gcp-btn-primary"
                    onClick={() => setIsInquiryDrawerOpen(true)}
                  >
                    <span>{isEs ? 'Solicitar Asignación Médica' : 'Request Clinic Allocation'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 3: 5 Clinical Pillars ── */}
          {effectiveActiveTab === 'pilares' && (
            <section id="pilares" className="eterna-genetics-showcase">
              <div className="eterna-genetics-header">
                <div className="eterna-badge-kicker">
                  <Dna size={16} />
                  <span>{isEs ? 'Monografía Clínica' : 'Clinical Monograph'}</span>
                </div>
                
                <h3 className="eterna-section-h2">
                  {isEs ? (
                    <>Los 5 Dominios de <span className="amber">Medicina Genómica</span></>
                  ) : (
                    <>The 5 Domains of <span className="amber">Genomic Medicine</span></>
                  )}
                </h3>

                <p className="eterna-section-p">
                  {isEs 
                    ? 'El genotipado masivo se organiza en 5 áreas funcionales interconectadas. Cada bloque evalúa los polimorfismos que influyen directamente en la respuesta fenotípica del paciente y en su diana terapéutica.' 
                    : 'High-density genotyping is organized into 5 interconnected functional domains. Each domain stratifies polymorphisms that directly modulate patient phenotype and target therapeutic outcomes.'}
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
                
                {/* Column A: Clinical Phenotypic Profile */}
                <div className="eterna-profile-box">
                  <div className="eterna-box-header">
                    <div className="eterna-box-icon" style={{ background: 'var(--gcp-blue-surface)', border: '1px solid rgba(26, 115, 232, 0.25)', color: 'var(--gcp-blue-primary)' }}>
                      <BarChart3 size={18} />
                    </div>
                    <h4 className="eterna-box-title">{isEs ? 'Perfil Fenotípico del Paciente' : 'Patient Clinical Phenotype'}</h4>
                  </div>
                  
                  <div className="eterna-box-subtitle">
                    {isEs ? 'Evaluación estructurada de predisposiciones fisiológicas accionables.' : 'Structured baseline assessment of actionable physiological traits.'}
                  </div>

                  <div className="eterna-traits-group">
                    <div className="eterna-trait-category">{isEs ? 'Deporte & Fibras Musculares' : 'Sport & Musculoskeletal'}</div>
                    <div className="eterna-trait-question">{isEs ? '¿Perfil orientado a resistencia oxidativa o potencia rápida tipo IIx?' : 'Oxidative endurance vs fast-twitch Type IIx explosive profile?'}</div>
                    <div className="eterna-trait-list">
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Capacidad aeróbica basal y VO2 Max genético' : 'Baseline aerobic capacity and genetic VO2 Max limit'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Resistencia miotendinosa y síntesis de colágeno (COL1A1)' : 'Myotendinous resilience and collagen turnover (COL1A1)'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Tasa intrínseca de microtrauma y velocidad de aclaramiento' : 'Muscle damage kinetics and clearance velocity'}</div>
                    </div>
                  </div>

                  <div className="eterna-traits-group">
                    <div className="eterna-trait-category">{isEs ? 'Nutrición, Metilación & Aclaramiento' : 'Nutrition & Methylation'}</div>
                    <div className="eterna-trait-question">{isEs ? '¿Eficiencia en el ciclo de un carbono y depuración de xenobióticos?' : 'One-carbon cycle transmethylation and xenobiotic clearance?'}</div>
                    <div className="eterna-trait-list">
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Polimorfismo MTHFR C677T y reciclaje de homocisteína' : 'MTHFR C677T polymorphism and homocysteine remethylation'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Afinidad del receptor nuclear VDR y asimilación de vitamina D' : 'VDR nuclear receptor affinity and vitamin D bioavailability'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Metabolismo hepático de cafeína y vida media citocromo P450' : 'CYP1A2 caffeine metabolic rate and phase I clearance'}</div>
                    </div>
                  </div>

                  <div className="eterna-traits-group" style={{ marginBottom: 0 }}>
                    <div className="eterna-trait-category">{isEs ? 'Longevidad & Dinámica Telomérica' : 'Longevity & Autophagy'}</div>
                    <div className="eterna-trait-question">{isEs ? '¿Potencial intrínseco de reparación del ADN y senescencia celular?' : 'Intrinsic DNA repair capacity and cellular senescence burden?'}</div>
                    <div className="eterna-trait-list">
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Variantes promotoras de longevidad FOXO3 y sirtuinas' : 'FOXO3 exceptional longevity promoter and sirtuin upregulation'}</div>
                      <div className="eterna-trait-item"><span className="eterna-trait-dot" /> {isEs ? 'Resistencia al estrés oxidativo mitocondrial (SOD2 / GPX1)' : 'Mitochondrial oxidative stress resilience (SOD2 / GPX1)'}</div>
                    </div>
                  </div>
                </div>

                {/* Column B: Detailed Molecular Markers */}
                <div className="eterna-profile-box highlight">
                  <div className="eterna-box-header">
                    <div className="eterna-box-icon" style={{ background: 'var(--gcp-blue-surface)', border: '1px solid rgba(26, 115, 232, 0.25)', color: 'var(--gcp-blue-primary)' }}>
                      <Microscope size={18} />
                    </div>
                    <h4 className="eterna-box-title">{isEs ? 'Dianas Moleculares de Alta Relevancia' : 'Actionable Molecular Markers'}</h4>
                  </div>

                  <div className="eterna-box-subtitle">
                    {isEs ? 'Ejemplos de variantes genéticas con implicación directa en la prescripción.' : 'High-impact variants with direct therapeutic prescription relevance.'}
                  </div>

                  {/* Marker 1: ACTN3 */}
                  <div className="eterna-marker-card">
                    <h5 className="eterna-marker-h5">
                      {isEs ? 'Alfa-Actinina-3 y Tipología Muscular' : 'Alpha-Actinin-3 & Fiber Composition'}
                    </h5>
                    <span className="eterna-marker-gene-badge">Gene · ACTN3 (rs1815739)</span>
                    <p className="eterna-marker-desc">
                      {isEs 
                        ? 'El alelo R577X determina si el sarcómero muscular cuenta con alfa-actinina-3 funcional. Los genotipos XX carecen de esta proteína estructural, mostrando mayor fatiga en esfuerzos explosivos pero mayor eficiencia oxidativa.' 
                        : 'The R577X polymorphism dictates presence of functional alpha-actinin-3 in fast muscle fibers. Homozygous XX individuals lack this structural protein, exhibiting higher microtrauma risk during plyometrics.'}
                    </p>
                    <div className="eterna-marker-insight">
                      <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        {isEs 
                          ? 'Prescripción sugerida: Protocolo regenerativo BPC-157 (500 mcg/día) + TB-500 bi-semanal para amortiguar sobrecargas miotendinosas.' 
                          : 'Suggested prescription: Targeted tissue repair protocol with BPC-157 (500 mcg/day) + TB-500 to accelerate myofibrillar repair.'}
                      </span>
                    </div>
                  </div>

                  {/* Marker 2: MTHFR */}
                  <div className="eterna-marker-card" style={{ marginBottom: 0 }}>
                    <h5 className="eterna-marker-h5">
                      {isEs ? 'Metilación & Metabolismo del Folato' : 'One-Carbon Folate Methylation'}
                    </h5>
                    <span className="eterna-marker-gene-badge">Gene · MTHFR (rs1801133)</span>
                    <p className="eterna-marker-desc">
                      {isEs 
                        ? 'La variante C677T reduce hasta un 65% la conversión de folato en su forma biológicamente activa (5-MTHF). Provoca acumulación de homocisteína sérica y estrés endotelial.' 
                        : 'The C677T polymorphism results in up to 65% enzymatic reduction of 5-MTHF conversion. Drives elevated circulating homocysteine and neurovascular strain.'}
                    </p>
                    <div className="eterna-marker-insight">
                      <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>
                        {isEs 
                          ? 'Prescripción sugerida: Sustitución de ácido fólico por L-Metilfolato Cálcico (1.000 mcg) + Metilcobalamina B12 + Trimetilglicina (TMG).' 
                          : 'Suggested prescription: Strict avoidance of synthetic folic acid; prescribe Calcium L-Methylfolate (1,000 mcg) + Methyl-B12 + TMG.'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* ── Section 4: Actionable SNPs Directory (DataTable) ── */}
          {effectiveActiveTab === 'snp-table' && (
            <section id="snp-table" className="eterna-snp-section" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
              <div className="eterna-snp-table-card">
                <div className="eterna-snp-table-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={16} color="var(--gcp-blue-primary)" />
                      <strong style={{ fontSize: '0.95rem', color: 'var(--gcp-text-primary)' }}>
                        {isEs ? 'Registro de Variantes Genómicas & Farmacogenómica' : 'Actionable Genomic Variants & dbSNP Registry'}
                      </strong>
                      <span style={{ fontSize: '0.72rem', background: 'var(--gcp-blue-surface)', color: 'var(--gcp-blue-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
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
                      <option value="sport">{isEs ? 'Deporte & Tejido Conectivo' : 'Sport & Musculoskeletal'}</option>
                      <option value="nutrition">{isEs ? 'Nutrición & Metilación' : 'Nutrition & Methylation'}</option>
                      <option value="prevention">{isEs ? 'Prevención Cardiovascular' : 'Cardiovascular Prevention'}</option>
                      <option value="longevity">{isEs ? 'Longevidad & Senescencia' : 'Longevity & Autophagy'}</option>
                      <option value="social">{isEs ? 'Cronobiología & Bienestar' : 'Circadian & Neuroendocrine'}</option>
                    </select>

                    {/* Search input */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--gcp-text-muted)' }} />
                      <input
                        type="text"
                        value={snpSearch}
                        onChange={(e) => setSnpSearch(e.target.value)}
                        placeholder={isEs ? 'Buscar gen, rsID o protocolo...' : 'Search gene, rsID, or protocol...'}
                        style={{
                          background: 'var(--gcp-surface)',
                          border: '1px solid var(--gcp-border)',
                          color: 'var(--gcp-text-primary)',
                          borderRadius: '4px',
                          padding: '6px 10px 6px 30px',
                          fontSize: '0.78rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          width: '210px'
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

          {/* ── Section 5: Translational Prescribing Matrix (Atlas Health Bridge) ── */}
          {effectiveActiveTab === 'integracion' && (
            <section id="integracion" className="eterna-integration-section" style={{ marginTop: '1rem', marginBottom: '2.5rem' }}>
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <Activity size={15} />
                  <span>{isEs ? 'Medicina Traslacional' : 'Translational Medicine'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? (
                    <>Matriz de Prescripción Traslacional <span className="mint">Atlas Health</span></>
                  ) : (
                    <>Atlas Health <span className="mint">Translational Prescribing Matrix</span></>
                  )}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Los hallazgos del test Eterna no se quedan en un informe teórico. Esta matriz conecta cada polimorfismo con formulaciones magistrales y protocolos peptídicos específicos disponibles en el catálogo clínico de Atlas Health.' 
                    : 'Eterna genomic findings do not remain abstract data. This translational matrix bridges specific polymorphisms to custom compounding formulas and peptide stacks available directly in Atlas Health Console.'}
                </p>
              </div>

              {/* Stacked Prescribing Matrix Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
                
                {/* Protocol 1: Longevity & Sirtuins */}
                <div className="eterna-matrix-card">
                  <div style={{ flex: '1 1 380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">FOXO3 / SIRT1 / TERT</span>
                      <StatusBadge status="active" />
                      <span className="gcp-badge amber" style={{ fontSize: '0.72rem' }}>Longevity & Autophagy</span>
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.98rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Senescencia & Longitud Telomérica' : 'Cellular Senescence & Telomeric Longevity Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Activación de telomerasa y rescate del estrés oxidativo mitocondrial vía Epitalon (10mg bi-semanal) + Infusión/Inyección de NAD+ (50-100mg) calibrado según alelos promotores FOXO3.' 
                        : 'Telomerase upregulation and mitochondrial DNA protection via Epitalon (10mg bi-weekly) + NAD+ (50-100mg) tailored to FOXO3 promoter alleles.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge blue" style={{ fontSize: '0.76rem' }}>Epitalon + NAD+</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Prescribir Protocolo' : 'Prescribe Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Protocol 2: Musculoskeletal & Tendons */}
                <div className="eterna-matrix-card">
                  <div style={{ flex: '1 1 380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">ACTN3 / COL1A1 / MSTN</span>
                      <StatusBadge status="active" />
                      <span className="gcp-badge blue" style={{ fontSize: '0.72rem' }}>Musculoskeletal</span>
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.98rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Sinergia Tisular & Regeneración Tendinosa' : 'Tissue Synergy & Tendon Regeneration Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Reparación acelerada de matriz extracelular combinando BPC-157 (500 mcg/día) + TB-500 (Thymosin Beta-4 2mg bi-semanal) para pacientes con alelo 577XX o polimorfismo de colágeno Sp1.' 
                        : 'Targeted extracellular matrix repair combining BPC-157 (500 mcg/day) + TB-500 (2mg bi-weekly) for patients carrying ACTN3 XX or COL1A1 Sp1 polymorphisms.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge green" style={{ fontSize: '0.76rem' }}>BPC-157 + TB-500</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Prescribir Protocolo' : 'Prescribe Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Protocol 3: Sleep & Circadian Chronotype */}
                <div className="eterna-matrix-card">
                  <div style={{ flex: '1 1 380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">CLOCK / PER2 / MTNR1B</span>
                      <StatusBadge status="active" />
                      <span className="gcp-badge amber" style={{ fontSize: '0.72rem' }}>Circadian Clock</span>
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.98rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Restauración Circadiana & Sueño Delta' : 'Circadian Reset & Deep Delta Sleep Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Sincronización del oscilador supraquiasmático con Péptido Inductor de Sueño Profundo (DSIP 100 mcg) + Bisglicinato de Magnesio (400 mg) en pacientes con polimorfismo 3111T/C.' 
                        : 'Suprachiasmatic oscillator realignment utilizing Delta Sleep Inducing Peptide (DSIP 100 mcg) + Magnesium Bisglycinate (400 mg) in 3111T/C chronotype delay variants.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge amber" style={{ fontSize: '0.76rem' }}>DSIP Peptide</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Prescribir Protocolo' : 'Prescribe Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Protocol 4: Folate & Methylation */}
                <div className="eterna-matrix-card">
                  <div style={{ flex: '1 1 380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">MTHFR C677T / A1298C</span>
                      <StatusBadge status="active" />
                      <span className="gcp-badge green" style={{ fontSize: '0.72rem' }}>Methylation</span>
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.98rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Transmetilación & Aclaramiento de Homocisteína' : 'Transmethylation & Homocysteine Clearance Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'By-pass del bloqueo enzimático mediante L-Metilfolato Cálcico (Metafolin 1.000 mcg) + Metilcobalamina B12 (1.000 mcg) + Trimetilglicina (TMG 500 mg) para restaurar el ciclo de metilación.' 
                        : 'Enzymatic bypass delivering bioactive Calcium L-Methylfolate (Metafolin 1,000 mcg) + Methyl-B12 (1,000 mcg) + TMG (500 mg) to restore one-carbon methylation.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge green" style={{ fontSize: '0.76rem' }}>5-MTHF + Methyl-B12</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Prescribir Protocolo' : 'Prescribe Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Protocol 5: Cardiovascular & Endothelial */}
                <div className="eterna-matrix-card">
                  <div style={{ flex: '1 1 380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">APOE ε4 / LPA / PCSK9</span>
                      <StatusBadge status="active" />
                      <span className="gcp-badge blue" style={{ fontSize: '0.72rem' }}>Cardiovascular</span>
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.98rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Estabilización Endotelial & Fracción ApoB' : 'Endothelial Stabilization & ApoB Fraction Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Reducción de residencia de partículas aterogénicas con Ácidos Grasos Omega-3 EPA/DHA de grado farmacéutico (ratio 2:1, 3g/día) + CoQ10 Ubiquinol (200 mg) con seguimiento trimestral de ApoB.' 
                        : 'Atherogenic particle clearance with pharmaceutical-grade EPA/DHA (2:1 ratio, 3g/day) + CoQ10 Ubiquinol (200 mg) alongside quarterly ApoB monitoring.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge blue" style={{ fontSize: '0.76rem' }}>EPA/DHA + Ubiquinol</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Prescribir Protocolo' : 'Prescribe Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Protocol 6: Metabolic & Incretin Sensitivity */}
                <div className="eterna-matrix-card">
                  <div style={{ flex: '1 1 380px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="eterna-gene-tag">TCF7L2 / PPARG / FTO</span>
                      <StatusBadge status="active" />
                      <span className="gcp-badge amber" style={{ fontSize: '0.72rem' }}>Metabolism & Incretins</span>
                    </div>
                    <h4 style={{ color: 'var(--gcp-text-primary)', fontSize: '0.98rem', margin: '2px 0 4px', fontWeight: 600 }}>
                      {isEs ? 'Protocolo de Sensibilización Incretínica & Control Glucémico' : 'Incretin Sensitization & Glycemic Control Protocol'}
                    </h4>
                    <p style={{ color: 'var(--gcp-text-secondary)', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                      {isEs 
                        ? 'Modulación del eje GLP-1/GIP con Tirzepatida o Semaglutida + soporte con Berberina / Metformina HCL para portadores de variantes de riesgo TCF7L2 rs7903146.' 
                        : 'GLP-1/GIP incretin receptor optimization using Tirzepatide or Semaglutide + Berberine / Metformin HCL for TCF7L2 rs7903146 risk allele carriers.'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="gcp-badge amber" style={{ fontSize: '0.76rem' }}>Tirzepatide / GLP-1</span>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      onClick={() => setIsInquiryDrawerOpen(true)}
                    >
                      <span>{isEs ? 'Prescribir Protocolo' : 'Prescribe Protocol'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* ── Section 6: Biometrics, Wearables & ActivAge Clocks ── */}
          {effectiveActiveTab === 'biometrics' && (
            <section id="biometrics" className="eterna-biometrics-section">
              <div className="eterna-section-heading">
                <h2 className="eterna-section-h2">
                  {isEs ? (
                    <>El Wearable Registra Datos. <span className="mint">Eterna Aporta Contexto Clínico.</span></>
                  ) : (
                    <>Wearables Capture Raw Data. <span className="mint">Eterna Provides Clinical Context.</span></>
                  )}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Los smartwatches muestran pasos, pulsaciones y sueño de forma aislada. Eterna correlaciona en tiempo real la telemetría continua (FC en reposo, HRV, fases delta) con el genotipo del paciente y el reloj biológico ActivAge.' 
                    : 'Smartwatches show steps, heart rate and sleep in isolation. Eterna correlates real-time biometrics (resting HR, HRV, slow-wave sleep) directly with patient genomic polymorphisms and the ActivAge biological clock.'}
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
                  onClick={() => scrollToSection('portal-demo')}
                >
                  <Monitor size={15} />
                  <span>{isEs ? 'Explorar Consola Médica B2B en Tiempo Real' : 'Explore Interactive B2B Clinical Console'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </section>
          )}

          {/* ── Section 6b: Live Eterna B2B Physician Console (Interactive Workspace) ── */}
          {effectiveActiveTab === 'portal-demo' && (
            <section id="portal-demo" className="eterna-console-section">
              {/* Page Header / Toolbar */}
              <div className="eterna-section-heading" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div className="eterna-badge-kicker">
                    <Monitor size={16} />
                    <span>{isEs ? 'Consola Médica Interactiva' : 'Interactive Clinical Console'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status="active" />
                    <span style={{ fontSize: '0.75rem', color: 'var(--gcp-text-muted)', fontFamily: 'ui-monospace, monospace' }}>
                      EUROFINS-API-v2.4 · LIVE SANDBOX
                    </span>
                  </div>
                </div>
                <h2 className="eterna-section-h2" style={{ marginTop: '0.5rem' }}>
                  {isEs ? 'Consola Médica B2B de Salud Preventiva & Longevidad' : 'B2B Preventive & Longevity Clinical Console'}
                </h2>
                <p className="eterna-section-p">
                  {isEs
                    ? 'Explore las interfaces interactivas de ETERNA®. Alterne entre la consola clínica de alta resolución para médicos y la aplicación móvil compañera con la que sus pacientes monitorizan su edad biológica, velocidad de envejecimiento y cumplimiento terapéutico.'
                    : 'Explore the live interactive environments of ETERNA®. Toggle seamlessly between the clinical physician console for medical teams and the companion mobile app where patients track biological age, pace of aging, and longevity habits.'}
                </p>

                {/* Perspective Mode Switcher */}
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div className="eterna-console-mode-tabs">
                    <button
                      type="button"
                      className={`eterna-console-mode-tab ${demoViewMode === 'b2b' ? 'active' : ''}`}
                      onClick={() => setDemoViewMode('b2b')}
                    >
                      <Monitor size={15} />
                      <span>{isEs ? '🩺 Consola Médica B2B (Desktop)' : '🩺 Clinical Console (Doctor B2B)'}</span>
                    </button>
                    <button
                      type="button"
                      className={`eterna-console-mode-tab ${demoViewMode === 'b2c_mobile' ? 'active' : ''}`}
                      onClick={() => setDemoViewMode('b2c_mobile')}
                    >
                      <Smartphone size={15} />
                      <span>{isEs ? '📱 Companion App B2C (Móvil Paciente)' : '📱 Patient Companion (Mobile B2C)'}</span>
                    </button>
                    <button
                      type="button"
                      className={`eterna-console-mode-tab ${demoViewMode === 'b2c_web' ? 'active' : ''}`}
                      onClick={() => setDemoViewMode('b2c_web')}
                    >
                      <Layers size={15} />
                      <span>{isEs ? '💻 Portal Paciente B2C (WebApp)' : '💻 Patient Portal (WebApp B2C)'}</span>
                    </button>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--gcp-text-muted)' }}>
                    {demoViewMode === 'b2b' && (isEs ? 'Vista de prescripción clínica y percentiles genéticos' : 'Clinical prescription & genetic percentile view')}
                    {demoViewMode === 'b2c_mobile' && (isEs ? 'Vista interactiva en smartphone iOS / Android para pacientes' : 'Interactive smartphone iOS/Android experience for patients')}
                    {demoViewMode === 'b2c_web' && (isEs ? 'Vista de portal de autoservicio y seguimiento para pacientes' : 'Patient self-service portal & biomarkers view')}
                  </span>
                </div>
              </div>

              {/* Console Action Bar / Controls */}
              <div className="eterna-console-toolbar">
                <div className="eterna-console-toolbar-left">
                  <span className="eterna-console-pill">
                    <span className="eterna-console-pulse-dot" />
                    <span>
                      {demoViewMode === 'b2b' 
                        ? (isEs ? 'Consola Médica Activa' : 'Doctor Console Active')
                        : (demoViewMode === 'b2c_mobile' ? (isEs ? 'App Móvil Paciente Activa' : 'Patient Mobile App Active') : (isEs ? 'Portal Web Paciente Activo' : 'Patient WebApp Active'))}
                    </span>
                  </span>
                  <span className="eterna-console-patient-meta">
                    <span>{isEs ? 'Perfil de Muestra:' : 'Sample Profile:'}</span>
                    <strong style={{ color: 'var(--gcp-text-primary)' }}>Carlos Méndez (42y) · ID: ETR-7829-DX</strong>
                  </span>
                </div>

                <div className="eterna-console-toolbar-right">
                  {/* Theme Switcher (for desktop portals) */}
                  {demoViewMode !== 'b2c_mobile' && (
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      onClick={handleToggleDemoTheme}
                      title={demoTheme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light GCP Mode'}
                      style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem', gap: '6px' }}
                    >
                      {demoTheme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
                      <span>{demoTheme === 'light' ? 'Dark View' : 'Light GCP View'}</span>
                    </button>
                  )}

                  {/* Reset Demo Button */}
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={handleResetDemo}
                    title="Reload fresh demo state"
                    style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem', gap: '6px' }}
                  >
                    <RotateCcw size={13} />
                    <span>{isEs ? 'Reiniciar' : 'Reset Demo'}</span>
                  </button>

                  {/* Fullscreen Modal Toggle */}
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={() => setIsB2BPortalModalOpen(true)}
                    title="Open in fullscreen workspace modal"
                    style={{ height: '32px', padding: '0 10px', fontSize: '0.78rem', gap: '6px' }}
                  >
                    <Maximize2 size={13} />
                    <span>{isEs ? 'Maximizar' : 'Fullscreen'}</span>
                  </button>

                  {/* Open Standalone in New Tab */}
                  <a
                    href={
                      demoViewMode === 'b2b'
                        ? '/eterna/eterna-b2b-portal.html'
                        : (demoViewMode === 'b2c_mobile' ? '/eterna/eterna-b2c-app.html' : '/eterna/eterna-b2c-webapp.html')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gcp-btn-primary"
                    style={{ height: '32px', padding: '0 12px', fontSize: '0.78rem', gap: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ExternalLink size={13} />
                    <span>{isEs ? 'Abrir en Pestaña' : 'Open Standalone'}</span>
                  </a>
                </div>
              </div>

              {/* Viewport Frame: Doctor Desktop B2B vs. Patient Mobile iPhone Mockup */}
              {demoViewMode === 'b2b' && (
                <div className="eterna-console-viewport-wrap">
                  <iframe
                    key={`b2b-${demoIframeKey}`}
                    ref={demoIframeRef}
                    src={`/eterna/eterna-b2b-portal.html?theme=${demoTheme}`}
                    title="Eterna B2B Preventive Clinic Console Demo"
                    className="eterna-console-iframe"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
              )}

              {demoViewMode === 'b2c_web' && (
                <div className="eterna-console-viewport-wrap">
                  <iframe
                    key={`b2c-web-${demoIframeKey}`}
                    src={`/eterna/eterna-b2c-webapp.html?theme=${demoTheme}`}
                    title="Eterna B2C Patient WebApp Demo"
                    className="eterna-console-iframe"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
              )}

              {demoViewMode === 'b2c_mobile' && (
                <div className="eterna-b2c-mobile-showcase">
                  {/* Realistic Smartphone Mockup */}
                  <div className="eterna-phone-mockup-wrapper">
                    <div className="eterna-phone-island">
                      <div className="eterna-phone-island-camera" />
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#10b981' }} />
                    </div>
                    <div className="eterna-phone-screen">
                      <iframe
                        key={`b2c-mobile-${demoIframeKey}`}
                        src="/eterna/eterna-b2c-app.html"
                        title="Eterna B2C Patient Mobile App Interactive Preview"
                        className="eterna-phone-iframe"
                        loading="lazy"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      />
                    </div>
                  </div>

                  {/* Feature Highlights Sidebar for Clinics */}
                  <div className="eterna-b2c-companion-sidebar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(60, 182, 169, 0.2)', color: '#3CB6A9', fontSize: '0.72rem', fontWeight: 800 }}>
                        PATIENT RETENTION ENGINE
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>iOS & Android Ready</span>
                    </div>

                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0', color: '#ffffff', letterSpacing: '-0.01em' }}>
                      {isEs ? 'El Acompañante de Longevidad en el Bolsillo de su Paciente' : 'The Longevity Companion in Your Patient’s Pocket'}
                    </h3>

                    <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
                      {isEs
                        ? 'Eterna no termina con un informe en PDF. Sus pacientes interactúan diariamente con su edad biológica, registran sus protocolos prescritos y sincronizan sus métricas vitales.'
                        : 'Eterna does not end with a static PDF report. Your patients engage daily with their biological age, log prescribed peptide protocols, and synchronize continuous biometric data.'}
                    </p>

                    <div className="eterna-b2c-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Clock size={18} color="#DDB45A" />
                        <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                          {isEs ? 'Relojes Epigenéticos (Horvath & GrimAge)' : 'Epigenetic Clocks (Horvath & GrimAge)'}
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                        {isEs
                          ? 'Diferencial visual entre edad cronológica y edad celular. Los pacientes comprueban en tiempo real el rejuvenecimiento biológico logrado tras sus tratamientos.'
                          : 'Clear visualization of chronological vs biological age delta. Patients celebrate measurable biological age reductions following physician interventions.'}
                      </p>
                    </div>

                    <div className="eterna-b2c-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <Activity size={18} color="#3CB6A9" />
                        <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                          {isEs ? 'Velocímetro DunedinPACE' : 'DunedinPACE Speedometer'}
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                        {isEs
                          ? 'Indicador dinámico del ritmo de envejecimiento biológico por año calendario. Tasas inferiores a 1.0x demuestran la eficacia de la medicina preventiva.'
                          : 'Dynamic measurement of biological wear per calendar year. Values below 1.0x quantify slowed senescence and validate clinical therapeutic efficacy.'}
                      </p>
                    </div>

                    <div className="eterna-b2c-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <HeartPulse size={18} color="#38bdf8" />
                        <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                          {isEs ? 'Seguimiento de Dosis & Wearables' : 'Daily Regimen & Wearable Sync'}
                        </strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.45 }}>
                        {isEs
                          ? 'Registro diario de tomas de péptidos o suplementación, recordatorio de refrigeración y sincronización con Oura, Whoop y Apple Health.'
                          : 'Direct daily dosing logs for peptides and nutraceuticals, vial cold-chain reminders, and native sync with Apple Health, Oura, and CGM sensors.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Native Atlas Integration & Risk Percentile Demonstration */}
              <div className="eterna-console-atlas-bridge">
                <div className="eterna-card" style={{ padding: '1.5rem', background: 'var(--gcp-surface)', border: '1px solid var(--gcp-border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gcp-blue-primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {isEs ? 'Componente Nativo Atlas' : 'Atlas Native Telemetry Component'}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gcp-text-primary)', margin: 0 }}>
                        {isEs ? 'Distribución Calibrada de Percentiles de Riesgo ETERNA®' : 'ETERNA® Calibrated Genetic Risk & Percentile Distribution'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      className="gcp-btn-secondary"
                      onClick={() => window.open('/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf', '_blank')}
                      style={{ fontSize: '0.78rem', height: '32px' }}
                    >
                      <Download size={13} />
                      <span>{isEs ? 'Descargar Informe de Muestra (PDF)' : 'Download Sample Clinical Report (PDF)'}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--gcp-text-secondary)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                    {isEs
                      ? 'Los datos cuantitativos del secuenciador Eurofins se estandarizan contra la cohorte europea de referencia (n=120.000). A continuación se muestra cómo Atlas renderiza los percentiles de riesgo directamente en la ficha del paciente para guiar la suplementación y prescripción peptídica:'
                      : 'Raw quantitative data from the Eurofins sequencing pipeline are normalized against a validated European cohort (n=120,000). Below is a demonstration of how Atlas renders these risk percentiles natively within physician charts to guide targeted peptide regimens:'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {/* Risk Card 1 */}
                    <div style={{ padding: '1.15rem', background: 'var(--gcp-surface-card)', border: '1px solid var(--gcp-border)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gcp-text-primary)' }}>
                          {isEs ? 'Riesgo de Lesión Músculo-Tendinosa (COL5A1 / ACTN3)' : 'Soft-Tissue Injury Susceptibility (COL5A1 / ACTN3)'}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#fef2f2', color: '#b91c1c', fontWeight: 700 }}>
                          High Risk (P78)
                        </span>
                      </div>
                      <EternaRiskScoreBar
                        score={78.2}
                        min={0}
                        max={100}
                        mean={50}
                        bandStart={42}
                        bandEnd={58}
                        direction="favorable-low"
                        lowLabel={isEs ? 'Protector / Bajo Riesgo' : 'Protected / Low Risk'}
                        highLabel={isEs ? 'Alta Vulnerabilidad' : 'High Susceptibility'}
                        summary={isEs 
                          ? 'Genotipo COL5A1 TT asociado a rigidez fibrilar tendinosa y microdesgarros. Protocolo BPC-157 + Colway Colvita indicado.' 
                          : 'COL5A1 TT genotype associated with fibrillar tendon stiffness and micro-tears. Targeted BPC-157 + Colway Colvita protocol indicated.'}
                      />
                    </div>

                    {/* Risk Card 2 */}
                    <div style={{ padding: '1.15rem', background: 'var(--gcp-surface-card)', border: '1px solid var(--gcp-border)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--gcp-text-primary)' }}>
                          {isEs ? 'Capacidad Mitocondrial & VO2 Máx (PPARD / PGC-1α)' : 'Mitochondrial Biogenesis & VO2 Max Capacity (PPARD)'}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: '#f0fdf4', color: '#15803d', fontWeight: 700 }}>
                          Optimal (P84)
                        </span>
                      </div>
                      <EternaRiskScoreBar
                        score={84.5}
                        min={0}
                        max={100}
                        mean={50}
                        bandStart={40}
                        bandEnd={60}
                        direction="favorable-high"
                        lowLabel={isEs ? 'Respuesta Mitocondrial Baja' : 'Low Biogenesis'}
                        highLabel={isEs ? 'Resiliencia Aeróbica Óptima' : 'Optimal Aerobic Resilience'}
                        summary={isEs 
                          ? 'Alta plasticidad mitocondrial. Excelente respuesta a protocolos de bioenergética celular (MOTS-c + SS-31).' 
                          : 'High mitochondrial plasticity. Exceptional response to cellular bioenergetic protocols (MOTS-c + SS-31).'}
                      />
                    </div>
                  </div>

                  {/* Practice Integration Footer */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gcp-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={16} color="var(--gcp-blue-primary)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--gcp-text-secondary)' }}>
                        {isEs ? 'Sincronización bidireccional automática con la ficha médica del paciente en Atlas EHR.' : 'Full two-way automated data synchronization with patient records in Atlas EHR.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="gcp-btn-primary"
                      onClick={() => setIsInquiryDrawerOpen(true)}
                      style={{ fontSize: '0.78rem', height: '32px' }}
                    >
                      <span>{isEs ? 'Solicitar Kit de Demostración para Clínica' : 'Request Practice Demonstration Kit'}</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 7: Scientific Quality, Rigor & Eurofins Labs ── */}
          {effectiveActiveTab === 'investigacion' && (
            <section id="investigacion" className="eterna-science-section">
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <ShieldCheck size={16} />
                  <span>{isEs ? 'Respaldo Analítico' : 'Analytical Rigor'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? 'Laboratorio Central Eurofins & Rigor Molecular' : 'Eurofins Central Lab & Analytical Standards'}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Procesamiento en instalaciones de genómica médica acreditadas, con validación robótica y garantía de reproducibilidad analítica superior al 99,9%.' 
                    : 'Processing performed in accredited medical genomics facilities, utilizing robotic automated isolation and >99.9% analytical genotyping call rates.'}
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
                        {isEs ? 'Acreditación Eurofins Genomics (ISO 15189 / 17025)' : 'Eurofins Genomics Accreditation (ISO 15189 / 17025)'}
                      </h3>
                      <span className="gcp-badge blue" style={{ fontSize: '0.72rem' }}>CENTRAL EUROPEAN FACILITY</span>
                    </div>
                    <p className="eterna-science-card-text" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {isEs 
                        ? 'Todas las muestras salivales se procesan en los laboratorios centrales de Eurofins Genomics en Alemania y Francia, cumpliendo los más estrictos estándares clínicos internacionales de diagnóstico in vitro.' 
                        : 'All biological samples are genotyped at Eurofins Genomics central European hubs (Germany/France), adhering to the highest international diagnostic laboratory quality standards.'}
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
                        {isEs ? 'Tecnología Illumina Infinium Global Screening Array (GSA v3.0)' : 'Illumina Infinium Global Screening Array (GSA v3.0)'}
                      </h3>
                      <span className="gcp-badge amber" style={{ fontSize: '0.72rem' }}>692K+ HIGH-DENSITY SNPS</span>
                    </div>
                    <p className="eterna-science-card-text" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {isEs 
                        ? 'Microarrays de genotipado de alta resolución con más de 692.000 variantes accionables, incluyendo farmacogenómica, riesgo poligénico y marcadores de longevidad validados por consorcios internacionales.' 
                        : 'High-density bead-chip genotyping array querying >692,000 actionable genomic markers, covering pharmacogenomics, polygenic risk, and peer-reviewed longevity variants.'}
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
                        {isEs ? 'Dispositivo Salival con Marcado CE-IVDR' : 'CE-IVDR Certified Saliva Preservation Device'}
                      </h3>
                      <span className="gcp-badge green" style={{ fontSize: '0.72rem' }}>24-MONTH AMBIENT STABILITY</span>
                    </div>
                    <p className="eterna-science-card-text" style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.55 }}>
                      {isEs 
                        ? 'Dispositivo de recolección de saliva con marcado CE-IVDR y tampón conservante que estabiliza el ADN a temperatura ambiente durante 24 meses, eliminando la necesidad de cadena de frío en el transporte.' 
                        : 'CE-IVDR compliant saliva collection funnel and preservation buffer maintaining high molecular weight DNA integrity at room temperature for up to 24 months without cold-chain transit.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quality Standard Badges */}
              <div className="eterna-cert-badges-row">
                <div className="eterna-cert-pill">
                  <ShieldCheck size={14} color="#15803d" />
                  <span>ISO 15189:2022 {isEs ? 'Laboratorios Clínicos' : 'Medical Laboratories'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <ShieldCheck size={14} color="#15803d" />
                  <span>ISO 13485:2016 {isEs ? 'Dispositivos de Diagnóstico' : 'Medical Devices'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <ShieldCheck size={14} color="#15803d" />
                  <span>ISO 9001:2015 {isEs ? 'Gestión de Calidad' : 'Quality Management'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <CheckCircle2 size={14} color="#1a73e8" />
                  <span>Illumina Infinium GSA {isEs ? 'Microarrays Certificados' : 'Certified Arrays'}</span>
                </div>
                <div className="eterna-cert-pill">
                  <CheckCircle2 size={14} color="#1a73e8" />
                  <span>{isEs ? '100% Conforme GDPR / HIPAA · Datos Cifrados' : '100% GDPR / HIPAA Compliant · Encrypted'}</span>
                </div>
              </div>

              {/* Medical Disclaimer Note */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--gcp-text-muted)', maxWidth: '780px', margin: '1.5rem auto 0' }}>
                {isEs 
                  ? 'Aviso Médico: Esta plataforma proporciona inteligencia genómica y epigenética traslacional como apoyo al juicio clínico del profesional de la salud colegiado.' 
                  : 'Medical Notice: This platform provides genomic and epigenetic intelligence designed to assist licensed healthcare providers in precision clinical prescribing.'}
              </div>
            </section>
          )}

          {/* ── Section 8: Product Suite & Clinical Allocation (STRICTLY NO PRICES) ── */}
          {effectiveActiveTab === 'productos' && (
            <section id="productos" className="eterna-catalog-section">
              <div className="eterna-section-heading">
                <div className="eterna-badge-kicker">
                  <Package size={15} />
                  <span>{isEs ? 'Formatos de Asignación' : 'Practice Allocation'}</span>
                </div>
                <h2 className="eterna-section-h2">
                  {isEs ? (
                    <>Gama Diagnóstica para <span className="mint">Clínicas y Consultorios</span></>
                  ) : (
                    <>Diagnostic Formats for <span className="mint">Clinics & Practices</span></>
                  )}
                </h2>
                <p className="eterna-section-p">
                  {isEs 
                    ? 'Soluciones adaptadas a la práctica clínica privada, programas de medicina preventiva y asignación institucional por volumen.' 
                    : 'Solutions tailored to private clinical practices, preventive health institutions, and institutional volume allocations.'}
                </p>
              </div>

              {/* 3 Tier Cards (Strictly No Prices - Google Cloud UX) */}
              <div className="eterna-tiers-grid">
                
                {/* Tier 1: Individual Kit */}
                <div className="eterna-tier-card">
                  <h3 className="eterna-tier-title">{isEs ? 'Kit Clínico Individual' : 'Individual Clinical Kit'}</h3>
                  <div className="eterna-tier-subtitle">
                    {isEs ? 'Prescripción a paciente único en consulta o enviado a domicilio.' : 'Single-patient prescription dispensed in consultation or direct-to-home.'}
                  </div>
                  <ul className="eterna-tier-features">
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? '1 Kit salival CE-IVDR con código 2D' : '1 CE-IVDR saliva kit with 2D barcode'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? '+692.000 polimorfismos analizados' : '+692,000 SNPs analyzed via Illumina GSA'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Monografía clínica digital completa' : 'Comprehensive digital clinical monograph'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Acceso al portal paciente y telemetría' : 'Patient companion app & wearable sync'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Logística inversa trazada incluida' : 'Prepaid trackable lab logistics included'}</span>
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
                  <span className="eterna-tier-badge">{isEs ? 'Más Frecuente' : 'Standard'}</span>
                  <h3 className="eterna-tier-title">{isEs ? 'Pack Clínico Dúo' : 'Clinical Duo Pack'}</h3>
                  <div className="eterna-tier-subtitle">
                    {isEs ? '2 kits independientes para parejas o co-residentes con perfiles comparables.' : '2 independent kits for couples or family members with comparative telemetry.'}
                  </div>
                  <ul className="eterna-tier-features">
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? '2 Kits de recolección de saliva CE-IVDR' : '2 CE-IVDR saliva collection kits'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Expedientes clínicos y accesos independientes' : 'Independent patient records and accounts'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Sincronización simultánea de wearables' : 'Simultaneous smartwatch telemetry syncing'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Secuenciación Illumina Eurofins completa' : 'Full Illumina Eurofins sequencing'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Soporte prioritario de interpretación médica' : 'Priority clinical advisory support'}</span>
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

                {/* Tier 3: Eterna Pro Practice Allocation */}
                <div className="eterna-tier-card">
                  <h3 className="eterna-tier-title">{isEs ? 'Eterna Pro (Clínicas & Hospitales)' : 'Eterna Pro (Practice Allocation)'}</h3>
                  <div className="eterna-tier-subtitle">
                    {isEs ? 'Asignación por lotes de 10 a 50 kits con consola de gestión multi-paciente.' : 'Institutional batch allocation (10–50 kits) with multi-patient clinical console.'}
                  </div>
                  <ul className="eterna-tier-features">
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Panel B2B para seguimiento de cohortes' : 'B2B physician cohort management portal'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Re-tests periódicos de ritmo de envejecimiento' : 'Periodic pace of aging (ActivAge) re-tests'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Prescripción directa en formulaciones Atlas' : 'Direct prescription of Atlas compound stacks'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Condiciones institucionales por volumen' : 'Institutional volume tier allocation'}</span>
                    </li>
                    <li className="eterna-tier-feature-item">
                      <Check size={14} />
                      <span>{isEs ? 'Asesor genético dedicado para la clínica' : 'Dedicated clinical geneticist support'}</span>
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
                ETERNA <span>DX / RX</span>
              </div>
              <span className="gcp-badge green">
                <span className="gcp-badge-dot" />
                CE-IVD
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--gcp-text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              {isEs 
                ? 'Plataforma médica de diagnóstico genómico, telemetría y prescripción de precisión.' 
                : 'Medical platform for precision genomics, continuous telemetry, and targeted compounding.'}
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
                <span>{isEs ? 'Solicitar Kit / Pedido Clínico' : 'Request Kit / Clinical Order'}</span>
              </button>

              <a
                href="/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="gcp-btn-secondary"
                style={{ width: '100%' }}
              >
                <Download size={15} />
                <span>{isEs ? 'Informe de Muestra (PDF · 34 Pgs)' : 'Sample Report (PDF · 34 Pgs)'}</span>
              </a>

              <button
                type="button"
                className="gcp-btn-secondary"
                style={{ width: '100%' }}
                onClick={() => scrollToSection('portal-demo')}
              >
                <Monitor size={15} />
                <span>{isEs ? 'Consola Médica B2B (Demo)' : 'B2B Clinical Console (Demo)'}</span>
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
                <span className="value">{isEs ? '14 - 21 Días Laborables' : '14 - 21 Business Days'}</span>
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
              {isEs ? 'Navegación Clínica Rápida' : 'Quick Clinical Navigation'}
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
                      border: isActive ? '1px solid rgba(26, 115, 232, 0.35)' : '1px solid transparent',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: isActive ? 'var(--gcp-blue-primary)' : 'var(--gcp-text-secondary)',
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
                    <ChevronRight size={14} color={isActive ? 'var(--gcp-blue-primary)' : 'var(--gcp-text-muted)'} />
                    <span style={{ fontSize: '0.78rem' }}>{sec.label}</span>
                    {sec.badge && (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '8.5px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: isActive ? '#1a73e8' : 'rgba(26, 115, 232, 0.12)',
                        color: isActive ? '#ffffff' : 'var(--gcp-blue-primary)',
                        textTransform: 'uppercase'
                      }}>
                        {sec.badge}
                      </span>
                    )}
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
            supplierName: 'ETERNA DX · Eurofins Central Lab',
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

      {/* ── Live Eterna Portal / Companion Demo Modal ── */}
      {isB2BPortalModalOpen && (
        <div className="eterna-b2b-modal-overlay" onClick={() => setIsB2BPortalModalOpen(false)}>
          <div
            className="eterna-b2b-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={demoViewMode === 'b2c_mobile' ? { maxWidth: '440px', height: '92vh', borderRadius: '36px', overflow: 'hidden' } : {}}
          >
            <div className="eterna-b2b-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: demoViewMode === 'b2c_mobile' ? '#3CB6A9' : 'var(--gcp-blue-primary)' }} />
                <strong style={{ color: 'var(--gcp-text-primary)', fontSize: '0.9rem' }}>
                  {demoViewMode === 'b2b' && (isEs ? 'Eterna · Consola Médica Clínica (Demo B2B)' : 'Eterna · Preventive Health Clinic Portal (Live B2B Demo)')}
                  {demoViewMode === 'b2c_mobile' && (isEs ? 'Eterna · App Móvil Paciente (Demo B2C iOS/Android)' : 'Eterna · Patient Mobile Companion (Live B2C App Demo)')}
                  {demoViewMode === 'b2c_web' && (isEs ? 'Eterna · Portal Web Paciente (Demo B2C WebApp)' : 'Eterna · Patient Self-Service Portal (Live B2C WebApp)')}
                </strong>
                <span style={{ fontSize: '0.72rem', background: 'var(--gcp-blue-surface)', color: 'var(--gcp-blue-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                  {demoViewMode === 'b2c_mobile' ? 'MOBILE B2C DEMO' : 'INTERACTIVE DEMO'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={
                    demoViewMode === 'b2b'
                      ? '/eterna/eterna-b2b-portal.html'
                      : (demoViewMode === 'b2c_mobile' ? '/eterna/eterna-b2c-app.html' : '/eterna/eterna-b2c-webapp.html')
                  }
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
              src={
                demoViewMode === 'b2b'
                  ? `/eterna/eterna-b2b-portal.html?theme=${demoTheme}`
                  : (demoViewMode === 'b2c_mobile' ? '/eterna/eterna-b2c-app.html' : `/eterna/eterna-b2c-webapp.html?theme=${demoTheme}`)
              }
              title="Eterna Interactive Demo"
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
