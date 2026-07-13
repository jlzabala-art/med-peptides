"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { AggregateField } from 'firebase-admin/firestore';
import { unstable_cache } from 'next/cache';

async function fetchMetricsFromFirebase() {
  if (!adminDb) return { metrics: null, priorities: [], recentRegistrations: [] };

  const [
    usersCountSnap,
    rfqsCountSnap,
    protocolsCountSnap,
    pendingRxSnap,
    ordersRevenueSnap,
    pendingApprovalsSnap,
    recentUsersSnap,
    openOrdersSnap
  ] = await Promise.all([
    adminDb.collection('users').count().get(),
    adminDb.collection('purchase_rfqs').count().get(),
    adminDb.collection('protocols').count().get(),
    adminDb.collection('prescriptions').where('status', 'in', ['draft', 'pending', 'review_required']).count().get(),
    adminDb.collection('orders').where('status', '!=', 'cancelled').aggregate({ totalRevenue: AggregateField.sum('total') }).get(),
    adminDb.collection('users').where('approved', '==', false).where('role', '!=', 'admin').count().get(),
    adminDb.collection('users').orderBy('createdAt', 'desc').limit(5).get(),
    adminDb.collection('orders').where('status', 'in', ['pending', 'processing', 'shipped']).count().get()
  ]);

  const rfqsSize = rfqsCountSnap.data().count;
  const activeProtocolsCount = protocolsCountSnap.data().count;
  const pendingPrescriptionsCount = pendingRxSnap.data().count;
  const activeUsersCount = usersCountSnap.data().count;
  
  let totalRevenue = ordersRevenueSnap.data().totalRevenue || 0;
  let pendingApprovalsCount = pendingApprovalsSnap.data().count || 0;
  
  const activePatientsCount = activeUsersCount - pendingApprovalsCount;
  const openOrdersCount = openOrdersSnap.data().count || 0;

  const metrics = {
    revenue: totalRevenue,
    openOrders: openOrdersCount,
    pendingApprovals: pendingApprovalsCount,
    openRFQs: rfqsSize,
    grossProfit: 0,
    cashPosition: 0,
    aiAlerts: 0,
    activeUsersCount: activeUsersCount,
    activePatients: activePatientsCount,
    activeProtocols: activeProtocolsCount,
    pendingPrescriptions: pendingPrescriptionsCount,
    dueFollowUps: 0
  };

  const priorities = [];
  let pId = 1;
  if (pendingApprovalsCount > 0) {
    priorities.push({
      id: pId++,
      text: `${pendingApprovalsCount} users pending approval`,
      type: 'approval',
      priority: 'high',
      link: '/admin/users',
      detail: `${pendingApprovalsCount} user profiles are registered but not approved.`,
    });
  }
  if (rfqsSize > 0) {
    priorities.push({
      id: pId++,
      text: `${rfqsSize} RFQs require attention`,
      type: 'rfq',
      priority: 'critical',
      link: '/admin/rfq',
      detail: `${rfqsSize} purchasing requests for quotation are open.`,
    });
  }
  if (openOrdersCount > 0) {
    priorities.push({
      id: pId++,
      text: `${openOrdersCount} pending orders require processing`,
      type: 'order',
      priority: 'high',
      link: '/admin/orders',
      detail: `${openOrdersCount} customer orders are currently pending.`,
    });
  }
  if (pendingPrescriptionsCount > 0) {
    priorities.push({
      id: pId++,
      text: `${pendingPrescriptionsCount} prescriptions awaiting review`,
      type: 'prescription',
      priority: 'critical',
      link: '/admin/prescriptions',
      detail: `${pendingPrescriptionsCount} clinical prescriptions are pending your review and approval.`,
    });
  }

  const recentRegistrations = recentUsersSnap.docs
    .map((d) => {
      const data = d.data();
      for (const key in data) {
        if (data[key] && typeof data[key].toDate === 'function') {
          data[key] = data[key].toDate().toISOString();
        }
      }
      return { id: d.id, ...data };
    });

  return { metrics, priorities, recentRegistrations };
}

// Phase 3: Intelligent caching (revalidates every 60 seconds automatically, or on-demand via revalidateTag('admin-dashboard'))
const getCachedDashboardMetrics = unstable_cache(
  async () => {
    return await fetchMetricsFromFirebase();
  },
  ['admin-dashboard-metrics'],
  { revalidate: 60, tags: ['admin-dashboard'] }
);

export async function fetchDashboardMetricsAction() {
  try {
    return await getCachedDashboardMetrics();
  } catch (error) {
    console.error("Error fetching dashboard metrics securely:", error);
    return { metrics: null, priorities: [], recentRegistrations: [] };
  }
}
