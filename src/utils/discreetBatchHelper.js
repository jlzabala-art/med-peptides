import { BRAND_CONFIG } from '../config/brandConfig';

/**
 * discreetBatchHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates institutional, clinical, discreet batch/lot codes and product prefixes.
 * Designed to provide an unmistakable association between brand, supplier,
 * product, dose, and lot period without disclosing the full chemical name
 * on physical outer packaging.
 *
 * Format: MP-[SUPPLIER]-[PRODUCT_CODE][DOSE]-[YYMM]
 * Example: MP-LOT-RT10-2609 (Retatrutide 10mg, Lotusland, Sept 2026)
 */

export const DISCREET_PRODUCT_CODES = {
  retatrutide: 'RT',
  tirzepatide: 'TZ',
  semaglutide: 'SM',
  cagrilintide: 'CG',
  mazdutide: 'MZ',
  survodutide: 'SV',
  bpc157: 'BP',
  'bpc-157': 'BP',
  tb500: 'TB',
  'tb-500': 'TB',
  epithalon: 'EP',
  ghkcu: 'GH',
  'ghk-cu': 'GH',
  ipamorelin: 'IP',
  cjc1295: 'CJ',
  'cjc-1295': 'CJ',
  'cjc-1295-dac': 'CJD',
  'cjc-1295-no-dac': 'CJN',
  nad: 'ND',
  nadplus: 'ND',
  motsc: 'MC',
  'mots-c': 'MC',
  ss31: 'SS',
  'ss-31': 'SS',
  selank: 'SL',
  semax: 'SX',
  aod9604: 'AD',
  'aod-9604': 'AD',
  tesofensine: 'TS',
  sermorelin: 'SR',
  melanotan: 'MT',
  'melanotan-2': 'MT',
  pt141: 'PT',
  'pt-141': 'PT',
  oxytocin: 'OX',
  kisspeptin: 'KP',
  'kisspeptin-10': 'KP',
  glutathione: 'GL',
  snoozi: 'SN',
  dsip: 'DS',
  ll37: 'LL',
  'll-37': 'LL',
  foxo4dri: 'FX',
  'foxo4-dri': 'FX',
  'fox-04': 'FX',
  'foxo4-10-mg': 'FX',
  tesamorelin: 'TM',
  'tesamorelin-ipamorelin': 'TI',
  'ghrp-2': 'G2',
  ghrp2: 'G2',
  'ghrp-6': 'G6',
  ghrp6: 'G6',
  hexarelin: 'HX',
  follistatin: 'FS',
  'follistatin-344': 'FS',
  'fst-344': 'FS',
  'fst-344-follistatin': 'FS',
  humanin: 'HN',
  'thymosin-alpha-1': 'TA',
  'thymosin-alpha': 'TA',
  thymalin: 'TL',
  kpv: 'KV',
  dihexa: 'DH',
  'ara-290': 'AR',
  'slu-pp-332': 'SL',
  'slupp332': 'SL',
  glow: 'GLW',
  'klow-peptide': 'KLW',
  'adipotide-2mg': 'AD',
  'aicar-50-mg': 'AC',
};

export const SUPPLIER_CODES = {
  lotusland: 'LOT',
  'supplier-lotusland': 'LOT',
  pod: 'POD',
  'supplier-pod-poland': 'POD',
  nplabs: 'NPL',
  'supplier-nplabs': 'NPL',
  magenta: 'MAG',
  'supplier-magenta': 'MAG',
};

export function getDiscreetProductPrefix(slug) {
  const brandCode = BRAND_CONFIG.shortCode || 'MP';
  if (!slug) return brandCode;
  const clean = String(slug).toLowerCase().trim().replace(/^lotusland[-_]/i, '');
  if (DISCREET_PRODUCT_CODES[clean]) return DISCREET_PRODUCT_CODES[clean];
  
  // Clean punctuation and find consonants
  const stripped = clean.replace(/[^a-z0-9]/g, '');
  if (DISCREET_PRODUCT_CODES[stripped]) return DISCREET_PRODUCT_CODES[stripped];

  const consonants = stripped.replace(/[^bcdfghjklmnpqrstvwxyz]/g, '').toUpperCase();
  if (consonants.length >= 2) return consonants.slice(0, 2);
  return stripped.slice(0, 2).toUpperCase() || brandCode;
}

export function getSupplierCode(supplierIdOrName) {
  if (!supplierIdOrName) return 'LOT';
  const clean = String(supplierIdOrName).toLowerCase().replace(/^supplier[-_]/, '').trim();
  if (clean.includes('lotus')) return 'LOT';
  if (clean.includes('pod')) return 'POD';
  if (clean.includes('np')) return 'NPL';
  if (clean.includes('magenta')) return 'MAG';
  const match = SUPPLIER_CODES[clean];
  if (match) return match;
  return clean.slice(0, 3).toUpperCase();
}

export function formatDoseCode(doseStr) {
  if (!doseStr) return '10';
  const numMatch = String(doseStr).match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return '10';
  const num = parseFloat(numMatch[1]);
  if (Number.isInteger(num)) {
    return num < 10 ? `0${num}` : `${num}`;
  }
  return String(num).replace('.', '');
}

/**
 * Generates an institutional discreet batch code.
 * Example: generateDiscreetBatchCode({ slug: 'retatrutide', dose: '10 mg', supplier: 'supplier-lotusland' })
 * => "MP-LOT-RT10-2609"
 */
export function generateDiscreetBatchCode({ slug, dose, supplier, date } = {}) {
  const d = date ? new Date(date) : new Date();
  const yearMonth = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const suppCode = getSupplierCode(supplier);
  const prodPrefix = getDiscreetProductPrefix(slug);
  const doseCode = formatDoseCode(dose);
  const brandPrefix = BRAND_CONFIG.shortCode || 'MP';
  return `${brandPrefix}-${suppCode}-${prodPrefix}${doseCode}-${yearMonth}`;
}
