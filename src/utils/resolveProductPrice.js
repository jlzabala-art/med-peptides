/* eslint-disable no-unused-vars */
/**
 * resolveProductPrice.js — Canonical Product-Level Price Resolver
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the SINGLE global entry point for all frontend price resolution.
 *
 * All pages, components, PDFs and AI integrations MUST call this function
 * instead of accessing pricing fields directly or calling resolveVariantPrice()
 * with ad-hoc logic.
 *
 * Input:  a product document (from Firestore) + options
 * Output: a canonical ResolvedProductPrice object
 *
 * Variant selection strategy:
 *   1. opts.variantId — explicit variant (most precise)
 *   2. opts.route    — best variant matching administration route
 *   3. default       — first variant with pricing data for the requested tier
 *   4. fallback      — first variant in the array
 *
 * @module resolveProductPrice
 */

import { PRICING_TIER, BILLING_UNIT, PRODUCT_TYPE } from '../constants/productEnums';
import { resolveVariantPrice, formatPrice, getActiveTenantForResolution } from './resolvePrice';

// ── Canonical output types (JSDoc) ─────────────────────────────────────────────

/**
 * @typedef {Object} ResolvedProductPrice
 * @property {number|null}   amount        - Resolved unit price (after currency conversion)
 * @property {number|null}   kitAmount     - Resolved kit price (null if no kit pricing)
 * @property {string}        currency      - ISO 4217 currency code (e.g. 'USD', 'EUR')
 * @property {string|null}   billingUnit   - One of BILLING_UNIT values (e.g. 'vial', 'bottle')
 * @property {string}        formattedPrice- Human-readable formatted price (e.g. "$120.00 / vial")
 * @property {string|null}   formattedKit  - Human-readable kit price (e.g. "$950.00 / 10-kit")
 * @property {string}        tier          - Effective pricing tier used (e.g. 'retail')
 * @property {string}        packageType   - 'unit' | 'kit' — primary package type resolved
 * @property {boolean}       isFallback    - True if tier was escalated (e.g. clinic→retail)
 * @property {string}        source        - 'customer' | 'country' | 'base'
 * @property {string|null}   variantId     - ID of the resolved variant
 * @property {string|null}   variantLabel  - Human-readable variant label
 * @property {Object|null}   tax           - Tax breakdown (if includeTax was true)
 */

// ── Internal helpers ───────────────────────────────────────────────────────────

/**
 * Extract the array of variants from a product document.
 * Handles both canonical { variants: [...] } and legacy flat structures.
 *
 * @param {Object} product
 * @returns {Array}
 */
function extractVariants(product) {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  // Some legacy product docs are themselves a single variant-like object
  if (product.pricing) {
    return [product]; // treat the product as its own variant
  }
  return [];
}

/**
 * Check whether a variant has pricing data for the given tier (or any fallback).
 *
 * @param {Object} variant
 * @param {string} tier - PRICING_TIER value
 * @returns {boolean}
 */
function variantHasPricing(variant, tier) {
  const pricing = variant?.pricing;
  if (!pricing) return false;
  const entry = pricing[tier] ?? pricing[`${tier}Price`]; // handle both schemas
  return !!(entry?.perUnit != null || entry?.unit != null || entry?.base != null);
}

/**
 * Select the best variant from a product for the given options.
 *
 * @param {Array}  variants
 * @param {Object} opts
 * @param {string} [opts.variantId]  - Exact variantId to select
 * @param {string} [opts.route]      - Administration route (e.g. 'SC')
 * @param {string} [opts.tier]       - Pricing tier (for pricing-aware selection)
 * @returns {Object|null}
 */
function selectVariant(variants, { variantId, route, tier = PRICING_TIER.RETAIL }) {
  if (!variants.length) return null;

  // 1. Exact variantId match
  if (variantId) {
    const exact = variants.find((v) => v.variantId === variantId || v.id === variantId);
    if (exact) return exact;
  }

  // 2. Route match with pricing
  if (route) {
    const byRoute = variants.filter(
      (v) => v.attributes?.administration === route || v.route === route
    );
    const withPricing = byRoute.find((v) => variantHasPricing(v, tier));
    if (withPricing) return withPricing;
    if (byRoute.length) return byRoute[0];
  }

  // 3. First variant with pricing for this tier
  const withPricing = variants.find((v) => variantHasPricing(v, tier));
  if (withPricing) return withPricing;

  // 4. Fallback: first variant
  return variants[0];
}

/**
 * Infer the billing unit for a product/variant when none is explicitly set.
 *
 * @param {Object} product
 * @param {Object} variant
 * @returns {string|null}
 */
function inferBillingUnit(product, variant) {
  // Explicit canonical field on variant
  if (variant?.billingUnit) return variant.billingUnit;

  // Explicit canonical field on product
  if (product?.billingUnit) return product.billingUnit;

  // Infer from productType
  const type = product?.productType ?? product?.type;
  switch (type) {
    case PRODUCT_TYPE.PEPTIDE:               return BILLING_UNIT.VIAL;
    case PRODUCT_TYPE.SUPPLEMENT:            return BILLING_UNIT.BOTTLE;
    case PRODUCT_TYPE.GENETIC_TEST:          return BILLING_UNIT.TEST;
    case PRODUCT_TYPE.PROTOCOL:              return BILLING_UNIT.PROTOCOL;
    case PRODUCT_TYPE.PROFESSIONAL_MATERIAL: return BILLING_UNIT.BOX;
    default:                                 return null;
  }
}

/**
 * Build the formatted price string including billing unit.
 *
 * Examples:
 *   "$120.00 / vial"
 *   "€95.00 / bottle"
 *   "$950.00 / 10-kit"
 *
 * @param {number|null} amount
 * @param {string}      currency
 * @param {string|null} billingUnit
 * @param {string|null} countryCode
 * @param {boolean}     isKit
 * @returns {string|null}
 */
function buildFormattedPrice(amount, currency, billingUnit, countryCode, isKit = false) {
  if (amount == null) return null;
  const baseFormatted = formatPrice(amount, currency, countryCode);
  if (!billingUnit) return baseFormatted;
  const unitLabel = isKit ? '10-kit' : billingUnit.replace(/_/g, ' ');
  return `${baseFormatted} / ${unitLabel}`;
}

// ── Core resolver ──────────────────────────────────────────────────────────────

/**
 * Resolve the canonical price for a product.
 *
 * This is the SINGLE entry point all frontend code must use.
 * Never read pricing fields directly from product/variant documents.
 *
 * @param {Object}  product                     - Full product document from Firestore
 * @param {Object}  [opts]
 * @param {string}  [opts.tier]                 - PRICING_TIER value. Default: RETAIL
 * @param {string}  [opts.variantId]            - Exact variant to resolve
 * @param {string}  [opts.route]                - Filter by administration route
 * @param {string}  [opts.countryCode]          - ISO 3166-1 alpha-2 for country pricing + formatting
 * @param {Object}  [opts.customerOverride]     - Customer-specific price override
 * @param {string}  [opts.targetCurrency]       - Convert output to this currency
 * @param {Object}  [opts.exchangeRates]        - Override default exchange rates
 * @param {boolean} [opts.includeTax=false]     - Include VAT breakdown in output
 * @param {boolean} [opts.preferKit=false]      - Prefer kit pricing over unit pricing
 * @returns {ResolvedProductPrice}
 */
export function resolveProductPrice(product, {
  tier             = PRICING_TIER.RETAIL,
  variantId        = null,
  route            = null,
  countryCode      = null,
  customerOverride = null,
  targetCurrency   = null,
  exchangeRates    = undefined,
  includeTax       = false,
  preferKit        = false,
  tenant           = null,
} = {}) {
  const activeTenant = tenant || getActiveTenantForResolution();

  // ── Tenant Hiding Rule ──
  if (activeTenant) {
    const productKey = product.slug || product.id || product.name?.toLowerCase().replace(/\s+/g, '-');
    const hasOverride = activeTenant.priceOverrides && (activeTenant.priceOverrides[productKey] !== undefined || activeTenant.priceOverrides[product.name] !== undefined);
    
    if (!hasOverride) {
      return {
        amount:         null,
        kitAmount:      null,
        currency:       'USD',
        billingUnit:    inferBillingUnit(product, null),
        formattedPrice: 'Pricing unavailable',
        formattedKit:   null,
        tier,
        packageType:    'unit',
        isFallback:     true,
        source:         'base',
        variantId:      null,
        variantLabel:   null,
        tax:            null,
      };
    }
  }

  const variants = extractVariants(product);
  const variant  = selectVariant(variants, { variantId, route, tier });

  // No variant → return null-safe sentinel
  if (!variant) {
    return {
      amount:         null,
      kitAmount:      null,
      currency:       'USD',
      billingUnit:    inferBillingUnit(product, null),
      formattedPrice: null,
      formattedKit:   null,
      tier,
      packageType:    'unit',
      isFallback:     true,
      source:         'base',
      variantId:      null,
      variantLabel:   null,
      tax:            null,
    };
  }

  // Resolve price from variant
  const resolverOpts = {
    tier,
    countryCode,
    customerOverride: customerOverride ?? undefined,
    tenant: activeTenant,
    ...(targetCurrency  ? { targetCurrency }  : {}),
    ...(exchangeRates   ? { exchangeRates }    : {}),
    includeTax,
  };

  const resolved     = resolveVariantPrice(variant, resolverOpts);
  const billingUnit  = inferBillingUnit(product, variant);

  // Determine primary packageType
  const hasKit  = resolved.kit != null;
  const hasUnit = resolved.perUnit != null;
  const packageType = (preferKit && hasKit) ? 'kit' : 'unit';
  const primaryAmount = (preferKit && hasKit) ? resolved.kit : (resolved.perUnit ?? resolved.kit);

  return {
    amount:         primaryAmount,
    kitAmount:      resolved.kit,
    currency:       resolved.currency,
    billingUnit,
    formattedPrice: buildFormattedPrice(
      resolved.perUnit, resolved.currency, billingUnit, countryCode, false
    ),
    formattedKit: hasKit
      ? buildFormattedPrice(resolved.kit, resolved.currency, billingUnit, countryCode, true)
      : null,
    tier:         resolved.tier,
    packageType,
    isFallback:   resolved.isFallback,
    source:       resolved.source,
    variantId:    variant.variantId ?? variant.id ?? null,
    variantLabel: variant.label ?? variant.name ?? null,
    tax:          resolved.tax ?? null,
  };
}

/**
 * Resolve + format price for the LOWEST available retail unit price across all variants.
 * Useful for collection pages and cards that must show "starting from" pricing.
 *
 * @param {Object} product
 * @param {Object} [opts]  - Passed through to resolveProductPrice (except variantId/route)
 * @returns {ResolvedProductPrice}
 */
export function resolveLowestProductPrice(product, opts = {}) {
  const activeTenant = opts.tenant || getActiveTenantForResolution();

  // ── Tenant Hiding Rule ──
  if (activeTenant) {
    const productKey = product.slug || product.id || product.name?.toLowerCase().replace(/\s+/g, '-');
    const hasOverride = activeTenant.priceOverrides && (activeTenant.priceOverrides[productKey] !== undefined || activeTenant.priceOverrides[product.name] !== undefined);
    
    if (!hasOverride) {
      return resolveProductPrice(product, { ...opts, tenant: activeTenant });
    }
  }

  const variants = extractVariants(product);
  if (!variants.length) return resolveProductPrice(product, { ...opts, tenant: activeTenant });

  const tier = opts.tier ?? PRICING_TIER.RETAIL;
  let lowestVariant = null;
  let lowestAmount  = Infinity;

  for (const v of variants) {
    const resolved = resolveVariantPrice(v, { tier, ...opts, tenant: activeTenant });
    const amount   = resolved.perUnit ?? resolved.kit;
    if (amount != null && amount < lowestAmount) {
      lowestAmount  = amount;
      lowestVariant = v;
    }
  }

  if (!lowestVariant) return resolveProductPrice(product, { ...opts, tenant: activeTenant });
  return resolveProductPrice(product, { ...opts, tenant: activeTenant, variantId: lowestVariant.variantId ?? lowestVariant.id });
}
