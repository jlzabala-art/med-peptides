import assert from 'node:assert/strict';
import { getOptimalPresentation, calculateCycleRequirement, IN_USE_STABILITY_DAYS } from '../src/services/protocolStabilityOptimizer.js';
import { canTransitionTo, TRANSACTION_TAXONOMY } from '../src/schemas/transactionalStateMachine.js';

console.log('🧪 Starting Clinical Gantt & Protocol Stability Test Suite...\n');

// --- TEST 1: Optimal Packaging & In-Use Stability Optimizer ---
console.log('▶ Test 1: Sizing Tirzepatide Induction Phase (2.5mg / week for 4 weeks = 10mg total)');
const tirzInduction = getOptimalPresentation({
  weeklyDoseMg: 2.5,
  formatPreference: 'all',
  cycleWeeks: 4
});

console.log('Induction Best Recommendation:');
console.log('- Best Unit:', tirzInduction.bestOption.unitName);
console.log('- Units Needed:', tirzInduction.bestOption.unitsNeeded);
console.log('- Waste (mg):', tirzInduction.bestOption.totalWasteMg);
console.log('- Total Cost ($):', tirzInduction.bestOption.totalCostUSD);
console.log('- Clinical Advice:', tirzInduction.clinicalAdvice);

assert.equal(tirzInduction.totalNeededMg, 10, 'Total needed must be 10mg');
assert.equal(tirzInduction.bestOption.totalWasteMg, 0, 'Waste must be 0 mg');
assert.equal(tirzInduction.bestOption.exceedsStabilityWindow, false, 'Must not exceed 28-day stability window');
console.log('✔ Test 1 Passed: 0 mg waste achieved within 28-day in-use stability window.\n');

// --- TEST 2: Sizing Pen-Specific Preference ---
console.log('▶ Test 2: Sizing Pen-Specific Preference (2.5mg / week for 4 weeks)');
const tirzPenInduction = getOptimalPresentation({
  weeklyDoseMg: 2.5,
  formatPreference: 'pen',
  cycleWeeks: 4
});

console.log('Pen Recommendation:');
console.log('- Best Pen:', tirzPenInduction.bestOption.unitName);
console.log('- Units Needed:', tirzPenInduction.bestOption.unitsNeeded);
console.log('- Total Waste:', tirzPenInduction.bestOption.totalWasteMg, 'mg');

assert.equal(tirzPenInduction.bestOption.format, 'pen_cartridge', 'Format must be pen_cartridge');
assert.equal(tirzPenInduction.bestOption.unitsNeeded, 1, 'Should recommend 1 x 10mg cartridge');
assert.equal(tirzPenInduction.bestOption.totalWasteMg, 0, 'Pen waste must be 0 mg');
console.log('✔ Test 2 Passed: Pen sizing verified.\n');

// --- TEST 3: High Dose Maintenance Phase (15mg / week for 4 weeks = 60mg total) ---
console.log('▶ Test 3: Sizing Maintenance Phase (15mg / week for 4 weeks = 60mg total)');
const tirzMaintenance = getOptimalPresentation({
  weeklyDoseMg: 15,
  formatPreference: 'all',
  cycleWeeks: 4
});

console.log('Maintenance Best Recommendation:');
console.log('- Best Unit:', tirzMaintenance.bestOption.unitName);
console.log('- Units Needed:', tirzMaintenance.bestOption.unitsNeeded);
console.log('- Waste (mg):', tirzMaintenance.bestOption.totalWasteMg);

assert.equal(tirzMaintenance.totalNeededMg, 60, 'Total needed must be 60mg');
assert.equal(tirzMaintenance.bestOption.totalWasteMg, 0, 'Waste must be 0 mg');
console.log('✔ Test 3 Passed: Multi-unit high-dose calculation verified.\n');

// --- TEST 4: Transactional State Machine Guard (Rules #28 & #25) ---
console.log('▶ Test 4: Transactional State Machine Guard');
assert.equal(canTransitionTo('rfq', 'draft', 'pending_supplier'), true, 'rfq: draft -> pending_supplier allowed');
assert.equal(canTransitionTo('rfq', 'draft', 'converted_to_po'), false, 'rfq: draft -> converted_to_po blocked');
assert.equal(canTransitionTo('quotation', 'draft', 'pending_approval'), true, 'quotation: draft -> pending_approval allowed');
assert.equal(canTransitionTo('quotation', 'draft', 'accepted'), false, 'quotation: draft -> accepted blocked');
assert.equal(canTransitionTo('sales_order', 'draft', 'pending'), true, 'sales_order: draft -> pending allowed');
assert.equal(canTransitionTo('sales_order', 'draft', 'delivered'), false, 'sales_order: draft -> delivered blocked');
assert.equal(canTransitionTo('purchase_order', 'draft', 'po_created'), true, 'purchase_order: draft -> po_created allowed');
console.log('✔ Test 4 Passed: Transactional transitions validated strictly.\n');

// --- TEST 5: Cycle Requirement Math ---
console.log('▶ Test 5: Cycle Requirement Math');
const cycle = calculateCycleRequirement(5.0, 4);
assert.equal(cycle.monthlyRequirementMg, 20.0, '5mg * 4 wks = 20mg');
assert.equal(IN_USE_STABILITY_DAYS, 28, 'In-use stability constant must be 28 days');
console.log('✔ Test 5 Passed: Cycle Requirement Math verified.\n');

console.log('🎉 ALL CLINICAL PROTOCOL & GANTT INTEGRATION TESTS PASSED (5/5)!');
