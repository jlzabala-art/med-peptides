/**
 * approvalService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Financial & Clinical Approvals Service.
 * Decouples approval queue fetching and resolution actions from UI components.
 */

import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import logger from '../utils/logger.js';

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
 */
export async function resolveApproval({ approvalId, type, data, action, resolvedBy }) {
  try {
    const approvalRef = doc(db, 'financial_approvals', approvalId);
    await updateDoc(approvalRef, {
      status: action === 'approve' ? 'approved' : 'rejected',
      resolvedBy: resolvedBy || 'cfo@atlas.com',
      resolvedAt: new Date().toISOString(),
      serverResolvedAt: serverTimestamp()
    });

    if (action === 'approve') {
      if (type === 'cost_update' && data?.productId && data?.updates) {
        const productRef = doc(db, 'products', data.productId);
        await updateDoc(productRef, data.updates);
        logger.info('[approvalService] Applied approved cost update for product:', data.productId);
      } else if (type === 'payout_auth' && data?.payoutId) {
        const payoutRef = doc(db, 'payouts', data.payoutId);
        await updateDoc(payoutRef, { status: 'paid', paidAt: new Date().toISOString() });
        logger.info('[approvalService] Applied approved payout for:', data.payoutId);
      }
    }

    logger.info(`[approvalService] Approval ${approvalId} ${action}d successfully.`);
    return { success: true };
  } catch (err) {
    logger.error(`[approvalService] Failed to resolve approval ${approvalId}:`, err);
    throw err;
  }
}
