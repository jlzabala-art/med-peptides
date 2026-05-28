 
/**
 * dosageUnits.js
 *
 * Single source of truth for dosage unit resolution.
 *
 * Resolution order (first match wins):
 *   1. PRODUCT_UNIT_MAP   — exact product name override
 *   2. CATEGORY_UNIT_MAP  — category-level default
 *   3. DEFAULT_UNIT       — global fallback
 *
 * When adding a new product with a non-mg unit:
 *   - Add the product name (as it appears in wholesale_parsed.json) to PRODUCT_UNIT_MAP.
 *   - Or add a new category entry to CATEGORY_UNIT_MAP if the whole category shares the unit.
 */

// ---------------------------------------------------------------------------
// Supported units
// ---------------------------------------------------------------------------
export const UNITS = {
  MG: 'mg',
  MCG: 'mcg',
  IU: 'IU',
  ML: 'ml',
  PERCENT: '%',
};

// ---------------------------------------------------------------------------
// Global fallback
// ---------------------------------------------------------------------------
export const DEFAULT_UNIT = UNITS.MG;

// ---------------------------------------------------------------------------
// Per-product overrides  (key = product name as stored in wholesale_parsed.json)
// ---------------------------------------------------------------------------
export const PRODUCT_UNIT_MAP = {
  // Gonadotropins / Hormones — IU
  HCG: UNITS.IU,
  HMG: UNITS.IU,
  HGH: UNITS.IU,
  'FST-344': UNITS.IU,

  // Nasal sprays / solutions — mcg is common for Selank/Semax
  Selank: UNITS.MCG,
  Semax: UNITS.MCG,

  // Cosmetic / topical — mcg or % (extend as needed)
  'Snap-8': UNITS.MCG,
  'GHK-Cu (Copper Peptide)': UNITS.MCG,

  // Add more as new product lines are introduced:
  // 'New Product Name': UNITS.IU,
};

// ---------------------------------------------------------------------------
// Category-level defaults
// (product.category must match one of these keys, case-insensitive)
// ---------------------------------------------------------------------------
export const CATEGORY_UNIT_MAP = {
  hormone: UNITS.IU,
  gonadotropin: UNITS.IU,
  nasal: UNITS.MCG,
  topical: UNITS.MCG,
  // peptide: UNITS.MG,  // explicit, but this is the default anyway
};

// ---------------------------------------------------------------------------
// Exported resolver
// ---------------------------------------------------------------------------

/**
 * Resolves the expected dosage unit for a product.
 *
 * @param {string} [productName]  - e.g. "HCG", "BPC-157"
 * @param {string} [category]     - e.g. "hormone", "peptide"
 * @returns {string}              - one of the UNITS values
 */
export function resolveUnit(productName, category) {
  // 1. Exact product-name override
  if (productName && PRODUCT_UNIT_MAP[productName]) {
    return PRODUCT_UNIT_MAP[productName];
  }

  // 2. Category default
  if (category) {
    const key = category.toLowerCase();
    if (CATEGORY_UNIT_MAP[key]) {
      return CATEGORY_UNIT_MAP[key];
    }
  }

  // 3. Global fallback
  return DEFAULT_UNIT;
}

/**
 * Formats a raw dosage string, ensuring a unit is always present.
 *
 * Examples:
 *   formatDose('10')          → '10 mg'    (default unit)
 *   formatDose('2.5mg')       → '2.5 mg'   (space normalisation)
 *   formatDose('5000', 'HCG') → '5000 IU'  (product override)
 *   formatDose('10 IU')       → '10 IU'    (already has unit, returned as-is)
 *
 * @param {string} raw          - dosage string from the product variant
 * @param {string} [productName]
 * @param {string} [category]
 * @returns {string}
 */
export function formatDose(raw, productName, category) {
  if (!raw) return '';

  const str = String(raw).trim();

  // If a recognised unit already exists in the string, normalise spacing only.
  const knownUnits = Object.values(UNITS).join('|');
  const hasUnit = new RegExp(`(\\d)\\s*(${knownUnits})\\b`, 'i').test(str);
  if (hasUnit) {
    // Ensure exactly one space between number and unit.
    return str.replace(
      new RegExp(`(\\d)\\s*(${knownUnits})\\b`, 'i'),
      (_, num, unit) => `${num} ${unit}`
    );
  }

  // Bare number — append the resolved unit.
  const numericOnly = /^\d+(\.\d+)?$/.test(str);
  if (numericOnly) {
    const unit = resolveUnit(productName, category);
    return `${str} ${unit}`;
  }

  // Unrecognised format — return as-is.
  return str;
}
