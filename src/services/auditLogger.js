import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const AUDIT_COL = 'audit_logs';

/**
 * Log a clinical or administrative action to Firestore.
 *
 * @param {string} operatorId - UID of the user who performed the action
 * @param {string} operatorRole - Role of the operator ('admin', 'doctor', etc.)
 * @param {string} action - Action name ('PROTOCOL_CREATE', 'RECOMMENDATION_SEND', 'USER_APPROVE', etc.)
 * @param {string} targetId - ID of the resource modified (userId, protocolId, recId, etc.)
 * @param {Object} [metadata] - Additional payload for detailed audit logs
 */
export async function logAction(operatorId, operatorRole, action, targetId, metadata = {}) {
  try {
    const payload = {
      operatorId: operatorId || 'guest',
      operatorRole: operatorRole || 'guest',
      action,
      targetId,
      metadata: metadata || {},
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    };
    await addDoc(collection(db, AUDIT_COL), payload);
  } catch (err) {
    console.error('[auditLogger] Failed to log action:', err);
  }
}
