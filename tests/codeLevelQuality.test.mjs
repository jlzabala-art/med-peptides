/**
 * codeLevelQuality.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for clinical formatters and cache sentinel logic.
 */

import { strict as assert } from 'node:assert';
import { formatDosage, formatMolecularWeight, formatPurity } from '../src/utils/clinicalFormatters.js';
import { cacheSentinel } from '../src/utils/cacheSentinel.js';

// 1. Formatters
assert.equal(formatDosage(2500, 'mcg', 'auto'), '2.5 mg');
assert.equal(formatDosage(250, 'mcg', 'auto'), '250 mcg');
assert.equal(formatMolecularWeight(4113.6), '4113.60 g/mol');
assert.equal(formatPurity(99.42), '99.42%');

// 2. Cache Sentinel
cacheSentinel.set('test_peptide', { id: 'tirz', name: 'Tirzepatide' }, 5000);
const cached = cacheSentinel.get('test_peptide');
assert.equal(cached?.name, 'Tirzepatide');

console.log('✔ All Code-Level Quality & Formatter Tests Passed Successfully!');
