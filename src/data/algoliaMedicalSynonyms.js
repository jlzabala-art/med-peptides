/**
 * src/data/algoliaMedicalSynonyms.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Medical Synonyms & Semantic Indication Dictionaries for Algolia
 *
 * Maps brand names, abbreviations, active ingredients, and clinical symptoms
 * to ensure 100% search precision across practitioner and patient queries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PEPTIDE_SYNONYM_DICTIONARY = [
  // GLP-1 & Metabolic Peptides
  {
    type: 'synonyms',
    objectID: 'syn-semaglutide',
    synonyms: ['semaglutide', 'ozempic', 'wegovy', 'rybelsus', 'glp-1', 'glp1', 'semaglutida']
  },
  {
    type: 'synonyms',
    objectID: 'syn-tirzepatide',
    synonyms: ['tirzepatide', 'mounjaro', 'zepbound', 'glp-1/gip', 'gip', 'tirzepatida']
  },
  {
    type: 'synonyms',
    objectID: 'syn-retatrutide',
    synonyms: ['retatrutide', 'ly3437943', 'triple agonist', 'glp/gip/gcgr', 'reta']
  },
  {
    type: 'synonyms',
    objectID: 'syn-cagrilintide',
    synonyms: ['cagrilintide', 'amylin analog', 'cagrisema', 'nn9838']
  },

  // Tissue Repair & Longevity
  {
    type: 'synonyms',
    objectID: 'syn-bpc157',
    synonyms: ['bpc-157', 'bpc157', 'body protection compound 157', 'pl 14736', 'pl-10', 'bepecin', 'gut repair peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-tb500',
    synonyms: ['tb-500', 'tb500', 'thymosin beta-4', 'thymosin beta 4', 'tβ4', 'lkktetq', 'tissue repair peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-kpv',
    synonyms: ['kpv', 'lysine-proline-valine', 'alpha-msh fragment', 'gut anti-inflammatory', 'ibd peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-epitalon',
    synonyms: ['epitalon', 'epithalon', 'epithalamin', 'ala-glu-asp-gly', 'aedg', 'telomerase activator', 'anti-aging peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-mots-c',
    synonyms: ['mots-c', 'motsc', 'mitochondrial derived peptide', 'metabolic peptide', 'longevity peptide']
  },

  // Cognitive & Neuroprotection
  {
    type: 'synonyms',
    objectID: 'syn-semax',
    synonyms: ['semax', 'acth 4-10 heptapeptide', 'nootropic peptide', 'neuroprotective', 'focus peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-selank',
    synonyms: ['selank', 'tp-7', 'anxiolytic peptide', 'tuftsin analog']
  },

  // Growth Hormone Secretagogues
  {
    type: 'synonyms',
    objectID: 'syn-cjc1295',
    synonyms: ['cjc-1295', 'cjc1295', 'dac', 'no dac', 'modified grf 1-29', 'mod grf', 'growth hormone releasing peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-ipamorelin',
    synonyms: ['ipamorelin', 'nnc 26-0161', 'ghrp', 'gh secretagogue']
  },
  {
    type: 'synonyms',
    objectID: 'syn-tesamorelin',
    synonyms: ['tesamorelin', 'egrifta', 'th9507', 'grf analog', 'visceral fat peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-sermorelin',
    synonyms: ['sermorelin', 'geref', 'grf 1-29']
  },

  // Sexual Health & Pigmentation
  {
    type: 'synonyms',
    objectID: 'syn-pt141',
    synonyms: ['pt-141', 'pt141', 'bremelanotide', 'vyleesi', 'libido peptide']
  },
  {
    type: 'synonyms',
    objectID: 'syn-melanotan2',
    synonyms: ['melanotan 2', 'melanotan ii', 'mt-2', 'mt2']
  },

  // Sleep & Recovery
  {
    type: 'synonyms',
    objectID: 'syn-dsip',
    synonyms: ['dsip', 'delta sleep-inducing peptide', 'emideltide', 'deep sleep peptide']
  },

  // Skin & Copper Peptides
  {
    type: 'synonyms',
    objectID: 'syn-ghk-cu',
    synonyms: ['ghk-cu', 'ghk cu', 'copper peptide', 'glycyl-l-histidyl-l-lysine copper', 'collagen peptide']
  }
];

/**
 * Maps common symptom or goal queries to specific clinical peptide keywords
 */
export const CLINICAL_INDICATION_MAP = {
  'gut healing': 'bpc-157 kpv',
  'gut inflammation': 'bpc-157 kpv',
  'tendon repair': 'bpc-157 tb-500',
  'ligament injury': 'bpc-157 tb-500',
  'fat loss': 'semaglutide tirzepatide aod-9604 tesamorelin',
  'weight loss': 'semaglutide tirzepatide retatrutide',
  'cognitive focus': 'semax selank',
  'brain fog': 'semax selank nad+',
  'deep sleep': 'dsip epitalon',
  'sleep recovery': 'dsip epitalon',
  'anti aging': 'epitalon mots-c ghk-cu',
  'cellular longevity': 'epitalon mots-c nad+',
  'muscle growth': 'cjc-1295 ipamorelin igf-1 lr3',
  'skin elasticity': 'ghk-cu collagen',
  'libido enhancement': 'pt-141 bremelanotide'
};

/**
 * Normalizes query string with clinical indication expansions if direct matches exist
 */
export function expandClinicalQuery(rawQuery = '') {
  if (!rawQuery) return '';
  const clean = rawQuery.toLowerCase().trim();
  if (CLINICAL_INDICATION_MAP[clean]) {
    return `${clean} ${CLINICAL_INDICATION_MAP[clean]}`;
  }
  return clean;
}
