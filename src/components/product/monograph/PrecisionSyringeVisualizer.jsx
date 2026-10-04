"use client";

import React from 'react';

/**
 * PrecisionSyringeVisualizer
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-inspired U-100 Insulin Syringe Visualizer.
 * Subordinate to the calculated dose: displays Target dose, Volume, and U-100 units
 * in one clean header, followed by an exact calibrated vector graphic.
 * 
 * Clinical SVG Layering:
 * 1. Background Barrel & Needle Hub
 * 2. Volumetric Fluid Column
 * 3. Rubber Stopper & Plunger Mechanism
 * 4. OVERLAY Graduation Ticks & High-Contrast Halo Numbers (Never Occluded)
 * 5. Dynamic Injection Draw Cursor
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

        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem 1rem' }}>
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
          viewBox="0 0 540 102"
          style={{ width: '100%', height: 'auto', minWidth: '460px', display: 'block' }}
          role="img"
          aria-label={`U-100 syringe drawn to ${units} units`}
        >
          <defs>
            {/* Fluid gradient */}
            <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.65" />
            </linearGradient>

            {/* Glass Barrel Reflection */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="15%" stopColor="#f8fafc" stopOpacity="0.3" />
              <stop offset="85%" stopColor="#cbd5e1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.55" />
            </linearGradient>

            {/* Plunger gradient */}
            <linearGradient id="plungerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* LAYER 1: Needle & Needle Hub */}
          <line x1="8" y1="44" x2="42" y2="44" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 42 36 L 58 38 L 58 50 L 42 52 Z" fill="#64748b" />
          {/* Needle tip bevel */}
          <line x1="8" y1="44" x2="14" y2="42" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* LAYER 2: Glass Syringe Outer Barrel */}
          <rect x="58" y="20" width="346" height="46" rx="3" fill="url(#glassGrad)" stroke="#94a3b8" strokeWidth="1.5" />

          {/* LAYER 3: Volumetric Fluid Column inside barrel up to current units */}
          {fillWidth > 0 && (
            <rect
              x="60"
              y="22"
              width={fillWidth}
              height="42"
              fill="url(#fluidGrad)"
            />
          )}

          {/* LAYER 4: Rubber Stopper & Plunger Shaft (Rendered underneath the overlay numbers) */}
          {/* Black Rubber Stopper Ring 1 */}
          <rect
            x={plungerX}
            y="22"
            width="8"
            height="42"
            rx="1.5"
            fill="url(#plungerGrad)"
          />
          {/* Black Rubber Stopper Ring 2 */}
          <rect
            x={plungerX + 8}
            y="24"
            width="6"
            height="38"
            rx="1"
            fill="#334155"
          />

          {/* Plunger Shaft */}
          <rect
            x={plungerX + 14}
            y="39"
            width={Math.max(20, 510 - (plungerX + 14))}
            height="10"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1"
          />

          {/* Plunger Thumb Press (at the end) */}
          <rect
            x={Math.max(plungerX + 25, 508)}
            y="24"
            width="9"
            height="38"
            rx="2"
            fill="#64748b"
            stroke="#475569"
            strokeWidth="1"
          />

          {/* LAYER 5: Graduation Tick Marks & High-Contrast Halo Numbers (ALWAYS ON TOP) */}
          {Array.from({ length: 51 }).map((_, idx) => {
            const unitVal = idx * 2;
            const x = zeroX + (unitVal / 100) * scaleLength;
            const isMajor = unitVal % 10 === 0;
            const isMid = unitVal % 5 === 0 && !isMajor;
            const y1 = 21;
            const y2 = isMajor ? 35 : isMid ? 30 : 26;

            return (
              <g key={idx}>
                {/* Tick mark line */}
                <line
                  x1={x}
                  y1={y1}
                  x2={x}
                  y2={y2}
                  stroke={isMajor ? "#0f172a" : "#475569"}
                  strokeWidth={isMajor ? 1.6 : 0.9}
                />
                
                {/* Major graduation number with white protective outline halo so it's never occluded */}
                {isMajor && (
                  <text
                    x={x}
                    y="56"
                    fontSize="11"
                    fontWeight="800"
                    fill="#0f172a"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    paintOrder="stroke fill"
                    strokeLinejoin="round"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {unitVal}
                  </text>
                )}
              </g>
            );
          })}

          {/* LAYER 6: Active Calibration Needle Marker (draw point cursor) */}
          <line
            x1={plungerX}
            y1="12"
            x2={plungerX}
            y2="73"
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="2 2"
          />
          <polygon
            points={`${plungerX - 4},12 ${plungerX + 4},12 ${plungerX},18`}
            fill="#0284c7"
          />
          <text
            x={plungerX}
            y="10"
            fontSize="10"
            fontWeight="850"
            fill="#0284c7"
            stroke="#ffffff"
            strokeWidth="2.5"
            paintOrder="stroke fill"
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
        flexWrap: 'wrap',
        gap: '6px',
        fontSize: '0.72rem',
        color: '#64748b',
        paddingTop: '0.4rem'
      }}>
        <span>0.30mm (30G / 31G) × 8mm Micro-Fine SubQ Needle</span>
        <span style={{ fontWeight: 700, color: '#0369a1' }}>
          Align leading edge of black rubber stopper with graduation {units}
        </span>
      </div>
    </div>
  );
}
