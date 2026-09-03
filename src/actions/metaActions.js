"use server";

import { adminDb } from '../lib/firebaseAdmin';

/**
 * metaActions.js
 *
 * Server actions for reading and refreshing `_meta/*` documents.
 * The `_meta` collection contains pre-aggregated facets and KPIs
 * computed server-side — reads are O(1) instead of N count() queries.
 *
 * Documents:
 *   _meta/dashboard_summary  — global KPIs for AdminOverviewTab
 *   _meta/catalog_facets     — product filters (categories, goals, suppliers)
 *   _meta/goals_coverage     — therapeutic goal coverage stats
 *   _meta/supplier_coverage  — supplier stats
 */

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cachedSummary = null;
let lastSummaryFetch = 0;
const SUMMARY_TTL_MS = 60 * 1000; // 60s — matches the TTL written in the doc

/**
 * getDashboardMetaAction
 *
 * Reads _meta/dashboard_summary — 1 document read = ~15ms vs 12 parallel queries.
 * Falls back to live counts if the meta doc doesn't exist yet.
 */
export async function getDashboardMetaAction(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedSummary && (now - lastSummaryFetch < SUMMARY_TTL_MS)) {
    return cachedSummary;
  }
  if (!adminDb) return null;

  try {
    const metaDoc = await adminDb.collection('_meta').doc('dashboard_summary').get();
    if (!metaDoc.exists) return null;

    const data = metaDoc.data();
    cachedSummary = data;
    lastSummaryFetch = now;
    return data;
  } catch (error) {
    console.error('[getDashboardMetaAction]', error);
    return cachedSummary || null;
  }
}

/**
 * syncDashboardMetaAction
 *
 * Recomputes and writes _meta/dashboard_summary.
 * Call this after bulk operations or from write guards.
 * Safe to call from Server Actions — uses Admin SDK.
 */
export async function syncDashboardMetaAction() {
  if (!adminDb) return { success: false, error: 'adminDb not available' };

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const countWhere = async (col, field, op, value) => {
      try {
        const snap = await adminDb.collection(col).where(field, op, value).count().get();
        return snap.data().count || 0;
      } catch { return 0; }
    };
    const countAll = async (col) => {
      try {
        const snap = await adminDb.collection(col).count().get();
        return snap.data().count || 0;
      } catch { return 0; }
    };

    const [
      totalPatients, totalPrescriptions, totalOrders, totalLeads, totalClinics, totalProducts,
      patientsActive, patientsUnverified,
      patientsNew30d,
      rxPending, rxApproved, rxProcessing, rxCompleted, rxCancelled,
      ordersAwaitingPayment, ordersProcessing, ordersDelivered, ordersDisputed,
      leadsNew30d, leadsConverted,
    ] = await Promise.all([
      countAll('patients'), countAll('prescriptions'), countAll('orders'),
      countAll('leads'), countAll('clinics'), countAll('products'),
      countWhere('patients', 'status', '==', 'active'),
      countWhere('patients', 'status', '==', 'unverified'),
      adminDb.collection('patients').where('createdAt', '>=', thirtyDaysAgo).count().get()
        .then(s => s.data().count || 0).catch(() => 0),
      countWhere('prescriptions', 'status', '==', 'pending'),
      countWhere('prescriptions', 'status', '==', 'approved'),
      countWhere('prescriptions', 'status', '==', 'processing'),
      countWhere('prescriptions', 'status', '==', 'completed'),
      countWhere('prescriptions', 'status', '==', 'cancelled'),
      countWhere('orders', 'status', '==', 'awaiting payment'),
      countWhere('orders', 'status', '==', 'processing'),
      countWhere('orders', 'status', '==', 'delivered'),
      countWhere('orders', 'status', '==', 'disputed'),
      adminDb.collection('leads').where('createdAt', '>=', thirtyDaysAgo).count().get()
        .then(s => s.data().count || 0).catch(() => 0),
      countWhere('leads', 'status', '==', 'won'),
    ]);

    const summary = {
      kpis:          { patients: totalPatients, prescriptions: totalPrescriptions, orders: totalOrders, leads: totalLeads, clinics: totalClinics, products: totalProducts },
      alerts:        { pendingPrescriptions: rxPending, awaitingPaymentOrders: ordersAwaitingPayment, unverifiedPatients: patientsUnverified, newLeads30d: leadsNew30d, disputedOrders: ordersDisputed },
      patients:      { total: totalPatients, active: patientsActive, unverified: patientsUnverified, newLast30d: patientsNew30d },
      prescriptions: { total: totalPrescriptions, pending: rxPending, approved: rxApproved, processing: rxProcessing, completed: rxCompleted, cancelled: rxCancelled },
      orders:        { total: totalOrders, awaitingPayment: ordersAwaitingPayment, processing: ordersProcessing, delivered: ordersDelivered, disputed: ordersDisputed },
      leads:         { total: totalLeads, newLast30d: leadsNew30d, converted: leadsConverted },
      updatedAt:     new Date().toISOString(),
      ttlSeconds:    60,
    };

    await adminDb.collection('_meta').doc('dashboard_summary').set(summary);

    // Bust the in-memory cache so the next read sees fresh data
    cachedSummary = summary;
    lastSummaryFetch = Date.now();

    return { success: true, summary };
  } catch (error) {
    console.error('[syncDashboardMetaAction]', error);
    return { success: false, error: error.message };
  }
}

/** Invalidate in-memory cache (e.g. after a write guard fires). */
export async function invalidateDashboardMetaCache() {
  cachedSummary = null;
  lastSummaryFetch = 0;
  return { success: true };
}
