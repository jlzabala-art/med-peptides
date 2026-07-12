"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchUsersAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('users').limit(limitCount).get();
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      // Serialize dates
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    return users;
  } catch (error) {
    console.error("Error fetching users securely:", error);
    return [];
  }
}
