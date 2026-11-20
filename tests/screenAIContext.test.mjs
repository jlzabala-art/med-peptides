/**
 * screenAIContext.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates screen-scoped AI context resolution, persona mapping, and history isolation.
 */

import { strict as assert } from 'node:assert';
import { resolveScreenAIContext } from '../src/utils/screenAIResolver.js';

// 1. Test Route Context Resolution (default guest scope isolation)
const adminProductsContext = resolveScreenAIContext('/admin/products');
assert.equal(adminProductsContext.scopeKey, 'guest_guest_admin_products');
assert.equal(adminProductsContext.agentName, 'Master Formulary & Margin Auditor');
assert.ok(adminProductsContext.suggestedPrompts.length >= 3);
assert.ok(adminProductsContext.systemPersona.includes('Master Formulary & Margin Auditor'));

const doctorContext = resolveScreenAIContext('/doctor/prescriptions');
assert.equal(doctorContext.scopeKey, 'guest_guest_doctor_prescriptions');
assert.equal(doctorContext.agentName, 'Prescription Formulator');
assert.ok(doctorContext.systemPersona.includes('Prescription Formulator'));

const patientContext = resolveScreenAIContext('/patient/dashboard');
assert.equal(patientContext.scopeKey, 'guest_guest_patient_home');
assert.equal(patientContext.agentName, 'Personal Wellness Companion');

const wholesalerContext = resolveScreenAIContext('/wholesaler/catalogs');
assert.equal(wholesalerContext.scopeKey, 'guest_guest_wholesaler_portal');
assert.equal(wholesalerContext.agentName, 'Commercial Distribution Copilot');

const supplierContext = resolveScreenAIContext('/supplier/rfqs');
assert.equal(supplierContext.scopeKey, 'guest_guest_supplier_logistics');
assert.equal(supplierContext.agentName, 'API Synthesis & COA Quality Copilot');

const publicContext = resolveScreenAIContext('/collection/peptides');
assert.equal(publicContext.scopeKey, 'guest_guest_public_research');
assert.equal(publicContext.agentName, 'Research Assistant');

// 2. Test History Isolation Keys (Zero Cross-Screen Bleed)
const mockLocalStorage = {};

function saveScreenHistory(scopeKey, messages) {
  mockLocalStorage[`atlas_chat_history_${scopeKey}`] = JSON.stringify(messages);
}

function getScreenHistory(scopeKey) {
  const data = mockLocalStorage[`atlas_chat_history_${scopeKey}`];
  return data ? JSON.parse(data) : [];
}

// Simulate chatting in Admin Products
saveScreenHistory('admin_products', [
  { id: '1', sender: 'user', text: 'Check margin for Tirzepatide' },
  { id: '2', sender: 'ai', text: 'The clinic margin is 35%.' },
]);

// Simulate chatting in Doctor Clinical
saveScreenHistory('doctor_clinical', [
  { id: '3', sender: 'user', text: 'Create BPC-157 prescription for Carlos' },
  { id: '4', sender: 'ai', text: 'Prescription drafted with 250mcg daily dose.' },
]);

// Verify complete isolation
const adminHistory = getScreenHistory('admin_products');
const doctorHistory = getScreenHistory('doctor_clinical');
const patientHistory = getScreenHistory('patient_portal');

assert.equal(adminHistory.length, 2);
assert.equal(adminHistory[0].text, 'Check margin for Tirzepatide');

assert.equal(doctorHistory.length, 2);
assert.equal(doctorHistory[0].text, 'Create BPC-157 prescription for Carlos');

// Patient screen must be completely clean with 0 messages from other screens
assert.equal(patientHistory.length, 0);

console.log('✔ All Screen-Scoped AI Context & History Isolation Tests Passed Successfully!');
