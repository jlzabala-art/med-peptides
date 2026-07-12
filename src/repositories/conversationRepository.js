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
} from 'firebase/firestore';
import { db } from '../firebase';

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
    where('status', 'in', ['New', 'AI Processing', 'Awaiting Review', 'Awaiting Approval'])
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

export const conversationRepository = {
  subscribeToUnreadMessages,
  subscribeToInboxPending,
  subscribeToUpcomingCalendarEvents,
};
