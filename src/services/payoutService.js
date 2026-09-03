/**
 * payoutService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Payout & Commission Management Service.
 * Centralizes Firestore reads/writes for practitioner payouts and CFO approval routing.
 */

import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import logger from '../utils/logger.js';

export const DEMO_PAYOUTS = [
  {
    id: '1',
    doctorId: 'doc1',
    doctorName: 'Dr. Alejandro Gomez',
    amount: 1250.0,
    period: 'Mayo 2026',
    status: 'pending',
  },
  {
    id: '2',
    doctorId: 'doc2',
    doctorName: 'Dra. María Sánchez',
    amount: 3400.5,
    period: 'Mayo 2026',
    status: 'processing',
  },
  {
    id: '3',
    doctorId: 'doc3',
    doctorName: 'Dr. John Doe',
    amount: 890.0,
    period: 'Abril 2026',
    status: 'paid',
  },
];

/**
 * Fetch list of practitioner payouts from Firestore with demo fallback.
 */
export async function fetchPayouts() {
  try {
    const q = query(collection(db, 'payouts'), orderBy('period', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    return DEMO_PAYOUTS;
  } catch (err) {
    logger.error('[payoutService] Error fetching payouts, falling back to demo data:', err);
    return DEMO_PAYOUTS;
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
