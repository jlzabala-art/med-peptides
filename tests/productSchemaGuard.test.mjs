import assert from 'node:assert/strict';
import { normalizeAndValidateVariant, ApiRawMaterialVariantSchema } from '../src/schemas/productSchema.zod.js';
import { extractProductPresentation } from '../src/utils/productNormalizer.js';

console.log('🧪 Starting Strict API Schema Guard Test Suite...\n');

// --- TEST 1: Healing Raw API with Erroneous "Lyophilized Vial" / "Standard Dose" ---
console.log('▶ Test 1: Ingesting Raw Material with Legacy Finished Product Defaults');
const rawInput = {
  id: 'test-raw-01',
  name: 'Acetyl Glycyl Beta-Alanine',
  type: 'raw_material',
  presentation: 'Lyophilized Vial', // Erroneous legacy input
  dosage: '5g',
  costPrice: 600,
  supplier: 'Lotusland'
};

const result1 = normalizeAndValidateVariant(rawInput);
console.log('Normalized Result:', JSON.stringify(result1.data, null, 2));

assert.equal(result1.success, true, 'Validation must pass');
assert.equal(result1.data.type, 'raw_material', 'Type must be raw_material');
assert.equal(result1.data.quantity, 5, 'Quantity must be 5');
assert.equal(result1.data.unit, 'g', 'Unit must be g');
assert.equal(result1.data.presentation, '5g Bulk API Powder', 'Presentation must be healed to Bulk API Powder');
assert.equal(result1.data.format, 'bulk_api', 'Format must be bulk_api');
assert.equal(result1.data.totalBatchCost, 3000, '5g * $600 = $3000 total batch cost');
console.log('✔ Test 1 Passed: Erroneous Finished Product fields healed to Bulk API.\n');

// --- TEST 2: Product Normalizer extractProductPresentation ---
console.log('▶ Test 2: Product Normalizer extractProductPresentation Precedence');
const pres1 = extractProductPresentation({ type: 'raw_material', name: 'Acetyl Glycyl Beta-Alanine', format: 'powder' });
assert.equal(pres1, 'Bulk API Powder', 'Must return Bulk API Powder for raw material');

const pres2 = extractProductPresentation({ type: 'finished_product', name: 'Tirzepatide 10mg Vial', format: 'vial' });
assert.equal(pres2, 'Vial', 'Must return Vial for finished product');
console.log('✔ Test 2 Passed: Normalizer respects raw_material vs finished_product.\n');

// --- TEST 3: Finished Product Ingestion Unaltered ---
console.log('▶ Test 3: Ingesting Finished Product Presentation');
const finishedInput = {
  id: 'tirz-10mg-pen',
  name: 'Tirzepatide 10mg Prefilled Pen',
  type: 'finished_product',
  dosage: '10mg',
  format: 'pre_filled_pen',
  costPrice: 100,
  supplier: 'Lotusland'
};

const result3 = normalizeAndValidateVariant(finishedInput);
assert.equal(result3.variantType, 'finished_product', 'Must identify as finished_product');
assert.equal(result3.data.dosage, '10mg', 'Dosage preserved');
assert.equal(result3.data.format, 'pre_filled_pen', 'Format preserved');
console.log('✔ Test 3 Passed: Finished product schema preserved.\n');

console.log('🎉 ALL STRICT SCHEMA GUARD TESTS PASSED (3/3)!');
