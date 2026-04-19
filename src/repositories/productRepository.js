/**
 * productRepository.js
 *
 * Single data-access layer for the canonical Firestore product model.
 *
 * Schema:
 *   products/{productId}          — product-level data
 *     variants/{variantId}        — SKU per strength × kit (primary index)
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
const productsCol = () => collection(db, 'products');
const variantsCol = (productId) => collection(db, 'products', productId, 'variants');

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
 * This is the primary call for rendering the Catalog.
 */
export async function getCatalog() {
  try {
    const products = await getActiveProducts();

    const enriched = await Promise.all(
      products.map(async (product) => {
        const variants = await getAvailableVariants(product.id);
        const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0] ?? null;
        return { ...product, variants, defaultVariant };
      })
    );

    // Sort by category then displayName
    return enriched.sort((a, b) => {
      const catCompare = (a.category ?? '').localeCompare(b.category ?? '');
      if (catCompare !== 0) return catCompare;
      return (a.displayName ?? a.name ?? '').localeCompare(b.displayName ?? b.name ?? '');
    });
  } catch (err) {
    console.error('[productRepository] getCatalog:', err);
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
};
