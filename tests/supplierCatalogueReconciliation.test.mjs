import assert from 'node:assert/strict';
import { resolveVariantPrice } from '../src/utils/resolvePrice.js';
import { isVariantMatchingFilter } from '../src/utils/strictFilterEngine.js';

console.log('🧪 Starting Supplier Catalogue & Pricing Tier Reconciler Test Suite...\n');

// ── TEST 1: Independent Explicit Kit Pricing vs Derived Multiplier ────────────
console.log('▶ Test 1: Preserving Explicit Kit Price (Retatrutide 10mg: $90 unit vs $580 kit-of-10)');
const retatrutideVariant = {
  id: 'lotusland-retatrutide-10mg',
  productName: 'Retatrutide',
  dosage: '10 mg / vial',
  supplier: 'LotusLand',
  catalogBrand: 'RegenPept',
  pricing: {
    master: {
      perUnit: 90,
      kit: 580, // Explicit kit price ($580 != 90 * 10 = $900)
      currency: 'USD'
    },
    clinic: {
      perUnit: 139.5,
      kit: 899,
      currency: 'USD'
    }
  }
};

const resolvedMaster = resolveVariantPrice(retatrutideVariant, { tier: 'master' });
assert.equal(resolvedMaster.perUnit, 90, 'Master perUnit must be 90');
assert.equal(resolvedMaster.kit, 580, 'Master kit must be strictly 580 (NOT 900)');

const resolvedClinic = resolveVariantPrice(retatrutideVariant, { tier: 'clinic' });
assert.equal(resolvedClinic.perUnit, 139.5, 'Clinic perUnit must match tier');
assert.equal(resolvedClinic.kit, 899, 'Clinic kit must match explicit tier kit');
console.log('✔ Test 1 Passed: Explicit kit pricing preserved independently across tiers.\n');

// ── TEST 2: Multi-Catalogue Offer Coexistence under same Supplier ──────────────
console.log('▶ Test 2: Multi-Catalogue Offer Coexistence (Lotusland supplier with RegenPept catalogue vs Direct Lotusland API)');
const regenPeptOffer = {
  id: 'lotusland-retatrutide-10mg-regenpept',
  supplier: 'LotusLand',
  catalogBrand: 'RegenPept',
  sourceCatalogue: 'RegenPept',
  pricing: { master: { perUnit: 90, kit: 580 } }
};

const directBulkOffer = {
  id: 'lotusland-retatrutide-bulk-api',
  supplier: 'LotusLand',
  catalogBrand: 'Lotusland Master API',
  sourceCatalogue: 'Lotusland Master API',
  pricing: { master: { perUnit: 80, kit: null } }
};

const matchesRegenFilter1 = isVariantMatchingFilter(regenPeptOffer, {}, { supplierFilter: 'lotusland', catalogueFilter: 'RegenPept' });
const matchesRegenFilter2 = isVariantMatchingFilter(directBulkOffer, {}, { supplierFilter: 'lotusland', catalogueFilter: 'RegenPept' });

assert.equal(matchesRegenFilter1, true, 'RegenPept offer must pass RegenPept filter');
assert.equal(matchesRegenFilter2, false, 'Direct Bulk offer must NOT pass RegenPept filter');
console.log('✔ Test 2 Passed: Catalogue-specific filtering prevents offer cross-contamination.\n');

// ── TEST 3: Dynamic Kit Price Fallback when Kit Price is genuinely missing ───
console.log('▶ Test 3: Fallback calculation only when no explicit kit price exists');
const customItemWithoutKit = {
  id: 'custom-pep',
  pricing: {
    master: { perUnit: 20, kit: null, currency: 'USD' }
  }
};
const resolvedFallback = resolveVariantPrice(customItemWithoutKit, { tier: 'master' });
assert.equal(resolvedFallback.perUnit, 20);
assert.equal(resolvedFallback.kit, 200, 'When kit is null, fallback is 20 * 10 = 200');
console.log('✔ Test 3 Passed: Dynamic fallback works safely when explicit kit price is absent.\n');

// ── TEST 4: Packaging Types (Syringes, Bac Water, Bundles) ────────────────────
console.log('▶ Test 4: Accessory & Package Types Normalization');
const bacWaterBottle = {
  id: 'lotusland-bac-water-30ml',
  productName: 'Bacteriostatic Water',
  presentation: 'bottle',
  supplier: 'LotusLand',
  catalogBrand: 'RegenPept',
  pricing: { master: { perUnit: 20, kit: 20, currency: 'USD' } }
};
const resolvedBacWater = resolveVariantPrice(bacWaterBottle, { tier: 'master' });
assert.equal(resolvedBacWater.perUnit, 20);
assert.equal(resolvedBacWater.kit, 20);
console.log('✔ Test 4 Passed: Bottle / accessory pricing preserved without forced vial multipliers.\n');

console.log('🎉 ALL SUPPLIER CATALOGUE & TIER PRICING TESTS PASSED (4/4)!');
