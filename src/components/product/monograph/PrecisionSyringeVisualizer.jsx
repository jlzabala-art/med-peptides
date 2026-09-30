"use client";

import React from 'react';

/**
 * PrecisionSyringeVisualizer
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-inspired U-100 Insulin Syringe Visualizer.
 * Subordinate to the calculated dose: displays Target dose, Volume, and U-100 units
 * in one clean header, followed by an exact calibrated vector graphic.
 */
export default function PrecisionSyringeVisualizer({
  targetDoseMg = 1.25,
  injectionVolumeMl = 0.25,
  syringeUnitsU100 = 25,
  compact = false,
  className = ''
}) {
  const units = Math.min(100, Math.max(0, Number(syringeUnitsU100) || 0));
  const zeroX = 60;
  const hundredX = 400;
  const scaleLength = hundredX - zeroX; // 340px for 100 units = 3.4px per unit
  const fillWidth = (units / 100) * scaleLength;
  const plungerX = zeroX + fillWidth;

  return (
    <div className={`pds-syringe-card ${className}`} style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: compact ? '0.75rem 1rem' : '1.25rem 1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      {/* ── Subordinate Header: 3 Key Metrics only ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#64748b'
          }}>
            U-100 Volumetric Calibration
          </span>
          <span style={{
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.70rem',
            fontWeight: 700
          }}>
            1.0 mL = 100 Units
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Target dose:</span>
            <strong style={{ fontSize: '0.90rem', color: '#0f172a', fontWeight: 800 }}>{targetDoseMg} mg</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Volume:</span>
            <strong style={{ fontSize: '0.90rem', color: '#0f172a', fontWeight: 800 }}>{injectionVolumeMl} mL</strong>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: '6px'
          }}>
            <span style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: 600 }}>Draw:</span>
            <strong style={{ fontSize: '0.92rem', color: '#38bdf8', fontWeight: 850 }}>{units} Units</strong>
          </div>
        </div>
      </div>

      {/* ── High-Precision SVG Syringe Graphic ── */}
      <div style={{ width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
        <svg
          viewBox="0 0 520 80"
          style={{ width: '100%', height: 'auto', minWidth: '420px', display: 'block' }}
          role="img"
          aria-label={`U-100 syringe drawn to ${units} units`}
        >
          <defs>
            {/* Fluid gradient */}
            <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.55" />
            </linearGradient>

            {/* Glass Barrel Reflection */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="15%" stopColor="#f8fafc" stopOpacity="0.2" />
              <stop offset="85%" stopColor="#cbd5e1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.5" />
            </linearGradient>

            {/* Plunger gradient */}
            <linearGradient id="plungerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* 1. Needle & Hub */}
          <line x1="8" y1="40" x2="42" y2="40" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 42 34 L 58 36 L 58 44 L 42 46 Z" fill="#64748b" />
          {/* Needle tip bevel */}
          <line x1="8" y1="40" x2="14" y2="38" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* 2. Glass Syringe Outer Barrel */}
          <rect x="58" y="22" width="346" height="36" rx="2" fill="url(#glassGrad)" stroke="#94a3b8" strokeWidth="1.5" />

          {/* 3. Fluid Column inside barrel up to current units */}
          {fillWidth > 0 && (
            <rect
              x="60"
              y="23.5"
              width={fillWidth}
              height="33"
              fill="url(#fluidGrad)"
            />
          )}

          {/* 4. Graduation Tick Marks (every 2 units, major every 10) */}
          {Array.from({ length: 51 }).map((_, idx) => {
            const unitVal = idx * 2;
            const x = zeroX + (unitVal / 100) * scaleLength;
            const isMajor = unitVal % 10 === 0;
            const isMid = unitVal % 5 === 0 && !isMajor;
            const y1 = 23;
            const y2 = isMajor ? 36 : isMid ? 31 : 27;

            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke={isMajor ? "#0f172a" : "#64748b"}
                  strokeWidth={isMajor ? 1.4 : 0.8}
                />
                {isMajor && (
                  <text
                    x={x}
                    y="50"
                    fontSize="8.5"
                    fontWeight="700"
                    fill="#334155"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {unitVal}
                  </text>
                )}
              </g>
            );
          })}

          {/* 5. Rubber Stopper & Plunger */}
          {/* Black Rubber Stopper Ring 1 */}
          <rect
            x={plungerX}
            y="23.5"
            width="8"
            height="33"
            rx="1.5"
            fill="url(#plungerGrad)"
          />
          {/* Black Rubber Stopper Ring 2 */}
          <rect
            x={plungerX + 8}
            y="25"
            width="6"
            height="30"
            rx="1"
            fill="#334155"
          />

          {/* Plunger Shaft */}
          <rect
            x={plungerX + 14}
            y="35"
            width={Math.max(20, 500 - (plungerX + 14))}
            height="10"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Plunger Thumb Press (at the end) */}
          <rect
            x={Math.max(plungerX + 25, 498)}
            y="26"
            width="8"
            height="28"
            rx="2"
            fill="#64748b"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* 6. Active Calibration Needle Marker (red/cyan target line at draw point) */}
          <line
            x1={plungerX}
            y1="16"
            x2={plungerX}
            y2="63"
            stroke="#0284c7"
            strokeWidth="1.8"
            strokeDasharray="2 2"
          />
          <polygon
            points={`${plungerX - 4},16 ${plungerX + 4},16 ${plungerX},22`}
            fill="#0284c7"
          />
          <text
            x={plungerX}
            y="12"
            fontSize="9"
            fontWeight="800"
            fill="#0284c7"
            textAnchor="middle"
            fontFamily="monospace"
          >
            {units}U
          </text>
        </svg>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: '#64748b',
        paddingTop: '0.4rem'
      }}>
        <span>0.30mm (30G / 31G) × 8mm Micro-Fine SubQ Needle</span>
        <span style={{ fontWeight: 600, color: '#0369a1' }}>
          Align top edge of black rubber stopper with line {units}
        </span>
      </div>
    </div>
  );
}
