/**
 * repositories/userRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Data-access layer for the Firestore `users` collection.
 *
 * Implements Golden Rule #2 (Multi-tier caching):
 *   Tier 1: Module-level RAM memory cache with TTL (5 min)
 *   Tier 4: Firestore queries
 *
 * All writes for role='patient' route through validatePatientWrite().
 * ─────────────────────────────────────────────────────────────────────────────
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
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeUser } from './mappers';
import { validatePatientWrite } from './patientWriteGuard';

const COLLECTION = 'users';
const REL_COLLECTION = 'doctor_patient_relationships';

// ─── TIER 1: MEMORY CACHE ───────────────────────────────────────────────────
const userCache = new Map(); // uid -> { data, cachedAt }
let doctorsCache = { list: null, cachedAt: 0 };
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidateUsersCache(uid = null) {
  if (uid) {
    userCache.delete(uid);
  } else {
    userCache.clear();
    doctorsCache = { list: null, cachedAt: 0 };
  }
}

/**
 * Obtiene un usuario por su UID de Firebase Auth (Tier-1 Cache + Firestore).
 * @param {string} uid
 * @param {boolean} forceRefresh
 * @returns {Promise<object|null>}
 */
export async function getUserById(uid, forceRefresh = false) {
  if (!uid) return null;

  if (!forceRefresh) {
    const cached = userCache.get(uid);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;

  const user = normalizeUser(snap.data(), snap.id);
  userCache.set(uid, { data: user, cachedAt: Date.now() });
  return user;
}

/**
 * Obtiene una página de usuarios con paginación y soporte multi-rol.
 * @param {{ role?: string, roles?: string[], clinicId?: string, limitCount?: number, lastDoc?: object }} opts
 * @returns {Promise<{ users: object[], lastDoc: object|null, hasMore: boolean }>}
 */
export async function getUsers({
  role = null,
  roles = null,
  clinicId = null,
  limitCount = 50,
  lastDoc = null,
} = {}) {
  const constraints = [];

  if (roles && Array.isArray(roles) && roles.length > 0) {
    constraints.push(where('role', 'in', roles.slice(0, 10)));
  } else if (role) {
    constraints.push(where('role', '==', role));
  }

  if (clinicId) {
    constraints.push(where('clinicIds', 'array-contains', clinicId));
  }

  constraints.push(orderBy('createdAt', 'desc'));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  constraints.push(limit(limitCount));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const users = snap.docs.map((d) => normalizeUser(d.data(), d.id));
  const nextLastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return {
    users,
    lastDoc: nextLastDoc,
    hasMore: snap.docs.length === limitCount,
  };
}

/**
 * Crea o sobreescribe el perfil de un usuario.
 * @param {string} uid
 * @param {object} data
 */
export async function upsertUser(uid, data) {
  const isPatient = data.role === 'patient' || (!data.role && (data.doctorIds || data.clinicIds));
  const cleanData = isPatient
    ? validatePatientWrite(data, { isUpdate: true })
    : data;

  await setDoc(doc(db, COLLECTION, uid), {
    ...cleanData,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  invalidateUsersCache(uid);
}

/**
 * Actualiza campos específicos de un usuario.
 * @param {string} uid
 * @param {object} updates
 */
export async function updateUser(uid, updates) {
  const isPatient = updates.role === 'patient' || (!updates.role && (updates.doctorIds || updates.clinicIds));
  const cleanUpdates = isPatient
    ? validatePatientWrite(updates, { isUpdate: true })
    : updates;

  await updateDoc(doc(db, COLLECTION, uid), {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  });

  invalidateUsersCache(uid);
}

/**
 * Busca usuarios por email (búsqueda exacta).
 * @param {string} email
 * @returns {Promise<object[]>}
 */
export async function getUsersByEmail(email) {
  if (!email) return [];
  const q = query(
    collection(db, COLLECTION),
    where('email', '==', email),
    limit(10)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

/**
 * Obtiene usuarios activos con rol 'doctor' (con caché Tier-1).
 * @returns {Promise<object[]>}
 */
export async function getDoctors(forceRefresh = false) {
  if (!forceRefresh && doctorsCache.list && (Date.now() - doctorsCache.cachedAt < CACHE_TTL_MS)) {
    return doctorsCache.list;
  }

  const q = query(
    collection(db, COLLECTION),
    where('role', '==', 'doctor'),
    limit(200)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => normalizeUser(d.data(), d.id));
  doctorsCache = { list, cachedAt: Date.now() };
  return list;
}

// ─── Doctor-Patient Relationship helpers ─────────────────────────────────────

/**
 * Obtiene las invitaciones pendientes para un paciente.
 * @param {string} patientId
 * @returns {Promise<object[]>}
 */
export async function getPendingInvitesForPatient(patientId) {
  if (!patientId) return [];
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
 */
export async function acceptSupervisionInvite(relId, doctorId, patientId) {
  const now = new Date().toISOString();
  await updateDoc(doc(db, REL_COLLECTION, relId), { status: 'active', activatedAt: now, updatedAt: now });
  await updateDoc(doc(db, COLLECTION, patientId), {
    assignedPhysicianIds: arrayUnion(doctorId),
    doctorIds: arrayUnion(doctorId),
  });
  await updateDoc(doc(db, COLLECTION, doctorId), { assignedPatientIds: arrayUnion(patientId) });

  invalidateUsersCache(patientId);
  invalidateUsersCache(doctorId);

  const docSnap = await getDoc(doc(db, COLLECTION, doctorId));
  return docSnap.exists() ? normalizeUser(docSnap.data(), doctorId) : null;
}

/**
 * Revoca/declina una invitación de supervisión.
 */
export async function declineSupervisionInvite(relId) {
  await updateDoc(doc(db, REL_COLLECTION, relId), {
    status: 'revoked',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Verifica si ya existe una relación pendiente/activa y crea una nueva si no.
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
 */
export async function getDoctorPatientsCount(doctorId) {
  if (!doctorId) return 0;
  const q = query(
    collection(db, REL_COLLECTION),
    where('doctorId', '==', doctorId),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  return snap.size;
}

/**
 * Fetch users by a specific role.
 */
export async function getUsersByRole(role, limitCount = 50) {
  const q = query(
    collection(db, COLLECTION),
    where('role', '==', role),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

/**
 * Fetch staff assigned to a specific doctor.
 */
export async function getStaffByDoctor(doctorId) {
  if (!doctorId) return [];
  const q = query(
    collection(db, COLLECTION),
    where('role', '==', 'staff'),
    where('assignedDoctorIds', 'array-contains', doctorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

/**
 * Fetch patients assigned to a specific doctor.
 */
export async function getPatientsByDoctor(doctorId) {
  if (!doctorId) return [];
  const q = query(
    collection(db, COLLECTION),
    where('role', '==', 'patient'),
    where('doctorIds', 'array-contains', doctorId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => normalizeUser(d.data(), d.id));
}

/**
 * Fetch users/patients affiliated with a specific clinic.
 */
export async function getUsersByClinic(clinicId, { role = null, limitCount = 50, lastDoc = null } = {}) {
  if (!clinicId) return { users: [], lastDoc: null, hasMore: false };
  const constraints = [where('clinicIds', 'array-contains', clinicId)];
  if (role) constraints.push(where('role', '==', role));
  constraints.push(orderBy('createdAt', 'desc'));
  if (lastDoc) constraints.push(startAfter(lastDoc));
  constraints.push(limit(limitCount));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);
  const users = snap.docs.map((d) => normalizeUser(d.data(), d.id));
  return {
    users,
    lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
    hasMore: snap.docs.length === limitCount,
  };
}

/**
 * Creates a new patient user record validated with patientWriteGuard.
 */
export async function createPatient(patientData) {
  const cleanData = validatePatientWrite(patientData, { isUpdate: false });
  const ref = await addDoc(collection(db, COLLECTION), {
    ...cleanData,
    role: 'patient',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  invalidateUsersCache();
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
      updatedAt: new Date().toISOString(),
    });
    return ref.id;
  }
  return snap.docs[0].id;
}

/**
 * Real-time subscription to active sessions for a user.
 * Used by SecurityCenter.
 * @param {string} userId
 * @param {function} onData
 * @param {function} [onError]
 * @returns {function} unsubscribe
 */
export function subscribeUserSessions(userId, onData, onError) {
  const q = query(collection(db, 'users', userId, 'sessions'), orderBy('lastActive', 'desc'));
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  }, (err) => {
    if (onError) onError(err);
  });
}

/**
 * Deletes a session for a user.
 * @param {string} userId
 * @param {string} sessionId
 * @returns {Promise<void>}
 */
export async function deleteUserSession(userId, sessionId) {
  const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
  await deleteDoc(sessionRef);
}

/**
 * Searches physicians/doctors by query text.
 * Used by PhysicianPicker.
 * @param {string} queryText
 * @param {number} maxLimit
 * @returns {Promise<Array>}
 */
export async function searchPhysicians(queryText = '', maxLimit = 20) {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['doctor', 'physician']),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!queryText) return docs;
    const lower = queryText.toLowerCase();
    return docs.filter(d => 
      (d.name && d.name.toLowerCase().includes(lower)) ||
      (d.displayName && d.displayName.toLowerCase().includes(lower)) ||
      (d.email && d.email.toLowerCase().includes(lower))
    );
  } catch (err) {
    return [];
  }
}

/**
 * Searches clinics by query text.
 * Used by ClinicPicker.
 * @param {string} queryText
 * @param {number} maxLimit
 * @returns {Promise<Array>}
 */
export async function searchClinics(queryText = '', maxLimit = 20) {
  try {
    const q = query(
      collection(db, 'clinics'),
      limit(maxLimit)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!queryText) return docs;
    const lower = queryText.toLowerCase();
    return docs.filter(d => 
      (d.name && d.name.toLowerCase().includes(lower)) ||
      (d.address && d.address.toLowerCase().includes(lower)) ||
      (d.city && d.city.toLowerCase().includes(lower))
    );
  } catch (err) {
    return [];
  }
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
  getUsersByClinic,
  createPatient,
  createDoctorPatientRelationship,
  invalidateUsersCache,
  subscribeUserSessions,
  deleteUserSession,
  searchPhysicians,
  searchClinics,
};

export default userRepository;

