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

      {/* ── Google Cloud UX Linear Surveillance Sequence (1 Card Per Row) ── */}
      <div
        className="proto-biomarkers-stepper"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          width: '100%'
        }}
      >
        {biomarkers.map((b, idx) => {
          const stepThemes = [
            {
              accent: '#0284c7',
              bgLight: '#eff6ff',
              badgeBorder: '#bfdbfe',
              badgeText: '#1e40af',
              tag: '01 PRE-FLIGHT',
              statusLabel: 'Baseline Clearance',
              timingLabel: 'Day 0 (Baseline)'
            },
            {
              accent: '#0d9488',
              bgLight: '#f0fdfa',
              badgeBorder: '#ccfbf1',
              badgeText: '#0f766e',
              tag: '02 SURVEILLANCE',
              statusLabel: 'Safety & Tolerability',
              timingLabel: 'Week 4 – 6 (Mid-Cycle)'
            },
            {
              accent: '#7c3aed',
              bgLight: '#f5f3ff',
              badgeBorder: '#ddd6fe',
              badgeText: '#6d28d9',
              tag: '03 VALIDATION',
              statusLabel: 'Efficacy & Consolidation',
              timingLabel: 'Week 8 – 12 (Post-Cycle)'
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
                borderLeft: `4px solid ${theme.accent}`,
                borderRadius: '8px',
                padding: '1.15rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Card Header Row: Step Pill, Title, and Right Timing Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: theme.bgLight,
                    border: `1px solid ${theme.badgeBorder}`,
                    color: theme.badgeText,
                    letterSpacing: '0.04em'
                  }}>
                    {theme.tag}
                  </span>

                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.accent,
                    flexShrink: 0
                  }} />

                  <span style={{
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '0.01em'
                  }}>
                    {b.phase || `Surveillance Phase 0${idx + 1}`}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748b'
                  }}>
                    • {theme.statusLabel}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: theme.accent,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>⏱️</span>
                  <span>{theme.timingLabel}</span>
                </div>
              </div>

              {/* Diagnostic Tests Row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Required Diagnostic Tests:
                </span>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {testItems.map((testItem, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                        color: '#1e293b',
                        border: '1px solid #e2e8f0',
                        padding: '3px 10px',
                        borderRadius: '5px'
                      }}
                    >
                      {testItem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Rationale Note if Available */}
              {b.rationale && (
                <div style={{
                  padding: '0.50rem 0.75rem',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  borderLeft: `2px solid ${theme.accent}`,
                  fontSize: '0.74rem',
                  color: '#475569',
                  lineHeight: 1.45
                }}>
                  <strong style={{ color: '#1e293b' }}>Clinical Rationale:</strong> {b.rationale}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PublicSectionCard>
  );
}
