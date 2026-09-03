"use server";

import { adminDb } from '../lib/firebaseAdmin';

// ─── Serialize Firestore timestamps ──────────────────────────────────────────
function serializeDoc(doc) {
  if (!doc || !doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, ...serializeObj(data) };
}

function serializeObj(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj?.toDate === 'function') return obj.toDate().toISOString();
  if (Array.isArray(obj)) return obj.map(serializeObj);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = serializeObj(v);
    return out;
  }
  return obj;
}

// ─── In-memory KPI cache ──────────────────────────────────────────────────────
let cachedLeadKPIs = null;
let lastLeadKPIFetch = 0;
const LEAD_KPI_TTL_MS = 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated leads list — Admin SDK, merges leads + agency_rfqs in one server call.
 */
export async function fetchLeadsAction({ limitCount = 50, status = null } = {}) {
  if (!adminDb) return [];
  try {
    const [leadsSnap, rfqsSnap] = await Promise.all([
      (() => {
        let q = adminDb.collection('leads').orderBy('createdAt', 'desc').limit(limitCount);
        if (status) q = q.where('status', '==', status);
        return q.get().catch(() => ({ docs: [] }));
      })(),
      adminDb.collection('agency_rfqs').orderBy('createdAt', 'desc').limit(Math.min(limitCount, 30)).get()
        .catch(() => ({ docs: [] })),
    ]);

    const leads = leadsSnap.docs.map(d => ({ ...serializeDoc(d), _source: 'leads' })).filter(Boolean);
    const rfqs  = rfqsSnap.docs.map(d => {
      const ser = serializeDoc(d);
      if (!ser) return null;
      return { ...ser, leadType: ser.leadType || 'Compounding Pharmacy', _source: 'rfq', type: 'rfq' };
    }).filter(Boolean);

    return [...leads, ...rfqs]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limitCount);
  } catch (error) {
    console.error('[fetchLeadsAction]', error);
    return [];
  }
}

/**
 * KPI aggregations — parallel count() queries, 60s in-memory cache.
 */
export async function fetchLeadsKPIsAction(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedLeadKPIs && (now - lastLeadKPIFetch < LEAD_KPI_TTL_MS)) {
    return cachedLeadKPIs;
  }
  if (!adminDb) return { total: 0, newLast30d: 0, hot: 0, converted: 0, rfqCount: 0 };

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalSnap, newSnap, hotSnap, convertedSnap, rfqTotalSnap] = await Promise.all([
      adminDb.collection('leads').count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('leads').where('createdAt', '>=', thirtyDaysAgo).count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('leads').where('score', '>=', 70).count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('leads').where('status', '==', 'won').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      adminDb.collection('agency_rfqs').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    const kpis = {
      total:      (totalSnap.data().count || 0) + (rfqTotalSnap.data().count || 0),
      newLast30d: newSnap.data().count || 0,
      hot:        hotSnap.data().count || 0,
      converted:  convertedSnap.data().count || 0,
      rfqCount:   rfqTotalSnap.data().count || 0,
    };

    cachedLeadKPIs = kpis;
    lastLeadKPIFetch = now;
    return kpis;
  } catch (error) {
    console.error('[fetchLeadsKPIsAction]', error);
    return cachedLeadKPIs || { total: 0, newLast30d: 0, hot: 0, converted: 0, rfqCount: 0 };
  }
}

/**
 * Update lead status with automatic audit trail entry.
 */
export async function updateLeadStatusAction(leadId, newStatus, updatedByUid = null) {
  if (!adminDb || !leadId || !newStatus) return { success: false, error: 'leadId and newStatus required' };
  try {
    const now = new Date();
    const leadRef = adminDb.collection('leads').doc(leadId);
    const leadDoc = await leadRef.get();
    if (!leadDoc.exists) return { success: false, error: 'Lead not found' };

    const prevStatus = leadDoc.data().status || 'unknown';
    await leadRef.update({
      status: newStatus,
      updatedAt: now,
      statusHistory: adminDb.FieldValue.arrayUnion({
        from: prevStatus, to: newStatus,
        changedAt: now.toISOString(), changedBy: updatedByUid || 'admin',
      }),
    });

    cachedLeadKPIs = null;
    return { success: true, leadId, newStatus };
  } catch (error) {
    console.error('[updateLeadStatusAction]', error);
    return { success: false, error: error.message };
  }
}

/**
 * ACID transaction: Convert a Lead into a Patient.
 * Atomically creates patient, marks lead as won, records audit event.
 */
export async function convertLeadToPatientAction({ leadId, assignedPhysicianId = null, convertedByAdminId = null }) {
  if (!adminDb || !leadId) return { success: false, error: 'leadId is required' };

  try {
    const leadDoc = await adminDb.collection('leads').doc(leadId).get();
    if (!leadDoc.exists) return { success: false, error: 'Lead not found' };

    const lead = leadDoc.data();
    const now = new Date();
    const newPatientId = adminDb.collection('patients').doc().id;

    await adminDb.runTransaction(async (tx) => {
      const leadRef    = adminDb.collection('leads').doc(leadId);
      const patientRef = adminDb.collection('patients').doc(newPatientId);
      const eventRef   = adminDb.collection('conversion_events').doc();

      tx.set(patientRef, {
        email:        lead.email || lead.contactEmail || '',
        firstName:    lead.firstName || lead.contactName?.split(' ')[0] || '',
        lastName:     lead.lastName  || lead.contactName?.split(' ').slice(1).join(' ') || '',
        displayName:  lead.contactName || lead.name || '',
        phone:        lead.phone || lead.contactPhone || '',
        country:      lead.country || '',
        company:      lead.company || lead.clinicName || '',
        source:       'lead_conversion',
        sourceLeadId: leadId,
        status:       'active',
        physicianId:  assignedPhysicianId || null,
        createdAt:    now, updatedAt: now, convertedAt: now,
        convertedBy:  convertedByAdminId || 'admin',
      });

      tx.update(leadRef, {
        status: 'won', convertedAt: now,
        convertedToPatientId: newPatientId, updatedAt: now,
      });

      tx.set(eventRef, {
        type: 'lead_to_patient', leadId, patientId: newPatientId,
        performedBy: convertedByAdminId || 'admin', timestamp: now,
      });
    });

    cachedLeadKPIs = null;
    return { success: true, leadId, patientId: newPatientId };
  } catch (error) {
    console.error('[convertLeadToPatientAction]', error);
    return { success: false, error: error.message };
  }
}

/** Invalidate KPI cache after bulk operations. */
export async function invalidateLeadKPICache() {
  cachedLeadKPIs = null;
  lastLeadKPIFetch = 0;
  return { success: true };
}
