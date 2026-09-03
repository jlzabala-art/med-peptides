"use client";

import { useState, useMemo } from 'react';

/**
 * @typedef {Object} ReconstitutionResult
 * @property {number} vialMg - Total peptide active content in mg.
 * @property {number} bacWaterMl - Added bacteriostatic water volume in mL.
 * @property {number} desiredDoseMcg - Desired dose in mcg.
 * @property {number} concentrationMgMl - Solution concentration in mg/mL.
 * @property {number} concentrationMcgUnit - Concentration per 1 insulin unit (0.01 mL).
 * @property {number} unitsToInject - Number of U-100 syringe units to inject.
 * @property {number} volumeMl - Volume to inject in mL.
 * @property {number} totalDoses - Total doses available in this vial.
 * @property {number} penClicks - Number of dial clicks for precision injector pen.
 */

/**
 * Custom Hook for Peptide Reconstitution & Micro-Click Pen Calculations
 *
 * @param {Object} product
 * @param {Object} variant
 * @returns {ReconstitutionResult & {
 *   vialMg: number,
 *   setVialMg: (v: number) => void,
 *   bacWaterMl: number,
 *   setBacWaterMl: (v: number) => void,
 *   desiredDoseMcg: number,
 *   setDesiredDoseMcg: (v: number) => void
 * }}
 */
export function useReconstitution(product, variant) {
  const defaultMg = useMemo(() => {
    const raw = variant?.dosage || product?.dosage || '10mg';
    const match = String(raw).match(/(\d+(\.\d+)?)\s*mg/i);
    return match ? parseFloat(match[1]) : 10;
  }, [product, variant]);

  const [vialMg, setVialMg] = useState(defaultMg);
  const [bacWaterMl, setBacWaterMl] = useState(2.0);
  const [desiredDoseMcg, setDesiredDoseMcg] = useState(2500); // 2.5mg default

  const calculations = useMemo(() => {
    const safeMg = Math.max(0.1, Number(vialMg) || 10);
    const safeWater = Math.max(0.1, Number(bacWaterMl) || 2);
    const safeDose = Math.max(1, Number(desiredDoseMcg) || 2500);

    const concentrationMgMl = safeMg / safeWater;
    const concentrationMcgUnit = (concentrationMgMl * 1000) / 100; // 1 unit = 0.01 mL
    const unitsToInject = safeDose / concentrationMcgUnit;
    const volumeMl = unitsToInject * 0.01;
    const totalDoses = Math.floor((safeMg * 1000) / safeDose);
    const penClicks = Math.round(unitsToInject);

    return {
      concentrationMgMl,
      concentrationMcgUnit,
      unitsToInject: parseFloat(unitsToInject.toFixed(1)),
      volumeMl: parseFloat(volumeMl.toFixed(3)),
      totalDoses,
      penClicks
    };
  }, [vialMg, bacWaterMl, desiredDoseMcg]);

  return {
    vialMg,
    setVialMg,
    bacWaterMl,
    setBacWaterMl,
    desiredDoseMcg,
    setDesiredDoseMcg,
    ...calculations
  };
}
