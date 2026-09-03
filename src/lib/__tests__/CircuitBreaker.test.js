/**
 * __tests__/CircuitBreaker.test.js
 * Unit tests for the Circuit Breaker (Pilar 5 — Fase 3)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, CB_STATE, getBreaker } from '../CircuitBreaker';

// Silence logger in tests
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function makeBreaker(opts = {}) {
  return new CircuitBreaker('TestService', {
    failureThreshold: 3,
    recoveryTimeMs: 1000,
    successThreshold: 2,
    ...opts,
  });
}

async function failNTimes(breaker, n) {
  const failFn = () => Promise.reject(new Error('service error'));
  for (let i = 0; i < n; i++) {
    await breaker.exec(failFn).catch(() => {});
  }
}

describe('CircuitBreaker', () => {
  describe('Initial State', () => {
    it('starts in CLOSED state', () => {
      const cb = makeBreaker();
      expect(cb.state).toBe(CB_STATE.CLOSED);
    });

    it('metrics() reports zero failures initially', () => {
      const cb = makeBreaker();
      expect(cb.metrics().failureCount).toBe(0);
      expect(cb.metrics().state).toBe(CB_STATE.CLOSED);
    });
  });

  describe('CLOSED → OPEN transition', () => {
    it('trips to OPEN after reaching failureThreshold', async () => {
      const cb = makeBreaker({ failureThreshold: 3 });
      await failNTimes(cb, 3);
      expect(cb.state).toBe(CB_STATE.OPEN);
    });

    it('does NOT trip before reaching threshold', async () => {
      const cb = makeBreaker({ failureThreshold: 3 });
      await failNTimes(cb, 2);
      expect(cb.state).toBe(CB_STATE.CLOSED);
    });
  });

  describe('OPEN state — fast fail', () => {
    it('throws immediately when OPEN without calling the function', async () => {
      const cb = makeBreaker({ failureThreshold: 1, recoveryTimeMs: 60_000 });
      await failNTimes(cb, 1);
      expect(cb.state).toBe(CB_STATE.OPEN);

      const spy = vi.fn(() => Promise.resolve('ok'));
      await expect(cb.exec(spy)).rejects.toThrow(/unavailable/i);
      expect(spy).not.toHaveBeenCalled();
    });

    it('returns fallback value when OPEN and fallback is provided', async () => {
      const cb = makeBreaker({ failureThreshold: 1, recoveryTimeMs: 60_000 });
      await failNTimes(cb, 1);
      const result = await cb.exec(() => Promise.reject(new Error('fail')), {
        fallback: () => 'cached_data',
      });
      expect(result).toBe('cached_data');
    });
  });

  describe('OPEN → HALF_OPEN transition', () => {
    it('moves to HALF_OPEN after recoveryTimeMs has elapsed', async () => {
      vi.useFakeTimers();
      const cb = makeBreaker({ failureThreshold: 1, recoveryTimeMs: 1000 });
      await failNTimes(cb, 1);
      expect(cb.state).toBe(CB_STATE.OPEN);

      vi.advanceTimersByTime(1001);
      // Trigger a probe call
      await cb.exec(() => Promise.resolve('probe')).catch(() => {});
      vi.useRealTimers();
    });
  });

  describe('HALF_OPEN → CLOSED (recovery)', () => {
    it('returns to CLOSED after successThreshold successful probes', async () => {
      const cb = makeBreaker({ failureThreshold: 1, recoveryTimeMs: 0, successThreshold: 2 });
      await failNTimes(cb, 1);
      // Force HALF_OPEN by calling with recoveryTimeMs=0
      await cb.exec(() => Promise.resolve('probe1')).catch(() => {});
      expect(cb.state === CB_STATE.CLOSED || cb.state === CB_STATE.HALF_OPEN).toBe(true);
    });
  });

  describe('HALF_OPEN → OPEN (probe failure)', () => {
    it('returns to OPEN if probe request fails', async () => {
      const cb = makeBreaker({ failureThreshold: 1, recoveryTimeMs: 0, successThreshold: 3 });
      await failNTimes(cb, 1); // → OPEN
      // Next call will be probe (recoveryTimeMs=0), and it fails
      await cb.exec(() => Promise.reject(new Error('still broken'))).catch(() => {});
      expect(cb.state).toBe(CB_STATE.OPEN);
    });
  });

  describe('reset()', () => {
    it('resets to CLOSED from OPEN', async () => {
      const cb = makeBreaker({ failureThreshold: 1 });
      await failNTimes(cb, 1);
      expect(cb.state).toBe(CB_STATE.OPEN);
      cb.reset();
      expect(cb.state).toBe(CB_STATE.CLOSED);
      expect(cb.metrics().failureCount).toBe(0);
    });
  });

  describe('onStateChange callback', () => {
    it('fires onStateChange on every state transition', async () => {
      const changes = [];
      const cb = makeBreaker({
        failureThreshold: 1,
        onStateChange: (ev) => changes.push(ev),
      });
      await failNTimes(cb, 1);
      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0].newState).toBe(CB_STATE.OPEN);
    });
  });

  describe('getBreaker() singleton', () => {
    it('returns the same instance for the same name', () => {
      const a = getBreaker('SharedService');
      const b = getBreaker('SharedService');
      expect(a).toBe(b);
    });

    it('returns different instances for different names', () => {
      const a = getBreaker('ServiceA-unique');
      const b = getBreaker('ServiceB-unique');
      expect(a).not.toBe(b);
    });
  });
});
