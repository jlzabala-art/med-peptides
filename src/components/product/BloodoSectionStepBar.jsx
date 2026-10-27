"use client";

import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';

export const BLOODO_SECTIONS = [
  { id: 'overview', step: 1, labelEn: '1. What It Is & Why Measure It', labelEs: '1. ¿Qué es y Para Qué Sirve?' },
  { id: 'when-to-test', step: 2, labelEn: '2. When to Take This Test', labelEs: '2. ¿Cuándo Hacerse el Test?' },
  { id: 'diagnostic-specs', step: 3, labelEn: '3. Reference Ranges & Biomarkers', labelEs: '3. ¿Qué Dice el Resultado? (Rangos)' },
  { id: 'collection-protocol', step: 4, labelEn: '4. How It Works (Sampling Guide)', labelEs: '4. ¿Cómo se Realiza? (Toma de Muestra)' },
  { id: 'specs-section', step: 5, labelEn: '5. Lab Standards & Clinical Downloads', labelEs: '5. Acreditación ISO y Descargas' },
  { id: 'bloodo-suite', step: 6, labelEn: '6. Bloodo™ Diagnostic Suite', labelEs: '6. Suite Diagnóstica Bloodo™' },
  { id: 'clinical-synergy', step: 7, labelEn: '7. Atlas Recommendations', labelEs: '7. Recomendaciones Atlas' }
];

export default function BloodoSectionStepBar({
  currentSectionId = 'overview',
  lang = 'en',
  onSelectSection = null
}) {
  const isEs = lang === 'es';
  const currentIndex = BLOODO_SECTIONS.findIndex(s => s.id === currentSectionId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const currentStep = safeIndex + 1;

  const prev = safeIndex > 0 ? BLOODO_SECTIONS[safeIndex - 1] : null;
  const next = safeIndex < BLOODO_SECTIONS.length - 1 ? BLOODO_SECTIONS[safeIndex + 1] : null;

  const handleNav = (targetId) => {
    triggerHaptic('light');
    if (onSelectSection) {
      onSelectSection(targetId);
    }
  };

  return (
    <nav 
      aria-label="Bloodo Diagnostic Sections Navigation"
      style={{
        marginTop: '2rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}
    >
      {/* Previous Section Button */}
      {prev ? (
        <button
          type="button"
          onClick={() => handleNav(prev.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#94a3b8';
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <ArrowLeft size={15} color="#64748b" />
          <span>{isEs ? prev.labelEs : prev.labelEn}</span>
        </button>
      ) : (
        <div style={{ flex: '0 0 auto' }} />
      )}

      {/* Middle Progress Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '9999px',
        background: '#f1f5f9',
        border: '1px solid #e2e8f0',
        fontSize: '0.76rem',
        fontWeight: 700,
        color: '#475569'
      }}>
        <span>{isEs ? `Paso ${currentStep} de 7` : `Step ${currentStep} of 7`}</span>
      </div>

      {/* Next Section Button or Loop Back */}
      {next ? (
        <button
          type="button"
          onClick={() => handleNav(next.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '8px',
            background: '#0284c7',
            border: '1px solid #0284c7',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#0369a1';
            e.currentTarget.style.borderColor = '#0369a1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#0284c7';
            e.currentTarget.style.borderColor = '#0284c7';
          }}
        >
          <span>{isEs ? `Siguiente: ${next.labelEs}` : `Next: ${next.labelEn}`}</span>
          <ArrowRight size={15} color="#ffffff" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleNav('overview')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #0284c7',
            color: '#0284c7',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f9ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
          }}
        >
          <RotateCcw size={14} color="#0284c7" />
          <span>{isEs ? 'Volver al Inicio (Paso 1)' : 'Back to Step 1 (Overview)'}</span>
        </button>
      )}
    </nav>
  );
}
