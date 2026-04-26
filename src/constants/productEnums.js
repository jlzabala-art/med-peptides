/**
 * productEnums.js
 *
 * Shared constants for the canonical product model.
 * Import from here — never use raw strings in product/variant logic.
 */

// ── Administration Routes ─────────────────────────────────────────────────────

export const ROUTE = Object.freeze({
  SC:   'SC',    // Subcutaneous
  IM:   'IM',    // Intramuscular
  IV:   'IV',    // Intravenous
  IN:   'IN',    // Intranasal spray/drop
  ORAL: 'ORAL',  // Oral (capsule, tablet, liquid)
  SL:   'SL',    // Sublingual
  TOP:  'TOP',   // Topical (cream, gel)
  TD:   'TD',    // Transdermal patch
});

export const ROUTE_LABELS = Object.freeze({
  [ROUTE.SC]:   'Subcutaneous (SC)',
  [ROUTE.IM]:   'Intramuscular (IM)',
  [ROUTE.IV]:   'Intravenous (IV)',
  [ROUTE.IN]:   'Intranasal (IN)',
  [ROUTE.ORAL]: 'Oral',
  [ROUTE.SL]:   'Sublingual (SL)',
  [ROUTE.TOP]:  'Topical',
  [ROUTE.TD]:   'Transdermal (TD)',
});

/** All valid route codes as an array — use for validation */
export const VALID_ROUTES = Object.values(ROUTE);

// ── Pricing Tiers ─────────────────────────────────────────────────────────────

export const PRICING_TIER = Object.freeze({
  MASTER:    'masterPrice',    // Cost to us from supplier (admin only — never expose to client)
  RETAIL:    'retailPrice',    // Public web price (guests / unregistered users)
  CLINIC:    'clinicPrice',    // Price for associated clinics
  WHOLESALE: 'wholesalePrice', // Wholesale price (pro members / resellers)
});

export const PRICING_TIER_LABELS = Object.freeze({
  [PRICING_TIER.MASTER]:    'Master (Supplier Cost)',
  [PRICING_TIER.RETAIL]:    'Retail (Web Public)',
  [PRICING_TIER.CLINIC]:    'Clinic Price',
  [PRICING_TIER.WHOLESALE]: 'Wholesale (Pro / Reseller)',
});

/** All valid tier keys — use for validation */
export const VALID_PRICING_TIERS = Object.values(PRICING_TIER);

// ── Supplier Tiers ────────────────────────────────────────────────────────────

export const SUPPLIER_TIER = Object.freeze({
  PREMIUM:  'premium',
  STANDARD: 'standard',
  ECONOMY:  'economy',
});

// ── Variant Ref Types (in protocols) ─────────────────────────────────────────

export const VARIANT_REF_TYPE = Object.freeze({
  EXACT:    'exact',    // Points to a specific variantId — maximum clinical precision
  RESOLVED: 'resolved', // Engine picks the best available variant by route+dose at runtime
});
