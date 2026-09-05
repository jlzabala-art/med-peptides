/**
 * CATEGORY TYPES — Canonical Taxonomy (Strict IDs)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product categories in Firestore & UI.
 * Rule: ONLY these ID keys are allowed in product.category.
 */

export const CATEGORY_TYPES = {
  PEPTIDE:             'peptide',              // All peptides (monotherapies and blends)
  SUPPLEMENT:          'supplement',           // Capsules, nutraceuticals, oral supplements
  GENOMICS_BIOMARKERS: 'genomics_biomarkers',  // Non-diagnostic genomic panels, DNA tests, biomarker kits
  RAW_MATERIAL:        'raw_material',         // API, compounding raw materials, excipients
  SERVICE:             'service',              // Digital services, SaaS, subscriptions
};

export const VALID_CATEGORIES = new Set(Object.values(CATEGORY_TYPES));

export const CATEGORY_LABELS = {
  peptide:             'Peptide',
  supplement:          'Supplement & Nutraceutical',
  genomics_biomarkers: 'Genomics & Biomarkers',
  diagnostic:          'Genomics & Biomarkers',
  raw_material:        'Raw Material / API',
  service:             'Digital Service / SaaS',
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

  // Genomics, DNA Panels & Biomarkers (Formerly Diagnostic)
  'genomics_biomarkers':       'genomics_biomarkers',
  'genomics':                  'genomics_biomarkers',
  'genetic_test':              'genomics_biomarkers',
  'diagnostic':                'genomics_biomarkers',
  'diagnostic_test':           'genomics_biomarkers',
  'dna_test':                  'genomics_biomarkers',
  'test_kit':                  'genomics_biomarkers',
  'biomarker_test':            'genomics_biomarkers',
  'blood_analysis':            'genomics_biomarkers',
  'proteomics':                'genomics_biomarkers',

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
