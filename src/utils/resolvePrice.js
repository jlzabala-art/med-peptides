/**
 * resolvePrice.js
 *
 * Resolves the effective price for a variant using the hierarchy:
 *   1. Customer-level override (customerPricing/{uid}/variants/{variantId})
 *   2. Country-level override  (variant.pricing.byCountry.{countryCode})
 *   3. Base global price       (variant.pricing.base)
 *
 * Usage:
 *   import { resolveVariantPrice } from '../utils/resolvePrice';
 *   const price = resolveVariantPrice(variant, { countryCode: 'ES', customerOverride: null });
 */

/**
 * @typedef {Object} PricingBase
 * @property {number|null} kitUSD       - Kit price in USD
 * @property {number|null} perVialUSD   - Per-vial price in USD
 * @property {string}      currency     - Currency code (default: 'USD')
 */

/**
 * @typedef {Object} VariantPricing
 * @property {PricingBase}              base       - Global base price
 * @property {Record<string,PricingBase>} byCountry - Country overrides keyed by ISO-3166 code
 */

/**
 * @typedef {Object} ResolvedPrice
 * @property {number|null} kitUSD
 * @property {number|null} perVialUSD
 * @property {string}      currency
 * @property {'customer'|'country'|'base'} source  - Which tier was applied
 */

/**
 * Resolve the effective price for a single variant.
 *
 * @param {Object}      variant             - Firestore variant document
 * @param {Object}      [opts]
 * @param {string}      [opts.countryCode]  - ISO-3166 2-letter code, e.g. 'ES', 'US'
 * @param {PricingBase} [opts.customerOverride] - Row from customerPricing collection (null if none)
 * @returns {ResolvedPrice}
 */
export function resolveVariantPrice(variant, { countryCode = null, customerOverride = null } = {}) {
  const pricing = variant?.pricing ?? {};
  const base = pricing.base ?? { kitUSD: null, perVialUSD: null, currency: 'USD' };

  // ── Tier 1: Customer override ──────────────────────────────────────────────
  if (customerOverride && (customerOverride.kitUSD != null || customerOverride.perVialUSD != null)) {
    return {
      kitUSD: customerOverride.kitUSD ?? base.kitUSD,
      perVialUSD: customerOverride.perVialUSD ?? base.perVialUSD,
      currency: customerOverride.currency ?? base.currency ?? 'USD',
      source: 'customer',
    };
  }

  // ── Tier 2: Country override ───────────────────────────────────────────────
  if (countryCode) {
    const cc = countryCode.toUpperCase();
    const countryPrice = pricing.byCountry?.[cc];
    if (countryPrice && (countryPrice.kitUSD != null || countryPrice.perVialUSD != null)) {
      return {
        kitUSD: countryPrice.kitUSD ?? base.kitUSD,
        perVialUSD: countryPrice.perVialUSD ?? base.perVialUSD,
        currency: countryPrice.currency ?? base.currency ?? 'USD',
        source: 'country',
      };
    }
  }

  // ── Tier 3: Base global ────────────────────────────────────────────────────
  return {
    kitUSD: base.kitUSD ?? null,
    perVialUSD: base.perVialUSD ?? null,
    currency: base.currency ?? 'USD',
    source: 'base',
  };
}

/**
 * Format a price value for display.
 * Returns null if price is not set.
 *
 * @param {number|null} amount
 * @param {string}      [currency='USD']
 * @returns {string|null}
 */
export function formatPrice(amount, currency = 'USD') {
  if (amount == null) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convenience: resolve price + format in one call.
 * Returns { resolved: ResolvedPrice, display: { kit: string|null, perUnit: string|null } }
 */
export function resolveAndFormatPrice(variant, opts = {}) {
  const resolved = resolveVariantPrice(variant, opts);
  return {
    resolved,
    display: {
      kit: formatPrice(resolved.kitUSD, resolved.currency),
      perUnit: formatPrice(resolved.perVialUSD, resolved.currency),
    },
  };
}
