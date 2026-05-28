 
/**
 * compoundIndex.js
 *
 * Canonical lookup table: blueprint compound slug → preferred Firestore product ID.
 *
 * WHY THIS EXISTS:
 *   Protocol blueprints reference compounds by short slugs (e.g. "tirzepatide"),
 *   while the Firestore product catalog uses full IDs (e.g. "Tirzepatide-5mg-vial").
 *   Without this index, matching relies on fragile substring fuzzy logic.
 *
 * HOW TO MAINTAIN:
 *   When a new product is added to Firestore, add its compound slug → preferred ID here.
 *   The "preferred ID" should be the most clinically relevant SKU for protocol use
 *   (typically the lowest standard-dose vial, e.g. 5mg).
 *
 * STRUCTURE:
 *   { [blueprintSlug]: firestoreProductId }
 *
 * Blueprint slugs are lowercase, hyphen-separated, no units.
 * Firestore IDs are case-sensitive — copy them exactly from Firebase Console.
 */

const COMPOUND_INDEX = {
  // ── GLP-1 / Metabolic ────────────────────────────────────────────────────
  tirzepatide:             'Tirzepatide-5mg-vial',
  'tirzepatide-2.5':       'Tirzepatide-2.5mg-vial',
  'tirzepatide-5':         'Tirzepatide-5mg-vial',
  'tirzepatide-7.5':       'Tirzepatide-7.5mg-vial',
  'tirzepatide-10':        'Tirzepatide-10mg-vial',
  'tirzepatide-15':        'Tirzepatide-15mg-vial',
  semaglutide:             'Semaglutide-2mg-vial',
  'semaglutide-2':         'Semaglutide-2mg-vial',
  'semaglutide-5':         'Semaglutide-5mg-vial',
  'semaglutide-10':        'Semaglutide-10mg-vial',
  retatrutide:             'Retatrutide-10mg-vial',
  'retatrutide-10':        'Retatrutide-10mg-vial',
  'retatrutide-15':        'Retatrutide-15mg-vial',
  'retatrutide-20':        'Retatrutide-20mg-vial',

  // ── Growth Hormone Peptides ──────────────────────────────────────────────
  sermorelin:              'Sermorelin-2mg-vial',
  ipamorelin:              'Ipamorelin-5mg-vial',
  'cjc-1295':              'CJC-1295_DAC-2mg-vial',
  'cjc-1295-dac':          'CJC-1295_DAC-2mg-vial',
  'cjc-1295-no-dac':       'CJC-1295_No_DAC-2mg-vial',
  'cjc-1295-ipamorelin':   'CJC-1295_No_DAC_Ipamorelin-5-5mg-vial',
  tesamorelin:             'Tesamorelin-2mg-vial',
  hexarelin:               'Hexarelin-2mg-vial',
  'ghrp-2':                'GHRP-2-5mg-vial',
  'ghrp-6':                'GHRP-6-5mg-vial',
  hgh:                     'HGH-10iu-vial',
  'igf-1-lr3':             'IGF-1_LR3-1mg-vial',
  'igf-1':                 'IGF-1_LR3-1mg-vial',
  'peg-mgf':               'PEG_MGF-2mg-vial',
  'fst-344':               'FST-344_(Follistatin)-1mg-vial',
  follistatin:             'FST-344_(Follistatin)-1mg-vial',

  // ── Tissue Repair / Recovery ─────────────────────────────────────────────
  'bpc-157':               'BPC-157-5mg-vial',
  'tb-500':                'TB-500_(Thymosin_β4)-2mg-vial',
  'thymosin-beta-4':       'TB-500_(Thymosin_β4)-2mg-vial',
  'bpc-157-tb-500':        'BPC-157_TB-500-5-5mg-vial',
  'aod-9604':              'AOD-9604-2mg-vial',

  // ── Skin / Anti-Aging ────────────────────────────────────────────────────
  'ghk-cu':                'GHK-Cu_(Copper_Peptide)-5mg-vial',
  'copper-peptide':        'GHK-Cu_(Copper_Peptide)-5mg-vial',
  epithalon:               'Epithalon-5mg-vial',
  'snap-8':                'Snap-8-10mg-vial',
  glow:                    'GLOW_(BPC-157-TB-500-GHK-Cu)-10-10-75mg-vial',

  // ── Immune / Thymus ──────────────────────────────────────────────────────
  'thymosin-alpha-1':      'Thymosin_Alpha_1-5mg-vial',
  'thymosin-a1':           'Thymosin_Alpha_1-5mg-vial',
  'ara-290':               'ARA-290-16mg-vial',
  'mots-c':                'MOTS-C-5mg-vial',
  'ss-31':                 'SS-31-10mg-vial',
  'll-37':                 'LL-37-2mg-vial',
  thymulin:                'Thymulin-10mg-vial',
  thymagen:                'Thymagen-10mg-vial',
  pinealon:                'Pinealon-10mg-vial',
  testagen:                'Testagen-10mg-vial',
  vesugen:                 'Vesugen-10mg-vial',
  prostamax:               'Prostamax-10mg-vial',
  'vip':                   'VIP-5mg-vial',
  dsip:                    'DSIP-2mg-vial',

  // ── Cognitive / Neuro ────────────────────────────────────────────────────
  selank:                  'Selank-5mg-vial',
  semax:                   'Semax-5mg-vial',

  // ── Sexual Health ────────────────────────────────────────────────────────
  'pt-141':                'PT-141_(Bremelanotide)-10mg-vial',
  bremelanotide:           'PT-141_(Bremelanotide)-10mg-vial',
  'mt-2':                  'MT-2_(Melanotan_II)-10mg-vial',
  melanotan:               'MT-2_(Melanotan_II)-10mg-vial',
  kisspeptin:              'Kisspeptin-10-2mg-vial',
  'kisspeptin-10':         'Kisspeptin-10-2mg-vial',
  hcg:                     'HCG-5000iu-vial',
  hmg:                     'HMG-75iu-vial',

  // ── Metabolic / PPAR ────────────────────────────────────────────────────
  'gw-501516':             'GW-501516-10mg-vial',
  'slu-pp-332':            'SLU_PP-332-50mg-vial',

  // ── Longevity / Other ────────────────────────────────────────────────────
  '5-amino-1mq':           '5-AMINO_1_MQ-2mg-vial',
  'pnc-27':                'PNC-27-5mg-vial',

  // ── Accessories ─────────────────────────────────────────────────────────
  'insulin-syringes':      'Precision_Insulin_Syringes-Box_of_100',
};

/**
 * Resolves a blueprint slug to a Firestore product ID.
 *
 * Strategy (in priority order):
 *  1. Direct hit in COMPOUND_INDEX (exact slug match)
 *  2. Normalized hit (lowercase + strip non-alphanumeric)
 *  3. Returns null — caller decides fallback
 *
 * @param {string} blueprintSlug - The slug from the protocol blueprint
 * @returns {string|null} Firestore product ID, or null if not found
 */
export function resolveProductId(blueprintSlug) {
  if (!blueprintSlug) return null;

  // 1. Direct match
  if (COMPOUND_INDEX[blueprintSlug]) return COMPOUND_INDEX[blueprintSlug];

  // 2. Lowercase match
  const lower = blueprintSlug.toLowerCase();
  if (COMPOUND_INDEX[lower]) return COMPOUND_INDEX[lower];

  // 3. Normalized slug (remove underscores, spaces → hyphens, strip special chars)
  const normalized = lower.replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (COMPOUND_INDEX[normalized]) return COMPOUND_INDEX[normalized];

  return null;
}

/**
 * Checks if a given blueprint slug is present in the index.
 */
export function isIndexed(blueprintSlug) {
  return resolveProductId(blueprintSlug) !== null;
}

/**
 * Returns the full index map (read-only reference).
 * Useful for admin tooling or debugging.
 */
export function getCompoundIndex() {
  return COMPOUND_INDEX;
}

export default COMPOUND_INDEX;
