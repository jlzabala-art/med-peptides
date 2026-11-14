'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { detectOptimalLabelDimensions } from '@/utils/labels/containerDimensionDetector';
import {
  QUEUE_STORAGE_KEY,
  ACTIVE_RX_KEY,
  LABELED_STORAGE_KEY,
  getInitialLabeledSet,
  saveRecentPrescription
} from '../utils/labelHelpers';

export function useLabelsQueue({
  initialRx,
  initialLabels,
  initialCode,
  initialQueue,
  initialLabelIndex,
  lang,
  isEs,
  user,
  userProfile,
  setSearchOpen,
  setRecentPrescriptions
}) {
  const [patientQueue, setPatientQueue] = useState(() => {
    if (Array.isArray(initialQueue) && initialQueue.length > 0) {
      return initialQueue.map((item) => {
        const enrichedLabels = (item.labels || []).map((lbl) => {
          const opt = detectOptimalLabelDimensions(lbl);
          return {
            ...lbl,
            widthMm: lbl.widthMm || opt.widthMm,
            heightMm: lbl.heightMm || opt.heightMm,
            containerTag: opt.containerTag
          };
        });
        const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || item.rx);
        return {
          ...item,
          labels: enrichedLabels,
          selectedPartIndex: 'all',
          variant: 'backQr',
          widthMm: firstOpt.widthMm,
          heightMm: firstOpt.heightMm,
          containerTag: firstOpt.containerTag
        };
      });
    }
    if (initialRx) {
      const enrichedLabels = (initialLabels || []).map((lbl) => {
        const opt = detectOptimalLabelDimensions(lbl);
        return {
          ...lbl,
          widthMm: lbl.widthMm || opt.widthMm,
          heightMm: lbl.heightMm || opt.heightMm,
          containerTag: opt.containerTag
        };
      });
      const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || initialRx);
      return [{
        code: initialCode,
        rx: initialRx,
        labels: enrichedLabels,
        selectedPartIndex: 'all',
        variant: 'backQr',
        widthMm: firstOpt.widthMm,
        heightMm: firstOpt.heightMm,
        containerTag: firstOpt.containerTag
      }];
    }
    return [];
  });

  const [activeQueueIndex, setActiveQueueIndex] = useState(0);
  const [currentRx, setCurrentRx] = useState(initialRx);
  const [labels, setLabels] = useState(initialLabels);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [labelIndex, setLabelIndex] = useState(typeof initialLabelIndex === 'number' ? initialLabelIndex : 0);
  const [isLoadingRx, setIsLoadingRx] = useState(false);
  const [isApprovingRx, setIsApprovingRx] = useState(false);
  const [isBatchApproving, setIsBatchApproving] = useState(false);
  const [labeledMap, setLabeledMap] = useState(getInitialLabeledSet);

  const operatorName = user?.displayName || userProfile?.firstName || user?.email?.split('@')[0] || 'Pharmacy Staff';

  const updateUrlWithQueue = useCallback((queue, activeIdx, partIdx = 0) => {
    if (typeof window === 'undefined') return;
    try {
      const codesStr = queue.map(p => p.code).join(',');
      if (codesStr) {
        const activeP = queue[activeIdx];
        const rxQuery = activeP?.code === queue[0]?.code
          ? codesStr
          : [activeP?.code, ...queue.filter((_, i) => i !== activeIdx).map(p => p.code)].filter(Boolean).join(',');
        const newUrl = `/labels?rx=${encodeURIComponent(rxQuery)}&phase=${partIdx + 1}&lang=${lang}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      } else {
        const newUrl = `/labels?lang=${lang}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }
    } catch { /* ignore */ }
  }, [lang]);

  // Hydrate initial saved format overrides + active code from localStorage
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (savedRaw) {
        const savedMap = JSON.parse(savedRaw);
        setPatientQueue(prev => prev.map(pItem => {
          const s = savedMap[pItem.code];
          if (!s) return pItem;
          return {
            ...pItem,
            widthMm: s.widthMm ?? pItem.widthMm,
            heightMm: s.heightMm ?? pItem.heightMm,
            variant: s.variant ?? pItem.variant,
            selectedPartIndex: s.selectedPartIndex ?? pItem.selectedPartIndex,
            selectedPreset: s.selectedPreset ?? pItem.selectedPreset
          };
        }));
      }
    } catch { /* ignore */ }
  }, []);

  // Persist format overrides & active code
  useEffect(() => {
    if (typeof window === 'undefined' || patientQueue.length === 0) return;
    try {
      const formatMap = {};
      patientQueue.forEach(p => {
        formatMap[p.code] = {
          widthMm: p.widthMm,
          heightMm: p.heightMm,
          variant: p.variant,
          selectedPartIndex: p.selectedPartIndex,
          selectedPreset: p.selectedPreset
        };
      });
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(formatMap));
      if (activeCode) localStorage.setItem(ACTIVE_RX_KEY, activeCode);
    } catch { /* ignore */ }
  }, [patientQueue, activeCode]);

  // Hydrate Firestore labeledParts into local labeledMap when currentRx changes
  useEffect(() => {
    if (!currentRx?.labeledParts) return;
    const code = String(currentRx.fileNumber || currentRx.code || activeCode || '').trim().toUpperCase();
    if (!code) return;
    setLabeledMap((prev) => {
      const next = { ...prev };
      let changed = false;
      Object.entries(currentRx.labeledParts).forEach(([k, val]) => {
        const partIdx = k.replace('part-', '');
        const key = `${code}-${partIdx}`;
        if (val?.labeled && !next[key]) {
          next[key] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [currentRx, activeCode]);

  const handleSwitchActivePatient = useCallback((idx, targetPartIndex = null) => {
    if (idx < 0 || idx >= patientQueue.length) return;
    setActiveQueueIndex(idx);
    const item = patientQueue[idx];
    setCurrentRx(item.rx);
    setLabels(item.labels);
    setActiveCode(item.code);
    const nextPart = typeof targetPartIndex === 'number'
      ? targetPartIndex
      : (item.selectedPartIndex && item.selectedPartIndex !== 'all' ? Number(item.selectedPartIndex) : 0);
    setLabelIndex(nextPart);
    updateUrlWithQueue(patientQueue, idx, nextPart);
  }, [patientQueue, updateUrlWithQueue]);

  const handleSelectOrAddPatient = useCallback(async (code, activateImmediately = true) => {
    if (!code) return;
    const cleanCode = String(code).trim();
    const existingIdx = patientQueue.findIndex(p => String(p.code).toUpperCase() === cleanCode.toUpperCase());

    if (existingIdx >= 0) {
      if (activateImmediately) handleSwitchActivePatient(existingIdx);
      setSearchOpen?.(false);
      return;
    }

    setIsLoadingRx(true);
    try {
      const res = await fetch(`/api/labels/load?code=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();
      if (data?.success && data.rx) {
        const enrichedLabels = (data.labels || []).map((lbl) => {
          const opt = detectOptimalLabelDimensions(lbl);
          return {
            ...lbl,
            widthMm: lbl.widthMm || opt.widthMm,
            heightMm: lbl.heightMm || opt.heightMm,
            containerTag: opt.containerTag
          };
        });
        const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || data.rx);
        const newItem = {
          code: cleanCode,
          rx: data.rx,
          labels: enrichedLabels,
          selectedPartIndex: 'all',
          variant: 'backQr',
          widthMm: firstOpt.widthMm,
          heightMm: firstOpt.heightMm,
          containerTag: firstOpt.containerTag
        };

        const nextQueue = [...patientQueue, newItem];
        setPatientQueue(nextQueue);

        if (activateImmediately) {
          const newIdx = nextQueue.length - 1;
          setActiveQueueIndex(newIdx);
          setCurrentRx(data.rx);
          setLabels(enrichedLabels);
          setActiveCode(cleanCode);
          setLabelIndex(0);
          updateUrlWithQueue(nextQueue, newIdx, 0);
          setSearchOpen?.(false);
        } else {
          updateUrlWithQueue(nextQueue, activeQueueIndex, labelIndex);
        }

        const updated = saveRecentPrescription({
          code: cleanCode,
          patientName: data.rx.patient?.name || data.rx.patientName || 'Patient',
          title: data.rx.treatmentTitle || 'Compounded Formula',
          date: data.rx.prescriptionDate || data.rx.date || null
        });
        if (updated?.length > 0) setRecentPrescriptions?.(updated);
      } else {
        toast.error(isEs ? `No se encontraron datos para #${cleanCode}` : `No data found for #${cleanCode}`);
      }
    } catch (err) {
      console.error('Error adding patient to batch:', err);
      toast.error(isEs ? 'Error al cargar la prescripción' : 'Failed to load prescription');
    } finally {
      setIsLoadingRx(false);
    }
  }, [patientQueue, handleSwitchActivePatient, setSearchOpen, updateUrlWithQueue, activeQueueIndex, labelIndex, setRecentPrescriptions, isEs]);

  const handleAddMultipleToQueue = useCallback(async (codes = []) => {
    const uniqueNewCodes = codes
      .map(c => String(c).trim())
      .filter(c => c && !patientQueue.some(p => String(p.code).toUpperCase() === c.toUpperCase()));

    if (uniqueNewCodes.length === 0) {
      toast(isEs ? 'Todas esas recetas ya están en el lote' : 'All selected prescriptions are already in the queue');
      return;
    }

    setIsLoadingRx(true);
    try {
      const settled = await Promise.allSettled(
        uniqueNewCodes.slice(0, 15).map(async (c) => {
          const res = await fetch(`/api/labels/load?code=${encodeURIComponent(c)}`);
          const data = await res.json();
          if (!data?.success || !data.rx) return null;
          const enrichedLabels = (data.labels || []).map((lbl) => {
            const opt = detectOptimalLabelDimensions(lbl);
            return {
              ...lbl,
              widthMm: lbl.widthMm || opt.widthMm,
              heightMm: lbl.heightMm || opt.heightMm,
              containerTag: opt.containerTag
            };
          });
          const firstOpt = detectOptimalLabelDimensions(enrichedLabels[0] || data.rx);
          return {
            code: c,
            rx: data.rx,
            labels: enrichedLabels,
            selectedPartIndex: 'all',
            variant: 'backQr',
            widthMm: firstOpt.widthMm,
            heightMm: firstOpt.heightMm,
            containerTag: firstOpt.containerTag
          };
        })
      );

      const loaded = settled
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      if (loaded.length === 0) {
        toast.error(isEs ? 'No se pudieron cargar las recetas pendientes' : 'Could not load pending prescriptions');
        return;
      }

      const nextQueue = [...patientQueue, ...loaded];
      setPatientQueue(nextQueue);
      if (patientQueue.length === 0 && loaded[0]) {
        setActiveQueueIndex(0);
        setCurrentRx(loaded[0].rx);
        setLabels(loaded[0].labels);
        setActiveCode(loaded[0].code);
        setLabelIndex(0);
        updateUrlWithQueue(nextQueue, 0, 0);
      } else {
        updateUrlWithQueue(nextQueue, activeQueueIndex, labelIndex);
      }

      toast.success(
        isEs
          ? `+${loaded.length} recetas añadidas al lote`
          : `+${loaded.length} prescriptions added to batch`
      );
    } finally {
      setIsLoadingRx(false);
    }
  }, [patientQueue, isEs, updateUrlWithQueue, activeQueueIndex, labelIndex]);

  const handleRemoveFromQueue = useCallback((idxToRemove, e) => {
    e?.stopPropagation?.();
    const nextQueue = patientQueue.filter((_, idx) => idx !== idxToRemove);
    setPatientQueue(nextQueue);

    if (nextQueue.length === 0) {
      setCurrentRx(null);
      setLabels([]);
      setActiveCode('');
      setActiveQueueIndex(0);
      setLabelIndex(0);
      updateUrlWithQueue([], 0, 0);
      return;
    }

    let nextIdx = activeQueueIndex;
    if (idxToRemove === activeQueueIndex) {
      nextIdx = Math.min(idxToRemove, nextQueue.length - 1);
      const nextItem = nextQueue[nextIdx];
      setActiveQueueIndex(nextIdx);
      setCurrentRx(nextItem.rx);
      setLabels(nextItem.labels);
      setActiveCode(nextItem.code);
      setLabelIndex(0);
    } else if (idxToRemove < activeQueueIndex) {
      nextIdx = activeQueueIndex - 1;
      setActiveQueueIndex(nextIdx);
    }
    updateUrlWithQueue(nextQueue, nextIdx, 0);
  }, [patientQueue, activeQueueIndex, updateUrlWithQueue]);

  const handleUpdatePatientConfig = useCallback((idx, changes) => {
    setPatientQueue(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const updated = { ...p, ...changes };
      if ((changes.widthMm || changes.heightMm || changes.variant || changes.fontScale) && Array.isArray(p.labels)) {
        updated.labels = p.labels.map(l => ({
          ...l,
          widthMm: changes.widthMm ?? l.widthMm,
          heightMm: changes.heightMm ?? l.heightMm,
          variant: changes.variant ?? l.variant,
          fontScale: changes.fontScale ?? l.fontScale
        }));
      }
      return updated;
    }));
    if (idx === activeQueueIndex && (changes.widthMm || changes.heightMm || changes.variant || changes.fontScale)) {
      setLabels(prev => prev.map(l => ({
        ...l,
        widthMm: changes.widthMm ?? l.widthMm,
        heightMm: changes.heightMm ?? l.heightMm,
        variant: changes.variant ?? l.variant,
        fontScale: changes.fontScale ?? l.fontScale
      })));
    }
  }, [activeQueueIndex]);

  const handleBatchUpdateLotBud = useCallback(({ batchNumber, expiryDate }) => {
    setPatientQueue(prev => prev.map(pItem => ({
      ...pItem,
      labels: (pItem.labels || []).map(lbl => ({
        ...lbl,
        ...(batchNumber ? { batchNumber, lotNumber: batchNumber } : {}),
        ...(expiryDate ? { expiryDate, bud: expiryDate } : {})
      }))
    })));
    setLabels(prev => prev.map(lbl => ({
      ...lbl,
      ...(batchNumber ? { batchNumber, lotNumber: batchNumber } : {}),
      ...(expiryDate ? { expiryDate, bud: expiryDate } : {})
    })));
    toast.success(isEs ? 'Lote y caducidad aplicados a todo el lote' : 'Batch # & BUD applied to entire queue');
  }, [isEs]);

  const handleToggleLabeled = useCallback((code, partIdx = labelIndex) => {
    const clean = String(code || activeCode || '').trim().toUpperCase();
    if (!clean) return;
    const key = `${clean}-${partIdx}`;
    const nextVal = !labeledMap[key];

    setLabeledMap(prev => {
      const next = { ...prev, [key]: nextVal };
      try {
        localStorage.setItem(LABELED_STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });

    // Sync to Firestore in background for multi-operator visibility
    fetch('/api/labels/labeled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: clean,
        docId: currentRx?.id || clean,
        partIdx,
        labeled: nextVal,
        updatedBy: operatorName
      })
    }).catch(() => {});

    toast.success(
      nextVal
        ? (isEs ? `Frasco Parte ${partIdx + 1} marcado como etiquetado ✓` : `Bottle Part ${partIdx + 1} marked as labeled ✓`)
        : (isEs ? `Marca de etiquetado removida` : `Labeled check removed`)
    );
  }, [activeCode, labelIndex, labeledMap, currentRx, operatorName, isEs]);

  const handleApprovePrescription = useCallback(async () => {
    if (!currentRx) return;
    const targetDocId = currentRx.id || currentRx.code || activeCode;
    if (!targetDocId) return;

    setIsApprovingRx(true);
    try {
      const rxRef = doc(db, 'prescriptions', targetDocId);
      await updateDoc(rxRef, {
        status: 'approved',
        isSigned: true,
        approvedAt: new Date().toISOString(),
        approvedBy: user?.email || operatorName
      });

      const updatedRx = { ...currentRx, status: 'approved', isSigned: true };
      setCurrentRx(updatedRx);
      setPatientQueue(prev => prev.map((p, i) => i === activeQueueIndex ? { ...p, rx: updatedRx } : p));
      toast.success(isEs ? 'Prescripción aprobada y lista para despacho ✓' : 'Prescription approved & ready ✓');
    } catch (err) {
      console.error('Error approving prescription:', err);
      toast.error(isEs ? 'Error al aprobar la prescripción' : 'Failed to approve prescription');
    } finally {
      setIsApprovingRx(false);
    }
  }, [currentRx, activeCode, activeQueueIndex, user, operatorName, isEs]);

  const handleBatchApprove = useCallback(async () => {
    const pendingItems = patientQueue
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => (p.rx?.status || p.rx?.state) !== 'approved' && !p.rx?.isSigned);

    if (pendingItems.length === 0) return;

    setIsBatchApproving(true);
    try {
      await Promise.all(pendingItems.map(async ({ p }) => {
        const docId = p.rx?.id || p.rx?.code || p.code;
        if (!docId) return;
        const rxRef = doc(db, 'prescriptions', docId);
        await updateDoc(rxRef, {
          status: 'approved',
          isSigned: true,
          approvedAt: new Date().toISOString(),
          approvedBy: user?.email || operatorName
        });
      }));

      setPatientQueue(prev => prev.map(p => ({
        ...p,
        rx: { ...p.rx, status: 'approved', isSigned: true }
      })));
      if (currentRx) setCurrentRx(prev => ({ ...prev, status: 'approved', isSigned: true }));
      toast.success(isEs ? `${pendingItems.length} recetas aprobadas en lote ✓` : `${pendingItems.length} prescriptions approved ✓`);
    } catch (err) {
      console.error('Batch approve error:', err);
      toast.error(isEs ? 'Error en aprobación masiva' : 'Batch approval failed');
    } finally {
      setIsBatchApproving(false);
    }
  }, [patientQueue, currentRx, user, operatorName, isEs]);

  return {
    patientQueue,
    setPatientQueue,
    activeQueueIndex,
    setActiveQueueIndex,
    currentRx,
    setCurrentRx,
    labels,
    setLabels,
    activeCode,
    setActiveCode,
    labelIndex,
    setLabelIndex,
    isLoadingRx,
    isApprovingRx,
    isBatchApproving,
    labeledMap,
    updateUrlWithQueue,
    handleSelectOrAddPatient,
    handleAddMultipleToQueue,
    handleSwitchActivePatient,
    handleRemoveFromQueue,
    handleUpdatePatientConfig,
    handleBatchUpdateLotBud,
    handleToggleLabeled,
    handleApprovePrescription,
    handleBatchApprove
  };
}
