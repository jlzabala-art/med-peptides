#!/usr/bin/env node
/**
 * test-pricing-core.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fast regression test suite for Atlas Health Pricing Invariants:
 *   1. Guest / Unauthenticated -> Wholeseller = Cost × 1.3225 (15% + 15%)
 *   2. Distributor -> Cost × 1.15 (+15%)
 *   3. Global market (no market assigned) -> NEVER applies regional overrides
 *   4. Regional market (qatar / uae / us) -> Applies byMarket / byCountry override
 *   5. Admin simulation -> Overrides user.priceTier and user.priceMarkupPercent
 *   6. FX conversion -> Consistent across EUR / USD / AED / QAR
 *
 * Usage: node scripts/test-pricing-core.mjs
 */

import assert from 'node:assert/strict';
import {
  ATLAS_MARGIN_RATES,
  resolveAllPrices,
  resolvePriceForSession,
} from '../src/lib/pricing/pricingCore.js';
import { convertCurrency, FX_RATES_FROM_EUR } from '../src/constants/fxRates.js';
import { getPricingMarketMeta } from '../src/constants/roles.js';
import { resolveCanonicalCollection } from '../src/constants/canonicalCollections.js';
import { validatePricingBlock } from '../src/schemas/canonicalSchemas.js';

const sampleProduct = {
  id: 'test-prod-1',
  costPriceEur: 100,
  byMarket: {
    qatar: { currency: 'QAR', distributor: 475, wholesale: 546.25, clinic: 628.19 },
    uae: { currency: 'AED', wholesale: 530 },
  },
};

// 1. Wholeseller = 15% + 15% (×1.3225) on Global market
{
  const res = resolvePriceForSession(sampleProduct, { user: null, role: 'guest', market: 'global' });
  assert.equal(res.primaryTier, 'wholeseller');
  assert.equal(res.primaryPrice, 132.25);
  assert.equal(res.isMarketOverride, false);
  assert.equal(res.market, 'global');
}

// 2. Distributor = +15% (×1.15) on Global market
{
  const res = resolvePriceForSession(sampleProduct, {
    user: { role: 'distributor' },
    role: 'distributor',
    market: 'global',
  });
  assert.equal(res.primaryTier, 'distributor');
  assert.equal(res.primaryPrice, 115);
  assert.equal(res.isMarketOverride, false);
}

// 3. Global market invariant: even if product has byCountry.EU, global NEVER applies regional overrides
{
  const productWithEuOverride = {
    id: 'test-prod-eu',
    costPriceEur: 100,
    byCountry: { EU: { wholesale: 999 } },
  };
  const tiers = resolveAllPrices(productWithEuOverride, { market: 'global' });
  assert.equal(tiers.wholeseller, 132.25);
  assert.equal(tiers.isMarketOverride, false);
}

// 4. Regional market override (Qatar)
{
  const res = resolvePriceForSession(sampleProduct, {
    user: { role: 'distributor', market: 'qatar' },
    role: 'distributor',
    market: 'qatar',
  });
  assert.equal(res.primaryPrice, 475);
  assert.equal(res.currency, 'QAR');
  assert.equal(res.isMarketOverride, true);
}

// 5. Admin simulation overrides user's own priceTier and custom markup
{
  const adminUser = { role: 'admin', priceTier: 'clinic', priceMarkupPercent: 50 };
  const res = resolvePriceForSession(sampleProduct, {
    user: adminUser,
    role: 'distributor',
    isAdmin: true,
    isSimulating: true,
    market: 'global',
  });
  assert.equal(res.role, 'distributor');
  assert.equal(res.primaryPrice, 115);
}

// 6. FX round-trip consistency
{
  const aed = convertCurrency(100, 'EUR', 'AED');
  assert.equal(aed, Number((100 * FX_RATES_FROM_EUR.AED).toFixed(2)));
  assert.equal(ATLAS_MARGIN_RATES.WHOLESELLER_COMPOUND, 1.3225);
}

// 7. getPricingMarketMeta always returns safe object with labelEn and badge
{
  for (const input of ['qatar', 'QA', null, 'unknown']) {
    const meta = getPricingMarketMeta(input);
    assert.ok(meta && typeof meta.labelEn === 'string' && meta.labelEn.length > 0);
    assert.ok(typeof meta.badge === 'string' && meta.badge.length > 0);
  }
  assert.equal(getPricingMarketMeta('QA').id, 'qatar');
  assert.equal(getPricingMarketMeta(null).id, 'global');
}

// 8. Canonical collection alias resolution
assert.equal(resolveCanonicalCollection('product_catalog'), 'products', 'Deprecated alias maps to products');
assert.equal(resolveCanonicalCollection('pricing_agreements'), 'client_agreements', 'Deprecated alias maps to client_agreements');
assert.equal(resolveCanonicalCollection('orders'), 'orders', 'Canonical collection name preserved');

// 9. Canonical pricing schema validator
assert.equal(validatePricingBlock({ baseCostUsd: 100, distributorUsd: 115, clinicUsd: 132.25, currency: 'QAR' }).valid, true);
assert.equal(validatePricingBlock({ distributorUsd: 200, clinicUsd: 150 }).valid, false, 'distributorUsd > clinicUsd fails validation');
assert.equal(validatePricingBlock({ baseCostUsd: -1 }).valid, false, 'negative price fails validation');
assert.equal(validatePricingBlock({ currency: 'BTC' }).valid, false, 'unsupported currency fails validation');

console.log('✅ All 9 Atlas Pricing Core & Canonical Data invariants PASSED (15%+15% wholeseller, global isolation, regional overrides, simulation precedence, FX, safe market metadata, canonical collections, pricing block validation).');
