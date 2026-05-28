// src/skills/pricing_engine.js
/**
 * Pricing Engine – multi‑tier, bundle & protocol pricing utilities.
 * All functions are pure and receive normalized data from product_system
 * and protocol_engine.
 */

// ----- Helpers -----
export const normalizeCurrency = (amount, fromCurrency, rates) => {
  const rate = rates[fromCurrency] ?? 1;
  return amount * rate;
};

export const normalizeUnit = (amount, unit, targetUnit) => {
  // Simple conversion for mg <-> g
  if (unit === targetUnit) return amount;
  if (unit === 'mg' && targetUnit === 'g') return amount / 1000;
  if (unit === 'g' && targetUnit === 'mg') return amount * 1000;
  throw new Error(`Unsupported unit conversion ${unit} → ${targetUnit}`);
};

// ----- Core pricing functions -----
export const calcProductPrice = (product, tier, pricingRules, rates) => {
  const base = pricingRules[product.type]?.base ?? 0;
  const tierMultiplier = pricingRules.tiers?.[tier] ?? 1;
  const raw = base * product.basePriceFactor;
  const converted = normalizeCurrency(raw, pricingRules.currency, rates);
  return converted * tierMultiplier;
};

export const applyTierModifiers = (price, modifiers) => {
  let final = price;
  if (modifiers.discount) final *= 1 - modifiers.discount;
  if (modifiers.surcharge) final *= 1 + modifiers.surcharge;
  return final;
};

export const bundlePricing = (bundle, tier, pricingRules, rates) => {
  const bundleBase = bundle.products.reduce((sum, p) => {
    return sum + calcProductPrice(p, tier, pricingRules, rates);
  }, 0);
  const discount = bundle.discount ?? 0;
  return applyTierModifiers(bundleBase, { discount });
};

export const protocolCost = (protocol, tier, pricingRules, rates) => {
  const phaseCost = protocol.phases.reduce((sum, ph) => {
    const phCost = ph.products.reduce((pSum, p) => {
      return pSum + calcProductPrice(p, tier, pricingRules, rates);
    }, 0);
    return sum + phCost;
  }, 0);
  // optional protocol‑level discount
  const discount = protocol.discount ?? 0;
  return applyTierModifiers(phaseCost, { discount });
};

// Export a unified interface
export default {
  normalizeCurrency,
  normalizeUnit,
  calcProductPrice,
  applyTierModifiers,
  bundlePricing,
  protocolCost,
};
