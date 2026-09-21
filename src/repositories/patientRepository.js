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
  setDoc,
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

const PATIENTS_COLLECTION = 'patients';
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

    let docSnap = await withRetry(
      () => getDoc(doc(db, PATIENTS_COLLECTION, patientId)),
      { entityName: 'patientRepository.getPatientById:patients' }
    );

    // Backward-compatibility fallback to users collection
    if (!docSnap || (typeof docSnap.exists === 'function' && !docSnap.exists())) {
      const fallbackSnap = await withRetry(
        () => getDoc(doc(db, USERS_COLLECTION, patientId)),
        { entityName: 'patientRepository.getPatientById:users' }
      );
      if (fallbackSnap && typeof fallbackSnap.exists === 'function' && fallbackSnap.exists()) {
        docSnap = fallbackSnap;
      }
    }

    if (!docSnap || (typeof docSnap.exists === 'function' && !docSnap.exists())) return null;
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
    invalidateCache('patients/list');
  },

  /**
   * Creates a new patient record with write guard validation and PHI logging.
   * Target is canonical 'patients' collection.
   * @param {object} patientData
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<string>} Created document ID
   */
  async createPatient(patientData, { actorId = null, actorRole = 'admin' } = {}) {
    const cleanData = validatePatientWrite(patientData, { isUpdate: false });

    const ref = await withRetry(
      () => addDoc(collection(db, PATIENTS_COLLECTION), {
        ...cleanData,
        role: 'patient',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      { entityName: 'patientRepository.createPatient' }
    );

    this.invalidatePatientCache(ref.id);

    // Sync projection to customers collection (SSOT)
    try {
      await setDoc(doc(db, 'customers', ref.id), {
        id: ref.id,
        customerType: 'patient',
        name: cleanData.name || `${cleanData.firstName || ''} ${cleanData.lastName || ''}`.trim() || 'Patient',
        firstName: cleanData.firstName || '',
        lastName: cleanData.lastName || '',
        email: cleanData.email || '',
        phone: cleanData.phone || '',
        country: cleanData.country || '',
        city: cleanData.city || '',
        pricingTier: cleanData.pricingTier || 'retail',
        discountMargin: typeof cleanData.discountMargin === 'number' ? cleanData.discountMargin : 0,
        currency: cleanData.currency || 'USD',
        paymentTerms: cleanData.paymentTerms || 'Due on Receipt',
        creditLimit: typeof cleanData.creditLimit === 'number' ? cleanData.creditLimit : 5000,
        status: cleanData.status || 'active',
        notes: cleanData.notes || '',
        tags: Array.isArray(cleanData.tags) ? cleanData.tags : [],
        assignedManagerId: cleanData.assignedManagerId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientProfile: {
          dateOfBirth: cleanData.dateOfBirth || null,
          gender: cleanData.gender || null,
          bloodType: cleanData.bloodType || null,
          allergies: Array.isArray(cleanData.allergies) ? cleanData.allergies : [],
          currentConditions: Array.isArray(cleanData.currentConditions) ? cleanData.currentConditions : [],
          assignedDoctorId: cleanData.assignedDoctorId || (Array.isArray(cleanData.doctorIds) && cleanData.doctorIds[0]) || null,
          assignedClinicId: cleanData.assignedClinicId || (Array.isArray(cleanData.clinicIds) && cleanData.clinicIds[0]) || null,
          activeProtocols: Array.isArray(cleanData.activeProtocols) ? cleanData.activeProtocols : [],
          prescriptionsCount: typeof cleanData.prescriptionsCount === 'number' ? cleanData.prescriptionsCount : 0,
          medicalNotes: cleanData.medicalNotes || '',
        }
      }, { merge: true });
    } catch (syncErr) {
      logger.warn('[patientRepository.createPatient] Customer SSOT dual-sync warning:', syncErr);
    }

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
   * Writes to canonical 'patients' collection, falling back to 'users' if exists there.
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

    // Check target collection or write to patients
    try {
      await withRetry(
        () => updateDoc(doc(db, PATIENTS_COLLECTION, patientId), {
          ...cleanData,
          updatedAt: serverTimestamp(),
        }),
        { entityName: 'patientRepository.updatePatient:patients' }
      );
    } catch {
      await withRetry(
        () => updateDoc(doc(db, USERS_COLLECTION, patientId), {
          ...cleanData,
          updatedAt: serverTimestamp(),
        }),
        { entityName: 'patientRepository.updatePatient:users' }
      );
    }

    this.invalidatePatientCache(patientId);

    // Dual-sync to customers collection (SSOT)
    try {
      const customerUpdates = {
        updatedAt: new Date().toISOString(),
      };
      if (cleanData.name !== undefined) customerUpdates.name = cleanData.name;
      if (cleanData.firstName !== undefined) customerUpdates.firstName = cleanData.firstName;
      if (cleanData.lastName !== undefined) customerUpdates.lastName = cleanData.lastName;
      if (cleanData.email !== undefined) customerUpdates.email = cleanData.email;
      if (cleanData.phone !== undefined) customerUpdates.phone = cleanData.phone;
      if (cleanData.country !== undefined) customerUpdates.country = cleanData.country;
      if (cleanData.city !== undefined) customerUpdates.city = cleanData.city;
      if (cleanData.pricingTier !== undefined) customerUpdates.pricingTier = cleanData.pricingTier;
      if (cleanData.discountMargin !== undefined) customerUpdates.discountMargin = cleanData.discountMargin;
      if (cleanData.status !== undefined) customerUpdates.status = cleanData.status;
      if (cleanData.notes !== undefined) customerUpdates.notes = cleanData.notes;

      const profileFields = ['dateOfBirth', 'gender', 'bloodType', 'allergies', 'currentConditions', 'assignedDoctorId', 'assignedClinicId', 'activeProtocols', 'prescriptionsCount', 'medicalNotes'];
      profileFields.forEach(f => {
        if (cleanData[f] !== undefined) {
          customerUpdates[`patientProfile.${f}`] = cleanData[f];
        }
      });

      await setDoc(doc(db, 'customers', patientId), customerUpdates, { merge: true });
    } catch (syncErr) {
      logger.warn('[patientRepository.updatePatient] Customer SSOT dual-sync warning:', syncErr);
    }

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

    try {
      await withRetry(
        () => deleteDoc(doc(db, PATIENTS_COLLECTION, patientId)),
        { entityName: 'patientRepository.deletePatient:patients' }
      );
    } catch {
      await withRetry(
        () => deleteDoc(doc(db, USERS_COLLECTION, patientId)),
        { entityName: 'patientRepository.deletePatient:users' }
      );
    }

    this.invalidatePatientCache(patientId);

    // Dual-sync archive status to customers collection (SSOT)
    try {
      await updateDoc(doc(db, 'customers', patientId), {
        status: 'archived',
        updatedAt: new Date().toISOString(),
      });
    } catch (syncErr) {
      logger.warn('[patientRepository.deletePatient] Customer SSOT archive sync warning:', syncErr);
    }
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

    const subColRef = collection(db, PATIENTS_COLLECTION, patientId, 'biomarkers');
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
      collection(db, PATIENTS_COLLECTION, patientId, 'biomarkers'),
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
   * Builds a Firestore query for patients matching filters, order and pagination.
   */
  buildQuery(filters = {}, pageSize = 50, pageParam = null, orderByDesc = true) {
    const constraints = [
      orderBy('createdAt', orderByDesc ? 'desc' : 'asc'),
      limit(pageSize),
    ];

    if (filters.status) {
      constraints.unshift(where('status', '==', filters.status));
    }
    if (pageParam) {
      constraints.push(startAfter(pageParam));
    }

    return query(collection(db, PATIENTS_COLLECTION), ...constraints);
  },

  /**
   * Retrieves a paginated list of patients with filtering.
   * @param {object} [opts]
   */
  async getPatientsPage({ filters = {}, pageSize = 50, pageParam = null, orderByDesc = true } = {}) {
    const q = this.buildQuery(filters, pageSize, pageParam, orderByDesc);
    const snap = await withRetry(
      () => getDocs(q),
      { entityName: 'patientRepository.getPatientsPage' }
    );

    let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // If 'patients' collection is currently empty during transition, check users fallback
    if (data.length === 0 && !pageParam) {
      const fallbackConstraints = [
        where('role', '==', 'patient'),
        orderBy('createdAt', orderByDesc ? 'desc' : 'asc'),
        limit(pageSize),
      ];
      if (filters.status) fallbackConstraints.unshift(where('status', '==', filters.status));
      try {
        const fallbackQ = query(collection(db, USERS_COLLECTION), ...fallbackConstraints);
        const fallbackSnap = await getDocs(fallbackQ);
        if (fallbackSnap && fallbackSnap.docs.length > 0) {
          data = fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        logger.warn('[patientRepository] Fallback users query note:', e.message);
      }
    }

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

