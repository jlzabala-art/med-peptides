import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { normalizePrescription } from './mappers';

const getPrescriptionsCol = (userId) => collection(db, 'users', userId, 'prescriptions');
const getAllPrescriptionsCol = () => collection(db, 'prescriptions');

export const prescriptionRepository = {
  /**
   * Save a prescription to a user's subcollection.
   */
  async addUserPrescription(userId, data) {
    if (!userId) return null;
    const ref = await addDoc(getPrescriptionsCol(userId), {
      ...data,
      uploadedAt: serverTimestamp()
    });
    return ref.id;
  },

  /**
   * Update an existing prescription by ID (global collection)
   */
  async updatePrescription(id, data) {
    if (!id) return;
    await updateDoc(doc(db, 'prescriptions', id), data);
  },

  /**
   * Create a new prescription in the global collection
   */
  async createPrescription(data) {
    const ref = await addDoc(getAllPrescriptionsCol(), data);
    return ref.id;
  },

  /**
   * Fetch recent prescriptions for a specific doctor
   */
  async getRecentPrescriptionsByDoctor(doctorId, limitCount = 5) {
    if (!doctorId) return [];
    try {
      const q = query(
        getAllPrescriptionsCol(),
        where('doctorId', '==', doctorId),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map(d => normalizePrescription(d.data(), d.id));
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      return list.slice(0, limitCount);
    } catch (err) {
      console.error('[prescriptionRepository] getRecentPrescriptionsByDoctor:', err);
      return [];
    }
  }
};
