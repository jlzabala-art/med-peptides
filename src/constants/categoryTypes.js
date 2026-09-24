/**
 * CATEGORY TYPES — Canonical Taxonomy (Strict IDs)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product categories in Firestore & UI.
 * Rule: ONLY these ID keys are allowed in product.category.
 */

export const CATEGORY_TYPES = {
  PEPTIDE:             'peptide',              // All peptides (monotherapies and blends)
  SUPPLEMENT:          'supplement',           // Capsules, nutraceuticals, oral supplements
  DIAGNOSTIC_TEST:     'diagnostic_test',      // Capillary blood tests, DBS biomarkers, diagnostic panels
  GENOMICS_BIOMARKERS: 'genomics_biomarkers',  // DNA genetic panels, genomic saliva tests (Fagron, Eterna)
  RAW_MATERIAL:        'raw_material',         // API, compounding raw materials, excipients
  SERVICE:             'service',              // Digital services, SaaS, subscriptions
};

export const VALID_CATEGORIES = new Set(Object.values(CATEGORY_TYPES));

export const CATEGORY_LABELS = {
  peptide:             'Peptide',
  supplement:          'Supplement & Nutraceutical',
  diagnostic_test:     'Diagnostic Test',
  diagnostic:          'Diagnostic Test',
  genomics_biomarkers: 'Genomics & DNA Panels',
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

  // Capillary Blood Diagnostic Tests (Bloodo, etc.)
  'diagnostic_test':           'diagnostic_test',
  'diagnostic':                'diagnostic_test',
  'diagnostics':               'diagnostic_test',
  'blood_analysis':            'diagnostic_test',
  'blood_test':                'diagnostic_test',
  'biomarker_test':            'diagnostic_test',
  'dbs_test':                  'diagnostic_test',

  // Genomics & DNA Panels (Fagron Genomics, EternaDx, Saliva DNA)
  'genomics_biomarkers':       'genomics_biomarkers',
  'genomics':                  'genomics_biomarkers',
  'genetic_test':              'genomics_biomarkers',
  'dna_test':                  'genomics_biomarkers',
  'trichotest':                'genomics_biomarkers',
  'telotest':                  'genomics_biomarkers',
  'nutrigen':                  'genomics_biomarkers',
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
