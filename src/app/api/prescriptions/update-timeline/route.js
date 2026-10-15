import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { invalidateRxCache } from '@/app/rx/[code]/page';
import { invalidateDoctorCache } from '@/lib/doctorCache';

export const dynamic = 'force-dynamic';

/**
 * POST /api/prescriptions/update-timeline
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates treatment start date and duration in Firestore and invalidates caches.
 * Conforms to Golden Rule #2 (Firestore single source of truth).
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { prescriptionId, prescriptionNumber, startDate, durationDays, endDate, reason, updatedBy } = body;

    if (!prescriptionId && !prescriptionNumber) {
      return NextResponse.json(
        { success: false, error: 'prescriptionId or prescriptionNumber is required' },
        { status: 400 }
      );
    }

    if (!startDate && !durationDays) {
      return NextResponse.json(
        { success: false, error: 'startDate or durationDays is required' },
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
        { success: false, error: 'Prescription document not found' },
        { status: 404 }
      );
    }

    const existingData = docSnap.data() || {};
    const parsedDays = durationDays ? Number(durationDays) : (existingData.durationDays || 30);
    const parsedWeeks = Math.round(parsedDays / 7);

    // Calculate end date if not provided
    let finalEndDate = endDate;
    if (!finalEndDate && startDate) {
      const s = new Date(startDate);
      if (!isNaN(s.getTime())) {
        const e = new Date(s.getTime() + parsedDays * 24 * 60 * 60 * 1000);
        finalEndDate = e.toISOString().split('T')[0];
      }
    }

    const updates = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (startDate) {
      updates.startDate = startDate;
      updates.treatmentStartDate = startDate;
    }

    if (durationDays) {
      updates.durationDays = parsedDays;
      updates.durationWeeks = parsedWeeks;
      updates.duration = `${parsedDays} Days (${parsedWeeks} Weeks)`;
      updates.treatmentDuration = `${parsedDays} Days`;
    }

    if (finalEndDate) {
      updates.endDate = finalEndDate;
      updates.treatmentEndDate = finalEndDate;
    }

    // Record audit trail
    const auditEntry = {
      action: 'timeline_updated',
      previousStartDate: existingData.startDate || existingData.createdAt || null,
      newStartDate: startDate || existingData.startDate,
      previousDurationDays: existingData.durationDays || null,
      newDurationDays: parsedDays,
      timestamp: new Date().toISOString(),
      reason: reason || 'Physician updated treatment start date / duration via portal',
      updatedBy: updatedBy || 'Treating Physician'
    };

    updates.clinicalHistory = FieldValue.arrayUnion(auditEntry);

    await docRef.update(updates);

    // Invalidate caches
    try {
      const code = existingData.prescriptionNumber || existingData.prescriptionCode || docRef.id;
      invalidateRxCache(code);
      const doctorId = existingData.doctorId || existingData.treatingDoctor?.id;
      if (doctorId) invalidateDoctorCache(doctorId);
      invalidateDoctorCache();
    } catch (cErr) {
      console.warn('Cache invalidation warning:', cErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Treatment timeline updated successfully',
      updated: {
        id: docRef.id,
        startDate: startDate || existingData.startDate,
        durationDays: parsedDays,
        durationWeeks: parsedWeeks,
        duration: updates.duration,
        endDate: finalEndDate
      }
    });
  } catch (error) {
    console.error('Error updating prescription timeline:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
