/**
 * prescriptionWriteGuard.js — Extended v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Extended to align with the new firestoreProtocolSchema-style
 * PRESCRIPTION_FIELD_CONTRACT defined in prescriptionSchema.js v2.
 *
 * Changes from v1:
 *   - No longer imports prescriptionSchema/prescriptionLineSchema objects
 *     (those were plain JS objects — now uses FIELD_CONTRACT + KNOWN_FIELDS)
 *   - Normalizes prescription line status to lowercase (was 'Pending'/'Approved'/'Rejected')
 *   - Validates sourceProtocolId when sourceType === 'Protocol'
 *   - Normalizes validationStatus to lowercase (was 'Ready', 'Needs Review', 'Blocked')
 *   - Auto-stamps _schemaVersion = 2
 *
 * BACKWARDS COMPATIBLE: PrescriptionValidationError and validatePrescriptionWrite
 * exports are preserved with the same signatures.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  PRESCRIPTION_SCHEMA_VER,
  PRESCRIPTION_STATUSES,
  VALID_PRESCRIPTION_STATUSES,
  PRESCRIPTION_LINE_STATUSES,
  VALID_PRESCRIPTION_LINE_STATUSES,
  PRESCRIPTION_SOURCES,
  KNOWN_PRESCRIPTION_FIELDS,
  KNOWN_PRESCRIPTION_LINE_FIELDS,
  DEPRECATED_PRESCRIPTION_FIELDS,
} from '../schemas/prescriptionSchema.js';
import { validateClinicalSafety } from '../services/clinicalSafetyValidator.js';

// ── Re-export for backwards compatibility ─────────────────────────────────────
export { PRESCRIPTION_STATUSES };

// ── Custom Error ──────────────────────────────────────────────────────────────
export class PrescriptionValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'PrescriptionValidationError';
    this.details = details;
  }
}

// ── Line status normalization map ─────────────────────────────────────────────
const LINE_STATUS_MAP = {
  pending:  'pending',
  Pending:  'pending',
  approved: 'approved',
  Approved: 'approved',
  rejected: 'rejected',
  Rejected: 'rejected',
};

// ── ValidationStatus normalization map ────────────────────────────────────────
const VALIDATION_STATUS_MAP = {
  Ready:        'ready',
  ready:        'ready',
  'Needs Review': 'needs_review',
  needs_review: 'needs_review',
  Blocked:      'blocked',
  blocked:      'blocked',
};

// ── Main Guard ────────────────────────────────────────────────────────────────

/**
 * Validates and strips unknown fields from a prescription before saving to Firestore.
 *
 * @param {Object}  inputData
 * @param {boolean} [isUpdate=false]
 * @returns {Object} Cleaned, normalized prescription data
 * @throws {PrescriptionValidationError}
 */
export function validatePrescriptionWrite(inputData, isUpdate = false) {
  if (!inputData || typeof inputData !== 'object') {
    throw new PrescriptionValidationError('Input data must be a valid object.');
  }

  const warnings = [];

  // ── 1. Migrate deprecated field names ─────────────────────────────────────
  const data = { ...inputData };
  DEPRECATED_PRESCRIPTION_FIELDS.forEach((f) => {
    if (f in data) {
      if (f === 'items' || f === 'medications' || f === 'drugs') {
        if (!data.prescriptionLines) {
          data.prescriptionLines = data[f];
          warnings.push(`${f} migrated to prescriptionLines`);
        }
      }
      if (f === 'uploadedAt' && !data.createdAt) {
        data.createdAt = data[f];
        warnings.push(`uploadedAt migrated to createdAt`);
      }
      delete data[f];
    }
  });

  // ── 2. Required identity check (creates only) ──────────────────────────────
  if (!isUpdate) {
    if (!data.doctorId && !data.patientId) {
      throw new PrescriptionValidationError(
        'A prescription must belong to at least a doctor or a patient.'
      );
    }
  }

  // ── 3. Validate & normalize prescription status ───────────────────────────
  if (data.status) {
    if (!VALID_PRESCRIPTION_STATUSES.includes(data.status)) {
      throw new PrescriptionValidationError(
        `Invalid prescription status: '${data.status}'. Must be one of: ${VALID_PRESCRIPTION_STATUSES.join(', ')}`
      );
    }
  } else if (!isUpdate) {
    data.status = PRESCRIPTION_STATUSES.DRAFT;
  }

  // ── 4. Normalize validationStatus to lowercase ────────────────────────────
  if (data.validationStatus) {
    const normalized = VALIDATION_STATUS_MAP[data.validationStatus] ?? data.validationStatus.toLowerCase();
    if (normalized !== data.validationStatus) {
      warnings.push(`validationStatus "${data.validationStatus}" normalized to "${normalized}"`);
    }
    data.validationStatus = normalized;
  } else if (!isUpdate) {
    data.validationStatus = 'ready';
  }

  // ── 5. Validate sourceProtocolId when sourceType is Protocol ──────────────
  if (data.sourceType === PRESCRIPTION_SOURCES.PROTOCOL && !data.sourceProtocolId && !isUpdate) {
    warnings.push('sourceType is "Protocol" but sourceProtocolId is missing');
  }

  // ── 6. Strip unknown fields (keep only KNOWN_PRESCRIPTION_FIELDS) ─────────
  const cleanedData = {};
  const knownSet = new Set(KNOWN_PRESCRIPTION_FIELDS);
  for (const key of Object.keys(data)) {
    if (knownSet.has(key)) {
      cleanedData[key] = data[key];
    } else {
      warnings.push(`Unknown prescription field stripped: ${key}`);
    }
  }

  // ── 7. Validate & normalize prescriptionLines ─────────────────────────────
  if (cleanedData.prescriptionLines && Array.isArray(cleanedData.prescriptionLines)) {
    const lineKnownSet = new Set(KNOWN_PRESCRIPTION_LINE_FIELDS);
    cleanedData.prescriptionLines = cleanedData.prescriptionLines.map((line, index) => {
      if (!line.productId) {
        throw new PrescriptionValidationError(
          `Prescription line at index ${index} must have a valid 'productId'.`
        );
      }

      // Normalize line status to lowercase
      const rawLineStatus = line.status;
      const normalizedLineStatus = LINE_STATUS_MAP[rawLineStatus] ?? rawLineStatus?.toLowerCase() ?? 'pending';
      if (!VALID_PRESCRIPTION_LINE_STATUSES.includes(normalizedLineStatus)) {
        warnings.push(`Line ${index} status "${rawLineStatus}" normalized to "pending"`);
        line = { ...line, status: 'pending' };
      } else if (normalizedLineStatus !== rawLineStatus) {
        warnings.push(`Line ${index} status "${rawLineStatus}" normalized to "${normalizedLineStatus}"`);
        line = { ...line, status: normalizedLineStatus };
      }

      // Strip unknown line fields
      const cleanLine = {};
      for (const key of Object.keys(line)) {
        if (lineKnownSet.has(key)) {
          cleanLine[key] = line[key];
        }
      }
      return cleanLine;
    });
  } else if (cleanedData.prescriptionLines && !Array.isArray(cleanedData.prescriptionLines)) {
    throw new PrescriptionValidationError('prescriptionLines must be an array.');
  }

  // ── 8. Clinical Safety Validation ────────────────────────────────────────
  if (cleanedData.prescriptionLines && cleanedData.prescriptionLines.length > 0) {
    const safetyResult = validateClinicalSafety(cleanedData.prescriptionLines);
    if (safetyResult.warnings.length > 0) {
      cleanedData.safetyWarnings = Array.from(
        new Set([...(cleanedData.safetyWarnings || []), ...safetyResult.warnings])
      );
    }
  }

  // ── 9. Schema version and timestamps ──────────────────────────────────────
  cleanedData._schemaVersion = PRESCRIPTION_SCHEMA_VER;

  if (!isUpdate && !cleanedData.createdAt) {
    cleanedData.createdAt = new Date().toISOString();
  }
  cleanedData.updatedAt = new Date().toISOString();

  if (warnings.length > 0) {
    console.warn('[prescriptionWriteGuard] Warnings:', warnings);
  }

  return cleanedData;
}
