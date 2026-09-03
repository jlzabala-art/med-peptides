/**
 * src/repositories/_writeGuard.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Repository Write Guard — Zod Runtime Validation Wrapper
 *
 * Wraps any Firestore write function with Zod schema validation.
 * If validation fails, throws RepositoryValidationError BEFORE touching Firestore.
 * This ensures NO corrupt or incomplete clinical data is ever persisted.
 *
 * Standards: ISO 14971 (medical device risk management), OWASP Input Validation,
 *            FDA 21 CFR Part 11 (data integrity for electronic records).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { logger } from '../utils/logger';
import { RepositoryValidationError } from '../errors/ClinicalErrors';

/**
 * Wraps an async write function with Zod schema validation.
 *
 * @template T
 * @param {import('zod').ZodSchema<T>} schema    - Zod schema to validate against
 * @param {string}                    entityName - Human-readable entity name for error messages
 * @returns {(writeFn: (data: T, ...args: any[]) => Promise<any>) => (data: unknown, ...args: any[]) => Promise<any>}
 *
 * @example
 * export const createPrescription = withValidation(PrescriptionSchema, 'Prescription')(
 *   async (data) => { ... firestore write ... }
 * );
 */
export function withValidation(schema, entityName) {
  return function decorator(writeFn) {
    return async function validated(data, ...rest) {
      const result = schema.safeParse(data);

      if (!result.success) {
        logger.error(`[WriteGuard:${entityName}] Escritura bloqueada — datos inválidos`, {
          errors: result.error.errors,
          entity: entityName,
        });
        throw new RepositoryValidationError(entityName, result.error.errors);
      }

      // Pass the Zod-parsed (and coerced/defaulted) data, not the raw input
      return writeFn(result.data, ...rest);
    };
  };
}

/**
 * Wraps a write function with partial Zod schema validation (for partial updates).
 * Uses schema.partial() so that only provided fields are validated.
 *
 * @example
 * export const updatePrescription = withPartialValidation(PrescriptionSchema, 'Prescription')(
 *   async (id, data) => { ... firestore updateDoc ... }
 * );
 */
export function withPartialValidation(schema, entityName) {
  const partialSchema = schema.partial();
  return function decorator(writeFn) {
    return async function validated(id, data, ...rest) {
      const result = partialSchema.safeParse(data);

      if (!result.success) {
        logger.error(`[WriteGuard:${entityName}] Actualización bloqueada — datos inválidos`, {
          errors: result.error.errors,
          entity: entityName,
          id,
        });
        throw new RepositoryValidationError(entityName, result.error.errors);
      }

      return writeFn(id, result.data, ...rest);
    };
  };
}
