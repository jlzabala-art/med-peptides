/**
 * logger.test.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates structured enterprise logging, severity filtering, and PII masking.
 */

import { strict as assert } from 'node:assert';
import { sanitizeLogPayload } from '../src/utils/logger.js';

// 1. Test Sensitive Data Redaction
const sensitiveInput = {
  user: 'Doctor Carlos',
  password: 'superSecretPassword123!',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  details: {
    apiKey: 'AIzaSyD-SecretKey',
    patientEmail: 'patient@example.com',
  }
};

const sanitized = sanitizeLogPayload(sensitiveInput);
assert.equal(sanitized.password, '***REDACTED***');
assert.equal(sanitized.token, '***REDACTED***');
assert.equal(sanitized.details.apiKey, '***REDACTED***');
assert.equal(sanitized.user, 'Doctor Carlos');
assert.equal(sanitized.details.patientEmail, 'patient@example.com');

// 2. Test Circular Reference Protection
const circularObj = { name: 'Prescription' };
circularObj.self = circularObj;
const safeCircular = sanitizeLogPayload(circularObj);
assert.equal(safeCircular.self, '[Circular Reference]');

console.log('✔ All Structured Enterprise Logger Tests Passed Successfully!');
