/**
 * PRESENTATION TYPES — Canonical Taxonomy
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product presentation/format values.
 * Used in: Firestore variant docs, catalog filters, DataTable columns, PDFs.
 *
 * Rule: ONLY these values are valid in variant.presentation.
 *       Anything else must be mapped via PRESENTATION_ALIASES before writing.
 */

export const PRESENTATION_TYPES = {
  // Finished Products
  VIAL:                 'vial',
  SINGLE_CARTRIDGE_PEN: 'single_cartridge_pen',
  DOUBLE_CARTRIDGE_PEN: 'double_cartridge_pen',
  CAPSULE:              'capsule',
  TABLET:               'tablet',
  NASAL_SPRAY:          'nasal_spray',
  SUBLINGUAL_DROPS:     'sublingual_drops',
  TOPICAL_CREAM:        'topical_cream',
  TOPICAL_OIL:          'topical_oil',
  KIT:                  'kit',
  DIGITAL:              'digital',
  
  // Raw Material / APIs
  BULK_POWDER:          'bulk_powder',
  BULK_LIQUID:          'bulk_liquid',
  PELLET:               'pellet',
  EMPTY_CAPSULE:        'empty_capsule',
};

/** All valid canonical values as a Set for O(1) validation */
export const VALID_PRESENTATIONS = new Set(Object.values(PRESENTATION_TYPES));

/**
 * Human-readable labels for each canonical value.
 * Used in UI dropdowns, filter chips, badges, DataTable headers.
 */
export const PRESENTATION_LABELS = {
  vial:                 'Vial',
  single_cartridge_pen: 'Single Cartridge Pen',
  double_cartridge_pen: 'Double Cartridge Pen',
  refill_cartridge:     'Single Cartridge Pen', // Unified into Single Cartridge Pen
  pen:                  'Single Cartridge Pen', // Backward-compatible canonical alias
  cartridge:            'Single Cartridge Pen', // Backward-compatible canonical alias
  capsule:              'Capsule',
  tablet:               'Tablet',
  nasal_spray:          'Nasal Spray',
  sublingual_drops:     'Sublingual Drops',
  topical_cream:        'Topical Cream',
  topical_oil:          'Topical Oil',
  kit:                  'Kit',
  digital:              'Digital Service',
  bulk_powder:          'Bulk Powder',
  bulk_liquid:          'Bulk Liquid',
  pellet:               'Pellet',
  empty_capsule:        'Empty Capsule',
};

/**
 * Exhaustive alias → canonical mapping.
 * Keys: lowercased, trimmed raw values from Firestore.
 * Values: canonical PRESENTATION_TYPES value.
 *
 * Add new aliases here whenever a new raw value is discovered in the DB.
 */
export const PRESENTATION_ALIASES = {
  // Cartridge / Refill variants -> Unified to single_cartridge_pen
  'refill cartridge':          'single_cartridge_pen',
  'cartridge':                 'single_cartridge_pen',
  'refill':                    'single_cartridge_pen',
  'pen cartridge':             'single_cartridge_pen',
  'double cartridge':          'double_cartridge_pen',
  'double cartridge refill':   'double_cartridge_pen',
  'double-cartridge':          'double_cartridge_pen',

  // Pen variants
  'single cartridge pen':      'single_cartridge_pen',
  'single-cartridge pen':      'single_cartridge_pen',
  'single cartridge':          'single_cartridge_pen',
  'double cartridge pen':      'double_cartridge_pen',
  'double-cartridge pen':      'double_cartridge_pen',
  'pre-filled pen':            'single_cartridge_pen',
  'prefilled pen':             'single_cartridge_pen',
  'pre filled pen':            'single_cartridge_pen',
  'single use pen':            'single_cartridge_pen',
  'single-use pen':            'single_cartridge_pen',
  'singleuse pen':             'single_cartridge_pen',
  'pen':                       'single_cartridge_pen',
  'reconstitution pen':        'single_cartridge_pen',
  'multi-dose pen':            'single_cartridge_pen',
  'multidose pen':             'single_cartridge_pen',
  'injection pen':             'single_cartridge_pen',
  'auto-injector':             'single_cartridge_pen',

  // Nasal spray variants
  'nasal spray':               'nasal_spray',
  'nasal_spray':               'nasal_spray',
  'nasal-spray':               'nasal_spray',
  'spray':                     'nasal_spray',
  'intranasal spray':          'nasal_spray',

  // Sublingual drops variants
  'sublingual drops':          'sublingual_drops',
  'sublingual':                'sublingual_drops',
  'drops':                     'sublingual_drops',

  // Capsule variants
  'capsule':                   'capsule',
  'capsules':                  'capsule',
  'cap':                       'capsule',
  'oral capsule':              'capsule',

  // Tablet variants
  'tablet':                    'tablet',
  'tablets':                   'tablet',
  'tab':                       'tablet',
  'pill':                      'tablet',
  'oral tablet':               'tablet',

  // Vial variants
  'vial':                      'vial',
  'vials':                     'vial',
  'lyophilised vial':          'vial',
  'lyophilized vial':          'vial',
  'powder vial':               'vial',
  'injectable vial':           'vial',
  'ampoule':                   'vial',

  // Topical
  'cream':                     'topical_cream',
  'gel':                       'topical_cream',
  'topical cream':             'topical_cream',
  'topical gel':               'topical_cream',
  'topical':                   'topical_cream',
  'topical oil':               'topical_oil',
  'oil':                       'topical_oil',

  // Bottle
  'bottle':                    'bottle',
  'liquid bottle':             'bottle',
  'dropper':                   'bottle',
  'tincture':                  'bottle',

  // Kit / collection
  'kit':                       'kit',
  'starter kit':               'kit',
  'collection kit':            'kit',
  'saliva collection kit':     'kit',
  'saliva collection kit x2':  'kit',
  'saliva collection kit x4':  'kit',
  'test kit':                  'kit',

  // Bundle
  'bundle':                    'bundle',
  'pack':                      'bundle',
  'combo':                     'bundle',

  // Digital
  'digital subscription':      'digital',
  'subscription':              'digital',
  'digital service':           'digital',
  'saas':                      'digital',
  'platform access':           'digital',

  // Blood / lab tests
  'blood test':                'blood_test',
  'blood analysis':            'blood_test',
  'blood draw kit':            'blood_test',
  'lab test':                  'blood_test',
  'serum':                     'blood_test',

  // DNA tests
  'dna test':                  'dna_test',
  'dna_test':                  'dna_test',
  'genetic test':              'dna_test',
  'genetics test':             'dna_test',
  'saliva test':               'dna_test',

  // Box
  'box':                       'box',
  'boxed':                     'box',
};

/**
 * Infer presentation from a free-text string (label, product name, etc.)
 * Returns a canonical PRESENTATION_TYPES value or null.
 *
 * @param {string} text
 * @returns {string|null}
 */
export function inferPresentation(text) {
  const t = (text || '').toLowerCase();

  // Direct alias match first
  const direct = PRESENTATION_ALIASES[t.trim()];
  if (direct) return direct;

  // Pattern-based inference (order matters — more specific first)
  if (/double.?cartridge/i.test(t))              return 'double_cartridge_pen';
  if (/single.?cartridge/i.test(t))              return 'single_cartridge_pen';
  if (/refill|cartridge/i.test(t))               return 'single_cartridge_pen';
  if (/nasal.?spray|intranasal/i.test(t))         return 'nasal_spray';
  if (/pre.?fill|prefill|single.?use.?pen|auto.?inject/i.test(t)) return 'single_cartridge_pen';
  if (/\bpen\b/i.test(t))                          return 'single_cartridge_pen';
  if (/capsule|cap\b/i.test(t))                    return 'capsule';
  if (/tablet|tab\b|\bpill\b/i.test(t))            return 'tablet';
  if (/cream|gel\b|topical/i.test(t))              return 'cream';
  if (/\bbottle\b|\btincture\b|\bdropper\b/i.test(t)) return 'bottle';
  if (/blood.?(test|draw|analys)/i.test(t))        return 'blood_test';
  if (/dna|genetic|saliva.?kit/i.test(t))          return 'dna_test';
  if (/digital|subscription|platform/i.test(t))   return 'digital';
  if (/bundle|pack\b|combo/i.test(t))              return 'bundle';
  if (/\bkit\b/i.test(t))                          return 'kit';
  if (/\bbox\b|syringe/i.test(t))                  return 'box';
  if (/spray/i.test(t))                            return 'nasal_spray';
  if (/vial|ampoule|powder|lyophil/i.test(t))     return 'vial';

  return null;
}

/**
 * Normalise a raw presentation value to canonical.
 * Returns the canonical value or null if it cannot be resolved.
 *
 * @param {string} raw
 * @returns {string|null}
 */
export function normalisePresentation(raw) {
  if (!raw) return null;
  const lowered = raw.trim().toLowerCase();

  // Already canonical
  if (VALID_PRESENTATIONS.has(lowered)) return lowered;

  // Alias lookup
  if (PRESENTATION_ALIASES[lowered]) return PRESENTATION_ALIASES[lowered];

  // Pattern inference
  return inferPresentation(raw);
}

export const normalizePresentation = normalisePresentation;

