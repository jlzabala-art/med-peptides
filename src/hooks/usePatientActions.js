import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from './useToast';
import { notifier } from '../services/NotificationService';

export function usePatientActions(onUpdateSuccess = null) {
  const { toast } = useToast();

  const handleBulkStatusChange = (ids, newStatus, clearSelection) => {
    if (!ids.length) return;
    notifier.confirmCritical(
      `Update status to "${newStatus}" for ${ids.length} patient(s)?`,
      async () => {
        try {
          await Promise.all(ids.map(id => updateDoc(doc(db, 'patients', id), { status: newStatus })));
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
      await updateDoc(doc(db, 'patients', patientId), { [field]: value });
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
          await Promise.all(ids.map(id => deleteDoc(doc(db, 'patients', id))));
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
