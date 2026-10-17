"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Award,
  Globe,
  CheckCircle2,
  FlaskConical,
  Activity,
  Layers,
  FileText,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Cpu,
  Stethoscope,
  Scale,
  Calculator,
  QrCode,
  Tag,
  Syringe,
  Pill,
  Microscope,
  ThermometerSnowflake,
  Compass,
  FileCheck,
  Printer,
  XCircle
} from '@/lib/icons';
import StatusBadge from '../components/ui/StatusBadge';
import CopyableId from '../components/ui/CopyableId';
import AtlasEcosystemHubTab from '../components/doctor/AtlasEcosystemHubTab';
import '../styles/mediluxe.css';

// ── Navigation Section Anchors (GCP "On This Page" Standard) ─────────────────
const SECTIONS = [
  { id: 'overview', label: 'Executive Summary' },
  { id: 'compounding', label: 'Advanced Compounding' },
  { id: 'comparison', label: 'Traditional vs. Atlas OS' },
  { id: 'ecosystem', label: 'Atlas Digital OS & Demo' },
  { id: 'workflow', label: 'Clinical-to-Pharmacy Loop' },
  { id: 'portals', label: 'Partner Ecosystem by Collective' },
  { id: 'logistics', label: 'Global Network & QA' },
  { id: 'contact', label: 'Executive Contact & QR' },
];

// ── Phase 2 Data: Interactive Compounding Formulary Categories ───────────────
const FORMULARY_CATEGORIES = [
  {
    id: 'vials',
    label: 'Sterile Vials & Peptides',
    items: [
      {
        code: 'CMP-PEP-001',
        name: 'BPC-157 + TB-500 Regenerative Blend',
        form: 'Lyophilized Sterile Vial (5 mg / 5 mg)',
        purity: '99.6% HPLC',
        application: 'Musculoskeletal repair, tendon remodeling & systemic inflammation control',
        link: '/proto'
      },
      {
        code: 'CMP-PEP-002',
        name: 'Tirzepatide + Cyanocobalamin (B12)',
        form: 'Compounded Multi-Dose Vial (15 mg / 0.5 mg)',
        purity: '99.5% HPLC',
        application: 'Dual GIP/GLP-1 metabolic optimization with neuroprotective B12 co-formulation',
        link: '/proto'
      },
      {
        code: 'CMP-PEP-003',
        name: 'CJC-1295 (No DAC) + Ipamorelin',
        form: 'Lyophilized Sterile Vial (5 mg / 5 mg)',
        purity: '99.4% HPLC',
        application: 'Pulsatile endogenous GH secretagogue synergy & cellular recovery',
        link: '/proto'
      },
      {
        code: 'CMP-PEP-004',
        name: 'Epithalon + GHK-Cu Longevity Matrix',
        form: 'Sterile Subcutaneous Vial (10 mg / 50 mg)',
        purity: '99.7% HPLC',
        application: 'Telomerase activation, pineal circadian support & extracellular matrix remodeling',
        link: '/proto'
      }
    ]
  },
  {
    id: 'bhrt',
    label: 'BHRT Pellets & Liposomal',
    items: [
      {
        code: 'CMP-HRT-101',
        name: 'Bioidentical Testosterone Implants',
        form: 'Compressed Subcutaneous Pellets (75 mg / 100 mg / 200 mg)',
        purity: 'USP / EP Grade',
        application: 'Sustained 4–6 month zero-peak androgen optimization for male & female protocols',
        link: '/catalog'
      },
      {
        code: 'CMP-HRT-102',
        name: 'Estradiol + Estriol (Bi-Est 80/20) Liposomal',
        form: 'Metered Transdermal Dispenser (30 mL)',
        purity: 'USP / EP Grade',
        application: 'Precision transdermal bioidentical estrogen replacement with high dermal permeation',
        link: '/catalog'
      },
      {
        code: 'CMP-HRT-103',
        name: 'Micronized Progesterone SR',
        form: 'Slow-Release Magistral Capsules (100 mg / 200 mg)',
        purity: 'USP / EP Grade',
        application: 'Endocrine balance, neurosteroid GABA-A support & sleep architecture',
        link: '/catalog'
      },
      {
        code: 'CMP-HRT-104',
        name: 'DHEA + Pregnenolone Neuro-Endocrine Complex',
        form: 'Sublingual Micronized Troches (25 mg / 30 mg)',
        purity: '99.5% GMP API',
        application: 'Adrenal HPA-axis resilience and steroidogenic precursor replenishment',
        link: '/catalog'
      }
    ]
  },
  {
    id: 'mucosal',
    label: 'Troches & Nasal Sprays',
    items: [
      {
        code: 'CMP-MUC-201',
        name: 'Semax + Selank Neuro-Peptide Spray',
        form: 'Metered Intranasal Atomizer (7500 mcg / 15 mL)',
        purity: '99.4% HPLC',
        application: 'BDNF upregulation, executive focus, and non-sedating anxiolytic balance',
        link: '/proto'
      },
      {
        code: 'CMP-MUC-202',
        name: 'Oxytocin + PT-141 Rapid-Dissolve Troches',
        form: 'Scored Sublingual Lozenge (50 IU / 1000 mcg)',
        purity: '99.3% HPLC',
        application: 'Bypass first-pass hepatic metabolism via buccal mucosal absorption',
        link: '/catalog'
      },
      {
        code: 'CMP-MUC-203',
        name: 'BPC-157 Arginine Salt Gastro-Capsules',
        form: 'Enteric-Coated Delayed Release (500 mcg)',
        purity: '99.6% HPLC',
        application: 'Targeted gastrointestinal mucosal healing, tight-junction repair & IBS/IBD support',
        link: '/proto'
      },
      {
        code: 'CMP-MUC-204',
        name: 'KPV + Larazotide Gut Barrier Complex',
        form: 'Targeted Oral Magistral Capsules (500 mcg / 250 mcg)',
        purity: '99.4% HPLC',
        application: 'Zonulin modulation and mast-cell / NF-kB intestinal anti-inflammatory signaling',
        link: '/proto'
      }
    ]
  },
  {
    id: 'iv_nad',
    label: 'Sterile IV / NAD+ & Biomatrices',
    items: [
      {
        code: 'CMP-IVN-301',
        name: 'Buffered NAD+ Clinical Solution',
        form: 'Sterile Multi-Dose Vial (500 mg / 1000 mg)',
        purity: '99.8% HPLC',
        application: 'pH-balanced mitochondrial coenzyme restoration for IV infusion or SC micro-dosing',
        link: '/proto'
      },
      {
        code: 'CMP-IVN-302',
        name: 'MOTS-c + SS-31 (Elamipretide) Protocol',
        form: 'Sterile Lyophilized Vials (10 mg)',
        purity: '99.5% HPLC',
        application: 'Cardiolipin stabilization, inner mitochondrial membrane repair & AMPK activation',
        link: '/proto'
      },
      {
        code: 'CMP-IVN-303',
        name: 'Glutathione + Ascorbate Antioxidant Infusion',
        form: 'Sterile Cleanroom Ampoules (200 mg/mL)',
        purity: 'EP Sterile Grade',
        application: 'Hepatic phase-II detoxification, oxidative stress reduction & cellular brightening',
        link: '/catalog'
      },
      {
        code: 'CMP-IVN-304',
        name: 'Thymosin Alpha-1 Immune Resilience',
        form: 'Lyophilized Sterile Vial (10 mg)',
        purity: '99.6% HPLC',
        application: 'T-cell maturation, NK-cell modulation & chronic immune dysregulation support',
        link: '/proto'
      }
    ]
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic & Trichology',
    items: [
      {
        code: 'CMP-AES-401',
        name: 'GHK-Cu + SNAP-8 + Hyaluronic Dermal Serum',
        form: 'Airless Cosmeceutical Dispenser (30 mL)',
        purity: '99.5% Peptide API',
        application: 'Type I/III collagen synthesis, neuromuscular wrinkle relaxation & post-laser repair',
        link: '/catalog'
      },
      {
        code: 'CMP-AES-402',
        name: 'TrichoFoam Follicular Compounding Matrix',
        form: 'Custom Scalp Foam (Minoxidil + Finasteride + GHK-Cu)',
        purity: 'GMP Magistral',
        application: 'Propylene-glycol-free follicular stimulation for androgenetic alopecia protocols',
        link: '/catalog'
      }
    ]
  }
];

// ── Phase 4 Data: Live Interactive Micro-Demo Presets ────────────────────────
const DEMO_VIALS = [
  { id: 'bpc10', name: 'BPC-157 Sterile Vial', vialMg: 10, defaultWaterMl: 2, defaultDoseMcg: 250 },
  { id: 'trz15', name: 'Tirzepatide Compounded Vial', vialMg: 15, defaultWaterMl: 1.5, defaultDoseMcg: 2500 },
  { id: 'cjc5', name: 'CJC-1295 / Ipamorelin Blend', vialMg: 5, defaultWaterMl: 2.5, defaultDoseMcg: 200 },
  { id: 'nad500', name: 'Buffered NAD+ Solution', vialMg: 500, defaultWaterMl: 5, defaultDoseMcg: 50000 }
];

const DEMO_BATCHES = [
  {
    batchId: 'ATL-2026-BPC157-094',
    compound: 'BPC-157 Lyophilized Acetate (10 mg)',
    purity: '99.64%',
    method: 'RP-HPLC + ESI-MS',
    endotoxin: '< 0.03 EU/mg (Pass)',
    sterility: 'USP <71> Compliant',
    lab: 'EU ISO/IEC 17025 Accredited Lab'
  },
  {
    batchId: 'ATL-2026-TRZ15-118',
    compound: 'Tirzepatide GMP Active (15 mg)',
    purity: '99.58%',
    method: 'RP-HPLC + MALDI-TOF',
    endotoxin: '< 0.04 EU/mg (Pass)',
    sterility: 'USP <71> Compliant',
    lab: 'EU ISO/IEC 17025 Accredited Lab'
  },
  {
    batchId: 'ATL-2026-NAD500-042',
    compound: 'Buffered NAD+ Sterile Vial (500 mg)',
    purity: '99.82%',
    method: 'UV-HPLC + Ion Chromatography',
    endotoxin: '< 0.02 EU/mg (Pass)',
    sterility: 'USP <71> Compliant',
    lab: 'EU ISO/IEC 17025 Accredited Lab'
  }
];

export default function AtlasExecutiveOverview() {
  const [activeSection, setActiveSection] = useState('overview');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // Phase 2 State: Active Compounding Formulary Tab
  const [activeFormularyTab, setActiveFormularyTab] = useState('vials');

  // Phase 4 State: Interactive Micro-Demo Console
  const [demoMode, setDemoMode] = useState('calculator'); // 'calculator' | 'coa'
  const [selectedVialId, setSelectedVialId] = useState('bpc10');
  const [waterMl, setWaterMl] = useState(2);
  const [doseMcg, setDoseMcg] = useState(250);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState(0);

  const activeVial = DEMO_VIALS.find(v => v.id === selectedVialId) || DEMO_VIALS[0];
  const totalMcg = activeVial.vialMg * 1000;
  const concentrationMcgPerMl = waterMl > 0 ? totalMcg / waterMl : 0;
  const volumeMlPerDose = concentrationMcgPerMl > 0 ? doseMcg / concentrationMcgPerMl : 0;
  const syringeUnitsIU = Math.round(volumeMlPerDose * 100 * 10) / 10; // U-100 syringe: 100 IU = 1 mL
  const dosesPerVial = doseMcg > 0 ? Math.floor(totalMcg / doseMcg) : 0;

  // ── Scroll Spy & Reading Progress Tracking ─────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setReadingProgress(progress);

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      "Hello Jose, I visited your Atlas Health Services executive overview (https://www.atlashealth-services.com/atlas) and would like to schedule a conversation."
    );
    window.open(`https://api.whatsapp.com/send?phone=971564179256&text=${text}`, '_blank');
  };

  const handlePrintExecutivePDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Zabala;Jose;Luis;;
FN:Jose Luis Zabala - Atlas Health Services
ORG:Atlas Health Services
TITLE:Managing Partner
TEL;TYPE=WORK,VOICE:+971564179256
TEL;TYPE=CELL,VOICE:+34654314490
EMAIL;TYPE=PREF,INTERNET:jose@mediluxeme.com
URL:https://www.atlashealth-services.com/atlas
NOTE:Biotech · Longevity · Advanced Compounding · Distributed International Network (EU · GCC · US · APAC)
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Jose_Luis_Zabala_Atlas_Health.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentFormularyCategory = FORMULARY_CATEGORIES.find(c => c.id === activeFormularyTab) || FORMULARY_CATEGORIES[0];
  const currentBatch = DEMO_BATCHES[selectedBatchIdx] || DEMO_BATCHES[0];

  return (
    <div className="mediluxe-page">
      {/* ── PHASE 1: Sticky Institutional GCP Console Topbar (Golden Rule #9) ── */}
      <header className="atlas-sticky-topbar">
        <div className="mediluxe-container mediluxe-topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link href="/" className="atlas-brand-lockup">
              <span className="atlas-brand-mark">A</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#003666' }}>
                Atlas Health <span style={{ color: '#0d9488', fontWeight: 700 }}>Services</span>
              </span>
            </Link>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>
              Executive &amp; Institutional Dossier
            </span>
            <div className="mediluxe-topbar-badge">
              <span className="atlas-status-dot" />
              <span>Distributed Multi-Node Network Operational (EU · GCC · US · APAC)</span>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handlePrintExecutivePDF}
              className="mediluxe-btn mediluxe-btn-outline"
              style={{ minHeight: '34px', padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}
              title="Print or Save Executive One-Pager as PDF"
            >
              <Printer size={13} />
              <span>Save PDF</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="mediluxe-btn mediluxe-btn-whatsapp"
              style={{ minHeight: '34px', padding: '0.35rem 0.85rem', fontSize: '0.76rem' }}
            >
              <Phone size={13} />
              <span>Book a Meeting</span>
            </button>
            <Link
              href="/"
              className="mediluxe-btn mediluxe-btn-primary"
              style={{ minHeight: '34px', padding: '0.35rem 0.85rem', fontSize: '0.76rem' }}
            >
              <span>Open Platform</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Mobile Sticky Section Tabs ── */}
      <nav className="mediluxe-mobile-chips" aria-label="Page Sections">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            className={`mediluxe-chip ${activeSection === sec.id ? 'active' : ''}`}
            onClick={() => scrollTo(sec.id)}
          >
            {sec.label}
          </button>
        ))}
      </nav>

      {/* ── Hero Executive Header ── */}
      <section id="overview" className="mediluxe-hero">
        <div className="mediluxe-container mediluxe-hero-inner">
          <div>
            <div className="mediluxe-hero-eyebrow">
              <FlaskConical size={14} />
              <span>GMP Compounding · Peptide Therapeutics · Clinical AI OS</span>
            </div>
            <h1 className="mediluxe-hero-title">
              Where Advanced Pharmaceutical Compounding Meets Precision Medicine.
            </h1>
            <p className="mediluxe-hero-tagline">
              The Integrated Global Operating System for Personalized Therapeutics &amp; Longevity Care
            </p>
            <p className="mediluxe-hero-desc">
              <strong>Atlas Health Services</strong> connects accredited GMP-certified compounding laboratories, 
              high-purity peptide formulations, and AI-assisted clinical workflows into a unified decentralized infrastructure. 
              From digital physician prescribing and custom sterile compounding to cryptographic batch verification 
              and coordinated cold-chain fulfillment across <strong>Europe, the Middle East, North America, and Asia-Pacific</strong>.
            </p>

            <div className="mediluxe-hero-actions">
              <Link href="/" className="mediluxe-btn mediluxe-btn-primary">
                <span>Enter Atlas Platform</span>
                <ArrowRight size={15} />
              </Link>
              <Link href="/proto" className="mediluxe-btn mediluxe-btn-outline">
                <Layers size={15} />
                <span>Explore 200+ Protocols</span>
              </Link>
              <button onClick={handleShareWhatsApp} className="mediluxe-btn mediluxe-btn-whatsapp">
                <Share2 size={15} />
                <span>Book Executive Meeting</span>
              </button>
            </div>
          </div>

          {/* Right Credential Card — GCP Resource Summary Style */}
          <div className="mediluxe-credential-card">
            <div className="mediluxe-cred-header">
              <div className="mediluxe-cred-logo">A</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <h2 className="mediluxe-cred-title">Atlas Health Services</h2>
                  <StatusBadge status="approved" />
                </div>
                <p className="mediluxe-cred-sub">Global Precision Compounding &amp; Clinical Ecosystem</p>
              </div>
            </div>

            <div className="mediluxe-cred-grid">
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Core Focus</div>
                <div className="mediluxe-cred-val">GMP Compounding &amp; Peptides</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Architecture</div>
                <div className="mediluxe-cred-val">Decentralized Partner Network</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Active Corridors</div>
                <div className="mediluxe-cred-val">EU · GCC · US · APAC</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Analytical QA</div>
                <div className="mediluxe-cred-val">HPLC &amp; Mass Spec (&gt;99%)</div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--ml-slate-50)',
                border: '1px solid var(--ml-slate-200)',
                borderRadius: '8px',
                padding: '0.6rem 0.8rem',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.76rem'
              }}
            >
              <span style={{ color: 'var(--ml-slate-600)', fontWeight: 600 }}>Official Signature URL:</span>
              <CopyableId value="https://www.atlashealth-services.com/atlas" displayValue="atlashealth-services.com/atlas" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--ml-slate-600)', paddingTop: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--ml-teal)' }} />
                GMP &amp; ISO Cleanroom Partner Standards
              </span>
              <Link href="/verify" style={{ color: 'var(--ml-navy)', fontWeight: 700, textDecoration: 'none' }}>
                Batch CoA Verification →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 Default KPI Highlights Bar (Golden Rule #22) ── */}
      <div className="mediluxe-container">
        <div className="mediluxe-kpi-bar" role="region" aria-label="Key Platform Metrics">
          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon">
              <FlaskConical size={22} />
            </div>
            <div>
              <div className="mediluxe-kpi-number">580+</div>
              <div className="mediluxe-kpi-label">Active Formulations &amp; APIs</div>
            </div>
          </div>

          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon" style={{ background: 'var(--ml-teal-subtle)', color: 'var(--ml-teal)' }}>
              <Layers size={22} />
            </div>
            <div>
              <div className="mediluxe-kpi-number">200+</div>
              <div className="mediluxe-kpi-label">Clinical Protocols &amp; Stacks</div>
            </div>
          </div>

          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="mediluxe-kpi-number">&gt;99%</div>
              <div className="mediluxe-kpi-label">HPLC / MS Batch Purity</div>
            </div>
          </div>

          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon" style={{ background: 'var(--ml-teal-subtle)', color: 'var(--ml-teal)' }}>
              <Globe size={22} />
            </div>
            <div>
              <div className="mediluxe-kpi-number">Multi-Node</div>
              <div className="mediluxe-kpi-label">Global Cold-Chain Corridors</div>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column GCP Content Layout ── */}
        <div className="mediluxe-layout">
          <main className="mediluxe-main">

            {/* ── Section 1: Advanced Pharmaceutical Compounding + Phase 2 Interactive Formulary Explorer ── */}
            <section id="compounding" className="mediluxe-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="mediluxe-section-badge" style={{ marginBottom: 0 }}>
                  <FlaskConical size={13} /> Core Pillar 01 · Pharmaceutical Compounding
                </span>
                <StatusBadge status="published" />
              </div>
              <h2 className="mediluxe-section-title">Advanced Pharmaceutical Compounding &amp; Bespoke Formulations</h2>
              <p className="mediluxe-section-subtitle">
                Standard mass-manufactured pharmaceuticals rarely address the nuances of personalized longevity, 
                regenerative medicine, and metabolic optimization. Atlas partners with European GMP-accredited 
                compounding pharmacies and cleanroom laboratories to deliver patient-specific and clinic-ready 
                formulations with uncompromising analytical precision.
              </p>

              {/* 6 Compounding Capabilities Grid */}
              <div className="mediluxe-compounding-grid">
                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Syringe size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Sterile Cleanroom Injectables</h4>
                  <p className="mediluxe-pillar-desc">
                    Lyophilized peptide vials, sterile aqueous reconstitutions, NAD+ coenzyme infusions, and injectable biomatrices prepared under strict ISO cleanroom protocols.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon" style={{ background: 'var(--ml-teal-subtle)', color: 'var(--ml-teal)' }}>
                    <Scale size={20} />
                  </div>
                  <h4 className="mediluxe-pillar-title">Bioidentical Endocrinology (BHRT)</h4>
                  <p className="mediluxe-pillar-desc">
                    Precision-compressed subcutaneous hormone pellets, transdermal liposomal creams, and individualized endocrine modulation tailored to patient lab panels.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Pill size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Magistral Delivery Vehicles</h4>
                  <p className="mediluxe-pillar-desc">
                    Rapid-dissolve sublingual troches, metered nasal sprays, enteric-coated capsules, and topical liposomal gels engineered for optimal bioavailability.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon" style={{ background: 'var(--ml-teal-subtle)', color: 'var(--ml-teal)' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="mediluxe-pillar-title">Certified European GMP Actives</h4>
                  <p className="mediluxe-pillar-desc">
                    Active Pharmaceutical Ingredients (APIs) sourced from audited manufacturers with full Certificate of Analysis (CoA), endotoxin, and sterility documentation.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Sparkles size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Aesthetic &amp; Trichology Compounding</h4>
                  <p className="mediluxe-pillar-desc">
                    Clinical mesotherapy cocktails, copper-peptide (GHK-Cu) dermal matrices, and customized follicular regeneration formulas for dermatology clinics.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon" style={{ background: 'var(--ml-teal-subtle)', color: 'var(--ml-teal)' }}>
                    <Tag size={20} />
                  </div>
                  <h4 className="mediluxe-pillar-title">Custom Concentrations &amp; Private Label</h4>
                  <p className="mediluxe-pillar-desc">
                    Bespoke multi-compound blends (e.g., BPC-157 + TB-500, CJC-1295 + Ipamorelin) and white-label clinical packaging for medical institutes.
                  </p>
                </div>
              </div>

              {/* ── PHASE 2: Interactive Compounding Formulary Explorer ── */}
              <div style={{ marginTop: '2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Microscope size={18} style={{ color: '#003666' }} />
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Interactive Compounding Formulary Explorer (Sample Representative Formulations)
                    </h3>
                  </div>
                  <Link href="/catalog" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                    Browse Full 580+ Formulary →
                  </Link>
                </div>

                {/* GCP Filter Tabs */}
                <div className="atlas-gcp-tabs" role="tablist" aria-label="Compounding Categories">
                  {FORMULARY_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      role="tab"
                      aria-selected={activeFormularyTab === cat.id}
                      className={`atlas-gcp-tab ${activeFormularyTab === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveFormularyTab(cat.id)}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Active Tab Cards */}
                <div className="atlas-formulary-grid">
                  {currentFormularyCategory.items.map((item) => (
                    <div key={item.code} className="atlas-formulary-card">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <CopyableId value={item.code} />
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '2px 7px', borderRadius: '999px' }}>
                            {item.purity}
                          </span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#003666', marginBottom: '0.35rem' }}>
                          {item.form}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                          {item.application}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.55rem', borderTop: '1px solid #f1f5f9' }}>
                        <StatusBadge status="published" />
                        <Link href={item.link} style={{ fontSize: '0.74rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                          Inspect Clinical Spec →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── PHASE 3: Executive Comparison Matrix (Traditional vs. Atlas OS) ── */}
            <section id="comparison" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <Layers size={13} /> Architectural Advantage
              </span>
              <h2 className="mediluxe-section-title">Why Leading Clinics Transition to the Atlas Operating System</h2>
              <p className="mediluxe-section-subtitle">
                A side-by-side comparison between fragmented legacy compounding workflows and the integrated 
                Atlas Health Services clinical and pharmaceutical infrastructure.
              </p>

              <div className="atlas-comparison-wrap">
                <div className="atlas-comparison-row atlas-comparison-header">
                  <div className="atlas-comparison-cell">Operational Dimension</div>
                  <div className="atlas-comparison-cell">Legacy Pharmacy / Distributor</div>
                  <div className="atlas-comparison-cell" style={{ color: '#003666' }}>Atlas Health Operating System</div>
                </div>

                {[
                  {
                    dimension: 'Prescribing & Intake',
                    legacy: 'Manual PDF forms, WhatsApp messages, or paper scripts prone to transcription delays.',
                    atlas: 'Encrypted digital intake (/rx/intake) routing e-prescriptions directly to the pharmacy queue (/pharmacy).'
                  },
                  {
                    dimension: 'Protocol Intelligence',
                    legacy: 'Static product price lists with zero guidance on synergies, titration, or cycling.',
                    atlas: 'Atlas Clinical AI with 200+ evidence-based multi-phase titration protocols and stack architectures.'
                  },
                  {
                    dimension: 'Reconstitution & Dosing',
                    legacy: 'Manual dilution calculations by clinic staff or patients, increasing dosing error risk.',
                    atlas: 'Interactive Reconstitution & Syringe Unit Engine (/calculator) with visual U-100 / U-40 tick marks.'
                  },
                  {
                    dimension: 'Analytical Verification',
                    legacy: 'Generic or unverified paper CoAs with no batch-to-vial serialization.',
                    atlas: 'Cryptographic QR Batch Vault (/verify) with downloadable HPLC & Mass Spec reports (>99% purity).'
                  },
                  {
                    dimension: 'Clinical Branding & B2B',
                    legacy: 'One-size-fits-all ordering with no support for clinic branding or custom B2B margins.',
                    atlas: 'White-label Doctor Portals (/dr/[slug]), Pharmacy Label Studio (/labels) & B2B Catalog Builder.'
                  },
                  {
                    dimension: 'Global Fulfillment',
                    legacy: 'Single-country dispatch vulnerable to customs bottlenecks and stockouts.',
                    atlas: 'Decentralized multi-region cold-chain fulfillment coordinated across partner compounding and logistics nodes worldwide.'
                  }
                ].map((row, idx) => (
                  <div key={idx} className="atlas-comparison-row">
                    <div className="atlas-comparison-cell" style={{ fontWeight: 700, color: '#0f172a' }}>
                      {row.dimension}
                    </div>
                    <div className="atlas-comparison-cell" style={{ color: '#64748b' }}>
                      <XCircle size={15} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '2px' }} />
                      <span>{row.legacy}</span>
                    </div>
                    <div className="atlas-comparison-cell atlas-comparison-cell--atlas">
                      <CheckCircle2 size={15} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                      <span>{row.atlas}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Section 2 + PHASE 4: The Atlas Digital Ecosystem & Live Micro-Demo ── */}
            <section id="ecosystem" className="mediluxe-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="mediluxe-section-badge" style={{ marginBottom: 0 }}>
                  <Cpu size={13} /> Core Pillar 02 · Proprietary Digital Infrastructure
                </span>
                <StatusBadge status="active" />
              </div>
              <h2 className="mediluxe-section-title">The Atlas Clinical Operating System</h2>
              <p className="mediluxe-section-subtitle">
                Atlas is more than a pharmaceutical supplier—it is an end-to-end software and clinical intelligence 
                platform engineered to eliminate friction between medical decision-making, compounding pharmacies, and patient adherence.
              </p>

              <div className="mediluxe-tests-grid">
                {/* 1. Digital Rx & Pharmacy Inbox */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Stethoscope size={18} /></div>
                    <div>
                      <h3 className="mediluxe-test-title">Digital Rx-to-Compounding Loop</h3>
                    </div>
                  </div>
                  <p className="mediluxe-test-desc">
                    Connects physician consultations directly to the compounding pharmacy queue without manual PDFs or transcription errors.
                  </p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Guided Digital Patient Clinical Intake (<code>/rx/intake</code>)</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Encrypted e-Prescription issuance &amp; patient tracking (<code>/rx</code>)</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Direct routing to Compounding Pharmacy Inbox (<code>/pharmacy</code>)</span>
                    </li>
                  </ul>
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Module: Clinical E-Prescribing</span>
                    <Link href="/rx/intake" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                      Preview Intake →
                    </Link>
                  </div>
                </div>

                {/* 2. Atlas Clinical AI & Protocols */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Layers size={18} /></div>
                    <div>
                      <h3 className="mediluxe-test-title">Atlas Clinical AI &amp; Titration Engine</h3>
                    </div>
                  </div>
                  <p className="mediluxe-test-desc">
                    An interactive biological intelligence layer that assists clinicians with evidence-based protocol architecture and multi-phase dosing.
                  </p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>200+ peer-referenced clinical protocols &amp; synergistic stacks</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Automated multi-week titration schedules &amp; cycle lengths</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Goal-based Protocol Finder for rapid clinical matching</span>
                    </li>
                  </ul>
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Module: Protocol Intelligence</span>
                    <Link href="/protocol-finder" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                      Launch Protocol Finder →
                    </Link>
                  </div>
                </div>

                {/* 3. Precision Reconstitution & Syringe Calculator */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Calculator size={18} /></div>
                    <div>
                      <h3 className="mediluxe-test-title">Reconstitution &amp; Dosing Calculator</h3>
                    </div>
                  </div>
                  <p className="mediluxe-test-desc">
                    Eliminates dilution math errors when preparing lyophilized peptides or multi-concentration compounded vials.
                  </p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Supports U-100 &amp; U-40 insulin syringes (0.3 mL, 0.5 mL, 1.0 mL)</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Visual syringe tick-mark rendering for exact unit (IU) draw</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Bacteriostatic water volume &amp; concentration (mcg/IU) solver</span>
                    </li>
                  </ul>
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Module: Dosing Precision</span>
                    <Link href="/calculator" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                      Open Calculator →
                    </Link>
                  </div>
                </div>

                {/* 4. Cryptographic Batch CoA & Smart Labeling */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><FileCheck size={18} /></div>
                    <div>
                      <h3 className="mediluxe-test-title">Batch CoA Vault &amp; Smart Labeling</h3>
                    </div>
                  </div>
                  <p className="mediluxe-test-desc">
                    Full analytical transparency from synthesis to patient administration via QR-verified Certificates of Analysis and clinical label tools.
                  </p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Instant HPLC &amp; Mass Spectrometry CoA lookup by batch code</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>Pharmacy Label Studio (<code>/labels</code>) for compliant vial &amp; box labels</span>
                    </li>
                    <li className="mediluxe-test-bullet">
                      <Check size={14} /> <span>White-label Doctor Portals (<code>/dr/[slug]</code>) &amp; B2B Catalog Builder</span>
                    </li>
                  </ul>
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Module: QA &amp; Pharmacy Labels</span>
                    <Link href="/labels" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                      Explore Label Studio →
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── PHASE 4: Interactive Live Micro-Demo Console ("See Atlas Precision in Action") ── */}
              <div className="atlas-demo-console no-print">
                <div className="atlas-demo-topbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="atlas-status-dot" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                      LIVE INTERACTIVE PREVIEW · TEST ATLAS CLINICAL TOOLS
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setDemoMode('calculator')}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: demoMode === 'calculator' ? '#0d9488' : 'rgba(255,255,255,0.12)',
                        color: '#ffffff'
                      }}
                    >
                      1. Live Reconstitution Solver
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoMode('coa')}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: demoMode === 'coa' ? '#0d9488' : 'rgba(255,255,255,0.12)',
                        color: '#ffffff'
                      }}
                    >
                      2. Sample Batch CoA Vault
                    </button>
                  </div>
                </div>

                <div className="atlas-demo-body">
                  {demoMode === 'calculator' ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            Select Compounded Vial
                          </label>
                          <select
                            value={selectedVialId}
                            onChange={(e) => {
                              const next = DEMO_VIALS.find(v => v.id === e.target.value);
                              setSelectedVialId(e.target.value);
                              if (next) {
                                setWaterMl(next.defaultWaterMl);
                                setDoseMcg(next.defaultDoseMcg);
                              }
                            }}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
                          >
                            {DEMO_VIALS.map(v => (
                              <option key={v.id} value={v.id}>{v.name} ({v.vialMg} mg)</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            Bacteriostatic Water (mL)
                          </label>
                          <select
                            value={waterMl}
                            onChange={(e) => setWaterMl(Number(e.target.value))}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
                          >
                            {[1, 1.5, 2, 2.5, 3, 5].map(val => (
                              <option key={val} value={val}>{val} mL BAC Water</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                            Target Prescribed Dose
                          </label>
                          <select
                            value={doseMcg}
                            onChange={(e) => setDoseMcg(Number(e.target.value))}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
                          >
                            {[100, 200, 250, 500, 1000, 2500, 5000, 50000].map(val => (
                              <option key={val} value={val}>
                                {val >= 1000 ? `${val / 1000} mg (${val} mcg)` : `${val} mcg`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Output Result Bar */}
                      <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                            U-100 Insulin Syringe Draw
                          </div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666' }}>
                            {syringeUnitsIU} IU <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>({volumeMlPerDose.toFixed(3)} mL)</span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                            Vial Concentration
                          </div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                            {(concentrationMcgPerMl / 1000).toFixed(2)} mg/mL ({dosesPerVial} doses/vial)
                          </div>
                        </div>
                        <Link href="/calculator" className="mediluxe-btn mediluxe-btn-primary" style={{ minHeight: '36px', padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}>
                          <span>Open Full Calculator</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        {DEMO_BATCHES.map((b, i) => (
                          <button
                            key={b.batchId}
                            type="button"
                            onClick={() => setSelectedBatchIdx(i)}
                            className={`atlas-gcp-tab ${selectedBatchIdx === i ? 'active' : ''}`}
                          >
                            <span>{b.batchId}</span>
                          </button>
                        ))}
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Compound &amp; Batch ID</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{currentBatch.compound}</div>
                          <CopyableId value={currentBatch.batchId} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Analytical Purity</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>{currentBatch.purity}</div>
                          <div style={{ fontSize: '0.72rem', color: '#475569' }}>{currentBatch.method}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Endotoxin &amp; Sterility</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{currentBatch.endotoxin}</div>
                          <div style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 600 }}>{currentBatch.sterility}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Link href={`/verify/${currentBatch.batchId}`} className="mediluxe-btn mediluxe-btn-outline" style={{ minHeight: '36px', padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}>
                            <span>Verify Batch Portal</span>
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Section 3: Clinical-to-Pharmacy Architecture Loop ── */}
            <section id="workflow" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <Activity size={13} /> End-to-End Operational Architecture
              </span>
              <h2 className="mediluxe-section-title">How the Atlas Compounding &amp; Clinical Loop Works</h2>
              <p className="mediluxe-section-subtitle">
                A unified, auditable workflow that connects clinical assessment, compounding pharmacy preparation, 
                analytical verification, and temperature-controlled delivery.
              </p>

              <div className="mediluxe-diagram-wrapper">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #003666', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>Step 01</span>
                      <Compass size={16} color="#003666" />
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Intake &amp; AI Protocol Design
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Practitioner or patient completes digital intake; Atlas AI maps biomarkers and goals to evidence-based dosing protocols.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #0d9488', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>Step 02</span>
                      <FlaskConical size={16} color="#0d9488" />
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      GMP Cleanroom Compounding
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      E-prescription routes to the pharmacy inbox for sterile vial preparation, BHRT pellet pressing, or custom magistral formulation.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #0284c7', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Step 03</span>
                      <QrCode size={16} color="#0284c7" />
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Analytical QA &amp; Smart Labeling
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Each batch is paired with its HPLC/MS Certificate of Analysis, serialized QR verification code, and custom clinical label.
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #003666', borderRadius: '10px', padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>Step 04</span>
                      <ThermometerSnowflake size={16} color="#003666" />
                    </div>
                    <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      Global Cold-Chain Dispatch
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Coordinated multi-node cold-chain dispatch from partner compounding and logistics corridors directly to the clinic, pharmacy, or patient.
                    </p>
                  </div>
                </div>
                <div className="mediluxe-diagram-caption">
                  End-to-end digital traceability with role-based access control and HIPAA / GDPR-aligned data governance.
                </div>
              </div>
            </section>

            {/* ── Section 4: Dedicated Role-Based Portals & Stakeholder Collective Hub ── */}
            <section id="portals" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <Building2 size={13} /> Multi-Stakeholder Architecture · What Each Collective Achieves
              </span>
              <h2 className="mediluxe-section-title">The Atlas Partner Ecosystem by Collective</h2>
              <p className="mediluxe-section-subtitle">
                Explore specialized value propositions, operational capabilities, and automated workflows tailored for
                prescribing physicians, API manufacturers, compounding pharmacies, and wholesale distributors.
              </p>

              {/* Interactive Collective Value Engine */}
              <div style={{ marginTop: '1.25rem', marginBottom: '2.5rem' }}>
                <AtlasEcosystemHubTab />
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem' }}>
                Dedicated Stakeholder Console Access
              </h3>

              <div className="mediluxe-tests-grid">
                <div className="mediluxe-test-card" style={{ borderLeft: '4px solid #0d9488' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>For Clinicians &amp; Medical Directors</span>
                    <StatusBadge status="active" />
                  </div>
                  <h3 className="mediluxe-test-title" style={{ marginBottom: '0.35rem' }}>Doctor &amp; Clinic Portal</h3>
                  <p className="mediluxe-test-desc">
                    Manage patient panels, issue digital compounding prescriptions, launch your branded doctor portal (<code>/dr/your-name</code>), and consult Atlas Clinical AI.
                  </p>
                  <Link href="/doctor" className="mediluxe-btn mediluxe-btn-outline" style={{ width: '100%', justifyContent: 'space-between', minHeight: '38px', padding: '0.45rem 0.85rem' }}>
                    <span>Access Doctor Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mediluxe-test-card" style={{ borderLeft: '4px solid #003666' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase' }}>For Compounding Facilities</span>
                    <StatusBadge status="active" />
                  </div>
                  <h3 className="mediluxe-test-title" style={{ marginBottom: '0.35rem' }}>Compounding Pharmacy Console</h3>
                  <p className="mediluxe-test-desc">
                    Receive incoming digital prescriptions, manage batch compounding queues, generate compliant vial labels, and synchronize dispatch tracking.
                  </p>
                  <Link href="/pharmacy" className="mediluxe-btn mediluxe-btn-outline" style={{ width: '100%', justifyContent: 'space-between', minHeight: '38px', padding: '0.45rem 0.85rem' }}>
                    <span>Access Pharmacy Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mediluxe-test-card" style={{ borderLeft: '4px solid #c2410c' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>For Distributors &amp; Hospital Groups</span>
                    <StatusBadge status="approved" />
                  </div>
                  <h3 className="mediluxe-test-title" style={{ marginBottom: '0.35rem' }}>Wholesaler &amp; B2B Hub</h3>
                  <p className="mediluxe-test-desc">
                    Build custom-margin B2B catalogs, share tokenized quotation links with clinics, manage bulk orders, and access institutional API pricing.
                  </p>
                  <Link href="/wholesaler" className="mediluxe-btn mediluxe-btn-outline" style={{ width: '100%', justifyContent: 'space-between', minHeight: '38px', padding: '0.45rem 0.85rem' }}>
                    <span>Access Wholesaler Portal</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="mediluxe-test-card" style={{ borderLeft: '4px solid #7c3aed' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>For Patients &amp; Researchers</span>
                    <StatusBadge status="published" />
                  </div>
                  <h3 className="mediluxe-test-title" style={{ marginBottom: '0.35rem' }}>Discovery, Catalog &amp; Verification</h3>
                  <p className="mediluxe-test-desc">
                    Explore goal-based protocols, browse 580+ peptide and compounding references, calculate reconstitution units, or verify a vial&apos;s CoA.
                  </p>
                  <Link href="/" className="mediluxe-btn mediluxe-btn-primary" style={{ width: '100%', justifyContent: 'space-between', minHeight: '38px', padding: '0.45rem 0.85rem' }}>
                    <span>Explore Public Platform</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Section 5: Decentralized Global Network & Pharmaceutical Quality Governance ── */}
            <section id="logistics" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <Globe size={13} /> Decentralized Partner Network &amp; Quality Governance
              </span>
              <h2 className="mediluxe-section-title">Distributed Multi-Node Fulfillment &amp; Analytical Quality Governance</h2>
              <p className="mediluxe-section-subtitle">
                <strong>Atlas Health Services</strong> operates as a borderless, decentralized clinical technology and 
                pharmaceutical partner ecosystem—coordinating accredited compounding facilities, independent analytical 
                testing laboratories, and temperature-controlled logistics corridors across four strategic international regions.
              </p>

              <div className="mediluxe-geo-grid">
                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#003666', background: '#eff6ff', display: 'inline-block', padding: '2px 8px', borderRadius: '6px' }}>EU</div>
                  <div className="mediluxe-geo-country">European Corridor</div>
                  <div className="mediluxe-geo-role">
                    Strategic GMP compounding partnerships, pharmacopeial API synthesis, and European clinical dispatch nodes.
                  </div>
                </div>

                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', display: 'inline-block', padding: '2px 8px', borderRadius: '6px' }}>GCC</div>
                  <div className="mediluxe-geo-country">Middle East Corridor</div>
                  <div className="mediluxe-geo-role">
                    Regional clinical onboarding, longevity &amp; regenerative medicine partner network, and priority cold-chain transit.
                  </div>
                </div>

                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0284c7', background: '#f0f9ff', display: 'inline-block', padding: '2px 8px', borderRadius: '6px' }}>NA</div>
                  <div className="mediluxe-geo-country">North American Corridor</div>
                  <div className="mediluxe-geo-role">
                    Independent analytical testing coordination, peptide research collaboration, and clinical protocol telemetry.
                  </div>
                </div>

                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', display: 'inline-block', padding: '2px 8px', borderRadius: '6px' }}>APAC</div>
                  <div className="mediluxe-geo-country">Asia-Pacific Corridor</div>
                  <div className="mediluxe-geo-role">
                    International cold-chain transit coordination and cross-border pharmaceutical logistics gateway.
                  </div>
                </div>
              </div>

              {/* ── Pharmaceutical Quality & Analytical Standards Governance ── */}
              <div style={{ marginTop: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Award size={18} style={{ color: '#003666' }} />
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Pharmaceutical Quality &amp; Analytical Verification Standards
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.85rem 0' }}>
                  Every formulation distributed through the Atlas partner network undergoes multi-stage analytical verification prior to clinical release.
                </p>

                <div className="atlas-vault-grid">
                  <div className="atlas-vault-card">
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>ISO/IEC 17025 Analytical QA</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>RP-HPLC &amp; Mass Spectrometry Batch CoA (&gt;99%)</div>
                    </div>
                    <Link
                      href="/verify"
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ minHeight: '32px', padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                    >
                      <ShieldCheck size={13} />
                      <span>Verify Batch</span>
                    </Link>
                  </div>

                  <div className="atlas-vault-card">
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>Pharmacopeial Cleanroom Standards</div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>USP &lt;71&gt; Sterility &amp; USP &lt;85&gt; Endotoxin Compliance</div>
                    </div>
                    <Link
                      href="/catalog"
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ minHeight: '32px', padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                    >
                      <FlaskConical size={13} />
                      <span>Formulary Specs</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 6: Executive Contact, Email Signature & QR Verification ── */}
            <section id="contact" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <ShieldCheck size={13} /> Direct Executive Access
              </span>
              <h2 className="mediluxe-section-title">Executive Inquiries &amp; Partnership Onboarding</h2>
              <p className="mediluxe-section-subtitle">
                Connect directly with our executive leadership for clinical onboarding, custom compounding agreements, 
                B2B wholesale distribution, or institutional demonstrations.
              </p>

              <div className="mediluxe-contact-grid">
                <div className="mediluxe-contact-info-list">
                  {/* Executive Email */}
                  <div className="mediluxe-contact-item">
                    <div className="mediluxe-contact-item-left">
                      <div className="mediluxe-contact-item-icon"><Mail size={18} /></div>
                      <div>
                        <div className="mediluxe-contact-item-title">Managing Partner Email</div>
                        <div className="mediluxe-contact-item-val">jose@mediluxeme.com</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('jose@mediluxeme.com', 'email')}
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '34px' }}
                    >
                      {copiedKey === 'email' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Direct Phone UAE & Spain */}
                  <div className="mediluxe-contact-item">
                    <div className="mediluxe-contact-item-left">
                      <div className="mediluxe-contact-item-icon"><Phone size={18} /></div>
                      <div>
                        <div className="mediluxe-contact-item-title">Direct Lines (UAE &amp; Spain)</div>
                        <div className="mediluxe-contact-item-val">UAE: +971 56 417 9256 &nbsp;|&nbsp; ES: +34 654 314 490</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('+971564179256', 'phone')}
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '34px' }}
                    >
                      {copiedKey === 'phone' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{copiedKey === 'phone' ? 'Copied' : 'Copy UAE'}</span>
                    </button>
                  </div>

                  {/* Direct URL for Email Signature */}
                  <div className="mediluxe-contact-item">
                    <div className="mediluxe-contact-item-left">
                      <div className="mediluxe-contact-item-icon"><Globe size={18} /></div>
                      <div>
                        <div className="mediluxe-contact-item-title">Official Overview Link (For Email Signature)</div>
                        <div className="mediluxe-contact-item-val">www.atlashealth-services.com/atlas</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('https://www.atlashealth-services.com/atlas', 'url')}
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '34px' }}
                    >
                      {copiedKey === 'url' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{copiedKey === 'url' ? 'Copied URL' : 'Copy Link'}</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="no-print" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <button
                      onClick={downloadVCard}
                      className="mediluxe-btn mediluxe-btn-primary"
                      style={{ flex: 1 }}
                    >
                      <Download size={15} />
                      <span>Download Executive vCard (.vcf)</span>
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="mediluxe-btn mediluxe-btn-whatsapp"
                      style={{ flex: 1 }}
                    >
                      <Share2 size={15} />
                      <span>Book a Meeting (WhatsApp)</span>
                    </button>
                  </div>
                </div>

                {/* Right QR Card */}
                <div className="mediluxe-qr-card">
                  <div className="mediluxe-qr-frame">
                    <svg viewBox="0 0 120 120" width="120" height="120" aria-label="QR Code for Atlas Executive Overview">
                      <rect width="120" height="120" fill="#ffffff" />
                      <rect x="10" y="10" width="30" height="30" fill="#003666" />
                      <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                      <rect x="20" y="20" width="10" height="10" fill="#003666" />
                      <rect x="80" y="10" width="30" height="30" fill="#003666" />
                      <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
                      <rect x="90" y="20" width="10" height="10" fill="#003666" />
                      <rect x="10" y="80" width="30" height="30" fill="#003666" />
                      <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
                      <rect x="20" y="90" width="10" height="10" fill="#003666" />
                      <rect x="48" y="14" width="6" height="6" fill="#0d9488" />
                      <rect x="60" y="14" width="8" height="6" fill="#003666" />
                      <rect x="48" y="26" width="6" height="6" fill="#003666" />
                      <rect x="62" y="26" width="6" height="6" fill="#0d9488" />
                      <rect x="18" y="48" width="8" height="6" fill="#003666" />
                      <rect x="32" y="48" width="6" height="6" fill="#0d9488" />
                      <rect x="48" y="48" width="24" height="24" fill="#003666" rx="3" />
                      <rect x="54" y="54" width="12" height="12" fill="#ffffff" rx="2" />
                      <rect x="80" y="48" width="6" height="6" fill="#003666" />
                      <rect x="92" y="48" width="8" height="6" fill="#0d9488" />
                      <rect x="48" y="82" width="6" height="6" fill="#0d9488" />
                      <rect x="62" y="82" width="6" height="6" fill="#003666" />
                      <rect x="80" y="82" width="8" height="6" fill="#003666" />
                      <rect x="94" y="82" width="6" height="6" fill="#0d9488" />
                      <rect x="78" y="96" width="22" height="6" fill="#003666" />
                      <rect x="48" y="96" width="20" height="6" fill="#0d9488" />
                    </svg>
                  </div>
                  <h4 className="mediluxe-qr-title">Atlas Executive Overview</h4>
                  <p className="mediluxe-qr-sub">
                    Share this page in meetings or embed <strong>atlashealth-services.com/atlas</strong> directly in your corporate email signature.
                  </p>
                </div>
              </div>
            </section>
          </main>

          {/* ── Sticky Right Sidebar (Google Cloud "On This Page" Standard) ── */}
          <aside className="mediluxe-sidebar" aria-label="On This Page Navigation">
            <div className="mediluxe-toc-card">
              <div className="mediluxe-toc-header">
                <span>On This Page</span>
                <span>{Math.round(readingProgress)}%</span>
              </div>
              <div className="mediluxe-toc-progress">
                <div
                  className="mediluxe-toc-progress-fill"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
              <ul className="mediluxe-toc-list">
                {SECTIONS.map((sec) => (
                  <li key={sec.id}>
                    <button
                      className={`mediluxe-toc-link ${activeSection === sec.id ? 'active' : ''}`}
                      onClick={() => scrollTo(sec.id)}
                    >
                      <span>{sec.label}</span>
                      <ChevronRight size={13} style={{ opacity: activeSection === sec.id ? 1 : 0.4 }} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Interactive Tools Box */}
            <div className="mediluxe-sidebar-actions">
              <div className="mediluxe-sidebar-actions-title">Live Atlas Tools</div>
              <Link
                href="/catalog"
                className="mediluxe-btn mediluxe-btn-primary"
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'space-between' }}
              >
                <span>Compounding Formulary</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/calculator"
                className="mediluxe-btn mediluxe-btn-outline"
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'space-between' }}
              >
                <span>Dosing Calculator</span>
                <Calculator size={14} />
              </Link>
              <Link
                href="/protocol-finder"
                className="mediluxe-btn mediluxe-btn-outline"
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'space-between' }}
              >
                <span>AI Protocol Finder</span>
                <Compass size={14} />
              </Link>
              <Link
                href="/labels"
                className="mediluxe-btn mediluxe-btn-outline"
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'space-between' }}
              >
                <span>Pharmacy Label Studio</span>
                <Tag size={14} />
              </Link>
              <button
                onClick={handlePrintExecutivePDF}
                className="mediluxe-btn mediluxe-btn-outline"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <Printer size={14} />
                <span>Print / Save Executive PDF</span>
              </button>
              <button
                onClick={downloadVCard}
                className="mediluxe-btn mediluxe-btn-outline"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>Download Executive vCard</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
