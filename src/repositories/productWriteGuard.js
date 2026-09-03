/**
 * productWriteGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized validation & normalization layer for ALL writes to
 * `products/{productId}` and `products/{productId}/variants/{variantId}`.
 *
 * EVERY component, import wizard, sync dashboard, or script that writes to
 * the products collection MUST route through these functions. Direct
 * `setDoc`/`addDoc`/`updateDoc` calls to `products` are forbidden.
 *
 * Responsibilities:
 *   1. Validate required fields exist
 *   2. Validate enum values are from the allowed set
 *   3. Apply defaults for missing optional fields
 *   4. Stamp `updatedAt` and `_schemaVersion` automatically
 *   5. Strip unknown/deprecated fields (with warnings)
 *   6. Return a clean, Firestore-ready object
 *
 * RULES:
 *   - Zero Firebase imports — this is a pure validation layer.
 *   - The caller is responsible for the actual Firestore write.
 *   - Throws `ProductValidationError` on invalid data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  VALID_STATUSES,
  VALID_TYPES,
  VARIANT_TYPES,
  LEGACY_TYPE_MAP,
  CURRENT_SCHEMA_VER,
  KNOWN_PRODUCT_FIELDS,
  KNOWN_VARIANT_FIELDS,
  DEPRECATED_PRODUCT_FIELDS,
  PRICING_TIERS,
  deriveProductTypes,
} from '../schemas/firestoreProductSchema.js';

// ── Custom Error ──────────────────────────────────────────────────────────────

export class ProductValidationError extends Error {
  /**
   * @param {string[]} errors - List of validation error messages
   * @param {string}   [context] - Optional context (e.g., product name)
   */
  constructor(errors, context = '') {
    const prefix = context ? `[${context}] ` : '';
    super(`${prefix}Product validation failed:\n  - ${errors.join('\n  - ')}`);
    this.name = 'ProductValidationError';
    this.errors = errors;
    this.context = context;
  }
}

// ── Product Write Guard ───────────────────────────────────────────────────────

/**
 * Validate and normalize a product document BEFORE writing to Firestore.
 *
 * @param {Object}  data     - Raw product data to write
 * @param {Object}  [opts]   - Options
 * @param {boolean} [opts.isUpdate=false]  - If true, required fields are not enforced (partial update)
 * @param {boolean} [opts.strict=false]    - If true, strip all unknown fields
 * @param {boolean} [opts.throwOnError=true] - If false, returns { data, errors } instead of throwing
 * @returns {Object} Validated and normalized product data, ready for Firestore
 * @throws {ProductValidationError} If validation fails and throwOnError is true
 */
export function validateProductWrite(data, opts = {}) {
  const { isUpdate = false, strict = false, throwOnError = true } = opts;
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    const err = new ProductValidationError(['data must be a non-null object']);
    if (throwOnError) throw err;
    return { data: null, errors: err.errors, warnings: [] };
  }

  // ── 1. Required field validation (only for creates) ───────────────────────
  if (!isUpdate) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('name is required and must be a non-empty string');
    }
    if (!data.productType && !data.type) {
      errors.push('type/productType is required');
    }
    if (!data.categoryId && !data.category) {
      errors.push('categoryId is required');
    }
  }

  // ── 2. Enum & Type validation with legacy normalization ───────────────────
  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    errors.push(
      `Invalid status: "${data.status}". Must be one of: ${VALID_STATUSES.join(', ')}`
    );
  }

  let rawType = (data.type || data.productType || '').toLowerCase().trim();
  let canonicalType = rawType;
  if (rawType) {
    if (VALID_TYPES.includes(rawType)) {
      canonicalType = rawType;
    } else if (LEGACY_TYPE_MAP[rawType]) {
      canonicalType = LEGACY_TYPE_MAP[rawType];
      warnings.push(`Legacy type "${rawType}" mapped to canonical "${canonicalType}"`);
    } else {
      errors.push(
        `Invalid type: "${rawType}". Must be one of: ${VALID_TYPES.join(', ')}`
      );
    }
  }

  // ── 3. Type coercion, dual sync & defaults ────────────────────────────────
  const cleaned = { ...data };

  // Sync categoryId and category
  const resolvedCat = String(data.categoryId || data.category || '').trim();
  if (resolvedCat) {
    cleaned.categoryId = resolvedCat;
    cleaned.category = resolvedCat;
  }

  // Sync type, productType, and derive availableTypes if variants are present
  if (Array.isArray(cleaned.variants) && cleaned.variants.length > 0) {
    const derived = deriveProductTypes(cleaned.variants, canonicalType || 'finished_product');
    cleaned.availableTypes = derived.availableTypes;
    cleaned.primaryType = derived.primaryType;
    cleaned.isHybrid = derived.isHybrid;
    cleaned.type = derived.primaryType;
    cleaned.productType = derived.primaryType;
  } else if (canonicalType) {
    cleaned.type = canonicalType;
    cleaned.productType = canonicalType;
    if (!cleaned.availableTypes || !Array.isArray(cleaned.availableTypes) || cleaned.availableTypes.length === 0) {
      cleaned.availableTypes = [canonicalType];
      cleaned.primaryType = canonicalType;
      cleaned.isHybrid = false;
    }
  }

  // Default status for new products
  if (!isUpdate && !cleaned.status) {
    cleaned.status = 'draft';
  }

  // Ensure array fields are arrays
  const arrayFields = [
    'goals', 'tags', 'mechanisms', 'semanticKeywords',
    'synonyms', 'searchAliases', 'supplierIds',
  ];
  for (const field of arrayFields) {
    if (cleaned[field] !== undefined) {
      if (!Array.isArray(cleaned[field])) {
        warnings.push(`${field} coerced from ${typeof cleaned[field]} to array`);
        cleaned[field] = cleaned[field] ? [String(cleaned[field])] : [];
      }
      // Ensure all items are strings
      cleaned[field] = cleaned[field].map(item =>
        item != null ? String(item) : ''
      ).filter(Boolean);
    }
  }

  // Ensure boolean fields are boolean
  const boolFields = ['isActive', 'isProfessional', 'requiresPrescription'];
  for (const field of boolFields) {
    if (cleaned[field] !== undefined && typeof cleaned[field] !== 'boolean') {
      cleaned[field] = Boolean(cleaned[field]);
      warnings.push(`${field} coerced to boolean: ${cleaned[field]}`);
    }
  }

  // ── 4. Detect deprecated fields ───────────────────────────────────────────
  for (const field of DEPRECATED_PRODUCT_FIELDS) {
    if (cleaned[field] !== undefined) {
      warnings.push(`Deprecated field "${field}" detected. Consider migrating.`);
    }
  }

  // ── 5. Strip unknown fields (strict mode) ─────────────────────────────────
  if (strict) {
    const knownSet = new Set([...KNOWN_PRODUCT_FIELDS, ...DEPRECATED_PRODUCT_FIELDS]);
    const unknownFields = Object.keys(cleaned).filter(k => !knownSet.has(k));
    if (unknownFields.length > 0) {
      warnings.push(`Stripped unknown fields: ${unknownFields.join(', ')}`);
      for (const f of unknownFields) {
        delete cleaned[f];
      }
    }
  }

  // ── 6. Auto-stamp metadata ────────────────────────────────────────────────
  cleaned._schemaVersion = CURRENT_SCHEMA_VER;
  // Note: `updatedAt` should be set to serverTimestamp() by the caller.
  // We just ensure the field exists in the object shape.

  // ── 7. Return or throw ────────────────────────────────────────────────────
  if (errors.length > 0) {
    if (throwOnError) {
      throw new ProductValidationError(errors, cleaned.name || '(unnamed)');
    }
    return { data: null, errors, warnings };
  }

  // Log warnings in dev
  if (warnings.length > 0 && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.warn(
      `[productWriteGuard] ${cleaned.name || '(unnamed)'}:\n  ⚠ ${warnings.join('\n  ⚠ ')}`
    );
  }

  return throwOnError ? cleaned : { data: cleaned, errors: [], warnings };
}

// ── Variant Write Guard ───────────────────────────────────────────────────────

/**
 * Validate and normalize a variant document BEFORE writing to Firestore.
 *
 * @param {Object}  data     - Raw variant data to write
 * @param {Object}  [opts]   - Options
 * @param {boolean} [opts.isUpdate=false]  - If true, required fields are not enforced
 * @param {boolean} [opts.strict=false]    - If true, strip unknown fields
 * @param {boolean} [opts.throwOnError=true]
 * @returns {Object} Validated and normalized variant data
 * @throws {ProductValidationError}
 */
export function validateVariantWrite(data, opts = {}) {
  const { isUpdate = false, strict = false, throwOnError = true } = opts;
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    const err = new ProductValidationError(['variant data must be a non-null object']);
    if (throwOnError) throw err;
    return { data: null, errors: err.errors, warnings: [] };
  }

  // ── 1. Required fields (creates only) ─────────────────────────────────────
  if (!isUpdate) {
    if (!data.supplierId || typeof data.supplierId !== 'string') {
      errors.push('supplierId is required and must be a non-empty string');
    }
  }

  // ── 2. Pricing structure validation ───────────────────────────────────────
  if (data.pricing !== undefined) {
    if (typeof data.pricing !== 'object' || data.pricing === null) {
      errors.push('pricing must be an object');
    } else {
      // Validate each tier if present
      for (const tier of PRICING_TIERS) {
        const tierData = data.pricing[tier];
        if (tierData !== undefined) {
          if (typeof tierData !== 'object' || tierData === null) {
            errors.push(`pricing.${tier} must be an object`);
          } else {
            // Coerce perUnit and kit to numbers
            if (tierData.perUnit !== undefined && tierData.perUnit !== null) {
              const parsed = Number(tierData.perUnit);
              if (isNaN(parsed)) {
                errors.push(`pricing.${tier}.perUnit must be a number, got "${tierData.perUnit}"`);
              }
            }
            if (tierData.kit !== undefined && tierData.kit !== null) {
              const parsed = Number(tierData.kit);
              if (isNaN(parsed)) {
                errors.push(`pricing.${tier}.kit must be a number, got "${tierData.kit}"`);
              }
            }
          }
        }
      }
    }
  }

  // ── 3. Defaults ───────────────────────────────────────────────────────────
  const cleaned = { ...data };

  if (!isUpdate && !cleaned.pricing) {
    cleaned.pricing = { retail: {}, master: {}, wholesale: {}, clinic: {} };
  }

  if (cleaned.isDefault !== undefined && typeof cleaned.isDefault !== 'boolean') {
    cleaned.isDefault = Boolean(cleaned.isDefault);
    warnings.push(`isDefault coerced to boolean: ${cleaned.isDefault}`);
  }

  if (cleaned.isActive !== undefined && typeof cleaned.isActive !== 'boolean') {
    cleaned.isActive = Boolean(cleaned.isActive);
    warnings.push(`isActive coerced to boolean: ${cleaned.isActive}`);
  }

  // Normalize variant type
  let rawVariantType = (data.type || data.productType || '').toLowerCase().trim();
  if (rawVariantType) {
    const norm = LEGACY_TYPE_MAP[rawVariantType] || rawVariantType;
    if (VARIANT_TYPES.includes(norm) || VALID_TYPES.includes(norm)) {
      cleaned.type = norm;
    } else {
      cleaned.type = 'finished_product';
    }
  } else if (!isUpdate && !cleaned.type) {
    cleaned.type = 'finished_product';
  }

  // ── 4. Strip unknown fields (strict mode) ─────────────────────────────────
  if (strict) {
    const knownSet = new Set(KNOWN_VARIANT_FIELDS);
    const unknownFields = Object.keys(cleaned).filter(k => !knownSet.has(k));
    if (unknownFields.length > 0) {
      warnings.push(`Stripped unknown variant fields: ${unknownFields.join(', ')}`);
      for (const f of unknownFields) {
        delete cleaned[f];
      }
    }
  }

  // ── 5. Return or throw ────────────────────────────────────────────────────
  if (errors.length > 0) {
    if (throwOnError) {
      throw new ProductValidationError(errors, `variant:${cleaned.sku || cleaned.supplierId || '(unknown)'}`);
    }
    return { data: null, errors, warnings };
  }

  if (warnings.length > 0 && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    console.warn(
      `[productWriteGuard] variant ${cleaned.sku || ''}:\n  ⚠ ${warnings.join('\n  ⚠ ')}`
    );
  }

  return throwOnError ? cleaned : { data: cleaned, errors: [], warnings };
}

// ── Batch validation helper ─────────────────────────────────────────────────

/**
 * Validate an array of products and return a summary report.
 * Does NOT throw — always returns results.
 *
 * @param {Object[]} products
 * @returns {{ valid: Object[], invalid: { data: Object, errors: string[] }[], summary: string }}
 */
export function validateProductBatch(products) {
  const valid = [];
  const invalid = [];

  for (const p of products) {
    const result = validateProductWrite(p, { throwOnError: false });
    if (result.errors && result.errors.length > 0) {
      invalid.push({ data: p, errors: result.errors });
    } else {
      valid.push(result.data || result);
    }
  }

  const summary = `Validated ${products.length} products: ${valid.length} valid, ${invalid.length} invalid`;
  return { valid, invalid, summary };
}
