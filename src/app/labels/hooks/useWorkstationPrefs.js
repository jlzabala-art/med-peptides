'use client';

import { useState, useEffect, useCallback } from 'react';

const PREFS_KEY = 'pls_workstation_prefs_v1';

const DEFAULT_PREFS = {
  preferredFormat: 'a4', // 'a4' | 'zpl'
  preferredEditMode: false,
  startOffset: 0,
  zplDpi: 203
};

/**
 * useWorkstationPrefs
 * ─────────────────────────────────────────────────────────────────────────────
 * Persists operator workstation preferences (default printer format, A4 start
 * offset, default edit/print mode, ZPL DPI) across sessions.
 */
export function useWorkstationPrefs() {
  const [prefs, setPrefs] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch { /* storage unavailable */ }
  }, [prefs]);

  const updatePref = useCallback((key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }, []);

  return { prefs, updatePref };
}
