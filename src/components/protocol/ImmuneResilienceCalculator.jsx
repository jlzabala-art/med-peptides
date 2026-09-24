"use client";

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  Activity,
  Info,
  Clock,
  Zap
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './ImmuneResilienceCalculator.css';

/**
 * ImmuneResilienceCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-standard dosing engine for Immune Modulation protocols (Thymosin Alpha-1,
 * BPC-157). Calculates induction vs maintenance dose, cycle cadence (active vs
 * seasonal), and companion peptide pairing based on immune burden profile.
 */
export default function ImmuneResilienceCalculator({ lang = 'en' }) {
  const isEs = lang === 'es';

  // ── Inputs ──
  const [weight, setWeight] = useState(75);
  const [immuneBurden, setImmuneBurden] = useState('moderate'); // low | moderate | high | critical
  const [protocol, setProtocol] = useState('active');           // active | seasonal | preventive
  const [autoimmune, setAutoimmune] = useState('no');           // yes | no
  const [copied, setCopied] = useState(false);

  // ── Computation ──
  const results = useMemo(() => {
    const w = Number(weight) || 75;
    const isAI = autoimmune === 'yes';

    // TA-1 base dosing: 1.6 mg is the standard clinical vial dose (Zadaxin lineage)
    // Frequency and duration vary by burden and protocol type
    const burdenFactor = { low: 0.7, moderate: 1.0, high: 1.3, critical: 1.6 }[immuneBurden] ?? 1.0;

    // Standard TA-1 dose is 1.6 mg regardless of weight (it's a fixed clinical unit)
    const ta1Dose = 1.6; // mg SubQ — fixed (as per clinical standard)

    // Frequency per week (induction phase)
    const freqMap = {
      active:    { low: 2, moderate: 2, high: 3, critical: 3 },
      seasonal:  { low: 1, moderate: 1, high: 2, critical: 2 },
      preventive: { low: 1, moderate: 1, high: 1, critical: 2 },
    };
    const ta1FreqPerWeek = (freqMap[protocol] ?? freqMap.active)[immuneBurden] ?? 2;

    // Duration of induction (weeks)
    const inductionWeeks = protocol === 'active'
      ? (immuneBurden === 'critical' ? 12 : immuneBurden === 'high' ? 8 : 6)
      : (protocol === 'seasonal' ? 4 : 8);

    // Maintenance: reduce to 1x/week for half duration
    const maintenanceWeeks = Math.round(inductionWeeks * 0.5);

    // BPC-157 companion dose — gut barrier + systemic repair
    // NOTE: if autoimmune, lower BPC dose (systemic route only, no IP)
    const bpcDose = isAI
      ? 250  // conservative if autoimmune
      : (immuneBurden === 'critical' || immuneBurden === 'high' ? 500 : 250);
    const bpcFreq = bpcDose === 500 ? '2× daily' : 'once daily';

    // Thymosin Beta-4 (TB-500) — optional for critical cases
    const useTB500 = immuneBurden === 'critical';
    const tb500Dose = useTB500 ? 2 : 0; // mg/week SubQ

    // Estimated NK cell reactivation timeline (weeks from start)
    const nkTimeline = protocol === 'active' ? 3 : 6;

    // Total vials TA-1 needed for full induction
    const totalTA1Vials = ta1FreqPerWeek * inductionWeeks;

    return {
      ta1Dose,
      ta1FreqPerWeek,
      inductionWeeks,
      maintenanceWeeks,
      bpcDose,
      bpcFreq,
      useTB500,
      tb500Dose,
      nkTimeline,
      totalTA1Vials,
    };
  }, [weight, immuneBurden, protocol, autoimmune]);

  const handleReset = () => {
    setWeight(75);
    setImmuneBurden('moderate');
    setProtocol('active');
    setAutoimmune('no');
    toast(isEs ? 'Valores restablecidos' : 'Values reset');
  };

  const handleCopy = async () => {
    const text = isEs
      ? `*Cálculo Clínico — Protocolo Inmune TA-1*\n\n` +
        `• Timosina Alfa-1 (TA-1): ${results.ta1Dose} mg SubQ\n` +
        `• Frecuencia de Inducción: ${results.ta1FreqPerWeek}× por semana durante ${results.inductionWeeks} semanas\n` +
        `• Mantenimiento: 1× por semana durante ${results.maintenanceWeeks} semanas\n` +
        `• Viales TA-1 (ciclo completo): ${results.totalTA1Vials} viales\n` +
        `• BPC-157 (barrera intestinal): ${results.bpcDose} mcg ${results.bpcFreq}\n` +
        (results.useTB500 ? `• TB-500 (caso crítico): ${results.tb500Dose} mg/semana SubQ\n` : '') +
        `• Reactivación estimada NK: semana ${results.nkTimeline}\n\n` +
        `Atlas Services — Referencia Clínica de Inmunología`
      : `*Clinical Calculation — Immune Protocol TA-1*\n\n` +
        `• Thymosin Alpha-1 (TA-1): ${results.ta1Dose} mg SubQ\n` +
        `• Induction Frequency: ${results.ta1FreqPerWeek}× per week for ${results.inductionWeeks} weeks\n` +
        `• Maintenance: 1× per week for ${results.maintenanceWeeks} weeks\n` +
        `• TA-1 Vials (full cycle): ${results.totalTA1Vials} vials\n` +
        `• BPC-157 (gut-barrier support): ${results.bpcDose} mcg ${results.bpcFreq}\n` +
        (results.useTB500 ? `• TB-500 (critical case): ${results.tb500Dose} mg/week SubQ\n` : '') +
        `• Estimated NK Reactivation: week ${results.nkTimeline}\n\n` +
        `Atlas Services — Cellular Immunology Reference`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isEs ? 'Guía copiada al portapapeles' : 'Protocol copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isEs ? 'Error al copiar' : 'Copy failed');
    }
  };

  const scheduleItems = isEs
    ? [
        `<strong>Inducción:</strong> TA-1 ${results.ta1Dose} mg SubQ ${results.ta1FreqPerWeek}× por semana durante ${results.inductionWeeks} semanas. Administrar en días no consecutivos (ej. lunes/miércoles o lun/mié/vie).`,
        `<strong>Mantenimiento:</strong> Reducir a 1×/semana durante ${results.maintenanceWeeks} semanas adicionales para consolidar respuesta de linfocitos T y NK.`,
        `<strong>BPC-157:</strong> ${results.bpcDose} mcg SubQ ${results.bpcFreq} para soporte de barrera intestinal y permeabilidad sistémica.`,
        results.useTB500
          ? `<strong>TB-500 (carga crítica):</strong> ${results.tb500Dose} mg SubQ 1×/semana — soporte de remodelación tisular en perfiles de alta carga inmunitaria.`
          : `<strong>Carga ↗ adaptativa:</strong> Si en semana 4 no hay mejoría subjetiva (energía, recuperación), escalar a la pauta superior con supervisión médica.`,
      ]
    : [
        `<strong>Induction:</strong> TA-1 ${results.ta1Dose} mg SubQ ${results.ta1FreqPerWeek}× per week for ${results.inductionWeeks} weeks. Administer on non-consecutive days (e.g. Mon/Wed or Mon/Wed/Fri).`,
        `<strong>Maintenance:</strong> Taper to 1×/week for ${results.maintenanceWeeks} additional weeks to consolidate T-lymphocyte and NK cell response.`,
        `<strong>BPC-157:</strong> ${results.bpcDose} mcg SubQ ${results.bpcFreq} for gut-barrier support and systemic permeability.`,
        results.useTB500
          ? `<strong>TB-500 (critical load):</strong> ${results.tb500Dose} mg SubQ 1×/week — tissue remodeling support for high immune burden profiles.`
          : `<strong>Adaptive dose ↗:</strong> If no subjective improvement (energy, recovery) by week 4, escalate to next tier with physician oversight.`,
      ];

  return (
    <div className="immune-calc">
      {/* Header */}
      <div className="immune-calc__header">
        <div className="immune-calc__header-left">
          <div className="immune-calc__icon-wrap">
            <Shield size={16} />
          </div>
          <div>
            <div className="immune-calc__title">
              {isEs ? 'Motor de Dosificación Inmune TA-1' : 'TA-1 Immune Dosing Engine'}
            </div>
            <div className="immune-calc__subtitle">
              {isEs ? 'Timosina Alfa-1 + BPC-157 — Pauta Personalizada' : 'Thymosin Alpha-1 + BPC-157 — Personalized Schedule'}
            </div>
          </div>
        </div>
        <span className="immune-calc__badge">
          {isEs ? 'Cálculo Clínico' : 'Clinical Engine'}
        </span>
      </div>

      <div className="immune-calc__body">
        {/* Inputs */}
        <div className="immune-calc__inputs">
          {/* Weight */}
          <div className="immune-calc__field">
            <label className="immune-calc__label">
              <Activity size={12} />
              {isEs ? 'Peso Corporal (kg)' : 'Body Weight (kg)'}
            </label>
            <input
              type="number"
              min="40"
              max="150"
              className="immune-calc__input"
              value={weight}
              onChange={e => setWeight(Math.min(150, Math.max(40, Number(e.target.value) || 40)))}
            />
            <div className="immune-calc__hint">{isEs ? 'Rango: 40–150 kg' : 'Range: 40–150 kg'}</div>
          </div>

          {/* Protocol Type */}
          <div className="immune-calc__field">
            <label className="immune-calc__label">
              <Clock size={12} />
              {isEs ? 'Tipo de Protocolo' : 'Protocol Type'}
            </label>
            <select
              className="immune-calc__select"
              value={protocol}
              onChange={e => setProtocol(e.target.value)}
            >
              <option value="active">{isEs ? 'Activo (recuperación inmune)' : 'Active (immune recovery)'}</option>
              <option value="seasonal">{isEs ? 'Estacional (ciclo de refuerzo)' : 'Seasonal (pulse cycle)'}</option>
              <option value="preventive">{isEs ? 'Preventivo (mantenimiento)' : 'Preventive (maintenance)'}</option>
            </select>
          </div>

          {/* Immune Burden */}
          <div className="immune-calc__field">
            <label className="immune-calc__label">
              <Zap size={12} />
              {isEs ? 'Carga Inmunitaria' : 'Immune Burden Level'}
            </label>
            <select
              className="immune-calc__select"
              value={immuneBurden}
              onChange={e => setImmuneBurden(e.target.value)}
            >
              <option value="low">{isEs ? 'Baja (mantenimiento preventivo)' : 'Low (preventive maintenance)'}</option>
              <option value="moderate">{isEs ? 'Moderada (depleción funcional)' : 'Moderate (functional depletion)'}</option>
              <option value="high">{isEs ? 'Alta (infecciones recurrentes)' : 'High (recurrent infections)'}</option>
              <option value="critical">{isEs ? 'Crítica (compromiso severo)' : 'Critical (severe compromise)'}</option>
            </select>
          </div>

          {/* Autoimmune Condition */}
          <div className="immune-calc__field">
            <label className="immune-calc__label">
              <ShieldCheck size={12} />
              {isEs ? '¿Condición Autoinmune?' : 'Autoimmune Condition?'}
            </label>
            <select
              className="immune-calc__select"
              value={autoimmune}
              onChange={e => setAutoimmune(e.target.value)}
            >
              <option value="no">{isEs ? 'No (inmunodepleción estándar)' : 'No (standard immunodepletion)'}</option>
              <option value="yes">{isEs ? 'Sí (requiere supervisión médica)' : 'Yes (requires medical supervision)'}</option>
            </select>
            {autoimmune === 'yes' && (
              <div className="immune-calc__hint" style={{ color: '#f59e0b' }}>
                {isEs ? '⚠ Dosis conservadora aplicada (250 mcg BPC)' : '⚠ Conservative dose applied (250 mcg BPC)'}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="immune-calc__results">
          <div className="immune-calc__results-title">
            {isEs ? '⟶ Pauta Calculada' : '⟶ Calculated Schedule'}
          </div>
          <div className="immune-calc__kpi-grid">
            <div className="immune-calc__kpi">
              <div className="immune-calc__kpi-label">TA-1 Dose</div>
              <div className="immune-calc__kpi-value green">{results.ta1Dose} mg</div>
              <div className="immune-calc__kpi-unit">SubQ • {results.ta1FreqPerWeek}× week</div>
            </div>
            <div className="immune-calc__kpi">
              <div className="immune-calc__kpi-label">
                {isEs ? 'Duración Inducción' : 'Induction Duration'}
              </div>
              <div className="immune-calc__kpi-value blue">{results.inductionWeeks} wks</div>
              <div className="immune-calc__kpi-unit">
                {isEs ? `+ ${results.maintenanceWeeks} sem mantenimiento` : `+ ${results.maintenanceWeeks} wks maintenance`}
              </div>
            </div>
            <div className="immune-calc__kpi">
              <div className="immune-calc__kpi-label">BPC-157</div>
              <div className="immune-calc__kpi-value blue">{results.bpcDose} mcg</div>
              <div className="immune-calc__kpi-unit">{results.bpcFreq}</div>
            </div>
            <div className="immune-calc__kpi">
              <div className="immune-calc__kpi-label">
                {isEs ? 'Viales TA-1 Totales' : 'Total TA-1 Vials'}
              </div>
              <div className="immune-calc__kpi-value amber">{results.totalTA1Vials}</div>
              <div className="immune-calc__kpi-unit">
                {isEs ? 'ciclo completo inducción' : 'full induction cycle'}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Detail */}
        <div className="immune-calc__schedule">
          <div className="immune-calc__schedule-header">
            <Info size={13} />
            {isEs ? 'Guía de Administración' : 'Administration Guide'}
          </div>
          <div className="immune-calc__schedule-body">
            {scheduleItems.map((text, i) => (
              <div key={i} className="immune-calc__schedule-row">
                <div className="immune-calc__schedule-dot" />
                <div
                  className="immune-calc__schedule-text"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="immune-calc__footer">
          <button className="immune-calc__btn immune-calc__btn--primary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied
              ? (isEs ? 'Copiado' : 'Copied')
              : (isEs ? 'Copiar Guía Clínica' : 'Copy Clinical Guide')}
          </button>
          <button className="immune-calc__btn immune-calc__btn--ghost" onClick={handleReset}>
            <RotateCcw size={13} />
            {isEs ? 'Reiniciar' : 'Reset'}
          </button>
        </div>

        <div className="immune-calc__disclaimer">
          {isEs
            ? '⚠ Esta herramienta es orientativa. La Timosina Alfa-1 es un fármaco huérfano con indicaciones clínicas precisas. La dosificación final requiere evaluación médica y análisis de inmunoperfil de laboratorio.'
            : '⚠ This tool is for clinical orientation only. Thymosin Alpha-1 is an orphan drug with precise clinical indications. Final dosing requires medical evaluation and immunoprofile laboratory analysis.'}
        </div>
      </div>
    </div>
  );
}
