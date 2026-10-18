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
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorBlueprintDossierModal({
  isOpen,
  onClose,
  blueprint,
  onCustomizePrescribe,
  onRequestSample
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
              <span>Indicación Clínica y Pacientes Diana</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#1e293b', fontWeight: 600 }}>
              {blueprint.targetPatients || 'Pacientes evaluados para tratamiento personalizado'}
            </div>
            {blueprint.summary && (
              <p style={{ margin: '6px 0 0 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                {blueprint.summary}
              </p>
            )}
          </div>

          {/* Active Pharmaceutical Ingredients (APIs) Table */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>
                <FlaskConical size={14} style={{ color: '#0d9488' }} />
                <span>Composición y Principios Activos Farmacéuticos (APIs)</span>
              </div>
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                Vehículo: {cf.dispensingForm || 'Magistral'} ({cf.volume || '100 mL'})
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
                Pauta Posológica Recomendada de Referencia
              </div>
              <div style={{ fontSize: '0.82rem', color: '#14532d', lineHeight: 1.4 }}>
                {cf.posology}
              </div>
            </div>
          )}

          {/* Synergies */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              Sinergias Clínicas y Diagnósticas Validadas
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
              {blueprint.peptideSynergy && (
                <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                    🧬 {blueprint.peptideSynergy.name}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    {blueprint.peptideSynergy.role}
                  </div>
                </div>
              )}
              {blueprint.dermocosmeticSynergy && (
                <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                    💧 {blueprint.dermocosmeticSynergy.name}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    {blueprint.dermocosmeticSynergy.role}
                  </div>
                </div>
              )}
              {blueprint.diagnosticSynergy && (
                <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>
                    🔬 {blueprint.diagnosticSynergy.name}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                    {blueprint.diagnosticSynergy.role}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onRequestSample) onRequestSample(blueprint);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Package size={14} />
            <span>Solicitar Muestra para Clínica</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: 'transparent',
                color: '#64748b',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
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
                padding: '9px 18px',
                borderRadius: '6px',
                border: 'none',
                background: '#003666',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0, 54, 102, 0.2)'
              }}
            >
              <span>Personalizar y Prescribir para Paciente</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
