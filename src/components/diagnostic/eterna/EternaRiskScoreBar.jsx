"use client";

import React from 'react';

/**
 * EternaRiskScoreBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Calibrated visual risk & percentile distribution slider for Eterna genetic markers.
 * Displays patient position, population reference mean band, and clinical interpretation.
 */
export default function EternaRiskScoreBar({
  score = 50,
  min = 0,
  max = 100,
  mean = 50,
  bandStart = 40,
  bandEnd = 60,
  lowLabel = 'Higher Risk / Vulnerable',
  highLabel = 'Optimal / Resilient',
  summary = '',
  unit = '',
  direction = 'favorable-high' // 'favorable-high' (green on right) or 'favorable-low' (green on left)
}) {
  const clampedScore = Math.max(min, Math.min(max, score));
  const scorePercent = ((clampedScore - min) / (max - min)) * 100;
  const meanPercent = ((mean - min) / (max - min)) * 100;
  const bandLeftPercent = Math.max(0, ((bandStart - min) / (max - min)) * 100);
  const bandWidthPercent = Math.max(2, Math.min(100 - bandLeftPercent, ((bandEnd - bandStart) / (max - min)) * 100));

  const gradient = direction === 'favorable-high'
    ? 'linear-gradient(to right, #ef4444 0%, #f87171 20%, #fb923c 35%, #94a3b8 50%, #a3e635 65%, #4ade80 80%, #22c55e 100%)'
    : 'linear-gradient(to right, #22c55e 0%, #4ade80 20%, #a3e635 35%, #94a3b8 50%, #fb923c 65%, #f87171 80%, #ef4444 100%)';

  return (
    <div style={{ width: '100%', marginTop: '6px' }}>
      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--gcp-text-muted, #64748b)', fontWeight: 600, marginBottom: '6px' }}>
        <span>{lowLabel}</span>
        <span style={{ color: 'var(--gcp-text-secondary, #475569)' }}>Ref. Mean: {mean}{unit}</span>
        <span>{highLabel}</span>
      </div>

      {/* Track */}
      <div style={{ position: 'relative', width: '100%', height: '28px', borderRadius: '14px', overflow: 'visible', marginBottom: '8px' }}>
        {/* Gradient background */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', background: gradient, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }} />

        {/* Population average band */}
        <div
          title={`Population reference interval (${bandStart} - ${bandEnd})`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${bandLeftPercent}%`,
            width: `${bandWidthPercent}%`,
            background: 'rgba(15, 23, 42, 0.22)',
            borderLeft: '1.5px dashed rgba(255, 255, 255, 0.8)',
            borderRight: '1.5px dashed rgba(255, 255, 255, 0.8)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Mean Indicator Notch */}
        <div
          title={`Population average (${mean})`}
          style={{
            position: 'absolute',
            top: '-2px',
            bottom: '-2px',
            left: `${meanPercent}%`,
            width: '2px',
            background: '#ffffff',
            boxShadow: '0 0 4px rgba(0,0,0,0.4)',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />

        {/* Patient Score Pointer */}
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: `${scorePercent}%`,
            minWidth: '42px',
            height: '38px',
            padding: '0 8px',
            border: '3px solid #ffffff',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            transform: 'translateX(-50%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', lineHeight: 1, whiteSpace: 'nowrap' }}>
            {score}{unit}
          </span>
        </div>
      </div>

      {/* Clinical interpretation summary */}
      {summary && (
        <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'var(--gcp-text-primary, #0f172a)', marginTop: '4px' }}>
          {summary}
        </div>
      )}
    </div>
  );
}
