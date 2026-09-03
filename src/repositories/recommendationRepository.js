/**
 * repositories/recommendationRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Recommendation Data-Access Layer — Atlas Clinical Platform
 *
 * Upgraded to Fase 3 standards:
 *   - Exponential backoff retry for transient Firestore errors (_resilience)
 *   - Anti-XSS sanitization of free-text fields (clinicalSanitizer)
 *   - PHI audit trail for patient-linked recommendations (PHIAuditService)
 *   - State machine validation for status transitions
 *   - logger.error replacing console.error throughout
 *
 * Valid status transitions (Rule #28 taxonomy):
 *   pending → accepted | rejected | cancelled
 *   accepted → completed | cancelled
 *   rejected → (terminal)
 *   completed → (terminal)
 *
 * Standards: HIPAA §164.312, ISO 14971, OWASP Healthcare Top 10 (A7-XSS).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';
import { withRetry } from './_resilience';
import { logPHIAccess, PHI_ACTIONS } from '../services/PHIAuditService';
import { sanitizeClinicalEntity } from '../utils/clinicalSanitizer';
import { ClinicalStateTransitionError } from '../errors/ClinicalErrors';

const COLLECTION = 'recommendations';

/** Valid recommendation status transitions. */
const RECOMMENDATION_TRANSITIONS = Object.freeze({
  pending:   ['accepted', 'rejected', 'cancelled'],
  accepted:  ['completed', 'cancelled'],
  rejected:  [],
  completed: [],
  cancelled: [],
});

/**
 * Validates that a status transition is allowed for recommendations.
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @throws {ClinicalStateTransitionError}
 */
function assertValidRecommendationTransition(currentStatus, targetStatus) {
  const allowed = RECOMMENDATION_TRANSITIONS[currentStatus];
  if (!allowed) {
    throw new ClinicalStateTransitionError(
      'recommendation',
      currentStatus,
      targetStatus,
      `Unknown current status: "${currentStatus}"`
    );
  }
  if (!allowed.includes(targetStatus)) {
    throw new ClinicalStateTransitionError(
      'recommendation',
      currentStatus,
      targetStatus,
      `Allowed from "${currentStatus}": [${allowed.join(', ')}]`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Obtiene las recomendaciones de un usuario con retry.
 * @param {string} userId
 * @param {number} limitCount
 * @param {object} [opts]
 * @returns {Promise<object[]>}
 */
export async function getRecommendationsForUser(userId, limitCount = 20, opts = {}) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snap = await withRetry(
    () => getDocs(q),
    { entityName: 'recommendationRepository.getRecommendationsForUser' }
  );

  if (opts.actorId) {
    logPHIAccess({
      actorId: opts.actorId,
      actorRole: opts.actorRole ?? 'doctor',
      action: PHI_ACTIONS.READ,
      entityType: 'recommendation',
      entityId: `user:${userId}`,
    });
  }

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Crea una nueva recomendación con sanitización y audit.
 * @param {object} recData
 * @param {object} [opts]
 * @returns {Promise<string>} - New document ID
 */
export async function createRecommendation(recData, opts = {}) {
  const sanitized = sanitizeClinicalEntity(recData);

  const docRef = await withRetry(
    () => addDoc(collection(db, COLLECTION), {
      ...sanitized,
      status: sanitized.status || 'pending',
      createdAt: serverTimestamp(),
    }),
    { entityName: 'recommendationRepository.createRecommendation' }
  );

  if (opts.actorId) {
    logPHIAccess({
      actorId: opts.actorId,
      actorRole: opts.actorRole ?? 'doctor',
      action: PHI_ACTIONS.WRITE,
      entityType: 'recommendation',
      entityId: docRef.id,
      metadata: { patientId: recData.patientId ?? recData.userId },
    });
  }

  logger.info('[recommendationRepository] Created recommendation', { id: docRef.id });
  return docRef.id;
}

/**
 * Actualiza el estado de una recomendación con validación de State Machine.
 * @param {string} recId
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @param {object} [opts]
 */
export async function updateRecommendationStatus(recId, currentStatus, targetStatus, opts = {}) {
  assertValidRecommendationTransition(currentStatus, targetStatus);

  await withRetry(
    () => updateDoc(doc(db, COLLECTION, recId), {
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    }),
    { entityName: 'recommendationRepository.updateRecommendationStatus' }
  );

  if (opts.actorId) {
    logPHIAccess({
      actorId: opts.actorId,
      actorRole: opts.actorRole ?? 'doctor',
      action: PHI_ACTIONS.WRITE,
      entityType: 'recommendation',
      entityId: recId,
      metadata: { transition: `${currentStatus} → ${targetStatus}` },
    });
  }

  logger.info('[recommendationRepository] Status updated', { recId, currentStatus, targetStatus });
}

/**
 * Acepta una recomendación (pending → accepted).
 * @param {string} recId
 * @param {object} [opts]
 */
export async function acceptRecommendation(recId, opts = {}) {
  return updateRecommendationStatus(recId, 'pending', 'accepted', opts);
}

/**
 * Rechaza una recomendación (pending → rejected).
 * @param {string} recId
 * @param {object} [opts]
 */
export async function declineRecommendation(recId, opts = {}) {
  return updateRecommendationStatus(recId, 'pending', 'rejected', opts);
}

/**
 * Suscribe a las recomendaciones pendientes en tiempo real.
 * @param {function} onData
 * @param {function} onError
 * @returns {function} Unsubscribe function
 */
export function subscribeToPendingRecommendations(onData, onError) {
  const q = query(collection(db, COLLECTION), where('status', '==', 'pending'));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(list);
    },
    (err) => {
      logger.warn('[recommendationRepository] subscribeToPendingRecommendations error', {
        error: err.message,
      });
      if (onError) onError(err);
    }
  );
}

/**
 * Suscribe a las recomendaciones de un médico en tiempo real.
 * @param {string} doctorId
 * @param {function} onData
 * @param {number} [maxLimit=5]
 * @returns {function} Unsubscribe function
 */
export function subscribeToDoctorRecommendations(doctorId, onData, maxLimit = 5) {
  const q = query(
    collection(db, COLLECTION),
    where('doctorId', '==', doctorId),
    orderBy('createdAt', 'desc'),
    limit(maxLimit)
  );
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (err) => {
      logger.warn('[recommendationRepository] subscribeToDoctorRecommendations error', {
        doctorId,
        error: err.message,
      });
    }
  );
}

export const recommendationRepository = {
  getRecommendationsForUser,
  subscribeToPendingRecommendations,
  subscribeToDoctorRecommendations,
  updateRecommendationStatus,
  acceptRecommendation,
  declineRecommendation,
  createRecommendation,
};

export default recommendationRepository;

