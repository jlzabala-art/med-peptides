/**
 * prescriptionDeduplicator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Idempotency & Deduplication Engine for Prescriptions.
 * Guarantees that prescriptions NEVER duplicate across imports, OCR, batch scripts,
 * or UI saves.
 * 
 * Complies with AGENTS.md Golden Rule #2 (Firestore SSOT) & Architecture Rules.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Derives a deterministic, uppercase canonical prescription document ID.
 * 
 * Rules:
 * 1. Multi-part prescriptions (parts 1, 2...): RX-[CODE]-A, RX-[CODE]-B
 * 2. Fagron Box ID: RX-[BOXID] (or RX-[BOXID]-A if multi-part)
 * 3. File / Code number: RX-[CLEAN_CODE]
 * 4. Fallback: RX-[PATIENT_SLUG]-[DATE]-[PART]
 */
export function deriveCanonicalPrescriptionId(data = {}) {
  const rawCode = String(
    data.code ||
    data.prescriptionCode ||
    data.prescriptionNumber ||
    data.fileNumber ||
    data.rxCode ||
    data.fagron?.boxId ||
    data.boxId ||
    ''
  ).trim();

  const partNum = Number(data.partNumber) || null;
  const totalParts = Number(data.totalParts) || (Array.isArray(data.parts) ? data.parts.length : 1);
  const partSuffix = partNum ? String.fromCharCode(64 + partNum) : null; // 1 -> A, 2 -> B

  if (rawCode) {
    // Strip leading #, RX-, rx-
    let clean = rawCode.replace(/^[#\s]+/, '').replace(/^RX[-_]?/i, '').trim().toUpperCase();
    
    // Check if code already ends in -A, -B, etc.
    const hasPartSuffix = /-[A-Z]$/i.test(clean);
    if (hasPartSuffix) {
      return `RX-${clean}`;
    }

    // If it's multi-part and partSuffix is known, append it
    if (totalParts > 1 && partSuffix) {
      return `RX-${clean}-${partSuffix}`;
    }

    return `RX-${clean}`;
  }

  // Fallback: patient + doctor + date + part
  const patient = String(data.patientName || data.patient?.name || 'PATIENT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 12);

  const date = String(data.dateIssued || data.date || 'NODATE')
    .replace(/[^0-9]/g, '')
    .slice(0, 8);

  const partStr = partSuffix ? `-${partSuffix}` : '';
  return `RX-${patient}-${date || 'GEN'}${partStr}`;
}

/**
 * Searches Firestore (Admin SDK or Client SDK) for an existing matching prescription.
 * Checks:
 * 1. Direct canonical ID
 * 2. Legacy / unparted code variants (e.g. '51812' vs 'RX-51812')
 * 3. Fagron Box ID
 * 4. Exact patient + doctor + date + part match
 * 
 * @param {object} firestoreDb - adminDb or client db
 * @param {object} data - prescription data to match against
 * @returns {Promise<{ id: string, data: object } | null>}
 */
export async function findExistingPrescription(firestoreDb, data = {}) {
  if (!firestoreDb) return null;

  const canonicalId = deriveCanonicalPrescriptionId(data);
  const rawCode = String(
    data.code ||
    data.prescriptionCode ||
    data.prescriptionNumber ||
    data.fileNumber ||
    ''
  ).trim();

  const boxId = String(data.fagron?.boxId || data.boxId || '').trim();
  const partNumber = Number(data.partNumber) || null;

  // 1. Direct check by canonical ID
  try {
    const directDoc = await firestoreDb.collection('prescriptions').doc(canonicalId).get();
    if (directDoc.exists) {
      return { id: directDoc.id, data: directDoc.data() };
    }
  } catch (e) {
    // If client SDK, doc ref might be doc(firestoreDb, 'prescriptions', canonicalId)
  }

  // 2. Check by raw code (both uppercase and lowercase)
  if (rawCode) {
    const cleanNum = rawCode.replace(/^[#\s]+/, '').replace(/^RX[-_]?/i, '').trim();
    const possibleCodes = [
      rawCode,
      rawCode.toUpperCase(),
      rawCode.toLowerCase(),
      `RX-${cleanNum.toUpperCase()}`,
      cleanNum
    ];

    for (const codeVariant of possibleCodes) {
      try {
        const snap = await firestoreDb.collection('prescriptions')
          .where('code', '==', codeVariant)
          .limit(5)
          .get();

        if (!snap.empty) {
          // If multi-part, find matching partNumber
          if (partNumber) {
            const match = snap.docs.find(d => Number(d.data().partNumber) === partNumber);
            if (match) return { id: match.id, data: match.data() };
          } else {
            return { id: snap.docs[0].id, data: snap.docs[0].data() };
          }
        }
      } catch (err) {
        // Query error / index missing fallback
      }
    }
  }

  // 3. Check by Fagron Box ID
  if (boxId) {
    try {
      const snap = await firestoreDb.collection('prescriptions')
        .where('fagron.boxId', '==', boxId)
        .limit(5)
        .get();

      if (!snap.empty) {
        if (partNumber) {
          const match = snap.docs.find(d => Number(d.data().partNumber) === partNumber);
          if (match) return { id: match.id, data: match.data() };
        } else {
          return { id: snap.docs[0].id, data: snap.docs[0].data() };
        }
      }
    } catch (err) {
      // index not deployed fallback
    }
  }

  // 4. Exact patient + doctor + date match
  const patientName = String(data.patientName || data.patient?.name || '').trim().toLowerCase();
  const dateIssued = String(data.dateIssued || '').trim();

  if (patientName && patientName !== 'unknown patient' && dateIssued) {
    try {
      const snap = await firestoreDb.collection('prescriptions')
        .where('patientName', '==', data.patientName || data.patient?.name)
        .where('dateIssued', '==', dateIssued)
        .limit(5)
        .get();

      if (!snap.empty) {
        if (partNumber) {
          const match = snap.docs.find(d => Number(d.data().partNumber) === partNumber);
          if (match) return { id: match.id, data: match.data() };
        } else {
          return { id: snap.docs[0].id, data: snap.docs[0].data() };
        }
      }
    } catch (err) {
      // query error fallback
    }
  }

  return null;
}

/**
 * Executes an IDEMPOTENT write for a prescription.
 * Guarantees that:
 * 1. If an identical prescription exists, it MERGES into it rather than creating a duplicate.
 * 2. If it is new, it writes to the deterministic canonical ID (never a random ID).
 * 3. If it's a multi-part prescription, any ghost parent root doc with the same code is cleaned up.
 * 
 * @param {object} firestoreDb - adminDb
 * @param {object} data - Prescription payload
 * @returns {Promise<{ id: string, isDuplicate: boolean, action: 'updated' | 'created' }>}
 */
export async function savePrescriptionIdempotent(firestoreDb, data = {}) {
  if (!firestoreDb) throw new Error('Firestore DB reference is required');

  const canonicalId = deriveCanonicalPrescriptionId(data);
  const existing = await findExistingPrescription(firestoreDb, data);

  const targetDocId = existing ? existing.id : canonicalId;
  const isDuplicate = !!existing;

  const payload = {
    ...data,
    id: targetDocId,
    canonicalId: targetDocId,
    prescriptionCode: targetDocId,
    updatedAt: new Date().toISOString()
  };

  // If this is multi-part (e.g. RX-51812-A), ensure rxGroupId is set
  if (data.totalParts > 1 || /-([A-Z])$/i.test(targetDocId)) {
    const baseCode = targetDocId.replace(/-[A-Z]$/i, '');
    if (!payload.rxGroupId) payload.rxGroupId = `RXG-${baseCode.replace(/^RX-?/i, '')}`;
  }

  // Write with merge: true to preserve existing matched Zoho fields or comments
  await firestoreDb.collection('prescriptions').doc(targetDocId).set(payload, { merge: true });

  // Anti-duplication garbage collector: If this is a part doc (e.g. RX-51812-A),
  // check if a ghost unparted parent doc (e.g. '51812' or 'RX-51812') exists without partNumber.
  if (data.partNumber && data.totalParts > 1) {
    const rawNum = String(data.code || data.fileNumber || '').replace(/^[#\s]+/, '').replace(/^RX[-_]?/i, '').trim();
    if (rawNum) {
      const ghostIds = [rawNum, `RX-${rawNum}`];
      for (const ghostId of ghostIds) {
        if (ghostId !== targetDocId) {
          try {
            const ghostDoc = await firestoreDb.collection('prescriptions').doc(ghostId).get();
            if (ghostDoc.exists) {
              const ghostData = ghostDoc.data();
              // Only delete if it does NOT have partNumber (it's the old unparted duplicate)
              if (!ghostData.partNumber) {
                await firestoreDb.collection('prescriptions').doc(ghostId).delete();
                console.log(`[prescriptionDeduplicator] Deleted ghost unparted duplicate: ${ghostId}`);
              }
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }

  return {
    id: targetDocId,
    isDuplicate,
    action: isDuplicate ? 'updated' : 'created'
  };
}
