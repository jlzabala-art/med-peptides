import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './useToast';
import { notifier } from '../services/NotificationService';

const PATIENT_PROFILE_FIELDS = new Set([
  'dateOfBirth', 'gender', 'bloodType', 'allergies',
  'currentConditions', 'assignedDoctorId', 'assignedClinicId',
  'activeProtocols', 'prescriptionsCount', 'medicalNotes'
]);

export function usePatientActions(onUpdateSuccess = null) {
  const { toast } = useToast();

  const handleBulkStatusChange = (ids, newStatus, clearSelection) => {
    if (!ids.length) return;
    notifier.confirmCritical(
      `Update status to "${newStatus}" for ${ids.length} patient(s)?`,
      async () => {
        try {
          const now = new Date().toISOString();
          await Promise.all(ids.flatMap(id => [
            updateDoc(doc(db, 'patients', id), { status: newStatus, updatedAt: serverTimestamp() }).catch(() => {}),
            setDoc(doc(db, 'customers', id), { status: newStatus, updatedAt: now }, { merge: true }).catch(() => {})
          ]));
          if (clearSelection) clearSelection();
          toast.success(`${ids.length} patients updated.`);
        } catch (err) {
          toast.error('Failed to update patients: ' + err.message);
        }
      }
    );
  };

  const handleFieldUpdate = async (patientId, field, value) => {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, 'patients', patientId), { [field]: value, updatedAt: serverTimestamp() });

      // Dual-sync to customers SSOT
      const customerUpdate = { updatedAt: now };
      if (PATIENT_PROFILE_FIELDS.has(field)) {
        customerUpdate[`patientProfile.${field}`] = value;
      } else {
        customerUpdate[field] = value;
      }
      await setDoc(doc(db, 'customers', patientId), customerUpdate, { merge: true }).catch(() => {});

      toast.success(`Patient updated successfully`);
      if (onUpdateSuccess) {
        onUpdateSuccess(patientId, field, value);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update patient');
      throw err;
    }
  };

  const handleBulkDelete = (ids, clearSelection) => {
    if (!ids.length) return;
    notifier.confirmCritical(
      `Permanently delete ${ids.length} patient(s)? This action cannot be undone.`,
      async () => {
        try {
          const now = new Date().toISOString();
          await Promise.all(ids.flatMap(id => [
            deleteDoc(doc(db, 'patients', id)).catch(() => {}),
            setDoc(doc(db, 'customers', id), { status: 'archived', updatedAt: now }, { merge: true }).catch(() => {})
          ]));
          if (clearSelection) clearSelection();
          toast.success(`${ids.length} patients deleted.`);
        } catch (err) {
          toast.error('Failed to delete patients: ' + err.message);
        }
      }
    );
  };

  return {
    handleBulkStatusChange,
    handleFieldUpdate,
    handleBulkDelete
  };
}
