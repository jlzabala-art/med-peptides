/**
 * patientLinkService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages the bidirectional link between:
 *   - `patients/{patientId}`  — Clinical record (CRM, imported from Fagron, etc.)
 *   - `users/{userId}`        — Portal account (Firebase Auth UID)
 *
 * The link field is:
 *   patients.linkedUserId  → UID of the portal user account
 *   users.linkedPatientId  → Firestore doc ID of the clinical patient record
 *
 * Matching Strategy (when no explicit link exists):
 *   1. Exact email match (most reliable)
 *   2. Fuzzy name match via Algolia `atlas_users` (fallback, requires manual confirmation)
 */

import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const PATIENTS_COL = 'patients';
const USERS_COL = 'users';

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Create a new patient clinical record in Firestore.
 * Automatically attempts to find and link a portal user by email.
 *
 * @param {Object} patientData - Patient form fields (name, email, dob, etc.)
 * @returns {Promise<{id: string, linkedUserId: string|null}>}
 */
export async function createPatient(patientData) {
  const cleanEmail = patientData.email?.trim().toLowerCase() || '';

  // Attempt auto-link by email
  let linkedUserId = null;
  if (cleanEmail) {
    try {
      const q = query(collection(db, USERS_COL), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        linkedUserId = snap.docs[0].id;
      }
    } catch {
      // Non-fatal: link can be established manually later
    }
  }

  const docData = {
    ...patientData,
    email: cleanEmail,
    linkedUserId,
    status: patientData.status || 'New',
    riskScore: 'Pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, PATIENTS_COL), docData);

  // If auto-linked, write back to the user document
  if (linkedUserId) {
    try {
      await updateDoc(doc(db, USERS_COL, linkedUserId), {
        linkedPatientId: ref.id,
      });
    } catch {
      // Non-fatal
    }
  }

  return { id: ref.id, linkedUserId };
}

// ── Link / Unlink ─────────────────────────────────────────────────────────────

/**
 * Manually link a clinical patient to a portal user account.
 * Called from the PatientProfileWorkspace "Portal Access" panel.
 *
 * @param {string} patientId - Firestore doc ID in `patients/`
 * @param {string} userId    - Firebase UID / Firestore doc ID in `users/`
 */
export async function linkPatientToUser(patientId, userId) {
  if (!patientId || !userId) throw new Error('patientId and userId are required');

  await Promise.all([
    updateDoc(doc(db, PATIENTS_COL, patientId), {
      linkedUserId: userId,
      updatedAt: serverTimestamp(),
    }),
    updateDoc(doc(db, USERS_COL, userId), {
      linkedPatientId: patientId,
    }),
  ]);
}

/**
 * Unlink a clinical patient from their portal user account.
 *
 * @param {string} patientId - Firestore doc ID in `patients/`
 * @param {string} userId    - Firebase UID / Firestore doc ID in `users/`
 */
export async function unlinkPatientFromUser(patientId, userId) {
  await Promise.all([
    updateDoc(doc(db, PATIENTS_COL, patientId), {
      linkedUserId: null,
      updatedAt: serverTimestamp(),
    }),
    updateDoc(doc(db, USERS_COL, userId), {
      linkedPatientId: null,
    }),
  ]);
}

// ── Query ─────────────────────────────────────────────────────────────────────

/**
 * Find the portal user linked to a patient (by linkedUserId field or email).
 * Supports passing either a patient object or a patient ID string.
 *
 * @param {Object|string} patient - Patient document or patient ID string
 * @param {boolean} searchCandidates - If true, returns an array of potential matching user accounts
 * @returns {Promise<{id: string, email: string, displayName: string}|Array|null>}
 */
export async function findLinkedUser(patient, searchCandidates = false) {
  if (!patient) return searchCandidates ? [] : null;

  let pData = typeof patient === 'string' ? null : patient;
  const { getDoc } = await import('firebase/firestore');

  if (typeof patient === 'string') {
    try {
      const snap = await getDoc(doc(db, PATIENTS_COL, patient));
      if (snap.exists()) {
        pData = { id: snap.id, ...snap.data() };
      }
    } catch {
      // ignore
    }
  }

  if (!pData && typeof patient === 'string') {
    pData = { id: patient };
  }

  // If looking for candidates list
  if (searchCandidates) {
    const email = pData?.email?.trim()?.toLowerCase();
    if (email) {
      const q = query(collection(db, USERS_COL), where('email', '==', email));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    // Fallback: get top active users
    const q = query(collection(db, USERS_COL));
    const snap = await getDocs(q);
    return snap.docs.slice(0, 10).map(d => ({ id: d.id, ...d.data() }));
  }

  // Primary: use linkedUserId field
  if (pData?.linkedUserId) {
    const snap = await getDoc(doc(db, USERS_COL, pData.linkedUserId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  }

  // Fallback: try email match
  if (pData?.email) {
    const q = query(collection(db, USERS_COL), where('email', '==', pData.email.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  return null;
}

