"use client";

import React, { useMemo, useId } from 'react';
import { Syringe, AlertCircle, ShieldCheck } from '@/lib/icons';

/**
 * HorizontalSyringeVisualizer
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable full-width animated U-100 horizontal syringe SVG with laser alignment
 * marker. Shared across `/calculator`, `/proto/[slug]` (ProtocolReconstitutionConsole),
 * and product monographs so patients always see the exact same unmistakable graphic.
 */
export default function HorizontalSyringeVisualizer({
  units = 25,
  maxUnits = 100, // 30 (0.3mL) | 50 (0.5mL) | 100 (1.0mL)
  volumeMl = null,
  headingLabel = null,
  subLabel = null,
  lang = 'en',
}) {
  const uid = useId().replace(/:/g, '');
  const isEs = lang === 'es';
  const safeMax = [30, 50, 100].includes(Number(maxUnits)) ? Number(maxUnits) : 100;
  const numericUnits = Math.max(0, Number(units) || 0);
  const displayVol = volumeMl != null ? Number(volumeMl).toFixed(2) : (numericUnits / 100).toFixed(2);
  const isOverMax = numericUnits > safeMax;
  const clampedUnits = Math.min(numericUnits, safeMax);

  const BARREL_START_X = 58;
  const BARREL_WIDTH = 570;
  const BARREL_END_X = BARREL_START_X + BARREL_WIDTH;
  const BARREL_Y = 44;
  const BARREL_HEIGHT = 46;

  const graduationTicks = useMemo(() => {
    const ticks = [];
    const step = safeMax === 100 ? 2 : 1;
    const majorEvery = safeMax === 30 ? 5 : 10;
    const midEvery = safeMax === 30 ? 5 : 5;
    for (let u = 0; u <= safeMax; u += step) {
      const isMajor = u % majorEvery === 0;
      const isMid = !isMajor && u % midEvery === 0;
      const x = BARREL_START_X + (u / safeMax) * BARREL_WIDTH;
      ticks.push({ unit: u, x, isMajor, isMid });
    }
    return ticks;
  }, [safeMax]);

  const fillWidth = (clampedUnits / safeMax) * BARREL_WIDTH;
  const plungerX = BARREL_START_X + fillWidth;
  const unitsRounded = Math.round(numericUnits);

  const glassId = `hGlass-${uid}`;
  const liquidId = `hLiquid-${uid}`;
  const rubberId = `hRubber-${uid}`;
  const stemId = `hStem-${uid}`;
  const shadowId = `hShadow-${uid}`;

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      border: '1.5px solid #cbd5e1',
      borderRadius: '14px',
      padding: '1rem clamp(0.75rem, 2.5vw, 1.5rem)',
      boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top Measurement HUD Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.65rem',
        marginBottom: '0.85rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#003666',
            color: '#ffffff',
            flexShrink: 0,
          }}>
            <Syringe size={16} />
          </span>
          <div>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {headingLabel || (isEs ? `Jeringa de Insulina U-100 (${(safeMax / 100).toFixed(1)} mL)` : `U-100 Insulin Syringe (${(safeMax / 100).toFixed(1)} mL)`)}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
              {subLabel || (isEs ? `Llena hasta la marca ${unitsRounded}` : `Draw liquid to the ${unitsRounded} mark`)}
            </div>
          </div>
        </div>

        {/* Big Patient Telemetry Readout */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px',
          background: isOverMax ? '#fef2f2' : '#f0fdfa',
          border: isOverMax ? '1.5px solid #fca5a5' : '1.5px solid #99f6e4',
          borderRadius: '10px',
          padding: '6px 14px',
        }}>
          <span style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            color: isOverMax ? '#dc2626' : '#0f766e',
            fontFamily: 'monospace',
            lineHeight: 1,
          }}>
            {unitsRounded}
          </span>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isOverMax ? '#dc2626' : '#0f766e' }}>
            {isEs ? 'Unidades' : 'Units'}
          </span>
          <span style={{ fontSize: '0.80rem', fontWeight: 600, color: '#64748b', marginLeft: '2px' }}>
            ({displayVol} mL)
          </span>
        </div>
      </div>

      {/* Calibrated Horizontal Syringe SVG Canvas */}
      <div style={{ width: '100%', position: 'relative' }}>
        <svg
          viewBox="0 0 760 135"
          width="100%"
          height="auto"
          role="img"
          aria-label={isEs ? `Jeringa U-100 cargada en ${unitsRounded} unidades (${displayVol} mL)` : `U-100 syringe drawn to ${unitsRounded} units (${displayVol} mL)`}
          style={{ display: 'block', width: '100%', height: 'auto' }}
        >
          <defs>
            <linearGradient id={glassId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="25%" stopColor="#f8fafc" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="75%" stopColor="#e2e8f0" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id={liquidId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isOverMax ? '#f87171' : '#0d9488'} stopOpacity="0.85" />
              <stop offset="70%" stopColor={isOverMax ? '#ef4444' : '#0284c7'} stopOpacity="0.75" />
              <stop offset="100%" stopColor={isOverMax ? '#dc2626' : '#0369a1'} stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={rubberId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id={stemId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
            <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#003666" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Needle Assembly */}
          <line x1="10" y1="67" x2="42" y2="67" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="10,66 16,64.5 16,69.5" fill="#64748b" />
          <rect x="42" y="57" width="10" height="20" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <rect x="52" y="59" width="6" height="16" fill="#94a3b8" />

          {/* Plunger Rod & Thumb Flange */}
          <g style={{ transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <rect
              x={plungerX}
              y={BARREL_Y + 15}
              width={Math.max(0, 736 - plungerX)}
              height="16"
              fill={`url(#${stemId})`}
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <rect
              x="736"
              y={BARREL_Y - 2}
              width="14"
              height={BARREL_HEIGHT + 4}
              rx="3"
              fill={`url(#${rubberId})`}
              stroke="#0f172a"
              strokeWidth="1"
            />
          </g>

          {/* Glass Barrel Backdrop */}
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
          <rect x={BARREL_END_X - 2} y={BARREL_Y - 12} width="10" height={BARREL_HEIGHT + 24} rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.2" />

          {/* Active Liquid Fill */}
          <rect
            x={BARREL_START_X}
            y={BARREL_Y + 2}
            width={fillWidth}
            height={BARREL_HEIGHT - 4}
            fill={`url(#${liquidId})`}
            style={{ transition: 'width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />

          {/* Black Rubber Plunger Seal */}
          <g style={{
            transform: `translateX(${fillWidth}px)`,
            transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <rect
              x={BARREL_START_X - 1}
              y={BARREL_Y + 2}
              width="14"
              height={BARREL_HEIGHT - 4}
              rx="2"
              fill={`url(#${rubberId})`}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            <rect
              x={BARREL_START_X + 8}
              y={BARREL_Y + 4}
              width="6"
              height={BARREL_HEIGHT - 8}
              fill="#0f172a"
            />
          </g>

          {/* Glass Reflection Overlay */}
          <rect
            x={BARREL_START_X}
            y={BARREL_Y}
            width={BARREL_WIDTH}
            height={BARREL_HEIGHT}
            rx="6"
            fill={`url(#${glassId})`}
            pointerEvents="none"
          />

          {/* Graduation Ticks */}
          {graduationTicks.map((t) => {
            const tickHeight = t.isMajor ? 18 : t.isMid ? 12 : 7;
            const strokeWidth = t.isMajor ? 1.8 : t.isMid ? 1.2 : 0.8;
            const strokeColor = t.isMajor ? '#0f172a' : t.isMid ? '#475569' : '#94a3b8';
            return (
              <g key={t.unit}>
                <line x1={t.x} y1={BARREL_Y} x2={t.x} y2={BARREL_Y + tickHeight} stroke={strokeColor} strokeWidth={strokeWidth} />
                <line x1={t.x} y1={BARREL_Y + BARREL_HEIGHT} x2={t.x} y2={BARREL_Y + BARREL_HEIGHT - tickHeight} stroke={strokeColor} strokeWidth={strokeWidth} />
                {t.isMajor && (
                  <text
                    x={t.x}
                    y={BARREL_Y + BARREL_HEIGHT + 19}
                    fontSize="12"
                    fontWeight="900"
                    fill="#0f172a"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {t.unit}
                  </text>
                )}
              </g>
            );
          })}

          <text
            x={BARREL_START_X + 14}
            y={BARREL_Y + 27}
            fill="#003666"
            fontSize="10"
            fontWeight="900"
            letterSpacing="0.04em"
            opacity="0.85"
          >
            U-100 ({safeMax}U = {(safeMax / 100).toFixed(1)} mL)
          </text>

          {/* Dynamic Laser Alignment Indicator */}
          <g style={{
            transform: `translateX(${fillWidth}px)`,
            transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            <line
              x1={BARREL_START_X}
              y1="12"
              x2={BARREL_START_X}
              y2={BARREL_Y + BARREL_HEIGHT + 24}
              stroke={isOverMax ? '#ef4444' : '#0d9488'}
              strokeWidth="1.8"
              strokeDasharray="3 2"
            />
            <g filter={`url(#${shadowId})`}>
              <rect
                x={BARREL_START_X - 48}
                y="4"
                width="96"
                height="22"
                rx="5"
                fill={isOverMax ? '#dc2626' : '#003666'}
              />
              <polygon
                points={`${BARREL_START_X - 5},26 ${BARREL_START_X + 5},26 ${BARREL_START_X},31`}
                fill={isOverMax ? '#dc2626' : '#003666'}
              />
              <text
                x={BARREL_START_X}
                y="19"
                fill="#ffffff"
                fontSize="10"
                fontWeight="900"
                textAnchor="middle"
                fontFamily="monospace"
              >
                ▼ {unitsRounded} U ({displayVol} mL)
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Bottom Clinical Safety Guidance Notice */}
      <div style={{
        marginTop: '0.85rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        background: isOverMax ? '#fef2f2' : '#f0fdfa',
        border: isOverMax ? '1px solid #fecaca' : '1px solid #ccfbf1',
        fontSize: '0.78rem',
        color: isOverMax ? '#991b1b' : '#0f766e',
        lineHeight: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {isOverMax ? (
          <>
            <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span>
              <b>{isEs ? 'Supera la capacidad de la jeringa:' : 'Exceeds syringe capacity:'}</b>{' '}
              {isEs
                ? `Esta dosis requiere ${unitsRounded}U (supera ${safeMax}U). Cambia a una jeringa mayor (1.0 mL), divide en 2 dosis o usa menos agua BAC.`
                : `This dose needs ${unitsRounded}U (above ${safeMax}U). Switch to a larger 1.0 mL syringe, split into 2 draws, or use less BAC water.`}
            </span>
          </>
        ) : (
          <>
            <ShieldCheck size={16} style={{ color: '#0d9488', flexShrink: 0 }} />
            <span>
              <b>{isEs ? 'Alineación exacta:' : 'Exact alignment:'}</b>{' '}
              {isEs
                ? `Alinea el borde frontal del émbolo negro exactamente en la marca ${unitsRounded} de tu jeringa U-100 para cargar ${displayVol} mL.`
                : `Line up the front edge of the black rubber stopper right on the ${unitsRounded} mark to draw ${displayVol} mL.`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
