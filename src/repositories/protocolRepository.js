/* eslint-disable no-unused-vars */
/**
 * protocolRepository.js
 *
 * Single data-access layer for the canonical Firestore protocol model.
 *
 * Schema:
 *   protocols/{protocolId}    — canonical protocol document (phases, drugs, eligibility…)
 *   monitoring_profiles/{id}  — lab/monitoring schedules per objective
 *
 * NOTE: The `blueprints` collection is an older partial mirror and is NOT used here.
 *       `protocols` is the source of truth — it contains more documents and newer slugs.
 *
 * ─ All callers must import from this module — never query Firestore directly
 *   from UI components or the protocol engine.
 * ─ Protocols are the source of truth in Firestore.  The local JSON bundle
 *   (protocol_finder_2_0_protocols_bundle/) is the *editorial source*; run
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
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { normalizeProtocol } from './mappers.js';
import { validateProtocolWrite } from './protocolWriteGuard.js';
import { createCacheManager } from '../utils/cacheManager.js';
import { logger } from '../utils/logger.js';
import { withRetry } from './_resilience.js';
import { sanitizeClinicalEntity } from '../utils/clinicalSanitizer.js';
import { logPHIAccess, PHI_ACTIONS } from '../services/PHIAuditService.js';

// ── Collection helpers ────────────────────────────────────────────────────────
const protocolsCol        = ()  => collection(db, 'protocols');        // canonical source

// ── Protocol Cache (performance layer - Golden Rule #2) ────────────────────────
const PROTOCOL_CACHE_KEY = 'regenpept_protocols_cache_v2';
const PROTOCOL_CACHE_TTL_MS = 60 * 60 * 1000; // 60 min
const cache = createCacheManager(PROTOCOL_CACHE_KEY, PROTOCOL_CACHE_TTL_MS);

/** Force a cache invalidation (call after admin edits or AI version bump detected). */
export function invalidateProtocolCache() {
  cache.invalidate();
}
const monitoringCol       = ()  => collection(db, 'monitoring_profiles');

// ── Protocol (blueprint) queries ──────────────────────────────────────────────

/**
 * Fetch ALL protocol blueprints, including inactive/draft ones.
 * Intended for admin tools and audits.
 *
 * @returns {Promise<Array>}
 */
export async function getAllProtocols({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = cache.read();
    if (cached) return cached;
  }
  try {
    const q = query(protocolsCol(), limit(200));
    const snap = await withRetry(
      () => getDocs(q),
      { entityName: 'protocolRepository.getAllProtocols' }
    );
    const protocols = snap.docs.map((d) => normalizeProtocol(d.data(), d.id));
    cache.write(protocols);
    return protocols;
  } catch (err) {
    logger.error('[protocolRepository] getAllProtocols', { error: err.message });
    throw err;
  }
}

/**
 * Fetch all approved protocol blueprints.
 * Primary query used by the protocol engine and finder UI.
 *
 * @returns {Promise<Array>}
 */
export async function getProtocolTemplates({ forceRefresh = false } = {}) {
  // Reuse the shared cache; approved filtering is client-side only
  const all = await getAllProtocols({ forceRefresh });
  return all.filter((p) => !p.status || p.status === 'approved');
}

/**
 * Fetch all approved blueprints for a specific clinical objective.
 * Queries both the top-level `primary_goal` field and the nested
 * `metadata.primary_goal` field, merging and deduplicating results.
 *
 * @param {string} objective - e.g. 'weight_management', 'longevity'
 * @returns {Promise<Array>}
 */
export async function getTemplatesByObjective(objective) {
  try {
    // Query 1: top-level primary_goal (most common)
    const q1 = query(protocolsCol(), where('primary_goal', '==', objective));
    // Query 2: nested metadata.primary_goal (used by some Firestore docs)
    const q2 = query(protocolsCol(), where('metadata.primary_goal', '==', objective));

    const [snap1, snap2] = await withRetry(
      () => Promise.all([getDocs(q1), getDocs(q2)]),
      { entityName: 'protocolRepository.getTemplatesByObjective' }
    );

    const byId = new Map();
    [...snap1.docs, ...snap2.docs].forEach((d) => {
      if (!byId.has(d.id)) byId.set(d.id, normalizeProtocol(d.data(), d.id));
    });

    return [...byId.values()].filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    logger.error('[protocolRepository] getTemplatesByObjective', { objective, error: err.message });
    throw err;
  }
}

export async function getTemplatesByPrefix(prefix) {
  try {
    const all = await getProtocolTemplates();
    const cleanPrefix = (prefix || '').toLowerCase().split('_')[0];
    return all.filter(p => {
      const pid = (p.protocol_id || p.id || '').toLowerCase();
      return pid.startsWith(cleanPrefix + '_');
    });
  } catch (err) {
    logger.error('[protocolRepository] getTemplatesByPrefix', { prefix, error: err.message });
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
      protocolsCol(),
      where('primary_goal', 'in', goals.slice(0, 10))
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => normalizeProtocol(d.data(), d.id))
      .filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    logger.error('[protocolRepository] getTemplatesByGoalGroup', { error: err.message });
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
      protocolsCol(),
      where('metadata.primary_condition', '==', condition)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => normalizeProtocol(d.data(), d.id))
      .filter((p) => !p.status || p.status === 'approved');
  } catch (err) {
    logger.error('[protocolRepository] getTemplatesByCondition', { condition, error: err.message });
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
      protocolsCol(),
      orderBy('metadata.updated_at', 'desc'),
      limit(n)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeProtocol(d.data(), d.id));
  } catch (err) {
    logger.error('[protocolRepository] getLatestBlueprints', { error: err.message });
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
      protocolsCol(),
      where('metadata.primary_goal', '==', objective),
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeProtocol(d.data(), d.id));
  } catch (err) {
    logger.error('[protocolRepository] getApprovedTemplatesByObjective', { objective, error: err.message });
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
    // 1. Direct document lookup by doc ID (e.g. 'wm_001')
    const directRef  = doc(db, 'protocols', id);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) return normalizeProtocol(directSnap.data(), directSnap.id);

    // 2. Fallback: query by protocol_slug field (URL slugs like 'weight-management-structured-12w')
    const q1    = query(protocolsCol(), where('protocol_slug', '==', id));
    const snap1 = await getDocs(q1);
    if (!snap1.empty) return normalizeProtocol(snap1.docs[0].data(), snap1.docs[0].id);

    // 3. Fallback: query by protocol_id field
    const q2    = query(protocolsCol(), where('protocol_id', '==', id));
    const snap2 = await getDocs(q2);
    if (!snap2.empty) return normalizeProtocol(snap2.docs[0].data(), snap2.docs[0].id);

    return null;
  } catch (err) {
    logger.error('[protocolRepository] getProtocolTemplate', { id, error: err.message });
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
    logger.error('[protocolRepository] getMonitoringProfile', { objectiveId, error: err.message });
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

/**
 * Fetch protocols with real pagination (approved and drafts).
 * Intended for internal dashboards.
 * 
 * @param {number} pageSize 
 * @param {object} lastDoc - A Firestore document snapshot (or null for first page)
 * @returns {Promise<{items: Array, lastDoc: object}>}
 */
export async function getProtocolTemplatesPaginated(pageSize = 50, lastDoc = null) {
  try {
    let q = query(protocolsCol(), orderBy('protocol_id'), limit(pageSize));
    if (lastDoc) {
      q = query(protocolsCol(), orderBy('protocol_id'), startAfter(lastDoc), limit(pageSize));
    }
    
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => normalizeProtocol(d.data(), d.id));
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    
    return { items: results, lastDoc: newLastDoc };
  } catch (err) {
    logger.error('[protocolRepository] getProtocolTemplatesPaginated', { error: err.message });
    throw err;
  }
}

// ── Write operations ──────────────────────────────────────────────────────────

/**
 * Creates a new protocol template.
 * 
 * @param {object} protocolData
 * @returns {Promise<string>} The new protocol document ID
 */
export async function createProtocol(protocolData) {
  try {
    // Guard: validate & normalize before writing — rejects legacy name fields.
    const validated = validateProtocolWrite(protocolData, { isUpdate: false, autoResolveName: true });
    const docRef = await addDoc(protocolsCol(), {
      ...validated,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateProtocolCache();
    return docRef.id;
  } catch (err) {
    logger.error('[protocolRepository] createProtocol', { error: err.message });
    throw err;
  }
}

/**
 * Updates an existing protocol template.
 * 
 * @param {string} protocolId
 * @param {object} updates
 */
export async function updateProtocol(protocolId, updates) {
  try {
    // Guard: validate & normalize partial updates — auto-resolves legacy name fields.
    const validated = validateProtocolWrite(updates, { isUpdate: true, autoResolveName: true });
    await updateDoc(doc(db, 'protocols', protocolId), {
      ...validated,
      updatedAt: serverTimestamp(),
    });
    invalidateProtocolCache();
  } catch (err) {
    logger.error('[protocolRepository] updateProtocol', { protocolId, error: err.message });
    throw err;
  }
}

/**
 * Deletes a protocol template permanently.
 * 
 * @param {string} protocolId
 */
export async function deleteProtocol(protocolId) {
  try {
    await deleteDoc(doc(db, 'protocols', protocolId));
    invalidateProtocolCache(); // ← cache bust so deleted doc is no longer served
  } catch (err) {
    logger.error('[protocolRepository] deleteProtocol', { protocolId, error: err.message });
    throw err;
  }
}

/**
 * Clones an existing protocol template as a draft with optional format variant (Vial vs Pen).
 * 
 * @param {string|object} sourceProtocolIdOrObject
 * @param {object} options Optional overrides and format variant ('vial' | 'pen')
 * @returns {Promise<string>} The new protocol document ID
 */
export async function cloneProtocol(sourceProtocolIdOrObject, options = {}) {
  try {
    let sourceData = null;
    if (typeof sourceProtocolIdOrObject === 'string') {
      sourceData = await getProtocolTemplate(sourceProtocolIdOrObject);
      if (!sourceData) {
        throw new Error(`Protocol with ID "${sourceProtocolIdOrObject}" not found`);
      }
    } else if (typeof sourceProtocolIdOrObject === 'object' && sourceProtocolIdOrObject !== null) {
      sourceData = sourceProtocolIdOrObject;
    } else {
      throw new Error('Invalid source protocol argument');
    }

    const { id, _id, createdAt, updatedAt, ...rest } = sourceData;
    const baseName = rest.name || rest.title || 'Protocol';
    const targetFormat = options.targetFormat || rest.format || 'vial';
    
    let clonedName = options.name || `${baseName} (Copy)`;
    if (options.targetFormat && options.targetFormat !== rest.format) {
      clonedName = `${baseName} (${targetFormat === 'pen' ? 'Pen Edition' : 'Vial Edition'})`;
    }

    // Format specific adjustments (Pens do not require reconstitution or BAC water)
    const isPen = targetFormat === 'pen' || targetFormat === 'prefilled_pen';
    const adjustedPhases = (rest.phases || []).map(phase => {
      let updatedPhase = { ...phase };
      if (isPen) {
        // Remove reconstitution instructions and supplies
        if (updatedPhase.reconstitution) {
          updatedPhase.reconstitution = {
            ...updatedPhase.reconstitution,
            required: false,
            guide: 'Ready-to-use pre-filled pen. No reconstitution required.',
            bacWaterMl: 0,
          };
        }
      }
      return updatedPhase;
    });

    const clonedPayload = {
      ...rest,
      name: clonedName,
      status: 'draft',
      isPublished: false,
      format: targetFormat,
      requiresReconstitution: !isPen,
      phases: adjustedPhases,
      ...options.overrides,
    };

    return await createProtocol(clonedPayload);
  } catch (err) {
    logger.error('[protocolRepository] cloneProtocol', { error: err.message });
    throw err;
  }
}

/**
 * Fetches custom protocols created by a specific doctor.
 * @param {string} doctorId
 * @returns {Promise<Array>}
 */
export async function getCustomProtocolsByDoctor(doctorId) {
  try {
    const q = query(collection(db, 'custom_protocols'), where('doctorId', '==', doctorId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[protocolRepository] getCustomProtocolsByDoctor', { error: err.message });
    return [];
  }
}

/**
 * Creates a new custom protocol for a doctor.
 * @param {object} protocolData
 * @returns {Promise<string>}
 */
export async function createCustomProtocol(protocolData) {
  const docRef = await addDoc(collection(db, 'custom_protocols'), {
    ...protocolData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Deletes a custom protocol by ID.
 * @param {string} protocolId
 * @returns {Promise<void>}
 */
export async function deleteCustomProtocol(protocolId) {
  await deleteDoc(doc(db, 'custom_protocols', protocolId));
}

// ── Legacy compatibility shim ─────────────────────────────────────────────────
// Keeps existing code that imports { protocolRepository } as a named object.

export const protocolRepository = {
  getAllProtocols,
  getProtocolTemplates,
  getTemplatesByObjective,
  getTemplatesByPrefix,
  getTemplatesByGoalGroup,
  getTemplatesByCondition,
  getLatestBlueprints,
  getApprovedTemplatesByObjective,
  getProtocolTemplate,
  getMonitoringProfile,
  getProtocolVariants,
  getProtocolTemplatesPaginated,
  createProtocol,
  cloneProtocol,
  getCustomProtocolsByDoctor,
  createCustomProtocol,
  deleteCustomProtocol,
  updateProtocol,
  deleteProtocol,
};

