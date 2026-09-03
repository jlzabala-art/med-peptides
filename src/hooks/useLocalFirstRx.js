'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getLocalEntity, 
  saveLocalEntity, 
  getOfflineSyncQueue, 
  flushOfflineSyncQueue 
} from '@/lib/offlineSyncEngine';

export function useLocalFirstRx(prescriptionId) {
  const [rxData, setRxData] = useState(() => {
    return prescriptionId ? getLocalEntity('prescriptions', prescriptionId) : null;
  });
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitor network status and sync queue
  useEffect(() => {
    const updateStatus = () => {
      setIsOffline(!navigator.onLine);
      const queue = getOfflineSyncQueue();
      setPendingSyncCount(queue.length);
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  // Save prescription locally with 0ms latency and schedule background sync
  const saveDraftLocally = useCallback((data) => {
    if (!prescriptionId) return;
    setRxData(data);
    saveLocalEntity('prescriptions', prescriptionId, data);
    setPendingSyncCount(getOfflineSyncQueue().length);

    // Attempt instant sync if online
    if (navigator.onLine) {
      flushOfflineSyncQueue().then(() => {
        setPendingSyncCount(getOfflineSyncQueue().length);
      });
    }
  }, [prescriptionId]);

  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await flushOfflineSyncQueue();
      setPendingSyncCount(getOfflineSyncQueue().length);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    rxData,
    isOffline,
    pendingSyncCount,
    isSyncing,
    saveDraftLocally,
    triggerManualSync
  };
}
