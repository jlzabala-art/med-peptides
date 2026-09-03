/**
 * roleQueryScope.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates automated role-scoped query constraints for multi-tenant safety.
 */

import { strict as assert } from 'node:assert';
import { getRoleQueryConstraints } from '../src/utils/roleQueryScope.js';

const mockAdmin = { uid: 'ADM-001', role: 'admin' };
const mockDoctor = { uid: 'DOC-123', role: 'doctor' };
const mockPatient = { uid: 'PAT-456', role: 'patient' };
const mockSupplier = { uid: 'SUP-789', role: 'supplier' };

// 1. Admin gets no restrictive constraints (Global View)
const adminConstraints = getRoleQueryConstraints('patients', mockAdmin, 'admin');
assert.equal(adminConstraints.length, 0);

// 2. Doctor gets doctorId scoping
const docConstraints = getRoleQueryConstraints('patients', mockDoctor, 'doctor');
assert.equal(docConstraints.length, 1);

// 3. Patient gets patientId scoping
const patConstraints = getRoleQueryConstraints('orders', mockPatient, 'patient');
assert.equal(patConstraints.length, 1);

// 4. Supplier gets supplierId scoping on RFQs
const supConstraints = getRoleQueryConstraints('rfqs', mockSupplier, 'supplier');
assert.equal(supConstraints.length, 1);

console.log('✔ All Automated Role Query Scoping Tests Passed Successfully!');
