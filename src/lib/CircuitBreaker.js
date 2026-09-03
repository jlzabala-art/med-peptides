/**
 * lib/CircuitBreaker.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Circuit Breaker Pattern — Atlas Clinical Platform
 *
 * Protects calls to third-party APIs (Zoho Books, Stripe, Firebase AI,
 * Cloud Functions) against cascading failures and resource exhaustion.
 *
 * States:
 *   CLOSED    → Normal operation. Requests flow through.
 *   OPEN      → Failure threshold exceeded. Requests fail fast with fallback.
 *   HALF_OPEN → Probe period. One request allowed to test recovery.
 *
 * Usage:
 *   const zohoBreaker = new CircuitBreaker('ZohoBooks', {
 *     failureThreshold: 5,
 *     recoveryTimeMs: 30_000,
 *   });
 *   const result = await zohoBreaker.exec(() => zohoClient.getInvoice(id));
 *
 * Standards: NIST SP 800-30 Risk Assessment, IEC 62443 (Cybersecurity for
 * Industrial Control Systems), Microsoft Cloud Design Patterns.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { logger } from '../utils/logger';

export const CB_STATE = Object.freeze({
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
});

export class CircuitBreaker {
  /**
   * @param {string} name          Identifier for logging/monitoring.
   * @param {object} [opts]
   * @param {number} [opts.failureThreshold=5]  Consecutive failures to trip the breaker.
   * @param {number} [opts.recoveryTimeMs=30000] Time to wait before entering HALF_OPEN.
   * @param {number} [opts.successThreshold=2]  Successes in HALF_OPEN to return to CLOSED.
   * @param {Function} [opts.onStateChange]     Callback fired on every state transition.
   */
  constructor(name, opts = {}) {
    this.name = name;
    this.failureThreshold = opts.failureThreshold ?? 5;
    this.recoveryTimeMs = opts.recoveryTimeMs ?? 30_000;
    this.successThreshold = opts.successThreshold ?? 2;
    this.onStateChange = opts.onStateChange ?? null;

    this._state = CB_STATE.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = null;
  }

  get state() {
    return this._state;
  }

  /**
   * Executes `fn` through the circuit breaker.
   * If OPEN and recovery period has elapsed, transitions to HALF_OPEN.
   * @param {() => Promise<T>} fn
   * @param {{ fallback?: () => T }} [opts]
   * @returns {Promise<T>}
   */
  async exec(fn, opts = {}) {
    if (this._state === CB_STATE.OPEN) {
      const elapsed = Date.now() - this._lastFailureTime;
      if (elapsed >= this.recoveryTimeMs) {
        this._transition(CB_STATE.HALF_OPEN);
      } else {
        const remaining = Math.ceil((this.recoveryTimeMs - elapsed) / 1000);
        logger.warn(`[CircuitBreaker:${this.name}] OPEN — failing fast (${remaining}s to recovery)`);
        if (typeof opts.fallback === 'function') return opts.fallback();
        throw new Error(`[CircuitBreaker:${this.name}] Service unavailable. Retry in ${remaining}s.`);
      }
    }

    try {
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure(error);
      if (typeof opts.fallback === 'function') return opts.fallback();
      throw error;
    }
  }

  /** Manually resets the breaker to CLOSED state. */
  reset() {
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = null;
    this._transition(CB_STATE.CLOSED);
  }

  /** Returns a snapshot of the breaker's current metrics. */
  metrics() {
    return {
      name: this.name,
      state: this._state,
      failureCount: this._failureCount,
      successCount: this._successCount,
      lastFailureTime: this._lastFailureTime,
    };
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  _onSuccess() {
    this._failureCount = 0;
    if (this._state === CB_STATE.HALF_OPEN) {
      this._successCount++;
      if (this._successCount >= this.successThreshold) {
        this._successCount = 0;
        this._transition(CB_STATE.CLOSED);
      }
    }
  }

  _onFailure(error) {
    this._lastFailureTime = Date.now();
    this._successCount = 0;

    if (this._state === CB_STATE.HALF_OPEN) {
      logger.warn(`[CircuitBreaker:${this.name}] HALF_OPEN probe failed — returning to OPEN`, {
        error: error.message,
      });
      this._transition(CB_STATE.OPEN);
      return;
    }

    this._failureCount++;
    logger.warn(`[CircuitBreaker:${this.name}] Failure ${this._failureCount}/${this.failureThreshold}`, {
      error: error.message,
    });

    if (this._failureCount >= this.failureThreshold) {
      this._transition(CB_STATE.OPEN);
    }
  }

  _transition(newState) {
    const prevState = this._state;
    this._state = newState;
    logger.info(`[CircuitBreaker:${this.name}] ${prevState} → ${newState}`);
    if (typeof this.onStateChange === 'function') {
      this.onStateChange({ name: this.name, prevState, newState });
    }
  }
}

/**
 * Singleton registry — reuse breakers across imports.
 */
const _registry = new Map();

/**
 * Gets or creates a named CircuitBreaker instance.
 * @param {string} name
 * @param {object} [opts]
 * @returns {CircuitBreaker}
 */
export function getBreaker(name, opts = {}) {
  if (!_registry.has(name)) {
    _registry.set(name, new CircuitBreaker(name, opts));
  }
  return _registry.get(name);
}

export default CircuitBreaker;
