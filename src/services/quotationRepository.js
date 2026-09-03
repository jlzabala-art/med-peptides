/**
 * quotationRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Firestore repository for Quotations, RFQs, and Public/B2B Quote views.
 * Covers: QuotationsHub, PublicClientQuote, PublicSupplierQuote, B2BSupplierPOView, B2BClientQuoteView.
 *
 * Golden Rule #2: Firestore is the single source of truth.
 * Components MUST NOT import firebase/firestore directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as fb from '../firebase';
import {
  collection, query, where, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, orderBy
} from 'firebase/firestore';
import logger from '../utils/logger';

const db = fb?.db;

// ── Quotations Hub (Realtime) ────────────────────────────────────────────────

/**
 * Subscribes to quotations and RFQs simultaneously for the Quotations Hub.
 * @param {function} onData - receives merged array of { id, type: 'quotation'|'rfq', ...data }
 * @returns {function} unsubscribeAll
 */
export const subscribeToAllQuotationsAndRfqs = (onData) => {
  const qQuotes = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
  const qRfqs = query(collection(db, 'rfqs'), orderBy('createdAt', 'desc'));

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

// ── Public Client Quotes (agency_rfqs) ────────────────────────────────────────

/**
 * Fetches an agency RFQ for public client viewing.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
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

/**
 * Updates status of an agency RFQ (e.g. APPROVED_BY_CLIENT, REJECTED).
 * @param {string} id
 * @param {string} status
 * @returns {Promise<void>}
 */
export const updateAgencyRFQStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, 'agency_rfqs', id), { status, updatedAt: serverTimestamp() });
    logger.info('[quotationRepository] Agency RFQ status updated', { id, status });
  } catch (err) {
    logger.error('[quotationRepository] updateAgencyRFQStatus failed', { id, error: err.message });
    throw err;
  }
};

// ── Public Supplier Quotes (purchase_rfqs) ───────────────────────────────────

/**
 * Fetches a purchase RFQ for public supplier viewing.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
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

/**
 * Updates a purchase RFQ with supplier pricing or shipping data.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<void>}
 */
export const updatePurchaseRFQ = async (id, updates) => {
  try {
    await updateDoc(doc(db, 'purchase_rfqs', id), { ...updates, updatedAt: serverTimestamp() });
    logger.info('[quotationRepository] Purchase RFQ updated', { id });
  } catch (err) {
    logger.error('[quotationRepository] updatePurchaseRFQ failed', { id, error: err.message });
    throw err;
  }
};

// ── B2B Supplier PO View (purchaseOrders) ────────────────────────────────────

/**
 * Fetches a PO for B2B supplier view.
 * @param {string} poId
 * @returns {Promise<object|null>}
 */
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

/**
 * Updates a PO with supplier billing details.
 * @param {string} poId
 * @param {object} billInfo
 * @returns {Promise<void>}
 */
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

// ── B2B Client Quote View (b2b_quotations) ───────────────────────────────────

/**
 * Fetches a B2B client quote by ID.
 * @param {string} quoteId
 * @returns {Promise<object|null>}
 */
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

/**
 * Updates status of a B2B client quote (e.g. Accepted, Rejected).
 * @param {string} quoteId
 * @param {string} status
 * @returns {Promise<void>}
 */
export const updateB2BClientQuoteStatus = async (quoteId, status) => {
  try {
    await updateDoc(doc(db, 'b2b_quotations', quoteId), { status, updatedAt: serverTimestamp() });
    logger.info('[quotationRepository] B2B Quote status updated', { quoteId, status });
  } catch (err) {
    logger.error('[quotationRepository] updateB2BClientQuoteStatus failed', { quoteId, error: err.message });
    throw err;
  }
};

// ── Supplier Quotations (supplier_quotations) ─────────────────────────────────

/**
 * Fetches a supplier quotation by ID.
 * @param {string} quotationId
 * @returns {Promise<object|null>}
 */
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

/**
 * Updates status of a supplier quotation.
 * @param {string} quotationId
 * @param {object} updates
 * @returns {Promise<void>}
 */
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

/**
 * Extends the expiry date of a quotation.
 * @param {string} quotationId
 * @param {number} days
 * @returns {Promise<void>}
 */
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



