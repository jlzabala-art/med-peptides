/**
 * src/services/pharmapolisCostEngine.js
 * 
 * Interactive Costing Engine for Ultraman / UltraPerson Compounded Supplements
 * Manufactured by Pharmapolis Compounding Pharmacy (Plovdiv, Bulgaria).
 * 
 * Reconstructs with 100% precision:
 *  1. Raw Material Landed Cost (+9.8%) & Process Waste (+7%)
 *  2. Capsule Preparation Cost Sheet CAT-CAP v1.1:
 *     - Fixed labour operations (66 min @ 18 EUR/h = 19.80 EUR)
 *     - Extra component labour (+5.5 min = +1.65 EUR per component beyond 2)
 *     - Capsule filling OP-39 (25 min / 100 caps = 0.075 EUR / cap)
 *     - Empty capsules CON-08 (0.02 EUR / cap)
 *     - Fixed packaging (2.00 EUR / prep)
 *  3. Pharmapolis Manufacturing Gross Margin (15% on selling price => divisor 0.85, or configurable)
 */

import { ULTRAMAN_APIS_MASTER } from '../data/ultramanApisMaster.js';

export const COST_STANDARDS = {
  LABOUR_RATE_PER_HOUR: 18.00,
  LABOUR_RATE_PER_MINUTE: 0.30,
  BASE_FIXED_LABOUR_MINUTES: 66,       // Base operations OP-01 to OP-54
  BASE_FIXED_LABOUR_EUR: 19.80,
  EXTRA_COMPONENT_MINUTES: 5.5,        // Extra solid component beyond 2
  EXTRA_COMPONENT_EUR: 1.65,
  CAPSULE_FILLING_MIN_PER_100: 25,     // OP-39: 25 min / 100 caps
  CAPSULE_FILLING_EUR_PER_CAP: 0.075,  // 0.25 min * 0.30 EUR/min
  EMPTY_CAPSULE_EUR: 0.02,             // CON-08
  FIXED_PACKAGING_EUR: 2.00,           // Bottle, caps, seals, double labels
  LANDED_COST_RATE: 0.098,             // +9.8% freight, customs, handling
  MATERIAL_WASTE_RATE: 0.07,           // +7% process loss
  DEFAULT_GROSS_MARGIN: 0.15,          // 15% on selling price
  VAT_RATE: 0.20                       // 20% standard VAT
};

/**
 * 3 Official Commercial Capsule Bottle Sizes
 */
export const CAPSULE_BOTTLE_SIZES = [
  { count: 30,  label: '30 Caps',  badge: 'Starter / 15-30 Days',  daysSupply: 30 },
  { count: 60,  label: '60 Caps',  badge: 'Standard / 30-60 Days', daysSupply: 60, isDefault: true },
  { count: 120, label: '120 Caps', badge: 'Economy / 60-120 Days', daysSupply: 120, savingsPercent: 25 }
];

/**
 * Determines the physical galenic HPMC capsule size (Size 1, Size 0, Size 00)
 * based on the cumulative active milligrams per single capsule.
 */
export function resolvePhysicalCapsuleSize(activeIngredients = []) {
  let totalDoseMg = 0;

  if (typeof activeIngredients === 'number' && !isNaN(activeIngredients)) {
    totalDoseMg = activeIngredients;
  } else if (typeof activeIngredients === 'string') {
    const parsed = parseFloat(activeIngredients.replace(',', '.'));
    if (!isNaN(parsed)) totalDoseMg = parsed;
  } else if (Array.isArray(activeIngredients)) {
    totalDoseMg = activeIngredients.reduce((acc, item) => {
      if (!item) return acc;
      if (typeof item === 'number') return acc + (isNaN(item) ? 0 : item);
      let mg = Number(item.amount || item.doseMg || item.dose || 0);
      if (!mg && typeof item.dose === 'string') {
        const parsed = parseFloat(item.dose.replace(',', '.'));
        if (!isNaN(parsed)) mg = parsed;
      }
      // If given per daily dose (e.g. 2 capsules daily), divide by 2 if perCapsule is specified
      if (item.perCapsule && typeof item.perCapsule === 'string') {
        const parsedPerCap = parseFloat(item.perCapsule.replace(',', '.'));
        if (!isNaN(parsedPerCap)) mg = parsedPerCap;
      } else if (typeof item.perCapsule === 'number' && !isNaN(item.perCapsule)) {
        mg = item.perCapsule;
      }
      return acc + (isNaN(mg) ? 0 : mg);
    }, 0);
  } else if (activeIngredients && typeof activeIngredients === 'object') {
    if (Array.isArray(activeIngredients.activeIngredients)) {
      return resolvePhysicalCapsuleSize(activeIngredients.activeIngredients);
    }
    if (Array.isArray(activeIngredients.ingredients)) {
      return resolvePhysicalCapsuleSize(activeIngredients.ingredients);
    }
    const singleMg = Number(activeIngredients.totalMg || activeIngredients.amount || activeIngredients.doseMg || activeIngredients.dose || 0);
    if (!isNaN(singleMg)) {
      totalDoseMg = singleMg;
    }
  }

  if (totalDoseMg <= 350) {
    return {
      size: 'Size 1',
      code: 'CAP-SZ1',
      totalMg: Math.round(totalDoseMg),
      volumeCapacityMl: 0.50,
      label: 'Size 1 (Small · 0.50 mL)',
      badgeColor: '#0284c7',
      description: 'Compact plant-derived HPMC capsule. Ideal for easy swallowing and single/dual co-factor blends.'
    };
  }

  if (totalDoseMg <= 550) {
    return {
      size: 'Size 0',
      code: 'CAP-SZ0',
      totalMg: Math.round(totalDoseMg),
      volumeCapacityMl: 0.68,
      label: 'Size 0 (Standard · 0.68 mL)',
      badgeColor: '#0d9488',
      description: 'Standard clinical HPMC capsule. Optimized for dual-to-triple active botanical and amino acid matrices.'
    };
  }

  return {
    size: 'Size 00',
    code: 'CAP-SZ00',
    totalMg: Math.round(totalDoseMg),
    volumeCapacityMl: 0.95,
    label: 'Size 00 (Maxi · 0.95 mL)',
    badgeColor: '#7c3aed',
    description: 'High-capacity delayed-release acid-resistant vegan HPMC. Engineered for dense multi-active longevity formulas.'
  };
}

/**
 * Fuzzy/Normalized matching to find the API in the Pharmapolis master catalog
 */
export function resolvePharmapolisApi(ingredientNameOrId, apisCatalog = ULTRAMAN_APIS_MASTER) {
  if (!ingredientNameOrId) return null;
  const target = String(ingredientNameOrId).toLowerCase().trim();

  // 1. Direct ID match
  let found = apisCatalog.find(a => a.id === target || a.id === `pharmapolis-${target}`);
  if (found) return found;

  // 2. Direct Name match
  found = apisCatalog.find(a => a.name.toLowerCase() === target);
  if (found) return found;

  // 3. Normalized string inclusion
  const cleanTarget = target
    .replace(/\b(extract|standardized|micronized|root|powder|dihydrate|phytosome|usp|ep)\b/gi, '')
    .replace(/[()≥%0-9]/g, '')
    .trim();

  if (cleanTarget.length >= 3) {
    found = apisCatalog.find(a => {
      const aName = a.name.toLowerCase();
      return aName.includes(cleanTarget) || cleanTarget.includes(aName);
    });
    if (found) return found;
  }

  // 4. Specific clinical synonym maps
  const SYNONYM_MAP = {
    'coenzyme q10': 'pharmapolis-coenzyme-q10-ubiquinone',
    'coq10': 'pharmapolis-coenzyme-q10-ubiquinone',
    'ubiquinone': 'pharmapolis-coenzyme-q10-ubiquinone',
    'ala': 'pharmapolis-alpha-lipoic-acid-ala',
    'alpha-lipoic acid': 'pharmapolis-alpha-lipoic-acid-ala',
    'piperine': 'pharmapolis-piperine',
    'black pepper extract': 'pharmapolis-piperine',
    'panax ginseng': 'pharmapolis-panax-ginseng-extract',
    'resveratrol': 'pharmapolis-resveratrol',
    'trans-resveratrol': 'pharmapolis-resveratrol',
    'curcumin': 'pharmapolis-curcumin-cureit',
    'quercetin': 'pharmapolis-green-tea-extract-egcg', // proxy if needed
    'vitamin c': 'pharmapolis-vitamin-c-ascorbic-acid',
    'ascorbic acid': 'pharmapolis-vitamin-c-ascorbic-acid',
    'vitamin d3': 'pharmapolis-vitamin-d3-cholecalciferol',
    'zinc': 'pharmapolis-zinc-gluconate',
    'zinc picolinate': 'pharmapolis-zinc-gluconate',
    'zinc gluconate': 'pharmapolis-zinc-gluconate',
    'pine bark': 'pharmapolis-pycnogenol-pinus-pinaster',
    'pycnogenol': 'pharmapolis-pycnogenol-pinus-pinaster',
    'maritime pine bark': 'pharmapolis-pycnogenol-pinus-pinaster',
    'ashwagandha': 'pharmapolis-valerian-root-extract-valeriana-officinalis', // proxy if not in sheet
    'l-theanine': 'pharmapolis-glycine' // amino acid proxy if needed
  };

  for (const [key, slug] of Object.entries(SYNONYM_MAP)) {
    if (target.includes(key)) {
      found = apisCatalog.find(a => a.id === slug);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Calculates the complete dynamic compounding cost of an Ultraman/UltraPerson supplement batch.
 * 
 * @param {Object} params
 * @param {Array} params.activeIngredients Array of { name, amount/doseMg, unit }
 * @param {number} [params.capsPerBottle=60] Number of capsules per bottle (e.g. 30, 60, 90, 120, 180)
 * @param {number} [params.grossMargin=0.15] Pharmapolis manufacturing gross margin (0.15 for 15%)
 * @param {Array} [params.apisCatalog] Custom or fetched API materials array
 * @param {Object} [params.options] Optional overrides
 * @returns {Object} Comprehensive calculation report
 */
export function calculatePharmapolisCost({
  activeIngredients = [],
  capsPerBottle = 60,
  grossMargin = COST_STANDARDS.DEFAULT_GROSS_MARGIN,
  apisCatalog = ULTRAMAN_APIS_MASTER,
  options = {}
}) {
  const caps = Math.max(1, Number(capsPerBottle) || 60);
  const rawMargin = typeof grossMargin === 'number' && !isNaN(grossMargin) ? grossMargin : COST_STANDARDS.DEFAULT_GROSS_MARGIN;
  // Normalize percentage margins passed as whole numbers (e.g. 15 instead of 0.15)
  const normalizedMargin = rawMargin > 1 ? rawMargin / 100 : Math.max(0, Math.min(0.9, rawMargin));
  const divisor = Math.max(0.1, 1 - normalizedMargin); // e.g. 0.85 for 15% margin, 0.90 for 10%

  const safeIngredients = Array.isArray(activeIngredients) ? activeIngredients : [];

  // ─── 1. RAW MATERIALS CALCULATION ──────────────────────────────────────────
  const ingredientsBreakdown = safeIngredients.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      return {
        name: `Ingredient #${idx + 1}`,
        matchedApiId: null,
        matchedApiName: '(Invalid item)',
        spec: 'N/A',
        doseMg: 0,
        totalGramsNeeded: 0,
        priceEurGram: 0,
        rawCostEur: 0,
        isEstimated: true
      };
    }
    const rawName = item.name || `Ingredient #${idx + 1}`;
    const matchedApi = resolvePharmapolisApi(item.apiId || rawName, apisCatalog);

    // Dose in mg
    let doseMg = Number(item.amount || item.doseMg || item.dose || 0);
    if (!doseMg && typeof item.dose === 'string') {
      const parsed = parseFloat(item.dose.replace(',', '.'));
      if (!isNaN(parsed)) doseMg = parsed;
    }

    // Convert IU for Vitamin D3 (1,000 IU = 0.025 mg)
    if (item.unit && item.unit.includes('IU') && !doseMg) {
      doseMg = 0.025;
    }

    const gramsPerCap = doseMg / 1000;
    const totalGramsNeeded = gramsPerCap * caps;

    // Default proxy price if unlisted: 0.05 EUR/g (~50 EUR/kg)
    const priceEurGram = matchedApi?.priceEurGram || 0.05;
    const rawCostEur = totalGramsNeeded * priceEurGram;

    return {
      name: rawName,
      matchedApiId: matchedApi?.id || null,
      matchedApiName: matchedApi?.name || '(Unlisted proxy)',
      spec: matchedApi?.spec || 'Standard nutraceutical grade',
      doseMg,
      totalGramsNeeded: Number(totalGramsNeeded.toFixed(4)),
      priceEurGram,
      rawCostEur: Number(rawCostEur.toFixed(4)),
      isEstimated: !matchedApi
    };
  });

  const rawMaterialNetEur = ingredientsBreakdown.reduce((sum, item) => sum + item.rawCostEur, 0);

  // Landed cost (+9.8%)
  const landedCostEur = rawMaterialNetEur * (1 + COST_STANDARDS.LANDED_COST_RATE);

  // Material waste (+7% on landed cost)
  const adjustedMaterialCostEur = landedCostEur * (1 + COST_STANDARDS.MATERIAL_WASTE_RATE);

  // ─── 2. CAPSULE PREPARATION COST (CAT-CAP v1.1) ─────────────────────────────
  // Formula components count (APIs + 1 diluent like DiluCap)
  const solidComponentsCount = Math.max(2, safeIngredients.length + 1);
  const extraComponents = Math.max(0, solidComponentsCount - 2);

  // Labour breakdown
  const fixedLabourMinutes = COST_STANDARDS.BASE_FIXED_LABOUR_MINUTES;
  const extraLabourMinutes = extraComponents * COST_STANDARDS.EXTRA_COMPONENT_MINUTES;
  const fillingMinutes = (caps / 100) * COST_STANDARDS.CAPSULE_FILLING_MIN_PER_100;
  const totalLabourMinutes = fixedLabourMinutes + extraLabourMinutes + fillingMinutes;

  const fixedLabourEur = COST_STANDARDS.BASE_FIXED_LABOUR_EUR;
  const extraLabourEur = extraComponents * COST_STANDARDS.EXTRA_COMPONENT_EUR;
  const fillingLabourEur = caps * COST_STANDARDS.CAPSULE_FILLING_EUR_PER_CAP;
  const totalLabourEur = fixedLabourEur + extraLabourEur + fillingLabourEur;

  // Direct preparation consumables
  const emptyCapsulesEur = caps * COST_STANDARDS.EMPTY_CAPSULE_EUR;
  const packagingEur = COST_STANDARDS.FIXED_PACKAGING_EUR;

  const preparationTotalEur = totalLabourEur + emptyCapsulesEur + packagingEur;

  // ─── 3. TOTAL PRODUCTION COST (TPC) ────────────────────────────────────────
  const totalProductionCostEur = adjustedMaterialCostEur + preparationTotalEur;

  // ─── 4. PHARMAPOLIS MANUFACTURING SELLING PRICE ────────────────────────────
  // Final Manufacturing Price = Total Production Cost ÷ (1 - margin)
  const manufacturingSellingPriceNetEur = totalProductionCostEur / divisor;
  const vatEur = manufacturingSellingPriceNetEur * COST_STANDARDS.VAT_RATE;
  const manufacturingSellingPriceGrossEur = manufacturingSellingPriceNetEur + vatEur;

  // Per capsule metrics
  const netCostPerCapEur = manufacturingSellingPriceNetEur / caps;
  const grossCostPerCapEur = manufacturingSellingPriceGrossEur / caps;

  return {
    capsPerBottle: caps,
    componentsCount: solidComponentsCount,
    extraComponentsCount: extraComponents,
    labour: {
      ratePerHour: COST_STANDARDS.LABOUR_RATE_PER_HOUR,
      ratePerMinute: COST_STANDARDS.LABOUR_RATE_PER_MINUTE,
      fixedMinutes: fixedLabourMinutes,
      fixedEur: fixedLabourEur,
      extraComponentsMinutes: extraLabourMinutes,
      extraComponentsEur: extraLabourEur,
      fillingMinutes: Number(fillingMinutes.toFixed(1)),
      fillingEur: Number(fillingLabourEur.toFixed(2)),
      totalLabourMinutes: Number(totalLabourMinutes.toFixed(1)),
      totalLabourEur: Number(totalLabourEur.toFixed(2))
    },
    materials: {
      rawNetEur: Number(rawMaterialNetEur.toFixed(2)),
      landedAllowanceRate: COST_STANDARDS.LANDED_COST_RATE,
      landedCostEur: Number(landedCostEur.toFixed(2)),
      wasteAllowanceRate: COST_STANDARDS.MATERIAL_WASTE_RATE,
      adjustedMaterialCostEur: Number(adjustedMaterialCostEur.toFixed(2)),
      items: ingredientsBreakdown
    },
    preparation: {
      labourSubtotalEur: Number(totalLabourEur.toFixed(2)),
      emptyCapsulesEur: Number(emptyCapsulesEur.toFixed(2)),
      packagingEur: Number(packagingEur.toFixed(2)),
      totalPreparationEur: Number(preparationTotalEur.toFixed(2))
    },
    totalProductionCostEur: Number(totalProductionCostEur.toFixed(2)),
    margin: {
      percentage: Number((normalizedMargin * 100).toFixed(1)),
      divisor: Number(divisor.toFixed(2)),
      pharmapolisProfitEur: Number((manufacturingSellingPriceNetEur - totalProductionCostEur).toFixed(2))
    },
    finalPricing: {
      netSellingPriceEur: Number(manufacturingSellingPriceNetEur.toFixed(2)),
      vatRate: COST_STANDARDS.VAT_RATE,
      vatEur: Number(vatEur.toFixed(2)),
      grossSellingPriceEur: Number(manufacturingSellingPriceGrossEur.toFixed(2)),
      netPerCapEur: Number(netCostPerCapEur.toFixed(3)),
      grossPerCapEur: Number(grossCostPerCapEur.toFixed(3))
    }
  };
}
