/**
 * protocolWriteGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized validation & normalization layer for ALL writes to
 * `protocols/{protocolId}`.
 *
 * EVERY component, import wizard, AI enricher, or script that writes to
 * the protocols collection MUST route through `validateProtocolWrite()`.
 * Direct `setDoc`/`addDoc`/`updateDoc` calls to `protocols` are FORBIDDEN.
 *
 * Responsibilities:
 *   1. Reject writes that use legacy name fields (protocol_name, title, etc.)
 *   2. Validate that `name` is present on creates
 *   3. Validate enum values (status) are from the allowed set
 *   4. Apply defaults for missing optional fields
 *   5. Auto-resolve legacy name fields → `name` (with a deprecation warning)
 *   6. Stamp `updatedAt` and `_schemaVersion` automatically
 *   7. Return a clean, Firestore-ready object
 *
 * RULES:
 *   - Zero Firebase imports — this is a pure validation layer.
 *   - The caller is responsible for the actual Firestore write.
 *   - Throws `ProtocolValidationError` on invalid data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  VALID_PROTOCOL_STATUSES,
  PROTOCOL_SCHEMA_VER,
  KNOWN_PROTOCOL_FIELDS,
  DEPRECATED_PROTOCOL_NAME_FIELDS,
  DEPRECATED_PROTOCOL_FIELDS,
} from '../schemas/firestoreProtocolSchema.js';

// ── Custom Error ──────────────────────────────────────────────────────────────

export class ProtocolValidationError extends Error {
  /**
   * @param {string[]} errors  - List of validation error messages
   * @param {string}   [context] - Optional context (e.g., protocol name)
   */
  constructor(errors, context = '') {
    const prefix = context ? `[${context}] ` : '';
    super(`${prefix}Protocol validation failed:\n  - ${errors.join('\n  - ')}`);
    this.name = 'ProtocolValidationError';
    this.errors = errors;
    this.context = context;
  }
}

// ── Protocol Write Guard ──────────────────────────────────────────────────────

/**
 * Validate and normalize a protocol document BEFORE writing to Firestore.
 *
 * @param {Object}  data     - Raw protocol data to write
 * @param {Object}  [opts]   - Options
 * @param {boolean} [opts.isUpdate=false]       - If true, required fields are not enforced (partial update)
 * @param {boolean} [opts.strict=false]         - If true, strip all unknown fields
 * @param {boolean} [opts.autoResolveName=true] - If true, auto-resolve legacy name fields → `name` (with warning)
 *                                                If false, treat legacy name fields as hard errors.
 * @param {boolean} [opts.throwOnError=true]    - If false, returns { data, errors, warnings } instead of throwing
 * @returns {Object} Validated and normalized protocol data, ready for Firestore
 * @throws {ProtocolValidationError} If validation fails and throwOnError is true
 */
export function validateProtocolWrite(data, opts = {}) {
  const {
    isUpdate = false,
    strict = false,
    autoResolveName = true,
    throwOnError = true,
  } = opts;

  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    const err = new ProtocolValidationError(['data must be a non-null object']);
    if (throwOnError) throw err;
    return { data: null, errors: err.errors, warnings: [] };
  }

  const cleaned = { ...data };

  // ── 1. Detect and resolve legacy name fields ──────────────────────────────
  // This is the core guard: prevent re-introducing protocol_name, title, etc.
  const foundLegacyNameFields = DEPRECATED_PROTOCOL_NAME_FIELDS.filter(
    (f) => cleaned[f] !== undefined && cleaned[f] !== null && cleaned[f] !== ''
  );

  if (foundLegacyNameFields.length > 0) {
    if (autoResolveName) {
      // Auto-resolve: pick the first non-empty legacy value as `name`
      if (!cleaned.name) {
        for (const legacyField of DEPRECATED_PROTOCOL_NAME_FIELDS) {
          if (cleaned[legacyField]) {
            cleaned.name = cleaned[legacyField];
            warnings.push(
              `Legacy name field "${legacyField}" auto-resolved to "name". ` +
              `Please update the caller to use "name" directly.`
            );
            break;
          }
        }
      } else {
        warnings.push(
          `Legacy name fields detected alongside "name": [${foundLegacyNameFields.join(', ')}]. ` +
          `Keeping "name", removing legacy fields. Update the caller!`
        );
      }
      // Strip all legacy name fields from the write payload
      for (const f of DEPRECATED_PROTOCOL_NAME_FIELDS) {
        delete cleaned[f];
      }
    } else {
      // Strict mode: treat legacy name fields as hard errors
      errors.push(
        `Forbidden legacy name field(s) detected: [${foundLegacyNameFields.join(', ')}]. ` +
        `Use "name" as the canonical field. ` +
        `Run the migration script to fix Firestore docs: scripts/migrateProtocolNames.mjs`
      );
    }
  }

  // ── 2. Required field validation (only for creates) ───────────────────────
  if (!isUpdate) {
    if (!cleaned.name || typeof cleaned.name !== 'string' || !cleaned.name.trim()) {
      errors.push('"name" is required and must be a non-empty string on creates');
    }
  }

  // ── 3. Enum validation ────────────────────────────────────────────────────
  if (cleaned.status !== undefined && !VALID_PROTOCOL_STATUSES.includes(cleaned.status)) {
    errors.push(
      `Invalid status: "${cleaned.status}". Must be one of: ${VALID_PROTOCOL_STATUSES.join(', ')}`
    );
  }

  // ── 4. Type coercion & defaults ───────────────────────────────────────────
  if (!isUpdate && !cleaned.status) {
    cleaned.status = 'draft';
  }

  // Ensure array fields are arrays
  const arrayFields = ['expected_outcomes', 'contraindications', 'phases', 'peptides', 'required_labs', 'bom', 'goals', 'tags'];
  for (const field of arrayFields) {
    if (cleaned[field] !== undefined && !Array.isArray(cleaned[field])) {
      warnings.push(`"${field}" coerced from ${typeof cleaned[field]} to array`);
      cleaned[field] = cleaned[field] ? [cleaned[field]] : [];
    }
  }

  // ── 4b. Map legacy taxonomy ───────────────────────────────────────────────
  // Map therapeutic_category / category to categoryId
  if (!cleaned.categoryId) {
    if (cleaned.therapeutic_category) {
      cleaned.categoryId = cleaned.therapeutic_category;
      warnings.push(`Legacy "therapeutic_category" auto-resolved to "categoryId"`);
      delete cleaned.therapeutic_category;
    } else if (cleaned.category) {
      cleaned.categoryId = cleaned.category;
      warnings.push(`Legacy "category" auto-resolved to "categoryId"`);
      delete cleaned.category;
    }
  }

  // Map primary_goal / goal to goals array
  if (!cleaned.goals || cleaned.goals.length === 0) {
    if (cleaned.primary_goal) {
      cleaned.goals = [cleaned.primary_goal];
      warnings.push(`Legacy "primary_goal" auto-resolved to "goals" array`);
      delete cleaned.primary_goal;
    } else if (cleaned.goal) {
      cleaned.goals = [cleaned.goal];
      warnings.push(`Legacy "goal" auto-resolved to "goals" array`);
      delete cleaned.goal;
    }
  }

  // ── 5. Detect other deprecated fields (non-name) ──────────────────────────
  const otherDeprecated = DEPRECATED_PROTOCOL_FIELDS.filter(
    (f) => !DEPRECATED_PROTOCOL_NAME_FIELDS.includes(f) && cleaned[f] !== undefined
  );
  for (const f of otherDeprecated) {
    warnings.push(`Deprecated field "${f}" detected. It will remain in the write but should be migrated.`);
  }

  // ── 6. Strip unknown fields (strict mode) ─────────────────────────────────
  if (strict) {
    const knownSet = new Set([...KNOWN_PROTOCOL_FIELDS, ...DEPRECATED_PROTOCOL_FIELDS]);
    const unknownFields = Object.keys(cleaned).filter((k) => !knownSet.has(k));
    if (unknownFields.length > 0) {
      warnings.push(`Stripped unknown fields: ${unknownFields.join(', ')}`);
      for (const f of unknownFields) {
        delete cleaned[f];
      }
    }
  }

  // ── 7. Auto-stamp schema version ──────────────────────────────────────────
  cleaned._schemaVersion = PROTOCOL_SCHEMA_VER;

  // ── 8. Return or throw ────────────────────────────────────────────────────
  if (errors.length > 0) {
    if (throwOnError) {
      throw new ProtocolValidationError(errors, cleaned.name || '(unnamed)');
    }
    return { data: null, errors, warnings };
  }

  if (warnings.length > 0 && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
    console.warn(
      `[protocolWriteGuard] "${cleaned.name || '(unnamed)'}":\n  ⚠ ${warnings.join('\n  ⚠ ')}`
    );
  }

  return throwOnError ? cleaned : { data: cleaned, errors: [], warnings };
}

// ── Batch validation helper ───────────────────────────────────────────────────

/**
 * Validate an array of protocols and return a summary report.
 * Does NOT throw — always returns results.
 *
 * @param {Object[]} protocols
 * @param {Object}   [opts] - Passed to validateProtocolWrite
 * @returns {{ valid: Object[], invalid: { data: Object, errors: string[] }[], warnings: string[], summary: string }}
 */
export function validateProtocolBatch(protocols, opts = {}) {
  const valid = [];
  const invalid = [];
  const allWarnings = [];

  for (const p of protocols) {
    const result = validateProtocolWrite(p, { ...opts, throwOnError: false });
    if (result.errors && result.errors.length > 0) {
      invalid.push({ data: p, errors: result.errors });
    } else {
      valid.push(result.data || result);
    }
    if (result.warnings) allWarnings.push(...result.warnings);
  }

  const summary = `Validated ${protocols.length} protocols: ${valid.length} valid, ${invalid.length} invalid`;
  return { valid, invalid, warnings: allWarnings, summary };
}
