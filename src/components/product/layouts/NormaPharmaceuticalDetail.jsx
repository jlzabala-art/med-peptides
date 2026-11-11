"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  FileText,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
  Download,
  Share2,
  Building2,
  ExternalLink,
  AlertTriangle,
  Info,
  Droplets,
  Activity,
  Thermometer,
  Lock,
  Check,
  ChevronRight,
  HeartPulse,
  Syringe,
  X
} from '@/lib/icons';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ShareProductMonographDrawer from '@/components/admin/catalog/drawers/ShareProductMonographDrawer';
import CopyableId from '@/components/ui/CopyableId';
import { getNormaProductBySlug } from '@/data/normaHellasRegistry';
import './NormaPharmaceuticalDetail.css';

export default function NormaPharmaceuticalDetail({
  product = {},
  slug = 'testosterone-enanthate-norma-250mg',
  baseUrl = 'https://www.atlashealth-services.com'
}) {
  const [lang, setLang] = useState('es');
  const [activeTab, setActiveTab] = useState('smpc'); // 'smpc' | 'administration' | 'coa' | 'monitoring' | 'b2b'
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isDoctorUnlocked, setIsDoctorUnlocked] = useState(false);
  const [isCoaModalOpen, setIsCoaModalOpen] = useState(false);

  const isEs = lang === 'es';

  // Merge product with authoritative registry data to ensure 100% unpolluted clinical data
  const registryData = useMemo(() => {
    return getNormaProductBySlug(slug) || getNormaProductBySlug(product?.id) || {};
  }, [slug, product]);

  const p = useMemo(() => {
    return {
      ...registryData,
      ...product,
      composition: product?.composition || registryData?.composition || {},
      coaData: product?.coaData || registryData?.coaData || {},
      galenicSpecs: product?.galenicSpecs || registryData?.galenicSpecs || {},
      pharmaDetails: product?.pharmaDetails || registryData?.pharmaDetails || {},
      clinicalMonitoring: product?.clinicalMonitoring || registryData?.clinicalMonitoring || {}
    };
  }, [registryData, product]);

  const coa = p.coaData || {};
  const galenic = p.galenicSpecs || {};
  const pharma = p.pharmaDetails || {};
  const monitoring = p.clinicalMonitoring || {};

  const handleDownloadCoa = () => {
    const coaUrl = `/documents/coa/norma/COA-EVER-PHARMA-NORMA-TE-250MG-BATCH-12473.pdf`;
    window.open(coaUrl, '_blank');
  };

  return (
    <div className="norma-page-container">
      {/* ── UNIFIED ATLAS PUBLIC HEADER ── */}
      <PublicUnifiedHeader currentApp="services" />

      {/* ── INSTITUTIONAL TRUST & REGULATORY BAR (STICKY) ── */}
      <div className="norma-institutional-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="norma-badge-pill norma-badge-gmp">
            <ShieldCheck size={13} />
            <span>EU GMP Certified</span>
          </span>

          <span className="norma-badge-pill norma-badge-eof">
            <Award size={13} />
            <span>EOF Greece MA # 45945/03-10-2008</span>
          </span>

          <span className="norma-badge-pill norma-badge-rx">
            <Lock size={12} />
            <span>{isEs ? 'Medicamento Bajo Receta (POM)' : 'Prescription Only Medicine (POM)'}</span>
          </span>

          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
            ATC: <strong style={{ color: '#003666' }}>G03BA03</strong> (Androgens)
          </span>
        </div>

        {/* Right Actions: Lang toggle & Share */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => setLang('es')}
              style={{
                padding: '4px 8px',
                fontSize: '0.70rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: lang === 'es' ? '#003666' : '#ffffff',
                color: lang === 'es' ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '4px 8px',
                fontSize: '0.70rem',
                fontWeight: 700,
                border: 'none',
                backgroundColor: lang === 'en' ? '#003666' : '#ffffff',
                color: lang === 'en' ? '#ffffff' : '#64748b',
                cursor: 'pointer'
              }}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setIsShareDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <Share2 size={13} />
            <span>{isEs ? 'Compartir Ficha' : 'Share Monograph'}</span>
          </button>
        </div>
      </div>

      {/* ── BREADCRUMB ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <ChevronRight size={12} />
          <Link href="/catalog" style={{ color: '#64748b', textDecoration: 'none' }}>
            {isEs ? 'Fármacos Humanos & TRT' : 'Human Pharmaceuticals & TRT'}
          </Link>
          <ChevronRight size={12} />
          <span style={{ color: '#003666', fontWeight: 700 }}>Testosterone Enanthate/Norma® 250 mg/ml</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="norma-content-grid">
        {/* ── HERO SECTION: SPLIT PRESENTATION ── */}
        <div className="norma-hero-split">
          {/* Left Column: Visual Box & Key Attributes Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="norma-card" style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                fontSize: '0.70rem',
                fontWeight: 800,
                color: '#166534',
                backgroundColor: '#dcfce7',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                100% ORIGINAL EU PHARMA
              </div>

              {/* Pharmaceutical Product Image / Render */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '2rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                border: '1px solid #f1f5f9'
              }}>
                <img
                  src={p.imageUrl || '/images/products/norma/testosterone-enanthate-norma-250mg.svg'}
                  alt="Testosterone Enanthate Norma Hellas 250mg"
                  style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
                <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <Package size={64} color="#003666" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#003666' }}>
                    Norma Hellas S.A. • 1 ml Ampoule
                  </span>
                </div>
              </div>

              {/* Quick Specs Under Visual */}
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left', fontSize: '0.76rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                    {isEs ? 'DOSIFICACIÓN' : 'STRENGTH'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>250 mg / 1 mL</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                    {isEs ? 'TESTOSTERONA PURA' : 'FREE TESTOSTERONE'}
                  </div>
                  <div style={{ fontWeight: 800, color: '#003666' }}>~180 mg Base</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                    {isEs ? 'ENVASE GALÉNICO' : 'PACKAGING'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Ampolla Vidrio Ámbar Tipo I</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 600 }}>
                    {isEs ? 'VÍA DE APLICACIÓN' : 'ROUTE'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#991b1b' }}>I.M. Profunda (Glúteo)</div>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setIsInquiryDrawerOpen(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 4px rgba(0,54,102,0.2)'
                  }}
                >
                  <Building2 size={16} />
                  <span>{isEs ? 'Solicitar Suministro para Clínica / Hospital' : 'Request Clinic / Hospital Allocation'}</span>
                </button>

                <button
                  onClick={handleDownloadCoa}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    color: '#003666',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>{isEs ? 'Descargar Ficha Analítica / COA (PDF)' : 'Download Analytical COA (PDF)'}</span>
                </button>
              </div>
            </div>

            {/* Storage Warning Card */}
            <div className="norma-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0369a1', fontSize: '0.84rem' }}>
                <Thermometer size={16} />
                <span>{isEs ? 'Condiciones de Conservación Oficial' : 'Official Storage Conditions'}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', lineHeight: '1.45' }}>
                {isEs
                  ? 'Conservar por debajo de 25°C en su envase original para protegerlo de la luz. NO CONGELAR NI REFRIGERAR (las bajas temperaturas pueden precipitar cristales en el vehículo de aceite de ricino).'
                  : 'Store below 25°C in the original carton to protect from light. DO NOT REFRIGERATE OR FREEZE (low temperatures may cause crystal precipitation in the castor oil vehicle).'}
              </p>
            </div>
          </div>

          {/* Right Column: Title, Identity & Tabbed Medical Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  NORMA HELLAS PHARMACEUTICALS • EST. 1970
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>•</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Athens, Greece</span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
                Testosterone Enanthate/Norma® 250 mg/ml
              </h1>

              <p style={{ fontSize: '0.90rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                {isEs
                  ? 'Solución oleosa estéril inyectable para terapia de sustitución androgénica masculina (TRT). Formulación de depósito de liberación prolongada en ampolla de vidrio ámbar de 1 ml.'
                  : 'Sterile oily solution for male androgen replacement therapy (TRT). Slow-release depot formulation supplied in 1 mL Type I amber glass ampoules.'}
              </p>
            </div>

            {/* Quick Vehicle Highlight Box */}
            <div className="norma-vehicle-box">
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Droplets size={16} />
                <span>{isEs ? 'Vehículo Oleoso Depot — Listo para Inyección (Sin Reconstitución)' : 'Depot Oil Vehicle — Ready to Inject (No Reconstitution)'}</span>
              </div>
              <div style={{ fontSize: '0.76rem', lineHeight: '1.45' }}>
                {isEs
                  ? 'A diferencia de los péptidos liofilizados, este medicamento ya está formulado en una matriz estéril de Aceite de Ricino (Oleum Ricini, 439.6 mg) y Benzoato de Bencilo (342.0 mg). NUNCA debe mezclarse con agua bacteriostática ni diluirse.'
                  : 'Unlike lyophilized peptides, this drug is pre-formulated in a sterile depot vehicle of Castor Oil (Oleum Ricini, 439.6 mg) and Benzyl Benzoate (342.0 mg). NEVER reconstitute with bacteriostatic water or dilute.'}
              </div>
            </div>

            {/* ── GOOGLE CLOUD STYLE TABS ── */}
            <div>
              <div className="norma-tabs-container">
                <button
                  onClick={() => setActiveTab('smpc')}
                  className={`norma-tab-btn ${activeTab === 'smpc' ? 'active' : ''}`}
                >
                  <FileText size={15} />
                  <span>{isEs ? 'Ficha Técnica SmPC' : 'SmPC Monograph'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('administration')}
                  className={`norma-tab-btn ${activeTab === 'administration' ? 'active' : ''}`}
                >
                  <Syringe size={15} />
                  <span>{isEs ? 'Protocolo de Inyección I.M.' : 'I.M. Injection Guide'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('coa')}
                  className={`norma-tab-btn ${activeTab === 'coa' ? 'active' : ''}`}
                >
                  <Award size={15} />
                  <span>{isEs ? 'Analítica de Lote COA' : 'Certified Batch COA'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('monitoring')}
                  className={`norma-tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
                >
                  <HeartPulse size={15} />
                  <span>{isEs ? 'Monitorización TRT' : 'TRT Biomarkers'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('b2b')}
                  className={`norma-tab-btn ${activeTab === 'b2b' ? 'active' : ''}`}
                >
                  <Building2 size={15} />
                  <span>{isEs ? 'Tarifas Clínicas B2B' : 'B2B Clinic Pricing'}</span>
                </button>
              </div>

              {/* ── TAB 1: SMPC & PHARMACOLOGY ── */}
              {activeTab === 'smpc' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Qualitative & Quantitative Composition */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Droplets size={18} color="#003666" />
                      <span>{isEs ? 'Composición Cualitativa y Cuantitativa' : 'Qualitative & Quantitative Composition'}</span>
                    </div>

                    <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: '1.6' }}>
                      <p>
                        <strong>{isEs ? 'Principio Activo:' : 'Active Substance:'}</strong> Cada ampolla de 1 ml contiene <strong>250 mg de Enantato de Testosterona</strong> (correspondiente a aproximadamente <strong>180 mg de Testosterona libre</strong>).
                      </p>
                      <p style={{ marginTop: '8px' }}>
                        <strong>{isEs ? 'Excipientes con efecto conocido:' : 'Excipients with known effect:'}</strong>
                      </p>
                      <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                        <li><strong>Benzoato de Bencilo:</strong> 342.0 mg por ampolla (solubilizante y co-solvente).</li>
                        <li><strong>Aceite de Ricino (*Oleum Ricini*):</strong> 439.6 mg por ampolla (vehículo oleoso retardante de depósito).</li>
                      </ul>
                    </div>
                  </div>

                  {/* Indications and Posology */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Activity size={18} color="#003666" />
                      <span>{isEs ? 'Indicaciones Terapéuticas y Posología' : 'Therapeutic Indications & Posology'}</span>
                    </div>

                    <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: '1.6' }}>
                      <p>
                        <strong>{isEs ? 'Indicaciones Principales:' : 'Indications:'}</strong> Terapia de reemplazo de testosterona en el hipogonadismo masculino primario y secundario (hipogonadotrópico o hipergonadotrópico), cuando la deficiencia de testosterona ha sido confirmada mediante características clínicas y pruebas bioquímicas.
                      </p>

                      <div style={{ marginTop: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, color: '#003666', marginBottom: '6px' }}>
                          {isEs ? 'Pautas Posológicas Estándar en Adultos:' : 'Adult Dosage Guidelines:'}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          <li><strong>{isEs ? 'Fase de Inducción:' : 'Initial Induction:'}</strong> 1 ampolla (250 mg) cada 2 a 3 semanas por vía intramuscular profunda.</li>
                          <li><strong>{isEs ? 'Fase de Mantenimiento:' : 'Maintenance Therapy:'}</strong> 1 ampolla (250 mg) cada 3 a 4 semanas, ajustando el intervalo en función de los niveles séricos de testosterona al final del ciclo de inyección.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Contraindications and Warnings */}
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <AlertTriangle size={18} color="#dc2626" />
                      <span>{isEs ? 'Contraindicaciones y Advertencias Críticas' : 'Contraindications & Critical Safety Warnings'}</span>
                    </div>

                    <div style={{ fontSize: '0.80rem', color: '#334155', lineHeight: '1.6' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        <li>Carcinoma de próstata conocido o sospechado, o carcinoma mamario en varones.</li>
                        <li>Tumores hepáticos presentes o antecedentes de los mismos.</li>
                        <li>Hipersensibilidad al principio activo, al aceite de ricino o al benzoato de bencilo.</li>
                        <li><strong>{isEs ? 'Alerta de Policitemia:' : 'Polycythemia Alert:'}</strong> Se debe monitorizar periódicamente el hematocrito (Hct). Si Hct &gt; 54%, se debe suspender temporalmente la dosis o realizar flebotomía terapéutica.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: INTRAMUSCULAR ADMINISTRATION PROTOCOL ── */}
              {activeTab === 'administration' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Syringe size={18} color="#003666" />
                      <span>{isEs ? 'Técnica Oficial de Inyección en Ampolla de Vidrio' : 'Official Glass Ampoule Administration Protocol'}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className="norma-step-card">
                        <div className="norma-step-num">1</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                            {isEs ? 'Apertura Aseptica de la Ampolla' : 'Aseptic Ampoule Opening'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Asegurar que todo el líquido esté en la base de la ampolla (dar golpecitos suaves en el cuello). Romper el cuello ejerciendo presión hacia atrás sobre el punto blanco indicador (One-Point-Cut).'
                              : 'Ensure all liquid is in the ampoule body. Snap the neck by applying backward pressure on the white indicator dot.'}
                          </div>
                        </div>
                      </div>

                      <div className="norma-step-card">
                        <div className="norma-step-num">2</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                            {isEs ? 'Aspiración con Aguja de Filtro (18G)' : 'Withdrawal with 18G Filter Needle'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Utilizar una aguja con filtro de 5 micras para aspirar la solución oleosa. Esto previene la aspiración accidental de micro-partículas de vidrio que puedan desprenderse al romper la ampolla.'
                              : 'Use a 5-micron filter needle to withdraw the oily solution, preventing aspiration of microscopic glass shards.'}
                          </div>
                        </div>
                      </div>

                      <div className="norma-step-card">
                        <div className="norma-step-num">3</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                            {isEs ? 'Cambio a Aguja Intramuscular Profunda (21G - 23G, 1.5 Pulgadas)' : 'Switch to 21G - 23G (1.5") I.M. Needle'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Desechar la aguja de filtro y acoplar una aguja estéril 21G o 23G de 1.5 pulgadas (38 mm) adecuada para inyección en el cuadrante superior externo del glúteo mayor.'
                              : 'Discard the filter needle and attach a 21G or 23G 1.5-inch needle suitable for deep intragluteal injection.'}
                          </div>
                        </div>
                      </div>

                      <div className="norma-step-card">
                        <div className="norma-step-num">4</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.82rem' }}>
                            {isEs ? 'Aspiración Previa y Velocidad de Inyección Lenta (CRÍTICO)' : 'Aspiration Check & Slow Injection (CRITICAL)'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                            {isEs
                              ? 'Aspirar antes de inyectar para verificar la ausencia de sangre (evitar vía intravascular). Inyectar MUY LENTAMENTE (mínimo 60 segundos por 1 ml) para prevenir microembolismo pulmonar de soluciones oleosas (POME: tos, disnea).'
                              : 'Aspirate before injecting to confirm no vascular entry. Inject EXTREMELY SLOWLY (≥ 60 seconds per 1 mL) to avoid pulmonary oily microembolism (POME: cough, dyspnea).'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: BATCH ANALYTICAL COA ── */}
              {activeTab === 'coa' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div className="norma-card-title" style={{ margin: 0 }}>
                        <Award size={18} color="#003666" />
                        <span>{isEs ? 'Certificado Analítico Oficial de Lote (COA)' : 'Official Batch Certificate of Analysis (COA)'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Lote: <strong style={{ color: '#0f172a' }}>{coa.batchNumber || '12473'}</strong>
                        </span>
                        <button
                          onClick={handleDownloadCoa}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#003666',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Download size={12} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="norma-coa-table">
                        <thead>
                          <tr>
                            <th>Parámetro Analítico</th>
                            <th>Método</th>
                            <th>Especificación</th>
                            <th>Resultado Lote</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(coa.tests || [
                            { parameter: 'Assay (Testosterone Enanthate)', method: 'HPLC 012473', specification: '95.0 – 105.0 %', result: '102.5 %', status: 'PASSED' },
                            { parameter: 'Visual Examination', method: 'COM 004105', specification: 'Clear yellowish oily liquid', result: 'Conforms', status: 'PASSED' },
                            { parameter: 'Sterility Testing', method: 'EP 2.6.1', specification: 'Sterile (no growth)', result: 'Conforms', status: 'PASSED' },
                            { parameter: 'Bacterial Endotoxins', method: 'EP 2.6.14', specification: '≤ 300 I.U./ml', result: '< 150 I.U./ml', status: 'PASSED' },
                            { parameter: 'Total Impurities', method: 'HPLC', specification: '≤ 2.0 %', result: '0.3 %', status: 'PASSED' },
                            { parameter: 'Extractable Volume', method: 'COM 003680', specification: '≥ 1.00 ml', result: '1.08 ml', status: 'PASSED' },
                            { parameter: 'Density (20°C)', method: 'COM 003723', specification: '1.0246 – 1.0446 g/ml', result: '1.0320 g/ml', status: 'PASSED' }
                          ]).map((t, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.parameter}</td>
                              <td style={{ color: '#64748b' }}>{t.method}</td>
                              <td style={{ color: '#475569' }}>{t.specification}</td>
                              <td style={{ fontWeight: 700, color: '#003666' }}>{t.result}</td>
                              <td>
                                <span className="norma-coa-status-pass">
                                  <Check size={11} /> {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '14px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.74rem', color: '#475569' }}>
                      <strong>Certificación Qualified Person (QP):</strong> EVER Pharma Jena GmbH (Alemania) certifica que todas las fases de fabricación se llevaron a cabo de conformidad con los requisitos de las Normas de Correcta Fabricación (GMP) de la UE y de la Autorización de Comercialización EOF 45945/03-10-2008.
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 4: TRT CLINICAL BIOMARKERS ── */}
              {activeTab === 'monitoring' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <HeartPulse size={18} color="#003666" />
                      <span>{isEs ? 'Panel Obligatorio de Monitorización Biomédica (TRT)' : 'Mandatory TRT Biomarker Surveillance Panel'}</span>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '14px' }}>
                      {isEs
                        ? 'Directrices de la Sociedad Europea de Urología (EAU) y Endocrine Society para la terapia de sustitución con enantato de testosterona:'
                        : 'European Association of Urology (EAU) and Endocrine Society monitoring directives for testosterone replacement therapy:'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                          1. Testosterona Total & Libre
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Extraer en ayunas por la mañana (8:00–10:00). Medir en el nadir (valle) justo antes de la siguiente inyección.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', marginTop: '6px' }}>
                          Objetivo: Rango medio fisiológico (450–700 ng/dL)
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#c2410c', fontSize: '0.82rem' }}>
                          2. Hematocrito (Hct) / Hemograma
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Línea base, a los 3 meses, 6 meses y anualmente. Riesgo de policitemia por estimulación de la eritropoyetina.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
                          Umbral de Alerta: Hct &gt; 54% (requiere ajuste de dosis)
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                          3. PSA y Exploración Prostática
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          En varones &gt; 45 años. Descartar carcinoma prostático antes de iniciar y vigilar elevaciones superiores a 1.4 ng/mL en 12 meses.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', marginTop: '6px' }}>
                          Límite: PSA &lt; 4.0 ng/mL
                        </div>
                      </div>

                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.82rem' }}>
                          4. Perfil Lipídico y Enzimas Hepáticas
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                          Monitoreo de ALT, AST, HDL y triglicéridos. Los andrógenos exógenos pueden reducir discretamente el colesterol HDL.
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
                          Cadencia: Línea base y cada 6-12 meses
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: B2B COMMERCIAL SCHEDULE ── */}
              {activeTab === 'b2b' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="norma-card">
                    <div className="norma-card-title">
                      <Building2 size={18} color="#003666" />
                      <span>{isEs ? 'Tarifas Comerciales Oficiales para Clínicas y Hospitales B2B' : 'Official B2B Pricing Schedule for Clinics'}</span>
                    </div>

                    {!isDoctorUnlocked ? (
                      <div style={{
                        padding: '24px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <Lock size={32} color="#003666" />
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                          {isEs ? 'Precios Restringidos a Profesionales Sanitarios Colegiados' : 'Pricing Restricted to Registered Healthcare Professionals'}
                        </div>
                        <p style={{ fontSize: '0.80rem', color: '#64748b', maxWidth: '440px', margin: 0 }}>
                          {isEs
                            ? 'Conforme a la normativa farmacéutica europea y del Ministerio de Salud (MOHAP/DHA), los precios de medicamentos sujetos a prescripción no son públicos para pacientes generales.'
                            : 'In compliance with European and regional healthcare regulations, wholesale pricing for prescription-only pharmaceuticals is restricted to verified clinical practitioners.'}
                        </p>
                        <button
                          onClick={() => setIsDoctorUnlocked(true)}
                          style={{
                            padding: '9px 18px',
                            backgroundColor: '#003666',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.80rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isEs ? 'Desbloquear como Médico Colegiado / Clínica' : 'Unlock as Licensed Physician / Clinic'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.70rem', color: '#166534', fontWeight: 800 }}>TARIFA CLÍNICA / DOCTOR</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', margin: '4px 0' }}>21.00 EUR</div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Por ampolla (1 ml × 250 mg)</div>
                          </div>

                          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 800 }}>MAYORISTA / WHOLESALE</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e40af', margin: '4px 0' }}>24.50 EUR</div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Pedidos estándar B2B</div>
                          </div>

                          <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.70rem', color: '#6b21a8', fontWeight: 800 }}>MASTER TIER (PACK &gt; 50)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#6b21a8', margin: '4px 0' }}>18.00 EUR</div>
                            <div style={{ fontSize: '0.70rem', color: '#64748b' }}>Volumen hospitalario</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button
                            onClick={() => setIsInquiryDrawerOpen(true)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#003666',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '0.80rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isEs ? 'Crear Orden de Compra (PO)' : 'Create Purchase Order (PO)'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── DRAWERS ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        productName="Testosterone Enanthate/Norma® 250 mg/ml"
        productSku="NORMA-TE-250-1AMP"
        category="Hormones & TRT"
      />

      <ShareProductMonographDrawer
        isOpen={isShareDrawerOpen}
        onClose={() => setIsShareDrawerOpen(false)}
        product={{
          id: 'testosterone-enanthate-norma-250mg',
          name: 'Testosterone Enanthate/Norma® 250 mg/ml',
          brand: 'Norma Hellas S.A.',
          category: 'hormone'
        }}
        shareUrl={`${baseUrl}/p/testosterone-enanthate-norma-250mg`}
      />

      {/* ── UNIFIED PUBLIC FOOTER ── */}
      <PublicUnifiedFooter />
    </div>
  );
}

