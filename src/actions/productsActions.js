"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchProductsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('products').limit(limitCount).get();
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
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
    const col = adminDb.collection('products');
    
    const [totalSnap, activeSnap, draftSnap, outOfStockSnap] = await Promise.all([
      col.count().get(),
      col.where('status', '==', 'active').count().get(),
      col.where('status', '==', 'draft').count().get(),
      col.where('stock', '<=', 0).count().get()
    ]);
    
    // For low stock we'll have to use an approximation or just use standard metrics, 
    // because Firestore where('stock', '>', 0) and where('stock', '<=', minStock) is hard if minStock is dynamic per doc.
    // We'll skip precise dynamic lowStock for now, or just use 0 as a placeholder if we can't do it cleanly.
    return {
      total: totalSnap.data().count,
      active: activeSnap.data().count,
      drafts: draftSnap.data().count,
      outOfStock: outOfStockSnap.data().count,
      lowStock: 0 // Cannot easily aggregate a dynamic field comparison in firestore
    };
  } catch (error) {
    console.error("Error fetching product metrics securely:", error);
    return null;
  }
}
