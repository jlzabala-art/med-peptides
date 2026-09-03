/**
 * __tests__/ElectronicSignatureService.test.js
 * Unit tests for the Electronic Signature Service (Pilar 2 — Fase 3)
 * FDA 21 CFR Part 11 — Non-repudiation & tamper detection
 */
import { describe, it, expect, vi } from 'vitest';
import {
  signRecord,
  verifyRecord,
  signPrescription,
  signProtocol,
} from '../ElectronicSignatureService';

// Mock logger to suppress output in tests
vi.mock('../../utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

const ACTOR_ID = 'doctor-uid-abc123';

const samplePrescription = {
  id: 'rx-001',
  patientId: 'patient-001',
  doctorId: ACTOR_ID,
  items: [{ productId: 'sku-001', productName: 'CJC-1295', dose: 2, unit: 'mg' }],
  instructions: 'Apply SQ every 3 days',
  posology: 'BID',
  status: 'approved',
  totalAmount: 120,
};

const sampleProtocol = {
  id: 'proto-001',
  title: 'Anti-Aging Protocol v2',
  phases: [{ name: 'Phase 1', duration: '4 weeks' }],
  targetCondition: 'Age-related GH deficiency',
  duration: '12 weeks',
  status: 'active',
};

describe('ElectronicSignatureService', () => {
  describe('signRecord()', () => {
    it('returns a SignatureMetadata object with required fields', async () => {
      const meta = await signRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        actorId: ACTOR_ID,
        contentFields: { status: 'approved', amount: 100 },
      });

      expect(meta).toHaveProperty('signedBy', ACTOR_ID);
      expect(meta).toHaveProperty('signedAt');
      expect(meta).toHaveProperty('hash');
      expect(meta).toHaveProperty('algorithm', 'SHA-256');
      expect(meta).toHaveProperty('version', '1.0');
    });

    it('produces a 64-character hex SHA-256 hash', async () => {
      const meta = await signRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        actorId: ACTOR_ID,
        contentFields: { value: 42 },
      });
      expect(meta.hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces different hashes for different content', async () => {
      const meta1 = await signRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        actorId: ACTOR_ID,
        contentFields: { status: 'approved' },
      });
      const meta2 = await signRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        actorId: ACTOR_ID,
        contentFields: { status: 'cancelled' },
      });
      expect(meta1.hash).not.toBe(meta2.hash);
    });

    it('produces different hashes for different actors', async () => {
      const shared = { entityType: 'prescription', entityId: 'rx-001', contentFields: { v: 1 } };
      const meta1 = await signRecord({ ...shared, actorId: 'doctor-a' });
      const meta2 = await signRecord({ ...shared, actorId: 'doctor-b' });
      expect(meta1.hash).not.toBe(meta2.hash);
    });

    it('returns a frozen (immutable) metadata object', async () => {
      const meta = await signRecord({
        entityType: 'test',
        entityId: 'e-001',
        actorId: ACTOR_ID,
        contentFields: {},
      });
      expect(Object.isFrozen(meta)).toBe(true);
    });
  });

  describe('verifyRecord()', () => {
    it('returns valid=true for an untampered record', async () => {
      const contentFields = { status: 'approved', amount: 100 };
      const meta = await signRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        actorId: ACTOR_ID,
        contentFields,
      });

      const result = await verifyRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        contentFields,
        signatureMetadata: meta,
      });

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns valid=false if content has been tampered with', async () => {
      const contentFields = { status: 'approved', amount: 100 };
      const meta = await signRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        actorId: ACTOR_ID,
        contentFields,
      });

      const tamperedContent = { status: 'approved', amount: 999 }; // amount changed!

      const result = await verifyRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        contentFields: tamperedContent,
        signatureMetadata: meta,
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('tamper');
    });

    it('returns valid=false when signatureMetadata is missing', async () => {
      const result = await verifyRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        contentFields: { v: 1 },
        signatureMetadata: null,
      });
      expect(result.valid).toBe(false);
    });

    it('returns valid=false when hash field is missing', async () => {
      const result = await verifyRecord({
        entityType: 'prescription',
        entityId: 'rx-001',
        contentFields: { v: 1 },
        signatureMetadata: { signedBy: ACTOR_ID, signedAt: new Date().toISOString() },
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('signPrescription()', () => {
    it('signs a prescription and returns metadata with correct entityType reference', async () => {
      const meta = await signPrescription(samplePrescription, ACTOR_ID);
      expect(meta.signedBy).toBe(ACTOR_ID);
      expect(meta.hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces a different hash if prescription items change', async () => {
      const meta1 = await signPrescription(samplePrescription, ACTOR_ID);
      const modified = {
        ...samplePrescription,
        items: [{ ...samplePrescription.items[0], dose: 5 }],
      };
      const meta2 = await signPrescription(modified, ACTOR_ID);
      expect(meta1.hash).not.toBe(meta2.hash);
    });
  });

  describe('signProtocol()', () => {
    it('signs a protocol and returns valid metadata', async () => {
      const meta = await signProtocol(sampleProtocol, ACTOR_ID);
      expect(meta.signedBy).toBe(ACTOR_ID);
      expect(meta.algorithm).toBe('SHA-256');
      expect(meta.hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('produces different hashes for different protocol titles', async () => {
      const meta1 = await signProtocol(sampleProtocol, ACTOR_ID);
      const meta2 = await signProtocol({ ...sampleProtocol, title: 'Modified Protocol' }, ACTOR_ID);
      expect(meta1.hash).not.toBe(meta2.hash);
    });
  });
});
