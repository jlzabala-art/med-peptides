/**
 * repositories/conversationRepository.js
 *
 * Data-access layer for `conversations`, `operations_queue`, and `calendar_events`.
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Suscribe al conteo de mensajes no leídos en conversaciones.
 * @param {{ userId: string, isAdmin: boolean }} opts
 * @param {function} onCount
 * @returns {function} unsubscribe
 */
export function subscribeToUnreadMessages({ userId, isAdmin }, onCount) {
  const q = isAdmin
    ? query(collection(db, 'conversations'))
    : query(collection(db, 'conversations'), where('participants', 'array-contains', userId));

  return onSnapshot(q, (snap) => {
    let count = 0;
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.unreadCount?.[userId] > 0) count++;
    });
    onCount(count);
  });
}

/**
 * Suscribe al conteo de items pendientes en la cola de operaciones.
 * @param {function} onCount
 * @returns {function} unsubscribe
 */
export function subscribeToInboxPending(onCount) {
  const q = query(
    collection(db, 'operations_queue'),
    where('status', 'in', ['New', 'AI Processing', 'pending', 'Awaiting Approval'])
  );
  return onSnapshot(q, (snap) => onCount(snap.size), () => onCount(0));
}

/**
 * Suscribe a los eventos de calendario próximos de un usuario.
 * @param {string} userId
 * @param {function} onEvents
 * @returns {function} unsubscribe
 */
export function subscribeToUpcomingCalendarEvents(userId, onEvents) {
  const q = query(
    collection(db, 'calendar_events'),
    where('ownerIds', 'array-contains', userId),
    orderBy('start', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayIso = startOfToday.toISOString();
      let pending = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        const startStr = data.start?.toDate ? data.start.toDate().toISOString() : data.start;
        if (startStr && startStr >= todayIso) pending++;
      });
      onEvents(pending);
    },
    () => onEvents(0)
  );
}

/**
 * Fetches active doctor-patient relationships for messaging.
 * @param {string} doctorId
 * @returns {Promise<Array>}
 */
export async function getDoctorPatientRelationships(doctorId) {
  try {
    const q = query(
      collection(db, 'doctor_patient_relationships'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[conversationRepository] getDoctorPatientRelationships failed', { doctorId, error: err.message });
    return [];
  }
}

/**
 * Fetches direct messages between a doctor and a patient.
 * @param {string} doctorId
 * @param {string} patientId
 * @returns {Promise<Array>}
 */
export async function getDirectMessages(doctorId, patientId) {
  try {
    const q = query(
      collection(db, 'secure_messages'),
      where('doctorId', '==', doctorId),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    try {
      const qFallback = query(
        collection(db, 'secure_messages'),
        where('doctorId', '==', doctorId),
        where('patientId', '==', patientId)
      );
      const snapF = await getDocs(qFallback);
      const list = snapF.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0) - (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0));
      return list;
    } catch (fallbackErr) {
      logger.error('[conversationRepository] getDirectMessages fallback failed', { doctorId, patientId, error: fallbackErr.message });
      return [];
    }
  }
}

/**
 * Sends a direct message.
 * @param {object} messageData
 * @returns {Promise<string>}
 */
export async function sendDirectMessage(messageData) {
  try {
    const docRef = await addDoc(collection(db, 'secure_messages'), {
      ...messageData,
      createdAt: serverTimestamp(),
    });
    logger.info('[conversationRepository] Sent direct message', { id: docRef.id });
    return docRef.id;
  } catch (err) {
    logger.error('[conversationRepository] sendDirectMessage failed', { error: err.message });
    throw err;
  }
}

export const conversationRepository = {
  subscribeToUnreadMessages,
  subscribeToInboxPending,
  subscribeToUpcomingCalendarEvents,
  getDoctorPatientRelationships,
  getDirectMessages,
  sendDirectMessage,
};

export default conversationRepository;

