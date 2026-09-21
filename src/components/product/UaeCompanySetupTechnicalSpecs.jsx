/**
 * src/components/product/UaeCompanySetupTechnicalSpecs.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Discovery Questionnaire & Technical Specification Engine
 * for UAE Corporate Formation, Residency Visas & Banking Concierge.
 * Based on the 11-section UAE Client Discovery Questionnaire.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  ShieldCheck,
  CreditCard,
  FileCheck2,
  Users,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Clock,
  Landmark,
  Stethoscope,
  Globe2,
  Send,
  Download,
  Check
} from 'lucide-react';
import './UaeCompanySetupTechnicalSpecs.css';

export default function UaeCompanySetupTechnicalSpecs({
  product,
  lang = 'en',
  onOpenInquiry
}) {
  // Step State for the 5-step questionnaire
  const [currentStep, setCurrentStep] = useState(1);

  // Form State corresponding to the Discovery Questionnaire PDF
  const [answers, setAnswers] = useState({
    businessActivity: 'consulting', // 'consulting' | 'trading' | 'clinic' | 'holding'
    targetMarket: 'cross_border',   // 'cross_border' | 'uae_domestic' | 'hybrid'
    jurisdiction: 'dubai_freezone', // 'dubai_freezone' | 'dmcc' | 'mainland_ded'
    visasNeeded: 1,                 // 0 | 1 | 2 | 3
    vipMedical: true,
    bankingType: 'wio_tier1',       // 'wio_fintech' | 'wio_tier1' | 'full_tier1'
    taxVatAdvisory: true,
    officeType: 'flexi_desk'        // 'flexi_desk' | 'dedicated_office' | 'clinic_facility'
  });

  // Handle option select
  const handleSelect = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  // Derived Recommendation Engine based on Answers
  const recommendation = useMemo(() => {
    let basePriceAed = 12500;
    let packageName = 'Freezone Commercial License (0 Visas)';
    let jurisdictionName = 'IFZA / Meydan Free Zone (Dubai)';
    let visaCount = answers.visasNeeded;
    let recommendedPkgId = 'uae-setup-freezone-starter';

    if (answers.businessActivity === 'clinic') {
      basePriceAed = 48000;
      packageName = 'Healthcare & Longevity Clinic Setup (DHA / MOHAP)';
      jurisdictionName = 'Dubai Mainland (DED) & Dubai Healthcare City';
      recommendedPkgId = 'uae-setup-medical-clinic';
    } else if (answers.businessActivity === 'holding' || (answers.targetMarket === 'cross_border' && answers.visasNeeded >= 2)) {
      basePriceAed = 32000;
      packageName = 'International Trading & Holding Structure';
      jurisdictionName = 'DMCC Dubai / IFZA Free Zone';
      recommendedPkgId = 'uae-setup-holding-trading';
    } else if (answers.visasNeeded >= 1) {
      basePriceAed = 21900 + (answers.visasNeeded - 1) * 7500;
      packageName = `Executive Investor Package (${answers.visasNeeded} Visa${answers.visasNeeded > 1 ? 's' : ''} + Emirates ID VIP)`;
      jurisdictionName = 'Meydan / IFZA Dubai Free Zone';
      recommendedPkgId = 'uae-setup-investor-residency';
    } else {
      basePriceAed = 12500;
      packageName = 'Freezone Commercial License (0 Visas)';
      jurisdictionName = 'IFZA Dubai Free Zone';
      recommendedPkgId = 'uae-setup-freezone-starter';
    }

    const priceUsd = Math.round(basePriceAed / 3.6725);

    return {
      priceAed: basePriceAed,
      priceUsd,
      packageName,
      jurisdictionName,
      visaCount,
      recommendedPkgId,
      turnaround: answers.businessActivity === 'clinic' ? '15 - 25 Business Days' : '5 - 10 Business Days'
    };
  }, [answers]);

  // Packages list from product variants or default high-end offerings
  const packages = useMemo(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants;
    }
    return [
      {
        id: 'uae-setup-freezone-starter',
        name: 'Freezone Commercial License (0 Visas)',
        price_aed: 12500,
        price_usd: 3400,
        deliverables: [
          'Official Trade License (1 Year Validity)',
          'Memorandum of Association (MoA) & Articles of Incorporation',
          'Registered Address & Virtual Flexi-Desk Lease',
          'Federal Tax Authority (FTA) Corporate Tax Registration',
          'Certificate of Incorporation & Share Registry'
        ]
      },
      {
        id: 'uae-setup-investor-residency',
        name: 'Executive Investor Package (1 Visa + Emirates ID)',
        price_aed: 21900,
        price_usd: 5960,
        isPopular: true,
        deliverables: [
          'Commercial Trade License (1 Year Validity)',
          'Immigration Establishment Card (ICP / GDRFA)',
          '2-Year UAE Investor / Partner Residency Visa',
          'VIP Fast-Track Medical Fitness Blood & X-Ray Examination',
          'VIP Emirates ID Biometrics Appointment & Express Delivery',
          'Corporate Bank Account Assistance (Wio Business / Emirates NBD)'
        ]
      },
      {
        id: 'uae-setup-holding-trading',
        name: 'International Trading & Holding Structure',
        price_aed: 32000,
        price_usd: 8700,
        deliverables: [
          'Holding & General Trading Dual-Activity License',
          'Dubai Customs Code & Importer/Exporter Permitting',
          '2 UAE Investor Residency Visas (2 Years)',
          'Multi-Currency Tier-1 Banking (AED, USD, EUR, GBP)',
          'Transfer Pricing & Economic Substance (ESR) Governance'
        ]
      },
      {
        id: 'uae-setup-medical-clinic',
        name: 'Healthcare & Longevity Clinic Setup (DHA / MOHAP)',
        price_aed: 48000,
        price_usd: 13000,
        deliverables: [
          'DHA / MOHAP Initial Regulatory Approvals',
          'Commercial Clinical Facility Trade License',
          'Clinic Floor Plan Layout Regulatory Vetting',
          'Medical Director & Clinical Staff Licensing Advisory',
          'Local Healthcare Compliance & Civil Defense Permitting'
        ]
      }
    ];
  }, [product]);

  // Construct inquiry message
  const handleInquireNow = () => {
    const summaryText = `*UAE Corporate Formation Discovery Inquiry*%0A%0A` +
      `• *Recommended Package:* ${recommendation.packageName}%0A` +
      `• *Jurisdiction:* ${recommendation.jurisdictionName}%0A` +
      `• *Activity:* ${answers.businessActivity}%0A` +
      `• *Visas Needed:* ${answers.visasNeeded}%0A` +
      `• *Banking Setup:* ${answers.bankingType}%0A` +
      `• *Estimated Investment:* ${recommendation.priceAed.toLocaleString()} AED ($${recommendation.priceUsd.toLocaleString()} USD)%0A%0A` +
      `I would like to proceed with the legal onboarding consultation and review required documents.`;

    if (onOpenInquiry) {
      onOpenInquiry(summaryText);
    } else {
      window.open(`https://wa.me/34611082186?text=${summaryText}`, '_blank');
    }
  };

  return (
    <div className="uae-specs-container">
      {/* ── Top Hero Card ── */}
      <div className="uae-hero-card">
        <div className="uae-hero-header">
          <div className="uae-hero-title-area">
            <div className="uae-hero-badge">
              <Sparkles size={12} />
              <span>UAE Ministry of Economy & Free Zone Standard</span>
            </div>
            <h2 className="uae-hero-title">
              {lang === 'es' ? 'Constitución de Empresa en EAU & Residencia Fiscal' : 'UAE Corporate Structuring, Golden Visa & Banking Concierge'}
            </h2>
            <p className="uae-hero-subtitle">
              {lang === 'es'
                ? 'Servicio integral de constitución jurídica, obtención de visados de inversor/socio, Emirates ID y apertura de cuentas bancarias corporativas multisede en Dubái y Abu Dabi.'
                : 'Turnkey corporate incorporation across premier Dubai Free Zones and Mainland. Guaranteed 100% foreign ownership, 0% personal tax, expedited investor visas, and guaranteed tier-1 corporate banking onboarding.'}
            </p>
          </div>
        </div>

        <div className="uae-hero-pills">
          <div className="uae-pill-item">
            <ShieldCheck size={16} />
            <span>100% Foreign Ownership (No Local Sponsor)</span>
          </div>
          <div className="uae-pill-item">
            <Landmark size={16} />
            <span>0% Personal Tax & 140+ Tax Treaties</span>
          </div>
          <div className="uae-pill-item">
            <CreditCard size={16} />
            <span>Multi-Currency IBAN (AED, USD, EUR, GBP)</span>
          </div>
          <div className="uae-pill-item">
            <Clock size={16} />
            <span>Turnkey Execution in 5 to 10 Days</span>
          </div>
        </div>
      </div>

      {/* ── Discovery Questionnaire Box ── */}
      <div className="uae-wizard-card">
        <div className="uae-wizard-header">
          <div className="uae-wizard-heading-group">
            <div className="uae-wizard-icon-wrap">
              <Building2 size={22} />
            </div>
            <div>
              <h3 className="uae-wizard-title">
                {lang === 'es' ? 'Cuestionario de Diagnóstico Corporativo Interactivo' : 'Interactive Client Discovery Questionnaire'}
              </h3>
              <p className="uae-wizard-desc">
                {lang === 'es'
                  ? 'Complete este análisis guiado para determinar la jurisdicción óptima, requisitos de visado y estructura fiscal.'
                  : 'Tailor your UAE corporate jurisdiction, visa quota, and banking requirements based on the official 11-section advisory checklist.'}
              </p>
            </div>
          </div>
        </div>

        {/* Stepper Tabs */}
        <div className="uae-stepper-bar">
          {[
            { step: 1, name: lang === 'es' ? '1. Actividad' : '1. Business Scope', sub: 'Sector & Trade' },
            { step: 2, name: lang === 'es' ? '2. Jurisdicción' : '2. Jurisdiction', sub: 'Freezone / Mainland' },
            { step: 3, name: lang === 'es' ? '3. Visados' : '3. Visas & Residency', sub: 'Emirates ID & VIP' },
            { step: 4, name: lang === 'es' ? '4. Banca' : '4. Corporate Banking', sub: 'IBAN & Currency' },
            { step: 5, name: lang === 'es' ? '5. Diagnóstico' : '5. Assessment', sub: 'Custom Proposal' }
          ].map(tab => {
            const isCompleted = currentStep > tab.step;
            const isActive = currentStep === tab.step;
            return (
              <button
                key={tab.step}
                type="button"
                className={`uae-step-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setCurrentStep(tab.step)}
              >
                <div className="uae-step-number">
                  {isCompleted ? <Check size={14} /> : tab.step}
                </div>
                <div className="uae-step-text">
                  <span className="uae-step-name">{tab.name}</span>
                  <span className="uae-step-sub">{tab.sub}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Wizard Step Body */}
        <div className="uae-wizard-body">
          {/* STEP 1: Business Activity & Scope */}
          {currentStep === 1 && (
            <div>
              <h4 className="uae-question-title">
                {lang === 'es' ? 'Paso 1: ¿Cuál es la actividad comercial principal de su empresa?' : 'Step 1: What is the primary commercial activity of your venture?'}
              </h4>
              <p className="uae-question-help">
                {lang === 'es'
                  ? 'La actividad determina el tipo de licencia comercial (Servicios, Comercio General o Salud Regulada) y las autoridades competentes.'
                  : 'Commercial activities dictate the licensing authority, qualification for 0% Free Zone tax status, and local municipal approvals.'}
              </p>

              <div className="uae-options-grid">
                {[
                  {
                    id: 'consulting',
                    icon: Briefcase,
                    title: 'Management & Tech Consulting',
                    desc: 'Advisory, software, marketing, clinical consulting, and remote professional services. Fast 100% digital issuance.'
                  },
                  {
                    id: 'trading',
                    icon: Globe2,
                    title: 'General Trading & E-commerce',
                    desc: 'Cross-border import/export, physical goods distribution, and peptide/supplement wholesale across global markets.'
                  },
                  {
                    id: 'clinic',
                    icon: Stethoscope,
                    title: 'Healthcare & Longevity Clinic',
                    desc: 'Medical practice, wellness center, longevity clinic, and healthcare operations requiring DHA / MOHAP clearance.'
                  },
                  {
                    id: 'holding',
                    icon: Landmark,
                    title: 'Corporate Holding & IP Assets',
                    desc: 'Asset protection, wealth management, shareholding in international subsidiaries, royalties, and patent holdings.'
                  }
                ].map(opt => {
                  const isSel = answers.businessActivity === opt.id;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      className={`uae-option-card ${isSel ? 'selected' : ''}`}
                      onClick={() => handleSelect('businessActivity', opt.id)}
                    >
                      <div className="uae-option-card-header">
                        <div className="uae-option-icon">
                          <Icon size={18} />
                        </div>
                        <div className="uae-check-circle">
                          {isSel && <Check size={12} />}
                        </div>
                      </div>
                      <h5 className="uae-option-title">{opt.title}</h5>
                      <p className="uae-option-desc">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Jurisdiction & Operating Model */}
          {currentStep === 2 && (
            <div>
              <h4 className="uae-question-title">
                {lang === 'es' ? 'Paso 2: ¿Dónde operará y qué presencia física requiere?' : 'Step 2: Where will you operate and what physical footprint do you need?'}
              </h4>
              <p className="uae-question-help">
                {lang === 'es'
                  ? 'Las zonas francas (Free Zones) ofrecen máxima optimización fiscal y confidencialidad. Mainland es ideal para locales comerciales directos en EAU.'
                  : 'Free Zones provide 100% repatriation and 0% tax for foreign trade. Mainland (DED) is essential for local UAE street retail and domestic healthcare clinics.'}
              </p>

              <div className="uae-options-grid">
                {[
                  {
                    id: 'dubai_freezone',
                    icon: Building2,
                    title: 'Dubai Freezone (IFZA / Meydan)',
                    desc: 'Cost-effective, premier reputation, virtual flexi-desk included, fast bank account opening, and 0% tax on qualifying cross-border income.'
                  },
                  {
                    id: 'dmcc',
                    icon: Landmark,
                    title: 'DMCC Free Zone (JLT Dubai)',
                    desc: 'Global commodities, crypto, fintech and physical trade hub. Prestigious commercial address with worldwide financial recognition.'
                  },
                  {
                    id: 'mainland_ded',
                    icon: Globe2,
                    title: 'Dubai Mainland (DED License)',
                    desc: 'Direct trading across all 7 UAE Emirates without local distributor restrictions. Required for local clinical facilities and brick-and-mortar storefronts.'
                  }
                ].map(opt => {
                  const isSel = answers.jurisdiction === opt.id;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      className={`uae-option-card ${isSel ? 'selected' : ''}`}
                      onClick={() => handleSelect('jurisdiction', opt.id)}
                    >
                      <div className="uae-option-card-header">
                        <div className="uae-option-icon">
                          <Icon size={18} />
                        </div>
                        <div className="uae-check-circle">
                          {isSel && <Check size={12} />}
                        </div>
                      </div>
                      <h5 className="uae-option-title">{opt.title}</h5>
                      <p className="uae-option-desc">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Visas & UAE Residency */}
          {currentStep === 3 && (
            <div>
              <h4 className="uae-question-title">
                {lang === 'es' ? 'Paso 3: ¿Cuántos visados de residencia y Emirates ID necesita?' : 'Step 3: How many UAE Residency Visas & Emirates IDs do you require?'}
              </h4>
              <p className="uae-question-help">
                {lang === 'es'
                  ? 'Cada visado otorga 2 años de residencia legal como Inversor / Socio, acceso a cuentas bancarias personales y capacidad de patrocinar cónyuge e hijos.'
                  : 'Residency visas are issued for 2 years (renewable). Includes immigration entry permit, VIP medical blood test/X-ray, and express biometric Emirates ID.'}
              </p>

              <div className="uae-options-grid">
                {[
                  {
                    count: 0,
                    title: '0 Visas (Pure Holding / Non-Resident)',
                    desc: 'Best for international structuring where the founders do not intend to reside or spend time in the UAE.'
                  },
                  {
                    count: 1,
                    title: '1 Investor / Partner Visa (Solo Founder)',
                    desc: 'The most popular executive package. Includes VIP fast-track biometrics and full UAE residency status.'
                  },
                  {
                    count: 2,
                    title: '2 Visas (Founders / Business Partners)',
                    desc: 'Two resident investor visas with immigration establishment cards and multi-director banking authority.'
                  },
                  {
                    count: 3,
                    title: '3+ Visas (Executive Team & Family Sponsors)',
                    desc: 'Corporate quota for multiple executive partners, key clinical employees, or family dependent sponsorships.'
                  }
                ].map(opt => {
                  const isSel = answers.visasNeeded === opt.count;
                  return (
                    <div
                      key={opt.count}
                      className={`uae-option-card ${isSel ? 'selected' : ''}`}
                      onClick={() => handleSelect('visasNeeded', opt.count)}
                    >
                      <div className="uae-option-card-header">
                        <div className="uae-option-icon">
                          <Users size={18} />
                        </div>
                        <div className="uae-check-circle">
                          {isSel && <Check size={12} />}
                        </div>
                      </div>
                      <h5 className="uae-option-title">{opt.title}</h5>
                      <p className="uae-option-desc">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Corporate Banking & Tax Setup */}
          {currentStep === 4 && (
            <div>
              <h4 className="uae-question-title">
                {lang === 'es' ? 'Paso 4: Preferencia de Banca Corporativa & Fiscalidad' : 'Step 4: Corporate Banking Infrastructure & Tax Strategy'}
              </h4>
              <p className="uae-question-help">
                {lang === 'es'
                  ? 'Asistencia completa en la apertura de cuentas corporativas con IBAN propio en EAU en AED, USD, EUR y GBP con pasarelas de pago Stripe / Checkout.'
                  : 'We prepare compliance dossiers, business plans, and proof-of-business documentation for guaranteed acceptance by UAE commercial and digital banks.'}
              </p>

              <div className="uae-options-grid">
                {[
                  {
                    id: 'wio_fintech',
                    icon: CreditCard,
                    title: 'Wio Bank Business (Fast Digital Fintech)',
                    desc: 'Fastest opening (48h after Emirates ID). Full UAE IBAN, virtual corporate debit cards, multi-currency wallets, and Stripe integration.'
                  },
                  {
                    id: 'wio_tier1',
                    icon: Landmark,
                    title: 'Hybrid: Wio Business + Emirates NBD / Mashreq',
                    desc: 'Recommended setup: Immediate digital liquidity via Wio combined with Tier-1 traditional banking for high-value international wires.'
                  },
                  {
                    id: 'full_tier1',
                    icon: ShieldCheck,
                    title: 'Tier-1 Commercial Banking (ADCB / HSBC / FAB)',
                    desc: 'Dedicated private banker relationship for turnover > 2,000,000 AED/year, wealth management, and documentary letters of credit.'
                  }
                ].map(opt => {
                  const isSel = answers.bankingType === opt.id;
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      className={`uae-option-card ${isSel ? 'selected' : ''}`}
                      onClick={() => handleSelect('bankingType', opt.id)}
                    >
                      <div className="uae-option-card-header">
                        <div className="uae-option-icon">
                          <Icon size={18} />
                        </div>
                        <div className="uae-check-circle">
                          {isSel && <Check size={12} />}
                        </div>
                      </div>
                      <h5 className="uae-option-title">{opt.title}</h5>
                      <p className="uae-option-desc">{opt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Assessment & Custom Proposal */}
          {currentStep === 5 && (
            <div className="uae-result-box">
              <div className="uae-result-banner">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                    <Sparkles size={16} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Recommended Corporate Structure
                    </span>
                  </div>
                  <h4 className="uae-result-title">{recommendation.packageName}</h4>
                  <p className="uae-result-sub">
                    Optimal Jurisdiction: <strong>{recommendation.jurisdictionName}</strong> · Turnaround: <strong>{recommendation.turnaround}</strong>
                  </p>
                </div>
                <div className="uae-price-badge-lg">
                  <div className="uae-price-val">{recommendation.priceAed.toLocaleString()} AED</div>
                  <div className="uae-price-usd">≈ ${recommendation.priceUsd.toLocaleString()} USD (Turnkey)</div>
                </div>
              </div>

              <div className="uae-summary-grid">
                <div className="uae-summary-card">
                  <div className="uae-summary-header">
                    <FileCheck2 size={18} color="#0284c7" />
                    <span>Included Corporate Deliverables</span>
                  </div>
                  <ul className="uae-deliverables-list">
                    <li>
                      <CheckCircle2 size={15} />
                      <span>Official Commercial Trade License valid for 1 full year</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} />
                      <span>Memorandum of Association (MoA) & Articles of Incorporation</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} />
                      <span>Registered Virtual Flexi-Desk / Commercial Lease Agreement</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} />
                      <span>Federal Tax Authority (FTA) Corporate Tax Registration</span>
                    </li>
                    {recommendation.visaCount > 0 && (
                      <>
                        <li>
                          <CheckCircle2 size={15} />
                          <span>{recommendation.visaCount} × 2-Year UAE Investor / Partner Residency Visa(s)</span>
                        </li>
                        <li>
                          <CheckCircle2 size={15} />
                          <span>VIP Fast-Track Medical Fitness (Blood & X-Ray) Concierge</span>
                        </li>
                        <li>
                          <CheckCircle2 size={15} />
                          <span>VIP Biometric Emirates ID Appointment & Courier Delivery</span>
                        </li>
                      </>
                    )}
                    <li>
                      <CheckCircle2 size={15} />
                      <span>Corporate Banking Onboarding Assistance with UAE IBAN</span>
                    </li>
                  </ul>
                </div>

                <div className="uae-summary-card">
                  <div className="uae-summary-header">
                    <ShieldCheck size={18} color="#16a34a" />
                    <span>Fiscal & Legal Protections</span>
                  </div>
                  <ul className="uae-deliverables-list">
                    <li>
                      <CheckCircle2 size={15} />
                      <span><strong>0% Personal Tax:</strong> Zero taxes on personal salary, dividends, and capital gains.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} />
                      <span><strong>100% Repatriation:</strong> No restrictions on foreign currency exchange or dividend outflow.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} />
                      <span><strong>QFZP Exemption:</strong> Eligibility for 0% UAE Corporate Tax on qualifying international transactions.</span>
                    </li>
                    <li>
                      <CheckCircle2 size={15} />
                      <span><strong>Banking Pre-Vetting:</strong> Complete AML/KYC dossier preparation to ensure rapid account approval.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="uae-wizard-footer">
          <button
            type="button"
            className="uae-btn-nav prev"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={16} />
            <span>{lang === 'es' ? 'Anterior' : 'Previous Step'}</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              className="uae-btn-nav next"
              onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            >
              <span>{lang === 'es' ? 'Siguiente' : 'Next Step'}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              className="uae-btn-nav next"
              style={{ background: '#16a34a' }}
              onClick={handleInquireNow}
            >
              <Send size={15} />
              <span>{lang === 'es' ? 'Solicitar Asesoría & Propuesta Formal' : 'Submit Discovery & Request Consultation'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Standard Package Catalog Comparison ── */}
      <div className="uae-packages-section">
        <div className="uae-section-title-wrap">
          <h3 className="uae-sec-title">
            {lang === 'es' ? 'Planes y Estructuras Disponibles' : 'Turnkey Corporate Packages & Licensing Options'}
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            All packages include government fees, legal drafting, and registered agent representation.
          </span>
        </div>

        <div className="uae-packages-grid">
          {packages.map(pkg => {
            const isMatch = recommendation.recommendedPkgId === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`uae-pkg-card ${isMatch ? 'highlighted' : ''}`}
              >
                {pkg.isPopular && (
                  <div className="uae-pkg-badge">
                    Most Popular
                  </div>
                )}
                {isMatch && !pkg.isPopular && (
                  <div className="uae-pkg-badge" style={{ background: '#16a34a' }}>
                    Recommended For You
                  </div>
                )}

                <div>
                  <h4 className="uae-pkg-name">{pkg.name}</h4>
                  <div className="uae-pkg-price-wrap">
                    <div className="uae-pkg-price-aed">
                      {(pkg.price_aed || pkg.price || 0).toLocaleString()} AED
                    </div>
                    <div className="uae-pkg-price-usd">
                      ≈ ${((pkg.price_usd) || Math.round((pkg.price_aed || pkg.price || 0) / 3.6725)).toLocaleString()} USD
                    </div>
                  </div>

                  <div className="uae-pkg-deliv-title">Included Scope:</div>
                  <ul className="uae-deliverables-list">
                    {(pkg.deliverables || []).map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    className="uae-btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      setAnswers(prev => ({
                        ...prev,
                        visasNeeded: pkg.id.includes('freezone-starter') ? 0 : pkg.id.includes('holding') ? 2 : 1,
                        businessActivity: pkg.id.includes('clinic') ? 'clinic' : pkg.id.includes('holding') ? 'holding' : 'consulting'
                      }));
                      setCurrentStep(5);
                    }}
                  >
                    <span>{lang === 'es' ? 'Seleccionar Paquete' : 'Select Package'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5-Phase Fast-Track Implementation Roadmap ── */}
      <div className="uae-roadmap-section">
        <div className="uae-section-title-wrap">
          <h3 className="uae-sec-title">
            {lang === 'es' ? 'Hoja de Ruta de Ejecución (Paso a Paso)' : 'Turnkey 5-Phase Implementation Roadmap'}
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Fast-track concierge execution managed by our licensed Dubai legal counsel.
          </span>
        </div>

        <div className="uae-timeline-track">
          <div className="uae-timeline-step">
            <div className="uae-step-badge">Phase 1</div>
            <div className="uae-step-duration">Days 1 - 2</div>
            <h5 className="uae-step-title">Name Reservation & Security Vetting</h5>
            <p className="uae-step-desc">
              Trade name submission to the Registry Authority and pre-security immigration clearance.
            </p>
          </div>

          <div className="uae-timeline-step">
            <div className="uae-step-badge">Phase 2</div>
            <div className="uae-step-duration">Days 2 - 4</div>
            <h5 className="uae-step-title">MoA & Trade License Issuance</h5>
            <p className="uae-step-desc">
              Drafting Articles of Association, digital shareholder signing, and official Trade License generation.
            </p>
          </div>

          <div className="uae-timeline-step">
            <div className="uae-step-badge">Phase 3</div>
            <div className="uae-step-duration">Days 4 - 6</div>
            <h5 className="uae-step-title">Immigration Card & Entry Permit</h5>
            <p className="uae-step-desc">
              Establishment Card registration with GDRFA and issuance of 60-day electronic residency entry permits.
            </p>
          </div>

          <div className="uae-timeline-step">
            <div className="uae-step-badge">Phase 4</div>
            <div className="uae-step-duration">Days 6 - 8</div>
            <h5 className="uae-step-title">VIP Medical & Emirates ID</h5>
            <p className="uae-step-desc">
              Private VIP medical lounge blood test/X-ray (results in 2h) and biometric fingerprinting appointment.
            </p>
          </div>

          <div className="uae-timeline-step">
            <div className="uae-step-badge">Phase 5</div>
            <div className="uae-step-duration">Days 8 - 14</div>
            <h5 className="uae-step-title">Corporate Banking Onboarding</h5>
            <p className="uae-step-desc">
              Direct submission to Wio Business and Tier-1 UAE commercial banks with full IBAN activation.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Dedicated Consultation CTA ── */}
      <div className="uae-cta-bar">
        <div className="uae-cta-info">
          <h4 className="uae-cta-title">
            {lang === 'es' ? '¿Listo para Iniciar su Expansión a Dubái?' : 'Ready to Establish Your Corporate Presence in the UAE?'}
          </h4>
          <p className="uae-cta-desc">
            {lang === 'es'
              ? 'Nuestros consultores legales le asistirán con la documentación requerida (pasaporte, comprobante de domicilio y plan de negocio).'
              : 'Our licensed corporate advisory team provides a dedicated concierge from initial document review to Emirates ID delivery and bank activation.'}
          </p>
        </div>

        <div className="uae-cta-actions">
          <button
            type="button"
            className="uae-btn-primary"
            onClick={handleInquireNow}
          >
            <Send size={16} />
            <span>{lang === 'es' ? 'Hablar con un Consultor Legal' : 'Schedule Legal Consultation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
