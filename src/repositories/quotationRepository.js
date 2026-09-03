import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { validateQuotationWrite } from './quotationWriteGuard';
import { getCache, setCache, invalidateCache } from '../lib/cache';

const COLLECTION = 'quotations';

export async function getQuotationById(quotationId) {
  if (!quotationId) return null;
  const cacheKey = `${COLLECTION}/${quotationId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const snap = await getDoc(doc(db, COLLECTION, quotationId));
  if (!snap.exists()) return null;

  const data = { id: snap.id, ...snap.data() };
  setCache(cacheKey, data);
  return data;
}

export function invalidateQuotationCache(quotationId) {
  if (!quotationId) return;
  invalidateCache(`${COLLECTION}/${quotationId}`);
}

export async function createQuotation(data) {
  const cleanData = validateQuotationWrite(data, false);
  const ref = await addDoc(collection(db, COLLECTION), cleanData);
  return ref.id;
}

export async function updateQuotation(quotationId, updates) {
  const cleanData = validateQuotationWrite(updates, true);
  await updateDoc(doc(db, COLLECTION, quotationId), cleanData);
  invalidateQuotationCache(quotationId);
}

export async function deleteQuotation(quotationId) {
  await deleteDoc(doc(db, COLLECTION, quotationId));
  invalidateQuotationCache(quotationId);
}

export async function getQuotationsPage({ filters = {}, pageSize = 50, lastDoc = null } = {}) {
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
  
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      constraints.unshift(where(k, '==', v));
    }
  });

  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const quotations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const nextLastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { data: quotations, lastDoc: nextLastDoc, hasMore: snap.docs.length === pageSize };
}

export const quotationRepository = {
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationsPage,
  invalidateQuotationCache,
};

export default quotationRepository;
