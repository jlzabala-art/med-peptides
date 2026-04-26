/**
 * protocolRepository.js
 *
 * Single data-access layer for the canonical Firestore protocol model.
 *
 * Schema:
 *   blueprints/{protocolId}   — protocol blueprint (phases, drugs, eligibility…)
 *   monitoring_profiles/{id}  — lab/monitoring schedules per objective
 *
 * ─ All callers must import from this module — never query Firestore directly
 *   from UI components or the protocol engine.
 * ─ Protocols are the source of truth in Firestore.  The local JSON bundle
 *   (protocol_builder_2_0_protocols_bundle/) is the *editorial source*; run
 *   `node scripts/uploadProtocolBundle.mjs` to push edits to production.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ── Collection helpers ────────────────────────────────────────────────────────
const blueprintsCol       = ()  => collection(db, 'protocols');
const monitoringCol       = ()  => collection(db, 'monitoring_profiles');

// ── Protocol (blueprint) queries ──────────────────────────────────────────────

/**
 * Fetch ALL protocol blueprints, including inactive/draft ones.
 * Intended for admin tools and audits.
 *
 * @returns {Promise<Array>}
 */
export async function getAllProtocols() {
  try {
    const snap = await getDocs(blueprintsCol());
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[protocolRepository] getAllProtocols:', err);
    throw err;
  }
}

/**
 * Fetch all approved protocol blueprints.
 * Primary query used by the protocol engine and builder UI.
 *
 * @returns {Promise<Array>}
 */
export async function getProtocolTemplates() {
  try {
    const snap = await getDocs(blueprintsCol());
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    console.error('[protocolRepository] getProtocolTemplates:', err);
    throw err;
  }
}

/**
 * Fetch all approved blueprints for a specific clinical objective.
 *
 * @param {string} objective - e.g. 'weight_management', 'longevity'
 * @returns {Promise<Array>}
 */
export async function getTemplatesByObjective(objective) {
  try {
    const q = query(
      blueprintsCol(),
      where('metadata.primary_goal', '==', objective)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    console.error(`[protocolRepository] getTemplatesByObjective(${objective}):`, err);
    throw err;
  }
}

/**
 * Fetch all approved blueprints whose primary_goal is one of the
 * supplied goal strings.  Firestore `in` supports up to 10 values.
 *
 * @param {string[]} goals - Array of goal strings, e.g. ['Longevity', 'Skin / Anti-Aging']
 * @returns {Promise<Array>}
 */
export async function getTemplatesByGoalGroup(goals) {
  if (!goals || goals.length === 0) return [];
  try {
    const q = query(
      blueprintsCol(),
      where('metadata.primary_goal', 'in', goals.slice(0, 10))
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    console.error('[protocolRepository] getTemplatesByGoalGroup:', err);
    throw err;
  }
}

/**
 * Fetch approved blueprints for a specific clinical condition.
 *
 * @param {string} condition - e.g. 'obesity_metabolic_dysfunction'
 * @returns {Promise<Array>}
 */
export async function getTemplatesByCondition(condition) {
  try {
    const q = query(
      blueprintsCol(),
      where('metadata.primary_condition', '==', condition)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    console.error(`[protocolRepository] getTemplatesByCondition(${condition}):`, err);
    throw err;
  }
}

/**
 * Fetch the most recently updated blueprints.
 *
 * @param {number} [n=10] - Maximum number of blueprints to return.
 * @returns {Promise<Array>}
 */
export async function getLatestBlueprints(n = 10) {
  try {
    const q = query(
      blueprintsCol(),
      orderBy('metadata.updated_at', 'desc'),
      limit(n)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[protocolRepository] getLatestBlueprints:', err);
    throw err;
  }
}

/**
 * Fetch approved blueprints for an objective, alphabetically sorted.
 *
 * @param {string} objective
 * @returns {Promise<Array>}
 */
export async function getApprovedTemplatesByObjective(objective) {
  try {
    const q = query(
      blueprintsCol(),
      where('metadata.primary_goal', '==', objective),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`[protocolRepository] getApprovedTemplatesByObjective(${objective}):`, err);
    throw err;
  }
}


/**
 * Fetch a single protocol blueprint by its protocol_id or slug.
 * Returns null if not found.
 *
 * @param {string} id - protocol_id (e.g. 'wm_001') or protocol_slug
 * @returns {Promise<Object|null>}
 */
export async function getProtocolTemplate(id) {
  try {
    // 1. Direct document lookup by protocol_id (most common case)
    const directRef  = doc(db, 'blueprints', id);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) return { id: directSnap.id, ...directSnap.data() };

    // 2. Fallback: query by protocol_id field (handles doc IDs that differ)
    const q1   = query(blueprintsCol(), where('protocol_id', '==', id));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) return { id: snap1.docs[0].id, ...snap1.docs[0].data() };

    // 3. Fallback: query by slug
    const q2   = query(blueprintsCol(), where('protocol_slug', '==', id));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() };

    return null;
  } catch (err) {
    console.error(`[protocolRepository] getProtocolTemplate(${id}):`, err);
    throw err;
  }
}

// ── Monitoring profiles ───────────────────────────────────────────────────────

/**
 * Load the monitoring / lab-check schedule for a given objective.
 * Falls back to 'default_profile' if no specific profile exists.
 *
 * @param {string} objectiveId
 * @returns {Promise<Array>} Schedule array (may be empty)
 */
export async function getMonitoringProfile(objectiveId) {
  try {
    const docId =
      objectiveId === 'DEFAULT'
        ? 'default_profile'
        : objectiveId
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

    const snap = await getDoc(doc(db, 'monitoring_profiles', docId));
    if (snap.exists()) return snap.data().schedule ?? [];

    // Fallback to global default
    const defaultSnap = await getDoc(doc(db, 'monitoring_profiles', 'default_profile'));
    return defaultSnap.exists() ? defaultSnap.data().schedule ?? [] : [];
  } catch (err) {
    console.error(`[protocolRepository] getMonitoringProfile(${objectiveId}):`, err);
    return []; // non-fatal — monitoring data is supplementary
  }
}

// ── Protocol variants (future Phase 3 expansion) ──────────────────────────────

/**
 * Fetch variants for a specific protocol (e.g. intensity variants).
 * Reserved for Phase 3 — currently returns empty array.
 *
 * @param {string} protocolId
 * @returns {Promise<Array>}
 */
export async function getProtocolVariants(protocolId) {
  // Future: query blueprints/{protocolId}/variants sub-collection
  return [];
}

// ── Legacy compatibility shim ─────────────────────────────────────────────────
// Keeps existing code that imports { protocolRepository } as a named object.

export const protocolRepository = {
  getAllProtocols,
  getProtocolTemplates,
  getTemplatesByObjective,
  getTemplatesByGoalGroup,
  getTemplatesByCondition,
  getLatestBlueprints,
  getApprovedTemplatesByObjective,
  getProtocolTemplate,
  getMonitoringProfile,
  getProtocolVariants,
};
