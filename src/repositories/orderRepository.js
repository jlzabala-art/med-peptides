/**
 * repositories/orderRepository.js
 * 
 * Data-access layer para la colección `orders` en Firestore.
 * Incluye pedidos B2C (carrito → checkout) y B2B (órdenes de compra).
 * 
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { validateOrderWrite } from './orderWriteGuard';
import { getCache, setCache, invalidateCache } from '../lib/cache';
import { canTransitionTo } from '../schemas/transactionalStateMachine';
import { ClinicalStateTransitionError } from '../errors/ClinicalErrors';
import { withRetry } from './_resilience';

const COLLECTION = 'orders';

/**
 * Obtiene un pedido por su ID.
 * @param {string} orderId
 * @returns {Promise<object|null>}
 */
export async function getOrderById(orderId) {
  if (!orderId) return null;
  const cacheKey = `${COLLECTION}/${orderId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const snap = await getDoc(doc(db, COLLECTION, orderId));
  if (!snap.exists()) return null;

  const data = { id: snap.id, ...snap.data() };
  setCache(cacheKey, data);
  return data;
}

export function invalidateOrderCache(orderId) {
  if (!orderId) return;
  invalidateCache(`${COLLECTION}/${orderId}`);
}

/**
 * Obtiene pedidos de un usuario con paginación.
 * @param {string} userId
 * @param {{ limitCount?: number, lastDoc?: object, status?: string }} opts
 * @returns {Promise<{ orders: object[], lastDoc: object|null }>}
 */
export async function getOrdersByUser(userId, { limitCount = 20, lastDoc = null, status } = {}) {
  const constraints = [
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  ];

  if (status) constraints.push(where('status', '==', status));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextLastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { orders, lastDoc: nextLastDoc };
}

/**
 * Suscribe a los pedidos de un usuario (Real-time).
 * @param {string} userId
 * @param {function} onData
 * @param {function} onError
 * @returns {function} Unsubscribe function
 */
export function subscribeToUserOrders(userId, onData, onError) {
  const q = query(
    collection(db, COLLECTION),
    where('uid', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ordersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      onData(ordersList);
    },
    onError
  );
}

/**
 * Obtiene todos los pedidos (admin) con paginación.
 * @param {{ limitCount?: number, lastDoc?: object, status?: string }} opts
 */
export async function getAllOrders({ limitCount = 50, lastDoc = null, status } = {}) {
  const constraints = [orderBy('createdAt', 'desc'), limit(limitCount)];

  if (status) constraints.unshift(where('status', '==', status));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextLastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { orders, lastDoc: nextLastDoc };
}

/**
 * Crea un nuevo pedido.
 * @param {object} orderData
 * @returns {Promise<string>} ID del nuevo pedido
 */
export async function createOrder(orderData) {
  const cleanData = validateOrderWrite(orderData, false);

  const ref = await withRetry(
    () => addDoc(collection(db, COLLECTION), {
      ...cleanData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    { entityName: 'orderRepository.createOrder' }
  );
  return ref.id;
}

/**
 * Actualiza el estado u otros campos de un pedido.
 * @param {string} orderId
 * @param {object} updates
 */
export async function updateOrder(orderId, updates) {
  const cleanData = validateOrderWrite(updates, true);

  await withRetry(
    () => updateDoc(doc(db, COLLECTION, orderId), { ...cleanData, updatedAt: serverTimestamp() }),
    { entityName: 'orderRepository.updateOrder' }
  );
  invalidateOrderCache(orderId);
}

/**
 * Updates order status with State Machine enforcement.
 * Throws ClinicalStateTransitionError if the transition is not in the allowed graph.
 * @param {string} orderId
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @param {object} [opts]
 * @param {string} [opts.actorId]
 */
export async function updateOrderStatus(orderId, currentStatus, targetStatus, { actorId = null } = {}) {
  if (!orderId || !currentStatus || !targetStatus) throw new Error('updateOrderStatus: orderId, currentStatus, and targetStatus are required');

  if (!canTransitionTo('sales_order', currentStatus, targetStatus)) {
    throw new ClinicalStateTransitionError('sales_order', currentStatus, targetStatus);
  }

  await withRetry(
    () => updateDoc(doc(db, COLLECTION, orderId), {
      status: targetStatus,
      updatedAt: serverTimestamp(),
      [`statusHistory.${Date.now()}`]: { from: currentStatus, to: targetStatus, by: actorId, at: new Date().toISOString() },
    }),
    { entityName: 'orderRepository.updateOrderStatus' }
  );
  invalidateOrderCache(orderId);
}

export async function archiveOrder(orderId) {
  await withRetry(
    () => updateDoc(doc(db, COLLECTION, orderId), { status: 'Archived', updatedAt: serverTimestamp() }),
    { entityName: 'orderRepository.archiveOrder' }
  );
  invalidateOrderCache(orderId);
}

export async function deleteOrder(orderId) {
  await withRetry(
    () => deleteDoc(doc(db, COLLECTION, orderId)),
    { entityName: 'orderRepository.deleteOrder' }
  );
  invalidateOrderCache(orderId);
}

/**
 * Obtiene pedidos de venta B2B.
 * @param {number} limitCount
 * @returns {Promise<Array<object>>}
 */
export async function getB2BSalesOrders(limitCount = 100) {
  try {
    const q = query(collection(db, 'b2b_sales_orders'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    return [];
  }
}

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { logger } from '../utils/logger';

/**
 * Invoca Cloud Function para generar link de pago de Stripe.
 * @param {{ orderId: string, currency?: string, sendEmail?: boolean }} params
 * @returns {Promise<string>} URL de pago
 */
export async function generateOrderPaymentLink({ orderId, currency = 'usd', sendEmail = false }) {
  try {
    const fn = httpsCallable(functions, 'generatePaymentLink');
    const result = await fn({ orderId, currency, sendEmail });
    return result?.data?.url;
  } catch (err) {
    logger.error('[orderRepository] generateOrderPaymentLink failed', { orderId, error: err.message });
    throw err;
  }
}

const orderRepository = {
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  getB2BSalesOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  archiveOrder,
  deleteOrder,
  subscribeToUserOrders,
  invalidateOrderCache,
  generateOrderPaymentLink,
};

export default orderRepository;

