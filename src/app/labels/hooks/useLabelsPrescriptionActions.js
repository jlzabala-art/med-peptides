'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { notifyPrescriptionMutation } from '../utils/labelHelpers';

/**
 * Encapsulates prescription part-level mutations (remove & restore)
 * inside the Prescriptions & Label Studio workstation.
 */
export function useLabelsPrescriptionActions({
  currentRx,
  cleanRxCode,
  activeCode,
  labels,
  activeQueueIndex,
  patientQueue,
  isEs,
  setLabels,
  setCurrentRx,
  setPatientQueue,
  setLabelIndex,
  updateUrlWithQueue,
  onPartsChanged,
}) {
  const [removingPartIndex, setRemovingPartIndex] = useState(null);

  const handleRemoveLabelPart = useCallback(async (partIdx, reason) => {
    const targetId = currentRx?.id || cleanRxCode || activeCode;
    if (!targetId) return;
    setRemovingPartIndex(partIdx);
    try {
      const res = await fetch('/api/labels/remove-part', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawId: targetId,
          partIndex: partIdx,
          labelsSnapshot: labels,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not remove part');
      setLabels(data.labels || []);
      setCurrentRx((prev) =>
        prev ? { ...prev, pharmacyLabels: data.labels, parts: data.parts, removedParts: data.removedParts } : prev
      );
      setPatientQueue((prev) =>
        prev.map((q, qIdx) => (qIdx === activeQueueIndex ? { ...q, labels: data.labels } : q))
      );
      const nextIdx = typeof data.nextIndex === 'number' ? data.nextIndex : 0;
      setLabelIndex(nextIdx);
      updateUrlWithQueue(patientQueue, activeQueueIndex, nextIdx);

      // Reactively sync with Worklist table and cross-tab BroadcastChannel
      notifyPrescriptionMutation(targetId, {
        partsCount: data.labels?.length,
        labels: data.labels,
        parts: data.parts,
        removedParts: data.removedParts,
      });
      if (onPartsChanged) {
        onPartsChanged(targetId, {
          partsCount: data.labels?.length,
          labels: data.labels,
          parts: data.parts,
          removedParts: data.removedParts,
        });
      }

      toast.success(isEs ? 'Parte eliminada de la prescripción' : 'Part removed from prescription');
    } catch (err) {
      toast.error(err.message || (isEs ? 'Error al eliminar la parte' : 'Error removing part'));
    } finally {
      setRemovingPartIndex(null);
    }
  }, [
    currentRx?.id,
    cleanRxCode,
    activeCode,
    labels,
    activeQueueIndex,
    patientQueue,
    isEs,
    setLabels,
    setCurrentRx,
    setPatientQueue,
    setLabelIndex,
    updateUrlWithQueue,
    onPartsChanged,
  ]);

  const handleRestoreRemovedPart = useCallback(async (removedIdx = 0) => {
    const targetId = currentRx?.id || cleanRxCode || activeCode;
    if (!targetId) return;
    try {
      const res = await fetch('/api/labels/remove-part', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawId: targetId, removedIndex: removedIdx }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not restore part');
      setLabels(data.labels || []);
      setCurrentRx((prev) =>
        prev ? { ...prev, pharmacyLabels: data.labels, parts: data.parts, removedParts: data.removedParts } : prev
      );
      setPatientQueue((prev) =>
        prev.map((q, qIdx) => (qIdx === activeQueueIndex ? { ...q, labels: data.labels } : q))
      );
      const restoredIdx = typeof data.restoredIndex === 'number' ? data.restoredIndex : 0;
      setLabelIndex(restoredIdx);
      updateUrlWithQueue(patientQueue, activeQueueIndex, restoredIdx);

      // Reactively sync with Worklist table and cross-tab BroadcastChannel
      notifyPrescriptionMutation(targetId, {
        partsCount: data.labels?.length,
        labels: data.labels,
        parts: data.parts,
        removedParts: data.removedParts,
      });
      if (onPartsChanged) {
        onPartsChanged(targetId, {
          partsCount: data.labels?.length,
          labels: data.labels,
          parts: data.parts,
          removedParts: data.removedParts,
        });
      }

      toast.success(isEs ? 'Parte restaurada en la prescripción' : 'Part restored to prescription');
    } catch (err) {
      toast.error(err.message || (isEs ? 'Error al restaurar' : 'Error restoring part'));
    }
  }, [
    currentRx?.id,
    cleanRxCode,
    activeCode,
    activeQueueIndex,
    patientQueue,
    isEs,
    setLabels,
    setCurrentRx,
    setPatientQueue,
    setLabelIndex,
    updateUrlWithQueue,
    onPartsChanged,
  ]);

  return {
    removingPartIndex,
    handleRemoveLabelPart,
    handleRestoreRemovedPart,
  };
}
