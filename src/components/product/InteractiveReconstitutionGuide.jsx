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
import { triggerHaptic } from '@/utils/haptics';
import { getTranslations } from '../../utils/productTranslations';

// ── Static preset arrays — defined outside component to avoid re-allocation ───
const BAC_PRESETS = Object.freeze([1.0, 2.0, 2.5, 3.0, 5.0]);
const DOSE_PRESETS_MG = Object.freeze([0.5, 1.0, 2.5, 5.0, 7.5, 10.0]);
const BLEND_DOSE_PRESETS_MG = Object.freeze([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0]);
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
  availableStrengths = [],
  activeFormatId = 'vial',
  activeFormat = null,
  supplierName = '',
  lang = 'en' 
}) {
  const t = getTranslations(lang);

  const isPenOrCartridge = useMemo(() => {
    const fId = String(activeFormatId || '').toLowerCase();
    const fName = String(activeFormat?.name || '').toLowerCase();
    return fId.includes('pen') || fId.includes('cartridge') || fName.includes('pen') || fName.includes('cartridge');
  }, [activeFormatId, activeFormat]);

  const isSpray = useMemo(() => {
    const fId = String(activeFormatId || '').toLowerCase();
    const fName = String(activeFormat?.name || '').toLowerCase();
    return fId.includes('spray') || fName.includes('spray');
  }, [activeFormatId, activeFormat]);

  const isOral = useMemo(() => {
    const fId = String(activeFormatId || '').toLowerCase();
    const fName = String(activeFormat?.name || '').toLowerCase();
    return fId.includes('capsule') || fId.includes('tablet') || fName.includes('capsule') || fName.includes('tablet') || fId.includes('oral') || fName.includes('oral');
  }, [activeFormatId, activeFormat]);

  // Detect whether this compound is a multi-peptide blend (e.g. KLOW, GLOW)
  const isBlend = useMemo(() => {
    const rawStr = selectedStrength?.name || selectedStrength?.id || product?.name || '';
    const s = String(rawStr).toLowerCase();
    const pName = String(product?.name || '').toLowerCase();
    return s.includes('+') || s.includes('|') || s.includes('/') || pName.includes('klow') || pName.includes('glow') || pName.includes('blend');
  }, [selectedStrength, product]);

  // Extract initial numeric vial content (mg) from selectedStrength or product
  // For blends (e.g. "6 mg + 6 mg + 30 mg + 6 mg" or "10 mg | 10 mg | 75 mg | 10 mg"), sum ALL mg values
  const initialVialMg = useMemo(() => {
    const rawStr = selectedStrength?.name || selectedStrength?.id || product?.name || '';
    const s = String(rawStr);
    // Match all instances of e.g. "6 mg", "30mg"
    const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
    if (mgMatches.length > 0) {
      const sum = mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
      if (sum > 0) return sum;
    }
    // Blend with separators (+, |, /)
    if (s.includes('|') || s.includes('+') || s.includes('/')) {
      const parts = s.split(/[|+/]/);
      let total = 0;
      for (const part of parts) {
        const m = part.match(/(\d+(?:\.\d+)?)/);
        if (m) total += parseFloat(m[1]);
      }
      if (total > 0) return total;
    }
    const match = s.match(/(\d+(\.\d+)?)\s*mg/i) || s.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 10;
  }, [selectedStrength, product]);

  // Interactive state
  const [vialMg, setVialMg] = useState(initialVialMg);
  const [bacWaterMl, setBacWaterMl] = useState(2.0); // 2.0 mL standard clinical benchmark
  const [doseUnit, setDoseUnit] = useState('mg'); // 'mg' | 'mcg'
  const [doseValue, setDoseValue] = useState(isBlend ? 2.0 : 2.5);

  // Update vial content whenever page changes selected active vial presentation
  useEffect(() => {
    if (initialVialMg && initialVialMg > 0) {
      setVialMg(initialVialMg);
      // Auto-tune solvent recommendation based on total active content
      // Matches the tiered concentration logic in PublicDatasheetView
      if (isBlend) {
        // Multi-peptide blends (KLOW, GLOW): Target ~15 mg/mL for comfortable SubQ draw volumes
        const rawVol = initialVialMg / 15.0;
        const snapped = Math.min(10.0, Math.max(1.0, Math.round(rawVol * 2) / 2));
        setBacWaterMl(snapped);
      } else if (initialVialMg <= 5) {
        setBacWaterMl(2.0);  // 2.5 mg/mL — easy low-dose titration
      } else if (initialVialMg <= 15) {
        setBacWaterMl(2.0);  // 5.0–7.5 mg/mL
      } else if (initialVialMg <= 30) {
        setBacWaterMl(4.0);  // 5.0–7.5 mg/mL
      } else if (initialVialMg <= 50) {
        setBacWaterMl(5.0);  // 5.0–10.0 mg/mL
      } else {
        const rawVol = initialVialMg / 15.0;
        const snapped = Math.min(10.0, Math.round(rawVol * 2) / 2);
        setBacWaterMl(snapped);
      }
    }
  }, [initialVialMg, isBlend]);

  // Adjust default dose when vial or unit changes
  useEffect(() => {
    if (doseUnit === 'mcg') {
      setDoseValue(prev => (prev > 50 ? prev : Math.min(1000, Math.round(vialMg * 100))));
    } else if (isBlend) {
      setDoseValue(prev => (prev <= 10 ? prev : 2.0));
    } else {
      setDoseValue(prev => (prev <= 50 ? prev : Math.min(10, +(vialMg / 4).toFixed(1))));
    }
  }, [vialMg, doseUnit, isBlend]);

  // ── Precision Pharmacokinetic Calculations ─────────────────────────────────
  const {
    safeVialMg,
    safeBacMl,
    concentrationMgMl,
    concentrationMcgMl,
    doseMg,
    liquidVolumeMl,
    syringeUnits,
    fillPct,
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
    const fill = Math.min(100, Math.max(0, units));

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
      fillPct: fill,
      totalDosesInVial: doses,
      isOverSyringe: units > 100,
      isUnderMeasured: units > 0 && units < 5
    };
  }, [vialMg, bacWaterMl, doseUnit, doseValue]);

  // Preset arrays are defined as module-level frozen constants (above the component)

  // Extract available vial lot sizes strictly from the genuine catalog presentations
  const productVialOptions = useMemo(() => {
    // 1. Direct availableStrengths prop passed from parent view
    if (Array.isArray(availableStrengths) && availableStrengths.length > 0) {
      const parsed = availableStrengths.map(st => {
        const rawStr = st?.name || st?.id || '';
        const s = String(rawStr);
        const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
        if (mgMatches.length > 0) {
          const sum = mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
          if (sum > 0) return { mg: sum, label: st?.name || `${sum} mg` };
        }
        if (s.includes('|') || s.includes('+') || s.includes('/')) {
          const parts = s.split(/[|+/]/);
          let total = 0;
          for (const part of parts) {
            const m = part.match(/(\d+(?:\.\d+)?)/);
            if (m) total += parseFloat(m[1]);
          }
          if (total > 0) return { mg: total, label: st?.name || `${total} mg` };
        }
        const m = s.match(/(\d+(\.\d+)?)/);
        return m ? { mg: parseFloat(m[1]), label: st?.name || `${m[1]} mg` } : null;
      }).filter(Boolean);

      if (parsed.length > 0) {
        const seen = new Set();
        return parsed.filter(item => {
          if (seen.has(item.mg)) return false;
          seen.add(item.mg);
          return true;
        }).sort((a, b) => a.mg - b.mg);
      }
    }

    // 2. From product.processedHierarchy.strengths
    const rawHierarchy = product?.processedHierarchy?.strengths;
    if (Array.isArray(rawHierarchy) && rawHierarchy.length > 0) {
      const seen = new Set();
      const list = [];
      for (const st of rawHierarchy) {
        const s = String(st?.name || st?.id || '');
        const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
        let total = 0;
        if (mgMatches.length > 0) {
          total = mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
        } else {
          const m = s.match(/(\d+(\.\d+)?)/);
          total = m ? parseFloat(m[1]) : 0;
        }
        if (total > 0 && !seen.has(total)) {
          seen.add(total);
          list.push({ mg: total, label: st?.name || `${total} mg` });
        }
      }
      if (list.length > 0) return list.sort((a, b) => a.mg - b.mg);
    }

    // 3. Fallback: strictly the current active presentation lot size
    if (initialVialMg && initialVialMg > 0) {
      return [{ mg: initialVialMg, label: selectedStrength?.name || `${initialVialMg} mg` }];
    }

    return [{ mg: 10, label: '10 mg' }];
  }, [availableStrengths, product, initialVialMg, selectedStrength]);

  const dynamicVialPresets = useMemo(() => {
    return productVialOptions.map(opt => opt.mg);
  }, [productVialOptions]);

  const dynamicBacPresets = useMemo(() => {
    const list = [...BAC_PRESETS];
    if (safeBacMl && !list.includes(safeBacMl)) {
      list.push(safeBacMl);
      list.sort((a, b) => a - b);
    }
    return list;
  }, [safeBacMl]);

  // ── Pen / Cartridge Pharmacokinetic Calculations ───────────────────────────
  const penVolumeMl = selectedStrength?.volume_ml || 3.0;
  const penTotalMg = initialVialMg > 0 ? initialVialMg : 60;
  const penConcentrationMgMl = penTotalMg / penVolumeMl;
  const penConcentrationMcgMl = penConcentrationMgMl * 1000;

  const [penDoseUnit, setPenDoseUnit] = useState('mg');
  const [penDoseValue, setPenDoseValue] = useState(isBlend ? 1.0 : 0.5);

  const {
    penDoseMg,
    penVolumePerDoseMl,
    penClicks,
    penTotalDoses
  } = useMemo(() => {
    const dMg = penDoseUnit === 'mcg' ? (parseFloat(penDoseValue) || 0) / 1000 : (parseFloat(penDoseValue) || 0);
    const vol = penConcentrationMgMl > 0 ? dMg / penConcentrationMgMl : 0;
    // Standard dial pens: 100 clicks / units per 1.0 mL (1 click = 0.01 mL)
    const clicks = Math.max(1, Math.round(vol * 100));
    const doses = vol > 0 ? Math.floor(penVolumeMl / vol) : 0;
    return {
      penDoseMg: dMg,
      penVolumePerDoseMl: vol,
      penClicks: clicks,
      penTotalDoses: doses
    };
  }, [penDoseUnit, penDoseValue, penConcentrationMgMl, penVolumeMl]);

  const PEN_DOSE_PRESETS_MG = Object.freeze([0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0]);
  const PEN_DOSE_PRESETS_MCG = Object.freeze([100, 250, 500, 750, 1000]);

  // Dynamic Step 2 text replacement (for vials)
  const dynamicSolventText = (t.solventText || '')
    .replace('{volume}', safeBacMl.toFixed(1));

  // ── Dedicated Pre-filled Pen & Cartridge View ──────────────────────────────
  if (isPenOrCartridge) {
    return (
      <div className="irg-wrapper">
        {/* ── Header ── */}
        <div className="irg-header">
          <div className="irg-header-left">
            <div className="irg-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
              <Sparkles size={13} />
              <span>Multi-Dose Pen Delivery System</span>
            </div>
            <h2 className="irg-title">
              <Thermometer size={20} color="#003666" />
              {t.penCalcTitle || 'Pre-filled Pen Dial Dosing & Administration Guide'}
            </h2>
            <p className="irg-subtitle">
              {t.penCalcSubtitle || 'Precision multi-dose dial pen delivery system. Calibrated for subcutaneous micro-dial administration without manual reconstitution.'}
            </p>
          </div>
        </div>

        {/* ── Workspace ── */}
        <div className="irg-workspace">
          {/* Left Column: Parameter Controls */}
          <div className="irg-controls-panel">
            {/* Device Info */}
            <div className="irg-control-group">
              <div className="irg-control-label-row">
                <label className="irg-label">
                  <FlaskConical size={14} color="#0284c7" />
                  {t.penDeviceContent || 'Device Active Content'}
                </label>
                <span className="irg-val-badge font-mono">{selectedStrength?.name || `${penTotalMg} mg`}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Pre-filled sterile formulation: <strong>{penVolumeMl.toFixed(1)} mL</strong>
              </div>
              <div className="irg-concentration-tag">
                <span className="irg-ct-label">Nominal Concentration:</span>
                <strong className="irg-ct-val font-mono">
                  {penConcentrationMgMl.toFixed(2)} mg/mL ({Math.round(penConcentrationMcgMl).toLocaleString()} mcg/mL)
                </strong>
              </div>
            </div>

            {/* Target Dose */}
            <div className="irg-control-group">
              <div className="irg-control-label-row">
                <label className="irg-label">
                  <CheckCircle2 size={14} color="#0284c7" />
                  {t.targetDoseLabel || 'Target Dose to Administer'}
                </label>
                <div className="irg-unit-toggle">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPenDoseUnit('mg');
                    }}
                    className={`irg-toggle-btn ${penDoseUnit === 'mg' ? 'active' : ''}`}
                  >
                    mg
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPenDoseUnit('mcg');
                    }}
                    className={`irg-toggle-btn ${penDoseUnit === 'mcg' ? 'active' : ''}`}
                  >
                    mcg
                  </button>
                </div>
              </div>

              <div className="irg-pills-row">
                {(penDoseUnit === 'mg' ? PEN_DOSE_PRESETS_MG : PEN_DOSE_PRESETS_MCG).map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setPenDoseValue(val);
                    }}
                    className={`irg-pill-btn ${penDoseValue === val ? 'active' : ''}`}
                  >
                    {val} {penDoseUnit}
                  </button>
                ))}
              </div>

              <div className="irg-dose-stepper">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setPenDoseValue(prev => Math.max(0.05, +(prev - (penDoseUnit === 'mg' ? 0.25 : 50)).toFixed(2)));
                  }}
                  className="irg-step-btn"
                  title="Decrease dose"
                >
                  −
                </button>
                <div className="irg-dose-input-wrap">
                  <input
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    step={penDoseUnit === 'mg' ? '0.1' : '25'}
                    min="0.05"
                    value={penDoseValue}
                    onChange={(e) => setPenDoseValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="irg-dose-input font-mono"
                    aria-label="Target pen dose value"
                  />
                  <span className="irg-dose-unit-affix">{penDoseUnit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setPenDoseValue(prev => +(prev + (penDoseUnit === 'mg' ? 0.25 : 50)).toFixed(2));
                  }}
                  className="irg-step-btn"
                  title="Increase dose"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dial Calibration & Realistic Pen Visualizer */}
          <div className="irg-visualizer-panel">
            <div className="irg-result-highlight-card">
              <div className="irg-rh-header">
                <span className="irg-rh-title">Multi-Dose Pen Dial Calibration</span>
                <span className="irg-rh-spec font-mono">1 Click = 0.01 mL</span>
              </div>

              <div className="irg-rh-metrics">
                <div className="irg-metric-box">
                  <span className="irg-mb-label">{t.penDialLabel || 'Dial Setting'}</span>
                  <span className="irg-mb-val font-mono text-sky-950">
                    {penClicks} <small className="text-sky-700">Clicks / Units</small>
                  </span>
                </div>
                <div className="irg-metric-box">
                  <span className="irg-mb-label">{t.liquidVol || 'Liquid Volume'}</span>
                  <span className="irg-mb-val font-mono text-sky-950">
                    {penVolumePerDoseMl.toFixed(2)} <small className="text-sky-700">mL</small>
                  </span>
                </div>
                <div className="irg-metric-box">
                  <span className="irg-mb-label">{t.penDosesInDevice || 'Total Doses in Device'}</span>
                  <span className="irg-mb-val font-mono text-emerald-800">
                    ~{penTotalDoses} <small className="text-emerald-700">doses</small>
                  </span>
                </div>
              </div>
            </div>

            {/* Realistic CSS Pen Graphic Stage */}
            <div className="irg-pen-stage" aria-label={`Pen display calibrated to ${penClicks} clicks`}>
              <div className="irg-pen-container">
                {/* Needle Hub */}
                <div className="irg-pen-needle">
                  <div className="irg-pen-needle-steel" />
                  <div className="irg-pen-needle-hub" />
                </div>

                {/* Cartridge Liquid Reservoir */}
                <div className="irg-pen-cartridge">
                  <div className="irg-pen-liquid-core" />
                  <div className="irg-pen-graduations">
                    <div className="irg-pen-tick" />
                    <div className="irg-pen-tick" />
                    <div className="irg-pen-tick" />
                    <div className="irg-pen-tick" />
                  </div>
                </div>

                {/* Pen Barrel Body */}
                <div className="irg-pen-body">
                  <span className="irg-pen-brand-label">
                    {supplierName ? `${supplierName}` : 'RegenPept'}
                  </span>
                  <div className="irg-pen-dial-window" title="Dose Dial Indicator">
                    <span className="irg-pen-dial-number font-mono">{penClicks}</span>
                  </div>
                </div>

                {/* Dial Knob & Thumb Button */}
                <div className="irg-pen-knob-wrap">
                  <div className="irg-pen-knob" />
                  <div className="irg-pen-button" />
                </div>
              </div>

              <div className="irg-pen-caption">
                <ShieldCheck size={13} color="#38bdf8" />
                <span>Compatible with standard ISO 11608-2 pen needles (31G / 32G × 4mm / 5mm) · 1 Click = 0.01 mL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Steps for Pen */}
        <div className="irg-protocol-steps">
          <h3 className="irg-steps-heading">
            Clinical Administration Protocol (Pre-filled Multi-Dose Pen)
          </h3>

          <div className="irg-steps-grid">
            <div className="irg-step-card">
              <div className="irg-step-number">1</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penPrepStep}</h4>
                <p className="irg-step-desc">{t.penPrepText}</p>
              </div>
            </div>

            <div className="irg-step-card">
              <div className="irg-step-number">2</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penNeedleStep}</h4>
                <p className="irg-step-desc">{t.penNeedleText}</p>
              </div>
            </div>

            <div className="irg-step-card">
              <div className="irg-step-number">3</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penDoseStep}</h4>
                <p className="irg-step-desc">{t.penDoseText}</p>
              </div>
            </div>

            <div className="irg-step-card">
              <div className="irg-step-number">4</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penStorageStep}</h4>
                <p className="irg-step-desc">{t.penStorageText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="irg-disclaimer">
          <p>
            <strong>Clinical Verification Notice:</strong> Pre-filled multi-dose pens are factory-formulated in sterile liquid media and require zero manual solvent reconstitution. Individual dosing units and micro-titrations must be confirmed by an authorized medical practitioner.
          </p>
        </div>
      </div>
    );
  }

  // ── Intranasal Spray Administration Protocol View ────────────────────────
  if (isSpray) {
    return (
      <div className="irg-wrapper">
        <div className="irg-header">
          <div className="irg-header-left">
            <div className="irg-badge">
              <Sparkles size={13} />
              <span>Intranasal Delivery System</span>
            </div>
            <h2 className="irg-title">
              <Thermometer size={20} color="#003666" />
              Clinical Intranasal Administration Protocol
            </h2>
            <p className="irg-subtitle">
              Metered-dose mucosal delivery system formulated in sterile isotonic buffered vehicle. Direct mucosal absorption bypassing first-pass hepatic metabolism.
            </p>
          </div>
        </div>

        <div className="irg-workspace">
          <div className="irg-controls-panel">
            <h3 className="irg-panel-heading">Spray Device Specifications</h3>
            
            <div className="irg-summary-card" style={{ marginBottom: '16px' }}>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Delivery Mechanism</span>
                <span className="irg-sum-val">Metered Mucosal Pump (0.1 mL / spray)</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Active Formulation</span>
                <span className="irg-sum-val">{selectedStrength?.name || 'Metered Concentration'}</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Reconstitution</span>
                <span className="irg-sum-val font-semibold text-emerald-700">None required (Ready to use)</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Cold-Chain Storage</span>
                <span className="irg-sum-val font-semibold text-sky-900">2°C – 8°C (Upright position)</span>
              </div>
            </div>
          </div>

          <div className="irg-visual-panel">
            <div className="irg-protocol-steps" style={{ marginTop: 0 }}>
              <h3 className="irg-steps-heading">Step-by-Step Mucosal Protocol</h3>
              <div className="irg-steps-grid">
                <div className="irg-step-card">
                  <div className="irg-step-number">1</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Priming the Nozzle</h4>
                    <p className="irg-step-desc">On first clinical use or after 5+ days of non-use, pump 2–3 times into the air until a uniform fine aerosol mist is emitted.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">2</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Clear Nasal Passages</h4>
                    <p className="irg-step-desc">Gently blow nose before administration. Keep head tilted slightly forward to avoid swallowing the formulation.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">3</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Angle of Application</h4>
                    <p className="irg-step-desc">Insert tip into nostril, occlude the opposite nostril. Aim slightly outward toward the top of the ear (away from septum). Press actuator firmly while inhaling gently.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">4</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Absorption & Hygiene</h4>
                    <p className="irg-step-desc">Exhale through mouth. Do not sniff forcefully or blow nose for 15 minutes. Wipe nozzle with a sterile wipe and replace the cap.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="irg-disclaimer">
          <p>
            <strong>Clinical Verification Notice:</strong> Intranasal peptides are formulated in sterile, buffered isotonic media and require zero manual solvent dilution. Dosage must be confirmed by an authorized medical practitioner.
          </p>
        </div>
      </div>
    );
  }

  // ── Oral Capsule / Gastro-Resistant Protocol View ─────────────────────────
  if (isOral) {
    return (
      <div className="irg-wrapper">
        <div className="irg-header">
          <div className="irg-header-left">
            <div className="irg-badge">
              <Sparkles size={13} />
              <span>Enteric Gastro-Resistant Delivery</span>
            </div>
            <h2 className="irg-title">
              <Thermometer size={20} color="#003666" />
              Clinical Oral Administration Protocol
            </h2>
            <p className="irg-subtitle">
              Engineered acid-resistant enteric matrix designed to shield active peptide bonds from gastric degradation, ensuring targeted systemic absorption in the small intestine.
            </p>
          </div>
        </div>

        <div className="irg-workspace">
          <div className="irg-controls-panel">
            <h3 className="irg-panel-heading">Oral Formulation Parameters</h3>
            
            <div className="irg-summary-card" style={{ marginBottom: '16px' }}>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Capsule Technology</span>
                <span className="irg-sum-val">pH-Dependent Acid-Resistant HPMC</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Active Dose</span>
                <span className="irg-sum-val">{selectedStrength?.name || 'Standard Unit Dose'}</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Administration Timing</span>
                <span className="irg-sum-val font-semibold text-sky-950">Fasting / Empty stomach</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Storage Conditions</span>
                <span className="irg-sum-val font-semibold text-sky-900">15°C – 25°C (Cool, dry place)</span>
              </div>
            </div>
          </div>

          <div className="irg-visual-panel">
            <div className="irg-protocol-steps" style={{ marginTop: 0 }}>
              <h3 className="irg-steps-heading">Clinical Ingestion Guidelines</h3>
              <div className="irg-steps-grid">
                <div className="irg-step-card">
                  <div className="irg-step-number">1</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Fasting Administration</h4>
                    <p className="irg-step-desc">Take first thing in the morning upon waking, or at least 2 hours after food intake to optimize gastric transit time.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">2</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Swallow Whole with Water</h4>
                    <p className="irg-step-desc">Ingest capsule whole with 200–250 mL of room-temperature water. Do not chew, open, or dissolve the capsule.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">3</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Post-Ingestion Window</h4>
                    <p className="irg-step-desc">Wait at least 30 to 45 minutes before eating or drinking hot coffee/tea to allow safe passage into the duodenum.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">4</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Protection from Humidity</h4>
                    <p className="irg-step-desc">Keep bottle tightly sealed with desiccant pouch inside. Avoid exposure to high heat and direct sunlight.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="irg-disclaimer">
          <p>
            <strong>Clinical Verification Notice:</strong> Enteric capsules rely on intact coatings to bypass stomach acid. Never break or dissolve the capsule prior to ingestion.
          </p>
        </div>
      </div>
    );
  }

  // ── Standard Lyophilized Vial & Syringe Reconstitution View ─────────────────
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
              {productVialOptions.map(opt => (
                <button
                  key={opt.mg}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVialMg(opt.mg);
                  }}
                  className={`irg-pill-btn ${safeVialMg === opt.mg ? 'active' : ''}`}
                >
                  {opt.mg} mg
                </button>
              ))}
            </div>
            {isBlend && (
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.35 }}>
                Lot Formulation: <strong style={{ color: '#003666' }}>{selectedStrength?.name || `${safeVialMg} mg`}</strong>
              </div>
            )}
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
              {dynamicBacPresets.map(ml => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setBacWaterMl(ml);
                  }}
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
                max="10.0"
                step="0.5"
                value={safeBacMl}
                onChange={(e) => {
                  triggerHaptic('tap');
                  setBacWaterMl(parseFloat(e.target.value));
                }}
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
                  onClick={() => {
                    triggerHaptic('selection');
                    setDoseUnit('mg');
                  }}
                  className={`irg-toggle-btn ${doseUnit === 'mg' ? 'active' : ''}`}
                >
                  mg
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setDoseUnit('mcg');
                  }}
                  className={`irg-toggle-btn ${doseUnit === 'mcg' ? 'active' : ''}`}
                >
                  mcg
                </button>
              </div>
            </div>

            <div className="irg-pills-row">
              {(doseUnit === 'mg' ? (isBlend ? BLEND_DOSE_PRESETS_MG : DOSE_PRESETS_MG) : DOSE_PRESETS_MCG).map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setDoseValue(val);
                  }}
                  className={`irg-pill-btn ${doseValue === val ? 'active' : ''}`}
                >
                  {val} {doseUnit}
                </button>
              ))}
            </div>

            <div className="irg-dose-stepper">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setDoseValue(prev => Math.max(0.1, +(prev - (doseUnit === 'mg' ? 0.25 : 50)).toFixed(2)));
                }}
                className="irg-step-btn"
                title="Decrease dose"
              >
                −
              </button>
              <div className="irg-dose-input-wrap">
                <input
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
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
                onClick={() => {
                  triggerHaptic('tap');
                  setDoseValue(prev => +(prev + (doseUnit === 'mg' ? 0.25 : 50)).toFixed(2));
                }}
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
          <div className="irg-step-card">
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
