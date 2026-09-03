/**
 * bloodworkService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Service for patient lab results & bloodwork uploads.
 * Decouples Firestore reads/writes for doctor-patient clinical attachments.
 */

import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';
import logger from '../utils/logger.js';

/**
 * Fetch active doctors associated with a patient.
 */
export async function fetchPatientActivePhysicians(patientId) {
  if (!patientId) return [];
  try {
    const q = query(
      collection(db, 'doctor_patient_relationships'),
      where('patientId', '==', patientId),
      where('status', '==', 'active')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[bloodworkService] Error fetching patient physicians:', err);
    return [];
  }
}

/**
 * Upload and link a bloodwork / lab result document.
 */
export async function submitBloodworkResult({
  patientId,
  patientName,
  doctorId,
  doctorName,
  notes,
  fileUrl = 'simulated_storage_url_123.pdf',
  fileName = 'analiticas_recientes.pdf'
}) {
  try {
    const docRef = await addDoc(collection(db, 'lab_results'), {
      patientId,
      patientName: patientName || 'Patient',
      doctorId,
      doctorName: doctorName || 'Médico',
      type: 'bloodwork',
      notes: notes || '',
      fileUrl,
      fileName,
      status: 'pending_review',
      uploadedAt: serverTimestamp()
    });
    logger.info('[bloodworkService] Bloodwork result submitted:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (err) {
    logger.error('[bloodworkService] Error submitting bloodwork result:', err);
    throw err;
  }
}
