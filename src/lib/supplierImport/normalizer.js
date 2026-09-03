/**
 * lib/supplierImport/normalizer.js
 *
 * Canonical alias normalization for peptide names.
 * Ensures product names from different suppliers map to the same master product.
 */

/** Alias map: lower-case source → canonical name */
const ALIAS_MAP = {
  // AOD
  'aod 9064': 'AOD-9604',
  'aod9064':  'AOD-9604',
  'aod-9064': 'AOD-9604',
  'aod 9604': 'AOD-9604',
  'aod9604':  'AOD-9604',
  // BPC
  'bpc157':   'BPC-157',
  'bpc 157':  'BPC-157',
  'bpc-157':  'BPC-157',
  // TB
  'tb500':    'TB-500',
  'tb 500':   'TB-500',
  'tb-500':   'TB-500',
  // Retatrutide
  'retatrutida':  'Retatrutide',
  'retatrutide':  'Retatrutide',
  // Gonadorelin
  'gonadorrlin':  'Gonadorelin',
  'gonadorellin': 'Gonadorelin',
  'gonadorelin':  'Gonadorelin',
  // GHK-Cu
  'ghk-cu':   'GHK-Cu',
  'ghk cu':   'GHK-Cu',
  'ghkcu':    'GHK-Cu',
  // NAD+
  'nad':      'NAD+',
  'nad+':     'NAD+',
  // PT-141
  'pt 141':   'PT-141',
  'pt141':    'PT-141',
  'pt-141':   'PT-141',
  // Semaglutide
  'semaglutida': 'Semaglutide',
  'semaglutide': 'Semaglutide',
  // Tirzepatide
  'tirzepatida': 'Tirzepatide',
  'tirzepatide': 'Tirzepatide',
  // Ipamorelin
  'ipamorelin': 'Ipamorelin',
  // CJC-1295
  'cjc1295':     'CJC-1295',
  'cjc 1295':    'CJC-1295',
  'cjc-1295':    'CJC-1295',
  // DSIP
  'dsip':        'DSIP',
  // Epithalon
  'epithalon':   'Epithalon',
  'epitalon':    'Epithalon',
  // Selank
  'selank':      'Selank',
  // Semax
  'semax':       'Semax',
  // Melanotan
  'melanotan 2': 'Melanotan II',
  'melanotan ii':'Melanotan II',
  'mt-ii':       'Melanotan II',
  'mt2':         'Melanotan II',
  // MOTS-c
  'mots c':      'MOTS-c',
  'mots-c':      'MOTS-c',
  // LL-37
  'll37':        'LL-37',
  'll 37':       'LL-37',
  'll-37':       'LL-37',
  // Sermorelin
  'sermorelin':  'Sermorelin',
  // Hexarelin
  'hexarelin':   'Hexarelin',
  // GHRP
  'ghrp-2':      'GHRP-2',
  'ghrp 2':      'GHRP-2',
  'ghrp-6':      'GHRP-6',
  'ghrp 6':      'GHRP-6',
  // Thymosin
  'thymosin alpha-1': 'Thymosin Alpha-1',
  'thymosin alpha 1': 'Thymosin Alpha-1',
  'ta-1':             'Thymosin Alpha-1',
  'thymosin beta-4':  'Thymosin Beta-4',
  'thymosin beta 4':  'Thymosin Beta-4',
  'tb-4':             'Thymosin Beta-4',
  // Kisspeptin
  'kisspeptin':       'Kisspeptin-10',
  'kisspeptin-10':    'Kisspeptin-10',
  'kisspeptin 10':    'Kisspeptin-10',
  // HCG
  'hcg':              'HCG',
  // HMG
  'hmg':              'HMG',
  // LH
  'lh':               'LH',
};

/**
 * Normalize a raw product name to its canonical form.
 * Returns the canonical name if found, or a cleaned-up version of the input.
 * @param {string} rawName
 * @returns {string}
 */
export function normalizeName(rawName) {
  if (!rawName) return '';
  const cleaned = rawName.trim();
  const key = cleaned.toLowerCase();
  if (ALIAS_MAP[key]) return ALIAS_MAP[key];

  // Partial alias match (handles cases like "BPC-157 10 mg" → look for "bpc-157")
  for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
    if (key.startsWith(alias)) {
      // Replace only the prefix part, preserve the rest (strength, etc.)
      return canonical + cleaned.slice(alias.length);
    }
  }

  return cleaned;
}

/**
 * Extract the base product name from a full string like "BPC-157 10 mg lyophilized vial".
 * Returns everything before the first numeric character group.
 * @param {string} fullName
 * @returns {string}
 */
export function extractBaseName(fullName) {
  if (!fullName) return '';
  const match = fullName.match(/^([^\d]+)/);
  return match ? match[1].trim() : fullName.trim();
}

/**
 * Build a canonical product signature from component list.
 * Order-independent, normalized.
 * @param {Array<{name: string, strength_value: number, strength_unit: string}>} components
 * @returns {string}
 */
export function buildCanonicalSignature(components = []) {
  const parts = components.map(c => {
    const name = normalizeName(c.name || '').toLowerCase().replace(/\s+/g, '-');
    const val = c.strength_value != null ? String(c.strength_value) : '';
    const unit = (c.strength_unit || '').toLowerCase();
    return `${name}:${val}${unit}`;
  });
  return parts.sort().join('|');
}

/**
 * Normalize a presentation type string to one of the allowed enum values.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizePresentationType(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/[\s-]/g, '_');
  const VALID = ['vial', 'single_cartridge_pen', 'double_cartridge_pen', 'nasal_spray', 'sublingual_drops', 'capsule', 'tablet', 'topical_cream', 'topical_oil'];
  if (VALID.includes(lower)) return lower;
  // Fuzzy & canonical match
  if (lower.includes('double') && (lower.includes('pen') || lower.includes('cartridge'))) return 'double_cartridge_pen';
  if (lower.includes('pen') || lower.includes('cartridge') || lower.includes('refill')) return 'single_cartridge_pen';
  if (lower.includes('vial') || lower.includes('lyoph') || lower.includes('inject')) return 'vial';
  if (lower.includes('nasal') || lower.includes('spray')) return 'nasal_spray';
  if (lower.includes('drop') || lower.includes('sublingual')) return 'sublingual_drops';
  if (lower.includes('capsule') || lower.includes('oral')) return 'capsule';
  if (lower.includes('tablet') || lower.includes('pill')) return 'tablet';
  if (lower.includes('cream') || lower.includes('topical')) return 'topical_cream';
  return null;
}

/**
 * Normalize a dosage form string to one of the allowed enum values.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizeDosageForm(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/[\s-]/g, '_');
  const VALID = ['lyophilized_powder', 'injectable_solution', 'nasal_spray', 'oral_capsule', 'oral_sustained_release', 'topical_cream'];
  if (VALID.includes(lower)) return lower;
  if (lower.includes('lyoph') || lower.includes('powder')) return 'lyophilized_powder';
  if (lower.includes('inject') || lower.includes('solution')) return 'injectable_solution';
  if (lower.includes('nasal') || lower.includes('spray')) return 'nasal_spray';
  if (lower.includes('capsule') || lower.includes('oral')) return lower.includes('sustained') ? 'oral_sustained_release' : 'oral_capsule';
  if (lower.includes('cream') || lower.includes('topical')) return 'topical_cream';
  return null;
}

/**
 * Normalize a price context string.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizePriceContext(raw) {
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/[\s-]/g, '_');
  const VALID = [
    'acquisition_cost', 'indicative_retail', 'clinic_trade_price',
    'clinic_trade_price_excluding_vat', 'clinic_trade_price_including_vat', 'patient_retail_price',
  ];
  if (VALID.includes(lower)) return lower;
  if (lower.includes('acquisition') || lower.includes('wholesale') || lower.includes('cost')) return 'acquisition_cost';
  if (lower.includes('retail') && lower.includes('indicative')) return 'indicative_retail';
  if (lower.includes('retail')) return 'patient_retail_price';
  if (lower.includes('excl')) return 'clinic_trade_price_excluding_vat';
  if (lower.includes('incl')) return 'clinic_trade_price_including_vat';
  if (lower.includes('clinic') || lower.includes('trade')) return 'clinic_trade_price';
  return null;
}

export const normalizer = {
  normalizeName,
  extractBaseName,
  buildCanonicalSignature,
  normalizePresentationType,
  normalizeDosageForm,
  normalizePriceContext,
  ALIAS_MAP,
};

export default normalizer;
