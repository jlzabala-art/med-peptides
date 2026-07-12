/**
 * repositories/wholesalerRepository.js
 *
 * Data-access layer for wholesaler-related Firestore collections:
 *   - `prescriptions` (assigned to a wholesaler)
 *   - `bulk_orders`
 *
 * REGLA: Los componentes UI nunca deben importar `firebase/firestore` directamente.
 */

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { productRepository } from './productRepository';
import { protocolRepository } from './protocolRepository';

/**
 * Suscribe a las prescripciones asignadas a un mayorista.
 * @param {string} wholesalerId
 * @param {number} limitCount
 * @param {function} onData
 * @param {function} onError
 * @returns {function} unsubscribe
 */
export function subscribeToPrescriptions(wholesalerId, limitCount = 50, onData, onError) {
  const q = query(
    collection(db, 'prescriptions'),
    where('wholesalerId', '==', wholesalerId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError ?? (() => {})
  );
}

/**
 * Suscribe a los pedidos masivos de un mayorista.
 * @param {string} wholesalerId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToBulkOrders(wholesalerId, onData) {
  const q = query(
    collection(db, 'bulk_orders'),
    where('wholesalerId', '==', wholesalerId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );
  return onSnapshot(q, (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
}

/**
 * Carga catálogo de productos y protocolos para el Rx Inbox builder.
 * @returns {Promise<{ products: object[], protocols: object[] }>}
 */
export async function getCatalogForRxInbox() {
  const [products, protocols] = await Promise.all([
    productRepository.getCatalog(),
    protocolRepository.getAllProtocols().catch(() => []),
  ]);
  return { products, protocols };
}

export const wholesalerRepository = {
  subscribeToPrescriptions,
  subscribeToBulkOrders,
  getCatalogForRxInbox,
};
