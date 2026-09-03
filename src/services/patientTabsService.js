/**
 * patientTabsService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Firestore service for Patient Panel tabs.
 * Covers: Orders, Recommendations, Supervisor (Doctor-Patient relationships),
 *         Quotations, Calendar prescriptions, and Prescription Panel realtime.
 *
 * Golden Rule #2: Firestore is the single source of truth.
 * Components MUST NOT import firebase/firestore directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fb from '../firebase';
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import logger from '../utils/logger';

const db = fb?.db;

// ── Orders ──────────────────────────────────────────────────────────────────

/**
 * Fetches orders for a specific patient.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const fetchPatientOrders = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('uid', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[patientTabsService] fetchPatientOrders failed', { userId, error: err.message });
    throw err;
  }
};

// ── Recommendations ─────────────────────────────────────────────────────────

/**
 * Fetches recommendations (prescriptions) for a patient.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const fetchPatientRecommendations = async (userId) => {
  try {
    const q = query(
      collection(db, 'recommendations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[patientTabsService] fetchPatientRecommendations failed', { userId, error: err.message });
    throw err;
  }
};

/**
 * Updates the status of a recommendation.
 * @param {string} recId
 * @param {string} status
 * @returns {Promise<{recId, status}>}
 */
export const updateRecommendationStatus = async (recId, status) => {
  try {
    const recRef = doc(db, 'recommendations', recId);
    await updateDoc(recRef, { status, updatedAt: new Date().toISOString() });
    logger.info('[patientTabsService] Recommendation status updated', { recId, status });
    return { recId, status };
  } catch (err) {
    logger.error('[patientTabsService] updateRecommendationStatus failed', { recId, error: err.message });
    throw err;
  }
};

// ── Supervisor / Doctor-Patient Relationships ───────────────────────────────

/**
 * Fetches all doctor-patient relationships for a patient.
 * @param {string} patientId
 * @returns {Promise<Array>}
 */
export const fetchDoctorPatientRelationships = async (patientId) => {
  try {
    const q = query(collection(db, 'doctor_patient_relationships'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[patientTabsService] fetchDoctorPatientRelationships failed', { patientId, error: err.message });
    throw err;
  }
};

/**
 * Fetches all available doctors.
 * @returns {Promise<Array>}
 */
export const fetchAvailableDoctors = async () => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'doctor'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[patientTabsService] fetchAvailableDoctors failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches a user profile by ID.
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export const fetchUserProfile = async (userId) => {
  try {
    const q = query(collection(db, 'users'), where('__name__', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.length ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
  } catch (err) {
    logger.error('[patientTabsService] fetchUserProfile failed', { userId, error: err.message });
    throw err;
  }
};

/**
 * Creates a doctor-patient relationship request.
 * @param {object} data - { patientId, doctorId, doctorName, notes }
 * @returns {Promise<string>}
 */
export const requestSupervisor = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'doctor_patient_relationships'), {
      ...data,
      status: 'pending',
      initiatedBy: 'patient',
      createdAt: serverTimestamp()
    });
    logger.info('[patientTabsService] Supervisor request sent', { patientId: data.patientId, doctorId: data.doctorId });
    return docRef.id;
  } catch (err) {
    logger.error('[patientTabsService] requestSupervisor failed', { error: err.message });
    throw err;
  }
};

/**
 * Accepts a doctor-patient relationship invitation.
 * @param {string} relId
 * @param {string} doctorId
 * @param {string} patientId
 * @returns {Promise<void>}
 */
export const acceptRelationship = async (relId, doctorId, patientId) => {
  try {
    await updateDoc(doc(db, 'doctor_patient_relationships', relId), {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'users', patientId), {
      assignedPhysicianIds: [doctorId]
    });
    logger.info('[patientTabsService] Relationship accepted', { relId, doctorId, patientId });
  } catch (err) {
    logger.error('[patientTabsService] acceptRelationship failed', { relId, error: err.message });
    throw err;
  }
};

/**
 * Declines/deletes a doctor-patient relationship.
 * @param {string} relId
 * @returns {Promise<void>}
 */
export const declineRelationship = async (relId) => {
  try {
    await deleteDoc(doc(db, 'doctor_patient_relationships', relId));
    logger.info('[patientTabsService] Relationship declined', { relId });
  } catch (err) {
    logger.error('[patientTabsService] declineRelationship failed', { relId, error: err.message });
    throw err;
  }
};

// ── Quotations (Realtime) ───────────────────────────────────────────────────

/**
 * Subscribes to open quotations for a patient in realtime.
 * @param {string} patientUid
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export const subscribeToPatientQuotations = (patientUid, onData) => {
  const q = query(
    collection(db, 'quotations'),
    where('customerUid', '==', patientUid),
    where('status', 'in', ['draft', 'sent'])
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    logger.error('[patientTabsService] subscribeToPatientQuotations error', { patientUid, error: err.message });
  });
};

// ── Calendar Prescriptions ──────────────────────────────────────────────────

/**
 * Fetches active prescriptions for the dosing calendar.
 * @param {string} patientUid
 * @returns {Promise<Array>}
 */
export const fetchCalendarPrescriptions = async (patientUid) => {
  try {
    const q = query(
      collection(db, 'prescriptions'),
      where('patient.uid', '==', patientUid)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(rx => rx.status !== 'cancelled' && rx.status !== 'completed');
  } catch (err) {
    logger.error('[patientTabsService] fetchCalendarPrescriptions failed', { patientUid, error: err.message });
    throw err;
  }
};

// ── Prescription Panel (Realtime) ───────────────────────────────────────────
// NOTE: PatientPrescriptionPanel.jsx is a large component with complex realtime
// logic — its decoupling will reference prescriptionRepository.js when it exists.
// For now we provide a basic subscription to be used as a starting point.

/**
 * Subscribes to prescriptions for a patient in realtime.
 * @param {string} patientUid
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export const subscribeToPatientPrescriptions = (patientUid, onData) => {
  const q = query(
    collection(db, 'prescriptions'),
    where('patient.uid', '==', patientUid)
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    logger.error('[patientTabsService] subscribeToPatientPrescriptions error', { patientUid, error: err.message });
  });
};
