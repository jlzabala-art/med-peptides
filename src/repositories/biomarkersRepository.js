import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Adds a new biomarker measurement for a patient.
 * @param {object} biomarkerData
 * @returns {Promise<string>}
 */
export async function addBiomarkerEntry(biomarkerData) {
  try {
    const docRef = await addDoc(collection(db, 'biomarkers'), {
      ...biomarkerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('[biomarkersRepository] Added biomarker entry', { id: docRef.id });
    return docRef.id;
  } catch (err) {
    logger.error('[biomarkersRepository] addBiomarkerEntry failed', { error: err.message });
    throw err;
  }
}

export const biomarkersRepository = {
  addBiomarkerEntry,
};

export default biomarkersRepository;
