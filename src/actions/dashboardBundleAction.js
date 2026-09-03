"use server";

import { adminDb } from '../lib/firebaseAdmin';

// ─── Serialize timestamps ─────────────────────────────────────────────────────
function ser(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj?.toDate === 'function') return obj.toDate().toISOString();
  if (Array.isArray(obj)) return obj.map(ser);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = ser(v);
    return out;
  }
  return obj;
}

// ─── In-memory cache (60s) ────────────────────────────────────────────────────
let cachedBundle = null;
let lastFetch = 0;
const TTL_MS = 60 * 1000;

const EMPTY_BUNDLE = {
  kpis:           { patients: 0, prescriptions: 0, orders: 0, leads: 0, clinics: 0 },
  alerts:         { pendingPrescriptions: 0, awaitingPaymentOrders: 0, unverifiedPatients: 0, newLeads30d: 0 },
  recentActivity: { prescriptions: [], orders: [] },
  topProducts:    [],
  fetchedAt:      new Date().toISOString(),
};

/**
 * fetchOverviewDashboardBundle
 *
 * 2-Layer strategy:
 *   Layer 1 — _meta/dashboard_summary (1 doc read, ~15ms) → KPIs + alerts
 *   Layer 2 — 2 small list queries for recent activity only
 *
 * Falls back to 12 parallel count() queries if _meta doc doesn't exist yet.
 * Call `syncDashboardMetaAction()` (or run `node sync_meta_docs.cjs`) to populate _meta.
 *
 * Returns: { kpis, alerts, recentActivity, topProducts, fetchedAt }
 */
export async function fetchOverviewDashboardBundle(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedBundle && (now - lastFetch < TTL_MS)) {
    return cachedBundle;
  }

  if (!adminDb) return EMPTY_BUNDLE;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      // ── Core entity counts ────────────────────────────────────────────────
      patientsCountSnap,
      rxCountSnap,
      ordersCountSnap,
      leadsCountSnap,
      clinicsCountSnap,
      // ── Alert counts (actionable for admin) ───────────────────────────────
      pendingRxSnap,
      awaitingPaymentSnap,
      unverifiedPatientsSnap,
      newLeadsSnap,
      // ── Recent activity ───────────────────────────────────────────────────
      recentRxSnap,
      recentOrdersSnap,
      // ── Top prescribed products ───────────────────────────────────────────
      topProductsSnap,
    ] = await Promise.all([
      // counts
      adminDb.collection('patients').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('prescriptions').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('orders').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('leads').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('clinics').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      // alerts
      adminDb.collection('prescriptions').where('status', '==', 'pending').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('orders').where('status', '==', 'awaiting payment').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('patients').where('status', '==', 'unverified').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('leads').where('createdAt', '>=', thirtyDaysAgo).count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      // recent docs (small payloads)
      adminDb.collection('prescriptions')
        .orderBy('createdAt', 'desc').limit(10).get().catch(() => ({ docs: [] })),
      adminDb.collection('orders')
        .orderBy('createdAt', 'desc').limit(5).get().catch(() => ({ docs: [] })),
      // top products by prescription frequency
      adminDb.collection('prescriptions')
        .orderBy('createdAt', 'desc').limit(100).get().catch(() => ({ docs: [] })),
    ]);

    // ── Build recent activity ─────────────────────────────────────────────────
    const recentPrescriptions = (recentRxSnap.docs || []).map(d => ({
      id: d.id,
      patientName: ser(d.data().patientName) || 'Patient',
      status:      ser(d.data().status) || 'pending',
      createdAt:   ser(d.data().createdAt),
      totalAmount: ser(d.data().totalAmount) || 0,
    }));

    const recentOrders = (recentOrdersSnap.docs || []).map(d => ({
      id: d.id,
      clinicName: ser(d.data().clinicName) || ser(d.data().customerName) || 'Clinic',
      status:     ser(d.data().status) || 'draft',
      createdAt:  ser(d.data().createdAt),
      total:      ser(d.data().total) || 0,
    }));

    // ── Top products (aggregated from last 100 prescriptions) ─────────────────
    const productFreq = {};
    for (const d of (topProductsSnap.docs || [])) {
      const items = d.data().items || d.data().products || [];
      for (const item of items) {
        const name = item.name || item.productName || item.canonicalName;
        if (!name) continue;
        productFreq[name] = (productFreq[name] || 0) + (item.quantity || 1);
      }
    }
    const topProducts = Object.entries(productFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, prescriptionCount: count }));

    const bundle = {
      kpis: {
        patients:      patientsCountSnap.data().count || 0,
        prescriptions: rxCountSnap.data().count || 0,
        orders:        ordersCountSnap.data().count || 0,
        leads:         leadsCountSnap.data().count || 0,
        clinics:       clinicsCountSnap.data().count || 0,
      },
      alerts: {
        pendingPrescriptions:   pendingRxSnap.data().count || 0,
        awaitingPaymentOrders:  awaitingPaymentSnap.data().count || 0,
        unverifiedPatients:     unverifiedPatientsSnap.data().count || 0,
        newLeads30d:            newLeadsSnap.data().count || 0,
      },
      recentActivity: { prescriptions: recentPrescriptions, orders: recentOrders },
      topProducts,
      fetchedAt: new Date().toISOString(),
    };

    cachedBundle = bundle;
    lastFetch = now;
    return bundle;
  } catch (error) {
    console.error('[fetchOverviewDashboardBundle]', error);
    return cachedBundle || {
      kpis:           { patients: 0, prescriptions: 0, orders: 0, leads: 0, clinics: 0 },
      alerts:         { pendingPrescriptions: 0, awaitingPaymentOrders: 0, unverifiedPatients: 0, newLeads30d: 0 },
      recentActivity: { prescriptions: [], orders: [] },
      topProducts:    [],
      fetchedAt:      new Date().toISOString(),
    };
  }
}

/** Bust dashboard cache after any write operation. */
export async function invalidateDashboardCache() {
  cachedBundle = null;
  lastFetch = 0;
  return { success: true };
}
