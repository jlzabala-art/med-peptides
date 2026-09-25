"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Activity, Calendar, Clock, ShieldAlert, Sparkles, CheckCircle2, 
  ChevronRight, ChevronDown, ChevronUp, Stethoscope, User, Droplets, Snowflake, AlertCircle,
  Layers, Table, Printer, FileText, ShieldCheck, Copy, Check
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

  if (compound.isCalibrated && compound.dosage) {
    const isBpc = (compound.name || '').toUpperCase().includes('BPC-157');
    const isTb = (compound.name || '').toUpperCase().includes('TB-500');
    const doseNum = parseFloat(compound.dosage);
    let weeklyTotal = '';
    if (isBpc && !isNaN(doseNum)) {
      weeklyTotal = `${((doseNum * 7) / 1000).toFixed(2)} mg/wk (${(doseNum * 7).toLocaleString()} mcg)`;
    } else if (isTb && !isNaN(doseNum)) {
      weeklyTotal = `${doseNum} mg/wk`;
    }
    return {
      unitDose: compound.dosage,
      shortCadence: isBpc ? 'Daily' : 'Weekly',
      timesPerWeek: isBpc ? 7 : 2,
      weeklyTotal,
      isStepUp: false,
      frequency: compound.frequency || (isBpc ? 'Daily (morning & evening)' : 'Weekly'),
      route: compound.route || 'Subcutaneous',
      storage: compound.storage || '❄️ 2°C – 8°C Refrigerator',
      format: compound.format || '🧪 Sterile Lyophilized Vial',
      isCalibrated: true
    };
  }

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
  calibratedDoses = null,
  onCalibrationUpdate = null
}) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [viewMode, setViewMode] = useState('doctor'); // 'doctor' | 'patient'
  const [activeLayout, setActiveLayout] = useState('accordions'); // 'accordions' | 'gantt'
  const [openPhaseIdx, setOpenPhaseIdx] = useState(0);

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

  // Adapt phases dynamically when patient-specific calibration is active
  const effectivePhases = useMemo(() => {
    if (!calibratedDoses) return rawPhases;

    return rawPhases.map((p, pIdx) => {
      // Clinically distribute total cycle weeks across any number of phases
      let phaseDuration = Number(p.durationWeeks) || 4;
      if (calibratedDoses.cycleWeeks) {
        const totalTarget = Math.max(6, Math.min(16, Number(calibratedDoses.cycleWeeks)));
        const numPhases = rawPhases.length;
        
        if (numPhases === 1) {
          phaseDuration = totalTarget;
        } else if (numPhases === 2) {
          phaseDuration = pIdx === 0 
            ? Math.ceil(totalTarget / 2) 
            : Math.floor(totalTarget / 2);
        } else if (numPhases === 3) {
          // Clinical distribution: Phase 1 (Priming ~25%), Phase 2 (Core Stimulation ~50%), Phase 3 (Maintenance ~25%)
          if (totalTarget <= 6) {
            phaseDuration = 2; // 2, 2, 2
          } else if (totalTarget === 7) {
            phaseDuration = pIdx === 1 ? 3 : 2; // 2, 3, 2
          } else if (totalTarget === 8) {
            phaseDuration = pIdx === 1 ? 4 : 2; // 2, 4, 2
          } else if (totalTarget === 9) {
            phaseDuration = pIdx === 0 ? 2 : (pIdx === 1 ? 4 : 3); // 2, 4, 3
          } else if (totalTarget === 10) {
            phaseDuration = pIdx === 1 ? 4 : 3; // 3, 4, 3
          } else if (totalTarget === 11) {
            phaseDuration = pIdx === 1 ? 5 : 3; // 3, 5, 3
          } else if (totalTarget === 12) {
            phaseDuration = 4; // 4, 4, 4
          } else if (totalTarget === 13) {
            phaseDuration = pIdx === 1 ? 5 : 4; // 4, 5, 4
          } else if (totalTarget === 14) {
            phaseDuration = pIdx === 1 ? 6 : 4; // 4, 6, 4
          } else if (totalTarget === 15) {
            phaseDuration = pIdx === 1 ? 7 : 4; // 4, 7, 4
          } else {
            // 16 weeks
            phaseDuration = pIdx === 1 ? 8 : 4; // 4, 8, 4
          }
        } else {
          // General N-phases proportional distribution
          const weight = pIdx === 0 || pIdx === numPhases - 1 ? 1 : 1.5;
          const totalWeight = (numPhases - 2) * 1.5 + 2;
          phaseDuration = Math.max(1, Math.round((totalTarget * weight) / totalWeight));
        }
      }

      // Update compounds with calibrated dosages
      const updatedCompounds = (p.compounds || []).map(c => {
        const cName = (c.name || c.product_name || c.product_slug || '').toUpperCase();
        if (cName.includes('BPC-157') && calibratedDoses.bpcDailyMcg) {
          const doseStr = `${calibratedDoses.bpcDailyMcg} mcg`;
          return {
            ...c,
            dosage: doseStr,
            dose: `${doseStr} Daily`,
            calibratedFrom: `${calibratedDoses.tissueName || 'Tissue'} (${calibratedDoses.multiplier || 5} mcg/kg/d)`,
            isCalibrated: true
          };
        }
        if (cName.includes('TB-500') && calibratedDoses.tb500WeeklyMg) {
          const weeklyTb = pIdx === 0 ? calibratedDoses.tb500WeeklyMg : Math.min(2.5, calibratedDoses.tb500WeeklyMg);
          const doseStr = `${weeklyTb} mg`;
          return {
            ...c,
            dosage: doseStr,
            dose: `${doseStr} / week`,
            calibratedFrom: calibratedDoses.cadenceNote || 'Systemic Titration',
            isCalibrated: true
          };
        }
        if (cName.includes('IPAMORELIN') && calibratedDoses.ipamorelinDailyMcg) {
          const doseStr = `${calibratedDoses.ipamorelinDailyMcg} mcg`;
          return {
            ...c,
            dosage: doseStr,
            dose: `${doseStr} Daily`,
            calibratedFrom: 'Physician Titration',
            isCalibrated: true
          };
        }
        if (cName.includes('CJC') && calibratedDoses.cjcDailyMcg) {
          const doseStr = `${calibratedDoses.cjcDailyMcg} mcg`;
          return {
            ...c,
            dosage: doseStr,
            dose: `${doseStr} Daily`,
            calibratedFrom: 'Physician Titration',
            isCalibrated: true
          };
        }
        if (cName.includes('GHK') && calibratedDoses.ghkDailyMg) {
          const doseStr = `${calibratedDoses.ghkDailyMg} mg`;
          return {
            ...c,
            dosage: doseStr,
            dose: `${doseStr} Daily`,
            calibratedFrom: 'Physician Titration',
            isCalibrated: true
          };
        }
        return c;
      });

      return {
        ...p,
        durationWeeks: phaseDuration,
        compounds: updatedCompounds
      };
    });
  }, [rawPhases, calibratedDoses]);

  // Normalized phases with accurate start/end week bounds
  const normalizedPhases = useMemo(() => {
    let currentStart = 1;
    const colorClasses = ['gantt-bar-induction', 'gantt-bar-optimization', 'gantt-bar-maintenance', 'gantt-bar-washout'];
    return effectivePhases.map((p, idx) => {
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
  }, [effectivePhases]);

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

  const [copiedTakeaway, setCopiedTakeaway] = useState(false);

  const handleCopyPatientTakeaway = async (phase, week) => {
    const pName = protocol?.name || protocol?.title || 'Clinical Peptide Protocol';
    const phaseName = phase?.phaseName || phase?.name || 'Active Clinical Phase';
    const phaseGoal = phase?.focus || protocol?.goal || 'Metabolic Optimization & Cellular Restoration';
    const phaseWeekRange = phase ? `Weeks ${phase.startWeek}–${phase.endWeek}` : `Week ${week}`;

    // Map ALL compounds active in this week
    const compoundBlocks = (activeWeekCompounds && activeWeekCompounds.length > 0)
      ? activeWeekCompounds.map((c, i) => {
          return `  [Compound ${i + 1}]: ${c.name}
  • Prescribed Unit Dose:   ${c.unitDose || 'Standard Therapeutic Calibration'} per injection
  • Administration Cadence: ${c.frequency || 'Follow physician prescription schedule'}
  • Target Weekly Exposure: ${c.weeklyTotal || 'As clinically titrated'}
  • Injection Route:        Subcutaneous (SubQ) — rotate injection sites (periumbilical / outer thigh)
  • Pharmaceutical Format:  ${c.format || 'Sterile Lyophilized Peptide Vial (Reconstitute with BAC water)'}`;
        }).join('\n\n')
      : '  • No active compounds recorded for this week interval.';

    const text = `================================================================================
PATIENT CLINICAL ADMINISTRATION SCHEDULE & PRESCRIBING REGIMEN
Atlas Health SSOT Clinical Governance Framework · ISO 15189 Standard
================================================================================

1. PROTOCOL IDENTITY & TREATMENT CONTEXT
--------------------------------------------------------------------------------
• Protocol Name:          ${pName}
• Current Clinical Phase:  ${phaseName} (${phaseWeekRange})
• Active Treatment Week:  Week ${week}
• Therapeutic Objective:  ${phaseGoal}

2. PRESCRIBED COMPOUND DOSAGE & CADENCE (ALL ACTIVE COMPOUNDS)
--------------------------------------------------------------------------------
${compoundBlocks}

3. ASEPTIC RECONSTITUTION & PREPARATION DIRECTIVES
--------------------------------------------------------------------------------
• Disinfection:   Swab rubber septum with 70% isopropyl alcohol swab and air-dry 15s.
• Fluid Transfer: Dispense bacteriostatic sterile water slowly along inner glass vial wall.
• Dissolution:    Swirl gently in slow circular motion until fully clear. NEVER shake vigorously.
• Syringe Check:  Verify calibrated unit volume on U-100 insulin syringe prior to subcutaneous injection.

4. BIO-STABILITY & COLD-CHAIN INTEGRITY DIRECTIVES
--------------------------------------------------------------------------------
• Storage Regimen:    Refrigerate continuously at 2°C – 8°C (36°F – 46°F).
• Critical Safeguard: Do NOT freeze reconstituted peptide solutions under any circumstance.
• Expiration Horizon: Maximum 28-day microbiological stability post-first septum puncture.
• Light Sensitivity:  Shield vials from prolonged direct sunlight or elevated ambient heat.

5. PHARMACOVIGILANCE & ESCALATION SENTINEL
--------------------------------------------------------------------------------
• Expected Response: Mild transient injection-site tingling or minimal erythema (<1 inch).
• Immediate Physician Escalation: Discontinue use and contact your prescribing clinician
  if you experience systemic urticaria, dyspnea, acute tachycardia, or persistent abdominal pain.

================================================================================
PRESCRIBING MEDICAL DIRECTOR ATTESTATION:
Physician Name: _________________________________  License #: __________________
Date Issued:    ${new Date().toISOString().split('T')[0]}                       Review Date: __________________
================================================================================`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedTakeaway(true);
      setTimeout(() => setCopiedTakeaway(false), 2000);
    } catch (err) {
      console.error(err);
    }
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

        <div className="gantt-toolbar-toggles" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Layout View Switcher: Accordions (Default) vs Gantt Matrix */}
          <div className="gantt-mode-toggle">
            <button
              type="button"
              className={`gantt-mode-btn ${activeLayout === 'accordions' ? 'active' : ''}`}
              onClick={() => setActiveLayout('accordions')}
              title="Phased Accordions View (Recommended)"
            >
              <Layers size={14} />
              <span className="gantt-btn-text">Phases<span className="gantt-btn-sub"> View</span></span>
            </button>
            <button
              type="button"
              className={`gantt-mode-btn ${activeLayout === 'gantt' ? 'active' : ''}`}
              onClick={() => setActiveLayout('gantt')}
              title="Full Macro Gantt Matrix View"
            >
              <Table size={14} />
              <span className="gantt-btn-text">Gantt<span className="gantt-btn-sub"> Matrix</span></span>
            </button>
          </div>

          {/* Perspective Switcher */}
          <div className="gantt-mode-toggle">
            <button
              type="button"
              className={`gantt-mode-btn ${viewMode === 'doctor' ? 'active' : ''}`}
              onClick={() => setViewMode('doctor')}
              title="Doctor Clinical Calibration"
            >
              <Stethoscope size={14} />
              <span className="gantt-btn-text">Doctor<span className="gantt-btn-sub"> Calibration</span></span>
            </button>
            <button
              type="button"
              className={`gantt-mode-btn ${viewMode === 'patient' ? 'active' : ''}`}
              onClick={() => setViewMode('patient')}
              title="Patient Takeaway & Administration Guide"
            >
              <FileText size={14} />
              <span className="gantt-btn-text">Patient<span className="gantt-btn-sub"> Takeaway</span></span>
            </button>
          </div>
        </div>
      </div>

      {/* 1B. Google Cloud Standard Live Calibration Banner */}
      {calibratedDoses && (
        <div className="gcp-calibration-banner" role="region" aria-label="Calibrated Dosage Parameters" style={{ marginBottom: '1rem' }}>
          <div className="gcp-calib-indicator">
            <span className="gcp-pulse-dot" />
            <span className="gcp-calib-title">
              Patient Calibrated Protocol Active
            </span>
          </div>
          <div className="gcp-calib-chips">
            {calibratedDoses.weightKg && (
              <span className="gcp-chip">
                Weight: <strong>{calibratedDoses.weightKg} kg</strong>
              </span>
            )}
            {calibratedDoses.tissueName && (
              <span className="gcp-chip">
                Target: <strong>{calibratedDoses.tissueName}</strong>
              </span>
            )}
            {calibratedDoses.chronicityLabel && (
              <span className="gcp-chip">
                Phase: <strong>{calibratedDoses.chronicityLabel}</strong>
              </span>
            )}
            {hasIpamorelin && (
              <span className="gcp-chip highlight">
                Ipamorelin: <strong>{calibratedDoses.ipamorelinDailyMcg || 200} mcg/day</strong>
              </span>
            )}
            {hasCjc && (
              <span className="gcp-chip highlight">
                CJC-1295: <strong>{calibratedDoses.cjcDailyMcg || 100} mcg/day</strong>
              </span>
            )}
            {hasGhk && (
              <span className="gcp-chip highlight">
                GHK-Cu: <strong>{calibratedDoses.ghkDailyMg || 2.0} mg/day</strong>
              </span>
            )}
            {(hasBpc || (!hasIpamorelin && !hasGhk && !hasCjc)) && (
              <span className="gcp-chip highlight">
                BPC-157: <strong>{calibratedDoses.bpcDailyMcg || 500} mcg/day</strong>
              </span>
            )}
            {hasTb && (
              <span className="gcp-chip highlight">
                TB-500: <strong>{calibratedDoses.tb500WeeklyMg || 2.5} mg/wk</strong>
              </span>
            )}
            <span className="gcp-chip">
              Duration: <strong>{calibratedDoses.cycleWeeks || totalWeeks || 8} Weeks</strong>
            </span>
          </div>
          {onCalibrationUpdate && (
            <button
              type="button"
              className="gcp-reset-btn"
              onClick={() => onCalibrationUpdate(null)}
              title="Reset to default template dosing"
            >
              Reset to Standard
            </button>
          )}
        </div>
      )}

      {/* 1C. Google Cloud Doctor Calibration Console (Active in Doctor View) */}
      {viewMode === 'doctor' && (
        <div className="gcp-doctor-console" role="region" aria-label="Physician Calibration Console" style={{ marginBottom: '1rem' }}>
          <div className="gcp-doc-header">
            <div className="gcp-doc-title">
              <Stethoscope size={16} style={{ color: '#0d9488' }} />
              <span>Physician Dosing Titration & Calibration Console</span>
            </div>
            <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
              Fine-tune daily & systemic kinetics for individual patient tolerance (Safety bounds: 6–16 Weeks)
            </span>
          </div>

          <div className="gcp-doc-grid">
            {/* Primary Compound 1 Stepper */}
            {hasIpamorelin ? (
              <div className="gcp-doc-card">
                <span className="gcp-doc-card-label">Ipamorelin Daily Titration</span>
                <div className="gcp-doc-card-controls">
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.ipamorelinDailyMcg || 200) <= 100}
                    onClick={() => {
                      const current = calibratedDoses?.ipamorelinDailyMcg || 200;
                      const next = Math.max(100, current - 25);
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { cycleWeeks: 8 }),
                          ipamorelinDailyMcg: next
                        }));
                      }
                    }}
                    title="Decrease 25 mcg"
                  >
                    -
                  </button>
                  <span className="gcp-doc-val">
                    {calibratedDoses?.ipamorelinDailyMcg || 200} <small style={{ fontSize: '0.72rem', color: '#64748b' }}>mcg/day</small>
                  </span>
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.ipamorelinDailyMcg || 200) >= 400}
                    onClick={() => {
                      const current = calibratedDoses?.ipamorelinDailyMcg || 200;
                      const next = Math.min(400, current + 25);
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { cycleWeeks: 8 }),
                          ipamorelinDailyMcg: next
                        }));
                      }
                    }}
                    title="Increase 25 mcg"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : hasGhk ? (
              <div className="gcp-doc-card">
                <span className="gcp-doc-card-label">GHK-Cu Daily Dose</span>
                <div className="gcp-doc-card-controls">
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.ghkDailyMg || 2.0) <= 1.0}
                    onClick={() => {
                      const current = calibratedDoses?.ghkDailyMg || 2.0;
                      const next = Math.max(1.0, Number((current - 0.25).toFixed(2)));
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { cycleWeeks: 8 }),
                          ghkDailyMg: next
                        }));
                      }
                    }}
                    title="Decrease 0.25 mg"
                  >
                    -
                  </button>
                  <span className="gcp-doc-val">
                    {calibratedDoses?.ghkDailyMg || 2.0} <small style={{ fontSize: '0.72rem', color: '#64748b' }}>mg/day</small>
                  </span>
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.ghkDailyMg || 2.0) >= 3.0}
                    onClick={() => {
                      const current = calibratedDoses?.ghkDailyMg || 2.0;
                      const next = Math.min(3.0, Number((current + 0.25).toFixed(2)));
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { cycleWeeks: 8 }),
                          ghkDailyMg: next
                        }));
                      }
                    }}
                    title="Increase 0.25 mg"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="gcp-doc-card">
                <span className="gcp-doc-card-label">BPC-157 Daily Titration</span>
                <div className="gcp-doc-card-controls">
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.bpcDailyMcg || 500) <= 250}
                    onClick={() => {
                      const current = calibratedDoses?.bpcDailyMcg || 500;
                      const next = Math.max(250, current - 50);
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { weightKg: 75, tb500WeeklyMg: 2.5, cycleWeeks: 8 }),
                          bpcDailyMcg: next
                        }));
                      }
                    }}
                    title="Decrease 50 mcg"
                  >
                    -
                  </button>
                  <span className="gcp-doc-val">
                    {calibratedDoses?.bpcDailyMcg || 500} <small style={{ fontSize: '0.72rem', color: '#64748b' }}>mcg/day</small>
                  </span>
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.bpcDailyMcg || 500) >= 1000}
                    onClick={() => {
                      const current = calibratedDoses?.bpcDailyMcg || 500;
                      const next = Math.min(1000, current + 50);
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { weightKg: 75, tb500WeeklyMg: 2.5, cycleWeeks: 8 }),
                          bpcDailyMcg: next
                        }));
                      }
                    }}
                    title="Increase 50 mcg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Primary Compound 2 Stepper */}
            {hasCjc ? (
              <div className="gcp-doc-card">
                <span className="gcp-doc-card-label">CJC-1295 Daily Cadence</span>
                <div className="gcp-doc-card-controls">
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.cjcDailyMcg || 100) <= 50}
                    onClick={() => {
                      const current = calibratedDoses?.cjcDailyMcg || 100;
                      const next = Math.max(50, current - 25);
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { cycleWeeks: 8 }),
                          cjcDailyMcg: next
                        }));
                      }
                    }}
                    title="Decrease 25 mcg"
                  >
                    -
                  </button>
                  <span className="gcp-doc-val">
                    {calibratedDoses?.cjcDailyMcg || 100} <small style={{ fontSize: '0.72rem', color: '#64748b' }}>mcg/day</small>
                  </span>
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.cjcDailyMcg || 100) >= 300}
                    onClick={() => {
                      const current = calibratedDoses?.cjcDailyMcg || 100;
                      const next = Math.min(300, current + 25);
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { cycleWeeks: 8 }),
                          cjcDailyMcg: next
                        }));
                      }
                    }}
                    title="Increase 25 mcg"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : (
              <div className="gcp-doc-card">
                <span className="gcp-doc-card-label">TB-500 Systemic Cadence</span>
                <div className="gcp-doc-card-controls">
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.tb500WeeklyMg || 2.5) <= 1.0}
                    onClick={() => {
                      const current = calibratedDoses?.tb500WeeklyMg || 2.5;
                      const next = Math.max(1.0, Number((current - 0.5).toFixed(1)));
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { weightKg: 75, bpcDailyMcg: 500, cycleWeeks: 8 }),
                          tb500WeeklyMg: next
                        }));
                      }
                    }}
                    title="Decrease 0.5 mg/wk"
                  >
                    -
                  </button>
                  <span className="gcp-doc-val">
                    {calibratedDoses?.tb500WeeklyMg || 2.5} <small style={{ fontSize: '0.72rem', color: '#64748b' }}>mg/wk</small>
                  </span>
                  <button
                    type="button"
                    className="gcp-doc-step-btn"
                    disabled={(calibratedDoses?.tb500WeeklyMg || 2.5) >= 5.0}
                    onClick={() => {
                      const current = calibratedDoses?.tb500WeeklyMg || 2.5;
                      const next = Math.min(5.0, Number((current + 0.5).toFixed(1)));
                      if (onCalibrationUpdate) {
                        onCalibrationUpdate(prev => ({
                          ...(prev || { weightKg: 75, bpcDailyMcg: 500, cycleWeeks: 8 }),
                          tb500WeeklyMg: next
                        }));
                      }
                    }}
                    title="Increase 0.5 mg/wk"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Total Protocol Duration Weeks (Guardrails: 6 to 16 Weeks) */}
            <div className="gcp-doc-card">
              <span className="gcp-doc-card-label">Protocol Cycle Duration</span>
              <div className="gcp-doc-card-controls">
                <button
                  type="button"
                  className="gcp-doc-step-btn"
                  disabled={(calibratedDoses?.cycleWeeks || totalWeeks || 8) <= 6}
                  onClick={() => {
                    const current = calibratedDoses?.cycleWeeks || totalWeeks || 8;
                    const next = Math.max(6, current - 2);
                    if (onCalibrationUpdate) {
                      onCalibrationUpdate(prev => ({
                        ...(prev || {}),
                        cycleWeeks: next
                      }));
                    }
                  }}
                  title="Decrease 2 weeks (Min: 6 wks)"
                >
                  -
                </button>
                <span className="gcp-doc-val">
                  {calibratedDoses?.cycleWeeks || totalWeeks || 8} <small style={{ fontSize: '0.72rem', color: '#64748b' }}>Weeks</small>
                </span>
                <button
                  type="button"
                  className="gcp-doc-step-btn"
                  disabled={(calibratedDoses?.cycleWeeks || totalWeeks || 8) >= 16}
                  onClick={() => {
                    const current = calibratedDoses?.cycleWeeks || totalWeeks || 8;
                    const next = Math.min(16, current + 2);
                    if (onCalibrationUpdate) {
                      onCalibrationUpdate(prev => ({
                        ...(prev || {}),
                        cycleWeeks: next
                      }));
                    }
                  }}
                  title="Increase 2 weeks (Max: 16 wks)"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACCORDION PHASE VIEW (Default & Clean Architecture) */}
      {activeLayout === 'accordions' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Mobile GCP Phase Selector (Visible on mobile < 640px) */}
          <div className="gantt-mobile-phase-bar">
            <div className="gantt-mobile-phase-card">
              <div className="gantt-mobile-phase-meta">
                <span className="gantt-mobile-phase-badge">
                  Phase {normalizedPhases[openPhaseIdx]?.phaseNumber || openPhaseIdx + 1} of {normalizedPhases.length}
                </span>
                <span className="gantt-mobile-phase-weeks">
                  Weeks {normalizedPhases[openPhaseIdx]?.startWeek}–{normalizedPhases[openPhaseIdx]?.endWeek}
                </span>
              </div>
              <select
                className="gantt-mobile-phase-select"
                value={openPhaseIdx}
                onChange={(e) => {
                  const newIdx = parseInt(e.target.value, 10);
                  setOpenPhaseIdx(newIdx);
                  setSelectedWeek(normalizedPhases[newIdx]?.startWeek || 1);
                }}
                aria-label="Select Clinical Phase"
              >
                {normalizedPhases.map((ph, idx) => (
                  <option key={idx} value={idx}>
                    Phase {ph.phaseNumber}: {ph.phaseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Step Pills Strip without text truncation */}
            <div className="gantt-mobile-pills-strip">
              {normalizedPhases.map((ph, idx) => {
                const isOpen = openPhaseIdx === idx;
                const isPast = openPhaseIdx > idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`gantt-mobile-pill-btn ${isOpen ? 'is-active' : isPast ? 'is-completed' : ''}`}
                    onClick={() => {
                      setOpenPhaseIdx(idx);
                      setSelectedWeek(ph.startWeek);
                    }}
                  >
                    <span className="gantt-mobile-pill-num">{isPast ? '✓' : idx + 1}</span>
                    <span className="gantt-mobile-pill-text">W{ph.startWeek}–{ph.endWeek}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Macro Progress Stepper Horizon (Visible on desktop >= 641px) */}
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

                      {/* Patient Handout Guide & Takeaway Panel */}
                      {viewMode === 'patient' && (
                        <div className="pac-patient-handout-card" style={{
                          marginTop: '1.25rem',
                          background: '#f0fdfa',
                          border: '1px solid #ccfbf1',
                          borderTop: '3px solid #0d9488',
                          borderRadius: '10px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          boxShadow: '0 1px 3px rgba(13, 148, 136, 0.06)'
                        }}>
                          {/* Header of Patient Handout */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #ccfbf1', paddingBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={15} />
                              </div>
                              <div>
                                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#134e4a' }}>
                                  Patient Quick Administration Guide · Week {selectedWeek}
                                </div>
                                <div style={{ fontSize: '0.70rem', color: '#0f766e' }}>
                                  Clear, clinical-grade home administration instructions without technical jargon
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => window.print()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #99f6e4',
                                  color: '#0f766e',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                }}
                                title="Print or save as clinical takeaway PDF for the patient"
                              >
                                <Printer size={13} />
                                <span>Print PDF Guide</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyPatientTakeaway(phase, selectedWeek)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  background: copiedTakeaway ? '#059669' : '#0d9488',
                                  border: 'none',
                                  color: '#ffffff',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                  transition: 'all 0.15s ease'
                                }}
                                title="Copy administration schedule to clipboard"
                              >
                                {copiedTakeaway ? <Check size={13} /> : <Copy size={13} />}
                                <span>{copiedTakeaway ? '✓ Schedule Copied' : 'Copy Schedule'}</span>
                              </button>
                            </div>
                          </div>

                          {/* 3 Simple Actionable Steps */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                            <div style={{ background: '#ffffff', border: '1px solid #e6fffa', borderRadius: '8px', padding: '0.85rem' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>
                                1. Prescribed Weekly Dose
                              </div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                {activeWeekCompounds[0]?.name || 'Active Peptide Compound'}
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                                Calibration: {activeWeekCompounds[0]?.unitDose || 'Standard Dose'} · {activeWeekCompounds[0]?.frequency || 'Once weekly'}
                              </div>
                            </div>

                            <div style={{ background: '#ffffff', border: '1px solid #e6fffa', borderRadius: '8px', padding: '0.85rem' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>
                                2. Vial Reconstitution
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                                • Swab rubber septum with 70% isopropyl alcohol.<br />
                                • Dispense bacteriostatic water smoothly along vial wall.<br />
                                • Swirl gently in slow circles — do not shake.
                              </div>
                            </div>

                            <div style={{ background: '#ffffff', border: '1px solid #e6fffa', borderRadius: '8px', padding: '0.85rem' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', marginBottom: '4px' }}>
                                3. Cold Chain Storage
                              </div>
                              <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                                • Keep refrigerated at 2°C – 8°C (36°F – 46°F).<br />
                                • Never freeze reconstituted peptide vials.<br />
                                • Maximum 28-day stability post-reconstitution.
                              </div>
                            </div>
                          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Phase Jump Pills & Navigation Horizon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
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
                    <span className="phase-jumper-badge">Weeks {phase.startWeek}–{phase.endWeek}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0d9488', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Inspecting Week <strong>{selectedWeek}</strong> of {totalWeeks}</span>
            </div>
          </div>

          {/* Swipe / Scroll Hint for Touch & Narrow screens */}
          <div className="gantt-swipe-hint">
            <span>⇄ Scroll horizontally to explore all {totalWeeks} weeks • Click any week or compound bar to inspect prescribed load</span>
          </div>

          {/* Gantt Matrix Grid (Primary Hero Visual) */}
          <div className="gantt-matrix-wrapper">
            <div className="gantt-matrix">
              {/* Phase Header Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `var(--gantt-col-compound, 200px) repeat(${totalWeeks}, minmax(var(--gantt-col-week, 56px), 1fr))`,
                background: '#f8fafc',
                borderBottom: '2px solid #cbd5e1'
              }}>
                <div style={{
                  padding: '0.65rem 0.75rem',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  color: '#475569',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  background: '#f8fafc',
                  borderRight: '2px solid #cbd5e1',
                  boxShadow: '2px 0 6px rgba(0,0,0,0.04)'
                }}>
                  TREATMENT PHASES
                </div>
                {normalizedPhases.map((phase, idx) => (
                  <div
                    key={idx}
                    style={{
                      gridColumn: `span ${phase.durationWeeks || 4}`,
                      padding: '0.55rem 0.4rem',
                      textAlign: 'center',
                      fontWeight: 800,
                      fontSize: '0.73rem',
                      color: '#0f172a',
                      borderLeft: '1px solid #e2e8f0',
                      background: idx % 2 === 0 ? 'rgba(13, 148, 136, 0.07)' : 'rgba(14, 165, 233, 0.07)'
                    }}
                  >
                    Phase {phase.phaseNumber}: {phase.phaseName} ({phase.durationWeeks}w)
                  </div>
                ))}
              </div>

              {/* Week Numbers Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `var(--gantt-col-compound, 200px) repeat(${totalWeeks}, minmax(var(--gantt-col-week, 56px), 1fr))`,
                background: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  color: '#64748b',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  background: '#ffffff',
                  borderRight: '2px solid #cbd5e1',
                  boxShadow: '2px 0 6px rgba(0,0,0,0.04)'
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
                        cursor: 'pointer',
                        transition: 'background 0.12s ease'
                      }}
                      title={`Select Week ${w}`}
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
                    gridTemplateColumns: `var(--gantt-col-compound, 200px) repeat(${totalWeeks}, minmax(var(--gantt-col-week, 56px), 1fr))`,
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center',
                    background: cIdx % 2 === 0 ? '#ffffff' : '#fafafa'
                  }}
                >
                  <div className="gantt-compound-label">
                    <span>{comp.name}</span>
                    <span style={{ fontSize: '0.66rem', color: '#0d9488', fontWeight: 700, marginTop: '2px' }}>
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

          {/* Synchronized Week Detail Inspector (Below Gantt chart) */}
          <div className="weekly-payload-strip">
            <div className="payload-header">
              <span className="payload-title">
                <Sparkles size={15} style={{ color: '#0d9488' }} />
                Week {selectedWeek} Prescribed Load & Totals
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

            {viewMode === 'patient' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleCopyPatientTakeaway(currentPhase, selectedWeek)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Copy comprehensive weekly clinical schedule to clipboard"
                >
                  {copiedTakeaway ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                  <span>{copiedTakeaway ? '✓ Schedule Copied' : 'Copy Weekly Schedule'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Print or export patient takeaway PDF"
                >
                  <Printer size={13} />
                  <span>Print PDF Guide</span>
                </button>
              </div>
            )}
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
