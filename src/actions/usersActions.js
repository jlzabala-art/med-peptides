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
    if (!adminDb) return { total: 0, patients: 0, doctors: 0, wholesalers: 0, clinics: 0, pending: 0, activeAtlasUsers: 0, verifiedSecurity: 0 };
    
    const [totalSnap, patientsSnap, doctorsSnap, pendingSnap, wsSnap, clSnap, wsCollectionSnap, clCollectionSnap] = await Promise.all([
      adminDb.collection('users').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('users').where('role', '==', 'patient').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('users').where('role', '==', 'doctor').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('users').where('approved', '==', false).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('users').where('role', 'in', ['wholesaler', 'wholeseller']).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('users').where('role', 'in', ['clinic', 'admin_clinic']).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('wholesellers').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('clinics').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    const userWholesalers = wsSnap.data().count;
    const collectionWholesalers = wsCollectionSnap.data().count;
    const wholesalersCount = Math.max(userWholesalers, collectionWholesalers);

    const userClinics = clSnap.data().count;
    const collectionClinics = clCollectionSnap.data().count;
    const clinicsCount = Math.max(userClinics, collectionClinics);

    const total = totalSnap.data().count;
    const pending = pendingSnap.data().count;
    const activeAtlasUsers = Math.max(0, total - pending);
    const verifiedSecurity = Math.max(0, total - pending - 8);

    return {
      total,
      patients: patientsSnap.data().count,
      doctors: doctorsSnap.data().count,
      wholesalers: wholesalersCount,
      clinics: clinicsCount,
      pending,
      activeAtlasUsers,
      verifiedSecurity,
    };
  } catch (error) {
    console.error("Error fetching user aggregates:", error);
    return { total: 0, patients: 0, doctors: 0, wholesalers: 0, clinics: 0, pending: 0, activeAtlasUsers: 0, verifiedSecurity: 0 };
  }
}
