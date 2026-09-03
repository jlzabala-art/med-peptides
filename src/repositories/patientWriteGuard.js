/**
 * patientWriteGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized validation & normalization layer for ALL writes to
 * `users/{uid}` where role === 'patient'.
 *
 * Every component or script that writes patient data MUST route through
 * validatePatientWrite(). Direct updateDoc/setDoc on the users collection
 * without this guard is forbidden.
 *
 * Responsibilities:
 *   1. Normalize status to canonical lowercase (Rule #28)
 *   2. Validate required fields
 *   3. Strip deprecated / unknown fields
 *   4. Auto-stamp _schemaVersion and updatedAt
 *   5. Return a clean, Firestore-ready object
 *
 * RULES:
 *   - Zero Firebase imports — pure validation layer.
 *   - Caller is responsible for the actual Firestore write.
 *   - Throws PatientValidationError on invalid data.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  PATIENT_SCHEMA_VER,
  VALID_PATIENT_STATUSES,
  KNOWN_PATIENT_FIELDS,
  DEPRECATED_PATIENT_FIELDS,
} from '../schemas/firestorePatientSchema.js';

// ── Custom Error ──────────────────────────────────────────────────────────────
export class PatientValidationError extends Error {
  constructor(errors, context = '') {
    const prefix = context ? `[${context}] ` : '';
    super(`${prefix}Patient validation failed:\n  - ${errors.join('\n  - ')}`);
    this.name = 'PatientValidationError';
    this.errors = errors;
    this.context = context;
  }
}

// ── Status normalization map ───────────────────────────────────────────────────
const STATUS_NORMALIZE = {
  active:     'active',
  Active:     'active',
  inactive:   'archived',
  Inactive:   'archived',
  archived:   'archived',
  Archived:   'archived',
  unverified: 'unverified',
  New:        'unverified',
  new:        'unverified',
  suspended:  'suspended',
};

// ── Patient Write Guard ───────────────────────────────────────────────────────

/**
 * Validate and normalize a patient (user) document before writing to Firestore.
 *
 * @param {Object}  data
 * @param {Object}  [opts]
 * @param {boolean} [opts.isUpdate=false]    — partial update (skips required checks)
 * @param {boolean} [opts.strict=false]      — strip all unknown fields
 * @param {boolean} [opts.throwOnError=true] — return {data, errors} instead of throwing
 * @returns {Object} Validated and normalized patient data
 * @throws {PatientValidationError}
 */
export function validatePatientWrite(data, opts = {}) {
  const { isUpdate = false, strict = false, throwOnError = true } = opts;
  const errors = [];
  const warnings = [];

  if (!data || typeof data !== 'object') {
    const err = new PatientValidationError(['data must be a non-null object']);
    if (throwOnError) throw err;
    return { data: null, errors: err.errors, warnings: [] };
  }

  const clean = { ...data };

  // ── 1. Role enforcement ────────────────────────────────────────────────────
  // Ensure role is always 'patient' when going through this guard
  if (!isUpdate) {
    clean.role = 'patient';
  }

  // ── 2. Status normalization (critical: Rule #28) ───────────────────────────
  if (clean.status !== undefined) {
    const normalized = STATUS_NORMALIZE[clean.status] ?? clean.status;
    if (normalized !== clean.status) {
      warnings.push(`status "${clean.status}" normalized to "${normalized}"`);
      clean.status = normalized;
    }
    if (!VALID_PATIENT_STATUSES.includes(clean.status)) {
      errors.push(`Invalid status "${clean.status}". Must be one of: ${VALID_PATIENT_STATUSES.join(', ')}`);
    }
  } else if (!isUpdate) {
    clean.status = 'unverified';
  }

  // ── 3. Required fields (creates only) ─────────────────────────────────────
  if (!isUpdate) {
    // At least one of email or phone required for a meaningful patient record
    if (!clean.email && !clean.phone && !clean.linkedUserId) {
      warnings.push('Patient has no email, phone, or linkedUserId — may be difficult to identify');
    }
  }

  // ── 4. Field type coercions ────────────────────────────────────────────────
  // Normalize array fields
  const arrayFields = ['doctorIds', 'clinicIds', 'supplierIds', 'tags'];
  arrayFields.forEach((f) => {
    if (clean[f] !== undefined && !Array.isArray(clean[f])) {
      // If it's a string, wrap in array; otherwise reset to []
      clean[f] = typeof clean[f] === 'string' ? [clean[f]] : [];
      warnings.push(`${f} coerced to array`);
    }
  });

  // Normalize numeric CRM fields
  const numericFields = ['prescriptionCount', 'totalPrescriptions', 'totalOrders', 'ltv', 'revenue'];
  numericFields.forEach((f) => {
    if (clean[f] !== undefined) {
      const n = Number(clean[f]);
      if (!isNaN(n)) clean[f] = Math.max(0, n);
    }
  });

  // ── 5. Deprecated field handling ──────────────────────────────────────────
  const deprecatedFound = [];
  DEPRECATED_PATIENT_FIELDS.forEach((field) => {
    if (field in clean) {
      deprecatedFound.push(field);
      // Auto-migrate known mappings
      if (field === 'clinicId' && !clean.clinicIds?.length) {
        clean.clinicIds = [clean.clinicId];
        warnings.push(`clinicId migrated to clinicIds[]`);
      }
      if (field === 'doctorId' && !clean.doctorIds?.length) {
        clean.doctorIds = [clean.doctorId];
        warnings.push(`doctorId migrated to doctorIds[]`);
      }
      if ((field === 'clinic' || field === 'physician' || field === 'physicianId'
        || field === 'clinicId' || field === 'doctorId'
        || field === 'fullName' || field === 'displayName'
        || field === 'Active' || field === 'Inactive' || field === 'New' || field === 'Archived')) {
        delete clean[field];
      }
    }
  });
  if (deprecatedFound.length > 0) {
    warnings.push(`Deprecated fields stripped: ${deprecatedFound.join(', ')}`);
  }

  // ── 6. Strip unknown fields (if strict mode) ──────────────────────────────
  if (strict) {
    const knownSet = new Set(KNOWN_PATIENT_FIELDS);
    Object.keys(clean).forEach((k) => {
      if (!knownSet.has(k)) {
        warnings.push(`Unknown field stripped: ${k}`);
        delete clean[k];
      }
    });
  }

  // ── 7. Auto-stamps ────────────────────────────────────────────────────────
  clean._schemaVersion = PATIENT_SCHEMA_VER;
  // Note: updatedAt must be set by caller using serverTimestamp()
  // We only set it here if it's missing (for Node scripts / tests)
  if (!clean.updatedAt) {
    clean.updatedAt = new Date().toISOString();
  }

  // ── 8. Error handling ─────────────────────────────────────────────────────
  if (errors.length > 0) {
    if (warnings.length > 0) {
      console.warn('[patientWriteGuard] Warnings:', warnings);
    }
    const err = new PatientValidationError(errors, clean.email || clean.id || '');
    if (throwOnError) throw err;
    return { data: null, errors, warnings };
  }

  if (warnings.length > 0) {
    console.warn('[patientWriteGuard] Warnings:', warnings);
  }

  return throwOnError ? clean : { data: clean, errors: [], warnings };
}
