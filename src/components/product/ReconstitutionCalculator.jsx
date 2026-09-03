"use client";

import React, { useState, useMemo } from 'react';
import { Beaker, Droplet, Zap, AlertCircle, ShieldCheck, Thermometer, Snowflake, Info, CheckCircle2, ChevronRight } from '@/lib/icons';
import { useReconstitution } from '@/hooks/useReconstitution';

/**
 * ReconstitutionCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive visual reconstitution & dosing calculator for Peptides & Pens.
 * Harmonized with the Atlas Clinical Light Design System.
 * Pure Vanilla CSS with <style jsx>. Mobile-first and responsive.
 */
export default function ReconstitutionCalculator({ product, variant, initialDose = null }) {
  const {
    vialMg,
    setVialMg,
    bacWaterMl,
    setBacWaterMl,
    desiredDoseMcg,
    setDesiredDoseMcg,
    concentrationMgMl,
    concentrationMcgUnit,
    unitsToInject,
    volumeMl: volumeMlToInject,
    totalDoses: totalDosesPerVial,
    penClicks
  } = useReconstitution(product, variant);

  const [deliveryMode, setDeliveryMode] = useState('syringe'); // 'syringe' | 'pen'
  const [frequency, setFrequency] = useState('weekly'); // 'daily' | 'biweekly' | 'weekly'

  const daysSupply = useMemo(() => {
    if (totalDosesPerVial <= 0) return 0;
    if (frequency === 'daily') return totalDosesPerVial;
    if (frequency === 'biweekly') return Math.floor(totalDosesPerVial * 3.5);
    return totalDosesPerVial * 7; // weekly
  }, [totalDosesPerVial, frequency]);

  // Syringe Plunger X Coordinate (SVG Scale 0 to 100 units -> X from 80 to 380)
  const syringeClampedUnits = Math.min(Math.max(unitsToInject, 0), 100);
  const plungerX = 80 + (syringeClampedUnits / 100) * 300;

  return (
    <div className="calc-root">
      {/* Header */}
      <div className="calc-header">
        <div className="calc-header-title">
          <div className="calc-icon-badge">
            <Beaker size={20} />
          </div>
          <div>
            <h3 className="calc-title">
              <span>Interactive Dosing &amp; Reconstitution Calculator</span>
              <span className="calc-u100-badge">Clinical U-100</span>
            </h3>
            <p className="calc-subtitle">
              Calculate exact syringe tick marks, pen clicks, and cold-chain stability
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="calc-switcher">
          <button
            type="button"
            onClick={() => setDeliveryMode('syringe')}
            className={`calc-switcher-btn ${deliveryMode === 'syringe' ? 'active' : ''}`}
          >
            💉 U-100 Syringe
          </button>
          <button
            type="button"
            onClick={() => setDeliveryMode('pen')}
            className={`calc-switcher-btn ${deliveryMode === 'pen' ? 'active' : ''}`}
          >
            🖊️ Precision Pen
          </button>
        </div>
      </div>

      {/* Main Grid: Controls & Instrument */}
      <div className="calc-grid">
        {/* Left Controls */}
        <div className="calc-controls">
          {/* 1. Vial Total Mass */}
          <div className="calc-field">
            <div className="calc-label-row">
              <span className="calc-label">Peptide Vial Mass</span>
              <span className="calc-value-accent">{vialMg} mg</span>
            </div>
            <div className="calc-btn-group grid-4">
              {[2, 5, 10, 20].map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setVialMg(mg)}
                  className={`calc-pill-btn ${vialMg === mg ? 'active' : ''}`}
                >
                  {mg} mg
                </button>
              ))}
            </div>
          </div>

          {/* 2. Diluent Added */}
          <div className="calc-field">
            <div className="calc-label-row">
              <span className="calc-label">Bacteriostatic Water Added</span>
              <span className="calc-value-accent">{bacWaterMl.toFixed(1)} mL</span>
            </div>
            <div className="calc-btn-group grid-3">
              {[1.0, 2.0, 3.0].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => setBacWaterMl(ml)}
                  className={`calc-pill-btn ${bacWaterMl === ml ? 'active' : ''}`}
                >
                  {ml.toFixed(1)} mL
                </button>
              ))}
            </div>
          </div>

          {/* 3. Desired Dose */}
          <div className="calc-field">
            <div className="calc-label-row">
              <span className="calc-label">Prescribed Dose</span>
              <span className="calc-value-accent green">
                {desiredDoseMcg >= 1000 ? `${(desiredDoseMcg / 1000).toFixed(2)} mg` : `${desiredDoseMcg} mcg`}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max={Math.min(vialMg * 1000, 10000)}
              step="50"
              value={desiredDoseMcg}
              onChange={(e) => setDesiredDoseMcg(Number(e.target.value))}
              className="calc-range-slider"
            />
            <div className="calc-range-ticks">
              <span>100 mcg</span>
              <span>{(vialMg / 2).toFixed(1)} mg</span>
              <span>{vialMg} mg</span>
            </div>
          </div>

          {/* 4. Frequency */}
          <div className="calc-field">
            <div className="calc-label-row">
              <span className="calc-label">Administration Frequency</span>
              <span className="calc-value-dim">{frequency}</span>
            </div>
            <div className="calc-btn-group grid-3">
              {[
                { id: 'daily', label: 'Daily' },
                { id: 'biweekly', label: '2x / Week' },
                { id: 'weekly', label: 'Weekly' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFrequency(f.id)}
                  className={`calc-pill-btn ${frequency === f.id ? 'active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Visual Instrument */}
        <div className="calc-instrument-panel">
          {/* Key Metrics HUD Header */}
          <div className="calc-hud-strip">
            <div className="calc-hud-card">
              <span className="calc-hud-label">Concentration</span>
              <span className="calc-hud-val">{concentrationMgMl.toFixed(2)} mg/mL</span>
            </div>
            <div className="calc-hud-card highlight">
              <span className="calc-hud-label primary">Dose Volume</span>
              <span className="calc-hud-val primary">{volumeMlToInject.toFixed(2)} mL</span>
            </div>
            <div className="calc-hud-card">
              <span className="calc-hud-label">Doses / Vial</span>
              <span className="calc-hud-val">{totalDosesPerVial} doses</span>
            </div>
            <div className="calc-hud-card">
              <span className="calc-hud-label">Duration</span>
              <span className="calc-hud-val">{daysSupply} days</span>
            </div>
          </div>

          {/* Instrument Visual */}
          <div className="calc-instrument-body">
            {deliveryMode === 'syringe' ? (
              <div className="calc-syringe-wrap">
                <div className="calc-target-header">
                  <span className="calc-target-label">Draw Solution To Mark:</span>
                  <span className="calc-target-val">
                    {unitsToInject} UNITS (U-100)
                  </span>
                </div>

                {/* Animated SVG U-100 Insulin Syringe */}
                <div className="calc-svg-box">
                  <svg viewBox="0 0 450 90" className="calc-svg">
                    {/* Syringe Needle */}
                    <line x1="15" y1="45" x2="60" y2="45" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="60,40 75,42 75,48 60,50" fill="#0284c7" />

                    {/* Syringe Barrel (Clear Glass) */}
                    <rect x="75" y="20" width="310" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />

                    {/* Liquid Fill (Soft Teal) */}
                    <rect x="75" y="22" width={Math.max(plungerX - 75, 0)} height="46" fill="rgba(13, 148, 136, 0.22)" />

                    {/* Syringe Unit Ticks (0 to 100 Units) */}
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((u) => {
                      const x = 80 + (u / 100) * 300;
                      const isMajor = u % 10 === 0;
                      return (
                        <g key={u}>
                          <line
                            x1={x}
                            y1="20"
                            x2={x}
                            y2={isMajor ? "38" : "30"}
                            stroke={u <= unitsToInject ? "#0d9488" : "#94a3b8"}
                            strokeWidth={isMajor ? "1.5" : "1"}
                          />
                          {isMajor && (
                            <text x={x} y="55" fill={u === Math.round(unitsToInject) ? "#0d9488" : "#64748b"} fontSize="8" fontWeight="bold" textAnchor="middle">
                              {u}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Moving Rubber Plunger Stopper */}
                    <rect x={plungerX} y="21" width="10" height="48" rx="2" fill="#334155" stroke="#0284c7" strokeWidth="1.5" />
                    <line x1={plungerX + 5} y1="23" x2={plungerX + 5} y2="67" stroke="#38bdf8" strokeWidth="1.5" />

                    {/* Moving Plunger Rod & Thumb Flange */}
                    <rect x={plungerX + 10} y="41" width="45" height="8" fill="#94a3b8" />
                    <rect x={plungerX + 55} y="30" width="8" height="30" rx="2" fill="#64748b" />

                    {/* Target Mark Indicator Arrow */}
                    <polygon
                      points={`${plungerX},14 ${plungerX - 4},6 ${plungerX + 4},6`}
                      fill="#0d9488"
                    />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="calc-pen-wrap">
                <div className="calc-target-header">
                  <span className="calc-target-label">Rotate Pen Dial To:</span>
                  <span className="calc-target-val blue">
                    {penClicks} CLICKS
                  </span>
                </div>

                {/* Precision Pen Dial Visual */}
                <div className="calc-pen-dial-box">
                  <div className="calc-pen-dial-circle">
                    <span className="calc-pen-clicks-num">{penClicks}</span>
                    <span className="calc-pen-clicks-tag">Clicks</span>
                  </div>
                  <div className="calc-pen-info">
                    <div className="calc-pen-step-title">
                      <CheckCircle2 size={14} color="#0d9488" />
                      <span>Each Click = 0.01 mL (1 Unit)</span>
                    </div>
                    <p className="calc-pen-step-desc">
                      Dial until the number <strong className="teal">{penClicks}</strong> aligns precisely in the dose window.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Aqueous Stability Sentinel Notice */}
          <div className="calc-stability-notice">
            <Snowflake size={16} color="#b45309" style={{ flexShrink: 0 }} />
            <span>
              <strong>Stability Warning:</strong> Once reconstituted with BAC water, store strictly at <strong>2°C – 8°C</strong> and use within <strong>28 days</strong> to prevent degradation.
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calc-root {
          width: 100%;
          background: #ffffff;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 16px;
          padding: 1.5rem;
          color: var(--text-main, #0f172a);
          box-shadow: 0 4px 20px -2px rgba(0, 54, 102, 0.05);
          margin: 1.5rem 0;
          box-sizing: border-box;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }
        .calc-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          border-bottom: 1px solid var(--border-light, #f1f5f9);
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
        }
        .calc-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .calc-icon-badge {
          padding: 0.6rem;
          border-radius: 12px;
          background: #f0fdfa;
          color: #0d9488;
          border: 1px solid #ccfbf1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .calc-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--primary, #003666);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-family: 'Outfit', sans-serif;
        }
        .calc-u100-badge {
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 800;
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .calc-subtitle {
          font-size: 0.78rem;
          color: var(--text-muted, #64748b);
          margin: 0.2rem 0 0 0;
        }
        .calc-switcher {
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 3px;
          border-radius: 10px;
        }
        .calc-switcher-btn {
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          border-radius: 7px;
          transition: all 0.15s ease;
        }
        .calc-switcher-btn.active {
          background: #ffffff;
          color: var(--primary, #003666);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .calc-grid {
            grid-template-columns: 1fr;
          }
        }
        .calc-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .calc-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .calc-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-main, #1e293b);
        }
        .calc-value-accent {
          font-weight: 700;
          color: var(--primary, #003666);
          font-family: monospace;
          font-size: 0.85rem;
        }
        .calc-value-accent.green { color: #16a34a; }
        .calc-value-dim { color: #64748b; font-family: monospace; text-transform: capitalize; }
        .calc-btn-group {
          display: grid;
          gap: 0.5rem;
        }
        .calc-btn-group.grid-4 { grid-template-columns: repeat(4, 1fr); }
        .calc-btn-group.grid-3 { grid-template-columns: repeat(3, 1fr); }
        .calc-pill-btn {
          padding: 0.55rem 0.25rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 8px;
          border: 1px solid var(--border, #e2e8f0);
          background: #ffffff;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }
        .calc-pill-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
          color: #0f172a;
        }
        .calc-pill-btn.active {
          background: #eff6ff;
          border-color: var(--primary, #003666);
          color: var(--primary, #003666);
          box-shadow: 0 1px 2px rgba(0, 54, 102, 0.08);
        }
        .calc-range-slider {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 6px;
          appearance: none;
          accent-color: var(--primary, #003666);
          cursor: pointer;
        }
        .calc-range-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #94a3b8;
          font-family: monospace;
        }
        .calc-instrument-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: space-between;
        }
        .calc-hud-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        @media (max-width: 500px) {
          .calc-hud-strip {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .calc-hud-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem 0.6rem;
        }
        .calc-hud-card.highlight {
          border-color: #93c5fd;
          background: #eff6ff;
        }
        .calc-hud-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .calc-hud-label.primary { color: #1d4ed8; }
        .calc-hud-val {
          display: block;
          font-size: 0.82rem;
          font-weight: 800;
          color: #0f172a;
          font-family: monospace;
          margin-top: 0.15rem;
        }
        .calc-hud-val.primary { color: #1d4ed8; }
        .calc-target-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          margin-bottom: 0.5rem;
        }
        .calc-target-label {
          color: #475569;
          font-weight: 600;
        }
        .calc-target-val {
          font-size: 0.85rem;
          font-weight: 800;
          color: #0d9488;
          font-family: monospace;
          background: #f0fdfa;
          border: 1px solid #99f6e4;
          padding: 0.2rem 0.55rem;
          border-radius: 6px;
        }
        .calc-target-val.blue {
          color: #1d4ed8;
          background: #eff6ff;
          border-color: #bfdbfe;
        }
        .calc-svg-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem;
          overflow: hidden;
        }
        .calc-svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .calc-pen-dial-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1rem;
        }
        .calc-pen-dial-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid #e2e8f0;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .calc-pen-clicks-num {
          font-size: 1.25rem;
          font-weight: 900;
          color: #0f172a;
          font-family: monospace;
          line-height: 1;
        }
        .calc-pen-clicks-tag {
          font-size: 8px;
          font-weight: 700;
          color: #0d9488;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .calc-pen-info {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .calc-pen-step-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .calc-pen-step-desc {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }
        .calc-pen-step-desc strong.teal {
          color: #0d9488;
          font-family: monospace;
        }
        .calc-stability-notice {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
