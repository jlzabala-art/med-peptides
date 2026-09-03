/**
 * productSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Bridge & Re-export file for Canonical Product Schema.
 * Canonical Source of Truth: src/schemas/firestoreProductSchema.js
 *
 * This file maintains backward compatibility for legacy imports while
 * re-exporting canonical constants, types, and factories.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export * from './firestoreProductSchema.js';

import {
  CURRENT_SCHEMA_VER,
  VALID_TYPES,
  VALID_STATUSES,
  VALID_CATEGORIES,
  PRICING_TIERS,
  emptyProduct as canonicalEmptyProduct,
  emptyVariant as canonicalEmptyVariant,
} from './firestoreProductSchema.js';

// ── Schema version ────────────────────────────────────────────────────────────
export const SCHEMA_VERSION = CURRENT_SCHEMA_VER;

// ── Legacy Enum Mappings (preserved for backward compatibility) ───────────────
export const PRODUCT_TYPE = Object.freeze({
  FINISHED_PRODUCT:     'finished_product',
  RAW_MATERIAL:         'raw_material',
  CLINICAL_SUPPLIES:    'clinical_supplies',
  DUAL:                 'dual',
  SERVICE:              'service',
  // Legacy aliases
  PEPTIDE:              'finished_product',
  SUPPLEMENT:           'finished_product',
  GENETIC_TEST:         'service',
  PROFESSIONAL:         'finished_product',
  HORMONE:              'finished_product',
  SMALL_MOLECULE:       'finished_product',
  INJECTABLE_NUTRIENT:  'finished_product',
  IV_PROTOCOL:          'finished_product',
  TOPICAL_COSMETIC:     'finished_product',
});

export const PRODUCT_STATUS = Object.freeze({
  ACTIVE:        'active',
  DRAFT:         'draft',
  OUT_OF_STOCK:  'out of stock',
  HIDDEN:        'hidden',
  ARCHIVED:      'archived',
  // Legacy aliases
  DEPRECATED:    'archived',
  COMING_SOON:   'draft',
});

export const ROUTE = Object.freeze({
  INJECTABLE_VIAL: 'injectable_vial',
  INJECTABLE_PEN:  'injectable_pen',
  ORAL_CAPSULE:    'oral_capsule',
  ORAL_TABLET:     'oral_tablet',
  TOPICAL:         'topical',
  NASAL:           'nasal',
  SUBLINGUAL:      'sublingual',
});

// ── Factories ─────────────────────────────────────────────────────────────────
export const emptyProduct = canonicalEmptyProduct;
export const emptyVariant = canonicalEmptyVariant;


/** Fields that must live inside the classification block */
export const CLASSIFICATION_FIELDS = Object.freeze([
  'goals',
  'secondaryFactors',
  'tags',
  'categories',
]);

/** Fields that must live inside the aiContent block */
export const AI_CONTENT_FIELDS = Object.freeze([
  'faqModalEnabled',
  'scientificModalEnabled',
  'faqModalItems',
]);

/** Fields that must live inside each variant */
export const VARIANT_FIELDS = Object.freeze([
  'id',
  'productId',
  'sku',
  'route',
  'strength',
  'kit',
  'pricing',
  'stock',
  'isDefault',
  'sortOrder',
  'meta',
]);

// ── Type-specific typeData sub-schemas ────────────────────────────────────────
/** Expected keys inside typeData[productType] for each product type */
export const TYPE_DATA_SCHEMA = Object.freeze({
  [PRODUCT_TYPE.PEPTIDE]: [
    'mechanismOfAction',
    'administrationRoutes',
    'reconstitutionRelevant',
    'protocolRoles',
    'typicalResearchUse',
  ],
  [PRODUCT_TYPE.SUPPLEMENT]: [
    'nutrientCategory',
    'supportPathways',
    'servingFormat',
    'dailyUseContext',
  ],
  [PRODUCT_TYPE.GENETIC_TEST]: [
    'sampleType',
    'reportSections',
    'turnaroundTime',
    'clinicalArea',
  ],
  [PRODUCT_TYPE.PROFESSIONAL]: [
    'requiresVerification',
    'bulkAvailable',
    'documentationRequired',
  ],
  [PRODUCT_TYPE.HORMONE]: [],
  [PRODUCT_TYPE.SMALL_MOLECULE]: [],
  [PRODUCT_TYPE.INJECTABLE_NUTRIENT]: [],
  [PRODUCT_TYPE.IV_PROTOCOL]: [],
  [PRODUCT_TYPE.TOPICAL_COSMETIC]: [],
});

// ── Validators ────────────────────────────────────────────────────────────────

/**
 * Validate a canonical product object.
 *
 * @param {Object} p - Product object to validate
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateProduct(p) {
  if (!p || typeof p !== 'object') {
    return { ok: false, errors: ['product is null or not an object'] };
  }

  const errors = [];

  // Root field presence
  // `cas` is optional for supplements (they have no CAS registry number)
  const optionalFields = new Set(
    p.productType === PRODUCT_TYPE.SUPPLEMENT ? ['cas'] : []
  );
  for (const field of CANONICAL_FIELDS) {
    if (optionalFields.has(field)) continue;
    if (p[field] === undefined || p[field] === null || p[field] === '') {
      errors.push(`Missing root field: "${field}"`);
    }
  }

  // Enum checks
  if (p.productType && !Object.values(PRODUCT_TYPE).includes(p.productType)) {
    errors.push(`Invalid productType: "${p.productType}". Must be one of: ${Object.values(PRODUCT_TYPE).join(', ')}`);
  }

  if (p.status && !Object.values(PRODUCT_STATUS).includes(p.status)) {
    errors.push(`Invalid status: "${p.status}". Must be one of: ${Object.values(PRODUCT_STATUS).join(', ')}`);
  }

  // identity block
  if (p.identity && typeof p.identity === 'object') {
    for (const f of IDENTITY_FIELDS) {
      if (p.identity[f] === undefined) errors.push(`identity.${f} is missing`);
    }
  }

  // science block
  if (p.science && typeof p.science === 'object') {
    for (const f of SCIENCE_FIELDS) {
      if (p.science[f] === undefined) errors.push(`science.${f} is missing`);
    }
  }

  // classification block
  if (p.classification && typeof p.classification === 'object') {
    for (const f of CLASSIFICATION_FIELDS) {
      if (p.classification[f] === undefined) errors.push(`classification.${f} is missing`);
    }
  }

  // aiContent block
  if (p.aiContent && typeof p.aiContent === 'object') {
    for (const f of AI_CONTENT_FIELDS) {
      if (p.aiContent[f] === undefined) errors.push(`aiContent.${f} is missing`);
    }
  }

  // variants
  if (!Array.isArray(p.variants) || p.variants.length === 0) {
    errors.push('variants must be a non-empty array');
  } else {
    p.variants.forEach((v, i) => {
      const vResult = validateVariant(v, p.id);
      vResult.errors.forEach((e) => errors.push(`variants[${i}]: ${e}`));
    });
  }

  // Forbidden vocabulary — only scan narrative text fields, NOT name/synonyms
  // ("body protection compound" is a legitimate synonym; the rule applies to
  //  marketing copy in desc and objective).
  const narrativeText = [
    p.science?.desc,
    p.science?.objective,
    p.science?.mechanismSummary,
  ].filter(Boolean).join(' ');
  if (/\bcompound\b/i.test(narrativeText)) {
    errors.push('Contains forbidden word "compound" in narrative text — use peptide/supplement/product instead');
  }

  const valid = errors.length === 0;
  return { valid, ok: valid, errors };
}

/**
 * Validate a single variant object.
 *
 * @param {Object} v         - Variant object
 * @param {string} productId - Expected productId (for cross-check)
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateVariant(v, productId) {
  const errors = [];

  if (!v || typeof v !== 'object') {
    return { ok: false, errors: ['variant is null or not an object'] };
  }

  for (const field of VARIANT_FIELDS) {
    if (v[field] === undefined || v[field] === null) {
      errors.push(`Missing variant field: "${field}"`);
    }
  }

  if (productId && v.productId && v.productId !== productId) {
    errors.push(`variant.productId "${v.productId}" does not match product id "${productId}"`);
  }

  if (v.route && !Object.values(ROUTE).includes(v.route)) {
    errors.push(`Invalid route: "${v.route}". Must be one of: ${Object.values(ROUTE).join(', ')}`);
  }

  // pricing must have base.perVialUSD or retail.perUnit
  const hasPricing = v.pricing && (
    (v.pricing.base && (v.pricing.base.perVialUSD != null || v.pricing.base.kitUSD != null)) ||
    (v.pricing.retail && v.pricing.retail.perUnit != null)
  );
  if (!hasPricing) {
    errors.push('pricing block is missing valid base or retail price');
  }

  return { ok: errors.length === 0, errors };
}

