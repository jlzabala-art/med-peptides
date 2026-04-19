/**
 * useProtocolAssets — Centralized Clinical Asset Management Hook (Phase 1)
 * 
 * Responsibilities:
 *  1. Generate and vend download URLs for the Administration Guide (PDF) and
 *     Dosing Schedule (.ics) without scattering Blob/URL logic across components.
 *  2. Detect whether the currently-loaded ClinicalTimeline has diverged from
 *     the persisted protocol snapshot (version staleness check), and expose a
 *     boolean `isOutdated` flag + "Update Required" badge label.
 *
 * Security Note:
 *  Every export surface must display:
 *  "Verify units/mL concentration with your pharmacist before administration."
 */

import { useMemo, useCallback } from 'react';
import { generateProtocolICS } from '../services/calendarService';
import { generateClinicalPDF } from '../services/pdfService';

// ─── Stable hash of a ClinicalTimeline array ───────────────────────────────
// We hash only the compound names + doses so minor cosmetic changes don't
// trigger a false-positive staleness warning.
const hashTimeline = (timeline = []) => {
  if (!timeline || !timeline.length) return '';
  const sig = timeline.map(week => {
    const meds = week.medications
      || (week.events?.filter(e => e.type === 'medication') ?? []);
    return `W${week.week}:${meds.map(m =>
      `${m.compound || m.name || m.title}@${m.dose || m.dosage || ''}`
    ).join('|')}`;
  }).join(';');
  // Simple djb2 string hash — deterministic, no external deps
  let h = 5381;
  for (let i = 0; i < sig.length; i++) {
    h = ((h << 5) + h) ^ sig.charCodeAt(i);
    h = h >>> 0; // keep 32-bit unsigned
  }
  return h.toString(16);
};

/**
 * @param {Object} protocol   - The full protocol object currently in memory.
 * @param {Array}  savedHash  - Optional hash string stored on the Firestore doc
 *                             (protocol.timeline_hash). If absent, we compute from
 *                             protocol._timeline for comparison.
 */
export const useProtocolAssets = (protocol, savedHash = null) => {

  // ── Version Staleness Detection ──────────────────────────────────────────
  const isOutdated = useMemo(() => {
    if (!protocol) return false;
    const currentTimeline = protocol._timeline || protocol.timeline || [];
    const currentHash = hashTimeline(currentTimeline);

    // If a saved hash is provided (from Firestore), compare directly.
    if (savedHash) return currentHash !== savedHash;

    // Fallback: compare against protocol.saved_timeline_hash if embedded.
    if (protocol.timeline_hash) return currentHash !== protocol.timeline_hash;

    return false;
  }, [protocol, savedHash]);

  const versionBadge = isOutdated ? 'Update Required' : null;

  // ── Asset Label Constants (Pharma English) ───────────────────────────────
  const labels = {
    downloadGuide:   'Download Administration Guide',
    syncCalendar:    'Sync Dosing Schedule to Calendar',
    exportBundle:    'Export Clinical Assets Bundle',
    dosingWarning:   'Verify units/mL concentration with your pharmacist before administration.',
    updateRequired:  'Update Required — timeline has changed since last export.',
  };

  // ── Calendar Export ──────────────────────────────────────────────────────
  const handleSyncCalendar = useCallback(() => {
    if (!protocol) return;
    generateProtocolICS(protocol);
  }, [protocol]);

  // ── PDF Guide Export ─────────────────────────────────────────────────────
  const handleDownloadGuide = useCallback(async () => {
    if (!protocol) return;
    try {
      await generateClinicalPDF(protocol);
    } catch (err) {
      console.error('[useProtocolAssets] PDF generation failed:', err);
    }
  }, [protocol]);

  // ── Bundle: PDF + ICS together ───────────────────────────────────────────
  const handleDownloadBundle = useCallback(async () => {
    if (!protocol) return;
    // Fire both in parallel; calendar is synchronous, PDF is async.
    generateProtocolICS(protocol);
    try {
      await generateClinicalPDF(protocol);
    } catch (err) {
      console.error('[useProtocolAssets] Bundle PDF failed:', err);
    }
  }, [protocol]);

  return {
    /** True when the loaded timeline differs from the last saved version */
    isOutdated,
    /** Badge label to display on stale export buttons */
    versionBadge,
    /** Standardised Pharma English UI labels */
    labels,
    /** Trigger .ics calendar download */
    handleSyncCalendar,
    /** Trigger PDF administration guide download */
    handleDownloadGuide,
    /** Trigger both PDF + ICS bundle download */
    handleDownloadBundle,
    /** Compute a timeline hash for persistence (call before saving protocol) */
    computeTimelineHash: (timeline) => hashTimeline(timeline),
  };
};
