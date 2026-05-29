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
    // Mock IP and Geolocation for the purpose of the prototype
    const mockIp = '192.168.1.' + Math.floor(Math.random() * 255);
    const mockGeo = 'US-CA';
    const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const payload = {
      operatorId: operatorId || 'guest',
      operatorRole: operatorRole || 'guest',
      action,
      targetId,
      metadata: metadata || {},
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      fingerprint: {
        ip: mockIp,
        geo: mockGeo,
        resolution: screenRes,
        timezone: timezone
      }
    };
    await addDoc(collection(db, AUDIT_COL), payload);
  } catch (err) {
    console.error('[auditLogger] Failed to log action:', err);
  }
}
