"use client";

import React from 'react';
import { Activity, RotateCcw, Info, ArrowRight, Sparkles } from '@/lib/icons';

export default function BiomarkerCalibrationBanner({
  calibrationDisplay,
  lang = 'en',
  onClearCalibration
}) {
  if (!calibrationDisplay) return null;

  return (
    <div className="proto-biomarker-calibration-banner" style={{ borderLeftColor: calibrationDisplay.tierColor }}>
      <div className="pbc-header">
        <div className="pbc-header-left">
          <div className="pbc-badge-icon" style={{ backgroundColor: calibrationDisplay.tierBg, color: calibrationDisplay.tierColor }}>
            <Activity size={18} />
          </div>
          <div>
            <div className="pbc-meta-row">
              <span className="pbc-kicker">
                {lang === 'es' ? 'CALIBRACIÓN CLÍNICA PERSONALIZADA POR BIOMARCADOR' : 'PRECISION BIOMARKER-DRIVEN PROTOCOL CALIBRATION'}
              </span>
              <span className="pbc-source-tag">Bloodo DBS™ · LifeLab1 (Vilnius, EU)</span>
            </div>
            <h4 className="pbc-title">
              {calibrationDisplay.titleText}
            </h4>
          </div>
        </div>
        <div className="pbc-header-right">
          <span className="pbc-tier-pill" style={{ backgroundColor: calibrationDisplay.tierBg, color: calibrationDisplay.tierColor, borderColor: calibrationDisplay.tierColor + '40' }}>
            {calibrationDisplay.tierBadgeText}
          </span>
          <button
            type="button"
            onClick={onClearCalibration}
            className="pbc-btn-reset"
            title={lang === 'es' ? 'Ver protocolo estándar no calibrado' : 'View uncalibrated standard protocol'}
          >
            <RotateCcw size={13} />
            <span>{lang === 'es' ? 'Restablecer Vista General' : 'Reset to General View'}</span>
          </button>
        </div>
      </div>

      <div className="pbc-body-grid">
        <div className="pbc-stat-box">
          <span className="pbc-stat-label">{lang === 'es' ? 'Nivel Basal Determinado:' : 'Simulated Baseline:'}</span>
          <strong className="pbc-stat-val" style={{ color: calibrationDisplay.tierColor }}>
            {calibrationDisplay.measuredValStr}
          </strong>
          <small className="pbc-stat-sub">{calibrationDisplay.tierSubText}</small>
        </div>

        <div className="pbc-stat-box">
          <span className="pbc-stat-label">{lang === 'es' ? 'Rango Diana Terapéutico:' : 'Target Therapeutic Range:'}</span>
          <strong className="pbc-stat-val" style={{ color: '#0d9488' }}>
            {calibrationDisplay.targetRangeText}
          </strong>
          <small className="pbc-stat-sub">
            {calibrationDisplay.deltaTargetText}
          </small>
        </div>

        <div className="pbc-stat-box">
          <span className="pbc-stat-label">{lang === 'es' ? 'Estrategia de Administración:' : 'Calibrated Route Strategy:'}</span>
          <strong className="pbc-stat-val" style={{ color: '#003666' }}>
            {calibrationDisplay.prescribedRouteText}
          </strong>
          <small className="pbc-stat-sub">{calibrationDisplay.prescribedRouteSub}</small>
        </div>

        <div className="pbc-stat-box">
          <span className="pbc-stat-label">{lang === 'es' ? 'Control Analítico Programado:' : 'Target DBS Re-Test:'}</span>
          <strong className="pbc-stat-val" style={{ color: '#0284c7' }}>
            {calibrationDisplay.retestScheduleText}
          </strong>
          <small className="pbc-stat-sub">{calibrationDisplay.retestScheduleSub}</small>
        </div>
      </div>

      <div className="pbc-footer">
        <div className="pbc-footer-tip">
          <Info size={14} color="#0d9488" />
          <span>
            {lang === 'es'
              ? 'El módulo de Diagnóstico Acompañante y Farmacocinética inferior se ha pre-configurado automáticamente con la vía y salvaguardas recomendadas.'
              : 'The Companion Diagnostics & Pharmacokinetics module below has been auto-calibrated to this patient tier.'}
          </span>
        </div>
        <div className="pbc-footer-actions">
          <a href="#protocol-clinical-companion" className="pbc-btn-anchor">
            <span>{lang === 'es' ? 'Inspeccionar Farmacocinética Prescrita' : 'Review Prescribed Pharmacokinetics'}</span>
            <ArrowRight size={13} />
          </a>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('open-public-atlas-ai', {
                    detail: {
                      initialQuery: calibrationDisplay.aiQueryText
                    }
                  })
                );
              }
            }}
            className="pbc-btn-ai"
          >
            <Sparkles size={13} />
            <span>{lang === 'es' ? 'Consultar con Clinical AI' : 'Inquire with Clinical AI'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
