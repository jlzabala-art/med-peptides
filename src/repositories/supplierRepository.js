/**
 * repositories/supplierRepository.js
 *
 * Data-access layer for supplier-related Firestore collections:
 *   - `suppliers`      — supplier master data
 *   - `products`       — products associated to a supplier
 *   - `orders`         — orders assigned to a supplier
 *   - `purchase_rfqs`  — RFQs directed to a supplier
 *
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 * Usar siempre las funciones de este módulo.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const suppliersCol  = () => collection(db, 'suppliers');
const productsCol   = () => collection(db, 'products');
const ordersCol     = () => collection(db, 'orders');
const rfqsCol       = () => collection(db, 'purchase_rfqs');

// ─── SUPPLIER PROFILE ─────────────────────────────────────────────────────────

/**
 * Obtiene el perfil completo de un supplier por su UID de Auth.
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getSupplierProfile(uid) {
  if (!uid) return null;
  // Primero intentamos buscar en `suppliers` por uid
  const q = query(suppliersCol(), where('uid', '==', uid), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() };
  // Fallback: el doc tiene el mismo id que el uid
  const docSnap = await getDoc(doc(db, 'suppliers', uid));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

/**
 * Obtiene un supplier por su ID de documento.
 * @param {string} supplierId
 * @returns {Promise<object|null>}
 */
export async function getSupplierById(supplierId) {
  if (!supplierId) return null;
  const snap = await getDoc(doc(db, 'suppliers', supplierId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Obtiene múltiples suppliers por un array de IDs (batch).
 * Útil para enriquecer líneas de prescripción o productos.
 * @param {string[]} ids
 * @returns {Promise<Record<string, object>>} mapa supplierId → objeto
 */
export async function getSuppliersByIds(ids = []) {
  if (!ids.length) return {};
  // Firestore `in` está limitado a 30 elementos; chunking automático
  const unique = [...new Set(ids.filter(Boolean))];
  const CHUNK = 30;
  const chunks = [];
  for (let i = 0; i < unique.length; i += CHUNK) {
    chunks.push(unique.slice(i, i + CHUNK));
  }
  const results = {};
  await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(suppliersCol(), where('__name__', 'in', chunk));
      const snap = await getDocs(q);
      snap.forEach((d) => { results[d.id] = { id: d.id, ...d.data() }; });
    })
  );
  return results;
}

// ─── SUPPLIER PRODUCTS ────────────────────────────────────────────────────────

/**
 * Obtiene los productos de un supplier con paginación.
 * Reemplaza el useEffect + Firestore directo de useSupplierProducts.js.
 *
 * @param {string} supplierId
 * @param {{ limitCount?: number, lastDoc?: object }} opts
 * @returns {Promise<{ products: object[], hasMore: boolean, lastDoc: object|null }>}
 */
export async function getProductsBySupplier(supplierId, { limitCount = 50, lastDoc = null } = {}) {
  if (!supplierId) return { products: [], hasMore: false, lastDoc: null };

  const constraints = [
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const snap = await getDocs(query(productsCol(), ...constraints));
  const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { products, hasMore: snap.docs.length === limitCount, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

// ─── SUPPLIER ORDERS ──────────────────────────────────────────────────────────

/**
 * Obtiene los pedidos asignados a un supplier con paginación.
 * Reemplaza el useEffect + Firestore directo de useSupplierOrders.js.
 *
 * @param {string} supplierId
 * @param {{ limitCount?: number, lastDoc?: object, status?: string }} opts
 * @returns {Promise<{ orders: object[], hasMore: boolean, lastDoc: object|null }>}
 */
export async function getOrdersBySupplier(supplierId, { limitCount = 50, lastDoc = null, status = null } = {}) {
  if (!supplierId) return { orders: [], hasMore: false, lastDoc: null };

  const constraints = [
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (status) constraints.unshift(where('status', '==', status));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const snap = await getDocs(query(ordersCol(), ...constraints));
  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return { orders, hasMore: snap.docs.length === limitCount, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

// ─── SUPPLIER RFQs ────────────────────────────────────────────────────────────

/**
 * Obtiene las RFQs (Request for Quotation) dirigidas a un supplier.
 * Reemplaza el fetch inline de SupplierRFQsTab.jsx.
 *
 * @param {string} supplierId
 * @param {{ limitCount?: number, status?: string }} opts
 * @returns {Promise<object[]>}
 */
export async function getRFQsBySupplier(supplierId, { limitCount = 50, status = null } = {}) {
  if (!supplierId) return [];

  const constraints = [
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];
  if (status) constraints.unshift(where('status', '==', status));

  const snap = await getDocs(query(rfqsCol(), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Actualiza el estado y la cotización de una RFQ (supplier responds).
 * @param {string} rfqId
 * @param {{ quotedPrice: number, notes?: string, status?: string }} data
 */
export async function respondToRFQ(rfqId, { quotedPrice, notes = '', status = 'supplier_quoted' } = {}) {
  await updateDoc(doc(db, 'purchase_rfqs', rfqId), {
    quotedPrice,
    notes,
    status,
    respondedAt: serverTimestamp(),
  });
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

// ─── SUPPLIER SHIPMENTS ───────────────────────────────────────────────────────

const shipmentsCol = () => collection(db, 'supplier_shipments');

/**
 * Obtiene los envíos de un supplier con paginación (cursor-based).
 *
 * @param {string} supplierId
 * @param {{ limitCount?: number, lastDoc?: object }} opts
 * @returns {Promise<{ shipments: object[], hasMore: boolean, lastDoc: object|null, total: number }>}
 */
export async function getShipmentsBySupplier(supplierId, { limitCount = 10, lastDoc = null } = {}) {
  if (!supplierId) return { shipments: [], hasMore: false, lastDoc: null, total: 0 };

  const baseConstraints = [
    where('supplierId', '==', supplierId),
    orderBy('createdAt', 'desc'),
  ];

  // Count total (para paginación visual)
  const { getCountFromServer } = await import('firebase/firestore');
  const countSnap = await getCountFromServer(query(shipmentsCol(), ...baseConstraints));
  const total = countSnap.data().count;

  const pageConstraints = [...baseConstraints, limit(limitCount)];
  if (lastDoc) pageConstraints.push(startAfter(lastDoc));

  const snap = await getDocs(query(shipmentsCol(), ...pageConstraints));
  const shipments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return {
    shipments,
    hasMore: snap.docs.length === limitCount,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    total,
  };
}

/**
 * Actualiza el estado de un envío (el account manager avanza el step).
 *
 * @param {string} shipmentId
 * @param {{ status: string, note?: string, timestamp?: object }} update
 */
export async function updateShipmentStatus(shipmentId, update = {}) {
  const { serverTimestamp: sts } = await import('firebase/firestore');
  await updateDoc(doc(db, 'supplier_shipments', shipmentId), {
    ...update,
    updatedAt: sts(),
  });
}

// ─── PURCHASE ORDERS / PO CREATION ──────────────────────────────────────────

const purchaseOrdersCol = () => collection(db, 'purchaseOrders');

/**
 * Crea una Purchase Order (PO) vinculada a una prescripción o pedido.
 *
 * @param {object} poData
 * @returns {Promise<string>} PO document ID
 */
export async function createPurchaseOrder(poData = {}) {
  const payload = {
    poNumber: poData.poNumber || `PO-${Date.now().toString().slice(-6)}`,
    status: poData.status || 'open',
    supplierId: poData.supplierId || null,
    supplierName: poData.supplierName || 'Default Compounder / Supplier',
    linkedPrescriptionId: poData.linkedPrescriptionId || null,
    patientId: poData.patientId || null,
    patientName: poData.patientName || '',
    doctorId: poData.doctorId || null,
    doctorName: poData.doctorName || '',
    items: (poData.items || []).map((item) => ({
      id: item.id || item.productId || '',
      productId: item.productId || item.id || '',
      productName: item.productName || item.name || '',
      sku: item.sku || '',
      quantity: item.quantity || 1,
      unitPrice: item.price || item.unitPrice || 0,
      dosage: item.dosage || null,
      frequency: item.frequency || null,
      route: item.route || null,
    })),
    totalAmount: poData.totalAmount || 0,
    notes: poData.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(purchaseOrdersCol(), payload);
  return docRef.id;
}

// ─── EXPORT OBJECT (para compatibilidad con imports { supplierRepository }) ────

export const supplierRepository = {
  getSupplierProfile,
  getSupplierById,
  getSuppliersByIds,
  getProductsBySupplier,
  getOrdersBySupplier,
  getRFQsBySupplier,
  respondToRFQ,
  getShipmentsBySupplier,
  updateShipmentStatus,
  createPurchaseOrder,
};

