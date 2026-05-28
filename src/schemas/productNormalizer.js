 
/**
 * productNormalizer.js — Phase 2b + 2c
 * ─────────────────────────────────────────────────────────────────────────────
 * Transforms legacy records into the canonical v2 product shape defined in
 * productSchema.js.
 *
 * Rules:
 *   - Pure JS. No Firebase, no React, no disk writes.
 *   - Returns a NEW object — never mutates the input.
 *   - All fields mapped explicitly; nothing silently dropped.
 *
 * Exported:
 *   normalizePeptide(legacy)     → canonical product object  (Phase 2b)
 *   normalizeSupplement(legacy)  → canonical product object  (Phase 2c)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { SCHEMA_VERSION, PRODUCT_TYPE, PRODUCT_STATUS, ROUTE } from './productSchema.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a legacy administration string to a canonical ROUTE value.
 * @param {string|undefined} admin - e.g. "SC", "IM", "oral", "nasal"
 * @returns {string}
 */
function resolveRoute(admin) {
  if (!admin) return ROUTE.INJECTABLE_VIAL;
  const s = admin.toLowerCase().trim();
  if (s === 'sc' || s === 'im' || s === 'iv' || s === 'injectable') return ROUTE.INJECTABLE_VIAL;
  if (s === 'oral' || s === 'capsule') return ROUTE.ORAL_CAPSULE;
  if (s === 'nasal' || s === 'intranasal') return ROUTE.NASAL;
  if (s === 'topical') return ROUTE.TOPICAL;
  if (s === 'sublingual') return ROUTE.SUBLINGUAL;
  return ROUTE.INJECTABLE_VIAL; // safe default for peptides
}

/**
 * Build a slug from a product name if none exists.
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Normalize a single legacy peptide variant.
 * Legacy shape:
 *   { variantId, label, attributes: { dosageMg, unitsPerPack, administration, format }, pricing }
 *
 * @param {Object} legacyVariant
 * @param {string} productId  - canonical product id (slug)
 * @param {string} productName
 * @param {number} index
 * @returns {Object} canonical variant
 */
function normalizePeptideVariant(legacyVariant, productId, productName, index) {
  const now = new Date().toISOString();
  const attrs = legacyVariant.attributes || {};

  const dosageMg  = attrs.dosageMg    ?? null;
  const kitSize   = attrs.unitsPerPack ?? 1;
  const kitUnit   = 'vial';
  const route     = resolveRoute(attrs.administration);
  const dosageLabel = dosageMg != null ? `${dosageMg}mg` : legacyVariant.label || '';

  // Canonical variant id: "{dosage}mg-{kitSize}vial"  e.g. "5mg-10vial"
  const variantId = dosageMg != null
    ? `${dosageMg}mg-${kitSize}${kitUnit}`
    : legacyVariant.variantId || `variant-${index + 1}`;

  // Preserve pricing as-is (already in v2 retail format from products.js)
  const pricing = legacyVariant.pricing || {};

  return {
    id:          variantId,
    productId,
    productName,
    sku:         `${productId.toUpperCase().replace(/-/g, '')}-${dosageMg ?? 'X'}MG-${kitSize}${kitUnit.toUpperCase()}`,
    route,

    strength: {
      dosageMg,
      dosageLabel,
      isBlendStrength: false,
    },

    kit: {
      size:  kitSize,
      unit:  kitUnit,
      label: `${kitSize} vial/kit`,
    },

    pricing,

    stock: {
      available: true,
      note: '',
    },

    isDefault: index === 0,
    sortOrder: index + 1,

    meta: {
      schemaVersion: SCHEMA_VERSION,
      seedVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Normalize a legacy peptide record to canonical v2 shape.
 *
 * @param {Object} legacy - Raw record from src/data/products.js
 * @returns {Object}      - Canonical v2 product object
 */
export function normalizePeptide(legacy) {
  if (!legacy || typeof legacy !== 'object') {
    throw new Error('normalizePeptide: input must be a non-null object');
  }

  const now = new Date().toISOString();
  const slug = legacy.slug || slugify(legacy.name || '');
  const name = legacy.name || '';
  const moa  = legacy.mechanismOfAction || {};

  // ── Normalize variants ───────────────────────────────────────────────────
  const rawVariants = Array.isArray(legacy.variants) ? legacy.variants : [];
  const variants = rawVariants.map((v, i) =>
    normalizePeptideVariant(v, slug, name, i)
  );

  // ── Build canonical object ───────────────────────────────────────────────
  return {
    id:            slug,
    name,
    displayName:   legacy.displayName || name,
    cas:           legacy.cas || '',
    productType:   PRODUCT_TYPE.PEPTIDE,
    status:        legacy.status
                     ? legacy.status
                     : PRODUCT_STATUS.ACTIVE,
    slug,
    isBlend:       legacy.isBlend || false,
    blendComponents: Array.isArray(legacy.blendComponents) ? legacy.blendComponents : [],

    // ── identity block ─────────────────────────────────────────────────────
    identity: {
      synonyms:        Array.isArray(legacy.synonyms) ? legacy.synonyms : [],
      searchAliases:   Array.isArray(legacy.synonyms) ? [slug, ...legacy.synonyms] : [slug],
      semanticKeywords: Array.isArray(legacy.semanticKeywords) ? legacy.semanticKeywords : [],
    },

    // ── science block ──────────────────────────────────────────────────────
    science: {
      desc:              legacy.desc || '',
      objective:         legacy.objective || '',
      scientificName:    legacy.scientificName || '',
      mechanisms:        Array.isArray(legacy.mechanisms) ? legacy.mechanisms : [],
      mechanismSummary:  moa.summary || '',
      researchFocus:     Array.isArray(moa.researchFocus) ? moa.researchFocus : [],
      safetyNote:        legacy.safetyNote || '',
    },

    // ── classification block ───────────────────────────────────────────────
    classification: {
      goals:            Array.isArray(legacy.goals) ? legacy.goals : [],
      secondaryFactors: Array.isArray(legacy.secondaryFactors) ? legacy.secondaryFactors : [],
      tags:             Array.isArray(legacy.tags) ? legacy.tags : [],
      categories:       legacy.category ? [legacy.category] : [],
    },

    // ── aiContent block (moved from root) ──────────────────────────────────
    aiContent: {
      faqModalEnabled:        legacy.faqModalEnabled        ?? false,
      scientificModalEnabled: legacy.scientificModalEnabled ?? false,
      faqModalItems:          Array.isArray(legacy.faqModalItems) ? legacy.faqModalItems : [],
      summary:                '',   // populated by AI enrichment in a later phase
      beginnerExplanation:    '',
      scientificSummary:      '',
    },

    // ── typeData block (peptide-specific) ──────────────────────────────────
    typeData: {
      peptide: {
        // Preserve full MoA object so consumers can read .summary and .researchFocus
        mechanismOfAction: {
          summary:       moa.summary       || '',
          researchFocus: Array.isArray(moa.researchFocus) ? moa.researchFocus : [],
        },
        administrationRoutes:  variants.map((v) => v.route).filter(Boolean),
        reconstitutionRelevant: true,
        protocolRoles:         [],
        typicalResearchUse:    legacy.objective || '',
      },
    },

    // ── ui block ──────────────────────────────────────────────────────────
    ui: {
      image: legacy.image || '/assets/vials/generic-vial.png',
    },

    // ── meta block ────────────────────────────────────────────────────────
    meta: {
      schemaVersion: SCHEMA_VERSION,
      source:        'local',
      seedVersion:   1,
      createdAt:     now,
      updatedAt:     now,
    },

    variants,
  };
}

// ── Supplement helpers ────────────────────────────────────────────────────────

/**
 * Derive a canonical route for supplements.
 * Supplements default to oral capsule unless the record says otherwise.
 *
 * @param {Object} legacy
 * @returns {string}
 */
function resolveSupplementRoute(legacy) {
  const hint = (legacy.administration || legacy.route || '').toLowerCase().trim();
  if (!hint) {
    // Infer from dosage/quantity clues
    const qty = (legacy.quantity || '').toLowerCase();
    if (qty.includes('cap') || qty.includes('tab')) return ROUTE.ORAL_CAPSULE;
    if (qty.includes('ml') || qty.includes('vial')) return ROUTE.INJECTABLE_VIAL;
    if (qty.includes('drop')) return ROUTE.SUBLINGUAL;
    return ROUTE.ORAL_CAPSULE; // safe default for supplements
  }
  if (hint === 'sc' || hint === 'im' || hint === 'iv') return ROUTE.INJECTABLE_VIAL;
  if (hint === 'sublingual') return ROUTE.SUBLINGUAL;
  if (hint === 'topical') return ROUTE.TOPICAL;
  if (hint === 'nasal' || hint === 'intranasal') return ROUTE.NASAL;
  return ROUTE.ORAL_CAPSULE;
}

/**
 * Build a single canonical variant from a flat supplement record.
 * Supplements in supplements.js store dosage/quantity/pricing at the root
 * (not nested under `.variants[]`), so each record IS one variant.
 *
 * @param {Object} legacy    - Raw supplement record
 * @param {string} productId - Canonical product id (slug)
 * @param {string} productName
 * @param {number} index     - Position among siblings with the same name
 * @returns {Object}         - Canonical variant object
 */
function normalizeSupplementVariant(legacy, productId, productName, index) {
  const now    = new Date().toISOString();
  const dosage = legacy.dosage  || '';          // e.g. "200mg"
  const qty    = legacy.quantity || '';          // e.g. "60 caps"
  const route  = resolveSupplementRoute(legacy);

  // Canonical variant id: slug of "dosage-qty"  e.g. "200mg-60caps"
  const variantId = slugify(`${dosage}-${qty}`) || `variant-${index + 1}`;

  // Preserve pricing block as-is; wrap bare number if needed
  const rawPricing = legacy.pricing || {};
  const pricing = rawPricing.retail
    ? rawPricing
    : { retail: { perUnit: rawPricing.perUnit ?? null, currency: 'USD' } };

  // SKU: PRODUCTID-DOSAGE-QTY  e.g. "ASHWAGANDHA-200MG-60CAPS"
  const skuBase = productId.toUpperCase().replace(/-/g, '');
  const skuDose = dosage.toUpperCase().replace(/\s+/g, '');
  const skuQty  = qty.toUpperCase().replace(/\s+/g, '');
  const sku     = `${skuBase}-${skuDose}-${skuQty}`;

  return {
    id:          variantId,
    productId,
    productName,
    sku,
    route,

    strength: {
      dosageMg:        null,  // not always numeric for supplements
      dosageLabel:     dosage,
      quantity:        qty,
      isBlendStrength: false,
    },

    kit: {
      size:  1,
      unit:  'package',
      label: qty || '1 package',
    },

    pricing,

    stock: {
      available: true,
      note: '',
    },

    isDefault: index === 0,
    sortOrder: index + 1,

    meta: {
      schemaVersion: SCHEMA_VERSION,
      seedVersion:   1,
      createdAt:     now,
      updatedAt:     now,
    },
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Normalize a single flat supplement record to canonical v2 shape.
 *
 * Important: each record in supplements.js represents one VARIANT (one
 * dosage/quantity SKU). Multiple records with the same `name` are siblings.
 * This function normalises a single record into a product that contains
 * exactly one variant; callers that need to group siblings should call this
 * once per record and then merge variants.
 *
 * @param {Object} legacy - Raw record from src/data/supplements.js
 * @returns {Object}      - Canonical v2 product object (single-variant)
 */
export function normalizeSupplement(legacy) {
  if (!legacy || typeof legacy !== 'object') {
    throw new Error('normalizeSupplement: input must be a non-null object');
  }

  const now  = new Date().toISOString();
  const name = legacy.name || '';
  const slug = legacy.slug || slugify(name);

  const variant = normalizeSupplementVariant(legacy, slug, name, 0);

  return {
    id:            slug,
    name,
    displayName:   name,
    cas:           '',
    productType:   PRODUCT_TYPE.SUPPLEMENT,
    status:        legacy.status || PRODUCT_STATUS.ACTIVE,
    slug,
    isBlend:       false,
    blendComponents: [],

    // ── identity block ───────────────────────────────────────────────────
    identity: {
      synonyms:         Array.isArray(legacy.synonyms) ? legacy.synonyms : [],
      searchAliases:    Array.isArray(legacy.synonyms) ? [slug, ...legacy.synonyms] : [slug],
      semanticKeywords: Array.isArray(legacy.semanticKeywords) ? legacy.semanticKeywords : [],
    },

    // ── science block ────────────────────────────────────────────────────
    science: {
      desc:             legacy.desc || '',
      objective:        legacy.objective || '',
      scientificName:   '',
      mechanisms:       Array.isArray(legacy.mechanisms) ? legacy.mechanisms : [],
      mechanismSummary: '',
      researchFocus:    [],
      safetyNote:       '',
      clinicalBenefits: Array.isArray(legacy.clinical_benefits) ? legacy.clinical_benefits : [],
    },

    // ── classification block ─────────────────────────────────────────────
    classification: {
      goals:            Array.isArray(legacy.goals) ? legacy.goals : [],
      secondaryFactors: [],
      tags:             Array.isArray(legacy.tags) ? legacy.tags : [],
      categories:       legacy.category ? [legacy.category] : [],
      protocols:        Array.isArray(legacy.protocols) ? legacy.protocols : [],
      commonlyCombinedWith: Array.isArray(legacy.commonly_combined_with)
        ? legacy.commonly_combined_with
        : [],
    },

    // ── aiContent block ──────────────────────────────────────────────────
    aiContent: {
      faqModalEnabled:        false,
      scientificModalEnabled: false,
      faqModalItems:          [],
      summary:                '',
      beginnerExplanation:    '',
      scientificSummary:      '',
    },

    // ── typeData block (supplement-specific) ─────────────────────────────
    typeData: {
      supplement: {
        category:         legacy.category || '',
        dosageForm:       (legacy.quantity || '').toLowerCase().includes('cap') ? 'capsule' : 'other',
        typicalObjective: legacy.objective || '',
      },
    },

    // ── ui block ─────────────────────────────────────────────────────────
    ui: {
      image: legacy.image || '/assets/vials/generic-supplement.png',
    },

    // ── meta block ───────────────────────────────────────────────────────
    meta: {
      schemaVersion: SCHEMA_VERSION,
      source:        'local',
      seedVersion:   1,
      createdAt:     now,
      updatedAt:     now,
    },

    variants: [variant],
  };
}
