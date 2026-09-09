/**
 * approvalService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Financial & Clinical Approvals Service.
 * Decouples approval queue fetching and resolution actions from UI components.
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import logger from '../utils/logger.js';
import { resolveFinancialApprovalAction } from '../actions/adminActions';

/**
 * Fetch pending financial approvals sorted by creation date descending.
 */
export async function fetchPendingApprovals() {
  try {
    const q = query(
      collection(db, 'financial_approvals'),
      where('status', '==', 'pending')
    );
    const snap = await getDocs(q);
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (err) {
    logger.error('[approvalService] Error fetching pending approvals:', err);
    return [];
  }
}

/**
 * Resolve an approval item (approve or reject) and trigger side-effects.
 * Executes atomically on the server via Server Action.
 */
export async function resolveApproval({ approvalId, type, data, action, resolvedBy }) {
  try {
    // ⚡ Execute on server side with atomic batch write and audit log
    const res = await resolveFinancialApprovalAction({ approvalId, type, data, action, resolvedBy });
    if (res?.success) {
      logger.info(`[approvalService] Approval ${approvalId} ${action}d via Server Action.`);
      return { success: true };
    }
  } catch (err) {
    logger.error(`[approvalService] Failed to resolve approval ${approvalId}:`, err.message);
    return { success: false, error: err.message || 'Failed to resolve approval' };
  }
}

