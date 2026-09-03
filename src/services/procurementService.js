/**
 * procurementService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Firestore service for the Procurement, Purchase & Logistics domain.
 * Covers: Purchase Orders (PO), Purchase Bills, RFQs, Shipments Tracking,
 *         Supplier Price Lists & Catalog Sync.
 *
 * Golden Rule #2: Firestore is the single source of truth.
 * Components MUST NOT import firebase/firestore directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fb from '../firebase';
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, orderBy, limit, increment
} from 'firebase/firestore';
import logger from '../utils/logger';

const db = fb?.db;

// ── Purchase Orders (PO) ─────────────────────────────────────────────────────

/**
 * Subscribes to purchase orders in realtime.
 * @param {string} collectionName - Default 'purchaseOrders'
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export const subscribeToPurchaseOrders = (collectionName = 'purchaseOrders', onData) => {
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(list);
  }, (err) => {
    logger.error('[procurementService] subscribeToPurchaseOrders error', { error: err.message });
  });
};

/**
 * Creates or updates a Purchase Order.
 * @param {object} poData
 * @param {string|null} poId
 * @returns {Promise<string>}
 */
export const savePurchaseOrder = async (poData, poId = null) => {
  try {
    const payload = {
      ...poData,
      updatedAt: serverTimestamp()
    };
    if (poId) {
      await updateDoc(doc(db, 'purchaseOrders', poId), payload);
      logger.info('[procurementService] PO updated', { poId });
      return poId;
    } else {
      payload.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'purchaseOrders'), payload);
      logger.info('[procurementService] PO created', { id: docRef.id });
      return docRef.id;
    }
  } catch (err) {
    logger.error('[procurementService] savePurchaseOrder failed', { poId, error: err.message });
    throw err;
  }
};

/**
 * Updates PO status or single field.
 * @param {string} poId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export const updatePurchaseOrder = async (poId, updates) => {
  try {
    await updateDoc(doc(db, 'purchaseOrders', poId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    logger.info('[procurementService] PO field updated', { poId, updates });
  } catch (err) {
    logger.error('[procurementService] updatePurchaseOrder failed', { poId, error: err.message });
    throw err;
  }
};

/**
 * Deletes a Purchase Order.
 * @param {string} poId
 * @returns {Promise<void>}
 */
export const deletePurchaseOrder = async (poId) => {
  try {
    await deleteDoc(doc(db, 'purchaseOrders', poId));
    logger.info('[procurementService] PO deleted', { poId });
  } catch (err) {
    logger.error('[procurementService] deletePurchaseOrder failed', { poId, error: err.message });
    throw err;
  }
};

// ── Purchase Bills ───────────────────────────────────────────────────────────

/**
 * Subscribes to purchase bills in realtime.
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export const subscribeToBills = (onData) => {
  const q = query(collection(db, 'purchaseBills'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(list);
  }, (err) => {
    logger.error('[procurementService] subscribeToBills error', { error: err.message });
  });
};

/**
 * Creates or updates a Purchase Bill.
 * @param {object} billData
 * @param {string|null} billId
 * @returns {Promise<string>}
 */
export const saveBill = async (billData, billId = null) => {
  try {
    const payload = {
      ...billData,
      updatedAt: serverTimestamp()
    };
    if (billId) {
      await updateDoc(doc(db, 'purchaseBills', billId), payload);
      logger.info('[procurementService] Bill updated', { billId });
      return billId;
    } else {
      payload.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, 'purchaseBills'), payload);
      logger.info('[procurementService] Bill created', { id: docRef.id });
      return docRef.id;
    }
  } catch (err) {
    logger.error('[procurementService] saveBill failed', { billId, error: err.message });
    throw err;
  }
};

/**
 * Updates a Bill status or field.
 * @param {string} billId
 * @param {object} updates
 * @returns {Promise<void>}
 */
export const updateBill = async (billId, updates) => {
  try {
    await updateDoc(doc(db, 'purchaseBills', billId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    logger.info('[procurementService] Bill field updated', { billId, updates });
  } catch (err) {
    logger.error('[procurementService] updateBill failed', { billId, error: err.message });
    throw err;
  }
};

// ── RFQs (Request For Quotation) ─────────────────────────────────────────────

/**
 * Creates or updates an RFQ.
 * @param {object} rfqData
 * @param {string|null} rfqId
 * @param {string} collectionName
 * @returns {Promise<string>}
 */
export const saveRFQ = async (rfqData, rfqId = null, collectionName = 'purchase_rfqs') => {
  try {
    const payload = {
      ...rfqData,
      updatedAt: serverTimestamp()
    };
    if (rfqId) {
      await updateDoc(doc(db, collectionName, rfqId), payload);
      logger.info('[procurementService] RFQ updated', { rfqId });
      return rfqId;
    } else {
      payload.createdAt = serverTimestamp();
      const docRef = await addDoc(collection(db, collectionName), payload);
      logger.info('[procurementService] RFQ created', { id: docRef.id });
      return docRef.id;
    }
  } catch (err) {
    logger.error('[procurementService] saveRFQ failed', { rfqId, error: err.message });
    throw err;
  }
};

// ── Suppliers & Shipments ────────────────────────────────────────────────────

/**
 * Fetches all active suppliers.
 * @returns {Promise<Array>}
 */
export const fetchSuppliers = async () => {
  try {
    const snap = await getDocs(collection(db, 'suppliers'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[procurementService] fetchSuppliers failed', { error: err.message });
    throw err;
  }
};

/**
 * Fetches recent shipments for logistics tracking.
 * @param {number} maxCount
 * @returns {Promise<Array>}
 */
export const fetchRecentShipments = async (maxCount = 5) => {
  try {
    const q = query(
      collection(db, 'supplier_shipments'),
      orderBy('createdAt', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error('[procurementService] fetchRecentShipments failed', { error: err.message });
    throw err;
  }
};

import { updateProduct } from '../repositories/productRepository';

/**
 * Converts a PO to a Supplier Bill, updates PO status to closed, and increments product stock.
 * @param {object} po
 * @param {string} collectionName
 * @returns {Promise<void>}
 */
export const convertPOToBillAndIncrementStock = async (po, collectionName = 'purchaseOrders') => {
  try {
    const totalAmount = (po.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    
    // 1. Create a Bill with the same items
    const billPayload = {
      vendorName: po.supplierName,
      supplierName: po.supplierName,
      billNumber: `BILL-${Date.now().toString().slice(-6)}`,
      linkedPoId: po.id,
      linkedPoNumber: po.poNumber,
      status: 'open',
      items: po.items || [],
      totalAmount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    await addDoc(collection(db, 'purchaseBills'), billPayload);

    // 2. Update this PO to 'closed' status
    await updateDoc(doc(db, collectionName, po.id), { status: 'closed', updatedAt: serverTimestamp() });

    // 3. Increment Inventory
    if (po.items && po.items.length > 0) {
      for (const item of po.items) {
        const itemName = item.name || item.itemName;
        if (!itemName) continue;
        const q = query(collection(db, 'products'), where('name', '==', itemName));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const productDoc = snap.docs[0];
          await updateProduct(productDoc.id, {
            stock: increment(parseInt(item.quantity || 1))
          }, { strict: false });
        }
      }
    }
    logger.info('[procurementService] Converted PO to Bill successfully', { poId: po.id });
  } catch (err) {
    logger.error('[procurementService] convertPOToBillAndIncrementStock failed', { poId: po?.id, error: err.message });
    throw err;
  }
};

