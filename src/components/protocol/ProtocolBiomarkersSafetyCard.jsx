"use client";

import React, { useState } from 'react';
import { Thermometer, Copy, Check, Activity, Info, ShieldCheck } from '@/lib/icons';
import { toast } from 'react-hot-toast';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolBiomarkersSafetyCard({
  biomarkers = [],
  onCopyLabRequisition,
  t,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [copiedOrder, setCopiedOrder] = useState(false);

  const handleCopy = async () => {
    if (onCopyLabRequisition) {
      onCopyLabRequisition();
      setCopiedOrder(true);
      setTimeout(() => setCopiedOrder(false), 2000);
      return;
    }

    const text = biomarkers.map((b, idx) => {
      const phase = b.phase || `Checkpoint ${idx + 1}`;
      const tests = b.tests || 'Standard monitoring panel';
      const timing = b.timing || (idx === 0 ? 'Day 0' : idx === 1 ? 'Week 4' : 'Week 8–12');
      return `[STEP ${idx + 1}: ${phase.toUpperCase()}] (${timing})\n• Required Panels: ${tests}\n• Clinical Target: ${b.rationale || 'Safety & response surveillance'}`;
    }).join('\n\n');

    try {
      await navigator.clipboard.writeText(`*CLINICAL LABORATORY SURVEILLANCE CHECKLIST*\n\n${text}\n\n_Atlas Diagnostics SSOT_`);
      setCopiedOrder(true);
      toast.success(isEs ? 'Orden de analítica copiada al portapapeles ✓' : 'Lab checklist copied to clipboard ✓');
      setTimeout(() => setCopiedOrder(false), 2000);
    } catch {
      toast.error('Could not copy lab requisition');
    }
  };

  return (
    <PublicSectionCard
      id="biomarkers-safety"
      icon={Thermometer}
      category={isEs ? 'MONITORIZACIÓN CLÍNICA & LABORATORIO' : 'CLINICAL SURVEILLANCE & LAB REQUISITIONS'}
      title={t.sec3Title}
      badge={isEs ? 'Supervisión de Laboratorio' : 'Laboratory Surveillance'}
      badgeVariant="green"
      rightAction={
        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            fontSize: '0.74rem',
            fontWeight: 700,
            border: '1px solid #cbd5e1',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'background 0.15s ease'
          }}
          title={isEs ? 'Copiar orden de analíticas para el laboratorio' : 'Copy clinical lab requisition checklist'}
        >
          {copiedOrder ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
          <span>{copiedOrder ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Orden Lab' : 'Copy Lab Order')}</span>
        </button>
      }
    >
      {/* ── Subtitle / Timeline Context ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#0d9488" />
          <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#334155' }}>
            {isEs
              ? 'Protocolo de vigilancia serológica estratificada en 3 fases analíticas'
              : 'Stratified serological surveillance protocol across 3 analytical phases'}
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
          ISO 15189 / CE-IVDR
        </span>
      </div>

      {/* ── 3-Column Linear Stepper (Laptop) & Connected Stepper (Mobile) ── */}
      <div
        className="proto-biomarkers-stepper"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1rem'
        }}
      >
        {biomarkers.map((b, idx) => {
          const stepThemes = [
            {
              accent: '#0284c7',
              bgLight: '#eff6ff',
              badgeBorder: '#bfdbfe',
              badgeText: '#1e40af',
              tag: isEs ? '01 BASAL' : '01 PRE-FLIGHT',
              statusLabel: isEs ? 'Línea de Base Requerida' : 'Baseline Clearance'
            },
            {
              accent: '#0d9488',
              bgLight: '#f0fdfa',
              badgeBorder: '#ccfbf1',
              badgeText: '#0f766e',
              tag: isEs ? '02 CONTROL' : '02 SURVEILLANCE',
              statusLabel: isEs ? 'Seguridad y Tolerabilidad' : 'Safety & Tolerability'
            },
            {
              accent: '#7c3aed',
              bgLight: '#f5f3ff',
              badgeBorder: '#ddd6fe',
              badgeText: '#6d28d9',
              tag: isEs ? '03 CONSOLIDACIÓN' : '03 VALIDATION',
              statusLabel: isEs ? 'Eficacia y Punto Final' : 'Efficacy & Consolidation'
            }
          ];

          const theme = stepThemes[idx % stepThemes.length];
          const testItems = String(b.tests || '').split(',').map(s => s.trim()).filter(Boolean);

          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderTop: `3px solid ${theme.accent}`,
                borderRadius: '10px',
                padding: '1.20rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Milestone Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.65rem',
                  marginBottom: '0.85rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: theme.accent,
                      flexShrink: 0
                    }} />
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {b.phase || `Checkpoint ${idx + 1}`}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.badgeBorder}`,
                    color: theme.badgeText,
                    letterSpacing: '0.03em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}>
                    {theme.tag}
                  </span>
                </div>

                {/* Status / Timing Subtitle */}
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{theme.statusLabel}</span>
                  {b.timing && <span>• {b.timing}</span>}
                </div>

                {/* Structured Tests Chips */}
                <div>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '0.45rem'
                  }}>
                    {isEs ? 'Analíticas Requeridas:' : 'Required Diagnostic Tests:'}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {testItems.map((testItem, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#f8fafc',
                          color: '#1e293b',
                          border: '1px solid #e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {testItem}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clinical Rationale if available */}
                {b.rationale && (
                  <div style={{
                    marginTop: '0.85rem',
                    padding: '0.50rem 0.65rem',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    borderLeft: `2px solid ${theme.accent}`,
                    fontSize: '0.72rem',
                    color: '#475569',
                    lineHeight: 1.45
                  }}>
                    {b.rationale}
                  </div>
                )}
              </div>

              {/* Step Footer Indicator */}
              <div style={{
                marginTop: '1rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.70rem',
                color: '#94a3b8'
              }}>
                <span>{isEs ? `Fase Analítica 0${idx + 1}` : `Surveillance Phase 0${idx + 1}`}</span>
                <span style={{ fontWeight: 600, color: theme.accent }}>
                  {idx === 0 ? 'Día 0' : idx === 1 ? 'Semana 4' : 'Semana 8–12'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </PublicSectionCard>
  );
}
