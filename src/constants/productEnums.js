 
/**
 * productEnums.js
 *
 * Shared constants for the canonical product model.
 * Import from here — never use raw strings in product/variant logic.
 *
 * PRICING_TIER values match the SHORT Firestore document keys
 * (e.g. variant.pricing.retail, NOT variant.pricing.retailPrice).
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
// Values are the SHORT Firestore canonical keys (variant.pricing.retail, etc.)

export const PRICING_TIER = Object.freeze({
  MASTER:    'master',    // Cost to us from supplier (admin only — never expose to client)
  RETAIL:    'retail',    // Public web price (guests / unregistered users)
  CLINIC:    'clinic',    // Price for associated clinics
  WHOLESALE: 'wholesale', // Wholesale price (pro members / resellers)
});

export const PRICING_TIER_LABELS = Object.freeze({
  [PRICING_TIER.MASTER]:    'Master (Supplier Cost)',
  [PRICING_TIER.RETAIL]:    'Retail (Web Public)',
  [PRICING_TIER.CLINIC]:    'Clinic Price',
  [PRICING_TIER.WHOLESALE]: 'Wholesale (Pro / Reseller)',
});

/** All valid tier keys — use for validation */
export const VALID_PRICING_TIERS = Object.values(PRICING_TIER);

// ── Billing Units ─────────────────────────────────────────────────────────────
// Describes what a single "unit" in pricing.{tier}.unit represents.

export const BILLING_UNIT = Object.freeze({
  VIAL:         'vial',         // Injectable peptide vial
  BOTTLE:       'bottle',       // Supplement bottle / capsule pack
  CAPSULE_PACK: 'capsule_pack', // Loose capsule pack
  KIT:          'kit',          // Multi-product kit
  PROTOCOL:     'protocol',     // Full protocol pricing
  TEST:         'test',         // Genetic / lab test
  BOX:          'box',          // Packaged box
  DEVICE:       'device',       // Medical device
  AMPOULE:      'ampoule',      // Single-use ampoule
  PATCH:        'patch',        // Transdermal patch
});

export const BILLING_UNIT_LABELS = Object.freeze({
  [BILLING_UNIT.VIAL]:         'Vial',
  [BILLING_UNIT.BOTTLE]:       'Bottle',
  [BILLING_UNIT.CAPSULE_PACK]: 'Capsule Pack',
  [BILLING_UNIT.KIT]:          'Kit',
  [BILLING_UNIT.PROTOCOL]:     'Protocol',
  [BILLING_UNIT.TEST]:         'Test',
  [BILLING_UNIT.BOX]:          'Box',
  [BILLING_UNIT.DEVICE]:       'Device',
  [BILLING_UNIT.AMPOULE]:      'Ampoule',
  [BILLING_UNIT.PATCH]:        'Patch',
});

// ── Product Types ─────────────────────────────────────────────────────────────

export const PRODUCT_TYPE = Object.freeze({
  PEPTIDE:              'peptide',
  SUPPLEMENT:           'supplement',
  GENETIC_TEST:         'genetic_test',
  PROTOCOL:             'protocol',
  PROFESSIONAL_MATERIAL:'professional_material',
  HORMONE:              'hormone',
  SMALL_MOLECULE:       'small_molecule',
  INJECTABLE_NUTRIENT:  'injectable_nutrient',
  IV_PROTOCOL:          'iv_protocol',
  TOPICAL_COSMETIC:     'topical_cosmetic',
});

export const VALID_PRODUCT_TYPES = Object.values(PRODUCT_TYPE);

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
