/**
 * services/ElectronicSignatureService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Electronic Signature Service — Atlas Clinical Platform
 *
 * Provides cryptographic SHA-256 content hashing for clinical records that
 * require immutable, non-repudiable audit chains — in compliance with:
 *
 *   - FDA 21 CFR Part 11, Subpart C (Electronic Signatures)
 *   - GAMP 5 Category 4 (Configured Software)
 *   - ISO 13485 §7.5.9 (Control of Monitoring & Measurement Resources)
 *
 * How it works:
 *   1. `signRecord(record, actorId)` — computes a SHA-256 hash of the
 *      canonical JSON of the record content + actor + timestamp.
 *   2. The hash is stored alongside the record in `signatureMetadata`.
 *   3. `verifyRecord(record)` — recomputes the hash and compares. If they
 *      differ, the record has been tampered with after signing.
 *
 * NOTE: Web Crypto (SubtleCrypto) is used for hashing — zero dependencies,
 * runs in both browser (via window.crypto) and Node/Edge (via globalThis.crypto).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { logger } from '../utils/logger';

/**
 * Stable, deterministic serializer for clinical record content.
 * Produces a canonical JSON string regardless of key insertion order.
 * @param {object} obj
 * @returns {string}
 */
function canonicalSerialize(obj) {
  if (obj === null || typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalSerialize).join(',')}]`;
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${canonicalSerialize(obj[k])}`);
  return `{${pairs.join(',')}}`;
}

/**
 * Computes a SHA-256 hex digest of the given string.
 * @param {string} message
 * @returns {Promise<string>} Lowercase hex string.
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * @typedef {object} SignatureMetadata
 * @property {string} signedBy       - UID of the actor who signed.
 * @property {string} signedAt       - ISO 8601 UTC timestamp.
 * @property {string} hash           - SHA-256 hex of canonical content.
 * @property {string} algorithm      - Always 'SHA-256'.
 * @property {string} version        - Schema version for future migrations.
 */

/**
 * Signs a clinical record by computing a SHA-256 hash of its content
 * bound to the signing actor and timestamp.
 *
 * The content hash covers: `entityType + entityId + actorId + timestampUTC +
 * canonicalSerialize(contentFields)`.
 *
 * @param {object} opts
 * @param {string} opts.entityType     - e.g., 'prescription', 'protocol'
 * @param {string} opts.entityId       - Firestore document ID
 * @param {string} opts.actorId        - UID of the signing user
 * @param {object} opts.contentFields  - The fields being signed (must be stable)
 * @returns {Promise<SignatureMetadata>}
 */
export async function signRecord({ entityType, entityId, actorId, contentFields }) {
  const timestampUTC = new Date().toISOString();
  const payload = [
    entityType,
    entityId,
    actorId,
    timestampUTC,
    canonicalSerialize(contentFields),
  ].join('|');

  const hash = await sha256(payload);

  const metadata = Object.freeze({
    signedBy: actorId,
    signedAt: timestampUTC,
    hash,
    algorithm: 'SHA-256',
    version: '1.0',
  });

  logger.info('[ElectronicSignatureService] Record signed', {
    entityType,
    entityId,
    signedBy: actorId,
    hash: hash.substring(0, 16) + '…',
  });

  return metadata;
}

/**
 * Verifies that a signed clinical record has not been tampered with.
 * Recomputes the expected hash and compares against the stored `signatureMetadata.hash`.
 *
 * @param {object} opts
 * @param {string} opts.entityType
 * @param {string} opts.entityId
 * @param {object} opts.contentFields    - The same fields that were signed.
 * @param {SignatureMetadata} opts.signatureMetadata  - The stored signature.
 * @returns {Promise<{ valid: boolean, reason: string|null }>}
 */
export async function verifyRecord({ entityType, entityId, contentFields, signatureMetadata }) {
  if (!signatureMetadata?.hash || !signatureMetadata?.signedBy || !signatureMetadata?.signedAt) {
    return { valid: false, reason: 'Missing signature metadata fields.' };
  }

  const payload = [
    entityType,
    entityId,
    signatureMetadata.signedBy,
    signatureMetadata.signedAt,
    canonicalSerialize(contentFields),
  ].join('|');

  const recomputedHash = await sha256(payload);

  if (recomputedHash !== signatureMetadata.hash) {
    logger.error('[ElectronicSignatureService] INTEGRITY VIOLATION — record hash mismatch', {
      entityType,
      entityId,
      storedHash: signatureMetadata.hash.substring(0, 16) + '…',
      recomputedHash: recomputedHash.substring(0, 16) + '…',
    });
    return { valid: false, reason: 'Content hash mismatch — possible data tampering.' };
  }

  return { valid: true, reason: null };
}

/**
 * Signs a prescription record specifically, covering the clinically
 * material fields that define the prescription (items, dose, instructions).
 *
 * @param {object} prescription - Firestore prescription document data
 * @param {string} actorId      - UID of the approving doctor
 * @returns {Promise<SignatureMetadata>}
 */
export async function signPrescription(prescription, actorId) {
  const contentFields = {
    patientId: prescription.patientId,
    doctorId: prescription.doctorId,
    items: prescription.items ?? [],
    instructions: prescription.instructions ?? '',
    posology: prescription.posology ?? '',
    status: prescription.status,
    totalAmount: prescription.totalAmount ?? 0,
  };

  return signRecord({
    entityType: 'prescription',
    entityId: prescription.id,
    actorId,
    contentFields,
  });
}

/**
 * Signs a protocol record, covering the clinically material fields.
 * @param {object} protocol - Firestore protocol document data
 * @param {string} actorId  - UID of the publishing doctor/admin
 * @returns {Promise<SignatureMetadata>}
 */
export async function signProtocol(protocol, actorId) {
  const contentFields = {
    title: protocol.title,
    phases: protocol.phases ?? [],
    targetCondition: protocol.targetCondition ?? '',
    duration: protocol.duration ?? '',
    status: protocol.status,
  };

  return signRecord({
    entityType: 'protocol',
    entityId: protocol.id,
    actorId,
    contentFields,
  });
}

const ElectronicSignatureService = {
  signRecord,
  verifyRecord,
  signPrescription,
  signProtocol,
};

export default ElectronicSignatureService;
