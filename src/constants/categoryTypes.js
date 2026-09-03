/**
 * CATEGORY TYPES — Canonical Taxonomy (Strict IDs)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product categories in Firestore & UI.
 * Rule: ONLY these ID keys are allowed in product.category.
 */

export const CATEGORY_TYPES = {
  PEPTIDE:         'peptide',          // All peptides (monotherapies and blends)
  SUPPLEMENT:      'supplement',       // Capsules, nutraceuticals, oral supplements
  DIAGNOSTIC:      'diagnostic',       // Blood draw, DNA kits, biomarker tests
  RAW_MATERIAL:    'raw_material',     // API, compounding raw materials, excipients
  SERVICE:         'service',          // Digital services, SaaS, subscriptions
};

export const VALID_CATEGORIES = new Set(Object.values(CATEGORY_TYPES));

export const CATEGORY_LABELS = {
  peptide:         'Peptide',
  supplement:      'Supplement & Nutraceutical',
  diagnostic:      'Diagnostic & Biomarker Test',
  raw_material:    'Raw Material / API',
  service:         'Digital Service / SaaS',
};

export const CATEGORY_ALIASES = {
  // Peptides & Blends -> all resolved to 'peptide'
  'peptides':                  'peptide',
  'peptide':                   'peptide',
  'peptide blend':             'peptide',
  'peptide_blend':             'peptide',
  'peptide combination':       'peptide',
  'peptide_combination':       'peptide',
  'blend':                     'peptide',

  // Supplements & Consumables
  'supplement':                'supplement',
  'nutraceutical':             'supplement',
  'capsules & consumables':    'supplement',
  'capsules_and_consumables':  'supplement',

  // Diagnostics & Tests
  'diagnostic':                'diagnostic',
  'dna_test':                  'diagnostic',
  'test_kit':                  'diagnostic',
  'biomarker_test':            'diagnostic',
  'blood_analysis':            'diagnostic',
  'proteomics':                'diagnostic',

  // Raw Materials
  'raw_material':              'raw_material',
  'api_raw_material':          'raw_material',
  'excipient':                 'raw_material',
  'compounding_material':      'raw_material',

  // Services
  'service':                   'service',
  'subscription':              'service',
  'equipment':                 'service',
};

export function resolveCategoryId(rawCategory) {
  if (!rawCategory) return CATEGORY_TYPES.PEPTIDE;
  const cleaned = String(rawCategory).trim().toLowerCase();
  return CATEGORY_ALIASES[cleaned] || (VALID_CATEGORIES.has(cleaned) ? cleaned : CATEGORY_TYPES.PEPTIDE);
}
