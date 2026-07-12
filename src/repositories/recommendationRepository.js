/**
 * repositories/recommendationRepository.js
 *
 * Data-access layer para la colección `recommendations`.
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'recommendations';

/**
 * Obtiene las recomendaciones de un usuario.
 * @param {string} userId
 * @param {number} limitCount
 * @returns {Promise<object[]>}
 */
export async function getRecommendationsForUser(userId, limitCount = 20) {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Acepta una recomendación.
 * @param {string} recId
 */
export async function acceptRecommendation(recId) {
  await updateDoc(doc(db, COLLECTION, recId), {
    status: 'accepted',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Rechaza una recomendación.
 * @param {string} recId
 */
export async function declineRecommendation(recId) {
  await updateDoc(doc(db, COLLECTION, recId), {
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Obtiene el numero de recomendaciones de un médico
 * @param {string} doctorId 
 * @returns {Promise<number>}
 */
export async function getDoctorRecommendationsCount(doctorId) {
  const q = query(collection(db, 'doctor_recommendations'), where('doctorId', '==', doctorId));
  const snap = await getDocs(q);
  return snap.size;
}

export const recommendationRepository = {
  getRecommendationsForUser,
  acceptRecommendation,
  declineRecommendation,
  getDoctorRecommendationsCount,
};
