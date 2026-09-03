"use client";

import { useState, useMemo } from 'react';

/**
 * @typedef {Object} ProtocolLifespanResult
 * @property {string} reconstitutedDate - ISO date string of vial reconstitution.
 * @property {(date: string) => void} setReconstitutedDate - Date setter.
 * @property {string} startFormatted - Human-readable start date.
 * @property {string} expiryFormatted - Human-readable expiration date.
 * @property {number} elapsedDays - Days elapsed since reconstitution.
 * @property {number} remainingDays - Days remaining before 28-day aqueous degradation threshold.
 * @property {number} progressPercent - Percentage of 28-day lifecycle elapsed (0-100).
 * @property {'optimal' | 'warning' | 'critical' | 'expired'} status - Stability health status.
 */

/**
 * Custom Hook for 28-Day Aqueous Peptide Stability & Replenishment Scheduling
 *
 * @param {Object} [protocol]
 * @returns {ProtocolLifespanResult}
 */
export function useProtocolLifespan(protocol) {
  const [reconstitutedDate, setReconstitutedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Default: 7 days ago
    return d.toISOString().split('T')[0];
  });

  const lifespanData = useMemo(() => {
    const start = new Date(reconstitutedDate);
    const now = new Date();
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + 28); // 28-day stability threshold

    const totalDays = 28;
    const elapsedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, 28 - elapsedDays);
    const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    let status = 'optimal';
    if (remainingDays === 0) status = 'expired';
    else if (remainingDays <= 4) status = 'critical';
    else if (remainingDays <= 13) status = 'warning';

    return {
      startFormatted: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiryFormatted: expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      elapsedDays,
      remainingDays,
      progressPercent,
      status
    };
  }, [reconstitutedDate]);

  return {
    reconstitutedDate,
    setReconstitutedDate,
    ...lifespanData
  };
}
