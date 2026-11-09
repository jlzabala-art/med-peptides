import { NextResponse } from 'next/server';
import { adminDb, admin } from '@/lib/firebaseAdmin';
import { invalidateRxCache } from '@/lib/rxCache';
import { syncPrescriptionToAlgolia } from '@/services/algoliaSyncService';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { getCustomsFriendlySuggestions } from '@/utils/labels/customsNaming';

export const dynamic = 'force-dynamic';

const MAX_PAYLOAD_BYTES = 500 * 1024; // 500 KB limit

/**
 * Recursively removes all undefined values while preserving Firestore FieldValues and Dates.
 */
function deepSanitize(obj, depth = 0) {
  if (depth > 12) return obj;
  if (obj === undefined || obj === null) return null;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (obj.constructor && (obj.constructor.name === 'FieldValue' || obj._methodName || typeof obj.isEqual === 'function')) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => deepSanitize(item, depth + 1));
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
 * Resolves a prescription document using the Firebase Admin SDK.
 */
async function resolvePrescriptionDocAdmin(rawId, fallbackCandidates = []) {
  if (!adminDb) throw new Error('Firestore Admin database is not initialized');

  // 1. Direct document lookup by Firestore ID
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

  // 2. Query fallback across identifiers (code, fileNumber, prescriptionCode, etc.)
  const candidates = [
    String(rawId || ''),
    String(rawId || '').replace(/^#/, ''),
    ...fallbackCandidates.map(c => String(c || '').replace(/^#/, ''))
  ].filter(Boolean);

  for (const cand of candidates) {
    for (const field of ['code', 'prescriptionCode', 'fileNumber', 'prescriptionNumber', 'id', 'fagron.boxId', 'fagronDetails.boxId']) {
      try {
        const snap = await adminDb.collection('prescriptions')
          .where(field, '==', cand)
          .limit(1)
          .get();
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          return { ref: docSnap.ref, data: docSnap.data(), id: docSnap.id };
        }
      } catch {
        // Continue
      }
    }
  }

  throw new Error(`Prescription "${rawId || 'target'}" not found in Firestore.`);
}

/**
 * POST /api/labels/save
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Server-Side Persistence for Compounding Labels.
 *
 * Solves the critical client-side permission issue where public/account-manager
 * users in /labels could not write to prescriptions due to firestore.rules.
 *
 * Uses the Firebase Admin SDK to bypass client restrictions and atomically:
 *  1. Persists `pharmacyLabels` array on the prescription document.
 *  2. Writes the granular audit snapshot into subcollection `prescriptions/{rxId}/labels/part_{n}`.
 *  3. Syncs essential label scalar fields (patientName, apis, volume, directions, etc.).
 *  4. Invalidates the server-side rxCache.
 *  5. Re-syncs the updated record to Algolia for instant search accuracy.
 */
export async function POST(request) {
  const rateInfo = checkRateLimit(request, { limit: 60, windowMs: 60 * 1000, tier: 'labels-save' });
  if (!rateInfo.allowed) {
    return rateLimitExceededResponse(rateInfo);
  }

  try {
    const raw = await request.text();
    if (raw.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 });
    }

    const body = JSON.parse(raw || '{}');
    const {
      rawId,
      currentItem = {},
      markdownText = '',
      activeVariant = 'backQr',
      labels = [],
      selectedProductIdx = 0,
      editedOverrides = {},
      actorId = 'pharmacy_label_studio',
      approvalStatus = null
    } = body;

    if (!rawId && !currentItem.id && !currentItem.fileNumber && !currentItem.rxCode) {
      return NextResponse.json({ success: false, error: 'Missing prescription identifier (rawId).' }, { status: 400 });
    }

    const targetId = rawId || currentItem.rxId || currentItem.id || currentItem.fileNumber || currentItem.rxCode;
    const { ref: targetDocRef, data: existingData, id: resolvedDocId } = await resolvePrescriptionDocAdmin(
      targetId,
      [currentItem.fileNumber, currentItem.rxCode, currentItem.batchCode, currentItem.id]
    );

    // 🛡️ Security Check: Prevent modifying archived or cancelled prescriptions
    const existingStatus = String(existingData?.status || '').toLowerCase().trim();
    if (['archived', 'cancelled', 'anulada', 'archivada', 'purgada'].includes(existingStatus)) {
      return NextResponse.json({
        success: false,
        error: `Prescription is locked (${existingStatus}) and cannot be modified.`
      }, { status: 403 });
    }

    const nowIso = new Date().toISOString();
    const phaseIdx = Math.max(0, (currentItem.phaseNumber || selectedProductIdx + 1) - 1);
    const partKey = `part_${phaseIdx + 1}`;

    // Resolve Customs & Delivery Titles
    const shippingTitleResolved = currentItem.shippingTitle
      || getCustomsFriendlySuggestions(currentItem)[0]
      || '';
    const deliveryTitleResolved = currentItem.deliveryTitle
      || currentItem.productTitle
      || currentItem.productName
      || '';

    // Dual Delivery Label Options: 1) Clinical 100% Prescription vs 2) Customs GCC Discreet
    const customsDefaultTitle = getCustomsFriendlySuggestions(currentItem)[0] || 'Botanical Nutrient Complex';
    const deliveryLabelsDual = {
      clinical: {
        title: currentItem.productTitle || currentItem.productName || deliveryTitleResolved,
        directions: currentItem.directions || '',
        storage: currentItem.storage || 'Store at room temperature.',
        type: 'clinical_100_percent',
        updatedAt: nowIso
      },
      customsDiscreet: {
        title: shippingTitleResolved || customsDefaultTitle,
        mnemonic: currentItem.customsMnemonic || '',
        hsCode: currentItem.hsCode || '3304.99',
        directions: currentItem.customsDirections || 'Apply as directed as part of daily wellness regimen.',
        storage: 'Store in a cool, dry place away from direct sunlight.',
        type: 'customs_gcc_discreet',
        updatedAt: nowIso
      }
    };

    // Snapshot existing or new labels
    const allModalLabels = labels.map((lbl, idx) => {
      const ovr = editedOverrides[idx];
      return ovr ? { ...lbl, ...ovr } : lbl;
    });

    const currentLabelsSnapshot = Array.isArray(existingData?.pharmacyLabels) && existingData.pharmacyLabels.length >= allModalLabels.length
      ? [...existingData.pharmacyLabels]
      : [...allModalLabels];

    const prevLabel = currentLabelsSnapshot[phaseIdx] || {};
    const nextVersion = (Number(prevLabel.version) || 0) + 1;
    const resolvedStatus = (typeof approvalStatus === 'string' && approvalStatus.trim())
      || (typeof currentItem.approvalStatus === 'string' && currentItem.approvalStatus.trim())
      || (typeof prevLabel.approvalStatus === 'string' && prevLabel.approvalStatus.trim())
      || 'draft';

    const historyEntry = {
      version: nextVersion,
      status: resolvedStatus,
      savedAt: nowIso,
      variant: activeVariant,
      modifiedBy: actorId,
      shippingTitle: shippingTitleResolved,
      deliveryTitle: deliveryTitleResolved
    };

    const updatedHistory = Array.isArray(prevLabel.history)
      ? [historyEntry, ...prevLabel.history.slice(0, 19)]
      : [historyEntry];

    // Build the updated label object
    const updatedLabelRecord = {
      ...prevLabel,
      ...currentItem,
      phaseNumber: phaseIdx + 1,
      partKey,
      version: nextVersion,
      approvalStatus: resolvedStatus,
      shippingTitle: shippingTitleResolved,
      deliveryTitle: deliveryTitleResolved,
      deliveryLabels: deliveryLabelsDual,
      boldPosology: body.boldPosology !== undefined ? body.boldPosology : (currentItem.boldPosology !== undefined ? currentItem.boldPosology : true),
      lastVariant: activeVariant,
      labelMarkdown: markdownText,
      labelSavedAt: nowIso,
      history: updatedHistory
    };

    currentLabelsSnapshot[phaseIdx] = updatedLabelRecord;

    // Build parent update payload
    const updatePayload = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastModifiedBy: actorId,
      pharmacyLabels: currentLabelsSnapshot,
      deliveryLabels: {
        ...(existingData?.deliveryLabels || {}),
        [partKey]: deliveryLabelsDual
      },
      labelsMeta: {
        lastVariant: activeVariant,
        shippingTitle: shippingTitleResolved,
        deliveryTitle: deliveryTitleResolved,
        partsCount: currentLabelsSnapshot.length,
        savedAt: nowIso,
        schemaVersion: 2,
        activePart: phaseIdx + 1,
        latestApprovalStatus: resolvedStatus
      }
    };

    // Propagate scalar fields into parent doc if present
    if (currentItem.patientName) {
      updatePayload.patientName = currentItem.patientName;
      if (existingData?.patient && typeof existingData.patient === 'object') {
        updatePayload['patient.name'] = currentItem.patientName;
      }
    }

    if (currentItem.doctorName) {
      updatePayload.doctorName = currentItem.doctorName;
    }

    if (currentItem.productTitle || currentItem.productName || currentItem.title) {
      const fullTitle = currentItem.productTitle || currentItem.productName || currentItem.title;
      updatePayload.productTitle = fullTitle;
      updatePayload.productName = fullTitle;
      updatePayload.title = fullTitle;
    }

    if (currentItem.vehicle || currentItem.compoundingVehicle) {
      const vVal = currentItem.vehicle || currentItem.compoundingVehicle;
      updatePayload.vehicle = vVal;
      updatePayload.compoundingVehicle = vVal;
    }

    if (Array.isArray(currentItem.apis) && currentItem.apis.length > 0) {
      updatePayload.apis = currentItem.apis;
      updatePayload.items = currentItem.apis;
    }

    if (currentItem.batchCode) {
      updatePayload.batchCode = currentItem.batchCode;
      updatePayload.dispensingBatch = currentItem.batchCode;
    }

    if (currentItem.volume) updatePayload.volume = currentItem.volume;
    if (currentItem.expDate) {
      updatePayload.expDate = currentItem.expDate;
      updatePayload.expiryDate = currentItem.expDate;
    }
    if (currentItem.prodDate || currentItem.mfgDate) {
      updatePayload.mfgDate = currentItem.prodDate || currentItem.mfgDate;
      updatePayload.prodDate = currentItem.prodDate || currentItem.mfgDate;
    }
    if (currentItem.directions) {
      updatePayload.directions = currentItem.directions;
      updatePayload.instructions = currentItem.directions;
    }
    if (currentItem.storage) updatePayload.storage = currentItem.storage;
    if (currentItem.warnings) updatePayload.warnings = currentItem.warnings;
    if (currentItem.formula) updatePayload.formula = currentItem.formula;

    if (currentItem.pharmacyName || currentItem.dispensingPharmacy || currentItem.pharmacy) {
      const pharm = currentItem.pharmacyName || currentItem.dispensingPharmacy || currentItem.pharmacy;
      updatePayload.pharmacyName = pharm;
      updatePayload.dispensingPharmacy = pharm;
    }

    if (currentItem.pharmacyAddress || currentItem.dispensingPharmacyAddress) {
      const pAddr = currentItem.pharmacyAddress || currentItem.dispensingPharmacyAddress;
      updatePayload.pharmacyAddress = pAddr;
      updatePayload.dispensingPharmacyAddress = pAddr;
    }

    if (markdownText) updatePayload.labelMarkdown = markdownText;

    // Sync sequential parts array if present in existing data
    if (Array.isArray(existingData?.parts)) {
      const updatedParts = [...existingData.parts];
      if (updatedParts[phaseIdx]) {
        updatedParts[phaseIdx] = {
          ...updatedParts[phaseIdx],
          title: currentItem.productTitle || updatedParts[phaseIdx].title,
          volume: currentItem.volume || updatedParts[phaseIdx].volume,
          directions: currentItem.directions || updatedParts[phaseIdx].directions,
          posology: currentItem.directions || updatedParts[phaseIdx].posology,
          vehicle: currentItem.vehicle || updatedParts[phaseIdx].vehicle,
          apis: currentItem.apis || updatedParts[phaseIdx].apis,
          pharmacy: currentItem.pharmacyName || updatedParts[phaseIdx].pharmacy,
          pharmacyAddress: currentItem.pharmacyAddress || updatedParts[phaseIdx].pharmacyAddress,
          expDate: currentItem.expDate || updatedParts[phaseIdx].expDate,
          mfgDate: currentItem.prodDate || currentItem.mfgDate || updatedParts[phaseIdx].mfgDate
        };
        updatePayload.parts = updatedParts;
      }
    }

    // ── Intelligent Refill Scheduling on Save ──
    const textToAnalyze = `${currentItem.productTitle || ''} ${currentItem.directions || ''} ${currentItem.volume || ''}`.toLowerCase();
    let detectedDurationDays = 60;
    if (textToAnalyze.includes('3 months') || textToAnalyze.includes('90 days') || textToAnalyze.includes('90 días')) detectedDurationDays = 90;
    else if (textToAnalyze.includes('2 months') || textToAnalyze.includes('60 days') || textToAnalyze.includes('60 días') || textToAnalyze.includes('2 meses')) detectedDurationDays = 60;
    else if (textToAnalyze.includes('1 month') || textToAnalyze.includes('30 days') || textToAnalyze.includes('30 días') || textToAnalyze.includes('1 mes')) detectedDurationDays = 30;
    else if (textToAnalyze.includes('15 days') || textToAnalyze.includes('15 días')) detectedDurationDays = 15;
    else if (textToAnalyze.includes('10 days') || textToAnalyze.includes('10 días')) detectedDurationDays = 10;

    const startDate = existingData?.treatmentStartDate || existingData?.dateIssued || new Date().toISOString().split('T')[0];
    const startTime = new Date(startDate).getTime();
    const safeStartTime = isNaN(startTime) ? Date.now() : startTime;
    const exhaustionTime = new Date(safeStartTime + detectedDurationDays * 24 * 60 * 60 * 1000);
    const exhaustionDateStr = exhaustionTime.toISOString().split('T')[0];
    const alertTime = new Date(exhaustionTime.getTime() - 15 * 24 * 60 * 60 * 1000);
    const alertDateStr = alertTime.toISOString().split('T')[0];

    updatePayload.courseDurationDays = Number(currentItem.courseDurationDays || existingData?.courseDurationDays || detectedDurationDays);
    updatePayload.exhaustionDate = exhaustionDateStr;
    updatePayload.refillAlertDate = alertDateStr;
    updatePayload.nextRefillDate = currentItem.nextRefillDate || existingData?.nextRefillDate || alertDateStr;
    updatePayload.refillAlertStatus = existingData?.refillAlertStatus || 'scheduled';

    // Sanitize and perform Admin Firestore Update
    const sanitizedPayload = deepSanitize(updatePayload);
    await targetDocRef.update(sanitizedPayload);

    // Save into granular subcollection prescriptions/{rxId}/labels/{partKey}
    try {
      const subcollectionDocRef = targetDocRef.collection('labels').doc(partKey);
      await subcollectionDocRef.set(deepSanitize({
        ...updatedLabelRecord,
        rxId: resolvedDocId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }), { merge: true });
    } catch (subErr) {
      console.warn('[api/labels/save] Subcollection write warning:', subErr.message);
    }

    // Invalidate Server Memory Cache
    try {
      invalidateRxCache(resolvedDocId);
      if (targetId && targetId !== resolvedDocId) invalidateRxCache(targetId);
    } catch {
      // non-fatal
    }

    // Non-blocking Algolia Re-Sync
    syncPrescriptionToAlgolia(resolvedDocId, {
      ...existingData,
      ...sanitizedPayload,
      id: resolvedDocId
    }).catch(err => {
      console.warn('[api/labels/save] Algolia sync non-fatal warning:', err.message);
    });

    return NextResponse.json({
      success: true,
      docId: resolvedDocId,
      updatedLabel: updatedLabelRecord,
      currentLabelsSnapshot,
      version: nextVersion,
      approvalStatus: resolvedStatus
    });
  } catch (error) {
    console.error('[api/labels/save] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

