/**
 * repositories/userRepository.js
 * 
 * Data-access layer for the Firestore `users` collection.
 * 
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 * Usa siempre las funciones de este módulo.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  setDoc,
  serverTimestamp,
  addDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeUser } from './mappers';

const COLLECTION = 'users';

/**
 * Obtiene un usuario por su UID de Firebase Auth.
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getUserById(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, COLLECTION, uid));
  return snap.exists() ? normalizeUser(snap.data(), snap.id) : null;
}

/**
 * Obtiene una página de usuarios con paginación.
 * @param {{ role?: string, limitCount?: number, lastDoc?: object }} opts
 * @returns {Promise<{ users: object[], lastDoc: object|null }>}
 */
export async function getUsers({ role, limitCount = 50, lastDoc = null } = {}) {
  const constraints = [orderBy('createdAt', 'desc'), limit(limitCount)];

  if (role) constraints.unshift(where('role', '==', role));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const users = snap.docs.map((d) => normalizeUser(d.data(), d.id));
  const nextLastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { users, lastDoc: nextLastDoc };
}

/**
 * Crea o sobreescribe el perfil de un usuario.
 * @param {string} uid
 * @param {object} data
 */
export async function upsertUser(uid, data) {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Actualiza campos específicos de un usuario.
 * @param {string} uid
 * @param {object} updates
 */
export async function updateUser(uid, updates) {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Busca usuarios por email (búsqueda exacta).
 * @param {string} email
 * @returns {Promise<object[]>}
 */
export async function getUsersByEmail(email) {
  const q = query(
    collection(db, COLLECTION),
    where('email', '==', email),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

/**
 * Obtiene usuarios activos con rol 'doctor'.
 * @returns {Promise<object[]>}
 */
export async function getDoctors() {
  const q = query(
    collection(db, COLLECTION),
    where('role', '==', 'doctor'),
    limit(200)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

// ─── Doctor-Patient Relationship helpers ─────────────────────────────────────
const REL_COLLECTION = 'doctor_patient_relationships';

/**
 * Obtiene las invitaciones pendientes para un paciente.
 * @param {string} patientId
 * @returns {Promise<object[]>}
 */
export async function getPendingInvitesForPatient(patientId) {
  const q = query(
    collection(db, REL_COLLECTION),
    where('patientId', '==', patientId),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

/**
 * Acepta una invitación de supervisión médica.
 * @param {string} relId
 * @param {string} doctorId
 * @param {string} patientId
 */
export async function acceptSupervisionInvite(relId, doctorId, patientId) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, REL_COLLECTION, relId), { status: 'active', activatedAt: now, updatedAt: now });
  await updateDoc(doc(db, COLLECTION, patientId), { assignedPhysicianIds: arrayUnion(doctorId) });
  await updateDoc(doc(db, COLLECTION, doctorId), { assignedPatientIds: arrayUnion(patientId) });
  const docSnap = await getDoc(doc(db, COLLECTION, doctorId));
  return docSnap.exists() ? normalizeUser(docSnap.data(), doctorId) : null;
}

/**
 * Revoca/declina una invitación de supervisión.
 * @param {string} relId
 */
export async function declineSupervisionInvite(relId) {
  await updateDoc(doc(db, REL_COLLECTION, relId), {
    status: 'revoked',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Verifica si ya existe una relación pendiente/activa y crea una nueva si no.
 * @param {object} payload
 * @returns {Promise<string>} ID del documento creado
 */
export async function requestSupervision({ patientId, patientEmail, doctorId, doctorName, notes }) {
  const existing = query(
    collection(db, REL_COLLECTION),
    where('patientId', '==', patientId),
    where('doctorId', '==', doctorId),
    where('status', 'in', ['pending', 'active'])
  );
  const snap = await getDocs(existing);
  if (!snap.empty) throw new Error('A pending or active supervision relationship already exists with this doctor.');

  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, REL_COLLECTION), {
    patientId,
    patientEmail,
    doctorId,
    doctorName,
    status: 'pending',
    createdBy: 'patient',
    initiatedByRole: 'patient',
    notes: notes?.trim() || '',
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

/**
 * Obtiene el total de pacientes activos de un médico.
 * @param {string} doctorId 
 * @returns {Promise<number>}
 */
export async function getDoctorPatientsCount(doctorId) {
  const q = query(collection(db, REL_COLLECTION), where('doctorId', '==', doctorId), where('status', '==', 'active'));
  const snap = await getDocs(q);
  return snap.size;
}

/**
 * Fetch users by a specific role.
 */
export async function getUsersByRole(role, limitCount = 50) {
  const q = query(
    collection(db, 'users'),
    where('role', '==', role),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => normalizeUser(d.data(), d.id));
}

/**
 * Fetch staff assigned to a specific doctor.
 */
export async function getStaffByDoctor(doctorId) {
  if (!doctorId) return [];
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'staff'),
    where('assignedDoctorIds', 'array-contains', doctorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => normalizeUser(d.data(), d.id));
}

/**
 * Fetch patients assigned to a specific doctor.
 */
export async function getPatientsByDoctor(doctorId) {
  if (!doctorId) return [];
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'patient'),
    where('assignedPhysicianIds', 'array-contains', doctorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => normalizeUser(d.data(), d.id));
}

/**
 * Creates a new patient user record.
 */
export async function createPatient(patientData) {
  const ref = await addDoc(collection(db, 'users'), {
    ...patientData,
    role: 'patient',
    createdAt: serverTimestamp()
  });
  return ref.id;
}

/**
 * Creates a relationship between a doctor and a patient.
 */
export async function createDoctorPatientRelationship(payload) {
  const q = query(
    collection(db, REL_COLLECTION),
    where('doctorId', '==', payload.doctorId),
    where('patientId', '==', payload.patientId)
  );
  const snap = await getDocs(q);
  if (snap.empty) {
    const ref = await addDoc(collection(db, REL_COLLECTION), {
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return ref.id;
  }
  return snap.docs[0].id;
}

const userRepository = {
  getUserById,
  getUsers,
  upsertUser,
  updateUser,
  getUsersByEmail,
  getDoctors,
  getPendingInvitesForPatient,
  acceptSupervisionInvite,
  declineSupervisionInvite,
  requestSupervision,
  getDoctorPatientsCount,
  getUsersByRole,
  getStaffByDoctor,
  getPatientsByDoctor,
  createPatient,
  createDoctorPatientRelationship,
};

export default userRepository;
