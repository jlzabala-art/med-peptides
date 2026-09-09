import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  setDoc,
  addDoc,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../utils/logger';
import { withRetry } from './_resilience';

/**
 * Real-time subscription to low-stock items for a wholesaler.
 * Used by StockAlertsWidget.
 * @param {string} wholesalerId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToLowStock(wholesalerId, onData) {
  const q = query(
    collection(db, 'wholesaler_inventory'),
    where('wholesalerId', '==', wholesalerId)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const lowStock = items.filter((i) => i.quantity <= (i.threshold || 5));
    onData(lowStock);
  }, (err) => {
    logger.error('[inventoryRepository] subscribeToLowStock failed', { wholesalerId, error: err.message });
  });
}

/**
 * Real-time subscription to full inventory for a wholesaler.
 * Used by RealTimeStockManagerWidget.
 * @param {string} wholesalerId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToInventory(wholesalerId, onData) {
  const q = query(
    collection(db, 'wholesaler_inventory'),
    where('wholesalerId', '==', wholesalerId)
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    onData(items);
  }, (err) => {
    logger.error('[inventoryRepository] subscribeToInventory failed', { wholesalerId, error: err.message });
  });
}

/**
 * Updates stock quantity for a wholesaler product.
 * @param {string} wholesalerId
 * @param {string} productId
 * @param {number} quantity
 * @param {string} productName
 * @returns {Promise<void>}
 */
export async function updateInventoryQuantity(wholesalerId, productId, quantity, productName = '') {
  try {
    const docRef = doc(db, 'wholesaler_inventory', `${wholesalerId}_${productId}`);
    await withRetry(
      () =>
        setDoc(
          docRef,
          {
            wholesalerId,
            productId,
            productName: productName || productId,
            quantity,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ),
      { entityName: 'Inventory-UpdateQty' }
    );
    logger.info('[inventoryRepository] Updated inventory qty', { wholesalerId, productId, quantity });
  } catch (err) {
    logger.error('[inventoryRepository] updateInventoryQuantity failed', { wholesalerId, productId, error: err.message });
    throw err;
  }
}

/**
 * Fetches expiring batch lots for a wholesaler.
 * Used by BatchExpirationTrackerWidget.
 * @param {string} wholesalerId
 * @param {number} maxLimit
 * @returns {Promise<Array>}
 */
export async function fetchExpiringBatches(wholesalerId, maxLimit = 10) {
  try {
    const q = query(
      collection(db, 'b2b_inventory'),
      where('wholesalerId', '==', wholesalerId),
      orderBy('expiryDate', 'asc'),
      limit(maxLimit)
    );
    const snap = await withRetry(() => getDocs(q), { entityName: 'Inventory-ExpiringBatches' });
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[inventoryRepository] fetchExpiringBatches failed', { wholesalerId, error: err.message });
    return [];
  }
}

/**
 * Creates a bulk restock purchase request.
 * Used by BulkRestockPortalWidget.
 * @param {object} restockData
 * @returns {Promise<string>}
 */
export async function createBulkRestockOrder(restockData) {
  try {
    const docRef = await addDoc(collection(db, 'wholesaler_restock_orders'), {
      ...restockData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('[inventoryRepository] Created restock order', { id: docRef.id });
    return docRef.id;
  } catch (err) {
    logger.error('[inventoryRepository] createBulkRestockOrder failed', { error: err.message });
    throw err;
  }
}

/**
 * Submits an RFQ to compounding_rfqs.
 * Used by PrescriptionIntakeWidget.
 * @param {object} rfqData
 * @returns {Promise<string>}
 */
export async function createCompoundingRfq(rfqData) {
  try {
    const docRef = await addDoc(collection(db, 'compounding_rfqs'), {
      ...rfqData,
      status: rfqData.status || 'pending_quotation',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    logger.info('[inventoryRepository] Created compounding RFQ', { id: docRef.id });
    return docRef.id;
  } catch (err) {
    logger.error('[inventoryRepository] createCompoundingRfq failed', { error: err.message });
    throw err;
  }
}

/**
 * Fetches analytics and order aggregates for a wholesaler.
 * Used by TurnoverAnalyticsWidget.
 * @param {string} wholesalerId
 * @returns {Promise<object>}
 */
export async function fetchWholesalerAnalytics(wholesalerId) {
  try {
    const q = query(collection(db, 'orders'), where('wholesalerId', '==', wholesalerId));
    const snap = await getDocs(q);
    if (snap.empty) {
      return {
        monthlyRevenue: 0,
        unitsSold: 0,
        activeOrders: 0,
        growth: 0,
      };
    }
    let rev = 0;
    let units = 0;
    let active = 0;
    snap.docs.forEach((d) => {
      const data = d.data();
      rev += Number(data.total || data.totalAmount || 0);
      units += (data.items || []).reduce((acc, item) => acc + Number(item.quantity || 1), 0);
      if (data.status === 'pending' || data.status === 'processing') active++;
    });
    return {
      monthlyRevenue: rev,
      unitsSold: units,
      activeOrders: active,
      growth: 0,
    };
  } catch (err) {
    logger.error('[inventoryRepository] fetchWholesalerAnalytics failed', { wholesalerId, error: err.message });
    return {
      monthlyRevenue: 0,
      unitsSold: 0,
      activeOrders: 0,
      growth: 0,
    };
  }
}

/**
 * Real-time subscription to active outbound wholesale orders / shipments.
 * Follows Golden Rule #1 (limit 20) and #2 (Firestore source of truth).
 * @param {string|null} wholesalerId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToWholesaleOrders(wholesalerId, onData) {
  let q;
  if (wholesalerId) {
    q = query(
      collection(db, 'orders'),
      where('wholesalerId', '==', wholesalerId),
      limit(20)
    );
  } else {
    q = query(
      collection(db, 'orders'),
      limit(20)
    );
  }

  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id.startsWith('PO-') || d.id.startsWith('ORD-') ? d.id : `ORD-${d.id.slice(0, 6).toUpperCase()}`,
        clinic: data.clinicName || data.customerName || data.shippingAddress?.company || 'Partner Clinic',
        status: (data.status || 'processing').toLowerCase(),
        items: Array.isArray(data.items)
          ? data.items.map(i => `${i.quantity || 1}x ${i.productName || i.name || 'Item'}`).join(', ')
          : (data.itemsSummary || `${data.itemsCount || 1} items`),
        date: data.estimatedDeliveryDate || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Pending dispatch'),
        rawId: d.id,
      };
    });
    onData(orders);
  }, (err) => {
    logger.error('[inventoryRepository] subscribeToWholesaleOrders failed', { error: err.message });
    onData([]);
  });
}

export const inventoryRepository = {
  subscribeToLowStock,
  subscribeToInventory,
  subscribeToWholesaleOrders,
  updateInventoryQuantity,
  fetchExpiringBatches,
  createBulkRestockOrder,
  createCompoundingRfq,
  fetchWholesalerAnalytics,
};

export default inventoryRepository;


