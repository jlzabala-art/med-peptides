/**
 * monographCalculationEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Single Source of Truth for Clinical Dosing, Diluent Calculation,
 * Syringe Volumetrics, and Multi-Week Procurement Forecasting.
 *
 * Adheres strictly to:
 * - Rule #15 / Section 15: No duplicate or scattered calculation logic.
 * - Single mathematical engine shared across Protocol Workspace, Reconstitution,
 *   Syringe Visualizer, Procurement Matrix, and Treatment Review.
 */

export const STANDARD_PRESENTATIONS = Object.freeze([
  { strengthMg: 5, format: 'Lyophilized vial', recommendedBacMl: 1.0, concentrationMgMl: 5.0, route: 'Subcutaneous' },
  { strengthMg: 10, format: 'Lyophilized vial', recommendedBacMl: 2.0, concentrationMgMl: 5.0, route: 'Subcutaneous' },
  { strengthMg: 20, format: 'Lyophilized vial', recommendedBacMl: 4.0, concentrationMgMl: 5.0, route: 'Subcutaneous' },
]);

/**
 * Calculates accurate clinical reconstitution parameters
 * @param {number} vialStrengthMg - Total API in the vial (e.g. 5, 10, 20)
 * @param {number} bacVolumeMl - Diluent volume added (e.g. 1.0, 2.0, 4.0)
 * @param {number} targetDoseMg - Clinical target dose per administration (e.g. 1.25)
 */
export function calculateReconstitution({
  vialStrengthMg = 10,
  bacVolumeMl = 2.0,
  targetDoseMg = 1.25,
}) {
  const safeStrength = Math.max(0.1, Number(vialStrengthMg) || 10);
  const safeBac = Math.max(0.1, Number(bacVolumeMl) || 2.0);
  const safeDose = Math.max(0.01, Number(targetDoseMg) || 1.25);

  // Authoritative math
  const concentrationMgMl = safeStrength / safeBac;
  const injectionVolumeMl = safeDose / concentrationMgMl;
  const syringeUnitsU100 = Math.round(injectionVolumeMl * 100 * 10) / 10;
  const dosesPerVial = Math.floor(safeStrength / safeDose);
  const unusedVialMg = Number((safeStrength - (dosesPerVial * safeDose)).toFixed(2));

  return {
    vialStrengthMg: safeStrength,
    bacVolumeMl: safeBac,
    targetDoseMg: safeDose,
    concentrationMgMl: Number(concentrationMgMl.toFixed(2)),
    concentrationDisplay: `${Number(concentrationMgMl.toFixed(2))} mg/mL`,
    injectionVolumeMl: Number(injectionVolumeMl.toFixed(3)),
    injectionVolumeDisplay: `${Number(injectionVolumeMl.toFixed(2))} mL`,
    syringeUnitsU100: Math.round(syringeUnitsU100),
    syringeUnitsDisplay: `${Math.round(syringeUnitsU100)} U`,
    dosesPerVial,
    unusedVialMg,
    efficiencyPercent: Math.round(((dosesPerVial * safeDose) / safeStrength) * 100),
  };
}

/**
 * Translates clinical protocol parameters into exact procurement and vial counts
 * @param {number} durationWeeks - Total weeks (e.g. 4, 12)
 * @param {number} administrationsPerWeek - Times per week (e.g. 2)
 * @param {number} dosePerAdminMg - Target dose per administration (e.g. 1.25)
 * @param {number} preferredVialStrength - Preferred vial strength (default: 10 mg)
 */
export function calculateProtocolProcurement({
  durationWeeks = 4,
  administrationsPerWeek = 2,
  dosePerAdminMg = 1.25,
  preferredVialStrength = 10,
}) {
  const weeks = Math.max(1, Number(durationWeeks) || 4);
  const freq = Math.max(0.5, Number(administrationsPerWeek) || 2);
  const dose = Math.max(0.01, Number(dosePerAdminMg) || 1.25);

  const totalAdministrations = Math.round(weeks * freq);
  const totalApiRequiredMg = Number((totalAdministrations * dose).toFixed(2));

  // Determine optimal vial distribution
  let recommendedVials;

  if (totalApiRequiredMg <= 5) {
    recommendedVials = [{ strength: 5, count: 1 }];
  } else if (totalApiRequiredMg <= 10) {
    if (preferredVialStrength === 5) {
      recommendedVials = [{ strength: 5, count: 2 }];
    } else {
      recommendedVials = [{ strength: 10, count: 1 }];
    }
  } else if (totalApiRequiredMg <= 20) {
    if (preferredVialStrength === 10) {
      recommendedVials = [{ strength: 10, count: 2 }];
    } else {
      recommendedVials = [{ strength: 20, count: 1 }];
    }
  } else if (totalApiRequiredMg <= 30) {
    // 30 mg treatment (e.g. 12 weeks): 1 x 20 mg + 1 x 10 mg OR 3 x 10 mg
    recommendedVials = [
      { strength: 20, count: 1 },
      { strength: 10, count: 1 }
    ];
  } else {
    // Scale modularly
    const count20 = Math.floor(totalApiRequiredMg / 20);
    const rem = totalApiRequiredMg % 20;
    const count10 = rem > 10 ? 2 : rem > 0 ? 1 : 0;
    recommendedVials = [
      ...(count20 > 0 ? [{ strength: 20, count: count20 }] : []),
      ...(count10 > 0 ? [{ strength: 10, count: count10 }] : [])
    ];
  }

  const totalProvidedApiMg = recommendedVials.reduce((acc, item) => acc + (item.strength * item.count), 0);
  const expectedUnusedMg = Number((totalProvidedApiMg - totalApiRequiredMg).toFixed(2));
  const totalVialCount = recommendedVials.reduce((acc, item) => acc + item.count, 0);

  const procurementSummary = recommendedVials
    .map(v => `${v.count} × ${v.strength} mg vial${v.count > 1 ? 's' : ''}`)
    .join(' + ');

  return {
    durationWeeks: weeks,
    administrationsPerWeek: freq,
    dosePerAdminMg: dose,
    totalAdministrations,
    totalApiRequiredMg,
    recommendedVials,
    totalVialCount,
    totalProvidedApiMg,
    expectedUnusedMg,
    procurementSummary,
    reasoningText: `${weeks}-week protocol at ${freq} doses/week (${totalAdministrations} total administrations × ${dose} mg) requires exactly ${totalApiRequiredMg} mg of API. Dispensed as ${procurementSummary} (${totalProvidedApiMg} mg total supply${expectedUnusedMg > 0 ? `, ${expectedUnusedMg} mg buffer` : ', zero wastage'}).`
  };
}
