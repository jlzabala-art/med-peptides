/**
 * publicDataSanitizer.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates that sensitive financial costs, margins, and supplier identifiers
 * are strictly purged before public delivery.
 */

import { strict as assert } from 'node:assert';
import { sanitizePublicProduct, SENSITIVE_FINANCIAL_FIELDS } from '../src/repositories/publicDataSanitizer.js';

const mockRawProduct = {
  id: 'tirzepatide',
  name: 'Tirzepatide',
  canonicalName: 'Tirzepatide',
  purity: 99.4,
  category: 'Metabolic',
  description: 'Dual GIP and GLP-1 receptor agonist.',
  supplierCost: 45.00,
  supplierUnitCostUSD: 45.00,
  supplierName: 'Alpha Bio Labs',
  margin: 0.65,
  internalNotes: 'Confidential supplier negotiation notes',
  pricing: {
    wholesalePrice: 120.00,
    markup: 2.5
  }
};

const mockVariants = [
  {
    id: 'tirz-10mg',
    dosage: '10mg',
    format: 'vial',
    cost: 30.00,
    wholesalePrice: 90.00,
    supplierId: 'SUPP-999'
  }
];

const sanitized = sanitizePublicProduct(mockRawProduct, mockVariants);

// 1. Verify sensitive fields stripped from product
SENSITIVE_FINANCIAL_FIELDS.forEach(field => {
  assert.equal(sanitized[field], undefined, `Sensitive field ${field} was not stripped from root product`);
});

// 2. Verify sensitive fields stripped from variants
if (sanitized.variants) {
  sanitized.variants.forEach(variant => {
    SENSITIVE_FINANCIAL_FIELDS.forEach(field => {
      assert.equal(variant[field], undefined, `Sensitive field ${field} was not stripped from variant`);
    });
  });
}

// 3. Verify public clinical fields are preserved
assert.equal(sanitized.id, 'tirzepatide');
assert.equal(sanitized.canonicalName, 'Tirzepatide');
assert.equal(sanitized.purity, 99.4);

console.log('✔ All Zero-Trust Public Data Sanitizer tests passed successfully!');
