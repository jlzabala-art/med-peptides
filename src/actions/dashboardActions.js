"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { AggregateField } from 'firebase-admin/firestore';
import { unstable_cache, revalidateTag } from 'next/cache';

function getCutoffDate(dateRange) {
  if (!dateRange || dateRange === 'all') return null;
  const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
  return new Date(Date.now() - days * 86400000);
}

async function safeCount(queryRef, fallback = 0) {
  try {
    const snap = await queryRef.count().get();
    return snap.data().count || 0;
  } catch (err) {
    console.warn('[dashboardActions] safeCount fallback:', err.message);
    return fallback;
  }
}

async function safeSum(queryRef, field, fallback = 0) {
  try {
    const snap = await queryRef.aggregate({ total: AggregateField.sum(field) }).get();
    return Number(snap.data().total || 0);
  } catch (err) {
    console.warn(`[dashboardActions] safeSum(${field}) fallback:`, err.message);
    return fallback;
  }
}

async function fetchMetricsFromFirebase(dateRange = '30d') {
  const startedAt = Date.now();
  if (!adminDb) {
    return {
      metrics: null,
      priorities: [],
      recentRegistrations: [],
      meta: { dateRange, syncedAt: new Date().toISOString(), serverLatencyMs: 0 },
    };
  }

  const cutoffDate = getCutoffDate(dateRange);
  const cutoffIso = cutoffDate ? cutoffDate.toISOString() : null;

  // Time-bounded queries when dateRange !== 'all'
  const ordersBase = cutoffIso
    ? adminDb.collection('orders').where('createdAt', '>=', cutoffIso)
    : adminDb.collection('orders');

  const quotationsBase = cutoffIso
    ? adminDb.collection('quotations').where('createdAt', '>=', cutoffIso)
    : adminDb.collection('quotations');

  const [
    usersCount,
    activePatientsCount,
    pendingApprovalsCount,
    rfqsCount,
    protocolsCount,
    pendingPrescriptionsCount,
    refillsDueCount,
    totalRevenue,
    openOrdersCount,
    pipelineValue,
    openQuotationsCount,
    publishedProductsCount,
    activeSuppliersCount,
    recentUsersSnap,
  ] = await Promise.all([
    safeCount(adminDb.collection('users')),
    safeCount(adminDb.collection('users').where('role', '==', 'patient')),
    safeCount(adminDb.collection('users').where('approved', '==', false).where('role', '!=', 'admin')),
    safeCount(adminDb.collection('purchase_rfqs')),
    safeCount(adminDb.collection('protocols')),
    safeCount(adminDb.collection('prescriptions').where('status', 'in', ['draft', 'pending', 'review_required'])),
    safeCount(adminDb.collection('prescriptions').where('refillRequested', '==', true)),
    safeSum(ordersBase.where('status', '!=', 'cancelled'), 'total'),
    safeCount(adminDb.collection('orders').where('status', 'in', ['pending', 'processing', 'shipped'])),
    safeSum(quotationsBase.where('status', 'in', ['draft', 'sent', 'pending', 'open']), 'grandTotal'),
    safeCount(adminDb.collection('quotations').where('status', 'in', ['draft', 'sent', 'pending', 'open'])),
    safeCount(adminDb.collection('products').where('status', '==', 'published')),
    safeCount(adminDb.collection('suppliers')),
    adminDb.collection('users').orderBy('createdAt', 'desc').limit(6).get().catch(() => ({ docs: [] })),
  ]);

  // Fallback for orders revenue if createdAt is a Timestamp or missing on some docs
  let resolvedRevenue = totalRevenue;
  if (resolvedRevenue === 0 && cutoffIso) {
    resolvedRevenue = await safeSum(
      adminDb.collection('orders').where('status', '!=', 'cancelled'),
      'total'
    );
  }

  let resolvedPipeline = pipelineValue;
  if (resolvedPipeline === 0 && cutoffIso) {
    resolvedPipeline = await safeSum(
      adminDb.collection('quotations').where('status', 'in', ['draft', 'sent', 'pending', 'open']),
      'grandTotal'
    );
  }

  // Real gross margin estimate from recent non-cancelled orders (only using real stored cost/subtotal fields)
  let grossProfit = 0;
  try {
    const recentOrdersSnap = await adminDb
      .collection('orders')
      .where('status', '!=', 'cancelled')
      .limit(100)
      .get();
    let sampleRevenue = 0;
    let sampleCost = 0;
    let hasCostData = false;
    recentOrdersSnap.forEach((docSnap) => {
      const d = docSnap.data();
      const rev = Number(d.total || d.subtotal || 0);
      sampleRevenue += rev;
      if (d.costTotal != null || d.totalCost != null) {
        hasCostData = true;
        sampleCost += Number(d.costTotal ?? d.totalCost ?? 0);
      }
    });
    if (hasCostData && sampleRevenue > 0) {
      const marginRatio = Math.max(0, (sampleRevenue - sampleCost) / sampleRevenue);
      grossProfit = Math.round(resolvedRevenue * marginRatio);
    } else {
      // If costTotal isn't stored on order docs yet, report net subtotal (pre-shipping/tax) or 0 explicitly
      grossProfit = await safeSum(adminDb.collection('orders').where('status', '!=', 'cancelled'), 'subtotal');
    }
  } catch (err) {
    console.warn('[dashboardActions] grossProfit fallback:', err.message);
  }

  const metrics = {
    revenue: Math.round(resolvedRevenue),
    grossProfit: Math.round(grossProfit),
    pipelineValue: Math.round(resolvedPipeline),
    openQuotations: openQuotationsCount,
    openOrders: openOrdersCount,
    pendingApprovals: pendingApprovalsCount,
    openRFQs: rfqsCount,
    activeUsersCount: usersCount,
    activePatients: activePatientsCount,
    activeProtocols: protocolsCount,
    pendingPrescriptions: pendingPrescriptionsCount,
    dueFollowUps: refillsDueCount,
    publishedProducts: publishedProductsCount,
    activeSuppliers: activeSuppliersCount,
  };

  const priorities = [];
  let pId = 1;
  if (pendingPrescriptionsCount > 0) {
    priorities.push({
      id: pId++,
      text: `${pendingPrescriptionsCount} prescriptions awaiting review`,
      type: 'prescription',
      priority: 'critical',
      link: '/admin/prescriptions',
      detail: `${pendingPrescriptionsCount} clinical prescriptions are pending review and approval.`,
    });
  }
  if (rfqsCount > 0) {
    priorities.push({
      id: pId++,
      text: `${rfqsCount} RFQs require attention`,
      type: 'rfq',
      priority: 'critical',
      link: '/admin/rfq',
      detail: `${rfqsCount} purchasing requests for quotation are open.`,
    });
  }
  if (pendingApprovalsCount > 0) {
    priorities.push({
      id: pId++,
      text: `${pendingApprovalsCount} users pending approval`,
      type: 'approval',
      priority: 'high',
      link: '/admin/users',
      detail: `${pendingApprovalsCount} registered accounts are awaiting verification.`,
    });
  }
  if (openOrdersCount > 0) {
    priorities.push({
      id: pId++,
      text: `${openOrdersCount} open orders require processing`,
      type: 'order',
      priority: 'high',
      link: '/admin/orders',
      detail: `${openOrdersCount} orders are currently pending, processing, or in transit.`,
    });
  }
  if (refillsDueCount > 0) {
    priorities.push({
      id: pId,
      text: `${refillsDueCount} prescription refill requests`,
      type: 'refill',
      priority: 'high',
      link: '/admin/prescriptions',
      detail: `${refillsDueCount} patients or clinics requested a prescription refill.`,
    });
  }

  const recentRegistrations = (recentUsersSnap.docs || []).map((d) => {
    const data = d.data();
    const cleaned = { id: d.id };
    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val.toDate === 'function') {
        cleaned[key] = val.toDate().toISOString();
      } else {
        cleaned[key] = val;
      }
    }
    return cleaned;
  });

  const serverLatencyMs = Math.max(1, Date.now() - startedAt);

  return {
    metrics,
    priorities,
    recentRegistrations,
    meta: {
      dateRange,
      syncedAt: new Date().toISOString(),
      serverLatencyMs,
    },
  };
}

const getCachedDashboardMetrics = unstable_cache(
  async (dateRange = '30d') => {
    return await fetchMetricsFromFirebase(dateRange);
  },
  ['admin-dashboard-metrics-v2'],
  { revalidate: 60, tags: ['admin-dashboard'] }
);

export async function fetchDashboardMetricsAction(dateRange = '30d') {
  try {
    return await getCachedDashboardMetrics(dateRange);
  } catch (error) {
    console.error('Error fetching dashboard metrics securely:', error);
    return {
      metrics: null,
      priorities: [],
      recentRegistrations: [],
      meta: { dateRange, syncedAt: new Date().toISOString(), serverLatencyMs: 0 },
    };
  }
}

export async function refreshDashboardMetricsAction(dateRange = '30d') {
  try {
    revalidateTag('admin-dashboard');
    return await fetchMetricsFromFirebase(dateRange);
  } catch (error) {
    console.error('Error refreshing dashboard metrics:', error);
    return await fetchDashboardMetricsAction(dateRange);
  }
}
