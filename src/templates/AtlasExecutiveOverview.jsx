"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Award,
  Globe,
  CheckCircle2,
  Dna,
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
  Lock,
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
  FileCheck
} from '@/lib/icons';
import StatusBadge from '../components/ui/StatusBadge';
import CopyableId from '../components/ui/CopyableId';
import '../styles/mediluxe.css';

// ── Navigation Section Anchors (GCP "On This Page" Standard) ─────────────────
const SECTIONS = [
  { id: 'overview', label: 'Executive Summary' },
  { id: 'compounding', label: 'Advanced Compounding' },
  { id: 'ecosystem', label: 'Atlas Digital OS' },
  { id: 'workflow', label: 'Clinical-to-Pharmacy Loop' },
  { id: 'portals', label: 'Role-Based Portals' },
  { id: 'logistics', label: 'Global Hubs & Governance' },
  { id: 'contact', label: 'Executive Contact & QR' },
];

export default function AtlasExecutiveOverview() {
  const [activeSection, setActiveSection] = useState('overview');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

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
      "Atlas Health Services — Advanced Pharmaceutical Compounding, Peptide Therapeutics & Digital Clinical Infrastructure:\nhttps://www.atlashealth-services.com/atlas"
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Zabala;Jose;Luis;;
FN:Jose Luis Zabala - Mediluxe & Atlas Health Services
ORG:Mediluxe Health Solutions / Atlas Health Services
TITLE:Managing Partner
TEL;TYPE=WORK,VOICE:+971564179256
TEL;TYPE=CELL,VOICE:+34654314490
EMAIL;TYPE=PREF,INTERNET:jose@mediluxeme.com
URL:https://www.atlashealth-services.com/atlas
ADR;TYPE=WORK:;;Abu Dhabi & Dubai;UAE;;;
NOTE:Biotech · Longevity · Advanced Compounding · International Distribution (UAE · EU · US · HK)
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

  return (
    <div className="mediluxe-page">
      {/* ── Top Bar Breadcrumb / GCP Console Header Strip ── */}
      <div className="mediluxe-topbar">
        <div className="mediluxe-container mediluxe-topbar-inner">
          <div className="mediluxe-topbar-left">
            <Link href="/">Atlas Health Platform</Link>
            <span>/</span>
            <span style={{ color: 'var(--ml-slate-900)' }}>Executive Overview</span>
            <span>/</span>
            <strong>Compounding &amp; Clinical Infrastructure</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <StatusBadge status="active" />
            <div className="mediluxe-topbar-badge">
              <ShieldCheck size={13} />
              <span>GMP Compounding · UAE (HQ) · EU · US · HK</span>
            </div>
          </div>
        </div>
      </div>

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
      <header id="overview" className="mediluxe-hero">
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
              <strong>Atlas Health Services</strong> connects European GMP-certified compounding laboratories, 
              high-purity peptide formulations, and AI-assisted clinical workflows into a unified infrastructure. 
              From digital physician prescribing and custom sterile compounding to cryptographic batch verification 
              and cold-chain fulfillment across the <strong>UAE, Europe, the US, and Hong Kong</strong>.
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
                <span>Executive Inquiry</span>
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
                <div className="mediluxe-cred-label">Headquarters</div>
                <div className="mediluxe-cred-val">Abu Dhabi &amp; Dubai, UAE</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Fulfillment Nodes</div>
                <div className="mediluxe-cred-val">UAE · EU · US · Hong Kong</div>
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
                EU GMP &amp; Cleanroom Standards
              </span>
              <Link href="/mediluxe" style={{ color: 'var(--ml-navy)', fontWeight: 700, textDecoration: 'none' }}>
                GCC Corporate Profile →
              </Link>
            </div>
          </div>
        </div>
      </header>

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
              <div className="mediluxe-kpi-number">4 Hubs</div>
              <div className="mediluxe-kpi-label">UAE · EU · US · HK Logistics</div>
            </div>
          </div>
        </div>

        {/* ── Main Two-Column GCP Content Layout ── */}
        <div className="mediluxe-layout">
          <main className="mediluxe-main">

            {/* ── Section 1: Advanced Pharmaceutical Compounding ── */}
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

              {/* 6 Therapeutic Portfolios Matrix */}
              <div style={{ marginTop: '1.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Microscope size={18} style={{ color: '#003666' }} />
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      6 Specialized Therapeutic Portfolios Across 580+ Catalog References
                    </h3>
                  </div>
                  <Link href="/catalog" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#003666', textDecoration: 'none' }}>
                    Browse Full Formulary →
                  </Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {[
                    {
                      title: '1. Metabolic & GLP-1/GIP Pathways',
                      desc: 'Next-generation incretin mimetics, insulin sensitization, visceral adiposity reduction & energy homeostasis.',
                      color: '#003666'
                    },
                    {
                      title: '2. Tissue Repair & Regeneration',
                      desc: 'Angiogenesis, tendon/ligament remodeling, gut mucosal integrity (BPC-157, TB-500, KPV) & post-surgical recovery.',
                      color: '#0d9488'
                    },
                    {
                      title: '3. Cellular Longevity & Mitochondrial',
                      desc: 'Telomere support (Epithalon), NAD+ precursors, MOTS-c, SS-31 & senolytic cellular rejuvenation.',
                      color: '#003666'
                    },
                    {
                      title: '4. Neuro-Cognitive & Circadian',
                      desc: 'BDNF upregulation, neuroprotection, anxiolytic balance (Semax, Selank, Dihexa, DSIP) & deep sleep architecture.',
                      color: '#0d9488'
                    },
                    {
                      title: '5. Hormonal & Secretagogue Optimization',
                      desc: 'Pulsatile GH secretagogues (Tesamorelin, Ipamorelin, CJC-1295), HPG-axis support & bioidentical hormone replacement.',
                      color: '#003666'
                    },
                    {
                      title: '6. Immune Modulation & Thymic Peptides',
                      desc: 'Innate and adaptive immune balancing (Thymosin Alpha-1, LL-37) for chronic inflammatory and post-viral resilience.',
                      color: '#0d9488'
                    }
                  ].map((item, idx) => (
                    <div key={idx} style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: item.color, marginBottom: '0.25rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.45 }}>
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Section 2: The Atlas Digital Ecosystem (Ideas Built into Atlas) ── */}
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
                      Coordinated regional fulfillment from UAE, EU, US, or HK hubs directly to the prescribing clinic, pharmacy, or patient.
                    </p>
                  </div>
                </div>
                <div className="mediluxe-diagram-caption">
                  End-to-end digital traceability with role-based access control and HIPAA / GDPR-aligned data governance.
                </div>
              </div>
            </section>

            {/* ── Section 4: Dedicated Role-Based Portals ── */}
            <section id="portals" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <Building2 size={13} /> Multi-Stakeholder Architecture
              </span>
              <h2 className="mediluxe-section-title">Dedicated Portals for Every Healthcare Stakeholder</h2>
              <p className="mediluxe-section-subtitle">
                Atlas adapts dynamically to your operational role. Select your environment below to access specialized tools, 
                pricing tiers, and clinical workflows.
              </p>

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

            {/* ── Section 5: Global Logistics & Institutional Heritage ── */}
            <section id="logistics" className="mediluxe-section">
              <span className="mediluxe-section-badge">
                <Globe size={13} /> Global Supply Chain &amp; Regional Heritage
              </span>
              <h2 className="mediluxe-section-title">Globally Coordinated Fulfillment &amp; GCC Institutional Backing</h2>
              <p className="mediluxe-section-subtitle">
                Headquartered in the <strong>United Arab Emirates</strong> and backed by over 14 years of licensed medical 
                supply operations in Abu Dhabi and Dubai through <strong>MediLuxe Medical Supplies L.L.C.</strong>, Atlas operates 
                four strategic fulfillment hubs for resilient international distribution.
              </p>

              <div className="mediluxe-geo-grid">
                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇦🇪</div>
                  <div className="mediluxe-geo-country">UAE (HQ &amp; GCC Hub)</div>
                  <div className="mediluxe-geo-role">
                    Executive headquarters in Abu Dhabi &amp; Dubai serving clinics and pharmacies across UAE, Saudi Arabia, Qatar &amp; Kuwait.
                  </div>
                </div>

                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇪🇺</div>
                  <div className="mediluxe-geo-country">European Union</div>
                  <div className="mediluxe-geo-role">
                    Strategic GMP compounding partnerships, pharmaceutical API synthesis, and European clinical distribution node.
                  </div>
                </div>

                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇺🇸</div>
                  <div className="mediluxe-geo-country">United States</div>
                  <div className="mediluxe-geo-role">
                    North American analytical testing coordination, research peptide fulfillment, and clinical protocol telemetry.
                  </div>
                </div>

                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇭🇰</div>
                  <div className="mediluxe-geo-country">Hong Kong (APAC)</div>
                  <div className="mediluxe-geo-role">
                    Asia-Pacific cold-chain transit hub and international customs-cleared logistics gateway.
                  </div>
                </div>
              </div>

              <div className="mediluxe-bridge-box">
                <div className="mediluxe-bridge-text">
                  <h4>Institutional Synergy: MediLuxe Medical Supplies L.L.C. (Est. 2011)</h4>
                  <p>Inspect our official GCC corporate licensing, regulatory credentials, and regional healthcare portfolio.</p>
                </div>
                <Link href="/mediluxe" className="mediluxe-btn mediluxe-btn-outline">
                  <span>View MediLuxe Corporate Dossier</span>
                  <ArrowRight size={14} />
                </Link>
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
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
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
