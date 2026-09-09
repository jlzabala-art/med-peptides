"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { serializeFirestoreData } from '../lib/serializeFirestore';
import logger from '../utils/logger';

// Alias for backward compat within this file
const serializeData = serializeFirestoreData;

/**
 * Server-Side Clinic Workspace Data Bundler
 * Fetches all clinic sub-resources in parallel with a single server round-trip.
 */
export async function fetchClinicWorkspaceBundle(clinicId) {
  try {
    if (!adminDb) {
      logger.warn('fetchClinicWorkspaceBundle: adminDb not initialized');
      return null;
    }

    if (!clinicId) {
      throw new Error("clinicId is required");
    }

    // 1. Fetch clinic document first
    const clinicDoc = await adminDb.collection('clinics').doc(clinicId).get();
    if (!clinicDoc.exists) {
      return null;
    }
    const clinicData = { id: clinicDoc.id, ...serializeData(clinicDoc.data()) };

    // 2. Query related sub-resources in parallel
    const managerId = clinicData.managerId || clinicData.accountManagerId;

    const [
      doctorsSnap,
      prescriptionsSnap,
      ordersSnap,
      timelineSnap,
      managerDoc,
      patientsCountSnap,
      prescriptionsCountSnap
    ] = await Promise.all([
      // Doctors assigned to this clinic
      adminDb.collection('users')
        .where('clinicId', '==', clinicId)
        .limit(20)
        .get()
        .catch(() => ({ docs: [] })),

      // Recent prescriptions
      adminDb.collection('prescriptions')
        .where('clinicId', '==', clinicId)
        .limit(10)
        .get()
        .catch(() => ({ docs: [] })),

      // Recent orders
      adminDb.collection('orders')
        .where('clinicId', '==', clinicId)
        .limit(10)
        .get()
        .catch(() => ({ docs: [] })),

      // Recent timeline / audit activity
      adminDb.collection('timeline')
        .where('entityId', '==', clinicId)
        .limit(15)
        .get()
        .catch(() => ({ docs: [] })),

      // Assigned Account Manager
      managerId
        ? adminDb.collection('users').doc(managerId).get().catch(() => null)
        : Promise.resolve(null),

      // Total patient count
      adminDb.collection('patients')
        .where('clinicId', '==', clinicId)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),

      // Total prescription count
      adminDb.collection('prescriptions')
        .where('clinicId', '==', clinicId)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    const physicians = (doctorsSnap.docs || []).map(doc => ({
      id: doc.id,
      ...serializeData(doc.data())
    }));

    const recentPrescriptions = (prescriptionsSnap.docs || []).map(doc => ({
      id: doc.id,
      ...serializeData(doc.data())
    }));

    const recentOrders = (ordersSnap.docs || []).map(doc => ({
      id: doc.id,
      ...serializeData(doc.data())
    }));

    const timelineEvents = (timelineSnap.docs || []).map(doc => ({
      id: doc.id,
      ...serializeData(doc.data())
    }));

    const accountManager = (managerDoc && managerDoc.exists)
      ? { id: managerDoc.id, ...serializeData(managerDoc.data()) }
      : (clinicData.manager ? { id: 'mgr_assigned', name: clinicData.manager } : null);

    const activePatientsCount = patientsCountSnap.data().count || clinicData.patients || 0;
    const totalPrescriptionsCount = prescriptionsCountSnap.data().count || recentPrescriptions.length;

    const bundle = {
      clinic: clinicData,
      physicians,
      recentPrescriptions,
      recentOrders,
      timelineEvents,
      accountManager,
      stats: {
        monthlyVolume: clinicData.monthlyVolume || clinicData.monthly_volume || 0,
        activePatients: activePatientsCount,
        totalPrescriptions: totalPrescriptionsCount,
        totalOrders: recentOrders.length,
      }
    };

    return JSON.parse(JSON.stringify(bundle));
  } catch (error) {
    console.error("Error bundling clinic workspace data:", error);
    return null;
  }
}

// ─── In-memory KPI cache ──────────────────────────────────────────────────────
let cachedClinicKPIs = null;
let lastClinicKPIFetch = 0;
const CLINIC_KPI_TTL_MS = 60 * 1000;

/**
 * Server-side KPI aggregations for the Clinics directory.
 * Parallel count() queries — O(1) Firestore reads.
 */
export async function fetchClinicsKPIsAction(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedClinicKPIs && (now - lastClinicKPIFetch < CLINIC_KPI_TTL_MS)) {
    return cachedClinicKPIs;
  }
  if (!adminDb) return { total: 0, active: 0, newLast30d: 0, withoutPhysician: 0 };

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalSnap, activeSnap, newSnap] = await Promise.all([
      adminDb.collection('clinics').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('clinics').where('status', '==', 'active').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('clinics').where('createdAt', '>=', thirtyDaysAgo).count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    const kpis = {
      total:            totalSnap.data().count || 0,
      active:           activeSnap.data().count || 0,
      newLast30d:       newSnap.data().count || 0,
      withoutPhysician: 0, // computed client-side from list (no index available)
    };

    cachedClinicKPIs = kpis;
    lastClinicKPIFetch = now;
    return kpis;
  } catch (error) {
    console.error('[fetchClinicsKPIsAction]', error);
    return cachedClinicKPIs || { total: 0, active: 0, newLast30d: 0, withoutPhysician: 0 };
  }
}

/**
 * Paginated clinics list — Admin SDK with limit(50).
 * Replaces the unbounded useFirestoreCollection('clinics') call.
 */
export async function fetchClinicsListAction({ limitCount = 50 } = {}) {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('clinics')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...serializeData(data) };
    }).filter(Boolean);
  } catch (error) {
    console.error('[fetchClinicsListAction]', error);
    return [];
  }
}

/** Invalidate clinic KPI cache after edits. */
export async function invalidateClinicKPICache() {
  cachedClinicKPIs = null;
  lastClinicKPIFetch = 0;
  return { success: true };
}
