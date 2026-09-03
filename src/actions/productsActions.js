"use server";

import { revalidatePath } from 'next/cache';
import { adminDb } from '../lib/firebaseAdmin';

export async function fetchProductsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('products').limit(limitCount).get();
    
    // Helper to recursively serialize Firestore Timestamps to ISO strings
    const serializeData = (obj) => {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj?.toDate === 'function') return obj.toDate().toISOString();
      if (typeof obj === 'object' && obj._seconds !== undefined && obj._nanoseconds !== undefined) {
        return new Date(obj._seconds * 1000).toISOString();
      }
      if (Array.isArray(obj)) return obj.map(serializeData);
      if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
          newObj[key] = serializeData(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    const products = snapshot.docs.map(doc => {
      const data = serializeData(doc.data());
      return { id: doc.id, ...data };
    });

    return products;
  } catch (error) {
    console.error("Error fetching products securely:", error);
    return [];
  }
}

export async function fetchProductsMetricsAction() {
  try {
    if (!adminDb) return null;
    
    // 1. Try reading indexed catalog facets metadata first (fastest, includes productTypes & categories)
    let metaDoc = null;
    try {
      metaDoc = await adminDb.collection('_meta').doc('catalog_facets').get();
    } catch (e) {
      console.warn('catalog_facets metadata read note:', e.message);
    }

    if (metaDoc && metaDoc.exists) {
      const data = metaDoc.data();
      return JSON.parse(JSON.stringify({
        total: data.totals?.products || data.totalProducts || data.total || 0,
        active: data.totals?.activeProducts || data.activeProducts || data.active || 0,
        finished: data.productTypes?.finished_product || data.finished || 0,
        apis: data.productTypes?.raw_material || data.productTypes?.api_raw_material || data.apis || 0,
        categories: Array.isArray(data.categories) ? data.categories.length : Object.keys(data.categories || {}).length,
        outOfStock: data.outOfStock || 0,
        goalFacets: data.goals || {},
        categoryFacets: data.categories || {},
        presentationFacets: data.presentations || {},
        supplierFacets: data.suppliers || {},
        productTypeFacets: data.productTypes || {},
      }));
    }

    // 2. Fallback to count aggregations
    const col = adminDb.collection('products');
    const [totalSnap, activeSnap, draftSnap, outOfStockSnap] = await Promise.all([
      col.count().get(),
      col.where('status', '==', 'active').count().get(),
      col.where('status', '==', 'draft').count().get(),
      col.where('stock', '<=', 0).count().get()
    ]);
    
    return {
      total: totalSnap.data().count,
      active: activeSnap.data().count,
      drafts: draftSnap.data().count,
      outOfStock: outOfStockSnap.data().count,
      finished: 0,
      apis: 0,
      categories: 0,
    };
  } catch (error) {
    console.error("Error fetching product metrics securely:", error);
    return null;
  }
}

/**
 * ⚡ Event-Driven Cache Invalidation & Product Update Action
 */
export async function updateProductAction(productId, updateData = {}) {
  try {
    if (!adminDb || !productId) return { success: false, error: 'Missing ID or DB' };

    await adminDb.collection('products').doc(productId).set(updateData, { merge: true });

    // ⚡ Invalidate ISR caches for the public page & catalog routes
    const slug = updateData.slug || productId;
    revalidatePath(`/p/${slug}`);
    revalidatePath(`/p/${productId}`);
    revalidatePath(`/product/${slug}`);
    revalidatePath(`/product/${productId}`);
    revalidatePath('/collection/peptides');

    return { success: true };
  } catch (error) {
    console.error('Error updating product action:', error);
    return { success: false, error: error.message };
  }
}
