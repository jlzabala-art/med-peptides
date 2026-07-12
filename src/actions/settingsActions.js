"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchSettingsAction() {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to null");
      return null;
    }

    const docSnap = await adminDb.collection('settings').doc('global').get();

    if (docSnap.exists) {
      return docSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching settings securely:", error);
    return null;
  }
}
