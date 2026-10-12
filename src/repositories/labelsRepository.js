/**
 * labelsRepository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Firestore repository for Compounded & Dispensary Labels.
 * Adheres to Golden Rules:
 *   #2  Firestore is the Single Source of Truth + Multi-tier caching + Cache Invalidation
 *   #8  Unified Status Taxonomy ('draft', 'approved')
 *   #28 Strict status vocabulary
 *
 * Persists labels into both:
 *   1. prescriptions/{rxId} document (pharmacyLabels array + labelsMeta) for fast atomic hydration
 *   2. prescriptions/{rxId}/labels/{partKey} subcollection for granular audit trail & version history
 */

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { getCustomsFriendlySuggestions } from '../utils/labels/customsNaming';
import { prescriptionRepository } from './prescriptionRepository';
import { logger } from '../utils/logger';

// Layer 1: In-memory cache with TTL (Golden Rule #2)
const memoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export const labelsRepository = {
  /**
   * Clears the in-memory cache for a given prescription ID (or all).
   */
  invalidateLabelsCache(rxId = null) {
    if (rxId) {
      memoryCache.delete(String(rxId));
    } else {
      memoryCache.clear();
    }
    if (rxId && typeof prescriptionRepository?.invalidatePrescriptionCache === 'function') {
      prescriptionRepository.invalidatePrescriptionCache(String(rxId));
    }
  },

  /**
   * Resolves a target prescription Firestore document reference & data
   * by direct ID or fallback search across codes/file numbers.
   */
  async resolvePrescriptionDoc(rawId, fallbackCandidates = []) {
    if (!db) throw new Error('Firestore database is not initialized');

    let targetDocRef = null;
    let existingData = null;

    // 1. Direct document lookup
    if (rawId) {
      try {
        const directRef = doc(db, 'prescriptions', String(rawId));
        const snap = await getDoc(directRef);
        if (snap.exists()) {
          return { ref: directRef, data: snap.data() };
        }
      } catch (err) {
        logger.warn('[labelsRepository] Direct lookup fallback:', err);
      }
    }

    // 2. Query fallback across identifiers
    const candidates = [String(rawId || ''), ...fallbackCandidates.map(c => String(c || ''))].filter(Boolean);

    for (const cand of candidates) {
      for (const field of ['code', 'prescriptionCode', 'fileNumber', 'id', 'fagron.boxId', 'fagronDetails.boxId']) {
        try {
          const q = query(collection(db, 'prescriptions'), where(field, '==', cand));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            targetDocRef = qSnap.docs[0].ref;
            existingData = qSnap.docs[0].data();
            break;
          }
        } catch (queryErr) {
          logger.warn(`[labelsRepository] Search query by ${field} error:`, queryErr);
        }
      }
      if (targetDocRef) break;
    }

    if (!targetDocRef) {
      throw new Error(`Prescription "${rawId || 'current'}" not found in Firestore.`);
    }

    return { ref: targetDocRef, data: existingData };
  },

  /**
   * Fetches labels data for a prescription, checking memory cache first.
   */
  async getPrescriptionLabels(rxId, { forceRefresh = false } = {}) {
    if (!rxId) return null;
    const cacheKey = String(rxId);

    if (!forceRefresh) {
      const cached = memoryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }

    const { data } = await this.resolvePrescriptionDoc(rxId);
    const result = {
      pharmacyLabels: Array.isArray(data?.pharmacyLabels) ? data.pharmacyLabels : [],
      labelsMeta: data?.labelsMeta || null
    };

    memoryCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
  },

  /**
   * Saves and snapshots a label, updating both the parent document and subcollection.
   */
  async savePrescriptionLabel({
    rawId,
    currentItem,
    markdownText = '',
    activeVariant = 'backQr',
    labels = [],
    selectedProductIdx = 0,
    editedOverrides = {},
    actorId = null,
    approvalStatus = null // 'draft' | 'approved'
  }) {
    const { ref: targetDocRef, data: existingData } = await this.resolvePrescriptionDoc(
      rawId,
      [currentItem.fileNumber, currentItem.rxCode, currentItem.batchCode]
    );

    const nowIso = new Date().toISOString();
    const phaseIdx = Math.max(0, (currentItem.phaseNumber || selectedProductIdx + 1) - 1);
    const partKey = `part_${phaseIdx + 1}`;

    // Resolve Customs and Delivery Titles
    const shippingTitleResolved = currentItem.shippingTitle
      || getCustomsFriendlySuggestions(currentItem)[0]
      || '';
    const deliveryTitleResolved = currentItem.deliveryTitle
      || currentItem.productTitle
      || currentItem.productName
      || '';

    // Prior snapshot array
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
      modifiedBy: actorId || 'pharmacy_label_editor',
      shippingTitle: shippingTitleResolved,
      deliveryTitle: deliveryTitleResolved
    };

    const updatedHistory = Array.isArray(prevLabel.history)
      ? [historyEntry, ...prevLabel.history.slice(0, 19)] // Keep last 20 audit entries
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
      lastVariant: activeVariant,
      labelMarkdown: markdownText,
      labelSavedAt: nowIso,
      history: updatedHistory
    };

    currentLabelsSnapshot[phaseIdx] = updatedLabelRecord;

    // Build parent update payload
    const updatePayload = {
      updatedAt: serverTimestamp(),
      lastModifiedBy: actorId || 'pharmacy_label_editor',
      pharmacyLabels: currentLabelsSnapshot,
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
        updatePayload['patient.displayName'] = currentItem.patientName;
      }
    }

    if (currentItem.doctorName) {
      updatePayload.doctorName = currentItem.doctorName;
      if (existingData?.treatingDoctor && typeof existingData.treatingDoctor === 'object') {
        updatePayload['treatingDoctor.name'] = currentItem.doctorName;
      }
      if (existingData?.doctor && typeof existingData.doctor === 'object') {
        updatePayload['doctor.name'] = currentItem.doctorName;
      }
    }

    if (currentItem.clinicName) {
      updatePayload.clinicName = currentItem.clinicName;
      if (existingData?.treatingClinic && typeof existingData.treatingClinic === 'object') {
        updatePayload['treatingClinic.name'] = currentItem.clinicName;
      }
    }

    if (currentItem.productTitle || currentItem.productName || currentItem.title) {
      const fullTitle = currentItem.productTitle || currentItem.productName || currentItem.title;
      updatePayload.productTitle = fullTitle;
      updatePayload.productName = fullTitle;
      updatePayload.title = fullTitle;
      updatePayload.medicationName = fullTitle;
    }

    if (currentItem.vehicle || currentItem.compoundingVehicle) {
      const vVal = currentItem.vehicle || currentItem.compoundingVehicle;
      updatePayload.vehicle = vVal;
      updatePayload.compoundingVehicle = vVal;
    }

    if (Array.isArray(currentItem.apis) && currentItem.apis.length > 0) {
      updatePayload.apis = currentItem.apis;
      updatePayload.items = currentItem.apis;
      updatePayload.compounds = currentItem.apis;
    }

    if (currentItem.batchCode) {
      updatePayload.batchCode = currentItem.batchCode;
      updatePayload.dispensingBatch = currentItem.batchCode;
      if (existingData?.fagron) {
        updatePayload['fagron.boxId'] = currentItem.batchCode;
      }
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
      if (existingData?.posology && typeof existingData.posology === 'object') {
        updatePayload['posology.regimen'] = currentItem.directions;
      }
    }
    if (currentItem.storage) updatePayload.storage = currentItem.storage;
    if (currentItem.warnings) updatePayload.warnings = currentItem.warnings;
    if (currentItem.formula) updatePayload.formula = currentItem.formula;

    if (currentItem.pharmacyName || currentItem.dispensingPharmacy || currentItem.pharmacy) {
      const pharm = currentItem.pharmacyName || currentItem.dispensingPharmacy || currentItem.pharmacy;
      updatePayload.pharmacyName = pharm;
      updatePayload.dispensingPharmacy = pharm;
      updatePayload.pharmacy = pharm;
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

    // Execute atomic parent update with strict sanitization
    // Remove any undefined or non-plain keys (except FieldValues like serverTimestamp)
    const sanitizedPayload = Object.entries(updatePayload).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {});

    await updateDoc(targetDocRef, sanitizedPayload);

    // Save into granular subcollection prescriptions/{rxId}/labels/{partKey}
    try {
      const subcollectionDocRef = doc(db, 'prescriptions', targetDocRef.id, 'labels', partKey);
      await setDoc(subcollectionDocRef, {
        ...updatedLabelRecord,
        rxId: targetDocRef.id,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (subcolErr) {
      logger.warn('[labelsRepository] Subcollection write warning (non-fatal):', subcolErr);
    }

    // Invalidate caches (Memory + API)
    this.invalidateLabelsCache(targetDocRef.id);
    if (rawId && rawId !== targetDocRef.id) this.invalidateLabelsCache(rawId);

    try {
      fetch('/api/prescriptions/invalidate-cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawId || targetDocRef.id })
      }).catch(err => logger.warn('[labelsRepository] Invalidate cache warning:', err));
    } catch (cacheErr) {
      logger.warn('[labelsRepository] Cache invalidation fetch call failed:', cacheErr);
    }

    return {
      success: true,
      docId: targetDocRef.id,
      docRef: targetDocRef,
      payload: updatePayload,
      updatedLabel: updatedLabelRecord,
      currentLabelsSnapshot
    };
  }
};

export default labelsRepository;
