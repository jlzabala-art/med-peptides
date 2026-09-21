/**
 * src/components/product/SpainCompanyResidencyTechnicalSpecs.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive & Responsive Technical Specification, Roadmap Stepper & Legal FAQ
 * for Spanish Corporate Acquisition & Law 14/2013 Entrepreneur Residence.
 * Optimized for Mobile, iPad, and Laptop displays.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState } from 'react';
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
  ExternalLink,
  HelpCircle,
  Scale,
  Check,
  AlertCircle
} from 'lucide-react';
import './SpainCompanyResidencyTechnicalSpecs.css';

export default function SpainCompanyResidencyTechnicalSpecs({
  product,
  lang = 'en',
  onOpenInquiry
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const phases = [
    {
      step: '01',
      phase: 'Phase 1',
      title: '100% Corporate Acquisition & Notarial Transfer',
      timeframe: 'Weeks 1 – 3',
      description: 'Acquisition of 100% share capital of an existing, debt-free Spanish S.L. with clean balance sheets.',
      deliverables: [
        'Foreigner Identity Number (NIE) procurement via consular/notarial PoA',
        'Notarial Share Purchase Deed (Escritura Pública de Compraventa)',
        'Commercial Registry filing (Registro Mercantil) & Sole Administrator appointment',
        'Tax & Social Security Good Standing Clearance Certificates (AEAT & TGSS)',
        'Beneficial Ownership Declaration (Acta de Titularidad Real) & D-1A Investment Filing'
      ]
    },
    {
      step: '02',
      phase: 'Phase 2',
      title: 'Business Plan & ENISA Strategic Accreditation',
      timeframe: 'Weeks 4 – 7',
      description: 'Structuring and digital submission of the 3-to-5 year strategic business projection.',
      deliverables: [
        'Formulation of the 3-to-5 year financial model & economic substance justification',
        'Framing of innovation, commercial impact, and job-creation criteria',
        'Direct filing via the official ENISA digital platform (Ministry of Industry)',
        'Legal tracking and proactive technical defense with ENISA evaluators'
      ]
    },
    {
      step: '03',
      phase: 'Phase 3',
      title: 'UGE-CE Fast-Track Filing & TIE Card Issuance',
      timeframe: 'Weeks 8 – 12',
      description: 'Expedited application before the Unidad de Grandes Empresas with 20-day statutory window.',
      deliverables: [
        'Simultaneous submission before the UGE-CE (Ministry of Inclusion & Migration)',
        'Statutory 20-working-day administrative resolution window under Law 14/2013',
        'Official 3-Year Residence & Work Authorization resolution issued',
        'Biometric fingerprint appointment concierge for Foreigner Identity Card (TIE)'
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
      {/* ── 1. Hero Summary & Badges ── */}
      <div className="spain-residency-header">
        <div className="spain-residency-badge-row">
          <span className="spain-res-pill spain-res-pill-gold">
            <Scale size={13} />
            Spanish Law 14/2013
          </span>
          <span className="spain-res-pill spain-res-pill-blue">
            <Building2 size={13} />
            100% S.L. Share Capital
          </span>
          <span className="spain-res-pill spain-res-pill-green">
            <ShieldCheck size={13} />
            3-Year Initial Residence
          </span>
          <span className="spain-res-pill spain-res-pill-purple">
            <Globe2 size={13} />
            29 Schengen Countries
          </span>
        </div>

        <h2 className="spain-residency-title">
          Turnkey Spanish Corporate Acquisition & Law 14/2013 Fast-Track Residence
        </h2>
        <p className="spain-residency-subtitle">
          Accelerated European residency framework through the direct notarial acquisition of 100% of an existing, compliant Spanish Limited Liability Company (S.L.), backed by ENISA strategic accreditation and expedited UGE-CE adjudication.
        </p>
      </div>

      {/* ── 2. Strategic Comparison Grid (Acquisition vs New Entity) ── */}
      <div className="spain-residency-comparison-box">
        <div className="spain-comparison-header">
          <h3 className="spain-comparison-title">Strategic Pathway Comparison</h3>
          <span className="spain-comparison-note">Why 100% Acquisition outpaces new incorporation</span>
        </div>
        <div className="spain-comparison-grid">
          <div className="spain-comparison-col spain-comparison-highlight">
            <div className="spain-col-header">
              <span className="spain-col-tag spain-tag-recommended">Recommended Turnkey Pathway</span>
              <h4 className="spain-col-title">100% Acquisition of Existing S.L.</h4>
            </div>
            <ul className="spain-col-list">
              <li>
                <Check className="spain-icon-check" size={16} />
                <span><strong>Immediate Legal Vehicle:</strong> Active NIF/CIF, commercial history, and verified good standing.</span>
              </li>
              <li>
                <Check className="spain-icon-check" size={16} />
                <span><strong>Fast-Track Timeline:</strong> Visa & residency application ready in <strong>3–4 weeks</strong>.</span>
              </li>
              <li>
                <Check className="spain-icon-check" size={16} />
                <span><strong>Higher ENISA Acceptance:</strong> Evaluated on an active entity with real corporate substance.</span>
              </li>
              <li>
                <Check className="spain-icon-check" size={16} />
                <span><strong>Banking Readiness:</strong> Existing corporate banking framework already established in Spain.</span>
              </li>
            </ul>
          </div>

          <div className="spain-comparison-col spain-comparison-standard">
            <div className="spain-col-header">
              <span className="spain-col-tag spain-tag-delayed">Traditional Slow Track</span>
              <h4 className="spain-col-title">New Company Incorporation Ex Novo</h4>
            </div>
            <ul className="spain-col-list">
              <li>
                <AlertCircle className="spain-icon-alert" size={16} />
                <span><strong>Lengthy Setup:</strong> 6 to 9 months before an immigration file can even be lodged.</span>
              </li>
              <li>
                <AlertCircle className="spain-icon-alert" size={16} />
                <span><strong>Banking Friction:</strong> Severe AML verification delays for non-resident startup accounts.</span>
              </li>
              <li>
                <AlertCircle className="spain-icon-alert" size={16} />
                <span><strong>Theoretical Risk:</strong> ENISA evaluates a paper project with zero operating track record.</span>
              </li>
              <li>
                <AlertCircle className="spain-icon-alert" size={16} />
                <span><strong>Complex Red Tape:</strong> Multiple interdependent steps with high vulnerability to delays.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── 3. The 3-Phase Execution Roadmap ── */}
      <div className="spain-residency-roadmap-section">
        <div className="spain-roadmap-header">
          <div className="spain-roadmap-header-left">
            <Calendar className="spain-header-icon" size={20} />
            <div>
              <h3 className="spain-section-title">The 3-Phase Turnkey Roadmap</h3>
              <p className="spain-section-desc">From initial NIE procurement to TIE biometric card issuance</p>
            </div>
          </div>
          <span className="spain-timeline-badge">
            <Clock size={14} /> Total Timeline: 8 – 12 Weeks
          </span>
        </div>

        <div className="spain-roadmap-grid">
          {phases.map((p, idx) => (
            <div key={idx} className="spain-roadmap-card">
              <div className="spain-roadmap-card-top">
                <span className="spain-step-number">{p.step}</span>
                <span className="spain-step-time">{p.timeframe}</span>
              </div>
              <h4 className="spain-step-title">{p.title}</h4>
              <p className="spain-step-desc">{p.description}</p>
              <div className="spain-step-deliverables">
                <span className="spain-deliv-label">Key Deliverables:</span>
                <ul>
                  {p.deliverables.map((d, dIdx) => (
                    <li key={dIdx}>
                      <CheckCircle2 size={13} className="spain-deliv-check" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Key Statutory Rights & Mobility ── */}
      <div className="spain-residency-benefits-section">
        <h3 className="spain-section-title">Key Statutory Rights & Legal Privileges</h3>
        <p className="spain-section-desc">Regulated under Spanish Law 14/2013 on Entrepreneur Support</p>

        <div className="spain-benefits-grid">
          <div className="spain-benefit-item">
            <div className="spain-benefit-icon-wrapper gold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="spain-benefit-title">3-Year Initial Residence</h4>
              <p className="spain-benefit-text">Direct 3-year authorization issued by UGE-CE, renewable for 2-year terms toward 5-year Permanent EU Residency.</p>
            </div>
          </div>

          <div className="spain-benefit-item">
            <div className="spain-benefit-icon-wrapper blue">
              <Globe2 size={20} />
            </div>
            <div>
              <h4 className="spain-benefit-title">29 Schengen Countries Free Mobility</h4>
              <p className="spain-benefit-text">Full visa-free transit across all European Schengen Area member states without applying for tourist visas.</p>
            </div>
          </div>

          <div className="spain-benefit-item">
            <div className="spain-benefit-icon-wrapper green">
              <Briefcase size={20} />
            </div>
            <div>
              <h4 className="spain-benefit-title">Full Work & Self-Employment Rights</h4>
              <p className="spain-benefit-text">Unrestricted authorization to operate as an executive, director, self-employed entrepreneur, or salaried professional.</p>
            </div>
          </div>

          <div className="spain-benefit-item">
            <div className="spain-benefit-icon-wrapper purple">
              <Users size={20} />
            </div>
            <div>
              <h4 className="spain-benefit-title">Concurrent Family Inclusion</h4>
              <p className="spain-benefit-text">Spouses, legal civil partners, and dependent children receive simultaneous residence permits with full work rights.</p>
            </div>
          </div>

          <div className="spain-benefit-item">
            <div className="spain-benefit-icon-wrapper teal">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="spain-benefit-title">Flexible Physical Presence</h4>
              <p className="spain-benefit-text">No strict 183-day annual physical stay required to renew permits, provided Spanish corporate substance is maintained.</p>
            </div>
          </div>

          <div className="spain-benefit-item">
            <div className="spain-benefit-icon-wrapper red">
              <Landmark size={20} />
            </div>
            <div>
              <h4 className="spain-benefit-title">Full 100% Equity Ownership</h4>
              <p className="spain-benefit-text">Total ownership of the Spanish entity with certified clean balance sheet, zero tax liabilities, and verified AEAT/TGSS clearance.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Frequently Asked Questions (Accordion) ── */}
      <div className="spain-residency-faq-section">
        <div className="spain-faq-header">
          <HelpCircle className="spain-header-icon" size={20} />
          <div>
            <h3 className="spain-section-title">Frequently Asked Questions</h3>
            <p className="spain-section-desc">Key legal, operational, and practical guidance for investors and partners</p>
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

      {/* ── 6. Call to Action / Diagnostic Banner ── */}
      <div className="spain-residency-cta-banner">
        <div className="spain-cta-content">
          <Sparkles className="spain-cta-icon" size={26} />
          <div>
            <h4 className="spain-cta-title">Request a Confidential Diagnostic Review</h4>
            <p className="spain-cta-desc">
              Schedule an executive consultation with qualified corporate and immigration counsel to verify candidate eligibility, family composition, and target company availability.
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
            <span>Schedule Consultation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
