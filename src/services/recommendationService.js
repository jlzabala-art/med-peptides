 
/**
 * recommendationService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * B2B Portal — Phase 3: Recommendation System
 *
 * Doctors (and admins) create recommendations for their assigned patients.
 * Patients can view, accept, or reject them.
 * Accepted recommendations can seed the patient's cart directly.
 *
 * Collection schema:
 *   /recommendations/{recId}
 *     patientId       string   — UID of the target patient
 *     doctorId        string   — UID of the creating doctor
 *     createdBy       string   — UID (may equal doctorId or be an admin UID)
 *     createdByRole   string   — 'doctor' | 'admin'
 *     type            string   — 'product' | 'protocol' | 'mixed'
 *     products        Array    — [{ id, slug, name, dosage, qty, notes }]
 *     protocols       Array    — [{ id, slug, name, notes }]
 *     clinicalNotes   string   — free-text clinical rationale
 *     status          string   — 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
 *     patientResponse string   — optional patient note on accept/reject
 *     createdAt       string   — ISO timestamp
 *     updatedAt       string   — ISO timestamp
 *     expiresAt       string?  — ISO timestamp (optional TTL)
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { logAction } from './auditLogger.js';

const RECS_COL = 'recommendations';

function now() {
  return new Date().toISOString();
}

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Create a new recommendation.
 * Only doctors and admins can call this.
 *
 * @param {{
 *   patientId: string,
 *   doctorId: string,
 *   createdBy: string,
 *   createdByRole: 'doctor' | 'admin',
 *   products?: Array,
 *   protocols?: Array,
 *   clinicalNotes?: string,
 *   status?: 'draft' | 'sent',
 *   expiresAt?: string,
 * }} params
 * @returns {Promise<string>} — New document ID
 */
export async function createRecommendation({
  patientId,
  doctorId,
  createdBy,
  createdByRole,
  products = [],
  protocols = [],
  clinicalNotes = '',
  status = 'sent',
  expiresAt = null,
}) {
  if (!patientId || !doctorId || !createdBy || !createdByRole) {
    throw new Error('[recommendationService] Missing required fields.');
  }

  // Derive type
  let type = 'mixed';
  if (products.length > 0 && protocols.length === 0) type = 'product';
  if (protocols.length > 0 && products.length === 0) type = 'protocol';

  const rec = {
    patientId,
    doctorId,
    createdBy,
    createdByRole,
    type,
    products,
    protocols,
    clinicalNotes,
    status,
    patientResponse: '',
    createdAt: now(),
    updatedAt: now(),
    expiresAt,
  };

  const ref = await addDoc(collection(db, RECS_COL), rec);
  await logAction(createdBy, createdByRole, 'RECOMMENDATION_SEND', ref.id, {
    patientId,
    doctorId,
    type,
  });
  return ref.id;
}

// ── Update (Doctor/Admin) ─────────────────────────────────────────────────────

/**
 * Update the contents or status of a recommendation.
 * Typically used by doctors to update draft → sent.
 */
export async function updateRecommendation(recId, updates) {
  const ref = doc(db, RECS_COL, recId);
  await updateDoc(ref, { ...updates, updatedAt: now() });
}

// ── Patient Response ──────────────────────────────────────────────────────────

/**
 * Patient accepts a recommendation.
 * Returns the recommendation data so the caller can seed the cart.
 *
 * @param {string} recId
 * @param {string} [patientResponse] — optional note from patient
 * @returns {Promise<Object>} — full recommendation data
 */
export async function acceptRecommendation(recId, patientResponse = '') {
  const ref = doc(db, RECS_COL, recId);
  await updateDoc(ref, {
    status: 'accepted',
    patientResponse,
    updatedAt: now(),
  });
  const snap = await getDoc(ref);
  const data = snap.data();
  if (data) {
    await logAction(data.patientId, 'patient', 'RECOMMENDATION_ACCEPT', recId, {
      doctorId: data.doctorId,
      type: data.type,
    });
  }
  return { id: snap.id, ...data };
}

/**
 * Patient rejects a recommendation.
 */
export async function rejectRecommendation(recId, patientResponse = '') {
  const ref = doc(db, RECS_COL, recId);
  await updateDoc(ref, {
    status: 'rejected',
    patientResponse,
    updatedAt: now(),
  });
  const snap = await getDoc(ref);
  const data = snap.data();
  if (data) {
    await logAction(data.patientId, 'patient', 'RECOMMENDATION_REJECT', recId, {
      doctorId: data.doctorId,
      type: data.type,
    });
  }
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Get all recommendations for a patient.
 * Optionally filter by status.
 */
export async function getRecommendationsForPatient(patientId, statusFilter = null) {
  let q = query(
    collection(db, RECS_COL),
    where('patientId', '==', patientId),
  );
  const snap = await getDocs(q);
  let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (statusFilter) results = results.filter(r => r.status === statusFilter);
  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Get all recommendations created by a doctor.
 * Optionally filter by patientId.
 */
export async function getRecommendationsByDoctor(doctorId, patientId = null) {
  let q = query(
    collection(db, RECS_COL),
    where('doctorId', '==', doctorId),
  );
  if (patientId) {
    q = query(
      collection(db, RECS_COL),
      where('doctorId', '==', doctorId),
      where('patientId', '==', patientId),
    );
  }
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Get a single recommendation by ID.
 */
export async function getRecommendation(recId) {
  const snap = await getDoc(doc(db, RECS_COL, recId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get all recommendations (admin view).
 */
export async function getAllRecommendations() {
  const snap = await getDocs(collection(db, RECS_COL));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ── Cart Seed Payload ─────────────────────────────────────────────────────────

/**
 * Convert an accepted recommendation into a cart-compatible payload.
 * Returns an array of { name, qty, price, dosage, source, recommendationId }.
 * Passes directly to App.jsx updateCart() as individual items.
 */
export function recommendationToCartItems(rec) {
  const items = [];

  (rec.products || []).forEach(p => {
    items.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      label: p.dosage ? `${p.name} (${p.dosage})` : p.name,
      dosage: p.dosage || '',
      qty: p.qty || 1,
      price: p.price || null,
      source: 'recommendation',
      recommendationId: rec.id,
    });
  });

  return items;
}
