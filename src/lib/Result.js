/**
 * lib/Result.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Functional Result Monad — Atlas Clinical Platform
 *
 * Provides a type-safe alternative to `throw/catch` error handling throughout
 * all clinical repositories and services. Forces callers to handle both
 * success and failure paths explicitly, eliminating silent undefined errors.
 *
 * Usage:
 *   const result = await prescriptionRepository.get(id);
 *   result.match({
 *     ok:  (rx) => render(rx),
 *     err: (e)  => notifier.error(e.message),
 *   });
 *
 * Standards: Railway-Oriented Programming (F# / Rust-inspired), ISO 14971
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Wraps a successful value.
 * @template T
 * @param {T} value
 * @returns {{ ok: true, value: T, err: false, error: null }}
 */
export function ok(value) {
  return Object.freeze({
    ok: true,
    err: false,
    value,
    error: null,

    /**
     * Transforms the value inside an Ok result.
     * @param {(value: T) => U} fn
     * @returns {Result<U>}
     */
    map(fn) {
      try {
        return ok(fn(this.value));
      } catch (e) {
        return err(e);
      }
    },

    /**
     * Chains another Result-returning function.
     * @param {(value: T) => Result<U>} fn
     * @returns {Result<U>}
     */
    flatMap(fn) {
      try {
        return fn(this.value);
      } catch (e) {
        return err(e);
      }
    },

    /**
     * Pattern-matches on Ok/Err branches.
     * @param {{ ok: (v: T) => U, err: (e: Error) => U }} branches
     * @returns {U}
     */
    match({ ok: onOk }) {
      return onOk(this.value);
    },

    /**
     * Unwraps the value. Throws if this is an Err.
     * @returns {T}
     */
    unwrap() {
      return this.value;
    },

    /**
     * Returns value or a default.
     * @param {T} _default
     * @returns {T}
     */
    unwrapOr(_default) {
      return this.value;
    },

    /**
     * Returns true if Ok.
     */
    isOk: true,
    isErr: false,
  });
}

/**
 * Wraps a failure.
 * @param {Error|string} error
 * @returns {{ ok: false, err: true, error: Error, value: null }}
 */
export function err(error) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  return Object.freeze({
    ok: false,
    err: true,
    value: null,
    error: errorObj,

    map(_fn) {
      return this;
    },

    flatMap(_fn) {
      return this;
    },

    match({ err: onErr }) {
      return onErr(this.error);
    },

    unwrap() {
      throw this.error;
    },

    unwrapOr(defaultValue) {
      return defaultValue;
    },

    isOk: false,
    isErr: true,
  });
}

/**
 * Wraps an async function, returning a Result instead of throwing.
 * @param {() => Promise<T>} fn
 * @returns {Promise<Result<T>>}
 */
export async function tryCatchAsync(fn) {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}

/**
 * Wraps a sync function, returning a Result instead of throwing.
 * @param {() => T} fn
 * @returns {Result<T>}
 */
export function tryCatch(fn) {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
}

/**
 * Combines multiple Results. Returns Err if any fail.
 * @param {Result[]} results
 * @returns {Result<Array>}
 */
export function combine(results) {
  const values = [];
  for (const result of results) {
    if (result.isErr) return result;
    values.push(result.value);
  }
  return ok(values);
}

const Result = { ok, err, tryCatch, tryCatchAsync, combine };
export default Result;
