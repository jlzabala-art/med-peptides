/**
 * retryOperation.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates retryWithBackoff functionality, attempt counting, and error propagation.
 */

import { strict as assert } from 'node:assert';
import { retryWithBackoff } from '../src/utils/retryOperation.js';

// 1. Success on First Attempt
let firstAttemptCount = 0;
const res1 = await retryWithBackoff(async () => {
  firstAttemptCount++;
  return 'SUCCESS_FIRST';
});
assert.equal(res1, 'SUCCESS_FIRST');
assert.equal(firstAttemptCount, 1);

// 2. Success After 2 Transient Failures
let transientCount = 0;
const res2 = await retryWithBackoff(async () => {
  transientCount++;
  if (transientCount < 3) {
    throw new Error('Transient network error');
  }
  return 'SUCCESS_AFTER_RETRY';
}, { baseDelayMs: 10, jitter: false });
assert.equal(res2, 'SUCCESS_AFTER_RETRY');
assert.equal(transientCount, 3);

// 3. Exhaust Retries and Throw
let failCount = 0;
let caughtError = null;
try {
  await retryWithBackoff(async () => {
    failCount++;
    throw new Error('Persistent Database Outage');
  }, { maxRetries: 2, baseDelayMs: 10, jitter: false });
} catch (err) {
  caughtError = err;
}
assert.ok(caughtError !== null);
assert.equal(failCount, 3); // initial attempt + 2 retries

console.log('✔ All Exponential Backoff Retry Operation Tests Passed Successfully!');
