import { cache } from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { RX_RAM_CACHE, CACHE_TTL_MS, invalidateRxCache } from '@/lib/rxCache';

export { invalidateRxCache };

// ⚡ Per-Request React Server Component memoization
export const getPrescriptionData = cache(async (code) => {
  if (!adminDb || !code) return null;
  const rawCode = decodeURIComponent(code).trim();
  const upperCode = rawCode.toUpperCase();

  // 1. RAM Cache
  const cached = RX_RAM_CACHE.get(upperCode) || RX_RAM_CACHE.get(rawCode);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  let rxDoc = null;

  // 2. Direct ID (try rawCode, upperCode, RX- prefixed, and RX- stripped)
  let docSnap = await adminDb.collection('prescriptions').doc(rawCode).get().catch(() => null);
  if (!docSnap?.exists && rawCode !== upperCode) {
    docSnap = await adminDb.collection('prescriptions').doc(upperCode).get().catch(() => null);
  }
  if (!docSnap?.exists) {
    const prefixedCode = upperCode.startsWith('RX-') ? upperCode : `RX-${upperCode}`;
    docSnap = await adminDb.collection('prescriptions').doc(prefixedCode).get().catch(() => null);
  }
  if (!docSnap?.exists && upperCode.startsWith('RX-')) {
    const strippedCode = upperCode.replace(/^RX-/, '');
    docSnap = await adminDb.collection('prescriptions').doc(strippedCode).get().catch(() => null);
  }
  if (docSnap && docSnap.exists) {
    rxDoc = { id: docSnap.id, ...docSnap.data() };
  }

  const cleanCodeNoPrefix = upperCode.replace(/^RX-/, '');
  const prefixedCode = upperCode.startsWith('RX-') ? upperCode : `RX-${upperCode}`;
  const codesToSearch = Array.from(new Set([upperCode, rawCode, cleanCodeNoPrefix, prefixedCode]));

  // 3. Prescription Number lookup
  if (!rxDoc) {
    const qSnap = await adminDb.collection('prescriptions')
      .where('prescriptionNumber', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap && !qSnap.empty) {
      rxDoc = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() };
    }
  }

  // 4. Fallback search by prescriptionCode or code
  if (!rxDoc) {
    const qSnap2 = await adminDb.collection('prescriptions')
      .where('prescriptionCode', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap2 && !qSnap2.empty) {
      rxDoc = { id: qSnap2.docs[0].id, ...qSnap2.docs[0].data() };
    }
  }

  if (!rxDoc) {
    const qSnap3 = await adminDb.collection('prescriptions')
      .where('code', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap3 && !qSnap3.empty) {
      rxDoc = { id: qSnap3.docs[0].id, ...qSnap3.docs[0].data() };
    }
  }

  if (!rxDoc) {
    const qSnap4 = await adminDb.collection('prescriptions')
      .where('fileNumber', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap4 && !qSnap4.empty) {
      rxDoc = { id: qSnap4.docs[0].id, ...qSnap4.docs[0].data() };
    }
  }

  // 5. Fallback search by Fagron sample code / boxId
  if (!rxDoc) {
    const qSnap5 = await adminDb.collection('prescriptions')
      .where('fagron.boxId', 'in', codesToSearch)
      .limit(1)
      .get()
      .catch(() => null);
    if (qSnap5 && !qSnap5.empty) {
      rxDoc = { id: qSnap5.docs[0].id, ...qSnap5.docs[0].data() };
    }
  }

  // 6. Fallback search by document ID prefix (e.g. #RX-6F8QZC or 6F8QZC from 20-char Firestore IDs)
  if (!rxDoc && cleanCodeNoPrefix.length >= 5) {
    try {
      const lower = cleanCodeNoPrefix.toLowerCase();
      const end = lower.slice(0, -1) + String.fromCharCode(lower.charCodeAt(lower.length - 1) + 1);
      const { FieldPath } = await import('firebase-admin/firestore');
      const prefixSnap = await adminDb.collection('prescriptions')
        .where(FieldPath.documentId(), '>=', lower)
        .where(FieldPath.documentId(), '<', end)
        .limit(1)
        .get()
        .catch(() => null);
      if (prefixSnap && !prefixSnap.empty) {
        rxDoc = { id: prefixSnap.docs[0].id, ...prefixSnap.docs[0].data() };
      }
    } catch (e) {
      console.warn('Prefix match fallback failed:', e.message);
    }
  }

  if (!rxDoc) return null;

  // If this prescription belongs to a Fagron multi-part box or rxGroupId, fetch linked parts
  const boxId = rxDoc.fagron?.boxId;
  const rxGroupId = rxDoc.rxGroupId;
  if (boxId || rxGroupId) {
    try {
      const partsQuery = rxGroupId
        ? adminDb.collection('prescriptions').where('rxGroupId', '==', rxGroupId).limit(10)
        : adminDb.collection('prescriptions').where('fagron.boxId', '==', boxId).limit(10);
      const partsSnap = await partsQuery.get().catch(() => null);
      if (partsSnap && partsSnap.size > 1) {
        const parts = partsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Deduplicate parts by partNumber (e.g. parent alias RX-51857 and part RX-51857-A)
        const uniquePartsMap = new Map();
        for (const p of parts) {
          const pNum = p.partNumber || 1;
          if (!uniquePartsMap.has(pNum) || p.id.includes('-')) {
            uniquePartsMap.set(pNum, p);
          }
        }
        const sortedParts = Array.from(uniquePartsMap.values()).sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
        rxDoc._sessionMembers = sortedParts;
        rxDoc.isMultiPart = sortedParts.length > 1;
        rxDoc.totalParts = sortedParts.length;
        rxDoc.allSessionItems = sortedParts.flatMap(p => p.items || p.prescriptionLines || []);
      }
    } catch (e) {
      console.warn('Failed to query linked multi-part prescriptions:', e);
    }
  }

  // Zero-trust sanitization for public access:
  // Convert timestamps to ISO strings
  const cleanRx = JSON.parse(JSON.stringify(rxDoc, (key, value) => {
    if (value && typeof value === 'object' && ('_seconds' in value || 'seconds' in value)) {
      const s = value._seconds ?? value.seconds;
      return new Date(s * 1000).toISOString();
    }
    return value;
  }));

  // Mask sensitive phone
  if (cleanRx.patient?.phone) {
    const p = cleanRx.patient.phone;
    cleanRx.patient.maskedPhone = p.length > 6 ? `${p.slice(0, 5)} *** **${p.slice(-2)}` : 'Confidential';
  }

  if (cleanRx.clinic && cleanRx.clinic.toLowerCase().includes('mediluxe')) {
    cleanRx.clinic = 'Atlas Services Clinical Care';
  }

  const result = {
    ...cleanRx,
    verifiedAt: new Date().toISOString(),
    isAuthentic: true
  };

  RX_RAM_CACHE.set(upperCode, {
    data: result,
    expiresAt: Date.now() + CACHE_TTL_MS
  });
  if (rawCode !== upperCode) {
    RX_RAM_CACHE.set(rawCode, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS
    });
  }

  return result;
});
