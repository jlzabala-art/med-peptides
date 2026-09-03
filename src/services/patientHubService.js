/**
 * patientHubService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Firestore service for the Patient Hub domain.
 * Covers: Daily Checkins, Symptom Logs, Adverse Events, Refill Requests,
 *         Active Prescriptions (realtime), Medical Team, and related queries.
 *
 * Golden Rule #2: Firestore is the single source of truth.
 * Components MUST NOT import firebase/firestore directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fb from '../firebase';
import {
  collection, query, where, getDocs, addDoc,
  onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import logger from '../utils/logger';

const db = fb?.db;

// ── Daily Check-in ──────────────────────────────────────────────────────────

/**
 * Checks if the patient has already submitted a daily check-in today.
 * @param {string} patientId - UID of the patient
 * @returns {Promise<boolean>}
 */
export const hasCheckedInToday = async (patientId) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, 'daily_checkins'),
      where('patientId', '==', patientId),
      where('createdAt', '>=', startOfDay)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    logger.error('[patientHubService] hasCheckedInToday failed', { patientId, error: err.message });
    throw err;
  }
};

/**
 * Submits a daily wellness check-in record.
 * @param {object} data - { patientId, mood, sleepQuality, energyLevel, notes }
 * @returns {Promise<string>} - docRef.id
 */
export const submitDailyCheckin = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'daily_checkins'), {
      ...data,
      notes: data.notes?.trim() || '',
      createdAt: serverTimestamp()
    });
    logger.info('[patientHubService] Daily check-in submitted', { patientId: data.patientId });
    return docRef.id;
  } catch (err) {
    logger.error('[patientHubService] submitDailyCheckin failed', { patientId: data.patientId, error: err.message });
    throw err;
  }
};

// ── Symptom Logger ──────────────────────────────────────────────────────────

/**
 * Logs a symptom report entry for a patient.
 * @param {object} data - { patientId, patientName, doctorId, energyLevel, sleepQuality, painLevel, sideEffects }
 * @returns {Promise<string>}
 */
export const submitSymptomLog = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'symptom_logs'), {
      ...data,
      timestamp: serverTimestamp()
    });
    logger.info('[patientHubService] Symptom log submitted', { patientId: data.patientId, doctorId: data.doctorId });
    return docRef.id;
  } catch (err) {
    logger.error('[patientHubService] submitSymptomLog failed', { patientId: data.patientId, error: err.message });
    throw err;
  }
};

// ── Adverse Events ──────────────────────────────────────────────────────────

/**
 * Reports an adverse event for a patient.
 * @param {object} data - { patientId, patientName, severity, symptoms }
 * @returns {Promise<string>}
 */
export const submitAdverseEvent = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'adverse_events'), {
      ...data,
      symptoms: data.symptoms?.trim() || '',
      status: 'new',
      createdAt: serverTimestamp()
    });
    logger.info('[patientHubService] Adverse event reported', { patientId: data.patientId, severity: data.severity });
    return docRef.id;
  } catch (err) {
    logger.error('[patientHubService] submitAdverseEvent failed', { patientId: data.patientId, error: err.message });
    throw err;
  }
};

// ── Refill Requests ─────────────────────────────────────────────────────────

/**
 * Fetches active prescriptions (recommendations) eligible for refill.
 * @param {string} patientId
 * @returns {Promise<Array>}
 */
export const fetchActiveRecommendations = async (patientId) => {
  try {
    const q = query(
      collection(db, 'recommendations'),
      where('patientId', '==', patientId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.status === 'active');
  } catch (err) {
    logger.error('[patientHubService] fetchActiveRecommendations failed', { patientId, error: err.message });
    throw err;
  }
};

/**
 * Submits a refill request for a prescription.
 * @param {object} data - { patientId, patientName, originalRxId, doctorId, productName }
 * @returns {Promise<string>}
 */
export const submitRefillRequest = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'refill_requests'), {
      ...data,
      status: 'pending_approval',
      createdAt: serverTimestamp()
    });
    logger.info('[patientHubService] Refill request submitted', { patientId: data.patientId, rxId: data.originalRxId });
    return docRef.id;
  } catch (err) {
    logger.error('[patientHubService] submitRefillRequest failed', { patientId: data.patientId, error: err.message });
    throw err;
  }
};

// ── Active Prescriptions (Realtime) ─────────────────────────────────────────

/**
 * Subscribes to active prescriptions (recommendations) for a patient.
 * Returns an unsubscribe function.
 * @param {string} patientId
 * @param {function} onData - Callback receiving the list of prescriptions
 * @returns {function} unsubscribe
 */
export const subscribeToActivePrescriptions = (patientId, onData) => {
  const q = query(
    collection(db, 'recommendations'),
    where('patientId', '==', patientId),
    where('status', 'in', ['active', 'processing', 'pending'])
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(list);
  }, (err) => {
    logger.error('[patientHubService] subscribeToActivePrescriptions error', { patientId, error: err.message });
  });
};

// ── Medical Team ────────────────────────────────────────────────────────────

/**
 * Fetches the patient's active medical team (doctor-patient relationships).
 * @param {string} patientId
 * @returns {Promise<Array>}
 */
export const fetchMedicalTeam = async (patientId) => {
  try {
    const q = query(
      collection(db, 'doctor_patient_relationships'),
      where('patientId', '==', patientId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[patientHubService] fetchMedicalTeam failed', { patientId, error: err.message });
    throw err;
  }
};
