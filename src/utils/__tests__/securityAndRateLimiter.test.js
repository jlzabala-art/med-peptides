import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../rateLimiter';
import { validatePayload, sanitizeText } from '../apiValidator';

describe('API Security & Rate Limiter Suite', () => {
  describe('Rate Limiter', () => {
    it('allows requests within rate limits and decrements remaining', () => {
      const mockReq = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.100',
        }),
      };

      const res1 = checkRateLimit(mockReq, { limit: 5, windowMs: 10000, tier: 'test-tier' });
      expect(res1.allowed).toBe(true);
      expect(res1.remaining).toBe(4);

      const res2 = checkRateLimit(mockReq, { limit: 5, windowMs: 10000, tier: 'test-tier' });
      expect(res2.allowed).toBe(true);
      expect(res2.remaining).toBe(3);
    });

    it('blocks requests once limit is exceeded', () => {
      const mockReq = {
        headers: new Headers({
          'x-forwarded-for': '192.168.1.200',
        }),
      };

      for (let i = 0; i < 3; i++) {
        checkRateLimit(mockReq, { limit: 3, windowMs: 10000, tier: 'test-block' });
      }

      const blockedRes = checkRateLimit(mockReq, { limit: 3, windowMs: 10000, tier: 'test-block' });
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.retryAfter).toBeGreaterThan(0);
    });

    it('isolates rate limits by client IP', () => {
      const reqA = { headers: new Headers({ 'x-forwarded-for': '10.0.0.1' }) };
      const reqB = { headers: new Headers({ 'x-forwarded-for': '10.0.0.2' }) };

      checkRateLimit(reqA, { limit: 2, windowMs: 10000, tier: 'test-isolate' });
      checkRateLimit(reqA, { limit: 2, windowMs: 10000, tier: 'test-isolate' });
      const blockedA = checkRateLimit(reqA, { limit: 2, windowMs: 10000, tier: 'test-isolate' });
      expect(blockedA.allowed).toBe(false);

      const allowedB = checkRateLimit(reqB, { limit: 2, windowMs: 10000, tier: 'test-isolate' });
      expect(allowedB.allowed).toBe(true);
    });
  });

  describe('Payload Validator & Sanitizer', () => {
    it('validates required fields, minLength, and maxLength', () => {
      const schema = {
        message: { type: 'string', required: true, minLength: 3, maxLength: 50 },
        amount: { type: 'number', required: false, min: 1, max: 100 },
      };

      // Valid
      const validRes = validatePayload({ message: 'Hello clinical', amount: 50 }, schema);
      expect(validRes.valid).toBe(true);

      // Too short
      const shortRes = validatePayload({ message: 'Hi' }, schema);
      expect(shortRes.valid).toBe(false);
      expect(shortRes.errors[0].field).toBe('message');

      // Too long
      const longRes = validatePayload({ message: 'a'.repeat(60) }, schema);
      expect(longRes.valid).toBe(false);

      // Exceeds max number
      const numRes = validatePayload({ message: 'Valid', amount: 150 }, schema);
      expect(numRes.valid).toBe(false);
      expect(numRes.errors[0].field).toBe('amount');
    });

    it('sanitizes malicious script tags and null bytes', () => {
      const dirty = 'Hello\0 World <script>alert("hack")</script> Test';
      const clean = sanitizeText(dirty, 100);
      expect(clean).not.toContain('\0');
      expect(clean).not.toContain('<script>');
      expect(clean).toBe('Hello World  Test');
    });

    it('enforces maximum character length during sanitization', () => {
      const longText = 'x'.repeat(500);
      const truncated = sanitizeText(longText, 50);
      expect(truncated.length).toBe(50);
    });
  });
});
