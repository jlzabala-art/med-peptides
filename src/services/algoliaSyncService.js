/**
 * src/services/algoliaSyncService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Incremental Algolia Sync Client
 *
 * Keeps Algolia indices in sync with Firestore mutations in real-time.
 * Follows Rule #2: Firestore is the sole source of truth; Algolia acts as
 * the high-performance search projection.
 *
 * Calls the secure server route `/api/algolia/sync` so that ALGOLIA_ADMIN_KEY
 * is never exposed in browser runtime.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import logger from '../utils/logger.js';

async function postSyncRequest(payload) {
  try {
    const baseUrl = typeof window !== 'undefined'
      ? ''
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const res = await fetch(`${baseUrl}/api/algolia/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      logger.warn('[AlgoliaSyncService] Sync request non-ok response:', err);
      return false;
    }
    return true;
  } catch (err) {
    logger.warn('[AlgoliaSyncService] Failed to dispatch sync:', err.message);
    return false;
  }
}

/**
 * Sync a single patient record to atlas_patients
 */
export async function syncPatientToAlgolia(patient) {
  if (!patient || (!patient.id && !patient.objectID)) return;
  return postSyncRequest({
    action: 'upsert',
    indexName: 'atlas_patients',
    record: patient
  });
}

/**
 * Sync a single prescription record to prescriptions index
 */
export async function syncPrescriptionToAlgolia(rx) {
  if (!rx || (!rx.id && !rx.objectID)) return;
  return postSyncRequest({
    action: 'upsert',
    indexName: 'prescriptions',
    record: rx
  });
}

/**
 * Sync a single product record to products index
 */
export async function syncProductToAlgolia(prod) {
  if (!prod || (!prod.id && !prod.objectID)) return;
  return postSyncRequest({
    action: 'upsert',
    indexName: 'products',
    record: prod
  });
}

/**
 * Remove record from an Algolia index
 */
export async function removeObjectFromAlgolia(indexName, objectID) {
  if (!indexName || !objectID) return;
  return postSyncRequest({
    action: 'delete',
    indexName,
    objectID
  });
}
