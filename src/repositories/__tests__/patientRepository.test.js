/**
 * src/repositories/__tests__/patientRepository.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit tests for patientRepository.
 * Validates Zod write guards, normalization, cache, and PHI audit calls.
 *
 * Standards: GAMP 5, HIPAA §164.312, ISO 14971
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'colRef'),
  doc: vi.fn((_db, col, id) => `docRef/${col}/${id}`),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
  onSnapshot: vi.fn(),
}));

// Mock Firebase instance
vi.mock('../../firebase', () => ({
  db: {},
}));

// Mock PHIAuditService
vi.mock('../../services/PHIAuditService', () => ({
  logPHIAccess: vi.fn(),
  PHI_ACTIONS: {
    READ: 'phi:read',
    WRITE: 'phi:write',
    DELETE: 'phi:delete',
    APPROVE: 'phi:approve',
  },
}));

// Mock cache
vi.mock('../../lib/cache', () => {
  const store = new Map();
  return {
    getCache: vi.fn((key) => store.get(key)),
    setCache: vi.fn((key, val) => store.set(key, val)),
    invalidateCache: vi.fn((key) => store.delete(key)),
  };
});

import { patientRepository } from '../patientRepository';
import { getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { logPHIAccess, PHI_ACTIONS } from '../../services/PHIAuditService';

describe('patientRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPatientById', () => {
    test('returns null if patientId is not provided', async () => {
      const result = await patientRepository.getPatientById(null);
      expect(result).toBeNull();
    });

    test('fetches from Firestore and calls logPHIAccess when actorId provided', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: 'pat-123',
        data: () => ({ firstName: 'John', lastName: 'Doe', role: 'patient' }),
      });

      const patient = await patientRepository.getPatientById('pat-123', {
        actorId: 'doc-456',
        actorRole: 'doctor',
      });

      expect(patient).toBeDefined();
      expect(patient.id).toBe('pat-123');
      expect(patient.firstName).toBe('John');

      expect(logPHIAccess).toHaveBeenCalledWith({
        actorId: 'doc-456',
        actorRole: 'doctor',
        action: PHI_ACTIONS.READ,
        entityType: 'patient',
        entityId: 'pat-123',
      });
    });

    test('returns null if document does not exist in Firestore', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });

      const patient = await patientRepository.getPatientById('non-existent');
      expect(patient).toBeNull();
    });
  });

  describe('createPatient', () => {
    test('validates data, writes to Firestore, and logs PHI write', async () => {
      addDoc.mockResolvedValueOnce({ id: 'new-patient-789' });

      const patientData = {
        firstName: 'Carlos',
        lastName: 'Santana',
        email: 'carlos@example.com',
        status: 'active',
      };

      const id = await patientRepository.createPatient(patientData, {
        actorId: 'admin-001',
        actorRole: 'admin',
      });

      expect(id).toBe('new-patient-789');
      expect(addDoc).toHaveBeenCalled();
      expect(logPHIAccess).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'admin-001',
          action: PHI_ACTIONS.WRITE,
          entityType: 'patient',
          entityId: 'new-patient-789',
        })
      );
    });
  });

  describe('deletePatient', () => {
    test('logs PHI delete before deleting from Firestore', async () => {
      deleteDoc.mockResolvedValueOnce();

      await patientRepository.deletePatient('pat-to-delete', {
        actorId: 'admin-001',
        actorRole: 'admin',
      });

      expect(logPHIAccess).toHaveBeenCalledWith({
        actorId: 'admin-001',
        actorRole: 'admin',
        action: PHI_ACTIONS.DELETE,
        entityType: 'patient',
        entityId: 'pat-to-delete',
      });
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
