 
/**
 * ProtocolMatchingEngine.js
 * Phase 9 — Dynamic clinical similarity scoring for Related Protocols.
 *
 * Scoring weights (max ~120):
 *   same clinical_goal       → +50
 *   shared primary_compounds → +25 (per shared compound, capped at 25)
 *   shared protocol_class    → +20
 *   similar duration (±2wk)  → +10
 *   shared secondary_goals   → +15 (per shared goal, capped at 15)
 */

import { PROTOCOL_BLUEPRINTS } from '../data/protocolBlueprints';

// ── 5-minute in-memory cache ───────────────────────────────────────────────
const _cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function _cached(key, fn) {
  const now = Date.now();
  const hit = _cache.get(key);
  if (hit && now - hit.ts < CACHE_TTL_MS) return hit.value;
  const value = fn();
  _cache.set(key, { value, ts: now });
  return value;
}

// ── Scoring ────────────────────────────────────────────────────────────────
function score(source, candidate) {
  const sm = source.clinical_metadata;
  const cm = candidate.clinical_metadata;
  if (!sm || !cm) return 0;

  let points = 0;

  // Same clinical goal
  if (sm.clinical_goal === cm.clinical_goal) points += 50;

  // Shared primary compounds
  const sharedCompounds = (sm.primary_compounds || []).filter(c =>
    (cm.primary_compounds || []).includes(c)
  ).length;
  points += Math.min(sharedCompounds * 25, 25);

  // Shared protocol class
  if (sm.protocol_class === cm.protocol_class) points += 20;

  // Similar duration (±2 weeks)
  if (Math.abs((sm.duration_weeks || 0) - (cm.duration_weeks || 0)) <= 2) points += 10;

  // Shared secondary goals
  const sharedSecondary = (sm.secondary_goals || []).filter(g =>
    (cm.secondary_goals || []).includes(g)
  ).length;
  points += Math.min(sharedSecondary * 5, 15);

  return points;
}

// ── Top match reason label ─────────────────────────────────────────────────
const GOAL_LABELS = {
  weight_loss: 'Weight Loss',
  metabolic_health: 'Metabolic Health',
  longevity: 'Longevity',
  cognitive_support: 'Cognitive Support',
  recovery: 'Recovery',
  anti_inflammatory: 'Anti-Inflammatory',
};

const CLASS_LABELS = {
  glp1_based: 'GLP-1 Strategy',
  mitochondrial_based: 'Mitochondrial',
  lipolytic_based: 'Lipolytic',
  regenerative_based: 'Regenerative',
  nootropic_based: 'Nootropic',
  epigenetic_based: 'Epigenetic',
  gh_secretagogue_based: 'GH Secretagogue',
  immunomodulatory_based: 'Immunomodulatory',
};

export function getMatchReason(source, candidate) {
  const sm = source.clinical_metadata;
  const cm = candidate.clinical_metadata;
  if (!sm || !cm) return null;

  if (sm.clinical_goal === cm.clinical_goal)
    return `Same ${GOAL_LABELS[sm.clinical_goal] || sm.clinical_goal} target`;

  if (sm.protocol_class === cm.protocol_class)
    return `Shared ${CLASS_LABELS[sm.protocol_class] || sm.protocol_class} strategy`;

  const sharedC = (sm.primary_compounds || []).filter(c =>
    (cm.primary_compounds || []).includes(c)
  );
  if (sharedC.length > 0)
    return `Shared compound: ${sharedC[0].replace(/_/g, ' ')}`;

  if (Math.abs((sm.duration_weeks || 0) - (cm.duration_weeks || 0)) <= 2)
    return 'Similar duration';

  return 'Clinically related';
}

// ── Main API ───────────────────────────────────────────────────────────────
/**
 * Returns top 4 clinically related protocols for a given protocol key.
 * Falls back to same clinical_goal, then to all protocols sorted by goal overlap.
 *
 * @param {string} protocolId - key in PROTOCOL_BLUEPRINTS
 * @returns {Array<{id, protocol, score, matchReason}>}
 */
export function getRelatedProtocols(protocolId) {
  return _cached(`related:${protocolId}`, () => {
    const source = PROTOCOL_BLUEPRINTS[protocolId];
    if (!source) return [];

    const allIds = Object.keys(PROTOCOL_BLUEPRINTS).filter(id => id !== protocolId);

    const scored = allIds.map(id => ({
      id,
      protocol: PROTOCOL_BLUEPRINTS[id],
      score: score(source, PROTOCOL_BLUEPRINTS[id]),
      matchReason: getMatchReason(source, PROTOCOL_BLUEPRINTS[id]),
    })).sort((a, b) => b.score - a.score);

    // Primary: top 4 with score > 0
    let results = scored.filter(r => r.score > 0).slice(0, 4);

    // Fallback 1: same clinical_goal only
    if (results.length < 2) {
      const sm = source.clinical_metadata;
      results = allIds
        .filter(id => {
          const m = PROTOCOL_BLUEPRINTS[id]?.clinical_metadata;
          return m?.clinical_goal === sm?.clinical_goal;
        })
        .map(id => ({
          id,
          protocol: PROTOCOL_BLUEPRINTS[id],
          score: 50,
          matchReason: `Same ${GOAL_LABELS[sm?.clinical_goal] || sm?.clinical_goal} target`,
        }))
        .slice(0, 4);
    }

    // Fallback 2: top scored regardless
    if (results.length === 0) {
      results = scored.slice(0, 4);
    }

    return results;
  });
}
