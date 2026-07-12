"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchPricesDataAction() {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty data");
      return { products: [], discounts: {} };
    }

    // Fetch all products (or a high limit) for pricing matrix
    const snapshot = await adminDb.collection('products').limit(500).get();
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    // Fetch global discounts
    const globalRef = await adminDb.collection('settings').doc('global').get();
    let discounts = {};
    if (globalRef.exists) {
      discounts = globalRef.data().categoryDiscounts || {};
    }

    // Sync defaults for existing categories
    const uniqueCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
    uniqueCategories.forEach((cat) => {
      if (discounts[cat] === undefined) {
        discounts[cat] = 15;
      }
    });

    return { products, discounts };
  } catch (error) {
    console.error("Error fetching prices data securely:", error);
    return { products: [], discounts: {} };
  }
}
