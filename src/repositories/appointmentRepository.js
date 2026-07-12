/**
 * repositories/appointmentRepository.js
 *
 * Data-access layer for `prescriptions` (as appointments) and `refill_reminders`.
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Obtiene las prescripciones de un médico para la vista de calendario.
 * @param {string} doctorId
 * @param {number} limitCount
 * @returns {Promise<object[]>}
 */
export async function getPrescriptionsForDoctor(doctorId, limitCount = 10) {
  const q = query(
    collection(db, 'prescriptions'),
    where('doctorId', '==', doctorId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Obtiene los recordatorios de refill de un médico.
 * @param {string} doctorId
 * @param {number} limitCount
 * @returns {Promise<object[]>}
 */
export async function getRefillRemindersForDoctor(doctorId, limitCount = 10) {
  const q = query(
    collection(db, 'refill_reminders'),
    where('doctorId', '==', doctorId),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const appointmentRepository = {
  getPrescriptionsForDoctor,
  getRefillRemindersForDoctor,
};
