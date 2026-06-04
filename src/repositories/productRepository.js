 
/**
 * productRepository.js
 *
 * Single data-access layer for the canonical Firestore product model.
 *
 * Schema:
 *   products/{productId}                    — product-level data
 *     variants/{variantId}                  — SKU: dosage × route × supplier
 *   suppliers/{supplierId}                  — supplier master data
 *
 * Pricing tiers on each variant:
 *   pricing.masterPrice    — supplier cost  (ADMIN ONLY)
 *   pricing.retailPrice    — public web price
 *   pricing.clinicPrice    — clinic price
 *   pricing.wholesalePrice — pro/reseller price
 *   Each tier has { base, byCountry } for country overrides.
 *
 * All callers should import from this module — never query Firestore directly
 * from UI components.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
// v2 canonical catalog — replaces legacy data/products.js enrichment
import { catalog as localProducts } from '../data/v2/index.js';

// Build a lookup map from normalised product name → local enrichment fields.
// This is built once at module load time (O(n), tiny dataset).
// Maps a v2 canonical product to the enrichment shape used by _resolveLocalEnrich.
// v2 stores search fields in classification.* and science.*
const _buildEnrichEntry = (p) => ({
  goals:            p.classification?.goals            ?? p.goals            ?? [],
  secondaryFactors: p.classification?.secondaryFactors ?? p.secondaryFactors  ?? [],
  tags:             p.classification?.tags             ?? p.tags             ?? [],
  mechanisms:       p.classification?.mechanisms       ?? p.mechanisms       ?? [],
  semanticKeywords: p.classification?.semanticKeywords ?? p.semanticKeywords ?? [],
  synonyms:         p.synonyms                        ?? [],
  objective:        p.science?.objective               ?? p.objective        ?? '',
  desc:             p.science?.desc                   ?? p.desc             ?? '',
  searchAliases:    p.searchAliases                   ?? [],
  scientificName:   p.science?.iupacName              ?? p.scientificName   ?? '',
  displayName:      p.displayName                     || p.name             || '',
  name:             p.name                            ?? '',
  aiContent:        p.aiContent                       ?? null,
  pharmacology:     p.pharmacology                    ?? null,
});

// Primary key: exact normalised name (e.g. "tb-500 (thymosin β4)")
const _localEnrichmentByName = new Map(
  localProducts.map((p) => [(p.name ?? '').toLowerCase().trim(), _buildEnrichEntry(p)])
);

// Secondary key: the "base" token before any parenthetical, normalised
// e.g. "TB-500 (Thymosin β4)" → "tb-500"
// This lets us match Firestore docs whose name is just the short form.
const _localEnrichmentBySlug = new Map();
for (const p of localProducts) {
  const full = (p.name ?? '').toLowerCase().trim();
  // Extract everything before the first '(' or other delimiter
  const baseSlug = full.replace(/\s*[(/|].*$/, '').trim();
  if (baseSlug && baseSlug !== full && !_localEnrichmentBySlug.has(baseSlug)) {
    _localEnrichmentBySlug.set(baseSlug, _buildEnrichEntry(p));
  }
  // Also index by each alias so alias-named Firestore docs are found
  for (const alias of (p.searchAliases ?? [])) {
    const aliasKey = alias.toLowerCase().trim();
    if (aliasKey && !_localEnrichmentBySlug.has(aliasKey)) {
      _localEnrichmentBySlug.set(aliasKey, _buildEnrichEntry(p));
    }
  }
}

/**
 * Resolve local enrichment for a Firestore product doc using multiple fallback
 * strategies so that partial or differently-formatted names still match.
 *
 * Priority:
 *   1. Exact name match
 *   2. Base slug match (name before first parenthesis)
 *   3. Alias index match
 *   4. Prefix substring match (Firestore name starts with a local product name token)
 */
function _resolveLocalEnrich(firestoreName, firestoreId) {
  const nameKey = (firestoreName ?? '').toLowerCase().trim();

  // 1. Exact match
  if (_localEnrichmentByName.has(nameKey)) return _localEnrichmentByName.get(nameKey);

  // 2. Base-slug match (strip parenthetical from Firestore name too)
  const baseKey = nameKey.replace(/\s*[(/|].*$/, '').trim();
  if (baseKey && _localEnrichmentByName.has(baseKey)) return _localEnrichmentByName.get(baseKey);
  if (baseKey && _localEnrichmentBySlug.has(baseKey)) return _localEnrichmentBySlug.get(baseKey);

  // 3. Alias / secondary slug index
  if (_localEnrichmentBySlug.has(nameKey)) return _localEnrichmentBySlug.get(nameKey);

  // 4. Doc ID heuristic: Firestore IDs are often slug-like (e.g. "tb-500-2mg")
  const idKey = (firestoreId ?? '').toLowerCase()
    .replace(/-\d+(\.\d+)?(mg|mcg|iu|ml|g|kg|unit|vial|kit|pack|tab|cap|amp).*$/i, '')
    .trim();
  if (idKey && _localEnrichmentByName.has(idKey)) return _localEnrichmentByName.get(idKey);
  if (idKey && _localEnrichmentBySlug.has(idKey)) return _localEnrichmentBySlug.get(idKey);

  // 5. Partial prefix: any local product whose name starts with our key
  for (const [localName, enrich] of _localEnrichmentByName) {
    if (localName.startsWith(nameKey) || nameKey.startsWith(localName.replace(/\s*[(].*$/, '').trim())) {
      return enrich;
    }
  }

  // No match found — warn in dev so mismatches are easy to spot exactly once
  if (import.meta.env.DEV && (firestoreName || firestoreId)) {
    const warnKey = `${firestoreName}_${firestoreId}`;
    if (!globalThis.__warnedMismatches) {
      globalThis.__warnedMismatches = new Set();
    }
    if (!globalThis.__warnedMismatches.has(warnKey)) {
      globalThis.__warnedMismatches.add(warnKey);
      // console.warn(
      //   `[productRepository] No local enrichment found for Firestore product: name="${firestoreName}", id="${firestoreId}". ` +
      //   `Search scoring will rely on Firestore fields only. Add an entry to src/data/products.js to fix.`
      // );
    }
  }

  return {}; // no match
}

// ── Collection helpers ────────────────────────────────────────────────────────
const productsCol  = ()          => collection(db, 'products');
const variantsCol  = (productId) => collection(db, 'products', productId, 'variants');
const suppliersCol = ()          => collection(db, 'suppliers');

// ── Module-level cache ────────────────────────────────────────────────────────
// Caches active products for 5 minutes to avoid repeated Firestore round-trips
// on re-renders or navigation back to the home page.
let _activeProductsCache = null;
let _activeProductsCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function invalidateProductsCache() {
  _activeProductsCache = null;
  _activeProductsCacheTime = 0;
}

// ── Product-level queries ─────────────────────────────────────────────────────

/**
 * Fetch all product documents (top-level, no variants).
 * Includes all statuses. Useful for admin.
 */
export async function getAllProducts() {
  try {
    const snap = await getDocs(productsCol());
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[productRepository] getAllProducts:', err);
    throw err;
  }
}

/**
 * Fetch only active products.
 * - Returns from cache if data is < 5 minutes old.
 * - Fetches the full collection and filters client-side so that:
 *   (a) No composite Firestore index is required.
 *   (b) Documents missing both `isActive` and `status` fields are treated as
 *       active (permissive default) rather than silently excluded.
 */
export async function getActiveProducts() {
  // Return cached data if still fresh
  if (_activeProductsCache && (Date.now() - _activeProductsCacheTime < CACHE_TTL_MS)) {
    return _activeProductsCache;
  }

  try {
    // Full collection scan — safe for small/medium catalogs and avoids index deps.
    const snap = await getDocs(productsCol());

    const results = [];
    for (const d of snap.docs) {
      const data = d.data();

      // Treat a document as "inactive" only when explicitly flagged:
      //   isActive === false  OR  status === 'inactive' | 'draft' | 'archived'
      // Documents that have neither field are considered active.
      const explicitlyInactive =
        data.isActive === false ||
        (data.status && !['active', 'published'].includes(data.status));

      if (!explicitlyInactive) {
        results.push({ id: d.id, ...data });
      }
    }

    // Cache the result
    _activeProductsCache = results;
    _activeProductsCacheTime = Date.now();

    return results;
  } catch (err) {
    console.error('[productRepository] getActiveProducts:', err);
    throw err;
  }
}

/**
 * Fetch a single product by its slug id.
 * Returns null if not found.
 */
export async function getProduct(productId) {
  try {
    const ref = doc(db, 'products', productId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('[productRepository] getProduct:', err);
    throw err;
  }
}

// ── Variant-level queries ─────────────────────────────────────────────────────

/**
 * Fetch all variants for a product, sorted by sortOrder asc.
 */
export async function getVariants(productId) {
  try {
    const q = query(variantsCol(productId), orderBy('sortOrder', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Firestore throws when `sortOrder` field doesn't exist on some docs
    // (requires a composite index). Fall back to unordered fetch + client sort.
    if (err?.code === 'failed-precondition' || err?.message?.includes('index')) {
      console.warn(`[productRepository] getVariants(${productId}): index missing, falling back to client-side sort`);
      try {
        const snap = await getDocs(variantsCol(productId));
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      } catch (fallbackErr) {
        console.error(`[productRepository] getVariants fallback(${productId}):`, fallbackErr);
        return []; // never block the parent query
      }
    }
    console.error(`[productRepository] getVariants(${productId}):`, err);
    return []; // return empty array instead of throwing so getCatalog can continue
  }
}

/**
 * Fetch all available variants for a product (stock.available === true).
 */
export async function getAvailableVariants(productId) {
  try {
    const q = query(
      variantsCol(productId),
      where('stock.available', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`[productRepository] getAvailableVariants(${productId}):`, err);
    throw err;
  }
}

/**
 * Fetch a single variant by productId + variantId.
 * Returns null if not found.
 */
export async function getVariant(productId, variantId) {
  try {
    const ref = doc(db, 'products', productId, 'variants', variantId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error(`[productRepository] getVariant(${productId}, ${variantId}):`, err);
    throw err;
  }
}

// ── Composite: product + variants ─────────────────────────────────────────────

/**
 * Fetch a product with all its variants attached.
 * Returns { ...productDoc, variants: [...] } or null.
 *
 * @param {string}  productId
 * @param {boolean} [availableOnly=false] - Filter to in-stock variants only
 */
export async function getProductWithVariants(productId, availableOnly = false) {
  try {
    const [product, variants] = await Promise.all([
      getProduct(productId),
      availableOnly ? getAvailableVariants(productId) : getVariants(productId),
    ]);
    if (!product) return null;
    return { ...product, variants };
  } catch (err) {
    console.error(`[productRepository] getProductWithVariants(${productId}):`, err);
    throw err;
  }
}

/**
 * Fetch all active products with their available variants.
 * Returns an array of { ...product, variants: [...], defaultVariant }
 *
 * Firestore stores each dosage as a separate top-level product doc
 * (e.g. Tirzepatide-5mg-vial, Tirzepatide-10mg-vial). This function
 * groups all docs that share the same `name` into a single product entry
 * with a unified `variants` array, so the UI sees one "Tirzepatide" with
 * multiple selectable dosages.
 *
 * Variant shape after grouping:
 *   {
 *     id:       <subcollection variant id>,
 *     _docId:   <parent product doc id>,
 *     dosage:   <from parent doc>,
 *     pricing:  <from subcollection variant>,
 *     ...rest of subcollection variant fields
 *   }
 *
 * This is the primary call for rendering the Catalog.
 */
export async function getCatalog() {
  try {
    const products = await getActiveProducts();

    // Load variants for every product doc
    const enriched = await Promise.all(
      products.map(async (product) => {
        const subcollectionVariants = await getVariants(product.id);

        const variants = subcollectionVariants.map((v) => ({
          ...v,
          _docId: product.id,
          // Prefer dosage already on the subcollection variant; fall back to
          // the parent doc's top-level dosage field.
          dosage: v.dosage || product.dosage || null,
          supplier: v.supplier || product.supplier || null,
          isProfessional: v.isProfessional !== undefined ? v.isProfessional : (product.isProfessional || false),
        }));

        return { ...product, variants };
      })
    );

    // ── Group products that share the same `name` ───────────────────────────
    // Key = canonical name (trimmed). For each group, keep the metadata from
    // the "isDefault" doc (or the first one) and merge all variants together.
    const groups = new Map(); // name → { base product, variants[] }

    for (const product of enriched) {
      const key = (product.name ?? product.id ?? '').trim() || product.id || `_unknown_${Math.random()}`;

      if (!groups.has(key)) {
        groups.set(key, { base: product, variants: [] });
      }

      const group = groups.get(key);

      // Prefer the doc explicitly marked isDefault as the base metadata carrier
      if (product.isDefault && !group.base.isDefault) {
        group.base = product;
      }

      group.variants.push(...product.variants);
    }

    // ── Build the final catalog array ───────────────────────────────────────
    const catalog = [];

    for (const { base, variants } of groups.values()) {
      // Sort variants by numeric dosage value (lowest first)
      variants.sort((a, b) => {
        const numA = parseFloat((a.dosage || a.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat((b.dosage || b.strength || '0').replace(/[^0-9.]/g, '')) || 0;
        return numA - numB;
      });

      const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
      // ── Merge local search enrichment ──────────────────────────────────
      // Firestore product docs rarely carry goals/semanticKeywords/etc.
      // We merge them from the local products.js master list using a multi-
      // strategy lookup that handles name mismatches (e.g. "TB-500" in Firestore
      // vs "TB-500 (Thymosin β4)" locally).
      const localEnrich = _resolveLocalEnrich(base.name, base.id);

      // If local enrichment resolved a name/displayName and Firestore lacks one,
      // use it so the search engine always has something to score against.
      const resolvedName        = base.name        || localEnrich.name        || base.id || '';
      const resolvedDisplayName = base.displayName || localEnrich.displayName || resolvedName;

      catalog.push({
        ...base,
        name:             resolvedName,
        displayName:      resolvedDisplayName,
        // ── Canonical Phase 5-7 fields — explicit so callers can rely on them ──
        // productType is stamped by migrations and by supplementRepository; default 'peptide'
        productType:      base.productType ?? 'peptide',
        // aiContent: clinicalBrief, contraindications, synergies (Phase 10)
        aiContent:        base.aiContent   || localEnrich.aiContent || null,
        // pharmacology: halfLife, receptorTargets (Phase 10)
        pharmacology:     base.pharmacology || localEnrich.pharmacology || null,
        // typeData: type-specific metadata block (Phase 7)
        typeData:         base.typeData    ?? null,
        // ── Search-enrichment fields: local data wins if Firestore lacks them ──
        goals:            base.goals?.length            ? base.goals            : localEnrich.goals            ?? [],
        secondaryFactors: base.secondaryFactors?.length  ? base.secondaryFactors  : localEnrich.secondaryFactors  ?? [],
        tags:             base.tags?.length             ? base.tags             : localEnrich.tags             ?? [],
        mechanisms:       base.mechanisms?.length       ? base.mechanisms       : localEnrich.mechanisms       ?? [],
        semanticKeywords: base.semanticKeywords?.length ? base.semanticKeywords : localEnrich.semanticKeywords ?? [],
        synonyms:         base.synonyms?.length         ? base.synonyms         : localEnrich.synonyms         ?? [],
        objective:        base.objective  || localEnrich.objective  || '',
        desc:             base.desc       || localEnrich.desc       || '',
        searchAliases:    base.searchAliases?.length    ? base.searchAliases    : localEnrich.searchAliases    ?? [],
        scientificName:   base.scientificName || localEnrich.scientificName || '',
        variants,
        defaultVariant,
      });
    }

    // Sort by category then displayName
    return catalog.sort((a, b) => {
      const catCompare = (a.category ?? '').localeCompare(b.category ?? '');
      if (catCompare !== 0) return catCompare;
      return (a.displayName ?? a.name ?? '').localeCompare(b.displayName ?? b.name ?? '');
    });
  } catch (err) {
    console.error('[productRepository] getCatalog:', err);
    return []; // return empty array — never block the UI
  }
}

// ── Route & supplier variant queries ─────────────────────────────────────────

/**
 * Fetch testing products and optionally filter by capabilities or sample kit.
 *
 * @param {Object} filters
 * @param {string} [filters.sampleKitType] - e.g., 'Saliva_Tube', 'Blood_Spot'
 * @param {boolean} [filters.requiresPrescription]
 * @param {boolean} [filters.aiInterpretationService]
 * @returns {Promise<Array>}
 */
export async function getTestingCatalog(filters = {}) {
  try {
    const catalog = await getCatalog();
    
    // Filter down to testing products only
    let testingProducts = catalog.filter((p) => p.category === 'Testing' || p.productType === 'testing');
    
    // Apply additional filters if provided
    if (filters.sampleKitType) {
      testingProducts = testingProducts.filter(
        (p) => p.sampleKit?.type === filters.sampleKitType
      );
    }
    
    if (filters.requiresPrescription !== undefined) {
      testingProducts = testingProducts.filter(
        (p) => p.additionalCapabilities?.requiresPrescription === filters.requiresPrescription
      );
    }
    
    if (filters.aiInterpretationService !== undefined) {
      testingProducts = testingProducts.filter(
        (p) => p.additionalCapabilities?.aiInterpretationService === filters.aiInterpretationService
      );
    }
    
    return testingProducts;
  } catch (err) {
    console.error('[productRepository] getTestingCatalog:', err);
    return [];
  }
}

/**
 * Fetch all variants for a product filtered by administration route.
 *
 * @param {string} productId
 * @param {string} route - One of ROUTE.* from productEnums.js
 * @returns {Promise<Array>}
 */
export async function getVariantsByRoute(productId, route) {
  try {
    const q = query(
      variantsCol(productId),
      where('route', '==', route),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`[productRepository] getVariantsByRoute(${productId}, ${route}):`, err);
    throw err;
  }
}

/**
 * Fetch all variants for a product from a specific supplier.
 *
 * @param {string} productId
 * @param {string} supplierId
 * @returns {Promise<Array>}
 */
export async function getVariantsBySupplier(productId, supplierId) {
  try {
    const q = query(
      variantsCol(productId),
      where('supplierId', '==', supplierId),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`[productRepository] getVariantsBySupplier(${productId}, ${supplierId}):`, err);
    throw err;
  }
}

/**
 * Return the first active default variant for a given route.
 * Falls back to first active variant for that route if no default is set.
 *
 * @param {string} productId
 * @param {string} route
 * @returns {Promise<Object|null>}
 */
export async function getDefaultVariantByRoute(productId, route) {
  try {
    const variants = await getVariantsByRoute(productId, route);
    return variants.find((v) => v.isDefault) ?? variants[0] ?? null;
  } catch (err) {
    console.error(`[productRepository] getDefaultVariantByRoute(${productId}, ${route}):`, err);
    throw err;
  }
}

// ── Protocol ↔ Variant bidirectional queries ──────────────────────────────────

/**
 * Fetch all protocols that reference a specific variant (via usedInProtocols[]).
 * Useful for impact analysis: "which protocols are affected if I discontinue this SKU?"
 *
 * Note: This reads the denormalized `usedInProtocols` array on the variant doc.
 * No cross-collection query needed.
 *
 * @param {string} productId
 * @param {string} variantId
 * @returns {Promise<Array<{protocolId, protocolTitle, phaseIndex, phaseName}>>}
 */
export async function getProtocolsForVariant(productId, variantId) {
  try {
    const variant = await getVariant(productId, variantId);
    return variant?.usedInProtocols ?? [];
  } catch (err) {
    console.error(`[productRepository] getProtocolsForVariant(${productId}, ${variantId}):`, err);
    throw err;
  }
}

// ── Supplier queries ──────────────────────────────────────────────────────────

/**
 * Fetch all active suppliers.
 */
export async function getSuppliers() {
  try {
    const q = query(suppliersCol(), where('isActive', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[productRepository] getSuppliers:', err);
    throw err;
  }
}

/**
 * Fetch a single supplier by supplierId.
 * Returns null if not found.
 *
 * @param {string} supplierId
 * @returns {Promise<Object|null>}
 */
export async function getSupplier(supplierId) {
  try {
    const ref = doc(db, 'suppliers', supplierId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error(`[productRepository] getSupplier(${supplierId}):`, err);
    throw err;
  }
}

// ── Legacy compatibility shim ─────────────────────────────────────────────────
// Keeps existing code that imports { productRepository } working.

export const productRepository = {
  getAllProducts,
  getActiveProducts,
  getProduct,
  getVariants,
  getAvailableVariants,
  getVariant,
  getProductWithVariants,
  getCatalog,
  getTestingCatalog,
  // Phase 1 additions:
  getVariantsByRoute,
  getVariantsBySupplier,
  getDefaultVariantByRoute,
  getProtocolsForVariant,
  getSuppliers,
  getSupplier,
};
