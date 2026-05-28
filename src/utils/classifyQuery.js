 
/**
 * classifyQuery.js — ClinicalAI Phase 1 + Phase 2
 *
 * Phase 1: Central query classifier.
 *   Returns one of 9 canonical query types + routing metadata.
 *   No AI calls. No UI. Pure JS. Independently testable.
 *
 * Phase 2: Catalog-aware entity detection.
 *   Accepts an optional `catalogIndex` array built from Firebase/local products.
 *   When provided, exact/fuzzy catalog matches override keyword heuristics.
 *   productType in catalog determines entity_type (peptide | supplement | protocol).
 *
 * Output shape:
 * {
 *   query_type:        string,   // one of the 9 canonical types
 *   confidence:        'high' | 'medium' | 'low',
 *   detected_entities: Array<{ name, slug, entity_type }>,
 *   reason:            string,
 * }
 */

// ── Constants ────────────────────────────────────────────────────────────────

/** Priority-ordered canonical query types (index 0 = highest priority). */
export const QUERY_TYPES = [
  'comparison_query',
  'safety_or_beginner_query',
  'reconstitution_query',
  'availability_query',
  'peptide_query',
  'supplement_query',
  'protocol_query',
  'goal_query',
  'general_education_query',
  'vague_query',
  'ambiguous_query',
];

/** Maps internal short names → canonical QUERY_TYPES strings. */
export const INTENT_TO_QUERY_TYPE = {
  comparison:     'comparison_query',
  safety:         'safety_or_beginner_query',
  beginner:       'safety_or_beginner_query',
  reconstitution: 'reconstitution_query',
  availability:   'availability_query',
  peptide:        'peptide_query',
  supplement:     'supplement_query',
  protocol:       'protocol_query',
  goal:           'goal_query',
  education:      'general_education_query',
  vague:          'vague_query',
  ambiguous:      'ambiguous_query',
};

/** Short-form reverse map: canonical string → short name. */
export const QUERY_TYPE_TO_INTENT = Object.fromEntries(
  Object.entries(INTENT_TO_QUERY_TYPE).map(([k, v]) => [v, k])
);

// ── Regex patterns (compiled once) ───────────────────────────────────────────

const RE_COMPARISON     = /\bvs\b|\bversus\b|\bcompare\b|\bdiferencia\b|\bdifference between\b|\bwhich is better\b|\bwhich one\b|\bor\b.*\bor\b/i;
const RE_SAFETY         = /\b(safe|safety|side effect|side-effect|danger|risk|contraindic|allerg|interact|tox|overdos|harm|warning|adverse|legal|legality|seguridad|efecto|contraindicaci)/i;
const RE_BEGINNER       = /\b(where (do i|should i) start|getting started|i'?m new|im new|i am new|newbie|beginner|never used|don'?t know where|dont know where|don'?t know what|first time|just starting|just started|complete(ly)? new)\b/i;
const RE_RECONSTITUTION = /\b(mix|reconstitute|reconstitution|bacteriostatic|bac water|solvent|dilute|add water|storage|temperature|stability|saline|estabilidad|mezclar|reconstituir|preparar|diluir|conservar|guardar|nevera|refrigerar)\b/i;
const RE_AVAILABILITY = /\b(in stock|available|price|cost|how much|buy|purchase|order|ship|delivery|do you (have|sell|carry)|disponib|comprar|precio|stock|kits)\b/i;
const RE_SUPPLEMENT   = /\b(vitamin|mineral|zinc|magnesium|omega[-\s]?3|biotin|collagen powder|ashwagandha|saw palmetto|creatine|resveratrol|curcumin|probiotics?|fish oil|vitamin [bcdek]|multivitamin)\b/i;
const RE_PROTOCOL     = /\b(protocol|stack|cycle|dosing schedule|how to use|what to take|which peptide|which compound|best (peptide|compound|treatment) for|combined? (with|therapy))\b/i;
const RE_EDUCATION    = /^(what|how|why|when|who|where|explain|describe|tell me|can you explain|is (it|there|a)|are (there|they))\b|\b(mechanism|half-life|half life|saturation|receptor|affinity|injection|optimal|levels?)\b/i;
const RE_COMPOUND_PATTERN = /(?:tell\s+me\s+about|what\s+(?:is|are|does|do)|explain|describe|info\s+(?:on|about)|about|how\s+does|how\s+do)\s+[A-Za-z0-9][A-Za-z0-9-]{2,}/i;
const RE_STANDALONE_NAME  = /^\s*[A-Za-z][A-Za-z0-9-]{3,}(\s+[A-Za-z0-9-]+){0,2}\s*[?!.]?\s*$/;
const RE_VAGUE            = /^(what (should i|to) take|recommendation|advice|where to start|what do you suggest)\b/i;

/** Health-outcome terms that look like compound names but are goal queries. */
const GOAL_TERMS = new Set([
  'anti-aging', 'antiaging', 'anti aging',
  'hair-loss', 'hair loss', 'hair-growth', 'hair growth',
  'fat-loss', 'fat loss', 'weight-loss', 'weight loss',
  'brain-fog', 'brain fog', 'gut-health', 'gut health',
  'skin-health', 'skin health', 'sexual-health', 'sexual health',
  'joint-health', 'joint health', 'muscle-growth', 'muscle growth',
  'longevity', 'energy', 'sleep', 'muscle', 'recovery',
  'immunity', 'inflammation', 'cognitive', 'stress', 'mood',
  'testosterone', 'libido', 'injury', 'aging', 'performance',
  'weight loss', 'fat loss', 'lean mass', 'endurance', 'strength',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(str) {
  return String(str || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Phase 2 — Catalog-aware entity detection.
 * Scans the catalogIndex for the best matching product(s) in the query.
 *
 * @param {string}  lower        Normalized user query.
 * @param {Array}   catalogIndex Array of { name, slug, productType, aliases, searchTerms }.
 * @returns {Array<{ name, slug, entity_type }>}
 */
function detectCatalogEntities(lower, catalogIndex = []) {
  if (!catalogIndex.length) return [];

  const hits = [];

  // Sort longest-name-first so multi-word names take priority over fragments
  const sorted = [...catalogIndex].sort(
    (a, b) => (b.name || '').length - (a.name || '').length
  );

  for (const item of sorted) {
    const names = [
      normalize(item.name),
      ...(item.aliases || []).map(normalize),
      ...(item.searchTerms || []).map(normalize),
    ].filter(Boolean);

    const matched = names.some(n => n.length >= 3 && lower.includes(n));
    if (matched) {
      hits.push({
        name:        item.name,
        slug:        item.slug || null,
        entity_type: item.productType || 'unknown',
      });
    }
  }

  return hits;
}

// ── Main Classifier ───────────────────────────────────────────────────────────

/**
 * Classify a plain user query into one of 9 canonical ClinicalAI query types.
 *
 * @param {string}  query         Raw user input.
 * @param {object}  [options]
 * @param {Array}   [options.catalogIndex]  Phase 2: product catalog for entity detection.
 *                                          Each entry: { name, slug, productType, aliases, searchTerms }
 * @param {boolean} [options.hasPreRankedResults] Hint: search engine already matched results.
 * @param {string}  [options.matchedGoalTheme]    Hint: goal theme matched upstream.
 *
 * @returns {{
 *   query_type:        string,
 *   confidence:        'high'|'medium'|'low',
 *   detected_entities: Array<{name, slug, entity_type}>,
 *   reason:            string,
 * }}
 */
export function classifyQuery(query, options = {}) {
  const { catalogIndex = [], hasPreRankedResults = false, matchedGoalTheme = null } = options;

  const raw   = String(query || '').trim();
  const lower = normalize(raw);

  if (!raw) {
    return {
      query_type:        'ambiguous_query',
      confidence:        'low',
      detected_entities: [],
      reason:            'Empty query.',
    };
  }

  // ── Phase 2: Catalog entity scan ─────────────────────────────────────────
  const catalogHits = detectCatalogEntities(lower, catalogIndex);

  // ── High-Priority Goal Check ─────────────────────────────────────────────
  // If the query is an explicit prompt for a goal/lifestyle, do not degrade it to a peptide_query
  const isExplicitGoal = 
    lower.includes('muscle growth & recovery') ||
    lower.includes('fat loss & metabolic health') ||
    lower.includes('cognitive performance & focus') ||
    lower.includes('longevity & biological repair') ||
    lower.includes('hormonal vitality & balance') ||
    lower.includes('skin, hair & cellular health') ||
    lower.includes('immune function & defense') ||
    lower.includes('clinical research pathways') ||
    lower.includes('journey to improve your health');

  if (isExplicitGoal) {
    return {
      query_type:        'goal_query',
      confidence:        'high',
      detected_entities: catalogHits,
      reason:            'Explicit goal or lifestyle pathway query matched.',
    };
  }

  // ── Priority 1: comparison_query ─────────────────────────────────────────
  if (RE_COMPARISON.test(raw)) {
    return {
      query_type:        'comparison_query',
      confidence:        'high',
      detected_entities: catalogHits,
      reason:            'Comparison signal detected (vs / compare / which is better).',
    };
  }

  // ── Priority 2: safety_or_beginner_query ─────────────────────────────────
  if (RE_SAFETY.test(raw) || RE_BEGINNER.test(raw)) {
    return {
      query_type:        'safety_or_beginner_query',
      confidence:        'high',
      detected_entities: catalogHits,
      reason:            RE_BEGINNER.test(raw) ? 'Beginner signal detected.' : 'Safety/risk signal detected.',
    };
  }

  // ── Priority 2.3: vague_query ────────────────────────────────────────────
  if (RE_VAGUE.test(raw) && !catalogHits.length) {
    return {
      query_type:        'vague_query',
      confidence:        'high',
      detected_entities: [],
      reason:            'Vague recommendation request detected (no specific entity).',
    };
  }

  // ── Priority 2.5: reconstitution_query ───────────────────────────────────
  if (RE_RECONSTITUTION.test(raw)) {
    return {
      query_type:        'reconstitution_query',
      confidence:        'high',
      detected_entities: catalogHits,
      reason:            'Reconstitution signal detected.',
    };
  }

  // ── Priority 3: availability_query ───────────────────────────────────────
  if (RE_AVAILABILITY.test(raw)) {
    return {
      query_type:        'availability_query',
      confidence:        'high',
      detected_entities: catalogHits,
      reason:            'Availability/purchase signal detected.',
    };
  }

  // ── Phase 2: catalog-driven classification (Priorities 4–6) ─────────────
  if (catalogHits.length > 0) {
    // Derive type from first (highest-priority) hit's productType
    const primaryType = catalogHits[0].entity_type;
    const typeMap = {
      peptide:               'peptide_query',
      peptides:              'peptide_query',
      supplement:            'supplement_query',
      supplements:           'supplement_query',
      protocol:              'protocol_query',
      protocols:             'protocol_query',
      professional_material: 'protocol_query',
    };
    const mapped = typeMap[primaryType];
    if (mapped) {
      return {
        query_type:        mapped,
        confidence:        'high',
        detected_entities: catalogHits,
        reason:            `Catalog match: "${catalogHits[0].name}" (${primaryType}).`,
      };
    }
  }

  // ── Priority 4 (keyword fallback): supplement_query ──────────────────────
  if (RE_SUPPLEMENT.test(raw)) {
    return {
      query_type:        'supplement_query',
      confidence:        'medium',
      detected_entities: catalogHits,
      reason:            'Supplement keyword detected (no catalog match).',
    };
  }

  // ── Priority 5 (keyword fallback): protocol_query ────────────────────────
  if (RE_PROTOCOL.test(raw)) {
    return {
      query_type:        'protocol_query',
      confidence:        'medium',
      detected_entities: catalogHits,
      reason:            'Protocol/stack keyword detected.',
    };
  }

  // ── Priority 6 (keyword fallback): peptide_query ─────────────────────────
  const hasCompoundPattern = RE_COMPOUND_PATTERN.test(raw);
  const isStandaloneName   = RE_STANDALONE_NAME.test(raw);
  const hasGoalTerm = Array.from(GOAL_TERMS).some(term => lower.includes(term));
  if ((hasCompoundPattern || isStandaloneName) && !hasGoalTerm) {
    return {
      query_type:        'peptide_query',
      confidence:        'medium',
      detected_entities: catalogHits,
      reason:            'Compound name pattern or standalone name detected (no catalog match).',
    };
  }

  // ── Priority 7: goal_query ────────────────────────────────────────────────
  const matchesGoal = Array.from(GOAL_TERMS).some(term => lower.includes(term));
  if (matchesGoal || matchedGoalTheme || hasPreRankedResults) {
    return {
      query_type:        'goal_query',
      confidence:        matchedGoalTheme ? 'high' : 'medium',
      detected_entities: catalogHits,
      reason:            matchedGoalTheme
        ? `Goal theme matched: "${matchedGoalTheme}".`
        : hasPreRankedResults
          ? 'Pre-ranked search results suggest goal intent.'
          : `Goal term matched in query.`,
    };
  }

  // ── Priority 8: general_education_query ──────────────────────────────────
  if (RE_EDUCATION.test(raw)) {
    return {
      query_type:        'general_education_query',
      confidence:        'medium',
      detected_entities: catalogHits,
      reason:            'Question pattern detected (what/how/why etc.).',
    };
  }

  // ── Priority 9: ambiguous_query (fallback) ────────────────────────────────
  return {
    query_type:        'ambiguous_query',
    confidence:        'low',
    detected_entities: catalogHits,
    reason:            'No strong classification signal found.',
  };
}

// ── Convenience helpers ───────────────────────────────────────────────────────

/**
 * Build a minimal catalogIndex from a Firebase products array.
 * Call once at app init or chat session start; cache the result.
 *
 * @param {Array} products  Raw Firebase product documents.
 * @returns {Array<{ name, slug, productType, aliases, searchTerms }>}
 */
export function buildCatalogIndex(products = []) {
  return products.map(p => ({
    name:        p.displayName || p.name || '',
    slug:        p.slug || p.id || null,
    productType: p.productType || p.type || p.category || 'unknown',
    aliases:     p.aliases || [],
    searchTerms: p.searchTerms || [],
  })).filter(e => e.name.length >= 3);
}

/**
 * Convenience: returns the canonical query type string for a raw query.
 * Accepts the same options as classifyQuery().
 */
export function getQueryType(query, options = {}) {
  return classifyQuery(query, options).query_type;
}
