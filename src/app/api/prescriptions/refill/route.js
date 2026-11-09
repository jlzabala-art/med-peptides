import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { syncPrescriptionToAlgolia } from '@/services/algoliaSyncService';
import { invalidateRxCache } from '@/lib/rxCache';

export const dynamic = 'force-dynamic';

/**
 * POST /api/prescriptions/refill
 * ─────────────────────────────────────────────────────────────────────────────
 * Clones an existing prescription into a NEW refill prescription cycle for the
 * same patient, supporting selective formula parts inclusion/omission.
 *
 * Payload:
 * {
 *   sourcePrescriptionId: string,
 *   selectedPartIndices?: number[], // e.g. [0] for Morning Cream only, [1] for Evening only
 *   refillCycle?: number,
 *   courseDurationDays?: number,
 *   nextRefillDate?: string, // YYYY-MM-DD
 *   operatorNotes?: string
 * }
 */
export async function POST(request) {
  if (!adminDb) {
    return NextResponse.json({ success: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      sourcePrescriptionId,
      selectedPartIndices = null,
      refillCycle = 2,
      courseDurationDays = 60,
      nextRefillDate = null,
      operatorNotes = ''
    } = body;

    if (!sourcePrescriptionId) {
      return NextResponse.json({ success: false, error: 'sourcePrescriptionId is required' }, { status: 400 });
    }

    // 1. Fetch original prescription
    let origDoc = await adminDb.collection('prescriptions').doc(sourcePrescriptionId).get();
    let origData = origDoc.exists ? origDoc.data() : null;

    if (!origData) {
      // Lookup by code or fileNumber
      const qSnap = await adminDb.collection('prescriptions')
        .where('code', '==', sourcePrescriptionId.replace(/^#/, ''))
        .limit(1)
        .get();
      if (!qSnap.empty) {
        origDoc = qSnap.docs[0];
        origData = origDoc.data();
      }
    }

    if (!origData) {
      return NextResponse.json({ success: false, error: `Original prescription "${sourcePrescriptionId}" not found` }, { status: 404 });
    }

    const origId = origDoc.id;
    const baseCode = (origData.code || origData.prescriptionCode || origData.fileNumber || origId.slice(0, 6)).replace(/^#/, '');
    const cleanBaseCode = baseCode.replace(/-R\d+$/i, ''); // Strip previous refill suffix if re-refilling

    // 2. Resolve new Refill Prescription Code (e.g. 52228-R1, 52228-R2)
    const newCode = `${cleanBaseCode}-R${refillCycle}`;

    // 3. Filter parts & prescription lines based on selectedPartIndices
    const origParts = Array.isArray(origData.parts) ? origData.parts : [];
    const origItems = Array.isArray(origData.items) ? origData.items : (Array.isArray(origData.prescriptionLines) ? origData.prescriptionLines : []);
    const origLabels = Array.isArray(origData.pharmacyLabels) ? origData.pharmacyLabels : [];

    let filteredParts = origParts;
    let filteredItems = origItems;
    let filteredLabels = origLabels;

    if (Array.isArray(selectedPartIndices) && selectedPartIndices.length > 0 && origParts.length > 0) {
      filteredParts = origParts.filter((_, idx) => selectedPartIndices.includes(idx));
      filteredLabels = origLabels.filter((_, idx) => selectedPartIndices.includes(idx));
      // If items correlate with parts
      if (origItems.length === origParts.length) {
        filteredItems = origItems.filter((_, idx) => selectedPartIndices.includes(idx));
      }
    }

    // 4. Calculate intelligent refill schedule & dates
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];

    const durationDays = Number(courseDurationDays) || 60;
    const exhaustionTime = new Date(today.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const exhaustionDateStr = exhaustionTime.toISOString().split('T')[0];

    // Default alert date: 15 days before exhaustion
    const alertTime = new Date(exhaustionTime.getTime() - 15 * 24 * 60 * 60 * 1000);
    const alertDateStr = alertTime.toISOString().split('T')[0];

    const confirmedNextRefillDate = nextRefillDate || alertDateStr;

    // 5. Construct new prescription document payload
    const newRxPayload = {
      ...origData,
      // Overwrite critical identifiers
      code: newCode,
      prescriptionCode: newCode,
      fileNumber: newCode,
      refillOf: origId,
      refillOfCode: baseCode,
      refillCycle: Number(refillCycle),
      isRefill: true,
      status: 'approved',
      approvalStatus: 'approved',
      date: todayIso,
      dateIssued: todayIso,
      treatmentStartDate: todayIso,
      courseDurationDays: durationDays,
      exhaustionDate: exhaustionDateStr,
      refillAlertDate: confirmedNextRefillDate,
      nextRefillDate: confirmedNextRefillDate,
      refillAlertStatus: 'scheduled',
      parts: filteredParts,
      items: filteredItems,
      pharmacyLabels: filteredLabels,
      operatorNotes: operatorNotes ? `${origData.operatorNotes || ''}\n[Refill ${todayIso}]: ${operatorNotes}`.trim() : (origData.operatorNotes || ''),
      refillCreatedAt: todayIso,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Remove internal id from payload before insertion
    delete newRxPayload.id;

    // 6. Write to Firestore `prescriptions` collection
    const newRxRef = await adminDb.collection('prescriptions').add(newRxPayload);
    const newRxId = newRxRef.id;

    // 7. Update original prescription tracking status
    await origDoc.ref.set({
      lastRefillId: newRxId,
      lastRefillCode: newCode,
      lastRefillDate: todayIso,
      totalRefillsIssued: (Number(origData.totalRefillsIssued) || 0) + 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 8. Invalidate server-side cache
    try {
      invalidateRxCache(origId);
      invalidateRxCache(newRxId);
    } catch { /* non-fatal */ }

    // 9. Sync to Algolia
    syncPrescriptionToAlgolia(newRxId, {
      ...newRxPayload,
      id: newRxId,
      objectID: newRxId
    }).catch(err => console.warn('[API Refill] Algolia sync non-fatal:', err.message));

    // 10. Emit Cross-Portal Notifications (Doctor & Patient)
    const patientName = origData.patient?.name || origData.patientName || 'Patient';
    const docName = origData.doctorName || 'Doctor';

    try {
      // Notification for Doctor
      await adminDb.collection('notifications').add({
        message: `🔄 Ciclo de Renovación #${newCode}: Nueva prescripción de reposición emitida para ${patientName}. Finalización prevista: ${exhaustionDateStr}.`,
        type: 'prescription_refill',
        prescriptionId: newRxId,
        prescriptionCode: newCode,
        patientName,
        doctorName: docName,
        targetRoles: ['doctor', 'admin'],
        link: `/labels?rx=${encodeURIComponent(newCode)}`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // Notification for Patient
      if (origData.patientId) {
        await adminDb.collection('notifications').add({
          message: `Tu reposición médica #${newCode} ha sido preparada por Atlas Health. Próxima fecha de revisión: ${confirmedNextRefillDate}.`,
          type: 'patient_prescription_refill',
          prescriptionId: newRxId,
          prescriptionCode: newCode,
          patientId: origData.patientId,
          patientName,
          targetRoles: ['patient'],
          link: `/patient`,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (notifErr) {
      console.warn('[API Refill] Notification dispatch warning:', notifErr.message);
    }

    return NextResponse.json({
      success: true,
      newPrescriptionId: newRxId,
      newCode,
      baseCode,
      refillCycle,
      patientName,
      partsCount: filteredParts.length,
      nextRefillDate: confirmedNextRefillDate,
      exhaustionDate: exhaustionDateStr
    });
  } catch (error) {
    console.error('[/api/prescriptions/refill] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
