/**
 * firestoreProductSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Firestore Product Schema — Post Phase 5
 *
 * This file is the SINGLE SOURCE OF TRUTH for the product data model
 * as it actually exists in Firestore after the Phase 5 data remediation.
 *
 * It defines:
 *   - VALID_STATUSES       → allowed status string values
 *   - VALID_TYPES          → allowed type string values
 *   - VALID_CATEGORIES     → allowed categoryId values
 *   - PRODUCT_FIELDS       → explicit field contract for products/{productId}
 *   - VARIANT_FIELDS       → explicit field contract for variants/{variantId}
 *   - PRICING_TIERS        → the 4 pricing tiers (retail, master, wholesale, clinic)
 *   - CURRENT_SCHEMA_VER   → current schema version number
 *
 * RULES:
 *   - Zero UI imports (no React, no CSS).
 *   - Zero Firebase imports.
 *   - Pure JS — safe for Node scripts, Cloud Functions, and browser.
 *   - This file describes what IS in Firestore, not what SHOULD be.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Schema version ────────────────────────────────────────────────────────────
export const CURRENT_SCHEMA_VER = 2;

// ── Allowed enum values ───────────────────────────────────────────────────────

/**
 * Canonical product statuses (AGENTS.md Rule #28)
 * @readonly
 */
export const VALID_STATUSES = Object.freeze([
  'draft',
  'active',
  'out of stock',
  'hidden',
  'archived',
]);

/**
 * Canonical variant types
 * These are the strictly atomic values for individual variant documents:
 * - finished_product : consumer/patient-ready presentations (vials, pens, sprays, capsules, etc.)
 * - raw_material     : bulk API powder, compounding materials (sold by g, kg, mg)
 * - clinical_supplies: syringes, bacteriostatic water, diluents, sterile filters
 * - diagnostic       : test kits (saliva, blood spot, microbiome, epigenetic panels)
 * - service          : consultations, protocol design, clinical monitoring sessions
 * @readonly
 */
export const VARIANT_TYPES = Object.freeze([
  'finished_product',
  'raw_material',
  'clinical_supplies',
  'diagnostic',
  'service',
]);

/**
 * Canonical cartridge formats for prefilled & reusable pen variants:
 * - single_cartridge: standard single-chamber 1.5ml / 3ml cartridge
 * - double_cartridge: dual-chamber reconstitution or combination therapy pen
 * - no_cartridge    : reusable pen device sold without cartridge
 * @readonly
 */
export const CARTRIDGE_TYPES = Object.freeze([
  'single_cartridge',
  'double_cartridge',
  'no_cartridge',
]);

/**
 * Canonical pen delivery device types:
 * - disposable_prefilled    : single-use prefilled pen with cartridge included
 * - reusable_injector_device: reusable medical pen injector device (accepts refill cartridges)
 * @readonly
 */
export const PEN_TYPES = Object.freeze([
  'disposable_prefilled',
  'reusable_injector_device',
]);

/**
 * Canonical product types (Phase 2 & Phase 3 dynamic normalization)
 * - finished_product : predominantly patient-ready presentations
 * - raw_material     : bulk API or compounding substances
 * - clinical_supplies: accessories, diluents & equipment
 * - dual             : legacy alias for products with both finished and raw variants
 * - diagnostic       : testing kits and biomarkers
 * - service          : professional healthcare services
 * @readonly
 */
export const VALID_TYPES = Object.freeze([
  'finished_product',
  'raw_material',
  'clinical_supplies',
  'diagnostic',
  'dual',
  'service',
  'logistics_service',
]);

/**
 * Helper to derive product availableTypes[], primaryType and isHybrid from its variants.
 * @param {Array<Object>} variants - List of variant objects
 * @param {string} fallbackType - Default type if variants is empty
 * @returns {{ availableTypes: string[], primaryType: string, isHybrid: boolean }}
 */
export function deriveProductTypes(variants = [], fallbackType = 'finished_product') {
  if (!Array.isArray(variants) || variants.length === 0) {
    const defaultType = VALID_TYPES.includes(fallbackType) ? fallbackType : 'finished_product';
    return {
      availableTypes: [defaultType],
      primaryType: defaultType,
      isHybrid: false,
    };
  }

  const rawTypes = variants
    .map(v => v?.type || v?.productType)
    .filter(Boolean)
    .map(t => LEGACY_TYPE_MAP[t] || t)
    .filter(t => VARIANT_TYPES.includes(t) || VALID_TYPES.includes(t));

  const uniqueTypes = Array.from(new Set(rawTypes));
  const availableTypes = uniqueTypes.length > 0 ? uniqueTypes : [fallbackType || 'finished_product'];

  // Priority order for assigning primaryType (for SEO and general catalog overview):
  const priorityOrder = ['finished_product', 'raw_material', 'diagnostic', 'service', 'clinical_supplies'];
  const primaryType = priorityOrder.find(t => availableTypes.includes(t)) || availableTypes[0];

  return {
    availableTypes,
    primaryType,
    isHybrid: availableTypes.length > 1,
  };
}

/**
 * LEGACY_TYPES — accepted on read for backward compat, normalized to VALID_TYPES on write.
 * Do NOT use these in new code.
 * @readonly
 */
export const LEGACY_TYPE_MAP = Object.freeze({
  peptide:               'finished_product',
  supplement:            'finished_product',
  hormone:               'finished_product',
  small_molecule:        'finished_product',
  injectable_nutrient:   'finished_product',
  iv_protocol:           'finished_product',
  topical_cosmetic:      'finished_product',
  professional_material: 'finished_product',
  compounding_material:  'finished_product',
  bundle:                'finished_product',
  test_kit:              'service',
  genetic_test:          'service',
  diagnostic:            'service',
  subscription:          'service',
  api_raw_material:      'raw_material',
  equipment:             'clinical_supplies',
  consumable:            'clinical_supplies',
});

/**
 * Canonical category IDs (Phase 1 normalization) — maps to the categories collection.
 * These are the ONLY valid values for the `categoryId` field.
 * @readonly
 */
export const VALID_CATEGORIES = Object.freeze([
  'peptide',          // injectable peptides, GLP-1s, GHRH, GHRP, hormonal peptides
  'supplement',       // oral supplements, nutraceuticals, vitamins, weight loss
  'metabolic',        // metabolic health, weight management, GLP-1 agonists
  'hormone',          // hormones (testosterone, progesterone, DHEA, estradiol)
  'diagnostic',       // lab tests, genetic tests, blood panels
  'diagnostic_test',  // legacy alias for diagnostic
  'nutricosmetics',   // specialized aesthetic & nutricosmetic formulations
  'raw_material',     // bulk API, excipients, solvents
  'excipient_vehicle',// sterile compounding bases, diluents, solvents
  'clinical_supplies',// syringes, packaging, medical devices, accessories
  'consumable',       // legacy alias for clinical_supplies
  'skincare',         // topical cosmeceuticals, hair care
  'bundle',           // multi-product kits
  'service',          // subscriptions, consultations
  'logistics_service',// temperature-controlled medical courier & freight
  'equipment',        // lab equipment, instruments
]);

/**
 * Pricing tier keys
 * @readonly
 */
export const PRICING_TIERS = Object.freeze(['retail', 'master', 'wholesale', 'clinic']);

// ── Field Contracts ───────────────────────────────────────────────────────────

/**
 * Explicit field contract for `products/{productId}`.
 * Each entry describes: type, whether it's required, and default value.
 *
 * 'required: true' means the field MUST exist on every write.
 * 'auto: true' means the system manages the field (not user input).
 */
export const PRODUCT_FIELD_CONTRACT = Object.freeze({
  // ── Required fields ──
  name:         { type: 'string',    required: true,  default: '' },
  status:       { type: 'enum',      required: true,  default: 'draft',   values: VALID_STATUSES },
  type:         { type: 'enum',      required: true,  default: 'peptide', values: VALID_TYPES },
  categoryId:   { type: 'string',    required: true,  default: '' },

  // ── Denormalized (auto-maintained by system) ──
  supplierIds:  { type: 'string[]',  required: false, auto: true, default: [] },

  // ── Content ──
  displayName:  { type: 'string',    required: false, default: '' },
  description:  { type: 'string',    required: false, default: '' },
  shortDesc:    { type: 'string',    required: false, default: '' },
  imageUrl:     { type: 'string',    required: false, default: '' },

  // ── Search & classification ──
  goals:            { type: 'string[]', required: false, default: [] },
  tags:             { type: 'string[]', required: false, default: [] },
  mechanisms:       { type: 'string[]', required: false, default: [] },
  semanticKeywords: { type: 'string[]', required: false, default: [] },
  synonyms:         { type: 'string[]', required: false, default: [] },
  searchAliases:    { type: 'string[]', required: false, default: [] },

  // ── Science ──
  objective:       { type: 'string',  required: false, default: '' },
  desc:            { type: 'string',  required: false, default: '' },
  scientificName:  { type: 'string',  required: false, default: '' },

  // ── AI-generated content ──
  aiContent:    { type: 'object',  required: false, default: null },
  pharmacology: { type: 'object',  required: false, default: null },

  // ── Flags ──
  isActive:           { type: 'boolean', required: false, default: true },
  isProfessional:     { type: 'boolean', required: false, default: false },
  requiresPrescription: { type: 'boolean', required: false, default: false },

  // ── Schema versioning ──
  _schemaVersion: { type: 'number',    required: false, auto: true, default: CURRENT_SCHEMA_VER },

  // ── Timestamps ──
  createdAt:  { type: 'timestamp', required: false, auto: true },
  updatedAt:  { type: 'timestamp', required: false, auto: true },
});

/**
 * Explicit field contract for `products/{productId}/variants/{variantId}`.
 */
export const VARIANT_FIELD_CONTRACT = Object.freeze({
  // ── Required ──
  supplierId:    { type: 'string',  required: true,  default: '' },

  // ── Identification ──
  sku:           { type: 'string',  required: false, default: '' },
  presentation:  { type: 'string',  required: false, default: '' },
  concentration: { type: 'string',  required: false, default: '' },
  route:         { type: 'string',  required: false, default: '' },
  dosage:        { type: 'string',  required: false, default: '' },

  // ── Pricing (structured) ──
  pricing: {
    type: 'object',
    required: false,
    default: { retail: {}, master: {}, wholesale: {}, clinic: {} },
    shape: {
      retail:    { perUnit: 'number', kit: 'number', currency: 'string' },
      master:    { perUnit: 'number', kit: 'number', currency: 'string' },
      wholesale: { perUnit: 'number', kit: 'number', currency: 'string' },
      clinic:    { perUnit: 'number', kit: 'number', currency: 'string' },
    },
  },

  // ── Stock & Inventory ──
  stock: {
    type: 'object',
    required: false,
    default: { available: true, quantity: null, minAlert: 5 },
    shape: { available: 'boolean', quantity: 'number', minAlert: 'number' },
  },
  minStockAlert: { type: 'number', required: false, default: 5 },

  // ── Quality & Batch Traceability ──
  batchNumber:    { type: 'string', required: false, default: '' },
  expirationDate: { type: 'string', required: false, default: '' },
  coaUrl:         { type: 'string', required: false, default: '' },

  // ── Price Intelligence & Margin History ──
  priceHistory:   { type: 'array',  required: false, default: [] },

  // ── Flags ──
  isDefault:  { type: 'boolean', required: false, default: false },
  isActive:   { type: 'boolean', required: false, default: true },

  // ── Timestamps ──
  createdAt:  { type: 'timestamp', required: false, auto: true },
  updatedAt:  { type: 'timestamp', required: false, auto: true },
});

// ── Known field names (for stripping unknown fields) ─────────────────────────

export const KNOWN_PRODUCT_FIELDS = Object.freeze(
  Object.keys(PRODUCT_FIELD_CONTRACT)
);

export const KNOWN_VARIANT_FIELDS = Object.freeze(
  Object.keys(VARIANT_FIELD_CONTRACT)
);

/**
 * Legacy field names that are known but should be migrated.
 * The write guard will accept these but log a deprecation warning.
 */
export const DEPRECATED_PRODUCT_FIELDS = Object.freeze([
  'price',           // → variants[].pricing.retail.perUnit
  'retailPrice',     // → variants[].pricing.retail.perUnit
  'costPrice',       // → variants[].pricing.master.perUnit
  'wholesalePrice',  // → variants[].pricing.wholesale.perUnit
  'clinicPrice',     // → variants[].pricing.clinic.perUnit
  'msrp',            // → variants[].pricing.retail.perUnit
  'priceUSD',        // → variants[].pricing.retail.perUnit
  'category',        // → categoryId
  'supplier',        // → supplierIds[] / variants[].supplierId
  'isActive',        // → status field is authoritative
  'title',           // → name
]);

// ── Factory Functions (Phase 4 — single contract) ─────────────────────────────

/**
 * Returns a blank canonical product skeleton with all required fields.
 * Use this when creating a new product document — never build bare objects.
 *
 * @param {Partial<Object>} overrides
 * @returns {Object}
 */
export function emptyProduct(overrides = {}) {
  const now = new Date().toISOString();
  return {
    name:          '',
    displayName:   '',
    status:        'draft',
    primaryType:   'finished_product',
    availableTypes: ['finished_product'],
    isHybrid:      false,
    type:          'finished_product', // alias — kept for backward compat
    productType:   'finished_product', // alias — kept for backward compat
    categoryId:    '',
    category:      '',  // alias — kept for backward compat
    description:   '',
    shortDesc:     '',
    imageUrl:      '',
    goals:         [],
    tags:          [],
    mechanisms:    [],
    semanticKeywords: [],
    synonyms:      [],
    searchAliases: [],
    supplierIds:   [],
    objective:     '',
    desc:          '',
    scientificName: '',
    aiContent:     null,
    pharmacology:  null,
    isActive:      true,
    isProfessional: false,
    requiresPrescription: false,
    _schemaVersion: CURRENT_SCHEMA_VER,
    createdAt:     now,
    updatedAt:     now,
    ...overrides,
  };
}

/**
 * Returns a blank canonical variant skeleton.
 * Use this when adding a variant to a product subcollection.
 *
 * @param {string} productId  - Parent product document ID
 * @param {Partial<Object>} overrides
 * @returns {Object}
 */
export function emptyVariant(productId = '', overrides = {}) {
  const now = new Date().toISOString();
  return {
    productId,
    supplierId:    '',
    supplierName:  '',
    sku:           '',
    presentation:  '',
    concentration: '',
    route:         '',
    dosage:        '',
    type:          'finished_product',
    pricing: {
      retail:    { perUnit: 0, kit: 0, currency: 'USD' },
      master:    { perUnit: 0, kit: 0, currency: 'USD' },
      wholesale: { perUnit: 0, kit: 0, currency: 'USD' },
      clinic:    { perUnit: 0, kit: 0, currency: 'USD' },
    },
    stock: {
      available: true,
      quantity:  null,
    },
    isDefault:  false,
    isActive:   true,
    createdAt:  now,
    updatedAt:  now,
    ...overrides,
  };
}
