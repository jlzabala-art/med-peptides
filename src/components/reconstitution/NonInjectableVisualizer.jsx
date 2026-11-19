"use client";

import React from 'react';
import { ShieldCheck } from '@/lib/icons';

/**
 * NonInjectableVisualizer
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean, patient-friendly visual administration card for non-injectable peptide
 * formats: Nasal Spray (metered pump), Oral Capsules / Troches, and Topical Serum / Cream.
 */
export default function NonInjectableVisualizer({
  format = 'spray', // 'spray' | 'capsule' | 'topical'
  peptideName = 'Peptide',
  strengthLabel = '30 mg',
  // Spray props
  sprayPuffs = 1,
  sprayMcgPerPuff = 300,
  sprayDoseMcg = 300,
  sprayRemainingDoses = 100,
  sprayVolumeMl = 10,
  // Oral props
  oralUnitsPerDose = 1,
  // Topical props
  topicalDoseLabel = '1 mL / 2 pumps',
  lang = 'en',
}) {
  const isEs = lang === 'es';

  if (format === 'spray') {
    const doseDisplay = sprayDoseMcg >= 1000
      ? `${(sprayDoseMcg / 1000).toFixed(2)} mg`
      : `${sprayDoseMcg} mcg`;
    return (
      <div style={{
        width: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)',
        border: '1.5px solid #d8b4fe',
        borderRadius: '14px',
        padding: '1.15rem clamp(0.85rem, 2.5vw, 1.5rem)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #e9d5ff',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEs ? `Spray Nasal Dosificado (${sprayVolumeMl} mL · ${strengthLabel})` : `Metered Nasal Spray (${sprayVolumeMl} mL · ${strengthLabel})`}
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {isEs
                ? `Aplica ${sprayPuffs} pulverización(es) → ${doseDisplay}`
                : `Deliver ${sprayPuffs} spray(s) → ${doseDisplay}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ background: '#f3e8ff', border: '1.5px solid #c084fc', borderRadius: '10px', padding: '6px 14px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 900, fontFamily: 'monospace', color: '#6b21a8', lineHeight: 1 }}>
                {sprayPuffs}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7e22ce' }}>
                {sprayPuffs === 1 ? (isEs ? 'Spray' : 'Spray') : (isEs ? 'Sprays' : 'Sprays')}
              </span>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>({doseDisplay})</span>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.64rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase' }}>
                {isEs ? 'Dosis / Frasco' : 'Doses / Bottle'}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#581c87', fontFamily: 'monospace' }}>
                ~{sprayRemainingDoses}
              </div>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 640 112" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={isEs ? 'Esquema de aplicación de spray nasal' : 'Nasal spray metered delivery diagram'}>
          {/* Mist cone */}
          <path d="M 118 28 L 72 8 L 72 48 Z" fill="#c084fc" fillOpacity="0.22" />
          <circle cx="96" cy="24" r="2.2" fill="#9333ea" />
          <circle cx="84" cy="18" r="1.8" fill="#9333ea" />
          <circle cx="84" cy="34" r="1.8" fill="#9333ea" />
          {/* Nasal Bottle */}
          <path d="M 118 22 L 146 18 L 146 38 L 118 34 Z" fill="#9333ea" />
          <rect x="146" y="14" width="12" height="28" rx="2" fill="#cbd5e1" />
          <rect x="158" y="10" width="96" height="36" rx="6" fill="#ffffff" stroke="#9333ea" strokeWidth="2" />
          <text x="206" y="32" fill="#6b21a8" fontSize="11" fontWeight="800" textAnchor="middle">
            {peptideName.slice(0, 14)}
          </text>
          {/* Spec pills */}
          <rect x="284" y="12" width="160" height="82" rx="10" fill="#ffffff" stroke="#e9d5ff" strokeWidth="1.2" />
          <text x="364" y="36" fill="#7e22ce" fontSize="9.5" fontWeight="800" textAnchor="middle">
            {isEs ? 'DOSIS POR PULSACIÓN' : 'DOSE PER SPRAY'}
          </text>
          <text x="364" y="60" fill="#0f172a" fontSize="16" fontWeight="900" textAnchor="middle" fontFamily="monospace">
            {sprayMcgPerPuff} mcg
          </text>
          <text x="364" y="79" fill="#64748b" fontSize="9" textAnchor="middle">
            0.10 mL / {isEs ? 'pulsación' : 'actuation'}
          </text>

          <rect x="460" y="12" width="166" height="82" rx="10" fill="#ffffff" stroke="#e9d5ff" strokeWidth="1.2" />
          <text x="543" y="36" fill="#7e22ce" fontSize="9.5" fontWeight="800" textAnchor="middle">
            {isEs ? 'POSICIÓN CORRECTA' : 'CORRECT ANGLE'}
          </text>
          <text x="543" y="58" fill="#0f172a" fontSize="11.5" fontWeight="800" textAnchor="middle">
            {isEs ? 'Cabeza Recta · Suave' : 'Head Level · Gentle'}
          </text>
          <text x="543" y="79" fill="#64748b" fontSize="9" textAnchor="middle">
            {isEs ? 'Sin inclinar hacia atrás' : 'Do not tilt head back'}
          </text>
        </svg>

        <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.9rem', borderRadius: '8px', background: '#ffffff', border: '1px solid #e9d5ff', fontSize: '0.76rem', color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={15} color="#9333ea" style={{ flexShrink: 0 }} />
          <span>
            {isEs
              ? 'Sin agujas ni reconstitución manual. Conservar vertical en nevera (2°C–8°C).'
              : 'Needle-free metered delivery — zero reconstitution required. Store upright at 2°C–8°C.'}
          </span>
        </div>
      </div>
    );
  }

  if (format === 'capsule') {
    return (
      <div style={{
        width: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)',
        border: '1.5px solid #99f6e4',
        borderRadius: '14px',
        padding: '1.15rem clamp(0.85rem, 2.5vw, 1.5rem)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isEs ? `Vía Oral / Sublingual · ${strengthLabel}` : `Oral / Sublingual Format · ${strengthLabel}`}
            </div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {isEs
                ? `Tomar ${oralUnitsPerDose} ${oralUnitsPerDose === 1 ? 'cápsula / troche' : 'cápsulas / troches'} en ayunas`
                : `Take ${oralUnitsPerDose} ${oralUnitsPerDose === 1 ? 'capsule / troche' : 'capsules / troches'} on empty stomach`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
              {isEs
                ? '30 minutos antes del desayuno con un vaso de agua natural (250 mL). Tragar entera.'
                : '30 minutes before breakfast with a full 250 mL glass of plain water. Swallow intact.'}
            </div>
          </div>

          <div style={{ background: '#ccfbf1', border: '1.5px solid #2dd4bf', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.55rem', fontWeight: 900, fontFamily: 'monospace', color: '#0f766e', lineHeight: 1 }}>
              {oralUnitsPerDose}×
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#115e59' }}>{strengthLabel}</div>
          </div>
        </div>
      </div>
    );
  }

  // Topical Serum / Cream
  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, #ffffff 0%, #fffbeb 100%)',
      border: '1.5px solid #fde68a',
      borderRadius: '14px',
      padding: '1.15rem clamp(0.85rem, 2.5vw, 1.5rem)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isEs ? `Aplicación Tópica / Capilar · ${peptideName}` : `Topical / Scalp Formula · ${peptideName}`}
          </div>
          <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {isEs ? `Aplicar ${topicalDoseLabel} sobre piel/cuero cabelludo limpio` : `Apply ${topicalDoseLabel} onto clean, dry skin or scalp`}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
            {isEs
              ? 'Masajear suavemente hasta absorción completa. Dejar actuar al menos 10 minutos antes de otros productos.'
              : 'Massage gently until fully absorbed. Allow at least 10 minutes before applying other skincare.'}
          </div>
        </div>

        <div style={{ background: '#fef3c7', border: '1.5px solid #f59e0b', borderRadius: '10px', padding: '8px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'monospace', color: '#92400e', lineHeight: 1.1 }}>
            {topicalDoseLabel}
          </div>
          <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#b45309' }}>
            {isEs ? 'Uso externo' : 'External use only'}
          </div>
        </div>
      </div>
    </div>
  );
}
