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
