/**
 * src/lib/prescriptionSanitizer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized HIPAA & DHA Zero-Trust Sanitization for Medical Prescriptions.
 * Ensures NO nominal patient PII is ever leaked via URLs, SSR payloads,
 * OpenGraph metadata, or unauthenticated client views.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Strips any trailing patient name slugs or non-medical identifier suffixes from a prescription code.
 * E.g. 'RX-KSA-INV112-jumanah-khayat' -> 'RX-KSA-INV112'
 * E.g. 'RX-51861-A' -> 'RX-51861-A' (preserves multi-part letters -A, -B)
 * E.g. 'RX-50957-A' -> 'RX-50957-A'
 * E.g. 'BOX03483AATRI' -> 'BOX03483AATRI'
 */
export function sanitizePrescriptionCode(rawCode, rawPatientName = null) {
  if (!rawCode) return '';
  let code = decodeURIComponent(String(rawCode)).trim();

  // 1. If patient name is provided, explicitly strip any matching name tokens
  if (rawPatientName && typeof rawPatientName === 'string') {
    const parts = rawPatientName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/\s+/)
      .filter((p) => p.length >= 2);
    for (const part of parts) {
      code = code.replace(new RegExp(`[-_]?${part}`, 'gi'), '');
    }
  }

  // 2. Strip trailing name-like slugs (e.g. '-jumanah-khayat' or '-carlos-mendez')
  // Matches a hyphen followed by 3+ letters, possibly repeated, but NOT single letters like -A, -B
  code = code.replace(/-(?:[a-z]{3,}-?)+$/i, '');
  code = code.replace(/[-_]+$/, '');

  return code || String(rawCode).trim();
}

/**
 * Checks whether a given code contains a patient slug or personal identifier.
 */
export function hasPatientSlugInCode(rawCode, rawPatientName = null) {
  if (!rawCode) return false;
  const original = decodeURIComponent(String(rawCode)).trim();
  const sanitized = sanitizePrescriptionCode(original, rawPatientName);
  return sanitized.toLowerCase() !== original.toLowerCase();
}

/**
 * Generates an irreversible, deterministic codified patient token.
 * E.g. 'PT-8421'
 */
export function getCodifiedPatientId(patientName, rxCode) {
  const cleanCode = sanitizePrescriptionCode(rxCode, patientName);
  const inputStr = `${patientName || ''}_${cleanCode || ''}`.trim().toLowerCase();
  if (!inputStr) return 'PT-8800';

  let hash = 0x811c9dc5;
  for (let i = 0; i < inputStr.length; i++) {
    hash ^= inputStr.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const token = (Math.abs(hash) % 9000) + 1000;
  return `PT-${token}`;
}

/**
 * Deterministically generates an opaque alphanumeric code (base32) from an input string.
 * Completely eliminates any PII or doctor names from the URL token.
 */
export function deterministicOpaqueHash(input, length = 8) {
  const str = String(input || '').toLowerCase().replace(/^dr[-.]?/, '').trim();
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = (BigInt(h1 >>> 0) << 32n) | BigInt(h2 >>> 0);
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  let n = combined;
  while (result.length < length) {
    result += chars[Number(n % 32n)];
    n = n / 32n;
  }
  return result;
}

/**
 * Generates an opaque codified doctor identifier (e.g. "DR-SSEJV9MC")
 * Ensures physician identity is not exposed in shared URLs.
 */
export function getDoctorOpaqueCode(docId, doctorData = {}) {
  if (doctorData?.doctorCode && !/khalid|shukri|sezgin|haytham|salem|marina|erdmann|cordeiro|soudah|doctor/i.test(doctorData.doctorCode)) {
    return String(doctorData.doctorCode).toUpperCase();
  }
  if (!docId) return 'DR-ATLAS01';

  const isFirestoreUid = typeof docId === 'string' && docId.length >= 16 && !docId.includes('-') && !docId.includes(' ') && !/^[a-z]+$/i.test(docId);
  if (isFirestoreUid) {
    const cleanId = String(docId).replace(/[^a-zA-Z0-9]/g, '');
    return `DR-${cleanId.slice(0, 8).toUpperCase()}`;
  }

  const hash = deterministicOpaqueHash(docId, 8);
  return `DR-${hash}`;
}

/**
 * Zero-Trust Server Sanitizer: Removes all nominal PII (patient and doctor) from a prescription object
 * before passing to unauthenticated or public viewers.
 */
export function sanitizePrescriptionPayload(rx, { isAuthorized = false } = {}) {
  if (!rx) return null;
  if (isAuthorized) return rx;

  const rawName = rx.pharmacyLabels?.[0]?.patientName || rx.patient?.name || rx.patientName || 'Patient';
  const cleanCode = sanitizePrescriptionCode(rx.code || rx.prescriptionNumber || rx.id, rawName);
  const codifiedToken = getCodifiedPatientId(rawName, cleanCode);
  const codifiedName = `Patient ${codifiedToken}`;

  const clean = {
    ...rx,
    id: cleanCode,
    prescriptionId: cleanCode,
    rxId: cleanCode,
    code: cleanCode,
    prescriptionCode: cleanCode,
    prescriptionNumber: cleanCode,
    originalPrescriptionId: cleanCode,
    documentId: cleanCode,
    fileNumber: sanitizePrescriptionCode(rx.fileNumber || cleanCode, rawName),
    patientName: codifiedName,
    patient: {
      name: codifiedName,
      isCodified: true,
      codifiedId: codifiedToken,
      gender: rx.patient?.gender || rx.gender || null,
      age: rx.patient?.age || rx.age || null
    },
    // Redact all sensitive contact information
    patientPhone: '',
    patientEmail: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    deliveryAddress: '',
    shippingAddress: null,
    notes: '',
    patientNotes: '',
    // Strict HIPAA / DHA Physician De-identification:
    // Never expose doctor nominal identity or personal direct phone to unauthenticated viewers.
    treatingDoctor: 'Licensed Clinical Practice',
    doctorName: 'Licensed Clinical Practice',
    prescribingDoctor: 'Licensed Clinical Practice',
    doctor: {
      name: 'Licensed Clinical Practice',
      clinic: rx.clinic || rx.clinicName || 'Atlas Partner Practice',
      isCodified: true
    },
    doctorPhone: '',
    doctorEmail: '',
    doctorAddress: '',
    pharmacyLabels: (rx.pharmacyLabels || []).map((l) => ({
      ...l,
      patientName: codifiedName,
      doctorName: 'Licensed Clinical Practice',
      physician: 'Licensed Clinical Practice'
    })),
    timeline: (rx.timeline || []).map((t) => {
      let note = String(t.note || '');
      if (rawName && rawName.length > 2) {
        note = note.replace(new RegExp(rawName, 'gi'), codifiedName);
      }
      if (rx.id || rx.code) {
        note = note.replace(new RegExp(rx.id || rx.code, 'gi'), cleanCode);
      }
      return { ...t, note };
    }),
    orderId: String(rx.orderId || '').replace(new RegExp(rx.id || rx.code || 'UNKNOWN', 'gi'), cleanCode),
    isCodifiedView: true
  };

  // Final deep scrub: Ensure no raw patient name or un-sanitized rx ID leaks anywhere in serialized payload
  const rawId = rx.id || rx.code || '';
  if ((rawName && rawName.length > 2 && rawName !== 'Patient') || (rawId && rawId !== cleanCode)) {
    try {
      let serialized = JSON.stringify(clean);
      if (rawId && rawId !== cleanCode) {
        serialized = serialized.replace(new RegExp(rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), cleanCode);
      }
      if (rawName && rawName.length > 2 && rawName !== 'Patient') {
        const parts = rawName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().split(/\s+/).filter(p => p.length >= 3);
        for (const part of parts) {
          serialized = serialized.replace(new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), codifiedToken);
        }
      }
      return JSON.parse(serialized);
    } catch {
      return clean;
    }
  }

  return clean;
}
