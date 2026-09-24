"use client";

import React from 'react';
import { Thermometer, Copy, Activity, Info } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';

export default function ProtocolBiomarkersSafetyCard({
  biomarkers = [],
  onCopyLabRequisition,
  t,
  lang = 'en'
}) {
  return (
    <PublicSectionCard
      id="biomarkers-safety"
      icon={Thermometer}
      category={lang === 'es' ? 'MONITORIZACIÓN CLÍNICA' : 'CLINICAL MONITORING'}
      title={t.sec3Title}
      badge={lang === 'es' ? 'Supervisión de Laboratorio' : 'Laboratory Surveillance'}
      badgeVariant="green"
      rightAction={
        <button
          type="button"
          onClick={onCopyLabRequisition}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontSize: '0.74rem',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          title={lang === 'es' ? 'Copiar orden de analíticas para el laboratorio' : 'Copy clinical lab requisition checklist'}
        >
          <Copy size={13} />
          <span>{lang === 'es' ? 'Copiar Orden Lab' : 'Copy Lab Order'}</span>
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {biomarkers.map((b, idx) => {
          const stepColors = [
            { bg: '#f0fdf4', border: '#bbf7d0', badgeBg: '#dcfce7', badgeText: '#166534', dot: '#22c55e' },
            { bg: '#fffbeb', border: '#fef3c7', badgeBg: '#fef3c7', badgeText: '#92400e', dot: '#f59e0b' },
            { bg: '#eff6ff', border: '#bfdbfe', badgeBg: '#dbeafe', badgeText: '#1e40af', dot: '#3b82f6' }
          ];
          const theme = stepColors[idx % stepColors.length];
          const testItems = String(b.tests || '').split(',').map(s => s.trim()).filter(Boolean);

          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              {/* Step Milestone Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.dot, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {idx === 0 ? 'Step 1' : idx === 1 ? 'Step 2' : 'Step 3'} · {b.phase || `Checkpoint ${idx + 1}`}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  letterSpacing: '0.02em'
                }}>
                  {idx === 0 ? (lang === 'es' ? 'Pre-Inicio' : 'Pre-Flight') : idx === 1 ? (lang === 'es' ? 'Seguridad' : 'Surveillance') : (lang === 'es' ? 'Consolidación' : 'Validation')}
                </span>
              </div>

              {/* Structured Test Chips Matrix */}
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                  {lang === 'es' ? 'Analíticas Requeridas:' : 'Required Diagnostic Tests:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {testItems.map((testItem, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        lineHeight: 1.3
                      }}
                    >
                      <Activity size={11} style={{ color: '#0284c7', flexShrink: 0 }} />
                      <span>{testItem}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinical Rationale Context */}
              {b.notes && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  fontSize: '0.73rem',
                  color: '#475569',
                  lineHeight: 1.45,
                  marginTop: 'auto',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.55rem 0.75rem'
                }}>
                  <Info size={13} style={{ color: '#0284c7', flexShrink: 0, marginTop: '2px' }} />
                  <span>{b.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PublicSectionCard>
  );
}
