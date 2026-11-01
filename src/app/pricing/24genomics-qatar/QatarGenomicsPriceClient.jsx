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
  Info
} from 'lucide-react';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';

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

export default function QatarGenomicsPriceClient() {
  const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' | 'nutrigen-monograph' | 'terms'
  const [selectedProduct, setSelectedProduct] = useState('nutrigenetics');

  const currentProd = GENOMICS_PRODUCTS.find(p => p.id === selectedProduct) || GENOMICS_PRODUCTS[0];

  const distributorGrossMarginPerUnit = currentProd.clinicResalePriceQar - currentProd.distributorPriceQar;
  const distributorGrossMarginPct = ((distributorGrossMarginPerUnit / currentProd.clinicResalePriceQar) * 100).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#003666', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Dna size={16} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#003666', letterSpacing: '-0.02em' }}>24GENETICS</span>
              <span style={{ fontWeight: 600, fontSize: '0.90rem', color: '#0d9488' }}>CLINICAL GENOMICS</span>
            </Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Qatar Distribution Hub</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/pricing/colway-qatar"
              style={{
                fontSize: '0.78rem',
                fontWeight: 650,
                color: '#003666',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '6px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Switch to Colway Hair Care</span>
              <ArrowRight size={14} />
            </Link>
            <a
              href="https://wa.me/971504789841?text=Hello%20Jose,%20regarding%20the%20Qatar%2024Genetics%20Nutrigenomics%20Distributor%20Schedule%20for%20Hossam"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                fontSize: '0.80rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <MessageCircle size={15} />
              <span>Contact Mediluxe</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem 4rem 1.5rem' }}>
        <Breadcrumb items={[
          { label: 'B2B Schedules', href: '/pricing' },
          { label: 'Qatar Exclusive Distribution', href: '/pricing/24genomics-qatar' },
          { label: 'Hossam · 24Genetics Nutrigenomics' }
        ]} />

        {/* Hero Card */}
        <div style={{ marginTop: '1.25rem', marginBottom: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '3px 8px', borderRadius: '4px' }}>
              Official Distributor Schedule · Qatar Territory
            </span>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px' }}>
              Partner: Hossam / The Masters Medical Center
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.02em', margin: 0 }}>
                24Genetics® Clinical DNA Testing & Nutrigenomics (Nutrigen)
              </h1>
              <p style={{ fontSize: '0.90rem', color: '#64748b', marginTop: '6px', maxWidth: '800px', lineHeight: 1.5 }}>
                Official wholesale distribution schedule for <strong>Hossam / The Masters Medical Center</strong> in Qatar. European CE-IVD saliva testing kits with direct algorithmic synergy to compound patient-specific longevity and nutritional formulas.
              </p>
            </div>

            {/* Quick Pricing Badge */}
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '10px', padding: '1rem 1.25rem', textAlign: 'right', minWidth: '240px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>Nutrigen Distributor Cost (Pack ×10)</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f766e', marginTop: '2px' }}>
                475.00 <span style={{ fontSize: '1rem', fontWeight: 600 }}>QAR / kit</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 650, marginTop: '2px' }}>
                Wholesale Resale: 750 QAR (36.7% Margin)
              </div>
            </div>
          </div>

          {/* Navigation Subtabs */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
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
              <span>Commercial Price Schedule & Tiers</span>
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
              <span>Nutrigenetics (Nutrigen) Clinical Dossier</span>
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
              <span>Terms, Currency & Lab Logistics</span>
            </button>
          </div>
        </div>

        {/* TAB 1: COMMERCIAL PRICING TABLE */}
        {activeTab === 'commercial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Volume Tier Standard</span>
                  <Package size={16} style={{ color: '#0d9488' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0d9488' }}>Pack ×10 Kits</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  -30% Lab Volume Discount applied on 10-pack boxes
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Distributor Landed Cost</span>
                  <DollarSign size={16} style={{ color: '#003666' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666' }}>475.00 QAR</div>
                <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '4px' }}>
                  ≈ €118.00 EUR / $129.00 USD (Includes freight to Doha)
                </div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Clinic Wholesale Resale</span>
                  <TrendingUp size={16} style={{ color: '#16a34a' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>750.00 QAR</div>
                <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
                  275 QAR / kit profit for Hossam (36.7% Margin)
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>Patient Direct MSRP</span>
                  <Award size={16} style={{ color: '#6366f1' }} />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6366f1' }}>950.00 QAR</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                  475 QAR profit if sold directly to patients (50.0% Margin)
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
                            <div style={{ fontSize: '0.70rem', color: '#0d9488', marginTop: '2px', fontWeight: 600 }}>
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
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>Order Initial 10-Pack of 24Genetics Kits?</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                  Pack ×10 Nutrigenetics Kits: <strong>4,750.00 QAR</strong> ($1,290.00 USD). Includes CE-IVD saliva tubes, courier to Doha, and European lab sequencing.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a
                  href="mailto:jose@mediluxeme.com?subject=PO%20Confirmation%20-%20Hossam%20Qatar%2024Genetics%20Nutrigen%20(Pack%20x10)&body=Hello%20Jose,%0A%0AWe%20confirm%20our%20purchase%20order%20for%20Pack%20x10%2024Genetics%20Nutrigenetics%20Kits%20at%20475%20QAR%20/%20kit%20=%204,750%20QAR.%0A%0APlease%20issue%20the%20official%20pro-forma%20invoice%20for%20100%25%20advance%20wire%20transfer.%0A%0ACompany:%20The%20Masters%20Medical%20Center%20/%20Qatar%20Distribution%0AContact:%20Hossam"
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} />
                  <span>Request Pro-Forma (Pack ×10)</span>
                </a>
                <a
                  href="https://wa.me/971504789841?text=Hello%20Jose,%20Hossam%20here.%20We%20want%20to%20order%20the%20Pack%20x10%2024Genetics%20Nutrigenetics%20kits%20for%204,750%20QAR."
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

        {/* TAB 2: NUTRIGENETICS DOSSIER */}
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
                  <li><strong>Stabilizing Preservative:</strong> Buccal sample is placed in preservation buffer tube (stable at room temperature up to 12 months).</li>
                  <li><strong>Air Courier Dispatch to Madrid:</strong> Pre-labeled international envelopes dispatch samples directly to 24Genetics laboratory.</li>
                  <li><strong>DNA Genotyping:</strong> High-density Illumina Global Screening Array (GSA) reads target SNPs with &gt;99.9% repeatability.</li>
                  <li><strong>Digital Delivery:</strong> Within 3-4 weeks, the clinic receives an authoritative 40+ page digital PDF clinical monograph and raw DNA call format.</li>
                  <li><strong>Compounding Integration:</strong> The genomic report can be loaded directly into our Compounding Studio to calibrate patient-specific nutrient capsules.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TERMS & LAB CONDITIONS */}
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
                Pricing is exclusively granted to <strong>Hossam / The Masters Medical Center</strong> for B2B distribution to licensed clinics, wellness centers, aesthetic clinics, and private patients in Qatar.
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
