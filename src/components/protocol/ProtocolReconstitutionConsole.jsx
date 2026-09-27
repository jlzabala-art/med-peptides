"use client";

import React, { useState, useMemo } from 'react';
import { Syringe, Check, AlertCircle, Droplets, ArrowRight, ShieldCheck, Info } from '@/lib/icons';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';

/**
 * ProtocolReconstitutionConsole
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive reconstitution & calibrated horizontal U-100 syringe console.
 * Styled to perfectly harmonize with the clean clinical aesthetic of the protocol guide.
 *
 * Features:
 * - Two top cards: (1) Dilution Architecture (API & BAC volume) and (2) Phase-by-Phase Draw Selector.
 * - Full-width horizontal U-100 syringe visualizer spanning 100% available container width.
 * - Precision medical graduation scale (0 to 100 Units, with 2U, 5U, and 10U ticks).
 * - Smooth animated plunger draw & liquid fill matching the selected phase.
 * - Dynamic laser alignment guide showing exact volumetric target (e.g. 12 Units · 0.12 mL).
 * - Cohesive clinical palette (clean whites, slate borders, brand corporate blue #003666 and teal #0d9488).
 */

export default function ProtocolReconstitutionConsole({
  reconData = [],
  activeReconTab = 0,
  setActiveReconTab,
  currentRecon,
  lang = 'en'
}) {
  const [selectedPhaseIdx, setSelectedPhaseIdx] = useState(0);

  // Auto-reset phase index if recon tab changes
  React.useEffect(() => {
    setSelectedPhaseIdx(0);
  }, [activeReconTab, currentRecon?.name]);

  if (!currentRecon) return null;

  const dosingScale = currentRecon.dosingScale || [];
  const activeDosing = dosingScale[selectedPhaseIdx] || dosingScale[0] || null;

  // Extract numeric units from strings like "12 Units (0.12 mL)" or "40 Units"
  const numericUnits = useMemo(() => {
    if (!activeDosing?.units) return 40;
    const match = String(activeDosing.units).match(/([0-9.]+)\s*Unit/i);
    return match ? parseFloat(match[1]) : 40;
  }, [activeDosing]);

  // Calculated mL volume (100 U = 1.0 mL)
  const volumeMl = (numericUnits / 100).toFixed(2);
  const isOver100 = numericUnits > 100;
  const clampedUnits = Math.min(Math.max(0, numericUnits), 100);

  // SVG Geometry constants for the horizontal syringe:
  // Barrel span: x = 90 (0 Units) to x = 690 (100 Units) -> 600px width (6px per unit)
  const BARREL_START_X = 90;
  const BARREL_WIDTH = 600;
  const BARREL_END_X = BARREL_START_X + BARREL_WIDTH;
  const BARREL_Y = 48;
  const BARREL_HEIGHT = 44;
  
  // Plunger position:
  const fillWidth = (clampedUnits / 100) * BARREL_WIDTH;
  const plungerX = BARREL_START_X + fillWidth;

  // Generate graduation ticks (every 2 units minor, every 5 units mid, every 10 units major)
  const graduationTicks = useMemo(() => {
    const ticks = [];
    for (let u = 0; u <= 100; u += 2) {
      const isMajor = u % 10 === 0;
      const isMid = u % 5 === 0 && !isMajor;
      const x = BARREL_START_X + (u / 100) * BARREL_WIDTH;
      ticks.push({ unit: u, x, isMajor, isMid });
    }
    return ticks;
  }, []);

  return (
    <PublicSectionCard
      id="reconstitution-console"
      icon={Syringe}
      category={lang === 'es' ? 'CONSOLA DE RECONSTITUCIÓN' : 'RECONSTITUTION CONSOLE'}
      title={lang === 'es' ? 'Consola Interactiva de Reconstitución & Calibración de Jeringa' : 'Interactive Reconstitution & Syringe Calibration Console'}
      badge={lang === 'es' ? 'Calibrado U-100' : 'U-100 Calibrated'}
      badgeVariant="cyan"
      rightAction={
        reconData.length > 1 ? (
          <PublicSegmentedControl
            size="sm"
            items={reconData.map((rd, idx) => ({ id: idx, label: rd.name }))}
            activeId={activeReconTab}
            onChange={setActiveReconTab}
          />
        ) : null
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* ── TOP ROW: Dilution Architecture (Left) + Phase Draw Selector (Right) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.25rem',
          alignItems: 'stretch'
        }}>
          {/* Column 1: Dilution Architecture */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0284c7',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Droplets size={15} />
                <span>{lang === 'es' ? 'Arquitectura de Dilución' : 'Dilution Architecture'} • {currentRecon.name}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    {lang === 'es' ? 'Contenido Activo de Vial' : 'Vial Active API'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {currentRecon.strength}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                    {lang === 'es' ? 'Volumen Agua BAC' : 'BAC Diluent Volume'}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                    {currentRecon.bacVolume}
                  </div>
                </div>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {lang === 'es' ? 'Concentración Resultante' : 'Resulting Concentration'}
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e3a8a', marginTop: '2px' }}>
                  {currentRecon.concentration}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.55 }}>
                <strong style={{ color: '#0f172a' }}>{lang === 'es' ? 'Almacenamiento:' : 'Storage:'}</strong> {currentRecon.storage}
              </div>
            </div>

            {currentRecon.steps && currentRecon.steps.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  {lang === 'es' ? 'Técnica de Reconstitución' : 'Reconstitution Technique'}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.45 }}>
                  {currentRecon.steps[2] || currentRecon.steps[0]}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Interactive Phase-by-Phase Draw Units */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0d9488',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>{lang === 'es' ? 'Calibración por Fase' : 'Phase-by-Phase Draw Units'}</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'none' }}>
                  {lang === 'es' ? 'Haz clic para simular' : 'Click to inspect draw'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {dosingScale.map((ds, idx) => {
                  const isSelected = selectedPhaseIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedPhaseIdx(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.8rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0d9488' : '1px solid #e2e8f0',
                        background: isSelected ? '#f0fdfa' : '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(13, 148, 136, 0.12)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{
                          fontWeight: isSelected ? 800 : 700,
                          color: isSelected ? '#0f766e' : '#0f172a',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {isSelected && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488' }} />}
                          <span>{ds.phase}</span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                          {lang === 'es' ? 'Dosis Objetivo:' : 'Target Dose:'} <strong style={{ color: '#334155' }}>{ds.dose}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.90rem',
                          fontWeight: 800,
                          color: isSelected ? '#0f766e' : '#0d9488',
                          background: isSelected ? '#ccfbf1' : '#ffffff',
                          border: isSelected ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '7px',
                          display: 'inline-block'
                        }}>
                          {ds.units}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.45 }}>
              ✓ {lang === 'es' ? 'Calibrado para jeringas estándar U-100 de insulina (100 Unidades = 1.0 mL).' : 'Calibrated for standard U-100 insulin syringes (100 Units = 1.0 mL).'}
            </div>
          </div>
        </div>

        {/* ── FULL-WIDTH HORIZONTAL SYRINGE VISUALIZER CARD ── */}
        <div style={{
          width: '100%',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid #cbd5e1',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Measurement HUD Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
            paddingBottom: '0.85rem',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                backgroundColor: '#003666',
                color: '#ffffff'
              }}>
                <Syringe size={16} />
              </span>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {lang === 'es' ? 'Medición de Extracción en Jeringa U-100' : 'U-100 Draw Measurement'} • {activeDosing?.phase || 'Active Phase'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  {activeDosing?.dose ? `${lang === 'es' ? 'Dosis prescrita' : 'Target Dose'}: ${activeDosing.dose}` : currentRecon.name}
                </div>
              </div>
            </div>

            {/* Big Clinical Telemetry Readout */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '6px',
              background: '#f0fdfa',
              border: '1.5px solid #99f6e4',
              borderRadius: '8px',
              padding: '6px 14px'
            }}>
              <span style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: isOver100 ? '#dc2626' : '#0f766e',
                fontFamily: 'monospace',
                lineHeight: 1
              }}>
                {numericUnits.toFixed(0)}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f766e' }}>
                {lang === 'es' ? 'Unidades' : 'Units'}
              </span>
              <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#64748b', marginLeft: '4px' }}>
                ({volumeMl} mL)
              </span>
            </div>
          </div>

          {/* Calibrated Horizontal Syringe SVG Canvas */}
          <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ minWidth: '640px', position: 'relative' }}>
              <svg
                viewBox="0 0 880 140"
                width="100%"
                height="auto"
                style={{ display: 'block', overflow: 'visible' }}
              >
                <defs>
                  {/* Glass Barrel Cylindrical Highlight */}
                  <linearGradient id="horizontalGlass" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="25%" stopColor="#f8fafc" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="75%" stopColor="#e2e8f0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.75" />
                  </linearGradient>

                  {/* Medical Liquid Gradient */}
                  <linearGradient id="liquidFillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isOver100 ? '#f87171' : '#0d9488'} stopOpacity="0.85" />
                    <stop offset="70%" stopColor={isOver100 ? '#ef4444' : '#0284c7'} stopOpacity="0.75" />
                    <stop offset="100%" stopColor={isOver100 ? '#dc2626' : '#0369a1'} stopOpacity="0.9" />
                  </linearGradient>

                  {/* Rubber Plunger Gradient */}
                  <linearGradient id="rubberPlunger" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="40%" stopColor="#1e293b" />
                    <stop offset="70%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>

                  {/* Plunger Shaft Metal Gradient */}
                  <linearGradient id="plungerStem" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>

                  {/* Drop Shadow for dynamic indicator */}
                  <filter id="laserShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#003666" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* 1. NEEDLE ASSEMBLY (Left Flank) */}
                {/* 30G Steel Needle */}
                <line x1="15" y1="70" x2="65" y2="70" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                <polygon points="15,69 22,67.5 22,72.5" fill="#64748b" />

                {/* Translucent Luer Slip Hub */}
                <rect x="65" y="60" width="16" height="20" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                <rect x="81" y="62" width="9" height="16" fill="#94a3b8" />

                {/* 2. PLUNGER ROD & SHAFT (Extends from rubber seal to the right thumb rest) */}
                <g style={{ transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                  {/* Stem */}
                  <rect
                    x={plungerX}
                    y={BARREL_Y + 14}
                    width={Math.max(0, 810 - plungerX)}
                    height="16"
                    fill="url(#plungerStem)"
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  {/* Thumb Rest Flange at far right */}
                  <rect
                    x="810"
                    y={BARREL_Y - 2}
                    width="14"
                    height={BARREL_HEIGHT + 4}
                    rx="3"
                    fill="url(#rubberPlunger)"
                    stroke="#0f172a"
                    strokeWidth="1"
                  />
                </g>

                {/* 3. GLASS BARREL BACKDROP */}
                <rect
                  x={BARREL_START_X}
                  y={BARREL_Y}
                  width={BARREL_WIDTH}
                  height={BARREL_HEIGHT}
                  rx="6"
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />

                {/* Barrel Finger Flanges (Right End of Glass) */}
                <rect x={BARREL_END_X - 2} y={BARREL_Y - 14} width="10" height={BARREL_HEIGHT + 28} rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.2" />

                {/* 4. ACTIVE LIQUID FILL (Dynamic width based on units) */}
                <rect
                  x={BARREL_START_X}
                  y={BARREL_Y + 2}
                  width={fillWidth}
                  height={BARREL_HEIGHT - 4}
                  fill="url(#liquidFillGrad)"
                  style={{ transition: 'width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                />

                {/* 5. BLACK RUBBER STOPPER / PISTON SEAL */}
                <g style={{
                  transform: `translateX(${fillWidth}px)`,
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  {/* Primary Ring */}
                  <rect
                    x={BARREL_START_X - 1}
                    y={BARREL_Y + 2}
                    width="14"
                    height={BARREL_HEIGHT - 4}
                    rx="2"
                    fill="url(#rubberPlunger)"
                    stroke="#0f172a"
                    strokeWidth="1.2"
                  />
                  {/* Secondary Sealing Rib */}
                  <rect
                    x={BARREL_START_X + 8}
                    y={BARREL_Y + 4}
                    width="6"
                    height={BARREL_HEIGHT - 8}
                    fill="#0f172a"
                  />
                </g>

                {/* 6. GLASS CYLINDRICAL OVERLAY (Reflections & Depth) */}
                <rect
                  x={BARREL_START_X}
                  y={BARREL_Y}
                  width={BARREL_WIDTH}
                  height={BARREL_HEIGHT}
                  rx="6"
                  fill="url(#horizontalGlass)"
                  pointerEvents="none"
                />

                {/* 7. U-100 CALIBRATED GRADUATION TICKS */}
                {graduationTicks.map((t) => {
                  let tickHeight = 7;
                  let strokeWidth = 0.8;
                  let strokeColor = '#94a3b8';

                  if (t.isMajor) {
                    tickHeight = 18;
                    strokeWidth = 1.6;
                    strokeColor = '#0f172a';
                  } else if (t.isMid) {
                    tickHeight = 12;
                    strokeWidth = 1.2;
                    strokeColor = '#475569';
                  }

                  return (
                    <g key={t.unit}>
                      {/* Top graduation tick */}
                      <line
                        x1={t.x}
                        y1={BARREL_Y}
                        x2={t.x}
                        y2={BARREL_Y + tickHeight}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                      />
                      {/* Bottom graduation tick */}
                      <line
                        x1={t.x}
                        y1={BARREL_Y + BARREL_HEIGHT}
                        x2={t.x}
                        y2={BARREL_Y + BARREL_HEIGHT - tickHeight}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                      />
                      {/* Major Unit Number Label (Below barrel) */}
                      {t.isMajor && (
                        <text
                          x={t.x}
                          y={BARREL_Y + BARREL_HEIGHT + 18}
                          fontSize="9.5"
                          fontWeight="700"
                          fill="#334155"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {t.unit}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 8. UNIT OF MEASURE LABEL ON BARREL */}
                <text
                  x={BARREL_START_X + 16}
                  y={BARREL_Y + 26}
                  fill="#003666"
                  fontSize="10"
                  fontWeight="900"
                  letterSpacing="0.05em"
                  opacity="0.85"
                >
                  U-100 (100U = 1.0 mL)
                </text>

                {/* 9. DYNAMIC LASER ALIGNMENT INDICATOR */}
                <g style={{
                  transform: `translateX(${fillWidth}px)`,
                  transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  {/* Vertical Alignment Laser Line */}
                  <line
                    x1={BARREL_START_X}
                    y1="12"
                    x2={BARREL_START_X}
                    y2={BARREL_Y + BARREL_HEIGHT + 24}
                    stroke={isOver100 ? '#ef4444' : '#0d9488'}
                    strokeWidth="1.8"
                    strokeDasharray="3 2"
                  />

                  {/* Top Target Indicator Plaque */}
                  <g filter="url(#laserShadow)">
                    <rect
                      x={BARREL_START_X - 44}
                      y="4"
                      width="88"
                      height="20"
                      rx="5"
                      fill={isOver100 ? '#dc2626' : '#003666'}
                    />
                    <polygon
                      points={`${BARREL_START_X - 5},24 ${BARREL_START_X + 5},24 ${BARREL_START_X},29`}
                      fill={isOver100 ? '#dc2626' : '#003666'}
                    />
                    <text
                      x={BARREL_START_X}
                      y="18"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="900"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      ▼ {numericUnits.toFixed(0)} U ({volumeMl} mL)
                    </text>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* Bottom Clinical Safety Guidance Notice */}
          <div style={{
            marginTop: '0.85rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: isOver100 ? '#fef2f2' : '#f0fdfa',
            border: isOver100 ? '1px solid #fecaca' : '1px solid #ccfbf1',
            fontSize: '0.75rem',
            color: isOver100 ? '#991b1b' : '#0f766e',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isOver100 ? (
              <>
                <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                <span>
                  <b>{lang === 'es' ? 'Precaución de Volumen:' : 'Volume Notice:'}</b>{' '}
                  {lang === 'es'
                    ? `Dosis superior a 100U (1.0 mL). Administrar en 2 extracciones separadas (${(numericUnits / 2).toFixed(0)}U + ${(numericUnits / 2).toFixed(0)}U) o utilizar menor volumen de diluyente BAC.`
                    : `Dose exceeds 100U (1.0 mL). Split into 2 draws (${(numericUnits / 2).toFixed(0)}U + ${(numericUnits / 2).toFixed(0)}U) or reconstitute in lower BAC volume.`}
                </span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} style={{ color: '#0d9488', flexShrink: 0 }} />
                <span>
                  <b>{lang === 'es' ? 'Verificación Dosimétrica:' : 'Dosimetric Alignment:'}</b>{' '}
                  {lang === 'es'
                    ? `Alinear la cara frontal del émbolo de goma negra exactamente con la marca ${numericUnits.toFixed(0)} de la jeringa U-100 para extraer ${volumeMl} mL.`
                    : `Align the front edge of the black rubber plunger seal exactly with the ${numericUnits.toFixed(0)} U mark to draw ${volumeMl} mL.`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicSectionCard>
  );
}
