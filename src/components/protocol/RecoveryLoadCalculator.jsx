"use client";

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Zap,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Info,
  AlertTriangle
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './RecoveryLoadCalculator.css';

/**
 * RecoveryLoadCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-standard recovery load estimator for BPC-157 + TB-500 protocols.
 * Calculates acute vs chronic injury loading doses, route of administration
 * (systemic SubQ vs localized oral), and phase timelines based on:
 *   - Patient weight
 *   - Injury type (musculoskeletal / connective tissue / systemic)
 *   - Injury chronicity (acute / subacute / chronic)
 *   - Training volume / stress load
 */
export default function RecoveryLoadCalculator({ lang = 'en' }) {
  const isEs = lang === 'es';

  // ── Inputs ──
  const [weight, setWeight] = useState(80);
  const [injuryType, setInjuryType] = useState('musculoskeletal');  // musculoskeletal | connective | systemic
  const [chronicity, setChronicity] = useState('subacute');         // acute | subacute | chronic
  const [trainingLoad, setTrainingLoad] = useState('moderate');     // high | moderate | low
  const [copied, setCopied] = useState(false);

  // ── Computation ──
  const results = useMemo(() => {
    const w = Number(weight) || 80;

    // BPC-157 dose: weight-based (2.5–5 mcg/kg) capped at clinical standard
    const bpcPerKg = chronicity === 'chronic' ? 5.0 : chronicity === 'subacute' ? 3.5 : 2.5;
    const bpcDoseRaw = w * bpcPerKg;
    // Round to nearest 50 mcg, cap at 500 mcg (max documented safe daily)
    const bpcDose = Math.min(500, Math.round(bpcDoseRaw / 50) * 50);

    // Frequency per day
    const bpcFreqPerDay = chronicity === 'acute' ? 2 : 1;
    const bpcTotalDaily = bpcDose * bpcFreqPerDay;

    // Route: systemic SubQ for all types
    // Oral BPC (gut) is additive for systemic/GI conditions
    const useOralBPC = injuryType === 'systemic';

    // TB-500 dosing: higher for connective and chronic
    const tb500WeeklyBase = {
      musculoskeletal: { acute: 2.5, subacute: 2.0, chronic: 5.0 },
      connective:      { acute: 5.0, subacute: 5.0, chronic: 10.0 },
      systemic:        { acute: 2.0, subacute: 2.0, chronic: 5.0 },
    };
    const tb500Dose = tb500WeeklyBase[injuryType]?.[chronicity] ?? 2.0; // mg/week

    // Training load modifier (higher load = more aggressive dosing)
    const loadFactor = { high: 1.2, moderate: 1.0, low: 0.8 }[trainingLoad] ?? 1.0;

    // Phase 1: Loading (weeks)
    const loadingWeeks = chronicity === 'acute' ? 2 : chronicity === 'subacute' ? 4 : 6;
    // Phase 2: Consolidation
    const consolidationWeeks = Math.round(loadingWeeks * 0.75);

    // Estimated repair timeline (weeks to functional recovery)
    const repairTimeline = chronicity === 'acute' ? 4 : chronicity === 'subacute' ? 8 : 16;

    // Weekly BPC vials needed
    const bpcVialsPerWeek = Math.ceil((bpcTotalDaily * 7) / 500); // each vial = 500mcg

    // Peak collagen synthesis window (days post-first dose)
    const collagenWindow = injuryType === 'connective' ? '14–21 days' : '7–14 days';

    return {
      bpcDose,
      bpcFreqPerDay,
      bpcTotalDaily,
      useOralBPC,
      tb500Dose: Math.round(tb500Dose * loadFactor * 10) / 10,
      loadingWeeks,
      consolidationWeeks,
      repairTimeline,
      bpcVialsPerWeek,
      collagenWindow,
    };
  }, [weight, injuryType, chronicity, trainingLoad]);

  const handleReset = () => {
    setWeight(80);
    setInjuryType('musculoskeletal');
    setChronicity('subacute');
    setTrainingLoad('moderate');
    toast(isEs ? 'Valores restablecidos' : 'Values reset');
  };

  const handleCopy = async () => {
    const text = isEs
      ? `*Cálculo Clínico — Protocolo de Recuperación BPC-157 + TB-500*\n\n` +
        `• BPC-157 SubQ: ${results.bpcDose} mcg × ${results.bpcFreqPerDay}/día = ${results.bpcTotalDaily} mcg/día total\n` +
        (results.useOralBPC ? `• BPC-157 Oral (adicional): 250 mcg × 2/día para soporte sistémico\n` : '') +
        `• TB-500: ${results.tb500Dose} mg SubQ 1× semana\n` +
        `• Fase de Carga: ${results.loadingWeeks} semanas a dosis completa\n` +
        `• Fase de Consolidación: ${results.consolidationWeeks} semanas a dosis reducida\n` +
        `• Viales BPC-157/semana: ${results.bpcVialsPerWeek} viales\n` +
        `• Ventana síntesis colágeno: ${results.collagenWindow}\n` +
        `• Recuperación funcional estimada: ${results.repairTimeline} semanas\n\n` +
        `Atlas Services — Referencia Clínica de Recuperación`
      : `*Clinical Calculation — Recovery Protocol BPC-157 + TB-500*\n\n` +
        `• BPC-157 SubQ: ${results.bpcDose} mcg × ${results.bpcFreqPerDay}/day = ${results.bpcTotalDaily} mcg/day total\n` +
        (results.useOralBPC ? `• BPC-157 Oral (additional): 250 mcg × 2/day for systemic support\n` : '') +
        `• TB-500: ${results.tb500Dose} mg SubQ 1× week\n` +
        `• Loading Phase: ${results.loadingWeeks} weeks at full dose\n` +
        `• Consolidation Phase: ${results.consolidationWeeks} weeks at reduced dose\n` +
        `• BPC-157 Vials/week: ${results.bpcVialsPerWeek} vials\n` +
        `• Collagen Synthesis Window: ${results.collagenWindow}\n` +
        `• Estimated Functional Recovery: ${results.repairTimeline} weeks\n\n` +
        `Atlas Services — Recovery Clinical Reference`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isEs ? 'Guía copiada al portapapeles' : 'Protocol copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isEs ? 'Error al copiar' : 'Copy failed');
    }
  };

  const phaseItems = isEs
    ? [
        `<strong>Fase 1 — Carga (${results.loadingWeeks} semanas):</strong> BPC-157 ${results.bpcDose} mcg × ${results.bpcFreqPerDay}× día SubQ + TB-500 ${results.tb500Dose} mg 1×/semana. Administrar BPC en zona perilesional o subcutánea distal.`,
        `<strong>Fase 2 — Consolidación (${results.consolidationWeeks} semanas):</strong> Reducir BPC-157 a 250 mcg × 1× día. Continuar TB-500 cada 2 semanas para mantenimiento de angiogénesis reparadora.`,
        results.useOralBPC
          ? `<strong>BPC-157 Oral:</strong> 250 mcg × 2× día adicional para soporte de barrera mucosa y motilidad GI sistémica (split mañana/noche).`
          : `<strong>Técnica de inyección:</strong> Rotar sitios subcutáneos: abdomen, muslo anterior, zona subescapular. Evitar inyección en tejido activamente inflamado.`,
        `<strong>Ventana de síntesis de colágeno:</strong> ${results.collagenWindow} post-inicio de protocolo — periodo de máxima respuesta anabólica del tejido conectivo.`,
      ]
    : [
        `<strong>Phase 1 — Loading (${results.loadingWeeks} weeks):</strong> BPC-157 ${results.bpcDose} mcg × ${results.bpcFreqPerDay}× daily SubQ + TB-500 ${results.tb500Dose} mg 1×/week. Administer BPC peri-lesional or distal subcutaneous.`,
        `<strong>Phase 2 — Consolidation (${results.consolidationWeeks} weeks):</strong> Taper BPC-157 to 250 mcg × once daily. Continue TB-500 every 2 weeks for reparative angiogenesis maintenance.`,
        results.useOralBPC
          ? `<strong>Oral BPC-157:</strong> 250 mcg × 2× daily additional for mucosal barrier and systemic GI motility support (split morning/night).`
          : `<strong>Injection Technique:</strong> Rotate SubQ sites: abdomen, anterior thigh, subscapular zone. Avoid injection into actively inflamed tissue.`,
        `<strong>Collagen Synthesis Window:</strong> ${results.collagenWindow} post-protocol start — peak anabolic connective tissue response period.`,
      ];

  return (
    <div className="recovery-calc">
      {/* Header */}
      <div className="recovery-calc__header">
        <div className="recovery-calc__header-left">
          <div className="recovery-calc__icon-wrap">
            <Activity size={16} />
          </div>
          <div>
            <div className="recovery-calc__title">
              {isEs ? 'Calculadora de Carga de Recuperación' : 'Recovery Load Calculator'}
            </div>
            <div className="recovery-calc__subtitle">
              {isEs ? 'BPC-157 + TB-500 — Dosificación por Lesión y Cronicidad' : 'BPC-157 + TB-500 — Injury & Chronicity Dosing'}
            </div>
          </div>
        </div>
        <span className="recovery-calc__badge">
          {isEs ? 'Motor Clínico' : 'Clinical Engine'}
        </span>
      </div>

      <div className="recovery-calc__body">
        {/* Inputs */}
        <div className="recovery-calc__inputs">
          {/* Weight */}
          <div className="recovery-calc__field">
            <label className="recovery-calc__label">
              <Zap size={12} />
              {isEs ? 'Peso Corporal (kg)' : 'Body Weight (kg)'}
            </label>
            <input
              type="number"
              min="40"
              max="150"
              className="recovery-calc__input"
              value={weight}
              onChange={e => setWeight(Math.min(150, Math.max(40, Number(e.target.value) || 40)))}
            />
            <div className="recovery-calc__hint">{isEs ? 'Para dosificación mcg/kg' : 'For mcg/kg dosing'}</div>
          </div>

          {/* Training Load */}
          <div className="recovery-calc__field">
            <label className="recovery-calc__label">
              <Activity size={12} />
              {isEs ? 'Carga de Entrenamiento' : 'Training Load'}
            </label>
            <select
              className="recovery-calc__select"
              value={trainingLoad}
              onChange={e => setTrainingLoad(e.target.value)}
            >
              <option value="high">{isEs ? 'Alta (atleta / competición)' : 'High (athlete / competition)'}</option>
              <option value="moderate">{isEs ? 'Moderada (activo regular)' : 'Moderate (regularly active)'}</option>
              <option value="low">{isEs ? 'Baja (sedentario / reposo)' : 'Low (sedentary / rest)'}</option>
            </select>
          </div>

          {/* Injury Type */}
          <div className="recovery-calc__field">
            <label className="recovery-calc__label">
              <AlertTriangle size={12} />
              {isEs ? 'Tipo de Tejido' : 'Tissue Type'}
            </label>
            <select
              className="recovery-calc__select"
              value={injuryType}
              onChange={e => setInjuryType(e.target.value)}
            >
              <option value="musculoskeletal">{isEs ? 'Musculoesquelético (músculo/hueso)' : 'Musculoskeletal (muscle/bone)'}</option>
              <option value="connective">{isEs ? 'Tejido conectivo (tendón/ligamento)' : 'Connective tissue (tendon/ligament)'}</option>
              <option value="systemic">{isEs ? 'Sistémico / GI (barrera mucosa)' : 'Systemic / GI (mucosal barrier)'}</option>
            </select>
          </div>

          {/* Chronicity */}
          <div className="recovery-calc__field">
            <label className="recovery-calc__label">
              <Clock size={12} />
              {isEs ? 'Cronicidad de la Lesión' : 'Injury Chronicity'}
            </label>
            <select
              className="recovery-calc__select"
              value={chronicity}
              onChange={e => setChronicity(e.target.value)}
            >
              <option value="acute">{isEs ? 'Aguda (&lt;3 semanas)' : 'Acute (<3 weeks)'}</option>
              <option value="subacute">{isEs ? 'Subaguda (3–12 semanas)' : 'Subacute (3–12 weeks)'}</option>
              <option value="chronic">{isEs ? 'Crónica (&gt;12 semanas / recurrente)' : 'Chronic (>12 weeks / recurrent)'}</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="recovery-calc__results">
          <div className="recovery-calc__results-title">
            {isEs ? '⟶ Carga Calculada' : '⟶ Calculated Load'}
          </div>
          <div className="recovery-calc__kpi-grid">
            <div className="recovery-calc__kpi">
              <div className="recovery-calc__kpi-label">BPC-157 / day</div>
              <div className="recovery-calc__kpi-value orange">{results.bpcTotalDaily} mcg</div>
              <div className="recovery-calc__kpi-unit">
                {results.bpcDose} mcg × {results.bpcFreqPerDay}× daily
              </div>
            </div>
            <div className="recovery-calc__kpi">
              <div className="recovery-calc__kpi-label">TB-500 / week</div>
              <div className="recovery-calc__kpi-value blue">{results.tb500Dose} mg</div>
              <div className="recovery-calc__kpi-unit">SubQ once weekly</div>
            </div>
            <div className="recovery-calc__kpi">
              <div className="recovery-calc__kpi-label">
                {isEs ? 'Duración Total' : 'Total Duration'}
              </div>
              <div className="recovery-calc__kpi-value amber">
                {results.loadingWeeks + results.consolidationWeeks} wks
              </div>
              <div className="recovery-calc__kpi-unit">
                {results.loadingWeeks}L + {results.consolidationWeeks}C
              </div>
            </div>
            <div className="recovery-calc__kpi">
              <div className="recovery-calc__kpi-label">
                {isEs ? 'Recuperación Estimada' : 'Est. Recovery'}
              </div>
              <div className="recovery-calc__kpi-value green">
                {results.repairTimeline} wks
              </div>
              <div className="recovery-calc__kpi-unit">
                {isEs ? 'recuperación funcional' : 'functional recovery'}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Detail */}
        <div className="recovery-calc__phases">
          <div className="recovery-calc__phases-header">
            <Info size={13} />
            {isEs ? 'Guía de Fases' : 'Phase Guide'}
          </div>
          <div className="recovery-calc__phases-body">
            {phaseItems.map((text, i) => (
              <div key={i} className="recovery-calc__phase-row">
                <div className="recovery-calc__phase-dot" />
                <div
                  className="recovery-calc__phase-text"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="recovery-calc__footer">
          <button className="recovery-calc__btn recovery-calc__btn--primary" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied
              ? (isEs ? 'Copiado' : 'Copied')
              : (isEs ? 'Copiar Guía Clínica' : 'Copy Clinical Guide')}
          </button>
          <button className="recovery-calc__btn recovery-calc__btn--ghost" onClick={handleReset}>
            <RotateCcw size={13} />
            {isEs ? 'Reiniciar' : 'Reset'}
          </button>
        </div>

        <div className="recovery-calc__disclaimer">
          {isEs
            ? '⚠ La dosificación de BPC-157 y TB-500 se basa en estudios preclínicos y protocolos clínicos emergentes. La dosis final debe ser individualizada por un profesional médico cualificado en medicina regenerativa.'
            : '⚠ BPC-157 and TB-500 dosing is based on preclinical studies and emerging clinical protocols. Final dose must be individualized by a qualified physician in regenerative medicine.'}
        </div>
      </div>
    </div>
  );
}
