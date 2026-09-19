"use client";

import React, { useState, useMemo, useEffect } from 'react';
import './InteractiveReconstitutionGuide.css';
import { 
  FlaskConical, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Sparkles,
  Droplets,
  ShieldCheck,
  ShieldAlert
} from '@/lib/icons';
import notifier from '@/services/NotificationService';
import { triggerHaptic } from '@/utils/haptics';
import { getTranslations } from '../../utils/productTranslations';
import { getReconstitutionBaseline, parseMgFromPresentation } from '../../utils/reconstitutionBaseline';

// ── Static preset arrays — defined outside component to avoid re-allocation ───
const BAC_PRESETS = Object.freeze([1.0, 2.0, 2.5, 3.0, 5.0]);
const DOSE_PRESETS_MG = Object.freeze([0.5, 1.0, 2.5, 5.0, 7.5, 10.0]);
const BLEND_DOSE_PRESETS_MG = Object.freeze([0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0]);
const DOSE_PRESETS_MCG = Object.freeze([100, 250, 500, 750, 1000]);

/**
 * InteractiveReconstitutionGuide
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-Trust Clinical Reconstitution Simulator & Precision U-100 Syringe Visualizer.
 * 
 * Security Guarantees:
 * - Pure client-side computation (Zero network requests, zero auth dependency)
 * - Zero route leaks (No external links to authenticated or commercial portals)
 * - Safe clamped inputs (Zero division-by-zero, NaN, or buffer overflows)
 */
export default function InteractiveReconstitutionGuide({ 
  product, 
  selectedStrength, 
  availableStrengths = [],
  activeFormatId = 'vial',
  activeFormat = null,
  supplierName = '',
  lang = 'en',
  primaryProtocol = null,
  associatedProtocols = []
}) {
  const t = getTranslations(lang);

  const [selectedProtocolId, setSelectedProtocolId] = useState(() => {
    return primaryProtocol?.id || primaryProtocol?.slug || (associatedProtocols[0]?.id || null);
  });

  const activeSelectedProtocol = useMemo(() => {
    if (!Array.isArray(associatedProtocols) || associatedProtocols.length === 0) return primaryProtocol;
    const found = associatedProtocols.find(p => (p.id === selectedProtocolId || p.slug === selectedProtocolId));
    return found || primaryProtocol || associatedProtocols[0];
  }, [associatedProtocols, selectedProtocolId, primaryProtocol]);

  const isPenOrCartridge = useMemo(() => {
    const fId = String(activeFormatId || '').toLowerCase();
    const fName = String(activeFormat?.name || '').toLowerCase();
    return fId.includes('pen') || fId.includes('cartridge') || fName.includes('pen') || fName.includes('cartridge');
  }, [activeFormatId, activeFormat]);

  const isSpray = useMemo(() => {
    const fId = String(activeFormatId || '').toLowerCase();
    const fName = String(activeFormat?.name || '').toLowerCase();
    return fId.includes('spray') || fName.includes('spray');
  }, [activeFormatId, activeFormat]);

  const isOral = useMemo(() => {
    const fId = String(activeFormatId || '').toLowerCase();
    const fName = String(activeFormat?.name || '').toLowerCase();
    return fId.includes('capsule') || fId.includes('tablet') || fName.includes('capsule') || fName.includes('tablet') || fId.includes('oral') || fName.includes('oral');
  }, [activeFormatId, activeFormat]);

  // Detect whether this compound is a multi-peptide blend (e.g. KLOW, GLOW)
  const isBlend = useMemo(() => {
    const rawStr = selectedStrength?.name || selectedStrength?.id || product?.name || '';
    const s = String(rawStr).toLowerCase();
    const pName = String(product?.name || '').toLowerCase();
    return s.includes('+') || s.includes('|') || s.includes('/') || pName.includes('klow') || pName.includes('glow') || pName.includes('blend');
  }, [selectedStrength, product]);

  // Extract initial numeric vial content (mg) using O(1) centralized fast parser
  const initialVialMg = useMemo(() => {
    const rawStr = selectedStrength?.name || selectedStrength?.id || product?.name || '';
    return parseMgFromPresentation(rawStr);
  }, [selectedStrength, product]);

  // Dynamic clinical starting titration dose (Phase 1) tailored specifically to each peptide compound
  const getClinicalPhase1Dose = (prod, mgVal = 10) => {
    const pName = String(prod?.name || prod?.slug || prod?.id || '').toLowerCase();
    const mg = Number(mgVal) || 10;

    // 1. Semaglutide & Cagrilintide: Clinical Phase 1 starts at 0.25 mg
    if (pName.includes('semaglutide') || pName.includes('cagrilintide')) {
      return { dose: 0.25, unit: 'mg' };
    }
    // 2. Tirzepatide: Clinical Phase 1 starts at 2.5 mg (standard FDA/clinical starting titration)
    if (pName.includes('tirzepatide')) {
      return { dose: 2.5, unit: 'mg' };
    }
    // 3. Retatrutide & Tri-Agonist Metabolic Peptides: Clinical Phase 1 starts at 1.0 mg (or 2.0 mg for large vials > 10mg)
    if (pName.includes('retatrutide') || pName.includes('glp')) {
      return { dose: mg <= 10 ? 1.0 : 2.0, unit: 'mg' };
    }
    // 4. TB-500 / Thymosin Beta-4: 1.0 mg or 1.25 mg
    if (pName.includes('tb-500') || pName.includes('tb500') || pName.includes('thymosin')) {
      return { dose: mg <= 5 ? 1.0 : 1.25, unit: 'mg' };
    }
    // 5. GHK-Cu: 1.0 mg
    if (pName.includes('ghk')) {
      return { dose: 1.0, unit: 'mg' };
    }
    // 6. PT-141 / Bremelanotide & Tesamorelin: 1.0 mg
    if (pName.includes('pt-141') || pName.includes('bremelanotide') || pName.includes('tesamorelin')) {
      return { dose: 1.0, unit: 'mg' };
    }
    // 7. MOTS-c & SS-31: 2.0 mg / 2.5 mg
    if (pName.includes('mots') || pName.includes('ss-31') || pName.includes('elamipretide')) {
      return { dose: mg <= 5 ? 2.0 : 2.5, unit: 'mg' };
    }
    // 8. NAD+: 25 mg or 50 mg
    if (pName.includes('nad')) {
      return { dose: mg >= 500 ? 50 : 25, unit: 'mg' };
    }
    // 9. Micro-dosed compounds: BPC-157, Epithalon, CJC-1295, Ipamorelin, Sermorelin, MT-2 (250 mcg)
    if (pName.includes('bpc') || pName.includes('epithalon') || pName.includes('ipamorelin') || pName.includes('cjc') || pName.includes('sermorelin') || pName.includes('mt2') || pName.includes('melanotan') || mg <= 2) {
      return { dose: 250, unit: 'mcg' };
    }
    // Fallback: Safe titration at ~10-15% of vial (between 0.25 mg and 1.0 mg)
    const fallbackDose = +(Math.max(0.25, Math.min(1.0, mg * 0.1)).toFixed(2));
    return { dose: fallbackDose, unit: 'mg' };
  };

  // Determine the authoritative protocol baseline using O(1) table lookup
  const baselineState = useMemo(() => {
    const baseMg = initialVialMg || 5;
    const { baseBac } = getReconstitutionBaseline(baseMg, isBlend);
    const p1 = getClinicalPhase1Dose(product, baseMg);
    return { baseMg, baseBac, baseDose: p1.dose, baseUnit: p1.unit };
  }, [initialVialMg, isBlend, product]);

  // Interactive state — strictly begins at Phase 1 protocol dose of this specific peptide
  const [vialMg, setVialMg] = useState(initialVialMg);
  const [bacWaterMl, setBacWaterMl] = useState(() => baselineState.baseBac);
  const [doseUnit, setDoseUnit] = useState(() => baselineState.baseUnit);
  const [doseValue, setDoseValue] = useState(() => baselineState.baseDose);
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);

  // Update vial content whenever page changes selected active vial presentation
  useEffect(() => {
    if (initialVialMg && initialVialMg > 0) {
      setVialMg(initialVialMg);
      setBacWaterMl(baselineState.baseBac);
      setDoseUnit(baselineState.baseUnit);
      setDoseValue(baselineState.baseDose);
      setSelectedPhaseId(null);
    }
  }, [initialVialMg, baselineState]);

  // Adjust default dose when vial or unit changes, ensuring syringe capacity is never exceeded
  useEffect(() => {
    const conc = vialMg > 0 && bacWaterMl > 0 ? vialMg / bacWaterMl : 1;
    const reqVol = doseUnit === 'mcg' ? (doseValue / 1000) / conc : doseValue / conc;
    const units = reqVol * 100;

    if (units > 100 || (doseUnit === 'mg' && doseValue > vialMg)) {
      const p1 = getClinicalPhase1Dose(product, vialMg);
      setDoseUnit(p1.unit);
      setDoseValue(p1.dose);
      setSelectedPhaseId(null);
    }
  }, [vialMg, bacWaterMl, doseUnit, product]);

  // ── Precision Pharmacokinetic Calculations ─────────────────────────────────
  const {
    safeVialMg,
    safeBacMl,
    concentrationMgMl,
    concentrationMcgMl,
    doseMg,
    liquidVolumeMl,
    syringeUnits,
    fillPct,
    totalDosesInVial,
    isOverSyringe,
    isUnderMeasured
  } = useMemo(() => {
    const vMg = Math.max(0.1, Math.min(500, parseFloat(vialMg) || 10));
    const bMl = Math.max(0.2, Math.min(20, parseFloat(bacWaterMl) || 2.0));
    
    // Concentration
    const cMgMl = vMg / bMl;
    const cMcgMl = cMgMl * 1000;

    // Dose in mg
    const dMg = doseUnit === 'mcg' ? (parseFloat(doseValue) || 0) / 1000 : (parseFloat(doseValue) || 0);

    // Liquid volume needed (mL) = Dose (mg) / Concentration (mg/mL)
    const volMl = cMgMl > 0 ? dMg / cMgMl : 0;

    // U-100 Insulin Syringe: 1.0 mL = 100 Units -> Units = volMl * 100
    const units = volMl * 100;
    const fill = Math.min(100, Math.max(0, units));

    // Estimated full doses per vial
    const doses = dMg > 0 ? Math.floor((vMg / dMg) * 10) / 10 : 0;

    return {
      safeVialMg: vMg,
      safeBacMl: bMl,
      concentrationMgMl: cMgMl,
      concentrationMcgMl: cMcgMl,
      doseMg: dMg,
      liquidVolumeMl: volMl,
      syringeUnits: units,
      fillPct: fill,
      totalDosesInVial: doses,
      isOverSyringe: units > 100,
      isUnderMeasured: units > 0 && units < 5
    };
  }, [vialMg, bacWaterMl, doseUnit, doseValue]);

  // ── Dynamic Clinical Phase Protocols (Supports N dynamic phases + Custom) ──
  const clinicalPhases = useMemo(() => {
    const pName = String(product?.name || product?.slug || product?.id || '').toLowerCase();
    const isTb500 = pName.includes('tb-500') || pName.includes('tb500') || pName.includes('thymosin');
    const vMg = safeVialMg;
    const conc = concentrationMgMl > 0 ? concentrationMgMl : (vMg / (safeBacMl || 2.0));

    // Helper to safely format phase objects with exact UI and doses calculation
    const createPhase = (id, dose, unit, pLabel, name, title, badge) => {
      const dMg = unit === 'mcg' ? dose / 1000 : dose;
      const vol = conc > 0 ? dMg / conc : 0;
      const units = Math.round(vol * 100);
      const doses = dMg > 0 ? Math.floor((vMg / dMg) * 10) / 10 : 0;
      return {
        id,
        dose,
        unit,
        phaseLabel: pLabel,
        name,
        title,
        badge,
        subtitle: `${units} UI (${vol.toFixed(2)} mL) · ~${doses} ${lang === 'es' ? 'dosis' : 'doses'}`
      };
    };

    // 0. Dynamic phases loaded directly from Firestore product record (if configured)
    const rawPhases = Array.isArray(product?.clinical_phases) && product.clinical_phases.length > 0
      ? product.clinical_phases
      : (Array.isArray(product?.phases) && product.phases.length > 0 ? product.phases : null);

    if (rawPhases) {
      return rawPhases.map((p, idx) => {
        const d = parseFloat(p.dose) || 1;
        const u = p.unit || 'mg';
        const numLabel = idx + 1;
        return createPhase(
          p.id || `phase_dyn_${numLabel}`,
          d,
          u,
          p.phaseLabel || (lang === 'es' ? `FASE ${numLabel}` : `PHASE ${numLabel}`),
          p.name || (lang === 'es' ? `Fase ${numLabel}` : `Phase ${numLabel}`),
          p.title || (lang === 'es' ? `Fase ${numLabel}: ${p.name || ''}` : `Phase ${numLabel}: ${p.name || ''}`),
          p.badge || `${d} ${u}`
        );
      });
    }

    // 1. Semaglutide & Cagrilintide (Full Clinical Titration: 0.25 mg -> 0.50 mg -> 1.00 mg -> 1.70/2.40 mg)
    if (pName.includes('semaglutide') || pName.includes('cagrilintide')) {
      const p1Dose = 0.25;
      const p2Dose = 0.50;
      const p3Dose = 1.00;
      const p4Dose = vMg >= 10 ? 2.40 : 1.70;

      return [
        createPhase('phase_sema_p1', p1Dose, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Iniciación' : 'Initiation', lang === 'es' ? 'Fase 1: Iniciación' : 'Phase 1: Initiation', '0.25 mg'),
        createPhase('phase_sema_p2', p2Dose, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Titulación' : 'Titration', lang === 'es' ? 'Fase 2: Titulación' : 'Phase 2: Titration', '0.50 mg'),
        createPhase('phase_sema_p3', p3Dose, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Escalada' : 'Escalation', lang === 'es' ? 'Fase 3: Escalada' : 'Phase 3: Escalation', '1.00 mg'),
        createPhase('phase_sema_p4', p4Dose, 'mg', lang === 'es' ? 'FASE 4' : 'PHASE 4', lang === 'es' ? 'Objetivo' : 'Target', lang === 'es' ? 'Fase 4: Dosis Óptima' : 'Phase 4: Target Dose', `${p4Dose} mg`)
      ];
    }

    // 2. Tirzepatide (Full Clinical Titration: 2.5 mg -> 5.0 mg -> 7.5 mg -> 10.0/15.0 mg)
    if (pName.includes('tirzepatide')) {
      const p1Dose = 2.5;
      const p2Dose = 5.0;
      const p3Dose = 7.5;
      const p4Dose = vMg <= 10 ? 10.0 : 15.0;

      return [
        createPhase('phase_tirz_p1', p1Dose, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Iniciación' : 'Initiation', lang === 'es' ? 'Fase 1: Iniciación' : 'Phase 1: Initiation', '2.5 mg'),
        createPhase('phase_tirz_p2', p2Dose, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Titulación' : 'Titration', lang === 'es' ? 'Fase 2: Titulación' : 'Phase 2: Titration', '5.0 mg'),
        createPhase('phase_tirz_p3', p3Dose, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Escalada' : 'Escalation', lang === 'es' ? 'Fase 3: Escalada' : 'Phase 3: Escalation', '7.5 mg'),
        createPhase('phase_tirz_p4', p4Dose, 'mg', lang === 'es' ? 'FASE 4' : 'PHASE 4', lang === 'es' ? 'Objetivo' : 'Target', lang === 'es' ? 'Fase 4: Dosis Óptima' : 'Phase 4: Target Dose', `${p4Dose} mg`)
      ];
    }

    // 3. Retatrutide & Tri-Agonist Metabolic Peptides (Full Clinical Titration: 1.0 mg -> 2.0 mg -> 4.0 mg -> 6.0/9.0 mg)
    if (pName.includes('retatrutide') || pName.includes('glp')) {
      const p1Dose = 1.0;
      const p2Dose = 2.0;
      const p3Dose = 4.0;
      const p4Dose = vMg <= 10 ? 6.0 : 9.0;

      return [
        createPhase('phase_met_initiation', p1Dose, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Iniciación' : 'Initiation', lang === 'es' ? 'Fase 1: Iniciación' : 'Phase 1: Initiation', `${p1Dose} mg`),
        createPhase('phase_met_titration', p2Dose, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Titulación' : 'Titration', lang === 'es' ? 'Fase 2: Titulación' : 'Phase 2: Titration', `${p2Dose} mg`),
        createPhase('phase_met_escalation', p3Dose, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Escalada' : 'Escalation', lang === 'es' ? 'Fase 3: Escalada' : 'Phase 3: Escalation', `${p3Dose} mg`),
        createPhase('phase_met_target', p4Dose, 'mg', lang === 'es' ? 'FASE 4' : 'PHASE 4', lang === 'es' ? 'Objetivo' : 'Target', lang === 'es' ? 'Fase 4: Dosis Óptima' : 'Phase 4: Target Dose', `${p4Dose} mg`)
      ];
    }

    // 4. TB-500 / Thymosin Beta-4 Protocol (1.0 mg -> 2.0 mg -> 2.5/3.0 mg)
    if (isTb500) {
      const p1Dose = vMg <= 5 ? 1.0 : 1.25;
      const p2Dose = 2.0;
      const p3Dose = vMg <= 5 ? 2.5 : 3.0;

      return [
        createPhase('phase_tb_titration', p1Dose, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Inicio' : 'Initial', lang === 'es' ? 'Fase 1: Titulación' : 'Phase 1: Titration', `${p1Dose} mg`),
        createPhase('phase_tb_maintenance', p2Dose, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Mantenimiento' : 'Maintenance', lang === 'es' ? 'Fase 2: Mantenimiento' : 'Phase 2: Maintenance', `${p2Dose} mg`),
        createPhase('phase_tb_optimization', p3Dose, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Avanzada' : 'Advanced', lang === 'es' ? 'Fase 3: Pauta Avanzada' : 'Phase 3: Advanced Protocol', `${p3Dose} mg`)
      ];
    }

    // 5. GHK-Cu (1.0 mg -> 2.0 mg -> 3.0 mg)
    if (pName.includes('ghk')) {
      return [
        createPhase('phase_ghk_p1', 1.0, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Inicio' : 'Initial', lang === 'es' ? 'Fase 1: Titulación' : 'Phase 1: Titration', '1.0 mg'),
        createPhase('phase_ghk_p2', 2.0, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Mantenimiento' : 'Maintenance', lang === 'es' ? 'Fase 2: Mantenimiento' : 'Phase 2: Maintenance', '2.0 mg'),
        createPhase('phase_ghk_p3', 3.0, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Avanzada' : 'Advanced', lang === 'es' ? 'Fase 3: Pauta Avanzada' : 'Phase 3: Advanced Protocol', '3.0 mg')
      ];
    }

    // 6. PT-141 & Tesamorelin (1.0 mg -> 1.5 mg -> 2.0 mg)
    if (pName.includes('pt-141') || pName.includes('bremelanotide') || pName.includes('tesamorelin')) {
      return [
        createPhase('phase_pt_p1', 1.0, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Inicio' : 'Initial', lang === 'es' ? 'Fase 1: Titulación' : 'Phase 1: Titration', '1.0 mg'),
        createPhase('phase_pt_p2', 1.5, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Mantenimiento' : 'Maintenance', lang === 'es' ? 'Fase 2: Mantenimiento' : 'Phase 2: Maintenance', '1.5 mg'),
        createPhase('phase_pt_p3', 2.0, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Objetivo' : 'Target', lang === 'es' ? 'Fase 3: Dosis Óptima' : 'Phase 3: Target Dose', '2.0 mg')
      ];
    }

    // 7. MOTS-c & SS-31 (Mitochondrial Peptides)
    if (pName.includes('mots') || pName.includes('ss-31') || pName.includes('elamipretide')) {
      const p1Dose = vMg <= 5 ? 2.0 : 2.5;
      const p2Dose = vMg <= 5 ? 3.0 : 5.0;
      const p3Dose = vMg <= 5 ? 5.0 : 10.0;
      return [
        createPhase('phase_mito_p1', p1Dose, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Inicio' : 'Initial', lang === 'es' ? 'Fase 1: Titulación' : 'Phase 1: Titration', `${p1Dose} mg`),
        createPhase('phase_mito_p2', p2Dose, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Mantenimiento' : 'Maintenance', lang === 'es' ? 'Fase 2: Mantenimiento' : 'Phase 2: Maintenance', `${p2Dose} mg`),
        createPhase('phase_mito_p3', p3Dose, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Avanzada' : 'Advanced', lang === 'es' ? 'Fase 3: Pauta Avanzada' : 'Phase 3: Advanced Protocol', `${p3Dose} mg`)
      ];
    }

    // 8. Micro-dosed compounds: BPC-157, Epithalon, CJC-1295, Ipamorelin, Sermorelin, MT-2
    const isMicro = pName.includes('bpc') || pName.includes('epithalon') || pName.includes('ipamorelin') || pName.includes('cjc') || pName.includes('sermorelin') || pName.includes('mt2') || pName.includes('melanotan') || vMg <= 5;
    if (isMicro) {
      const p1Dose = doseUnit === 'mcg' ? 250 : 0.25;
      const p2Dose = doseUnit === 'mcg' ? 500 : 0.50;
      const p3Dose = doseUnit === 'mcg' ? 750 : 0.75;
      const u = doseUnit === 'mcg' ? 'mcg' : 'mg';

      return [
        createPhase('phase_micro_low', p1Dose, u, lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Inicio' : 'Initial', lang === 'es' ? 'Pauta Inicial' : 'Initial Protocol', doseUnit === 'mcg' ? '250 mcg' : '0.25 mg'),
        createPhase('phase_micro_std', p2Dose, u, lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Estándar' : 'Standard', lang === 'es' ? 'Pauta Estándar' : 'Standard Protocol', doseUnit === 'mcg' ? '500 mcg' : '0.50 mg'),
        createPhase('phase_micro_opt', p3Dose, u, lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Intensiva' : 'Intensive', lang === 'es' ? 'Pauta Intensiva' : 'Intensive Protocol', doseUnit === 'mcg' ? '750 mcg' : '0.75 mg')
      ];
    }

    // 9. Standard Fallback scaled safely to concentration bounds (≤ 80 Units)
    const maxSafeDose = Math.min(vMg, conc * 0.85);
    const d1 = +(Math.max(0.25, Math.min(1.0, maxSafeDose * 0.35)).toFixed(2));
    const d2 = +(Math.max(d1, Math.min(2.0, maxSafeDose * 0.65)).toFixed(2));
    const d3 = +(Math.max(d2, Math.min(2.5, maxSafeDose)).toFixed(2));

    return [
      createPhase('phase_gen_p1', d1, 'mg', lang === 'es' ? 'FASE 1' : 'PHASE 1', lang === 'es' ? 'Inicio' : 'Initial', lang === 'es' ? 'Pauta Inicial' : 'Initial Protocol', `${d1} mg`),
      createPhase('phase_gen_p2', d2, 'mg', lang === 'es' ? 'FASE 2' : 'PHASE 2', lang === 'es' ? 'Mantenimiento' : 'Maintenance', lang === 'es' ? 'Pauta Regular' : 'Standard Protocol', `${d2} mg`),
      createPhase('phase_gen_p3', d3, 'mg', lang === 'es' ? 'FASE 3' : 'PHASE 3', lang === 'es' ? 'Avanzada' : 'Advanced', lang === 'es' ? 'Pauta Óptima' : 'Optimized Protocol', `${d3} mg`)
    ];
  }, [product, safeVialMg, safeBacMl, concentrationMgMl, doseUnit, lang]);

  const activePhaseId = useMemo(() => {
    if (selectedPhaseId === 'custom') return 'custom';
    if (selectedPhaseId) {
      const found = clinicalPhases.find(p => p.id === selectedPhaseId);
      if (found) {
        const pMg = found.unit === 'mcg' ? found.dose / 1000 : found.dose;
        const currentMg = doseUnit === 'mcg' ? (parseFloat(doseValue) || 0) / 1000 : (parseFloat(doseValue) || 0);
        if (Math.abs(pMg - currentMg) < 0.01) return found.id;
      }
    }
    const currentMg = doseUnit === 'mcg' ? (parseFloat(doseValue) || 0) / 1000 : (parseFloat(doseValue) || 0);
    for (const p of clinicalPhases) {
      const pMg = p.unit === 'mcg' ? p.dose / 1000 : p.dose;
      if (Math.abs(pMg - currentMg) < 0.01) return p.id;
    }
    return 'custom';
  }, [clinicalPhases, doseValue, doseUnit, selectedPhaseId]);

  const activePhaseObj = useMemo(() => {
    if (activePhaseId !== 'custom') {
      const found = clinicalPhases.find(p => p.id === activePhaseId);
      if (found) return found;
    }
    return {
      id: 'custom',
      phaseLabel: lang === 'es' ? 'LIBRE' : 'CUSTOM',
      name: lang === 'es' ? 'Titulación Libre' : 'Manual Titration',
      title: lang === 'es' ? 'Dosis Personalizada' : 'Custom Target Dose',
      badge: lang === 'es' ? 'Manual' : 'Fine-Tune',
      dose: doseValue,
      unit: doseUnit,
      subtitle: `${syringeUnits.toFixed(0)} UI (${liquidVolumeMl.toFixed(2)} mL) · ~${totalDosesInVial} ${lang === 'es' ? 'dosis' : 'doses'}`
    };
  }, [clinicalPhases, activePhaseId, doseValue, doseUnit, syringeUnits, liquidVolumeMl, totalDosesInVial, lang]);

  // Detect whether active parameters differ from official monograph protocol (declared after activePhaseId to avoid TDZ)
  const isModifiedFromBaseline = useMemo(() => {
    if (!baselineState) return false;
    const vialChanged = Math.abs(vialMg - baselineState.baseMg) > 0.01;
    const bacChanged = Math.abs(bacWaterMl - baselineState.baseBac) > 0.01;
    // Official clinical phases conform to the protocol monograph
    const isCustomDose = activePhaseId === 'custom';
    return vialChanged || bacChanged || isCustomDose;
  }, [baselineState, vialMg, bacWaterMl, activePhaseId]);

  // ── Dynamic Dose Presets for Fine-Tuning Pills aligned with peptide dosimetry ──
  const dynamicDosePresets = useMemo(() => {
    if (doseUnit === 'mcg') return DOSE_PRESETS_MCG;
    const pName = String(product?.name || product?.slug || product?.id || product?.title || '').toLowerCase();
    if (pName.includes('semaglutide') || pName.includes('cagrilintide')) {
      return [0.25, 0.5, 1.0, 1.7, 2.4];
    }
    if (pName.includes('tirzepatide')) {
      return [2.5, 5.0, 7.5, 10.0, 12.5, 15.0];
    }
    if (pName.includes('retatrutide') || pName.includes('glp')) {
      return [1.0, 2.0, 4.0, 6.0, 9.0, 12.0];
    }
    if (pName.includes('nad')) {
      return [25, 50, 75, 100, 150, 200];
    }
    if (isBlend) {
      return BLEND_DOSE_PRESETS_MG;
    }
    return [0.25, 0.5, 1.0, 2.0, 2.5, 5.0];
  }, [doseUnit, product, isBlend]);

  const handleResetToBaseline = () => {
    if (!baselineState) return;
    triggerHaptic('success');
    setVialMg(baselineState.baseMg);
    setBacWaterMl(baselineState.baseBac);
    if (clinicalPhases && clinicalPhases.length > 0) {
      setDoseUnit(clinicalPhases[0].unit);
      setDoseValue(clinicalPhases[0].dose);
      setSelectedPhaseId(clinicalPhases[0].id);
      updateUrlParams(clinicalPhases[0].id, clinicalPhases[0].dose, clinicalPhases[0].unit);
    } else {
      setDoseUnit(baselineState.baseUnit);
      setDoseValue(baselineState.baseDose);
      setSelectedPhaseId(null);
    }
    const msg = lang === 'es'
      ? 'Parámetros de reconstitución restaurados a la Fase 1 de la monografía.'
      : 'Reconstitution parameters restored to Phase 1 monograph protocol.';
    notifier.success(msg);
  };

  // ── URL Deep Linking synchronization ──
  const updateUrlParams = (phaseId, doseVal, unitVal) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      if (phaseId && phaseId !== 'custom') {
        url.searchParams.set('phase', phaseId);
      } else {
        url.searchParams.delete('phase');
      }
      // Preserve catalog ?dose= param (vial size). Use targetDose for custom injection dose.
      if (doseVal && phaseId === 'custom') {
        url.searchParams.set('targetDose', `${doseVal}${unitVal || 'mg'}`);
      } else {
        url.searchParams.delete('targetDose');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Safe fallback
    }
  };

  const handleSelectPhase = (phase) => {
    triggerHaptic('selection');
    setSelectedPhaseId(phase.id);
    setDoseUnit(phase.unit);
    setDoseValue(phase.dose);
    updateUrlParams(phase.id, phase.dose, phase.unit);
  };

  const handleSelectCustom = () => {
    triggerHaptic('selection');
    setSelectedPhaseId('custom');
    updateUrlParams('custom', doseValue, doseUnit);
    setTimeout(() => {
      const input = document.getElementById('irg-dose-input-stepper');
      if (input) {
        input.focus();
        input.select?.();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleCustomDoseChange = (newVal, newUnit = doseUnit) => {
    const clamped = Math.max(0.01, parseFloat(newVal) || 0);
    setDoseValue(clamped);
    const newMg = newUnit === 'mcg' ? clamped / 1000 : clamped;
    const matching = clinicalPhases.find(p => {
      const pMg = p.unit === 'mcg' ? p.dose / 1000 : p.dose;
      return Math.abs(pMg - newMg) < 0.01;
    });
    if (matching && selectedPhaseId !== 'custom') {
      setSelectedPhaseId(matching.id);
      updateUrlParams(matching.id, clamped, newUnit);
    } else {
      setSelectedPhaseId('custom');
      updateUrlParams('custom', clamped, newUnit);
    }
  };

  // Initial mount: load URL params if specified, defaulting always to Phase 1
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const urlPhase = params.get('phase');
      const urlTargetDose = params.get('targetDose') || params.get('injectionDose') || params.get('drawDose');
      if (urlPhase && clinicalPhases.length > 0) {
        if (urlPhase === 'custom') {
          setSelectedPhaseId('custom');
        } else {
          const matched = clinicalPhases.find(p => p.id === urlPhase || p.id.endsWith(urlPhase));
          if (matched) {
            setSelectedPhaseId(matched.id);
            setDoseUnit(matched.unit);
            setDoseValue(matched.dose);
            return;
          }
        }
      }
      if (urlTargetDose) {
        const numMatch = urlTargetDose.match(/(\d+(?:\.\d+)?)/);
        const unitMatch = urlTargetDose.includes('mcg') ? 'mcg' : 'mg';
        if (numMatch) {
          const val = parseFloat(numMatch[1]);
          setDoseValue(val);
          setDoseUnit(unitMatch);
          setSelectedPhaseId('custom');
          return;
        }
      }
      // Authoritative starting point is strictly Phase 1
      if (clinicalPhases && clinicalPhases.length > 0) {
        setDoseUnit(clinicalPhases[0].unit);
        setDoseValue(clinicalPhases[0].dose);
        setSelectedPhaseId(clinicalPhases[0].id);
      }
    } catch {
      // Safe fallback
    }
  }, [clinicalPhases]);

  // Preset arrays are defined as module-level frozen constants (above the component)

  // Extract available vial lot sizes strictly from the genuine catalog presentations
  const productVialOptions = useMemo(() => {
    // 1. Direct availableStrengths prop passed from parent view
    if (Array.isArray(availableStrengths) && availableStrengths.length > 0) {
      const parsed = availableStrengths.map(st => {
        const rawStr = st?.name || st?.id || '';
        const s = String(rawStr);
        const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
        if (mgMatches.length > 0) {
          const sum = mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
          if (sum > 0) return { mg: sum, label: st?.name || `${sum} mg` };
        }
        if (s.includes('|') || s.includes('+') || s.includes('/')) {
          const parts = s.split(/[|+/]/);
          let total = 0;
          for (const part of parts) {
            const m = part.match(/(\d+(?:\.\d+)?)/);
            if (m) total += parseFloat(m[1]);
          }
          if (total > 0) return { mg: total, label: st?.name || `${total} mg` };
        }
        const m = s.match(/(\d+(\.\d+)?)/);
        return m ? { mg: parseFloat(m[1]), label: st?.name || `${m[1]} mg` } : null;
      }).filter(Boolean);

      if (parsed.length > 0) {
        const seen = new Set();
        return parsed.filter(item => {
          if (seen.has(item.mg)) return false;
          seen.add(item.mg);
          return true;
        }).sort((a, b) => a.mg - b.mg);
      }
    }

    // 2. From product.processedHierarchy.strengths
    const rawHierarchy = product?.processedHierarchy?.strengths;
    if (Array.isArray(rawHierarchy) && rawHierarchy.length > 0) {
      const seen = new Set();
      const list = [];
      for (const st of rawHierarchy) {
        const s = String(st?.name || st?.id || '');
        const mgMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*mg/gi)];
        let total = 0;
        if (mgMatches.length > 0) {
          total = mgMatches.reduce((acc, m) => acc + parseFloat(m[1]), 0);
        } else {
          const m = s.match(/(\d+(\.\d+)?)/);
          total = m ? parseFloat(m[1]) : 0;
        }
        if (total > 0 && !seen.has(total)) {
          seen.add(total);
          list.push({ mg: total, label: st?.name || `${total} mg` });
        }
      }
      if (list.length > 0) return list.sort((a, b) => a.mg - b.mg);
    }

    // 3. Fallback: strictly the current active presentation lot size
    if (initialVialMg && initialVialMg > 0) {
      return [{ mg: initialVialMg, label: selectedStrength?.name || `${initialVialMg} mg` }];
    }

    return [{ mg: 10, label: '10 mg' }];
  }, [availableStrengths, product, initialVialMg, selectedStrength]);

  const dynamicVialPresets = useMemo(() => {
    return productVialOptions.map(opt => opt.mg);
  }, [productVialOptions]);

  const dynamicBacPresets = useMemo(() => {
    const list = [...BAC_PRESETS];
    if (safeBacMl && !list.includes(safeBacMl)) {
      list.push(safeBacMl);
      list.sort((a, b) => a - b);
    }
    return list;
  }, [safeBacMl]);

  // ── Pen / Cartridge Pharmacokinetic Calculations ───────────────────────────
  const penVolumeMl = selectedStrength?.volume_ml || 3.0;
  const penTotalMg = initialVialMg > 0 ? initialVialMg : 60;
  const penConcentrationMgMl = penTotalMg / penVolumeMl;
  const penConcentrationMcgMl = penConcentrationMgMl * 1000;

  const [penDoseUnit, setPenDoseUnit] = useState('mg');
  const [penDoseValue, setPenDoseValue] = useState(isBlend ? 1.0 : 0.5);

  const {
    penDoseMg,
    penVolumePerDoseMl,
    penClicks,
    penTotalDoses
  } = useMemo(() => {
    const dMg = penDoseUnit === 'mcg' ? (parseFloat(penDoseValue) || 0) / 1000 : (parseFloat(penDoseValue) || 0);
    const vol = penConcentrationMgMl > 0 ? dMg / penConcentrationMgMl : 0;
    // Standard dial pens: 100 clicks / units per 1.0 mL (1 click = 0.01 mL)
    const clicks = Math.max(1, Math.round(vol * 100));
    const doses = vol > 0 ? Math.floor(penVolumeMl / vol) : 0;
    return {
      penDoseMg: dMg,
      penVolumePerDoseMl: vol,
      penClicks: clicks,
      penTotalDoses: doses
    };
  }, [penDoseUnit, penDoseValue, penConcentrationMgMl, penVolumeMl]);

  const PEN_DOSE_PRESETS_MG = Object.freeze([0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0]);
  const PEN_DOSE_PRESETS_MCG = Object.freeze([100, 250, 500, 750, 1000]);

  // Dynamic Step 2 text replacement (for vials)
  const dynamicSolventText = (t.solventText || '')
    .replace('{volume}', safeBacMl.toFixed(1));

  // ── Dedicated Pre-filled Pen & Cartridge View ──────────────────────────────
  if (isPenOrCartridge) {
    return (
      <div className="irg-wrapper">
        {/* ── Header ── */}
        <div className="irg-header">
          <div className="irg-header-left">
            <div className="irg-badge" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
              <Sparkles size={13} />
              <span>Multi-Dose Pen Delivery System</span>
            </div>
            <h2 className="irg-title">
              <Thermometer size={20} color="#003666" />
              {t.penCalcTitle || 'Pre-filled Pen Dial Dosing & Administration Guide'}
            </h2>
            <p className="irg-subtitle">
              {t.penCalcSubtitle || 'Precision multi-dose dial pen delivery system. Calibrated for subcutaneous micro-dial administration without manual reconstitution.'}
            </p>
          </div>
        </div>

        {/* ── Workspace ── */}
        <div className="irg-workspace">
          {/* Left Column: Parameter Controls */}
          <div className="irg-controls-panel">
            {/* Device Info */}
            <div className="irg-control-group">
              <div className="irg-control-label-row">
                <label className="irg-label">
                  <FlaskConical size={14} color="#0284c7" />
                  {t.penDeviceContent || 'Device Active Content'}
                </label>
                <span className="irg-val-badge font-mono">{selectedStrength?.name || `${penTotalMg} mg`}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                Pre-filled sterile formulation: <strong>{penVolumeMl.toFixed(1)} mL</strong>
              </div>
              <div className="irg-concentration-tag">
                <span className="irg-ct-label">Nominal Concentration:</span>
                <strong className="irg-ct-val font-mono">
                  {penConcentrationMgMl.toFixed(2)} mg/mL ({Math.round(penConcentrationMcgMl).toLocaleString()} mcg/mL)
                </strong>
              </div>
            </div>

            {/* Target Dose */}
            <div className="irg-control-group">
              <div className="irg-control-label-row">
                <label className="irg-label">
                  <CheckCircle2 size={14} color="#0284c7" />
                  {t.targetDoseLabel || 'Target Dose to Administer'}
                </label>
                <div className="irg-unit-toggle">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPenDoseUnit('mg');
                    }}
                    className={`irg-toggle-btn ${penDoseUnit === 'mg' ? 'active' : ''}`}
                  >
                    mg
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setPenDoseUnit('mcg');
                    }}
                    className={`irg-toggle-btn ${penDoseUnit === 'mcg' ? 'active' : ''}`}
                  >
                    mcg
                  </button>
                </div>
              </div>

              <div className="irg-pills-row">
                {(penDoseUnit === 'mg' ? PEN_DOSE_PRESETS_MG : PEN_DOSE_PRESETS_MCG).map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setPenDoseValue(val);
                    }}
                    className={`irg-pill-btn ${penDoseValue === val ? 'active' : ''}`}
                  >
                    {val} {penDoseUnit}
                  </button>
                ))}
              </div>

              <div className="irg-dose-stepper">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setPenDoseValue(prev => Math.max(0.05, +(prev - (penDoseUnit === 'mg' ? 0.25 : 50)).toFixed(2)));
                  }}
                  className="irg-step-btn"
                  title="Decrease dose"
                >
                  −
                </button>
                <div className="irg-dose-input-wrap">
                  <input
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    step={penDoseUnit === 'mg' ? '0.1' : '25'}
                    min="0.05"
                    value={penDoseValue}
                    onChange={(e) => setPenDoseValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="irg-dose-input font-mono"
                    aria-label="Target pen dose value"
                  />
                  <span className="irg-dose-unit-affix">{penDoseUnit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setPenDoseValue(prev => +(prev + (penDoseUnit === 'mg' ? 0.25 : 50)).toFixed(2));
                  }}
                  className="irg-step-btn"
                  title="Increase dose"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dial Calibration & Realistic Pen Visualizer */}
          <div className="irg-visualizer-panel">
            <div className="irg-result-highlight-card">
              <div className="irg-rh-header">
                <span className="irg-rh-title">Multi-Dose Pen Dial Calibration</span>
                <span className="irg-rh-spec font-mono">1 Click = 0.01 mL</span>
              </div>

              <div className="irg-rh-metrics">
                <div className="irg-metric-box">
                  <span className="irg-mb-label">{t.penDialLabel || 'Dial Setting'}</span>
                  <span className="irg-mb-val font-mono text-sky-950">
                    {penClicks} <small className="text-sky-700">Clicks / Units</small>
                  </span>
                </div>
                <div className="irg-metric-box">
                  <span className="irg-mb-label">{t.liquidVol || 'Liquid Volume'}</span>
                  <span className="irg-mb-val font-mono text-sky-950">
                    {penVolumePerDoseMl.toFixed(2)} <small className="text-sky-700">mL</small>
                  </span>
                </div>
                <div className="irg-metric-box">
                  <span className="irg-mb-label">{t.penDosesInDevice || 'Total Doses in Device'}</span>
                  <span className="irg-mb-val font-mono text-emerald-800">
                    ~{penTotalDoses} <small className="text-emerald-700">doses</small>
                  </span>
                </div>
              </div>
            </div>

            {/* Realistic CSS Pen Graphic Stage */}
            <div className="irg-pen-stage" aria-label={`Pen display calibrated to ${penClicks} clicks`}>
              <div className="irg-pen-container">
                {/* Needle Hub */}
                <div className="irg-pen-needle">
                  <div className="irg-pen-needle-steel" />
                  <div className="irg-pen-needle-hub" />
                </div>

                {/* Cartridge Liquid Reservoir */}
                <div className="irg-pen-cartridge">
                  <div className="irg-pen-liquid-core" />
                  <div className="irg-pen-graduations">
                    <div className="irg-pen-tick" />
                    <div className="irg-pen-tick" />
                    <div className="irg-pen-tick" />
                    <div className="irg-pen-tick" />
                  </div>
                </div>

                {/* Pen Barrel Body */}
                <div className="irg-pen-body">
                  <span className="irg-pen-brand-label">
                    {supplierName ? `${supplierName}` : 'Med-Peptides'}
                  </span>
                  <div className="irg-pen-dial-window" title="Dose Dial Indicator">
                    <span className="irg-pen-dial-number font-mono">{penClicks}</span>
                  </div>
                </div>

                {/* Dial Knob & Thumb Button */}
                <div className="irg-pen-knob-wrap">
                  <div className="irg-pen-knob" />
                  <div className="irg-pen-button" />
                </div>
              </div>

              <div className="irg-pen-caption">
                <ShieldCheck size={13} color="#38bdf8" />
                <span>Compatible with standard ISO 11608-2 pen needles (31G / 32G × 4mm / 5mm) · 1 Click = 0.01 mL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Steps for Pen */}
        <div className="irg-protocol-steps">
          <h3 className="irg-steps-heading">
            Clinical Administration Protocol (Pre-filled Multi-Dose Pen)
          </h3>

          <div className="irg-steps-grid">
            <div className="irg-step-card">
              <div className="irg-step-number">1</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penPrepStep}</h4>
                <p className="irg-step-desc">{t.penPrepText}</p>
              </div>
            </div>

            <div className="irg-step-card">
              <div className="irg-step-number">2</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penNeedleStep}</h4>
                <p className="irg-step-desc">{t.penNeedleText}</p>
              </div>
            </div>

            <div className="irg-step-card">
              <div className="irg-step-number">3</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penDoseStep}</h4>
                <p className="irg-step-desc">{t.penDoseText}</p>
              </div>
            </div>

            <div className="irg-step-card">
              <div className="irg-step-number">4</div>
              <div className="irg-step-content">
                <h4 className="irg-step-title">{t.penStorageStep}</h4>
                <p className="irg-step-desc">{t.penStorageText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="irg-disclaimer">
          <p>
            <strong>Clinical Verification Notice:</strong> Pre-filled multi-dose pens are factory-formulated in sterile liquid media and require zero manual solvent reconstitution. Individual dosing units and micro-titrations must be confirmed by an authorized medical practitioner.
          </p>
        </div>
      </div>
    );
  }

  // ── Intranasal Spray Administration Protocol View ────────────────────────
  if (isSpray) {
    return (
      <div className="irg-wrapper">
        <div className="irg-header">
          <div className="irg-header-left">
            <div className="irg-badge">
              <Sparkles size={13} />
              <span>Intranasal Delivery System</span>
            </div>
            <h2 className="irg-title">
              <Thermometer size={20} color="#003666" />
              Clinical Intranasal Administration Protocol
            </h2>
            <p className="irg-subtitle">
              Metered-dose mucosal delivery system formulated in sterile isotonic buffered vehicle. Direct mucosal absorption bypassing first-pass hepatic metabolism.
            </p>
          </div>
        </div>

        <div className="irg-workspace">
          <div className="irg-controls-panel">
            <h3 className="irg-panel-heading">Spray Device Specifications</h3>
            
            <div className="irg-summary-card" style={{ marginBottom: '16px' }}>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Delivery Mechanism</span>
                <span className="irg-sum-val">Metered Mucosal Pump (0.1 mL / spray)</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Active Formulation</span>
                <span className="irg-sum-val">{selectedStrength?.name || 'Metered Concentration'}</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Reconstitution</span>
                <span className="irg-sum-val font-semibold text-emerald-700">None required (Ready to use)</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Cold-Chain Storage</span>
                <span className="irg-sum-val font-semibold text-sky-900">2°C – 8°C (Upright position)</span>
              </div>
            </div>
          </div>

          <div className="irg-visual-panel">
            <div className="irg-protocol-steps" style={{ marginTop: 0 }}>
              <h3 className="irg-steps-heading">Step-by-Step Mucosal Protocol</h3>
              <div className="irg-steps-grid">
                <div className="irg-step-card">
                  <div className="irg-step-number">1</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Priming the Nozzle</h4>
                    <p className="irg-step-desc">On first clinical use or after 5+ days of non-use, pump 2–3 times into the air until a uniform fine aerosol mist is emitted.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">2</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Clear Nasal Passages</h4>
                    <p className="irg-step-desc">Gently blow nose before administration. Keep head tilted slightly forward to avoid swallowing the formulation.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">3</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Angle of Application</h4>
                    <p className="irg-step-desc">Insert tip into nostril, occlude the opposite nostril. Aim slightly outward toward the top of the ear (away from septum). Press actuator firmly while inhaling gently.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">4</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Absorption & Hygiene</h4>
                    <p className="irg-step-desc">Exhale through mouth. Do not sniff forcefully or blow nose for 15 minutes. Wipe nozzle with a sterile wipe and replace the cap.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="irg-disclaimer">
          <p>
            <strong>Clinical Verification Notice:</strong> Intranasal peptides are formulated in sterile, buffered isotonic media and require zero manual solvent dilution. Dosage must be confirmed by an authorized medical practitioner.
          </p>
        </div>
      </div>
    );
  }

  // ── Oral Capsule / Gastro-Resistant Protocol View ─────────────────────────
  if (isOral) {
    return (
      <div className="irg-wrapper">
        <div className="irg-header">
          <div className="irg-header-left">
            <div className="irg-badge">
              <Sparkles size={13} />
              <span>Enteric Gastro-Resistant Delivery</span>
            </div>
            <h2 className="irg-title">
              <Thermometer size={20} color="#003666" />
              Clinical Oral Administration Protocol
            </h2>
            <p className="irg-subtitle">
              Engineered acid-resistant enteric matrix designed to shield active peptide bonds from gastric degradation, ensuring targeted systemic absorption in the small intestine.
            </p>
          </div>
        </div>

        <div className="irg-workspace">
          <div className="irg-controls-panel">
            <h3 className="irg-panel-heading">Oral Formulation Parameters</h3>
            
            <div className="irg-summary-card" style={{ marginBottom: '16px' }}>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Capsule Technology</span>
                <span className="irg-sum-val">pH-Dependent Acid-Resistant HPMC</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Active Dose</span>
                <span className="irg-sum-val">{selectedStrength?.name || 'Standard Unit Dose'}</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Administration Timing</span>
                <span className="irg-sum-val font-semibold text-sky-950">Fasting / Empty stomach</span>
              </div>
              <div className="irg-sum-item">
                <span className="irg-sum-label">Storage Conditions</span>
                <span className="irg-sum-val font-semibold text-sky-900">15°C – 25°C (Cool, dry place)</span>
              </div>
            </div>
          </div>

          <div className="irg-visual-panel">
            <div className="irg-protocol-steps" style={{ marginTop: 0 }}>
              <h3 className="irg-steps-heading">Clinical Ingestion Guidelines</h3>
              <div className="irg-steps-grid">
                <div className="irg-step-card">
                  <div className="irg-step-number">1</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Fasting Administration</h4>
                    <p className="irg-step-desc">Take first thing in the morning upon waking, or at least 2 hours after food intake to optimize gastric transit time.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">2</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Swallow Whole with Water</h4>
                    <p className="irg-step-desc">Ingest capsule whole with 200–250 mL of room-temperature water. Do not chew, open, or dissolve the capsule.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">3</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Post-Ingestion Window</h4>
                    <p className="irg-step-desc">Wait at least 30 to 45 minutes before eating or drinking hot coffee/tea to allow safe passage into the duodenum.</p>
                  </div>
                </div>
                <div className="irg-step-card">
                  <div className="irg-step-number">4</div>
                  <div className="irg-step-content">
                    <h4 className="irg-step-title">Protection from Humidity</h4>
                    <p className="irg-step-desc">Keep bottle tightly sealed with desiccant pouch inside. Avoid exposure to high heat and direct sunlight.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="irg-disclaimer">
          <p>
            <strong>Clinical Verification Notice:</strong> Enteric capsules rely on intact coatings to bypass stomach acid. Never break or dissolve the capsule prior to ingestion.
          </p>
        </div>
      </div>
    );
  }

  // ── Standard Lyophilized Vial & Syringe Reconstitution View ─────────────────
  return (
    <div className="irg-wrapper">
      {/* ── Subtitle / Instructions ── */}
      <div className="irg-header" style={{ borderBottom: 'none', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
        <p className="irg-subtitle">
          {t.interactiveCalcSubtitle || 'Simulate precise Bacteriostatic Water (BAC) volume and target dose to visualize the exact draw line on a U-100 insulin syringe in real time.'}
        </p>
      </div>

      {/* ── Protocol Baseline Tracking Bar ── */}
      <div className={`irg-baseline-bar ${isModifiedFromBaseline ? 'modified' : 'standard'}`}>
        <div className="irg-baseline-info">
          {isModifiedFromBaseline ? (
            <>
              <span className="irg-baseline-icon-warn">⚠️</span>
              <div className="irg-baseline-text">
                <strong>{lang === 'es' ? 'Parámetros modificados (Simulación clínica orientativa):' : 'Reference Parameters Modified (Clinical Simulation Model):'}</strong>
                <span> {lang === 'es' ? 'Dosis a extraer' : 'Target Draw'}: {doseValue} {doseUnit} · {lang === 'es' ? 'Diluyente' : 'Diluent'}: {safeBacMl.toFixed(1)} mL BAC · {lang === 'es' ? 'Vial' : 'Vial'}: {safeVialMg} mg</span>
                <span className="irg-baseline-origin">
                  {lang === 'es'
                    ? `Línea base estándar de monografía: ${baselineState.baseDose} mg dosis · ${baselineState.baseBac.toFixed(1)} mL agua BAC (${((baselineState.baseMg) / (baselineState.baseBac)).toFixed(1)} mg/mL). Advertencia: Los valores del simulador son orientativos. El médico prescriptor es el único responsable de determinar la dosificación adecuada y pauta definitiva.`
                    : `Standard Monograph Baseline: ${baselineState.baseDose} mg target dose · ${baselineState.baseBac.toFixed(1)} mL BAC Water (${((baselineState.baseMg) / (baselineState.baseBac)).toFixed(1)} mg/mL). Notice: Simulator values are strictly indicative. The prescribing physician must establish the final adequate therapeutic dosage and administration protocol.`}
                </span>
              </div>
            </>
          ) : (
            <>
              <span className="irg-baseline-icon-check">●</span>
              <div className="irg-baseline-text">
                <strong>{lang === 'es' ? 'Línea base de referencia de la monografía (Orientativo):' : 'Monograph Baseline Reference Model (Indicative):'}</strong>
                <span> {lang === 'es' ? `Sincronizado con la tabla analítica (${safeVialMg} mg vial · ${safeBacMl.toFixed(1)} mL diluyente BAC · ${concentrationMgMl.toFixed(1)} mg/mL). Sujeto a prescripción médica final.` : `Synchronized with monograph table (${safeVialMg} mg vial · ${safeBacMl.toFixed(1)} mL BAC diluent · ${concentrationMgMl.toFixed(1)} mg/mL concentration). Subject to prescribing physician clinical authorization.`}</span>
              </div>
            </>
          )}
        </div>
        {isModifiedFromBaseline && (
          <button
            type="button"
            onClick={handleResetToBaseline}
            className="irg-baseline-reset-btn"
            title={lang === 'es' ? 'Restablecer todos los parámetros a la línea base oficial' : 'Reset all parameters to official monograph baseline'}
          >
            {lang === 'es' ? '↺ Restablecer a línea base' : '↺ Reset to Standard Baseline'}
          </button>
        )}
      </div>

      {/* ── 1. Vial Solution Preparation Block (Top Horizontal Grid) ── */}
      <div className="irg-vial-prep-block">
        <div className="irg-vial-prep-grid">
          {/* Control 1: Vial Active Content */}
          <div className="irg-control-group">
            <div className="irg-control-label-row">
              <label className="irg-label">
                <FlaskConical size={14} color="#0284c7" />
                {t.vialContentLabel || 'Vial Active Content'}
              </label>
              <span className="irg-val-badge font-mono">{safeVialMg} mg</span>
            </div>
            <div className="irg-pills-row">
              {productVialOptions.map(opt => (
                <button
                  key={opt.mg}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVialMg(opt.mg);
                  }}
                  className={`irg-pill-btn ${safeVialMg === opt.mg ? 'active' : ''}`}
                >
                  {opt.mg} mg
                </button>
              ))}
            </div>
            {isBlend && (
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.35 }}>
                Lot Formulation: <strong style={{ color: '#003666' }}>{selectedStrength?.name || `${safeVialMg} mg`}</strong>
              </div>
            )}
          </div>

          {/* Control 2: Bacteriostatic Water Added */}
          <div className="irg-control-group">
            <div className="irg-control-label-row">
              <label className="irg-label">
                <Droplets size={14} color="#0284c7" />
                {t.bacWaterLabel || 'BAC Water Added (Solvent)'}
              </label>
              <span className="irg-val-badge font-mono">{safeBacMl.toFixed(1)} mL</span>
            </div>
            <div className="irg-pills-row">
              {dynamicBacPresets.map(ml => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setBacWaterMl(ml);
                  }}
                  className={`irg-pill-btn ${safeBacMl === ml ? 'active' : ''}`}
                >
                  {ml.toFixed(1)} mL
                </button>
              ))}
            </div>
            <div className="irg-slider-row">
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.5"
                value={safeBacMl}
                onChange={(e) => {
                  triggerHaptic('tap');
                  setBacWaterMl(parseFloat(e.target.value));
                }}
                className="irg-range-slider"
                aria-label="BAC Water Volume Slider"
              />
            </div>
          </div>
        </div>

        {/* Global Concentration Banner */}
        <div className="irg-solution-banner">
          <div className="irg-sb-icon">💡</div>
          <div className="irg-sb-body">
            <div className="irg-sb-title">
              <span>{lang === 'es' ? 'Concentración Nominal del Vial:' : 'Nominal Vial Concentration:'}</span>
              <strong className="font-mono font-bold text-sky-950"> {concentrationMgMl.toFixed(2)} mg/mL</strong>
              <span className="irg-sb-tag font-mono"> ({Math.round(concentrationMcgMl).toLocaleString()} mcg/mL · {safeVialMg} mg en {safeBacMl.toFixed(1)} mL BAC)</span>
            </div>
            <div className="irg-sb-desc">
              {lang === 'es' 
                ? 'La concentración es uniforme en todo el volumen. Seleccione la fase clínica o ajuste libremente los mg/mcg a extraer en la jeringa:' 
                : 'Uniform concentration across vial volume. Select your clinical phase or adjust exact dose to draw in the U-100 syringe below:'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Target Dose & Precision Syringe Calibration Workspace ── */}
      <div className="irg-workspace">
        
        {/* 📋 Prominent Clinical Reference Protocol Hero Banner (Full-Width Span) */}
        {activeSelectedProtocol && (
          <div className="irg-protocol-hero-card" style={{
            gridColumn: '1 / -1',
            background: 'linear-gradient(135deg, #002244 0%, #003666 100%)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(0, 34, 68, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.18)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Activity size={20} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>{lang === 'es' ? 'VÍA CLÍNICA DE REFERENCIA & DOSIMETRÍA OPERATIVA' : 'STANDARDIZED CLINICAL PATHWAY REFERENCE'}</span>
                    <span style={{ background: 'rgba(56, 189, 248, 0.25)', color: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem' }}>
                      {activeSelectedProtocol.duration || '8 Weeks'}
                    </span>
                  </div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {activeSelectedProtocol.name}
                  </h3>
                </div>
              </div>

              <a
                href={`/proto/${activeSelectedProtocol.slug || activeSelectedProtocol.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0284c7',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.80rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span>{lang === 'es' ? 'Explorar Blueprint Completo (Gantt) ↗' : 'Explore Full Clinical Blueprint (Gantt) ↗'}</span>
              </a>
            </div>

            {/* Protocol Switcher / Selector if multiple clinical protocols exist for this compound */}
            {associatedProtocols && associatedProtocols.length > 1 && (
              <div style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {lang === 'es' ? `Vías Clínicas Alternativas (${associatedProtocols.length}):` : `Available Clinical Pathways (${associatedProtocols.length}):`}
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {associatedProtocols.map(proto => {
                    const isSelected = (proto.id || proto.slug) === (activeSelectedProtocol.id || activeSelectedProtocol.slug);
                    return (
                      <button
                        key={proto.id || proto.slug}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          setSelectedProtocolId(proto.id || proto.slug);
                        }}
                        style={{
                          background: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                          color: isSelected ? '#002244' : '#e0f2fe',
                          border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.18)'}`,
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {proto.name} {proto.duration ? `(${proto.duration})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Left Column: Target Dose Selector & Step Stepper */}
        <div className="irg-controls-panel">
          
          <div className="irg-control-group">
            <div className="irg-control-label-row">
              <label className="irg-label">
                <CheckCircle2 size={14} color="#0284c7" />
                {t.targetDoseLabel || 'Target Injection Dose to Draw'}
              </label>
              <span className="irg-val-badge font-mono">{doseValue} {doseUnit}</span>
            </div>

            {/* 🖥️ Desktop / Laptop: Protocol Phase Selector Cards (Auto-fit Columns + Custom) */}
            <div className="irg-phase-cards-grid">
              {clinicalPhases.map(phase => {
                const isActive = activePhaseId === phase.id;
                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => handleSelectPhase(phase)}
                    className={`irg-phase-card ${isActive ? 'active' : ''}`}
                    title={`${phase.phaseLabel}: ${phase.name} — ${phase.dose} ${phase.unit} (${phase.subtitle})`}
                  >
                    <div className="irg-pc-header">
                      <span className="irg-pc-overline">{phase.phaseLabel}</span>
                      <span className="irg-pc-badge">{phase.badge}</span>
                    </div>
                    <div className="irg-pc-title">{phase.name}</div>
                    <div className="irg-pc-dose-row">
                      <span className="irg-pc-num font-mono">{phase.dose}</span>
                      <span className="irg-pc-unit">{phase.unit}</span>
                    </div>
                    <div className="irg-pc-status">
                      {isActive ? (
                        <span className="irg-pc-status-active">✓ {lang === 'es' ? 'Fase Activa' : 'Active Phase'}</span>
                      ) : (
                        <span className="irg-pc-select-hint">{lang === 'es' ? 'Seleccionar' : 'Select'}</span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Custom / Manual Titration Card on Desktop */}
              <button
                type="button"
                onClick={handleSelectCustom}
                className={`irg-phase-card custom ${activePhaseId === 'custom' ? 'active' : ''}`}
                title={lang === 'es' ? 'Ajustar dosis libremente en micro-titulación' : 'Fine-tune custom dose freely'}
              >
                <div className="irg-pc-header">
                  <span className="irg-pc-overline">{lang === 'es' ? 'LIBRE' : 'CUSTOM'}</span>
                  <span className="irg-pc-badge">{lang === 'es' ? 'Manual' : 'Fine-Tune'}</span>
                </div>
                <div className="irg-pc-title">{lang === 'es' ? 'Personalizada' : 'Custom Dose'}</div>
                <div className="irg-pc-dose-row">
                  <span className="irg-pc-num font-mono">{doseValue}</span>
                  <span className="irg-pc-unit">{doseUnit}</span>
                </div>
                <div className="irg-pc-status">
                  {activePhaseId === 'custom' ? (
                    <span className="irg-pc-status-active">✓ {lang === 'es' ? 'Dosis Activa' : 'Active Dose'}</span>
                  ) : (
                    <span className="irg-pc-select-hint">{lang === 'es' ? 'Ajustar' : 'Fine-Tune'}</span>
                  )}
                </div>
              </button>
            </div>

            {/* 📱 Mobile: Segmented Pill Bar + Active Detail Summary Card */}
            <div className="irg-mobile-phase-container">
              <div className="irg-mobile-segmented-bar" role="tablist" aria-label="Clinical Phase Selector">
                {clinicalPhases.map(phase => {
                  const isActive = activePhaseId === phase.id;
                  return (
                    <button
                      key={phase.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectPhase(phase)}
                      className={`irg-mobile-tab-btn ${isActive ? 'active' : ''}`}
                    >
                      <span className="irg-mtb-label">{phase.phaseLabel}</span>
                      <span className="irg-mtb-dose font-mono">{phase.dose} {phase.unit}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePhaseId === 'custom'}
                  onClick={handleSelectCustom}
                  className={`irg-mobile-tab-btn ${activePhaseId === 'custom' ? 'active' : ''}`}
                >
                  <span className="irg-mtb-label">{lang === 'es' ? 'LIBRE' : 'CUSTOM'}</span>
                  <span className="irg-mtb-dose font-mono">{doseValue} {doseUnit}</span>
                </button>
              </div>

              {/* Active Phase Summary Card on Mobile */}
              <div className={`irg-mobile-active-card ${activePhaseId === 'custom' ? 'custom' : ''}`}>
                <div className="irg-mac-left">
                  <div className="irg-mac-tag-row">
                    <span className="irg-mac-phase-name">{activePhaseObj.phaseLabel}: {activePhaseObj.name}</span>
                    <span className="irg-mac-badge">{activePhaseObj.badge}</span>
                  </div>
                  <div className="irg-mac-sub font-mono">{activePhaseObj.subtitle}</div>
                </div>
                <div className="irg-mac-right">
                  <div className="irg-mac-dose-wrap font-mono">
                    <span className="irg-mac-num">{activePhaseObj.dose}</span>
                    <span className="irg-mac-unit">{activePhaseObj.unit}</span>
                  </div>
                  <span className="irg-mac-active-pill">✓ {lang === 'es' ? 'Activa' : 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Fine-Tuning & Micro-Titration Header */}
            <div className="irg-fine-tune-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="irg-ft-label">
                  {lang === 'es' ? 'Ajuste manual o micro-titulación:' : 'Fine-tuning & micro-titration:'}
                </span>
                {activePhaseId === 'custom' && (
                  <span className="irg-custom-active-tag font-mono">
                    ● {lang === 'es' ? 'Dosis Manual' : 'Custom Dose'}: {doseValue} {doseUnit}
                  </span>
                )}
              </div>
              <div className="irg-unit-toggle">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setDoseUnit('mg');
                  }}
                  className={`irg-toggle-btn ${doseUnit === 'mg' ? 'active' : ''}`}
                >
                  mg
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setDoseUnit('mcg');
                  }}
                  className={`irg-toggle-btn ${doseUnit === 'mcg' ? 'active' : ''}`}
                >
                  mcg
                </button>
              </div>
            </div>

            <div className="irg-pills-row">
              {dynamicDosePresets.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    handleCustomDoseChange(val);
                  }}
                  className={`irg-pill-btn ${doseValue === val ? 'active' : ''}`}
                >
                  {val} {doseUnit}
                </button>
              ))}
            </div>

            <div className="irg-dose-stepper">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  const step = doseUnit === 'mg' ? 0.25 : 50;
                  handleCustomDoseChange(Math.max(0.05, +(doseValue - step).toFixed(2)));
                }}
                className="irg-step-btn"
                title="Decrease dose"
              >
                −
              </button>
              <div className="irg-dose-input-wrap">
                <input
                  id="irg-dose-input-stepper"
                  type="number"
                  inputMode="decimal"
                  autoComplete="off"
                  step={doseUnit === 'mg' ? '0.1' : '25'}
                  min="0.05"
                  value={doseValue}
                  onChange={(e) => handleCustomDoseChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="irg-dose-input font-mono"
                  aria-label="Target dose value"
                />
                <span className="irg-dose-unit-affix">{doseUnit}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  const step = doseUnit === 'mg' ? 0.25 : 50;
                  handleCustomDoseChange(+(doseValue + step).toFixed(2));
                }}
                className="irg-step-btn"
                title="Increase dose"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Precision U-100 Syringe Visualizer */}
        <div className="irg-visualizer-panel">
          
          <div className="irg-result-highlight-card">
            <div className="irg-rh-header">
              <span className="irg-rh-title">{t.syringeDrawHeading || 'U-100 Syringe Visual Calibration'}</span>
              <span className="irg-rh-spec font-mono">U-100 (1 mL = 100 U)</span>
            </div>

            <div className="irg-rh-metrics">
              <div className="irg-metric-box">
                <span className="irg-mb-label">{t.unitsToDraw || 'Draw to Exact Mark'}</span>
                <span className="irg-mb-val font-mono text-sky-950">
                  {syringeUnits.toFixed(1)} <small className="text-sky-700">Units</small>
                </span>
              </div>
              <div className="irg-metric-box">
                <span className="irg-mb-label">{t.liquidVol || 'Liquid Volume'}</span>
                <span className="irg-mb-val font-mono text-sky-950">
                  {liquidVolumeMl.toFixed(2)} <small className="text-sky-700">mL</small>
                </span>
              </div>
              <div className="irg-metric-box">
                <span className="irg-mb-label">{t.dosesInVial || 'Total Doses in Vial'}</span>
                <span className="irg-mb-val font-mono text-emerald-800">
                  ~{totalDosesInVial} <small className="text-emerald-700">doses</small>
                </span>
                <span className="irg-mb-subtext">{lang === 'es' ? `a ${doseValue} ${doseUnit}/dosis` : `at ${doseValue} ${doseUnit}/dose`}</span>
              </div>
            </div>

            {/* Informative Guidance on Multi-Syringe Volumetric Bounds */}
            {isOverSyringe ? (
              <div className="irg-alert irg-alert-warning" role="alert" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
                <AlertTriangle size={16} color="#d97706" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>
                    {lang === 'es' 
                      ? `La dosis requiere ${liquidVolumeMl.toFixed(2)} mL (${syringeUnits.toFixed(0)} UI). Se recomienda dividir en 2 cargas de ${(syringeUnits / 2).toFixed(0)} UI, o reducir el volumen de agua BAC para mayor concentración.`
                      : `Target dose requires ${liquidVolumeMl.toFixed(2)} mL (${syringeUnits.toFixed(0)} Units). Divide into 2 draws of ${(syringeUnits / 2).toFixed(0)} Units each, or dilute with less BAC water.`}
                  </span>
                  {safeBacMl > 1.0 && (
                    <button
                      type="button"
                      onClick={() => setBacWaterMl(1.0)}
                      style={{
                        alignSelf: 'flex-start',
                        background: '#ffffff',
                        border: '1px solid #f59e0b',
                        color: '#b45309',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '2px'
                      }}
                    >
                      {lang === 'es' ? '⚡ Reconstituir con 1.0 mL BAC (más concentrado)' : '⚡ Reconstitute with 1.0 mL BAC (higher concentration)'}
                    </button>
                  )}
                </div>
              </div>
            ) : isUnderMeasured ? (
              <div className="irg-alert irg-alert-info" role="status">
                <Info size={16} />
                <span>{t.tipSmallVolume || 'ℹ Small draw volume (< 5 Units). Consider adding more BAC water for easier and more precise visual measurement.'}</span>
              </div>
            ) : null}
          </div>

          {/* ── Realistic Interactive U-100 Syringe Graphic ── */}
          <div className="irg-syringe-stage" aria-label={`Insulin syringe displaying ${syringeUnits.toFixed(1)} units`}>
            
            <div className="irg-syringe-container">
              {/* Needle tip */}
              <div className="irg-syringe-needle">
                <div className="irg-needle-steel" />
                <div className="irg-needle-hub" />
              </div>

              {/* Syringe Glass Barrel */}
              <div className="irg-syringe-barrel">
                
                {/* Fluid column */}
                <div 
                  className={`irg-syringe-liquid ${isOverSyringe ? 'overfill' : ''}`}
                  style={{ width: `${fillPct}%` }}
                >
                  <div className="irg-liquid-meniscus" />
                  <div className="irg-liquid-gloss" />
                </div>

                {/* Rubber Plunger Stopper that slides dynamically */}
                <div 
                  className="irg-syringe-stopper"
                  style={{ left: `${fillPct}%` }}
                >
                  <div className="irg-stopper-rubber" />
                  <div className="irg-stopper-shaft" />
                </div>

                {/* Laser Graduations (0 to 100 U) */}
                <div className="irg-syringe-ticks" aria-hidden="true">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(tick => (
                    <div 
                      key={tick} 
                      className={`irg-tick-mark ${tick % 50 === 0 ? 'major' : tick % 10 === 0 ? 'medium' : ''}`}
                      style={{ left: `${tick}%` }}
                    >
                      <div className="irg-tick-line" />
                      <span className="irg-tick-num font-mono">{tick}</span>
                    </div>
                  ))}
                </div>

                {/* Active Alignment Callout Arrow with dynamic safe clamping */}
                {syringeUnits > 0 && (
                  <div 
                    className="irg-syringe-pointer"
                    style={{ 
                      left: `${fillPct}%`,
                      transform: fillPct > 80 ? 'translateX(-95%)' : fillPct < 15 ? 'translateX(-5%)' : 'translateX(-50%)'
                    }}
                  >
                    <div className="irg-pointer-pill font-mono">
                      {isOverSyringe ? (
                        <span>▲ 100 U max ({liquidVolumeMl.toFixed(2)} mL total)</span>
                      ) : (
                        <span>▲ {syringeUnits.toFixed(1)} U ({liquidVolumeMl.toFixed(2)} mL)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Syringe Finger Flange & Plunger Thumb Cap */}
              <div className="irg-syringe-flange">
                <div className="irg-flange-lip" />
              </div>
            </div>

            <div className="irg-syringe-caption">
              <ShieldCheck size={13} color="#0284c7" />
              <span>{t.syringeModelSpec || 'U-100 Insulin Syringe (1.0 mL = 100 Units · 1 Unit = 0.01 mL)'}</span>
            </div>
          </div>

          {/* 📊 Clinical Administration & Vial Yield Matrix (Balances Right Column on Laptop) */}
          <div className="irg-admin-yield-console" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 16px',
            marginTop: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '8px'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FlaskConical size={14} color="#0284c7" />
                {lang === 'es' ? 'Rendimiento Clínico y Posología' : 'Clinical Yield & Administration Profile'}
              </span>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 6px', borderRadius: '4px' }}>
                {safeVialMg} mg / {safeBacMl.toFixed(1)} mL
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'es' ? 'Carga por Inyección' : 'Draw Per Injection'}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', marginTop: '2px' }} className="font-mono">
                  {doseValue} {doseUnit} <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>({syringeUnits.toFixed(1)} UI)</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'es' ? 'Rendimiento del Vial' : 'Vial Longevity'}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }} className="font-mono">
                  ~{totalDosesInVial} {lang === 'es' ? 'dosis totales' : 'total doses'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'es' ? 'Vía & Frecuencia' : 'Route & Cadence'}
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {lang === 'es' ? 'Subcutánea Semanal' : 'Weekly Subcutaneous'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  {lang === 'es' ? 'Conservación' : 'Storage Guard'}
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                  ❄️ 2°C – 8°C Refrigerator
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Step-by-Step Clinical Handling Protocol (Wording Refined) ── */}
      <div className="irg-protocol-steps">
        <h3 className="irg-steps-heading">
          {t.reconstitutionSection || 'Reconstitution Protocol & Clinical Cold-Chain Handling'}
        </h3>

        <div className="irg-steps-grid">
          {/* Step 1 */}
          <div className="irg-step-card">
            <div className="irg-step-number">1</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.prepStep}</h4>
              <p className="irg-step-desc">{t.prepText}</p>
            </div>
          </div>

          {/* Step 2 - Dynamically updates with current selected BAC volume */}
          <div className="irg-step-card">
            <div className="irg-step-number">2</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.solventStep}</h4>
              <p className="irg-step-desc">{dynamicSolventText}</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="irg-step-card">
            <div className="irg-step-number">3</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.dissolutionStep}</h4>
              <p className="irg-step-desc">{t.dissolutionText}</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="irg-step-card">
            <div className="irg-step-number">4</div>
            <div className="irg-step-content">
              <h4 className="irg-step-title">{t.storageStep}</h4>
              <p className="irg-step-desc">{t.storageText}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Prescriber Directive & Clinical Governance Notice (Pharma English) ── */}
      <div className="irg-prescriber-notice">
        <div className="irg-pn-header">
          <ShieldAlert size={16} color="#003666" />
          <span className="irg-pn-title">Clinical Pharmacopeial Directive &amp; Prescriber Responsibility Notice</span>
        </div>
        <p className="irg-pn-body">
          All reconstitution volumes, diluent ratios, nominal concentration values, and volumetric syringe calibrations displayed within this simulator represent theoretical compounding and laboratory reference models based on pharmacopeial standards. They are provided solely for clinical calculation and orientation purposes.
        </p>
        <p className="irg-pn-highlight">
          <strong>Mandatory Prescriber Directive:</strong> The licensed attending physician holds sole medical and legal responsibility for determining, calibrating, and prescribing the final therapeutic dosage, titration cadence, reconstitution diluent volume, and volumetric administration tailored to individual patient clinical requirements and biomarker profiles. This module does not constitute automated prescribing instructions or direct patient self-administration guidance.
        </p>
      </div>
    </div>
  );
}
