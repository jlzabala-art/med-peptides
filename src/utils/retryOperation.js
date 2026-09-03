/**
 * retryOperation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Resilient Operation Executor with Exponential Backoff & Jitter.
 * Prevents transient network errors or database contention from failing client requests.
 */

/**
 * Executes an async operation with exponential backoff retry.
 *
 * @template T
 * @param {() => Promise<T>} operation - The async function to execute.
 * @param {Object} [options]
 * @param {number} [options.maxRetries=3] - Maximum retry attempts.
 * @param {number} [options.baseDelayMs=250] - Initial delay in milliseconds.
 * @param {number} [options.maxDelayMs=5000] - Cap on delay in milliseconds.
 * @param {number} [options.backoffFactor=2] - Exponential multiplier.
 * @param {boolean} [options.jitter=true] - Whether to randomize delay slightly.
 * @param {(error: any) => boolean} [options.shouldRetry] - Filter function for retryable errors.
 * @returns {Promise<T>} The result of the operation.
 */
export async function retryWithBackoff(operation, options = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 250,
    maxDelayMs = 5000,
    backoffFactor = 2,
    jitter = true,
    shouldRetry = () => true,
  } = options;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt > maxRetries || !shouldRetry(err)) {
        throw err;
      }

      // Calculate exponential backoff
      let delay = baseDelayMs * Math.pow(backoffFactor, attempt - 1);
      if (jitter) {
        delay += Math.random() * (baseDelayMs * 0.5);
      }
      delay = Math.min(delay, maxDelayMs);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default retryWithBackoff;
