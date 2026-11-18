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

    // Extract best informative code avoiding degenerate 'RX'
    const extractBestCode = (d = {}, docId = '') => {
      const candidates = [
        d.prescriptionCode,
        d.sampleCode,
        d.boxId,
        d.fagron?.sampleCode,
        d.fagron?.boxId,
        d.fileNumber,
        d.prescriptionNumber,
        docId,
        d.code
      ].filter(c => c && String(c).trim().toUpperCase() !== 'RX' && String(c).trim().length > 2);
      return cleanCodeStr(candidates[0] || docId || d.code || 'RX');
    };
    const cleanTitle = (raw) => {
      if (!raw) return 'Compounded Prescription';
      return String(raw).replace(/\s*\(Sample Code.*?\)/gi, '').trim() || 'Compounded Prescription';
    };

    const resolveRxTitle = (d = {}) => {
      const candidate =
        d.medication ||
        d.productName ||
        d.treatmentTitle ||
        d.title ||
        d.formulaName ||
        d.treatmentType ||
        d.items?.[0]?.name ||
        d.items?.[0]?.productName ||
        d.parts?.[0]?.formulaName ||
        d.formulationBlocks?.[0]?.treatmentType ||
        '';
      const baseTitle = cleanTitle(candidate);
      const codeCorpus = String(d.prescriptionNumber || d.code || d.rxCode || d.fileNumber || '').toUpperCase();

      if (codeCorpus.includes('AATEL') && !/telo/i.test(baseTitle)) {
        return baseTitle && baseTitle !== 'Compounded Prescription'
          ? `Fagron TeloTest · ${baseTitle}`
          : 'Fagron TeloTest';
      }
      if (codeCorpus.includes('AATRI') && !/tricho/i.test(baseTitle)) {
        return baseTitle && baseTitle !== 'Compounded Prescription'
          ? `Fagron TrichoTest · ${baseTitle}`
          : 'Fagron TrichoTest';
      }
      if (codeCorpus.includes('AAACN') && !/acne/i.test(baseTitle)) {
        return baseTitle && baseTitle !== 'Compounded Prescription'
          ? `Fagron AcneTest · ${baseTitle}`
          : 'Fagron AcneTest';
      }
      if (codeCorpus.includes('AANUT') && !/nutri/i.test(baseTitle)) {
        return baseTitle && baseTitle !== 'Compounded Prescription'
          ? `Fagron NutriGen · ${baseTitle}`
          : 'Fagron NutriGen';
      }
      return baseTitle;
    };

    const resolvePartsCount = (d = {}) => {
      const rawCount =
        (Array.isArray(d.parts) && d.parts.length > 0 && d.parts.length) ||
        (Array.isArray(d.formulationBlocks) && d.formulationBlocks.length > 0 && d.formulationBlocks.length) ||
        (Array.isArray(d.phases) && d.phases.length > 0 && d.phases.length) ||
        (Array.isArray(d.pharmacyLabels) && d.pharmacyLabels.length > 0 && d.pharmacyLabels.length) ||
        (Array.isArray(d.items) && d.items.length > 0 && d.items.length) ||
        Number(d.partsCount || d.itemsCount || 1);
      const removedLen = Array.isArray(d.removedParts) ? d.removedParts.length : 0;
      return Math.max(1, Number(rawCount || 1) - removedLen);
    };

    // Helper to extract epoch milliseconds from Firestore Timestamp, Admin Timestamp, ISO string, or number
    const extractTimestampMs = (raw) => {
      if (!raw) return 0;
      if (typeof raw?.toDate === 'function') {
        try {
          return raw.toDate().getTime() || 0;
        } catch {
          return 0;
        }
      }
      if (typeof raw === 'object') {
        const sec = raw._seconds ?? raw.seconds;
        if (typeof sec === 'number') return sec * 1000;
        return 0;
      }
      if (typeof raw === 'number') {
        return raw < 1e12 ? raw * 1000 : raw;
      }
      if (typeof raw === 'string') {
        const s = raw.trim();
        const dmy = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (dmy) {
          const parsedDmy = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T00:00:00Z`).getTime();
          return Number.isNaN(parsedDmy) ? 0 : parsedDmy;
        }
        const parsed = new Date(s).getTime();
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // Helper to format/extract date cleanly (YYYY-MM-DD) with native Firestore metadata support
    const extractDate = (raw) => {
      if (!raw) return null;
      const ms = extractTimestampMs(raw);
      if (ms > 0) {
        try {
          return new Date(ms).toISOString().slice(0, 10);
        } catch {
          return null;
        }
      }
      if (typeof raw === 'string') return raw.trim();
      return null;
    };

    // ── 1. If query is empty, return latest ingested prescriptions from Firestore ordered by importedAt / createTime ──
    if (!query) {
      if (adminDb) {
        try {
          let snap;
          try {
            snap = await adminDb.collection('prescriptions')
              .orderBy('importedAt', 'desc')
              .limit(120)
              .get();
          } catch {
            snap = await adminDb.collection('prescriptions')
              .limit(400)
              .get();
          }

          const sortedDocs = [...snap.docs].sort((a, b) => {
            const da = a.data();
            const dbData = b.data();
            const ta =
              extractTimestampMs(da.importedAt) ||
              extractTimestampMs(da.createdAt) ||
              extractTimestampMs(da.uploadedAt) ||
              extractTimestampMs(a.createTime) ||
              extractTimestampMs(da.prescriptionDate || da.date);
            const tb =
              extractTimestampMs(dbData.importedAt) ||
              extractTimestampMs(dbData.createdAt) ||
              extractTimestampMs(dbData.uploadedAt) ||
              extractTimestampMs(b.createTime) ||
              extractTimestampMs(dbData.prescriptionDate || dbData.date);
            return tb - ta;
          });

          const seenPatientSignature = new Map();

          sortedDocs.forEach(docSnap => {
            const d = docSnap.data();
            const code = extractBestCode(d, docSnap.id);
            const normCode = normalizeCode(code);
            const patName = d.patientName || d.patient?.name || 'Patient';
            const patKey = `${patName.toLowerCase().trim()}::${normCode}`;
            const resolvedTitle = resolveRxTitle(d);
            const importedDateVal = extractDate(
              d.importedAt || d.createdAt || d.uploadedAt || docSnap.createTime || d.updatedAt
            );
            const dateVal = extractDate(
              d.prescriptionDate || d.date || d.createdAt || d.importedAt || docSnap.createTime
            );
            const partsCount = resolvePartsCount(d);
            const testTag =
              d.testType ||
              (/AATEL/i.test(code)
                ? 'AATEL'
                : /AATRI/i.test(code)
                  ? 'AATRI'
                  : /AAACN/i.test(code)
                    ? 'AAACN'
                    : /AANUT/i.test(code)
                      ? 'AANUT'
                      : '');
            const itemFp = (Array.isArray(d.items) ? d.items : [])
              .slice(0, 4)
              .map((it) => String(it?.productName || it?.name || it?.activeIngredient || '').toLowerCase().trim())
              .filter(Boolean)
              .join('|');
            const sigKey = `${patName.toLowerCase().trim()}::${testTag || resolvedTitle.toLowerCase()}::${partsCount}::${itemFp}::${dateVal || ''}`;

            if (normCode && !seenCodes.has(normCode) && !seenPatientCodes.has(patKey)) {
              if (seenPatientSignature.has(sigKey)) {
                const existingIdx = seenPatientSignature.get(sigKey);
                const existingItem = results[existingIdx];
                // Prefer the more descriptive nominal code (e.g. RX-UAE-NAWAL-GLP3-30MG over RX-UAE-GLP3-30MG)
                if (existingItem && String(code).length > String(existingItem.code).length) {
                  results[existingIdx] = {
                    ...existingItem,
                    id: docSnap.id,
                    code: String(code),
                    fileNumber: d.fileNumber || String(code),
                  };
                }
                seenCodes.add(normCode);
                seenPatientCodes.add(patKey);
                return;
              }

              seenCodes.add(normCode);
              seenPatientCodes.add(patKey);
              seenPatientSignature.set(sigKey, results.length);
              results.push({
                id: docSnap.id,
                code: String(code),
                fileNumber: d.fileNumber || String(code),
                patientName: patName,
                doctorName: d.doctorName || d.treatingDoctor?.name || 'Treating Physician',
                clinicName: d.clinicName || d.clinic || '',
                title: resolvedTitle,
                partsCount,
                date: dateVal,
                importedAt: importedDateVal,
                a4PrintCount: d.a4PrintCount || d.printCount || 0,
                lastPrintedA4At: extractDate(d.lastPrintedA4At),
                status: d.status || d.state || 'approved',
                isSigned: Boolean(d.isSigned),
                labeledParts: d.labeledParts || {},
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
            title: resolveRxTitle(hit),
            partsCount: resolvePartsCount(hit),
            date: extractDate(hit.prescriptionDate || hit.date || hit.dispensedDate || hit.createdAt || hit.created_at),
            importedAt: extractDate(hit.importedAt || hit.createdAt || hit.created_at || hit.uploadedAt),
            status: hit.status || hit.state || 'approved',
            source: 'algolia'
          });
        }
      }
    } catch (algErr) {
      console.warn('[api/labels/search] Algolia query notice:', algErr.message);
    }

    // ── 4. Firestore Admin SDK Query Fallback ──
    if (adminDb && results.length < 10) {
      try {
        let snap;
        try {
          snap = await adminDb.collection('prescriptions')
            .orderBy('importedAt', 'desc')
            .limit(400)
            .get();
        } catch {
          snap = await adminDb.collection('prescriptions')
            .limit(400)
            .get();
        }

        snap.forEach(docSnap => {
          const d = docSnap.data();
          const code = extractBestCode(d, docSnap.id);
          const pName = String(d.patientName || d.patient?.name || '').trim();
          const normCode = normalizeCode(code);
          const patKey = `${pName.toLowerCase()}::${normCode}`;

          // Register all aliases on the document to avoid duplicate presentation
          const docAliases = [
            d.fileNumber,
            d.prescriptionCode,
            d.sampleCode,
            d.boxId,
            docSnap.id,
            ...(Array.isArray(d.aliases) ? d.aliases : [])
          ].filter(Boolean);

          const isKnown = seenCodes.has(normCode) || seenPatientCodes.has(patKey) || docAliases.some(a => seenCodes.has(normalizeCode(a)));
          if ((pName.toLowerCase().includes(qLower) || normCode.includes(qLower) || String(docSnap.id).toLowerCase().includes(qLower) || docAliases.some(a => String(a).toLowerCase().includes(qLower))) && !isKnown) {
            seenCodes.add(normCode);
            docAliases.forEach(a => seenCodes.add(normalizeCode(a)));
            seenPatientCodes.add(patKey);
            results.push({
              id: docSnap.id,
              code: String(code),
              fileNumber: d.fileNumber || String(code),
              patientName: pName || 'Patient',
              doctorName: d.doctorName || d.treatingDoctor?.name || 'Treating Physician',
              clinicName: d.clinicName || d.clinic || '',
              title: resolveRxTitle(d),
              partsCount: resolvePartsCount(d),
              date: extractDate(d.prescriptionDate || d.date || d.dispensedDate || d.createdAt || d.created_at),
              importedAt: extractDate(d.importedAt || d.createdAt || d.uploadedAt || docSnap.createTime || d.updatedAt),
              a4PrintCount: d.a4PrintCount || d.printCount || 0,
              lastPrintedA4At: extractDate(d.lastPrintedA4At),
              status: d.status || d.state || 'approved',
              isSigned: Boolean(d.isSigned),
              labeledParts: d.labeledParts || {},
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
