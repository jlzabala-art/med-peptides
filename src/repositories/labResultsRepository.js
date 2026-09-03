import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Real-time subscription to pending lab results for a doctor.
 * Used by LabResultsInboxWidget.
 * @param {string} doctorId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToPendingLabResults(doctorId, onData) {
  const q = query(
    collection(db, 'lab_results'),
    where('doctorId', '==', doctorId),
    where('status', '==', 'pending_review')
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    logger.error('[labResultsRepository] subscribeToPendingLabResults failed', { doctorId, error: err.message });
  });
}

/**
 * Marks a lab result as reviewed.
 * @param {string} resultId
 * @param {string} reviewerName
 * @returns {Promise<void>}
 */
export async function markLabResultReviewed(resultId, reviewerName = 'Doctor') {
  try {
    await updateDoc(doc(db, 'lab_results', resultId), {
      status: 'reviewed',
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerName,
    });
    logger.info('[labResultsRepository] Lab result reviewed', { resultId });
  } catch (err) {
    logger.error('[labResultsRepository] markLabResultReviewed failed', { resultId, error: err.message });
    throw err;
  }
}

/**
 * Marks a lab result as flagged for follow-up.
 * @param {string} resultId
 * @returns {Promise<void>}
 */
export async function flagLabResult(resultId) {
  try {
    await updateDoc(doc(db, 'lab_results', resultId), {
      status: 'flagged',
      flaggedAt: serverTimestamp(),
    });
    logger.info('[labResultsRepository] Lab result flagged', { resultId });
  } catch (err) {
    logger.error('[labResultsRepository] flagLabResult failed', { resultId, error: err.message });
    throw err;
  }
}
