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
 * Translates clinical protocol parameters into exact procurement and container counts
 * @param {number} durationWeeks - Total weeks (e.g. 4, 12)
 * @param {number} administrationsPerWeek - Times per week (e.g. 2, 7)
 * @param {number} dosePerAdminMg - Target dose per administration (e.g. 1.25, 0.25)
 * @param {number} preferredVialStrength - Preferred vial strength (default: 10 mg)
 * @param {string} presentation - Delivery presentation ('nasal_spray' | 'prefilled_pen' | 'vial')
 * @param {string|number} selectedStrength - Active selected strength (e.g. '30 mg', '6 mg', 5)
 */
export function calculateProtocolProcurement({
  durationWeeks = 4,
  administrationsPerWeek = 2,
  dosePerAdminMg = 1.25,
  preferredVialStrength = 10,
  presentation = 'vial',
  selectedStrength = null
}) {
  const weeks = Math.max(1, Number(durationWeeks) || 4);
  const freq = Math.max(0.5, Number(administrationsPerWeek) || 2);
  const dose = Math.max(0.01, Number(dosePerAdminMg) || 1.25);

  const totalAdministrations = Math.round(weeks * freq);
  const totalApiRequiredMg = Number((totalAdministrations * dose).toFixed(2));

  const presNorm = String(presentation || '').toLowerCase();
  const isNasal = presNorm.includes('nasal') || presNorm.includes('spray');
  const isPen = presNorm.includes('pen') || presNorm.includes('cartridge');

  // ── NASAL SPRAY PROCUREMENT CALCULATION ──
  if (isNasal) {
    let bottleMg = 30;
    const strMatch = String(selectedStrength?.name || selectedStrength?.dosage || selectedStrength || '').match(/(\d+)/);
    if (strMatch) {
      const parsed = parseInt(strMatch[1], 10);
      if (parsed > 0) bottleMg = parsed;
    }

    // Determine actual container fill volume (e.g. 4 mL for 30 mg vs 10 mL for 75 mg)
    let containerVolumeMl = 10;
    const volMatch = String(
      selectedStrength?.fill_volume || 
      selectedStrength?.pack_size || 
      selectedStrength?.volume || 
      selectedStrength?.name || 
      selectedStrength?.id || 
      ''
    ).match(/(\d+(?:\.\d+)?)\s*m[lL]/i);

    if (volMatch) {
      containerVolumeMl = parseFloat(volMatch[1]);
    } else if (bottleMg === 30) {
      containerVolumeMl = 4; // Clinical standard for Magenta 30 mg nasal spray
    } else if (bottleMg === 75) {
      containerVolumeMl = 10;
    }

    const actuationVolumeMl = 0.10;
    const totalSpraysPerBottle = Math.max(10, Math.round(containerVolumeMl / actuationVolumeMl));
    const concentrationMgPerMl = Number((bottleMg / containerVolumeMl).toFixed(2));
    const dosePerSprayMg = Number((concentrationMgPerMl * actuationVolumeMl).toFixed(3));
    const dosePerSprayDisplay = dosePerSprayMg < 1 ? `${Math.round(dosePerSprayMg * 1000)} mcg` : `${dosePerSprayMg.toFixed(2)} mg`;

    // Sprays per dose based on target clinical dose vs potency per actuation
    const spraysPerDose = Math.max(1, Math.round(dose / Math.max(0.01, dosePerSprayMg)));
    const totalSpraysRequired = totalAdministrations * spraysPerDose;

    // Must satisfy both API requirements and total physical actuation count
    const bottlesByApi = Math.ceil(totalApiRequiredMg / bottleMg);
    const bottlesBySprays = Math.ceil(totalSpraysRequired / totalSpraysPerBottle);
    const bottleCount = Math.max(1, Math.max(bottlesByApi, bottlesBySprays));

    const totalProvidedApiMg = bottleCount * bottleMg;
    const expectedUnusedMg = Number((totalProvidedApiMg - totalApiRequiredMg).toFixed(2));
    const procurementSummary = `${bottleCount} × ${bottleMg} mg Nasal Spray Bottle${bottleCount > 1 ? 's' : ''} (${containerVolumeMl} mL)`;

    return {
      durationWeeks: weeks,
      administrationsPerWeek: freq,
      dosePerAdminMg: dose,
      totalAdministrations,
      totalSpraysRequired,
      spraysPerDose,
      totalApiRequiredMg,
      formatType: 'nasal_spray',
      unitStrengthMg: bottleMg,
      containerVolumeMl,
      totalSpraysPerBottle,
      concentrationMgPerMl,
      dosePerSprayMg,
      dosePerSprayDisplay,
      totalUnitsCount: bottleCount,
      totalProvidedApiMg,
      expectedUnusedMg,
      procurementSummary,
      recommendedUnits: [{ type: 'nasal_spray', strength: bottleMg, count: bottleCount, volumeMl: containerVolumeMl }],
      recommendedVials: [{ strength: bottleMg, count: bottleCount }], // Backward compatibility
      totalVialCount: bottleCount,
      reasoningText: `${weeks}-week intranasal protocol at ${freq} doses/week (${totalAdministrations} administrations, ~${totalSpraysRequired} metered puffs × ${dosePerSprayDisplay}) requires ${totalApiRequiredMg} mg total API. Fulfilled by ${procurementSummary} (${totalProvidedApiMg} mg total supply${expectedUnusedMg > 0 ? `, ${expectedUnusedMg} mg buffer` : ', exact requirement'}). Zero reconstitution required.`
    };
  }

  // ── PRE-FILLED MULTI-DOSE PEN PROCUREMENT CALCULATION ──
  if (isPen) {
    let penMg = 6;
    const strMatch = String(selectedStrength || '').match(/(\d+)/);
    if (strMatch) {
      const parsed = parseInt(strMatch[1], 10);
      if (parsed > 0) penMg = parsed;
    }

    const penCount = Math.max(1, Math.ceil(totalApiRequiredMg / penMg));
    const totalProvidedApiMg = penCount * penMg;
    const expectedUnusedMg = Number((totalProvidedApiMg - totalApiRequiredMg).toFixed(2));
    const procurementSummary = `${penCount} × ${penMg} mg Multi-Dose Pen${penCount > 1 ? 's' : ''} (3 mL)`;

    return {
      durationWeeks: weeks,
      administrationsPerWeek: freq,
      dosePerAdminMg: dose,
      totalAdministrations,
      totalApiRequiredMg,
      formatType: 'prefilled_pen',
      unitStrengthMg: penMg,
      containerVolumeMl: 3,
      totalUnitsCount: penCount,
      totalProvidedApiMg,
      expectedUnusedMg,
      procurementSummary,
      recommendedUnits: [{ type: 'prefilled_pen', strength: penMg, count: penCount, volumeMl: 3 }],
      recommendedVials: [{ strength: penMg, count: penCount }], // Backward compatibility
      totalVialCount: penCount,
      reasoningText: `${weeks}-week subcutaneous protocol at ${freq} doses/week (${totalAdministrations} total injections × ${dose >= 1 ? `${dose} mg` : `${Math.round(dose * 1000)} mcg`}) requires ${totalApiRequiredMg} mg total API. Fulfilled by ${procurementSummary} (${totalProvidedApiMg} mg total supply${expectedUnusedMg > 0 ? `, ${expectedUnusedMg} mg buffer` : ', exact requirement'}). Accompanied by sterile 31G/32G nano-needles.`
    };
  }

  // ── STANDARD LYOPHILIZED VIAL PROCUREMENT CALCULATION ──
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
    recommendedVials = [
      { strength: 20, count: 1 },
      { strength: 10, count: 1 }
    ];
  } else {
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
    formatType: 'vial',
    recommendedVials,
    totalVialCount,
    totalUnitsCount: totalVialCount,
    totalProvidedApiMg,
    expectedUnusedMg,
    procurementSummary,
    reasoningText: `${weeks}-week protocol at ${freq} doses/week (${totalAdministrations} total administrations × ${dose} mg) requires exactly ${totalApiRequiredMg} mg of API. Dispensed as ${procurementSummary} (${totalProvidedApiMg} mg total supply${expectedUnusedMg > 0 ? `, ${expectedUnusedMg} mg buffer` : ', zero wastage'}).`
  };
}
