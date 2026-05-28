/* eslint-disable no-unused-vars */
/**
 * assignmentService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * B2B Portal — Phase 2: Assignment Engine
 *
 * Manages doctor-patient relationships stored in the Firestore
 * `doctor_patient_relationships` collection.
 *
 * Assignment Flows:
 *   1. patient → doctor   (patient invites a doctor to supervise them)
 *   2. doctor  → patient  (doctor invites a patient to be supervised)
 *   3. admin   → both     (admin directly links doctor + patient)
 *
 * Status lifecycle:
 *   pending  → active  → paused | revoked
 *
 * Collection schema:
 *   /doctor_patient_relationships/{relId}
 *     patientId        string   — UID of the patient
 *     doctorId         string   — UID of the doctor
 *     status           string   — 'pending' | 'active' | 'paused' | 'revoked'
 *     initiatedBy      string   — UID of the user who created the relationship
 *     initiatedByRole  string   — 'patient' | 'doctor' | 'admin'
 *     inviteCode       string   — optional short code for out-of-band invites
 *     notes            string   — optional admin/doctor note
 *     createdAt        string   — ISO timestamp
 *     activatedAt      string?  — ISO timestamp when both parties confirmed
 *     updatedAt        string   — ISO timestamp of last update
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase';

const RELATIONSHIPS_COL = 'doctor_patient_relationships';
const USERS_COL = 'users';

// ── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return new Date().toISOString();
}

/**
 * Append UIDs to the user's relationship arrays in Firestore.
 * For a patient: push doctorId into assignedDoctorIds.
 * For a doctor:  push patientId into assignedPatientIds.
 */
async function syncUserRelationshipArrays(patientId, doctorId) {
  const patientRef = doc(db, USERS_COL, patientId);
  const doctorRef  = doc(db, USERS_COL, doctorId);
  await Promise.all([
    updateDoc(patientRef, { assignedDoctorIds: arrayUnion(doctorId) }),
    updateDoc(doctorRef,  { assignedPatientIds: arrayUnion(patientId) }),
  ]);
}

// ── Create Relationship ───────────────────────────────────────────────────────

/**
 * Create a new doctor-patient relationship.
 *
 * @param {{ patientId, doctorId, initiatedBy, initiatedByRole, notes?, status? }} params
 * @returns {Promise<string>} — The new document ID
 */
export async function createRelationship({
  patientId,
  doctorId,
  initiatedBy,
  initiatedByRole,
  notes = '',
  status = 'pending',
}) {
  if (!patientId || !doctorId || !initiatedBy || !initiatedByRole) {
    throw new Error('[assignmentService] Missing required fields for createRelationship.');
  }

  // Prevent duplicates
  const existing = await getActiveRelationship(patientId, doctorId);
  if (existing) {
    throw new Error('[assignmentService] A relationship between this patient and doctor already exists.');
  }

  const rel = {
    patientId,
    doctorId,
    status,
    initiatedBy,
    initiatedByRole,
    notes,
    createdAt: now(),
    updatedAt: now(),
    activatedAt: null,
  };

  const colRef = collection(db, RELATIONSHIPS_COL);
  const docRef = await addDoc(colRef, rel);

  // If admin creates directly as 'active', sync the arrays immediately
  if (status === 'active') {
    await syncUserRelationshipArrays(patientId, doctorId);
  }

  return docRef.id;
}

// ── Update Relationship Status ────────────────────────────────────────────────

/**
 * Update the status of an existing relationship.
 *
 * @param {string} relId    — Firestore document ID
 * @param {string} newStatus — 'active' | 'paused' | 'revoked'
 * @param {string} [notes]   — optional note to attach
 */
export async function updateRelationshipStatus(relId, newStatus, notes) {
  const ref = doc(db, RELATIONSHIPS_COL, relId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error(`[assignmentService] Relationship ${relId} not found.`);

  const data = snap.data();
  const update = {
    status: newStatus,
    updatedAt: now(),
  };

  if (notes !== undefined) update.notes = notes;
  if (newStatus === 'active' && !data.activatedAt) {
    update.activatedAt = now();
    // Sync user arrays when activating
    await syncUserRelationshipArrays(data.patientId, data.doctorId);
  }

  await updateDoc(ref, update);
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Get the active (or pending) relationship between a specific patient and doctor.
 * Returns the relationship data + id, or null if none exists.
 */
export async function getActiveRelationship(patientId, doctorId) {
  const q = query(
    collection(db, RELATIONSHIPS_COL),
    where('patientId', '==', patientId),
    where('doctorId', '==', doctorId),
    where('status', 'in', ['pending', 'active']),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/**
 * Get all relationships for a given patient (any status).
 * @param {string} patientId
 * @returns {Promise<Array>}
 */
export async function getRelationshipsForPatient(patientId) {
  const q = query(
    collection(db, RELATIONSHIPS_COL),
    where('patientId', '==', patientId),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all relationships for a given doctor (any status).
 * @param {string} doctorId
 * @returns {Promise<Array>}
 */
export async function getRelationshipsForDoctor(doctorId) {
  const q = query(
    collection(db, RELATIONSHIPS_COL),
    where('doctorId', '==', doctorId),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Get all active patient UIDs for a given doctor.
 * @param {string} doctorId
 * @returns {Promise<string[]>}
 */
export async function getActivePatientIds(doctorId) {
  const q = query(
    collection(db, RELATIONSHIPS_COL),
    where('doctorId', '==', doctorId),
    where('status', '==', 'active'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().patientId);
}

/**
 * Get all active doctor UIDs for a given patient.
 * @param {string} patientId
 * @returns {Promise<string[]>}
 */
export async function getActiveDoctorIds(patientId) {
  const q = query(
    collection(db, RELATIONSHIPS_COL),
    where('patientId', '==', patientId),
    where('status', '==', 'active'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().doctorId);
}

/**
 * Get all relationships (admin view).
 * @returns {Promise<Array>}
 */
export async function getAllRelationships() {
  const snap = await getDocs(collection(db, RELATIONSHIPS_COL));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Invite a patient by email (doctor-initiated flow).
 * 
 * Checks if the patient already exists in the `users` collection.
 * If yes, links their UID. If not, keeps patientId empty, to be resolved on signup.
 *
 * @param {string} doctorId - UID of the doctor initiating the invite
 * @param {string} email - Email address of the patient
 * @param {string} [notes] - Optional clinical notes
 */
export async function invitePatientByEmail(doctorId, email, notes = '') {
  const cleanEmail = email.trim().toLowerCase();
  if (!doctorId || !cleanEmail) {
    throw new Error('[assignmentService] Missing required doctorId or email.');
  }

  // 1. Search for user by email in the users collection
  const usersQ = query(collection(db, USERS_COL), where('email', '==', cleanEmail));
  const userSnap = await getDocs(usersQ);
  
  let patientId = '';
  if (!userSnap.empty) {
    const userDoc = userSnap.docs[0];
    const userData = userDoc.data();
    if (userData.role === 'doctor' || userData.role === 'admin') {
      throw new Error('You cannot invite another Doctor or Admin as a patient.');
    }
    patientId = userDoc.id;
  }

  // 2. Prevent duplicate relationships/invitations
  let dupQ;
  if (patientId) {
    dupQ = query(
      collection(db, RELATIONSHIPS_COL),
      where('doctorId', '==', doctorId),
      where('patientId', '==', patientId),
      where('status', 'in', ['pending', 'active'])
    );
  } else {
    dupQ = query(
      collection(db, RELATIONSHIPS_COL),
      where('doctorId', '==', doctorId),
      where('patientEmail', '==', cleanEmail),
      where('status', 'in', ['pending', 'active'])
    );
  }
  const dupSnap = await getDocs(dupQ);
  if (!dupSnap.empty) {
    throw new Error('A pending or active relationship already exists with this patient.');
  }

  // 3. Create the invitation document
  const rel = {
    patientId,
    patientEmail: cleanEmail,
    doctorId,
    status: 'pending',
    initiatedBy: doctorId,
    initiatedByRole: 'doctor',
    notes,
    createdAt: now(),
    updatedAt: now(),
    activatedAt: null,
  };

  const docRef = await addDoc(collection(db, RELATIONSHIPS_COL), rel);
  return { id: docRef.id, patientExisted: !!patientId };
}
