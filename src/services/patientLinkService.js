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
import { db } from '../firebase';

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
 * Find the portal user linked to a patient (by linkedUserId field).
 * Returns null if not linked.
 *
 * @param {Object} patient - Patient document with optional `linkedUserId` and `email`
 * @returns {Promise<{id: string, email: string, displayName: string}|null>}
 */
export async function findLinkedUser(patient) {
  // Primary: use linkedUserId field
  if (patient.linkedUserId) {
    const { getDoc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, USERS_COL, patient.linkedUserId));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  }

  // Fallback: try email match
  if (patient.email) {
    const q = query(collection(db, USERS_COL), where('email', '==', patient.email.toLowerCase()));
    const snap = await getDocs(q);
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  return null;
}
