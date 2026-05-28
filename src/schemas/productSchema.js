 
/**
 * productSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical v2 Product Schema — Med-Peptides
 *
 * This file is the single source of truth for the product data model.
 * It defines:
 *   - PRODUCT_TYPE         → allowed productType values
 *   - PRODUCT_STATUS       → allowed status values
 *   - ROUTE                → allowed administration route values
 *   - SCHEMA_VERSION       → current schema version (2)
 *   - CANONICAL_FIELDS     → list of required root-level field keys
 *   - validateProduct()    → validate a product object (returns { ok, errors })
 *   - validateVariant()    → validate a variant object
 *   - emptyProduct()       → produce a blank canonical product skeleton
 *   - emptyVariant()       → produce a blank canonical variant skeleton
 *
 * RULES:
 *   - Zero UI imports (no React, no CSS).
 *   - Zero Firebase imports.
 *   - Pure JS — safe for Node scripts and browser alike.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Schema version ────────────────────────────────────────────────────────────
export const SCHEMA_VERSION = 2;

// ── Allowed enum values ───────────────────────────────────────────────────────

/** @readonly */
export const PRODUCT_TYPE = Object.freeze({
  PEPTIDE:              'peptide',
  SUPPLEMENT:           'supplement',
  GENETIC_TEST:         'genetic_test',
  PROFESSIONAL:         'professional_material',
  HORMONE:              'hormone',
  SMALL_MOLECULE:       'small_molecule',
  INJECTABLE_NUTRIENT:  'injectable_nutrient',
  IV_PROTOCOL:          'iv_protocol',
  TOPICAL_COSMETIC:     'topical_cosmetic',
});

/** @readonly */
export const PRODUCT_STATUS = Object.freeze({
  ACTIVE:        'active',
  DEPRECATED:    'deprecated',
  COMING_SOON:   'coming_soon',
  OUT_OF_STOCK:  'out_of_stock',
  DRAFT:         'draft',
});

/** @readonly */
export const ROUTE = Object.freeze({
  INJECTABLE_VIAL: 'injectable_vial',
  INJECTABLE_PEN:  'injectable_pen',
  ORAL_CAPSULE:    'oral_capsule',
  ORAL_TABLET:     'oral_tablet',
  TOPICAL:         'topical',
  NASAL:           'nasal',
  SUBLINGUAL:      'sublingual',
});

// ── Canonical root field list ─────────────────────────────────────────────────
/**
 * Every canonical product document MUST have these fields.
 * Used by Phase 1 audit + Phase 2 normalizer.
 */
export const CANONICAL_FIELDS = Object.freeze([
  'id',
  'name',
  'displayName',
  'productType',
  'status',
  'slug',
  'cas',
  'isBlend',
  'blendComponents',
  'identity',
  'science',
  'classification',
  'aiContent',
  'ui',
  'meta',
  'variants',
]);

/** Fields that must live inside the identity block */
export const IDENTITY_FIELDS = Object.freeze([
  'synonyms',
  'searchAliases',
  'semanticKeywords',
]);

/** Fields that must live inside the science block */
export const SCIENCE_FIELDS = Object.freeze([
  'desc',
  'objective',
  'scientificName',
  'molecularWeight',
  'molecularFormula',
  'pharmacokinetics',
  'storageConditions',
  'mechanisms',
  'mechanismSummary',
  'researchStatus',
  'referencePmids',
  'safetyNote',
  'contraindications',
]);

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

// ── Skeleton factories ─────────────────────────────────────────────────────────

/**
 * Return a blank canonical product skeleton (all required fields, empty values).
 * Useful for migration scripts and seed templates.
 *
 * @param {Partial<Object>} overrides - Fields to pre-populate
 * @returns {Object}
 */
export function emptyProduct(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    displayName: '',
    cas: '',
    productType: PRODUCT_TYPE.PEPTIDE,
    status: PRODUCT_STATUS.ACTIVE,
    slug: '',
    isBlend: false,
    blendComponents: [],

    identity: {
      synonyms: [],
      searchAliases: [],
      semanticKeywords: [],
    },

    science: {
      desc: '',
      objective: '',
      scientificName: '',
      molecularWeight: null,
      molecularFormula: '',
      pharmacokinetics: {
        halfLife: '',
        bioavailability: '',
        route: [],
        metabolism: '',
      },
      storageConditions: {
        temperature: '',
        light: '',
        shelfLife: '',
      },
      mechanisms: [],
      mechanismSummary: '',
      researchFocus: [],
      researchStatus: '',
      referencePmids: [],
      safetyNote: '',
      contraindications: [],
    },

    classification: {
      goals: [],
      secondaryFactors: [],
      tags: [],
      categories: [],
    },

    aiContent: {
      faqModalEnabled: false,
      scientificModalEnabled: false,
      faqModalItems: [],
      summary: '',
      beginnerExplanation: '',
      scientificSummary: '',
    },

    typeData: {},

    ui: {
      image: '/assets/vials/generic-vial.png',
    },

    meta: {
      schemaVersion: SCHEMA_VERSION,
      source: 'local',
      seedVersion: 1,
      createdAt: now,
      updatedAt: now,
    },

    variants: [],
    ...overrides,
  };
}

/**
 * Return a blank canonical variant skeleton.
 *
 * @param {string} productId - Parent product ID
 * @param {Partial<Object>} overrides
 * @returns {Object}
 */
export function emptyVariant(productId = '', overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: '',
    productId,
    productName: '',
    sku: '',
    route: ROUTE.INJECTABLE_VIAL,
    strength: {
      dosageMg: null,
      dosageLabel: '',
      isBlendStrength: false,
    },
    kit: {
      size: 1,
      unit: 'vial',
      label: '1 vial/kit',
    },
    pricing: {
      base: {
        perVialUSD: null,
        kitUSD: null,
        currency: 'USD',
      },
      byCountry: {},
    },
    stock: {
      available: true,
      note: '',
    },
    isDefault: false,
    sortOrder: 1,
    meta: {
      schemaVersion: SCHEMA_VERSION,
      seedVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
    ...overrides,
  };
}
