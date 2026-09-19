"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, Calendar, Clock, ShieldAlert, Sparkles, CheckCircle2, 
  ChevronRight, ChevronDown, ChevronUp, Stethoscope, User, Droplets, Snowflake, AlertCircle,
  Layers, Table
} from 'lucide-react';
import '../../styles/clinicalGantt.css';
import StatusBadge from '../ui/StatusBadge';
import { WarehouseOriginBadge, ColdChainBadge } from '../ui/WarehouseOriginBadge';
import { resolveClinicalCompoundDose } from '../../utils/clinicalDosingEngine';

/**
 * ClinicalGanttTimeline
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Interactive Clinical Gantt Diagram & Phased Timeline.
 * Designed for Doctor calibration and Patient treatment journey tracking.
 * Works seamlessly on Laptop widescreen and Mobile touchscreens.
 */
/**
 * Resolves clean clinical dose, frequency cadence, and weekly total for any compound/phase/week
 */
function resolveWeeklyCompoundDose(compound, phase, phaseIndex, weekNumber, totalPhases = 3) {
  if (!compound) return { unitDose: 'Active', shortCadence: '1x/wk', weeklyTotal: '', isStepUp: false };
  const res = resolveClinicalCompoundDose(compound, phase, phaseIndex, totalPhases);

  let isStepUp = false;
  if (phaseIndex > 0) {
    const priorDose = resolveClinicalCompoundDose(compound, null, 0, totalPhases);
    if (priorDose.unitDose !== res.unitDose && priorDose.unitDose !== 'Active') {
      isStepUp = true;
    }
  }

  return {
    unitDose: res.unitDose,
    shortCadence: res.shortCadence,
    timesPerWeek: res.timesPerWeek,
    weeklyTotal: res.weeklyTotal,
    isStepUp: res.isStepUp || isStepUp,
    frequency: compound.frequency || `${res.shortCadence} (${compound.route || 'Subcutaneous'})`,
    route: compound.route || 'Subcutaneous',
    storage: compound.storage || '❄️ 2°C – 8°C Refrigerator',
    format: compound.format || '🧪 Sterile Lyophilized Vial'
  };
}

export default function ClinicalGanttTimeline({
  protocol,
  onDoseTaken
}) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [viewMode, setViewMode] = useState('doctor'); // 'doctor' | 'patient'
  const [activeLayout, setActiveLayout] = useState('accordions'); // 'accordions' | 'gantt'
  const [openPhaseIdx, setOpenPhaseIdx] = useState(0);
  const [dosesTaken, setDosesTaken] = useState({});

  // Default phased dataset if protocol lacks full phases
  const defaultPhases = useMemo(() => [
    {
      phaseNumber: 1,
      phaseName: 'Induction & Adaptation',
      type: 'induction',
      durationWeeks: 4,
      colorClass: 'gantt-bar-induction',
      instructions: 'Gradual cellular receptor up-regulation with weekly GI tolerance monitoring.',
      compounds: [
        {
          name: protocol?.name?.includes('Tirzepatide') ? 'Tirzepatide' : 'Primary Peptide API',
          dosage: '2.5 mg',
          frequency: 'Once Weekly (Sunday PM)',
          format: '🖊️ Reusable Pen (20mg Cartridge)',
          route: 'Subcutaneous',
          storage: '❄️ 2°C – 8°C Refrigerator'
        },
        {
          name: 'BPC-157 (Gastric Protection)',
          dosage: '500 mcg',
          frequency: 'Daily (Morning Fasted)',
          format: '🧪 10mg Lyophilized Vial',
          route: 'Subcutaneous',
          storage: '❄️ 2°C – 8°C Refrigerator'
        }
      ],
      biomarkerCheck: '🩸 Baseline Panel (HbA1c, Fasting Glucose, Lipid Profile)'
    },
    {
      phaseNumber: 2,
      phaseName: 'Therapeutic Titration',
      type: 'optimization',
      durationWeeks: 4,
      colorClass: 'gantt-bar-optimization',
      instructions: 'Target therapeutic window for optimal metabolic efficiency.',
      compounds: [
        {
          name: protocol?.name?.includes('Tirzepatide') ? 'Tirzepatide' : 'Primary Peptide API',
          dosage: '5.0 mg',
          frequency: 'Once Weekly (Sunday PM)',
          format: '🖊️ Reusable Pen (20mg Cartridge)',
          route: 'Subcutaneous',
          storage: '❄️ 2°C – 8°C Refrigerator'
        },
        {
          name: 'MOTS-c (Mitochondrial Energy)',
          dosage: '5.0 mg',
          frequency: '3x Weekly (Mon/Wed/Fri)',
          format: '🧪 10mg Lyophilized Vial',
          route: 'Subcutaneous',
          storage: '❄️ 2°C – 8°C Refrigerator'
        }
      ],
      biomarkerCheck: '🩸 Mid-Cycle Re-Test (Fasting Insulin & HOMA-IR)'
    },
    {
      phaseNumber: 3,
      phaseName: 'Peak Maintenance',
      type: 'maintenance',
      durationWeeks: 4,
      colorClass: 'gantt-bar-maintenance',
      instructions: 'Sustained metabolic equilibrium and lean mass retention.',
      compounds: [
        {
          name: protocol?.name?.includes('Tirzepatide') ? 'Tirzepatide' : 'Primary Peptide API',
          dosage: '7.5 mg',
          frequency: 'Once Weekly (Sunday PM)',
          format: '🖊️ Reusable Pen (20mg Cartridge)',
          route: 'Subcutaneous',
          storage: '❄️ 2°C – 8°C Refrigerator'
        }
      ],
      biomarkerCheck: null
    },
    {
      phaseNumber: 4,
      phaseName: 'Washout / Off-Cycle',
      type: 'washout',
      durationWeeks: 2,
      colorClass: 'gantt-bar-washout',
      instructions: 'Receptor clearance and baseline biological reset.',
      compounds: [
        {
          name: 'Glutathione + NAD+ Support',
          dosage: '100 mg',
          frequency: 'Twice Weekly',
          format: '🧪 Multi-Dose Vial',
          route: 'Subcutaneous',
          storage: '❄️ 2°C – 8°C Refrigerator'
        }
      ],
      biomarkerCheck: '🩸 Post-Cycle Comprehensive Longevity Biomarkers'
    }
  ], [protocol]);

  const rawPhases = (Array.isArray(protocol?.phases) && protocol.phases.length > 0)
    ? protocol.phases
    : defaultPhases;

  // Normalized phases with accurate start/end week bounds
  const normalizedPhases = useMemo(() => {
    let currentStart = 1;
    const colorClasses = ['gantt-bar-induction', 'gantt-bar-optimization', 'gantt-bar-maintenance', 'gantt-bar-washout'];
    return rawPhases.map((p, idx) => {
      const duration = Number(p.durationWeeks) || 4;
      const start = currentStart;
      const end = currentStart + duration - 1;
      currentStart = end + 1;
      return {
        ...p,
        phaseNumber: p.phaseNumber || (idx + 1),
        phaseName: p.phaseName || p.name || `Phase ${idx + 1}`,
        startWeek: start,
        endWeek: end,
        durationWeeks: duration,
        colorClass: p.colorClass || colorClasses[idx % colorClasses.length]
      };
    });
  }, [rawPhases]);

  const totalWeeks = normalizedPhases.reduce((acc, p) => acc + (Number(p.durationWeeks) || 4), 0);
  const weeksArray = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Active phase for the selected week
  const currentPhase = useMemo(() => {
    for (const phase of normalizedPhases) {
      if (selectedWeek >= phase.startWeek && selectedWeek <= phase.endWeek) {
        return phase;
      }
    }
    return normalizedPhases[0] || {};
  }, [normalizedPhases, selectedWeek]);

  // Distinct list of compounds across all phases or BOM
  const distinctCompounds = useMemo(() => {
    const list = [];
    const seen = new Set();
    for (const p of normalizedPhases) {
      for (const c of (p.compounds || [])) {
        const key = (c.name || '').trim().toUpperCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push(c);
        }
      }
    }
    if (list.length === 0) {
      const source = Array.isArray(protocol?.bom) && protocol.bom.length > 0 
        ? protocol.bom 
        : (Array.isArray(protocol?.items) ? protocol.items : []);
      for (const it of source) {
        const name = it.product_name || it.name;
        const key = (name || '').trim().toUpperCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          list.push({
            name,
            dosage: it.dosage,
            dose: it.dosage,
            frequency: it.frequency || 'Once weekly',
            route: it.route || 'Subcutaneous',
            format: it.format || '🧪 Sterile Lyophilized Vial',
            storage: '❄️ 2°C – 8°C Refrigerator'
          });
        }
      }
    }
    return list;
  }, [normalizedPhases, protocol]);

  // Active week compound dosage & cumulative metrics
  const activeWeekCompounds = useMemo(() => {
    const currentPhaseIndex = normalizedPhases.findIndex(p => selectedWeek >= p.startWeek && selectedWeek <= p.endWeek);
    const p = currentPhaseIndex >= 0 ? normalizedPhases[currentPhaseIndex] : normalizedPhases[0];
    
    return distinctCompounds.map(comp => {
      const cData = (p?.compounds || []).find(c => c.name?.toUpperCase() === comp.name?.toUpperCase()) || comp;
      const doseInfo = resolveWeeklyCompoundDose(cData, p, currentPhaseIndex, selectedWeek, normalizedPhases.length);
      return {
        name: comp.name,
        format: comp.format || cData.format || '🧪 Sterile Lyophilized Vial',
        ...doseInfo
      };
    });
  }, [distinctCompounds, normalizedPhases, selectedWeek]);

  const handleToggleDose = (key) => {
    setDosesTaken(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (onDoseTaken) onDoseTaken(key, next[key]);
      return next;
    });
  };

  // Sync open accordion when selectedWeek changes
  const currentPhaseIndex = useMemo(() => {
    const idx = normalizedPhases.findIndex(p => selectedWeek >= p.startWeek && selectedWeek <= p.endWeek);
    return idx >= 0 ? idx : 0;
  }, [normalizedPhases, selectedWeek]);

  useEffect(() => {
    if (currentPhaseIndex >= 0 && currentPhaseIndex !== openPhaseIdx) {
      setOpenPhaseIdx(currentPhaseIndex);
    }
  }, [currentPhaseIndex, openPhaseIdx]);

  return (
    <div className="clinical-gantt-container">
      {/* 1. Header & Controls Switchers */}
      <div className="gantt-header">
        <div className="gantt-title-group">
          <div className="gantt-icon-badge">
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Interactive Clinical Pathway Engine
            </div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {protocol?.name || 'Metabolic & Longevity Protocol'}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Layout View Switcher: Accordions (Default) vs Gantt Matrix */}
          <div className="gantt-mode-toggle">
            <button
              type="button"
              className={`gantt-mode-btn ${activeLayout === 'accordions' ? 'active' : ''}`}
              onClick={() => setActiveLayout('accordions')}
              title="Phased Accordions View (Recommended)"
            >
              <Layers size={14} /> Phased Accordions
            </button>
            <button
              type="button"
              className={`gantt-mode-btn ${activeLayout === 'gantt' ? 'active' : ''}`}
              onClick={() => setActiveLayout('gantt')}
              title="Full Macro Gantt Matrix View"
            >
              <Table size={14} /> Gantt Matrix
            </button>
          </div>

          {/* Perspective Switcher */}
          <div className="gantt-mode-toggle">
            <button
              type="button"
              className={`gantt-mode-btn ${viewMode === 'doctor' ? 'active' : ''}`}
              onClick={() => setViewMode('doctor')}
            >
              <Stethoscope size={15} /> Doctor View
            </button>
            <button
              type="button"
              className={`gantt-mode-btn ${viewMode === 'patient' ? 'active' : ''}`}
              onClick={() => setViewMode('patient')}
            >
              <User size={15} /> Patient Journey
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACCORDION PHASE VIEW (Default & Clean Architecture) */}
      {activeLayout === 'accordions' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Macro Progress Stepper Horizon */}
          <div className="phase-stepper-track">
            {normalizedPhases.map((ph, idx) => {
              const isOpen = openPhaseIdx === idx;
              const isPast = openPhaseIdx > idx;
              return (
                <div 
                  key={idx} 
                  className={`phase-stepper-step ${isOpen ? 'active' : isPast ? 'completed' : ''}`}
                  onClick={() => {
                    setOpenPhaseIdx(idx);
                    setSelectedWeek(ph.startWeek);
                  }}
                  title={`Open Phase ${ph.phaseNumber}: ${ph.phaseName} (Weeks ${ph.startWeek}–${ph.endWeek})`}
                >
                  <div className="phase-step-badge">
                    {isPast ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <div className="phase-step-info">
                    <span className="phase-step-num">Phase {ph.phaseNumber}</span>
                    <span className="phase-step-title">{ph.phaseName}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phase Accordions Stack (Only one accordion is open at a time) */}
          <div className="phase-accordions-stack">
            {normalizedPhases.map((phase, idx) => {
              const isOpen = openPhaseIdx === idx;
              const phaseCompounds = phase.compounds || [];
              const isStepUp = phaseCompounds.some(c => {
                const d = resolveWeeklyCompoundDose(c, phase, idx, phase.startWeek, normalizedPhases.length);
                return d.isStepUp;
              });

              return (
                <div 
                  key={idx} 
                  className={`phase-accordion-card ${isOpen ? 'is-open' : 'is-collapsed'}`}
                >
                  {/* Clickable Accordion Header */}
                  <div 
                    className="phase-accordion-header"
                    onClick={() => {
                      if (openPhaseIdx !== idx) {
                        setOpenPhaseIdx(idx);
                        setSelectedWeek(phase.startWeek);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                  >
                    <div className="pah-left">
                      <span className={`pah-phase-pill ${phase.type === 'induction' ? 'phase-pill-induction' : phase.type === 'maintenance' ? 'phase-pill-maintenance' : 'phase-pill-escalation'}`}>
                        Phase {phase.phaseNumber}
                      </span>
                      <div className="pah-title-group">
                        <h4 className="pah-title">{phase.phaseName}</h4>
                        <span className="pah-duration">
                          Weeks {phase.startWeek}–{phase.endWeek} ({phase.durationWeeks} Weeks)
                        </span>
                      </div>
                    </div>

                    <div className="pah-right">
                      <div className="pah-compounds-preview">
                        {phaseCompounds.slice(0, 2).map((c, cIdx) => {
                          const doseInfo = resolveWeeklyCompoundDose(c, phase, idx, phase.startWeek, normalizedPhases.length);
                          return (
                            <span key={cIdx} className="pah-compound-chip">
                              <strong>{c.name}:</strong> {doseInfo.unitDose}
                            </span>
                          );
                        })}
                        {isStepUp && (
                          <span className="pah-step-up-badge">
                            ▲ Escalation
                          </span>
                        )}
                      </div>

                      <div className="pah-chevron">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Expanded Body: Only open for active phase */}
                  {isOpen && (
                    <div className="phase-accordion-content">
                      {/* Clinical Objective Banner */}
                      <div className="pac-objective-banner">
                        <Sparkles size={18} style={{ color: '#0d9488', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Clinical Target & Biological Objective
                          </div>
                          <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#334155', lineHeight: 1.45 }}>
                            {phase.instructions || phase.objective || 'Controlled therapeutic receptor acclimation and metabolic modulation.'}
                          </p>
                        </div>
                      </div>

                      {/* Focused Week Selector for this Phase */}
                      <div className="pac-weeks-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '0.3rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Weeks within Phase {phase.phaseNumber}:
                          </span>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488' }}>
                            Active Week {selectedWeek} · Scheduled Dosing
                          </span>
                        </div>

                        <div className="pac-weeks-chips-grid">
                          {Array.from({ length: phase.durationWeeks }, (_, i) => phase.startWeek + i).map(w => {
                            const isSelected = selectedWeek === w;
                            const isTaken = dosesTaken[`w_${w}`];
                            const primaryComp = phaseCompounds[0];
                            const primaryDose = primaryComp 
                              ? resolveWeeklyCompoundDose(primaryComp, phase, idx, w, normalizedPhases.length)
                              : null;

                            return (
                              <button
                                key={w}
                                type="button"
                                className={`pac-week-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedWeek(w)}
                              >
                                <div className="pwb-top">
                                  <span className="pwb-wk">WK</span>
                                  <span className="pwb-num">{w}</span>
                                </div>
                                {primaryDose && primaryDose.unitDose !== 'Active' && (
                                  <div className="pwb-dose">
                                    {primaryDose.unitDose}
                                  </div>
                                )}
                                {isTaken && (
                                  <CheckCircle2 size={12} style={{ color: '#10b981', marginTop: '2px' }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Prescribed Load Cards for Selected Week */}
                      <div className="pac-compounds-grid">
                        {activeWeekCompounds.map((ac, cIdx) => (
                          <div key={cIdx} className="pac-compound-card">
                            <div className="pcc-header">
                              <div>
                                <div className="pcc-name">{ac.name}</div>
                                <div className="pcc-freq">{ac.frequency}</div>
                                <div className="pcc-format">{ac.format}</div>
                              </div>
                              <div className="pcc-dose-block">
                                <div className="pcc-dose-val">{ac.unitDose}</div>
                                {ac.weeklyTotal && (
                                  <div className="pcc-weekly-total">{ac.weeklyTotal}</div>
                                )}
                              </div>
                            </div>

                            <div className="pcc-footer">
                              <span className="pcc-storage">{ac.storage}</span>
                              {ac.isStepUp && (
                                <span className="pcc-stepup">▲ Titration Step-Up</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Biomarker Checkpoint */}
                      {phase.biomarkerCheck && (
                        <div className="pac-biomarker-box">
                          <Droplets size={16} style={{ color: '#2563eb', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700 }}>
                            Clinical Monitoring: {phase.biomarkerCheck}
                          </span>
                        </div>
                      )}

                      {/* Patient Adherence Tracker */}
                      {viewMode === 'patient' && (
                        <div className="pac-adherence-footer">
                          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#334155' }}>
                            Patient Adherence (Week {selectedWeek}):
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleDose(`w_${selectedWeek}`)}
                            className={`pac-adherence-btn ${dosesTaken[`w_${selectedWeek}`] ? 'completed' : ''}`}
                          >
                            <CheckCircle2 size={14} />
                            {dosesTaken[`w_${selectedWeek}`] ? '✓ Dose Confirmed Taken' : 'Mark Week Dose Taken'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 3. MULTI-WEEK MATRIX (Gantt View) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Timeline Navigator Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Timeline Navigator
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0d9488' }}>
              Week {selectedWeek} of {totalWeeks} · Phase {currentPhase.phaseNumber || 1}: {currentPhase.phaseName} (Weeks {currentPhase.startWeek}–{currentPhase.endWeek})
            </span>
          </div>

          {/* Phase Jump Pills */}
          <div className="phase-jumper-pills">
            {normalizedPhases.map((phase, idx) => {
              const isCurrentPhase = selectedWeek >= phase.startWeek && selectedWeek <= phase.endWeek;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`phase-jumper-btn ${isCurrentPhase ? 'active' : ''}`}
                  onClick={() => setSelectedWeek(phase.startWeek)}
                >
                  <span>Phase {phase.phaseNumber}: {phase.phaseName}</span>
                  <span style={{ opacity: 0.75, fontSize: '0.68rem' }}>(W{phase.startWeek}–{phase.endWeek})</span>
                </button>
              );
            })}
          </div>

          {/* Micro-Dose Week Scroller */}
          <div className="mobile-week-scroller">
            {weeksArray.map(w => {
              const isSelected = selectedWeek === w;
              const isTaken = dosesTaken[`w_${w}`];
              const pForW = normalizedPhases.find(p => w >= p.startWeek && w <= p.endWeek) || normalizedPhases[0];
              const pIdx = normalizedPhases.indexOf(pForW);
              const primaryComp = distinctCompounds[0];
              const primaryDose = primaryComp ? resolveWeeklyCompoundDose(
                (pForW.compounds || []).find(c => c.name?.toUpperCase() === primaryComp.name?.toUpperCase()) || primaryComp,
                pForW, pIdx, w, normalizedPhases.length
              ) : null;

              return (
                <div
                  key={w}
                  className={`mobile-week-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedWeek(w)}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>WK</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800 }}>{w}</span>
                  {primaryDose && primaryDose.unitDose !== 'Active' && (
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: isSelected ? '#ffffff' : '#0d9488', marginTop: '1px' }}>
                      {primaryDose.unitDose}
                    </span>
                  )}
                  {isTaken && <CheckCircle2 size={10} style={{ color: '#10b981', marginTop: '1px' }} />}
                </div>
              );
            })}
          </div>

          {/* Weekly Payload Summary Strip */}
          <div className="weekly-payload-strip">
            <div className="payload-header">
              <span className="payload-title">
                <Sparkles size={14} style={{ color: '#0d9488' }} />
                Week {selectedWeek} Prescribed Load & Weekly Totals
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0d9488', background: '#ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                Phase {currentPhase.phaseNumber || 1}: {currentPhase.phaseName} (Weeks {currentPhase.startWeek}–{currentPhase.endWeek})
              </span>
            </div>
            
            <div className="payload-chips-container">
              {activeWeekCompounds.map((ac, idx) => (
                <div key={idx} className="payload-compound-chip">
                  <div className="payload-chip-left">
                    <span className="payload-chip-name">{ac.name}</span>
                    <span className="payload-chip-cadence">{ac.frequency}</span>
                  </div>
                  <div className="payload-chip-right">
                    <span className="payload-chip-dose">{ac.unitDose} / inj</span>
                    {ac.weeklyTotal && (
                      <span className="payload-chip-weekly-total">{ac.weeklyTotal}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Matrix Grid */}
          <div className="gantt-matrix-wrapper">
            <div className="gantt-matrix">
              {/* Phase Header Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `220px repeat(${totalWeeks}, minmax(56px, 1fr))`,
                background: '#f8fafc',
                borderBottom: '2px solid #cbd5e1'
              }}>
                <div style={{
                  padding: '0.75rem',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: '#475569',
                  position: 'sticky',
                  left: 0,
                  zIndex: 6,
                  background: '#f8fafc',
                  borderRight: '2px solid #cbd5e1'
                }}>
                  TREATMENT PHASES
                </div>
                {normalizedPhases.map((phase, idx) => (
                  <div
                    key={idx}
                    style={{
                      gridColumn: `span ${phase.durationWeeks || 4}`,
                      padding: '0.6rem 0.4rem',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      color: '#0f172a',
                      borderLeft: '1px solid #e2e8f0',
                      background: idx % 2 === 0 ? 'rgba(13, 148, 136, 0.06)' : 'rgba(14, 165, 233, 0.06)'
                    }}
                  >
                    Phase {phase.phaseNumber}: {phase.phaseName} ({phase.durationWeeks}w)
                  </div>
                ))}
              </div>

              {/* Week Numbers Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `220px repeat(${totalWeeks}, minmax(56px, 1fr))`,
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  padding: '0.5rem',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  color: '#64748b',
                  position: 'sticky',
                  left: 0,
                  zIndex: 6,
                  background: '#ffffff',
                  borderRight: '2px solid #cbd5e1'
                }}>
                  Compound & Format
                </div>
                {weeksArray.map(w => {
                  const isSelected = selectedWeek === w;
                  return (
                    <div
                      key={w}
                      onClick={() => setSelectedWeek(w)}
                      style={{
                        padding: '0.5rem 0',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? '#0f766e' : '#64748b',
                        backgroundColor: isSelected ? '#ccfbf1' : 'transparent',
                        borderLeft: isSelected ? '2px solid #0d9488' : '1px solid #f1f5f9',
                        borderRight: isSelected ? '2px solid #0d9488' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      W{w}
                    </div>
                  );
                })}
              </div>

              {/* Compound Rows */}
              {distinctCompounds.map((comp, cIdx) => (
                <div
                  key={cIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `220px repeat(${totalWeeks}, minmax(56px, 1fr))`,
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center'
                  }}
                >
                  <div className="gantt-compound-label">
                    <span>{comp.name}</span>
                    <span style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 700 }}>
                      {comp.format || 'Lyophilized Vial'}
                    </span>
                  </div>

                  {weeksArray.map(w => {
                    const phaseForWeek = normalizedPhases.find(p => w >= p.startWeek && w <= p.endWeek) || normalizedPhases[0];
                    const phaseIndex = normalizedPhases.indexOf(phaseForWeek);
                    const hasCompound = (phaseForWeek.compounds || []).some(c => c.name?.toUpperCase() === comp.name?.toUpperCase());
                    const compoundData = (phaseForWeek.compounds || []).find(c => c.name?.toUpperCase() === comp.name?.toUpperCase()) || comp;
                    const doseInfo = resolveWeeklyCompoundDose(compoundData, phaseForWeek, phaseIndex, w, normalizedPhases.length);
                    const isSelected = selectedWeek === w;

                    return (
                      <div
                        key={w}
                        onClick={() => setSelectedWeek(w)}
                        style={{
                          padding: '3px 2px',
                          borderLeft: isSelected ? '2px solid #0d9488' : '1px solid #f8fafc',
                          borderRight: isSelected ? '2px solid #0d9488' : 'none',
                          backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        {hasCompound && (
                          <div 
                            className={`gantt-bar ${phaseForWeek.colorClass || 'gantt-bar-induction'} ${isSelected ? 'selected-week-bar' : ''}`} 
                            style={{ width: '100%' }}
                            title={`Week ${w} · ${comp.name}: ${doseInfo.unitDose} (${doseInfo.weeklyTotal || doseInfo.shortCadence})`}
                          >
                            {doseInfo.isStepUp && w === phaseForWeek.startWeek && (
                              <span className="gantt-step-up-badge">▲ Titration</span>
                            )}
                            <span className="gantt-dose-val">{doseInfo.unitDose}</span>
                            <span className="gantt-dose-cadence">{doseInfo.shortCadence}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Safety Sentinel Banner */}
      <div style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}>
        <ShieldAlert size={18} style={{ color: '#d97706', flexShrink: 0 }} />
        <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600, lineHeight: 1.3 }}>
          <strong>Safety Sentinel:</strong> All GLP-1 and GHRH titrations must strictly adhere to the 4-week adaptation window before increasing dosages. Maintain cold chain (2°C – 8°C) for all reconstituted vials and opened pen cartridges.
        </div>
      </div>
    </div>
  );
}
