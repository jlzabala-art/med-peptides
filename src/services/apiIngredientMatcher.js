/**
 * apiIngredientMatcher.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Resolves an AI-extracted ingredient name to a catalog productId using:
 *
 *   1. Genomics-First Lookup (TeloTest, TrichoTest, NutriGen canonical catalog)
 *   2. Out-of-program alert generation if a test requests an unassigned API
 *   3. Algolia fuzzy search against the general 'products' index
 *   4. If match found (confidence ≥ threshold) → use existing productId
 *   5. If no match → create a placeholder product via placeholderProductService
 *
 * Usage:
 *   const { productId, isNew, matchedName, isUnassignedProgramApi, programAlert } =
 *     await resolveIngredient({ rawName: "Minoxidil 5%", programName: "TrichoTest" });
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { searchAlgolia } from './algoliaSearch.js';
import { extractApiBaseName, createPlaceholderApiProduct } from './placeholderProductService.js';
import { lookupGenomicIngredient } from './genomicsCatalogLookup.js';
import logger from '../utils/logger.js';

// Minimum score to consider an Algolia result a confident match.
const MATCH_CONFIDENCE_THRESHOLD = 0.75;

/**
 * Compute a simple similarity score between two strings (0–1).
 */
function computeSimilarity(queryName, hitName) {
  if (!queryName || !hitName) return 0;

  const q = queryName.toLowerCase().trim();
  const h = hitName.toLowerCase().trim();

  // Exact match
  if (q === h) return 1;

  // One fully contains the other
  if (h.includes(q) || q.includes(h)) return 0.9;

  // Word overlap ratio
  const qWords = q.split(/\s+/);
  const hWords = h.split(/\s+/);
  const intersection = qWords.filter(w => hWords.includes(w));
  const union = new Set([...qWords, ...hWords]);
  const jaccardScore = intersection.length / union.size;

  // Bonus for first-word match (most important for ingredient names)
  const firstWordBonus = qWords[0] === hWords[0] ? 0.2 : 0;

  return Math.min(1, jaccardScore + firstWordBonus);
}

/**
 * Resolve an ingredient name to a productId.
 *
 * @param {Object} options
 * @param {string}  options.rawName                - AI extracted name, e.g. "Latanoprost 0.005%"
 * @param {string}  [options.programSlug]          - Target test slug ("fagron-genomics-trichotest")
 * @param {string}  [options.programName]          - Target test name ("TrichoTest", "NutriGen")
 * @param {string}  [options.supplierHint]         - Supplier hint for placeholder ("Fagron Iberia")
 * @param {string}  [options.importSource]         - Import context ("fagron_genomics")
 * @returns {Promise<{
 *   productId: string|null,
 *   matchedName: string,
 *   isNew: boolean,
 *   isPlaceholder: boolean,
 *   score: number,
 *   priority?: string|null,
 *   isProgramAssigned?: boolean,
 *   isUnassignedProgramApi?: boolean,
 *   unassignedProgramName?: string|null,
 *   programAlert?: string|null,
 *   matchedProduct?: Object|null
 * }>}
 */
export async function resolveIngredient({
  rawName,
  programSlug = null,
  programName = null,
  supplierHint = 'Fagron Iberia',
  importSource = 'fagron_genomics',
}) {
  const baseName = extractApiBaseName(rawName);
  const effectiveProgram = programSlug || programName;

  // ── Step 1: Genomics-First Lookup ──────────────────────────────────────────
  try {
    const genomicResult = await lookupGenomicIngredient(rawName, effectiveProgram);
    if (genomicResult.matchedProduct) {
      const prod = genomicResult.matchedProduct;
      return {
        productId: prod.id || prod.slug,
        matchedName: prod.name || prod.displayName || baseName,
        isNew: false,
        isPlaceholder: false,
        score: 1.0,
        priority: genomicResult.priority,
        isProgramAssigned: genomicResult.isProgramAssigned,
        isUnassignedProgramApi: genomicResult.isUnassignedProgramApi,
        unassignedProgramName: genomicResult.programName,
        programAlert: genomicResult.programAlert,
        matchedProduct: prod
      };
    }
  } catch (err) {
    logger.warn('[apiIngredientMatcher] Genomics catalog lookup warning:', err.message);
  }

  // ── Step 2: Try Algolia General Search ────────────────────────────────────
  let bestMatch = null;
  let bestScore = 0;

  try {
    const results = await searchAlgolia(baseName);
    const hits = results.products || [];

    for (const hit of hits) {
      const hitName = hit.name || hit.displayName || '';
      const score = computeSimilarity(baseName, hitName);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = hit;
      }
    }
  } catch (err) {
    logger.warn('[apiIngredientMatcher] Algolia search failed:', err.message);
  }

  // ── Step 3: Accept match if above threshold ──────────────────────────────
  if (bestMatch && bestScore >= MATCH_CONFIDENCE_THRESHOLD) {
    const isUnassigned = !!effectiveProgram;
    const alertMsg = isUnassigned
      ? `⚠️ Alerta: El API "${bestMatch.name || baseName}" se encontró en el catálogo general, pero NO está en la lista oficial de ${programName || programSlug} (Fagron Genomics).`
      : null;

    return {
      productId: bestMatch.objectID || bestMatch.id,
      matchedName: bestMatch.name || bestMatch.displayName || baseName,
      isNew: false,
      isPlaceholder: false,
      score: bestScore,
      priority: null,
      isProgramAssigned: !isUnassigned,
      isUnassignedProgramApi: isUnassigned,
      unassignedProgramName: programName || programSlug,
      programAlert: alertMsg,
      matchedProduct: bestMatch
    };
  }

  // ── Step 4: No match → create placeholder ────────────────────────────────
  try {
    const { productId, isNew, name } = await createPlaceholderApiProduct({
      rawName,
      supplierHint,
      importSource,
    });

    const isUnassigned = !!effectiveProgram;
    const alertMsg = isUnassigned
      ? `⚠️ Alerta: El API "${name}" no está catalogada en la lista oficial de ${programName || programSlug} (Fagron Genomics). Se ha generado un placeholder.`
      : null;

    return {
      productId,
      matchedName: name,
      isNew,
      isPlaceholder: true,
      score: 0,
      priority: null,
      isProgramAssigned: false,
      isUnassignedProgramApi: isUnassigned,
      unassignedProgramName: programName || programSlug,
      programAlert: alertMsg,
      matchedProduct: null
    };
  } catch (err) {
    logger.error('[apiIngredientMatcher] Failed to create placeholder:', err);
    return {
      productId: null,
      matchedName: baseName,
      isNew: false,
      isPlaceholder: false,
      score: 0,
      priority: null,
      isProgramAssigned: false,
      isUnassignedProgramApi: !!effectiveProgram,
      unassignedProgramName: programName || programSlug,
      programAlert: effectiveProgram ? `⚠️ API no reconocida para ${programName || programSlug}: ${baseName}` : null,
      matchedProduct: null
    };
  }
}

/**
 * Batch-resolve multiple ingredient names.
 * Runs in parallel for performance.
 *
 * @param {Array<{name: string, dose?: string, quantity?: number}>} ingredients
 * @param {{ supplierHint?: string, importSource?: string, programSlug?: string, programName?: string }} options
 * @returns {Promise<Array<{ original, productId, matchedName, isNew, isPlaceholder, score, isUnassignedProgramApi, programAlert, priority }>>}
 */
export async function resolveIngredients(ingredients = [], options = {}) {
  return Promise.all(
    ingredients.map(async (ing) => {
      const resolved = await resolveIngredient({
        rawName: ing.name || '',
        ...options,
      });
      return { original: ing, ...resolved };
    })
  );
}
