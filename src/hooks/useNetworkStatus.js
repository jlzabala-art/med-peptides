"use client";

import { useState, useEffect, useCallback } from 'react';
import { triggerHaptic } from '../utils/haptics';

/**
 * useNetworkStatus
 * ─────────────────────────────────────────────────────────────────────────────
 * Realtime hook to monitor browser online/offline status with reconnect detection.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    triggerHaptic('success');
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
    triggerHaptic('error');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
}

export default useNetworkStatus;
