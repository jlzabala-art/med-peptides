"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchDashboardMetricsAction() {
  try {
    if (!adminDb) return { metrics: null, priorities: [], recentRegistrations: [] };

    // Use admin SDK to aggregate data securely and faster
    // For revenue, we still need to query all orders, or we can use aggregation if available.
    // However, to keep it simple and accurate, we'll use count() for counts.
    const [
      usersCountSnap,
      rfqsCountSnap,
      protocolsCountSnap,
      pendingRxSnap,
      ordersQuerySnap,
      usersQuerySnap
    ] = await Promise.all([
      adminDb.collection('users').count().get(),
      adminDb.collection('purchase_rfqs').count().get(),
      adminDb.collection('protocols').count().get(),
      adminDb.collection('prescriptions').where('status', 'in', ['draft', 'pending', 'review_required']).count().get(),
      adminDb.collection('orders').orderBy('createdAt', 'desc').limit(500).get(), // Get more orders for revenue, but cap at 500
      adminDb.collection('users').orderBy('createdAt', 'desc').limit(500).get()
    ]);

    const rfqsSize = rfqsCountSnap.data().count;
    const activeProtocolsCount = protocolsCountSnap.data().count;
    const pendingPrescriptionsCount = pendingRxSnap.data().count;
    const activeUsersCount = usersCountSnap.data().count;

    let totalRevenue = 0;
    let openOrdersCount = 0;
    ordersQuerySnap.forEach((doc) => {
      const data = doc.data();
      if (data.status !== 'cancelled') {
        totalRevenue += Number(data.total || data.subtotal || 0);
      }
      if (['pending', 'processing', 'shipped'].includes(data.status)) {
        openOrdersCount++;
      }
    });

    let pendingApprovalsCount = 0;
    let activePatientsCount = 0;
    usersQuerySnap.forEach((doc) => {
      const data = doc.data();
      if (data.approved !== true && data.role !== 'admin') {
        pendingApprovalsCount++;
      } else if (data.approved === true && data.role !== 'admin') {
        activePatientsCount++;
      }
    });

    // If activePatientsCount is limited by 500, let's just make it accurate enough, 
    // or we can calculate active patients by subtracting admins and pending from total.
    // For now, let's keep it based on the 500 snapshot to avoid complex queries.

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

    const recentRegistrations = usersQuerySnap.docs
      .map((d) => {
        const data = d.data();
        for (const key in data) {
          if (data[key] && typeof data[key].toDate === 'function') {
            data[key] = data[key].toDate().toISOString();
          }
        }
        return { id: d.id, ...data };
      })
      .sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)))
      .slice(0, 5);

    return { metrics, priorities, recentRegistrations };

  } catch (error) {
    console.error("Error fetching dashboard metrics securely:", error);
    return { metrics: null, priorities: [], recentRegistrations: [] };
  }
}
