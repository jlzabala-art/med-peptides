"use client";

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  RotateCcw,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  Info,
  Zap,
  Calendar
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './LongevityEpigeneticCalculator.css';

/**
 * LongevityEpigeneticCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-standard calculator for Longevity / NAD+ / Epigenetic Protocols.
 * Estimates biological age offset potential based on chronological age, lifestyle
 * factors, and NAD+ depletion severity. Outputs personalized dosing schedule
 * for NMN/NAD+ precursors and companion peptides (Epithalon, BPC-157).
 */
export default function LongevityEpigeneticCalculator({ lang = 'en' }) {
  const isEs = lang === 'es';

  // ── Inputs ──
  const [age, setAge] = useState(48);
  const [sex, setSex] = useState('male');
  const [nadDepletion, setNadDepletion] = useState('moderate'); // mild | moderate | severe
  const [lifestyle, setLifestyle] = useState('sedentary');     // active | moderate | sedentary
  const [sleepQuality, setSleepQuality] = useState('poor');    // good | fair | poor
  const [copied, setCopied] = useState(false);

  // ── Computation ──
  const results = useMemo(() => {
    const a = Number(age) || 48;

    // Biological age offset model
    // NAD+ depletion severity
    const depletionScore = { mild: 0.8, moderate: 1.0, severe: 1.35 }[nadDepletion] ?? 1.0;
    // Lifestyle modifier (active = better baseline)
    const lifestyleScore = { active: 0.75, moderate: 1.0, sedentary: 1.25 }[lifestyle] ?? 1.0;
    // Sleep quality (critical for circadian NAD+ regeneration)
    const sleepScore = { good: 0.8, fair: 1.0, poor: 1.3 }[sleepQuality] ?? 1.0;

    // Composite depletion index (0-1 scale, 1 = severe)
    const depletionIndex = Math.min((depletionScore * lifestyleScore * sleepScore) / 2.1, 1.0);

    // Estimated biological age offset (years above chronological)
    const bioAgeOffset = Math.round(depletionIndex * 12); // max 12yr gap

    // Potential biological age recovery with full protocol (24-week projection)
    const recoveryPotential = Math.round(bioAgeOffset * 0.65);

    // NAD+ dosing (NMN/NR equivalent, mg/day)
    // Dose scales with age and depletion severity
    const baseNAD = 500; // mg/day baseline
    const ageFactor = a > 60 ? 1.4 : a > 45 ? 1.2 : 1.0;
    const nadDose = Math.round(baseNAD * ageFactor * depletionScore / 50) * 50; // round to 50mg

    // Epithalon cycle (days on / days off)
    const epithaloCycle = a > 55 ? '10 days ON / 3 months OFF' : '5 days ON / 3 months OFF';

    // BPC-157 companion dose (mcg/day)
    const bpcDose = lifestyleScore >= 1.25 ? 500 : 250; // higher if sedentary
    const bpcFrequency = bpcDose === 500 ? '2x daily' : 'once daily';

    // Protocol duration
    const cycleWeeks = depletionIndex > 0.7 ? 24 : 16;

    // Telomere support rating (1-5 stars)
    const telomereScore = Math.max(1, Math.round(5 - depletionIndex * 4));

    return {
      depletionIndex: (depletionIndex * 100).toFixed(0),
      bioAgeOffset,
      recoveryPotential,
      nadDose,
      epithaloCycle,
      bpcDose,
      bpcFrequency,
      cycleWeeks,
      telomereScore,
      depletionSeverity: depletionIndex > 0.7 ? 'Severe' : depletionIndex > 0.4 ? 'Moderate' : 'Mild',
    };
  }, [age, sex, nadDepletion, lifestyle, sleepQuality]);

  const handleReset = () => {
    setAge(48);
    setSex('male');
    setNadDepletion('moderate');
    setLifestyle('sedentary');
    setSleepQuality('poor');
    toast(isEs ? 'Valores restablecidos' : 'Values reset');
  };

  const handleCopy = async () => {
    const text = isEs
      ? `*Cálculo Personalizado — Protocolo de Longevidad NAD+*\n\n` +
        `• Índice de Depleción NAD+: ${results.depletionIndex}% (${results.depletionSeverity})\n` +
        `• Desfase Edad Biológica Estimado: +${results.bioAgeOffset} años sobre la cronológica\n` +
        `• Potencial de Recuperación (24 semanas): −${results.recoveryPotential} años de edad biológica\n` +
        `• Dosis NMN/NAD+ recomendada: ${results.nadDose} mg/día\n` +
        `• Ciclo Epithalon: ${results.epithaloCycle}\n` +
        `• BPC-157 (soporte): ${results.bpcDose} mcg ${results.bpcFrequency}\n` +
        `• Duración del ciclo: ${results.cycleWeeks} semanas\n\n` +
        `Atlas Services — Referencia Clínica de Longevidad`
      : `*Personalized Longevity Protocol — NAD+ Calculation*\n\n` +
        `• NAD+ Depletion Index: ${results.depletionIndex}% (${results.depletionSeverity})\n` +
        `• Estimated Biological Age Offset: +${results.bioAgeOffset} years above chronological\n` +
        `• Recovery Potential (24 weeks): −${results.recoveryPotential} years of biological age\n` +
        `• Recommended NMN/NAD+ Dose: ${results.nadDose} mg/day\n` +
        `• Epithalon Cycle: ${results.epithaloCycle}\n` +
        `• BPC-157 (repair support): ${results.bpcDose} mcg ${results.bpcFrequency}\n` +
        `• Protocol Duration: ${results.cycleWeeks} weeks\n\n` +
        `Atlas Services — Longevity Clinical Reference`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isEs ? 'Guía copiada al portapapeles' : 'Protocol copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isEs ? 'Error al copiar' : 'Copy failed');
    }
  };

  const depletionColor =
    results.depletionSeverity === 'Severe' ? 'warning' :
    results.depletionSeverity === 'Moderate' ? 'neutral' : 'positive';

  const adjustments = isEs
    ? [
        `<strong>NMN/NAD+ ${results.nadDose} mg/día:</strong> Escalonado en 2 tomas (mañana y mediodía) para maximizar la absorción mitocondrial sin saturar el pool de NAD+ hepático.`,
        `<strong>Epithalon ${results.epithaloCycle}:</strong> Ciclos trimestrales para estimulación epigenética de la telomerasa sin desensibilización del receptor pineal.`,
        `<strong>BPC-157 ${results.bpcDose} mcg ${results.bpcFrequency}:</strong> Soporte de barrera intestinal para maximizar biodisponibilidad de NAD+.`,
        `<strong>Duración del ciclo:</strong> ${results.cycleWeeks} semanas para este perfil de depleción ${results.depletionSeverity.toLowerCase()}.`,
      ]
    : [
        `<strong>NMN/NAD+ ${results.nadDose} mg/day:</strong> Split into 2 doses (morning and midday) to maximize mitochondrial uptake without saturating hepatic NAD+ pool.`,
        `<strong>Epithalon ${results.epithaloCycle}:</strong> Quarterly cycles for epigenetic telomerase stimulation without pineal receptor desensitization.`,
        `<strong>BPC-157 ${results.bpcDose} mcg ${results.bpcFrequency}:</strong> Gut-barrier support to maximize NAD+ precursor bioavailability.`,
        `<strong>Protocol Duration:</strong> ${results.cycleWeeks} weeks recommended for ${results.depletionSeverity.toLowerCase()} depletion profile.`,
      ];

  return (
    <div className="longevity-calc">
      {/* Header */}
      <div className="longevity-calc__header">
        <div className="longevity-calc__header-left">
          <div className="longevity-calc__icon-wrap">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="longevity-calc__title">
              {isEs ? 'Motor de Personalización NAD+' : 'NAD+ Longevity Personalization Engine'}
            </div>
            <div className="longevity-calc__subtitle">
              {isEs ? 'Estimador de Desfase de Edad Biológica' : 'Biological Age Offset Estimator'}
            </div>
          </div>
        </div>
        <span className="longevity-calc__badge">
          {isEs ? 'Cálculo Clínico' : 'Clinical Estimation'}
        </span>
      </div>

      <div className="longevity-calc__body">
        {/* Input Grid */}
        <div className="longevity-calc__inputs">
          {/* Age */}
          <div className="longevity-calc__field">
            <label className="longevity-calc__label">
              <Calendar size={12} />
              {isEs ? 'Edad Cronológica' : 'Chronological Age'}
            </label>
            <input
              type="number"
              min="25"
              max="85"
              className="longevity-calc__input"
              value={age}
              onChange={e => setAge(Math.min(85, Math.max(25, Number(e.target.value) || 25)))}
            />
            <div className="longevity-calc__hint">{isEs ? 'Rango: 25–85 años' : 'Range: 25–85 years'}</div>
          </div>

          {/* Sex */}
          <div className="longevity-calc__field">
            <label className="longevity-calc__label">
              <Activity size={12} />
              {isEs ? 'Sexo Biológico' : 'Biological Sex'}
            </label>
            <select
              className="longevity-calc__select"
              value={sex}
              onChange={e => setSex(e.target.value)}
            >
              <option value="male">{isEs ? 'Masculino' : 'Male'}</option>
              <option value="female">{isEs ? 'Femenino' : 'Female'}</option>
            </select>
          </div>

          {/* NAD Depletion */}
          <div className="longevity-calc__field">
            <label className="longevity-calc__label">
              <Zap size={12} />
              {isEs ? 'Nivel de Depleción NAD+' : 'NAD+ Depletion Severity'}
            </label>
            <select
              className="longevity-calc__select"
              value={nadDepletion}
              onChange={e => setNadDepletion(e.target.value)}
            >
              <option value="mild">{isEs ? 'Leve (fatiga ocasional)' : 'Mild (occasional fatigue)'}</option>
              <option value="moderate">{isEs ? 'Moderada (fatiga persistente)' : 'Moderate (persistent fatigue)'}</option>
              <option value="severe">{isEs ? 'Severa (agotamiento / +50 años)' : 'Severe (exhaustion / 50+ age)'}</option>
            </select>
          </div>

          {/* Lifestyle */}
          <div className="longevity-calc__field">
            <label className="longevity-calc__label">
              <Activity size={12} />
              {isEs ? 'Nivel de Actividad' : 'Activity Level'}
            </label>
            <select
              className="longevity-calc__select"
              value={lifestyle}
              onChange={e => setLifestyle(e.target.value)}
            >
              <option value="active">{isEs ? 'Activo (ejercicio ≥4 días/sem)' : 'Active (exercise ≥4 days/wk)'}</option>
              <option value="moderate">{isEs ? 'Moderado (2–3 días/sem)' : 'Moderate (2–3 days/wk)'}</option>
              <option value="sedentary">{isEs ? 'Sedentario (&lt;2 días/sem)' : 'Sedentary (<2 days/wk)'}</option>
            </select>
          </div>

          {/* Sleep Quality */}
          <div className="longevity-calc__field" style={{ gridColumn: '1 / -1' }}>
            <label className="longevity-calc__label">
              <Clock size={12} />
              {isEs ? 'Calidad del Sueño' : 'Sleep Quality'}
            </label>
            <select
              className="longevity-calc__select"
              value={sleepQuality}
              onChange={e => setSleepQuality(e.target.value)}
            >
              <option value="good">{isEs ? 'Buena (7–9h, reparador)' : 'Good (7–9h, restorative)'}</option>
              <option value="fair">{isEs ? 'Regular (6–7h, interrupciones)' : 'Fair (6–7h, some disruption)'}</option>
              <option value="poor">{isEs ? 'Pobre (&lt;6h o no reparador)' : 'Poor (<6h or non-restorative)'}</option>
            </select>
            <div className="longevity-calc__hint">
              {isEs ? 'El sueño profundo es crítico para la síntesis circadiana de NAD+.' : 'Deep sleep is critical for circadian NAD+ synthesis.'}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="longevity-calc__results">
          <div className="longevity-calc__results-title">
            {isEs ? '⟶ Estimación Personalizada' : '⟶ Personalized Estimation'}
          </div>
          <div className="longevity-calc__kpi-grid">
            <div className="longevity-calc__kpi">
              <div className="longevity-calc__kpi-label">
                {isEs ? 'Índice Depleción NAD+' : 'NAD+ Depletion Index'}
              </div>
              <div className={`longevity-calc__kpi-value ${depletionColor}`}>
                {results.depletionIndex}%
              </div>
              <div className="longevity-calc__kpi-unit">{results.depletionSeverity}</div>
            </div>
            <div className="longevity-calc__kpi">
              <div className="longevity-calc__kpi-label">
                {isEs ? 'Desfase Edad Biológica' : 'Biological Age Offset'}
              </div>
              <div className={`longevity-calc__kpi-value ${results.bioAgeOffset > 8 ? 'warning' : 'neutral'}`}>
                +{results.bioAgeOffset} {isEs ? 'años' : 'years'}
              </div>
              <div className="longevity-calc__kpi-unit">
                {isEs ? 'sobre cronológica' : 'above chronological'}
              </div>
            </div>
            <div className="longevity-calc__kpi">
              <div className="longevity-calc__kpi-label">
                {isEs ? 'Potencial de Recuperación' : 'Recovery Potential'}
              </div>
              <div className="longevity-calc__kpi-value positive">
                −{results.recoveryPotential} {isEs ? 'años' : 'years'}
              </div>
              <div className="longevity-calc__kpi-unit">
                {isEs ? 'en 24 semanas estimado' : 'in 24 weeks estimated'}
              </div>
            </div>
            <div className="longevity-calc__kpi">
              <div className="longevity-calc__kpi-label">
                {isEs ? 'Dosis NAD+ (NMN/NR)' : 'NAD+ Dose (NMN/NR)'}
              </div>
              <div className="longevity-calc__kpi-value neutral">
                {results.nadDose} mg
              </div>
              <div className="longevity-calc__kpi-unit">{isEs ? 'por día (dividido)' : 'per day (split)'}</div>
            </div>
          </div>
        </div>

        {/* Adjustments */}
        <div className="longevity-calc__adjustments">
          <div className="longevity-calc__adj-header">
            <Info size={13} />
            {isEs ? 'Ajustes de Protocolo para este Perfil' : 'Protocol Adjustments for this Profile'}
          </div>
          <div className="longevity-calc__adj-list">
            {adjustments.map((text, i) => (
              <div key={i} className="longevity-calc__adj-item">
                <div className="longevity-calc__adj-dot" />
                <div
                  className="longevity-calc__adj-text"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="longevity-calc__footer">
          <button className="longevity-calc__btn longevity-calc__btn--primary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied
              ? (isEs ? 'Copiado' : 'Copied')
              : (isEs ? 'Copiar Guía Clínica' : 'Copy Clinical Guide')}
          </button>
          <button className="longevity-calc__btn longevity-calc__btn--ghost" onClick={handleReset}>
            <RotateCcw size={13} />
            {isEs ? 'Reiniciar' : 'Reset'}
          </button>
        </div>

        <div className="longevity-calc__disclaimer">
          {isEs
            ? '⚠ Esta calculadora es una herramienta de orientación clínica. El desfase de edad biológica es una estimación basada en modelos de depleción de NAD+ documentados en literatura. La dosificación final debe ser prescrita por un médico cualificado.'
            : '⚠ This calculator is a clinical orientation tool. Biological age offset is an estimate based on documented NAD+ depletion models. Final dosing must be prescribed by a qualified physician.'}
        </div>
      </div>
    </div>
  );
}
