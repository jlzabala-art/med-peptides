/**
 * src/services/PHIAuditService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PHI Audit Trail Service — Protected Health Information Access Logging
 *
 * Writes a structured audit event to Firestore for every read, write, or
 * deletion of protected health data (patients, prescriptions, lab results).
 *
 * The audit log is APPEND-ONLY (no updates, no deletes) and is stored in:
 *   `_audit_log/{autoId}` (global) + indexed by actorId for efficient queries.
 *
 * ⚠️  IMPORTANT: Audit failures NEVER suppress the original clinical operation.
 *     If the audit write fails, log the error locally but let the user operation proceed.
 *     A missing audit entry is preferable to blocking a clinician from accessing patient data.
 *
 * Standards:
 *   - HIPAA §164.312(b) — Audit Controls
 *   - GDPR Art. 30 — Records of Processing Activities
 *   - NOM-024-SSA3-2010 — Mexican health information systems standard
 *   - ISO 27001 A.12.4 — Logging and Monitoring
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Standard PHI action types.
 * Use these constants to ensure consistency across all repositories.
 */
export const PHI_ACTIONS = Object.freeze({
  /** Actor read or queried patient/clinical data */
  READ:    'phi:read',
  /** Actor created or updated patient/clinical data */
  WRITE:   'phi:write',
  /** Actor deleted patient/clinical data */
  DELETE:  'phi:delete',
  /** Actor exported patient/clinical data (PDF, Excel, CSV) */
  EXPORT:  'phi:export',
  /** Actor approved a prescription or clinical action */
  APPROVE: 'phi:approve',
  /** Actor revoked or cancelled a clinical record */
  REVOKE:  'phi:revoke',
});

const AUDIT_COLLECTION = '_audit_log';

/**
 * Logs a PHI access event to Firestore asynchronously.
 * This function is fire-and-forget — it never throws to the caller.
 *
 * @param {object} params
 * @param {string} params.actorId      - UID of the user performing the action
 * @param {string} [params.actorRole]  - Role of the actor ('admin', 'doctor', 'wholeseller')
 * @param {string} params.action       - One of PHI_ACTIONS values
 * @param {string} params.entityType   - 'patient' | 'prescription' | 'lab_result' | 'biomarker'
 * @param {string} params.entityId     - Document ID being accessed/modified
 * @param {object} [params.metadata]   - Extra context (field names modified, query filters, etc.)
 * @returns {Promise<void>}
 */
export async function logPHIAccess({
  actorId,
  actorRole = 'unknown',
  action,
  entityType,
  entityId,
  metadata = {},
}) {
  if (!actorId || !action || !entityType || !entityId) {
    logger.warn('[PHIAuditService] logPHIAccess called with incomplete params — skipping', {
      actorId, action, entityType, entityId,
    });
    return;
  }

  try {
    await addDoc(collection(db, AUDIT_COLLECTION), {
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      metadata,
      timestamp: serverTimestamp(),
      // Session ID is set by the auth layer at login and stored in globalThis
      sessionId: (typeof globalThis !== 'undefined' && globalThis.__sessionId) ? globalThis.__sessionId : null,
      environment: process.env.NODE_ENV ?? 'production',
    });
  } catch (err) {
    // NEVER block the clinical operation because of an audit failure.
    // Log locally and continue.
    logger.error('[PHIAuditService] Failed to write PHI audit log — operation continues', {
      error: err.message,
      action,
      entityType,
      entityId,
      actorId,
    });
  }
}
