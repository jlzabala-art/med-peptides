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

        {/* ── GCP Standard Secondary Action Button: Download Product Catalog ── */}
        <a
          href="/docs/bloodo-product-catalog-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download="bloodo-product-catalog-2026.pdf"
          onClick={() => triggerHaptic('selection')}
          style={{
            width: '100%',
            marginTop: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            padding: '7px 12px',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.75rem',
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
          title={isEs ? 'Descargar Catálogo Completo Bloodo 2026 en PDF' : 'Download Complete Bloodo 2026 Catalog in PDF'}
        >
          <Download size={13} color="#003666" />
          <span>{isEs ? 'Catálogo Bloodo 2026 (PDF)' : 'Download Bloodo Catalog (PDF)'}</span>
        </a>
      </div>
    </div>
  );
}
