import { resolveVariantPrice } from './resolvePrice';
import wholesaleData from '@/data/wholesale_parsed.json';

/**
 * Normalizes string for fuzzy compound matching
 */
function cleanKey(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts numeric value from dose/strength string (e.g. '10 mg' -> 10)
 */
function extractMg(str) {
  if (!str) return null;
  const match = String(str).match(/(\d+(?:\.\d+)?)\s*(?:mg|mcg|iu|g|ml)/i);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Looks up bulk kit / tier 10 pricing in wholesale_parsed.json by compound name and strength
 */
function findWholesaleKitData(item) {
  if (!wholesaleData || typeof wholesaleData !== 'object') return null;

  const itemName = item.canonicalName || item.displayName || item.name || '';
  const itemDose = item.dosage || item.size || item.presentation || '';
  const cleanItem = cleanKey(itemName);
  const targetMg = extractMg(itemDose) || extractMg(itemName);

  for (const [key, variants] of Object.entries(wholesaleData)) {
    const cleanK = cleanKey(key);
    // Check if name contains or matches
    const nameMatches = cleanItem.includes(cleanK) || cleanK.includes(cleanItem) ||
      (cleanItem.includes('tb500') && cleanK.includes('tb500')) ||
      (cleanItem.includes('thymosin') && cleanK.includes('thymosin'));

    if (nameMatches && Array.isArray(variants)) {
      if (targetMg != null) {
        const exactVar = variants.find((v) => {
          const varMg = extractMg(v.strength);
          return varMg != null && Math.abs(varMg - targetMg) < 0.01;
        });
        if (exactVar && exactVar.kit_price > 0 && exactVar.unit_price > 0) {
          return exactVar;
        }
      }
      // If only 1 variant or first match
      if (variants[0]?.kit_price > 0 && variants[0]?.unit_price > 0) {
        return variants[0];
      }
    }
  }

  return null;
}

/**
 * Resolves standard single-unit base price for an item
 */
export function resolveStandardUnitPrice(it, { isAdmin = false, isDoctor = false, isWholesaler = false, isPatient = false } = {}) {
  if (!it) return 0;
  if (it.customPrice != null) return Number(it.customPrice);

  if (isDoctor) {
    const resolved = resolveVariantPrice(it, { tier: 'clinic' });
    const amount = resolved?.perUnit ?? Number(it.priceClinic || it.unitPrice || it.price || it.unitRate || 0);
    return isNaN(amount) ? 0 : amount;
  }

  if (isWholesaler) {
    const resolved = resolveVariantPrice(it, { tier: 'wholesale' });
    const amount = resolved?.perUnit ?? Number(it.wholesalePrice || it.unitPrice || it.price || it.unitRate || 0);
    return isNaN(amount) ? 0 : amount;
  }

  if (isPatient) {
    const resolved = resolveVariantPrice(it, { tier: 'retail' });
    const amount = resolved?.perUnit ?? Number(it.retailPrice || it.unitPrice || it.price || it.unitRate || 0);
    return isNaN(amount) ? 0 : amount;
  }

  // Admin / default fallback
  const p = Number(it.unitPrice || it.price || it.unitRate || 0);
  return isNaN(p) ? 0 : p;
}

/**
 * Centralized Tier 10 Pricing Resolver
 * 
 * Inspects:
 * 1. item.cost_tiers?.cost_10
 * 2. item.cost_10
 * 3. item.price_per_kit_10
 * 4. item.kit_price / item.kitPrice / item.perKitPriceUSD / item.kitPriceUSD
 * 5. resolveVariantPrice(item, { tier })?.kit
 * 6. item.pricing?.[tier]?.kit
 * 7. wholesale_parsed.json compound lookup
 * 
 * @returns {{
 *   hasTier10: boolean,
 *   isTier10Applied: boolean,
 *   standardUnitPrice: number,
 *   tier10UnitPrice: number,
 *   effectiveUnitPrice: number,
 *   lineTotal: number,
 *   savingsPercent: number,
 *   savingsPerUnit: number,
 *   qtyNeededForTier10: number,
 *   tierSource: string
 * }}
 */
export function resolveItemTierPricing(item, options = {}) {
  const {
    isAdmin = false,
    isDoctor = false,
    isWholesaler = false,
    isPatient = false,
    activeWs = null,
  } = options;

  const standardUnitPrice = resolveStandardUnitPrice(item, { isAdmin, isDoctor, isWholesaler, isPatient });
  const qty = Math.max(1, parseInt(item?.quantity, 10) || 1);

  let hasTier10 = false;
  let tier10UnitPrice = standardUnitPrice;
  let tierSource = 'none';

  const roleTier = isDoctor ? 'clinic' : isWholesaler ? 'wholesale' : isPatient ? 'retail' : 'clinic';

  // Effective markup applied
  const effectiveMarkup = activeWs?.appliedMarkupPercent ?? item?.appliedMarkup ?? activeWs?.targetEntity?.priceMarkupPercent ?? null;
  const markupMultiplier = (effectiveMarkup != null && !isNaN(effectiveMarkup))
    ? 1 + (Number(effectiveMarkup) / 100)
    : 1;

  // ── Primary: Canonical Homogeneous Tier 10 (Zero Mapping) ──
  const canonicalTier10 = item?.tier_10?.unit_price ?? item?.tier_10_price ?? null;
  if (canonicalTier10 != null && Number(canonicalTier10) > 0) {
    const raw10 = Number(canonicalTier10);
    const baseCost10 = raw10 > (item.supplierCost || standardUnitPrice) * 1.5 ? raw10 / 10 : raw10;
    const computedPrice = (item.supplierCost > 0 && effectiveMarkup != null)
      ? Number((baseCost10 * markupMultiplier).toFixed(2))
      : Number(baseCost10.toFixed(2));
    if (computedPrice < standardUnitPrice) {
      hasTier10 = true;
      tier10UnitPrice = computedPrice;
      tierSource = 'tier_10';
    }
  }

  // Fallback: Legacy shapes if item has not been through normalizeVariant yet
  if (!hasTier10 && item?.cost_tiers?.cost_10 != null && Number(item.cost_tiers.cost_10) > 0) {
    const raw10 = Number(item.cost_tiers.cost_10);
    const baseCost10 = raw10 > (item.supplierCost || standardUnitPrice) * 1.5 ? raw10 / 10 : raw10;
    const computedPrice = Number((baseCost10 * markupMultiplier).toFixed(2));
    if (computedPrice < standardUnitPrice) {
      hasTier10 = true;
      tier10UnitPrice = computedPrice;
      tierSource = 'cost_tiers.cost_10';
    }
  }

  // Source 2: item.cost_10
  if (!hasTier10 && item?.cost_10 != null && Number(item.cost_10) > 0) {
    const raw10 = Number(item.cost_10);
    const baseCost10 = raw10 > (item.supplierCost || standardUnitPrice) * 1.5 ? raw10 / 10 : raw10;
    const computedPrice = Number((baseCost10 * markupMultiplier).toFixed(2));
    if (computedPrice < standardUnitPrice) {
      hasTier10 = true;
      tier10UnitPrice = computedPrice;
      tierSource = 'cost_10';
    }
  }

  // Source 3: item.price_per_kit_10
  if (!hasTier10 && item?.price_per_kit_10 != null && Number(item.price_per_kit_10) > 0) {
    const kit = Number(item.price_per_kit_10);
    const unit10 = kit > standardUnitPrice * 1.5 ? kit / 10 : kit;
    if (unit10 < standardUnitPrice) {
      hasTier10 = true;
      tier10UnitPrice = Number(unit10.toFixed(2));
      tierSource = 'price_per_kit_10';
    }
  }

  // Source 4: item.pricing?.[roleTier]?.kit or resolveVariantPrice kit
  if (!hasTier10) {
    const resolvedPrice = resolveVariantPrice(item, { tier: roleTier });
    const kitPrice = resolvedPrice?.kit || item?.pricing?.[roleTier]?.kit || item?.pricing?.wholesale?.kit;
    if (kitPrice != null && Number(kitPrice) > 0) {
      const unit10 = Number(kitPrice) / 10;
      if (unit10 < standardUnitPrice) {
        hasTier10 = true;
        tier10UnitPrice = Number(unit10.toFixed(2));
        tierSource = 'pricing_kit';
      }
    }
  }

  // Source 5: item.kit_price / kitPrice
  if (!hasTier10 && (item?.kit_price != null || item?.kitPrice != null)) {
    const kit = Number(item.kit_price ?? item.kitPrice);
    if (kit > 0) {
      const unit10 = kit / 10;
      const finalUnit10 = (item.supplierCost > 0 && effectiveMarkup != null)
        ? Number((unit10 * markupMultiplier).toFixed(2))
        : Number(unit10.toFixed(2));

      if (finalUnit10 < standardUnitPrice) {
        hasTier10 = true;
        tier10UnitPrice = finalUnit10;
        tierSource = 'kit_price';
      }
    }
  }

  // Source 6: Look up compound in verified wholesale index (Retatrutide, Tirzepatide, TB-500, etc.)
  if (!hasTier10) {
    const wsMatch = findWholesaleKitData(item);
    if (wsMatch && wsMatch.unit_price > 0 && wsMatch.kit_price > 0) {
      const kitDiscountRatio = wsMatch.kit_price / (10 * wsMatch.unit_price);
      if (kitDiscountRatio < 0.98) {
        const computedTier10 = Number((standardUnitPrice * kitDiscountRatio).toFixed(2));
        if (computedTier10 < standardUnitPrice) {
          hasTier10 = true;
          tier10UnitPrice = computedTier10;
          tierSource = 'catalog_volume_tier';
        }
      }
    }
  }

  // Condition: Tier 10 is applied when quantity >= 10 and hasTier10
  const isTier10Applied = hasTier10 && qty >= 10;
  const effectiveUnitPrice = isTier10Applied ? tier10UnitPrice : standardUnitPrice;
  const lineTotal = Number((qty * effectiveUnitPrice).toFixed(2));

  const savingsPerUnit = hasTier10 ? Math.max(0, standardUnitPrice - tier10UnitPrice) : 0;
  const savingsPercent = (hasTier10 && standardUnitPrice > 0)
    ? Math.round(((standardUnitPrice - tier10UnitPrice) / standardUnitPrice) * 100)
    : 0;
  const qtyNeededForTier10 = Math.max(0, 10 - qty);

  return {
    hasTier10,
    isTier10Applied,
    standardUnitPrice,
    tier10UnitPrice,
    effectiveUnitPrice,
    lineTotal,
    savingsPercent,
    savingsPerUnit: Number(savingsPerUnit.toFixed(2)),
    qtyNeededForTier10,
    tierSource,
  };
}
