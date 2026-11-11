import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { resolveDoctorProfile } from '@/services/doctorDirectoryService';
import { syncBatchPrescriptionsToAlgolia } from '@/services/algoliaSyncService';
import { invalidateRxCache } from '@/lib/rxCache';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/consolidate-prescriptions
 * ─────────────────────────────────────────────────────────────────────────────
 * Administrative cleanup endpoint that scans Firestore prescriptions for:
 *  1. Split multipart records (e.g. codes matching /-\d+$/ such as 03505-1, 03505-2, 03505-3)
 *     belonging to the same patient and imports them into a single consolidated master prescription (03505).
 *  2. Unassociated prescriptions for Dr. Sobia Mirza / My London Skin Clinic / MLSC,
 *     ensuring doctorId is canonical 'dr-sobia', doctorName is 'Dr. Sobia Mirza',
 *     and clinic is 'My London Skin Clinic'.
 *
 * Query params:
 *   ?dryRun=true  -> Preview changes without writing to Firestore
 *   ?patient=...  -> Filter cleanup for specific patient (e.g. 'Poorna')
 *   ?code=...     -> Filter cleanup for specific code base (e.g. '03505')
 */
export async function POST(request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore Admin DB is not initialized.' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get('dryRun') === 'true';
    const filterPatient = (searchParams.get('patient') || '').toLowerCase().trim();
    const filterCode = (searchParams.get('code') || '').toLowerCase().trim();

    // 1. Fetch prescriptions from Firestore
    let query = adminDb.collection('prescriptions').limit(200);
    const snap = await query.get();

    // Group split candidates by base code and patient
    const candidateGroups = new Map();
    const doctorUpdates = [];

    snap.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      const rawCode = String(data.code || data.prescriptionNumber || data.rxCode || '').trim();
      const patientName = String(data.patientName || data.patient?.name || '').trim();

      if (filterPatient && !patientName.toLowerCase().includes(filterPatient)) return;
      if (filterCode && !rawCode.toLowerCase().includes(filterCode)) return;

      // Check if this prescription belongs to Dr. Sobia but lacks canonical doctorId
      const docLower = (data.doctorName || data.doctor?.name || '').toLowerCase();
      const clinicLower = (data.clinicName || data.clinic || data.doctor?.clinicName || '').toLowerCase();
      const isSobiaMatch = docLower.includes('sobia') || clinicLower.includes('my london') || clinicLower.includes('london skin') || clinicLower.includes('mlsc');

      if (isSobiaMatch && (data.doctorId !== 'dr-sobia' || data.doctorSlug !== 'dr-sobia')) {
        doctorUpdates.push({
          id: doc.id,
          code: rawCode,
          patientName,
          currentDoctorId: data.doctorId,
          currentDoctorName: data.doctorName
        });
      }

      // Check if code has multipart suffix like -1, -2, -3 or _1, _2
      const splitMatch = rawCode.match(/^(.*?)[-_](\d+)$/);
      if (splitMatch) {
        const baseCode = splitMatch[1].trim();
        const partIndex = parseInt(splitMatch[2], 10);
        const groupKey = `${patientName.toLowerCase()}::${baseCode.toLowerCase()}`;

        if (!candidateGroups.has(groupKey)) {
          candidateGroups.set(groupKey, {
            baseCode,
            patientName,
            docs: []
          });
        }
        candidateGroups.get(groupKey).docs.push({
          ...data,
          _partIndex: partIndex
        });
      }
    });

    const consolidationPlans = [];

    // Formulate consolidation plans for groups with > 1 split doc
    for (const [key, group] of candidateGroups.entries()) {
      if (group.docs.length >= 1) {
        // Sort by part index
        group.docs.sort((a, b) => (a._partIndex || 0) - (b._partIndex || 0));

        const primaryDoc = group.docs[0];
        const masterCode = group.baseCode;
        const allItems = [];
        const allPhases = [];
        const combinedVolumes = [];
        const combinedPosologies = [];

        group.docs.forEach((doc, idx) => {
          const lines = Array.isArray(doc.prescriptionLines) && doc.prescriptionLines.length > 0
            ? doc.prescriptionLines
            : (Array.isArray(doc.items) ? doc.items : []);

          lines.forEach(l => {
            allItems.push({
              ...l,
              formulationIndex: idx + 1,
              formulationBlock: doc.treatmentType || l.formulationBlock || `Phase ${idx + 1}`
            });
          });

          const vol = doc.volume || doc.blockVolume;
          if (vol && !combinedVolumes.includes(vol)) combinedVolumes.push(vol);

          const pos = doc.posology || doc.instructions;
          if (pos) {
            combinedPosologies.push(`[Phase ${idx + 1}: ${doc.treatmentType || 'Formulation'}]: ${pos}`);
          }

          allPhases.push({
            id: `phase-${idx + 1}`,
            phaseNumber: idx + 1,
            phaseName: doc.treatmentType || `Phase ${idx + 1}`,
            dispensingForm: doc.dispensingForm || 'Magistral Solution',
            volume: vol || '100 mL',
            posology: pos || '',
            items: lines
          });
        });

        consolidationPlans.push({
          groupKey: key,
          masterCode,
          patientName: group.patientName,
          primaryDocId: primaryDoc.id,
          docsToDelete: group.docs.slice(1).map(d => ({ id: d.id, code: d.code })),
          consolidatedData: {
            code: masterCode,
            rxCode: masterCode,
            prescriptionNumber: masterCode,
            isMultiPart: true,
            totalParts: group.docs.length,
            phases: allPhases,
            prescriptionLines: allItems,
            items: allItems,
            volume: combinedVolumes.join(' + ') || primaryDoc.volume || '',
            posology: combinedPosologies.join('\n\n') || primaryDoc.posology || '',
            treatmentType: group.docs.map(d => d.treatmentType).filter(Boolean).join(' + ') || primaryDoc.treatmentType || 'Compounded Formula',
            doctorId: 'dr-sobia',
            doctorSlug: 'dr-sobia',
            doctorName: 'Dr. Sobia Mirza',
            doctorLicense: 'DHA Registered',
            clinicName: 'My London Skin Clinic',
            clinicId: 'IdDU1oK1VuAVVYrGz6E7',
            doctor: {
              id: 'dr-sobia',
              name: 'Dr. Sobia Mirza',
              displayName: 'Dr. Sobia Mirza',
              license: 'DHA Registered',
              clinic: 'My London Skin Clinic',
              clinicName: 'My London Skin Clinic'
            }
          }
        });
      }
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        plansCount: consolidationPlans.length,
        consolidationPlans,
        doctorUpdatesCount: doctorUpdates.length,
        doctorUpdates
      });
    }

    // Execute Firestore write operations
    let updatedMasterCount = 0;
    let deletedSplitCount = 0;
    const now = admin.firestore.FieldValue.serverTimestamp();

    for (const plan of consolidationPlans) {
      // 1. Update primary document into master consolidated document
      const masterRef = adminDb.collection('prescriptions').doc(plan.primaryDocId);
      await masterRef.set({
        ...plan.consolidatedData,
        updatedAt: now,
        consolidatedAt: now,
        consolidationAudit: `Consolidated ${plan.docsToDelete.length + 1} split parts into single master prescription`
      }, { merge: true });
      updatedMasterCount++;

      // Invalidate cache
      try { invalidateRxCache(plan.primaryDocId); } catch { /* noop */ }
      try { invalidateRxCache(plan.masterCode); } catch { /* noop */ }

      // 2. Delete redundant split child docs (e.g. 03505-2, 03505-3)
      for (const toDel of plan.docsToDelete) {
        await adminDb.collection('prescriptions').doc(toDel.id).delete();
        deletedSplitCount++;
        try { invalidateRxCache(toDel.id); } catch { /* noop */ }
        try { invalidateRxCache(toDel.code); } catch { /* noop */ }
      }
    }

    // Apply standalone Dr. Sobia updates if any
    let doctorUpdatesApplied = 0;
    for (const docUp of doctorUpdates) {
      await adminDb.collection('prescriptions').doc(docUp.id).set({
        doctorId: 'dr-sobia',
        doctorSlug: 'dr-sobia',
        doctorName: 'Dr. Sobia Mirza',
        doctorLicense: 'DHA Registered',
        clinicName: 'My London Skin Clinic',
        clinicId: 'IdDU1oK1VuAVVYrGz6E7',
        updatedAt: now
      }, { merge: true });
      doctorUpdatesApplied++;
      try { invalidateRxCache(docUp.id); } catch { /* noop */ }
    }

    return NextResponse.json({
      success: true,
      updatedMasterCount,
      deletedSplitCount,
      doctorUpdatesApplied,
      plans: consolidationPlans.map(p => ({
        masterCode: p.masterCode,
        patientName: p.patientName,
        partsConsolidated: p.docsToDelete.length + 1,
        deletedSplitCodes: p.docsToDelete.map(d => d.code)
      }))
    });
  } catch (error) {
    console.error('[api/admin/consolidate-prescriptions] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

