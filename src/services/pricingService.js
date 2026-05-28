 
/**
 * pricingService.js
 *
 * Resolves product prices based on the user's role-determined pricing tier.
 * Firebase Firestore is the single source of truth.
 *
 * Canonical Firestore schema (variants subcollection):
 *   products/{productId}/variants/{variantId}.pricing.{retail|wholesale|clinic|master}
 *   Canonical tier entry:  { perUnit: number, kit: number, currency: string }
 *   Legacy tier entry:     { base: number, byCountry: { [CC]: { base, currency } } }
 *   resolvePrice.js normalises the legacy schema transparently at runtime.
 *
 * Public API:
 *   resolveVariantPrice(variant, opts)        — resolve a single variant price
 *   resolvePriceForRole(variant, opts)        — role-aware resolve
 *   resolvePriceForRoleDisplay(variant, opts) — resolve + format for UI
 *   getTierForRole(role, isAdmin)             — role string → PRICING_TIER constant
 *
 * @module pricingService
 */

import { PRICING_TIER } from '../constants/productEnums';
import {
  resolveVariantPrice,
  resolveAndFormatPrice,
  formatPrice,
} from '../utils/resolvePrice';

// Re-export core utilities so callers only need one import
export { resolveVariantPrice, resolveAndFormatPrice, formatPrice };

// ── Role → Tier (mirrored from usePricingTier for non-hook contexts) ──────────

/** @type {Record<string, string>} */
const ROLE_TO_TIER = Object.freeze({
  guest:            PRICING_TIER.RETAIL,
  researcher:       PRICING_TIER.RETAIL,
  sales_agent:      PRICING_TIER.RETAIL,
  patient:          PRICING_TIER.RETAIL,
  verified_medical: PRICING_TIER.WHOLESALE,
  professional:     PRICING_TIER.WHOLESALE,
  distributor:      PRICING_TIER.WHOLESALE,
  wholesaler:       PRICING_TIER.WHOLESALE,
  clinic:           PRICING_TIER.CLINIC,
  pharmacy:         PRICING_TIER.CLINIC,
  hospital:         PRICING_TIER.CLINIC,
  doctor:           PRICING_TIER.CLINIC,
  staff:            PRICING_TIER.CLINIC,
  admin:            PRICING_TIER.MASTER,
});

/**
 * Convert a Firestore role string to a PRICING_TIER value.
 * This mirrors the logic in usePricingTier.js for non-React contexts.
 *
 * @param {string|undefined} role      - e.g. 'clinic', 'admin', 'researcher'
 * @param {boolean}          [isAdmin] - shortcut for admin override
 * @returns {string} One of PRICING_TIER values
 */
export function getTierForRole(role, isAdmin = false) {
  if (isAdmin) return PRICING_TIER.MASTER;

  const normalised = (role ?? 'guest').toLowerCase().trim();
  if (ROLE_TO_TIER[normalised]) return ROLE_TO_TIER[normalised];

  // Partial match for composite role strings
  const matchedKey = Object.keys(ROLE_TO_TIER).find((k) => normalised.includes(k));
  return matchedKey ? ROLE_TO_TIER[matchedKey] : PRICING_TIER.RETAIL;
}

/**
 * Resolve the price for a variant given a user role and optional country code.
 *
 * @param {Object}  variant        - Firestore variant document (with .pricing)
 * @param {Object}  [opts]
 * @param {string}  [opts.role]    - User role from Firestore users/{uid}.role
 * @param {boolean} [opts.isAdmin] - Shortcut to get masterPrice
 * @param {string}  [opts.countryCode] - ISO-3166 2-letter code, e.g. 'ES'
 * @param {Object}  [opts.customerOverride] - Custom price for this customer
 * @returns {import('../utils/resolvePrice').ResolvedPrice}
 */
export function resolvePriceForRole(variant, {
  role = 'guest',
  isAdmin = false,
  countryCode = null,
  customerOverride = null,
  tenant = null,
} = {}) {
  const tier = getTierForRole(role, isAdmin);
  return resolveVariantPrice(variant, { tier, countryCode, customerOverride, tenant });
}

/**
 * Resolve + format price for UI display, given user role.
 *
 * @param {Object}  variant
 * @param {Object}  [opts]  - Same as resolvePriceForRole
 * @returns {{ resolved: ResolvedPrice, display: { kit: string|null, perUnit: string|null } }}
 */
export function resolvePriceForRoleDisplay(variant, opts = {}) {
  const tier = getTierForRole(opts.role, opts.isAdmin);
  return resolveAndFormatPrice(variant, {
    tier,
    countryCode: opts.countryCode ?? null,
    customerOverride: opts.customerOverride ?? null,
    tenant: opts.tenant ?? null,
  });
}
