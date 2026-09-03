/**
 * protocolStabilityOptimizer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Clinical Stability & Economic Presentation Optimizer Engine.
 *
 * Solves the In-Use Lifespan vs Cost Dilemma:
 *   - Lyophilized powders are stable for 24-36 months at 2-8°C / -20°C.
 *   - Aqueous solution (once reconstituted or pen activated) is strictly
 *     stable for a MAXIMUM of 28 to 30 days at 2-8°C.
 *   - Calculates optimal vial vs pen presentations to minimize patient cost
 *     while ensuring near 0 mg of expired / discarded product.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const IN_USE_STABILITY_DAYS = 28; // Maximum safe aqueous lifespan

/**
 * Standard peptide packaging presentation models
 */
export const DEFAULT_PRESENTATIONS = Object.freeze([
  { id: 'vial_5mg', format: 'vial', totalMg: 5, approxPriceUSD: 35, unitName: '5mg Lyophilized Vial' },
  { id: 'vial_10mg', format: 'vial', totalMg: 10, approxPriceUSD: 55, unitName: '10mg Lyophilized Vial' },
  { id: 'vial_15mg', format: 'vial', totalMg: 15, approxPriceUSD: 75, unitName: '15mg Lyophilized Vial' },
  { id: 'cartridge_10mg', format: 'pen_cartridge', totalMg: 10, approxPriceUSD: 65, unitName: '10mg Single Cartridge Pen' },
  { id: 'cartridge_20mg', format: 'pen_cartridge', totalMg: 20, approxPriceUSD: 100, unitName: '20mg Dual-Chamber Cartridge' },
  { id: 'cartridge_30mg', format: 'pen_cartridge', totalMg: 30, approxPriceUSD: 140, unitName: '30mg High-Dose Cartridge' },
]);

/**
 * Calculates monthly requirement and days to consume one unit.
 * @param {number} weeklyDoseMg - Prescribed weekly dose in mg
 * @param {number} [cycleWeeks=4] - Duration of treatment cycle (default 4 weeks / 28 days)
 * @returns {{ monthlyRequirementMg: number, dailyDoseMg: number }}
 */
export function calculateCycleRequirement(weeklyDoseMg, cycleWeeks = 4) {
  const weekly = Number(weeklyDoseMg || 0);
  const total = weekly * cycleWeeks;
  const daily = weekly / 7;
  return {
    monthlyRequirementMg: parseFloat(total.toFixed(2)),
    dailyDoseMg: parseFloat(daily.toFixed(3)),
    cycleWeeks
  };
}

/**
 * Recommends optimal presentation (Vial vs Pen) for a given weekly dose.
 * @param {Object} params
 * @param {number} params.weeklyDoseMg - Prescribed weekly dose (e.g. 2.5, 5.0, 10.0, 15.0)
 * @param {'all' | 'pen' | 'vial'} [params.formatPreference='all']
 * @param {Array<Object>} [params.customPresentations] - Catalog variants available
 * @param {number} [params.cycleWeeks=4]
 * @returns {Object} Recommendation report with cost, days to consume, and waste analysis.
 */
export function getOptimalPresentation({
  weeklyDoseMg,
  formatPreference = 'all',
  customPresentations = null,
  cycleWeeks = 4
}) {
  const dose = Number(weeklyDoseMg || 0);
  if (dose <= 0) {
    return { error: 'Weekly dose must be greater than 0.' };
  }

  const requirement = calculateCycleRequirement(dose, cycleWeeks);
  const totalNeededMg = requirement.monthlyRequirementMg;
  const dailyConsumption = requirement.dailyDoseMg;

  const catalog = (Array.isArray(customPresentations) && customPresentations.length > 0)
    ? customPresentations
    : DEFAULT_PRESENTATIONS;

  // Filter by format preference if specified
  const filteredCatalog = catalog.filter(p => {
    if (formatPreference === 'pen') return p.format === 'pen_cartridge' || p.format === 'pre_filled_pen';
    if (formatPreference === 'vial') return p.format === 'vial';
    return true;
  });

  const evaluations = filteredCatalog.map(item => {
    const sizeMg = Number(item.totalMg || item.dose || 10);
    const unitPrice = Number(item.approxPriceUSD || item.price || 50);

    // Days required to consume one single unit
    const daysPerUnit = parseFloat((sizeMg / dailyConsumption).toFixed(1));

    // Stability Constraint Check:
    // If one unit takes > 28 days to consume, the remainder will expire!
    const exceedsStabilityWindow = daysPerUnit > IN_USE_STABILITY_DAYS;

    // How many units needed for the full 4-week cycle?
    let unitsNeeded = Math.ceil(totalNeededMg / sizeMg);
    if (unitsNeeded < 1) unitsNeeded = 1;

    // Usable mg from 1 unit within 28 days
    const maxUsableMgPerUnit = exceedsStabilityWindow ? (dailyConsumption * IN_USE_STABILITY_DAYS) : sizeMg;
    const wasteMgPerUnit = Math.max(0, sizeMg - maxUsableMgPerUnit);
    const totalWasteMg = parseFloat((wasteMgPerUnit * unitsNeeded).toFixed(2));

    const totalCostUSD = parseFloat((unitsNeeded * unitPrice).toFixed(2));
    const effectiveCostPerUsefulMg = parseFloat((totalCostUSD / totalNeededMg).toFixed(2));

    let stabilityRating = 'OPTIMAL_FRESH';
    let warning = null;

    if (exceedsStabilityWindow) {
      stabilityRating = 'EXPIRES_BEFORE_DEPLETION';
      warning = `⚠️ Unit contains ${sizeMg}mg, but patient only consumes ${maxUsableMgPerUnit.toFixed(1)}mg in 28 days. ${wasteMgPerUnit.toFixed(1)}mg will expire and must be discarded!`;
    } else if (daysPerUnit <= 14) {
      stabilityRating = 'HIGH_FRESHNESS';
    }

    return {
      ...item,
      sizeMg,
      unitPrice,
      unitsNeeded,
      daysPerUnit,
      exceedsStabilityWindow,
      wasteMgPerUnit,
      totalWasteMg,
      totalCostUSD,
      effectiveCostPerUsefulMg,
      stabilityRating,
      warning
    };
  });

  // Sort candidates:
  // 1. Prioritize zero/minimal waste (exceedsStabilityWindow === false)
  // 2. Secondary: Lowest Total Cost USD
  const validNoWaste = evaluations.filter(e => !e.exceedsStabilityWindow);
  const candidates = validNoWaste.length > 0 ? validNoWaste : evaluations;

  candidates.sort((a, b) => a.totalCostUSD - b.totalCostUSD);
  const bestOption = candidates[0];

  return {
    weeklyDoseMg: dose,
    cycleWeeks,
    totalNeededMg,
    formatPreference,
    bestOption,
    allEvaluations: evaluations,
    clinicalAdvice: bestOption.exceedsStabilityWindow
      ? `Warning: No standard size fits under 28 days without waste. Recommended: ${bestOption.unitName} (${bestOption.totalWasteMg}mg waste).`
      : `Recommended: ${bestOption.unitsNeeded} × ${bestOption.unitName} for ${cycleWeeks}-week cycle. Each unit lasts ${bestOption.daysPerUnit} days (0 mg waste, 100% fresh potency).`
  };
}
