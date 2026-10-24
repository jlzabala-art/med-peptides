"use client";

import React from 'react';
import X from 'lucide-react/dist/esm/icons/x';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Stethoscope from 'lucide-react/dist/esm/icons/stethoscope';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Package from 'lucide-react/dist/esm/icons/package';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import FlaskConical from 'lucide-react/dist/esm/icons/flask-conical';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorBlueprintDossierModal({
  isOpen,
  onClose,
  blueprint,
  onCustomizePrescribe
}) {
  if (!isOpen || !blueprint) return null;

  const cf = blueprint.compoundingFormula || {};
  const items = Array.isArray(cf.items) ? cf.items : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          border: '1px solid #e2e8f0',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #003666 0%, #0d9488 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dossier"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.05em'
              }}
            >
              {blueprint.badge || 'Pharmaceutical Formulation Monograph'}
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.85, fontFamily: 'monospace' }}>
              {blueprint.code}
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 6px 0', lineHeight: 1.3 }}>
            {blueprint.title}
          </h2>

          <div style={{ fontSize: '0.80rem', opacity: 0.9 }}>
            Specialty Procedure: <strong>{blueprint.clinicalProcedure || blueprint.targetProcedure}</strong>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Target Patients & Clinical Indications */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '18px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '4px' }}>
              <Stethoscope size={14} />
              <span>Clinical Indication & Target Patients</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 600 }}>
              {blueprint.targetPatients || 'Patients evaluated for personalized compounded therapy'}
            </div>
            {blueprint.summary && (
              <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                {blueprint.summary}
              </p>
            )}
          </div>

          {/* Active Pharmaceutical Ingredients (APIs) Table — Magistral Compounding */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#e8f0fe',
                    color: '#1a73e8',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <FlaskConical size={13} />
                  Formulación Magistral Individualizada (Farmacia Elaboradora)
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#f1f3f4',
                    color: '#3c4043'
                  }}
                >
                  Elaboración Galénica On-Demand · Concentraciones Titulables
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#003666', fontWeight: 600, background: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px' }}>
                Vehículo Galénico: {cf.dispensingForm || 'Compounded'} ({cf.volume || '100 mL'})
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.84rem' }}>
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#003666',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {item.concentration}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', flex: 1, textAlign: 'right' }}>
                    {item.role || 'Active Compound'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Posology & Administration */}
          {cf.posology && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '18px'
              }}
            >
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>
                Recommended Reference Posology & Regimen
              </div>
              <div style={{ fontSize: '0.82rem', color: '#14532d', lineHeight: 1.4 }}>
                {cf.posology}
              </div>
            </div>
          )}

          {/* Synergies — Single-Line Clickable Rows (Monographs / Catalog Specs) */}
          {(() => {
            const synergyList = [
              blueprint.peptideSynergy && {
                type: 'peptide',
                badge: 'Peptide Co-Therapy',
                icon: '🧬',
                color: '#4338ca',
                bg: '#f8faff',
                border: '#c7d2fe',
                badgeBg: '#e0e7ff',
                name: blueprint.peptideSynergy.name,
                role: blueprint.peptideSynergy.role,
                url: blueprint.protocolUrl || `/catalog?q=${encodeURIComponent(blueprint.peptideSynergy.name.split(' ')[0] || 'peptide')}`
              },
              blueprint.dermocosmeticSynergy && {
                type: 'colway',
                badge: 'Native Collagen & ECM',
                icon: '💧',
                color: '#047857',
                bg: '#f9fefb',
                border: '#a7f3d0',
                badgeBg: '#d1fae5',
                name: blueprint.dermocosmeticSynergy.name,
                role: blueprint.dermocosmeticSynergy.role,
                url: `/catalog?q=${encodeURIComponent(blueprint.dermocosmeticSynergy.name.toLowerCase().includes('colway') ? 'colway' : blueprint.dermocosmeticSynergy.name)}`
              },
              blueprint.diagnosticSynergy && {
                type: 'diagnostic',
                badge: 'Biomarker Panel',
                icon: '🔬',
                color: '#be185d',
                bg: '#fdf7f9',
                border: '#fbcfe8',
                badgeBg: '#fce7f3',
                name: blueprint.diagnosticSynergy.name,
                role: blueprint.diagnosticSynergy.role,
                url: blueprint.diagnosticSynergy.slug
                  ? `/p/${blueprint.diagnosticSynergy.slug}`
                  : `/catalog?q=${encodeURIComponent(blueprint.diagnosticSynergy.name.toLowerCase().includes('bloodo') ? 'bloodo' : blueprint.diagnosticSynergy.name.toLowerCase().includes('tricho') ? 'trichotest' : 'diagnostic')}`
              },
              blueprint.nutraceuticalSynergy && {
                type: 'nutraceutical',
                badge: 'Oral Nutraceutical',
                icon: '💊',
                color: '#b45309',
                bg: '#fffdf5',
                border: '#fde68a',
                badgeBg: '#fef3c7',
                name: blueprint.nutraceuticalSynergy.name,
                role: blueprint.nutraceuticalSynergy.role,
                url: blueprint.nutraceuticalSynergy.slug ? `/p/${blueprint.nutraceuticalSynergy.slug}` : '/catalog?q=ultraperson'
              }
            ].filter(Boolean);

            if (synergyList.length === 0) return null;

            return (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={13} style={{ color: '#1a73e8' }} />
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Productos Complementarios de Catálogo y Diagnóstico ({synergyList.length} Referencias Stock)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#1a73e8', fontWeight: 600 }}>
                    Dispensación directa · Clic para ver ficha clínica ↗
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {synergyList.map((item, sIdx) => (
                    <a
                      key={sIdx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerHaptic('selection')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        padding: '8px 12px',
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                        borderRadius: '7px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = item.color;
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = item.border;
                        e.currentTarget.style.background = item.bg;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={`Click to open clinical monograph and ordering specs for ${item.name}`}
                    >
                      {/* Left: Icon + Category Badge + Name + Role on 1 Line */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{item.icon}</span>
                        <span
                          style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: item.badgeBg,
                            color: item.color,
                            textTransform: 'uppercase',
                            flexShrink: 0,
                            letterSpacing: '0.03em'
                          }}
                        >
                          {item.badge}
                        </span>
                        <span
                          style={{
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flexShrink: 0,
                            maxWidth: '260px'
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.70rem',
                            color: '#64748b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1
                          }}
                        >
                          · {item.role}
                        </span>
                      </div>

                      {/* Right: Explicit Clickable Indicator */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: item.color,
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: item.badgeBg
                        }}
                      >
                        <span>Monograph</span>
                        <ExternalLink size={11} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: '4px',
              border: '1px solid #dadce0',
              background: '#ffffff',
              color: '#3c4043',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f8f9fa'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onClose();
              if (onCustomizePrescribe) onCustomizePrescribe(blueprint);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: '#1a73e8',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(26, 115, 232, 0.3)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1557b0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#1a73e8'; }}
          >
            <FlaskConical size={14} />
            <span>Prescribir Fórmula Magistral (Abrir Recetario)</span>
            <ArrowRight size={13} />
          </button>
        </div>
        </div>
      </div>
  );
}
