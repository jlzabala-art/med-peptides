import { db } from '../firebase.js';
import { 
  collection, 
  addDoc, 
  setDoc,
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  deleteDoc,
  onSnapshot,
  arrayUnion
} from 'firebase/firestore';
import { logger } from '../utils/logger';

const COLLECTION_NAME = 'prescriptions';

export const createPrescription = async (prescriptionData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...prescriptionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('[prescriptionsService] Created prescription', { prescriptionId: docRef.id });
    return docRef.id;
  } catch (error) {
    logger.error("Error creating prescription", { error });
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
    logger.info('[prescriptionsService] Updated prescription', { prescriptionId: id });
    return true;
  } catch (error) {
    logger.error("Error updating prescription", { prescriptionId: id, error });
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
    logger.error("Error fetching prescription", { prescriptionId: id, error });
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
    logger.error("Error fetching prescriptions list", { filters, error });
    throw error;
  }
};

export const deletePrescription = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    logger.info('[prescriptionsService] Deleted prescription', { prescriptionId: id });
    return true;
  } catch (error) {
    logger.error("Error deleting prescription", { prescriptionId: id, error });
    throw error;
  }
};

/**
 * Fetches all registered users for care team selection.
 * @returns {Promise<Array>}
 */
export const fetchCareTeamUsers = async () => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    return usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[prescriptionsService] fetchCareTeamUsers failed', { error: err.message });
    throw err;
  }
};

/**
 * Enqueues a prescription document review job for AI extraction.
 * @param {string} jobId
 * @param {object} payload
 * @returns {Promise<void>}
 */
export const enqueuePrescriptionDocReview = async (jobId, payload) => {
  try {
    const jobRef = doc(collection(db, 'inbound_emails'), jobId);
    await setDoc(jobRef, {
      ...payload,
      receivedAt: serverTimestamp(),
      status: 'pending_ai',
      source: 'manual_upload'
    });
    logger.info('[prescriptionsService] Enqueued doc review AI job', { jobId });
  } catch (err) {
    logger.error('[prescriptionsService] enqueuePrescriptionDocReview failed', { jobId, error: err.message });
    throw err;
  }
};

/**
 * Listens for AI document extraction completion.
 * @param {string} jobId
 * @param {function} onStatusChange
 * @returns {function} unsubscribe
 */
export const subscribeToDocAiJob = (jobId, onStatusChange) => {
  const jobRef = doc(db, 'inbound_emails', jobId);
  return onSnapshot(jobRef, (snapshot) => {
    if (snapshot.exists()) {
      onStatusChange({ id: snapshot.id, ...snapshot.data() });
    }
  }, (err) => {
    logger.error('[prescriptionsService] subscribeToDocAiJob error', { jobId, error: err.message });
  });
};


/**
 * Attaches an uploaded and AI-verified document to a prescription record.
 * @param {string} rxId
 * @param {object} pendingDoc
 * @param {boolean} analyzedByAI
 * @param {Array<string>} appliedFields
 * @param {object} updates
 * @param {string} authorName
 * @returns {Promise<object>}
 */
export const attachDocumentToPrescription = async (rxId, pendingDoc, analyzedByAI, appliedFields, updates = {}, authorName = 'Admin') => {
  try {
    const rxRef = doc(db, COLLECTION_NAME, rxId);
    const timelineEvent = {
      type: 'document_uploaded',
      date: new Date().toISOString(),
      message: `Document attached: "${pendingDoc.name}"${appliedFields.length > 0 ? `. Fields updated: ${appliedFields.join(', ')}.` : ''}`,
      author: authorName,
      icon: 'FileText'
    };

    const newDoc = { ...pendingDoc, analyzedByAI, appliedFields };
    const payload = {
      ...updates,
      documents: arrayUnion(newDoc),
      timeline: arrayUnion(timelineEvent),
      auditTrail: arrayUnion({ ...timelineEvent, changedFields: appliedFields, action: 'document_upload' }),
      updatedAt: new Date().toISOString()
    };

    await updateDoc(rxRef, payload);
    logger.info('[prescriptionsService] Attached document to rx', { rxId, docName: pendingDoc.name });
    return { newDoc, payload };
  } catch (err) {
    logger.error('[prescriptionsService] attachDocumentToPrescription failed', { rxId, error: err.message });
    throw err;
  }
};

/**
 * Subscribes to the prescription intake operations queue in realtime.
 * @param {function} onData
 * @param {number} maxLimit
 * @returns {function} unsubscribe
 */
export const subscribeToPrescriptionIntakeQueue = (onData, maxLimit = 50) => {
  const q = query(
    collection(db, 'operations_queue'),
    where('detectedIntent', '==', 'PRESCRIPTION'),
    orderBy('date', 'desc'),
    limit(maxLimit)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    onData(items);
  }, (error) => {
    logger.error('[prescriptionsService] Error fetching prescriptions queue', { error: error.message });
  });
};



