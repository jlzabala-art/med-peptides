/**
 * productRepository.server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-Side Isomorphic Product Repository for Next.js Server Components and API Routes.
 * Executes queries directly via Firebase Admin SDK (`adminDb`).
 * Applies identical canonical normalization, schema derive and variant extraction.
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { normalizeProduct } from './mappers';
import { filterProductVariantsStrictly } from '@/utils/strictFilterEngine';

export const productRepositoryServer = {
  /**
   * Fetch a single product by ID or slug on the server
   */
  async getProduct(productId) {
    if (!productId) return null;
    try {
      const docRef = adminDb.collection('products').doc(productId);
      const snap = await docRef.get();
      if (!snap.exists) return null;

      const pData = { id: snap.id, ...snap.data() };

      // Load variants subcollection if available
      const vSnap = await docRef.collection('variants').get();
      if (!vSnap.empty) {
        pData.variants = vSnap.docs.map(vd => ({ id: vd.id, ...vd.data() }));
      }

      return normalizeProduct(pData, pData.id);
    } catch (err) {
      console.error(`[productRepositoryServer.getProduct] Error fetching ${productId}:`, err);
      return null;
    }
  },

  /**
   * Query products with strict supplier, category and status filters on the server
   */
  async getProducts({
    supplierId = null,
    catalogueFilter = null,
    category = 'all',
    status = ['active', 'published', 'out of stock'],
    limitCount = 100
  } = {}) {
    try {
      let query = adminDb.collection('products');

      if (status && status.length > 0) {
        query = query.where('status', 'in', Array.isArray(status) ? status : [status]);
      }

      if (supplierId && supplierId !== 'all') {
        const canonicalSupplierId = supplierId.startsWith('supplier-') ? supplierId : `supplier-${supplierId}`;
        query = query.where('supplierIds', 'array-contains', canonicalSupplierId);
      }

      if (limitCount && limitCount > 0) {
        query = query.limit(limitCount);
      }

      let snapshot;
      try {
        snapshot = await query.get();
      } catch (err) {
        // Fallback in case composite index is not deployed yet
        snapshot = await adminDb.collection('products').where('status', 'in', ['active', 'published', 'out of stock']).limit(limitCount).get();
      }

      const products = [];

      for (const doc of snapshot.docs) {
        const pData = { id: doc.id, ...doc.data() };

        // Fetch variants subcollection to guarantee complete synchronization
        const vSnap = await doc.ref.collection('variants').get();
        if (!vSnap.empty) {
          pData.variants = vSnap.docs.map(vd => ({ id: vd.id, ...vd.data() }));
        }

        // Apply strict filter engine
        const filteredVariants = filterProductVariantsStrictly(pData, {
          supplierId,
          catalogueFilter,
          categoryFilter: category !== 'all' ? category : null
        });

        if (supplierId || catalogueFilter || category !== 'all') {
          if (filteredVariants.length > 0) {
            products.push({
              ...normalizeProduct(pData, pData.id),
              variants: filteredVariants
            });
          }
        } else {
          products.push(normalizeProduct(pData, pData.id));
        }
      }

      return products;
    } catch (err) {
      console.error('[productRepositoryServer.getProducts] Error executing query:', err);
      return [];
    }
  }
};
