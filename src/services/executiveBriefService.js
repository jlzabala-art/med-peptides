import { dbAdmin } from '../lib/firebaseAdmin';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';

/**
 * Calculate Start Date timestamp for timeRange filter
 */
function getStartDateForTimeRange(timeRange = 'today') {
  const now = new Date();
  const start = new Date(now);

  switch (timeRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setDate(now.getDate() - 30);
      break;
    case 'year':
      start.setDate(now.getDate() - 365);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }

  return start;
}

/**
 * Server-calculated Executive Brief Metrics aggregated by role and timeRange
 */
export async function getExecutiveBriefMetrics({ role = 'admin', timeRange = 'today', userId = null }) {
  const startDate = getStartDateForTimeRange(timeRange);
  const startTime = startDate.getTime();

  const metrics = {
    revenue: 0,
    openOrders: 0,
    pendingApprovals: 0,
    openRFQs: 0,
    activePatients: 0,
    pendingPrescriptions: 0,
    activeProtocols: 0,
    dueFollowUps: 0,
    wholesaleSales: 0,
    pendingPOs: 0,
    lowStockAlerts: 0,
    nextScheduledDose: 'Today 20:00',
    unreadMessages: 0,
  };

  try {
    // If dbAdmin (server Admin SDK) is available, use it; else fallback to client SDK queries
    if (dbAdmin) {
      const startIso = startDate.toISOString();
      const startTimestamp = Timestamp.fromDate(startDate);

      // Orders Query (Flow revenue filtered by date, Backlog orders state-based)
      const ordersSnap = await dbAdmin.collection('orders').limit(300).get();
      ordersSnap.forEach((doc) => {
        const data = doc.data();
        const rawDate = data.createdAt || data.date || data.timestamp;
        let createdAt = new Date(0);
        if (rawDate?.toDate) createdAt = rawDate.toDate();
        else if (rawDate) createdAt = new Date(rawDate);

        // Revenue is time-bound to the selected range
        if (createdAt >= startDate) {
          metrics.revenue += Number(data.total || data.amount || data.totalValue || 0);
          if (data.type === 'wholesale' || data.isWholesale) {
            metrics.wholesaleSales += Number(data.total || data.amount || 0);
          }
        }

        // Backlog/State Metrics (Always count open items regardless of creation date)
        const status = (data.status || '').toLowerCase();
        if (['pending', 'processing', 'en tránsito', 'open', 'draft', 'awaiting payment'].includes(status)) {
          metrics.openOrders += 1;
        }
        if (status === 'po_created' || data.type === 'po' || status === 'awaiting_po') {
          metrics.pendingPOs += 1;
        }
      });

      // Users Query
      const usersSnap = await dbAdmin.collection('users').limit(300).get();
      usersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.approved === false || data.status === 'unverified' || data.professionalStatus === 'pending_review') {
          metrics.pendingApprovals += 1;
        }
        if (data.role === 'patient' || data.roles?.includes('patient')) {
          metrics.activePatients += 1;
        }
      });

      // Prescriptions Query
      const rxSnap = await dbAdmin.collection('prescriptions').limit(300).get();
      rxSnap.forEach((doc) => {
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (['pending', 'draft', 'awaiting_review', 'under_review'].includes(status)) {
          metrics.pendingPrescriptions += 1;
        }
        if (data.followUpDue || status === 'requires_followup') {
          metrics.dueFollowUps += 1;
        }
      });

      // RFQs Query (Check purchase_rfqs and agency_rfqs)
      const [rfqsSnap, agencyRfqsSnap] = await Promise.all([
        dbAdmin.collection('purchase_rfqs').limit(200).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('agency_rfqs').limit(200).get().catch(() => ({ docs: [] })),
      ]);
      const allRfqDocs = [...(rfqsSnap.docs || []), ...(agencyRfqsSnap.docs || [])];
      const seenRfqIds = new Set();
      allRfqDocs.forEach((doc) => {
        if (seenRfqIds.has(doc.id)) return;
        seenRfqIds.add(doc.id);
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (['pending', 'open', 'draft', 'submitted', 'reviewing'].includes(status)) {
          metrics.openRFQs += 1;
        }
      });

      // Protocols Query
      const protoSnap = await dbAdmin.collection('protocols').limit(200).get().catch(() => ({ docs: [] }));
      (protoSnap.docs || []).forEach((doc) => {
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (status === 'active' || !data.status) {
          metrics.activeProtocols += 1;
        }
      });

    } else {
      // Client Firestore fallback
      const ordersSnap = await getDocs(query(collection(db, 'orders'), limit(100)));
      ordersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        metrics.revenue += Number(data.total || data.amount || 0);
        if (['pending', 'processing', 'en tránsito'].includes(data.status)) metrics.openOrders += 1;
      });

      const usersSnap = await getDocs(query(collection(db, 'users'), limit(100)));
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.approved === false || data.status === 'unverified') metrics.pendingApprovals += 1;
        if (data.role === 'patient') metrics.activePatients += 1;
      });
    }
  } catch (error) {
    console.warn('[ExecutiveBriefService] Server calculation warning:', error?.message || error);
  }

  return {
    timeRange,
    role,
    metrics,
    calculatedAt: new Date().toISOString(),
  };
}
