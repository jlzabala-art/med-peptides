"use client";

import React from 'react';
import { FileText, ShieldCheck, Download, Sparkles, CheckCircle2 } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

/**
 * SupplementSidebarWidget
 * Sidebar widget for clinical oral supplements (UltraPerson / Pharmapolis):
 * Displays:
 *  - Clinical Actions: PDF Monograph / Certificate of Analysis
 *  - Quality Badges: EU GMP, 100% Vegan, Acid-resistant HPMC capsules
 *  - Posology & Active Batch Traceability
 */
export default function SupplementSidebarWidget({
  _product,
  _slug,
  effectiveBatchCode,
  lang = 'en',
  onOpenPreviewModal,
  onOpenCoaModal,
  _onOpenInquiry
}) {
  const isEs = lang === 'es';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
      {/* ── CLINICAL ACTIONS ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        padding: '0.85rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={15} color="#003666" />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'ACCIONES CLÍNICAS' : 'CLINICAL ACTIONS'}
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>
            EU GMP · Vegan
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {onOpenPreviewModal && (
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); onOpenPreviewModal(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '8px 12px',
                background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
                color: '#ffffff', border: 'none', borderRadius: '6px',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.15s ease', boxShadow: '0 2px 4px rgba(0,54,102,0.18)'
              }}
            >
              <Download size={14} />
              <span>{isEs ? 'Ver Ficha Nutracéutica PDF' : 'View Supplement Monograph PDF'}</span>
            </button>
          )}

          {onOpenCoaModal && (
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); onOpenCoaModal(); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '7px 12px', background: '#ffffff', color: '#003666',
                border: '1px solid #cbd5e1', borderRadius: '6px',
                fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              <ShieldCheck size={14} color="#0284c7" />
              <span>{isEs ? 'Certificado de Calidad (CoA)' : 'Batch Quality Certificate'}</span>
            </button>
          )}
        </div>

        {/* Batch traceability row */}
        <div style={{
          marginTop: '0.75rem', padding: '6px 8px', background: '#f8fafc',
          borderRadius: '6px', border: '1px solid #e2e8f0',
          fontSize: '0.70rem', display: 'flex', justifyContent: 'space-between', color: '#64748b'
        }}>
          <span>{isEs ? 'Lote Activo:' : 'Current Lot:'}</span>
          <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>
            {effectiveBatchCode || 'AS-PHA-LT60-2610'}
          </strong>
        </div>
      </div>

      {/* ── CAPSULE & FORMULATION ADVANTAGE ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        borderRadius: '10px',
        border: '1px solid #bbf7d0',
        padding: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Sparkles size={14} color="#16a34a" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'TECNOLOGÍA GASTRORRESISTENTE' : 'DELAYED RELEASE TECH'}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.72rem', color: '#334155', lineHeight: 1.45 }}>
          {isEs 
            ? 'Cápsulas HPMC resistentes a los ácidos gástricos para una biodisponibilidad y absorción intestinal maximizada sin degradación estomacal.'
            : 'Acid-resistant HPMC capsules engineered for targeted intestinal delivery and maximal ingredient bioavailability.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
          <span style={{ fontSize: '0.64rem', padding: '2px 6px', background: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', color: '#166534', fontWeight: 600 }}>
            ✓ {isEs ? 'Sin Gluten' : 'Gluten Free'}
          </span>
          <span style={{ fontSize: '0.64rem', padding: '2px 6px', background: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', color: '#166534', fontWeight: 600 }}>
            ✓ {isEs ? 'Sin Lactosa' : 'Lactose Free'}
          </span>
          <span style={{ fontSize: '0.64rem', padding: '2px 6px', background: '#ffffff', border: '1px solid #86efac', borderRadius: '4px', color: '#166534', fontWeight: 600 }}>
            ✓ {isEs ? '100% Vegano' : '100% Vegan'}
          </span>
        </div>
      </div>
    </div>
  );
}
