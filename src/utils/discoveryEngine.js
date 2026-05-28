 
/**
 * discoveryEngine.js
 * Deterministic matching engine for the Med-Peptides Discovery System.
 * Uses the following priority order for FAQ matching:
 *   1. product_ids[]     → embedded canonical Firestore product IDs in FAQ docs (preferred)
 *   2. relatedPeptideNames[] → fuzzy name fallback for legacy / unresolved associations
 * Related-peptide matching additionally uses:
 *   3. same_family       → shared familyTags
 *   4. shared_goals      → shared goalTags
 *   5. seo_overlap       → shared seoKeywords
 *   6. related_catalog_keywords → relatedCatalogKeywords overlap
 *   7. faq_tags          → general tag overlap
 */

// ── Product Name Alias Table ─────────────────────────────────────────────────
// Maps Firestore product names → canonical names used in the mapping system.
const PRODUCT_NAME_ALIASES = {
  '5-amino 1 mq':                           '5-amino-1mq',
  '5-amino 1mq':                            '5-amino-1mq',
  '5-amino-1mq':                            '5-amino-1mq',
  'cjc-1295 without dac (modified grf 1-29)': 'cjc-1295 without dac',
  'fst-344 (follistatin)':                   'fst-344',
  'hgh':                                     'hgh 10iu',
  'igf-1 lr3':                               'igf-lr3',
  'mk-677 (ibutamoren)':                     'mk-677',
  'mt2 (melanotan ii)':                      'mt2',
  'pt-141 (bremelanotide)':                  'pt-141',
  'tb-500 (thymosin β4)':                    'thymosin b4 (tb-500)',
  'thymosin b4 (tb-500)':                    'thymosin b4 (tb-500)',
};

/**
 * Normalize a product name for comparison:
 * - lowercase, trim
 * - collapse internal whitespace
 * - normalize digit spacing ("1 MQ" → "1mq")
 * - apply explicit alias table
 * - strip trailing parenthetical as fallback
 */
function resolveProductName(name) {
  if (!name) return '';
  // Collapse all internal whitespace, lowercase, trim
  const lower = name.toLowerCase().trim().replace(/\s+/g, ' ');
  // 1. Exact alias match (after whitespace collapse)
  if (PRODUCT_NAME_ALIASES[lower]) return PRODUCT_NAME_ALIASES[lower];
  // 2. Normalize spaces around numbers / letters: "1 mq" → "1mq"; "5 amino" stays
  const numberNorm = lower.replace(/(\d)\s+(\w)/g, '$1$2').replace(/(\w)\s+(\d)/g, '$1$2');
  if (PRODUCT_NAME_ALIASES[numberNorm]) return PRODUCT_NAME_ALIASES[numberNorm];
  // 3. Generic: strip trailing parenthetical like " (Something)"
  const stripped = lower.replace(/\s*\([^)]+\)\s*$/, '').trim();
  if (stripped !== lower) return stripped;
  return lower;
}

// ── FAQ Search ─────────────────────────────────────────────────────────────
/**
 * Searches FAQ items by query string across multiple fields.
 * @param {Array}  faqItems        - array of FAQ documents
 * @param {string} query           - user search query
 * @param {boolean} isProfessional - whether the user is a professional
 * @returns {Array} sorted, filtered FAQ items
 */
export function searchFAQ(faqItems, query, isProfessional = false) {
  if (!query || !faqItems?.length) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(word => word.length > 1);

  const visibleItems = faqItems.filter(
    (faq) => faq.active && (faq.visibility === 'public' || isProfessional)
  );

  const scored = visibleItems.map((faq) => {
    let score = 0;
    // Filter out null/undefined array items before joining to prevent i.trim TypeError
    const safeJoin = (arr) => (arr || []).filter(Boolean).join(' ');
    const searchFields = [
      { text: faq.question || '', weight: 10 },
      { text: faq.shortAnswer || '', weight: 8 },
      { text: faq.answer || '', weight: 5 },
      { text: safeJoin(faq.tags), weight: 4 },
      { text: safeJoin(faq.seoKeywords), weight: 3 },
      { text: safeJoin(faq.relatedCatalogKeywords), weight: 3 },
      { text: safeJoin(faq.relatedPeptideNames), weight: 6 },
    ];

    searchFields.forEach(({ text, weight }) => {
      const lower = text.toLowerCase();
      // Exact phrase match in this specific field
      if (lower.includes(q)) {
        score += weight * 5 * (faq.searchWeight || 1);
      }
      // Individual word matches
      words.forEach((word) => {
        if (lower.includes(word)) {
          score += weight * (faq.searchWeight || 1);
        }
      });
    });

    return { ...faq, _score: score };
  });

  return scored
    .filter((f) => f._score > 0)
    .sort((a, b) => b._score - a._score);
}

// ── FAQ by Category ────────────────────────────────────────────────────────
/**
 * Filters FAQ items by category ID.
 */
export function getFAQByCategory(faqItems, categoryId, isProfessional = false) {
  if (!faqItems?.length) return [];
  return faqItems
    .filter(
      (faq) =>
        faq.active &&
        faq.categoryId === categoryId &&
        (faq.visibility === 'public' || isProfessional)
    )
    .sort((a, b) => (b.searchWeight || 0) - (a.searchWeight || 0));
}

// ── FAQ for a specific Product (PDP) ──────────────────────────────────────
/**
 * Gets the top FAQs associated with a specific product.
 *
 * Priority:
 *   1. product_ids[] embedded in FAQ doc includes the canonical product ID
 *   2. relatedPeptideNames[] fuzzy fallback (legacy / unresolved names)
 *
 * @param {string}  peptideName      - product display name (used for fuzzy fallback)
 * @param {Array}   faqItems         - all FAQ documents (each with embedded product_ids[])
 * @param {string}  [productId]      - canonical Firestore product doc ID (preferred)
 * @param {boolean} isProfessional
 * @param {number}  limit            - max FAQs to return (default 5)
 */
export function getFAQForProduct(peptideName, faqItems, productId = null, isProfessional = false, limit = 5) {
  if (!faqItems?.length) return [];

  const pName = resolveProductName(peptideName);

  // Build all slug variants of the product name to match against faq.product_ids[].
  // FAQs in Firestore store slugified names (e.g. "5-amino_1_mq", "5-amino-1mq"),
  // NOT the Firestore document IDs (e.g. "5-AMINO_1_MQ-2mg-vial").
  const rawLower = (peptideName || '').toLowerCase().trim();
  const nameVariants = new Set([
    pName,                                     // canonical resolved name
    rawLower,                                  // raw lowercase
    rawLower.replace(/\s+/g, '-'),            // spaces → dashes
    rawLower.replace(/\s+/g, '_'),            // spaces → underscores
    rawLower.replace(/[\s-]+/g, '_'),         // dashes+spaces → underscores
    rawLower.replace(/[\s_]+/g, '-'),         // underscores+spaces → dashes
    rawLower.replace(/[^a-z0-9]+/g, '-'),     // non-alphanumeric → dashes
    rawLower.replace(/[^a-z0-9]+/g, '_'),     // non-alphanumeric → underscores
    (pName || '').replace(/[\s-]+/g, '_'),    // canonical with underscores
    (pName || '').replace(/[\s_]+/g, '-'),    // canonical with dashes
  ].filter(Boolean));

  const isVisible = (faq) =>
    faq.active && (faq.visibility === 'public' || isProfessional);

  // 1. Match via faq.product_ids[] — try both the raw productId (doc ID) AND
  //    all slug variants of the product name (what FAQs actually store).
  const seen = new Set();
  const matchByIds = faqItems.filter((faq) => {
    if (!isVisible(faq)) return false;
    if (!Array.isArray(faq.product_ids) || !faq.product_ids.length) return false;
    const matched =
      (productId && faq.product_ids.includes(productId)) ||
      faq.product_ids.some((pid) => nameVariants.has(pid.toLowerCase().trim()));
    if (matched) { seen.add(faq.faqId || faq.id); }
    return matched;
  });

  // 2. Fuzzy fallback: relatedPeptideNames in FAQ doc
  const relatedByName = faqItems.filter(
    (faq) =>
      isVisible(faq) &&
      !seen.has(faq.faqId || faq.id) &&
      faq.relatedPeptideNames?.some((rn) => resolveProductName(rn) === pName)
  );

  return [...matchByIds, ...relatedByName].slice(0, limit);
}


// ── Related Peptides Engine ─────────────────────────────────────────────────
/**
 * Get related peptides for a given peptide using 6-step deterministic matching.
 * @param {string} peptideName
 * @param {Array}  relatedEngine   - from `peptide_related_engine` collection
 * @param {Array}  peptideCatalog  - from `peptide_catalog_reference` in JSON
 * @param {boolean} isProfessional
 * @param {number}  limit
 */
export function getRelatedPeptides(peptideName, relatedEngine, catalog = [], isProfessional = false, limit = 6) {
  if (!peptideName || !relatedEngine?.length) return [];
  const pName = resolveProductName(peptideName);

  // Find the exact engine entry for the current peptide
  const baseEntry = relatedEngine.find(e => resolveProductName(e.peptideName) === pName || e.slug === pName);

  if (!baseEntry) {
    // Fallback: match by shared goals from catalog
    return getCatalogRelated(peptideName, catalog, isProfessional, limit);
  }

  const candidates = new Map(); // peptideName -> score
  const results = [];
  const seen = new Set([resolveProductName(baseEntry.peptideName)]);

  const checkVisibility = (visibility, isProfessional) => {
    return visibility === 'public' || isProfessional;
  };

  const addCandidate = (entry, score) => {
    if (!entry) return;
    const resolvedEntryName = resolveProductName(entry.peptideName);
    if (resolvedEntryName === pName) return; // Don't add the source peptide itself
    if (!seen.has(resolvedEntryName) && checkVisibility(entry.visibility, isProfessional)) {
      candidates.set(resolvedEntryName, (candidates.get(resolvedEntryName) || 0) + score);
    }
  };

  // Priority 1: direct relatedPeptides list
  (baseEntry.relatedPeptides || []).forEach((n) => {
    const entry = relatedEngine.find(e => resolveProductName(e.peptideName) === resolveProductName(n));
    addCandidate(entry, 10);
  });

  // Priority 2: compareCandidates
  (baseEntry.compareCandidates || []).forEach((n) => {
    const entry = relatedEngine.find(e => resolveProductName(e.peptideName) === resolveProductName(n));
    addCandidate(entry, 8);
  });

  // Priority 3: same_family from relatedEngine
  relatedEngine.forEach((entry) => {
    const sharedFamilies = (entry.familyTags || []).filter((t) =>
      (baseEntry.familyTags || []).includes(t)
    );
    if (sharedFamilies.length > 0) addCandidate(entry, sharedFamilies.length * 4);
  });

  // Priority 4: shared_goals from relatedEngine
  relatedEngine.forEach((entry) => {
    const sharedGoals = (entry.goalTags || []).filter((t) =>
      (baseEntry.goalTags || []).includes(t)
    );
    if (sharedGoals.length > 0) addCandidate(entry, sharedGoals.length * 2);
  });

  // Sort by score and then collect unique entries up to the limit
  const sortedCandidateNames = [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  for (const name of sortedCandidateNames) {
    if (results.length >= limit) break;
    const entry = relatedEngine.find(e => resolveProductName(e.peptideName) === name);
    if (entry && !seen.has(name) && checkVisibility(entry.visibility, isProfessional)) {
      results.push(entry);
      seen.add(name);
    }
  }

  return results.slice(0, limit);
}

// ── Fallback: Catalog-based related peptides ────────────────────────────────
function getCatalogRelated(peptideName, catalog, isProfessional, limit) {
  if (!catalog?.length) return [];
  const pName = resolveProductName(peptideName);
  const source = catalog.find(
    (p) => resolveProductName(p.peptideName) === pName
  );
  if (!source) return [];

  return catalog
    .filter(
      (p) =>
        resolveProductName(p.peptideName) !== pName &&
        (p.visibility === 'public' || isProfessional) &&
        (
          p.familyTags?.some((t) => source.familyTags?.includes(t)) ||
          p.goalTags?.some((t) => source.goalTags?.includes(t))
        )
    )
    .slice(0, limit)
    .map((p) => ({ peptideName: p.peptideName, slug: p.slug, visibility: p.visibility }));
}

// ── Compare Block for a Peptide ────────────────────────────────────────────
/**
 * Get the compare block(s) for a specific peptide.
 */
export function getCompareBlock(peptideName, compareBlocks, limit = 1) {
  if (!peptideName || !compareBlocks?.length) return [];
  const pName = resolveProductName(peptideName);
  
  return compareBlocks
    .filter(b => resolveProductName(b.basePeptide) === pName || b.compareWith?.some((p) => resolveProductName(p) === pName))
    .slice(0, limit);
}

// ── Filter all FAQs for display (with visibility) ─────────────────────────
export function getVisibleFAQs(faqItems, isProfessional = false) {
  return (faqItems || []).filter(
    (faq) => faq.active && (faq.visibility === 'public' || isProfessional)
  );
}
