/**
 * repositories/patientRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Patient Data Access Layer — Atlas Health Platform
 *
 * Implements:
 *   - Zod runtime validation & patientWriteGuard normalization
 *   - PHI Audit Trail logging (HIPAA §164.312, GDPR Art. 30, NOM-024)
 *   - Resilience with exponential backoff retry (withRetry)
 *   - Multilevel cache (Memory / RAM + Invalidation)
 *
 * Standards: ISO 14971, FDA 21 CFR Part 11, HIPAA §164.312.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { validatePatientWrite } from './patientWriteGuard';
import { getCache, setCache, invalidateCache } from '../lib/cache';
import { logPHIAccess, PHI_ACTIONS } from '../services/PHIAuditService';
import { withRetry } from './_resilience';
import { logger } from '../utils/logger';

const USERS_COLLECTION = 'users';

export const patientRepository = {
  /**
   * Retrieves a single patient by ID with cache and PHI audit logging.
   * @param {string} patientId
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<object|null>}
   */
  async getPatientById(patientId, { actorId = null, actorRole = 'admin' } = {}) {
    if (!patientId) return null;
    const cacheKey = `patients/${patientId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      if (actorId) {
        logPHIAccess({
          actorId,
          actorRole,
          action: PHI_ACTIONS.READ,
          entityType: 'patient',
          entityId: patientId,
          metadata: { source: 'cache' },
        });
      }
      return cached;
    }

    const docSnap = await withRetry(
      () => getDoc(doc(db, USERS_COLLECTION, patientId)),
      { entityName: 'patientRepository.getPatientById' }
    );

    if (!docSnap.exists()) return null;
    const data = { id: docSnap.id, ...docSnap.data() };
    setCache(cacheKey, data);

    if (actorId) {
      logPHIAccess({
        actorId,
        actorRole,
        action: PHI_ACTIONS.READ,
        entityType: 'patient',
        entityId: patientId,
      });
    }

    return data;
  },

  /**
   * Invalidates cache for a specific patient.
   * @param {string} patientId
   */
  invalidatePatientCache(patientId) {
    if (!patientId) return;
    invalidateCache(`patients/${patientId}`);
    invalidateCache('users/list');
  },

  /**
   * Creates a new patient record with write guard validation and PHI logging.
   * @param {object} patientData
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<string>} Created document ID
   */
  async createPatient(patientData, { actorId = null, actorRole = 'admin' } = {}) {
    const cleanData = validatePatientWrite(patientData, { isUpdate: false });

    const ref = await withRetry(
      () => addDoc(collection(db, USERS_COLLECTION), {
        ...cleanData,
        role: 'patient',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { entityName: 'patientRepository.createPatient' }
    );

    this.invalidatePatientCache(ref.id);

    if (actorId) {
      logPHIAccess({
        actorId,
        actorRole,
        action: PHI_ACTIONS.WRITE,
        entityType: 'patient',
        entityId: ref.id,
        metadata: { operation: 'create' },
      });
    }

    return ref.id;
  },

  /**
   * Updates an existing patient document with write guard validation and PHI logging.
   * @param {string} patientId
   * @param {object} updates
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<void>}
   */
  async updatePatient(patientId, updates, { actorId = null, actorRole = 'admin' } = {}) {
    if (!patientId) throw new Error('patientRepository.updatePatient: patientId is required');

    const cleanData = validatePatientWrite(updates, { isUpdate: true });

    await withRetry(
      () => updateDoc(doc(db, USERS_COLLECTION, patientId), {
        ...cleanData,
        updatedAt: serverTimestamp(),
      }),
      { entityName: 'patientRepository.updatePatient' }
    );

    this.invalidatePatientCache(patientId);

    if (actorId) {
      logPHIAccess({
        actorId,
        actorRole,
        action: PHI_ACTIONS.WRITE,
        entityType: 'patient',
        entityId: patientId,
        metadata: { operation: 'update', fieldsModified: Object.keys(cleanData) },
      });
    }
  },

  /**
   * Deletes a patient record with PHI audit trail before removal.
   * @param {string} patientId
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<void>}
   */
  async deletePatient(patientId, { actorId = null, actorRole = 'admin' } = {}) {
    if (!patientId) return;

    if (actorId) {
      logPHIAccess({
        actorId,
        actorRole,
        action: PHI_ACTIONS.DELETE,
        entityType: 'patient',
        entityId: patientId,
      });
    }

    await withRetry(
      () => deleteDoc(doc(db, USERS_COLLECTION, patientId)),
      { entityName: 'patientRepository.deletePatient' }
    );

    this.invalidatePatientCache(patientId);
  },

  /**
   * Adds a new biomarker entry for a patient.
   * @param {string} patientId
   * @param {object} biomarkerData
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<string>} Entry ID
   */
  async addBiomarkerEntry(patientId, biomarkerData, { actorId = null, actorRole = 'doctor' } = {}) {
    if (!patientId) throw new Error('patientId is required for addBiomarkerEntry');

    const subColRef = collection(db, USERS_COLLECTION, patientId, 'biomarkers');
    const ref = await withRetry(
      () => addDoc(subColRef, {
        ...biomarkerData,
        createdAt: serverTimestamp(),
        recordedAt: biomarkerData.recordedAt || serverTimestamp(),
      }),
      { entityName: 'patientRepository.addBiomarkerEntry' }
    );

    if (actorId) {
      logPHIAccess({
        actorId,
        actorRole,
        action: PHI_ACTIONS.WRITE,
        entityType: 'biomarker',
        entityId: ref.id,
        metadata: { patientId, metric: biomarkerData.name || biomarkerData.key },
      });
    }

    return ref.id;
  },

  /**
   * Subscribes to real-time biomarker readings for a patient.
   * @param {string} patientId
   * @param {function} onData
   * @param {number} [maxLimit=50]
   * @returns {function} Unsubscribe function
   */
  subscribeToPatientBiomarkers(patientId, onData, maxLimit = 50) {
    if (!patientId) return () => {};
    const q = query(
      collection(db, USERS_COLLECTION, patientId, 'biomarkers'),
      orderBy('recordedAt', 'desc'),
      limit(maxLimit)
    );
    return onSnapshot(q, (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      logger.error('[patientRepository] subscribeToPatientBiomarkers error', { patientId, error: err.message });
    });
  },
  /**
   * Retrieves a paginated list of patients with filtering.
   * @param {object} [opts]
   */
  async getPatientsPage({ filters = {}, pageSize = 50, pageParam = null, orderByDesc = true } = {}) {
    const constraints = [
      where('role', '==', 'patient'),
      orderBy('createdAt', orderByDesc ? 'desc' : 'asc'),
      limit(pageSize),
    ];

    if (filters.status) {
      constraints.unshift(where('status', '==', filters.status));
    }
    if (pageParam) {
      constraints.push(startAfter(pageParam));
    }

    const q = query(collection(db, USERS_COLLECTION), ...constraints);
    const snap = await withRetry(
      () => getDocs(q),
      { entityName: 'patientRepository.getPatientsPage' }
    );

    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

    return {
      data,
      lastDoc,
      hasMore: snap.docs.length === pageSize,
      total: data.length,
    };
  },
};

export const PatientRepository = patientRepository;
export const getPatientById = patientRepository.getPatientById.bind(patientRepository);
export const getPatientsPage = patientRepository.getPatientsPage.bind(patientRepository);
export const createPatient = patientRepository.createPatient.bind(patientRepository);
export const updatePatient = patientRepository.updatePatient.bind(patientRepository);
export const deletePatient = patientRepository.deletePatient.bind(patientRepository);
export const addBiomarkerEntry = patientRepository.addBiomarkerEntry.bind(patientRepository);
export const subscribeToPatientBiomarkers = patientRepository.subscribeToPatientBiomarkers.bind(patientRepository);
export const invalidatePatientCache = patientRepository.invalidatePatientCache.bind(patientRepository);

export default patientRepository;

