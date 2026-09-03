/**
 * src/repositories/_resilience.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository Resilience Layer — Exponential Backoff Retry for Firestore
 *
 * Wraps Firestore async operations with smart retry logic.
 * Only retries on transient/recoverable errors (network timeouts, service overload).
 * Non-retryable errors (permission-denied, not-found) are rethrown immediately.
 *
 * Standards: NIST SP 800-30 (availability), IEC 62443 (operational continuity),
 *            Google Cloud best practices for Firestore retry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { logger } from '../utils/logger';

/**
 * Firestore error codes that indicate a transient / retryable condition.
 * These are expected to resolve with a short wait between attempts.
 */
const RETRYABLE_CODES = new Set([
  'unavailable',
  'resource-exhausted',
  'deadline-exceeded',
  'internal',
  'aborted',
]);

/**
 * Detects if a Firestore error is retryable.
 * @param {Error} err
 * @returns {boolean}
 */
function isRetryable(err) {
  if (!err) return false;
  if (RETRYABLE_CODES.has(err.code)) return true;
  // Firebase SDK sometimes surfaces these as message strings
  const msg = String(err.message || '').toLowerCase();
  return msg.includes('network') || msg.includes('unavailable') || msg.includes('timeout');
}

/**
 * Executes an async Firestore operation with exponential backoff retry.
 *
 * @param {() => Promise<T>} fn            - The async operation to execute
 * @param {object}           opts
 * @param {number}           opts.maxAttempts  - Maximum retry attempts (default: 3)
 * @param {number}           opts.baseDelayMs  - Base delay in ms before first retry (default: 300)
 * @param {string}           opts.entityName   - Name for logging context (default: 'Repository')
 * @returns {Promise<T>}
 *
 * @example
 * const data = await withRetry(() => getDoc(ref), { entityName: 'Prescription' });
 */
export async function withRetry(fn, { maxAttempts = 3, baseDelayMs = 300, entityName = 'Repository' } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (!isRetryable(err) || attempt === maxAttempts) {
        // Not retryable or exhausted — rethrow immediately
        throw err;
      }

      const delayMs = baseDelayMs * Math.pow(2, attempt - 1); // 300ms, 600ms, 1200ms
      logger.warn(`[${entityName}] Retry ${attempt}/${maxAttempts} in ${delayMs}ms`, {
        errorCode: err.code,
        errorMsg: err.message,
      });

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
