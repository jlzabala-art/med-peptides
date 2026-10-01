import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { invalidateRxCache } from '@/app/rx/[code]/page';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  // Rate-limiting for public prescription intake
  const rateInfo = checkRateLimit(request, { limit: 20, windowMs: 60 * 1000, tier: 'public-rx-intake' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service is temporarily unavailable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { 
      prescriptions, 
      createPatientRecord = true, 
      source = 'public_rx_intake', 
      allowDuplicateOverride = false 
    } = body || {};

    if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
      return NextResponse.json(
        { error: 'No prescription records provided in payload.' },
        { status: 400 }
      );
    }

    // ── DEDUPLICATION VERIFICATION ─────────────────────────────────────────────
    // If not explicitly overridden, detect existing records by Box ID or Patient + Date
    if (!allowDuplicateOverride) {
      for (const rx of prescriptions) {
        const boxId = rx.fagron?.boxId ? String(rx.fagron.boxId).trim() : null;
        const patientName = String(rx.patient?.name || rx.patientName || '').trim();
        const dateVal = String(rx.fagron?.reportDate || rx.prescriptionDate || rx.date || '').trim();

        let existingDoc = null;
        let matchReason = null;

        // 1. Check Fagron Box ID
        if (boxId) {
          const snap = await adminDb.collection('prescriptions')
            .where('fagron.boxId', '==', boxId)
            .limit(1)
            .get()
            .catch(() => null);
          if (snap && !snap.empty) {
            existingDoc = snap.docs[0];
            matchReason = `Fagron Box ID: ${boxId}`;
          }
        }

        // 2. Check Patient Name + Date
        if (!existingDoc && patientName && dateVal) {
          const snapDate = await adminDb.collection('prescriptions')
            .where('patient.name', '==', patientName)
            .where('prescriptionDate', '==', dateVal)
            .limit(1)
            .get()
            .catch(() => null);
          if (snapDate && !snapDate.empty) {
            existingDoc = snapDate.docs[0];
            matchReason = `Paciente "${patientName}" con fecha ${dateVal}`;
          } else {
            const snapFagron = await adminDb.collection('prescriptions')
              .where('patient.name', '==', patientName)
              .where('fagron.reportDate', '==', dateVal)
              .limit(1)
              .get()
              .catch(() => null);
            if (snapFagron && !snapFagron.empty) {
              existingDoc = snapFagron.docs[0];
              matchReason = `Paciente "${patientName}" con fecha ${dateVal}`;
            }
          }
        }

        if (existingDoc) {
          const existingData = existingDoc.data();
          const existingCode = existingData.prescriptionNumber || existingDoc.id;
          return NextResponse.json({
            success: false,
            duplicateDetected: true,
            matchReason,
            existingPrescription: {
              id: existingDoc.id,
              prescriptionNumber: existingCode,
              patientName: existingData.patientName || existingData.patient?.name || patientName,
              doctorName: existingData.doctorName || existingData.doctor?.name || 'Physician',
              prescriptionDate: existingData.prescriptionDate || existingData.fagron?.reportDate || dateVal,
              boxId: existingData.fagron?.boxId || boxId,
              treatmentType: existingData.treatmentType || 'Compounded Formula',
              status: existingData.status || 'approved',
              createdAt: existingData.createdAt,
              rxUrl: `/rx/${existingCode}`,
              fullUrl: `https://med-peptides.com/rx/${existingCode}`,
              rxData: { id: existingDoc.id, ...existingData }
            },
            message: `Esta prescripción ya está registrada en el sistema (${matchReason}). Código oficial: ${existingCode}`
          });
        }
      }
    }

    const savedPrescriptions = [];
    const errors = [];

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');

    for (let i = 0; i < prescriptions.length; i++) {
      const rx = prescriptions[i];
      try {
        let patientId = rx.patientId || null;

        // Auto-create or link patient in CRM if provided
        if (createPatientRecord && rx.patient?.name && !patientId) {
          try {
            const patientNameClean = String(rx.patient.name).trim();
            // Check if patient exists by name
            const existingPatientSnap = await adminDb.collection('patients')
              .where('name', '==', patientNameClean)
              .limit(1)
              .get()
              .catch(() => null);

            if (existingPatientSnap && !existingPatientSnap.empty) {
              patientId = existingPatientSnap.docs[0].id;
            } else {
              const newPatientRef = await adminDb.collection('patients').add({
                name: patientNameClean,
                dob: rx.patient.dob || '',
                gender: rx.patient.gender || '',
                email: rx.patient.email || '',
                phone: rx.patient.phone || '',
                source: rx.fagron ? 'fagron_public_import' : 'prescription_public_import',
                status: 'unverified',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              patientId = newPatientRef.id;
            }
          } catch (pErr) {
            console.warn('[public-intake] Could not link or create patient:', pErr.message);
          }
        }

        // Generate canonical prescriptionNumber if missing
        const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
        const officialNumber = rx.prescriptionNumber || `RX-${dateStr}-${randomHex}`;

        const payload = {
          ...rx,
          prescriptionNumber: officialNumber,
          patientId: patientId || rx.patientId || null,
          status: rx.status || 'pending',
          isPublicIntake: true,
          publicIntakeSource: source,
          shareWithPatient: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (allowDuplicateOverride) {
          payload.duplicateOverride = true;
          payload.duplicateOverrideAt = new Date().toISOString();
        }

        // Clean internal UI helper fields
        delete payload._dupStatus;
        delete payload._existingId;
        delete payload._existingData;
        delete payload._duplicateReason;
        delete payload._isManuallyMapped;

        // Save to Firestore
        const docRef = await adminDb.collection('prescriptions').add(payload);

        // Invalidate server cache if needed
        try {
          invalidateRxCache(officialNumber);
          invalidateRxCache(docRef.id);
        } catch (_) {}

        savedPrescriptions.push({
          id: docRef.id,
          prescriptionNumber: officialNumber,
          patientName: payload.patientName || payload.patient?.name || 'Patient',
          treatmentType: payload.treatmentType || 'Medical Formulation',
          lineCount: (payload.prescriptionLines || payload.items || []).length,
          rxUrl: `/rx/${officialNumber}`,
          fullUrl: `https://med-peptides.com/rx/${officialNumber}`,
          rxData: { id: docRef.id, ...payload },
        });
      } catch (err) {
        console.error('[public-intake] Error saving item:', err);
        errors.push(`Error on prescription ${i + 1}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      savedCount: savedPrescriptions.length,
      savedPrescriptions,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[public-intake] Global route error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process and save public prescription intake.' },
      { status: 500 }
    );
  }
}
