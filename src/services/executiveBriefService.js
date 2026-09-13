import { dbAdmin } from '../lib/firebaseAdmin';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';

/**
 * Safely parse date from various Firestore formats (Timestamp, ISO string, epoch ms)
 */
function parseDocDate(rawDate) {
  if (!rawDate) return null;
  if (rawDate.toDate && typeof rawDate.toDate === 'function') return rawDate.toDate();
  if (rawDate._seconds) return new Date(rawDate._seconds * 1000);
  if (typeof rawDate === 'number') return new Date(rawDate);
  const parsed = new Date(rawDate);
  return isNaN(parsed.getTime()) ? null : parsed;
}

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

  const metrics = {
    // ── Row 1: Products & Catalog ──
    publishedProducts: 0,
    totalVariants: 0,
    lowStockAlerts: 0,
    verifiedMonographs: 0,

    // ── Row 2: Sales & Commercial Performance ──
    quotationsCount: 0,
    revenue: 0,
    periodOrders: 0,
    avgQuotationValue: 0,

    // ── Row 3: Procurement & Sourcing ──
    openRFQs: 0,
    pendingPOs: 0,
    procurementSpend: 0,
    activeSuppliers: 0,

    // ── Row 4: Clinical Operations (Doctor / Medical Director) ──
    activePatients: 0,
    pendingPrescriptions: 0,
    activeProtocols: 0,
    dueFollowUps: 0,

    // ── Row 5: Wholesaler & B2B Distribution (Wholesaler Role) ──
    wholesaleSales: 0,
    openOrders: 0,
    pendingApprovals: 0,
    activeClinics: 0,
  };

  let totalQuotationAmount = 0;

  try {
    if (dbAdmin) {
      // 1. Quotations Query (Time-bound to selected range)
      const [quotesSnap, rfqsListSnap] = await Promise.all([
        dbAdmin.collection('quotations').limit(300).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('rfqs').limit(150).get().catch(() => ({ docs: [] })),
      ]);

      const allQuoteDocs = [...(quotesSnap.docs || []), ...(rfqsListSnap.docs || [])];
      const seenQuoteIds = new Set();
      allQuoteDocs.forEach((doc) => {
        if (seenQuoteIds.has(doc.id)) return;
        seenQuoteIds.add(doc.id);
        const data = doc.data();
        const createdAt = parseDocDate(data.createdAt || data.date || data.timestamp);
        if (createdAt && createdAt >= startDate) {
          metrics.quotationsCount += 1;
          const val = Number(data.totalAmount || data.total || data.estimatedTotal || data.amount || 0);
          totalQuotationAmount += val;
        }
      });
      metrics.avgQuotationValue = metrics.quotationsCount > 0 
        ? Math.round(totalQuotationAmount / metrics.quotationsCount) 
        : 0;

      // 2. Orders Query (Flow revenue & orders filtered by date, Backlog state-based)
      const ordersSnap = await dbAdmin.collection('orders').limit(300).get().catch(() => ({ docs: [] }));
      (ordersSnap.docs || []).forEach((doc) => {
        const data = doc.data();
        const createdAt = parseDocDate(data.createdAt || data.date || data.timestamp);

        if (createdAt && createdAt >= startDate) {
          const val = Number(data.total || data.amount || data.totalValue || 0);
          metrics.revenue += val;
          metrics.periodOrders += 1;
          if (data.type === 'wholesale' || data.isWholesale) {
            metrics.wholesaleSales += val;
          }
        }

        const status = (data.status || '').toLowerCase();
        if (['pending', 'processing', 'en tránsito', 'open', 'draft', 'awaiting payment'].includes(status)) {
          metrics.openOrders += 1;
        }
        if (status === 'po_created' || data.type === 'po' || status === 'awaiting_po') {
          metrics.pendingPOs += 1;
        }
      });

      // 3. Products Catalog Query
      const productsSnap = await dbAdmin.collection('products').limit(300).get().catch(() => ({ docs: [] }));
      (productsSnap.docs || []).forEach((doc) => {
        const data = doc.data();
        if (data.status === 'published' || data.isActive !== false) {
          metrics.publishedProducts += 1;
        }
        const variantsCount = Array.isArray(data.variants) && data.variants.length > 0 
          ? data.variants.length 
          : 1;
        metrics.totalVariants += variantsCount;

        const isLowStock = data.stockStatus === 'low' || 
          data.stockStatus === 'out_of_stock' || 
          data.inStock === false || 
          (typeof data.stock === 'number' && data.stock < 10);
        if (isLowStock) {
          metrics.lowStockAlerts += 1;
        }

        if (data.monographUrl || data.hasMonograph || data.coaUrl || data.coaPublished || data.description) {
          metrics.verifiedMonographs += 1;
        }
      });

      // 4. Procurement: RFQs & Purchase Orders
      const [purchaseRfqsSnap, agencyRfqsSnap, poSnap, bulkOrdersSnap, suppliersSnap] = await Promise.all([
        dbAdmin.collection('purchase_rfqs').limit(200).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('agency_rfqs').limit(200).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('purchaseOrders').limit(200).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('bulk_orders').limit(200).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('suppliers').limit(200).get().catch(() => ({ docs: [] })),
      ]);

      const allRfqDocs = [...(purchaseRfqsSnap.docs || []), ...(agencyRfqsSnap.docs || [])];
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

      const allPoDocs = [...(poSnap.docs || []), ...(bulkOrdersSnap.docs || [])];
      const seenPoIds = new Set();
      allPoDocs.forEach((doc) => {
        if (seenPoIds.has(doc.id)) return;
        seenPoIds.add(doc.id);
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (['pending', 'processing', 'en tránsito', 'po_created', 'awaiting_po', 'open'].includes(status)) {
          metrics.pendingPOs += 1;
        }
        const createdAt = parseDocDate(data.createdAt || data.date || data.orderDate);
        if (createdAt && createdAt >= startDate) {
          metrics.procurementSpend += Number(data.totalAmount || data.total || data.amount || 0);
        }
      });

      metrics.activeSuppliers = (suppliersSnap.docs || []).length;

      // 5. Users Query (Patients, Approvals, Clinics)
      const usersSnap = await dbAdmin.collection('users').limit(300).get().catch(() => ({ docs: [] }));
      (usersSnap.docs || []).forEach((doc) => {
        const data = doc.data();
        if (data.approved === false || data.status === 'unverified' || data.professionalStatus === 'pending_review') {
          metrics.pendingApprovals += 1;
        }
        if (data.role === 'patient' || data.roles?.includes('patient')) {
          metrics.activePatients += 1;
        }
        if (data.role === 'clinic' || data.role === 'doctor' || data.organizationType === 'clinic' || data.clinicName) {
          metrics.activeClinics += 1;
        }
      });

      // 6. Clinical: Prescriptions & Protocols
      const [rxSnap, protoSnap] = await Promise.all([
        dbAdmin.collection('prescriptions').limit(200).get().catch(() => ({ docs: [] })),
        dbAdmin.collection('protocols').limit(200).get().catch(() => ({ docs: [] })),
      ]);

      (rxSnap.docs || []).forEach((doc) => {
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (['pending', 'draft', 'awaiting_review', 'under_review'].includes(status)) {
          metrics.pendingPrescriptions += 1;
        }
        if (data.followUpDue || status === 'requires_followup') {
          metrics.dueFollowUps += 1;
        }
      });

      (protoSnap.docs || []).forEach((doc) => {
        const data = doc.data();
        const status = (data.status || '').toLowerCase();
        if (status === 'active' || !data.status) {
          metrics.activeProtocols += 1;
        }
      });

    } else {
      // Client Firestore fallback
      const [ordersSnap, quotesSnap, productsSnap, usersSnap] = await Promise.all([
        getDocs(query(collection(db, 'orders'), limit(100))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'quotations'), limit(100))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'products'), limit(100))).catch(() => ({ docs: [] })),
        getDocs(query(collection(db, 'users'), limit(100))).catch(() => ({ docs: [] })),
      ]);

      (quotesSnap.docs || []).forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = parseDocDate(data.createdAt || data.date);
        if (createdAt && createdAt >= startDate) {
          metrics.quotationsCount += 1;
          totalQuotationAmount += Number(data.totalAmount || data.total || 0);
        }
      });
      metrics.avgQuotationValue = metrics.quotationsCount > 0 
        ? Math.round(totalQuotationAmount / metrics.quotationsCount) 
        : 0;

      (ordersSnap.docs || []).forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = parseDocDate(data.createdAt || data.date);
        if (createdAt && createdAt >= startDate) {
          metrics.revenue += Number(data.total || data.amount || 0);
          metrics.periodOrders += 1;
        }
        if (['pending', 'processing', 'en tránsito'].includes(data.status)) {
          metrics.openOrders += 1;
        }
      });

      (productsSnap.docs || []).forEach((docSnap) => {
        const data = docSnap.data();
        if (data.status === 'published' || data.isActive !== false) metrics.publishedProducts += 1;
        metrics.totalVariants += Array.isArray(data.variants) ? data.variants.length : 1;
      });

      (usersSnap.docs || []).forEach((docSnap) => {
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
