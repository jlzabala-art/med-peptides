"use client";

import React, { useState, useMemo } from 'react';
import { 
  Activity, Calendar, Clock, ShieldAlert, Sparkles, CheckCircle2, 
  ChevronRight, Stethoscope, User, Droplets, Snowflake, AlertCircle 
} from 'lucide-react';
import '../../styles/clinicalGantt.css';
import StatusBadge from '../ui/StatusBadge';
import { WarehouseOriginBadge, ColdChainBadge } from '../ui/WarehouseOriginBadge';

/**
 * ClinicalGanttTimeline
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Interactive Clinical Gantt Diagram & Phased Timeline.
 * Designed for Doctor calibration and Patient treatment journey tracking.
 * Works seamlessly on Laptop widescreen and Mobile touchscreens.
 */
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
      startWeek: 1,
      endWeek: 4,
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
      startWeek: 5,
      endWeek: 8,
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
      startWeek: 9,
      endWeek: 12,
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
      startWeek: 13,
      endWeek: 14,
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

  const phases = (Array.isArray(protocol?.phases) && protocol.phases.length > 0)
    ? protocol.phases
    : defaultPhases;

  const totalWeeks = phases.reduce((acc, p) => acc + (Number(p.durationWeeks) || 0), 0);
  const weeksArray = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  // Active phase for the selected week
  const currentPhase = useMemo(() => {
    let weekCount = 0;
    for (const phase of phases) {
      const start = weekCount + 1;
      const end = weekCount + Number(phase.durationWeeks || 4);
      if (selectedWeek >= start && selectedWeek <= end) {
        return { ...phase, startWeek: start, endWeek: end };
      }
      weekCount = end;
    }
    return phases[0];
  }, [phases, selectedWeek]);

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
              {protocol?.name || 'Metabolic & Longevity Protocol (14-Week Pathway)'}
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

      {/* 2. Mobile Quick Week Scroller (< 768px touch targets) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            📅 Timeline Navigator (Select Week):
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488' }}>
            Week {selectedWeek} of {totalWeeks} ({currentPhase.phaseName})
          </span>
        </div>

        <div className="mobile-week-scroller">
          {weeksArray.map(w => {
            const isSelected = selectedWeek === w;
            const isTaken = dosesTaken[`w_${w}`];
            return (
              <div
                key={w}
                className={`mobile-week-chip ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedWeek(w)}
              >
                <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>WK</span>
                <span style={{ fontSize: '1rem', fontWeight: 800 }}>{w}</span>
                {isTaken && <CheckCircle2 size={10} style={{ color: '#10b981', marginTop: '1px' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Widescreen Gantt Matrix (Laptop View) */}
      <div className="gantt-matrix-wrapper">
        <div className="gantt-matrix">
          {/* Phase Header Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${totalWeeks}, 1fr)`,
            background: '#f8fafc',
            borderBottom: '2px solid #cbd5e1'
          }}>
            <div style={{ padding: '0.75rem', fontWeight: 800, fontSize: '0.75rem', color: '#475569' }}>
              TREATMENT PHASES
            </div>
            {phases.map((phase, idx) => (
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
                Phase {phase.phaseNumber || (idx + 1)}: {phase.phaseName} ({phase.durationWeeks}w)
              </div>
            ))}
          </div>

          {/* Week Numbers Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `200px repeat(${totalWeeks}, 1fr)`,
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.7rem', color: '#64748b' }}>
              Compound & Format
            </div>
            {weeksArray.map(w => (
              <div
                key={w}
                onClick={() => setSelectedWeek(w)}
                style={{
                  padding: '0.5rem 0',
                  fontSize: '0.75rem',
                  fontWeight: selectedWeek === w ? 800 : 600,
                  color: selectedWeek === w ? '#0d9488' : '#64748b',
                  backgroundColor: selectedWeek === w ? '#f0fdfa' : 'transparent',
                  borderLeft: '1px solid #f1f5f9',
                  cursor: 'pointer'
                }}
              >
                W{w}
              </div>
            ))}
          </div>

          {/* Compound Rows with Gantt Bars */}
          {phases.flatMap(p => p.compounds || []).filter((v, i, a) => a.findIndex(t => t.name === v.name) === i).map((comp, compIdx) => (
            <div
              key={compIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: `200px repeat(${totalWeeks}, 1fr)`,
                borderBottom: '1px solid #f1f5f9',
                alignItems: 'center'
              }}
            >
              <div className="gantt-compound-label">
                <span>{comp.name}</span>
                <span style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 700 }}>
                  {comp.format}
                </span>
              </div>

              {weeksArray.map(w => {
                const phaseForWeek = phases.find((p, pIdx) => {
                  const start = phases.slice(0, pIdx).reduce((acc, curr) => acc + (curr.durationWeeks || 4), 0) + 1;
                  const end = start + (p.durationWeeks || 4) - 1;
                  return w >= start && w <= end;
                }) || phases[0];

                const hasCompound = (phaseForWeek.compounds || []).some(c => c.name === comp.name);
                const compoundData = (phaseForWeek.compounds || []).find(c => c.name === comp.name);

                return (
                  <div
                    key={w}
                    onClick={() => setSelectedWeek(w)}
                    style={{
                      padding: '4px',
                      borderLeft: '1px solid #f8fafc',
                      backgroundColor: selectedWeek === w ? 'rgba(13, 148, 136, 0.05)' : 'transparent',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {hasCompound && (
                      <div className={`gantt-bar ${phaseForWeek.colorClass || 'gantt-bar-induction'}`} style={{ width: '100%', minHeight: '32px' }}>
                        <span>{compoundData?.dosage || 'Active'}</span>
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
              Phase {currentPhase.phaseNumber}: {currentPhase.phaseName}
            </div>
            <h4 style={{ margin: '2px 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
              Week {selectedWeek} Administration Instructions
            </h4>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', backgroundColor: '#e2e8f0', padding: '3px 8px', borderRadius: '6px' }}>
              Duration: {currentPhase.durationWeeks} Weeks (Weeks {currentPhase.startWeek}–{currentPhase.endWeek})
            </span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
          {currentPhase.instructions}
        </p>

        {/* Compound Dosage Grid for this week */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.75rem'
        }}>
          {(currentPhase.compounds || []).map((c, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>{c.name}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {c.frequency} • {c.route}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700, marginTop: '2px' }}>
                  {c.format}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d9488' }}>
                  {c.dosage}
                </div>
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
