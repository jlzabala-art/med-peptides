import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { invalidateRxCache } from '@/app/rx/[code]/page';
import { invalidateDoctorCache } from '@/lib/doctorCache';

export const PRE_DISPENSED_STATUSES = [
  'draft',
  'pending',
  'prescribed',
  'approved',
  'awaiting payment',
  'processing'
];

export const DISPENSED_STATUSES = [
  'dispensed',
  'delivered',
  'completed',
  'active'
];

export const ALL_VALID_STATUSES = [
  ...PRE_DISPENSED_STATUSES,
  ...DISPENSED_STATUSES
];

/**
 * POST /api/prescriptions/update-status
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates the clinical lifecycle status of a prescription directly in Firestore.
 * Conforms to Golden Rule #2 (Firestore single source of truth) and Golden Rule #28 (Taxonomy).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { prescriptionId, prescriptionNumber, status, newStatus, reason, updatedBy } = body;

    const targetStatusRaw = newStatus || status;
    if (!targetStatusRaw) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const normalizedStatus = String(targetStatusRaw).toLowerCase().trim();

    if (!ALL_VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        { 
          error: `Invalid status "${targetStatusRaw}". Allowed statuses are: ${ALL_VALID_STATUSES.join(', ')}`,
          allowedStatuses: ALL_VALID_STATUSES
        },
        { status: 400 }
      );
    }

    if (!prescriptionId && !prescriptionNumber) {
      return NextResponse.json(
        { error: 'prescriptionId or prescriptionNumber is required' },
        { status: 400 }
      );
    }

    // Locate document in Firestore
    let docRef = null;
    let docSnap = null;

    if (prescriptionId) {
      docRef = adminDb.collection('prescriptions').doc(prescriptionId);
      docSnap = await docRef.get();
    }

    if ((!docSnap || !docSnap.exists) && prescriptionNumber) {
      const qSnap = await adminDb.collection('prescriptions')
        .where('prescriptionNumber', '==', prescriptionNumber)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        docRef = qSnap.docs[0].ref;
        docSnap = qSnap.docs[0];
      }
    }

    if ((!docSnap || !docSnap.exists) && prescriptionId) {
      // Try uppercase / trimmed search
      const qSnap = await adminDb.collection('prescriptions')
        .where('prescriptionCode', '==', prescriptionId)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        docRef = qSnap.docs[0].ref;
        docSnap = qSnap.docs[0];
      }
    }

    if (!docSnap || !docSnap.exists) {
      return NextResponse.json(
        { error: 'Prescription document not found' },
        { status: 404 }
      );
    }

    const existingData = docSnap.data() || {};
    const previousStatus = existingData.status || existingData.state || 'draft';
    const isNowDispensed = DISPENSED_STATUSES.includes(normalizedStatus);

    const historyEntry = {
      from: previousStatus,
      to: normalizedStatus,
      timestamp: new Date().toISOString(),
      reason: reason || 'Manual clinical status quick-action update',
      updatedBy: updatedBy || 'Treating Physician / Clinic Administrator'
    };

    const updatePayload = {
      status: normalizedStatus,
      state: normalizedStatus,
      orderStatus: normalizedStatus,
      fagronStatus: normalizedStatus,
      isDispensed: isNowDispensed,
      updatedAt: new Date().toISOString(),
      statusHistory: FieldValue.arrayUnion(historyEntry)
    };

    if (isNowDispensed && !existingData.dispensedAt) {
      updatePayload.dispensedAt = new Date().toISOString();
    }

    await docRef.update(updatePayload);

    // Invalidate Layer 1 in-memory server cache
    try {
      if (typeof invalidateRxCache === 'function') {
        invalidateRxCache(docRef.id);
        if (prescriptionNumber) invalidateRxCache(prescriptionNumber);
        if (existingData.prescriptionNumber) invalidateRxCache(existingData.prescriptionNumber);
        if (existingData.boxId) invalidateRxCache(existingData.boxId);
      }
      if (typeof invalidateDoctorCache === 'function') {
        invalidateDoctorCache();
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      id: docRef.id,
      prescriptionNumber: existingData.prescriptionNumber || prescriptionNumber || docRef.id,
      previousStatus,
      newStatus: normalizedStatus,
      isDispensed: isNowDispensed,
      message: `Prescription status successfully updated to "${normalizedStatus}"`
    });
  } catch (error) {
    console.error('[update-status] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
