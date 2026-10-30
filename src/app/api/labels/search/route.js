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
    const seenPatientCodes = new Set();

    // Helper to extract clean alphanumeric prescription code
    const cleanCodeStr = (raw) => {
      if (!raw) return '';
      const str = String(raw).trim();
      const boxMatch = str.match(/\b(BOX[0-9]{4,6}[A-Z0-9]+)\b/i);
      if (boxMatch) return boxMatch[1].toUpperCase();
      const rxMatch = str.match(/\b(RX-[A-Z0-9-]+)\b/i);
      if (rxMatch) return rxMatch[1].toUpperCase();
      return str.replace(/\s*\(.*?\)/g, '').split(/[;,\n]/)[0].trim();
    };

    // Normalize codes for deduplication: strip RX- prefix, non-alphanumeric, lowercase
    const normalizeCode = (raw) => {
      return cleanCodeStr(raw)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    };

    // Clean clinical title to remove extraction artifacts
    const cleanTitle = (raw) => {
      if (!raw) return 'Compounded Prescription';
      return String(raw).replace(/\s*\(Sample Code.*?\)/gi, '').trim() || 'Compounded Prescription';
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

    // ── 1. If query is empty, return latest ingested prescriptions from Firestore ordered by date ──
    if (!query) {
      if (adminDb) {
        try {
          const snap = await adminDb.collection('prescriptions')
            .orderBy('createdAt', 'desc')
            .limit(12)
            .get();

          snap.forEach(docSnap => {
            const d = docSnap.data();
            const rawCode = d.prescriptionNumber || d.code || d.fileNumber || docSnap.id;
            const code = cleanCodeStr(rawCode);
            const normCode = normalizeCode(code);
            const patName = d.patientName || d.patient?.name || 'Patient';
            const patKey = `${patName.toLowerCase().trim()}::${normCode}`;

            if (normCode && !seenCodes.has(normCode) && !seenPatientCodes.has(patKey)) {
              seenCodes.add(normCode);
              seenPatientCodes.add(patKey);
              results.push({
                id: docSnap.id,
                code: String(code),
                fileNumber: d.fileNumber || String(code),
                patientName: patName,
                doctorName: d.doctorName || d.treatingDoctor?.name || 'Treating Physician',
                clinicName: d.clinicName || d.clinic || '',
                title: cleanTitle(d.treatmentTitle || d.title || d.formulaName),
                date: extractDate(d.createdAt || d.uploadedAt || d.importedAt || d.prescriptionDate || d.date),
                a4PrintCount: d.a4PrintCount || d.printCount || 0,
                source: 'firestore_latest'
              });
            }
          });
        } catch (err) {
          console.warn('[api/labels/search] Error fetching latest prescriptions:', err.message);
        }
      }

      // If Firestore empty or results < 5, fallback to curated registry
      if (results.length < 5) {
        const topCases = [
          { code: '51812', name: 'Abdulla Sultan Mohamed Ahmed Alotaiba', title: 'Metabolic & Longevity Protocol (Parts 1 & 2)', date: '2026-10-04' },
          { code: '51857', name: 'Amna Sultan Mohamed Ahmed Alotaiba', title: 'Metabolic & Lipid Optimization (Parts 1 & 2)', date: '2026-10-04' },
          { code: '50957', name: 'Alan Maclean Rutledge', title: 'Proteolytic & Mitochondrial Anti-Inflammatory', date: '2026-09-28' },
          { code: '51861', name: 'Basma Haitham K Bouzo', title: 'Topical Scalp & Metabolic Restoration', date: '2026-10-05' },
          { code: '51811', name: 'Sarah Al Nuaimi', title: 'Hormonal & Transdermal Longevity', date: '2026-10-04' },
        ];

        for (const item of topCases) {
          const normCode = normalizeCode(item.code);
          if (!seenCodes.has(normCode)) {
            seenCodes.add(normCode);
            results.push({
              id: item.code,
              code: item.code,
              fileNumber: item.code,
              patientName: item.name,
              title: item.title,
              date: item.date,
              a4PrintCount: 0,
              source: 'featured'
            });
          }
        }
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
        const rawCode = hit.code || hit.prescriptionNumber || hit.fileNumber || hit.objectID;
        const code = cleanCodeStr(rawCode);
        const normCode = normalizeCode(code);
        const patName = hit.patientName || hit.patient?.name || 'Patient';
        const patKey = `${patName.toLowerCase().trim()}::${normCode}`;

        if (normCode && !seenCodes.has(normCode) && !seenPatientCodes.has(patKey)) {
          seenCodes.add(normCode);
          seenPatientCodes.add(patKey);
          results.push({
            id: hit.objectID || code,
            code: String(code),
            fileNumber: hit.fileNumber || String(code),
            patientName: patName,
            doctorName: hit.doctorName || hit.treatingDoctor?.name || 'Treating Physician',
            clinicName: hit.clinicName || hit.clinic || '',
            title: cleanTitle(hit.treatmentTitle || hit.title || hit.formulaName),
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
          const rawCode = d.code || d.prescriptionNumber || d.fileNumber || docSnap.id;
          const code = cleanCodeStr(rawCode);
          const pName = String(d.patientName || d.patient?.name || '').trim();
          const normCode = normalizeCode(code);
          const patKey = `${pName.toLowerCase()}::${normCode}`;

          if ((pName.toLowerCase().includes(qLower) || normCode.includes(qLower)) && !seenCodes.has(normCode) && !seenPatientCodes.has(patKey)) {
            seenCodes.add(normCode);
            seenPatientCodes.add(patKey);
            results.push({
              id: docSnap.id,
              code: String(code),
              fileNumber: d.fileNumber || String(code),
              patientName: pName || 'Patient',
              doctorName: d.doctorName || d.treatingDoctor?.name || 'Treating Physician',
              clinicName: d.clinicName || d.clinic || '',
              title: cleanTitle(d.treatmentTitle || d.title),
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
