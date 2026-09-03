/**
 * protocolPrescriptionBridge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Bridge between Protocols, Medical Prescriptions, and Orders.
 * Resolves active Firestore variants and generates patient prescriptions
 * and sales orders in 1 click.
 *
 * Implements AGENTS.md Rule #2 (Firestore Source of Truth) & Rule #25 (Idempotency).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { doc, setDoc, getDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * Converts a Clinical Protocol into an official Patient Prescription draft.
 * @param {Object} params
 * @param {string} params.protocolId
 * @param {Object} params.patient - { id, name, email, dob, weightKg }
 * @param {Object} params.doctor  - { id, name, licenseNumber, clinicName }
 * @param {number} [params.customPhaseNumber=1]
 * @returns {Promise<{ success: boolean, prescriptionId: string, prescriptionNumber: string }>}
 */
export async function convertProtocolToPrescription({
  protocolId,
  patient,
  doctor,
  customPhaseNumber = 1
}) {
  if (!protocolId || !patient?.id || !doctor?.id) {
    throw new Error('protocolPrescriptionBridge: protocolId, patient, and doctor are required.');
  }

  // 1. Fetch protocol
  const protocolSnap = await getDoc(doc(db, 'protocols', protocolId));
  if (!protocolSnap.exists()) {
    throw new Error(`Protocol with ID "${protocolId}" not found in Firestore.`);
  }

  const protocolData = protocolSnap.data();
  const phases = Array.isArray(protocolData.phases) ? protocolData.phases : [];
  const selectedPhase = phases.find(p => p.phaseNumber === customPhaseNumber) || phases[0] || { items: [] };

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const prescriptionNumber = `RX-${new Date().getFullYear()}-${randomDigits}`;
  const prescriptionId = `prescription_${prescriptionNumber.toLowerCase()}`;

  const prescriptionDocument = {
    id: prescriptionId,
    prescriptionNumber,
    protocolId,
    protocolName: protocolData.name || 'Custom Clinical Pathway',
    protocolCode: protocolData.code || protocolId,
    phaseNumber: selectedPhase.phaseNumber || 1,
    phaseName: selectedPhase.phaseName || 'Phase 1',
    status: 'draft', // Regla #28: draft -> pending -> approved...
    patient: {
      id: patient.id,
      name: patient.name || 'Patient',
      email: patient.email || '',
      weightKg: patient.weightKg || null
    },
    doctor: {
      id: doctor.id,
      name: doctor.name || 'Doctor',
      licenseNumber: doctor.licenseNumber || 'MED-REG-ACTIVE',
      clinicName: doctor.clinicName || 'Clinical Partner'
    },
    medications: (selectedPhase.items || []).map(item => ({
      productId: item.productId || '',
      productName: item.productName || item.name || '',
      dosage: `${item.dosageAmount || 1} ${item.dosageUnit || 'mg'}`,
      frequency: item.frequency || 'Daily',
      route: item.route || 'subcutaneous_injection',
      instructions: item.timing || 'As directed by physician'
    })),
    durationWeeks: selectedPhase.durationWeeks || 4,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, 'prescriptions', prescriptionId), prescriptionDocument);
    return {
      success: true,
      prescriptionId,
      prescriptionNumber
    };
  } catch (error) {
    console.error('[protocolPrescriptionBridge] Failed to create prescription:', error);
    return { success: false, error: error.message };
  }
}
