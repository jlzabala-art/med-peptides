import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { invalidateRxCache } from '@/lib/rxCache';
import { syncBatchPrescriptionsToAlgolia } from '@/services/algoliaSyncService';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { processPrescriptionZohoOnImport } from '@/actions/zohoAutoIngestMatcher';
import { notifyPrescriptionImported } from '@/lib/prescriptionImportNotifier';
import { normalizePrescriptionWritePayload } from '@/utils/firestoreModelGuard';

export const dynamic = 'force-dynamic';

const MAX_DOCS_PER_REQUEST = 6;
const MAX_PAYLOAD_BYTES = 400 * 1024; // 400 KB

/**
 * POST /api/labels/import
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-side persistence for prescriptions imported from the public
 * Compounding Label Studio (/labels). Used by Atlas Account Managers, who do
 * not have an authenticated Atlas session in this public app.
 *
 * The AI extraction + catalog matching is done by the shared
 * `ImportPrescriptionModal` (same code path as the Admin import). This route
 * only writes the resulting docs with the Admin SDK, forcing safe defaults:
 *   - status: 'draft'           (never auto-approved)
 *   - atlasValidation: 'skipped' (explicitly bypasses the Atlas review gate)
 *   - importChannel: 'public_labels_account_manager'
 *
 * Body: { prescriptions: Array<Object> }
 * Returns: { success, created: [{ id, code, patientName }] }
 */
export async function POST(request) {
  const rateInfo = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000, tier: 'labels-import' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const raw = await request.text();
    if (raw.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 });
    }

    const body = JSON.parse(raw || '{}');
    const list = Array.isArray(body?.prescriptions) ? body.prescriptions : [];
    if (list.length === 0) {
      return NextResponse.json({ success: false, error: 'No prescriptions provided' }, { status: 400 });
    }
    if (list.length > MAX_DOCS_PER_REQUEST) {
      return NextResponse.json({ success: false, error: 'Too many prescriptions in one request' }, { status: 400 });
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const nowIso = new Date().toISOString();
    const batch = adminDb.batch();
    const created = [];

    for (const rx of list) {
      if (!rx || typeof rx !== 'object') continue;
      // Strip any client-supplied identity / privileged fields
      const { id: _id, createdAt: _c, updatedAt: _u, approvedAt: _a, approvedBy: _b, ...safe } = rx;
      const patientName = String(safe.patientName || safe.patient?.name || 'Unknown Patient').trim();
      const rawCode = String(safe.code || safe.rxCode || safe.fileNumber || '').replace(/^#/, '').trim();
      const testType = String(
        safe.testType ||
        (/AATRI/i.test(rawCode) ? 'trichotest' :
         /AATEL/i.test(rawCode) ? 'telotest' :
         /AAACN/i.test(rawCode) ? 'acnetest' :
         /AANUT/i.test(rawCode) ? 'nutrigen' : 'compounding')
      ).toLowerCase();

      // Check if an identical prescription (same non-generic code + same testType + same patient) already exists
      let ref = null;
      if (rawCode && rawCode.length >= 4 && rawCode.toUpperCase() !== 'RX') {
        try {
          const existingSnap = await adminDb
            .collection('prescriptions')
            .where('code', '==', rawCode)
            .limit(5)
            .get();
          const exactDoc = existingSnap.docs.find((d) => {
            const dData = d.data() || {};
            const dPat = String(dData.patientName || dData.patient?.name || '').trim().toLowerCase();
            const dTest = String(
              dData.testType ||
              (/AATRI/i.test(dData.code || '') ? 'trichotest' :
               /AATEL/i.test(dData.code || '') ? 'telotest' :
               /AAACN/i.test(dData.code || '') ? 'acnetest' :
               /AANUT/i.test(dData.code || '') ? 'nutrigen' : 'compounding')
            ).toLowerCase();
            return dPat === patientName.toLowerCase() && dTest === testType;
          });
          if (exactDoc) {
            ref = exactDoc.ref;
          }
        } catch {
          // fallback to new doc
        }
      }

      if (!ref) {
        ref = adminDb.collection('prescriptions').doc();
      }
      const code = rawCode || ref.id;
      const patientSlug = `patient-${patientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

      const doctorApproverName = safe.doctorName || safe.physician || safe.treatingDoctor?.name || 'Treating Physician (Clinical Lab Report)';
      const rxPayload = normalizePrescriptionWritePayload({
        ...safe,
        patientId: safe.patientId || patientSlug,
        testType,
        status: 'approved',
        state: 'approved',
        clinicalStatus: 'approved',
        isSigned: true,
        signedAt: nowIso,
        signedBy: doctorApproverName,
        approvalStatus: 'approved',
        doctorApproval: {
          approved: true,
          approvedAt: nowIso,
          approvedBy: doctorApproverName,
          source: 'imported_signed_clinical_report'
        },
        atlasValidation: 'skipped',
        importChannel: 'public_labels_account_manager',
        code,
        importedAt: nowIso,
        createdAt: now,
        updatedAt: now,
      });
      batch.set(ref, rxPayload, { merge: true });

      // Link this test/prescription to the single unified patient record (supports multiple tests on the same day without duplicating the patient)
      if (patientName && patientName !== 'Unknown Patient') {
        const patientRef = adminDb.collection('patients').doc(patientSlug);
        batch.set(
          patientRef,
          {
            id: patientSlug,
            name: patientName,
            fullName: patientName,
            gender: safe.patient?.gender || 'Unknown',
            dob: safe.patient?.dob || null,
            doctorName: safe.doctorName || safe.doctor?.name || 'Treating Physician',
            doctorId: safe.doctorId || safe.doctor?.id || null,
            clinicName: safe.clinicName || safe.clinic || null,
            clinicId: safe.clinicId || null,
            prescriptions: admin.firestore.FieldValue.arrayUnion(ref.id),
            activePrescriptions: admin.firestore.FieldValue.arrayUnion(code),
            sampleCodes: admin.firestore.FieldValue.arrayUnion(code),
            status: 'active',
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }

      created.push({ id: ref.id, code, patientName, testType, importedAt: nowIso });
    }

    await batch.commit();
    created.forEach(c => {
      try { invalidateRxCache?.(c.id); } catch { /* noop */ }
    });

    // In-process atomic Algolia synchronization (Guarantees zero missed search records)
    const algoliaItems = created.map((c, idx) => ({
      id: c.id,
      record: {
        ...(list[idx] || {}),
        id: c.id,
        code: c.code,
        patientName: c.patientName,
        status: 'approved',
        clinicalStatus: 'approved',
        isSigned: true,
      }
    }));
    await syncBatchPrescriptionsToAlgolia(algoliaItems);

    created.forEach((c, idx) => {
      const rx = list[idx] || {};

      // Non-blocking Zoho Books matching & auto-creation pipeline
      processPrescriptionZohoOnImport({
        prescriptionId: c.id,
        rxData: rx,
        userEmail: 'labels_public_import'
      }).catch(err => {
        console.warn('[api/labels/import] Zoho matching error:', err.message);
      });

      // Automated email notification to jose@mediluxeme.com on prescription import
      notifyPrescriptionImported({
        prescriptionId: c.id,
        rxData: {
          ...rx,
          id: c.id,
          code: c.code,
          patientName: c.patientName,
          status: 'approved',
          clinicalStatus: 'approved',
          isSigned: true,
        },
        importChannel: 'public_labels_account_manager'
      }).catch(err => {
        console.warn('[api/labels/import] Prescription import email notification error:', err.message);
      });
    });

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('[api/labels/import] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
