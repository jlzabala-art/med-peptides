"use server";

import { revalidatePath } from 'next/cache';
import { adminDb } from '../lib/firebaseAdmin';

// Recursive serialization helper for Firestore Timestamps and Dates
function serializeData(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj?.toDate === 'function') return obj.toDate().toISOString();
  if (typeof obj === 'object' && obj._seconds !== undefined && obj._nanoseconds !== undefined) {
    return new Date(obj._seconds * 1000).toISOString();
  }
  if (Array.isArray(obj)) return obj.map(serializeData);
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = serializeData(obj[key]);
    }
    return newObj;
  }
  return obj;
}

export async function fetchProtocolsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('protocols')
      .limit(limitCount)
      .get();
    
    const protocols = snapshot.docs.map(doc => {
      const rawData = doc.data();
      const data = serializeData(rawData);
      
      const hasName = !!(data.name || data.title || data.protocol_name);
      const hasCategory = !!(data.therapeutic_category || data.category);
      const hasRationale = !!(data.clinical_rationale || data.summary || data.description || data.overview);

      const checks = [
        { id: 'overview', label: 'Overview', done: hasName && (hasCategory || hasRationale) },
        { id: 'treatment', label: 'Treatment', done: !!(data.phases?.length > 0 || data.duration_weeks || data.peptides?.length > 0) },
        { id: 'dosage', label: 'Dosage', done: !!(data.dosage_schedule?.length > 0 || data.weekly_doses || data.dosing_instructions) },
        { id: 'monitoring', label: 'Monitoring', done: !!(data.monitoring_cadence || data.check_in_weeks || data.monitoring) },
        { id: 'labs', label: 'Labs', done: !!(data.required_labs?.length > 0 || data.biomarkers?.length > 0 || data.labs) },
        { id: 'progress', label: 'Progress Tracker', done: !!(data.clinical_biomarker_data || data.progress_tracker || data.kpis) },
      ];
      const completed = checks.filter(c => c.done).length;
      const total = checks.length;
      const pct = Math.round((completed / total) * 100);

      return {
        id: doc.id,
        ...data,
        name: data.name || data.title || data.protocol_name || 'Unnamed Protocol',
        _clinicalScore: pct,
        _clinicalCompleted: completed,
      };
    });

    return JSON.parse(JSON.stringify(protocols));
  } catch (error) {
    console.error("Error fetching protocols securely:", error);
    return [];
  }
}

export async function fetchProtocolsMetricsAction() {
  try {
    if (!adminDb) return { total: 0, active: 0, drafts: 0, archived: 0 };
    
    const col = adminDb.collection('protocols');
    const [totalSnap, activeSnap, draftsSnap, archivedSnap] = await Promise.all([
      col.count().get(),
      col.where('status', '==', 'active').count().get(),
      col.where('status', '==', 'draft').count().get(),
      col.where('status', '==', 'archived').count().get(),
    ]);

    return {
      total: totalSnap.data().count,
      active: activeSnap.data().count,
      drafts: draftsSnap.data().count,
      archived: archivedSnap.data().count,
    };
  } catch (error) {
    console.error("Error fetching protocols metrics:", error);
    return { total: 0, active: 0, drafts: 0, archived: 0 };
  }
}

/**
 * ⚡ Event-Driven Cache Invalidation & Protocol Update Action
 */
export async function updateProtocolAction(protocolId, updateData = {}) {
  try {
    if (!adminDb || !protocolId) return { success: false, error: 'Missing ID or DB' };

    await adminDb.collection('protocols').doc(protocolId).set(updateData, { merge: true });

    // ⚡ Invalidate ISR caches for the public page & protocol routes
    const slug = updateData.slug || protocolId;
    revalidatePath(`/proto/${slug}`);
    revalidatePath(`/proto/${protocolId}`);
    revalidatePath(`/shared/protocol/${protocolId}`);
    revalidatePath('/collection/protocols');

    return { success: true };
  } catch (error) {
    console.error('Error updating protocol action:', error);
    return { success: false, error: error.message };
  }
}
