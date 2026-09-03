/**
 * productRepository.js
 *
 * Single data-access layer for the canonical Firestore product model.
 *
 * @typedef {Object} PricingTier
 * @property {number} base - Base unit price
 * @property {Record<string, number>} [byCountry] - Optional country overrides
 *
 * @typedef {Object} ProductVariant
 * @property {string} id - Variant unique identifier
 * @property {string} productId - Parent product identifier
 * @property {string} [dosage] - Clinical dosage (e.g. '10mg', '5mg/ml')
 * @property {string} [route] - Administration route (e.g. 'subcutaneous', 'nasal')
 * @property {string} [supplierId] - Supplier identifier
 * @property {Object} [pricing]
 * @property {PricingTier} [pricing.masterPrice] - Supplier cost (Admin Only)
 * @property {PricingTier} [pricing.retailPrice] - Public retail price
 * @property {PricingTier} [pricing.clinicPrice] - Clinic price
 * @property {PricingTier} [pricing.wholesalePrice] - Wholesaler tier price
 *
 * @typedef {Object} Product
 * @property {string} id - Product document ID
 * @property {string} name - Chemical/commercial peptide name
 * @property {string} [slug] - URL friendly slug
 * @property {string} [category] - Clinical category
 * @property {string} [cas] - CAS registry number
 * @property {Array<ProductVariant>} [variants] - Associated variant records
 * @property {boolean} [isActive] - Active status
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeProduct } from './mappers';
import {
  validateProductWrite,
  validateVariantWrite,
  ProductValidationError,
} from './productWriteGuard';
import { deriveProductTypes } from '../schemas/firestoreProductSchema.js';

import { createCacheManager } from '../utils/cacheManager';

// ── Collection helpers ────────────────────────────────────────────────────────
const productsCol  = ()          => collection(db, 'products');
const variantsCol  = (productId) => collection(db, 'products', productId, 'variants');
const suppliersCol = ()          => collection(db, 'suppliers');

// ── Module-level cache (dual-layer: memory + localStorage) ────────────────────────
const PRODUCTS_CACHE_KEY = 'regenpept_products_cache_v4';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (Firestore is source of truth)

const cache = createCacheManager(PRODUCTS_CACHE_KEY, CACHE_TTL_MS);

export function invalidateProductsCache() {
  cache.invalidate();
}

export const invalidateCatalogCache = invalidateProductsCache;

// ── Product-level queries ─────────────────────────────────────────────────────

/**
 * Fetch featured products for the Home Page Server Component.
 * Bypasses full catalog overhead.
 */
export async function getFeaturedProductsServer() {
  try {
    const q = query(
      productsCol(), 
      where('isActive', '==', true), 
      limit(20)
    );
    const snap = await getDocs(q);
    
    // Convert to regular objects immediately
    const products = snap.docs.map(d => normalizeProduct(d.data(), d.id));
    
    // Sort logic to match previous frontend sorting if necessary, or just return
    return products.sort((a, b) => (a.displayName ?? a.name ?? '').localeCompare(b.displayName ?? b.name ?? ''));
  } catch (err) {
    console.error('[productRepository] getFeaturedProductsServer:', err);
    return [];
  }
}

/**
 * Fetch products for a specific collection on the server.
 * Ensures the Server Component only serializes what is needed.
 */
export async function getProductsByCategoryServer(categorySlug) {
  try {
    const isAllOrPeptides = !categorySlug || ['all', 'peptides'].includes(categorySlug.toLowerCase());
    
    // If 'all' or 'peptides', we just fetch a limited set or rely on client hydration 
    // for the full explorer view. We fetch the first 40 to ensure SEO is populated.
    if (isAllOrPeptides) {
      const q = query(productsCol(), where('isActive', '==', true), limit(40));
      const snap = await getDocs(q);
      return snap.docs.map(d => normalizeProduct(d.data(), d.id));
    }
    
    // Else, try to match category (basic matching logic, categorySlug often maps directly to 'category' field, 
    // but the DB uses 'category' as a string like 'Recovery & Repair'. So if it's a specific string...)
    // Since Firebase string matching is case sensitive, we'll fetch a batch and filter to be safe.
    const q = query(productsCol(), where('isActive', '==', true), limit(100));
    const snap = await getDocs(q);
    const products = snap.docs.map(d => normalizeProduct(d.data(), d.id));
    
    const target = categorySlug.toLowerCase().replace(/-/g, '');
    return products.filter(p => {
      // categoryId is authoritative (Phase 1 migration); category kept as fallback
      const cat = p.categoryId || p.category || '';
      if (!cat) return false;
      const catNorm = cat.toLowerCase().replace(/[^a-z0-9]/g, '');
      return catNorm.includes(target) || target.includes(catNorm);
    });
    
  } catch (err) {
    console.error('[productRepository] getProductsByCategoryServer:', err);
    return [];
  }
}


/**
 * Fetch all product documents (top-level, no variants).
 * Includes all statuses. Useful for admin.
 */
export async function getAllProducts() {
  try {
    const q = query(productsCol(), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeProduct(d.data(), d.id));
  } catch (err) {
    console.error('[productRepository] getAllProducts:', err);
    throw err;
  }
}

/**
 * Fetch multiple products by their IDs en un batch eficiente.
 * Cross-entity: usado por protocolos para cargar sus productos asociados,
 * y por prescripciones para enriquecer líneas con datos del producto.
 *
 * Firestore limita `in` a 30 IDs — se hace chunking automático.
 *
 * @param {string[]} ids — Array de product IDs
 * @returns {Promise<Record<string, object>>} — mapa productId → producto
 */
export async function getProductsByIds(ids = []) {
  if (!ids.length) return {};
  const unique = [...new Set(ids.filter(Boolean))];
  const CHUNK = 30;
  const chunks = [];
  for (let i = 0; i < unique.length; i += CHUNK) {
    chunks.push(unique.slice(i, i + CHUNK));
  }
  const results = {};
  await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(productsCol(), where('__name__', 'in', chunk));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        results[d.id] = normalizeProduct(d.data(), d.id);
      });
    })
  );
  return results;
}

/**
 * Fetch only active/published products.
 *
 * Performance strategy:
 *   Layer 1 — In-memory module cache (30 min TTL).
 *   Layer 2 — localStorage via cacheManager.
 *   Layer 3 — Firestore (only when both caches are cold or forceRefresh=true).
 *
 * Instead of a single limit(10000) that can read thousands of docs atomically
 * and block the main thread, we use a paginated cursor loop (300 docs/batch).
 * This keeps each individual request small and allows the event loop to breathe
 * between pages.
 *
 * Filter logic (permissive default):
 *   A document is treated as INACTIVE only when explicitly flagged:
 *     isActive === false  OR  status ∈ {'inactive','draft','archived','hidden'}
 *   Documents without these fields default to ACTIVE.
 */
export async function getActiveProducts({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = cache.read();
    if (cached) return cached;
  }

  const PAGE_SIZE = 300; // Safe per-batch read budget
  const results = [];
  let cursor = null;

  try {
    do {
      const q = cursor
        ? query(productsCol(), orderBy('__name__'), startAfter(cursor), limit(PAGE_SIZE))
        : query(productsCol(), orderBy('__name__'), limit(PAGE_SIZE));

      const snap = await getDocs(q);

      for (const d of snap.docs) {
        const data = d.data();

        // Treat a document as "inactive" only when explicitly flagged.
        const explicitlyInactive =
          data.isActive === false ||
          (data.status && !['active', 'published'].includes(data.status));

        if (!explicitlyInactive) {
          results.push(normalizeProduct(data, d.id));
        }
      }

      cursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
    } while (cursor);

    cache.write(results);
    return results;
  } catch (err) {
    console.error('[productRepository] getActiveProducts:', err);
    throw err;
  }
}


/**
 * Fetch products with real pagination.
 * 
 * @param {number} pageSize 
 * @param {object} lastDoc - A Firestore document snapshot (or null for first page)
 * @returns {Promise<{items: Array, lastDoc: object}>}
 */
export async function getActiveProductsPaginated(pageSize = 50, lastDoc = null) {
  try {
    let q = query(productsCol(), orderBy('name'), limit(pageSize));
    if (lastDoc) {
      q = query(productsCol(), orderBy('name'), startAfter(lastDoc), limit(pageSize));
    }
    
    const snap = await getDocs(q);
    const results = [];
    
    for (const d of snap.docs) {
      const data = d.data();
      const explicitlyInactive =
        data.isActive === false ||
        (data.status && !['active', 'published'].includes(data.status));

      if (!explicitlyInactive) {
        results.push({ id: d.id, ...data });
      }
    }
    
    const newLastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
    return { items: results, lastDoc: newLastDoc };
  } catch (err) {
    console.error('[productRepository] getActiveProductsPaginated:', err);
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
    return snap.exists() ? normalizeProduct(snap.data(), snap.id) : null;
  } catch (err) {
    console.error('[productRepository] getProduct:', err);
    throw err;
  }
}


/**
 * Fetch a single product by name (or canonicalName).
 * Returns the first matched doc as the base product.
 */
export async function getProductByName(name) {
  try {
    const q1 = query(collection(db, 'products'), where('name', '==', name));
    let snap = await getDocs(q1);
    
    if (snap.empty) {
      const q2 = query(collection(db, 'products'), where('canonicalName', '==', name));
      snap = await getDocs(q2);
    }
    
    // Find the one marked as default, or fallback to the first one
    const docs = snap.docs;
    if (docs.length === 0) return null;
    let baseDoc = docs.find(d => d.data().isDefault) || docs[0];
    return normalizeProduct(baseDoc.data(), baseDoc.id);
  } catch (err) {
    console.error('[productRepository] getProductByName:', err);
    throw err;
  }
}

// ── Variant-level queries ─────────────────────────────────────────────────────

/**
 * Fetch all variants for a product, sorted by sortOrder asc.
 */
export async function getVariants(productId) {
  try {
    const q = query(variantsCol(productId));
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => normalizeProduct(d.data(), d.id));
    return docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (err) {
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
      where('stock.available', '==', true)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => normalizeProduct(d.data(), d.id));
    return docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
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
    return snap.exists() ? normalizeProduct(snap.data(), snap.id) : null;
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

    // Load variants for every product doc and build catalog directly.
    // All enrichment data (pharmacology, mechanisms, scientificName, etc.)
    // now lives directly in Firestore — no local JSON merge needed (Phase 6E).
    const catalog = await Promise.all(
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

        // Sort variants by numeric dosage value (lowest first)
        variants.sort((a, b) => {
          const numA = parseFloat((a.dosage || a.strength || '0').replace(/[^0-9.]/g, '')) || 0;
          const numB = parseFloat((b.dosage || b.strength || '0').replace(/[^0-9.]/g, '')) || 0;
          return numA - numB;
        });

        const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;

        const resolvedName        = product.name        || product.id || '';
        const resolvedDisplayName = product.displayName || resolvedName;

        return {
          ...product,
          name:             resolvedName,
          canonicalName:    product.canonicalName || resolvedName,
          displayName:      resolvedDisplayName,
          // ── Canonical fields — explicit so callers can rely on them ──
          productType:      product.productType ?? 'peptide',
          aiContent:        product.aiContent    ?? null,
          pharmacology:     product.pharmacology ?? null,
          typeData:         product.typeData     ?? null,
          // ── Search-enrichment fields (all from Firestore) ──
          goals:            product.goals            ?? [],
          secondaryFactors: product.secondaryFactors ?? [],
          tags:             product.tags             ?? [],
          mechanisms:       product.mechanisms       ?? [],
          semanticKeywords: product.semanticKeywords ?? [],
          synonyms:         product.synonyms         ?? [],
          objective:        product.objective        ?? '',
          desc:             product.desc             ?? '',
          searchAliases:    product.searchAliases    ?? [],
          scientificName:   product.scientificName   ?? '',
          variants,
          defaultVariant,
        };
      })
    );

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
    let testingProducts = catalog.filter((p) => {
      const cat = (p.categoryId || p.category || '').toLowerCase();
      return cat === 'diagnostic_test' || cat === 'testing' || p.productType === 'testing';
    });
    
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
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => normalizeProduct(d.data(), d.id));
    return docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
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
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map((d) => normalizeProduct(d.data(), d.id));
    return docs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
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
    const q = query(suppliersCol(), where('isActive', '==', true), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeProduct(d.data(), d.id));
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
    return snap.exists() ? normalizeProduct(snap.data(), snap.id) : null;
  } catch (err) {
    console.error(`[productRepository] getSupplier(${supplierId}):`, err);
    throw err;
  }
}

/**
 * Fetch peptide_related_engine discovery data.
 */
export async function getRelatedEngineData() {
  try {
    const snap = await getDocs(collection(db, 'peptide_related_engine'));
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('[productRepository] getRelatedEngineData:', err);
    return [];
  }
}

/**
 * Fetch product enrichments from productEnrichments collection.
 */
export async function getProductEnrichment(cacheKey) {
  try {
    const docRef = doc(db, 'productEnrichments', cacheKey);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().enrichment;
    }
    return null;
  } catch (err) {
    console.error(`[productRepository] getProductEnrichment(${cacheKey}):`, err);
    return null;
  }
}

// ─── Imports Support ────────────────────────────────────────────────────────
export async function importCoAs(coaRecords) {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  for (const record of coaRecords) {
    const ref = doc(collection(db, 'batch_coas'));
    batch.set(ref, {
      ...record,
      createdAt: now,
    });
  }
  await batch.commit();
}

export async function importCatalogs(catalogRecords) {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  for (const record of catalogRecords) {
    const ref = doc(collection(db, 'imported_catalogs'));
    batch.set(ref, {
      ...record,
      createdAt: now,
    });
  }
  await batch.commit();
}

// ── Write Operations (Phase 6B — Guard-protected) ─────────────────────────────
// ALL product/variant writes MUST go through these functions.
// Direct setDoc/updateDoc to 'products' is FORBIDDEN.

/**
 * Create a new product in Firestore.
 * Data is validated and normalized through the productWriteGuard before writing.
 *
 * @param {Object}  data      - Product data (must include name, type, categoryId)
 * @param {Object}  [opts]    - Options
 * @param {string}  [opts.id] - Optional custom document ID; auto-generated if omitted
 * @param {boolean} [opts.strict=true] - Strip unknown fields
 * @returns {Promise<{ id: string, data: Object }>} The created product id and data
 * @throws {ProductValidationError} If validation fails
 */
export async function createProduct(data, opts = {}) {
  const { id: customId, strict = true } = opts;
  const rawVariants = Array.isArray(data?.variants) ? [...data.variants] : [];
  const dataWithoutVariants = { ...data };
  delete dataWithoutVariants.variants;

  const validated = validateProductWrite(dataWithoutVariants, { isUpdate: false, strict });

  // Stamp timestamps & variantsCount
  validated.createdAt = serverTimestamp();
  validated.updatedAt = serverTimestamp();
  validated.variantsCount = rawVariants.length;

  let docRef;
  if (customId) {
    docRef = doc(productsCol(), customId);
    await setDoc(docRef, validated);
  } else {
    docRef = await addDoc(productsCol(), validated);
  }

  // If initial variants were passed, create them directly in the sub-collection
  if (rawVariants.length > 0) {
    try {
      const batch = writeBatch(db);
      for (const v of rawVariants) {
        const vId = v.id || `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const vRef = doc(variantsCol(docRef.id), vId);
        const valV = validateVariantWrite(v, { isUpdate: false, strict: false });
        valV.productId = docRef.id;
        valV.createdAt = serverTimestamp();
        valV.updatedAt = serverTimestamp();
        batch.set(vRef, valV);
      }
      await batch.commit();
    } catch (varErr) {
      console.warn('[productRepository] createProduct: failed to write sub-collection variants:', varErr);
    }
  }

  invalidateProductsCache();
  return { id: docRef.id, data: validated };
}

/**
 * Update an existing product in Firestore.
 * Only the provided fields are updated (merge); all fields are validated.
 *
 * @param {string} productId - The Firestore document ID
 * @param {Object} data      - Partial product data to update
 * @param {Object} [opts]    - Options
 * @param {boolean} [opts.strict=false] - Strip unknown fields
 * @returns {Promise<{ id: string, data: Object }>}
 * @throws {ProductValidationError}
 */
export async function updateProduct(productId, data, opts = {}) {
  if (!productId || typeof productId !== 'string') {
    throw new ProductValidationError(['productId is required for updates']);
  }
  const { strict = false } = opts;
  const validated = validateProductWrite(data, { isUpdate: true, strict });

  validated.updatedAt = serverTimestamp();

  const docRef = doc(productsCol(), productId);
  await updateDoc(docRef, validated);

  invalidateProductsCache();
  return { id: productId, data: validated };
}

/**
 * Delete a product and all its sub-collection variants from Firestore.
 *
 * @param {string} productId - The Firestore document ID
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
  if (!productId || typeof productId !== 'string') {
    throw new ProductValidationError(['productId is required for deletion']);
  }

  // First, delete all variants in the sub-collection
  const varSnap = await getDocs(variantsCol(productId));
  if (!varSnap.empty) {
    const batch = writeBatch(db);
    varSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  }

  // Then delete the product document itself
  await deleteDoc(doc(productsCol(), productId));
  invalidateProductsCache();
}

/**
 * Create a new variant under a product.
 *
 * @param {string} productId - Parent product ID
 * @param {Object} data      - Variant data (must include supplierId)
 * @param {Object} [opts]
 * @param {string} [opts.id] - Optional custom variant ID
 * @param {boolean} [opts.strict=true]
 * @returns {Promise<{ id: string, data: Object }>}
 * @throws {ProductValidationError}
 */
export async function createVariant(productId, data, opts = {}) {
  if (!productId) {
    throw new ProductValidationError(['productId is required to create a variant']);
  }
  const { id: customId, strict = true } = opts;
  const validated = validateVariantWrite(data, { isUpdate: false, strict });

  validated.createdAt = serverTimestamp();
  validated.updatedAt = serverTimestamp();

  let docRef;
  if (customId) {
    docRef = doc(variantsCol(productId), customId);
    await setDoc(docRef, validated);
  } else {
    docRef = await addDoc(variantsCol(productId), validated);
  }

  // Denormalize: update parent supplierIds, availableTypes, price range, etc.
  await syncVariantDenorm(productId);

  invalidateProductsCache();
  return { id: docRef.id, data: validated };
}

/**
 * Update an existing variant.
 *
 * @param {string} productId - Parent product ID
 * @param {string} variantId - Variant document ID
 * @param {Object} data      - Partial variant data
 * @param {Object} [opts]
 * @param {boolean} [opts.strict=false]
 * @returns {Promise<{ id: string, data: Object }>}
 * @throws {ProductValidationError}
 */
export async function updateVariant(productId, variantId, data, opts = {}) {
  if (!productId || !variantId) {
    throw new ProductValidationError(['productId and variantId are required for updates']);
  }
  const { strict = false } = opts;
  const validated = validateVariantWrite(data, { isUpdate: true, strict });

  validated.updatedAt = serverTimestamp();

  const docRef = doc(variantsCol(productId), variantId);
  await setDoc(docRef, validated, { merge: true });

  // Re-sync parent's denormalized list, availableTypes, presentations, min/max prices
  await syncVariantDenorm(productId);

  invalidateProductsCache();
  return { id: variantId, data: validated };
}

/**
 * Delete a variant from a product.
 *
 * @param {string} productId - Parent product ID
 * @param {string} variantId - Variant document ID
 * @returns {Promise<void>}
 */
export async function deleteVariant(productId, variantId) {
  if (!productId || !variantId) {
    throw new ProductValidationError(['productId and variantId are required for deletion']);
  }
  await deleteDoc(doc(variantsCol(productId), variantId));

  // Re-sync parent's supplierIds after deletion
  await syncVariantDenorm(productId);
  invalidateProductsCache();
}

/**
 * Internal: Re-compute and update the parent product's `supplierIds` array
 * by reading all current variants. This keeps the denormalized field in sync.
 * @private
 */
async function syncVariantDenorm(productId) {
  try {
    const snap = await getDocs(variantsCol(productId));
    const activeVariants = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(v => v.isActive !== false && !['inactive', 'archived', 'draft'].includes(v.status));

    const supplierIds = [...new Set(activeVariants.map(v => v.supplierId || v.supplier).filter(Boolean))];
    const presentations = [...new Set(activeVariants.map(v => v.presentation || v.format).filter(Boolean))];

    const prices = activeVariants
      .map(v => typeof v.unit_price === 'number' ? v.unit_price : (typeof v.price === 'number' ? v.price : parseFloat(v.price)))
      .filter(p => !isNaN(p) && p > 0);

    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    const allVariants = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const derived = deriveProductTypes(allVariants);

    await updateDoc(doc(productsCol(), productId), {
      supplierIds,
      presentations,
      minPrice,
      maxPrice,
      variantsCount: snap.size,
      availableTypes: derived.availableTypes,
      primaryType: derived.primaryType,
      isHybrid: derived.isHybrid,
      type: derived.primaryType,
      productType: derived.primaryType,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error(`[productRepository] syncVariantDenorm(${productId}):`, err);
  }
}

/**
 * Create multiple products in a single Firestore batch.
 * Each product data is validated via `validateProductWrite`.
 * Firestore batches support max 500 operations per commit.
 *
 * @param {Array<Object>} items - Array of product data objects
 * @param {Object} [opts]
 * @param {boolean} [opts.strict=false] - Strip unknown fields
 * @returns {Promise<Array<{ id: string, data: Object }>>}
 */
export async function batchCreateProducts(items, opts = {}) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const { strict = false } = opts;

  const results = [];
  // Firestore batch limit is 500 operations; chunk accordingly
  const BATCH_LIMIT = 400;
  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const chunk = items.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);

    for (const item of chunk) {
      let validated;
      try {
        validated = validateProductWrite(item, { isUpdate: false, strict });
      } catch {
        // If validation fails in non-strict mode, skip the item
        console.warn('[productRepository] batchCreateProducts: skipping invalid item', item);
        continue;
      }
      validated.createdAt = serverTimestamp();
      validated.updatedAt = serverTimestamp();

      const docRef = doc(productsCol());
      batch.set(docRef, validated);
      results.push({ id: docRef.id, data: validated });
    }

    await batch.commit();
  }

  invalidateProductsCache();
  return results;
}

import { collectionGroup } from 'firebase/firestore';

/**
 * Obtiene productos y sus variantes aplanadas por un arreglo de IDs de productos.
 * Utilizado por flujos de creación de catálogos y drawers de cotización.
 * @param {string[]} productIds
 * @returns {Promise<Array<object>>} Arreglo de variantes con metadata de producto padre
 */
export async function fetchProductsWithVariantsByIds(productIds = []) {
  if (!productIds || productIds.length === 0) return [];
  const fetchedVariants = [];

  try {
    for (let i = 0; i < productIds.length; i += 10) {
      const chunk = productIds.slice(i, i + 10);

      // Fetch parent products
      const q = query(collection(db, 'products'), where('__name__', 'in', chunk));
      const snap = await getDocs(q);
      const rawProducts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch variants
      const vQ = query(collectionGroup(db, 'variants'), where('productId', 'in', chunk));
      const vSnap = await getDocs(vQ);
      const allVariants = vSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const variantsByProduct = {};
      allVariants.forEach((v) => {
        if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
        variantsByProduct[v.productId].push(v);
      });

      rawProducts.forEach((p) => {
        const vars = variantsByProduct[p.id] || [];
        if (vars.length > 0) {
          vars.forEach((v, idx) => {
            fetchedVariants.push({
              ...v,
              id: v.id || `${p.id}-var-${idx}`,
              productId: p.id,
              productName: p.name,
              name: `${p.name} - ${v.format || ''} ${v.size || ''}`.trim(),
              supplier: v.supplier || p.supplier || 'Unassigned',
              rawVariant: v,
              rawProduct: p,
            });
          });
        } else {
          fetchedVariants.push({
            id: `${p.id}-default`,
            productId: p.id,
            productName: p.name,
            name: p.name,
            supplier: p.supplier || 'Unassigned',
            rawProduct: p,
          });
        }
      });
    }
    return fetchedVariants;
  } catch (err) {
    logger.error('[productRepository] fetchProductsWithVariantsByIds failed', { error: err.message });
    return [];
  }
}

// ── Legacy compatibility shim ─────────────────────────────────────────────────
// Keeps existing code that imports { productRepository } working.

export const productRepository = {
  // Reads
  getAllProducts,
  getActiveProducts,
  getProduct,
  getVariants,
  getAvailableVariants,
  getVariant,
  getProductWithVariants,
  getCatalog,
  getTestingCatalog,
  getVariantsByRoute,
  getVariantsBySupplier,
  getDefaultVariantByRoute,
  getProtocolsForVariant,
  getSuppliers,
  getSupplier,
  getActiveProductsPaginated,
  getRelatedEngineData,
  getProductEnrichment,
  getFeaturedProductsServer,
  getProductsByCategoryServer,
  fetchProductsWithVariantsByIds,
  // Writes (Phase 6B — guard-protected)
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  invalidateProductsCache,
};

