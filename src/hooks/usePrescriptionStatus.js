'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { notifyPrescriptionStatusUpdated } from '@/app/labels/utils/labelHelpers';
import {
  canEnterProduction,
  cascadeAxisChange,
  getEditableAxesForRole,
  resolvePrescriptionAxes,
} from '@/utils/prescriptions/statusWorkflow';

/**
 * usePrescriptionStatus
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable hook across `/labels`, `/admin`, `/doctor`, `/pharmacy`, and `/rx/[code]`
 * for managing the 5-axis prescription lifecycle (Clinical, Payment, Production,
 * Label Print, Logistics/Customs) with automatic cascade rules and payment gating.
 */
export function usePrescriptionStatus(
  prescription,
  { cleanCode = '', role = 'admin', isEs = false, onUpdated = null } = {}
) {
  const [axes, setAxes] = useState(() => resolvePrescriptionAxes(prescription));
  const [draft, setDraft] = useState(() => resolvePrescriptionAxes(prescription));
  const [isSaving, setIsSaving] = useState(false);
  const [cascadeNote, setCascadeNote] = useState('');

  useEffect(() => {
    const resolved = resolvePrescriptionAxes(prescription);
    setAxes(resolved);
    setDraft(resolved);
    setCascadeNote('');
  }, [
    prescription?.status,
    prescription?.clinicalStatus,
    prescription?.paymentStatus,
    prescription?.productionStatus,
    prescription?.labelStatus,
    prescription?.logisticsStatus,
    prescription?.a4PrintCount,
  ]);

  const editableAxes = getEditableAxesForRole(role);
  const isAdmin = editableAxes.length >= 5;

  const productionUnlocked = canEnterProduction({
    clinicalStatus: draft.clinicalStatus,
    paymentStatus: draft.paymentStatus,
  });

  const derivePrimaryStatus = useCallback((targetAxes) => {
    if (targetAxes.clinicalStatus === 'cancelled') return 'cancelled';
    if (targetAxes.logisticsStatus === 'delivered') return 'completed';
    if (targetAxes.logisticsStatus === 'in_transit_hub' || targetAxes.logisticsStatus === 'local_dispatch') {
      return 'en tránsito';
    }
    if (targetAxes.productionStatus === 'processing') return 'processing';
    if (targetAxes.clinicalStatus === 'approved') return 'approved';
    if (targetAxes.clinicalStatus === 'draft') return 'draft';
    return 'pending';
  }, []);

  const derivedPrimaryStatus = derivePrimaryStatus(axes);

  const updateDraftAxis = useCallback(
    (key, nextValue) => {
      setDraft((prev) => {
        const next = cascadeAxisChange(prev, key, nextValue, isAdmin);
        const changedOthers = Object.keys(next).filter((k) => k !== key && next[k] !== prev[k]);
        setCascadeNote(
          changedOthers.length > 0
            ? isEs
              ? 'Estados relacionados sincronizados automáticamente.'
              : 'Auto-synced related statuses.'
            : ''
        );
        return next;
      });
    },
    [isAdmin, isEs]
  );

  const resetDraft = useCallback(() => {
    setDraft(axes);
    setCascadeNote('');
  }, [axes]);

  const saveStatuses = useCallback(
    async (overrideAxes = null) => {
      const target = overrideAxes || draft;
      const nextPrimary = derivePrimaryStatus(target);
      const resolvedCode = String(cleanCode || prescription?.code || prescription?.fileNumber || prescription?.id || '').replace(/^#/, '').trim();

      setIsSaving(true);
      try {
        const res = await fetch('/api/prescriptions/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptionId: prescription?.id || prescription?.docId || undefined,
            prescriptionNumber: resolvedCode || undefined,
            code: resolvedCode || undefined,
            status: nextPrimary,
            axes: target,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to update status');
        setAxes(target);
        setDraft(target);
        setCascadeNote('');
        notifyPrescriptionStatusUpdated(resolvedCode, { status: nextPrimary, axes: target });
        if (onUpdated) onUpdated(resolvedCode, nextPrimary, target);
        toast.success(isEs ? 'Estados guardados en Firebase' : 'Workflow statuses saved to Firebase');
        return true;
      } catch (err) {
        toast.error(err?.message || (isEs ? 'Error al guardar estado' : 'Failed to save status'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [cleanCode, derivePrimaryStatus, draft, isEs, onUpdated, prescription?.code, prescription?.docId, prescription?.fileNumber, prescription?.id]
  );

  return {
    axes,
    draft,
    isSaving,
    cascadeNote,
    editableAxes,
    isAdmin,
    productionUnlocked,
    derivedPrimaryStatus,
    updateDraftAxis,
    resetDraft,
    saveStatuses,
  };
}
