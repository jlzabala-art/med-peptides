"use client";

import React, { useState, useMemo } from 'react';
import { Activity, RotateCcw, Info, ArrowRight, Sparkles, Sliders, ExternalLink, ChevronDown, CheckCircle2 } from '@/lib/icons';
import { detectProtocolBiomarker, computeCalibrationDisplay } from '@/utils/biomarkerCalibrationHelper';

export default function BiomarkerCalibrationBanner({
  calibrationDisplay,
  biomarkerCalibration,
  onCalibrate,
  onClearCalibration,
  slug = '',
  protocolCategory = '',
  protocolTitle = '',
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [isExpanded, setIsExpanded] = useState(false);

  // Detect relevant biomarker for this specific protocol
  const detectedBiomarker = useMemo(() => {
    return detectProtocolBiomarker(slug, protocolCategory, protocolTitle);
  }, [slug, protocolCategory, protocolTitle]);

  // Current level in the interactive slider
  const currentLevel = biomarkerCalibration?.level ?? detectedBiomarker.defaultLevel;

  // Active or local calibration display
  const activeDisplay = useMemo(() => {
    if (calibrationDisplay) return calibrationDisplay;
    if (isExpanded) {
      const simulated = {
        type: detectedBiomarker.type,
        level: currentLevel,
        baseline: currentLevel > (detectedBiomarker.type === 'hba1c' ? 6.5 : (detectedBiomarker.type === 'nad' ? 25 : 18)) ? 'optimal' : 'severe',
        tier: 'critical',
        modality: detectedBiomarker.type === 'nad' ? 'intravenous' : 'incretin',
        retest: '12w'
      };
      return computeCalibrationDisplay(simulated, lang);
    }
    return null;
  }, [calibrationDisplay, isExpanded, detectedBiomarker, currentLevel, lang]);

  // Handle slider / input change
  const handleLevelChange = (newVal) => {
    const num = parseFloat(newVal);
    if (isNaN(num)) return;

    // Find closest preset or calculate baseline
    let baseline = 'warning';
    let tier = 'warning';
    let modality = 'standard';
    let retest = '12w';

    if (detectedBiomarker.type === 'hba1c') {
      if (num < 5.4) { baseline = 'optimal'; tier = 'normal'; modality = 'maintenance'; retest = '6m'; }
      else if (num < 6.5) { baseline = 'warning'; tier = 'warning'; modality = 'incretin'; retest = '12w'; }
      else { baseline = 'severe'; tier = 'critical'; modality = 'incretin'; retest = '12w'; }
    } else if (detectedBiomarker.type === 'nad') {
      if (num < 10.3) { baseline = 'severe'; tier = 'critical'; modality = 'intravenous'; retest = '4w'; }
      else if (num < 15.4) { baseline = 'suboptimal'; tier = 'warning'; modality = 'subcutaneous'; retest = '8w'; }
      else { baseline = 'optimal'; tier = 'normal'; modality = 'maintenance'; retest = '6m'; }
    } else if (detectedBiomarker.type === 'testosterone') {
      if (num < 10) { baseline = 'deficient'; tier = 'critical'; modality = 'secretagogues'; retest = '8w'; }
      else if (num < 18) { baseline = 'suboptimal'; tier = 'warning'; modality = 'secretagogues'; retest = '8w'; }
      else { baseline = 'optimal'; tier = 'normal'; modality = 'maintenance'; retest = '6m'; }
    } else if (detectedBiomarker.type === 'cortisol') {
      if (num < 150) { baseline = 'exhaustion'; tier = 'critical'; modality = 'neurorestoration'; retest = '8w'; }
      else if (num > 500) { baseline = 'hypercortisol'; tier = 'critical'; modality = 'neurorestoration'; retest = '8w'; }
      else { baseline = 'optimal'; tier = 'normal'; modality = 'maintenance'; retest = '6m'; }
    }

    const payload = {
      type: detectedBiomarker.type,
      level: num,
      baseline,
      tier,
      modality,
      retest
    };

    if (onCalibrate) {
      onCalibrate(payload);
    }
  };

  // Handle Preset Button Click
  const handlePresetSelect = (preset) => {
    handleLevelChange(preset.value);
  };

  // If NOT calibrated and NOT expanded, show the executive GCP Calibration Bar
  if (!calibrationDisplay && !isExpanded) {
    return (
      <div
        className="proto-biomarker-calibration-banner"
        style={{
          borderLeftColor: '#0284c7',
          background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          padding: '1.1rem 1.4rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Activity size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '0.05em' }}>
                  {isEs ? 'CALIBRACIÓN CLÍNICA DE PRECISIÓN DISPONIBLE' : 'PRECISION BIOMARKER CALIBRATION AVAILABLE'}
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                  Bloodo DBS™ · LifeLab1 (EU)
                </span>
              </div>
              <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
                {isEs
                  ? `Calibrar pauta según ${detectedBiomarker.nameEs}`
                  : `Calibrate protocol dosing to patient's ${detectedBiomarker.nameEn}`}
              </h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                {isEs
                  ? 'Ajuste dinámico de titulación semanal, vía parenteral vs subcutánea y ventanas de control capilar según analítica real.'
                  : 'Dynamic adjustment of titration velocity, delivery modality, and lab re-test milestones to match patient biomarkers.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                border: '1px solid #0284c7',
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Sliders size={14} />
              <span>{isEs ? 'Calibrar con Analítica de Sangre' : 'Calibrate with Blood Test'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active / Expanded Calibrator View
  const display = activeDisplay || calibrationDisplay;

  return (
    <div className="proto-biomarker-calibration-banner" style={{ borderLeftColor: display?.tierColor || '#0d9488' }}>
      {/* Top Header */}
      <div className="pbc-header">
        <div className="pbc-header-left">
          <div className="pbc-badge-icon" style={{ backgroundColor: display?.tierBg || '#f0fdfa', color: display?.tierColor || '#0d9488' }}>
            <Activity size={18} />
          </div>
          <div>
            <div className="pbc-meta-row">
              <span className="pbc-kicker">
                {isEs ? 'CALIBRACIÓN CLÍNICA PERSONALIZADA POR BIOMARCADOR' : 'PRECISION BIOMARKER-DRIVEN PROTOCOL CALIBRATION'}
              </span>
              <span className="pbc-source-tag">Bloodo DBS™ · LifeLab1 (Vilnius, EU)</span>
            </div>
            <h4 className="pbc-title">
              {display?.titleText || (isEs ? `Estratificación Analítica: ${detectedBiomarker.nameEs}` : `Diagnostic Stratification: ${detectedBiomarker.nameEn}`)}
            </h4>
          </div>
        </div>
        <div className="pbc-header-right">
          {display?.tierBadgeText && (
            <span className="pbc-tier-pill" style={{ backgroundColor: display.tierBg, color: display.tierColor, borderColor: display.tierColor + '40' }}>
              {display.tierBadgeText}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (onClearCalibration) onClearCalibration();
              setIsExpanded(false);
            }}
            className="pbc-btn-reset"
            title={isEs ? 'Ver protocolo estándar no calibrado' : 'View uncalibrated standard protocol'}
          >
            <RotateCcw size={13} />
            <span>{isEs ? 'Restablecer Pauta Estándar' : 'Reset to Standard'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Calibration Controls (Google Cloud Slider + Preset Brackets) */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={14} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
              {isEs ? `Nivel Determinado en Analítica (${detectedBiomarker.nameEs}):` : `Patient Lab Value (${detectedBiomarker.nameEn}):`}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', marginRight: '3px' }}>
              {isEs ? 'Estratos Clínicos:' : 'Clinical Tiers:'}
            </span>
            {detectedBiomarker.presets.map((preset, pIdx) => {
              const isActive = Math.abs(currentLevel - preset.value) < 0.2;
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${isActive ? '#0284c7' : '#cbd5e1'}`,
                    background: isActive ? '#e0f2fe' : '#ffffff',
                    color: isActive ? '#0369a1' : '#334155',
                    fontSize: '0.7rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {isEs ? preset.labelEs : preset.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Range Slider + Exact Number Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="range"
            min={detectedBiomarker.min}
            max={detectedBiomarker.max}
            step={detectedBiomarker.step}
            value={currentLevel}
            onChange={(e) => handleLevelChange(e.target.value)}
            style={{
              flex: 1,
              accentColor: '#0284c7',
              cursor: 'pointer'
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '2px 8px',
              minWidth: '90px'
            }}
          >
            <input
              type="number"
              min={detectedBiomarker.min}
              max={detectedBiomarker.max}
              step={detectedBiomarker.step}
              value={currentLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              style={{
                width: '50px',
                border: 'none',
                background: 'transparent',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: display?.tierColor || '#0f172a',
                outline: 'none',
                textAlign: 'right'
              }}
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
              {detectedBiomarker.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Recalculated 4-Column Stat Grid */}
      {display && (
        <div className="pbc-body-grid">
          <div className="pbc-stat-box">
            <span className="pbc-stat-label">{isEs ? 'Nivel Analítico Determinado:' : 'Simulated Baseline:'}</span>
            <strong className="pbc-stat-val" style={{ color: display.tierColor }}>
              {display.measuredValStr}
            </strong>
            <small className="pbc-stat-sub">{display.tierSubText}</small>
          </div>

          <div className="pbc-stat-box">
            <span className="pbc-stat-label">{isEs ? 'Rango Diana Terapéutico:' : 'Target Therapeutic Range:'}</span>
            <strong className="pbc-stat-val" style={{ color: '#0d9488' }}>
              {display.targetRangeText}
            </strong>
            <small className="pbc-stat-sub">{display.deltaTargetText}</small>
          </div>

          <div className="pbc-stat-box">
            <span className="pbc-stat-label">{isEs ? 'Pauta y Vía de Administración:' : 'Calibrated Route Strategy:'}</span>
            <strong className="pbc-stat-val" style={{ color: '#003666' }}>
              {display.prescribedRouteText}
            </strong>
            <small className="pbc-stat-sub">{display.prescribedRouteSub}</small>
          </div>

          <div className="pbc-stat-box">
            <span className="pbc-stat-label">{isEs ? 'Control Analítico Programado:' : 'Target DBS Re-Test:'}</span>
            <strong className="pbc-stat-val" style={{ color: '#0284c7' }}>
              {display.retestScheduleText}
            </strong>
            <small className="pbc-stat-sub">{display.retestScheduleSub}</small>
          </div>
        </div>
      )}

      {/* Footer Actions & Diagnostic Order Link */}
      <div className="pbc-footer">
        <div className="pbc-footer-tip">
          <Info size={14} color="#0d9488" />
          <span>
            {isEs
              ? 'El cronograma de dosificación y las salvaguardas farmacocinéticas inferiores se han recalibrado para este estrato analítico.'
              : 'The dosing roadmap and companion safeguards below have been recalibrated to this specific diagnostic tier.'}
          </span>
        </div>
        <div className="pbc-footer-actions">
          {/* Order Companion Bloodo Test Link */}
          <a
            href={`/p/${detectedBiomarker.companionTestSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#0f172a',
              textDecoration: 'none'
            }}
          >
            <span>{isEs ? 'Solicitar Kit Bloodo™' : 'Order Bloodo™ Companion Test'}</span>
            <ExternalLink size={12} style={{ color: '#64748b' }} />
          </a>

          <a href="#protocol-clinical-companion" className="pbc-btn-anchor">
            <span>{isEs ? 'Inspeccionar Farmacocinética' : 'Review Pharmacokinetics'}</span>
            <ArrowRight size={13} />
          </a>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('open-public-atlas-ai', {
                    detail: {
                      initialQuery: display?.aiQueryText || `¿Cómo calibro este protocolo con mis resultados de análisis de sangre?`
                    }
                  })
                );
              }
            }}
            className="pbc-btn-ai"
          >
            <Sparkles size={13} />
            <span>{isEs ? 'Consultar con Clinical AI' : 'Inquire with Clinical AI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
