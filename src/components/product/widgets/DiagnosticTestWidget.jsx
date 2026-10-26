"use client";

import React from 'react';
import { 
  ShieldCheck, 
  FlaskConical, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Download,
  FileText
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import CopyableId from '@/components/ui/CopyableId';

/**
 * DiagnosticTestWidget
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant Resource Metadata Sidebar Card for CE-IVDR
 * diagnostic kits (Bloodo™ Diagnostic Suite).
 * 
 * Follows GCP Golden Rules:
 * - Rule #8: Semantic status badge (Active / Certified)
 * - Rule #11: Copy-on-click IDs (CopyableId for lab licenses & standards)
 * - Rule #30: Dense structured key-value resource inspection without clutter
 */
export default function DiagnosticTestWidget({
  product,
  slug,
  lang = 'en',
  publicUrl
}) {
  const isEs = lang === 'es';
  const cleanSlug = (slug || product?.slug || product?.id || '').toLowerCase();

  // Resolve official sample clinical report and catalog by test type
  let reportPdf = '/docs/bloodo-report-nad.pdf';
  let reportLabel = isEs ? 'Ver Informe Muestra (PDF)' : 'Sample Clinical Report (PDF)';
  let catalogPdf = '/docs/bloodo-product-catalog-2026.pdf';
  let catalogLabel = isEs ? 'Catálogo Bloodo (PDF)' : 'Download Catalog (PDF)';

  if (cleanSlug.includes('testosterone') || cleanSlug.includes('testosterona')) {
    reportPdf = '/docs/bloodo-report-testosterone-male.pdf';
    reportLabel = isEs ? 'Informe Testosterona (PDF)' : 'Sample Hormone Report (PDF)';
  } else if (cleanSlug.includes('cortisol')) {
    reportPdf = '/docs/bloodo-report-cortisol-am-pm.pdf';
    reportLabel = isEs ? 'Informe Ritmo Cortisol (PDF)' : 'Sample Cortisol Report (PDF)';
  } else if (cleanSlug.includes('hba1c') || cleanSlug.includes('hemoglobin') || cleanSlug.includes('glucose')) {
    reportPdf = '/docs/bloodo-report-hba1c.pdf';
    reportLabel = isEs ? 'Informe Glicación HbA1c (PDF)' : 'Sample HbA1c Report (PDF)';
  } else if (cleanSlug.includes('omega') && !cleanSlug.includes('teletest')) {
    reportPdf = '/docs/bloodo-report-omega-ratio.pdf';
    reportLabel = isEs ? 'Informe Ratio Omega-3 (PDF)' : 'Sample Lipid Report (PDF)';
  } else if (cleanSlug.includes('vitamin') || cleanSlug.includes('vitd') || cleanSlug.includes('vit-d')) {
    reportPdf = '/docs/bloodo-report-vitamin-d.pdf';
    reportLabel = isEs ? 'Informe Vitamina D (PDF)' : 'Sample Vit D Report (PDF)';
  } else if (cleanSlug.includes('htma') || cleanSlug.includes('mineralograma')) {
    reportPdf = '/docs/teletest-report-htma.pdf';
    reportLabel = isEs ? 'Informe Mineralograma HTMA (PDF)' : 'Sample HTMA Report (PDF)';
    catalogPdf = '/docs/teletest-report-htma.pdf';
    catalogLabel = isEs ? 'Guía TeleTest (PDF)' : 'TeleTest Diagnostics (PDF)';
  } else if (cleanSlug.includes('metabolizer')) {
    reportPdf = '/docs/teletest-report-metabolizer.pdf';
    reportLabel = isEs ? 'Informe Metabolizador (PDF)' : 'Sample Metabolizer Report (PDF)';
    catalogPdf = '/docs/teletest-report-metabolizer.pdf';
  } else if (cleanSlug.includes('celiac')) {
    reportPdf = '/docs/teletest-report-celiac.pdf';
    reportLabel = isEs ? 'Informe Genética Celíaco (PDF)' : 'Sample Celiac Report (PDF)';
    catalogPdf = '/docs/teletest-report-celiac.pdf';
  } else if (cleanSlug.includes('hla')) {
    reportPdf = '/docs/teletest-report-hla-autoimmunity.pdf';
    reportLabel = isEs ? 'Informe Autoinmunidad HLA (PDF)' : 'Sample HLA Report (PDF)';
    catalogPdf = '/docs/teletest-report-hla-autoimmunity.pdf';
  } else if (cleanSlug.includes('eterna')) {
    reportPdf = '/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf';
    reportLabel = isEs ? 'Informe Genetics 360° (PDF)' : 'Sample Genetics Report (PDF)';
    catalogPdf = '/documents/ETERNA_Genetic_Risk_Analysis_Sample_Report.pdf';
    catalogLabel = isEs ? 'Dossier ETERNA (PDF)' : 'ETERNA Dossier (PDF)';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      
      {/* ── GCP RESOURCE INSPECTION PANEL: CLINICAL LABORATORY SPECIFICATIONS ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '0.9rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Panel Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.55rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={15} color="#003666" />
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em' 
            }}>
              {isEs ? 'ESPECIFICACIONES DEL LABORATORIO' : 'LABORATORY SPECIFICATIONS'}
            </span>
          </div>
          
          {/* GCP-Style Semantic Certification Badge */}
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.67rem', 
            fontWeight: 700, 
            color: '#15803d', 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            padding: '2px 7px', 
            borderRadius: '9999px' 
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
            CE-IVDR
          </span>
        </div>

        {/* GCP Dense Key-Value Grid */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '0.75rem'
        }}>
          {/* Facility */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.71rem', fontWeight: 600 }}>
              {isEs ? 'Centro Analítico' : 'Facility'}
            </span>
            <span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>
              LifeLab1 Central Lab
            </span>
          </div>

          {/* License Number (CopyableId) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.71rem', fontWeight: 600 }}>
              {isEs ? 'Licencia Lab' : 'Lab License'}
            </span>
            <div>
              <CopyableId value="NM-334/NR-4864" />
            </div>
          </div>

          {/* Quality Standard */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.71rem', fontWeight: 600 }}>
              {isEs ? 'Norma Calidad' : 'Accreditation'}
            </span>
            <div>
              <CopyableId value="ISO 15189:2022" />
            </div>
          </div>

          {/* Specimen / Collection Medium */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.71rem', fontWeight: 600 }}>
              {isEs ? 'Tipo de Muestra' : 'Specimen'}
            </span>
            <span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right' }}>
              Capillary DBS (Whatman® 903)
            </span>
          </div>

          {/* Turnaround Time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.71rem', fontWeight: 600 }}>
              {isEs ? 'Plazo de Informe (TAT)' : 'Turnaround (TAT)'}
            </span>
            <span style={{ 
              color: '#0369a1', 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.70rem'
            }}>
              {isEs ? '~2 semanas' : '~2 weeks'}
            </span>
          </div>
        </div>

        {/* ── Action Buttons: Sample Report & Product Catalog ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.85rem' }}>
          {/* 1. Official Sample Clinical Report PDF */}
          <a
            href={reportPdf}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('selection')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              padding: '7px 12px',
              background: '#0d9488',
              color: '#ffffff',
              border: '1px solid #0f766e',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0f766e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0d9488';
            }}
            title={isEs ? 'Ver Informe de Resultados Clínico de Muestra' : 'View Sample Clinical Lab Results Report'}
          >
            <FileText size={14} color="#ffffff" />
            <span>{reportLabel}</span>
          </a>

          {/* 2. Official Product Catalog PDF */}
          <a
            href={catalogPdf}
            target="_blank"
            rel="noopener noreferrer"
            download={catalogPdf.split('/').pop()}
            onClick={() => triggerHaptic('selection')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              padding: '6px 12px',
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.74rem',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            title={isEs ? 'Descargar Catálogo Completo en PDF' : 'Download Complete Product Catalog in PDF'}
          >
            <Download size={13} color="#003666" />
            <span>{catalogLabel}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
