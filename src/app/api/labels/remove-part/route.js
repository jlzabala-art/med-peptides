import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebaseAdmin';
import { invalidateRxCache } from '@/lib/rxCache';
import { syncPrescriptionToAlgolia } from '@/services/algoliaSyncService';
import { checkRateLimit, rateLimitExceededResponse } from '@/utils/rateLimiter';
import { deepSanitize, resolvePrescriptionDocAdmin } from '@/lib/labels/resolvePrescriptionAdmin';
import { isAdminServerSession } from '@/lib/serverAdminAuth';

export const dynamic = 'force-dynamic';

const LOCKED_STATUSES = ['archived', 'cancelled', 'anulada', 'archivada', 'purgada'];

function reindexLabels(labels = []) {
  return labels.map((lbl, idx) => ({
    ...(lbl || {}),
    phaseNumber: idx + 1,
    partKey: `part_${idx + 1}`,
  }));
}

async function syncPostMutation(targetDocRef, resolvedDocId, existingData, updatePayload, targetId) {
  const sanitized = deepSanitize(updatePayload);
  await targetDocRef.update(sanitized);

  try {
    const labelsCol = targetDocRef.collection('labels');
    const existingSubs = await labelsCol.get();
    const batch = targetDocRef.firestore.batch();
    existingSubs.docs.forEach((d) => batch.delete(d.ref));
    (sanitized.pharmacyLabels || []).forEach((lbl, idx) => {
      const partKey = `part_${idx + 1}`;
      batch.set(
        labelsCol.doc(partKey),
        deepSanitize({
          ...lbl,
          rxId: resolvedDocId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      );
    });
    await batch.commit();
  } catch (subErr) {
    console.warn('[api/labels/remove-part] Subcollection sync warning:', subErr.message);
  }

  try {
    invalidateRxCache(resolvedDocId);
    if (targetId && targetId !== resolvedDocId) invalidateRxCache(targetId);
  } catch {
    // non-fatal
  }

  syncPrescriptionToAlgolia(resolvedDocId, {
    ...existingData,
    ...sanitized,
    id: resolvedDocId,
  }).catch((err) => {
    console.warn('[api/labels/remove-part] Algolia sync non-fatal warning:', err.message);
  });

  return sanitized;
}

/**
 * POST /api/labels/remove-part
 * Removes a single part/formula from an imported prescription (when the client
 * only wants a subset of the prescription), preserving an undo snapshot in `removedParts`.
 */
export async function POST(request) {
  if (!(await isAdminServerSession())) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  const rateInfo = checkRateLimit(request, { limit: 40, windowMs: 60 * 1000, tier: 'labels-remove-part' });
  if (!rateInfo.allowed) return rateLimitExceededResponse(rateInfo);

  try {
    const body = await request.json();
    const {
      rawId,
      partIndex,
      labelsSnapshot = null,
      reason = 'Client opted out of this item',
      actorId = 'pharmacy_label_studio',
    } = body || {};

    if (!rawId || typeof partIndex !== 'number' || partIndex < 0) {
      return NextResponse.json({ success: false, error: 'rawId and valid partIndex are required.' }, { status: 400 });
    }

    const { ref: targetDocRef, data: existingData, id: resolvedDocId } = await resolvePrescriptionDocAdmin(rawId);
    const existingStatus = String(existingData?.status || '').toLowerCase().trim();
    if (LOCKED_STATUSES.includes(existingStatus)) {
      return NextResponse.json(
        { success: false, error: `Prescription is locked (${existingStatus}) and cannot be modified.` },
        { status: 403 }
      );
    }

    const baseLabels =
      Array.isArray(existingData?.pharmacyLabels) && existingData.pharmacyLabels.length > 0
        ? [...existingData.pharmacyLabels]
        : Array.isArray(labelsSnapshot)
        ? [...labelsSnapshot]
        : [];

    if (baseLabels.length <= 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'A prescription must retain at least 1 active part. Archive or cancel the full prescription instead.',
        },
        { status: 400 }
      );
    }

    if (partIndex >= baseLabels.length) {
      return NextResponse.json({ success: false, error: 'partIndex out of range.' }, { status: 400 });
    }

    const removedLabel = baseLabels[partIndex] || null;
    const nextLabels = reindexLabels(baseLabels.filter((_, idx) => idx !== partIndex));

    const origParts = Array.isArray(existingData?.parts) ? [...existingData.parts] : [];
    const removedPart = partIndex < origParts.length ? origParts[partIndex] : null;
    const nextParts = origParts.length > partIndex ? origParts.filter((_, idx) => idx !== partIndex) : origParts;

    const origItems = Array.isArray(existingData?.items) ? [...existingData.items] : [];
    const removedItem = origItems.length === baseLabels.length ? origItems[partIndex] : null;
    const nextItems = origItems.length === baseLabels.length ? origItems.filter((_, idx) => idx !== partIndex) : origItems;

    const origLines = Array.isArray(existingData?.prescriptionLines) ? [...existingData.prescriptionLines] : [];
    const removedLine = origLines.length === baseLabels.length ? origLines[partIndex] : null;
    const nextLines = origLines.length === baseLabels.length ? origLines.filter((_, idx) => idx !== partIndex) : origLines;

    const existingRemoved = Array.isArray(existingData?.removedParts) ? [...existingData.removedParts] : [];
    const archiveEntry = {
      id: `rem_${Date.now()}_${partIndex}`,
      originalIndex: partIndex,
      title:
        removedLabel?.productTitle ||
        removedLabel?.productName ||
        removedPart?.title ||
        removedItem?.name ||
        `Part ${partIndex + 1}`,
      reason: String(reason || '').trim() || 'Client opted out of this item',
      removedAt: new Date().toISOString(),
      removedBy: actorId,
      labelSnapshot: removedLabel,
      partSnapshot: removedPart,
      itemSnapshot: removedItem,
      lineSnapshot: removedLine,
    };

    const updatePayload = {
      pharmacyLabels: nextLabels,
      parts: nextParts,
      partsCount: nextLabels.length,
      itemsCount: nextLabels.length,
      ...(origItems.length === baseLabels.length ? { items: nextItems } : {}),
      ...(origLines.length === baseLabels.length ? { prescriptionLines: nextLines } : {}),
      removedParts: [archiveEntry, ...existingRemoved].slice(0, 20),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastEditedBy: actorId,
    };

    const sanitized = await syncPostMutation(targetDocRef, resolvedDocId, existingData, updatePayload, rawId);

    return NextResponse.json({
      success: true,
      docId: resolvedDocId,
      labels: sanitized.pharmacyLabels,
      parts: sanitized.parts,
      partsCount: sanitized.partsCount || sanitized.pharmacyLabels.length,
      removedParts: sanitized.removedParts,
      nextIndex: Math.min(partIndex, sanitized.pharmacyLabels.length - 1),
    });
  } catch (error) {
    console.error('[api/labels/remove-part] POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/labels/remove-part
 * Restores a previously removed part from `removedParts[removedIndex]`.
 */
export async function PUT(request) {
  const rateInfo = checkRateLimit(request, { limit: 40, windowMs: 60 * 1000, tier: 'labels-restore-part' });
  if (!rateInfo.allowed) return rateLimitExceededResponse(rateInfo);

  try {
    const body = await request.json();
    const { rawId, removedIndex = 0, actorId = 'pharmacy_label_studio' } = body || {};

    if (!rawId) {
      return NextResponse.json({ success: false, error: 'rawId is required.' }, { status: 400 });
    }

    const { ref: targetDocRef, data: existingData, id: resolvedDocId } = await resolvePrescriptionDocAdmin(rawId);
    const existingRemoved = Array.isArray(existingData?.removedParts) ? [...existingData.removedParts] : [];
    const targetEntry = existingRemoved[removedIndex];

    if (!targetEntry) {
      return NextResponse.json({ success: false, error: 'Removed part snapshot not found.' }, { status: 404 });
    }

    const baseLabels = Array.isArray(existingData?.pharmacyLabels) ? [...existingData.pharmacyLabels] : [];
    const insertAt = Math.min(
      Math.max(0, Number(targetEntry.originalIndex ?? baseLabels.length)),
      baseLabels.length
    );

    if (targetEntry.labelSnapshot) {
      baseLabels.splice(insertAt, 0, targetEntry.labelSnapshot);
    }
    const nextLabels = reindexLabels(baseLabels);

    const nextParts = Array.isArray(existingData?.parts) ? [...existingData.parts] : [];
    if (targetEntry.partSnapshot) {
      nextParts.splice(Math.min(insertAt, nextParts.length), 0, targetEntry.partSnapshot);
    }

    const nextItems = Array.isArray(existingData?.items) ? [...existingData.items] : [];
    if (targetEntry.itemSnapshot) {
      nextItems.splice(Math.min(insertAt, nextItems.length), 0, targetEntry.itemSnapshot);
    }

    const nextLines = Array.isArray(existingData?.prescriptionLines) ? [...existingData.prescriptionLines] : [];
    if (targetEntry.lineSnapshot) {
      nextLines.splice(Math.min(insertAt, nextLines.length), 0, targetEntry.lineSnapshot);
    }

    const remainingRemoved = existingRemoved.filter((_, idx) => idx !== removedIndex);

    const updatePayload = {
      pharmacyLabels: nextLabels,
      parts: nextParts,
      partsCount: nextLabels.length,
      itemsCount: nextLabels.length,
      ...(targetEntry.itemSnapshot ? { items: nextItems } : {}),
      ...(targetEntry.lineSnapshot ? { prescriptionLines: nextLines } : {}),
      removedParts: remainingRemoved,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastEditedBy: actorId,
    };

    const sanitized = await syncPostMutation(targetDocRef, resolvedDocId, existingData, updatePayload, rawId);

    return NextResponse.json({
      success: true,
      docId: resolvedDocId,
      labels: sanitized.pharmacyLabels,
      parts: sanitized.parts,
      partsCount: sanitized.partsCount || sanitized.pharmacyLabels.length,
      removedParts: sanitized.removedParts,
      restoredIndex: insertAt,
    });
  } catch (error) {
    console.error('[api/labels/remove-part] PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
