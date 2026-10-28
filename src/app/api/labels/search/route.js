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

    // Normalize codes for deduplication: strip RX- prefix, whitespace, lowercase
    // This prevents duplicates like 'RX-51864' vs '51864' from different sources
    const normalizeCode = (raw) => {
      return String(raw || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/^rx-/, '');
    };

    // Helper to format/extract date cleanly
    const extractDate = (raw) => {
      if (!raw) return null;
      if (typeof raw === 'object' && raw.seconds) {
        try {
          const d = new Date(raw.seconds * 1000);
          return d.toISOString().slice(0, 10);
        } catch {
          return null;
        }
      }
      if (typeof raw === 'string') return raw.trim();
      return null;
    };

    // ── 1. If query is empty, return popular / recent prescriptions ──
    if (!query) {
      // Return top clinical cases from registry
      const topCases = [
        { code: '51812', name: 'Abdulla Sultan Mohamed Ahmed Alotaiba', title: 'Metabolic & Longevity Protocol (Parts 1 & 2)', date: '04-10-2026' },
        { code: '51857', name: 'Amna Sultan Mohamed Ahmed Alotaiba', title: 'Metabolic & Lipid Optimization (Parts 1 & 2)', date: '04-10-2026' },
        { code: '50957', name: 'Alan Maclean Rutledge', title: 'Proteolytic & Mitochondrial Anti-Inflammatory', date: '28-09-2026' },
        { code: '51861', name: 'Basma Haitham K Bouzo', title: 'Topical Scalp & Metabolic Restoration', date: '05-10-2026' },
        { code: '51811', name: 'Sarah Al Nuaimi', title: 'Hormonal & Transdermal Longevity', date: '04-10-2026' },
      ];

      for (const item of topCases) {
        seenCodes.add(normalizeCode(item.code));
        results.push({
          id: item.code,
          code: item.code,
          fileNumber: item.code,
          patientName: item.name,
          title: item.title,
          date: item.date,
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

      const normFileNo = normalizeCode(item.fileNumber);
      if (isMatch && !seenCodes.has(normFileNo)) {
        // Register primary code and all associated aliases so secondary matches don't produce duplicate rows
        seenCodes.add(normFileNo);
        (item.prescriptionMatches || []).forEach(m => {
          seenCodes.add(normalizeCode(m));
        });

        results.push({
          id: item.fileNumber || item.id,
          code: item.fileNumber,
          fileNumber: item.fileNumber,
          patientName: item.patientName,
          doctorName: item.doctorName,
          clinicName: item.clinicName,
          title: item.productTitle || item.productName || 'Compounded Pharmaceutical Protocol',
          date: extractDate(item.prodDate || item.date || item.createdAt),
          source: 'registry'
        });
      }
    }

    // ── 3. Algolia Prescriptions Search (Exclusively Prescriptions, Never Patient Records) ──
    try {
      // In Label Studio, only real compounding prescriptions can be printed.
      // Searching atlas_patients causes confusion by showing patient records with '+ Add' buttons.
      const algoliaRes = await searchAlgoliaFederated(query, ['prescriptions'], 10);
      
      const rxHits = algoliaRes.prescriptions || [];
      for (const hit of rxHits) {
        const code = hit.code || hit.fileNumber || hit.prescriptionNumber || hit.objectID;
        if (code && !seenCodes.has(normalizeCode(code))) {
          seenCodes.add(normalizeCode(code));
          results.push({
            id: hit.objectID || code,
            code: String(code),
            fileNumber: hit.fileNumber || String(code),
            patientName: hit.patientName || hit.patient?.name || 'Patient',
            doctorName: hit.doctorName || hit.treatingDoctor?.name || 'Treating Physician',
            clinicName: hit.clinicName || hit.clinic || '',
            title: hit.treatmentTitle || hit.title || hit.formulaName || 'Compounded Prescription',
            date: extractDate(hit.prescriptionDate || hit.date || hit.dispensedDate || hit.createdAt || hit.created_at),
            source: 'algolia'
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
          const code = d.code || d.fileNumber || d.prescriptionNumber || docSnap.id;
          const pName = String(d.patientName || d.patient?.name || '').toLowerCase();
          const cNorm = normalizeCode(code);

          if ((pName.includes(qLower) || String(code).toLowerCase().includes(qLower)) && !seenCodes.has(cNorm)) {
            seenCodes.add(cNorm);
            results.push({
              id: docSnap.id,
              code: String(code),
              fileNumber: d.fileNumber || String(code),
              patientName: d.patientName || d.patient?.name || 'Patient',
              doctorName: d.doctorName || d.treatingDoctor?.name || 'Treating Physician',
              clinicName: d.clinicName || d.clinic || '',
              title: d.treatmentTitle || d.title || 'Compounded Prescription',
              date: extractDate(d.prescriptionDate || d.date || d.dispensedDate || d.createdAt || d.created_at),
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
