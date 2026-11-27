/**
 * Canonical data model validators and unified schema barrel.
 *
 * Re-exports domain schemas from src/schemas/index.js and provides a single
 * SSOT validator for commercial pricing blocks across products, agreements,
 * and B2B quotations.
 */
export * from './index.js';

export function validatePricingBlock(pricing) {
  const errors = [];
  if (!pricing || typeof pricing !== 'object' || Array.isArray(pricing)) {
    return { valid: false, errors: ['pricing must be a non-null object'] };
  }

  const numericFields = ['baseCostUsd', 'msrpUsd', 'distributorUsd', 'clinicUsd', 'minOrderQty'];
  for (const field of numericFields) {
    if (pricing[field] !== undefined && pricing[field] !== null) {
      const n = Number(pricing[field]);
      if (!Number.isFinite(n) || n < 0) {
        errors.push(`${field} must be a non-negative finite number`);
      }
    }
  }

  if (pricing.currency !== undefined && pricing.currency !== null) {
    const cur = String(pricing.currency).toUpperCase();
    if (!['USD', 'EUR', 'AED', 'QAR'].includes(cur)) {
      errors.push(`Unsupported currency: ${cur}`);
    }
  }

  if (
    Number.isFinite(Number(pricing.distributorUsd)) &&
    Number.isFinite(Number(pricing.clinicUsd)) &&
    Number(pricing.distributorUsd) > Number(pricing.clinicUsd)
  ) {
    errors.push('distributorUsd cannot exceed clinicUsd');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
