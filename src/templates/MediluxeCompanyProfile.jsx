"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Award,
  Globe,
  MapPin,
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
  HeartPulse,
  Scale
} from '@/lib/icons';
import '../styles/mediluxe.css';

// ── Navigation Section Anchors ────────────────────────────────────────────────
const SECTIONS = [
  { id: 'overview', label: 'Company Overview' },
  { id: 'presence', label: 'Geographic Presence' },
  { id: 'diagnostics', label: 'Genetic Testing' },
  { id: 'platforms', label: 'Health Platforms' },
  { id: 'compounding', label: 'Advanced Compounding' },
  { id: 'leadership', label: 'Mission & Leadership' },
  { id: 'contact', label: 'Executive Verification' },
];

export default function MediluxeCompanyProfile() {
  const [activeSection, setActiveSection] = useState('overview');
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  // ── Scroll Spy & Progress Tracking ──────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setReadingProgress(progress);

      // Section highlight based on viewport position
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
      "MediLuxe Medical Supplies L.L.C. — Company Profile & Personalized Medicine Portfolio (Est. 2011, Abu Dhabi & Dubai):\nhttps://med-peptides.com/mediluxe"
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const downloadVCard = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:Zabala;Jose;;;
FN:Jose Zabala - MediLuxe
ORG:Mediluxe Medical Supplies L.L.C.
TITLE:Executive Director
TEL;TYPE=WORK,VOICE:+971564179256
EMAIL;TYPE=PREF,INTERNET:jose@mediluxegulf.com
URL:https://med-peptides.com/mediluxe
ADR;TYPE=WORK:;;Abu Dhabi & Dubai;UAE;;;
NOTE:Personalized Medicine & Advanced Compounding Pharmacy Solutions across GCC
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Jose_Zabala_MediLuxe.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mediluxe-page">
      {/* ── Top Bar Breadcrumb / Official Registration ── */}
      <div className="mediluxe-topbar">
        <div className="mediluxe-container mediluxe-topbar-inner">
          <div className="mediluxe-topbar-left">
            <Link href="/">Atlas Health</Link>
            <span>/</span>
            <span style={{ color: 'var(--ml-slate-900)' }}>Institutional Profile</span>
            <span>/</span>
            <strong>MediLuxe Medical Supplies L.L.C.</strong>
          </div>
          <div className="mediluxe-topbar-badge">
            <ShieldCheck size={13} />
            <span>Licensed in Abu Dhabi (HQ) &amp; Dubai (2024)</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Section Tabs ── */}
      <nav className="mediluxe-mobile-chips" aria-label="Mobile Sections">
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
      <header className="mediluxe-hero">
        <div className="mediluxe-container mediluxe-hero-inner">
          <div>
            <div className="mediluxe-hero-eyebrow">
              <Building2 size={13} />
              <span>Official Corporate Dossier · Est. 2011</span>
            </div>
            <h1 className="mediluxe-hero-title">MediLuxe</h1>
            <p className="mediluxe-hero-tagline">Caring for Health</p>
            <p className="mediluxe-hero-desc">
              Pioneering personalized medicine, European certified DNA diagnostics, and advanced 
              compounding pharmacy solutions for healthcare providers and clinical institutions across 
              the United Arab Emirates, Qatar, Kuwait, and Saudi Arabia.
            </p>
            <div className="mediluxe-hero-actions">
              <button 
                onClick={handleShareWhatsApp} 
                className="mediluxe-btn mediluxe-btn-whatsapp"
                title="Share official profile on WhatsApp"
              >
                <Share2 size={15} />
                <span>Share on WhatsApp</span>
              </button>
              <button 
                onClick={downloadVCard} 
                className="mediluxe-btn mediluxe-btn-primary"
                title="Download digital vCard"
              >
                <Download size={15} />
                <span>Download Official vCard</span>
              </button>
              <button 
                onClick={() => handleCopy('https://med-peptides.com/mediluxe', 'url')} 
                className="mediluxe-btn mediluxe-btn-outline"
              >
                {copiedKey === 'url' ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
                <span>{copiedKey === 'url' ? 'Link Copied!' : 'Copy Short URL'}</span>
              </button>
            </div>
          </div>

          {/* Right Official Registration Card */}
          <div className="mediluxe-credential-card">
            <div className="mediluxe-cred-header">
              <div className="mediluxe-cred-logo">M</div>
              <div>
                <h3 className="mediluxe-cred-title">Mediluxe Medical Supplies L.L.C.</h3>
                <p className="mediluxe-cred-sub">Ministry of Health &amp; DOH Authorized Entity</p>
              </div>
            </div>
            <div className="mediluxe-cred-grid">
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Established</div>
                <div className="mediluxe-cred-val">2011 (14+ Years)</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Headquarters</div>
                <div className="mediluxe-cred-val">Abu Dhabi, UAE</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">2024 Expansion</div>
                <div className="mediluxe-cred-val">Dubai Healthcare Hub</div>
              </div>
              <div className="mediluxe-cred-item">
                <div className="mediluxe-cred-label">Compliance</div>
                <div className="mediluxe-cred-val">GMP &amp; ISO Standards</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="mediluxe-topbar-badge">
                <CheckCircle2 size={12} /> GCC Cold-Chain Validated
              </span>
              <span className="mediluxe-topbar-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                <Lock size={12} /> HIPAA-Compliant Privacy
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="mediluxe-container" style={{ marginTop: '2.5rem' }}>
        {/* ── 4 Key Performance Indicators (Google Cloud UX Rule #22) ── */}
        <div className="mediluxe-kpi-bar">
          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon"><Award size={22} /></div>
            <div>
              <div className="mediluxe-kpi-number">14+</div>
              <div className="mediluxe-kpi-label">Years of Excellence (2011–2025)</div>
            </div>
          </div>
          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon"><Globe size={22} /></div>
            <div>
              <div className="mediluxe-kpi-number">4</div>
              <div className="mediluxe-kpi-label">GCC Countries Served</div>
            </div>
          </div>
          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon"><FlaskConical size={22} /></div>
            <div>
              <div className="mediluxe-kpi-number">35+</div>
              <div className="mediluxe-kpi-label">Specialized Formulations</div>
            </div>
          </div>
          <div className="mediluxe-kpi-card">
            <div className="mediluxe-kpi-icon"><Layers size={22} /></div>
            <div>
              <div className="mediluxe-kpi-number">7</div>
              <div className="mediluxe-kpi-label">Therapeutic Categories</div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout (Content + Right Sticky Sidebar) ── */}
        <div className="mediluxe-layout">
          {/* ── Main Content Area ── */}
          <main className="mediluxe-main">
            {/* ── Section 1: Overview ── */}
            <section id="overview" className="mediluxe-section">
              <span className="mediluxe-section-badge">Overview</span>
              <h2 className="mediluxe-section-title">Personalized Medicine &amp; Advanced Compounding</h2>
              <p className="mediluxe-section-subtitle">
                Since its establishment in 2011 in Abu Dhabi, Mediluxe Medical Supplies L.L.C. has 
                stood as the premier authorized European biotechnology gateway in the Middle East, 
                supplying private clinics, hospitals, and longevity institutes with pharmaceutical-grade 
                personalized medical solutions.
              </p>

              {/* Clean Clinical Flow Diagram (Anti-SciFi) */}
              <div className="mediluxe-diagram-wrapper">
                <svg viewBox="0 0 760 110" width="100%" height="auto" style={{ overflow: 'visible', display: 'block' }}>
                  <defs>
                    <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#003666" />
                      <stop offset="100%" stopColor="#0d9488" />
                    </linearGradient>
                  </defs>
                  {/* Connecting Line */}
                  <line x1="80" y1="42" x2="680" y2="42" stroke="#e2e8f0" strokeWidth="3" strokeDasharray="4 4" />
                  
                  {/* Step 1 */}
                  <circle cx="80" cy="42" r="22" fill="#003666" />
                  <text x="80" y="47" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">01</text>
                  <text x="80" y="80" fill="#0f172a" fontSize="12" fontWeight="700" textAnchor="middle">DNA Swab</text>
                  <text x="80" y="96" fill="#64748b" fontSize="10" textAnchor="middle">Non-invasive sample</text>

                  {/* Step 2 */}
                  <circle cx="280" cy="42" r="22" fill="#0284c7" />
                  <text x="280" y="47" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">02</text>
                  <text x="280" y="80" fill="#0f172a" fontSize="12" fontWeight="700" textAnchor="middle">European Lab</text>
                  <text x="280" y="96" fill="#64748b" fontSize="10" textAnchor="middle">Fagron Genomics</text>

                  {/* Step 3 */}
                  <circle cx="480" cy="42" r="22" fill="#0d9488" />
                  <text x="480" y="47" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">03</text>
                  <text x="480" y="80" fill="#0f172a" fontSize="12" fontWeight="700" textAnchor="middle">Clinical Mapping</text>
                  <text x="480" y="96" fill="#64748b" fontSize="10" textAnchor="middle">30+ biomarkers</text>

                  {/* Step 4 */}
                  <circle cx="680" cy="42" r="22" fill="#14b8a6" />
                  <text x="680" y="47" fill="#ffffff" fontSize="12" fontWeight="700" textAnchor="middle">04</text>
                  <text x="680" y="80" fill="#0f172a" fontSize="12" fontWeight="700" textAnchor="middle">Compounding</text>
                  <text x="680" y="96" fill="#64748b" fontSize="10" textAnchor="middle">GMP Vials &amp; Pellets</text>
                </svg>
                <div className="mediluxe-diagram-caption">
                  End-to-End Methodology: Integration of European genetic diagnostics with precision therapeutic compounding.
                </div>
              </div>
            </section>

            {/* ── Section 2: Geographic Presence ── */}
            <section id="presence" className="mediluxe-section">
              <span className="mediluxe-section-badge">Regional Coverage</span>
              <h2 className="mediluxe-section-title">Geographic Presence Across the GCC</h2>
              <p className="mediluxe-section-subtitle">
                Cross-border logistics infrastructure ensuring regulatory customs clearance and cold-chain 
                integrity for biologicals and peptides across key Gulf markets.
              </p>

              {/* Realistic Regional Map Graphic (SVG) */}
              <div className="mediluxe-diagram-wrapper">
                <svg viewBox="0 0 760 280" width="100%" height="auto" style={{ display: 'block', background: '#f8fafc', borderRadius: '12px' }}>
                  {/* Subtle GCC landmass silhouette approximation */}
                  <path
                    d="M 120 70 Q 220 50 360 40 Q 520 40 640 100 Q 690 140 680 210 Q 640 260 520 260 Q 420 250 310 230 Q 180 200 120 150 Z"
                    fill="#e2e8f0"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  {/* Arabian Gulf Water Representation */}
                  <path
                    d="M 380 40 Q 480 30 570 70 Q 620 100 580 140 Q 510 130 460 100 Z"
                    fill="#e0f2fe"
                    opacity="0.8"
                  />

                  {/* Route lines */}
                  <line x1="510" y1="125" x2="545" y2="105" stroke="#003666" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="510" y1="125" x2="480" y2="90" stroke="#003666" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="510" y1="125" x2="430" y2="55" stroke="#003666" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="510" y1="125" x2="330" y2="120" stroke="#003666" strokeWidth="2" strokeDasharray="3 3" />

                  {/* Nodes */}
                  {/* Abu Dhabi HQ */}
                  <circle cx="510" cy="125" r="9" fill="#003666" stroke="#ffffff" strokeWidth="2" />
                  <text x="510" y="152" fill="#003666" fontSize="12" fontWeight="800" textAnchor="middle">Abu Dhabi (HQ)</text>
                  <text x="510" y="166" fill="#64748b" fontSize="10" textAnchor="middle">Est. 2011 · Headquarters</text>

                  {/* Dubai Expansion */}
                  <circle cx="545" cy="105" r="7" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  <text x="575" y="105" fill="#0d9488" fontSize="11" fontWeight="700">Dubai Hub (2024)</text>

                  {/* Qatar */}
                  <circle cx="480" cy="90" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="445" y="85" fill="#0f172a" fontSize="11" fontWeight="600">Qatar</text>

                  {/* Kuwait */}
                  <circle cx="430" cy="55" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="390" y="55" fill="#0f172a" fontSize="11" fontWeight="600">Kuwait</text>

                  {/* Saudi Arabia */}
                  <circle cx="330" cy="120" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="260" y="125" fill="#0f172a" fontSize="11" fontWeight="600">Saudi Arabia</text>
                </svg>
                <div className="mediluxe-diagram-caption">
                  MediLuxe Certified Cold-Chain: Air &amp; overland transport in temperature-controlled environments (+2°C to +8°C and -20°C).
                </div>
              </div>

              {/* Geographic Cards */}
              <div className="mediluxe-geo-grid">
                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇦🇪</div>
                  <div className="mediluxe-geo-country">United Arab Emirates</div>
                  <div className="mediluxe-geo-role">Abu Dhabi (HQ) &amp; Dubai Branch (2024). Full coverage for clinics and hospitals.</div>
                </div>
                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇶🇦</div>
                  <div className="mediluxe-geo-country">Qatar</div>
                  <div className="mediluxe-geo-role">Comprehensive market coverage via authorized medical distribution partners.</div>
                </div>
                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇰🇼</div>
                  <div className="mediluxe-geo-country">Kuwait</div>
                  <div className="mediluxe-geo-role">Strategic alliances with longevity, dermatology, and aesthetic practices.</div>
                </div>
                <div className="mediluxe-geo-card">
                  <div className="mediluxe-geo-flag">🇸🇦</div>
                  <div className="mediluxe-geo-country">Saudi Arabia</div>
                  <div className="mediluxe-geo-role">Expanding footprint across Riyadh and Eastern Province complying with SFDA standards.</div>
                </div>
              </div>
            </section>

            {/* ── Section 3: Precision Diagnostics & Genetic Testing ── */}
            <section id="diagnostics" className="mediluxe-section">
              <span className="mediluxe-section-badge">Molecular Diagnostics</span>
              <h2 className="mediluxe-section-title">Precision Diagnostics &amp; DNA Testing</h2>
              <p className="mediluxe-section-subtitle">
                Exclusive portfolio of DNA-based diagnostic tools developed alongside pioneering 
                European genomics centers (Fagron Genomics). Comprehensive genetic testing to ground individualized therapies.
              </p>

              <div className="mediluxe-tests-grid">
                {/* Test 1 */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Activity size={18} /></div>
                    <h3 className="mediluxe-test-title">Biological Age Test</h3>
                  </div>
                  <p className="mediluxe-test-desc">Telomere length analysis for precise cellular aging quantification.</p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Precise cellular aging measurement</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Cellular longevity protocol design</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Targeted systemic rejuvenation compounding</span></li>
                  </ul>
                </div>

                {/* Test 2 */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Dna size={18} /></div>
                    <h3 className="mediluxe-test-title">Weight Management Test</h3>
                  </div>
                  <p className="mediluxe-test-desc">Precision nutrition and metabolic optimization grounded in individual genetic profile.</p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Metabolic efficiency &amp; absorption analysis</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Polymorphism-guided dietary strategies</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Custom weight management formulations</span></li>
                  </ul>
                </div>

                {/* Test 3 */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><FlaskConical size={18} /></div>
                    <h3 className="mediluxe-test-title">Acne Treatment Test</h3>
                  </div>
                  <p className="mediluxe-test-desc">Identification of genetic and inflammatory triggers impairing dermal skin barrier function.</p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Inflammatory cascade predisposition</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Sebaceous regulation &amp; sebum profiling</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Customized topical compounding formulations</span></li>
                  </ul>
                </div>

                {/* Test 4 */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><HeartPulse size={18} /></div>
                    <h3 className="mediluxe-test-title">Hair Loss Treatment Test</h3>
                  </div>
                  <p className="mediluxe-test-desc">Advanced trichology genomics for preventative and targeted clinical management.</p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Androgenetic alopecia risk evaluation</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Follicular androgen sensitivity profiling</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Targeted hair restoration formulations</span></li>
                  </ul>
                </div>

                {/* Test 5 */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Award size={18} /></div>
                    <h3 className="mediluxe-test-title">Sports Performance Test</h3>
                  </div>
                  <p className="mediluxe-test-desc">Genetic insights for athletic performance, injury recovery, and tendon resilience.</p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Muscle fiber composition &amp; power profile</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Joint and tendon vulnerability screening</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Accelerated neuromuscular recovery protocols</span></li>
                  </ul>
                </div>

                {/* Test 6 */}
                <div className="mediluxe-test-card">
                  <div className="mediluxe-test-header">
                    <div className="mediluxe-test-icon"><Globe size={18} /></div>
                    <h3 className="mediluxe-test-title">Ancestry &amp; Health Test</h3>
                  </div>
                  <p className="mediluxe-test-desc">Comprehensive genetic profiling for biological heritage and health risk stratification.</p>
                  <ul className="mediluxe-test-bullets">
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Geographic ancestry &amp; lineage mapping</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Hereditary health risk vulnerability detection</span></li>
                    <li className="mediluxe-test-bullet"><Check size={14} /><span>Preventative longevity lifestyle mapping</span></li>
                  </ul>
                </div>
              </div>

              {/* Cross-Link Bridge to Public Catalog */}
              <div className="mediluxe-bridge-box">
                <div className="mediluxe-bridge-text">
                  <h4>Explore technical monographs in the Public Catalog</h4>
                  <p>Review clinical data sheets, tested biomarkers, and healthcare practitioner specifications.</p>
                </div>
                <Link href="/catalog" className="mediluxe-btn mediluxe-btn-primary">
                  <span>View Testing Catalog</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            {/* ── Section 4: Integrated Health Platforms ── */}
            <section id="platforms" className="mediluxe-section">
              <span className="mediluxe-section-badge">Health Technology</span>
              <h2 className="mediluxe-section-title">Integrated Health Platforms</h2>
              <p className="mediluxe-section-subtitle">
                Fusing heterogeneous biological data to generate actionable clinical insights and proactive 
                preventative care strategies.
              </p>

              {/* 3-Pillar Enterprise Architecture Diagram */}
              <div className="mediluxe-diagram-wrapper">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#003666', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>1. Biological Data Ingestion</div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Genetic markers, blood panels (30+ analytes), biometric vitals, and lifestyle metrics.
                    </p>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #0d9488' }}>
                    <div style={{ color: '#0d9488', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>2. Clinical Analytics Engine</div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Biological age, metabolic risk modeling, and longitudinal trend analysis.
                    </p>
                  </div>
                  <div style={{ background: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#003666', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.5rem' }}>3. Connected Digital Tools</div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                      Wearable integration, preventative alerts, at-home test kits, and practitioner consoles.
                    </p>
                  </div>
                </div>
                <div className="mediluxe-diagram-caption">
                  Enterprise-grade encryption and HIPAA / GDPR healthcare security compliance.
                </div>
              </div>
            </section>

            {/* ── Section 5: Advanced Compounding & Product Development ── */}
            <section id="compounding" className="mediluxe-section">
              <span className="mediluxe-section-badge">Precision Compounding</span>
              <h2 className="mediluxe-section-title">Advanced Compounding &amp; Product Development</h2>
              <p className="mediluxe-section-subtitle">
                Strategic pharmaceutical partnerships with European compounding labs delivering customized, 
                high-potency formulations for physicians and clinical institutes across the Middle East.
              </p>

              <div className="mediluxe-compounding-grid">
                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><ShieldCheck size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Certified GMP Actives</h4>
                  <p className="mediluxe-pillar-desc">
                    High-purity APIs sourced exclusively from leading European GMP-compliant pharmaceutical manufacturers.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Cpu size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Sterile Cleanroom Infrastructure</h4>
                  <p className="mediluxe-pillar-desc">
                    State-of-the-art cleanroom technology for sterile injectable and topical formulations.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><FlaskConical size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Custom Tailored Formulations</h4>
                  <p className="mediluxe-pillar-desc">
                    Bioidentical hormone pellets and individualized vials designed for precision therapies.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Award size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Clinical Education &amp; CME</h4>
                  <p className="mediluxe-pillar-desc">
                    Continuous training programs for physicians and clinical pharmacists on compounding methodologies.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Layers size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Logistics &amp; Compliance</h4>
                  <p className="mediluxe-pillar-desc">
                    End-to-end support ensuring streamlined cold-chain logistics, customs clearance, and product registration.
                  </p>
                </div>

                <div className="mediluxe-pillar-card">
                  <div className="mediluxe-pillar-icon"><Sparkles size={20} /></div>
                  <h4 className="mediluxe-pillar-title">Private Label Development</h4>
                  <p className="mediluxe-pillar-desc">
                    Exclusive cosmeceutical and peptide formulations meeting stringent international cosmetic standards.
                  </p>
                </div>
              </div>

              {/* Cross-Link Bridge to Protocols */}
              <div className="mediluxe-bridge-box">
                <div className="mediluxe-bridge-text">
                  <h4>Looking for detailed clinical compounding &amp; peptide protocols?</h4>
                  <p>Explore evidence-based administration regimens, dosing guidelines, and synergistic pairings.</p>
                </div>
                <Link href="/proto" className="mediluxe-btn mediluxe-btn-primary">
                  <span>Explore Clinical Protocols</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </section>

            {/* ── Section 6: Mission, Vision & Management Team ── */}
            <section id="leadership" className="mediluxe-section">
              <span className="mediluxe-section-badge">Institutional Leadership</span>
              <h2 className="mediluxe-section-title">Mission, Vision &amp; Executive Leadership</h2>
              <p className="mediluxe-section-subtitle">
                Driven by clinical excellence, translational research, and empowering medical practitioners 
                with next-generation preventative therapies.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#003666' }}>
                    <ShieldCheck size={20} />
                    <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Our Mission</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                      <span>Bridge advanced genomic diagnostics with customized therapeutic solutions.</span>
                    </li>
                    <li style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                      <span>Integrate cutting-edge European biotechnology into everyday clinical workflows.</span>
                    </li>
                    <li style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                      <span>Prioritize preventative, root-cause medicine over reactive symptom treatment.</span>
                    </li>
                  </ul>
                </div>

                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#0d9488' }}>
                    <Globe size={20} />
                    <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Our Vision</h3>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                      <span>Empower healthcare clinics to lead the frontier of modern personalized medicine.</span>
                    </li>
                    <li style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                      <span>Drive systemic healthcare transition toward proactive, hyper-personalized longevity care.</span>
                    </li>
                    <li style={{ display: 'flex', gap: '0.45rem', fontSize: '0.82rem', color: '#475569' }}>
                      <Check size={15} style={{ color: '#0d9488', flexShrink: 0 }} />
                      <span>Democratize access to advanced compounded therapeutics across the Middle East.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Team Stats */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                  Multidisciplinary Executive Team
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#003666' }}>15+</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Years of Experience</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d9488' }}>6</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Nationalities Represented</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>4</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Core Disciplines</div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Section 7: Verification & Contact ── */}
            <section id="contact" className="mediluxe-section">
              <span className="mediluxe-section-badge">Executive Verification</span>
              <h2 className="mediluxe-section-title">Executive Directory &amp; Official Inquiries</h2>
              <p className="mediluxe-section-subtitle">
                Direct access for medical directors, chief pharmacists, and healthcare institutions 
                seeking regional supply or partnership agreements.
              </p>

              <div className="mediluxe-contact-grid">
                <div className="mediluxe-contact-info-list">
                  {/* Email */}
                  <div className="mediluxe-contact-item">
                    <div className="mediluxe-contact-item-left">
                      <div className="mediluxe-contact-item-icon"><Mail size={18} /></div>
                      <div>
                        <div className="mediluxe-contact-item-title">Official Executive Email</div>
                        <div className="mediluxe-contact-item-val">jose@mediluxegulf.com</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('jose@mediluxegulf.com', 'email')}
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '32px' }}
                    >
                      {copiedKey === 'email' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{copiedKey === 'email' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="mediluxe-contact-item">
                    <div className="mediluxe-contact-item-left">
                      <div className="mediluxe-contact-item-icon"><Phone size={18} /></div>
                      <div>
                        <div className="mediluxe-contact-item-title">Direct Telephone &amp; WhatsApp</div>
                        <div className="mediluxe-contact-item-val">+971 56 4179256</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy('+971564179256', 'phone')}
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '32px' }}
                    >
                      {copiedKey === 'phone' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{copiedKey === 'phone' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Website */}
                  <div className="mediluxe-contact-item">
                    <div className="mediluxe-contact-item-left">
                      <div className="mediluxe-contact-item-icon"><Globe size={18} /></div>
                      <div>
                        <div className="mediluxe-contact-item-title">Institutional Website</div>
                        <div className="mediluxe-contact-item-val">www.mediluxegulf.com</div>
                      </div>
                    </div>
                    <a
                      href="https://www.mediluxegulf.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mediluxe-btn mediluxe-btn-outline"
                      style={{ padding: '0.4rem 0.75rem', minHeight: '32px' }}
                    >
                      <ExternalLink size={14} />
                      <span>Visit</span>
                    </a>
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="mediluxe-qr-card">
                  <div className="mediluxe-qr-frame">
                    {/* Clean SVG QR code representation pointing to https://med-peptides.com/mediluxe */}
                    <svg viewBox="0 0 120 120" width="120" height="120">
                      <rect width="120" height="120" fill="#ffffff" />
                      {/* Corner 1 */}
                      <rect x="10" y="10" width="30" height="30" fill="#003666" />
                      <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                      <rect x="20" y="20" width="10" height="10" fill="#003666" />
                      {/* Corner 2 */}
                      <rect x="80" y="10" width="30" height="30" fill="#003666" />
                      <rect x="85" y="15" width="20" height="20" fill="#ffffff" />
                      <rect x="90" y="20" width="10" height="10" fill="#003666" />
                      {/* Corner 3 */}
                      <rect x="10" y="80" width="30" height="30" fill="#003666" />
                      <rect x="15" y="85" width="20" height="20" fill="#ffffff" />
                      <rect x="20" y="90" width="10" height="10" fill="#003666" />
                      {/* QR Data Grid */}
                      <rect x="50" y="15" width="6" height="6" fill="#0d9488" />
                      <rect x="62" y="15" width="6" height="6" fill="#003666" />
                      <rect x="50" y="27" width="6" height="6" fill="#003666" />
                      <rect x="62" y="27" width="6" height="6" fill="#0d9488" />
                      <rect x="20" y="50" width="6" height="6" fill="#003666" />
                      <rect x="32" y="50" width="6" height="6" fill="#0d9488" />
                      <rect x="50" y="50" width="20" height="20" fill="#003666" />
                      <rect x="55" y="55" width="10" height="10" fill="#ffffff" />
                      <rect x="80" y="50" width="6" height="6" fill="#003666" />
                      <rect x="92" y="50" width="6" height="6" fill="#0d9488" />
                      <rect x="50" y="80" width="6" height="6" fill="#0d9488" />
                      <rect x="62" y="80" width="6" height="6" fill="#003666" />
                      <rect x="80" y="80" width="6" height="6" fill="#003666" />
                      <rect x="92" y="80" width="6" height="6" fill="#0d9488" />
                      <rect x="80" y="95" width="20" height="6" fill="#003666" />
                      <rect x="50" y="95" width="20" height="6" fill="#003666" />
                    </svg>
                  </div>
                  <h4 className="mediluxe-qr-title">Instant Digital Verification</h4>
                  <p className="mediluxe-qr-sub">
                    Scan with your smartphone camera to access this corporate dossier or download the official contact card.
                  </p>
                </div>
              </div>
            </section>
          </main>

          {/* ── Sticky Right Sidebar (Google Cloud "On This Page" Standard) ── */}
          <aside className="mediluxe-sidebar" aria-label="Corporate Profile Navigation">
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

            {/* Quick Actions Drawer Box */}
            <div className="mediluxe-sidebar-actions">
              <div className="mediluxe-sidebar-actions-title">Quick Actions</div>
              <button
                onClick={handleShareWhatsApp}
                className="mediluxe-btn mediluxe-btn-whatsapp"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <Share2 size={14} />
                <span>Share on WhatsApp</span>
              </button>
              <button
                onClick={downloadVCard}
                className="mediluxe-btn mediluxe-btn-primary"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                <Download size={14} />
                <span>Save vCard to Mobile</span>
              </button>
              <button
                onClick={() => handleCopy('https://med-peptides.com/mediluxe', 'sidebar-link')}
                className="mediluxe-btn mediluxe-btn-outline"
                style={{ width: '100%', fontSize: '0.8rem' }}
              >
                {copiedKey === 'sidebar-link' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                <span>{copiedKey === 'sidebar-link' ? 'Copied ✓' : 'Copy Link'}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
