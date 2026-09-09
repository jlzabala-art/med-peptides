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
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { validateQuotationWrite } from './quotationWriteGuard';
import { getCache, setCache, invalidateCache } from '../lib/cache';
import logger from '../utils/logger';

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

// ── Quotations Hub (Realtime Subscription with limits) ─────────────────────────

export const subscribeToAllQuotationsAndRfqs = (onData, maxLimit = 100) => {
  const qQuotes = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'), limit(maxLimit));
  const qRfqs = query(collection(db, 'rfqs'), orderBy('createdAt', 'desc'), limit(maxLimit));

  let quotesData = [];
  let rfqsData = [];

  const processData = () => {
    const merged = [...quotesData, ...rfqsData].sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    onData(merged);
  };

  const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
    quotesData = snapshot.docs.map(d => ({ id: d.id, type: 'quotation', ...d.data() }));
    processData();
  }, (err) => {
    logger.error('[quotationRepository] Error fetching quotations', { error: err.message });
  });

  const unsubRfqs = onSnapshot(qRfqs, (snapshot) => {
    rfqsData = snapshot.docs.map(d => ({ id: d.id, type: 'rfq', ...d.data() }));
    processData();
  }, (err) => {
    logger.error('[quotationRepository] Error fetching RFQs', { error: err.message });
  });

  return () => {
    unsubQuotes();
    unsubRfqs();
  };
};

export const fetchAgencyRFQById = async (id) => {
  try {
    const docRef = doc(db, 'agency_rfqs', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('[quotationRepository] fetchAgencyRFQById failed', { id, error: err.message });
    throw err;
  }
};

export const updateAgencyRFQStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, 'agency_rfqs', id), { status, updatedAt: serverTimestamp() });
    logger.info('[quotationRepository] Agency RFQ status updated', { id, status });
  } catch (err) {
    logger.error('[quotationRepository] updateAgencyRFQStatus failed', { id, error: err.message });
    throw err;
  }
};

export const fetchPurchaseRFQById = async (id) => {
  try {
    const docRef = doc(db, 'purchase_rfqs', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('[quotationRepository] fetchPurchaseRFQById failed', { id, error: err.message });
    throw err;
  }
};

export const updatePurchaseRFQ = async (id, updates) => {
  try {
    await updateDoc(doc(db, 'purchase_rfqs', id), { ...updates, updatedAt: serverTimestamp() });
    logger.info('[quotationRepository] Purchase RFQ updated', { id });
  } catch (err) {
    logger.error('[quotationRepository] updatePurchaseRFQ failed', { id, error: err.message });
    throw err;
  }
};

export const fetchB2BSupplierPOById = async (poId) => {
  try {
    const docRef = doc(db, 'purchaseOrders', poId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('[quotationRepository] fetchB2BSupplierPOById failed', { poId, error: err.message });
    throw err;
  }
};

export const submitSupplierBillForPO = async (poId, billInfo) => {
  try {
    await updateDoc(doc(db, 'purchaseOrders', poId), {
      status: 'billed',
      supplierBillNumber: billInfo.billNumber,
      supplierBillAmount: billInfo.billAmount,
      billedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.info('[quotationRepository] Supplier Bill registered for PO', { poId });
  } catch (err) {
    logger.error('[quotationRepository] submitSupplierBillForPO failed', { poId, error: err.message });
    throw err;
  }
};

export const fetchB2BClientQuoteById = async (quoteId) => {
  try {
    const docRef = doc(db, 'b2b_quotations', quoteId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('[quotationRepository] fetchB2BClientQuoteById failed', { quoteId, error: err.message });
    throw err;
  }
};

export const updateB2BClientQuoteStatus = async (quoteId, status) => {
  try {
    await updateDoc(doc(db, 'b2b_quotations', quoteId), { status, updatedAt: serverTimestamp() });
    logger.info('[quotationRepository] B2B Quote status updated', { quoteId, status });
  } catch (err) {
    logger.error('[quotationRepository] updateB2BClientQuoteStatus failed', { quoteId, error: err.message });
    throw err;
  }
};

export const fetchSupplierQuotationById = async (quotationId) => {
  try {
    const docRef = doc(db, 'supplier_quotations', quotationId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    logger.error('[quotationRepository] fetchSupplierQuotationById failed', { quotationId, error: err.message });
    throw err;
  }
};

export const updateSupplierQuotation = async (quotationId, updates) => {
  try {
    const docRef = doc(db, 'supplier_quotations', quotationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    logger.info('[quotationRepository] Supplier quotation updated', { quotationId });
  } catch (err) {
    logger.error('[quotationRepository] updateSupplierQuotation failed', { quotationId, error: err.message });
    throw err;
  }
};

export const extendQuotationValidity = async (quotationId, days = 15) => {
  try {
    const newExpiry = new Date(Date.now() + (days * 24 * 3600 * 1000));
    const docRef = doc(db, 'quotations', quotationId);
    await updateDoc(docRef, {
      expiresAt: newExpiry,
      updatedAt: serverTimestamp()
    });
    logger.info('[quotationRepository] Extended quotation validity', { quotationId, days });
  } catch (err) {
    logger.error('[quotationRepository] extendQuotationValidity failed', { quotationId, error: err.message });
    throw err;
  }
};

export const quotationRepository = {
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  getQuotationsPage,
  invalidateQuotationCache,
  subscribeToAllQuotationsAndRfqs,
  fetchAgencyRFQById,
  updateAgencyRFQStatus,
  fetchPurchaseRFQById,
  updatePurchaseRFQ,
  fetchB2BSupplierPOById,
  submitSupplierBillForPO,
  fetchB2BClientQuoteById,
  updateB2BClientQuoteStatus,
  fetchSupplierQuotationById,
  updateSupplierQuotation,
  extendQuotationValidity,
};

export default quotationRepository;
