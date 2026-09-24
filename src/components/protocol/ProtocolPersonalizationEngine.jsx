"use client";

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  RotateCcw,
  Activity,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import './ProtocolPersonalizationEngine.css';

export default function ProtocolPersonalizationEngine({ protocol, lang = 'en' }) {
  const isEs = lang === 'es';

  // Extract base protocol characteristics
  const protocolDurationWeeks = Number(protocol?.protocol_duration_weeks) || 16;
  const protocolTitle = protocol?.protocol_title || (isEs ? 'Protocolo Metabólico' : 'Metabolic Protocol');
  const phases = Array.isArray(protocol?.phases) ? protocol.phases : [];

  // Default Standard Reference Baseline (Cohorte Clínica Basal de Ensayos Clínicos)
  const BASELINE_WEIGHT = 90; // kg (~198 lbs)
  const BASELINE_AGE = 45;
  const BASELINE_SEX = 'male';
  // Standard target reduction tailored to the protocol duration (~0.9 kg/week)
  const defaultReductionKg = Math.min(25, Math.max(8, protocolDurationWeeks * 0.9));
  const BASELINE_GOAL_PERCENT = Math.round((defaultReductionKg / BASELINE_WEIGHT) * 100); // ~16% for 16w

  // Component State
  const [isCustomized, setIsCustomized] = useState(false);
  const [unit, setUnit] = useState('kg');
  const [weightKg, setWeightKg] = useState(BASELINE_WEIGHT);
  const [age, setAge] = useState(BASELINE_AGE);
  const [sex, setSex] = useState(BASELINE_SEX);
  const [goalPercent, setGoalPercent] = useState(BASELINE_GOAL_PERCENT);

  // Unit conversion helpers
  const displayedWeight = unit === 'kg' ? weightKg : Math.round(weightKg * 2.20462);

  const handleWeightChange = (newVal) => {
    setIsCustomized(true);
    if (unit === 'kg') {
      setWeightKg(Number(newVal));
    } else {
      setWeightKg(Math.round(Number(newVal) / 2.20462));
    }
  };

  const handleAgeChange = (newAge) => {
    setIsCustomized(true);
    setAge(Number(newAge));
  };

  const handleSexChange = (newSex) => {
    setIsCustomized(true);
    setSex(newSex);
    triggerHaptic('selection');
  };

  const handleGoalChange = (newPercent) => {
    setIsCustomized(true);
    setGoalPercent(Number(newPercent));
    triggerHaptic('selection');
  };

  const handleResetToDefault = () => {
    setWeightKg(BASELINE_WEIGHT);
    setAge(BASELINE_AGE);
    setSex(BASELINE_SEX);
    setGoalPercent(BASELINE_GOAL_PERCENT);
    setIsCustomized(false);
    triggerHaptic('notificationSuccess');
    toast.success(
      isEs
        ? 'Restablecido al cálculo estándar de referencia clínica'
        : 'Reset to standard clinical reference calculation'
    );
  };

  // ── Mathematical & Clinical Projections ──
  const calculations = useMemo(() => {
    const totalLossKg = (weightKg * goalPercent) / 100;
    const targetWeightKg = weightKg - totalLossKg;

    // Physiological weekly loss velocity from SURMOUNT/TRIUMPH data:
    // Men ~0.9 kg/w, Women ~0.8 kg/w, reduced by 5% if age > 50
    let velocityWeekly = sex === 'male' ? 0.90 : 0.82;
    if (age > 50) velocityWeekly *= 0.95;

    const estimatedWeeks = Math.max(4, Math.round(totalLossKg / velocityWeekly));

    // Protein target: 1.8 to 2.0 g/kg of target weight
    const proteinFactor = sex === 'male' ? 1.85 : 1.75;
    const dailyProteinGrams = Math.round(targetWeightKg * proteinFactor);

    // BMR estimation (Mifflin-St Jeor) assuming 175cm / 165cm
    const assumedHeight = sex === 'male' ? 176 : 164;
    const bmr = Math.round(
      sex === 'male'
        ? 10 * targetWeightKg + 6.25 * assumedHeight - 5 * age + 5
        : 10 * targetWeightKg + 6.25 * assumedHeight - 5 * age - 161
    );

    // Compare with current protocol duration
    const durationDelta = estimatedWeeks - protocolDurationWeeks;

    return {
      totalLossKg,
      targetWeightKg,
      velocityWeekly,
      estimatedWeeks,
      dailyProteinGrams,
      bmr,
      durationDelta
    };
  }, [weightKg, goalPercent, sex, age, protocolDurationWeeks]);

  const [copiedSummary, setCopiedSummary] = useState(false);

  // Copy clinical summary to clipboard
  const handleCopyPlanSummary = async () => {
    const text = isEs
      ? `Resumen Clínico Personalizado — ${protocolTitle}\n\n` +
        `• Estado: ${isCustomized ? 'Recalibrado para Paciente' : 'Cálculo Estándar de Referencia'}\n` +
        `• Parámetros: ${weightKg} kg, ${age} años, ${sex === 'male' ? 'Hombre' : 'Mujer'}\n` +
        `• Objetivo: -${goalPercent}% (-${calculations.totalLossKg.toFixed(1)} kg) → Meta: ${calculations.targetWeightKg.toFixed(1)} kg\n` +
        `• Cronograma Proyectado: ${calculations.estimatedWeeks} Semanas (Protocolo base: ${protocolDurationWeeks} sem)\n` +
        `• Target Proteico (LBM Guard): ${calculations.dailyProteinGrams} g/día\n` +
        `• Control Diagnóstico Bloodo™: HbA1c DBS en Semana 12\n\n` +
        `Med-Peptides Clinical Reference Engine`
      : `Personalized Clinical Summary — ${protocolTitle}\n\n` +
        `• Status: ${isCustomized ? 'Custom Patient Recalibration' : 'Standard Reference Calculation'}\n` +
        `• Parameters: ${weightKg} kg, ${age} y/o, ${sex === 'male' ? 'Male' : 'Female'}\n` +
        `• Goal: -${goalPercent}% (-${calculations.totalLossKg.toFixed(1)} kg) → Target: ${calculations.targetWeightKg.toFixed(1)} kg\n` +
        `• Projected Timeline: ${calculations.estimatedWeeks} Weeks (Base protocol: ${protocolDurationWeeks} wks)\n` +
        `• Daily Protein Target (LBM Guard): ${calculations.dailyProteinGrams} g/day\n` +
        `• Bloodo™ Companion Test: HbA1c DBS at Week 12\n\n` +
        `Med-Peptides Clinical Reference Engine`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSummary(true);
      triggerHaptic('notificationSuccess');
      toast.success(isEs ? 'Resumen clínico copiado al portapapeles' : 'Clinical summary copied to clipboard');
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <section id="protocol-personalizer" className="ppe-container">
      {/* ── Engine Header ── */}
      <div className="ppe-header">
        <div className="ppe-header-main">
          <div className="ppe-header-icon-box">
            <Calculator size={22} />
          </div>
          <div>
            <div className="ppe-badge-strip">
              <span className={`ppe-badge-source ${isCustomized ? 'custom-mode' : 'default-mode'}`}>
                {isCustomized
                  ? (isEs ? '⚡ Recalibración Personalizada Activa' : '⚡ Active Patient Customization')
                  : (isEs ? '✓ Cálculo Estándar de Referencia' : '✓ Standard Clinical Baseline')}
              </span>
              <span className="ppe-badge-trial">
                {isEs ? 'Modelo Clínico SURMOUNT-1 & TRIUMPH-1' : 'SURMOUNT-1 & TRIUMPH-1 Trial Model'}
              </span>
            </div>
            <h3 className="ppe-title">
              {isEs ? 'Bases Clínicas y Personalización Ponderal (LBM Guard)' : 'Clinical Baseline & Protocol Personalization (LBM Guard)'}
            </h3>
            <p className="ppe-subtitle">
              {isEs
                ? 'Conoce los parámetros clínicos con los que se ha calculado este protocolo por defecto y personalízalo según tu peso, edad, sexo y objetivo.'
                : 'Review the clinical parameters used to compute this baseline protocol and customize it to your weight, age, sex, and target.'}
            </p>
          </div>
        </div>

        <div className="ppe-header-actions">
          {isCustomized && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="ppe-btn-reset"
              title={isEs ? 'Restablecer valores de referencia del protocolo' : 'Reset to default reference values'}
            >
              <RotateCcw size={13} />
              <span>{isEs ? 'Restablecer a Cálculo Estándar' : 'Reset to Standard Baseline'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TOP SECTION: Clinical Considerations & Methodology (SIEMPRE AL PRINCIPIO) ── */}
      <div className="ppe-top-considerations-card">
        <div className="ppe-tc-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Info size={16} style={{ color: '#003666' }} />
            <h4 className="ppe-tc-title">
              {isEs
                ? 'Parámetros Considerados en el Cálculo del Protocolo'
                : 'Clinical Considerations & Parameters Factored into this Protocol'}
            </h4>
          </div>
          <span className="ppe-tc-badge">
            {isCustomized
              ? (isEs ? 'Modo: Adaptado a tus datos' : 'Mode: Customized')
              : (isEs ? 'Modo: Cohorte Basal de Referencia' : 'Mode: Baseline Cohort')}
          </span>
        </div>

        <div className="ppe-considerations-grid">
          {/* Consideration 1 */}
          <div className="ppe-cons-card">
            <div className="ppe-cons-num">1</div>
            <div className="ppe-cons-content">
              <strong className="ppe-cons-label">
                {isEs ? 'Paciente Índice Basal' : 'Baseline Index Cohort'}
              </strong>
              <p className="ppe-cons-desc">
                {isCustomized
                  ? (isEs
                      ? `Adaptado a: ${weightKg} kg, ${age} años, sexo ${sex === 'male' ? 'masculino' : 'femenino'}.`
                      : `Customized for: ${weightKg} kg, ${age} y/o, ${sex}.`)
                  : (isEs
                      ? `Adulto de ${BASELINE_WEIGHT} kg, 45 años, IMC ~34 kg/m² (modelo poblacional de SURMOUNT-1 y TRIUMPH-1).`
                      : `Standard index adult of ${BASELINE_WEIGHT} kg, age 45, BMI ~34 kg/m² (SURMOUNT-1 & TRIUMPH-1 trials).`)}
              </p>
            </div>
          </div>

          {/* Consideration 2 */}
          <div className="ppe-cons-card">
            <div className="ppe-cons-num">2</div>
            <div className="ppe-cons-content">
              <strong className="ppe-cons-label">
                {isEs ? 'Velocidad Fisiológica Segura' : 'Safe Physiologic Velocity'}
              </strong>
              <p className="ppe-cons-desc">
                {isEs
                  ? `Ritmo óptimo de ~${calculations.velocityWeekly.toFixed(2)} kg/semana para salvaguardar la contractilidad vesicular y evitar litiasis biliar.`
                  : `Optimal rate of ~${calculations.velocityWeekly.toFixed(2)} kg/wk to protect gallbladder motility and prevent gallstones.`}
              </p>
            </div>
          </div>

          {/* Consideration 3 */}
          <div className="ppe-cons-card">
            <div className="ppe-cons-num">3</div>
            <div className="ppe-cons-content">
              <strong className="ppe-cons-label">
                {isEs ? 'Blindaje de Masa Magra (LBM)' : 'Lean Mass Guard (LBM)'}
              </strong>
              <p className="ppe-cons-desc">
                {isEs
                  ? `Ingesta diana de 1.8 g/kg (${calculations.dailyProteinGrams} g/día) + MOTS-c (activador AMPK) para evitar sarcopenia iatrogénica.`
                  : `Target of 1.8 g/kg (${calculations.dailyProteinGrams} g/day) + MOTS-c (AMPK activator) to prevent sarcopenic metabolic decline.`}
              </p>
            </div>
          </div>

          {/* Consideration 4 */}
          <div className="ppe-cons-card">
            <div className="ppe-cons-num">4</div>
            <div className="ppe-cons-content">
              <strong className="ppe-cons-label">
                {isEs ? 'Control Diagnóstico Bloodo™' : 'Bloodo™ Diagnostic Checkpoint'}
              </strong>
              <p className="ppe-cons-desc">
                {isEs
                  ? 'Retest capilar HbA1c DBS en Semana 12 para confirmar sensibilización insulínica antes de la fase de estabilización.'
                  : 'Capillary HbA1c DBS retest at Week 12 to verify insulin sensitization prior to maintenance.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE BODY (Form on Left, 4 GCP KPIs on Right) ── */}
      <div className="ppe-content-grid">
        
        {/* Left Column: Sliders & Controls */}
        <div className="ppe-form-col">
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Personalizar Parámetros' : 'Customize Parameters'}
          </div>

          {/* 1. Current Weight */}
          <div className="ppe-field-group">
            <div className="ppe-field-header">
              <span className="ppe-field-label">{isEs ? 'Peso Actual:' : 'Current Weight:'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="ppe-field-val-badge">
                  {displayedWeight} {unit}
                </span>
                <div className="ppe-unit-toggle">
                  <button
                    type="button"
                    className={`ppe-unit-btn ${unit === 'kg' ? 'active' : ''}`}
                    onClick={() => setUnit('kg')}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    className={`ppe-unit-btn ${unit === 'lbs' ? 'active' : ''}`}
                    onClick={() => setUnit('lbs')}
                  >
                    lbs
                  </button>
                </div>
              </div>
            </div>
            <input
              type="range"
              min={unit === 'kg' ? 50 : 110}
              max={unit === 'kg' ? 160 : 350}
              step="1"
              value={displayedWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="ppe-slider-input"
            />
          </div>

          {/* 2. Age */}
          <div className="ppe-field-group">
            <div className="ppe-field-header">
              <span className="ppe-field-label">{isEs ? 'Edad:' : 'Age:'}</span>
              <span className="ppe-field-val-badge">{age} {isEs ? 'años' : 'years'}</span>
            </div>
            <input
              type="range"
              min="18"
              max="80"
              step="1"
              value={age}
              onChange={(e) => handleAgeChange(e.target.value)}
              className="ppe-slider-input"
            />
          </div>

          {/* 3. Biological Sex */}
          <div className="ppe-field-group">
            <div className="ppe-field-header">
              <span className="ppe-field-label">{isEs ? 'Sexo Biológico:' : 'Biological Sex:'}</span>
            </div>
            <div className="ppe-segmented-sex">
              <button
                type="button"
                className={`ppe-sex-btn ${sex === 'male' ? 'active' : ''}`}
                onClick={() => handleSexChange('male')}
              >
                <span>♂</span> {isEs ? 'Hombre' : 'Male'}
              </button>
              <button
                type="button"
                className={`ppe-sex-btn ${sex === 'female' ? 'active' : ''}`}
                onClick={() => handleSexChange('female')}
              >
                <span>♀</span> {isEs ? 'Mujer' : 'Female'}
              </button>
            </div>
          </div>

          {/* 4. Target Weight Reduction Goal */}
          <div className="ppe-field-group">
            <div className="ppe-field-header">
              <span className="ppe-field-label">{isEs ? 'Objetivo de Reducción:' : 'Weight Loss Goal:'}</span>
              <span className="ppe-field-val-badge" style={{ color: '#0d9488' }}>
                -{goalPercent}% (-{calculations.totalLossKg.toFixed(1)} {unit})
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={goalPercent}
              onChange={(e) => handleGoalChange(e.target.value)}
              className="ppe-slider-input"
            />
            <div className="ppe-goal-chips">
              {[5, 10, 15, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  className={`ppe-goal-chip ${goalPercent === pct ? 'active' : ''}`}
                  onClick={() => handleGoalChange(pct)}
                >
                  -{pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 4 GCP KPI Cards & Protocol Timeline Integration */}
        <div className="ppe-output-col">
          
          {/* Status Chip */}
          <div className="ppe-output-status-row">
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: isCustomized ? '#15803d' : '#003666' }}>
              {isCustomized
                ? (isEs ? `Resultados Calculados para ${displayedWeight} ${unit} (-${goalPercent}%)` : `Calculated Outputs for ${displayedWeight} ${unit} (-${goalPercent}%)`)
                : (isEs ? `Valores Predeterminados del Protocolo (${protocolDurationWeeks} Semanas)` : `Standard Protocol Baseline (${protocolDurationWeeks} Weeks)`)}
            </span>
          </div>

          {/* 4 GCP Metric Cards (Regla #22) */}
          <div className="ppe-kpis-grid">
            {/* KPI 1: Target Weight */}
            <div className="ppe-kpi-card">
              <span className="ppe-kpi-label">{isEs ? 'Peso Objetivo' : 'Target Weight'}</span>
              <div className="ppe-kpi-val highlight">
                {calculations.targetWeightKg.toFixed(1)} {unit}
              </div>
              <span className="ppe-kpi-sub">
                {isEs ? 'Pérdida:' : 'Loss:'} -{calculations.totalLossKg.toFixed(1)} {unit} (-{goalPercent}%)
              </span>
            </div>

            {/* KPI 2: Projected Weeks */}
            <div className="ppe-kpi-card">
              <span className="ppe-kpi-label">{isEs ? 'Cronograma Estimado' : 'Projected Timeline'}</span>
              <div className="ppe-kpi-val">
                {calculations.estimatedWeeks} {isEs ? 'Sem' : 'Wks'}
              </div>
              <span className="ppe-kpi-sub">
                {calculations.durationDelta === 0
                  ? (isEs ? `Alineado con el protocolo (${protocolDurationWeeks} sem)` : `Matches base protocol (${protocolDurationWeeks} wks)`)
                  : calculations.durationDelta > 0
                  ? (isEs ? `+${calculations.durationDelta} sem de consolidación recomendadas` : `+${calculations.durationDelta} wks consolidation suggested`)
                  : (isEs ? `${Math.abs(calculations.durationDelta)} sem antes del tope del protocolo` : `${Math.abs(calculations.durationDelta)} wks ahead of schedule`)}
              </span>
            </div>

            {/* KPI 3: Daily Protein for Lean Mass Guard */}
            <div className="ppe-kpi-card">
              <span className="ppe-kpi-label">{isEs ? 'Proteína / Masa Magra' : 'Protein / Lean Guard'}</span>
              <div className="ppe-kpi-val">
                {calculations.dailyProteinGrams} g
              </div>
              <span className="ppe-kpi-sub">
                {isEs ? 'Diario (1.8 g/kg meta) + MOTS-c' : 'Daily (1.8 g/kg target) + MOTS-c'}
              </span>
            </div>

            {/* KPI 4: Velocity & Safety */}
            <div className="ppe-kpi-card">
              <span className="ppe-kpi-label">{isEs ? 'Ritmo Seguro' : 'Safe Velocity'}</span>
              <div className="ppe-kpi-val">
                ~{calculations.velocityWeekly.toFixed(2)}
              </div>
              <span className="ppe-kpi-sub">
                {isEs ? 'kg / sem (prevención litiasis)' : 'kg / wk (gallbladder safe)'}
              </span>
            </div>
          </div>

          {/* Integrated Protocol Roadmap & Companion Callout */}
          <div className="ppe-protocol-integration-card">
            <div className="ppe-pi-header">
              <div className="ppe-pi-title-row">
                <Calendar size={16} style={{ color: '#003666' }} />
                <h5 className="ppe-pi-title">
                  {isEs ? 'Integración con las Fases de este Protocolo' : 'Integration with Protocol Phases'}
                </h5>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {phases.length > 0 ? `${phases.length} ${isEs ? 'Fases Clínicas' : 'Clinical Phases'}` : `${protocolDurationWeeks} ${isEs ? 'Semanas' : 'Weeks'}`}
              </span>
            </div>

            {phases.length > 0 ? (
              <div className="ppe-phases-track">
                {phases.map((ph, idx) => (
                  <div key={idx} className="ppe-phase-card">
                    <div className="ppe-phase-title-row">
                      <span>{ph.phase_title || `${isEs ? 'Fase' : 'Phase'} ${idx + 1}`}</span>
                      <span className="ppe-phase-weeks">
                        Sem {ph.start_week}–{ph.end_week}
                      </span>
                    </div>
                    <span className="ppe-phase-desc">
                      {idx === 0
                        ? (isEs ? 'Titulación e inducción suave de receptores' : 'Gentle receptor priming & titration')
                        : idx === 1
                        ? (isEs ? 'Escalación a dosis metabólica efectiva' : 'Active metabolic escalation phase')
                        : (isEs ? 'Estabilización y preservación de BMR' : 'Stabilization & BMR retention')}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Bloodo Companion Checkpoint */}
            <div className="ppe-bloodo-companion-box">
              <div className="ppe-bloodo-companion-left">
                <span className="ppe-bloodo-tag">Bloodo™ Test</span>
                <span className="ppe-bloodo-text">
                  {isEs
                    ? 'Retest recomendado en Semana 12 con el test Bloodo HbA1c DBS para verificar sensibilidad a insulina y descenso de glucosilada.'
                    : 'Recommended checkpoint at Week 12 with Bloodo HbA1c DBS test to verify glycemic sensitivity and HbA1c normalization.'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPlanSummary}
                className="ppe-bloodo-cta-btn"
                title={isEs ? 'Copiar resumen clínico' : 'Copy clinical summary'}
              >
                {copiedSummary ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                <span>{copiedSummary ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Resumen Clínico' : 'Copy Clinical Summary')}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
