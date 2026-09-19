"use client";

import React, { useState, useMemo } from 'react';
import { 
  Activity, Calendar, Clock, ShieldAlert, Sparkles, CheckCircle2, 
  ChevronRight, Stethoscope, User, Droplets, Snowflake, AlertCircle 
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

  return (
    <div className="clinical-gantt-container">
      {/* 1. Header & Dual Mode Switcher */}
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

      {/* 2. Timeline Week Selector & Phase Jumpers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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

        {/* Mobile Week Scroller with Micro-Dose Preview */}
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
      </div>

      {/* ── Weekly Peptide Payload Summary Strip ── */}
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

      {/* 3. Widescreen Gantt Matrix (Laptop View) */}
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

          {/* Compound Rows with Rich Weekly Amounts */}
          {distinctCompounds.map((comp, compIdx) => (
            <div
              key={compIdx}
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

      {/* 4. Active Week Detail & Patient Guidance Card */}
      <div className="week-detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
              Phase {currentPhase.phaseNumber}: {currentPhase.phaseName || 'Therapeutic Titration'}
            </div>
            <h4 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Week {selectedWeek} Administration Instructions
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
              Duration: {currentPhase.durationWeeks || 4} Weeks (Weeks {currentPhase.startWeek}–{currentPhase.endWeek})
            </span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
          {currentPhase.instructions || currentPhase.objective || 'Administer according to verified clinical titration schedule.'}
        </p>

        {/* Compound Dosage Grid for this week */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem'
        }}>
          {activeWeekCompounds.map((c, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.90rem', color: '#0f172a' }}>{c.name}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {c.frequency}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700, marginTop: '2px' }}>
                  {c.format}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d9488', letterSpacing: '-0.02em' }}>
                  {c.unitDose}
                </div>
                {c.weeklyTotal && (
                  <div style={{ fontSize: '0.70rem', color: '#0f172a', fontWeight: 700, background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                    {c.weeklyTotal}
                  </div>
                )}
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                  {c.storage}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Biomarker checkpoint if present */}
        {currentPhase.biomarkerCheck && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <Droplets size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
            <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700 }}>
              Required Lab Biomarker: {currentPhase.biomarkerCheck}
            </div>
          </div>
        )}

        {/* Patient Adherence Checkbox */}
        {viewMode === 'patient' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '0.75rem'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
              Patient Adherence Tracking (Week {selectedWeek}):
            </span>
            <button
              type="button"
              onClick={() => handleToggleDose(`w_${selectedWeek}`)}
              style={{
                padding: '0.5rem 1.15rem',
                backgroundColor: dosesTaken[`w_${selectedWeek}`] ? '#10b981' : '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={15} />
              {dosesTaken[`w_${selectedWeek}`] ? '✓ Week Dose Completed' : 'Mark Week Dose Taken'}
            </button>
          </div>
        )}
      </div>

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
