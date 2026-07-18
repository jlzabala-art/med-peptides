"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { AggregateField } from 'firebase-admin/firestore';
import { unstable_cache } from 'next/cache';

// ─── Helper: serialize Firestore Timestamps ──────────────────────────────────
function serializeDoc(data) {
  const out = {};
  for (const key in data) {
    out[key] = data[key]?.toDate ? data[key].toDate().toISOString() : data[key];
  }
  return out;
}

// ─── ADMIN KPIs ──────────────────────────────────────────────────────────────
async function computeAdminKPIs() {
  if (!adminDb) return null;
  const [
    usersSnap,
    pendingApprovalsSnap,
    activeOrdersSnap,
    revenueSnap,
    openRFQsSnap,
    pendingRxSnap,
    bulkOrdersSnap,
    pendingBillsSnap,
  ] = await Promise.all([
    adminDb.collection('users').count().get(),
    adminDb.collection('users').where('approved', '==', false).count().get(),
    adminDb.collection('orders').where('status', 'in', ['pending', 'processing', 'shipped']).count().get(),
    adminDb.collection('orders').where('status', '!=', 'cancelled').aggregate({ total: AggregateField.sum('total') }).get(),
    adminDb.collection('purchase_rfqs').where('status', 'in', ['open', 'pending', 'draft']).count().get(),
    adminDb.collection('prescriptions').where('status', 'in', ['draft', 'pending', 'review_required']).count().get(),
    adminDb.collection('bulk_orders').where('status', 'in', ['submitted', 'pending']).count().get(),
    adminDb.collection('bills').where('status', '==', 'pending').count().get(),
  ]);

  return {
    role: 'admin',
    totalUsers: usersSnap.data().count,
    pendingApprovals: pendingApprovalsSnap.data().count,
    activeOrders: activeOrdersSnap.data().count,
    totalRevenue: revenueSnap.data().total || 0,
    openRFQs: openRFQsSnap.data().count,
    pendingPrescriptions: pendingRxSnap.data().count,
    pendingBulkOrders: bulkOrdersSnap.data().count,
    pendingBills: pendingBillsSnap.data().count,
  };
}

// ─── DOCTOR KPIs ─────────────────────────────────────────────────────────────
async function computeDoctorKPIs(doctorId) {
  if (!adminDb) return null;

  const baseRx = adminDb.collection('prescriptions').where('doctorId', '==', doctorId);
  const baseOrders = adminDb.collection('orders').where('doctorId', '==', doctorId);

  const [
    activePatientsSnap,
    pendingRxSnap,
    activeRxSnap,
    activeOrdersSnap,
    pendingFollowUpsSnap,
  ] = await Promise.all([
    adminDb.collection('users').where('assignedDoctorId', '==', doctorId).where('role', '==', 'patient').count().get(),
    baseRx.where('status', 'in', ['draft', 'pending', 'review_required']).count().get(),
    baseRx.where('status', '==', 'active').count().get(),
    baseOrders.where('status', 'in', ['pending', 'processing', 'shipped']).count().get(),
    adminDb.collection('consultations').where('doctorId', '==', doctorId).where('status', '==', 'pending').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
  ]);

  return {
    role: 'doctor',
    doctorId,
    activePatients: activePatientsSnap.data().count,
    pendingPrescriptions: pendingRxSnap.data().count,
    activePrescriptions: activeRxSnap.data().count,
    activeOrders: activeOrdersSnap.data().count,
    pendingFollowUps: pendingFollowUpsSnap.data().count,
  };
}

// ─── PATIENT KPIs ─────────────────────────────────────────────────────────────
async function computePatientKPIs(patientId) {
  if (!adminDb) return null;

  const [
    activeRxSnap,
    ordersSnap,
    pendingOrdersSnap,
    upcomingConsultSnap,
  ] = await Promise.all([
    adminDb.collection('prescriptions').where('patientId', '==', patientId).where('status', '==', 'active').count().get(),
    adminDb.collection('orders').where('paymentOwnerId', '==', patientId).count().get(),
    adminDb.collection('orders').where('paymentOwnerId', '==', patientId).where('status', 'in', ['pending', 'processing', 'shipped']).count().get(),
    adminDb.collection('consultations').where('patientId', '==', patientId).where('status', '==', 'scheduled').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
  ]);

  return {
    role: 'patient',
    patientId,
    activePrescriptions: activeRxSnap.data().count,
    totalOrders: ordersSnap.data().count,
    pendingOrders: pendingOrdersSnap.data().count,
    upcomingConsultations: upcomingConsultSnap.data().count,
  };
}

// ─── WHOLESALER KPIs ─────────────────────────────────────────────────────────
async function computeWholesalerKPIs(wholesalerId) {
  if (!adminDb) return null;

  const [
    bulkOrdersSnap,
    pendingBulkSnap,
    deliveredBulkSnap,
    revenueSnap,
    clientsSnap,
  ] = await Promise.all([
    adminDb.collection('bulk_orders').where('wholesalerId', '==', wholesalerId).count().get(),
    adminDb.collection('bulk_orders').where('wholesalerId', '==', wholesalerId).where('status', 'in', ['submitted', 'pending', 'confirmed']).count().get(),
    adminDb.collection('bulk_orders').where('wholesalerId', '==', wholesalerId).where('status', '==', 'delivered').count().get(),
    adminDb.collection('bulk_orders').where('wholesalerId', '==', wholesalerId)
      .aggregate({ total: AggregateField.sum('totalAmount') }).get().catch(() => ({ data: () => ({ total: 0 }) })),
    adminDb.collection('users').where('wholesalerId', '==', wholesalerId).where('role', '==', 'patient').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
  ]);

  return {
    role: 'wholesaler',
    wholesalerId,
    totalBulkOrders: bulkOrdersSnap.data().count,
    pendingBulkOrders: pendingBulkSnap.data().count,
    deliveredOrders: deliveredBulkSnap.data().count,
    totalRevenue: revenueSnap.data().total || 0,
    managedClients: clientsSnap.data().count,
  };
}

// ─── Public API: fetchKPIsAction ─────────────────────────────────────────────
/**
 * Main entry point. Called from Server Components per role.
 * @param {'admin'|'doctor'|'patient'|'wholesaler'} role
 * @param {string} [userId] - Required for non-admin roles
 */
export async function fetchKPIsAction(role, userId = null) {
  try {
    switch (role) {
      case 'admin':
        return await unstable_cache(
          () => computeAdminKPIs(),
          ['kpis-admin'],
          { revalidate: 60, tags: ['kpis-admin'] }
        )();
      case 'doctor':
        if (!userId) return null;
        return await unstable_cache(
          () => computeDoctorKPIs(userId),
          [`kpis-doctor-${userId}`],
          { revalidate: 120, tags: ['kpis-doctor', `kpis-doctor-${userId}`] }
        )();
      case 'patient':
        if (!userId) return null;
        return await unstable_cache(
          () => computePatientKPIs(userId),
          [`kpis-patient-${userId}`],
          { revalidate: 300, tags: ['kpis-patient', `kpis-patient-${userId}`] }
        )();
      case 'wholesaler':
        if (!userId) return null;
        return await unstable_cache(
          () => computeWholesalerKPIs(userId),
          [`kpis-wholesaler-${userId}`],
          { revalidate: 120, tags: ['kpis-wholesaler', `kpis-wholesaler-${userId}`] }
        )();
      default:
        return null;
    }
  } catch (error) {
    console.error(`fetchKPIsAction [${role}] error:`, error);
    return null;
  }
}
