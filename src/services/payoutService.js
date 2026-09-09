/**
 * payoutService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Payout & Commission Management Service.
 * Centralizes Firestore reads/writes for practitioner payouts and CFO approval routing.
 */

import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import logger from '../utils/logger.js';

/**
 * Fetch list of practitioner payouts from Firestore.
 * Strictly adheres to Golden Rule #1 (limit 50) and Rule #2 (Firestore source of truth, no mock data).
 */
export async function fetchPayouts() {
  try {
    const q = query(collection(db, 'payouts'), orderBy('period', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return [];
  } catch (err) {
    logger.error('[payoutService] Error fetching payouts:', err);
    return [];
  }
}

/**
 * Queue a high-value payout for CFO / Financial authorization.
 */
export async function requestPayoutApproval({ payoutId, amount, recipientName, requestedBy }) {
  try {
    const docRef = await addDoc(collection(db, 'financial_approvals'), {
      type: 'payout_auth',
      status: 'pending',
      data: {
        payoutId,
        amount,
        recipientName
      },
      requestedBy: requestedBy || 'Admin',
      createdAt: new Date().toISOString(),
      serverCreatedAt: serverTimestamp()
    });
    logger.info('[payoutService] Queued payout approval:', docRef.id);
    return { success: true, approvalId: docRef.id };
  } catch (err) {
    logger.error('[payoutService] Failed to queue payout approval:', err);
    throw err;
  }
}
