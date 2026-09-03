/**
 * outboxQueueService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Transactional Outbox Pattern & Event Queue for Asynchronous Integrations
 * (Zoho CRM, Zoho Books, Stripe, WhatsApp, Webhooks).
 *
 * Implements AGENTS.md Rule #25 (Non-blocking Async UI & Idempotency).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, setDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export const OUTBOX_TOPICS = Object.freeze({
  SYNC_ZOHO_INVOICE: 'sync_zoho_invoice',
  SYNC_ZOHO_CONTACT: 'sync_zoho_contact',
  SYNC_STRIPE_PAYMENT: 'sync_stripe_payment',
  SEND_WHATSAPP_RFQ: 'send_whatsapp_rfq',
  SEND_EMAIL_DISPATCH: 'send_email_dispatch',
  AUDIT_LOG_EVENT: 'audit_log_event'
});

/**
 * Enqueues an operation into the operations_queue with an idempotency key.
 * @param {Object} params
 * @param {string} params.topic - One of OUTBOX_TOPICS
 * @param {string} params.idempotencyKey - Unique key to prevent double processing
 * @param {Object} params.payload - Data payload for the worker
 * @param {number} [params.maxRetries=3]
 * @returns {Promise<{ success: boolean, queueId: string }>}
 */
export async function enqueueOutboxOperation({
  topic,
  idempotencyKey,
  payload,
  maxRetries = 3
}) {
  if (!topic || !idempotencyKey) {
    throw new Error('outboxQueueService: topic and idempotencyKey are mandatory.');
  }

  const queueId = `outbox_${idempotencyKey}`;
  const outboxRef = doc(db, 'operations_queue', queueId);

  const eventDoc = {
    id: queueId,
    topic,
    idempotencyKey,
    payload: payload || {},
    status: 'pending',
    attempts: 0,
    maxRetries,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    nextRetryAt: new Date().toISOString()
  };

  try {
    // setDoc with merge to ensure strict idempotency
    await setDoc(outboxRef, eventDoc, { merge: true });
    return { success: true, queueId };
  } catch (error) {
    console.error(`[outboxQueueService] Failed to enqueue event ${queueId}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Marks an outbox event as completed.
 */
export async function markOutboxComplete(queueId, result = {}) {
  const outboxRef = doc(db, 'operations_queue', queueId);
  await updateDoc(outboxRef, {
    status: 'completed',
    result,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

/**
 * Records a failure and increments retry counter with exponential backoff.
 */
export async function recordOutboxFailure(queueId, currentAttempts, maxRetries, errorMessage) {
  const outboxRef = doc(db, 'operations_queue', queueId);
  const nextAttempt = currentAttempts + 1;
  const isDeadLetter = nextAttempt >= maxRetries;

  const backoffSeconds = Math.pow(2, nextAttempt) * 30; // 30s, 60s, 120s...
  const nextRetryDate = new Date(Date.now() + backoffSeconds * 1000).toISOString();

  await updateDoc(outboxRef, {
    status: isDeadLetter ? 'failed' : 'pending_retry',
    attempts: nextAttempt,
    lastError: errorMessage,
    nextRetryAt: nextRetryDate,
    updatedAt: serverTimestamp()
  });
}
