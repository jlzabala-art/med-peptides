import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export const INVOICES_COLLECTION = 'b2b_invoices';

/**
 * Fetches invoices as a one-time promise (useful for React Query).
 */
export async function getInvoices(limitCount = 100) {
  const q = query(
    collection(db, INVOICES_COLLECTION), 
    orderBy('createdAt', 'desc'), 
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Subscribes to real-time invoices (useful for onSnapshot hooks).
 * @param {function} callback - Function called with the array of invoice objects.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToInvoices(callback, limitCount = 100) {
  const q = query(
    collection(db, INVOICES_COLLECTION), 
    orderBy('createdAt', 'desc'), 
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(docs);
  });
}
