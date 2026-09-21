/**
 * src/components/product/SpainCompanyResidencyTechnicalSpecs.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive & Highly Visual Specification Engine for Spanish Corporate
 * Acquisition & Law 14/2013 Entrepreneur Residence.
 * Features:
 *  - Interactive Fast-Track Strategy Simulator (Profile / Activity / Stay)
 *  - Visual Schengen Mobility Radar & Interactive Map Infographic
 *  - Visual 4-Stage Milestone Roadmap with Progress Meters
 *  - Visual DO vs. DON'T Strategic Best Practices Matrix
 *  - Interactive Accordion FAQ with Legal Citations
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileCheck2,
  Users,
  Sparkles,
  ArrowRight,
  Clock,
  Landmark,
  Globe2,
  Calendar,
  Briefcase,
  HelpCircle,
  Scale,
  Check,
  X,
  Plane,
  CreditCard,
  Layers,
  Compass,
  FileText,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import './SpainCompanyResidencyTechnicalSpecs.css';

export default function SpainCompanyResidencyTechnicalSpecs({
  product,
  lang = 'en',
  onOpenInquiry
}) {
  // Interactive Simulator State
  const [profileType, setProfileType] = useState('single'); // 'single' | 'founders' | 'family'
  const [businessModel, setBusinessModel] = useState('consulting'); // 'consulting' | 'trade' | 'health' | 'holding'
  const [physicalStay, setPhysicalStay] = useState('flexible'); // 'flexible' | 'full'
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  // Dynamic Blueprint Calculation
  const blueprint = useMemo(() => {
    let permitDuration = '3 Years (Initial Grant)';
    let applicantsCovered = '1 Primary Applicant (Director / Shareholder)';
    let remoteExecution = '100% Remote via Consular Power of Attorney';
    let enisaFocus = 'High-Value Strategic Management & Digital Advisory';
    let physicalStayNotice = 'Flexible: No strict 183-day annual stay to renew';

    if (profileType === 'founders') {
      applicantsCovered = 'Up to 4 Co-Founders with Executive Appointments';
      enisaFocus = 'Multi-Founder Venture with Complementary Executive Profiles';
    } else if (profileType === 'family') {
      applicantsCovered = 'Primary Applicant + Spouse + Dependent Children';
      enisaFocus = 'Family Unit Legal Residency with Full Work Authorization';
    }

    if (businessModel === 'trade') {
      enisaFocus = 'Cross-Border Wholesale Distribution & International Logistics';
    } else if (businessModel === 'health') {
      enisaFocus = 'Biomedical Innovation, Longevity, or Clinical Consulting';
    } else if (businessModel === 'holding') {
      enisaFocus = 'Corporate Holding, IP Asset Management & Global Operations';
    }

    if (physicalStay === 'full') {
      physicalStayNotice = 'Full Relocation (>183 Days/Year): Fast track to 5-year Permanent EU Residency';
    }

    return {
      permitDuration,
      applicantsCovered,
      remoteExecution,
      enisaFocus,
      physicalStayNotice,
      timeframe: '8 – 12 Weeks (Expedited 20-day UGE-CE window)'
    };
  }, [profileType, businessModel, physicalStay]);

  const milestones = [
    {
      step: '01',
      dayRange: 'Days 1 – 15',
      title: '100% Notarial Ownership & NIE',
      icon: Landmark,
      color: 'gold',
      badge: 'Immediate Corporate CIF',
      points: [
        'Foreigner Identity Number (NIE) issued via Consular PoA',
        'Notarial Deed of 100% Share Acquisition executed',
        'Commercial Registry filing & Sole Administrator appointed',
        'Official AEAT & TGSS zero-debt clearance verified'
      ]
    },
    {
      step: '02',
      dayRange: 'Days 16 – 35',
      title: 'Strategic Business Plan & ENISA',
      icon: Briefcase,
      color: 'blue',
      badge: 'Innovation Accreditation',
      points: [
        'Custom 3-to-5 year financial model & business projection',
        'Framing of economic substance, job creation, and trade impact',
        'Formal digital filing via ENISA platform (Ministry of Industry)',
        'Legal tracking and proactive technical defense with evaluators'
      ]
    },
    {
      step: '03',
      dayRange: 'Days 36 – 55',
      title: 'UGE-CE Expedited Adjudication',
      icon: Scale,
      color: 'green',
      badge: '20-Day Statutory Window',
      points: [
        'Simultaneous residence filing before the UGE-CE',
        'Statutory 20-working-day administrative resolution deadline',
        'Issuance of official 3-Year Residence & Work Authorization',
        'Notification sent directly through digital government headquarters'
      ]
    },
    {
      step: '04',
      dayRange: 'Days 56 – 75',
      title: 'TIE Biometric Card & Schengen',
      icon: CreditCard,
      color: 'purple',
      badge: '29 Schengen Countries',
      points: [
        'VIP concierge booking for police fingerprint appointment in Spain',
        'Physical Foreigner Identity Card (TIE) printed and issued',
        'Immediate visa-free travel across all 29 European Schengen states',
        'Immediate commencement of 5-year permanent residence counter'
      ]
    }
  ];

  const faqs = product?.faqs || [
    {
      q: 'What is the statutory legal foundation of this residence program?',
      a: 'Regulated under Spanish Law 14/2013 of September 27 on Support for Entrepreneurs and their Internationalization (Articles 68 to 72). Adjudicated centrally by the Large Business and Strategic Groups Unit (UGE-CE) under the Ministry of Inclusion, Social Security and Migration, in coordination with ENISA (Ministry of Industry and Tourism).'
    },
    {
      q: 'Why acquire 100% of an existing company rather than incorporating a new one?',
      a: 'Forming a new Spanish entity typically takes 6 to 9 months before an immigration file can be lodged due to provisional NIF backlogs, strict anti-money laundering bank account friction, and theoretical business plan vetting. Acquiring 100% of an existing, compliant S.L. allows immediate notarial execution, instant transfer of an active NIF/CIF, and immediate filing before ENISA and UGE-CE.'
    },
    {
      q: 'Do I obtain 100% legal ownership of the acquired company?',
      a: 'Yes. 100% of the share capital (participaciones sociales) is formally transferred to the investor (or structured across qualifying co-investors) through a public notarial deed (Escritura Pública) and recorded in the Spanish Commercial Registry (Registro Mercantil).'
    },
    {
      q: 'How is the company verified to be debt-free and compliant?',
      a: 'Comprehensive pre-acquisition due diligence is performed, including official certificates of good standing and zero tax debt from the Spanish Tax Agency (AEAT) and Social Security Treasury (TGSS), up-to-date Commercial Registry filings, and notarial seller indemnity clauses.'
    },
    {
      q: 'What is the duration of the initial residence authorization, and how is it renewed?',
      a: 'Under Law 14/2013, the initial residence authorization is issued for 3 full years. It is renewable for successive 2-year periods provided the company remains operational. After 5 continuous years of legal residence, applicants are eligible for Permanent EU Long-Term Residency and subsequent citizenship.'
    },
    {
      q: 'Am I authorized to work in Spain under this permit?',
      a: 'Yes. The residence permit explicitly authorizes gainful employment and self-employment (por cuenta propia y por cuenta ajena) across all economic sectors throughout the entire Spanish territory.'
    },
    {
      q: 'Does this residence permit provide Schengen Zone mobility?',
      a: 'Yes. Holders of the Spanish Foreigner Identity Card (TIE) enjoy unrestricted visa-free transit across all 29 member nations of the European Schengen Area for up to 90 days in any 180-day period without consular tourist visas.'
    },
    {
      q: 'Can family members be included in the application?',
      a: 'Yes. Spouses, legally recognized civil partners, minor children, and economically dependent adult children or ascendants can be included simultaneously in the initial application or joined at a later stage.'
    },
    {
      q: 'Is there a strict requirement to reside in Spain for 183 days per year?',
      a: 'No. Law 14/2013 provides statutory physical presence flexibility. Entrepreneurs and executives are not required to spend 183 days in Spain to renew their residence permit, provided the company maintains genuine operational substance and fulfills Spanish corporate obligations.'
    },
    {
      q: 'Can multiple investors or business partners obtain residency through one company?',
      a: 'Yes. The corporate structure can be syndicated among up to 3–4 qualifying co-founders/partners who hold significant equity and executive roles, enabling coordinated residency applications supported by a unified ENISA business plan.'
    },
    {
      q: 'What are the post-acquisition obligations to maintain the company active?',
      a: 'The company must maintain genuine economic substance (consulting, trading, services), conduct recurring invoicing, file timely corporate tax returns (IVA / Impuesto de Sociedades), and register its director under the appropriate Social Security regime.'
    },
    {
      q: 'Can the entire acquisition and initial filing be executed remotely?',
      a: 'Yes. Initial procedures—including NIE issuance, notarial share purchase, and ENISA/UGE-CE submissions—can be completed via a specific consular or apostilled Power of Attorney. The investor only needs to travel to Spain for the physical biometric fingerprint appointment to collect the residency card (TIE).'
    }
  ];

  return (
    <div className="spain-residency-specs">
      {/* ── 1. Hero Header & Quick-Fact Pills ── */}
      <div className="spain-residency-header">
        <div className="spain-residency-badge-row">
          <span className="spain-res-pill spain-res-pill-gold">
            <Scale size={13} />
            Spanish Statutory Law 14/2013
          </span>
          <span className="spain-res-pill spain-res-pill-blue">
            <Building2 size={13} />
            100% S.L. Corporate Ownership
          </span>
          <span className="spain-res-pill spain-res-pill-green">
            <ShieldCheck size={13} />
            3-Year Initial Residence
          </span>
          <span className="spain-res-pill spain-res-pill-purple">
            <Globe2 size={13} />
            29 Schengen Countries Free Mobility
          </span>
        </div>
      </div>

      {/* ── 2. Graphical Schengen Mobility Radar & Key Metrics ── */}
      <div className="spain-visual-radar-card">
        <div className="spain-radar-visual">
          <div className="spain-radar-circle outer"></div>
          <div className="spain-radar-circle middle"></div>
          <div className="spain-radar-circle inner"></div>
          
          <div className="spain-radar-center-hub">
            <span className="spain-hub-flag">🇪🇸</span>
            <span className="spain-hub-name">SPAIN</span>
            <span className="spain-hub-sub">Corporate Hub</span>
          </div>

          <div className="spain-radar-node node-paris">
            <span className="node-flag">🇫🇷</span>
            <span className="node-city">Paris</span>
          </div>
          <div className="spain-radar-node node-berlin">
            <span className="node-flag">🇩🇪</span>
            <span className="node-city">Frankfurt</span>
          </div>
          <div className="spain-radar-node node-milan">
            <span className="node-flag">🇮🇹</span>
            <span className="node-city">Milan</span>
          </div>
          <div className="spain-radar-node node-amsterdam">
            <span className="node-flag">🇳🇱</span>
            <span className="node-city">Amsterdam</span>
          </div>
          <div className="spain-radar-node node-zurich">
            <span className="node-flag">🇨🇭</span>
            <span className="node-city">Zurich</span>
          </div>
        </div>

        <div className="spain-radar-metrics">
          <div className="spain-metric-box">
            <span className="spain-metric-val">29</span>
            <span className="spain-metric-lbl">Schengen Countries</span>
            <span className="spain-metric-sub">Zero border controls</span>
          </div>
          <div className="spain-metric-box">
            <span className="spain-metric-val">3 Yrs</span>
            <span className="spain-metric-lbl">Initial Permit</span>
            <span className="spain-metric-sub">Renewable +2 years</span>
          </div>
          <div className="spain-metric-box">
            <span className="spain-metric-val">20 Days</span>
            <span className="spain-metric-lbl">UGE Resolution</span>
            <span className="spain-metric-sub">Statutory legal window</span>
          </div>
          <div className="spain-metric-box">
            <span className="spain-metric-val">100%</span>
            <span className="spain-metric-lbl">Legal Ownership</span>
            <span className="spain-metric-sub">Clean notarial deed</span>
          </div>
        </div>
      </div>

      {/* ── 3. Interactive Blueprint & Strategy Simulator ── */}
      <div className="spain-simulator-card">
        <div className="spain-sim-header">
          <div className="spain-sim-header-title">
            <Compass className="spain-sim-icon" size={22} />
            <div>
              <h3 className="spain-section-title">Interactive Residency Blueprint Builder</h3>
              <p className="spain-section-desc">Select your operational parameters to preview the tailored legal architecture</p>
            </div>
          </div>
          <span className="spain-sim-status-pill">
            <BadgeCheck size={14} /> Law 14/2013 Aligned
          </span>
        </div>

        <div className="spain-sim-selectors-grid">
          {/* Selector 1: Applicant Profile */}
          <div className="spain-sim-selector-group">
            <label className="spain-sim-label">1. Applicant Structure</label>
            <div className="spain-sim-pills-row">
              <button
                type="button"
                className={`spain-sim-pill-btn ${profileType === 'single' ? 'active' : ''}`}
                onClick={() => setProfileType('single')}
              >
                Single Entrepreneur
              </button>
              <button
                type="button"
                className={`spain-sim-pill-btn ${profileType === 'founders' ? 'active' : ''}`}
                onClick={() => setProfileType('founders')}
              >
                2–4 Co-Founders
              </button>
              <button
                type="button"
                className={`spain-sim-pill-btn ${profileType === 'family' ? 'active' : ''}`}
                onClick={() => setProfileType('family')}
              >
                Family Unit (Spouse & Kids)
              </button>
            </div>
          </div>

          {/* Selector 2: Business Model */}
          <div className="spain-sim-selector-group">
            <label className="spain-sim-label">2. Target Commercial Model</label>
            <div className="spain-sim-pills-row">
              <button
                type="button"
                className={`spain-sim-pill-btn ${businessModel === 'consulting' ? 'active' : ''}`}
                onClick={() => setBusinessModel('consulting')}
              >
                International Consulting
              </button>
              <button
                type="button"
                className={`spain-sim-pill-btn ${businessModel === 'trade' ? 'active' : ''}`}
                onClick={() => setBusinessModel('trade')}
              >
                Import/Export & Distribution
              </button>
              <button
                type="button"
                className={`spain-sim-pill-btn ${businessModel === 'health' ? 'active' : ''}`}
                onClick={() => setBusinessModel('health')}
              >
                Health & Longevity
              </button>
              <button
                type="button"
                className={`spain-sim-pill-btn ${businessModel === 'holding' ? 'active' : ''}`}
                onClick={() => setBusinessModel('holding')}
              >
                Corporate Holding
              </button>
            </div>
          </div>

          {/* Selector 3: Physical Presence Preference */}
          <div className="spain-sim-selector-group">
            <label className="spain-sim-label">3. Physical Presence Preference</label>
            <div className="spain-sim-pills-row">
              <button
                type="button"
                className={`spain-sim-pill-btn ${physicalStay === 'flexible' ? 'active' : ''}`}
                onClick={() => setPhysicalStay('flexible')}
              >
                Frequent Traveler (&lt;183 Days in Spain)
              </button>
              <button
                type="button"
                className={`spain-sim-pill-btn ${physicalStay === 'full' ? 'active' : ''}`}
                onClick={() => setPhysicalStay('full')}
              >
                Full Relocation (&gt;183 Days in Spain)
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Blueprint Summary Box */}
        <div className="spain-sim-blueprint-display">
          <div className="spain-blueprint-header">
            <span className="spain-blueprint-tag">Tailored Legal Strategy</span>
            <h4 className="spain-blueprint-title">Configured Roadmap Specifications</h4>
          </div>

          <div className="spain-blueprint-items-grid">
            <div className="spain-bp-item">
              <span className="spain-bp-lbl">Permit Duration</span>
              <span className="spain-bp-val">{blueprint.permitDuration}</span>
            </div>
            <div className="spain-bp-item">
              <span className="spain-bp-lbl">Applicants Covered</span>
              <span className="spain-bp-val">{blueprint.applicantsCovered}</span>
            </div>
            <div className="spain-bp-item">
              <span className="spain-bp-lbl">Remote Execution</span>
              <span className="spain-bp-val">{blueprint.remoteExecution}</span>
            </div>
            <div className="spain-bp-item">
              <span className="spain-bp-lbl">ENISA Submission Strategy</span>
              <span className="spain-bp-val">{blueprint.enisaFocus}</span>
            </div>
            <div className="spain-bp-item span-full">
              <span className="spain-bp-lbl">Physical Presence Status</span>
              <span className="spain-bp-val highlight">{blueprint.physicalStayNotice}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Visual 4-Stage Milestone Roadmap ── */}
      <div className="spain-roadmap-section">
        <div className="spain-roadmap-header">
          <div className="spain-roadmap-header-left">
            <Calendar className="spain-header-icon" size={22} />
            <div>
              <h3 className="spain-section-title">Visual 4-Stage Turnkey Milestones</h3>
              <p className="spain-section-desc">Statutory execution progression from Day 1 notarial deed to TIE card collection</p>
            </div>
          </div>
          <span className="spain-timeline-badge">
            <Clock size={14} /> Total Timeline: 8 – 12 Weeks
          </span>
        </div>

        <div className="spain-roadmap-cards-grid">
          {milestones.map((m, idx) => {
            const IconComponent = m.icon;
            return (
              <div key={idx} className={`spain-milestone-card border-${m.color}`}>
                <div className="spain-ms-top">
                  <div className={`spain-ms-icon-wrap ${m.color}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="spain-ms-timing">
                    <span className="spain-ms-step">STAGE {m.step}</span>
                    <span className="spain-ms-days">{m.dayRange}</span>
                  </div>
                </div>

                <span className={`spain-ms-badge ${m.color}`}>{m.badge}</span>
                <h4 className="spain-ms-title">{m.title}</h4>

                <ul className="spain-ms-points">
                  {m.points.map((pt, pIdx) => (
                    <li key={pIdx}>
                      <CheckCircle2 size={14} className="spain-point-check" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Visual DOs vs. DON'Ts Best Practice Matrix ── */}
      <div className="spain-dodont-section">
        <div className="spain-dodont-header">
          <h3 className="spain-section-title">Strategic Best Practices Matrix</h3>
          <p className="spain-section-desc">Key operational rules to ensure rapid approval and seamless renewals</p>
        </div>

        <div className="spain-dodont-grid">
          {/* DOs Card */}
          <div className="spain-dodont-col do">
            <div className="spain-dodont-col-header">
              <span className="spain-dodont-badge do">
                <Check size={14} /> RECOMMENDED
              </span>
              <h4 className="spain-dodont-title">What You Should Do</h4>
            </div>
            <ul className="spain-dodont-list">
              <li>
                <Check className="spain-icon-do" size={18} />
                <div>
                  <strong>Acquire 100% of an Existing S.L.:</strong>
                  <span>Gain instant access to active tax CIF and established history without 6+ month delays.</span>
                </div>
              </li>
              <li>
                <Check className="spain-icon-do" size={18} />
                <div>
                  <strong>Execute Remotely via Consular PoA:</strong>
                  <span>Complete NIE procurement, notarial deed, and government filings before traveling to Spain.</span>
                </div>
              </li>
              <li>
                <Check className="spain-icon-do" size={18} />
                <div>
                  <strong>Maintain Demonstrable Commercial Substance:</strong>
                  <span>Generate recurring invoices, commercial contracts, and proper corporate tax filings.</span>
                </div>
              </li>
              <li>
                <Check className="spain-icon-do" size={18} />
                <div>
                  <strong>Include Family Members Concurrently:</strong>
                  <span>Spouses and dependent children receive immediate legal residence and work authorization.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* DON'Ts Card */}
          <div className="spain-dodont-col dont">
            <div className="spain-dodont-col-header">
              <span className="spain-dodont-badge dont">
                <X size={14} /> AVOID
              </span>
              <h4 className="spain-dodont-title">Common Pitfalls to Avoid</h4>
            </div>
            <ul className="spain-dodont-list">
              <li>
                <X className="spain-icon-dont" size={18} />
                <div>
                  <strong>Don&apos;t Incorporate Ex Novo from Zero:</strong>
                  <span>Avoid getting caught in 6–9 month provisional tax and anti-money-laundering bank account traps.</span>
                </div>
              </li>
              <li>
                <X className="spain-icon-dont" size={18} />
                <div>
                  <strong>Don&apos;t Leave the Company Dormant:</strong>
                  <span>A company with zero financial movement or substance creates high rejection risk upon renewal.</span>
                </div>
              </li>
              <li>
                <X className="spain-icon-dont" size={18} />
                <div>
                  <strong>Don&apos;t Confuse with the General Immigration Law:</strong>
                  <span>General visas strictly cancel permits if absent &gt;183 days; Law 14/2013 grants statutory travel flexibility.</span>
                </div>
              </li>
              <li>
                <X className="spain-icon-dont" size={18} />
                <div>
                  <strong>Don&apos;t Use Insurance with Co-Payments:</strong>
                  <span>Spanish immigration strictly rejects policies with co-payments (copagos) or hospital exclusions.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── 6. Interactive FAQ Accordion ── */}
      <div className="spain-residency-faq-section">
        <div className="spain-faq-header">
          <HelpCircle className="spain-header-icon" size={22} />
          <div>
            <h3 className="spain-section-title">Frequently Asked Questions</h3>
            <p className="spain-section-desc">Key legal, corporate, and operational guidance for international investors</p>
          </div>
        </div>

        <div className="spain-faq-accordion">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className={`spain-faq-card ${isOpen ? 'active' : ''}`}>
                <button
                  type="button"
                  className="spain-faq-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <span className="spain-faq-question">{faq.q}</span>
                  <span className="spain-faq-chevron">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="spain-faq-body">
                    <p className="spain-faq-answer">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. Call to Action / Diagnostic Banner ── */}
      <div className="spain-residency-cta-banner">
        <div className="spain-cta-content">
          <Sparkles className="spain-cta-icon" size={28} />
          <div>
            <h4 className="spain-cta-title">Request a Confidential Diagnostic Review</h4>
            <p className="spain-cta-desc">
              Schedule an executive consultation with qualified corporate and immigration counsel to evaluate your business model, verify target company availability, and structure your fast-track European residency file.
            </p>
          </div>
        </div>
        <div className="spain-cta-action">
          <button
            type="button"
            className="spain-cta-button"
            onClick={() => {
              if (typeof onOpenInquiry === 'function') {
                onOpenInquiry();
              } else {
                const drawerBtn = document.querySelector('[data-action="open-inquiry"]');
                if (drawerBtn) drawerBtn.click();
              }
            }}
          >
            <span>Schedule Diagnostic Consultation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
