"use client";

import React, { useState } from 'react';
import {
  Moon,
  ShieldCheck,
  Clock,
  Activity,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import SomatotropicCircadianCalculator from './SomatotropicCircadianCalculator';
import './ProtocolSomatotropicAxisCard.css';

export default function ProtocolSomatotropicAxisCard({ protocol, lang = 'en' }) {
  const isEs = lang === 'es';
  const somato = protocol?.somatotropic_axis_parameters;

  if (!somato) return null;

  const [activeTab, setActiveTab] = useState('fasting');
  const [copiedCadence, setCopiedCadence] = useState(false);

  const fasting = somato.fasting_window_kinetics;
  const comparison = somato.pituitary_selectivity_comparison || [];
  const cycling = somato.cycling_schedule;
  const lab = somato.laboratory_surveillance;

  const [copiedHeader, setCopiedHeader] = useState(false);

  const handleCopySomatotropicGuide = async () => {
    const text = isEs
      ? `*Pautas Clínicas Eje Somatotrópico — CJC-1295 + Ipamorelina*\n\n` +
        `• Ventana de Ayuno Obligatoria: Dejar transcurrir un mínimo de 2,5 – 3,0 horas de ayuno estricto tras la última comida antes de la inyección.\n` +
        `• Cronobiología: Inyectar inmediatamente antes de dormir (22:00 – 23:30) para sincronizar con la fase Delta de ondas lentas.\n` +
        `• Seguridad Hormonal: Ipamorelina no eleva prolactina ni cortisol (a diferencia de GHRP-6/2) ni produce picos de apetito descontrolado.\n` +
        `• Pauta 5 ON / 2 OFF: Inyectar 5 días seguidos (lunes a viernes) y descansar 2 días (fines de semana) durante 10–12 semanas, seguido de 4 semanas de descanso.\n\n` +
        `Atlas Services Clinical Reference • Eje de Crecimiento & Longevidad`
      : `*Clinical Guidelines Somatotropic Axis — CJC-1295 + Ipamorelin*\n\n` +
        `• Mandatory Fasting Window: Maintain a strict 2.5 – 3.0 hour fasting window after the final meal prior to injection.\n` +
        `• Bedtime Synchronization: Administer right before sleep (22:00 – 23:30) to coincide with Stage 3 Delta slow-wave release.\n` +
        `• Pituitary Selectivity: Ipamorelin causes 0.0% surge in prolactin or cortisol, eliminating gynecomastia or stress response risks.\n` +
        `• 5-On / 2-Off Cadence: 5 consecutive days on (Mon–Fri), 2 days off (weekends) for 10–12 weeks with a 4-week washout break.\n\n` +
        `Atlas Services Clinical Reference • Growth Hormone & Longevity`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedHeader(true);
      toast.success(isEs ? 'Pautas nocturnas copiadas al portapapeles' : 'Bedtime guidelines copied to clipboard');
      setTimeout(() => setCopiedHeader(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleCopyFastingRule = async () => {
    const rule = isEs ? fasting.postprandial_window_hours_es : fasting.postprandial_window_hours;
    const chrono = isEs ? fasting.chronobiology_window_es : fasting.chronobiology_window;
    const text = `*${isEs ? 'Ventana de Ayuno Somatostatínica' : 'Somatostatin Fasting Gate'}*\n⏱️ ${rule}\n🌙 ${chrono}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedCadence(true);
      toast.success(isEs ? 'Regla de ayuno copiada al portapapeles' : 'Fasting rule copied to clipboard');
      setTimeout(() => setCopiedCadence(false), 2500);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <section id="somatotropic-axis" className="psac-container">
      {/* ── Section Header (Google Cloud UX) ── */}
      <div className="psac-header">
        <div className="psac-header-main">
          <div className="psac-header-icon-box">
            <Moon size={20} className="psac-header-icon" />
          </div>
          <div>
            <div className="psac-header-chips">
              <span className="psac-chip psac-chip-indigo">Pulsatile GH Secretagogue</span>
              <span className="psac-chip psac-chip-blue">Somatostatin Gate</span>
              <span className="psac-chip psac-chip-emerald">5 ON / 2 OFF Cadence</span>
            </div>
            <h3 className="psac-title">
              {isEs
                ? 'Eje Somatotrópico: Ventana de Ayuno, Selectividad y Pauta 5 ON / 2 OFF'
                : 'Somatotropic Axis: Fasting Kinetics, Selectivity & Cycling Protocols'}
            </h3>
            <p className="psac-subtitle">
              {isEs
                ? 'Control del bloqueo por somatostatina hipotalámica, perfil selectivo libre de prolactina/cortisol y prevención de desensibilización hipofisaria.'
                : 'Overcoming hypothalamic somatostatin blockade, prolactin/cortisol-free selectivity benchmarks, and pituitary receptor recovery cycles.'}
            </p>
          </div>
        </div>

        <div className="psac-header-cta-group">
          <button
            type="button"
            className="psac-btn psac-btn-outline"
            onClick={handleCopySomatotropicGuide}
            title={isEs ? 'Copiar pautas nocturnas al portapapeles' : 'Copy bedtime guidelines to clipboard'}
          >
            {copiedHeader ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            <span>{copiedHeader ? (isEs ? 'Pautas Copiadas' : 'Guidelines Copied') : (isEs ? 'Copiar Pautas Nocturnas' : 'Copy Bedtime Guidelines')}</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="psac-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'fasting'}
          className={`psac-tab-btn ${activeTab === 'fasting' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('fasting')}
        >
          <Clock size={14} />
          <span>{isEs ? 'Ventana de Ayuno & Cronobiología' : 'Fasting Window & Kinetics'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'selectivity'}
          className={`psac-tab-btn ${activeTab === 'selectivity' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('selectivity')}
        >
          <ShieldCheck size={14} />
          <span>{isEs ? 'Selectividad Hipofisaria (vs GHRP)' : 'Pituitary Selectivity (vs GHRP)'}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'cycling'}
          className={`psac-tab-btn ${activeTab === 'cycling' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cycling')}
        >
          <Layers size={14} />
          <span>{isEs ? 'Ciclos 5 ON / 2 OFF & Laboratorio' : '5-On/2-Off Cycling & Labs'}</span>
        </button>
      </div>

      {/* ── Tab 1: Fasting Window & Kinetics ── */}
      {activeTab === 'fasting' && fasting && (
        <div className="psac-tab-pane">
          <div className="psac-fasting-hero">
            <div className="psac-fasting-callout">
              <div className="psac-fasting-top">
                <span className="psac-fasting-badge">{isEs ? 'REGLA DE ORO DE ADMINISTRACIÓN' : 'GOLDEN TIMING RULE'}</span>
                <button
                  type="button"
                  className="psac-copy-btn"
                  onClick={handleCopyFastingRule}
                  title={isEs ? 'Copiar regla de ayuno' : 'Copy fasting rule'}
                >
                  {copiedCadence ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                  <span>{copiedCadence ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar' : 'Copy')}</span>
                </button>
              </div>

              <div className="psac-fasting-hours">
                {isEs ? fasting.postprandial_window_hours_es : fasting.postprandial_window_hours}
              </div>

              <p className="psac-fasting-chrono">
                🌙 <strong>{isEs ? 'Momento exacto:' : 'Exact Timing:'}</strong> {isEs ? fasting.chronobiology_window_es : fasting.chronobiology_window}
              </p>
            </div>

            <div className="psac-mechanism-card">
              <div className="psac-mechanism-title">
                <AlertTriangle size={15} style={{ color: '#d97706' }} />
                <span>{isEs ? 'El Bloqueo por Somatostatina (GHIH)' : 'The Somatostatin (GHIH) Blockade'}</span>
              </div>
              <p className="psac-mechanism-text">
                {isEs ? fasting.biochemical_mechanism_es : fasting.biochemical_mechanism}
              </p>
              <div className="psac-mechanism-tip">
                💡 {isEs ? 'Evitar cualquier carbohidrato, batido proteico o grasa 3h antes de dormir para garantizar el 100% de eficacia secretora.' : 'Avoid any carbohydrate, protein shake, or fat for 3 hours pre-bed to ensure 100% secretagogue amplitude.'}
              </div>
            </div>
          </div>

          {/* Interactive Circadian Timing & Somatostatin Calculator */}
          <SomatotropicCircadianCalculator lang={lang} />
        </div>
      )}

      {/* ── Tab 2: Pituitary Selectivity Comparison ── */}
      {activeTab === 'selectivity' && (
        <div className="psac-tab-pane">
          <div className="psac-selectivity-intro">
            <h4 className="psac-selectivity-title">
              {isEs ? 'Por qué Ipamorelina es el Estándar de 3.ª Generación' : 'Why Ipamorelin is the 3rd Generation Benchmark'}
            </h4>
            <p className="psac-selectivity-sub">
              {isEs
                ? 'A diferencia de los secretagogos de primera y segunda generación (GHRP-6 y GHRP-2), Ipamorelina se une exclusivamente al receptor GHS-R1a sin activación colateral del eje del estrés (ACTH) ni de prolactina.'
                : 'Unlike 1st and 2nd generation secretagogues (GHRP-6 and GHRP-2), Ipamorelin exhibits absolute specificity for the GHS-R1a receptor, avoiding collateral activation of the hypothalamic-pituitary-adrenal (HPA) stress axis or prolactin.'}
            </p>
          </div>

          <div className="psac-comparison-table-wrapper">
            <table className="psac-comparison-table">
              <thead>
                <tr>
                  <th>{isEs ? 'Parámetro Farmacológico' : 'Pharmacological Parameter'}</th>
                  <th className="th-highlight">Ipamorelin (3rd Gen)</th>
                  <th>GHRP-6 / GHRP-2 (Legacy)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="td-param">{isEs ? 'Potencia Secretora de GH' : 'GH Secretion Potency'}</td>
                  <td className="td-highlight">{isEs ? comparison[0]?.gh_potency_es : comparison[0]?.gh_potency}</td>
                  <td>{isEs ? comparison[1]?.gh_potency_es : comparison[1]?.gh_potency}</td>
                </tr>
                <tr>
                  <td className="td-param">{isEs ? 'Elevación de Prolactina' : 'Prolactin Elevation'}</td>
                  <td className="td-highlight td-safe">✓ {isEs ? comparison[0]?.prolactin_stimulation_es : comparison[0]?.prolactin_stimulation}</td>
                  <td className="td-risk">⚠️ {isEs ? comparison[1]?.prolactin_stimulation_es : comparison[1]?.prolactin_stimulation}</td>
                </tr>
                <tr>
                  <td className="td-param">{isEs ? 'Estimulación de Cortisol y ACTH' : 'Cortisol & ACTH Stimulation'}</td>
                  <td className="td-highlight td-safe">✓ {isEs ? comparison[0]?.cortisol_acth_stimulation_es : comparison[0]?.cortisol_acth_stimulation}</td>
                  <td className="td-risk">⚠️ {isEs ? comparison[1]?.cortisol_acth_stimulation_es : comparison[1]?.cortisol_acth_stimulation}</td>
                </tr>
                <tr>
                  <td className="td-param">{isEs ? 'Apetito e Hiperfagia' : 'Appetite & Hyperphagia'}</td>
                  <td className="td-highlight td-safe">✓ {isEs ? comparison[0]?.appetite_hyperphagia_es : comparison[0]?.appetite_hyperphagia}</td>
                  <td className="td-warn">⚠️ {isEs ? comparison[1]?.appetite_hyperphagia_es : comparison[1]?.appetite_hyperphagia}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: Cycling Schedule & Laboratory Surveillance ── */}
      {activeTab === 'cycling' && (
        <div className="psac-tab-pane">
          <div className="psac-cycling-grid">
            {/* Cycling Schedule Card */}
            {cycling && (
              <div className="psac-cycling-card">
                <div className="psac-cycling-badge">{isEs ? 'ESQUEMA DE DESCANSO HIPOFISARIO' : 'PITUITARY RECEPTOR CADENCE'}</div>
                <h4 className="psac-cycling-title">{isEs ? cycling.weekly_cadence_es : cycling.weekly_cadence}</h4>
                <div className="psac-cycling-specs">
                  <div className="psac-spec-row">
                    <span className="psac-spec-k">{isEs ? 'Duración del Ciclo:' : 'Cycle Duration:'}</span>
                    <span className="psac-spec-v">{isEs ? cycling.cycle_duration_es : cycling.cycle_duration}</span>
                  </div>
                  <div className="psac-spec-row">
                    <span className="psac-spec-k">{isEs ? 'Periodo de Lavado:' : 'Washout Period:'}</span>
                    <span className="psac-spec-v">{isEs ? cycling.washout_period_es : cycling.washout_period}</span>
                  </div>
                </div>
                <p className="psac-cycling-rationale">
                  {isEs ? cycling.rationale_es : cycling.rationale}
                </p>
              </div>
            )}

            {/* Laboratory Surveillance Card */}
            {lab && (
              <div className="psac-lab-card">
                <div className="psac-lab-badge">{isEs ? 'MONITORIZACIÓN BIOMARCADORA' : 'BIOMARKER SURVEILLANCE'}</div>
                <h4 className="psac-lab-target-title">{isEs ? lab.primary_target_biomarker_es : lab.primary_target_biomarker}</h4>
                <div className="psac-lab-range-box">
                  <span className="psac-range-label">{isEs ? 'Rango Diana Terapéutico:' : 'Target Physiological Zone:'}</span>
                  <div className="psac-range-val">{isEs ? lab.target_range_es : lab.target_range}</div>
                </div>

                <div className="psac-panel-list-wrap">
                  <span className="psac-panel-label">{isEs ? 'Panel Completo de Seguimiento:' : 'Complete Surveillance Panel:'}</span>
                  <div className="psac-panel-chips">
                    {(isEs ? lab.surveillance_panel_es : lab.surveillance_panel)?.map((item, idx) => (
                      <span key={idx} className="psac-panel-chip">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
