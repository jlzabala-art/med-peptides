 
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
  // If coming from Firestore, clinical_evidence might replace clinical_metadata
  // We'll normalize by checking both
  const sm = source.clinical_metadata || source.clinical_evidence || {};
  const cm = candidate.clinical_metadata || candidate.clinical_evidence || {};
  
  if (!sm || !cm) return 0;

  let points = 0;

  // Same clinical goal (or therapeutic_category)
  const sourceGoal = sm.clinical_goal || source.therapeutic_category;
  const candGoal = cm.clinical_goal || candidate.therapeutic_category;
  if (sourceGoal && sourceGoal === candGoal) points += 50;

  // Shared primary compounds
  const sourceCompounds = sm.primary_compounds || source.compounds || [];
  const candCompounds = cm.primary_compounds || candidate.compounds || [];
  const sharedCompounds = sourceCompounds.filter(c => candCompounds.includes(c)).length;
  points += Math.min(sharedCompounds * 25, 25);

  // Shared protocol class
  if (sm.protocol_class && sm.protocol_class === cm.protocol_class) points += 20;

  // Similar duration (±2 weeks)
  const sourceDuration = sm.duration_weeks || source.duration_weeks || 0;
  const candDuration = cm.duration_weeks || candidate.duration_weeks || 0;
  if (sourceDuration && candDuration && Math.abs(sourceDuration - candDuration) <= 2) points += 10;

  // Shared secondary goals
  const sourceSecGoals = sm.secondary_goals || source.secondary_goals || [];
  const candSecGoals = cm.secondary_goals || candidate.secondary_goals || [];
  const sharedSecondary = sourceSecGoals.filter(g => candSecGoals.includes(g)).length;
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
  const sm = source.clinical_metadata || source.clinical_evidence || {};
  const cm = candidate.clinical_metadata || candidate.clinical_evidence || {};
  
  const sourceGoal = sm.clinical_goal || source.therapeutic_category;
  const candGoal = cm.clinical_goal || candidate.therapeutic_category;
  if (sourceGoal && sourceGoal === candGoal)
    return `Same ${GOAL_LABELS[sourceGoal] || sourceGoal} target`;

  if (sm.protocol_class && sm.protocol_class === cm.protocol_class)
    return `Shared ${CLASS_LABELS[sm.protocol_class] || sm.protocol_class} strategy`;

  const sourceCompounds = sm.primary_compounds || source.compounds || [];
  const candCompounds = cm.primary_compounds || candidate.compounds || [];
  const sharedC = sourceCompounds.filter(c => candCompounds.includes(c));
  if (sharedC.length > 0) {
    const compoundName = typeof sharedC[0] === 'string' ? sharedC[0].replace(/_/g, ' ') : 'compounds';
    return `Shared compound: ${compoundName}`;
  }

  const sourceDuration = sm.duration_weeks || source.duration_weeks || 0;
  const candDuration = cm.duration_weeks || candidate.duration_weeks || 0;
  if (sourceDuration && candDuration && Math.abs(sourceDuration - candDuration) <= 2)
    return 'Similar duration';

  return 'Clinically related';
}

// ── Main API ───────────────────────────────────────────────────────────────
/**
 * Returns top 4 clinically related protocols for a given protocol object from a provided pool of protocols.
 * Falls back to same clinical_goal, then to all protocols sorted by goal overlap.
 *
 * @param {Object} sourceProtocol - The main protocol object
 * @param {Array<Object>} allProtocols - Array of all available protocols from Firestore
 * @returns {Array<{id, protocol, score, matchReason}>}
 */
export function getRelatedProtocols(sourceProtocol, allProtocols = []) {
  if (!sourceProtocol || !allProtocols.length) return [];
  const protocolId = sourceProtocol.id || sourceProtocol.protocol_id;

  return _cached(`related:${protocolId}:${allProtocols.length}`, () => {
    const candidates = allProtocols.filter(p => (p.id || p.protocol_id) !== protocolId);

    const scored = candidates.map(candidate => ({
      id: candidate.id || candidate.protocol_id,
      protocol: candidate,
      score: score(sourceProtocol, candidate),
      matchReason: getMatchReason(sourceProtocol, candidate),
    })).sort((a, b) => b.score - a.score);

    // Primary: top 4 with score > 0
    let results = scored.filter(r => r.score > 0).slice(0, 4);

    // Fallback 1: same clinical_goal only
    if (results.length < 2) {
      const sourceGoal = sourceProtocol.clinical_metadata?.clinical_goal || sourceProtocol.therapeutic_category;
      results = candidates
        .filter(candidate => {
          const candGoal = candidate.clinical_metadata?.clinical_goal || candidate.therapeutic_category;
          return candGoal && candGoal === sourceGoal;
        })
        .map(candidate => ({
          id: candidate.id || candidate.protocol_id,
          protocol: candidate,
          score: 50,
          matchReason: `Same ${GOAL_LABELS[sourceGoal] || sourceGoal} target`,
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

