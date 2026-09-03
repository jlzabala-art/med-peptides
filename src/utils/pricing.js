/**
 * src/utils/pricing.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical pricing utility — Phase 3 of schema normalization
 *
 * All price reads in the codebase MUST go through these helpers.
 * Never access p.price, p.retailPrice, p.priceUSD, p.costPrice directly.
 *
 * Supported pricing tiers: 'retail' | 'master' | 'wholesale' | 'clinic'
 *
 * Variant pricing structure (canonical):
 *   variant.pricing.{tier}.perUnit  → number
 *   variant.pricing.{tier}.kit      → number (kit of 10)
 *   variant.pricing.{tier}.currency → string (default 'USD')
 *
 * Legacy field fallback chain (read-only, never write):
 *   retailPrice → pricing.retail.perUnit
 *   costPrice   → pricing.master.perUnit
 *   priceUSD    → pricing.retail.perUnit
 *   price       → pricing.retail.perUnit
 */

const VALID_TIERS = ['retail', 'master', 'wholesale', 'clinic'];

/**
 * Get the per-unit price of a variant for a given tier.
 * Falls back through legacy fields for backward compat.
 *
 * @param {Object} variant - Variant document
 * @param {'retail'|'master'|'wholesale'|'clinic'} tier - Pricing tier
 * @returns {number} Price in USD (0 if not found)
 */
export function getVariantPrice(variant, tier = 'retail') {
  if (!variant) return 0;

  const t = VALID_TIERS.includes(tier) ? tier : 'retail';

  // ── Canonical path (preferred) ──
  const fromPricing = variant.pricing?.[t]?.perUnit;
  if (typeof fromPricing === 'number' && fromPricing > 0) return fromPricing;

  // ── Legacy fallback by tier ──
  if (t === 'retail') {
    const legacy = variant.retailPrice ?? variant.priceUSD ?? variant.unit_price ?? variant.price;
    if (typeof legacy === 'number' && legacy > 0) return legacy;
    if (typeof legacy === 'string' && !isNaN(parseFloat(legacy))) return parseFloat(legacy);
  }

  if (t === 'master') {
    const legacy = variant.costPrice ?? variant.masterPrice;
    if (typeof legacy === 'number' && legacy > 0) return legacy;
  }

  if (t === 'wholesale') {
    const legacy = variant.wholesalePrice;
    if (typeof legacy === 'number' && legacy > 0) return legacy;
  }

  if (t === 'clinic') {
    const legacy = variant.clinicPrice;
    if (typeof legacy === 'number' && legacy > 0) return legacy;
  }

  return 0;
}

/**
 * Get the kit price (10-unit bundle) for a variant at a given tier.
 *
 * @param {Object} variant
 * @param {'retail'|'master'|'wholesale'|'clinic'} tier
 * @returns {number}
 */
export function getVariantKitPrice(variant, tier = 'retail') {
  if (!variant) return 0;

  const t = VALID_TIERS.includes(tier) ? tier : 'retail';

  const fromPricing = variant.pricing?.[t]?.kit;
  if (typeof fromPricing === 'number' && fromPricing > 0) return fromPricing;

  // Legacy
  const legacy = variant.kitPrice ?? variant.price_per_kit_10 ?? variant.cost_tiers?.cost_10;
  if (typeof legacy === 'number' && legacy > 0) return legacy;
  if (typeof legacy === 'string' && !isNaN(parseFloat(legacy))) return parseFloat(legacy);

  return 0;
}

/**
 * Get the min unit price across all variants of a product at a given tier.
 * Useful for catalog cards showing "From $X".
 *
 * @param {Object} product - Product with variants[] array
 * @param {'retail'|'master'|'wholesale'|'clinic'} tier
 * @returns {number} Minimum price (0 if none)
 */
export function getProductMinPrice(product, tier = 'retail') {
  if (!product) return 0;

  const variants = product.variants || [];
  if (variants.length === 0) {
    // Fallback to legacy flat fields on product itself
    return product.min_unit_price ?? product.price ?? 0;
  }

  const prices = variants
    .map(v => getVariantPrice(v, tier))
    .filter(p => p > 0);

  return prices.length > 0 ? Math.min(...prices) : 0;
}

/**
 * Get the currency for a variant at a given tier.
 * @param {Object} variant
 * @param {'retail'|'master'|'wholesale'|'clinic'} tier
 * @returns {string} 'USD' by default
 */
export function getVariantCurrency(variant, tier = 'retail') {
  return variant?.pricing?.[tier]?.currency ?? 'USD';
}

/**
 * Format a price as a localized currency string.
 * @param {number} amount
 * @param {string} currency
 * @param {string} locale
 * @returns {string}
 */
export function formatPrice(amount, currency = 'USD', locale = 'en-US') {
  if (!amount || amount === 0) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Build a full pricing summary object for a product (all tiers, min prices).
 * @param {Object} product
 * @returns {{ retail: number, master: number, wholesale: number, clinic: number }}
 */
export function getProductPricingSummary(product) {
  return {
    retail:    getProductMinPrice(product, 'retail'),
    master:    getProductMinPrice(product, 'master'),
    wholesale: getProductMinPrice(product, 'wholesale'),
    clinic:    getProductMinPrice(product, 'clinic'),
  };
}
