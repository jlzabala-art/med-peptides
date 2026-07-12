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

const COLLECTION = 'orders';

/**
 * Obtiene un pedido por su ID.
 * @param {string} orderId
 * @returns {Promise<object|null>}
 */
export async function getOrderById(orderId) {
  if (!orderId) return null;
  const snap = await getDoc(doc(db, COLLECTION, orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
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
  const ref = await addDoc(collection(db, COLLECTION), {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: orderData.status ?? 'pending',
  });
  return ref.id;
}

/**
 * Actualiza el estado u otros campos de un pedido.
 * @param {string} orderId
 * @param {object} updates
 */
export async function updateOrder(orderId, updates) {
  await updateDoc(doc(db, COLLECTION, orderId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Archiva un pedido.
 * @param {string} orderId
 */
export async function archiveOrder(orderId) {
  await updateDoc(doc(db, COLLECTION, orderId), {
    status: 'Archived',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Elimina un pedido permanentemente.
 * @param {string} orderId
 */
export async function deleteOrder(orderId) {
  await deleteDoc(doc(db, COLLECTION, orderId));
}

const orderRepository = {
  getOrderById,
  getOrdersByUser,
  getAllOrders,
  createOrder,
  updateOrder,
  archiveOrder,
  deleteOrder,
  subscribeToUserOrders,
};

export default orderRepository;
