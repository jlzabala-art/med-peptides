'use client';

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Droplets,
  FlaskConical,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';

/**
 * ChatMicroCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Pocket Reconstitution & Microdosing Calculator designed
 * specifically for embedded use inside Atlas Clinical AI Copilot.
 * 
 * Features:
 * - Real-time calculation of U-100 syringe marks (ticks)
 * - Auto-detection of compound vial size (5mg, 10mg, 500mg, etc.)
 * - Instant concentration (mg/mL & mcg/0.01mL)
 * - Visual syringe barrel gauge representation
 * - Mobile-first responsive layout (zero horizontal overflow)
 */
export default function ChatMicroCalculator({
  contextAnchor = null,
  lang = 'en',
  defaultExpanded = true,
}) {
  const isEs = lang === 'es';

  // 1. Intelligent initial mass detection from compound name/details
  const initialVialMg = useMemo(() => {
    const text = `${contextAnchor?.name || ''} ${contextAnchor?.canonicalName || ''} ${contextAnchor?.strength || ''}`;
    const mgMatch = text.match(/(\d+(?:\.\d+)?)\s*mg\b/i);
    if (mgMatch) {
      const parsed = parseFloat(mgMatch[1]);
      if (parsed > 0) return parsed;
    }
    return 5; // Default 5mg for research peptides
  }, [contextAnchor]);

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [vialMg, setVialMg] = useState(initialVialMg);
  const [bacWaterMl, setBacWaterMl] = useState(2.0);
  const [targetDoseMcg, setTargetDoseMcg] = useState(initialVialMg >= 10 ? 1000 : 250);

  // Quick preset options
  const VIAL_PRESETS = [2, 5, 10, 15, 20, 500];
  const WATER_PRESETS = [1.0, 2.0, 2.5, 3.0, 5.0];
  const DOSE_PRESETS = initialVialMg >= 500
    ? [25000, 50000, 100000] // 25mg, 50mg, 100mg for NAD+
    : initialVialMg >= 10
      ? [500, 1000, 2500, 5000]
      : [100, 250, 350, 500, 1000];

  // Mathematical outputs
  const {
    concMgMl,
    mcgPerUnit,
    unitsNeeded,
    totalDoses,
    isValid,
  } = useMemo(() => {
    const vMg = parseFloat(vialMg) || 0;
    const wMl = parseFloat(bacWaterMl) || 0;
    const dMcg = parseFloat(targetDoseMcg) || 0;

    if (vMg <= 0 || wMl <= 0 || dMcg <= 0) {
      return {
        concMgMl: 0,
        mcgPerUnit: 0,
        unitsNeeded: 0,
        totalDoses: 0,
        isValid: false,
      };
    }

    const cMgMl = vMg / wMl;
    const cMcgMl = cMgMl * 1000;
    // Standard U-100 syringe: 1 mL = 100 units -> 1 unit = 0.01 mL
    const uMcg = cMcgMl / 100;
    const uNeed = dMcg / uMcg;
    const tDoses = (vMg * 1000) / dMcg;

    return {
      concMgMl: cMgMl.toFixed(2),
      mcgPerUnit: uMcg.toFixed(1),
      unitsNeeded: Math.round(uNeed * 10) / 10,
      totalDoses: Math.floor(tDoses),
      isValid: true,
    };
  }, [vialMg, bacWaterMl, targetDoseMcg]);

  const handleReset = () => {
    triggerHaptic('light');
    setVialMg(initialVialMg);
    setBacWaterMl(2.0);
    setTargetDoseMcg(initialVialMg >= 10 ? 1000 : 250);
  };

  return (
    <div
      style={{
        margin: '10px 0',
        borderRadius: '10px',
        border: '1px solid #bae6fd',
        backgroundColor: '#f0f9ff',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)',
      }}
    >
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          setIsExpanded(!isExpanded);
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#e0f2fe',
          border: 'none',
          borderBottom: isExpanded ? '1px solid #bae6fd' : 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Calculator size={14} color="#0284c7" />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#003666', letterSpacing: '0.01em' }}>
            {isEs ? 'Calculadora Clínica de Reconstitución' : 'Clinical Reconstitution Calculator'}
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            U-100
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1' }}>
          <span style={{ fontSize: '0.70rem', fontWeight: 600 }}>
            {isExpanded ? (isEs ? 'Plegar' : 'Collapse') : (isEs ? 'Calcular' : 'Calculate')}
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Calculator Body */}
      {isExpanded && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Row 1: Vial Mass (mg) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
                {isEs ? '1. Cantidad de Péptido en Vial (mg):' : '1. Peptide Vial Content (mg):'}
              </label>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>
                {vialMg} mg
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {VIAL_PRESETS.map((pMg) => (
                <button
                  key={pMg}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVialMg(pMg);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.70rem',
                    fontWeight: vialMg === pMg ? 800 : 600,
                    backgroundColor: vialMg === pMg ? '#003666' : '#ffffff',
                    color: vialMg === pMg ? '#ffffff' : '#334155',
                    border: `1px solid ${vialMg === pMg ? '#003666' : '#cbd5e1'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pMg} mg
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Bacteriostatic Water Volume (mL) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={12} color="#0284c7" />
                <span>{isEs ? '2. Agua Bacteriostática Añadida (mL):' : '2. Bacteriostatic Water Added (mL):'}</span>
              </label>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7' }}>
                {bacWaterMl} mL
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {WATER_PRESETS.map((pMl) => (
                <button
                  key={pMl}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setBacWaterMl(pMl);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.70rem',
                    fontWeight: bacWaterMl === pMl ? 800 : 600,
                    backgroundColor: bacWaterMl === pMl ? '#0284c7' : '#ffffff',
                    color: bacWaterMl === pMl ? '#ffffff' : '#334155',
                    border: `1px solid ${bacWaterMl === pMl ? '#0284c7' : '#cbd5e1'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pMl.toFixed(1)} mL
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Target Dose (mcg) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FlaskConical size={12} color="#0d9488" />
                <span>{isEs ? '3. Dosis Deseada por Aplicación:' : '3. Target Dose Per Administration:'}</span>
              </label>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488' }}>
                {targetDoseMcg >= 1000 ? `${(targetDoseMcg / 1000).toFixed(1)} mg` : `${targetDoseMcg} mcg`}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {DOSE_PRESETS.map((pMcg) => (
                <button
                  key={pMcg}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTargetDoseMcg(pMcg);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.70rem',
                    fontWeight: targetDoseMcg === pMcg ? 800 : 600,
                    backgroundColor: targetDoseMcg === pMcg ? '#0d9488' : '#ffffff',
                    color: targetDoseMcg === pMcg ? '#ffffff' : '#334155',
                    border: `1px solid ${targetDoseMcg === pMcg ? '#0d9488' : '#cbd5e1'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pMcg >= 1000 ? `${pMcg / 1000} mg` : `${pMcg} mcg`}
                </button>
              ))}
            </div>
          </div>

          {/* Result Card: Syringe Units & Concentration */}
          {isValid && (
            <div
              style={{
                marginTop: '4px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #0284c7',
                borderRadius: '8px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {/* Primary Metric Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isEs ? 'Cargar en Jeringa U-100 (1mL):' : 'Draw in U-100 Syringe (1mL):'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#003666', lineHeight: 1.1 }}>
                    {unitsNeeded} <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0284c7' }}>{isEs ? 'unidades (Ticks)' : 'units (Ticks)'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isEs ? 'Concentración:' : 'Concentration:'}
                  </div>
                  <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                    {concMgMl} mg/mL
                  </div>
                </div>
              </div>

              {/* Visual Needle / Syringe Barrel Simulation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginBottom: '2px' }}>
                  <span>0 U</span>
                  <span style={{ fontWeight: 800, color: '#0284c7' }}>{unitsNeeded} U</span>
                  <span>100 U (1.0 mL)</span>
                </div>
                <div
                  style={{
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(2, unitsNeeded))}%`,
                      background: 'linear-gradient(90deg, #0284c7 0%, #0d9488 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>

              {/* Sub-metrics: Yield & Calibration */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.70rem',
                  color: '#475569',
                  paddingTop: '2px',
                }}
              >
                <div>
                  <strong>{isEs ? 'Rendimiento:' : 'Vial Yield:'}</strong> {totalDoses} {isEs ? 'dosis por vial' : 'doses per vial'}
                </div>
                <div>
                  <strong>1 U =</strong> {mcgPerUnit} mcg
                </div>
              </div>
            </div>
          )}

          {/* Clinical Compounding Advice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              fontSize: '0.67rem',
              color: '#64748b',
              lineHeight: 1.35,
              backgroundColor: '#f8fafc',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <ShieldAlert size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>
              {isEs
                ? 'Inyectar el agua bacteriostática lentamente por la pared interior del vial. No agitar vigorosamente; rotar suavemente entre las manos. Conservar reconstituido a 2°C – 8°C.'
                : 'Inject bacteriostatic water slowly down the interior vial wall. Do not agitate or shake violently; roll gently between palms. Store reconstituted solution at 2°C – 8°C.'}
            </span>
          </div>

          {/* Reset button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.68rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 4px',
              }}
            >
              <RotateCcw size={10} />
              <span>{isEs ? 'Restablecer valores' : 'Reset to default'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
