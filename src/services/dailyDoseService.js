/* eslint-disable no-unused-vars */
/**
 * dailyDoseService.js
 *
 * Firebase Daily Dose Integration — Fase A: Servicio
 *
 * Gestiona las sugerencias de "Daily Dose" por protocolo y por clínica
 * desde Firestore. Permite a cada clínica personalizar las dosis sin
 * hardcoding en el cliente.
 *
 * Estructura Firestore:
 *
 *   clinic_protocol_overrides/{clinicId}/overrides/{protocolSlug}
 *   {
 *     protocolSlug: "weight-management-cagrisem-12w",
 *     compounds: {
 *       "semaglutide": {
 *         starting_dose: 0.25,
 *         max_dose: 1.0,
 *         dose_unit: "mg",
 *         escalation_weeks: 4,
 *         clinical_note: "Reduced initiation for GI-sensitive patients"
 *       },
 *       "aod-9604": {
 *         starting_dose: 150,
 *         max_dose: 300,
 *         dose_unit: "mcg",
 *         clinical_note: "Conservative start for new patients"
 *       }
 *     },
 *     daily_dose_suggestion: {
 *       label: "Morning stack",
 *       compounds: ["semaglutide", "aod-9604"],
 *       timing: "07:00",
 *       notes: "Take 30 min before breakfast"
 *     },
 *     updated_at: Timestamp,
 *     updated_by: "clinic_uid"
 *   }
 *
 *   global_protocol_doses/{protocolSlug}   ← fallback si no hay override clínico
 *   {
 *     protocolSlug: "...",
 *     compounds: { ... },
 *     daily_dose_suggestion: { ... },
 *   }
 */

import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

// ── Collection paths ──────────────────────────────────────────────────────
const GLOBAL_COLLECTION   = 'global_protocol_doses';
const CLINIC_COLLECTION   = 'clinic_protocol_overrides';

// ── Cache (session) ───────────────────────────────────────────────────────
const SESSION_PREFIX = 'rp_daily_dose_';

function cacheRead(key) {
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    // Invalidate after 10 minutes (clinic may update intra-session)
    if (Date.now() - ts > 10 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function cacheWrite(key, data) {
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // noop — private mode / quota
  }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────

/**
 * getDailyDose
 * Resolves the effective daily dose data for a protocol.
 * Priority: clinic override > global default > null
 *
 * @param {string} protocolSlug  - e.g. "weight-management-cagrisem-12w"
 * @param {string|null} clinicId - Firestore UID of the clinic (null for guest)
 * @returns {Promise<DailyDoseData|null>}
 */
export async function getDailyDose(protocolSlug, clinicId = null) {
  const cacheKey = `${clinicId || 'global'}_${protocolSlug}`;
  const cached = cacheRead(cacheKey);
  if (cached) return cached;

  try {
    // 1. Try clinic-specific override
    if (clinicId) {
      const clinicRef = doc(db, CLINIC_COLLECTION, clinicId, 'overrides', protocolSlug);
      const clinicSnap = await getDoc(clinicRef);
      if (clinicSnap.exists()) {
        const data = { ...clinicSnap.data(), _source: 'clinic' };
        cacheWrite(cacheKey, data);
        return data;
      }
    }

    // 2. Fall back to global protocol doses
    const globalRef  = doc(db, GLOBAL_COLLECTION, protocolSlug);
    const globalSnap = await getDoc(globalRef);
    if (globalSnap.exists()) {
      const data = { ...globalSnap.data(), _source: 'global' };
      cacheWrite(cacheKey, data);
      return data;
    }

    return null;
  } catch (err) {
    console.warn('[dailyDoseService] getDailyDose error:', err.code ?? err.message);
    return null;
  }
}

/**
 * subscribeDailyDose
 * Real-time listener for a protocol's daily dose data.
 * Resolves clinic override first, then global. 
 * Returns an unsubscribe function.
 *
 * @param {string}   protocolSlug
 * @param {string|null} clinicId
 * @param {Function} onUpdate  - called with (DailyDoseData|null)
 * @returns {Function} unsubscribe
 */
export function subscribeDailyDose(protocolSlug, clinicId, onUpdate) {
  let unsubGlobal  = null;
  let clinicData   = null;
  let globalData   = null;

  const merge = () => onUpdate(clinicData ?? globalData);

  // Subscribe to global
  const globalRef = doc(db, GLOBAL_COLLECTION, protocolSlug);
  unsubGlobal = onSnapshot(
    globalRef,
    (snap) => {
      globalData = snap.exists() ? { ...snap.data(), _source: 'global' } : null;
      merge();
    },
    (err) => console.warn('[dailyDoseService] global snapshot error:', err.code)
  );

  // Subscribe to clinic override (only if authenticated clinic)
  let unsubClinic = null;
  if (clinicId) {
    const clinicRef = doc(db, CLINIC_COLLECTION, clinicId, 'overrides', protocolSlug);
    unsubClinic = onSnapshot(
      clinicRef,
      (snap) => {
        clinicData = snap.exists() ? { ...snap.data(), _source: 'clinic' } : null;
        merge();
      },
      (err) => console.warn('[dailyDoseService] clinic snapshot error:', err.code)
    );
  }

  return () => {
    unsubGlobal?.();
    unsubClinic?.();
  };
}

/**
 * setClinicDailyDose
 * Saves (or replaces) a clinic-specific daily dose override for a protocol.
 * Only admins / clinic owners should be allowed to call this.
 *
 * @param {string} clinicId
 * @param {string} protocolSlug
 * @param {DailyDoseData} data
 * @param {string} updatedBy  - uid of the user saving the override
 */
export async function setClinicDailyDose(clinicId, protocolSlug, data, updatedBy) {
  const ref = doc(db, CLINIC_COLLECTION, clinicId, 'overrides', protocolSlug);
  await setDoc(ref, {
    ...data,
    protocolSlug,
    updated_at: serverTimestamp(),
    updated_by: updatedBy,
  }, { merge: true });

  // Bust local cache so next read picks up the new data
  try {
    sessionStorage.removeItem(SESSION_PREFIX + `${clinicId}_${protocolSlug}`);
  } catch { /* noop */ }
}

/**
 * setGlobalDailyDose
 * Admin-only: saves the global fallback daily dose for a protocol.
 *
 * @param {string} protocolSlug
 * @param {DailyDoseData} data
 * @param {string} updatedBy
 */
export async function setGlobalDailyDose(protocolSlug, data, updatedBy) {
  const ref = doc(db, GLOBAL_COLLECTION, protocolSlug);
  await setDoc(ref, {
    ...data,
    protocolSlug,
    updated_at: serverTimestamp(),
    updated_by: updatedBy,
  }, { merge: true });

  try {
    sessionStorage.removeItem(SESSION_PREFIX + `global_${protocolSlug}`);
  } catch { /* noop */ }
}

/**
 * buildDefaultDailyDose
 * Generates a default DailyDoseData object from a protocol's phase_blueprints.
 * Useful for pre-populating the global collection without manual entry.
 *
 * @param {Object} protocol  - full protocol JSON bundle
 * @returns {DailyDoseData}
 */
export function buildDefaultDailyDose(protocol) {
  const compounds = {};

  (protocol.phase_blueprints || []).forEach((ph) => {
    const drugs = ph.drugs_used || ph.drugs || [];
    drugs.forEach((d) => {
      const logic   = d.dose_logic || {};
      const slug    = d.product_slug || d.product_id || d.product_title?.toLowerCase().replace(/\s+/g, '-');
      const title   = d.product_title || slug;

      if (!slug || compounds[slug]) return; // deduplicate

      compounds[slug] = {
        name:           title,
        starting_dose:  logic.starting_weekly_dose ?? logic.dose_per_administration ?? null,
        max_dose:       logic.max_weekly_dose       ?? logic.possible_next_step_dose ?? null,
        dose_unit:      logic.dose_unit             ?? 'mg',
        frequency:      logic.administration_frequency ?? 'once_weekly',
        timing_hint:    logic.timing_hint           ?? null,
        route:          d.route                     ?? 'subcutaneous',
        clinical_note:  null,   // filled by clinic
      };
    });
  });

  return {
    protocolSlug: protocol.protocol_slug,
    compounds,
    daily_dose_suggestion: {
      label:     protocol.protocol_title ?? '',
      compounds: Object.keys(compounds),
      notes:     null,
    },
  };
}
