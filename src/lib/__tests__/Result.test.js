/**
 * __tests__/Result.test.js
 * Unit tests for the Result monad (Pilar 1 — Fase 3)
 */
import { describe, it, expect } from 'vitest';
import Result, { ok, err, tryCatch, tryCatchAsync, combine } from '../Result';

describe('Result Monad', () => {
  describe('ok()', () => {
    it('creates an Ok result with isOk=true, isErr=false', () => {
      const r = ok(42);
      expect(r.isOk).toBe(true);
      expect(r.isErr).toBe(false);
      expect(r.value).toBe(42);
      expect(r.error).toBeNull();
    });

    it('unwrap() returns the value', () => {
      expect(ok('hello').unwrap()).toBe('hello');
    });

    it('unwrapOr() returns the value, not the default', () => {
      expect(ok('x').unwrapOr('default')).toBe('x');
    });

    it('map() transforms the value', () => {
      const r = ok(3).map((v) => v * 2);
      expect(r.isOk).toBe(true);
      expect(r.value).toBe(6);
    });

    it('map() returns Err if the transform throws', () => {
      const r = ok(1).map(() => { throw new Error('boom'); });
      expect(r.isErr).toBe(true);
    });

    it('flatMap() chains another Result-returning function', () => {
      const r = ok(5).flatMap((v) => ok(v + 1));
      expect(r.value).toBe(6);
    });

    it('flatMap() propagates Err from chained function', () => {
      const r = ok(5).flatMap(() => err('chained fail'));
      expect(r.isErr).toBe(true);
    });

    it('match() calls the ok branch', () => {
      let called = null;
      ok('test').match({ ok: (v) => { called = v; }, err: () => { called = 'wrong'; } });
      expect(called).toBe('test');
    });
  });

  describe('err()', () => {
    it('creates an Err result with isOk=false, isErr=true', () => {
      const r = err('something went wrong');
      expect(r.isErr).toBe(true);
      expect(r.isOk).toBe(false);
      expect(r.value).toBeNull();
      expect(r.error).toBeInstanceOf(Error);
      expect(r.error.message).toBe('something went wrong');
    });

    it('wraps Error objects directly', () => {
      const e = new Error('original');
      const r = err(e);
      expect(r.error).toBe(e);
    });

    it('unwrap() throws the error', () => {
      expect(() => err('fail').unwrap()).toThrow('fail');
    });

    it('unwrapOr() returns the default', () => {
      expect(err('x').unwrapOr('fallback')).toBe('fallback');
    });

    it('map() is a no-op on Err', () => {
      const r = err('x').map(() => 999);
      expect(r.isErr).toBe(true);
    });

    it('flatMap() is a no-op on Err', () => {
      const r = err('x').flatMap(() => ok(999));
      expect(r.isErr).toBe(true);
    });

    it('match() calls the err branch', () => {
      let called = null;
      err('bad').match({ ok: () => { called = 'wrong'; }, err: (e) => { called = e.message; } });
      expect(called).toBe('bad');
    });
  });

  describe('tryCatch()', () => {
    it('returns Ok if function succeeds', () => {
      const r = tryCatch(() => 42);
      expect(r.isOk).toBe(true);
      expect(r.value).toBe(42);
    });

    it('returns Err if function throws', () => {
      const r = tryCatch(() => { throw new Error('sync error'); });
      expect(r.isErr).toBe(true);
      expect(r.error.message).toBe('sync error');
    });
  });

  describe('tryCatchAsync()', () => {
    it('returns Ok if async function resolves', async () => {
      const r = await tryCatchAsync(() => Promise.resolve('async value'));
      expect(r.isOk).toBe(true);
      expect(r.value).toBe('async value');
    });

    it('returns Err if async function rejects', async () => {
      const r = await tryCatchAsync(() => Promise.reject(new Error('async error')));
      expect(r.isErr).toBe(true);
      expect(r.error.message).toBe('async error');
    });
  });

  describe('combine()', () => {
    it('returns Ok with all values if all succeed', () => {
      const r = combine([ok(1), ok(2), ok(3)]);
      expect(r.isOk).toBe(true);
      expect(r.value).toEqual([1, 2, 3]);
    });

    it('returns the first Err if any fails', () => {
      const r = combine([ok(1), err('fail here'), ok(3)]);
      expect(r.isErr).toBe(true);
      expect(r.error.message).toBe('fail here');
    });

    it('returns Ok for empty array', () => {
      const r = combine([]);
      expect(r.isOk).toBe(true);
      expect(r.value).toEqual([]);
    });
  });

  describe('Result namespace export', () => {
    it('re-exports ok, err, tryCatch, tryCatchAsync, combine', () => {
      expect(typeof Result.ok).toBe('function');
      expect(typeof Result.err).toBe('function');
      expect(typeof Result.tryCatch).toBe('function');
      expect(typeof Result.tryCatchAsync).toBe('function');
      expect(typeof Result.combine).toBe('function');
    });
  });
});
