"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Microscope,
  Dna,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
  Download,
  Share2,
  ZoomIn,
  Building2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  FlaskConical,
  X,
  Sparkles,
  Info
} from '@/lib/icons';
import ImageModal from '@/snippets/ImageModal';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import { getTeletestProductBySlug } from '@/data/teletestRegistry';
import './TeletestDiagnosticDetail.css';

export default function TeletestDiagnosticDetail({
  product = {},
  slug = 'teletest-mineralograma-cabello-htma',
  baseUrl = 'https://www.atlashealth-services.com'
}) {
  // English by default as strictly requested
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('overview');
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const isEs = lang === 'es';

  // Merge product with authoritative registry data to ensure 100% unpolluted clinical data
  const registryData = useMemo(() => {
    return getTeletestProductBySlug(slug) || getTeletestProductBySlug(product?.id) || {};
  }, [slug, product]);

  const testData = useMemo(() => {
    return {
      ...registryData,
      ...product,
      // Priority to official registry fields to prevent contaminated DB overrides
      name: registryData.name || product.name || 'TeleTest™ Clinical Diagnostic Panel',
      canonicalName: registryData.canonicalName || product.canonicalName || registryData.name || product.name,
      sampleMatrix: registryData.sampleMatrix || product.sampleMatrix || 'Clinical Specimen Collection',
      methodology: registryData.methodology || product.methodology || 'High-Resolution Clinical Laboratory Assay',
      accreditation: registryData.accreditation || 'Generalitat de Catalunya E08750211 · ISO 17025 Accredited',
      referenceLab: registryData.referenceLab || 'TeleTest Analytika Central Reference Laboratory (Barcelona, EU)',
      turnaround: registryData.turnaround || '5 – 7 Business Days',
      image: registryData.image || product.image || '/images/products/teletest/mineralograma-cabello.svg',
      sampleReportUrl: registryData.sampleReportUrl || '/docs/teletest-report-htma.pdf',
      clinicalIndications: registryData.clinicalIndications || [
        'Comprehensive baseline assessment for functional & longevity medicine',
        'Specialized diagnostic evaluation guided by clinical practitioner',
        'Targeted monitoring for therapeutic protocol efficacy'
      ],
      whatTestTellsYou: registryData.whatTestTellsYou || [
        'Precise molecular quantification of target clinical biomarkers',
        'Certified European reference intervals calibrated for age and sex',
        'Physician-interpretable report signed with FNMT digital certificate'
      ],
      kitContents: registryData.kitContents || [
        'Sterile clinical specimen collection equipment',
        'Barcoded laboratory requisition paperwork',
        'Step-by-step illustrated instructions',
        'Pre-addressed, prepaid courier return packaging'
      ],
      collectionProtocol: registryData.collectionProtocol || [
        { step: 1, title: 'Preparation', desc: 'Read instructions thoroughly and complete the laboratory requisition slip.' },
        { step: 2, title: 'Sample Collection', desc: 'Collect the clinical specimen following the illustrated sterile protocol.' },
        { step: 3, title: 'Packaging', desc: 'Seal the specimen inside the protective barcoded transport tube or pouch.' },
        { step: 4, title: 'Prepaid Return', desc: 'Dispatch to the Barcelona Central Laboratory using the included prepaid courier mailer.' }
      ]
    };
  }, [registryData, product]);

  const cleanPrice = testData.price ? `€${Number(testData.price).toFixed(2)}` : '€145.00';
  const testCode = testData.id || slug;

  return (
    <div className="tlt-page-wrapper">
      {/* ── Top Accreditation Strip ── */}
      <div className="tlt-accreditation-strip">
        <div className="tlt-strip-inner">
          <div className="tlt-strip-badges">
            <span className="tlt-strip-item">
              <Building2 size={14} />
              <span>TeleTest Analytika® Central Reference Lab (Barcelona, EU)</span>
            </span>
            <span className="tlt-strip-divider">•</span>
            <span className="tlt-strip-item">
              <Award size={14} />
              <span>Generalitat de Catalunya E08750211</span>
            </span>
            <span className="tlt-strip-divider">•</span>
            <span className="tlt-strip-item">
              <ShieldCheck size={14} />
              <span>ISO 17025 Accredited</span>
            </span>
          </div>

          <div className="tlt-lang-toggle">
            <button
              type="button"
              className={`tlt-lang-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`tlt-lang-btn ${lang === 'es' ? 'active' : ''}`}
              onClick={() => setLang('es')}
            >
              ES
            </button>
          </div>
        </div>
      </div>

      {/* ── Standard Site Navigation Header ── */}
      <PublicUnifiedHeader currentBrand="teletest" />

      {/* ── Main Layout Container ── */}
      <main className="tlt-container">
        {/* Breadcrumb Navigation */}
        <nav className="tlt-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={14} />
          <Link href="/collection/teletest">TeleTest Analytika®</Link>
          <ChevronRight size={14} />
          <span className="active">{testData.name}</span>
        </nav>

        {/* ── Hero Presentation Card ── */}
        <section className="tlt-hero-card">
          {/* Visual Column */}
          <div className="tlt-visual-col">
            <div
              className="tlt-image-frame"
              onClick={() => setIsImageModalOpen(true)}
              title={isEs ? "Clic para ampliar imagen" : "Click to enlarge packaging image"}
            >
              <img
                src={testData.image}
                alt={testData.name}
                className="tlt-kit-img"
              />
              <div className="tlt-zoom-hint">
                <ZoomIn size={13} />
                <span>{isEs ? "Ampliar" : "Enlarge"}</span>
              </div>
            </div>

            <div className="tlt-visual-pills">
              <div className="tlt-trust-box">
                <ShieldCheck size={16} color="#16a34a" />
                <div>
                  <strong>{isEs ? "Laboratorio de Referencia Europeo" : "European Reference Laboratory"}</strong>
                  <div>Generalitat de Catalunya E08750211 · ISO 17025</div>
                </div>
              </div>
              <div className="tlt-trust-box">
                <FileText size={16} color="#0284c7" />
                <div>
                  <strong>{isEs ? "Firma Digital FNMT" : "FNMT Digital Signature"}</strong>
                  <div>{isEs ? "Informe médico certificado con trazabilidad legal" : "Certified physician report with full legal chain of custody"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="tlt-info-col">
            <div>
              <div className="tlt-hero-badges">
                <span className="tlt-pill-accredited">
                  <Award size={13} />
                  <span>ISO 17025 Accredited</span>
                </span>
                <span className="tlt-pill-labcode">
                  <Building2 size={13} />
                  <span>Generalitat E08750211</span>
                </span>
                <StatusBadge status="active" />
                <CopyableId value={testCode} />
              </div>

              <h1 className="tlt-product-title">{testData.name}</h1>
              <p className="tlt-product-lead">{testData.shortDescription}</p>

              {/* 4 Core Clinical Metrics */}
              <div className="tlt-kpi-grid">
                <div className="tlt-kpi-card">
                  <div className="tlt-kpi-icon">
                    <FlaskConical size={18} />
                  </div>
                  <div>
                    <div className="tlt-kpi-label">{isEs ? "Muestra Requerida" : "Sample Matrix"}</div>
                    <div className="tlt-kpi-value">{testData.sampleMatrix}</div>
                    <div className="tlt-kpi-sub">{isEs ? "Toma en consulta o por paciente" : "In-clinic or patient collection"}</div>
                  </div>
                </div>

                <div className="tlt-kpi-card">
                  <div className="tlt-kpi-icon">
                    <Microscope size={18} />
                  </div>
                  <div>
                    <div className="tlt-kpi-label">{isEs ? "Metodología Analítica" : "Analytical Method"}</div>
                    <div className="tlt-kpi-value">{testData.methodology}</div>
                    <div className="tlt-kpi-sub">{isEs ? "Espectrometría / qPCR de precisión" : "High-density precision assay"}</div>
                  </div>
                </div>

                <div className="tlt-kpi-card">
                  <div className="tlt-kpi-icon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="tlt-kpi-label">{isEs ? "Tiempo de Entrega" : "Turnaround Time"}</div>
                    <div className="tlt-kpi-value">{testData.turnaround}</div>
                    <div className="tlt-kpi-sub">{isEs ? "Desde recepción en laboratorio" : "From lab receipt in Barcelona"}</div>
                  </div>
                </div>

                <div className="tlt-kpi-card">
                  <div className="tlt-kpi-icon">
                    <Dna size={18} />
                  </div>
                  <div>
                    <div className="tlt-kpi-label">{isEs ? "Especificidad Analítica" : "Analytical Specificity"}</div>
                    <div className="tlt-kpi-value">&gt; 99.8% Specificity</div>
                    <div className="tlt-kpi-sub">{isEs ? "Validación doble por duplicado" : "Dual duplicate validation"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & CTA Action Bar */}
            <div className="tlt-cta-block">
              <div className="tlt-price-row">
                <div>
                  <span className="tlt-price-val">{cleanPrice}</span>
                  <span className="tlt-price-sub">{isEs ? "IVA e informe incluidos" : "VAT & Certified Lab Analysis Included"}</span>
                </div>
                <span className="tlt-tier-badge">
                  {isEs ? "Elegible para Clínicas & Prescripción B2B" : "Clinical Practice & B2B Packs Available"}
                </span>
              </div>

              <div className="tlt-btn-row">
                <button
                  type="button"
                  className="tlt-btn-primary"
                  onClick={() => setIsInquiryDrawerOpen(true)}
                >
                  <Package size={17} />
                  <span>{isEs ? "Solicitar Kit Diagnóstico" : "Order Diagnostic Kit"}</span>
                </button>

                {testData.sampleReportUrl && (
                  <button
                    type="button"
                    className="tlt-btn-secondary"
                    onClick={() => setIsPdfModalOpen(true)}
                  >
                    <FileText size={16} />
                    <span>{isEs ? "Ver Informe Muestra" : "Sample Report (PDF)"}</span>
                  </button>
                )}

                <button
                  type="button"
                  className="tlt-btn-icon"
                  onClick={() => setIsShareDrawerOpen(true)}
                  title={isEs ? "Compartir ficha técnica" : "Share Clinical Monograph"}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabbed Clinical Exploration ── */}
        <nav className="tlt-tabs-nav" aria-label="Monograph Sections">
          <button
            type="button"
            className={`tlt-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Sparkles size={16} />
            <span>{isEs ? "1. Fundamento Clínico" : "1. Clinical Scope & Purpose"}</span>
          </button>
          <button
            type="button"
            className={`tlt-tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <Microscope size={16} />
            <span>{isEs ? "2. ¿Qué Mide Este Test?" : "2. What Does It Tell You?"}</span>
          </button>
          <button
            type="button"
            className={`tlt-tab-btn ${activeTab === 'how-it-works' ? 'active' : ''}`}
            onClick={() => setActiveTab('how-it-works')}
          >
            <Clock size={16} />
            <span>{isEs ? "3. Protocolo de Toma de Muestra" : "3. Clinical Specimen Collection"}</span>
          </button>
          <button
            type="button"
            className={`tlt-tab-btn ${activeTab === 'laboratory' ? 'active' : ''}`}
            onClick={() => setActiveTab('laboratory')}
          >
            <ShieldCheck size={16} />
            <span>{isEs ? "4. Acreditación ISO 17025" : "4. Laboratory Accreditation"}</span>
          </button>
        </nav>

        {/* ── TAB 1: Clinical Scope & Indications ── */}
        {activeTab === 'overview' && (
          <div className="tlt-tab-content">
            <section className="tlt-section-card">
              <div className="tlt-section-header">
                <span className="tlt-section-badge">
                  <Info size={13} />
                  <span>{isEs ? "Indicación Médica" : "Clinical Monograph"}</span>
                </span>
                <h2 className="tlt-section-title">
                  {isEs ? "¿Por qué realizar esta prueba diagnóstica?" : "Why This Diagnostic Test Matters"}
                </h2>
                <p className="tlt-section-sub">
                  {testData.description}
                </p>
              </div>

              <div className="tlt-split-grid">
                <div className="tlt-callout-box">
                  <h4>
                    <FlaskConical size={18} />
                    <span>{isEs ? "Ventaja Frente a Analíticas Convencionales" : "Advantage Over Routine Blood Tests"}</span>
                  </h4>
                  <p>
                    {slug.includes('htma') || slug.includes('mineral') ? (
                      isEs
                        ? "La sangre mantiene una homeostasis estricta: los minerales se extraen de los órganos para mantener el suero normal, y los metales pesados se eliminan del torrente sanguíneo en 24-48 horas para almacenarse en tejidos profundos. El cabello proximal refleja la acumulación intracelular crónica real de los últimos 90 días."
                        : "Blood maintains strict transient homeostasis: essential minerals are depleted from internal organs to maintain normal serum levels, while toxic heavy metals are rapidly sequestered into deep tissues within 24–48 hours. Proximal hair tissue provides an unalterable metabolic biopsy of the actual chronic 90-day cellular burden."
                    ) : slug.includes('omega') ? (
                      isEs
                        ? "La mayoría de análisis miden triglicéridos o ácidos grasos en suero, que fluctúan drásticamente con la última comida. El HS-Omega-3 Index® mide los eritrocitos (glóbulos rojos) con una vida media de 120 días, reflejando la composición lipídica real de las membranas celulares del miocardio y las neuronas."
                        : "Standard blood tests measure serum lipids that fluctuate wildly with your last meal. The HS-Omega-3 Index® measures erythrocyte membranes (120-day lifespan), reflecting true incorporation into cardiac and neuronal cell membranes and calculating the authoritative AA:EPA cellular silent inflammation ratio."
                    ) : slug.includes('celiaca') || slug.includes('celiac') ? (
                      isEs
                        ? "Los anticuerpos séricos (anti-tTG, anti-DGP) requieren que el paciente consuma gluten activamente para positivizarse y dan falsos negativos en dietas sin gluten. El estudio genético HLA-DQ2/DQ8 nunca cambia: un resultado negativo descarta la celiaquía de por vida con un Valor Predictivo Negativo >99% sin obligar al paciente a consumir gluten."
                        : "Serological antibody tests (tTG, EMA) require active gluten consumption and frequently produce false negatives on a gluten-free diet. High-resolution HLA-DQ2/DQ8 molecular typing is invariant: a negative result rules out celiac disease for life with >99% Negative Predictive Value (NPV), eliminating painful gluten challenges."
                    ) : (
                      isEs
                        ? "La farmacogenética y la inmunogenética molecular analizan variantes genómicas estructurales permanentes. Permiten a los médicos prescribir dosis personalizadas y prevenir toxicidad antes de iniciar tratamientos prolongados."
                        : "Pharmacogenetics and molecular immunogenetics evaluate lifelong permanent genomic alleles. They empower clinicians to personalize therapeutic dosing, prevent adverse drug reactions, and mitigate autoimmune triggers before irreversible tissue damage occurs."
                    )}
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                    {isEs ? "Indicaciones Clínicas Principales" : "Key Clinical Indications"}
                  </h3>
                  <ul className="tlt-checklist">
                    {testData.clinicalIndications.map((ind, idx) => (
                      <li key={idx} className="tlt-check-item">
                        <CheckCircle2 size={16} className="tlt-check-icon" />
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 2: Actionable Insights & Biomarkers ── */}
        {activeTab === 'insights' && (
          <div className="tlt-tab-content">
            <section className="tlt-section-card">
              <div className="tlt-section-header">
                <span className="tlt-section-badge">
                  <Microscope size={13} />
                  <span>{isEs ? "Parámetros Analíticos" : "Diagnostic Depth"}</span>
                </span>
                <h2 className="tlt-section-title">
                  {isEs ? "¿Qué Información Proporciona el Informe Clínico?" : "What Exactly Does This Test Tell You?"}
                </h2>
                <p className="tlt-section-sub">
                  {isEs
                    ? "Cada informe emitido por TeleTest Analytika incluye valores cuantitativos exactos, intervalos de referencia europeos e interpretación fisiopatológica para médicos."
                    : "Every certified report issued by TeleTest Analytika delivers exact quantitative determinations, European reference ranges, and actionable clinical interpretations."}
                </p>
              </div>

              <div className="tlt-box-grid">
                {testData.whatTestTellsYou.map((item, idx) => (
                  <div key={idx} className="tlt-feature-box">
                    <h5>Parameter Category #{idx + 1}</h5>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.75rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.9375rem' }}>
                    {isEs ? "¿Deseas revisar un informe real anonimizado?" : "Want to see an actual anonymized laboratory report?"}
                  </strong>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                    {isEs ? "Descarga la muestra oficial en PDF firmada digitalmente con certificado FNMT." : "Download the official sample PDF signed digitally with FNMT certification."}
                  </span>
                </div>
                {testData.sampleReportUrl && (
                  <button
                    type="button"
                    className="tlt-btn-secondary"
                    onClick={() => setIsPdfModalOpen(true)}
                  >
                    <Download size={15} />
                    <span>{isEs ? "Descargar Muestra PDF" : "Download Sample PDF"}</span>
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 3: 4-Step Patient Journey & Kit Contents ── */}
        {activeTab === 'how-it-works' && (
          <div className="tlt-tab-content">
            <section className="tlt-section-card">
              <div className="tlt-section-header">
                <span className="tlt-section-badge">
                  <Clock size={13} />
                  <span>{isEs ? "Protocolo Paso a Paso" : "Step-by-Step Flow"}</span>
                </span>
                <h2 className="tlt-section-title">
                  {isEs ? "Protocolo de Toma: Recogida en Consulta Médica o por el Paciente" : "Specimen Collection: In-Clinic or Patient Sampling Flow"}
                </h2>
                <p className="tlt-section-sub">
                  {isEs
                    ? "Procedimiento estéril y no invasivo, diseñado tanto para toma directa por personal sanitario en consulta como para toma por el paciente, con transporte al Laboratorio Central de Barcelona."
                    : "Sterile and non-invasive collection protocol, validated for in-clinic medical staff sampling as well as convenient direct patient dispatch to the Barcelona Central Reference Laboratory."}
                </p>
              </div>

              <div className="tlt-steps-grid">
                {testData.collectionProtocol.map((s, idx) => (
                  <div key={idx} className="tlt-step-card">
                    <div className="tlt-step-badge">{s.step || idx + 1}</div>
                    <h4 className="tlt-step-title">{s.title}</h4>
                    <p className="tlt-step-desc">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                  {isEs ? "Contenido Incluido en el Kit Diagnóstico" : "What's Included Inside The Clinical Box"}
                </h3>
                <div className="tlt-box-grid">
                  {testData.kitContents.map((kitItem, idx) => (
                    <div key={idx} className="tlt-feature-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0284c7', marginBottom: '0.25rem' }}>
                        <Package size={15} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Item #{idx + 1}</span>
                      </div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>{kitItem}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── TAB 4: Laboratory Accreditations ── */}
        {activeTab === 'laboratory' && (
          <div className="tlt-tab-content">
            <section className="tlt-section-card">
              <div className="tlt-section-header">
                <span className="tlt-section-badge">
                  <Award size={13} />
                  <span>{isEs ? "Calidad y Normativa Europea" : "Regulatory Authority"}</span>
                </span>
                <h2 className="tlt-section-title">
                  {isEs ? "TeleTest Analytika®: Rigor y Acreditación ISO 17025" : "TeleTest Analytika®: Certified Analytical Rigor"}
                </h2>
                <p className="tlt-section-sub">
                  {isEs
                    ? "Laboratorio clínico de referencia europeo autorizado por el Departament de Salut de la Generalitat de Catalunya con código de registro sanitario E08750211."
                    : "European clinical reference laboratory authorized by the Department of Health of the Generalitat de Catalunya under sanitary registry code E08750211."}
                </p>
              </div>

              <div className="tlt-split-grid">
                <div className="tlt-feature-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={20} />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {isEs ? "Acreditación ISO 17025" : "ISO 17025 Laboratory Standard"}
                    </h4>
                  </div>
                  <p>
                    {isEs
                      ? "La norma ISO/IEC 17025 establece los requisitos más exigentes para la competencia de laboratorios de ensayo y calibración. Garantiza trazabilidad metrológica inquebrantable, curvas de calibración validadas y ensayos por duplicado."
                      : "The ISO/IEC 17025 international standard specifies the most stringent competence requirements for testing and calibration laboratories, ensuring unbroken metrological traceability, validated calibration curves, and duplicate verification."}
                  </p>
                </div>

                <div className="tlt-feature-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7', marginBottom: '0.5rem' }}>
                    <Building2 size={20} />
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                      {isEs ? "Autorización Generalitat E08750211" : "Generalitat de Catalunya E08750211"}
                    </h4>
                  </div>
                  <p>
                    {isEs
                      ? "Instalaciones analíticas centrales ubicadas en Barcelona con inspección sanitaria periódica, supervisión por facultativos especialistas en análisis clínicos e integración con el portal seguro de telemedicina."
                      : "Central analytical facilities located in Barcelona under periodic sanitary audits, medical supervision by clinical laboratory directors, and secure integration with the physician telemetry portal."}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <Award size={18} />
                  <span>{isEs ? "Firma Electrónica Avanzada FNMT" : "Advanced FNMT Digital Signature"}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', lineHeight: 1.5 }}>
                  {isEs
                    ? "Todos los informes emitidos cuentan con firma digital cualificada reconocida por la Fábrica Nacional de Moneda y Timbre (FNMT) y sello de tiempo cualificado, asegurando validez jurídica plena y confidencialidad médica según RGPD."
                    : "All issued laboratory reports feature qualified digital signatures backed by the Spanish National Mint (FNMT) with qualified timestamps, ensuring absolute legal validity, integrity, and strict GDPR patient privacy compliance."}
                </p>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ── Standard Site Footer ── */}
      <PublicUnifiedFooter />

      {/* ── Image Modal ── */}
      {isImageModalOpen && (
        <ImageModal
          isOpen={isImageModalOpen}
          src={testData.image}
          alt={testData.name}
          title={testData.name}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}

      {/* ── Institutional Inquiry Drawer ── */}
      {isInquiryDrawerOpen && (
        <PublicInstitutionalInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          product={{
            id: testData.id || slug,
            name: testData.name,
            slug: slug,
            brand: 'TeleTest Analytika®',
            category: testData.category,
            price: testData.price,
            image: testData.image,
            supplierName: 'TeleTest Analytika',
            accreditation: 'Generalitat de Catalunya E08750211 · ISO 17025'
          }}
        />
      )}

      {/* ── Share Monograph Drawer ── */}
      {isShareDrawerOpen && (
        <ShareProductMonographDrawer
          isOpen={isShareDrawerOpen}
          onClose={() => setIsShareDrawerOpen(false)}
          product={{
            id: testData.id || slug,
            name: testData.name,
            slug: slug,
            brand: 'TeleTest Analytika®',
            shortDescription: testData.shortDescription,
            image: testData.image,
            url: `${baseUrl}/p/${slug}`
          }}
        />
      )}

      {/* ── Sample Report PDF Modal ── */}
      {isPdfModalOpen && testData.sampleReportUrl && (
        <div className="tlt-pdf-modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
          <div className="tlt-pdf-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tlt-pdf-header">
              <h3>{testData.name} — Sample Report</h3>
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="tlt-pdf-body">
              <iframe
                src={`${testData.sampleReportUrl}#toolbar=1&navpanes=0`}
                title={`${testData.name} Sample Report`}
              />
            </div>
            <div className="tlt-pdf-footer">
              <a
                href={testData.sampleReportUrl}
                download
                className="tlt-btn-primary"
                style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={15} />
                <span>Download Sample PDF</span>
              </a>
              <button
                type="button"
                className="tlt-btn-secondary"
                onClick={() => setIsPdfModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
