 
/**
 * productConstants.js
 *
 * Static configuration constants for the product catalog.
 * These are UI/UX constants, NOT product data — product data lives in Firestore.
 */

export const productCategories = [
  "Recovery & Repair",
  "Cognitive & Mood",
  "Sleep & Circadian",
  "Metabolic & Weight",
  "Longevity & Anti-Aging",
  "Hormonal Optimization",
  "Immune Support",
  "Research Supplies",
  "Other Research Peptides"
];

export const SUPPLIERS = {
  // Canonical supplier IDs
  'supplier-fagron-iberia':   'Fagron Iberia',
  'supplier-fagron-genomics': 'Fagron Genomics',
  'supplier-nplabs':          'NP Labs',
  'supplier-24genetics':      '24Genetics S.L.',
  'supplier-magenta':         'Magenta',
  'supplier-lotusland':       'Lotusland',
  'supplier-bioniq':          'Bioniq',
  'supplier-vallida':         'Vallida Labs',
  'supplier-pod-poland':      'POD Poland',
  'supplier-europeptides':    'Europeptides',
  'supplier-fusion':          'Fusion',
  'supplier-bloodo':          'Bloodo UAB',
  'supplier-eternadx':        'ETERNA Diagnostics S.L.',
  'supplier-centrico':        'Centrico',
  'supplier-larimedical':     'LARIMEDICAL (Larimide S.L.U.)',

  // Legacy aliases for backward compatibility
  larimedical:                'LARIMEDICAL (Larimide S.L.U.)',
  larimide:                   'LARIMEDICAL (Larimide S.L.U.)',
  centrico:                   'Centrico',
  'supplier-centrico':        'Centrico',
  lotusland:                  'Lotusland',
  'lotus-land':               'Lotusland',
  'lotus land':               'Lotusland',
  'Lotus Land':               'Lotusland',
  pod_poland:                 'POD Poland',
  fagron_iberica:             'Fagron Iberia',
  fagron_genomics:            'Fagron Genomics',
  nplab:                      'NP Labs',
  europeptides:               'Europeptides',
  dn_lab:                     'DN Lab'
};

/**
 * Normalizes any variation of supplier identifier or name to its canonical Firestore ID.
 * E.g., 'lotus land', 'lotus-land', 'Lotusland', 'supplier-lotusland' -> 'supplier-lotusland'
 */
export function normalizeSupplierId(raw) {
  if (!raw) return 'supplier-lotusland';
  const clean = String(raw).toLowerCase().trim();
  if (clean.includes('lotus')) return 'supplier-lotusland';
  if (clean.startsWith('supplier-')) return clean;
  return `supplier-${clean.replace(/[\s_]+/g, '-')}`;
}

/**
 * Returns the canonical display name for a supplier.
 * E.g., 'lotus land', 'supplier-lotusland' -> 'Lotusland'
 */
export function getCanonicalSupplierName(raw) {
  if (!raw) return 'Lotusland';
  const clean = String(raw).toLowerCase().trim();
  if (clean.includes('lotus')) return 'Lotusland';
  return SUPPLIERS[raw] || SUPPLIERS[normalizeSupplierId(raw)] || raw;
}

