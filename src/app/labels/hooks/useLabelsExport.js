'use client';

import { useCallback } from 'react';

/**
 * useLabelsExport
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable hook to trigger GMP label exports (A4 PDF, Zebra ZPL, Packing List)
 * and automatically synchronize `labelStatus: 'printed'` in Firestore.
 */
export function useLabelsExport({ currentRx = null, activeQueueItem = null } = {}) {
  const markPrintedInFirestore = useCallback(() => {
    const code = currentRx?.code || currentRx?.fileNumber || currentRx?.id || activeQueueItem?.code;
    if (!code) return;
    fetch('/api/prescriptions/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prescriptionId: currentRx?.id || undefined,
        prescriptionNumber: String(code).replace(/^#/, ''),
        code: String(code).replace(/^#/, ''),
        status: currentRx?.status || 'approved',
        axes: { labelStatus: 'printed' },
      }),
    }).catch(() => {});
  }, [activeQueueItem?.code, currentRx?.code, currentRx?.fileNumber, currentRx?.id, currentRx?.status]);

  return { markPrintedInFirestore };
}
