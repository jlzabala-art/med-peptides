'use client';

import { useState, useEffect, useCallback } from 'react';

const RECENT_KEY = 'pls_recent_prescriptions_v1';

export function sanitizeRecentCode(raw) {
  if (!raw) return '';
  const str = String(raw).trim();
  const boxMatch = str.match(/\b(BOX[0-9]{4,6}[A-Z0-9]+)\b/i);
  if (boxMatch) return boxMatch[1].toUpperCase();
  const rxMatch = str.match(/\b(RX-[A-Z0-9-]+)\b/i);
  if (rxMatch) return rxMatch[1].toUpperCase();
  const digitMatch = str.match(/\b\d{4,8}\b/);
  if (digitMatch) return digitMatch[0];
  return str.replace(/\s*\(.*?\)/g, '').split(/[;,\n]/)[0].trim().slice(0, 24);
}

export function cleanRecentTitle(raw) {
  if (!raw) return 'Compounded Formula';
  return String(raw)
    .replace(/\s*\(Sample Code.*?\)/gi, '')
    .replace(/No specific Rx number.*$/gi, '')
    .trim() || 'Compounded Formula';
}

export function getRecentPrescriptions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const seenPatients = new Map();
    for (const item of list) {
      if (!item) continue;
      const cleanCode = sanitizeRecentCode(item.code);
      const cleanName = String(item.patientName || item.name || 'Patient').trim();
      const normName = cleanName.toLowerCase();

      if (seenPatients.has(normName)) {
        const existing = seenPatients.get(normName);
        if (cleanCode.startsWith('BOX') && !existing.code.startsWith('BOX')) {
          seenPatients.set(normName, {
            ...item,
            code: cleanCode,
            patientName: cleanName,
            title: cleanRecentTitle(item.title)
          });
        }
      } else {
        seenPatients.set(normName, {
          ...item,
          code: cleanCode,
          patientName: cleanName,
          title: cleanRecentTitle(item.title)
        });
      }
    }

    const cleaned = Array.from(seenPatients.values()).slice(0, 5);

    if (JSON.stringify(cleaned) !== raw) {
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(cleaned));
      } catch {}
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveRecentPrescription(item) {
  if (typeof window === 'undefined' || !item?.code) return [];
  try {
    const list = getRecentPrescriptions();
    const cleanCode = sanitizeRecentCode(item.code);
    const cleanName = String(item.patientName || item.name || 'Patient').trim();
    const cleanTitle = cleanRecentTitle(item.title || item.treatmentTitle);

    const filtered = list.filter(p => {
      const pCode = sanitizeRecentCode(p.code);
      const pName = String(p.patientName || p.name || '').trim().toLowerCase();
      return pCode !== cleanCode && pName !== cleanName.toLowerCase();
    });

    const updated = [
      {
        code: cleanCode,
        patientName: cleanName,
        title: cleanTitle,
        date: item.date || item.prodDate || item.prescriptionDate || null,
        timestamp: Date.now()
      },
      ...filtered
    ].slice(0, 5);
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
