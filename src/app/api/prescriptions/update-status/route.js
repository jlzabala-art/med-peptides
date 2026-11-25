import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { invalidateRxCache } from '@/app/rx/[code]/page';
import { invalidateDoctorCache } from '@/lib/doctorCache';
import { canEnterProduction, resolvePrescriptionAxes } from '@/utils/prescriptions/statusWorkflow';
import { syncPrescriptionToAlgolia } from '@/services/algoliaSyncService';

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
  'active',
  'en tránsito',
  'cancelled'
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
    const { prescriptionId, prescriptionNumber, code, status, newStatus, reason, updatedBy } = body;
    const resolvedPrescriptionNumber = prescriptionNumber || code;

    const isToleranceAction = Boolean(body.toleranceCheckCompleted || body.toleranceChecked || body.taskType === 'tolerance_check');
    const isPatientGuideShareAction = Boolean(body.markPatientGuideShared);
    const targetStatusRaw = newStatus || status || ((isToleranceAction || isPatientGuideShareAction) ? 'current' : null);
    if (!targetStatusRaw && !isToleranceAction && !isPatientGuideShareAction) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const normalizedStatus = String(targetStatusRaw).toLowerCase().trim();

    if (normalizedStatus !== 'current' && !ALL_VALID_STATUSES.includes(normalizedStatus)) {
      return NextResponse.json(
        { 
          error: `Invalid status "${targetStatusRaw}". Allowed statuses are: ${ALL_VALID_STATUSES.join(', ')}`,
          allowedStatuses: ALL_VALID_STATUSES
        },
        { status: 400 }
      );
    }

    if (!prescriptionId && !resolvedPrescriptionNumber) {
      return NextResponse.json(
        { error: 'prescriptionId or prescriptionNumber is required' },
        { status: 400 }
      );
    }

    // Locate document in Firestore with resilient identifiers
    let docRef = null;
    let docSnap = null;

    const rawId = prescriptionId || resolvedPrescriptionNumber;
    const cleanId = String(rawId || '').replace(/^#/, '').trim();
    const noRxId = cleanId.replace(/^RX-/i, '').trim();
    const withRxId = noRxId.startsWith('RX-') ? noRxId : `RX-${noRxId}`;

    // 1. Direct document ID lookups
    const idCandidates = [prescriptionId, cleanId, noRxId, withRxId].filter(Boolean);
    for (const cand of idCandidates) {
      const snap = await adminDb.collection('prescriptions').doc(cand).get();
      if (snap.exists) {
        docRef = snap.ref;
        docSnap = snap;
        break;
      }
    }

    // 2. Query lookups across prescriptionNumber, code, and fileNumber
    if (!docSnap || !docSnap.exists) {
      const queryValues = [cleanId, noRxId, withRxId, resolvedPrescriptionNumber, prescriptionId].filter(Boolean);
      for (const val of queryValues) {
        // Match prescriptionNumber
        let qSnap = await adminDb.collection('prescriptions')
          .where('prescriptionNumber', '==', val)
          .limit(1)
          .get();
        if (!qSnap.empty) {
          docRef = qSnap.docs[0].ref;
          docSnap = qSnap.docs[0];
          break;
        }

        // Match code
        qSnap = await adminDb.collection('prescriptions')
          .where('code', '==', val)
          .limit(1)
          .get();
        if (!qSnap.empty) {
          docRef = qSnap.docs[0].ref;
          docSnap = qSnap.docs[0];
          break;
        }

        // Match fileNumber
        qSnap = await adminDb.collection('prescriptions')
          .where('fileNumber', '==', val)
          .limit(1)
          .get();
        if (!qSnap.empty) {
          docRef = qSnap.docs[0].ref;
          docSnap = qSnap.docs[0];
          break;
        }
      }
    }

    if (!docSnap || !docSnap.exists) {
      return NextResponse.json(
        { error: 'Prescription document not found' },
        { status: 404 }
      );
    }

    const existingData = docSnap.data() || {};
    const prevAxes = resolvePrescriptionAxes(existingData);
    const incomingAxes = body.axes && typeof body.axes === 'object' ? body.axes : {};

    const nextAxes = {
      clinicalStatus: incomingAxes.clinicalStatus || prevAxes.clinicalStatus,
      paymentStatus: incomingAxes.paymentStatus || prevAxes.paymentStatus,
      productionStatus: incomingAxes.productionStatus || prevAxes.productionStatus,
      labelStatus: incomingAxes.labelStatus || prevAxes.labelStatus,
      logisticsStatus: incomingAxes.logisticsStatus || prevAxes.logisticsStatus,
    };

    const previousStatus = existingData.status || existingData.state || 'draft';
    const finalStatus = (normalizedStatus && normalizedStatus !== 'current') ? normalizedStatus : previousStatus;

    // Server-side business rule: nothing enters production without clinical approval + payment clearance
    const wantsProduction =
      ['queued', 'processing', 'qc_passed'].includes(String(nextAxes.productionStatus || '').toLowerCase()) ||
      finalStatus === 'processing';
    if (wantsProduction && !canEnterProduction({ clinicalStatus: nextAxes.clinicalStatus, paymentStatus: nextAxes.paymentStatus })) {
      return NextResponse.json(
        {
          error: 'Production blocked: prescription must be clinically approved and paid (or authorized B2B) before compounding.',
        },
        { status: 400 }
      );
    }

    const isNowDispensed = DISPENSED_STATUSES.includes(finalStatus) || nextAxes.logisticsStatus === 'delivered';

    const historyEntry = {
      from: previousStatus,
      to: finalStatus,
      axes: nextAxes,
      timestamp: new Date().toISOString(),
      reason: reason || (isToleranceAction ? 'Clinical tolerance check-in verified & completed' : 'Manual clinical status quick-action update'),
      updatedBy: updatedBy || 'Treating Physician / Clinic Administrator'
    };

    const updatePayload = {
      status: finalStatus,
      state: finalStatus,
      orderStatus: finalStatus,
      fagronStatus: finalStatus,
      clinicalStatus: nextAxes.clinicalStatus,
      paymentStatus: nextAxes.paymentStatus,
      productionStatus: nextAxes.productionStatus,
      labelStatus: nextAxes.labelStatus,
      logisticsStatus: nextAxes.logisticsStatus,
      isDispensed: isNowDispensed,
      updatedAt: new Date().toISOString(),
      statusHistory: FieldValue.arrayUnion(historyEntry)
    };

    if (isToleranceAction) {
      updatePayload.toleranceCheckCompleted = true;
      updatePayload.toleranceCheckedAt = new Date().toISOString();
      updatePayload.toleranceCheckedBy = updatedBy || 'Treating Physician';
    }

    if (isPatientGuideShareAction) {
      updatePayload.patientGuideSharedAt = new Date().toISOString();
      if (body.patientPhone) {
        updatePayload.patientPhone = String(body.patientPhone).trim();
      }
    }

    if (['approved', 'ordered', 'active', 'delivered', 'completed', 'dispensed'].includes(finalStatus)) {
      updatePayload.isTreatmentProposal = false;
      updatePayload.orderStatus = isNowDispensed ? 'Delivered' : 'Ordered';
    }

    if (finalStatus === 'approved') {
      updatePayload.isSigned = true;
      updatePayload.signedAt = new Date().toISOString();
      updatePayload.signedBy = updatedBy || 'Treating Physician';
      updatePayload.approvalStatus = 'approved';
      updatePayload.doctorApproval = {
        approved: true,
        approvedAt: new Date().toISOString(),
        approvedBy: updatedBy || 'Treating Physician',
        source: 'clinical_label_desk'
      };
    }

    if (body.invoiceRef) {
      updatePayload.invoiceRef = String(body.invoiceRef).trim();
    }

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
        if (existingData.doctorId) invalidateDoctorCache(existingData.doctorId);
        if (existingData.doctorSlug) invalidateDoctorCache(existingData.doctorSlug);
        if (existingData.treatingDoctor?.id) invalidateDoctorCache(existingData.treatingDoctor.id);
        if (existingData.treatingDoctor?.name) invalidateDoctorCache(existingData.treatingDoctor.name);
        if (existingData.doctorName) invalidateDoctorCache(existingData.doctorName);
      }
    } catch (cacheErr) {
      console.warn('[update-status] Cache invalidation notice:', cacheErr?.message);
    }

    try {
      syncPrescriptionToAlgolia(docRef.id, {
        ...existingData,
        ...updatePayload,
        id: docRef.id,
      }).catch((err) => {
        console.warn('[update-status] Algolia sync non-fatal warning:', err.message);
      });
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      success: true,
      id: docRef.id,
      prescriptionNumber: existingData.prescriptionNumber || prescriptionNumber || docRef.id,
      previousStatus,
      newStatus: finalStatus,
      isDispensed: isNowDispensed,
      toleranceCheckCompleted: isToleranceAction ? true : existingData.toleranceCheckCompleted,
      message: isToleranceAction
        ? `Tolerance check successfully completed for prescription #${existingData.prescriptionNumber || prescriptionNumber || docRef.id}`
        : `Prescription status successfully updated to "${finalStatus}"`
    });
  } catch (error) {
    console.error('[update-status] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
