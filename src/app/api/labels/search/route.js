import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { PHARMAPOLIS_LABELS_REGISTRY } from '@/data/pharmapolisLabelsMap';
import { searchAlgoliaFederated } from '@/services/algoliaSearch';

export const dynamic = 'force-dynamic';

/**
 * GET /api/labels/search
 * ─────────────────────────────────────────────────────────────────────────────
 * Federated search for the standalone public Compounding Label Studio:
 * 1. Algolia instant federated search across 'prescriptions' & 'atlas_patients'.
 * 2. Firestore Admin SDK search by patient name, code, or fileNumber.
 * 3. Static Pharmapolis Labels Registry lookup for instant offline matches.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();

    const results = [];
    const seenCodes = new Set();

    // ── 1. If query is empty, return popular / recent prescriptions ──
    if (!query) {
      // Return top clinical cases from registry
      const topCases = [
        { code: '51812', name: 'Abdulla Sultan Mohamed Ahmed Alotaiba', title: 'Metabolic & Longevity Protocol (Parts 1 & 2)' },
        { code: '51857', name: 'Amna Sultan Mohamed Ahmed Alotaiba', title: 'Metabolic & Lipid Optimization (Parts 1 & 2)' },
        { code: '50957', name: 'Alan Maclean Rutledge', title: 'Proteolytic & Mitochondrial Anti-Inflammatory' },
        { code: '51861', name: 'Basma Haitham K Bouzo', title: 'Topical Scalp & Metabolic Restoration' },
        { code: '51811', name: 'Sarah Al Nuaimi', title: 'Hormonal & Transdermal Longevity' },
      ];

      for (const item of topCases) {
        seenCodes.add(item.code.toLowerCase());
        results.push({
          id: item.code,
          code: item.code,
          fileNumber: item.code,
          patientName: item.name,
          title: item.title,
          source: 'featured'
        });
      }

      return NextResponse.json({ success: true, results });
    }

    const qLower = query.toLowerCase();

    // ── 2. Local Registry Match (sub-1ms) ──
    for (const item of PHARMAPOLIS_LABELS_REGISTRY) {
      const patName = (item.patientName || '').toLowerCase();
      const fileNo = (item.fileNumber || '').toLowerCase();
      const pMatches = (item.prescriptionMatches || []).map(m => String(m).toLowerCase());
      const patMatches = (item.patientMatches || []).map(m => String(m).toLowerCase());

      const isMatch = patName.includes(qLower) || 
        fileNo.includes(qLower) || 
        pMatches.some(m => m.includes(qLower)) ||
        patMatches.some(m => m.includes(qLower));

      if (isMatch && !seenCodes.has(item.fileNumber?.toLowerCase())) {
        seenCodes.add(item.fileNumber?.toLowerCase());
        results.push({
          id: item.fileNumber || item.id,
          code: item.fileNumber,
          fileNumber: item.fileNumber,
          patientName: item.patientName,
          doctorName: item.doctorName,
          clinicName: item.clinicName,
          title: item.productTitle || item.productName || 'Compounded Pharmaceutical Protocol',
          source: 'registry'
        });
      }
    }

    // ── 3. Algolia Federated Search ──
    try {
      const algoliaRes = await searchAlgoliaFederated(query, ['prescriptions', 'atlas_patients'], 6);
      
      const rxHits = algoliaRes.prescriptions || [];
      for (const hit of rxHits) {
        const code = hit.code || hit.fileNumber || hit.prescriptionNumber || hit.objectID;
        if (code && !seenCodes.has(String(code).toLowerCase())) {
          seenCodes.add(String(code).toLowerCase());
          results.push({
            id: hit.objectID || code,
            code: String(code),
            fileNumber: hit.fileNumber || String(code),
            patientName: hit.patientName || hit.patient?.name || 'Patient',
            doctorName: hit.doctorName || hit.treatingDoctor?.name || 'Treating Physician',
            clinicName: hit.clinicName || hit.clinic || '',
            title: hit.treatmentTitle || hit.title || hit.formulaName || 'Compounded Prescription',
            source: 'algolia'
          });
        }
      }

      const patHits = algoliaRes.patients || [];
      for (const hit of patHits) {
        const pName = hit.name || hit.patientName || hit.fullName;
        const pCode = hit.fileNumber || hit.rxCode || hit.id || hit.objectID;
        if (pName && !seenCodes.has(String(pCode).toLowerCase())) {
          seenCodes.add(String(pCode).toLowerCase());
          results.push({
            id: hit.objectID || pCode,
            code: String(pCode),
            fileNumber: hit.fileNumber || String(pCode),
            patientName: pName,
            doctorName: hit.treatingDoctor || hit.doctorName || '',
            clinicName: hit.clinic || '',
            title: `Patient Record (${pName})`,
            source: 'algolia_patient'
          });
        }
      }
    } catch (algErr) {
      console.warn('[api/labels/search] Algolia query notice:', algErr.message);
    }

    // ── 4. Firestore Admin SDK Query Fallback ──
    if (adminDb && results.length < 5) {
      try {
        const snap = await adminDb.collection('prescriptions').limit(150).get();
        snap.forEach(docSnap => {
          const d = docSnap.data();
          const code = d.fileNumber || d.code || d.prescriptionNumber || docSnap.id;
          const pName = String(d.patientName || d.patient?.name || '').toLowerCase();
          const cLower = String(code).toLowerCase();

          if ((pName.includes(qLower) || cLower.includes(qLower)) && !seenCodes.has(cLower)) {
            seenCodes.add(cLower);
            results.push({
              id: docSnap.id,
              code: String(code),
              fileNumber: d.fileNumber || String(code),
              patientName: d.patientName || d.patient?.name || 'Patient',
              doctorName: d.doctorName || d.treatingDoctor?.name || 'Treating Physician',
              clinicName: d.clinicName || d.clinic || '',
              title: d.treatmentTitle || d.title || 'Compounded Prescription',
              source: 'firestore'
            });
          }
        });
      } catch (fsErr) {
        console.warn('[api/labels/search] Firestore query notice:', fsErr.message);
      }
    }

    return NextResponse.json({ success: true, results: results.slice(0, 15) });
  } catch (error) {
    console.error('[api/labels/search] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
