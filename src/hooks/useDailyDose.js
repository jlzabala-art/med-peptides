/* eslint-disable react-hooks/set-state-in-effect */
/**
 * useDailyDose.js
 *
 * Firebase Daily Dose Integration — Fase B: React Hook
 *
 * Wraps dailyDoseService with real-time Firestore subscription,
 * loading state, and fallback-to-protocol-JSON logic.
 *
 * Usage:
 *   const { dailyDose, loading, source } = useDailyDose(protocol, clinicId);
 *
 * Returns:
 *   dailyDose  — resolved DailyDoseData (clinic > global > derived from JSON)
 *   loading    — boolean
 *   source     — 'clinic' | 'global' | 'derived' | null
 *   refresh    — call to force re-fetch (e.g. after admin saves)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  subscribeDailyDose,
  buildDefaultDailyDose,
} from '../services/dailyDoseService';

/**
 * @param {Object|null} protocol  - full protocol JSON bundle (from ProtocolTemplate)
 * @param {string|null} clinicId  - Firestore UID of authenticated clinic user
 */
export function useDailyDose(protocol, clinicId = null) {
  const [dailyDose, setDailyDose] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [source,    setSource]    = useState(null);
  const unsubRef = useRef(null);

  const protocolSlug = protocol?.protocol_slug ?? protocol?.slug ?? null;

  const setup = useCallback(() => {
    if (!protocolSlug) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Tear down any previous listener
    unsubRef.current?.();

    unsubRef.current = subscribeDailyDose(
      protocolSlug,
      clinicId,
      (data) => {
        if (data) {
          setDailyDose(data);
          setSource(data._source ?? 'global');
        } else {
          // Firestore has no entry yet — derive from protocol JSON
          if (protocol) {
            const derived = buildDefaultDailyDose(protocol);
            setDailyDose(derived);
            setSource('derived');
          } else {
            setDailyDose(null);
            setSource(null);
          }
        }
        setLoading(false);
      }
    );
  }, [protocolSlug, clinicId, protocol]);

  useEffect(() => {
    setup();
    return () => unsubRef.current?.();
  }, [setup]);

  const refresh = useCallback(() => {
    setup();
  }, [setup]);

  return { dailyDose, loading, source, refresh };
}

/**
 * useDailyDoseCompound
 * Convenience selector — returns the resolved dose data for a single compound.
 *
 * @param {Object|null} dailyDose  - from useDailyDose
 * @param {string}      slug       - compound slug (e.g. "semaglutide")
 */
export function useDailyDoseCompound(dailyDose, slug) {
  if (!dailyDose?.compounds || !slug) return null;

  // Exact match
  if (dailyDose.compounds[slug]) return dailyDose.compounds[slug];

  // Fuzzy match — strip hyphens/spaces
  const normalised = slug.toLowerCase().replace(/[-_\s]+/g, '');
  const found = Object.entries(dailyDose.compounds).find(
    ([k]) => k.toLowerCase().replace(/[-_\s]+/g, '') === normalised
  );
  return found ? found[1] : null;
}
