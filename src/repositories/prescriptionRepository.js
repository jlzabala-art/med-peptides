import {
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  limit,
  orderBy,
  startAfter,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizePrescription } from './mappers';
import { validatePrescriptionWrite } from './prescriptionWriteGuard';
import { getCache, setCache, invalidateCache } from '../lib/cache';
import { trackPrescriptionCreated } from '../services/algoliaInsights';
import { canTransitionTo } from '../schemas/transactionalStateMachine';
import { ClinicalStateTransitionError } from '../errors/ClinicalErrors';
import { logPHIAccess, PHI_ACTIONS } from '../services/PHIAuditService';
import { withRetry } from './_resilience';
import { logger } from '../utils/logger';

const getPrescriptionsCol = (userId) => collection(db, 'users', userId, 'prescriptions');
const getAllPrescriptionsCol = () => collection(db, 'prescriptions');

export const prescriptionRepository = {
  /**
   * Fetch a single prescription by ID with cache.
   */
  async getPrescription(id, { actorId = null, actorRole = 'admin' } = {}) {
    if (!id) return null;
    const cacheKey = `prescriptions/${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      if (actorId) logPHIAccess({ actorId, actorRole, action: PHI_ACTIONS.READ, entityType: 'prescription', entityId: id, metadata: { source: 'cache' } });
      return cached;
    }

    const docSnap = await withRetry(() => getDoc(doc(db, 'prescriptions', id)), { entityName: 'prescriptionRepository.getPrescription' });
    if (!docSnap.exists()) return null;
    const data = normalizePrescription(docSnap.data(), docSnap.id);
    setCache(cacheKey, data);
    if (actorId) logPHIAccess({ actorId, actorRole, action: PHI_ACTIONS.READ, entityType: 'prescription', entityId: id });
    return data;
  },

  /**
   * Invalidate cache for a specific prescription.
   */
  invalidatePrescriptionCache(id) {
    if (!id) return;
    invalidateCache(`prescriptions/${id}`);
  },

  /**
   * Save a prescription to a user's subcollection.
   */
  async addUserPrescription(userId, data) {
    if (!userId) return null;

    if (data.items && !data.prescriptionLines) {
      data.prescriptionLines = data.items;
    }
    const cleanData = validatePrescriptionWrite(data, false);

    const ref = await addDoc(getPrescriptionsCol(userId), {
      ...cleanData,
      uploadedAt: serverTimestamp(),
    });
    return ref.id;
  },

  /**
   * Update an existing prescription by ID (global collection)
   */
  async updatePrescription(id, data) {
    if (!id) return;

    if (data.items && !data.prescriptionLines) {
      data.prescriptionLines = data.items;
    }
    const cleanData = validatePrescriptionWrite(data, true);

    await updateDoc(doc(db, 'prescriptions', id), cleanData);
    this.invalidatePrescriptionCache(id);
  },

  /**
   * Create a new prescription in the global collection.
   * Validates write data and logs PHI access event.
   * @param {object} data - Prescription data
   * @param {object} [opts]
   * @param {string} [opts.actorId]   - UID of the clinician creating the prescription
   * @param {string} [opts.actorRole] - Role: 'admin' | 'doctor'
   */
  async createPrescription(data, { actorId = null, actorRole = 'admin' } = {}) {
    if (data.items && !data.prescriptionLines) {
      data.prescriptionLines = data.items;
    }
    const cleanData = validatePrescriptionWrite(data, false);

    const ref = await withRetry(
      () => addDoc(getAllPrescriptionsCol(), cleanData),
      { entityName: 'prescriptionRepository.createPrescription' }
    );

    if (actorId) {
      logPHIAccess({
        actorId, actorRole,
        action: PHI_ACTIONS.WRITE,
        entityType: 'prescription',
        entityId: ref.id,
        metadata: { patientId: cleanData.patientId, doctorId: cleanData.doctorId, operation: 'create' },
      });
    }

    return ref.id;
  },

  /**
   * Delete a prescription by ID.
   * Logs PHI delete event before destruction.
   * @param {string} id
   * @param {object} [opts]
   * @param {string} [opts.actorId]   - UID of the actor deleting
   * @param {string} [opts.actorRole]
   */
  async deletePrescription(id, { actorId = null, actorRole = 'admin' } = {}) {
    if (!id) return;
    if (actorId) {
      logPHIAccess({
        actorId, actorRole,
        action: PHI_ACTIONS.DELETE,
        entityType: 'prescription',
        entityId: id,
      });
    }
    await withRetry(
      () => deleteDoc(doc(db, 'prescriptions', id)),
      { entityName: 'prescriptionRepository.deletePrescription' }
    );
    this.invalidatePrescriptionCache(id);
  },

  /**
   * Update the status of a prescription with State Machine enforcement.
   * Throws ClinicalStateTransitionError if the transition is not allowed.
   *
   * @param {string} id            - Prescription document ID
   * @param {string} currentStatus - The current status (fetched from DB or passed by caller)
   * @param {string} targetStatus  - The desired new status
   * @param {object} [opts]
   * @param {string} [opts.actorId]
   * @param {string} [opts.actorRole]
   * @returns {Promise<void>}
   */
  async updatePrescriptionStatus(id, currentStatus, targetStatus, { actorId = null, actorRole = 'admin' } = {}) {
    if (!id || !currentStatus || !targetStatus) throw new Error('updatePrescriptionStatus: id, currentStatus, and targetStatus are required');

    if (!canTransitionTo('quotation', currentStatus, targetStatus)) {
      logger.warn('[prescriptionRepository] Transición de estado bloqueada por state machine', {
        id, currentStatus, targetStatus,
      });
      throw new ClinicalStateTransitionError('prescription', currentStatus, targetStatus);
    }

    await withRetry(
      () => updateDoc(doc(db, 'prescriptions', id), {
        status: targetStatus,
        updatedAt: serverTimestamp(),
        [`statusHistory.${Date.now()}`]: { from: currentStatus, to: targetStatus, by: actorId, at: new Date().toISOString() },
      }),
      { entityName: 'prescriptionRepository.updatePrescriptionStatus' }
    );

    this.invalidatePrescriptionCache(id);

    if (actorId) {
      logPHIAccess({
        actorId, actorRole,
        action: PHI_ACTIONS.APPROVE,
        entityType: 'prescription',
        entityId: id,
        metadata: { from: currentStatus, to: targetStatus },
      });
    }
  },

  /**
   * Fetch recent prescriptions for a specific doctor
   */
  async getRecentPrescriptionsByDoctor(doctorId, limitCount = 5) {
    if (!doctorId) return [];
    try {
      const q = query(
        getAllPrescriptionsCol(),
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snap = await withRetry(() => getDocs(q), { entityName: 'prescriptionRepository.getRecentPrescriptionsByDoctor' });
      return snap.docs.map((d) => normalizePrescription(d.data(), d.id));
    } catch (err) {
      logger.error('[prescriptionRepository] getRecentPrescriptionsByDoctor', { error: err.message, doctorId });
      return [];
    }
  },

  buildQuery(filters = {}, pageSize = 50, pageParam = null, orderByDesc = true) {
    const colRef = getAllPrescriptionsCol();
    const constraints = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(key, '==', value));
      }
    });

    if (orderByDesc) {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    if (pageParam) {
      constraints.push(startAfter(pageParam));
    }

    constraints.push(limit(pageSize));
    return query(colRef, ...constraints);
  },

  async getPrescriptionsPage({ filters = {}, pageSize = 50, pageParam = null, orderByDesc = true }) {
    const q = this.buildQuery(filters, pageSize, pageParam, orderByDesc);
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => normalizePrescription(doc.data(), doc.id));
    return {
      data,
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
      hasMore: snap.docs.length === pageSize,
    };
  },

  // ─── CROSS-ENTITY & SPECIALIZED QUERIES ────────────────────────────────────

  /**
   * Obtiene prescripciones que contienen un producto específico (con paginación real).
   */
  async getByProduct(productId, { pageSize = 50, lastDoc = null } = {}) {
    if (!productId) return { data: [], lastDoc: null, hasMore: false };
    const constraints = [
      where('prescriptionLines', 'array-contains', { productId }),
      orderBy('createdAt', 'desc'),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(pageSize));

    const q = query(getAllPrescriptionsCol(), ...constraints);
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => normalizePrescription(d.data(), d.id));
    return {
      data,
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
      hasMore: snap.docs.length === pageSize,
    };
  },

  /**
   * Obtiene prescripciones originadas desde un protocolo específico (con paginación real).
   */
  async getByProtocol(protocolId, { pageSize = 50, lastDoc = null } = {}) {
    if (!protocolId) return { data: [], lastDoc: null, hasMore: false };
    const constraints = [
      where('sourceProtocolId', '==', protocolId),
      orderBy('createdAt', 'desc'),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(pageSize));

    const q = query(getAllPrescriptionsCol(), ...constraints);
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => normalizePrescription(d.data(), d.id));
    return {
      data,
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
      hasMore: snap.docs.length === pageSize,
    };
  },

  /**
   * Obtiene prescripciones de un paciente específico con paginación.
   */
  async getByPatient(patientId, { pageSize = 50, lastDoc = null } = {}) {
    if (!patientId) return { data: [], lastDoc: null, hasMore: false };
    const constraints = [
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc'),
    ];
    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(pageSize));

    const q = query(getAllPrescriptionsCol(), ...constraints);
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => normalizePrescription(d.data(), d.id));
    return {
      data,
      lastDoc: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null,
      hasMore: snap.docs.length === pageSize,
    };
  },

  /**
   * Crea una prescripción pre-rellenada desde un protocolo.
   */
  async createFromProtocol(protocol, overrides = {}) {
    if (!protocol?.id) throw new Error('[prescriptionRepository] createFromProtocol: protocol.id required');

    const lines = _extractProtocolLines(protocol);

    const draft = {
      status: 'draft',
      sourceProtocolId: protocol.id,
      sourceProtocolName: protocol.name || protocol.title || '',
      sourceProtocolSlug: protocol.slug || '',
      prescriptionLines: lines,
      notes: overrides.notes || `Prescripción generada desde el Protocolo: ${protocol.name || protocol.title || protocol.id}`,
      createdAt: serverTimestamp(),
      ...overrides,
    };

    const cleanData = validatePrescriptionWrite(draft, false);
    const ref = await addDoc(getAllPrescriptionsCol(), cleanData);

    try {
      trackPrescriptionCreated(lines);
    } catch { /* non-blocking */ }

    return ref.id;
  },
};

// ─── HELPERS INTERNOS ────────────────────────────────────────────────────────

function _extractProtocolLines(protocol) {
  if (Array.isArray(protocol.prescriptionLines) && protocol.prescriptionLines.length > 0) {
    return protocol.prescriptionLines;
  }

  if (Array.isArray(protocol.phases)) {
    const lines = [];
    protocol.phases.forEach((phase) => {
      (phase.drugs || phase.peptides || []).forEach((drug) => {
        if (drug.productId || drug.id) {
          lines.push({
            productId:   drug.productId || drug.id,
            productName: drug.name || drug.productName || '',
            dose:        drug.dose || drug.dosage || '',
            unit:        drug.unit || 'mg',
            frequency:   drug.frequency || '',
            route:       drug.route || 'subcutaneous',
            duration:    drug.duration || '',
            phase:       phase.name || phase.title || '',
            notes:       drug.notes || '',
            qty:         drug.qty || 1,
            status:      'pending',
          });
        }
      });
    });
    if (lines.length > 0) return lines;
  }

  if (Array.isArray(protocol.peptides)) {
    return protocol.peptides
      .filter((p) => p.productId || p.id)
      .map((p) => ({
        productId:   p.productId || p.id,
        productName: p.name || '',
        dose:        p.dose || '',
        unit:        p.unit || 'mg',
        frequency:   p.frequency || '',
        route:       p.route || 'subcutaneous',
        qty:         p.qty || 1,
        notes:       '',
        status:      'pending',
      }));
  }

  return [];
}
// ── Doctor Gadget Subscriptions ────────────────────────────────────────────

/**
 * Real-time subscription to symptom logs for a doctor's patients.
 * Used by ClinicalProgressMonitorWidget.
 * @param {string} doctorId
 * @param {function} onData
 * @param {number} [maxLimit=20]
 * @returns {function} unsubscribe
 */
export function subscribeToSymptomLogs(doctorId, onData, maxLimit = 20) {
  const q = query(
    collection(db, 'symptom_logs'),
    where('doctorId', '==', doctorId),
    orderBy('timestamp', 'desc'),
    limit(maxLimit)
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Real-time subscription to refill requests pending approval for a doctor.
 * Used by RefillApprovalsWidget.
 * @param {string} doctorId
 * @param {function} onData
 * @returns {function} unsubscribe
 */
export function subscribeToRefillRequests(doctorId, onData) {
  const q = query(
    collection(db, 'refill_requests'),
    where('doctorId', '==', doctorId),
    where('status', '==', 'pending_approval')
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Approves a refill request and creates a new prescription.
 * Used by RefillApprovalsWidget.
 * @param {object} req - The refill request document
 * @param {string} doctorName
 * @returns {Promise<void>}
 */
export async function approveRefillRequest(req, doctorName = 'Doctor', { actorId = null, actorRole = 'doctor' } = {}) {
  await withRetry(
    () => updateDoc(doc(db, 'refill_requests', req.id), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: doctorName,
    }),
    { entityName: 'prescriptionRepository.approveRefillRequest.updateRequest' }
  );

  const newRef = await withRetry(
    () => addDoc(collection(db, 'prescriptions'), {
      patientId: req.patientId,
      patientName: req.patientName,
      doctorId: req.doctorId,
      doctorName,
      items: req.items || [],
      status: 'pending',
      isRefill: true,
      originalRequestId: req.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    { entityName: 'prescriptionRepository.approveRefillRequest.createPrescription' }
  );

  if (actorId) {
    logPHIAccess({
      actorId, actorRole,
      action: PHI_ACTIONS.APPROVE,
      entityType: 'prescription',
      entityId: newRef.id,
      metadata: { originalRequestId: req.id, patientId: req.patientId, isRefill: true },
    });
  }
}

/**
 * Denies a refill request.
 * @param {string} reqId
 * @param {string} reason
 * @returns {Promise<void>}
 */
export async function denyRefillRequest(reqId, reason = '') {
  await updateDoc(doc(db, 'refill_requests', reqId), {
    status: 'denied',
    deniedAt: serverTimestamp(),
    denialReason: reason,
  });
}

/**
 * Real-time subscription to active prescriptions for a doctor.
 * Used by ActivePrescriptionsTracker.
 * @param {string} doctorId
 * @param {function} onData
 * @param {number} [maxLimit=5]
 * @returns {function} unsubscribe
 */
export function subscribeToDoctorActivePrescriptions(doctorId, onData, maxLimit = 5) {
  const q = query(
    collection(db, 'prescriptions'),
    where('doctorId', '==', doctorId),
    orderBy('createdAt', 'desc'),
    limit(maxLimit)
  );
  return onSnapshot(q, (snap) => {
    onData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
