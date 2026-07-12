"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchViewsConfigAction() {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('viewConfigs').get();
    
    const configs = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });

    return configs;
  } catch (error) {
    console.error("Error fetching view configs securely:", error);
    return [];
  }
}
