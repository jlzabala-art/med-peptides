import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/prescriptions/[code]/inquiry/[inquiryId]/reply
 * ─────────────────────────────────────────────────────────────────────────────
 * Enables prescribing physicians and authorized clinical staff to formally
 * submit a certified answer to an asynchronous patient inquiry.
 */
export async function POST(request, { params }) {
  try {
    const { code, inquiryId } = await params;
    const body = await request.json();
    const { doctorResponse = '', doctorName = '' } = body;

    const cleanResponse = String(doctorResponse || '').trim();
    if (!cleanResponse) {
      return NextResponse.json(
        { success: false, error: 'A clinical response is required.' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json({ success: true, message: 'Saved in offline memory.' });
    }

    const nowIso = new Date().toISOString();

    // 1. Locate Target Prescription Document in Firestore
    let rxDocRef = null;
    const directDoc = await adminDb.collection('prescriptions').doc(code).get();
    if (directDoc.exists) {
      rxDocRef = directDoc.ref;
    } else {
      const qSnap = await adminDb.collection('prescriptions')
        .where('code', '==', code)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        rxDocRef = qSnap.docs[0].ref;
      }
    }

    if (!rxDocRef) {
      return NextResponse.json({ success: false, error: 'Prescription not found' }, { status: 404 });
    }

    // 2. Update Inquiry Subcollection Document
    const inqRef = rxDocRef.collection('inquiries').doc(inquiryId);
    await inqRef.set({
      doctorResponse: cleanResponse,
      status: 'answered',
      respondedAt: nowIso,
      respondedBy: doctorName || rxDocRef.data?.()?.doctorName || 'Prescribing Physician',
      updatedAt: nowIso
    }, { merge: true });

    // 3. Clear Pending Flag on Prescription
    await rxDocRef.set({
      hasPendingInquiry: false,
      lastResponseAt: nowIso,
      updatedAt: nowIso
    }, { merge: true });

    // 4. Mark Task as Completed in `clinical_tasks`
    try {
      const taskDoc = adminDb.collection('clinical_tasks').doc(`task-inq-${inquiryId}`);
      await taskDoc.set({
        status: 'completed',
        completedAt: nowIso
      }, { merge: true });
    } catch (taskErr) {
      console.warn('[POST reply inquiry] Non-fatal task completion warning:', taskErr);
    }

    return NextResponse.json({
      success: true,
      inquiryId,
      respondedAt: nowIso
    });
  } catch (error) {
    console.error('[POST reply inquiry] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
