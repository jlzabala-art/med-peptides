"use client";

import React, { useState, useMemo, useEffect } from 'react';
import './InteractiveReconstitutionGuide.css';
import { 
  FlaskConical, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Sparkles,
  Droplets,
  ShieldCheck
} from '@/lib/icons';
import { getTranslations } from '../../utils/productTranslations';

// ── Static preset arrays — defined outside component to avoid re-allocation ───
const VIAL_PRESETS = Object.freeze([5, 10, 15, 20, 30, 50]);
const BAC_PRESETS = Object.freeze([1.0, 2.0, 2.5, 3.0, 5.0]);
const DOSE_PRESETS_MG = Object.freeze([0.5, 1.0, 2.5, 5.0, 7.5, 10.0]);
const DOSE_PRESETS_MCG = Object.freeze([100, 250, 500, 750, 1000]);

/**
 * InteractiveReconstitutionGuide
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-Trust Clinical Reconstitution Simulator & Precision U-100 Syringe Visualizer.
 * 
 * Security Guarantees:
 * - Pure client-side computation (Zero network requests, zero auth dependency)
 * - Zero route leaks (No external links to authenticated or commercial portals)
 * - Safe clamped inputs (Zero division-by-zero, NaN, or buffer overflows)
 */
export default function InteractiveReconstitutionGuide({ 
  product, 
  selectedStrength, 
  lang = 'en' 
}) {
  const t = getTranslations(lang);

  // Extract initial numeric vial content (mg) from selectedStrength or product
  const initialVialMg = useMemo(() => {
    const rawStr = selectedStrength?.name || product?.name || '';
    const match = String(rawStr).match(/(\d+(\.\d+)?)\s*mg/i);
    return match ? parseFloat(match[1]) : 10;
  }, [selectedStrength, product]);

  // Interactive state
  const [vialMg, setVialMg] = useState(initialVialMg);
  const [bacWaterMl, setBacWaterMl] = useState(2.0); // 2.0 mL standard clinical benchmark
  const [doseUnit, setDoseUnit] = useState('mg'); // 'mg' | 'mcg'
  const [doseValue, setDoseValue] = useState(2.5);

  // Update vial content whenever page changes selected active vial presentation
  useEffect(() => {
    if (initialVialMg && initialVialMg > 0) {
      setVialMg(initialVialMg);
      // Auto-tune standard solvent recommendation based on strength
      if (initialVialMg <= 5) {
        setBacWaterMl(2.0); // 2.5 mg/mL (great for low titration)
      } else if (initialVialMg <= 15) {
        setBacWaterMl(2.0); // 5.0 mg/mL
      } else if (initialVialMg <= 30) {
        setBacWaterMl(4.0); // 5.0 mg/mL (prevents viscous aggregation)
      } else {
        setBacWaterMl(6.0);
      }
    }
  }, [initialVialMg]);

  // Adjust default dose when vial or unit changes
  useEffect(() => {
    if (doseUnit === 'mcg') {
      setDoseValue(prev => (prev > 50 ? prev : Math.min(1000, Math.round(vialMg * 100))));
    } else {
      setDoseValue(prev => (prev <= 50 ? prev : Math.min(10, +(vialMg / 4).toFixed(1))));
    }
  }, [vialMg, doseUnit]);

  // ── Precision Pharmacokinetic Calculations ─────────────────────────────────
  const {
    safeVialMg,
    safeBacMl,
    concentrationMgMl,
    concentrationMcgMl,
    doseMg,
    liquidVolumeMl,
    syringeUnits,
    totalDosesInVial,
    isOverSyringe,
    isUnderMeasured
  } = useMemo(() => {
    const vMg = Math.max(0.1, Math.min(500, parseFloat(vialMg) || 10));
    const bMl = Math.max(0.2, Math.min(20, parseFloat(bacWaterMl) || 2.0));
    
    // Concentration
    const cMgMl = vMg / bMl;
    const cMcgMl = cMgMl * 1000;

    // Dose in mg
    const dMg = doseUnit === 'mcg' ? (parseFloat(doseValue) || 0) / 1000 : (parseFloat(doseValue) || 0);

    // Liquid volume needed (mL) = Dose (mg) / Concentration (mg/mL)
    const volMl = cMgMl > 0 ? dMg / cMgMl : 0;

    // U-100 Insulin Syringe: 1.0 mL = 100 Units -> Units = volMl * 100
    const units = volMl * 100;

    // Estimated full doses per vial
    const doses = dMg > 0 ? Math.floor((vMg / dMg) * 10) / 10 : 0;

    return {
      safeVialMg: vMg,
      safeBacMl: bMl,
      concentrationMgMl: cMgMl,
      concentrationMcgMl: cMcgMl,
      doseMg: dMg,
      liquidVolumeMl: volMl,
      syringeUnits: units,
      totalDosesInVial: doses,
      isOverSyringe: units > 100,
      isUnderMeasured: units > 0 && units < 5
    };
  }, [vialMg, bacWaterMl, doseUnit, doseValue]);

  // Preset arrays are defined as module-level frozen constants (above the component)

  // Visual fill percentage on the 100-unit syringe barrel (clamped 0 - 100%)
  const fillPct = Math.max(0, Math.min(100, (syringeUnits / 100) * 100));

  // Dynamic Step 2 text replacement
  const dynamicSolventText = (t.solventText || '')
    .replace('{volume}', safeBacMl.toFixed(1));

  return (
    <div className="irg-wrapper">
      {/* ── Header ── */}
      <div className="irg-header">
        <div className="irg-header-left">
          <div className="irg-badge">
            <Sparkles size={13} />
            <span>{t.interactiveCalcBadge || 'Interactive Clinical Tool'}</span>
          </div>
          <h2 className="irg-title">
            <Thermometer size={20} color="#003666" />
            {t.interactiveCalcTitle || 'Interactive Reconstitution & U-100 Syringe Simulator'}
          </h2>
          <p className="irg-subtitle">
            {t.interactiveCalcSubtitle || 'Simulate precise Bacteriostatic Water (BAC) volume and target dose to visualize the exact draw line on a U-100 insulin syringe in real time.'}
          </p>
        </div>
      </div>

      {/* ── Interactive Workspace Grid ── */}
      <div className="irg-workspace">
        
        {/* Left Column: Input Parameter Controls */}
        <div className="irg-controls-panel">
          
          {/* Control 1: Vial Content */}
          <div className="irg-control-group">
            <div className="irg-control-label-row">
              <label className="irg-label">
                <FlaskConical size={14} color="#0284c7" />
                {t.vialContentLabel || 'Vial Active Content'}
              </label>
              <span className="irg-val-badge font-mono">{safeVialMg} mg</span>
            </div>
            <div className="irg-pills-row">
              {VIAL_PRESETS.map(mg => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setVialMg(mg)}
                  className={`irg-pill-btn ${safeVialMg === mg ? 'active' : ''}`}
                >
                  {mg} mg
                </button>
              ))}
            </div>
          </div>

          {/* Control 2: Bacteriostatic Water (BAC) */}
          <div className="irg-control-group">
            <div className="irg-control-label-row">
              <label className="irg-label">
                <Droplets size={14} color="#0284c7" />
                {t.bacWaterLabel || 'BAC Water Added (Solvent)'}
              </label>
              <span className="irg-val-badge font-mono">{safeBacMl.toFixed(1)} mL</span>
            </div>
            <div className="irg-pills-row">
              {BAC_PRESETS.map(ml => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => setBacWaterMl(ml)}
                  className={`irg-pill-btn ${safeBacMl === ml ? 'active' : ''}`}
                >
                  {ml.toFixed(1)} mL
                </button>
              ))}
            </div>
            <div className="irg-slider-row">
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={safeBacMl}
                onChange={(e) => setBacWaterMl(parseFloat(e.target.value))}
                className="irg-range-slider"
                aria-label="BAC Water Volume Slider"
              />
            </div>
            <div className="irg-concentration-tag">
              <span className="irg-ct-label">{t.resultingConcLabel || 'Resulting Concentration'}:</span>
              <strong className="irg-ct-val font-mono">
                {concentrationMgMl.toFixed(2)} mg/mL ({Math.round(concentrationMcgMl).toLocaleString()} mcg/mL)
              </strong>
            </div>
          </div>

          {/* Control 3: Target Dose to Draw */}
          <div className="irg-control-group">
            <div className="irg-control-label-row">
              <label className="irg-label">
                <CheckCircle2 size={14} color="#0284c7" />
                {t.targetDoseLabel || 'Target Dose to Draw'}
              </label>
              <div className="irg-unit-toggle">
                <button
                  type="button"
                  onClick={() => setDoseUnit('mg')}
                  className={`irg-toggle-btn ${doseUnit === 'mg' ? 'active' : ''}`}
                >
                  mg
                </button>
                <button
                  type="button"
                  onClick={() => setDoseUnit('mcg')}
                  className={`irg-toggle-btn ${doseUnit === 'mcg' ? 'active' : ''}`}
                >
                  mcg
                </button>
              </div>
            </div>

            <div className="irg-pills-row">
              {(doseUnit === 'mg' ? DOSE_PRESETS_MG : DOSE_PRESETS_MCG).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDoseValue(val)}
                  className={`irg-pill-btn ${doseValue === val ? 'active' : ''}`}
                >
                  {val} {doseUnit}
                </button>
              ))}
            </div>

            <div className="irg-dose-stepper">
              <button
                type="button"
                onClick={() => setDoseValue(prev => Math.max(0.1, +(prev - (doseUnit === 'mg' ? 0.25 : 50)).toFixed(2)))}
                className="irg-step-btn"
                title="Decrease dose"
              >
                −
              </button>
              <div className="irg-dose-input-wrap">
                <input
                  type="number"
                  step={doseUnit === 'mg' ? '0.1' : '25'}
                  min="0.05"
                  value={doseValue}
                  onChange={(e) => setDoseValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="irg-dose-input font-mono"
                  aria-label="Target dose value"
                />
                <span className="irg-dose-unit-affix">{doseUnit}</span>
              </div>
              <button
                type="button"
                onClick={() => setDoseValue(prev => +(prev + (doseUnit === 'mg' ? 0.25 : 50)).toFixed(2))}
                className="irg-step-btn"
                title="Increase dose"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Precision U-100 Syringe Visualizer */}
        <div className="irg-visualizer-panel">
          
          <div className="irg-result-highlight-card">
            <div className="irg-rh-header">
              <span className="irg-rh-title">{t.syringeDrawHeading || 'U-100 Syringe Visual Calibration'}</span>
              <span className="irg-rh-spec font-mono">U-100 (1 mL = 100 U)</span>
            </div>

            <div className="irg-rh-metrics">
              <div className="irg-metric-box">
                <span className="irg-mb-label">{t.unitsToDraw || 'Draw to Exact Mark'}</span>
                <span className="irg-mb-val font-mono text-sky-950">
                  {syringeUnits.toFixed(1)} <small className="text-sky-700">Units</small>
                </span>
              </div>
              <div className="irg-metric-box">
                <span className="irg-mb-label">{t.liquidVol || 'Liquid Volume'}</span>
                <span className="irg-mb-val font-mono text-sky-950">
                  {liquidVolumeMl.toFixed(2)} <small className="text-sky-700">mL</small>
                </span>
              </div>
              <div className="irg-metric-box">
                <span className="irg-mb-label">{t.dosesInVial || 'Total Doses in Vial'}</span>
                <span className="irg-mb-val font-mono text-emerald-800">
                  ~{totalDosesInVial} <small className="text-emerald-700">doses</small>
                </span>
              </div>
            </div>

            {/* Safety Alerts */}
            {isOverSyringe && (
              <div className="irg-alert irg-alert-warning" role="alert">
                <AlertTriangle size={16} />
                <span>{t.warnExceedsSyringe || '⚠ Exceeds single syringe capacity (100 Units / 1.0 mL). Dilute with less BAC water or divide into two separate draws.'}</span>
              </div>
            )}

            {isUnderMeasured && !isOverSyringe && (
              <div className="irg-alert irg-alert-info" role="status">
                <Info size={16} />
                <span>{t.tipSmallVolume || 'ℹ Small draw volume (< 5 Units). Consider adding more BAC water for easier and more precise visual measurement.'}</span>
              </div>
            )}
          </div>

          {/* ── Realistic Interactive U-100 Syringe Graphic ── */}
          <div className="irg-syringe-stage" aria-label={`Insulin syringe displaying ${syringeUnits.toFixed(1)} units`}>
            
            <div className="irg-syringe-container">
              {/* Needle tip */}
              <div className="irg-syringe-needle">
                <div className="irg-needle-steel" />
                <div className="irg-needle-hub" />
              </div>

              {/* Syringe Glass Barrel */}
              <div className="irg-syringe-barrel">
                
                {/* Fluid column */}
                <div 
                  className={`irg-syringe-liquid ${isOverSyringe ? 'overfill' : ''}`}
                  style={{ width: `${fillPct}%` }}
                >
                  <div className="irg-liquid-meniscus" />
                  <div className="irg-liquid-gloss" />
                </div>

                {/* Rubber Plunger Stopper that slides dynamically */}
                <div 
                  className="irg-syringe-stopper"
                  style={{ left: `${fillPct}%` }}
                >
                  <div className="irg-stopper-rubber" />
                  <div className="irg-stopper-shaft" />
                </div>

                {/* Laser Graduations (0 to 100 U) */}
                <div className="irg-syringe-ticks" aria-hidden="true">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(tick => (
                    <div 
                      key={tick} 
                      className={`irg-tick-mark ${tick % 50 === 0 ? 'major' : tick % 10 === 0 ? 'medium' : ''}`}
                      style={{ left: `${tick}%` }}
                    >
                      <div className="irg-tick-line" />
                      <span className="irg-tick-num font-mono">{tick}</span>
                    </div>
                  ))}
                </div>

                {/* Active Alignment Callout Arrow */}
                {!isOverSyringe && syringeUnits > 0 && (
                  <div 
                    className="irg-syringe-pointer"
                    style={{ left: `${fillPct}%` }}
                  >
                    <div className="irg-pointer-pill font-mono">
                      ▲ {syringeUnits.toFixed(1)} U ({liquidVolumeMl.toFixed(2)} mL)
                    </div>
                  </div>
                )}
              </div>

              {/* Syringe Finger Flange & Plunger Thumb Cap */}
              <div className="irg-syringe-flange">
                <div className="irg-flange-lip" />
              </div>
            </div>

            <div className="irg-syringe-caption">
              <ShieldCheck size={13} color="#0284c7" />
              <span>{t.syringeModelSpec || 'U-100 Insulin Syringe (1.0 mL = 100 Units · 1 Unit = 0.01 mL)'}</span>
            </div>
          </div>

        </div>

      </div>

      {/* ── Step-by-Step Clinical Handling Protocol (Wording Refined) ── */}
      <div className="irg-protocol-steps">
        <h3 className="irg-steps-heading">
          {t.reconstitutionSection || 'Reconstitution Protocol & Clinical Cold-Chain Handling'}
        </h3>

        <div className="irg-steps-grid">
          {/* Step 1 */}
          <div className="irg-step-card">
            <div className="irg-step-number">1</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.prepStep}</h4>
              <p className="irg-step-desc">{t.prepText}</p>
            </div>
          </div>

          {/* Step 2 - Dynamically updates with current selected BAC volume */}
          <div className="irg-step-card highlight">
            <div className="irg-step-number">2</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.solventStep}</h4>
              <p className="irg-step-desc">{dynamicSolventText}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="irg-step-card">
            <div className="irg-step-number">3</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.dissolutionStep}</h4>
              <p className="irg-step-desc">{t.dissolutionText}</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="irg-step-card">
            <div className="irg-step-number">4</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.storageStep}</h4>
              <p className="irg-step-desc">{t.storageText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Educational & Clinical Disclaimer ── */}
      <div className="irg-disclaimer">
        <p>
          <strong>Clinical Verification Notice:</strong> This interactive simulator is provided for precision volumetric calibration and clinical laboratory handling reference. Standard U-100 insulin syringes (31G × 8 mm needle) are calibrated at 100 units per 1.0 mL. Individual dosing regimens must be confirmed by a licensed medical practitioner.
        </p>
      </div>
    </div>
  );
}
