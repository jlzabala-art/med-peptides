import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { syncPrescriptionToAlgolia } from '@/services/algoliaSyncService';
import { invalidateRxCache } from '@/lib/rxCache';
import { resolvePrescriptionDocAdmin } from '@/lib/labels/resolvePrescriptionAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/prescriptions/refill?prescriptionId=...
 * Returns the current prescription's refill schedule + all related cycles
 * (Original, -R2, -R3, etc.) for direct management inside /labels.
 */
export async function GET(request) {
  if (!adminDb) {
    return NextResponse.json({ success: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const prescriptionId = searchParams.get('prescriptionId') || searchParams.get('code');
    if (!prescriptionId) {
      return NextResponse.json({ success: false, error: 'prescriptionId is required' }, { status: 400 });
    }

    const { data: currentData, id: currentId } = await resolvePrescriptionDocAdmin(prescriptionId);
    const rawCode = String(currentData.code || currentData.prescriptionCode || currentData.fileNumber || currentId).replace(/^#/, '');
    const cleanBaseCode = rawCode.replace(/-R\d+$/i, '');

    const cyclesMap = new Map();
    const addCycleDoc = (docSnap) => {
      if (!docSnap?.exists) return;
      const d = docSnap.data() || {};
      const code = String(d.code || d.prescriptionCode || d.fileNumber || docSnap.id).replace(/^#/, '');
      cyclesMap.set(docSnap.id, {
        id: docSnap.id,
        code,
        refillCycle: Number(d.refillCycle || 1),
        status: d.status || 'active',
        refillAlertStatus: d.refillAlertStatus || 'scheduled',
        refillAlertDate: d.refillAlertDate || d.nextRefillDate || '',
        exhaustionDate: d.exhaustionDate || '',
        courseDurationDays: Number(d.courseDurationDays || 60),
        partsCount: Array.isArray(d.pharmacyLabels) && d.pharmacyLabels.length > 0
          ? d.pharmacyLabels.length
          : (Array.isArray(d.parts) ? d.parts.length : 1),
        createdAt: d.refillCreatedAt || d.createdAt || '',
      });
    };

    // Add current, root, and child refill cycles
    cyclesMap.set(currentId, {
      id: currentId,
      code: rawCode,
      refillCycle: Number(currentData.refillCycle || 1),
      status: currentData.status || 'active',
      refillAlertStatus: currentData.refillAlertStatus || 'scheduled',
      refillAlertDate: currentData.refillAlertDate || currentData.nextRefillDate || '',
      exhaustionDate: currentData.exhaustionDate || '',
      courseDurationDays: Number(currentData.courseDurationDays || 60),
      partsCount: Array.isArray(currentData.pharmacyLabels) && currentData.pharmacyLabels.length > 0
        ? currentData.pharmacyLabels.length
        : (Array.isArray(currentData.parts) ? currentData.parts.length : 1),
      createdAt: currentData.refillCreatedAt || currentData.createdAt || '',
    });

    const queries = [
      adminDb.collection('prescriptions').where('code', '==', cleanBaseCode).limit(5).get(),
      adminDb.collection('prescriptions').where('refillOfCode', '==', cleanBaseCode).limit(15).get(),
      adminDb.collection('prescriptions').where('refillOf', '==', currentData.refillOf || currentId).limit(15).get(),
    ];

    const snaps = await Promise.allSettled(queries);
    snaps.forEach((res) => {
      if (res.status === 'fulfilled') {
        res.value.docs.forEach(addCycleDoc);
      }
    });

    const cycles = Array.from(cyclesMap.values()).sort((a, b) => a.refillCycle - b.refillCycle);

    return NextResponse.json({
      success: true,
      baseCode: cleanBaseCode,
      currentId,
      cycles,
    });
  } catch (error) {
    console.error('[/api/prescriptions/refill] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/prescriptions/refill
 * Updates refill schedule/status (refillAlertDate, refillAlertStatus, courseDurationDays)
 * on an existing prescription without cloning a new cycle.
 */
export async function PATCH(request) {
  if (!adminDb) {
    return NextResponse.json({ success: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      prescriptionId,
      refillAlertDate,
      refillAlertStatus,
      courseDurationDays,
      operatorNotes,
    } = body || {};

    if (!prescriptionId) {
      return NextResponse.json({ success: false, error: 'prescriptionId is required' }, { status: 400 });
    }

    const { ref: docRef, data: existingData, id: resolvedId } = await resolvePrescriptionDocAdmin(prescriptionId);

    const allowedStatuses = ['scheduled', 'completed', 'paused', 'cancelled'];
    const updatePayload = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (refillAlertDate !== undefined) {
      updatePayload.refillAlertDate = String(refillAlertDate || '');
      updatePayload.nextRefillDate = String(refillAlertDate || '');
    }
    if (refillAlertStatus && allowedStatuses.includes(String(refillAlertStatus).toLowerCase())) {
      updatePayload.refillAlertStatus = String(refillAlertStatus).toLowerCase();
    }
    if (courseDurationDays !== undefined && !Number.isNaN(Number(courseDurationDays))) {
      const days = Math.max(1, Number(courseDurationDays));
      updatePayload.courseDurationDays = days;
      const exDate = new Date();
      exDate.setDate(exDate.getDate() + days);
      updatePayload.exhaustionDate = exDate.toISOString().split('T')[0];
    }
    if (operatorNotes !== undefined) {
      updatePayload.refillOperatorNotes = String(operatorNotes || '');
    }

    await docRef.update(updatePayload);

    try {
      invalidateRxCache(resolvedId);
      if (prescriptionId !== resolvedId) invalidateRxCache(prescriptionId);
    } catch {
      // non-fatal
    }

    syncPrescriptionToAlgolia(resolvedId, {
      ...existingData,
      ...updatePayload,
      id: resolvedId,
    }).catch((err) => {
      console.warn('[API Refill PATCH] Algolia sync warning:', err.message);
    });

    return NextResponse.json({
      success: true,
      id: resolvedId,
      refillAlertDate: updatePayload.refillAlertDate ?? existingData.refillAlertDate ?? '',
      refillAlertStatus: updatePayload.refillAlertStatus ?? existingData.refillAlertStatus ?? 'scheduled',
      courseDurationDays: updatePayload.courseDurationDays ?? existingData.courseDurationDays ?? 60,
    });
  } catch (error) {
    console.error('[/api/prescriptions/refill] PATCH Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

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

