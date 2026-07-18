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

export async function fetchUsersAggregatesAction() {
  try {
    if (!adminDb) return { total: 0, patients: 0, doctors: 0, new: 0 };
    
    const [totalSnap, patientsSnap, doctorsSnap, newSnap] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('users').where('role', '==', 'patient').count().get(),
      adminDb.collection('users').where('role', '==', 'doctor').count().get(),
      adminDb.collection('users').where('status', '==', 'pending').count().get(),
    ]);

    return {
      total: totalSnap.data().count,
      patients: patientsSnap.data().count,
      doctors: doctorsSnap.data().count,
      pending: newSnap.data().count
    };
  } catch (error) {
    console.error("Error fetching user aggregates:", error);
    return { total: 0, patients: 0, doctors: 0, pending: 0 };
  }
}
