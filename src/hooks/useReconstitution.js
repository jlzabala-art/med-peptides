"use client";

import { useState, useMemo, useEffect } from 'react';

/**
 * Extracts numeric mg value from a presentation or strength string (e.g. "10 mg", "5mg Vial").
 * Returns fallback (default 10) when no numeric mg token is present.
 */
export function parseMgFromPresentation(raw, fallback = 10) {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
  const match = String(raw || '').match(/(\d+(?:\.\d+)?)\s*mg/i);
  return match ? parseFloat(match[1]) : fallback;
}

/**
 * Pure calculation helper shared across all reconstitution UIs and hooks.
 * Ensures a single mathematical source of truth across `/calculator`, product monographs, and protocols.
 */
export function computeReconstitutionMetrics({
  vialMg = 10,
  bacWaterMl = 2.0,
  desiredDoseMcg = 2500,
  syringeCapacityMl = 1.0,
}) {
  const safeMg = Math.max(0.01, Number(vialMg) || 10);
  const safeWater = Math.max(0.05, Number(bacWaterMl) || 2);
  const safeDose = Math.max(0.1, Number(desiredDoseMcg) || 250);
  const safeSyringeMl = [0.3, 0.5, 1.0].includes(Number(syringeCapacityMl)) ? Number(syringeCapacityMl) : 1.0;

  const totalMcg = safeMg * 1000;
  const concentrationMgMl = safeMg / safeWater;
  const concentrationMcgMl = totalMcg / safeWater;
  const concentrationMcgUnit = concentrationMcgMl / 100; // 1 U-100 insulin unit = 0.01 mL
  const unitsToInject = concentrationMcgUnit > 0 ? safeDose / concentrationMcgUnit : 0;
  const volumeMl = unitsToInject * 0.01;
  const totalDoses = safeDose > 0 ? Math.floor(totalMcg / safeDose) : 0;
  const penClicks = Math.round(unitsToInject);
  const maxSyringeUnits = Math.round(safeSyringeMl * 100);
  const syringeFillPct = maxSyringeUnits > 0 ? Math.min(100, (unitsToInject / maxSyringeUnits) * 100) : 0;
  const exceedsSyringe = unitsToInject > maxSyringeUnits;

  return {
    vialMg: safeMg,
    bacWaterMl: safeWater,
    desiredDoseMcg: safeDose,
    syringeCapacityMl: safeSyringeMl,
    totalMcg,
    concentrationMgMl: parseFloat(concentrationMgMl.toFixed(3)),
    concentrationMcgMl: parseFloat(concentrationMcgMl.toFixed(1)),
    concentrationMcgUnit: parseFloat(concentrationMcgUnit.toFixed(2)),
    unitsToInject: parseFloat(unitsToInject.toFixed(1)),
    volumeMl: parseFloat(volumeMl.toFixed(3)),
    totalDoses,
    penClicks,
    maxSyringeUnits,
    syringeFillPct: parseFloat(syringeFillPct.toFixed(1)),
    exceedsSyringe,
  };
}

/**
 * Unified Custom Hook for Peptide Reconstitution, U-100 Syringe Units & Micro-Click Pen Calculations.
 * Single source of truth used by `/calculator`, `ReconstitutionCalculator`, and protocol simulators.
 *
 * @param {Object} [product]
 * @param {Object} [variant]
 * @param {Object} [options]
 */
export function useReconstitution(product = null, variant = null, options = {}) {
  const defaultMg = useMemo(() => {
    if (options.initialVialMg != null && Number(options.initialVialMg) > 0) {
      return Number(options.initialVialMg);
    }
    const raw = variant?.dosage || variant?.name || product?.dosage || product?.name || '10mg';
    return parseMgFromPresentation(raw, 10);
  }, [product, variant, options.initialVialMg]);

  const [vialMg, setVialMg] = useState(defaultMg);
  const [bacWaterMl, setBacWaterMl] = useState(options.initialBacWaterMl ?? 2.0);
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(options.initialDoseMcg ?? 2500);
  const [syringeCapacityMl, setSyringeCapacityMl] = useState(options.initialSyringeMl ?? 1.0);

  useEffect(() => {
    setVialMg(defaultMg);
  }, [defaultMg]);

  const calculations = useMemo(
    () =>
      computeReconstitutionMetrics({
        vialMg,
        bacWaterMl,
        desiredDoseMcg,
        syringeCapacityMl,
      }),
    [vialMg, bacWaterMl, desiredDoseMcg, syringeCapacityMl]
  );

  return {
    vialMg,
    setVialMg,
    bacWaterMl,
    setBacWaterMl,
    desiredDoseMcg,
    setDesiredDoseMcg,
    syringeCapacityMl,
    setSyringeCapacityMl,
    ...calculations,
  };
}
