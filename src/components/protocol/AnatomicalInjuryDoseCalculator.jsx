"use client";

import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  Syringe,
  Package
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './AnatomicalInjuryDoseCalculator.css';

/**
 * AnatomicalInjuryDoseCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console UX Calculator for Musculoskeletal Regeneration (BPC-157 & TB-500).
 * Calculates tissue-specific weight-based daily BPC-157 dose, systemic TB-500 cadence,
 * peri-lesional injection geometry, and total cycle vials required.
 */
export default function AnatomicalInjuryDoseCalculator({ 
  lang = 'en',
  onCalibrationChange = null,
  initialCalibration = null
}) {
  const isEs = lang === 'es';

  // Baseline defaults
  const DEFAULT_WEIGHT_KG = initialCalibration?.weightKg || 75;
  const DEFAULT_TISSUE = initialCalibration?.tissue || 'tendon';
  const DEFAULT_CHRONICITY = initialCalibration?.chronicity || 'subacute';

  // State
  const [unit, setUnit] = useState('kg');
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT_KG);
  const [tissue, setTissue] = useState(DEFAULT_TISSUE);
  const [chronicity, setChronicity] = useState(DEFAULT_CHRONICITY);
  const [isCustomized, setIsCustomized] = useState(Boolean(initialCalibration?.isCustomized));
  const [copied, setCopied] = useState(false);

  // Tissue options metadata
  const TISSUES = [
    {
      id: 'tendon',
      nameEs: 'Tendón (Aquiles, Rotuliano, Manguito)',
      nameEn: 'Tendon (Achilles, Patellar, Cuff)',
      multiplier: 5.0, // mcg/kg
      durationWeeks: { acute: 4, subacute: 6, chronic: 8 },
      geometryEs: 'Perilesional SubQ a 2.0 – 4.0 cm del epicentro (NUNCA intratendinoso)',
      geometryEn: 'Peri-lesional SubQ within 2.0 – 4.0 cm radius (NEVER intratendinous)'
    },
    {
      id: 'muscle',
      nameEs: 'Músculo (Desgarro Isquiotibial, Gemelo)',
      nameEn: 'Muscle (Hamstring, Calf Tear)',
      multiplier: 4.0, // mcg/kg
      durationWeeks: { acute: 3, subacute: 4, chronic: 6 },
      geometryEs: 'Perilesional SubQ o Sistémico abdominal (tejido altamente vascularizado)',
      geometryEn: 'Peri-lesional SubQ or Systemic abdominal (high vascular perfusion)'
    },
    {
      id: 'ligament',
      nameEs: 'Ligamento (Tobillo, Cruzado, Acromio)',
      nameEn: 'Ligament (Ankle, Cruciate, Acromial)',
      multiplier: 4.5, // mcg/kg
      durationWeeks: { acute: 4, subacute: 6, chronic: 8 },
      geometryEs: 'Perilesional SubQ periarticular superficial (sin sobrepresión capsular)',
      geometryEn: 'Peri-lesional SubQ periarticular superficial (no intra-capsular pressure)'
    },
    {
      id: 'cartilage',
      nameEs: 'Cartílago / Post-Artroscopia',
      nameEn: 'Cartilage / Post-Arthroscopy',
      multiplier: 4.0, // mcg/kg
      durationWeeks: { acute: 6, subacute: 8, chronic: 10 },
      geometryEs: 'Sistémico abdominal continuo + infiltración periarticular protegida',
      geometryEn: 'Continuous abdominal systemic + protected periarticular margin'
    }
  ];

  const CHRONICITIES = [
    {
      id: 'acute',
      labelEs: 'Agudo (< 2 sem)',
      labelEn: 'Acute (< 2 wks)',
      tb500WeeklyMg: 5.0, // 2.5mg 2x/wk
      cadenceNoteEs: 'Fase de choque: TB-500 2.5 mg 2x/semana',
      cadenceNoteEn: 'Loading phase: TB-500 2.5 mg 2x/week'
    },
    {
      id: 'subacute',
      labelEs: 'Subagudo (2 – 6 sem)',
      labelEn: 'Subacute (2 – 6 wks)',
      tb500WeeklyMg: 5.0,
      cadenceNoteEs: 'Carga inicial (2 sem) y consolidación 2.5 mg/semana',
      cadenceNoteEn: 'Initial load (2 wks) then 2.5 mg/week'
    },
    {
      id: 'chronic',
      labelEs: 'Crónico / Recidivante (> 6 sem)',
      labelEn: 'Chronic (> 6 wks)',
      tb500WeeklyMg: 2.5,
      cadenceNoteEs: 'Mantenimiento continuo y remodelación excéntrica lenta',
      cadenceNoteEn: 'Sustained remodeling and heavy slow eccentric loading'
    }
  ];

  // Calculations
  const calculations = useMemo(() => {
    const selectedTissueObj = TISSUES.find(t => t.id === tissue) || TISSUES[0];
    const selectedChronicityObj = CHRONICITIES.find(c => c.id === chronicity) || CHRONICITIES[1];

    // Daily BPC-157 in mcg (rounded to nearest 25 mcg)
    const rawBpcDose = weightKg * selectedTissueObj.multiplier;
    const bpcDailyMcg = Math.round(rawBpcDose / 25) * 25;

    // Weeks
    const cycleWeeks = selectedTissueObj.durationWeeks[chronicity] || 6;

    // TB-500 weekly
    const tb500WeeklyMg = selectedChronicityObj.tb500WeeklyMg;

    // Total API requirements for entire cycle
    const totalBpcMg = (bpcDailyMcg * 7 * cycleWeeks) / 1000;
    const bpcVials5mg = Math.ceil(totalBpcMg / 5);

    const totalTb500Mg = tb500WeeklyMg * cycleWeeks;
    const tb500Vials5mg = Math.ceil(totalTb500Mg / 5);

    // Reconstitution volume for U-100 syringe (assuming 5mg vial in 2ml BAC)
    // 5mg in 2ml = 2500 mcg/ml = 25 mcg / unit (IU)
    const syringeUnitsPerDose = Math.round(bpcDailyMcg / 25);

    return {
      bpcDailyMcg,
      syringeUnitsPerDose,
      tb500WeeklyMg,
      cycleWeeks,
      totalBpcMg: totalBpcMg.toFixed(1),
      bpcVials5mg,
      totalTb500Mg: totalTb500Mg.toFixed(1),
      tb500Vials5mg,
      geometry: isEs ? selectedTissueObj.geometryEs : selectedTissueObj.geometryEn,
      cadenceNote: isEs ? selectedChronicityObj.cadenceNoteEs : selectedChronicityObj.cadenceNoteEn
    };
  }, [weightKg, tissue, chronicity, isEs]);

  // Notify parent of calibration changes
  React.useEffect(() => {
    if (typeof onCalibrationChange === 'function') {
      const selectedTissueObj = TISSUES.find(t => t.id === tissue) || TISSUES[0];
      const selectedChronicityObj = CHRONICITIES.find(c => c.id === chronicity) || CHRONICITIES[1];
      onCalibrationChange({
        isCustomized,
        weightKg,
        unit,
        tissue,
        tissueName: isEs ? selectedTissueObj.nameEs : selectedTissueObj.nameEn,
        multiplier: selectedTissueObj.multiplier,
        chronicity,
        chronicityLabel: isEs ? selectedChronicityObj.labelEs : selectedChronicityObj.labelEn,
        bpcDailyMcg: calculations.bpcDailyMcg,
        tb500WeeklyMg: calculations.tb500WeeklyMg,
        cycleWeeks: calculations.cycleWeeks,
        syringeUnitsPerDose: calculations.syringeUnitsPerDose,
        bpcVials5mg: calculations.bpcVials5mg,
        tb500Vials5mg: calculations.tb500Vials5mg,
        geometry: calculations.geometry,
        cadenceNote: calculations.cadenceNote
      });
    }
  }, [weightKg, unit, tissue, chronicity, calculations, isCustomized, isEs, onCalibrationChange]);

  const displayedWeight = unit === 'kg' ? weightKg : Math.round(weightKg * 2.20462);

  const handleWeightChange = (val) => {
    setIsCustomized(true);
    if (unit === 'kg') setWeightKg(Number(val));
    else setWeightKg(Math.round(Number(val) / 2.20462));
  };

  const handleReset = () => {
    setWeightKg(DEFAULT_WEIGHT_KG);
    setTissue(DEFAULT_TISSUE);
    setChronicity(DEFAULT_CHRONICITY);
    setIsCustomized(false);
    toast.success(isEs ? 'Restablecido a los valores estándar de referencia' : 'Reset to standard tissue baseline');
    if (typeof onCalibrationChange === 'function') {
      onCalibrationChange(null);
    }
  };

  const handleCopy = async () => {
    const tissueName = TISSUES.find(t => t.id === tissue)?.[isEs ? 'nameEs' : 'nameEn'];
    const chronLabel = CHRONICITIES.find(c => c.id === chronicity)?.[isEs ? 'labelEs' : 'labelEn'];

    const text = isEs
      ? `*Pauta Personalizada BPC-157 & TB-500 — ${tissueName}*\n` +
        `⚖️ Peso: ${displayedWeight} ${unit} · Estado: ${chronLabel}\n` +
        `💉 BPC-157: ${calculations.bpcDailyMcg} mcg/día (${calculations.syringeUnitsPerDose} unidades U-100 en vial 5mg/2ml)\n` +
        `💉 TB-500: ${calculations.tb500WeeklyMg} mg/semana (${calculations.cadenceNote})\n` +
        `📍 Geometría: ${calculations.geometry}\n` +
        `📦 Suministros ciclo (${calculations.cycleWeeks} sem): ${calculations.bpcVials5mg} viales BPC-157 (5mg) + ${calculations.tb500Vials5mg} viales TB-500 (5mg)\n\n` +
        `_Med-Peptides Clinical Regenerative Protocol_`
      : `*Customized BPC-157 & TB-500 Protocol — ${tissueName}*\n` +
        `⚖️ Weight: ${displayedWeight} ${unit} · Stage: ${chronLabel}\n` +
        `💉 BPC-157: ${calculations.bpcDailyMcg} mcg/day (${calculations.syringeUnitsPerDose} units U-100 for 5mg/2ml)\n` +
        `💉 TB-500: ${calculations.tb500WeeklyMg} mg/week (${calculations.cadenceNote})\n` +
        `📍 Infiltration: ${calculations.geometry}\n` +
        `📦 Cycle Supplies (${calculations.cycleWeeks} wks): ${calculations.bpcVials5mg} vials BPC-157 (5mg) + ${calculations.tb500Vials5mg} vials TB-500 (5mg)\n\n` +
        `_Med-Peptides Clinical Regenerative Protocol_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isEs ? 'Pauta de dosificación copiada al portapapeles' : 'Dosage guideline copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <div className="aidc-container">
      {/* ── Header ── */}
      <div className="aidc-header">
        <div className="aidc-header-left">
          <div className="aidc-icon-wrap">
            <Activity size={18} color="#003666" />
          </div>
          <div>
            <div className="aidc-badges-row">
              <span className="aidc-badge aidc-badge-cyan">
                {isEs ? 'Dosificación Ponderal' : 'Weight-Adjusted Kinetics'}
              </span>
              <span className="aidc-badge aidc-badge-slate">
                {isEs ? 'Infiltración Tisular' : 'Tissue-Specific Mapping'}
              </span>
            </div>
            <h4 className="aidc-title">
              {isEs
                ? 'Calculadora de Gravedad de Lesión, Dosificación Ponderal y Radio Anatómico'
                : 'Tissue Injury Grade, Weight-Based Dose & Anatomical Geometry Calculator'}
            </h4>
            <p className="aidc-subtitle">
              {isEs
                ? 'Calcula la dosis de BPC-157 en microgramos/kg, la cadencia de carga de TB-500 y los viales necesarios según el tejido y tiempo de evolución.'
                : 'Compute mcg/kg daily BPC-157 titration, systemic TB-500 cadence, and exact cycle vials tailored to tissue vascularity and lesion chronicity.'}
            </p>
          </div>
        </div>

        <div className="aidc-header-actions">
          {isCustomized && (
            <button type="button" onClick={handleReset} className="aidc-btn-secondary">
              <RotateCcw size={12} />
              <span>{isEs ? 'Restablecer' : 'Reset'}</span>
            </button>
          )}
          <button type="button" onClick={handleCopy} className="aidc-btn-primary">
            {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
            <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Pauta' : 'Copy Guideline')}</span>
          </button>
        </div>
      </div>

      {/* ── Split Layout: Form Controls on Left, 2x2 GCP Cards on Right ── */}
      <div className="aidc-body-grid">
        
        {/* Left: Input Controls */}
        <div className="aidc-form-col">
          <span className="aidc-form-kicker">
            {isEs ? 'Parámetros del Paciente y Lesión' : 'Patient & Injury Inputs'}
          </span>

          {/* 1. Weight Slider */}
          <div className="aidc-field">
            <div className="aidc-field-label-row">
              <span className="aidc-label">{isEs ? 'Peso del Paciente:' : 'Patient Weight:'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="aidc-val-pill">
                  {displayedWeight} {unit}
                </span>
                <div className="aidc-unit-toggle">
                  <button
                    type="button"
                    className={`aidc-unit-btn ${unit === 'kg' ? 'active' : ''}`}
                    onClick={() => setUnit('kg')}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`aidc-unit-btn ${unit === 'lbs' ? 'active' : ''}`}
                    onClick={() => setUnit('lbs')}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={unit === 'kg' ? 45 : 100}
              max={unit === 'kg' ? 140 : 310}
              step="1"
              value={displayedWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="aidc-slider-input"
            />
          </div>

          {/* 2. Tissue Selection */}
          <div className="aidc-field">
            <div className="aidc-field-label-row">
              <span className="aidc-label">{isEs ? 'Tejido Comprometido:' : 'Affected Tissue Type:'}</span>
            </div>
            <div className="aidc-tissue-options">
              {TISSUES.map((tItem) => (
                <button
                  key={tItem.id}
                  type="button"
                  className={`aidc-tissue-card ${tissue === tItem.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setTissue(tItem.id);
                    setIsCustomized(true);
                  }}
                >
                  <span className="aidc-tissue-name">{isEs ? tItem.nameEs : tItem.nameEn}</span>
                  <span className="aidc-tissue-ratio">{tItem.multiplier} mcg/kg/d</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Chronicity / Injury Stage */}
          <div className="aidc-field">
            <div className="aidc-field-label-row">
              <span className="aidc-label">{isEs ? 'Fase de la Lesión:' : 'Injury Chronicity:'}</span>
            </div>
            <div className="aidc-segmented-chron">
              {CHRONICITIES.map((cItem) => (
                <button
                  key={cItem.id}
                  type="button"
                  className={`aidc-chron-btn ${chronicity === cItem.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setChronicity(cItem.id);
                    setIsCustomized(true);
                  }}
                >
                  {isEs ? cItem.labelEs : cItem.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: GCP 2x2 Output Metric Cards */}
        <div className="aidc-output-col">
          <span className="aidc-output-kicker">
            {isEs ? 'Dosificación Estratificada y Protocolo de Infiltración' : 'Stratified Dosage & Injection Protocol'}
          </span>

          <div className="aidc-metrics-grid">
            {/* Card 1: BPC-157 Daily Dose */}
            <div className="aidc-metric-card">
              <span className="aidc-metric-label">
                {isEs ? 'Dosis Diaria BPC-157' : 'BPC-157 Daily Dose'}
              </span>
              <div className="aidc-metric-value aidc-highlight">
                {calculations.bpcDailyMcg} <small>{isEs ? 'mcg/día' : 'mcg/day'}</small>
              </div>
              <span className="aidc-metric-sub">
                <Syringe size={12} style={{ display: 'inline', marginRight: '3px' }} />
                <strong>{calculations.syringeUnitsPerDose} {isEs ? 'UI' : 'IU'}</strong> {isEs ? 'en jeringa U-100 (vial 5mg en 2.0 ml BAC)' : 'in U-100 syringe (5mg vial in 2.0 ml BAC)'}
              </span>
            </div>

            {/* Card 2: TB-500 Systemic Cadence */}
            <div className="aidc-metric-card">
              <span className="aidc-metric-label">
                {isEs ? 'TB-500 Sistémico' : 'TB-500 Systemic Cadence'}
              </span>
              <div className="aidc-metric-value">
                {calculations.tb500WeeklyMg} <small>{isEs ? 'mg/sem' : 'mg/wk'}</small>
              </div>
              <span className="aidc-metric-sub">
                {calculations.cadenceNote}
              </span>
            </div>

            {/* Card 3: Peri-Lesional Injection Geometry */}
            <div className="aidc-metric-card aidc-card-geometry">
              <span className="aidc-metric-label">
                {isEs ? 'Geometría y Radio de Punción' : 'Puncture Radius & Geometry'}
              </span>
              <div className="aidc-geom-box">
                <span className="aidc-geom-badge">31G 8mm · 45°</span>
                <p className="aidc-geom-text">{calculations.geometry}</p>
              </div>
              <span className="aidc-metric-sub">
                {isEs ? 'Infiltrar en abanico subcutáneo sin penetrar vaina ni masa tendinosa rígida.' : 'SubQ fan infiltration without penetrating rigid tendon body.'}
              </span>
            </div>

            {/* Card 4: Total Supplies & Cycle Duration */}
            <div className="aidc-metric-card">
              <span className="aidc-metric-label">
                {isEs ? 'Suministros del Ciclo' : 'Cycle Supplies Required'}
              </span>
              <div className="aidc-metric-value">
                {calculations.cycleWeeks} <small>{isEs ? 'Semanas' : 'Weeks'}</small>
              </div>
              <div className="aidc-vials-row">
                <span className="aidc-vial-tag">
                  <Package size={11} /> {calculations.bpcVials5mg}x BPC-157 (5mg)
                </span>
                <span className="aidc-vial-tag">
                  <Package size={11} /> {calculations.tb500Vials5mg}x TB-500 (5mg)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
