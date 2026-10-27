"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Award, 
  CheckCircle2, 
  Lock, 
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';

/**
 * BloodoLabStandardsDownloadsSection
 * ─────────────────────────────────────────────────────────────────────────────
 * Section 5: "Lab Standards & Clinical Downloads" (Acreditación ISO y Descargas)
 * Displays European central laboratory accreditations (LifeLab1, ISO 15189:2022, 
 * CE-IVDR Regulation EU 2017/746), validated chain of custody, and in-app 
 * PDF preview & download for:
 * 1. Official Sample Clinical Report (real patient specimen simulation)
 * 2. Bloodo™ 2026 Comprehensive Product Catalog & Clinician Dossier
 * 3. Sample Collection Instructions (IFU)
 */
export default function BloodoLabStandardsDownloadsSection({
  product = {},
  lang = 'en',
  onSelectSection = null,
  onUnlockRequest = null
}) {
  const isEs = lang === 'es';
  const slug = (product?.slug || product?.id || '').toLowerCase();
  const [previewDoc, setPreviewDoc] = useState(null);

  // Resolve analyte-specific sample report and title
  let reportPdf = '/docs/bloodo-report-nad.pdf';
  let reportName = 'NAD+ Intracellular';
  const catalogPdf = '/docs/bloodo-product-catalog-2026.pdf';

  if (slug.includes('testosterone') || slug.includes('testosterona')) {
    reportPdf = '/docs/bloodo-report-testosterone-male.pdf';
    reportName = 'Testosterone+ (Male Panel)';
  } else if (slug.includes('cortisol')) {
    reportPdf = '/docs/bloodo-report-cortisol-am-pm.pdf';
    reportName = 'Cortisol CAR & PM';
  } else if (slug.includes('hba1c') || slug.includes('hemoglobin') || slug.includes('glucose')) {
    reportPdf = '/docs/bloodo-report-hba1c.pdf';
    reportName = 'HbA1c & Mean Glycemia';
  } else if (slug.includes('omega')) {
    reportPdf = '/docs/bloodo-report-omega-ratio.pdf';
    reportName = 'Omega-3/6 Ratio & Fatty Acids';
  } else if (slug.includes('vitamin') || slug.includes('vitd')) {
    reportPdf = '/docs/bloodo-report-vitamin-d.pdf';
    reportName = 'Vitamin D3 (25-OH)';
  } else if (slug.includes('htma') || slug.includes('mineralograma')) {
    reportPdf = '/docs/teletest-report-htma.pdf';
    reportName = 'HTMA Mineralogram';
  }

  return (
    <section 
      id="specs-section" 
      className="pds-section-card"
      style={{
        marginTop: '1.5rem',
        marginBottom: '1.75rem',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* ── Section Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
        <div>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#0d9488',
            background: '#f0fdfa',
            border: '1px solid #99f6e4',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '6px'
          }}>
            <ShieldCheck size={12} /> {isEs ? 'SECCIÓN 5 · ACREDITACIÓN Y DESCARGAS' : 'SECTION 5 · ACCREDITATION & DOWNLOADS'}
          </span>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '2px 0 4px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={22} color="#003666" />
            {isEs 
              ? '5. Acreditación ISO 15189, Calidad y Descargas Clínicas' 
              : '5. Lab Standards, ISO 15189 Accreditation & Clinical Downloads'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            {isEs 
              ? 'Certificaciones del laboratorio central europeo, marco regulatorio CE-IVDR y repositorio de documentos clínicos oficiales descargables.'
              : 'European central laboratory accreditation details, CE-IVDR compliance architecture, and official downloadable clinical documentation repository.'}
          </p>
        </div>

        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#15803d',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '4px 10px',
          borderRadius: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <Award size={13} /> LifeLab1 Central Lab (EU)
        </span>
      </div>

      {/* ── Key Laboratory Accreditations Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.9rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '3px' }}>
            {isEs ? 'Laboratorio Analítico Central' : 'Central Clinical Laboratory'}
          </span>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
            LifeLab1 (Vilnius, EU)
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#0d9488', fontWeight: 600 }}>
            Licencia NM-334/NR-4864
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.9rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '3px' }}>
            {isEs ? 'Norma de Acreditación' : 'Laboratory Accreditation'}
          </span>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
            ISO 15189:2022
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
            {isEs ? 'Laboratorios de Análisis Clínico' : 'Medical Laboratories Competence'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.9rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '3px' }}>
            {isEs ? 'Regulación Sanitaria' : 'EU Medical Device Regulation'}
          </span>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
            CE-IVDR (UE 2017/746)
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>
            {isEs ? 'Diagnóstico In Vitro Certificado' : 'Certified In Vitro Diagnostic Device'}
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.9rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '3px' }}>
            {isEs ? 'Trazabilidad de Muestra' : 'Specimen Chain of Custody'}
          </span>
          <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
            Whatman® 903 Card
          </strong>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
            {isEs ? 'Código de barras encriptado' : 'Encrypted Barcode & Safe Portal'}
          </span>
        </div>
      </div>

      {/* ── Official Clinical Downloads Hub ── */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 0.85rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '7px'
        }}>
          <Download size={16} color="#003666" />
          {isEs ? 'Descargas Oficiales y Material Clínico' : 'Official Clinical Downloads & Reports'}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '12px'
        }}>
          {/* Card A: Official Sample Clinical Report */}
          <div style={{
            border: '1px solid #ccfbf1',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
            borderRadius: '10px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEs ? 'Informe de Laboratorio' : 'Laboratory Specimen Report'}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', background: '#e6fffa', padding: '2px 6px', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                  PDF Real
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? `Informe Clínico de Muestra (${reportName})` : `Official Sample Clinical Report (${reportName})`}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: '1.45', margin: 0 }}>
                {isEs 
                  ? 'Descarga una copia completa y fidedigna del informe analítico cuantitativo que reciben médicos y pacientes con rangos, gráficos y firma facultativa.'
                  : 'Download a complete verified sample of the quantitative analytical PDF delivered to clinicians and patients with reference intervals, graphs, and certified lab sign-off.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setPreviewDoc({
                  fileUrl: reportPdf,
                  downloadName: reportPdf.split('/').pop() || 'sample-clinical-report.pdf',
                  title: isEs ? `Informe Clínico de Muestra (${reportName})` : `Official Sample Clinical Report (${reportName})`,
                  subtitle: isEs ? 'Simulación oficial de informe analítico cuantitativo LifeLab1' : 'LifeLab1 quantitative clinical specimen report simulation'
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '8px 14px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <FileText size={14} />
              <span>{isEs ? 'Ver Informe Clínico (PDF)' : 'Preview Sample Report (PDF)'}</span>
            </button>
          </div>

          {/* Card B: Official Sample Collection Instructions (IFU) */}
          <div style={{
            border: '1.5px solid #99f6e4',
            background: 'linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)',
            borderRadius: '10px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEs ? 'Instrucciones de Uso (IFU)' : 'Instructions For Use (IFU)'}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f766e', background: '#ccfbf1', padding: '2px 6px', borderRadius: '4px', border: '1px solid #99f6e4' }}>
                  CE-IVDR
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Instrucciones de Toma de Muestra (PDF)' : 'Sample Collection Instructions (PDF)'}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: '1.45', margin: 0 }}>
                {isEs 
                  ? 'Guía oficial ilustrada para la extracción capilar en dedo, saturación correcta de los círculos de la tarjeta Whatman 903, secado de 3 horas y envío prepagado.'
                  : 'Official instructions for collecting a blood sample using the Bloodo NAD+ Test Kit (puncture, spot saturation, 3-hour drying, and return protocol).'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setPreviewDoc({
                  fileUrl: '/docs/bloodo-nad-ifu.pdf',
                  downloadName: 'Bloodo_NAD_IFU.pdf',
                  title: isEs ? 'Instrucciones de Toma de Muestra (IFU)' : 'Sample Collection Instructions (IFU)',
                  subtitle: isEs ? 'Protocolo oficial de punción, secado y envío Whatman 903' : 'Whatman 903 DBS finger-prick, drying and mailer protocol'
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '8px 14px',
                background: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <FileText size={14} />
              <span>{isEs ? 'Ver Instrucciones de Muestreo (PDF)' : 'Preview Collection Guide (PDF)'}</span>
            </button>
          </div>

          {/* Card C: Bloodo 2026 Comprehensive Catalog */}
          <div style={{
            border: '1px solid #e2e8f0',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            borderRadius: '10px',
            padding: '1.1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isEs ? 'Catálogo & Guía Médica' : 'Catalog & Clinician Guide'}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#003666', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                  2026 Edition
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Catálogo Bloodo™ 2026 y Ficha Técnica Completa' : 'Bloodo™ 2026 Product Catalog & Technical Dossier'}
              </h4>
              <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: '1.45', margin: 0 }}>
                {isEs 
                  ? 'Guía completa con los 6 paneles analíticos DBS, especificaciones de muestreo, validación preanalítica y directrices de implementación en clínicas.'
                  : 'Comprehensive brochure detailing all 6 DBS diagnostic panels, pre-analytical validation criteria, and clinical integration frameworks for practices.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setPreviewDoc({
                  fileUrl: catalogPdf,
                  downloadName: 'bloodo-product-catalog-2026.pdf',
                  title: isEs ? 'Catálogo Bloodo™ 2026 y Ficha Técnica' : 'Bloodo™ 2026 Product Catalog & Technical Dossier',
                  subtitle: isEs ? 'Catálogo completo de los 6 paneles analíticos DBS y guía médica' : 'Complete 6-test DBS analytical portfolio and clinician guide'
                });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                padding: '8px 14px',
                background: '#ffffff',
                color: '#003666',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Download size={14} />
              <span>{isEs ? 'Ver Catálogo Completo 2026 (PDF)' : 'Preview Full 2026 Catalog (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Practitioner Pricing ── */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              if (onUnlockRequest) onUnlockRequest();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Lock size={12} />
            <span>{isEs ? 'Tarifas Clínicas B2B (Iniciar Sesión)' : 'Practitioner B2B Pricing (Sign In)'}</span>
          </button>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {isEs ? 'Precios exclusivos para clínicas y médicos autorizados.' : 'Exclusively for verified clinics, doctors, and institutions.'}
          </span>
        </div>
      </div>

      {/* Interactive In-App Document Preview Modal with Download & Print */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        fileUrl={previewDoc?.fileUrl}
        downloadUrl={previewDoc?.fileUrl}
        downloadName={previewDoc?.downloadName}
        title={previewDoc?.title || 'Document Preview'}
        subtitle={previewDoc?.subtitle}
        printable={true}
      />
    </section>
  );
}
