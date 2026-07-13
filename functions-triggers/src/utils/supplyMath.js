 
/**
 * supplyMath.js
 * 
 * Centralized logic for protocol supply and procurement calculations.
 * Extracted from ProtocolSupplyEngine for testability and consistency.
 */

const { parseFrequencyToInjectionsPerWeek  } = require('./dosageUtils');
const { getPeptidePK  } = require('./peptidePharmacokinetics');

/**
 * COMPOUND_VIAL_SIZES
 * Canonical vial size (in mg) per compound.
 * For mcg-dosed peptides this IS the vial content converted to mg
 * so calculations stay consistent in supplyMath (all internal math uses mg).
 *
 * Sources: manufacturer COA / standard compounding conventions.
 */
exports.COMPOUND_VIAL_SIZES = {
  // ── Weight Management ──────────────────────────────────────────────────
  'aod-9604':          2,    // 2 mg vial (2000 mcg) — standard compounding
  'aod9604':           2,

  // ── Recovery & Healing ─────────────────────────────────────────────────
  'bpc-157':           5,    // 5 mg vial (5000 mcg)
  'bpc157':            5,

  // ── Cognitive ──────────────────────────────────────────────────────────
  'semax':             3,    // 3 mg vial (3000 mcg)
  'selank':            5,    // 5 mg vial (5000 mcg)

  // ── Immune ─────────────────────────────────────────────────────────────
  'thymosin-alpha-1':  6,    // 6 mg vial (6000 mcg) — standard Tα1 unit
  'thymosin-alpha1':   6,
  'thymosin_alpha_1':  6,
  'ta1':               6,
  'thymosin alpha-1':  6,
  'thymosin alpha 1':  6,

  // ── GH Axis ────────────────────────────────────────────────────────────
  'sermorelin':        15,   // 15 mg vial (15000 mcg)
  'ipamorelin':        5,    // 5 mg vial (5000 mcg)
  'cjc-1295':          2,    // 2 mg vial (2000 mcg)
  'cjc1295':           2,
  'ghrp-2':            5,
  'ghrp-6':            5,

  // ── Hormonal ───────────────────────────────────────────────────────────
  'kisspeptin':        10,   // 10 mg vial (10000 mcg)
  'gonadorelin':       2,    // 2 mg vial (2000 mcg)

  // ── Sleep / Circadian ──────────────────────────────────────────────────
  'dsip':              5,    // 5 mg vial (5000 mcg)
  'epithalon':         10,   // 10 mg vial (10000 mcg)
  'epitalon':          10,

  // ── Skin / Aesthetics ──────────────────────────────────────────────────
  'ghk-cu':            50,   // 50 mg vial
  'ghkcu':             50,
  'pt-141':            10,   // 10 mg vial (10000 mcg)
  'pt141':             10,

  // ── Longevity / Mitochondrial ──────────────────────────────────────────
  'mots-c':            5,    // 5 mg vial
  'motsc':             5,
  'ss-31':             5,    // 5 mg vial (Elamipretide)
  'humanin':           5,
};

/**
 * resolveVialSizeMg
 * Returns the correct vial size in mg for a compound,
 * checking the canonical lookup table first (by slug/title)
 * then falling back to JSON-provided vial_size_mg, then a safe default.
 */
exports.resolveVialSizeMg = function resolveVialSizeMg(drug) {
  const logic = drug.dose_logic || {};

  // 1. JSON-provided vial_size_mg (explicit override from product data takes absolute priority)
  const jsonSize = parseFloat(drug.vial_size_mg || logic.vial_strength);
  if (!isNaN(jsonSize) && jsonSize > 0) return jsonSize;

  // 2. Canonical lookup — match by slug or product_title (case + punctuation insensitive)
  const candidates = [
    drug.product_slug,
    drug.product_title,
    drug.name,
  ].filter(Boolean);

  for (const c of candidates) {
    const key = c.toLowerCase().replace(/[_\s]+/g, '-');
    if (COMPOUND_VIAL_SIZES[key] !== undefined) {
      return COMPOUND_VIAL_SIZES[key];
    }
    // Also try without hyphens
    const keyNoDash = c.toLowerCase().replace(/[-_\s]+/g, '');
    const found = Object.entries(COMPOUND_VIAL_SIZES).find(
      ([k]) => k.replace(/-/g, '') === keyNoDash
    );
    if (found) return found[1];
  }

  // 3. Safe fallback — 5 mg covers most standard peptide vials
  return 5;
}


/**
 * Standard accessory base definitions.
 * UI metadata like icons are handled by the component.
 */
exports.ACCESSORY_DEFS = [
  { id: 'bac_water_10ml',  label: 'Bacteriostatic Water 10 mL', unitPrice: 8 },
  { id: 'insulin_syringe', label: 'Insulin Syringes 1 mL (×10)', unitPrice: 12 },
  { id: 'alcohol_pads',    label: 'Alcohol Prep Pads (×50)',    unitPrice: 6 },
];

/**
 * suggestOptimalFrequency
 * Uses PK data to suggest a better dosing frequency if the current one is suboptimal.
 */
exports.suggestOptimalFrequency = function suggestOptimalFrequency(slug, currentDosingPerWeek) {
  const pk = getPeptidePK(slug);
  if (!pk || !pk.halfLifeHours) return { frequency: currentDosingPerWeek, changed: false };

  const h = pk.halfLifeHours;
  let suggested = currentDosingPerWeek;

  // Decision matrix based on half-life
  if (h < 4) {
    // Very short (Sermorelin, GHRHs): Daily is the minimum effective frequency
    if (currentDosingPerWeek < 7) suggested = 7;
  } else if (h < 24) {
    // Short (BPC, Ipamorelin): Daily is preferred
    if (currentDosingPerWeek < 7) suggested = 7;
  } else if (h < 72) {
    // Medium (IGF-1 LR3, Thymosin Alpha-1): 2-3x per week minimum
    if (currentDosingPerWeek < 2) suggested = 2;
  }
  // For long half-life (Semaglutide), weekly (1x) is already optimal.

  return { 
    frequency: suggested, 
    changed: suggested !== currentDosingPerWeek,
    reason: suggested !== currentDosingPerWeek ? `Half-life of ${pk.halfLife} suggests higher frequency.` : null
  };
}

/**
 * Calculates the number of vials needed for a single compound in a phase.
 */
exports.calculateVialsNeeded = function calculateVialsNeeded({ doseAmount, maxDose, dosingPerWeek, durationWeeks, vialSizeMg, canonicalVials = null, isWeeklyDose = false, slug = '' }) {
  if (canonicalVials !== null && !isNaN(canonicalVials)) {
    return canonicalVials;
  }
  
  // If doseAmount is 'per administration', we must multiply by frequency to get the weekly requirement.
  // If isWeeklyDose is true, doseAmount is already the total weekly dose.
  const baseWeeklyDose = isWeeklyDose ? doseAmount : (doseAmount * dosingPerWeek);
  
  // Use average dose if a range is provided. 
  // Note: maxDose is usually provided as a weekly total in the schema, but let's be safe.
  const weeklyDose = maxDose && maxDose > baseWeeklyDose ? (baseWeeklyDose + maxDose) / 2 : baseWeeklyDose;

  // Incorporate biological half-life from peptide PK data to determine injection hub/dead-space waste:
  let hubWasteFactor = 1.05; // Default 5% overhead buffer
  if (slug) {
    const pk = getPeptidePK(slug);
    if (pk && pk.halfLifeHours) {
      const h = pk.halfLifeHours;
      if (h <= 12) {
        hubWasteFactor = 1.15; // 15% for rapid clearers requiring frequent shots (daily)
      } else if (h <= 72) {
        hubWasteFactor = 1.10; // 10% for medium-range clearers
      }
    }
  }

  const totalRequirement = weeklyDose * durationWeeks * hubWasteFactor;
  
  return totalRequirement > 0 ? Math.ceil(totalRequirement / vialSizeMg) : 1;
}

/**
 * derivePhaseSupply — returns phase-grouped supply data.
 * Each phase has: { phaseTitle, durationWeeks, compounds[] }
 */
exports.derivePhaseSupply = function derivePhaseSupply(phase_blueprints = [], dailyDose = null) {
  return phase_blueprints.map((ph, phIdx) => {
    const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
    const phaseTitle = ph.phase_title || ph.name || `Phase ${phIdx + 1}`;

    const drugList = ph.drugs_used || ph.drugs || [];

    const compounds = drugList.map((d, dIdx) => {
      const logic = d.dose_logic || {};
      const key   = d.productId || d.product_slug || d.product_title || `drug_${phIdx}_${dIdx}`;

      let override = null;
      if (dailyDose?.compounds) {
        const searchSlug = d.product_slug || d.productId || d.product_title || '';
        const normalised = searchSlug.toLowerCase().replace(/[-_\\s]+/g, '');
        const found = Object.entries(dailyDose.compounds).find(
          ([k]) => k.toLowerCase().replace(/[-_\\s]+/g, '') === normalised
        );
        if (found) override = found[1];
      }

      const canonicalVials =
        logic.vials_required != null ? Number(logic.vials_required)
        : d.vials_required   != null ? Number(d.vials_required)
        : null;

      const freq = override?.frequency
        || logic.administration_frequency
        || logic.frequency
        || d.dosing_frequency
        || 'once_weekly';
      const dosingPerWeek = parseFrequencyToInjectionsPerWeek(freq);

      let doseAmountRaw = override?.doseAmount ?? parseFloat(
        logic.starting_weekly_dose || logic.dose_per_administration || 0
      );
      let maxDoseRaw = override?.maxDose ?? parseFloat(logic.max_weekly_dose || logic.possible_next_step_dose || 0);
      
      const doseUnit = override?.doseUnit || logic.dose_unit || 'mg';
      const doseAmount = doseUnit === 'mcg' ? doseAmountRaw / 1000 : doseAmountRaw;
      const maxDose = (doseUnit === 'mcg' && maxDoseRaw) ? maxDoseRaw / 1000 : (maxDoseRaw || null);

      const vialSize = resolveVialSizeMg(d);

      const isWeeklyDose = Boolean(logic.starting_weekly_dose || logic.max_weekly_dose);

      // PK-Based Optimization
      const pkSuggestion = suggestOptimalFrequency(d.product_slug, dosingPerWeek);
      const effectiveDosingPerWeek = pkSuggestion.frequency;
      
      const vialsNeeded = calculateVialsNeeded({
        doseAmount,
        maxDose,
        dosingPerWeek: effectiveDosingPerWeek,
        durationWeeks: dur,
        vialSizeMg: vialSize,
        canonicalVials,
        isWeeklyDose,
        slug: d.product_slug
      });

      const explicitWaterMl =
        d.reconstitution?.water_volume_ml ??
        logic.reconstitution_water_ml ??
        null;
      const isVialForm = vialSize > 0;
      const reconstitutionMl =
        explicitWaterMl !== null
          ? Number(explicitWaterMl)
          : isVialForm
          ? 2
          : 0;

      return {
        key,
        label:        d.product_title || d.product_slug || key,
        slug:         d.product_slug  || key,
        productId:    d.productId     || null,
        unit:         doseUnit,
        doseAmount,
        maxDose:      maxDoseRaw ? maxDose : null,
        intensity:     logic.intensity || logic.starting_intensity || null,
        dosingPerWeek: effectiveDosingPerWeek,
        originalDosingPerWeek: dosingPerWeek,
        pkOptimized:   pkSuggestion.changed,
        pkReason:      pkSuggestion.reason,
        vialSize,
        vialsNeeded,
        reconstitutionMl,
        totalWeeks:   dur,
        product:      d,
      };
    });

    return { phaseTitle, durationWeeks: dur, compounds };
  });
}

/**
 * buildSupplyManifest
 * Aggregates enriched phase compounds into a flat, deduplicated supply list.
 */
exports.buildSupplyManifest = function buildSupplyManifest(enrichedPhases) {
  const compoundMap = new Map();
  for (const ph of enrichedPhases) {
    for (const c of ph.compounds) {
      const dedupKey = c.productId || c.slug || c.label;
      if (compoundMap.has(dedupKey)) {
        const existing = compoundMap.get(dedupKey);
        existing.totalVials += c.vialsNeeded;
        existing.totalBacWaterMl += c.reconstitutionMl * c.vialsNeeded;
        existing.lineTotal += (c.lineTotal || 0);
      } else {
        compoundMap.set(dedupKey, {
          key:              c.key,
          label:            c.label,
          slug:             c.slug,
          productId:        c.productId,
          vialSizeMg:       c.vialSize,
          dosingUnit:       c.unit,
          totalVials:       c.vialsNeeded,
          totalBacWaterMl:  c.reconstitutionMl * c.vialsNeeded,
          reconstitutionMl: c.reconstitutionMl,
          unitPrice:        c.unitPrice,
          lineTotal:        c.lineTotal || 0,
          catalogProduct:   c.catalogProduct,
          // Preserve compound info for tooltip
          doseAmount:       c.doseAmount,
          maxDose:          c.maxDose,
          totalWeeks:       c.totalWeeks,
        });
      }
    }
  }

  const compounds = Array.from(compoundMap.values());

  const totalBacWaterMl = compounds.reduce((s, c) => s + c.totalBacWaterMl, 0);
  const bacWaterBottles = totalBacWaterMl > 0 ? Math.ceil(totalBacWaterMl / 10) : 0;

  const totalInjections = enrichedPhases.reduce(
    (s, ph) => s + ph.compounds.reduce((s2, c) => s2 + c.vialsNeeded, 0),
    0
  );
  const syringePacks = Math.ceil(totalInjections / 10) || 1;

  const accessories = [
    bacWaterBottles > 0
      ? { ...ACCESSORY_DEFS[0], qty: bacWaterBottles }
      : null,
    { ...ACCESSORY_DEFS[1], qty: syringePacks },
    { ...ACCESSORY_DEFS[2], qty: 1 },
  ].filter(Boolean);

  const compoundCost  = compounds.reduce((s, c) => s + (c.lineTotal || 0), 0);
  const accessoryCost = accessories.reduce((s, a) => s + a.unitPrice * a.qty, 0);

  return {
    compounds,
    accessories,
    totals: {
      compoundCost,
      accessoryCost,
      grand: compoundCost + accessoryCost,
      bacWaterMl: totalBacWaterMl,
      vialsTotal: compounds.reduce((s, c) => s + c.totalVials, 0),
    },
  };
}
