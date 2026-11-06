/**
 * src/services/algoliaSyncService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Incremental Algolia Sync Client
 *
 * Keeps Algolia indices in sync with Firestore mutations in real-time.
 * Follows Rule #2: Firestore is the sole source of truth; Algolia acts as
 * the high-performance search projection.
 *
 * Server-side: Directly updates Algolia if ALGOLIA_ADMIN_KEY is available (in-process).
 * Client-side: Calls the secure server route `/api/algolia/sync`.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import logger from '../utils/logger.js';

let directAdminClient = null;
async function getDirectAdminClient() {
  if (typeof window !== 'undefined') return null;
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
  if (!adminKey) return null;
  if (!directAdminClient) {
    try {
      const { algoliasearch } = await import('algoliasearch');
      directAdminClient = algoliasearch(appId, adminKey);
    } catch (e) {
      logger.warn('[AlgoliaSyncService] Failed to load algoliasearch dynamically:', e.message);
      return null;
    }
  }
  return directAdminClient;
}

function getTimestamp(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val._seconds) return val._seconds * 1000;
  if (val instanceof Date) return val.getTime();
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

function formatPrescriptionRecord(id, record = {}) {
  const targetId = String(id || record.id || record.objectID);
  const rawLines = Array.isArray(record.items) ? record.items : (Array.isArray(record.prescriptionLines) ? record.prescriptionLines : []);
  
  const slimItems = rawLines.slice(0, 15).map(line => ({
    name: line.name || line.productName || line.product_title || line.title || '',
    dosage: line.dosage || line.dose || '',
    quantity: Number(line.quantity || line.qty || 1),
    partTitle: line.partTitle || line.formulaName || line.category || ''
  }));

  const productNames = rawLines
    .map(line => line.name || line.productName || line.product_title || line.activeIngredient)
    .filter(Boolean);

  const rawDate = record.date || record.dateIssued;
  let formattedDate = record.dateFormatted || '';
  if (!formattedDate) {
    if (rawDate && typeof rawDate === 'string') {
      const dmy = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (dmy) {
        const dt = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
        formattedDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        const dt = new Date(rawDate);
        if (!isNaN(dt.getTime())) formattedDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    if (!formattedDate && record.createdAt) {
      const ts = getTimestamp(record.createdAt);
      formattedDate = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  const code = record.prescriptionCode || record.prescriptionNumber || record.code || record.fileNumber || `RX-${targetId.slice(0, 6).toUpperCase()}`;

  return {
    objectID: targetId,
    id: targetId,
    code,
    prescriptionCode: code,
    prescriptionNumber: record.prescriptionNumber || code,
    fileNumber: record.fileNumber || code,
    patientName: record.patientName || record.patient?.name || '',
    patientId: record.patientId || record.patient?.id || '',
    doctorName: record.doctorName || record.doctor?.name || record.treatingDoctor?.name || '',
    doctorId: record.doctorId || record.doctor?.id || '',
    clinicName: record.clinicName || record.clinic?.name || record.clinic || '',
    status: (record.status || 'pending').toLowerCase(),
    date: record.date || rawDate || formattedDate,
    dateIssued: record.dateIssued || rawDate || '',
    dateFormatted: formattedDate,
    rxGroupId: record.rxGroupId || record.sessionId || '',
    sessionId: record.sessionId || record.rxGroupId || '',
    partNumber: record.partNumber || null,
    totalParts: record.totalParts || null,
    items: slimItems,
    searchableItems: productNames.slice(0, 30),
    itemCount: rawLines.length,
    treatmentProgram: record.treatmentProgram || record.program || '',
    treatmentType: record.treatmentType || record.type || '',
    total: Number(record.total || record.amount || 0),
    source: record.source || 'portal',
    createdAt_ts: getTimestamp(record.createdAt || record.dateIssued)
  };
}

async function postSyncRequest(payload) {
  try {
    // If on server and admin client is available, execute directly in-process
    const client = await getDirectAdminClient();
    if (client) {
      if (payload.action === 'delete') {
        await client.deleteObject({
          indexName: payload.indexName,
          objectID: String(payload.objectID)
        });
        return true;
      }
      if (payload.action === 'upsert' && payload.indexName === 'prescriptions') {
        const formatted = formatPrescriptionRecord(payload.record?.id || payload.record?.objectID, payload.record);
        await client.saveObject({
          indexName: 'prescriptions',
          body: formatted
        });
        return true;
      }
    }

    // Fallback or browser execution
    const baseUrl = typeof window !== 'undefined'
      ? ''
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

    const res = await fetch(`${baseUrl}/api/algolia/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      logger.warn('[AlgoliaSyncService] Sync request non-ok response:', err);
      return false;
    }
    return true;
  } catch (err) {
    logger.warn('[AlgoliaSyncService] Failed to dispatch sync:', err.message);
    return false;
  }
}

/**
 * Sync a single patient record to atlas_patients
 */
export async function syncPatientToAlgolia(patient) {
  if (!patient || (!patient.id && !patient.objectID)) return;
  return postSyncRequest({
    action: 'upsert',
    indexName: 'atlas_patients',
    record: patient
  });
}

/**
 * Sync a single prescription record to prescriptions index
 */
export async function syncPrescriptionToAlgolia(idOrRx, maybeRx) {
  const rx = maybeRx || (typeof idOrRx === 'object' ? idOrRx : { id: idOrRx });
  const id = typeof idOrRx === 'string' ? idOrRx : (rx.id || rx.objectID);
  if (!id && !rx) return;
  return postSyncRequest({
    action: 'upsert',
    indexName: 'prescriptions',
    record: { ...rx, id: String(id || rx.id || rx.objectID) }
  });
}

/**
 * Batch sync prescriptions to Algolia
 */
export async function syncBatchPrescriptionsToAlgolia(items = []) {
  if (!items || !items.length) return false;
  const client = await getDirectAdminClient();
  if (client) {
    try {
      const objects = items.map(it => formatPrescriptionRecord(it.id || it.objectID, it.record || it));
      await client.saveObjects({
        indexName: 'prescriptions',
        objects
      });
      return true;
    } catch (err) {
      logger.warn('[AlgoliaSyncService] Direct batch sync failed:', err.message);
    }
  }

  // Fallback to sequential upserts
  for (const it of items) {
    await syncPrescriptionToAlgolia(it.id, it.record || it);
  }
  return true;
}

/**
 * Sync a single product record to products index
 */
export async function syncProductToAlgolia(prod) {
  if (!prod || (!prod.id && !prod.objectID)) return;
  return postSyncRequest({
    action: 'upsert',
    indexName: 'products',
    record: prod
  });
}

/**
 * Remove record from an Algolia index
 */
export async function removeObjectFromAlgolia(indexName, objectID) {
  if (!indexName || !objectID) return;
  return postSyncRequest({
    action: 'delete',
    indexName,
    objectID
  });
}
