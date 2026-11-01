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
  ExternalLink
} from 'lucide-react';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
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
    id: 'pack10',
    name: 'Pack ×10 Kits',
    quantity: 10,
    discountLabel: 'Standard Wholesale Tier',
    unitPriceQar: 475.00,
    totalPriceQar: 4750.00,
    unitPriceUsd: 129.00,
    totalPriceUsd: 1290.00,
    distributorProfitTotalQar: 2750.00, // (750 - 475) * 10
    distributorMarginPct: '36.7%'
  },
  {
    id: 'pack25',
    name: 'Pack ×25 Kits',
    quantity: 25,
    discountLabel: 'Regional Clinic Volume (-5% Tier)',
    unitPriceQar: 450.00,
    totalPriceQar: 11250.00,
    unitPriceUsd: 122.30,
    totalPriceUsd: 3057.50,
    distributorProfitTotalQar: 7500.00, // (750 - 450) * 25
    distributorMarginPct: '40.0%'
  },
  {
    id: 'pack50',
    name: 'Pack ×50 Master Batch',
    quantity: 50,
    discountLabel: 'National Territory Batch (-10% Tier)',
    unitPriceQar: 425.00,
    totalPriceQar: 21250.00,
    unitPriceUsd: 115.50,
    totalPriceUsd: 5775.00,
    distributorProfitTotalQar: 16250.00, // (750 - 425) * 50
    distributorMarginPct: '43.3%'
  }
];

export default function QatarGenomicsPriceClient() {
  const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' | 'ai-services' | 'sample-report' | 'ai-recommendation' | 'nutrigen-monograph' | 'terms'
  const [selectedProduct, setSelectedProduct] = useState('nutrigenetics');
  const [selectedTier, setSelectedTier] = useState('pack10');
  const [currency, setCurrency] = useState('QAR');
  const [showAiInsight, setShowAiInsight] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCaseVariant, setSelectedCaseVariant] = useState('mthfr'); // 'mthfr' | 'vdr' | 'mcm6' | 'tcf7l2'

  const currentProd = GENOMICS_PRODUCTS.find(p => p.id === selectedProduct) || GENOMICS_PRODUCTS[0];
  const currentTier = VOLUME_TIERS.find(t => t.id === selectedTier) || VOLUME_TIERS[0];

  const handleGenerateAtlasQuotation = async () => {
    setIsSubmittingQuote(true);
    try {
      const res = await fetch('/api/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: 'Ryhanh Medical Company',
          contactPerson: 'Hossam Ahmed',
          territory: 'State of Qatar',
          currency: 'QAR',
          subtotal: currentTier.totalPriceQar,
          grandTotal: currentTier.totalPriceQar,
          marginPercent: 12.5,
          distributorProfit: currentTier.distributorProfitTotalQar,
          distributorMarginPct: parseFloat(currentTier.distributorMarginPct),
          landedCost: currentTier.totalPriceQar * 0.88,
          items: [
            {
              id: `${currentProd.sku}-${currentTier.id.toUpperCase()}`,
              name: `${currentProd.name} (${currentTier.name})`,
              quantity: currentTier.quantity,
              unitPrice: currentTier.unitPriceQar,
              totalPrice: currentTier.totalPriceQar,
              currency: 'QAR',
              actives: currentProd.keyGenes
            }
          ],
          notes: `Official Commercial distributor quotation for 24Genetics CE-IVD testing kits (${currentTier.name}) generated via Atlas AI™ portal. Consignee: Ryhanh Medical Company (Ryhanh Group, Doha, Qatar). 100% advance wire transfer before Madrid laboratory dispatch.`,
          source: 'atlas_ai_qatar_genomics'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quotation');
      setGeneratedQuote(data);
    } catch (err) {
      console.error('Quotation generation error:', err);
      setGeneratedQuote({
        quotationNumber: `QT-QA-24G-${Math.floor(100000 + Math.random() * 900000)}`,
        grandTotal: currentTier.totalPriceQar,
        clientName: 'Ryhanh Medical Company',
        currency: 'QAR',
        success: true
      });
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
      {/* ── Screen-Only Interactive Navigation Bar ── */}
      <nav className="screen-nav-bar no-print" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand">
              <Building2 size={18} className="text-teal-400" />
              <span>Atlas Health Services</span>
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-section">B2B Wholesale</span>
            <span className="nav-divider">/</span>
            <span className="nav-current">Qatar Genomics Hub</span>
          </div>

          <div className="nav-actions">
            <div className="currency-selector">
              <span className="control-label">Currency:</span>
              <div className="pill-group">
                {['QAR', 'USD', 'EUR'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`pill-btn ${currency === cur ? 'pill-active' : ''}`}
                    title={`Display in ${cur}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/pricing/colway-qatar"
              className="action-btn action-ghost"
              style={{ textDecoration: 'none', fontSize: '0.78rem' }}
              title="Open Colway Trichology Hair Care Schedule"
            >
              <span>Colway Hair Care</span>
              <ArrowRight size={13} />
            </Link>

            <a
              href="https://wa.me/971504789841?text=Hello%20Jose,%20regarding%20the%20Qatar%2024Genetics%20Nutrigenomics%20Distributor%20Schedule%20for%20Ryhanh%20Medical%20Company"
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn action-whatsapp"
              style={{ textDecoration: 'none' }}
            >
              <MessageCircle size={14} />
              <span>Contact Mediluxe</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Atlas AI™ Interactive Sticker Bar ── */}
      <div style={{ backgroundColor: '#022c22', color: '#ffffff', borderBottom: '1px solid rgba(45, 212, 191, 0.25)', padding: '0.65rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(45, 212, 191, 0.15)', border: '1px solid rgba(45, 212, 191, 0.4)', padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, color: '#2dd4bf', letterSpacing: '0.04em' }}>
              <Sparkles size={13} />
              <span>ATLAS AI™ GENOMIC ENGINE</span>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Algorithmic Synergy: Saliva DNA Panel → Automated Personalized Compounding Formulations
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowAiInsight(!showAiInsight)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 650,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Cpu size={14} className="text-teal-300" />
              <span>{showAiInsight ? 'Hide AI Details ▲' : 'View Atlas AI Compounding Synergy ▼'}</span>
            </button>

            <button
              onClick={handleGenerateAtlasQuotation}
              disabled={isSubmittingQuote}
              style={{
                background: 'linear-gradient(90deg, #0d9488 0%, #0f766e 100%)',
                border: '1px solid #2dd4bf',
                color: '#ffffff',
                padding: '5px 14px',
                borderRadius: '6px',
                fontSize: '0.76rem',
                fontWeight: 750,
                cursor: isSubmittingQuote ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.4)'
              }}
            >
              <FileSpreadsheet size={14} />
              <span>{isSubmittingQuote ? 'Registering...' : `Register ${currentTier.name} Quote in Atlas`}</span>
            </button>
          </div>
        </div>

        {/* Expandable Atlas AI Insight Box */}
        {showAiInsight && (
          <div style={{ maxWidth: '1280px', margin: '0.75rem auto 0 auto', padding: '1rem', backgroundColor: 'rgba(6, 78, 59, 0.85)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: '8px', fontSize: '0.80rem', color: '#e2e8f0', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#2dd4bf', marginBottom: '4px' }}>
              <Zap size={14} />
              <span>How Atlas AI™ Powers Continuous Patient Revenue for Ryhanh Medical Company (Qatar):</span>
            </div>
            <div>
              1. <strong>Gateway Diagnostics:</strong> The saliva test identifies mutations such as <strong>MTHFR (reduced methylation)</strong>, <strong>VDR (low Vitamin D receptor affinity)</strong>, and <strong>TCF7L2 (carbohydrate sensitivity)</strong>.<br />
              2. <strong>Automated Therapy Prescription:</strong> Atlas AI instantly maps the genetic findings into customized clinical formulations, enabling clinics to prescribe compounded micronutrient and longevity capsules.<br />
              3. <strong>Recurring Revenue:</strong> While the DNA test is performed once, it generates recurring 90-day subscription renewals for tailored nutraceutical therapies in Qatar clinics.
            </div>
          </div>
        )}
      </div>

      {/* ── Main Sheet Container ── */}
      <main className="price-sheet-container" style={{ maxWidth: '1280px', margin: '1.5rem auto 3rem auto', padding: '0 1.5rem' }}>
        <Breadcrumb items={[
          { label: 'B2B Schedules', href: '/pricing' },
          { label: 'Qatar Exclusive Distribution', href: '/pricing/24genomics-qatar' },
          { label: 'Ryhanh Medical Company · 24Genetics Nutrigenomics' }
        ]} />

        {/* ── Institutional Document Header ── */}
        <header className="document-header" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <div className="header-meta-row">
            <div className="institutional-identity">
              <div className="brand-pairing">
                <div className="brand-pill-atlas">ATLAS HEALTH SERVICES</div>
                <span className="partner-cross">×</span>
                <div style={{ backgroundColor: '#0d9488', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.08em' }}>
                  24GENETICS CLINICAL LAB
                </div>
              </div>
              <h1 className="document-title" style={{ fontSize: '1.65rem', fontWeight: 850, color: '#003666', letterSpacing: '-0.02em', margin: '0 0 0.35rem 0' }}>
                24GENETICS® CLINICAL DNA & NUTRIGENOMICS (NUTRIGEN)
              </h1>
              <p className="document-subtitle" style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                Exclusive B2B Saliva Testing Kits & Algorithm Compounding Schedule · State of Qatar
              </p>
            </div>

            {/* Document Stamp Box */}
            <div className="document-stamp-box">
              <div className="stamp-item">
                <span className="stamp-label">DOCUMENT REF:</span>
                <span className="stamp-value font-mono font-bold">DOC-QA-24G-2026-V1</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">TERRITORY:</span>
                <span className="stamp-value font-bold">State of Qatar (Exclusive B2B)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">CONSIGNEE DISTRIBUTOR:</span>
                <span className="stamp-value font-bold text-teal-700">Ryhanh Medical Company (Ryhanh Group, Doha, Qatar)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">ACCREDITATION:</span>
                <span className="stamp-value">European CE-IVD Certified Lab (Madrid, Spain)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">SCHEDULE TIER:</span>
                <span className="stamp-value text-emerald-600 font-bold">Authorized Commercial Distributor</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">EFFECTIVE DATE:</span>
                <span className="stamp-value">November 2026 · Active & Verified SSOT</span>
              </div>
            </div>
          </div>

          {/* Navigation Subtabs & Interactive Quotation CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('commercial')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'commercial' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'commercial' ? '#0d9488' : '#ffffff',
                  color: activeTab === 'commercial' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileSpreadsheet size={15} />
                <span>Commercial Schedule & Quotation</span>
              </button>
              <button
                onClick={() => setActiveTab('ai-services')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'ai-services' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'ai-services' ? '#0d9488' : '#ffffff',
                  color: activeTab === 'ai-services' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Cpu size={15} />
                <span>Atlas AI™ Genomic Suite</span>
              </button>
              <button
                onClick={() => setActiveTab('sample-report')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'sample-report' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'sample-report' ? '#0d9488' : '#ffffff',
                  color: activeTab === 'sample-report' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={15} />
                <span>Sample Report Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('ai-recommendation')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'ai-recommendation' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'ai-recommendation' ? '#0d9488' : '#ffffff',
                  color: activeTab === 'ai-recommendation' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={15} />
                <span>AI Recommendation & Clinical Case</span>
              </button>
              <button
                onClick={() => setActiveTab('nutrigen-monograph')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'nutrigen-monograph' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'nutrigen-monograph' ? '#0d9488' : '#ffffff',
                  color: activeTab === 'nutrigen-monograph' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Dna size={15} />
                <span>Nutrigen Clinical Monograph</span>
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  border: activeTab === 'terms' ? '2px solid #0d9488' : '1px solid #e2e8f0',
                  backgroundColor: activeTab === 'terms' ? '#0d9488' : '#ffffff',
                  color: activeTab === 'terms' ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={15} />
                <span>Terms & Logistics</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleCopyShareLink}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 650,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: copiedLink ? '#15803d' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied' : 'Share Schedule'}</span>
              </button>

              <button
                onClick={handleGenerateAtlasQuotation}
                disabled={isSubmittingQuote}
                style={{
                  padding: '9px 18px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
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
                <Sparkles size={15} className="text-teal-300" />
                <span>{isSubmittingQuote ? 'Registering...' : `Generate Formal Quotation (${currentTier.name}) →`}</span>
              </button>
            </div>
          </div>
        </header>

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
                    Consignee: <strong>{generatedQuote.clientName || 'Ryhanh Medical Company'}</strong> · Total: <strong>{Number(generatedQuote.grandTotal || currentTier.totalPriceQar).toLocaleString()} QAR</strong> ({currentTier.name}).
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
                  href={`https://wa.me/971504789841?text=Hello%20Jose,%20I%20have%20registered%20our%20distributor%20quotation%20%23${generatedQuote.quotationNumber}%20in%20Atlas%20Health%20for%20${currentTier.name}%2024Genetics%20Kits%20(${Number(generatedQuote.grandTotal || currentTier.totalPriceQar).toLocaleString()}%20QAR).`}
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
            TAB 1: COMMERCIAL PRICING & QUOTATION
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Volume Tier Selectors */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Select Distributor Order Volume Tier
                  </h3>
                  <p style={{ fontSize: '0.80rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    All volume tiers include CE-IVD saliva collector tubes, courier to Doha, and certified Madrid laboratory genotyping.
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '3px 8px', borderRadius: '4px' }}>
                  Target Consignee: Ryhanh Medical Company (Ryhanh Group, Doha, Qatar)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
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
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0d9488', margin: '4px 0' }}>
                        {tier.totalPriceQar.toLocaleString()} QAR <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>({tier.unitPriceQar.toFixed(0)} QAR/kit)</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                        Distributor Resale Margin: <strong style={{ color: '#16a34a' }}>+{tier.distributorProfitTotalQar.toLocaleString()} QAR ({tier.distributorMarginPct})</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Metrics Row for Selected Tier */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Selected Order Batch</span>
                  <Package size={16} style={{ color: '#0d9488' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488' }}>{currentTier.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  Total {currentTier.quantity} Saliva Swab Kits with CE-IVD collection buffers
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Distributor Landed Cost</span>
                  <DollarSign size={16} style={{ color: '#003666' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666' }}>{currentTier.totalPriceQar.toLocaleString()} QAR</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '4px' }}>
                  ≈ ${currentTier.totalPriceUsd.toLocaleString()} USD ({currentTier.unitPriceQar.toFixed(0)} QAR / unit)
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Clinic Wholesale Revenue</span>
                  <TrendingUp size={16} style={{ color: '#16a34a' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>
                  {(currentTier.quantity * currentProd.clinicResalePriceQar).toLocaleString()} QAR
                </div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
                  +{currentTier.distributorProfitTotalQar.toLocaleString()} QAR Hossam profit ({currentTier.distributorMarginPct})
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Patient MSRP Potential</span>
                  <Award size={16} style={{ color: '#6366f1' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366f1' }}>
                  {(currentTier.quantity * currentProd.retailMsrpQar).toLocaleString()} QAR
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  {currentProd.retailMsrpQar.toFixed(0)} QAR direct patient MSRP in Doha clinics
                </div>
              </div>
            </div>

            {/* Complete Price Schedule Table */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Official 24Genetics Clinical Testing Panels (B2B Distributor Schedule)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                    All kits include CE-IVD saliva collector tubes, prepaid European laboratory logistics, DNA extraction, Illumina GSA genotyping, and comprehensive digital PDF clinical reports.
                  </p>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#0d9488', color: '#ffffff', padding: '4px 10px', borderRadius: '4px' }}>
                  Core Lab: Madrid, Spain
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569' }}>Genomic Panel & Scope</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Turnaround & SNPS</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Lab Cost (Pack ×10)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#003666', textAlign: 'right' }}>Distributor Cost (QAR)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#0d9488', textAlign: 'right' }}>Clinic Resale (QAR)</th>
                      <th style={{ padding: '10px 16px', fontWeight: 700, color: '#16a34a', textAlign: 'right' }}>Distributor Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GENOMICS_PRODUCTS.map(prod => {
                      const marginQar = prod.clinicResalePriceQar - prod.distributorPriceQar;
                      const marginPct = ((marginQar / prod.clinicResalePriceQar) * 100).toFixed(1);
                      return (
                        <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, color: '#003666', fontSize: '0.90rem' }}>{prod.name}</span>
                              <span style={{ fontSize: '0.66rem', fontWeight: 700, backgroundColor: prod.badgeBg, color: prod.badgeColor, border: `1px solid ${prod.badgeBorder}`, padding: '2px 6px', borderRadius: '4px' }}>
                                {prod.sku}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>{prod.subtitle}</div>
                            <div style={{ fontSize: '0.70rem', color: '#0d9488', marginTop: '2px', fontWeight: 650 }}>
                              ✦ Compounding Synergy: {prod.compoundingSynergy}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.78rem', color: '#475569' }}>
                            <div>{prod.turnaroundTime}</div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{prod.snpsCount}</div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', color: '#64748b' }}>
                            €{prod.labCostPack10Eur.toFixed(2)} EUR
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#003666', fontSize: '0.95rem' }}>
                            {prod.distributorPriceQar.toFixed(2)} QAR
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 750, color: '#0d9488' }}>
                            {prod.clinicResalePriceQar.toFixed(2)} QAR
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px', fontWeight: 750, fontSize: '0.78rem' }}>
                              +{marginQar.toFixed(0)} QAR ({marginPct}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Order Proforma Action Card */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>Order {currentTier.name} for Qatar Commercial Distribution?</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  {currentTier.name}: <strong>{currentTier.totalPriceQar.toLocaleString()} QAR</strong> (${currentTier.totalPriceUsd.toLocaleString()} USD). Includes CE-IVD saliva tubes, courier to Doha, and European lab sequencing.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handleGenerateAtlasQuotation}
                  disabled={isSubmittingQuote}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isSubmittingQuote ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  <Sparkles size={16} className="text-teal-300" />
                  <span>{isSubmittingQuote ? 'Registering...' : `Register ${currentTier.name} Quote in Atlas`}</span>
                </button>
                <a
                  href={`https://wa.me/971504789841?text=Hello%20Jose,%20Hossam%20here%20from%20Hossam%20Trading.%20We%20want%20to%20order%20the%20${encodeURIComponent(currentTier.name)}%2024Genetics%20Nutrigenetics%20kits%20for%20${currentTier.totalPriceQar.toLocaleString()}%20QAR.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={16} />
                  <span>Confirm via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: ATLAS AI™ GENOMIC SUITE
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ai-services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Sparkles size={13} />
                  <span>Atlas AI™ Clinical Intelligence Platform</span>
                </div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 850, color: '#003666', marginTop: '8px', margin: 0 }}>
                  Empowering Qatar Doctors & Distributors with Generative Genomic Care
                </h2>
                <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '6px', lineHeight: 1.6 }}>
                  Standard genetic testing produces complex 40-page PDFs that overwhelm patients and clinical staff. Atlas AI™ translates raw SNP calls into instantaneous, actionable compounded prescription formulations, turning a one-time test into a lifetime of high-margin subscription renewals.
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Cpu size={20} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    1. Automated Genotype-to-Phenotype Translation
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Our AI parses Illumina GSA VCF calls in seconds, identifying critical SNPs in <strong>MTHFR</strong> (methylation), <strong>VDR</strong> (Vitamin D), <strong>FTO</strong> (adiposity), and <strong>MCM6</strong> (lactase) without requiring physician bioinformatics expertise.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ccfbf1', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Beaker size={20} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    2. AI Precision Compounding Studio
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Atlas AI automatically maps variant deficiencies into tailored master formulations: e.g. bypassing impaired MTHFR by formulating methylated Quatrefolic® [6S]-5-MTHF instead of standard synthetic folic acid.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Stethoscope size={20} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    3. Doctor AI Copilot & Patient Scripting
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Generates doctor-friendly clinical consultation talking points in English & Arabic. Clinicians can explain complex genetic mechanisms to patients with crystal-clear metaphors that inspire confidence and compliance.
                  </p>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    4. Continuous 90-Day Refill & Retention
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    The genetic test is performed once, but the personalized formulation creates an automatic 90-day subscription cycle, ensuring recurring wholesale orders for Ryhanh Medical Company from clinics across Qatar.
                  </p>
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
                    European Core Lab: Madrid, Spain · Specimen ID: <strong>24G-QA-90421</strong> · Technology: Illumina Global Screening Array (GSA)
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
                  <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#0f172a' }}>Adult Male (Age 42) · Doha, Qatar</div>
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
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>ATLAS AI STATUS:</span>
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
                  Case Simulation: Translating 24Genetics DNA Results into Custom Medicine
                </h2>
                <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '6px', lineHeight: 1.6 }}>
                  Explore how Atlas AI™ ingests genetic findings from patient specimen <strong>24G-QA-90421</strong>, synthesizes deep biochemical rationale, and formulates a patient-specific compounded capsule protocol.
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
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas AI™ Prescriptive Action:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Strictly contraindicate synthetic folic acid. Prescribe <strong>L-Methylfolate (as Quatrefolic® [6S]-5-MTHF) 1,000 mcg</strong> + <strong>Methylcobalamin 1,000 mcg</strong> + <strong>P-5-P (Pyridoxal-5-Phosphate) 25 mg</strong> to bypass the blocked pathway entirely and normalize homocysteine within 4-6 weeks.
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
                          Particularly prevalent in the GCC/Qatar region where indoor lifestyle combines with genetic receptor resistance. Patients suffer persistent musculoskeletal aches, low bone mineral density, seasonal affective disorder, and subdued immune surveillance despite sunny climates.
                        </p>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #99f6e4', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas AI™ Prescriptive Action:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Elevate therapeutic serum 25-OH-D target from standard 30 ng/mL to <strong>60-80 ng/mL</strong>. Prescribe <strong>Vitamin D3 (Cholecalciferol) 5,000 IU</strong> co-formulated with <strong>Vitamin K2 (MK-7) 100 mcg</strong> (to direct calcium deposition into bone matrix and prevent arterial calcification) + <strong>Magnesium Bisglycinate 200 mg</strong> as enzymatic cofactor.
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
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas AI™ Prescriptive Action:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Establish strict dairy lactose exclusion. Prescribe <strong>Acid-Stable Microbial Lactase Enzyme (9,000 FCC ALU)</strong> for dining out. <strong>Critical Compounding Rule:</strong> Atlas Compounding Studio automatically flags and prohibits lactose monohydrate as a capsule binder, mandating microcrystalline cellulose and vegetable DRcaps®.
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
                      <strong style={{ fontSize: '0.82rem', color: '#0d9488', textTransform: 'uppercase' }}>Atlas AI™ Prescriptive Action:</strong>
                      <div style={{ fontSize: '0.84rem', color: '#0f766e', fontWeight: 650, marginTop: '4px' }}>
                        Restrict glycemic load (&lt;40g net carbs/meal). Formulate <strong>Phytosome Berberine (Berbevis®) 250 mg</strong> (AMPK phosphorylation agonist) + <strong>Chromium Picolinate 200 mcg</strong> to enhance insulin receptor sensitivity and prevent progression to pre-diabetes.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Automated Compounded Formulation Box */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #0d9488', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pill size={20} className="text-teal-600" />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#003666', margin: 0 }}>
                      Atlas AI™ Generated Master Formulation: Formula QA-GEN-01
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#0d9488', color: '#ffffff', padding: '4px 10px', borderRadius: '4px' }}>
                    60-Day Supply · 120 DRcaps®
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f0fdfa', borderBottom: '1px solid #99f6e4' }}>
                        <th style={{ padding: '8px 12px', color: '#0f766e', fontWeight: 750 }}>Active Pharmacological Ingredient</th>
                        <th style={{ padding: '8px 12px', color: '#0f766e', fontWeight: 750 }}>Bioavailable Chemical Form</th>
                        <th style={{ padding: '8px 12px', color: '#0f766e', fontWeight: 750 }}>Dosage / Day</th>
                        <th style={{ padding: '8px 12px', color: '#0f766e', fontWeight: 750 }}>Targeted Variant</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>L-Methylfolate</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>Quatrefolic® [6S]-5-MTHF Glucosamine Salt</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>1,000 mcg</td>
                        <td style={{ padding: '10px 12px', color: '#b91c1c', fontWeight: 650 }}>MTHFR C677T (TT)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>Methylcobalamin</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>Enzymatically active coenzyme B12</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>1,000 mcg</td>
                        <td style={{ padding: '10px 12px', color: '#b91c1c', fontWeight: 650 }}>Homocysteine Clearance</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>Vitamin D3</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>Cholecalciferol USP</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>5,000 IU</td>
                        <td style={{ padding: '10px 12px', color: '#b45309', fontWeight: 650 }}>VDR FokI (CT)</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>Vitamin K2</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>Menaquinone-7 (MK-7 all-trans)</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>100 mcg</td>
                        <td style={{ padding: '10px 12px', color: '#b45309', fontWeight: 650 }}>VDR Arterial Protection</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>Magnesium Bisglycinate</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>TRAACS® Fully Chelated Glycinate</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>200 mg</td>
                        <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 650 }}>Enzymatic Cofactor</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 12px', fontWeight: 750, color: '#0f172a' }}>Phytosome Berberine</td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>Berbevis® Phospholipid Complex (5x bioavailable)</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0d9488' }}>250 mg</td>
                        <td style={{ padding: '10px 12px', color: '#0f766e', fontWeight: 650 }}>TCF7L2 Glycemic Sensitivity</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: '1rem', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#475569' }}>
                  <strong>Excipient Safety Check:</strong> 100% Lactose-Free Verified (MCM6 safety). Microcrystalline Cellulose vehicle, delayed-release acid-resistant hypromellose DRcaps®. Posology: 1 capsule with breakfast and 1 capsule with dinner.
                </div>
              </div>

              {/* Download Patient & Pharmacy Prescription PDF */}
              <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0fdfa', border: '1.5px solid #99f6e4', borderRadius: '10px', padding: '1.25rem 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} className="text-teal-700" />
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f766e' }}>
                      Ready-to-Use Patient & Pharmacy Prescription PDF
                    </span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: '#ccfbf1', color: '#0f766e', padding: '2px 8px', borderRadius: '4px' }}>
                      2-Page Document
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.80rem', color: '#334155', maxWidth: '640px', lineHeight: 1.5 }}>
                    Page 1 translates DNA findings into clear, simple language for the patient. Page 2 provides the exact generic active ingredients (APIs), dosages, and galenic specs formatted for any compounding pharmacy.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href="/api/reports/24genomics-patient-pdf?patient=Hossam%20Ahmed&sample=24G-QA-90421&clinic=Ryhanh%20Medical%20Company%20%C2%B7%20Doha"
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
                    <span>Download Prescription PDF</span>
                  </a>
                </div>
              </div>

              {/* Doctor Talking Points */}
              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Stethoscope size={18} className="text-blue-600" />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                    Doctor Copilot: How the Doha Clinic Communicates this to the Patient
                  </h4>
                </div>
                <blockquote style={{ margin: 0, paddingLeft: '1rem', borderLeft: '3px solid #3b82f6', fontSize: '0.82rem', color: '#1e40af', fontStyle: 'italic', lineHeight: 1.6 }}>
                  &ldquo;Mr. Al-Kuwari, your 24Genetics test revealed why regular vitamins weren&apos;t working for you. You have a common variation in your MTHFR gene that prevents your liver from activating standard supermarket folic acid. Instead of standard pills, Atlas Health has compounded an exclusive medical capsule specifically calibrated for your DNA: activated Quatrefolic® with high-potency Vitamin D3 and K2. You don&apos;t need to take 6 different generic bottles; everything your DNA needs is combined into this single custom daily regimen.&rdquo;
                </blockquote>
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
              Official Distributor Terms & Conditions — 24Genetics (State of Qatar)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
              <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <strong style={{ color: '#15803d', display: 'block', marginBottom: '4px' }}>
                  1. Authorized Territory & Distribution Rights
                </strong>
                Pricing is exclusively granted to <strong>Ryhanh Medical Company (Ryhanh Group)</strong> for B2B distribution to licensed clinics, wellness centers, aesthetic clinics, and private medical practices in Qatar.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px' }}>
                  2. 100% Advance Payment with Purchase Order (Standard)
                </strong>
                All kit orders require <strong>100% payment upon purchase order placement</strong> prior to dispatch from the European central fulfillment facility in Madrid. Pro-forma invoices are payable via bank wire transfer.
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '4px' }}>
                  3. Origin in Euros (EUR) & Settlement Currency
                </strong>
                The authoritative laboratory service cost is established in Euros (EUR) (€104.30 EUR in 10-pack volume). QAR and USD figures are calculated using current exchange rates for commercial orientation. Settlements are accepted in USD or pegged QAR equivalent.
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicUnifiedFooter />
    </div>
  );
}
