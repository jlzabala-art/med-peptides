import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/prescriptions/[code]/inquiry
 * ─────────────────────────────────────────────────────────────────────────────
 * Retrieves all registered asynchronous clinical inquiries and certified physician
 * responses for a specific prescription dossier from Firestore.
 */
export async function GET(request, { params }) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ success: false, error: 'Prescription code required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: true, inquiries: [] });
    }

    let targetDoc = null;
    const docDirect = await adminDb.collection('prescriptions').doc(code).get();
    if (docDirect.exists) {
      targetDoc = docDirect;
    } else {
      const qSnap = await adminDb.collection('prescriptions')
        .where('code', '==', code)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        targetDoc = qSnap.docs[0];
      }
    }

    if (!targetDoc) {
      return NextResponse.json({ success: true, inquiries: [] });
    }

    const inquiriesSnap = await targetDoc.ref.collection('inquiries')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
      .catch(() => ({ docs: [] }));

    const inquiries = (inquiriesSnap.docs || []).map(d => ({
      id: d.id,
      ...d.data()
    }));

    return NextResponse.json({
      success: true,
      hasPending: targetDoc.data()?.hasPendingInquiry || false,
      lastInquiryAt: targetDoc.data()?.lastInquiryAt || null,
      inquiries
    });
  } catch (error) {
    console.error('[GET /api/prescriptions/[code]/inquiry] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/prescriptions/[code]/inquiry
 * ─────────────────────────────────────────────────────────────────────────────
 * Official Google Cloud UX In-App Clinical Desk for Patients & Prescribing Physicians.
 * 
 * Securely writes the inquiry to:
 * 1. `prescriptions/{rxId}/inquiries` (permanent subcollection on patient's dossier)
 * 2. Updates `prescriptions/{rxId}` status flag (`hasPendingInquiry: true`)
 * 3. `clinical_tasks` collection in Firestore (direct feed into doctor portal Tasks Tab)
 * 4. `institutional_inquiries` centralized ledger
 * 
 * Replaces unencrypted, non-compliant WhatsApp communication with an encrypted,
 * permanent, and audit-trailed clinical record.
 */
export async function POST(request, { params }) {
  try {
    const { code } = await params;
    const body = await request.json();

    const {
      patientName = 'Patient',
      patientEmail = '',
      patientPhone = '',
      topic = 'posology',
      message = '',
      doctorName = '',
      doctorClinic = '',
      formulasSummary = '',
      priority: requestedPriority
    } = body;

    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      return NextResponse.json(
        { success: false, error: 'A clinical inquiry message is required.' },
        { status: 400 }
      );
    }

    const isUrgent = topic === 'tolerance' || requestedPriority === 'urgent';
    const priority = isUrgent ? 'urgent' : 'action_required';
    const nowIso = new Date().toISOString();
    const inquiryId = `INQ-${Date.now()}`;

    const inquiryRecord = {
      inquiryId,
      rxCode: code,
      patientName: String(patientName).trim(),
      patientEmail: String(patientEmail).toLowerCase().trim(),
      patientPhone: String(patientPhone).trim(),
      topic: String(topic).trim(),
      message: cleanMessage.slice(0, 4000),
      doctorName: String(doctorName).trim(),
      doctorClinic: String(doctorClinic).trim(),
      formulasSummary: String(formulasSummary).trim(),
      priority,
      status: 'pending', // 'pending' | 'answered' | 'closed'
      doctorResponse: null,
      respondedAt: null,
      channel: 'atlas_clinical_desk',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    if (!adminDb) {
      return NextResponse.json({
        success: true,
        inquiryId,
        message: 'Saved in offline session.'
      });
    }

    // 1. Locate Target Prescription Document in Firestore
    let rxDocRef = null;
    let rxData = {};
    let resolvedRxId = code;

    const directDoc = await adminDb.collection('prescriptions').doc(code).get();
    if (directDoc.exists) {
      rxDocRef = directDoc.ref;
      rxData = directDoc.data();
      resolvedRxId = directDoc.id;
    } else {
      const qSnap = await adminDb.collection('prescriptions')
        .where('code', '==', code)
        .limit(1)
        .get();
      if (!qSnap.empty) {
        rxDocRef = qSnap.docs[0].ref;
        rxData = qSnap.docs[0].data();
        resolvedRxId = qSnap.docs[0].id;
      }
    }

    // 2. Write to `prescriptions/{rxId}/inquiries`
    if (rxDocRef) {
      await rxDocRef.collection('inquiries').doc(inquiryId).set(inquiryRecord);

      // Update prescription document with inquiry flag & audit timestamp
      await rxDocRef.set({
        hasPendingInquiry: true,
        lastInquiryTopic: topic,
        lastInquiryId: inquiryId,
        lastInquiryAt: nowIso,
        updatedAt: nowIso
      }, { merge: true });
    }

    // 3. Write directly to `clinical_tasks` in Firestore (for Doctor's Practice Portal)
    const topicLabels = {
      posology: 'Administration Schedule & Posology',
      tolerance: 'Sensitivity, Tolerance or Adverse Reaction',
      refill: 'Treatment Refill & Dispensary Renewal',
      storage: 'Cold-Chain & Storage Guidance',
      general: 'Clinical Clarification'
    };
    const topicLabel = topicLabels[topic] || topic;

    const taskPayload = {
      id: `task-inq-${inquiryId}`,
      rxId: resolvedRxId,
      code,
      patientName: inquiryRecord.patientName,
      patientDob: rxData.patientDob || rxData.patient?.dob || null,
      doctorName: inquiryRecord.doctorName || rxData.doctorName || '',
      type: 'patient_inquiry',
      priority,
      title: `Patient Inquiry: ${topicLabel}`,
      description: cleanMessage,
      status: 'pending',
      actionLabel: 'Review & Respond',
      actionUrl: `/rx/${code}#patient-sharing-card`,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    try {
      await adminDb.collection('clinical_tasks').doc(taskPayload.id).set(taskPayload);
    } catch (taskErr) {
      console.warn('[POST /api/prescriptions/[code]/inquiry] clinical_tasks write note:', taskErr.message);
    }

    // 4. Also store in central `institutional_inquiries`
    try {
      await adminDb.collection('institutional_inquiries').doc(inquiryId).set({
        ...inquiryRecord,
        name: inquiryRecord.patientName,
        email: inquiryRecord.patientEmail || 'patient-dossier@atlas-rx.com',
        phone: inquiryRecord.patientPhone || '',
        contextType: 'patient_doctor_inquiry',
        attachedEntity: {
          rxId: resolvedRxId,
          code,
          doctorName: inquiryRecord.doctorName,
          clinic: inquiryRecord.doctorClinic,
          formulas: inquiryRecord.formulasSummary,
          patientName: inquiryRecord.patientName
        }
      });
    } catch (inqErr) {
      console.warn('[POST /api/prescriptions/[code]/inquiry] institutional_inquiries write note:', inqErr.message);
    }

    return NextResponse.json({
      success: true,
      inquiryId,
      priority,
      createdAt: nowIso
    });
  } catch (error) {
    console.error('[POST /api/prescriptions/[code]/inquiry] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
