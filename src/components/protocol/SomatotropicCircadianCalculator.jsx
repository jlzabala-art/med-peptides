"use client";

import React, { useState, useMemo } from 'react';
import {
  Moon,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Copy,
  Check
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './SomatotropicCircadianCalculator.css';

/**
 * SomatotropicCircadianCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console UX Calculator for Growth Hormone Secretagogues (CJC-1295 + Ipamorelin).
 * Calculates hypothalamic somatostatin clearance window, optimal delta sleep injection timing,
 * and 5 ON / 2 OFF pituitary receptor cycling.
 */
export default function SomatotropicCircadianCalculator({ lang = 'en' }) {
  const isEs = lang === 'es';

  // Default baseline hours
  const DEFAULT_DINNER_HOUR = 20; // 20:30 (8:30 PM)
  const DEFAULT_DINNER_MIN = 30;
  const DEFAULT_SLEEP_HOUR = 23; // 23:30 (11:30 PM)
  const DEFAULT_SLEEP_MIN = 30;
  const DEFAULT_SCHEDULE = '5on2off';

  // State
  const [dinnerTime, setDinnerTime] = useState('20:30');
  const [sleepTime, setSleepTime] = useState('23:30');
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [isCustomized, setIsCustomized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Time conversion helper
  const parseTimeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const formatMinutesToTime = (totalMinutes) => {
    const normalized = (totalMinutes + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const mins = normalized % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculations
  const calculations = useMemo(() => {
    const dinnerMins = parseTimeToMinutes(dinnerTime);
    let sleepMins = parseTimeToMinutes(sleepTime);
    
    // If sleep time is past midnight (e.g. 00:30) and dinner is evening (e.g. 21:00)
    if (sleepMins < dinnerMins) {
      sleepMins += 1440; // Add 24h
    }

    const fastingMinutes = sleepMins - dinnerMins;
    const fastingHours = fastingMinutes / 60;

    // Minimum required window for somatostatin clearance: 150 min (2.5h)
    const MIN_FASTING_MINS = 150;
    const isWindowClean = fastingMinutes >= MIN_FASTING_MINS;
    const clearanceTimeMins = dinnerMins + MIN_FASTING_MINS;
    const clearanceTimeFormatted = formatMinutesToTime(clearanceTimeMins);

    // Injection should happen 20 minutes before sleep
    const injectionTimeMins = sleepMins - 20;
    const injectionTimeFormatted = formatMinutesToTime(injectionTimeMins);

    // Injection is safe if injectionTime >= clearanceTime
    const isInjectionSafe = (sleepMins - 20) >= clearanceTimeMins;

    return {
      fastingHours,
      fastingMinutes,
      isWindowClean,
      isInjectionSafe,
      clearanceTimeFormatted,
      injectionTimeFormatted,
      deficitMinutes: isWindowClean ? 0 : MIN_FASTING_MINS - fastingMinutes
    };
  }, [dinnerTime, sleepTime]);

  const handleReset = () => {
    setDinnerTime('20:30');
    setSleepTime('23:30');
    setSchedule(DEFAULT_SCHEDULE);
    setIsCustomized(false);
    toast.success(isEs ? 'Restablecido al horario fisiológico estándar' : 'Reset to standard circadian schedule');
  };

  const handleCopySchedule = async () => {
    const text = isEs
      ? `*Plan Circadiano CJC-1295 + Ipamorelina*\n` +
        `🍽️ Última comida: ${dinnerTime}\n` +
        `⏱️ Desbloqueo somatostatina: ${calculations.clearanceTimeFormatted} (mín. 2.5h de ayuno)\n` +
        `💉 Hora óptima de inyección: ${calculations.injectionTimeFormatted} (~20 min antes de dormir)\n` +
        `🌙 Hora de dormir: ${sleepTime}\n` +
        `📅 Pauta: ${schedule === '5on2off' ? '5 días ON (Lunes–Viernes) / 2 días OFF (Fines de semana)' : '6 días ON / 1 día OFF'}\n` +
        `⚠️ Estado: ${calculations.isInjectionSafe ? 'Ventana Fisiológica Óptima' : 'Alerta: Adelantar cena ' + calculations.deficitMinutes + ' minutos'}\n\n` +
        `_Med-Peptides Clinical Circadian Optimizer_`
      : `*Circadian Timing Plan — CJC-1295 + Ipamorelin*\n` +
        `🍽️ Final meal (dinner): ${dinnerTime}\n` +
        `⏱️ Somatostatin clearance: ${calculations.clearanceTimeFormatted} (min. 2.5h strict fasting)\n` +
        `💉 Target injection time: ${calculations.injectionTimeFormatted} (~20 min prior to sleep)\n` +
        `🌙 Bedtime: ${sleepTime}\n` +
        `📅 Schedule: ${schedule === '5on2off' ? '5 Days ON (Mon–Fri) / 2 Days OFF (Weekends)' : '6 Days ON / 1 Day OFF'}\n` +
        `⚠️ Clearance state: ${calculations.isInjectionSafe ? 'Optimal Circadian Window' : 'Warning: Move dinner ' + calculations.deficitMinutes + ' min earlier'}\n\n` +
        `_Med-Peptides Clinical Circadian Optimizer_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(isEs ? 'Plan circadiano copiado al portapapeles' : 'Circadian schedule copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  return (
    <div className="scc-container">
      {/* ── Header ── */}
      <div className="scc-header">
        <div className="scc-header-left">
          <div className="scc-icon-wrap">
            <Moon size={18} color="#003666" />
          </div>
          <div>
            <div className="scc-badges-row">
              <span className="scc-badge scc-badge-cyan">
                {isEs ? 'Cronobiología Delta Sleep' : 'Delta Sleep Chronobiology'}
              </span>
              <span className="scc-badge scc-badge-slate">
                {isEs ? 'Bloqueo Somatostatínico' : 'Somatostatin Gate'}
              </span>
            </div>
            <h4 className="scc-title">
              {isEs
                ? 'Calculadora de Sincronización Circadiana y Desbloqueo de Somatostatina'
                : 'Circadian Timing & Somatostatin Clearance Calculator'}
            </h4>
            <p className="scc-subtitle">
              {isEs
                ? 'Calcula la ventana de ayuno nocturno para evitar que la insulina y somatostatina postprandiales anulen el pulso de hormona de crecimiento.'
                : 'Calculate the postprandial fasting window required to prevent insulin and hypothalamic somatostatin from blunting the GH pulse.'}
            </p>
          </div>
        </div>

        <div className="scc-header-actions">
          {isCustomized && (
            <button type="button" onClick={handleReset} className="scc-btn-secondary">
              <RotateCcw size={12} />
              <span>{isEs ? 'Restablecer' : 'Reset'}</span>
            </button>
          )}
          <button type="button" onClick={handleCopySchedule} className="scc-btn-primary">
            {copied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
            <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Pauta' : 'Copy Schedule')}</span>
          </button>
        </div>
      </div>

      {/* ── Split Layout: Inputs on Left, 2x2 GCP Output Cards on Right ── */}
      <div className="scc-body-grid">
        
        {/* Left: Input Controls */}
        <div className="scc-form-col">
          <span className="scc-form-kicker">
            {isEs ? 'Parámetros del Paciente' : 'Patient Timing Inputs'}
          </span>

          {/* Input 1: Dinner Time */}
          <div className="scc-field">
            <div className="scc-field-label-row">
              <label htmlFor="dinner-time-select" className="scc-label">
                {isEs ? 'Hora de última comida (Cena):' : 'Final meal time (Dinner):'}
              </label>
              <span className="scc-val-pill">{dinnerTime}</span>
            </div>
            <div className="scc-preset-chips">
              {['19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`scc-chip-btn ${dinnerTime === time ? 'is-active' : ''}`}
                  onClick={() => {
                    setDinnerTime(time);
                    setIsCustomized(true);
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Bedtime */}
          <div className="scc-field">
            <div className="scc-field-label-row">
              <label htmlFor="sleep-time-select" className="scc-label">
                {isEs ? 'Hora prevista para dormir:' : 'Target bedtime:'}
              </label>
              <span className="scc-val-pill">{sleepTime}</span>
            </div>
            <div className="scc-preset-chips">
              {['22:30', '23:00', '23:30', '00:00', '00:30', '01:00'].map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`scc-chip-btn ${sleepTime === time ? 'is-active' : ''}`}
                  onClick={() => {
                    setSleepTime(time);
                    setIsCustomized(true);
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Input 3: Weekly Cycling Mode */}
          <div className="scc-field">
            <div className="scc-field-label-row">
              <span className="scc-label">{isEs ? 'Pauta Semanal de Descanso:' : 'Weekly Cycling Cadence:'}</span>
            </div>
            <div className="scc-segmented">
              <button
                type="button"
                className={`scc-seg-btn ${schedule === '5on2off' ? 'is-active' : ''}`}
                onClick={() => {
                  setSchedule('5on2off');
                  setIsCustomized(true);
                }}
              >
                <span>5 ON / 2 OFF</span>
                <small>{isEs ? 'L–V activo, S–D descanso' : 'Mon–Fri on, Sat–Sun off'}</small>
              </button>
              <button
                type="button"
                className={`scc-seg-btn ${schedule === '6on1off' ? 'is-active' : ''}`}
                onClick={() => {
                  setSchedule('6on1off');
                  setIsCustomized(true);
                }}
              >
                <span>6 ON / 1 OFF</span>
                <small>{isEs ? '6 días activo, 1 día descanso' : '6 days on, 1 day off'}</small>
              </button>
            </div>
          </div>
        </div>

        {/* Right: GCP 2x2 Output Metric Cards */}
        <div className="scc-output-col">
          <span className="scc-output-kicker">
            {isEs ? 'Análisis Circadiano y Ventana Somatostatínica' : 'Circadian Analysis & Clearance Status'}
          </span>

          <div className="scc-metrics-grid">
            {/* Card 1: Clearance Window */}
            <div className="scc-metric-card">
              <span className="scc-metric-label">
                {isEs ? 'Desbloqueo Somatostatina' : 'Somatostatin Clearance'}
              </span>
              <div className="scc-metric-value scc-highlight">
                {calculations.clearanceTimeFormatted}
              </div>
              <span className="scc-metric-sub">
                {isEs 
                  ? `Requiere 2.5h mínimas de ayuno estricto tras la cena (${dinnerTime})` 
                  : `Requires 2.5h minimum strict fast after dinner (${dinnerTime})`}
              </span>
            </div>

            {/* Card 2: Target Injection Minute */}
            <div className="scc-metric-card">
              <span className="scc-metric-label">
                {isEs ? 'Hora Diana de Inyección' : 'Optimal Injection Time'}
              </span>
              <div className="scc-metric-value">
                {calculations.injectionTimeFormatted}
              </div>
              <span className="scc-metric-sub">
                {isEs 
                  ? `~20 min antes de dormir (${sleepTime}) para inducir pulso GH en sueño Delta`
                  : `~20 min prior to sleep (${sleepTime}) to trigger Delta slow-wave pulse`}
              </span>
            </div>

            {/* Card 3: Clearance Safety Status */}
            <div className={`scc-metric-card ${calculations.isInjectionSafe ? 'scc-card-clean' : 'scc-card-warning'}`}>
              <span className="scc-metric-label">
                {isEs ? 'Compatibilidad Postprandial' : 'Postprandial Compatibility'}
              </span>
              <div className="scc-status-row">
                {calculations.isInjectionSafe ? (
                  <>
                    <ShieldCheck size={18} color="#16a34a" />
                    <strong style={{ color: '#15803d', fontSize: '0.90rem' }}>
                      {isEs ? 'Ventana Óptima (100% Eficacia)' : 'Optimal Window (100% Efficacy)'}
                    </strong>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} color="#dc2626" />
                    <strong style={{ color: '#b91c1c', fontSize: '0.88rem' }}>
                      {isEs ? `Bloqueo Activo (-${calculations.deficitMinutes} min)` : `Active Interference (-${calculations.deficitMinutes} min)`}
                    </strong>
                  </>
                )}
              </div>
              <span className="scc-metric-sub">
                {calculations.isInjectionSafe
                  ? (isEs ? `Ventana de ${calculations.fastingHours.toFixed(1)}h libre de secreción insulínica.` : `${calculations.fastingHours.toFixed(1)}h clean window free of insulin secretion.`)
                  : (isEs ? `Adelantar la cena ${calculations.deficitMinutes} min para evitar supresión del pulso secretagogo.` : `Shift dinner ${calculations.deficitMinutes} min earlier to avoid somatostatin blunting.`)}
              </span>
            </div>

            {/* Card 4: Receptor Recovery Schedule */}
            <div className="scc-metric-card">
              <span className="scc-metric-label">
                {isEs ? 'Ciclo Anti-Desensibilización' : 'Receptor Recovery Cadence'}
              </span>
              <div className="scc-metric-value">
                {schedule === '5on2off' ? '5 ON / 2 OFF' : '6 ON / 1 OFF'}
              </div>
              <span className="scc-metric-sub">
                {schedule === '5on2off'
                  ? (isEs ? 'L–V inyecciones nocturnas · S–D descanso para reset de receptores GHS-R' : 'Mon–Fri night doses · Sat–Sun off to reset pituitary GHS-R receptors')
                  : (isEs ? '6 noches activas · 1 noche de lavado semanal' : '6 active nights · 1 weekly washout night')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
