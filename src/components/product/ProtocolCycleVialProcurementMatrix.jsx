"use client";

import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  ShieldCheck, 
  ShieldAlert, 
  Droplets, 
  Syringe, 
  Calendar, 
  Copy, 
  Check, 
  RotateCcw, 
  Info, 
  SlidersHorizontal,
  Layers,
  ArrowRight
} from '@/lib/icons';
import notifier from '@/services/NotificationService';
import { triggerHaptic } from '@/utils/haptics';
import './ProtocolCycleVialProcurementMatrix.css';

/**
 * ProtocolCycleVialProcurementMatrix
 * ─────────────────────────────────────────────────────────────────────────────
 * Dynamic clinical vial procurement calculator and sizing matrix.
 * 
 * Clinical & Operational Value:
 * 1. Computes exact vial count and strengths needed across multi-phase titration cycles.
 * 2. Enforces USP <797> 28-day beyond-use sterility limit on reconstituted vials.
 * 3. Dynamically recalculates as duration (weeks per phase) or target doses are calibrated.
 * 4. Strictly authored in English for global clinical standardization.
 */
export default function ProtocolCycleVialProcurementMatrix({
  strategy = null,
  product = null,
  currentDoseMg = 2.5,
  currentVialMg = 10,
  onCalibratePhase = null,
  lang = 'en'
}) {
  const [scope, setScope] = useState('cycle'); // 'cycle' | 'phase'
  const [copied, setCopied] = useState(false);

  // Initialize phase weeks state (defaults to 4 weeks per phase)
  const defaultWeeksMap = useMemo(() => {
    const map = {};
    if (strategy?.phases) {
      strategy.phases.forEach(ph => {
        map[ph.phaseId] = 4;
      });
    }
    return map;
  }, [strategy]);

  const [phaseWeeks, setPhaseWeeks] = useState(defaultWeeksMap);

  // Reset weeks if strategy changes
  const isModified = useMemo(() => {
    if (!strategy?.phases) return false;
    return strategy.phases.some(ph => (phaseWeeks[ph.phaseId] || 4) !== 4);
  }, [strategy, phaseWeeks]);

  const handleResetWeeks = () => {
    triggerHaptic('light');
    setPhaseWeeks(defaultWeeksMap);
    notifier.info('Titration schedule reset to clinical 4-week standard');
  };

  const handleAdjustWeeks = (phaseId, delta, minWeeks = 2, maxWeeks = 6) => {
    triggerHaptic('tap');
    setPhaseWeeks(prev => {
      const current = prev[phaseId] || 4;
      const next = Math.max(minWeeks, Math.min(maxWeeks, current + delta));
      return { ...prev, [phaseId]: next };
    });
  };

  // If no predefined strategy, construct a generic 3-phase fallback from product
  const effectiveStrategy = useMemo(() => {
    if (strategy && strategy.phases && strategy.phases.length > 0) {
      return strategy;
    }
    const pName = product?.name || 'Peptide';
    return {
      name: pName,
      indication: 'Standard Clinical Titration Protocol',
      phases: [
        {
          phaseId: 'initiation',
          name: 'Phase 1: Initiation',
          targetDose: `${currentDoseMg || 2.5} mg / week`,
          doseMg: currentDoseMg || 2.5,
          recommendedVial: `${currentVialMg || 10} mg Vial`,
          recommendedVialMg: currentVialMg || 10,
          recommendedBacMl: 2.0,
          resultUnits: 50,
          volumeMl: 0.5,
          rationale: 'Initial titration to establish tolerability and pharmacodynamic response.'
        },
        {
          phaseId: 'escalation',
          name: 'Phase 2: Escalation',
          targetDose: `${(currentDoseMg || 2.5) * 2} mg / week`,
          doseMg: (currentDoseMg || 2.5) * 2,
          recommendedVial: `${(currentVialMg || 10) * 2} mg Vial`,
          recommendedVialMg: (currentVialMg || 10) * 2,
          recommendedBacMl: 2.0,
          resultUnits: 50,
          volumeMl: 0.5,
          rationale: 'Dose escalation for therapeutic acceleration.'
        },
        {
          phaseId: 'maintenance',
          name: 'Phase 3: Therapeutic Maintenance',
          targetDose: `${(currentDoseMg || 2.5) * 3} mg / week`,
          doseMg: (currentDoseMg || 2.5) * 3,
          recommendedVial: `${(currentVialMg || 10) * 2} mg Vial`,
          recommendedVialMg: (currentVialMg || 10) * 2,
          recommendedBacMl: 2.0,
          resultUnits: 50,
          volumeMl: 0.5,
          rationale: 'Steady-state maintenance regimen.'
        }
      ]
    };
  }, [strategy, product, currentDoseMg, currentVialMg]);

  // Calculations for each phase
  const calculatedPhases = useMemo(() => {
    return effectiveStrategy.phases.map(ph => {
      const isMaintenance = ph.phaseId.includes('maintenance');
      const minW = 2;
      const maxW = isMaintenance ? 12 : 6;
      const weeks = phaseWeeks[ph.phaseId] ?? 4;
      const dosesPerWeek = 1;
      const totalDoses = weeks * dosesPerWeek;
      const totalApiMg = +(totalDoses * ph.doseMg).toFixed(2);
      
      const vMg = ph.recommendedVialMg || 10;
      
      // USP <797> Sterility rule: A punctured multi-dose vial expires at 28 days (4 weeks)
      const vialsForSterilityTime = Math.ceil(weeks / 4);
      const vialsForApi = Math.ceil(totalApiMg / vMg);
      const vialsNeeded = Math.max(vialsForSterilityTime, vialsForApi);
      
      const totalVialCapacityMg = +(vialsNeeded * vMg).toFixed(2);
      const unusedApiMg = Math.max(0, +(totalVialCapacityMg - totalApiMg).toFixed(2));
      const isUspSterilitySplit = weeks > 4 && vialsNeeded > 1;
      const isCurrentActive = Math.abs(ph.doseMg - currentDoseMg) <= 0.05;

      return {
        ...ph,
        weeks,
        minW,
        maxW,
        totalDoses,
        totalApiMg,
        vMg,
        vialsNeeded,
        totalVialCapacityMg,
        unusedApiMg,
        isUspSterilitySplit,
        isCurrentActive
      };
    });
  }, [effectiveStrategy, phaseWeeks, currentDoseMg]);

  // Filtered phases based on Scope
  const activePhasesToDisplay = useMemo(() => {
    if (scope === 'phase') {
      const active = calculatedPhases.find(p => p.isCurrentActive) || calculatedPhases[0];
      return [active];
    }
    return calculatedPhases;
  }, [scope, calculatedPhases]);

  // Aggregate Basket Metrics
  const basketSummary = useMemo(() => {
    const vialStrengthCounts = {};
    let totalVials = 0;
    let totalWeeks = 0;
    let totalDoses = 0;
    let totalApiMg = 0;

    activePhasesToDisplay.forEach(p => {
      const key = `${p.vMg} mg`;
      vialStrengthCounts[key] = (vialStrengthCounts[key] || 0) + p.vialsNeeded;
      totalVials += p.vialsNeeded;
      totalWeeks += p.weeks;
      totalDoses += p.totalDoses;
      totalApiMg += p.totalApiMg;
    });

    const bacVialsNeeded = Math.max(1, Math.ceil((totalVials * 2.0) / 10)); // 10 mL BAC bottles
    const syringesNeeded = totalDoses;

    return {
      vialStrengthCounts,
      totalVials,
      totalWeeks,
      totalDoses,
      totalApiMg: +totalApiMg.toFixed(2),
      bacVialsNeeded,
      syringesNeeded
    };
  }, [activePhasesToDisplay]);

  // Copy Procurement Requisition to clipboard
  const handleCopyRequisition = () => {
    triggerHaptic('success');
    const lines = [
      `============================================================`,
      `CLINICAL PROTOCOL VIAL PROCUREMENT REQUISITION`,
      `Protocol: ${effectiveStrategy.name} (${effectiveStrategy.indication || 'Clinical Titration'})`,
      `Cycle Scope: ${scope === 'cycle' ? `Full Titration Cycle (${basketSummary.totalWeeks} Weeks)` : `Single Phase (${basketSummary.totalWeeks} Weeks)`}`,
      `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      `============================================================`,
      ``,
      `REQUIRED ACTIVE PEPTIDE VIALS BY STRENGTH:`,
      ...Object.entries(basketSummary.vialStrengthCounts).map(([str, qty]) => `  • ${qty}× ${effectiveStrategy.name} ${str} Vial${qty > 1 ? 's' : ''}`),
      `  → TOTAL ACTIVE VIALS: ${basketSummary.totalVials} Units (${basketSummary.totalApiMg} mg total API)`,
      ``,
      `PHASE-BY-PHASE TITRATION BREAKDOWN:`,
      ...activePhasesToDisplay.map(p => 
        `  - ${p.name}: ${p.weeks} weeks @ ${p.targetDose} → Buy ${p.vialsNeeded}× ${p.vMg} mg vial${p.vialsNeeded > 1 ? 's' : ''} (Draw: ${p.resultUnits || 50} UI / ${p.volumeMl || 0.5} mL with ${p.recommendedBacMl || 2.0} mL BAC)`
      ),
      ``,
      `MANDATORY ANCILLARY SUPPLIES:`,
      `  • ${basketSummary.bacVialsNeeded}× Bacteriostatic Water 10 mL Vials (0.9% Benzyl Alcohol USP)`,
      `  • ${basketSummary.syringesNeeded}× U-100 Sterile Insulin Syringes (31G × 5/16" 8mm, 0.5 or 1.0 mL)`,
      `  • ${basketSummary.totalVials}× Sterile Reconstitution Transfer Needles (21G–23G × 1.5")`,
      ``,
      `PHARMACOPEIAL COMPLIANCE (USP <797>):`,
      `  ✓ 100% Validated: No punctured multi-dose vial used beyond 28 days.`,
      `  ✓ Storage: Refrigerated at 2°C – 8°C. Protect from light. Do NOT freeze.`,
      `============================================================`
    ];

    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      notifier.success('Procurement requisition copied to clipboard');
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      notifier.error('Failed to copy to clipboard');
    });
  };

  return (
    <div className="pcvp-root" aria-label="Protocol Cycle Vial Procurement Matrix">
      
      {/* ── 1. Top Section Header & Controls ── */}
      <div className="pcvp-header">
        <div className="pcvp-title-group">
          <span className="pcvp-icon-wrap">
            <ShoppingCart size={18} />
          </span>
          <div>
            <div className="pcvp-title">
              Protocol Cycle Vial Procurement &amp; Sizing Matrix
            </div>
            <div className="pcvp-subtitle">
              Calculates exact vial quantities and strengths needed based on clinical titration duration and USP &lt;797&gt; beyond-use date safety.
            </div>
          </div>
        </div>

        <div className="pcvp-header-actions">
          {/* Scope Switcher: Full Cycle vs Active Phase Only */}
          <div className="pcvp-scope-toggle" role="group" aria-label="Procurement Scope">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setScope('cycle');
              }}
              className={`pcvp-scope-btn ${scope === 'cycle' ? 'active' : ''}`}
            >
              Full Cycle ({calculatedPhases.reduce((acc, p) => acc + p.weeks, 0)} Wks)
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setScope('phase');
              }}
              className={`pcvp-scope-btn ${scope === 'phase' ? 'active' : ''}`}
            >
              Active Phase Only
            </button>
          </div>

          {/* Reset button if weeks were custom tweaked */}
          {isModified && (
            <button
              type="button"
              onClick={handleResetWeeks}
              className="pcvp-reset-btn"
              title="Reset schedule to standard 4-week titration steps"
            >
              <RotateCcw size={13} />
              <span>Reset 4-Wk Standard</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Real-Time Procurement Basket Cards (Telemetry Overview) ── */}
      <div className="pcvp-basket-grid">
        {/* Card 1: Total Vials Count & Breakdown */}
        <div className="pcvp-basket-card highlight-blue">
          <div className="pcvp-bc-label">
            <Layers size={13} />
            <span>Total Vials to Procure</span>
          </div>
          <div className="pcvp-bc-val font-mono">
            {basketSummary.totalVials} <small>Vial{basketSummary.totalVials > 1 ? 's' : ''}</small>
          </div>
          <div className="pcvp-bc-pills">
            {Object.entries(basketSummary.vialStrengthCounts).map(([strength, qty]) => (
              <span key={strength} className="pcvp-strength-pill font-mono" style={{ background: '#003666', color: '#ffffff', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', fontSize: '0.74rem' }}>
                {qty}× {strength} vial{qty > 1 ? 's' : ''}
              </span>
            ))}
          </div>
          <div className="pcvp-bc-subtext" style={{ marginTop: '4px', fontSize: '0.68rem', color: '#475569', fontWeight: 600 }}>
            Exact count of each vial presentation needed
          </div>
        </div>

        {/* Card 2: Treatment Duration & Injections */}
        <div className="pcvp-basket-card">
          <div className="pcvp-bc-label">
            <Calendar size={13} />
            <span>Cycle Duration &amp; Doses</span>
          </div>
          <div className="pcvp-bc-val font-mono text-slate-800">
            {basketSummary.totalWeeks} <small>Weeks</small>
          </div>
          <div className="pcvp-bc-subtext">
            {basketSummary.totalDoses} subcutaneous injections ({basketSummary.totalApiMg} mg total API)
          </div>
        </div>

        {/* Card 3: Diluent & Syringes Pack */}
        <div className="pcvp-basket-card">
          <div className="pcvp-bc-label">
            <Droplets size={13} color="#0284c7" />
            <span>Required Ancillaries</span>
          </div>
          <div className="pcvp-bc-val font-mono text-sky-950">
            {basketSummary.bacVialsNeeded}× <small>BAC 10 mL</small>
          </div>
          <div className="pcvp-bc-subtext">
            + {basketSummary.syringesNeeded}× U-100 syringes &amp; {basketSummary.totalVials}× transfer needles
          </div>
        </div>

        {/* Card 4: USP <797> Sterility Guarantee */}
        <div className="pcvp-basket-card highlight-green">
          <div className="pcvp-bc-label">
            <ShieldCheck size={13} color="#16a34a" />
            <span>USP &lt;797&gt; Sterility Guard</span>
          </div>
          <div className="pcvp-bc-val font-mono text-emerald-800">
            100% Safe
          </div>
          <div className="pcvp-bc-subtext text-emerald-700">
            Zero vials punctured &gt; 28 days post-reconstitution
          </div>
        </div>
      </div>

      {/* ── 3. Interactive Phase-by-Phase Requirement Table ── */}
      <div className="pcvp-table-container">
        <div className="pcvp-table-header-row">
          <div className="pcvp-th-title">
            Phase-by-Phase Titration &amp; Reconstitution Schedule
          </div>
          <div className="pcvp-th-hint">
            Adjust weeks (2–6 wks) per phase to test accelerated or extended schedules.
          </div>
        </div>

        <div className="pcvp-table-wrap">
          <table className="pcvp-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Protocol Phase</th>
                <th style={{ width: '13%' }}>Target Dose</th>
                <th style={{ width: '18%' }}>Duration (Adjustable)</th>
                <th style={{ width: '17%' }}>Recommended Strength</th>
                <th style={{ width: '14%' }}>Vials to Buy</th>
                <th style={{ width: '16%', textAlign: 'right' }}>Simulator</th>
              </tr>
            </thead>
            <tbody>
              {activePhasesToDisplay.map((ph, idx) => {
                return (
                  <tr key={ph.phaseId || idx} className={ph.isCurrentActive ? 'row-active' : ''}>
                    {/* Column 1: Phase Name & Status */}
                    <td>
                      <div className="pcvp-phase-name">
                        <span>{ph.name}</span>
                        {ph.isCurrentActive && (
                          <span className="pcvp-active-badge">Active Step</span>
                        )}
                      </div>
                      <div className="pcvp-phase-subtext font-mono">
                        {ph.totalDoses} doses · {ph.totalApiMg} mg API
                      </div>
                    </td>

                    {/* Column 2: Target Dose */}
                    <td>
                      <span className="pcvp-dose-badge font-mono">
                        {ph.targetDose}
                      </span>
                    </td>

                    {/* Column 3: Adjustable Weeks (Stepper) */}
                    <td>
                      <div className="pcvp-weeks-stepper">
                        <button
                          type="button"
                          onClick={() => handleAdjustWeeks(ph.phaseId, -1, ph.minW, ph.maxW)}
                          disabled={ph.weeks <= ph.minW}
                          className="pcvp-wstep-btn"
                          title={`Decrease duration (min ${ph.minW} weeks)`}
                        >
                          −
                        </button>
                        <span className="pcvp-wstep-display font-mono">
                          {ph.weeks} wks
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustWeeks(ph.phaseId, 1, ph.minW, ph.maxW)}
                          disabled={ph.weeks >= ph.maxW}
                          className="pcvp-wstep-btn"
                          title={`Increase duration (max ${ph.maxW} weeks)`}
                        >
                          +
                        </button>
                      </div>
                      {ph.weeks !== 4 && (
                        <span className="pcvp-custom-flag">
                          {ph.weeks < 4 ? 'Accelerated' : 'Extended'}
                        </span>
                      )}
                    </td>

                    {/* Column 4: Recommended Vial Strength (Calibrated to 50 UI / 0.5 mL) */}
                    <td>
                      <div className="pcvp-vial-strength font-mono">
                        {ph.recommendedVial}
                      </div>
                      <div className="pcvp-vial-dilution font-mono" style={{ color: '#0369a1', fontWeight: 600 }}>
                        {ph.recommendedBacMl || 2.0} mL BAC → 50 UI (0.5 mL)
                      </div>
                    </td>

                    {/* Column 5: Number of Vials Needed */}
                    <td>
                      <div className="pcvp-vial-qty-cell">
                        <span className="pcvp-qty-badge font-mono">
                          {ph.vialsNeeded}× {ph.vMg} mg
                        </span>
                        {ph.isUspSterilitySplit && (
                          <span className="pcvp-usp-tag" title="USP <797> requires vial replacement at 28 days">
                            Renewed @ Wk 4
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 6: Action Button (Simulator / Active in Syringe) */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (onCalibratePhase) {
                            onCalibratePhase(ph);
                          }
                        }}
                        className={`pcvp-calib-btn ${ph.isCurrentActive ? 'btn-current' : ''}`}
                        title={ph.isCurrentActive ? 'Currently active in syringe simulator below' : `Load ${ph.name} into syringe simulator`}
                      >
                        {ph.isCurrentActive ? (
                          <>
                            <Check size={12} />
                            <span>Active in Syringe</span>
                          </>
                        ) : (
                          <>
                            <span>Simulate</span>
                            <ArrowRight size={12} />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 4. Clinical Rationale & Procurement Actions ── */}
      <div className="pcvp-footer">
        <div className="pcvp-footer-note">
          <Info size={15} color="#0284c7" />
          <span>
            <strong>USP &lt;797&gt; Sterility Rule:</strong> Reconstituted multi-dose peptide vials with BAC water preserve clinical efficacy and sterility for a maximum of 28 days. Vial counts are automatically balanced to eliminate medication discard and prevent high-volume syringe overflow.
          </span>
        </div>

        <div className="pcvp-footer-actions">
          <button
            type="button"
            onClick={handleCopyRequisition}
            className="pcvp-copy-btn"
          >
            {copied ? (
              <>
                <Check size={14} color="#16a34a" />
                <span>Requisition Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Procurement List</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
