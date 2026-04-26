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

// ── Collection helpers ────────────────────────────────────────────────────────
const productsCol  = ()          => collection(db, 'products');
const variantsCol  = (productId) => collection(db, 'products', productId, 'variants');
const suppliersCol = ()          => collection(db, 'suppliers');

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
 * Fetch only active products (status === 'active').
 */
export async function getActiveProducts() {
  try {
    const q = query(productsCol(), where('status', '==', 'active'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    console.error(`[productRepository] getVariants(${productId}):`, err);
    throw err;
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

        // Build a synthetic variant for each subcollection entry, injecting
        // the parent doc's dosage so the UI can display it on the button.
        const variants = subcollectionVariants.map((v) => ({
          ...v,
          _docId: product.id,
          // Prefer dosage already on the subcollection variant; fall back to
          // the parent doc's top-level dosage field.
          dosage: v.dosage || product.dosage || null,
        }));

        return { ...product, variants };
      })
    );

    // ── Group products that share the same `name` ───────────────────────────
    // Key = canonical name (trimmed). For each group, keep the metadata from
    // the "isDefault" doc (or the first one) and merge all variants together.
    const groups = new Map(); // name → { base product, variants[] }

    for (const product of enriched) {
      const key = (product.name ?? product.id).trim();

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
      catalog.push({ ...base, variants, defaultVariant });
    }

    // Sort by category then displayName
    return catalog.sort((a, b) => {
      const catCompare = (a.category ?? '').localeCompare(b.category ?? '');
      if (catCompare !== 0) return catCompare;
      return (a.displayName ?? a.name ?? '').localeCompare(b.displayName ?? b.name ?? '');
    });
  } catch (err) {
    console.error('[productRepository] getCatalog:', err);
    throw err;
  }
}

// ── Route & supplier variant queries ─────────────────────────────────────────

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
  // Phase 1 additions:
  getVariantsByRoute,
  getVariantsBySupplier,
  getDefaultVariantByRoute,
  getProtocolsForVariant,
  getSuppliers,
  getSupplier,
};
