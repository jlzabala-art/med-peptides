/**
 * auditLogService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Immutable Audit Logging Service for Enterprise Compliance & Operational Security.
 * Complies with 21 CFR Part 11 / HIPAA / GDPR data audit requirements.
 *
 * Implements AGENTS.md Rule #2 (Firestore Source of Truth) & Rule #10 (Anti-Risk).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, setDoc, collection, serverTimestamp, query, orderBy, limit as firestoreLimit, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { logger } from '../utils/logger';

export const AUDIT_ACTIONS = Object.freeze({
  PRICE_UPDATE: 'price_update',
  MARGIN_UPDATE: 'margin_update',
  STATUS_TRANSITION: 'status_transition',
  QUOTATION_CONVERTED: 'quotation_converted',
  RFQ_DISPATCHED: 'rfq_dispatched',
  USER_ROLE_CHANGED: 'user_role_changed',
  PRODUCT_ARCHIVED: 'product_archived',
  ORDER_CANCELLED: 'order_cancelled'
});

/**
 * Records an immutable audit log entry.
 * @param {Object} entry
 * @param {string} entry.action - One of AUDIT_ACTIONS
 * @param {string} entry.entityType - 'product' | 'variant' | 'quotation' | 'order' | 'rfq' | 'user'
 * @param {string} entry.entityId
 * @param {Object} [entry.actor] - { uid, email, role, name }
 * @param {Object} [entry.diff] - { before, after, changedFields }
 * @param {string} [entry.reason] - Explanation for critical operations
 * @param {string} [entry.source] - 'admin_panel' | 'system_cron' | 'api'
 * @returns {Promise<{ success: boolean, logId: string }>}
 */
export async function logAuditEvent({
  action,
  entityType,
  entityId,
  actor = {},
  diff = {},
  reason = '',
  source = 'admin_panel'
}) {
  if (!action || !entityType || !entityId) {
    throw new Error('auditLogService: action, entityType, and entityId are required.');
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const logId = `audit_${entityType}_${entityId}_${timestampStr}`;
  const logRef = doc(db, 'audit_logs', logId);

  const logDocument = {
    id: logId,
    action,
    entityType,
    entityId,
    actor: {
      uid: actor.uid || 'system',
      email: actor.email || 'system@atlashealth.care',
      role: actor.role || 'operator',
      name: actor.name || 'Platform Operator'
    },
    diff: diff || {},
    reason: reason || 'Routine operational update',
    source,
    createdAt: serverTimestamp(),
    timestampIso: new Date().toISOString()
  };

  try {
    await setDoc(logRef, logDocument);
    logger.info(`[auditLogService] Logged ${action} on ${entityType}/${entityId}`, { logId });
    return { success: true, logId };
  } catch (error) {
    logger.error(`[auditLogService] Failed to write audit log ${logId}`, { error });
    return { success: false, error: error.message };
  }
}

/**
 * Fetches recent audit logs from Firestore.
 * @param {number} maxLogs
 * @returns {Promise<Array>}
 */
export async function fetchRecentAuditLogs(maxLogs = 10) {
  try {
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(maxLogs)
    );
    const snap = await getDocs(q);
    if (snap.empty) return [];
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().timestampIso || Date.now()),
    }));
  } catch (error) {
    logger.warn('[auditLogService] Error fetching audit logs, returning fallback', { error });
    return [];
  }
}
