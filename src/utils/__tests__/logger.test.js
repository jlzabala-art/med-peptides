import { describe, it, expect } from 'vitest';
import { logger, sanitizeLogPayload } from '../logger.js';

describe('logger — Structured Telemetry & Sanitization Tests', () => {
  it('correctly redacts sensitive keys such as password, token, and cardnumber', () => {
    const sensitivePayload = {
      user: 'doctor_smith',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.secret',
      password: 'SuperSecretPassword123!',
      nested: {
        cardNumber: '4532-1234-5678-9012',
        cvv: '123',
        safeData: 'Prescription for BPC-157'
      }
    };

    const sanitized = sanitizeLogPayload(sensitivePayload);

    expect(sanitized.user).toBe('doctor_smith');
    expect(sanitized.token).toBe('***REDACTED***');
    expect(sanitized.password).toBe('***REDACTED***');
    expect(sanitized.nested.cardNumber).toBe('***REDACTED***');
    expect(sanitized.nested.cvv).toBe('***REDACTED***');
    expect(sanitized.nested.safeData).toBe('Prescription for BPC-157');
  });

  it('safely handles circular references without throwing or crashing', () => {
    const circularObj = { name: 'circularTest' };
    circularObj.self = circularObj;

    const sanitized = sanitizeLogPayload(circularObj);
    expect(sanitized.name).toBe('circularTest');
    expect(sanitized.self).toBe('[Circular Reference]');
  });

  it('formats audit logs with actor and action semantics', () => {
    // Should not throw error
    expect(() => {
      logger.audit('GENERATE_CATALOG_PDF', { uid: 'usr-123', email: 'admin@atlas.com', role: 'admin' }, 'catalog-regenpept');
    }).not.toThrow();
  });
});
