/**
 * apiValidator.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates request payload schema validation, type checks, and bounds.
 */

import { strict as assert } from 'node:assert';
import { validatePayload } from '../src/utils/apiValidator.js';

const sampleSchema = {
  productId: { type: 'string', required: true, minLength: 3 },
  quantity: { type: 'number', required: true, min: 1 },
  tier: { type: 'string', enum: ['standard', 'vip', 'wholesale'] },
  items: { type: 'array' },
};

// 1. Valid Payload
const validRes = validatePayload({
  productId: 'PROD-101',
  quantity: 5,
  tier: 'wholesale',
  items: ['A', 'B'],
}, sampleSchema);
assert.equal(validRes.valid, true);

// 2. Missing Required Field
const missingRes = validatePayload({
  quantity: 5,
}, sampleSchema);
assert.equal(missingRes.valid, false);
assert.ok(missingRes.errors.some(e => e.field === 'productId'));

// 3. Invalid Enum Value
const invalidEnum = validatePayload({
  productId: 'PROD-101',
  quantity: 1,
  tier: 'unauthorized_tier',
}, sampleSchema);
assert.equal(invalidEnum.valid, false);
assert.ok(invalidEnum.errors.some(e => e.field === 'tier'));

// 4. Invalid Type
const invalidType = validatePayload({
  productId: 'PROD-101',
  quantity: 'FIVE',
}, sampleSchema);
assert.equal(invalidType.valid, false);
assert.ok(invalidType.errors.some(e => e.field === 'quantity'));

console.log('✔ All Lightweight API Request Validator Tests Passed Successfully!');
