import { db } from '../firebase.js';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'prescriptions';

export const createPrescription = async (prescriptionData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...prescriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating prescription: ", error);
    throw error;
  }
};

export const updatePrescription = async (id, updateData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating prescription: ", error);
    throw error;
  }
};

export const getPrescription = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching prescription: ", error);
    throw error;
  }
};

export const getPrescriptionsByFilter = async (filters = {}) => {
  try {
    const prescriptionsRef = collection(db, COLLECTION_NAME);
    let q = query(prescriptionsRef, orderBy('createdAt', 'desc'));

    // Apply basic filters
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.patientId) {
      q = query(q, where('patientId', '==', filters.patientId));
    }
    if (filters.doctorId) {
      q = query(q, where('doctorId', '==', filters.doctorId));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching prescriptions list: ", error);
    throw error;
  }
};

export const deletePrescription = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting prescription: ", error);
    throw error;
  }
};
