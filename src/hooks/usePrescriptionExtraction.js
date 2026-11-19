'use client';

import { useState, useCallback } from 'react';
import {
  extractPrescriptionFromDocument,
  normalizeExtractedPrescriptions,
  checkDuplicatesInFirestore,
  savePrescriptionsToFirestore,
} from '@/services/prescriptionAiService';

/**
 * usePrescriptionExtraction
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared React hook unifying the AI prescription & lab/genomic extraction logic
 * used across both `/labels` (ImportPrescriptionModal) and `/dr/[slug]`
 * (PrescriptionIntakeWorkspace), without any label-printing UI dependencies.
 */
export function usePrescriptionExtraction({
  doctorContext = null,
  persistEndpoint = null,
  mode = 'doctor_portal',
} = {}) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [rawExtracted, setRawExtracted] = useState(null);
  const [normalizedList, setNormalizedList] = useState([]);

  const extractRawDocument = useCallback(async (file) => {
    if (!file) return null;
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const raw = await extractPrescriptionFromDocument(file);
      setRawExtracted(raw);
      return raw;
    } catch (err) {
      setExtractionError(err?.message || 'Failed to analyze prescription document');
      throw err;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const extractFile = useCallback(async (file, extraOptions = {}) => {
    if (!file) return null;
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const raw = await extractPrescriptionFromDocument(file);
      setRawExtracted(raw);
      const normalized = await normalizeExtractedPrescriptions(raw, {
        currentUser: extraOptions.currentUser || null,
        context: doctorContext || {},
        splitBlocksIntoSeparatePrescriptions: extraOptions.splitBlocksIntoSeparatePrescriptions ?? false,
      });
      const list = Array.isArray(normalized) ? normalized : [normalized].filter(Boolean);
      const deduplicated = extraOptions.skipDedupe ? list : await checkDuplicatesInFirestore(list);
      setNormalizedList(deduplicated);
      return { raw, normalized: deduplicated };
    } catch (err) {
      setExtractionError(err?.message || 'Failed to analyze prescription document');
      throw err;
    } finally {
      setIsExtracting(false);
    }
  }, [doctorContext]);

  const saveExtracted = useCallback(async (prescriptionsToSave, saveOptions = {}) => {
    const items = Array.isArray(prescriptionsToSave) ? prescriptionsToSave : normalizedList;
    if (!items || items.length === 0) return [];
    setIsSaving(true);
    try {
      if (persistEndpoint) {
        const res = await fetch(persistEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prescriptions: items,
            doctorContext,
            mode,
            ...saveOptions,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to persist prescriptions');
        return data?.prescriptions || data?.created || [data];
      }
      return await savePrescriptionsToFirestore(items, {
        doctorContext,
        mode,
        ...saveOptions,
      });
    } finally {
      setIsSaving(false);
    }
  }, [normalizedList, persistEndpoint, doctorContext, mode]);

  const resetExtraction = useCallback(() => {
    setRawExtracted(null);
    setNormalizedList([]);
    setExtractionError(null);
  }, []);

  return {
    isExtracting,
    isSaving,
    extractionError,
    rawExtracted,
    normalizedList,
    setNormalizedList,
    extractRawDocument,
    extractFile,
    saveExtracted,
    resetExtraction,
  };
}

export default usePrescriptionExtraction;
