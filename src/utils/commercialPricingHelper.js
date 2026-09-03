/**
 * commercialPricingHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional-grade helper for resolving commercial channel pricing (Cost,
 * Wholesale, Clinic, Retail) and computing real-time gross margins & profit deltas.
 */

export const COMMERCIAL_CHANNELS = [
  { id: 'cost', label: 'Cost (Master)', shortLabel: 'Cost', icon: '📦', color: '#475569', badgeBg: '#f1f5f9', badgeBorder: '#cbd5e1' },
  { id: 'wholesale', label: 'Wholesale (B2B)', shortLabel: 'Wholesale', icon: '🏢', color: '#2563eb', badgeBg: '#eff6ff', badgeBorder: '#bfdbfe' },
  { id: 'clinic', label: 'Clinic (Doctors)', shortLabel: 'Clinic', icon: '🏥', color: '#059669', badgeBg: '#ecfdf5', badgeBorder: '#a7f3d0' },
  { id: 'retail', label: 'Retail (Public)', shortLabel: 'Retail', icon: '🛍️', color: '#7c3aed', badgeBg: '#f5f3ff', badgeBorder: '#ddd6fe' },
  { id: 'all', label: 'All Channels (Waterfall)', shortLabel: 'All Channels', icon: '📊', color: '#003666', badgeBg: '#f8fafc', badgeBorder: '#cbd5e1' }
];

// Default category markup multipliers when a variant doesn't have an explicit channel override
export const DEFAULT_TIER_MULTIPLIERS = {
  wholesale: 1.25, // +25% on cost (~20.0% margin)
  clinic: 1.50,    // +50% on cost (~33.3% margin)
  retail: 2.00     // +100% on cost (~50.0% margin)
};

/**
 * Resolves the raw USD price for a specific commercial channel and volume tier.
 *
 * @param {Object} variant - Variant document from Firestore
 * @param {string} channel - 'cost' | 'wholesale' | 'clinic' | 'retail'
 * @param {string} priceView - 'unit' | 'kit' | 'tier_50' | 'tier_100'
 * @returns {{ price: number|null, isAuto: boolean, isDerived: boolean, multiplier?: number, rawCost: number|null }}
 */
export function resolveChannelPrice(variant, channel = 'cost', priceView = 'unit') {
  if (!variant) return { price: null, isAuto: false, isDerived: false, rawCost: null };

  // 1. Resolve Master Supplier Cost
  let rawCost = null;
  const suppPricing = variant.supplierPricing || {};
  const pricingObj = variant.pricing || {};

  if (priceView === 'kit') {
    rawCost = variant.cost_10 ?? 
      variant.cost_tiers?.cost_10 ?? 
      pricingObj.master?.kit ?? 
      pricingObj.cost_tiers?.cost_10 ?? 
      variant.kitCost ?? 
      variant.perKitPriceUSD ?? 
      (suppPricing.netCost ? Number(suppPricing.netCost) * (variant.moq || 5) : null) ?? 
      null;
  } else if (priceView === 'tier_50') {
    rawCost = variant.cost_50 ?? 
      variant.cost_tiers?.cost_50 ?? 
      pricingObj.cost_tiers?.cost_50 ?? 
      (variant.cost_10 ? Number((variant.cost_10 * 0.95).toFixed(2)) : null);
  } else if (priceView === 'tier_100') {
    rawCost = variant.cost_100 ?? 
      variant.cost_tiers?.cost_100 ?? 
      pricingObj.cost_tiers?.cost_100 ?? 
      (variant.cost_10 ? Number((variant.cost_10 * 0.90).toFixed(2)) : null);
  } else {
    // Default Unit / Base Gram
    rawCost = variant.unit_price ?? 
      variant.cost_tiers?.cost_1 ?? 
      variant.cost_1 ?? 
      pricingObj.master?.perUnit ?? 
      pricingObj.masterPrice?.base ?? 
      pricingObj.supplierCost ?? 
      suppPricing.netCost ?? 
      variant.supplierCost ?? 
      variant.supplierUnitCostUSD ?? 
      variant.priceUSD ?? 
      variant.price ?? 
      variant.perVialPriceUSD ?? 
      null;
  }

  if (channel === 'cost') {
    return {
      price: rawCost != null && !isNaN(rawCost) ? Number(rawCost) : null,
      isAuto: false,
      isDerived: false,
      rawCost: rawCost != null && !isNaN(rawCost) ? Number(rawCost) : null
    };
  }

  // 2. Check Explicit Channel Override in variant.pricing or top-level fields
  let explicitPrice = null;
  const pricing = variant.pricing || {};

  if (channel === 'wholesale') {
    if (priceView === 'kit') {
      explicitPrice = pricing.wholesale?.kit ?? variant.wholesale_price_10 ?? null;
    } else if (priceView === 'tier_50') {
      explicitPrice = pricing.wholesale?.tier_50 ?? null;
    } else if (priceView === 'tier_100') {
      explicitPrice = pricing.wholesale?.tier_100 ?? null;
    } else {
      explicitPrice = pricing.wholesale?.perUnit ?? pricing.wholesale?.base ?? variant.wholesale_price ?? (typeof pricing.wholesale === 'number' ? pricing.wholesale : null);
    }
  } else if (channel === 'clinic') {
    if (priceView === 'kit') {
      explicitPrice = pricing.clinic?.kit ?? variant.clinic_price_10 ?? null;
    } else if (priceView === 'tier_50') {
      explicitPrice = pricing.clinic?.tier_50 ?? null;
    } else if (priceView === 'tier_100') {
      explicitPrice = pricing.clinic?.tier_100 ?? null;
    } else {
      explicitPrice = pricing.clinic?.perUnit ?? pricing.clinic?.base ?? variant.clinic_price ?? (typeof pricing.clinic === 'number' ? pricing.clinic : null);
    }
  } else if (channel === 'retail') {
    if (priceView === 'kit') {
      explicitPrice = pricing.retail?.kit ?? variant.retail_price_10 ?? null;
    } else if (priceView === 'tier_50') {
      explicitPrice = pricing.retail?.tier_50 ?? null;
    } else if (priceView === 'tier_100') {
      explicitPrice = pricing.retail?.tier_100 ?? null;
    } else {
      explicitPrice = pricing.retail?.perUnit ?? pricing.retail?.base ?? variant.retail_price ?? variant.price ?? (typeof pricing.retail === 'number' ? pricing.retail : null);
    }
  }

  if (explicitPrice != null && !isNaN(explicitPrice) && Number(explicitPrice) > 0) {
    return {
      price: Number(explicitPrice),
      isAuto: false,
      isDerived: false,
      rawCost: rawCost != null && !isNaN(rawCost) ? Number(rawCost) : null
    };
  }

  // 3. Fallback: Auto-calculate using standard tier multiplier over cost
  if (rawCost != null && !isNaN(rawCost) && rawCost > 0) {
    const mult = DEFAULT_TIER_MULTIPLIERS[channel] || 1.0;
    const autoPrice = Number((rawCost * mult).toFixed(2));
    return {
      price: autoPrice,
      isAuto: true,
      isDerived: true,
      multiplier: mult,
      rawCost: Number(rawCost)
    };
  }

  return { price: null, isAuto: false, isDerived: false, rawCost: null };
}

/**
 * Calculates gross margin %, markup %, and monetary profit delta.
 *
 * @param {number|null} costPrice
 * @param {number|null} sellPrice
 * @returns {{ marginPct: number|null, markupPct: number|null, profitDelta: number|null, isPositive: boolean }}
 */
export function calculateMarginMetrics(costPrice, sellPrice) {
  if (costPrice == null || sellPrice == null || isNaN(costPrice) || isNaN(sellPrice) || sellPrice <= 0 || costPrice <= 0) {
    return { marginPct: null, markupPct: null, profitDelta: null, isPositive: true };
  }

  const profitDelta = sellPrice - costPrice;
  const marginPct = (profitDelta / sellPrice) * 100;
  const markupPct = (profitDelta / costPrice) * 100;

  return {
    marginPct: Number(marginPct.toFixed(1)),
    markupPct: Number(markupPct.toFixed(1)),
    profitDelta: Number(profitDelta.toFixed(2)),
    isPositive: profitDelta >= 0
  };
}
