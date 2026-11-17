"use client";

import React, { useState, useMemo } from 'react';
import DataTable from '@/components/ui/DataTable';
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
  ArrowRight,
  FileText,
  Lock,
  LogIn
} from '@/lib/icons';
import notifier from '@/services/NotificationService';
import { triggerHaptic } from '@/utils/haptics';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { useAuth } from '@/context/AuthContext';
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
  currentBacMl = 1.0,
  clinicalPhases = [],
  availableVialOptions = [],
  isDaily = false,
  onCalibratePhase = null,
  lang = 'en'
}) {
  const [scope, setScope] = useState('cycle'); // 'cycle' | 'phase'
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const validVialMgs = useMemo(() => {
    const nums = (availableVialOptions || [])
      .map((o) => Number(typeof o === 'object' ? o.mg : o))
      .filter((n) => Number.isFinite(n) && n > 0)
      .sort((a, b) => a - b);
    return nums.length > 0 ? nums : [currentVialMg || 10];
  }, [availableVialOptions, currentVialMg]);

  const pickCatalogVialMg = (targetPhaseApiMg, fallbackMg) => {
    // Pick the smallest real catalog vial that can comfortably cover the phase or current selected vial
    const match = validVialMgs.find((m) => m >= targetPhaseApiMg) || validVialMgs[validVialMgs.length - 1] || fallbackMg || 10;
    return match;
  };

  // If no predefined strategy, construct an accurate 3-phase strategy from clinicalPhases & real catalog vials
  const effectiveStrategy = useMemo(() => {
    if (strategy && strategy.phases && strategy.phases.length > 0) {
      return strategy;
    }
    const pName = product?.name || 'Peptide';
    const cadenceSuffix = isDaily ? 'day' : 'week';
    const dosesPerWeek = isDaily ? 7 : 1;
    const bacMl = currentBacMl > 0 ? currentBacMl : 1.0;

    if (Array.isArray(clinicalPhases) && clinicalPhases.length > 0) {
      return {
        name: pName,
        indication: isDaily ? 'Daily Subcutaneous Reconstitution Protocol' : 'Weekly Clinical Titration Protocol',
        phases: clinicalPhases.map((cp, idx) => {
          const dMg = cp.unit === 'mcg' ? (Number(cp.dose) || 250) / 1000 : (Number(cp.dose) || 0.25);
          const fourWeekApiMg = +(dMg * dosesPerWeek * 4).toFixed(2);
          // For Phase 1, respect the user's selected vial if it matches catalog; for higher phases, pick best catalog vial
          const recVialMg = idx === 0 && validVialMgs.includes(Number(currentVialMg))
            ? Number(currentVialMg)
            : pickCatalogVialMg(Math.min(fourWeekApiMg, validVialMgs[validVialMgs.length - 1] || 10), currentVialMg);
          const concMgMl = recVialMg / bacMl;
          const volMl = concMgMl > 0 ? dMg / concMgMl : 0;
          const rawUnits = volMl * 100;
          const fmtUnits = Number.isInteger(Math.round(rawUnits * 10) / 10)
            ? Math.round(rawUnits)
            : Number((Math.round(rawUnits * 10) / 10).toFixed(1));
          const displayDose = cp.unit === 'mcg' ? `${cp.dose} mcg / ${cadenceSuffix}` : `${cp.dose} mg / ${cadenceSuffix}`;

          return {
            phaseId: cp.id || `phase_${idx + 1}`,
            name: cp.title || `Phase ${idx + 1}: ${cp.name || 'Titration'}`,
            targetDose: displayDose,
            doseMg: dMg,
            doseRaw: cp.dose,
            doseUnit: cp.unit || 'mg',
            dosesPerWeek,
            recommendedVial: `${recVialMg} mg Vial`,
            recommendedVialMg: recVialMg,
            recommendedBacMl: bacMl,
            resultUnits: fmtUnits,
            volumeMl: +volMl.toFixed(3),
            rationale: isDaily
              ? `Daily subcutaneous micro-dosing (${displayDose}) using verified ${recVialMg} mg catalog presentation.`
              : `Weekly subcutaneous dosing (${displayDose}) using verified ${recVialMg} mg catalog presentation.`
          };
        })
      };
    }

    const baseDoseMg = currentDoseMg || 0.25;
    return {
      name: pName,
      indication: 'Standard Clinical Titration Protocol',
      phases: [1, 2, 3].map((step) => {
        const dMg = +(baseDoseMg * step).toFixed(2);
        const recVialMg = pickCatalogVialMg(dMg * dosesPerWeek * 4, currentVialMg);
        const concMgMl = recVialMg / bacMl;
        const volMl = concMgMl > 0 ? dMg / concMgMl : 0;
        const rawUnits = volMl * 100;
        const fmtUnits = Number.isInteger(Math.round(rawUnits * 10) / 10)
          ? Math.round(rawUnits)
          : Number((Math.round(rawUnits * 10) / 10).toFixed(1));
        return {
          phaseId: step === 1 ? 'initiation' : step === 2 ? 'escalation' : 'maintenance',
          name: step === 1 ? 'Phase 1: Initiation' : step === 2 ? 'Phase 2: Escalation' : 'Phase 3: Maintenance',
          targetDose: `${dMg} mg / ${cadenceSuffix}`,
          doseMg: dMg,
          dosesPerWeek,
          recommendedVial: `${recVialMg} mg Vial`,
          recommendedVialMg: recVialMg,
          recommendedBacMl: bacMl,
          resultUnits: fmtUnits,
          volumeMl: +volMl.toFixed(3),
          rationale: 'Clinical titration step.'
        };
      })
    };
  }, [strategy, product, currentDoseMg, currentVialMg, currentBacMl, clinicalPhases, isDaily, validVialMgs]);

  // Initialize phase weeks state (defaults to 4 weeks per phase)
  const defaultWeeksMap = useMemo(() => {
    const map = {};
    if (effectiveStrategy?.phases) {
      effectiveStrategy.phases.forEach(ph => {
        map[ph.phaseId] = 4;
      });
    }
    return map;
  }, [effectiveStrategy]);

  const [phaseWeeks, setPhaseWeeks] = useState(defaultWeeksMap);

  // Reset weeks if strategy changes
  const isModified = useMemo(() => {
    if (!effectiveStrategy?.phases) return false;
    return effectiveStrategy.phases.some(ph => (phaseWeeks[ph.phaseId] || 4) !== 4);
  }, [effectiveStrategy, phaseWeeks]);

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

  // Calculations for each phase
  const calculatedPhases = useMemo(() => {
    return effectiveStrategy.phases.map(ph => {
      const isMaintenance = String(ph.phaseId || '').includes('maintenance') || String(ph.phaseId || '').includes('opt');
      const minW = 2;
      const maxW = isMaintenance ? 12 : 6;
      const weeks = phaseWeeks[ph.phaseId] ?? 4;
      const dosesPerWeek = ph.dosesPerWeek || (isDaily ? 7 : 1);
      const totalDoses = weeks * dosesPerWeek;
      const totalApiMg = +(totalDoses * ph.doseMg).toFixed(2);
      
      const vMg = ph.recommendedVialMg || currentVialMg || 10;
      
      // USP <797> Sterility rule: A punctured multi-dose vial expires at 28 days (4 weeks)
      const vialsForSterilityTime = Math.ceil(weeks / 4);
      const vialsForApi = Math.ceil(totalApiMg / vMg);
      const vialsNeeded = Math.max(vialsForSterilityTime, vialsForApi);
      
      const totalVialCapacityMg = +(vialsNeeded * vMg).toFixed(2);
      const unusedApiMg = Math.max(0, +(totalVialCapacityMg - totalApiMg).toFixed(2));
      const isUspSterilitySplit = weeks > 4 && vialsNeeded > 1;
      const isCurrentActive = Math.abs(ph.doseMg - currentDoseMg) <= 0.01;

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
  }, [effectiveStrategy, phaseWeeks, currentDoseMg, currentVialMg, isDaily]);

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

  // 1-Click Commercial Bridge: Add Calculated Protocol Cycle to Active Workspace / Quotation
  const handleAddToQuotation = () => {
    if (!isAuthenticated) {
      triggerHaptic('warning');
      // Redirect to login with returnTo so user lands back here after auth
      const returnTo = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
      window.location.href = `/login?returnTo=${returnTo}&intent=order`;
      return;
    }
    triggerHaptic('success');
    const { addItem, setDrawerOpen, activeWorkspaceId } = useWorkspaceStore.getState();

    // 1. Add required active peptide vials by strength
    Object.entries(basketSummary.vialStrengthCounts).forEach(([str, qty]) => {
      addItem({
        id: `${product?.id || 'compound'}-${str.replace(/\s+/g, '-').toLowerCase()}`,
        productId: product?.id,
        canonicalName: `${effectiveStrategy.name} (${str} Vial)`,
        dosage: str,
        quantity: qty,
        unitPrice: 65,
        supplierCost: 35,
        supplierName: 'Lotusland Limited',
        supplierId: 'supplier-lotusland',
        warehouseId: 'europe',
        warehouseName: 'Europe Warehouse (Poland Hub)'
      }, activeWorkspaceId);
    });

    // 2. Add required Bacteriostatic Water
    if (basketSummary.bacVialsNeeded > 0) {
      addItem({
        id: 'ancillary-bac-water-10ml',
        productId: 'bac-water-10ml',
        canonicalName: 'Bacteriostatic Water 10 mL (0.9% Benzyl Alcohol USP)',
        dosage: '10 mL',
        quantity: basketSummary.bacVialsNeeded,
        unitPrice: 15,
        supplierCost: 5,
        supplierName: 'Lotusland Limited',
        supplierId: 'supplier-lotusland',
        warehouseId: 'europe',
        warehouseName: 'Europe Warehouse (Poland Hub)'
      }, activeWorkspaceId);
    }

    setDrawerOpen(true);
    notifier.success(`Protocol cycle (${basketSummary.totalVials} vials + BAC water) added to quotation!`);
  };

  // 1-Click: Share Patient Administration & Protocol Card (WhatsApp & Print Ready)
  const [patientCardCopied, setPatientCardCopied] = useState(false);
  const handleSharePatientCard = () => {
    triggerHaptic('selection');
    const activePh = activePhasesToDisplay[0] || calculatedPhases[0];
    const text = [
      `📋 *PATIENT ADMINISTRATION & RECONSTITUTION PROTOCOL*`,
      `Compound: *${effectiveStrategy.name}*`,
      `Protocol Duration: ${basketSummary.totalWeeks} Weeks`,
      ``,
      `💉 *CURRENT TITRATION STEP (${activePh.name}):*`,
      `• Target Dose: *${activePh.targetDose}*`,
      `• Recommended Vial: ${activePh.recommendedVial}`,
      `• Reconstitution Diluent: *${activePh.recommendedBacMl || currentBacMl || 1.0} mL Bacteriostatic Water*`,
      `• Volume to Draw: *${activePh.resultUnits || 50} Units (${Number(activePh.volumeMl || 0.5).toFixed(2)} mL)* on U-100 syringe 🎯`,
      ``,
      `❄️ *COLD-CHAIN & STERILITY RULES:*`,
      `• Store reconstituted vial in refrigerator at 2°C – 8°C. Protect from light.`,
      `• USP <797> Expiration: Discard punctured vial 28 days post-reconstitution.`,
      `• Inject subcutaneously once weekly into abdomen or thigh.`,
      ``,
      `Powered by Atlas Health Services • Clinical Healthcare Intelligence`
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setPatientCardCopied(true);
      notifier.success('Patient Protocol Card copied! Ready to paste into WhatsApp or print.');
      setTimeout(() => setPatientCardCopied(false), 3000);
    }).catch(() => {
      notifier.error('Failed to copy Patient Card');
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
          <DataTable
            pagination={false}
            enableAskAtlas={false}
            columns={[
              {
                key: 'name',
                label: 'Protocol Phase',
                render: (val, ph) => (
                  <div>
                    <div className="pcvp-phase-name">
                      <span>{val}</span>
                      {ph.isCurrentActive && (
                        <span className="pcvp-active-badge">Active Step</span>
                      )}
                    </div>
                    <div className="pcvp-phase-subtext font-mono">
                      {ph.totalDoses} doses · {ph.totalApiMg} mg API
                    </div>
                  </div>
                ),
              },
              {
                key: 'targetDose',
                label: 'Target Dose',
                render: (val) => (
                  <span className="pcvp-dose-badge font-mono">
                    {val}
                  </span>
                ),
              },
              {
                key: 'weeks',
                label: 'Duration (Adjustable)',
                render: (_, ph) => (
                  <div>
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
                  </div>
                ),
              },
              {
                key: 'recommendedVial',
                label: 'Recommended Strength',
                render: (val, ph) => (
                  <div>
                    <div className="pcvp-vial-strength font-mono">
                      {val}
                    </div>
                    <div className="pcvp-vial-dilution font-mono" style={{ color: '#0369a1', fontWeight: 600 }}>
                      {ph.recommendedBacMl || currentBacMl || 1.0} mL BAC → {ph.resultUnits || 50} UI ({Number(ph.volumeMl || 0.5).toFixed(2)} mL)
                    </div>
                  </div>
                ),
              },
              {
                key: 'vialsNeeded',
                label: 'Vials to Buy',
                render: (val, ph) => (
                  <div className="pcvp-vial-qty-cell">
                    <span className="pcvp-qty-badge font-mono">
                      {val}× {ph.vMg} mg
                    </span>
                    {ph.isUspSterilitySplit && (
                      <span className="pcvp-usp-tag" title="USP <797> requires vial replacement at 28 days">
                        Renewed @ Wk 4
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'simulator',
                label: 'Simulator',
                align: 'right',
                render: (_, ph) => (
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
                ),
              },
            ]}
            data={activePhasesToDisplay.map((ph, idx) => ({ id: ph.phaseId || String(idx), ...ph }))}
          />
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
          {/* Action 1: Patient Protocol Fact Sheet (WhatsApp / Print) */}
          <button
            type="button"
            onClick={handleSharePatientCard}
            className="pcvp-patient-card-btn"
            title="Copy patient administration guidelines for WhatsApp or clinical printout"
          >
            {patientCardCopied ? (
              <>
                <Check size={14} color="#16a34a" />
                <span>Patient Card Copied!</span>
              </>
            ) : (
              <>
                <FileText size={14} />
                <span>Patient Protocol Card</span>
              </>
            )}
          </button>

          {/* Action 2: Technical Procurement Copy */}
          <button
            type="button"
            onClick={handleCopyRequisition}
            className="pcvp-copy-btn"
            title="Copy technical procurement breakdown"
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

          {/* Action 3: 1-Click B2B Workspace Quotation / Order — requires auth */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleAddToQuotation}
              className="pcvp-primary-action-btn"
              title="Add full titration cycle and ancillaries to your active workspace quotation"
            >
              <ShoppingCart size={14} />
              <span>Order / Quote Cycle ({basketSummary.totalVials} Vials)</span>
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Locked state — elegant premium treatment */}
              <button
                type="button"
                onClick={handleAddToQuotation}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(2,132,199,0.35)',
                  background: 'rgba(2,132,199,0.07)', color: '#64748b',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.15s'
                }}
                title="Sign in to add this protocol cycle to your workspace"
              >
                <Lock size={13} style={{ flexShrink: 0, color: '#94a3b8' }} />
                <span style={{ color: '#475569' }}>Order / Quote Cycle ({basketSummary.totalVials} Vials)</span>
                <span style={{
                  marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800,
                  color: '#0284c7', background: '#eff6ff', border: '1px solid #bfdbfe',
                  padding: '1px 6px', borderRadius: '4px', whiteSpace: 'nowrap'
                }}>Sign in required</span>
              </button>
              {/* Inline auth nudge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', borderRadius: '7px',
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                border: '1px solid #bae6fd'
              }}>
                <LogIn size={13} style={{ flexShrink: 0, color: '#0284c7' }} />
                <span style={{ fontSize: '0.72rem', color: '#0369a1', lineHeight: 1.3 }}>
                  {lang === 'es'
                    ? 'Inicia sesión para añadir este ciclo a tu espacio de trabajo.'
                    : 'Sign in to load this protocol cycle into your workspace.'}
                </span>
                <a
                  href={`/login?returnTo=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&intent=order`}
                  style={{
                    marginLeft: 'auto', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800,
                    color: '#ffffff', background: '#0284c7', border: 'none',
                    padding: '4px 10px', borderRadius: '6px', textDecoration: 'none',
                    whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(2,132,199,0.35)'
                  }}
                >
                  {lang === 'es' ? 'Iniciar sesión →' : 'Sign in →'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
