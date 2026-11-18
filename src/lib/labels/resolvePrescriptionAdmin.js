import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Recursively removes all undefined values while preserving Firestore FieldValues and Dates.
 */
export function deepSanitize(obj, depth = 0) {
  if (depth > 12) return obj;
  if (obj === undefined || obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (obj.constructor && (obj.constructor.name === 'FieldValue' || obj._methodName || typeof obj.isEqual === 'function')) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => deepSanitize(item, depth + 1));
  }
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = deepSanitize(val, depth + 1);
    }
  }
  return clean;
}

/**
 * Resolves a prescription document using the Firebase Admin SDK by doc ID or code/fileNumber.
 */
export async function resolvePrescriptionDocAdmin(rawId, fallbackCandidates = []) {
  if (!adminDb) throw new Error('Firestore Admin database is not initialized');

  if (rawId) {
    try {
      const directRef = adminDb.collection('prescriptions').doc(String(rawId));
      const snap = await directRef.get();
      if (snap.exists) {
        return { ref: directRef, data: snap.data(), id: directRef.id };
      }
    } catch {
      // Continue to query fallback
    }
  }

  const candidates = [
    String(rawId || ''),
    String(rawId || '').replace(/^#/, ''),
    ...fallbackCandidates.map((c) => String(c || '').replace(/^#/, '')),
  ].filter(Boolean);

  // Registry match fallback to expand candidates with known aliases
  try {
    const { PHARMAPOLIS_LABELS_REGISTRY } = await import('@/data/pharmapolisLabelsMap');
    const upperId = String(rawId || '').replace(/^#/, '').toUpperCase();
    const matched = PHARMAPOLIS_LABELS_REGISTRY.find(e => 
      String(e.fileNumber || '').toUpperCase() === upperId ||
      String(e.id || '').toUpperCase() === upperId ||
      (Array.isArray(e.prescriptionMatches) && e.prescriptionMatches.some(m => String(m).toUpperCase() === upperId))
    );
    if (matched) {
      if (matched.fileNumber) candidates.push(matched.fileNumber);
      if (Array.isArray(matched.prescriptionMatches)) {
        matched.prescriptionMatches.forEach(m => candidates.push(String(m)));
      }
    }
  } catch {
    // non-fatal
  }

  for (const cand of candidates) {
    for (const field of [
      'code',
      'prescriptionCode',
      'fileNumber',
      'prescriptionNumber',
      'sampleCode',
      'boxId',
      'id',
      'fagron.boxId',
      'fagron.sampleCode',
      'fagronDetails.boxId',
    ]) {
      try {
        const snap = await adminDb.collection('prescriptions').where(field, '==', cand).limit(1).get();
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { ref: docSnap.ref, data: docSnap.data(), id: docSnap.id };
        }
      } catch {
        // Continue
      }
    }

    try {
      const snapAlias = await adminDb.collection('prescriptions').where('aliases', 'array-contains', cand).limit(1).get();
      if (!snapAlias.empty) {
        const docSnap = snapAlias.docs[0];
        return { ref: docSnap.ref, data: docSnap.data(), id: docSnap.id };
      }
    } catch {
      // Continue
    }
  }

  throw new Error(`Prescription "${rawId || 'target'}" not found in Firestore.`);
}
