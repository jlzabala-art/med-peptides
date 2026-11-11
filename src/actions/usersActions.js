"use server";

import { adminDb, adminAuth } from '../lib/firebaseAdmin';
import { normalizeRole } from '../constants/roles';
import { algoliasearch } from 'algoliasearch';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

async function syncUserRecordToAlgolia(userId, userData) {
  if (!ALGOLIA_ADMIN_KEY || !userId || !userData) return;
  try {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    const role = userData.role || (Array.isArray(userData.roles) && userData.roles[0]) || 'patient';
    const isApproved = userData.approved === true || (userData.approved !== false && (userData.status === 'active' || userData.professionalStatus === 'approved'));
    const resolvedChannel = userData.pricingChannel || userData.priceTier || userData.pricingTier || (role === 'wholesaler' || role === 'wholeseller' ? 'wholesale' : role === 'doctor' || role === 'clinic' ? 'clinic' : 'retail');
    const createdAtTs = userData.createdAt ? new Date(userData.createdAt).getTime() || Date.now() : Date.now();

    const formattedRecord = {
      objectID: String(userId),
      id: String(userId),
      name: (userData.name || userData.fullName || userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`).trim() || 'User',
      displayName: userData.displayName || userData.fullName || userData.name || '',
      email: userData.email || '',
      phone: userData.phone || userData.mobile || userData.phoneNumber || '',
      role: role,
      roles: Array.isArray(userData.roles) && userData.roles.length > 0 ? userData.roles : [role],
      status: (userData.status || (isApproved ? 'active' : 'pending')).toLowerCase(),
      approved: isApproved,
      companyName: userData.companyName || userData.institution || '',
      institution: userData.institution || userData.companyName || '',
      country: userData.country || userData.shippingCountry || '',
      city: userData.city || userData.shippingCity || '',
      pricingChannel: resolvedChannel,
      priceTier: resolvedChannel,
      pricingTier: resolvedChannel,
      zohoContactId: userData.zohoContactId || '',
      zohoBiginContactId: userData.zohoBiginContactId || '',
      clinicId: userData.clinicId || '',
      clinicIds: userData.clinicIds || (userData.clinicId ? [userData.clinicId] : []),
      createdAt_ts: createdAtTs
    };

    await client.saveObjects({
      indexName: 'atlas_users',
      objects: [formattedRecord]
    });
  } catch (err) {
    console.warn('[syncUserRecordToAlgolia] Non-blocking warning:', err.message);
  }
}

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

/**
 * Server Action: update a user's role authoritatively.
 * Sets Firebase Auth Custom Claims, updates Firestore 'users' doc with merge,
 * and writes to audit_logs — completely bypassing client-side Firestore security rule limitations.
 */
export async function updateUserRoleAction({ userId, role }) {
  try {
    if (!userId || typeof userId !== 'string') throw new Error('userId is required');
    if (!role) throw new Error('role is required');
    if (!adminDb) throw new Error('Firebase Admin DB is not initialized');

    const canonicalRole = normalizeRole(role);

    // 1. Synchronize Firebase Auth Custom Claims
    if (adminAuth) {
      try {
        await adminAuth.setCustomUserClaims(userId, {
          role: canonicalRole,
          approved: true,
          admin: canonicalRole === 'admin'
        });
      } catch (authErr) {
        console.warn(`[updateUserRoleAction] Auth claims notice for ${userId}:`, authErr.message);
      }
    }

    // 2. Authoritative update on Firestore user document
    const userDocRef = adminDb.collection('users').doc(userId);
    const existingSnap = await userDocRef.get();
    const existingData = existingSnap.exists ? existingSnap.data() : {};

    const defaultChannelForRole =
      canonicalRole === 'wholesaler' || canonicalRole === 'wholeseller' ? 'wholesale' :
      canonicalRole === 'doctor' || canonicalRole === 'clinic' ? 'clinic' :
      canonicalRole === 'patient' ? 'retail' :
      (existingData.pricingChannel || existingData.priceTier || 'retail');

    const updates = {
      role: canonicalRole,
      roles: [canonicalRole],
      approved: true,
      status: 'active',
      professionalStatus: 'approved',
      pricingChannel: defaultChannelForRole,
      priceTier: defaultChannelForRole,
      pricingTier: defaultChannelForRole,
      updatedAt: new Date().toISOString()
    };

    await userDocRef.set(updates, { merge: true });

    const mergedData = { ...existingData, ...updates, id: userId };

    // 2b. Sync linked customers / wholesellers documents by email
    if (mergedData.email) {
      try {
        const custSnap = await adminDb.collection('customers').where('email', '==', mergedData.email).limit(5).get();
        for (const cDoc of custSnap.docs) {
          await cDoc.ref.set({
            customerType: canonicalRole,
            pricingTier: defaultChannelForRole,
            updatedAt: updates.updatedAt
          }, { merge: true });
        }
      } catch (_) {}
    }

    // 2c. Immediately synchronize Algolia search index
    await syncUserRecordToAlgolia(userId, mergedData);

    // 3. Write audit log
    try {
      await adminDb.collection('audit_logs').add({
        action: 'ADMIN_USER_ROLE_UPDATED',
        targetId: userId,
        previousRole: existingData.role || 'unknown',
        newRole: canonicalRole,
        timestamp: new Date().toISOString(),
        operatorId: 'admin_console'
      });
    } catch (_) {}

    return {
      success: true,
      userId,
      role: canonicalRole,
      pricingChannel: defaultChannelForRole,
      updates
    };
  } catch (error) {
    console.error('[updateUserRoleAction] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: update a user's pricing channel / tier authoritatively.
 */
export async function updateUserPricingChannelAction({ userId, pricingChannel }) {
  try {
    if (!userId || typeof userId !== 'string') throw new Error('userId is required');
    if (!pricingChannel) throw new Error('pricingChannel is required');
    if (!adminDb) throw new Error('Firebase Admin DB is not initialized');

    const userDocRef = adminDb.collection('users').doc(userId);
    const existingSnap = await userDocRef.get();
    const existingData = existingSnap.exists ? existingSnap.data() : {};

    const updates = {
      pricingChannel,
      priceTier: pricingChannel,
      pricingTier: pricingChannel,
      updatedAt: new Date().toISOString()
    };

    await userDocRef.set(updates, { merge: true });

    const mergedData = { ...existingData, ...updates, id: userId };
    await syncUserRecordToAlgolia(userId, mergedData);

    return { success: true, userId, pricingChannel, updates };
  } catch (error) {
    console.error('[updateUserPricingChannelAction] Error:', error);
    return { success: false, error: error.message };
  }
}
