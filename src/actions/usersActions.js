"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchUsersAction({ limitCount = 50, role = null, search = '' } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    let query = adminDb.collection('users');
    if (role && role !== 'all') {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.limit(limitCount).get();
    
    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(u => 
        (u.name || u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.company || '').toLowerCase().includes(q) ||
        (u.phone || u.phoneNumber || '').includes(q)
      );
    }

    // Ensure completely plain JSON objects with no Firestore Timestamp classes or prototype methods
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error fetching users securely:", error);
    return [];
  }
}

export async function fetchUsersAggregatesAction() {
  try {
    if (!adminDb) return { total: 0, patients: 0, doctors: 0, new: 0 };
    
    const usersSnap = await adminDb.collection('users').get();
    let total = 0;
    let patients = 0;
    let doctors = 0;
    let pending = 0;

    usersSnap.forEach(doc => {
      const data = doc.data();
      total++;
      if (data.role === 'patient') patients++;
      if (data.role === 'doctor') doctors++;
      if (data.approved !== true && data.role !== 'admin') pending++;
    });

    return {
      total,
      patients,
      doctors,
      pending
    };
  } catch (error) {
    console.error("Error fetching user aggregates:", error);
    return { total: 0, patients: 0, doctors: 0, pending: 0 };
  }
}
