'use client';

import { useState, useEffect, useCallback } from 'react';

const RECENT_KEY = 'pls_recent_prescriptions_v1';

export function getRecentPrescriptions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentPrescription(item) {
  if (typeof window === 'undefined' || !item?.code) return [];
  try {
    const list = getRecentPrescriptions();
    const filtered = list.filter(p => String(p.code) !== String(item.code));
    const updated = [
      {
        code: String(item.code),
        patientName: item.patientName || item.name || 'Patient',
        title: item.title || item.treatmentTitle || 'Compounded Formula',
        date: item.date || item.prodDate || item.prescriptionDate || null,
        timestamp: Date.now()
      },
      ...filtered
    ].slice(0, 5); // Keep exactly last 5
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save recent prescription to localStorage:', e);
    return [];
  }
}

export function useRecentPrescriptions() {
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);

  useEffect(() => {
    setRecentPrescriptions(getRecentPrescriptions());
  }, []);

  const addRecent = useCallback((item) => {
    const updated = saveRecentPrescription(item);
    if (updated && updated.length > 0) {
      setRecentPrescriptions(updated);
    }
  }, []);

  const clearRecent = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_KEY);
      setRecentPrescriptions([]);
    }
  }, []);

  return {
    recentPrescriptions,
    addRecent,
    clearRecent
  };
}
