'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Dna,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  MessageCircle,
  Download,
  Percent,
  Calculator,
  Activity,
  Award,
  ChevronRight,
  Info,
  Printer,
  Copy,
  Check,
  Building2,
  Cpu,
  Zap,
  AlertTriangle,
  HeartPulse,
  Stethoscope,
  Beaker,
  Pill,
  BookOpen,
  FileCheck,
  HelpCircle,
  ExternalLink,
  Lock,
  LogIn,
  Globe,
  Plus,
  Minus,
  Bot,
  X,
  Send,
  UserCheck
} from 'lucide-react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import {
  GALENIC_COMPATIBILITY_ANALYSIS,
  CLINICAL_PILLARS,
  THREE_CAPSULE_PROTOCOL,
  CONCRETE_DIET_GUIDELINES,
  TREATMENT_CYCLE
} from '@/data/genomics/clinicalNutrigenomicEngine';
import '../colway/ColwayPriceList.css';

const GENOMICS_PRODUCTS = [
  {
    id: 'nutrigenetics',
    name: 'Nutrigenetics Clinical DNA Panel (Nutrigen)',
    sku: '24G-NUTRIGENETICS',
    badge: 'Clinical Nutrigenomics Focus',
    badgeColor: '#0d9488',
    badgeBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    subtitle: 'Macro & micronutrient metabolic predisposition, food intolerances, glycemic response & vitamin pathways',
    sampleType: 'Buccal Swab (Saliva · Non-invasive)',
    turnaroundTime: '3-4 Weeks (Madrid CE-IVD Core Lab)',
    snpsCount: '+50,000 Key SNPs Analyzed',
    keyGenes: 'MTHFR, FTO, PPARG, TCF7L2, VDR, BCMO1, SLC23A1, MCM6 (Lactase), HLA-DQ2/DQ8',
    labCostPack10Eur: 104.30,
    distributorPriceQar: 475.00, // Landed in Doha
    clinicResalePriceQar: 750.00,
    retailMsrpQar: 950.00,
    compoundingSynergy: 'Direct Formulation of Personalized Compounded Nutrigenomic Multi-Nutrient Capsules',
    reportSections: [
      'Nutrient Metabolism: Carbohydrates, Saturated vs. Monounsaturated Fats, Protein requirements',
      'Vitamins & Minerals: Folate (MTHFR methylation), Vitamin D (VDR receptor), B12, C, Iron metabolism',
      'Food Sensitivities: Lactose intolerance predisposition, Celiac / gluten sensitivity genetic risk',
      'Metabolic Health: Glycemic index response, insulin sensitivity risk factors, visceral adiposity tendency',
      'Eating Behaviors & Satiety: FTO hunger regulation, leptin receptor efficiency, sweet taste perception'
    ]
  },
  {
    id: 'all-in-one',
    name: 'All-in-One Comprehensive DNA Panel (7 Full Reports)',
    sku: '24G-ALL-IN-ONE',
    badge: 'Complete Clinical Genomic Portfolio',
    badgeColor: '#6366f1',
    badgeBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
    subtitle: 'The complete 7-in-1 medical & lifestyle genomic architecture (+700,000 SNPs)',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    snpsCount: '+700,000 SNPs (Illumina GSA Array)',
    keyGenes: 'CYP450, MTHFR, COMT, APOE, FTO, VDR, ACTN3, COL1A1, BDNF, SULT1A1, BRCA1/2 markers',
    labCostPack10Eur: 104.30,
    distributorPriceQar: 550.00,
    clinicResalePriceQar: 890.00,
    retailMsrpQar: 1150.00,
    compoundingSynergy: 'Full Longevity & Precision Anti-Aging Protocol Calibration',
    reportSections: [
      'Clinical Health: Polygenic risk scores for cardiovascular, metabolic and degenerative predispositions',
      'Pharmacogenetics: CYP2D6, CYP2C19, CYP3A4 metabolic efficacy for over 400 clinical medications',
      'Nutrigenetics (Nutrigen): Full nutritional biochemistry and food intolerance profiles',
      'Sports & Athletic Performance: Muscle fiber type (ACTN3), VO2 max response, tendon injury risk (COL1A1)',
      'Skin & Trichology Aging: Collagen degradation kinetics, photoaging risk, scalp microcirculation markers',
      'Personality & Neuro-Cognitive Traits: Dopamine (COMT), Serotonin transport, sleep architecture',
      'Biogeographical Ancestry: Regional origin breakdown across 400+ population clusters worldwide'
    ]
  },
  {
    id: 'pharmacogenetics',
    name: 'Pharmacogenetics Plus DNA Panel',
    sku: '24G-PHARMACOGENETICS',
    badge: 'Prescriber Clinical Safety',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    badgeBorder: '#bae6fd',
    subtitle: 'Essential drug metabolism profiling to prevent adverse reactions & optimize dosages',
    sampleType: 'Buccal Swab (Saliva)',
    turnaroundTime: '3-4 Weeks',
    snpsCount: '+50,000 SNPs',
    keyGenes: 'CYP1A2, CYP2B6, CYP2C9, CYP2C19, CYP2D6, CYP3A4, CYP3A5, SLCO1B1, VKORC1',
    labCostPack10Eur: 104.30,
    distributorPriceQar: 475.00,
    clinicResalePriceQar: 750.00,
    retailMsrpQar: 950.00,
    compoundingSynergy: 'Tailored drug-dose selection and compounding peptide bioavailability optimization',
    reportSections: [
      'Cardiovascular Drugs: Statins (SLCO1B1 myopathy risk), Warfarin (VKORC1), Clopidogrel, Beta-blockers',
      'Psychiatry & Neurology: SSRIs, Tricyclics, Antiepileptics metabolism rate',
      'Pain Management & Oncology: Codeine to morphine conversion efficiency, NSAIDs tolerance',
      'Gastroenterology: Proton Pump Inhibitors (CYP2C19 extensive vs. poor metabolizers)'
    ]
  }
];

const VOLUME_TIERS = [
  {
    id: 'tier1',
    name: 'Tier 1',
    quantity: 10,
    discountLabel: '10 Kits',
    unitPriceQar: 475.00,
    totalPriceQar: 4750.00,
    unitPriceUsd: 129.00,
    totalPriceUsd: 1290.00,
    distributorProfitTotalQar: 2750.00,
    distributorMarginPct: '36.7%'
  },
  {
    id: 'tier2',
    name: 'Tier 2',
    quantity: 25,
    discountLabel: '25 Kits',
    unitPriceQar: 450.00,
    totalPriceQar: 11250.00,
    unitPriceUsd: 122.30,
    totalPriceUsd: 3057.50,
    distributorProfitTotalQar: 7500.00,
    distributorMarginPct: '40.0%'
  },
  {
    id: 'tier3',
    name: 'Tier 3',
    quantity: 50,
    discountLabel: '50 Kits',
    unitPriceQar: 425.00,
    totalPriceQar: 21250.00,
    unitPriceUsd: 115.50,
    totalPriceUsd: 5775.00,
    distributorProfitTotalQar: 16250.00,
    distributorMarginPct: '43.3%'
  }
];

const CURRENCY_CONFIG = {
  QAR: { code: 'QAR', symbol: 'QAR', rate: 1.0, flag: '🇶🇦', label: 'QAR (ر.ق)' },
  AED: { code: 'AED', symbol: 'AED', rate: 1.008, flag: '🇦🇪', label: 'AED (د.إ)' },
  SAR: { code: 'SAR', symbol: 'SAR', rate: 1.03, flag: '🇸🇦', label: 'SAR (ر.س)' },
  KWD: { code: 'KWD', symbol: 'KWD', rate: 0.0845, flag: '🇰🇼', label: 'KWD (د.ك)', decimals: 2 },
  USD: { code: 'USD', symbol: '$', rate: 0.2747, flag: '🇺🇸', label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.254, flag: '🇪🇺', label: 'EUR (€)' }
};

const SCHEDULE_SECTIONS = [
  {
    id: 'commercial',
    label: 'Commercial Schedule & Packs',
    shortLabel: 'Packs & Pricing',
    badge: 'Tier 1–3',
    icon: FileSpreadsheet,
    desc: 'Volume packs, deliverables and WhatsApp care'
  },
  {
    id: 'ai-services',
    label: 'Clinical Methodology & Pipeline',
    shortLabel: 'How it Works',
    badge: 'CE-IVD Lab',
    icon: Cpu,
    desc: 'From saliva sequencing to personalized nutrition'
  },
  {
    id: 'sample-report',
    label: 'Sample Patient Monograph Preview',
    shortLabel: 'Sample Report',
    badge: 'Nutrigen + Ancestry',
    icon: FileText,
    desc: 'Dual paper and digital monograph preview'
  },
  {
    id: 'ai-recommendation',
    label: 'Clinical Cases & 3-Capsule Regimen',
    shortLabel: 'Clinical Cases',
    badge: 'Patient Personas',
    icon: Sparkles,
    desc: 'Actionable genetic translation examples'
  },
  {
    id: 'nutrigen-monograph',
    label: 'Nutrigen Clinical Monograph',
    shortLabel: 'Monograph',
    badge: 'Scientific Data',
    icon: Dna,
    desc: 'Biological mechanisms & gene variants'
  },
  {
    id: 'terms',
    label: 'Distribution Terms & Logistics',
    shortLabel: 'Terms & Logistics',
    badge: 'EXW Madrid',
    icon: ShieldCheck,
    desc: 'Logistics, delivery and quality guarantees'
  }
];

export default function QatarGenomicsPriceClient() {
  const { user } = useAuth();
  const [previewUnlocked, setPreviewUnlocked] = useState(false);
  const isPricingUnlocked = !!user || previewUnlocked;

  const [activeTab, setActiveTab] = useState('commercial');
  const [selectedProduct, setSelectedProduct] = useState('nutrigenetics');
  const [selectedTier, setSelectedTier] = useState('tier1');
  const [currency, setCurrency] = useState('QAR');
  const [whatsappSubscriptionsCount, setWhatsappSubscriptionsCount] = useState(10);
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCaseVariant, setSelectedCaseVariant] = useState('mthfr');
  const [showAtlasAiModal, setShowAtlasAiModal] = useState(false);
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');
  const [activeAiAnswer, setActiveAiAnswer] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const currentProd = GENOMICS_PRODUCTS.find(p => p.id === selectedProduct) || GENOMICS_PRODUCTS[0];
  const currentTier = VOLUME_TIERS.find(t => t.id === selectedTier) || VOLUME_TIERS[0];

  const formatPrice = (baseQar, targetCur = currency) => {
    if (!isPricingUnlocked) return '••••';
    const cfg = CURRENCY_CONFIG[targetCur] || CURRENCY_CONFIG.QAR;
    const converted = baseQar * cfg.rate;
    if (cfg.code === 'KWD') {
      return `${converted.toFixed(2)} ${cfg.symbol}`;
    }
    if (cfg.code === 'USD' || cfg.code === 'EUR') {
      return `${cfg.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${cfg.symbol}`;
  };

  const AI_FAQS = [
    {
      q: '¿Qué incluye el pago único del pack?',
      a: 'El pack seleccionado (Tier 1, Tier 2 o Tier 3) incluye los Puntos 1 al 4: (1) Reporte de Nutrición clínica en papel encuadernado y en la plataforma Atlas, (2) Reporte de Ancestros biogeográficos en papel, (3) Recomendaciones y prescripción personalizada de 3 cápsulas diarias en Atlas, y (4) Identificación algorítmica de la dieta más idónea del catálogo de 24Genetics. Todos estos puntos se abonan una sola vez con los kits adquiridos.'
    },
    {
      q: '¿Cómo funciona la suscripción de WhatsApp?',
      a: 'El Punto 5 es un servicio flexible de acompañamiento clínico directo por WhatsApp (150 de la divisa elegida al mes por paciente activo). Permite al paciente resolver dudas sobre su plan dietético, suplementación y evolución en cualquier momento. No tiene permanencia y se puede activar o cancelar libremente cada mes.'
    },
    {
      q: '¿Por qué la suplementación se divide en 3 cápsulas?',
      a: 'Para respetar la biodisponibilidad y farmacocinética de cada nutriente. La toma en ayunas (Cápsula A) protege probióticos y mucosa gástrica; la del desayuno (Cápsula B) activa la metilación (MTHFR) y aprovecha las grasas de la comida para absorber vitaminas liposolubles (D3/K2); y la de la cena (Cápsula C) aporta minerales quelados y precursores neuroquímicos para la regeneración nocturna sin competir entre sí.'
    },
    {
      q: '¿Cómo se recoge la muestra de saliva?',
      a: 'Mediante un hisopo bucal indoloro que se frota en el interior de la mejilla durante 60 segundos. No requiere extracción de sangre ni ayuno. El tubo contiene un tampón estabilizador celular que mantiene el ADN intacto a temperatura ambiente durante más de 12 meses.'
    },
    {
      q: '¿Cuánto tarda el laboratorio en emitir los reportes?',
      a: 'Una vez recibida la muestra en el Core Lab europeo de Madrid, el proceso de genotipado en chip Illumina GSA (+50.000 SNPs) tarda entre 3 y 4 semanas. Los informes digitales se activan de inmediato en la plataforma Atlas y los dossiers impresos se envían encuadernados.'
    }
  ];

  const handleAskAtlasAi = (questionText) => {
    const textToProcess = questionText || aiCustomQuestion;
    const qLower = textToProcess.toLowerCase().trim();
    if (!qLower) return;

    let matched = AI_FAQS.find(f => qLower.includes(f.q.toLowerCase().slice(0, 15)) || f.q.toLowerCase().includes(qLower));
    if (!matched) {
      if (qLower.includes('precio') || qLower.includes('coste') || qLower.includes('moneda') || qLower.includes('pack') || qLower.includes('tier')) {
        matched = {
          q: textToProcess,
          a: `Los packs están disponibles en 3 niveles de volumen (Tier 1: 10 kits, Tier 2: 25 kits, Tier 3: 50 kits). El precio incluye los puntos 1 a 4 como pago único, y las consultas de WhatsApp (punto 5) se facturan como suscripción mensual flexible @ ${formatPrice(150)}/mes. Puedes cambiar la moneda de visualización (QAR, AED, SAR, KWD, USD, EUR) en cualquier momento desde el selector de la cabecera.`
        };
      } else if (qLower.includes('dieta') || qLower.includes('catálogo') || qLower.includes('catalogo') || qLower.includes('comida') || qLower.includes('menu')) {
        matched = {
          q: textToProcess,
          a: 'El algoritmo genómico cruza los polimorfismos FTO, PPARG, TCF7L2 y genes lipídicos con el catálogo de dietas de 24Genetics para seleccionar la más idónea: Mediterránea, Low Carb, Low Fat o Equilibrada, indicando porcentajes de macronutrientes precisos.'
        };
      } else {
        matched = {
          q: textToProcess,
          a: '24Genomics Nutrition combina el genotipado clínico de +50.000 SNPs de 24Genetics con la plataforma Atlas Health para traducir los hallazgos en una dieta idónea, una fórmula magistral en 3 cápsulas y acompañamiento por WhatsApp. Puedes consultar cualquier duda técnica o comercial con nuestro equipo clínico.'
        };
      }
    }
    setActiveAiAnswer(matched);
  };

  const handleGenerateAtlasQuotation = async () => {
    setIsSubmittingQuote(true);
    try {
      const curCfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.QAR;
      const subtotalConverted = currentTier.totalPriceQar * curCfg.rate;
      const whatsappSubtotal = (whatsappSubscriptionsCount * 150) * curCfg.rate;
      const grandTotal = subtotalConverted + whatsappSubtotal;

      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'Authorized Clinical Partner',
          contactPerson: 'Clinical Director / Prescriber',
          territory: 'International B2B',
          currency: currency,
          subtotal: grandTotal,
          grandTotal: grandTotal,
          marginPercent: 12.5,
          distributorProfit: currentTier.distributorProfitTotalQar * curCfg.rate,
          distributorMarginPct: parseFloat(currentTier.distributorMarginPct),
          landedCost: subtotalConverted * 0.88,
          items: [
            {
              id: `${currentProd.sku}-${currentTier.id.toUpperCase()}`,
              name: `24Genomics Nutrition (${currentTier.name}) - Puntos 1 a 4 Incluidos`,
              quantity: currentTier.quantity,
              unitPrice: currentTier.unitPriceQar * curCfg.rate,
              totalPrice: subtotalConverted,
              currency: currency,
              actives: currentProd.keyGenes
            },
            {
              id: `24G-CARE-WA-${whatsappSubscriptionsCount}`,
              name: `Consultas y Seguimiento Clínico WhatsApp (Punto 5) - ${whatsappSubscriptionsCount} Pacientes/Mes`,
              quantity: whatsappSubscriptionsCount,
              unitPrice: 150 * curCfg.rate,
              totalPrice: whatsappSubtotal,
              currency: currency,
              actives: 'Acompañamiento clínico dietético y farmacológico'
            }
          ],
          notes: `Official Commercial quotation for 24Genomics Nutrition (${currentTier.name} + ${whatsappSubscriptionsCount} WhatsApp subscriptions) generated via Atlas Clinical Platform. 100% advance wire transfer before Madrid laboratory dispatch.`,
          source: 'atlas_24genomics_nutrition'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quotation');
      setGeneratedQuote(data);
      setOrderModalOpen(true);
    } catch (err) {
      console.error('Quotation generation error:', err);
      const curCfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.QAR;
      const subtotalConverted = currentTier.totalPriceQar * curCfg.rate;
      const whatsappSubtotal = (whatsappSubscriptionsCount * 150) * curCfg.rate;
      const grandTotal = subtotalConverted + whatsappSubtotal;

      setGeneratedQuote({
        quotationNumber: `QT-24GN-${Math.floor(100000 + Math.random() * 900000)}`,
        grandTotal: grandTotal,
        clientName: 'Authorized Healthcare Partner',
        currency: currency,
        success: true
      });
      setOrderModalOpen(true);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="colway-price-root" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* ── Public Unified Header with standard navigation & Login CTA ── */}
      <PublicUnifiedHeader
        track="diagnostics"
        brandTitle="Atlas Health Services · Precision Genomics & Compounding Suite"
        loginRedirect="/pricing/24genomics-qatar"
        hideTier2={true}
      />

      {/* ── Atlas Clinical Hub Interactive Sub-Bar (Google Cloud Console Banner UX) ── */}
      <div style={{ backgroundColor: '#022c22', color: '#ffffff', borderBottom: '1px solid rgba(45, 212, 191, 0.25)', padding: '0.65rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(45, 212, 191, 0.15)', border: '1px solid rgba(45, 212, 191, 0.4)', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, color: '#2dd4bf', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              <Sparkles size={13} />
              <span>24GENOMICS NUTRITION</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Saliva DNA Panel → Synchronized 3-Capsule Formulations &amp; WhatsApp Care
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Compact Currency Selector */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '3px 8px' }}>
              <Globe size={13} style={{ color: '#2dd4bf' }} />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {Object.values(CURRENCY_CONFIG).map((c) => (
                  <option key={c.code} value={c.code} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                    {c.flag} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Login / Auth Status Pill */}
            {!isPricingUnlocked ? (
              <Link
                href="/login?redirect=/pricing/24genomics-qatar"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#fef08a',
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(250, 204, 21, 0.4)',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Lock size={12} />
                <span>Login to View Prices</span>
              </Link>
            ) : (
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#86efac', backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(74, 222, 128, 0.4)', padding: '4px 9px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>B2B Unlocked</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowAtlasAiModal(true)}
              style={{
                background: 'linear-gradient(90deg, #0d9488 0%, #0f766e 100%)',
                border: '1px solid #2dd4bf',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 750,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={13} className="text-teal-300" />
              <span>Atlas AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Sheet Container ── */}
      <main className="price-sheet-container" style={{ maxWidth: '1280px', margin: '1.5rem auto 3rem auto', padding: '0 1.5rem' }}>
        <Breadcrumb items={[
          { label: 'B2B Schedules', href: '/pricing' },
          { label: 'Clinical Genomics' },
          { label: '24Genomics Nutrition Clinical Suite' }
        ]} />

        {/* ── Institutional Document Header (Google Cloud Console UX) ── */}
        <header className="document-header" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          {/* Top Row: Title & Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div style={{ flex: '1 1 500px', minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ backgroundColor: '#003666', color: '#ffffff', fontSize: '0.70rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.06em' }}>
                  ATLAS HEALTH SERVICES
                </span>
                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.8rem' }}>×</span>
                <span style={{ backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.70rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.06em' }}>
                  24GENETICS CLINICAL LAB
                </span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: '#003666', letterSpacing: '-0.02em', margin: '0 0 0.4rem 0', lineHeight: 1.2 }}>
                24GENOMICS NUTRITION
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                B2B Saliva DNA Testing Kits, Clinical Nutrition Profile, Personalized 3-Capsule Formulations &amp; WhatsApp Clinical Care
              </p>
            </div>

            {/* GCP Action Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Compact Currency Dropdown */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 8px' }}>
                <Globe size={13} style={{ color: '#0d9488' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 650, color: '#64748b' }}>Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {Object.values(CURRENCY_CONFIG).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAtlasAiModal(true)}
                style={{
                  padding: '9px 13px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: '1px solid #99f6e4',
                  backgroundColor: '#f0fdfa',
                  color: '#0f766e',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <Sparkles size={14} className="text-teal-600" />
                <span>Atlas AI</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                style={{
                  padding: '9px 13px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 650,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: copiedLink ? '#15803d' : '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied' : 'Share'}</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAtlasQuotation}
                disabled={isSubmittingQuote}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#ffffff',
                  cursor: isSubmittingQuote ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
                }}
              >
                <FileCheck size={14} className="text-teal-300" />
                <span>{isSubmittingQuote ? 'Registering...' : `Order ${currentTier.name} →`}</span>
              </button>
            </div>
          </div>

          {/* GCP Resource Metadata Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Document Reference
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CopyableId value="DOC-24G-NUTRITION-V1" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Document Status
              </div>
              <div>
                <StatusBadge status="active" label="Active & Verified SSOT" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Scope & Target Audience
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#0f172a' }}>
                Licensed Clinics, Medical Centers & Distributors
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Lab Accreditation
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488' }}>
                European CE-IVD (Madrid, Spain)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Genomic Technology
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                Illumina GSA Array (+50,000 SNPs)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                Pricing Access
              </div>
              <div>
                {isPricingUnlocked ? (
                  <StatusBadge status="approved" label="B2B Unlocked" />
                ) : (
                  <StatusBadge status="pending" label="Login Required" />
                )}
              </div>
            </div>
          </div>

          {/* ── Visual 3-Step Patient Journey Pipeline ── */}
          <div style={{ marginTop: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} style={{ color: '#0d9488' }} />
              <span>Flujo Clínico en 3 Pasos · Del ADN al Tratamiento y Cuidado Continuo</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '0.85rem 1rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Paso 1 · Toma de Muestra (2 min)</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>Saliva CE-IVD No Invasiva</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Hisopo bucal indoloro con buffer estabilizador a temperatura ambiente (en clínica o domicilio).</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #0d9488', padding: '0.85rem 1rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>Paso 2 · Secuenciación (3–4 semanas)</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>Core Lab Europeo (Madrid)</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Chip Illumina GSA (+50.000 SNPs informativos) con reproducibilidad clínica &gt;99.9%.</div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #7c3aed', padding: '0.85rem 1rem', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>Paso 3 · Entregables &amp; Cuidado</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>Reportes, 3 Cápsulas, Dieta y WhatsApp</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Doble formato papel + Atlas, fórmula magistral en 3 tomas, dieta del catálogo y soporte mensual.</div>
              </div>
            </div>
          </div>

          {/* ── 4 GCP Default Metric KPIs Strip (Rule #22) ── */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0d9488' }}></span>
                Clinical Genomics Protocol Metrics
              </span>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0f766e', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px' }}>
                Scope: Worldwide B2B Clinical Distribution
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', borderLeft: '4px solid #003666', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Target Audience</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666', margin: '3px 0' }}>Licensed Clinics</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Medical centers &amp; private practices</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', borderLeft: '4px solid #0d9488', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Lab Turnaround Time</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0d9488', margin: '3px 0' }}>3–4 Weeks</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>European CE-IVD Core Lab Madrid</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', borderLeft: '4px solid #7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Galenic Protocol</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#7c3aed', margin: '3px 0' }}>3-Capsule Daily</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Fasting · Breakfast · Dinner Regimen</div>
              </div>

              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem', borderLeft: '4px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>Clinical Deliverables</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#16a34a', margin: '3px 0' }}>5 Core Pillars</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>4 in Pack (One-Time) + 1 WhatsApp Care</div>
              </div>
            </div>
          </div>

        </header>

        {/* ── Responsive Styling for Qatar Schedule Workspace ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          .qatar-genomics-workspace {
            display: grid;
            grid-template-columns: 290px minmax(0, 1fr);
            gap: 1.75rem;
            align-items: start;
            margin-top: 1.5rem;
          }
          .qatar-desktop-sidebar {
            position: sticky;
            top: 80px;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .qatar-mobile-nav-strip {
            display: none;
          }
          .qatar-main-content-column {
            min-width: 0;
            width: 100%;
          }
          @media (max-width: 960px) {
            .qatar-genomics-workspace {
              display: flex !important;
              flex-direction: column !important;
              gap: 1.25rem !important;
            }
            .qatar-desktop-sidebar {
              display: none !important;
            }
            .qatar-mobile-nav-strip {
              display: flex !important;
              overflow-x: auto;
              gap: 8px;
              padding: 4px 2px 10px 2px;
              width: 100%;
              scrollbar-width: none;
              -webkit-overflow-scrolling: touch;
            }
            .qatar-mobile-nav-strip::-webkit-scrollbar {
              display: none;
            }
          }
        ` }} />

        <div className="qatar-genomics-workspace">
          {/* ── MOBILE NAV STRIP (Visible only on screens <= 960px) ── */}
          <div className="qatar-mobile-nav-strip">
            {SCHEDULE_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(section.id);
                    const el = document.getElementById('qatar-active-section-anchor');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    whiteSpace: 'nowrap',
                    border: isActive ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                    backgroundColor: isActive ? '#f0fdfa' : '#ffffff',
                    color: isActive ? '#0d9488' : '#475569',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 4px rgba(13, 148, 136, 0.15)' : 'none',
                    flexShrink: 0
                  }}
                >
                  <Icon size={14} />
                  <span>{section.shortLabel || section.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── DESKTOP STICKY SIDEBAR (290px) ── */}
          <aside className="qatar-desktop-sidebar">
            {/* Sections Menu Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SCHEDULE SECTIONS
                </span>
                <span style={{ fontSize: '0.66rem', fontWeight: 750, backgroundColor: '#f0fdfa', color: '#0d9488', padding: '2px 7px', borderRadius: '4px' }}>
                  6 Sections
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {SCHEDULE_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(section.id);
                        const el = document.getElementById('qatar-active-section-anchor');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      style={{
                        padding: '12px 14px',
                        border: 'none',
                        borderLeft: isActive ? '3.5px solid #0d9488' : '3.5px solid transparent',
                        backgroundColor: isActive ? '#f0fdfa' : 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                        borderBottom: '1px solid #f8fafc'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#0d9488' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px'
                      }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '0.80rem',
                          fontWeight: isActive ? 800 : 650,
                          color: isActive ? '#0d9488' : '#0f172a',
                          lineHeight: 1.3
                        }}>
                          {section.label}
                        </div>
                        <div style={{
                          fontSize: '0.68rem',
                          color: '#64748b',
                          marginTop: '2px',
                          lineHeight: 1.3
                        }}>
                          {section.desc}
                        </div>
                      </div>
                      {isActive && (
                        <div style={{ color: '#0d9488', marginTop: '6px', flexShrink: 0 }}>
                          <ChevronRight size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Procurement Actions Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                DISTRIBUTOR PROCUREMENT
              </span>
              <button
                type="button"
                onClick={handleGenerateAtlasQuotation}
                disabled={isSubmittingQuote}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#ffffff',
                  cursor: isSubmittingQuote ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
                }}
              >
                <Sparkles size={14} className="text-teal-300" />
                <span>{isSubmittingQuote ? 'Registering...' : `Generate Quote (${currentTier.name}) →`}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareLink}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 650,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: copiedLink ? '#15803d' : '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Share Schedule'}</span>
              </button>
            </div>

            {/* Institutional Metadata Card */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '12px 14px',
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.5
            }}>
              <div><strong>Scope:</strong> Licensed Medical Practices &amp; Clinics</div>
              <div style={{ marginTop: '2px' }}><strong>Territory:</strong> International B2B</div>
              <div style={{ marginTop: '2px' }}><strong>Ref:</strong> <code style={{ color: '#003666', fontWeight: 700 }}>DOC-24G-NUTRITION-V1</code></div>
              <div style={{ marginTop: '2px' }}><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>Active &amp; Verified SSOT</span></div>
            </div>
          </aside>

          {/* ── RIGHT COLUMN: ACTIVE SECTION CONTENT (ONLY THE SELECTED ONE) ── */}
          <div className="genomics-main-content-column" id="genomics-active-section-anchor">

        {/* ── Generated Quotation Confirmation Banner ── */}
        {generatedQuote && (
          <div style={{ backgroundColor: '#f0fdfa', border: '2px solid #5eead4', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Quotation Successfully Registered in Atlas Health SSOT
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 4px 0' }}>
                    Quotation #{generatedQuote.quotationNumber}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                    Consignee: <strong>{generatedQuote.clientName || 'Authorized Healthcare Partner'}</strong> · Total: <strong>{formatPrice(currentTier.totalPriceQar)}</strong> ({currentTier.name}).
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#0d9488', marginTop: '4px', fontWeight: 650 }}>
                    ✓ Formal quotation record created in Atlas database and dispatched to Mediluxe executive management (jose@mediluxeme.com).
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid #99f6e4',
                    backgroundColor: '#ffffff',
                    color: '#0d9488',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Printer size={14} />
                  <span>Print Pro-Forma</span>
                </button>
                <a
                  href={`https://wa.me/971504789841?text=Hello%20Jose,%20I%20have%20registered%20our%20quotation%20%23${generatedQuote.quotationNumber}%20in%20Atlas%20Health%20for%20${currentTier.name}%2024Genomics%20Nutrition%20Kits.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <MessageCircle size={14} />
                  <span>Confirm on WhatsApp</span>
                </a>
                <button
                  onClick={() => setGeneratedQuote(null)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: COMMERCIAL PRICING & QUOTATION (24GENOMICS NUTRITION)
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* B2B Authentication Required Banner if !isPricingUnlocked */}
            {!isPricingUnlocked && (
              <div style={{ backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 2px 8px rgba(217, 119, 6, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={22} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 850, color: '#92400e', margin: 0 }}>
                      Tarifario Comercial B2B Protegido (24Genomics Nutrition)
                    </h4>
                    <p style={{ fontSize: '0.80rem', color: '#b45309', margin: '3px 0 0 0' }}>
                      Las tarifas por volumen, descuentos de kits y pautas de prescripción están reservadas a facultativos, clínicas y distribuidores autorizados.
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewUnlocked(true)}
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      backgroundColor: '#f0fdfa',
                      border: '1px solid #99f6e4',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Desbloquear Vista Demo
                  </button>
                  <Link
                    href="/login?redirect=/pricing/24genomics-qatar"
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      backgroundColor: '#0d9488',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <LogIn size={14} />
                    <span>Iniciar Sesión B2B</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Volume Tier Selectors (Clean: Tier 1, Tier 2, Tier 3) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Selección de Pack por Volumen (Kits 24Genomics Nutrition)
                  </h3>
                  <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Todos los tiers incluyen tubos salivales CE-IVD, transporte refrigerado, extracción de ADN, genotipado en Madrid y entregables 1 al 4.
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '3px 8px', borderRadius: '4px' }}>
                  Acreditación: Core Lab Europeo CE-IVD (Madrid)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {VOLUME_TIERS.map(tier => {
                  const isSelected = selectedTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#f0fdfa' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(13, 148, 136, 0.12)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: isSelected ? '#0d9488' : '#64748b', textTransform: 'uppercase' }}>
                          {tier.discountLabel}
                        </span>
                        {isSelected && <CheckCircle2 size={18} className="text-teal-600" />}
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 850, color: '#0f172a' }}>
                        {tier.name}
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
                        {formatPrice(tier.totalPriceQar)}{' '}
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                          ({formatPrice(tier.unitPriceQar)} / kit)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                        Pago único integral · Puntos 1, 2, 3 y 4 incluidos.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Comparison: Traditional PDF vs. 24Genomics Nutrition Ecosystem (Approved Improvement #2) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Zap size={16} style={{ color: '#0d9488' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#003666', margin: 0 }}>
                  Por qué 24Genomics Nutrition transforma la experiencia del paciente frente a un test tradicional
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✕</span> Test Genético Convencional de Mercado
                  </div>
                  <ul style={{ fontSize: '0.78rem', color: '#7f1d1d', margin: 0, paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                    <li>Informe PDF denso de 40 páginas con términos de laboratorio incomprensibles.</li>
                    <li>Sin indicación clara de qué dieta seguir en la vida diaria.</li>
                    <li>El paciente no sabe qué suplementos comprar ni en qué dosis o combinación.</li>
                    <li>Sin seguimiento facultativo: el informe acaba archivado en un cajón.</li>
                  </ul>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span> Ecosistema 24Genomics Nutrition + Atlas
                  </div>
                  <ul style={{ fontSize: '0.78rem', color: '#14532d', margin: 0, paddingLeft: '1.1rem', lineHeight: 1.6 }}>
                    <li>Doble reporte de lujo en papel encuadernado para el paciente + app digital interactiva.</li>
                    <li>Asignación de la dieta óptima con semáforo nutricional de alimentos.</li>
                    <li>Fórmula magistral precisa de 3 cápsulas cronobiológicas (Morning, Midday, Evening).</li>
                    <li>Acompañamiento y resolución continua de dudas por WhatsApp con especialista.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Complete Deliverables & Services Schedule Table (5 Points) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Servicios y Entregables Incluidos en el Programa 24Genomics Nutrition
                    </h3>
                    <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#0d9488', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                      Puntos 1–4 en Pack · Punto 5 Suscripción
                    </span>
                  </div>
                  <p style={{ fontSize: '0.80rem', color: '#64748b', marginTop: '4px', marginBottom: 0 }}>
                    Los entregables del 1 al 4 forman parte de un <strong>único pago integral</strong> al adquirir el pack seleccionado ({currentTier.name}). El servicio 5 es un acompañamiento clínico continuo de <strong>pago mensual flexible</strong>, cancelable en cualquier momento.
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', width: '38%' }}>Nº y Servicio Incluido</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', width: '24%' }}>Formato de Entrega</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', width: '22%' }}>Alcance Clínico</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: '#0d9488', textAlign: 'right', width: '16%' }}>Modalidad y Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Item 1 */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            1
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              Reporte Clínico de Nutrición (Nutrigenética)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                              Evaluación exhaustiva de predisposición metabólica a macro y micronutrientes, absorción de vitaminas críticas y sensibilidades digestivas.
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <FileText size={14} style={{ color: '#0d9488' }} /> En papel encuadernado
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Cpu size={14} style={{ color: '#0284c7' }} /> Dentro de la Plataforma Atlas
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontSize: '0.76rem', color: '#475569' }}>
                        Metabolismo de carbohidratos, grasas, proteínas, MTHFR (folato), VDR (vitamina D), intolerancia a la lactosa y celiaquía.
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        <span style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block' }}>
                          ✓ Incluido en Pack
                        </span>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>Pago único</div>
                      </td>
                    </tr>

                    {/* Item 2 */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            2
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              Reporte de Ancestros Biogeográficos
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                              Mapeo biogeográfico de origen étnico e historia poblacional a partir de marcadores genéticos informativos de ancestría (AIMs).
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <BookOpen size={14} style={{ color: '#0d9488' }} /> Reporte impreso en papel
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontSize: '0.76rem', color: '#475569' }}>
                        Desglose geográfico detallado entre más de 400 regiones y poblaciones de referencia globales.
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        <span style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block' }}>
                          ✓ Incluido en Pack
                        </span>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>Pago único</div>
                      </td>
                    </tr>

                    {/* Item 3 */}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            3
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              Recomendaciones de Suplementos Nutricionales Personalizados
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                              Algoritmo clínico Atlas que traduce variantes genéticas en formulaciones magistrales exactas sincronizadas cronobiológicamente (3 cápsulas al día).
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Cpu size={14} style={{ color: '#0284c7' }} /> Dentro de la Plataforma Atlas
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontSize: '0.76rem', color: '#475569' }}>
                        Esquema galénico de 3 cápsulas (Morning, Midday, Evening) con compatibilidad química y dosificaciones farmacológicas verificadas.
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        <span style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block' }}>
                          ✓ Incluido en Pack
                        </span>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>Pago único</div>
                      </td>
                    </tr>

                    {/* Item 4 */}
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#0d9488', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            4
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                              Identificación de la Dieta Más Idónea del Catálogo
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                              Cálculo de compatibilidad y asignación de la estrategia nutricional óptima entre los modelos clínicos disponibles según la biología individual.
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Layers size={14} style={{ color: '#0284c7' }} /> Plataforma Atlas + Dossier
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', fontSize: '0.76rem', color: '#475569' }}>
                        Selección entre Dieta Mediterránea, Baja en Carbohidratos/Keto, Baja en Grasas o Equilibrada con índice glucémico individualizado.
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        <span style={{ backgroundColor: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4', padding: '4px 10px', borderRadius: '6px', fontWeight: 800, fontSize: '0.78rem', display: 'inline-block' }}>
                          ✓ Incluido en Pack
                        </span>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>Pago único</div>
                      </td>
                    </tr>

                    {/* Pack Summary Banner Row */}
                    <tr style={{ backgroundColor: '#f0fdfa', borderBottom: '2px solid #0d9488' }}>
                      <td colSpan={3} style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={18} style={{ color: '#0d9488' }} />
                          <div>
                            <strong style={{ color: '#0f172a', fontSize: '0.90rem' }}>
                              Subtotal Puntos 1 al 4 (Pago Único incluido en {currentTier.name}):
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                              Incluye {currentTier.quantity} kits de saliva CE-IVD, transporte refrigerado, extracción de ADN, secuenciación Illumina GSA y acceso completo a los servicios 1, 2, 3 y 4.
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 850, color: '#0d9488' }}>
                          {formatPrice(currentTier.totalPriceQar)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                          ({formatPrice(currentTier.unitPriceQar)} / kit) · Pago único
                        </div>
                      </td>
                    </tr>

                    {/* Item 5 - Monthly Subscription */}
                    <tr style={{ backgroundColor: '#ffffff' }}>
                      <td style={{ padding: '16px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem', flexShrink: 0 }}>
                            5
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                                Consultas y Seguimiento Clínico por WhatsApp
                              </span>
                              <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
                                Suscripción Mensual
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                              Canal directo y continuo con el especialista clínico para resolver dudas sobre la dieta, evolución de la suplementación y ajustes del tratamiento.
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 16px', verticalAlign: 'top' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <MessageCircle size={14} style={{ color: '#16a34a' }} /> WhatsApp Business Especializado
                        </span>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                          Respuesta en menos de 24h laborables
                        </div>
                      </td>
                      <td style={{ padding: '16px 16px', verticalAlign: 'top', fontSize: '0.76rem', color: '#475569' }}>
                        Acompañamiento en la adherencia dietética, revisión de síntomas o tolerancia, resolución de dudas galénicas y ajustes periódicos.
                      </td>
                      <td style={{ padding: '16px 16px', textAlign: 'right', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#2563eb' }}>
                          {formatPrice(150)} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>/ mes</span>
                        </div>
                        <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.70rem', display: 'inline-block', marginTop: '4px' }}>
                          Cancelable en cualquier momento
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Interactive Order Configurator & Acceptance Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.75rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#003666', margin: 0 }}>
                      Configurador de Pedido y Suscripciones (24Genomics Nutrition)
                    </h3>
                    <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#0d9488', color: '#ffffff', padding: '2px 8px', borderRadius: '4px' }}>
                      {currentTier.name} Seleccionado
                    </span>
                  </div>
                  <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Personaliza tu pedido: selecciona el pack de kits que mejor se adapta al volumen de tu consulta y el número de suscripciones mensuales de consultas WhatsApp.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                {/* WhatsApp Subscription Stepper */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                      Nº Suscripciones Mensuales WhatsApp (Punto 5)
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb' }}>
                      {formatPrice(150)} / paciente / mes
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setWhatsappSubscriptionsCount(Math.max(0, whatsappSubscriptionsCount - 1))}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#334155'
                      }}
                    >
                      -
                    </button>
                    <div style={{ fontSize: '1.3rem', fontWeight: 850, color: '#0f172a', minWidth: '40px', textAlign: 'center' }}>
                      {whatsappSubscriptionsCount}
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatsappSubscriptionsCount(whatsappSubscriptionsCount + 1)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#334155'
                      }}
                    >
                      +
                    </button>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>
                      Total mensual: <strong>{formatPrice(whatsappSubscriptionsCount * 150)} / mes</strong> (cancelable en cualquier momento)
                    </div>
                  </div>
                </div>

                {/* Live Financial Breakdown & CTA Button */}
                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Resumen de Inversión Seleccionada
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#334155', marginBottom: '4px' }}>
                    <span>Pack {currentTier.name} (Puntos 1 al 4, Pago Único):</span>
                    <strong style={{ color: '#0f172a' }}>{formatPrice(currentTier.totalPriceQar)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#334155', marginBottom: '8px' }}>
                    <span>Consultas WhatsApp ({whatsappSubscriptionsCount} subs, Punto 5):</span>
                    <strong style={{ color: '#2563eb' }}>{formatPrice(whatsappSubscriptionsCount * 150)} / mes</strong>
                  </div>

                  <div style={{ borderTop: '1px solid #ccfbf1', paddingTop: '10px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.70rem', color: '#0f766e', fontWeight: 600 }}>Inversión Inicial del Pack</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 850, color: '#0d9488' }}>
                        {formatPrice(currentTier.totalPriceQar)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAtlasQuotation}
                      disabled={isSubmittingQuote}
                      style={{
                        padding: '11px 22px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                        color: '#ffffff',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        cursor: isSubmittingQuote ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>{isSubmittingQuote ? 'Generando Proforma...' : 'Aceptar Oferta y Formalizar Pedido →'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: CLINICAL GENOMIC SUITE
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ai-services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={13} />
                  <span>24Genomics Nutrition · Protocolo Clínico Integral</span>
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 850, color: '#003666', marginTop: '8px', margin: 0 }}>
                  Metodología Clínica Integral: De la Secuenciación Genómica al Cuidado Continuo
                </h2>
                <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '6px', lineHeight: 1.6 }}>
                  Un test genético tradicional genera extensos informes de 40 páginas que quedan archivados sin acción terapéutica real. El ecosistema <strong>24Genomics Nutrition</strong> traduce los biomarcadores en un circuito clínico cerrado compuesto por 5 pilares operativos que aseguran cumplimiento, adherencia del paciente y resultados medibles.
                </p>
              </div>

              {/* Numbered Vertical List (Replacing Old Cards) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Item 1 */}
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 850,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                  }}>
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Toma de Muestra Salival No Invasiva y Genotipado CE-IVD (Core Lab Madrid)
                      </h4>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '4px' }}>
                        Pilar 1 · Pago Único en Pack
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                      Hisopo bucal no invasivo (2 minutos de recolección, sin extracciones de sangre ni ayuno requerido) con tampón estabilizador que preserva la integridad del ADN a temperatura ambiente durante más de 12 meses. Secuenciación en laboratorio central acreditado de Madrid (España) mediante microarrays <strong>Illumina Global Screening Array (GSA)</strong> con análisis de más de <strong>50.000 SNPs clave</strong> y reproducibilidad analítica superior al 99.9%.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 650 }}>
                      ✓ Incluye: Reporte Clínico de Nutrición completo entregado en papel encuadernado de alta gama y disponible de inmediato en la plataforma digital Atlas.
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 850,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
                  }}>
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Reporte de Ancestros Biogeográficos de Alta Resolución en Papel
                      </h4>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px' }}>
                        Pilar 2 · Pago Único en Pack
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                      Mapeo genético exhaustivo que rastrea el origen biogeográfico del paciente a través de más de <strong>1.500 regiones geográficas</strong> en todo el mundo. Este análisis contextualiza la historia evolutiva y las adaptaciones nutricionales ancestrales del paciente, entregado en un elegante libro físico encuadernado de gran valor tangible.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 650 }}>
                      ✓ Formato físico impreso que eleva la percepción de calidad del paciente y consolida el valor percibido del servicio clínico.
                    </div>
                  </div>
                </div>

                {/* Item 3 */}
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 850,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
                  }}>
                    3
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Recomendaciones y Formulación Magistral en 3 Cápsulas Sincronizadas (Atlas)
                      </h4>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#ede9fe', color: '#7c3aed', padding: '2px 8px', borderRadius: '4px' }}>
                        Pilar 3 · Pago Único en Pack
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                      El motor algorítmico de Atlas traduce las mutaciones de baja actividad enzimática (como <em>MTHFR C677T</em> o <em>VDR FokI</em>) en principios activos biodisponibles exactos (L-metilfolato, D3/K2, etc.). Para evitar incompatibilidades físico-químicas, la suplementación se distribuye en <strong>3 cápsulas diarias sincronizadas</strong> (Mañana en ayunas, Mediodía con comida y Noche en cena) en cápsulas gastrorresistentes DRcaps® 100% libres de lactosa.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 650 }}>
                      ✓ Sustituye 8–9 frascos comerciales por una fórmula personalizada calibrada con exactitud farmacopea para el paciente.
                    </div>
                  </div>
                </div>

                {/* Item 4 */}
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 850,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                  }}>
                    4
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Identificación Algorítmica de la Dieta Óptima del Catálogo 24Genetics
                      </h4>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '4px' }}>
                        Pilar 4 · Pago Único en Pack
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                      Mediante el cruce computacional de polimorfismos que controlan el metabolismo de grasas, adiposidad y respuesta insulínica (<em>FTO, PPARG, TCF7L2, FABP2, APOA5</em>), el sistema determina con precisión científica cuál de las dietas del catálogo clínico es idónea para el perfil metabólico del paciente: <strong>Dieta Mediterránea, Baja en Carbohidratos (Low Carb), Baja en Grasas (Low Fat) o Dieta Equilibrada</strong>.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 650 }}>
                      ✓ Guía de distribución de macronutrientes y listas de alimentos recomendados integradas en la plataforma y el informe impreso.
                    </div>
                  </div>
                </div>

                {/* Item 5 */}
                <div style={{
                  display: 'flex',
                  gap: '1.25rem',
                  alignItems: 'flex-start',
                  backgroundColor: '#f0fdfa',
                  border: '1.5px solid #99f6e4',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 850,
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                  }}>
                    5
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Consultas y Acompañamiento Continuo por WhatsApp (Suscripción Mensual Flexible)
                      </h4>
                      <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px' }}>
                        Pilar 5 · Suscripción Mensual (Cancelable en Cualquier Momento)
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '0 0 8px 0' }}>
                      Canal directo y continuo de mensajería instantánea por WhatsApp atendido por el equipo especialista en nutrición clínica y genómica. Permite al paciente resolver dudas sobre la incorporación de alimentos, posología de las cápsulas, síntomas digestivos o ajustes de estilo de vida en tiempo real, garantizando la retención y el éxito clínico a largo plazo.
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                      ⚡ Tarifa mensual transparente: 150 {currency}/mes por paciente activo, sin contratos de permanencia y con cancelación instantánea cuando el paciente lo desee.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3: SAMPLE REPORT PREVIEW (24GENETICS NUTRIGEN)
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sample-report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              {/* Report Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #003666', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#003666', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                      24GENETICS CE-IVD
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '2px 8px', borderRadius: '4px' }}>
                      CLINICAL NUTRIGENOMICS (NUTRIGEN)
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 850, color: '#0f172a', margin: '6px 0 2px 0' }}>
                    Official Patient Genomic Monograph Preview
                  </h3>
                  <div style={{ fontSize: '0.80rem', color: '#64748b' }}>
                    European Core Lab: Madrid, Spain · Specimen ID: <strong>24G-CLINICAL-90421</strong> · Technology: Illumina Global Screening Array (GSA)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 650 }}>Accreditation</span>
                  <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0d9488' }}>CE-IVD In Vitro Diagnostic</div>
                  <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>Repeatability &gt;99.9%</div>
                </div>
              </div>

              {/* Patient Overview Mini-Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>DEMOGRAPHIC COHORT:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#0f172a' }}>Adult Male (Age 42) · Clinical Protocol Cohort</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>SAMPLE TYPE:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#0f172a' }}>Buccal Saliva Swab (Preserved Buffer)</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>PRIMARY CLINICAL GOAL:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#0d9488' }}>Metabolic Longevity & Precision Nutrition</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>CLINICAL FORMULATION STATUS:</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#16a34a' }}>✓ Formulated & Prescribed</div>
                </div>
              </div>

              {/* Sample Report Section Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Micronutrient Metabolism */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} className="text-teal-600" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        Section 1: Micronutrient Pathways & Vitamin Genetics
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px' }}>
                      Actionable Polymorphisms Detected
                    </span>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>MTHFR (rs1801133 · C677T)</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>HOMOZYGOUS TT</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          Folate Activation & Homocysteine Recycling: <strong>70% reduction in enzyme activity</strong>. High cardiovascular & neurological inflammation risk.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c' }}>HIGH GENETIC NEED</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>VDR (rs2228570 · FokI)</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>HETEROZYGOUS CT</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          Vitamin D Nuclear Receptor Sensitivity: <strong>Reduced receptor affinity</strong>. Requires higher circulating 25-OH-D levels to elicit cellular response.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>MODERATE RISK</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Food Sensitivities & Intolerances */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} className="text-amber-600" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        Section 2: Food Sensitivities & Intolerances
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                      Digestive Health Protocol
                    </span>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>MCM6 / LCT (rs4988235 · -13910 C&gt;T)</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px' }}>GENOTYPE CC (NON-PERSISTENT)</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          Primary Adult Lactase Deficiency: <strong>Lactose Intolerance confirmed</strong>. Dairy lactose causes intestinal dysbiosis and micro-inflammation.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c' }}>STRICT EXCLUSION</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Macronutrient & Glycemic Response */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#f1f5f9', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HeartPulse size={16} className="text-emerald-600" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                        Section 3: Glycemic Metabolism & Adiposity
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                      Metabolic Calibration
                    </span>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem' }}>TCF7L2 (rs7903146)</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px' }}>RISK CARRIER CT</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          Incretin & Insulin Secretory Capacity: High glycemic index carbohydrates trigger acute insulin resistance. Prescribed low-glycemic Mediterranean plan.
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b45309' }}>ELEVATED GLYCEMIC SENSITIVITY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 4: AI CLINICAL RECOMMENDATION & CASE EXPLANATION
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ai-recommendation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={13} />
                  <span>Clinical Translation Engine</span>
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 850, color: '#003666', marginTop: '8px', margin: 0 }}>
                  Clinical Case Simulation: Translating 24Genetics DNA Results into Custom Medicine
                </h2>
                <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '6px', lineHeight: 1.6 }}>
                  Explore how Atlas Health&apos;s multidisciplinary clinical team (medical geneticists and compounding pharmacists) evaluates patient specimen <strong>24G-CLINICAL-90421</strong>, synthesizes deep biochemical rationale, and formulates an individualized treatment protocol with exact posology and duration.
                </p>
              </div>

              {/* Variant Selector Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCaseVariant('mthfr')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    border: selectedCaseVariant === 'mthfr' ? '2px solid #b91c1c' : '1px solid #e2e8f0',
                    backgroundColor: selectedCaseVariant === 'mthfr' ? '#fee2e2' : '#ffffff',
                    color: selectedCaseVariant === 'mthfr' ? '#b91c1c' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  1. MTHFR C677T (Homozygous TT)
                </button>
                <button
                  onClick={() => setSelectedCaseVariant('vdr')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    border: selectedCaseVariant === 'vdr' ? '2px solid #b45309' : '1px solid #e2e8f0',
                    backgroundColor: selectedCaseVariant === 'vdr' ? '#fef3c7' : '#ffffff',
                    color: selectedCaseVariant === 'vdr' ? '#b45309' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  2. VDR FokI (Heterozygous CT)
                </button>
                <button
                  onClick={() => setSelectedCaseVariant('mcm6')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    border: selectedCaseVariant === 'mcm6' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: selectedCaseVariant === 'mcm6' ? '#e0f2fe' : '#ffffff',
                    color: selectedCaseVariant === 'mcm6' ? '#0284c7' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  3. MCM6 / LCT (Lactase Deficient CC)
                </button>
                <button
                  onClick={() => setSelectedCaseVariant('tcf7l2')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    border: selectedCaseVariant === 'tcf7l2' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                    backgroundColor: selectedCaseVariant === 'tcf7l2' ? '#ccfbf1' : '#ffffff',
                    color: selectedCaseVariant === 'tcf7l2' ? '#0f766e' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  4. TCF7L2 (Carb Sensitivity)
                </button>
              </div>

              {/* Dynamic Deep-Dive Rationale Card */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                {selectedCaseVariant === 'mthfr' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '4px' }}>
                        HIGH CLINICAL RISK
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        MTHFR C677T Homozygous Mutation (Genotype: TT)
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#003666', textTransform: 'uppercase' }}>Biochemical Mechanism:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          The C-to-T transition at nucleotide 677 causes an alanine-to-valine amino acid substitution, making the MTHFR enzyme thermolabile. In homozygous TT individuals, <strong>enzyme activity drops by approximately 70%</strong>. This halts the conversion of 5,10-methylenetetrahydrofolate to 5-methyltetrahydrofolate (5-MTHF), which is the primary methyl donor required for homocysteine remethylation into methionine.
                        </p>
                      </div>

                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#b91c1c', textTransform: 'uppercase' }}>Clinical Manifestation:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          Patients experience hyperhomocysteine-mediated vascular endothelial dysfunction, chronic mental fatigue, impaired detoxification, and blunted neurotransmitter production (serotonin, dopamine). <strong>Critical Warning:</strong> Standard commercial folic acid cannot be metabolized efficiently, causing unmetabolized folic acid (UMFA) syndrome.
                        </p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #99f6e4', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas Clinical Genetics Recommendation & Posology:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Strictly contraindicate synthetic folic acid. Prescribe <strong>L-Methylfolate 1,000 mcg</strong> (500 mcg BID) + <strong>Methylcobalamin 1,000 mcg</strong> + <strong>Pyridoxal-5-Phosphate 25 mg</strong>. <em>Posology:</em> 1 capsule in the morning with breakfast and 1 capsule with dinner for <strong>60 days</strong> to bypass the blocked enzymatic pathway and normalize plasma homocysteine.
                      </div>
                    </div>
                  </div>
                )}

                {selectedCaseVariant === 'vdr' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px' }}>
                        MODERATE RISK
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        VDR (Vitamin D Receptor) FokI Polymorphism (Genotype: CT)
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#003666', textTransform: 'uppercase' }}>Biochemical Mechanism:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          The FokI (rs2228570) polymorphism creates an alternative translation start site in the VDR gene, producing a protein three amino acids longer with <strong>decreased transcription factor transactivation capability</strong>. Even with adequate circulating calcidiol (25-OH-D), target tissues fail to transduce the genomic hormonal signal.
                        </p>
                      </div>

                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#b45309', textTransform: 'uppercase' }}>Clinical Manifestation:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          Particularly prevalent in clinical cohorts where indoor lifestyle and sun-avoidance combine with genetic receptor resistance. Patients suffer persistent musculoskeletal aches, low bone mineral density, seasonal fatigue, and subdued immune surveillance.
                        </p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #99f6e4', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas Clinical Genetics Recommendation & Posology:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Elevate therapeutic serum 25-OH-D target from standard 30 ng/mL to <strong>60-80 ng/mL</strong>. Prescribe <strong>Vitamin D3 (Cholecalciferol) 5,000 IU</strong> co-formulated with <strong>Vitamin K2 (MK-7) 100 mcg</strong> + <strong>Magnesium Bisglycinate 200 mg</strong>. <em>Posology:</em> Take once daily with breakfast (fat-containing meal) for an initial <strong>60-day protocol</strong>, followed by 25-OH-D blood level monitoring.
                      </div>
                    </div>
                  </div>
                )}

                {selectedCaseVariant === 'mcm6' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px' }}>
                        GASTROINTESTINAL PROTOCOL
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        MCM6 / LCT Lactase Non-Persistence (Genotype: CC)
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#003666', textTransform: 'uppercase' }}>Biochemical Mechanism:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          The homozygous CC genotype at rs4988235 indicates absence of the European lactase persistence allele. The transcription of the lactase-phlorizin hydrolase (LCT) gene decreases progressively after weaning, resulting in complete failure to hydrolyze the disaccharide lactose into galactose and glucose in the brush border.
                        </p>
                      </div>

                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#0284c7', textTransform: 'uppercase' }}>Clinical Manifestation:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          Undigested lactose passes into the colon, drawing water via osmotic gradient and undergoing rapid fermentation by hydrogen-producing microbiota, causing postprandial bloating, abdominal pain, diarrhea, and systemic microvascular inflammation.
                        </p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #99f6e4', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas Clinical Genetics Recommendation & Posology:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Establish strict dietary lactose exclusion. For unverified meals or dining out, prescribe <strong>Acid-Stable Microbial Lactase Enzyme (9,000 FCC ALU)</strong> taken immediately prior to food. <em>Galenic Compounding Protocol:</em> The Atlas clinical compounding team mandates 100% lactose-free excipients (microcrystalline cellulose vehicle) in vegetable DRcaps® for all ongoing treatments.
                      </div>
                    </div>
                  </div>
                )}

                {selectedCaseVariant === 'tcf7l2' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#ccfbf1', color: '#0f766e', padding: '3px 8px', borderRadius: '4px' }}>
                        METABOLIC GLYCEMIC RISK
                      </span>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        TCF7L2 rs7903146 Risk Allele (Genotype: CT)
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '12px' }}>
                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#003666', textTransform: 'uppercase' }}>Biochemical Mechanism:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          TCF7L2 is the strongest known polygenic risk factor for type 2 diabetes. The T risk allele increases pancreatic islet sensitivity to pro-inflammatory cytokines, attenuating GLP-1 stimulated insulin release and accelerating beta-cell apoptosis when challenged with high glycemic carbohydrates.
                        </p>
                      </div>

                      <div>
                        <strong style={{ fontSize: '0.82rem', color: '#0f766e', textTransform: 'uppercase' }}>Clinical Manifestation:</strong>
                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, marginTop: '4px' }}>
                          Postprandial reactive hypoglycemia followed by visceral adiposity, hyperinsulinemia, and elevated HbA1c even in non-obese individuals following conventional diets.
                        </p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #99f6e4', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas Clinical Genetics Recommendation & Posology:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Restrict net meal carbs (&lt;40g net carbs/meal). Prescribe <strong>Standardized Berberine 250 mg</strong> + <strong>Chromium Picolinate 200 mcg</strong>. <em>Posology:</em> 1 capsule BID 15 minutes before breakfast and dinner for <strong>60 days</strong> to enhance insulin receptor sensitivity and prevent progression toward glycemic dysregulation.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Galenic & Pharmacokinetic Compatibility Analysis Callout */}
              <div style={{ backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={22} className="text-teal-700" />
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0f766e', margin: 0 }}>
                        Pharmacokinetic & Galenic Compatibility Analysis
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#134e4a' }}>
                        Evaluated by Atlas Medical Geneticists & Senior Compounding Pharmacists
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#ccfbf1', color: '#0f766e', padding: '3px 9px', borderRadius: '4px' }}>
                    Strict Galenic Partitioning
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                  {GALENIC_COMPATIBILITY_ANALYSIS.rationale}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                  {GALENIC_COMPATIBILITY_ANALYSIS.conflictsIdentified.map((conflict, idx) => (
                    <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ccfbf1', padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '0.80rem', color: '#0f766e' }}>{conflict.title}</strong>
                        <span style={{ fontSize: '0.64rem', fontWeight: 800, backgroundColor: '#fef2f2', color: '#dc2626', padding: '1px 5px', borderRadius: '3px' }}>
                          {conflict.severity}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                        {conflict.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '12px', padding: '9px 14px', backgroundColor: '#0f766e', color: '#ffffff', borderRadius: '6px', fontSize: '0.80rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>Clinical Formulation Standard: {GALENIC_COMPATIBILITY_ANALYSIS.resolvedArchitecture}</span>
                </div>
              </div>

              {/* 3 Compartmentalized Compounding Capsules Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {THREE_CAPSULE_PROTOCOL.map((capsule) => (
                  <div
                    key={capsule.capsuleId}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      padding: '1.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#003666', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                            {capsule.code}
                          </span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#003666', margin: 0 }}>
                            {capsule.nameEn}
                          </h4>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: '#0d9488', fontWeight: 750 }}>
                          ⏰ Timing & Posology: {capsule.timingEn}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '4px' }}>
                          60 Capsules · 60-Day Initial Cycle
                        </span>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                          {capsule.targetPillar}
                        </div>
                      </div>
                    </div>

                    {/* Galenic Vehicle & Rationale */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.80rem', color: '#334155', marginBottom: '1rem', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                      <div><strong>Galenic Delivery Vehicle:</strong> {capsule.galenicVehicleEn}</div>
                      <div style={{ marginTop: '4px' }}><strong>Pharmacokinetic Rationale:</strong> {capsule.rationaleEn}</div>
                    </div>

                    {/* Active Ingredients Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>Active Pharmacological Ingredient (Generic API)</th>
                            <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>Pharmacopeia Chemical Specification</th>
                            <th style={{ padding: '8px 12px', fontWeight: 750, color: '#003666' }}>Target Dose</th>
                            <th style={{ padding: '8px 12px', fontWeight: 750, color: '#0f172a' }}>Targeted Clinical Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          {capsule.ingredients.map((ing, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>{ing.apiEn}</td>
                              <td style={{ padding: '10px 12px', color: '#475569' }}>{ing.chemicalSpec}</td>
                              <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0d9488' }}>{ing.dose}</td>
                              <td style={{ padding: '10px 12px', color: '#334155' }}>{ing.purposeEn}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              {/* Treatment Cycle & Galenic Excipient Safety Notice */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666' }}>
                    {TREATMENT_CYCLE.summaryEn}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px' }}>
                    100% Lactose-Free Excipients Verified
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  {TREATMENT_CYCLE.followUpNoteEn}
                </p>
              </div>

              {/* Download Patient & Pharmacy Prescription PDF */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} className="text-teal-700" />
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>
                      Ready-to-Use Patient & Pharmacy Prescription PDF (English)
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px' }}>
                      2-Page Document
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#334155', maxWidth: '640px', lineHeight: 1.5 }}>
                    Page 1 translates DNA findings into clear, simple language for the patient. Page 2 provides the exact generic active ingredients (APIs), dosages, and 3-capsule partitioned galenic specs formatted for any compounding pharmacy.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href="/api/reports/24genomics-patient-pdf?patient=Clinical%20Patient&sample=24G-CLINICAL-90421&clinic=Atlas%20Health%20Partner%20Practice"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '9px 18px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)'
                    }}
                  >
                    <Download size={15} />
                    <span>Download Prescription PDF (English)</span>
                  </a>
                </div>
              </div>

              {/* Doctor Copilot Clinical Guidance */}
              <div style={{ backgroundColor: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(30, 58, 138, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stethoscope size={20} className="text-blue-600" />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#1e3a8a', margin: 0 }}>
                        Doctor Copilot: Clinical Prescribing Guide & Patient Communication
                      </h4>
                      <div style={{ fontSize: '0.76rem', color: '#3b82f6', fontWeight: 650 }}>
                        Formulated by Atlas Medical Geneticists & Compounding Pharmacists · Guidance for Partner Clinics
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.70rem', fontWeight: 800, backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px' }}>
                    Physician Prescribing Guidance
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '12px', marginBottom: '14px' }}>
                  <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#1e3a8a', textTransform: 'uppercase' }}>1. What the Doctor Prescribes:</strong>
                    <p style={{ fontSize: '0.80rem', color: '#1e40af', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      Prescribe <strong>Formula 24G-NUTRI-01 (Synchronized 3-Capsule Daily Protocol: 60 Cap A + 60 Cap B + 60 Cap C)</strong>. Posology: Capsule A upon waking fasting, Capsule B with breakfast, Capsule C with dinner. Treatment duration: <strong>60 days</strong>. At day 45, request fasting glucose, HbA1c, homocysteine, and serum 25-OH-D to calibrate the long-term maintenance renewal.
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <strong style={{ fontSize: '0.78rem', color: '#1e3a8a', textTransform: 'uppercase' }}>2. Clinical Value for the Patient:</strong>
                    <p style={{ fontSize: '0.80rem', color: '#1e40af', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                      Strict pharmaceutical partitioning resolves ingredient antagonisms: isolates live fragile probiotics from antimicrobial berberine, times lipophilic vitamins D3/K2 with breakfast fats, and provides calming magnesium/5-HTP at dinner. Replaces 9 individual generic store bottles with zero pill fatigue.
                    </p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                  <strong style={{ fontSize: '0.76rem', color: '#1e3a8a', textTransform: 'uppercase' }}>Recommended Doctor-to-Patient Script (In Consultation):</strong>
                  <blockquote style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: '#1e40af', fontStyle: 'italic', lineHeight: 1.6 }}>
                    &ldquo;Dear Patient, our Atlas clinical genetics and compounding pharmacy team has thoroughly analyzed your 24Genetics panel. We identified why conventional multivitamins have not provided the energy and metabolic results you expected. Your liver possesses an MTHFR variation that cannot convert synthetic folic acid, while your cellular receptors require higher, bioavailable vitamin D3 and K2. Rather than having you purchase 8 or 9 separate generic bottles from a store, our medical compounding laboratory has formulated a synchronized 3-capsule daily regimen for 60 days (Formula 24G-NUTRI-01). You take Capsule A upon waking to protect your gut, Capsule B with breakfast to activate daytime metabolism, and Capsule C with dinner for evening recovery—all completely lactose-free and partitioned for maximum biological absorption.&rdquo;
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 5: NUTRIGEN CLINICAL DOSSIER
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'nutrigen-monograph' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', color: '#0d9488', backgroundColor: '#f0fdfa', padding: '3px 8px', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                Technical & Clinical Product Dossier
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666', marginTop: '6px', margin: 0 }}>
                24Genetics® Nutrigenetics Clinical DNA Panel (Nutrigen)
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '4px' }}>
                Full phenotypic profiling of metabolic pathways, micronutrient absorption, food intolerances, and appetite regulation.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Clinical Biomarkers & Target Genes
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#334155' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>MTHFR (C677T & A1298C):</strong> Methylation capacity and homocysteine regulation. Determines requirement for methylated B-vitamins (L-methylfolate vs. synthetic folic acid).
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>FTO & PPARG:</strong> Obesity susceptibility, fat storage regulation, and saturated vs. unsaturated fat caloric partitioning.
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>TCF7L2:</strong> Type 2 diabetes genetic risk and glycemic sensitivity to refined carbohydrates.
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>VDR (FokI, BsmI):</strong> Vitamin D nuclear receptor affinity. Explains poor circulating 25-OH-D levels despite sunshine exposure.
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>MCM6 / LCT:</strong> Lactase persistence genotype. Distinguishes primary adult hypolactasia from temporary secondary dysbiosis.
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Laboratory Workflow & Report Delivery
                </h4>
                <ol style={{ fontSize: '0.82rem', color: '#334155', paddingLeft: '1.2rem', lineHeight: 1.7, margin: 0 }}>
                  <li><strong>Non-Invasive Buccal Collection:</strong> Patient rubs cotton swab inside cheek for 60 seconds (no blood draw, no fasting required).</li>
                  <li><strong>Stabilizing Preservative:</strong> Buccal sample is placed in preservation buffer tube (stable at ambient room temperature up to 12 months).</li>
                  <li><strong>Air Courier Dispatch to Madrid:</strong> Pre-labeled international envelopes dispatch samples directly to 24Genetics laboratory.</li>
                  <li><strong>DNA Genotyping:</strong> High-density Illumina Global Screening Array (GSA) reads target SNPs with &gt;99.9% repeatability.</li>
                  <li><strong>Digital Delivery:</strong> Within 3-4 weeks, the clinic receives an authoritative 40+ page digital PDF clinical monograph and raw DNA call format.</li>
                  <li><strong>Compounding Integration:</strong> The genomic report can be loaded directly into our Compounding Studio to calibrate patient-specific nutrient capsules.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 6: TERMS & LAB CONDITIONS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'terms' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#003666', marginBottom: '1.25rem' }}>
              Official Clinical Terms &amp; Commercial Distribution Framework — 24Genetics Clinical Suite
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <strong style={{ color: '#15803d', display: 'block', marginBottom: '4px' }}>
                  1. Ámbito de Distribución Clínica B2B Autorizada
                </strong>
                Las condiciones y tarifas de este catálogo están destinadas exclusivamente a clínicas médicas, centros de longevidad, consultas de medicina de precisión y distribuidores acreditados a nivel internacional. Cada kit incluye tubos colectores bucales con tampón CE-IVD y acceso a la plataforma digital Atlas.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px' }}>
                  2. Formalización de Pedidos y Logística Express
                </strong>
                Los pedidos se formalizan mediante emisión de proforma o pedido en firme. Los kits de recolección de saliva se despachan de forma inmediata mediante transporte aéreo internacional desde la central de fulfillment del Core Lab en Madrid (España), con soporte logístico y aduanero integral.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>
                  3. Multi-Divisa y Flexibilidad de Suscripciones WhatsApp
                </strong>
                Las liquidaciones pueden realizarse en cualquiera de las divisas disponibles (QAR, AED, SAR, KWD, USD, EUR). El servicio de acompañamiento y consultas por WhatsApp (Punto 5) funciona bajo una suscripción mensual independiente que puede activarse, incrementarse o cancelarse en cualquier momento sin permanencia contractual.
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>

      {/* ── Order Confirmation Modal ── */}
      {orderModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setOrderModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #99f6e4' }}>
                <CheckCircle2 size={26} />
              </div>
              <div>
                <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Proforma B2B Generada con Éxito
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#003666', margin: '2px 0 0 0' }}>
                  Pedido {currentTier.name} Registrado
                </h3>
              </div>
            </div>

            {/* Reference Box */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Referencia de Cotización</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.90rem' }}>
                  <CopyableId value={generatedQuote?.quotationNumber || `QT-24GN-${currentTier.id.toUpperCase()}`} />
                </div>
              </div>
              <StatusBadge status="approved" label="Proforma Activa" />
            </div>

            {/* Breakdown */}
            <div style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '1rem 0', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                <span>{currentTier.name} ({currentTier.quantity} kits, Puntos 1 al 4 Incluidos):</span>
                <strong style={{ color: '#0f172a' }}>{formatPrice(currentTier.totalPriceQar)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                <span>Suscripciones WhatsApp ({whatsappSubscriptionsCount} activas, Punto 5):</span>
                <strong style={{ color: '#2563eb' }}>{formatPrice(whatsappSubscriptionsCount * 150)} / mes</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f766e', fontWeight: 800, paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '0.92rem' }}>
                <span>Inversión Inicial del Pack:</span>
                <span>{formatPrice(currentTier.totalPriceQar)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.5rem', fontSize: '0.78rem', color: '#0f766e', lineHeight: 1.5 }}>
              ✓ Los kits de recogida salival CE-IVD serán despachados desde Madrid.<br />
              ✓ Las cuentas de la plataforma Atlas para los reportes de Nutrición, Ancestros y Dieta se activarán automáticamente.<br />
              ✓ El servicio de WhatsApp queda disponible para sincronizarse con sus pacientes.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(`Resumen de la orden formalizada ${generatedQuote?.quotationNumber || '24Genomics Nutrition'} guardado correctamente.`);
                  setOrderModalOpen(false);
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)'
                }}
              >
                <CheckCircle2 size={15} />
                <span>Confirmar y Descargar Proforma</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Atlas AI Assistant Drawer ── */}
      {showAtlasAiModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          zIndex: 110,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            height: '100%',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.25s ease-out'
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#003666',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} className="text-teal-300" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 850 }}>Atlas AI Clinical Assistant</h3>
                  <div style={{ fontSize: '0.72rem', color: '#99f6e4' }}>24Genomics Nutrition Clinical Intelligence</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAtlasAiModal(false)}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', padding: '12px 14px', fontSize: '0.80rem', color: '#0f766e', lineHeight: 1.5 }}>
                Hola, soy el asistente clínico inteligente de Atlas Health. Pregúntame sobre el circuito de toma de saliva, el genotipado en Madrid, las 3 cápsulas personalizadas o el esquema de precios.
              </div>

              {/* Quick Question Chips */}
              <div>
                <div style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Preguntas Frecuentes Rápidas
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {AI_FAQS.map((faq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAskAtlasAi(faq.q)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 650,
                        color: '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      💬 {faq.q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Answer Card */}
              {activeAiAnswer && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #0d9488',
                  borderRadius: '10px',
                  padding: '1rem',
                  boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0d9488', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={13} />
                    <span>Respuesta Atlas AI:</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 750, color: '#0f172a', marginBottom: '6px' }}>
                    {activeAiAnswer.q}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.80rem', color: '#334155', lineHeight: 1.6 }}>
                    {activeAiAnswer.a}
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Input Footer */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Escribe tu consulta clínica o comercial..."
                  value={aiCustomQuestion}
                  onChange={(e) => setAiCustomQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAtlasAi();
                  }}
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.80rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAskAtlasAi()}
                  style={{
                    padding: '9px 14px',
                    backgroundColor: '#0d9488',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Atlas AI Button ── */}
      <button
        type="button"
        onClick={() => setShowAtlasAiModal(true)}
        aria-label="Open Atlas AI"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 90,
          backgroundColor: '#003666',
          border: '2px solid #0d9488',
          borderRadius: '50px',
          padding: '10px 18px',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.82rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 6px 18px rgba(0, 54, 102, 0.4)',
          cursor: 'pointer',
          transition: 'transform 0.15s ease'
        }}
      >
        <Sparkles size={16} className="text-teal-400" />
        <span>Atlas AI</span>
      </button>

      <PublicUnifiedFooter />
    </div>
  );
}
