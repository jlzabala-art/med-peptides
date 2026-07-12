"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchProtocolsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('protocols').limit(limitCount).get();
    
    const protocols = snapshot.docs.map(doc => {
      const data = doc.data();
      
      const dateFields = ['createdAt', 'created_at', 'updatedAt', 'updated_at'];
      for (const field of dateFields) {
        if (data[field]) {
          if (typeof data[field].toDate === 'function') {
            data[field] = data[field].toDate().toISOString();
          } else if (data[field]._seconds) {
            data[field] = new Date(data[field]._seconds * 1000).toISOString();
          }
        }
      }
      
      return { id: doc.id, ...data };
    });

    return protocols;
  } catch (error) {
    console.error("Error fetching protocols securely:", error);
    return [];
  }
}

export async function fetchProtocolsMetricsAction() {
  try {
    if (!adminDb) return { total: 0, active: 0, drafts: 0, archived: 0 };
    
    // Get total count globally
    const totalSnapshot = await adminDb.collection('protocols').count().get();
    const total = totalSnapshot.data().count;

    // Get active count
    const activeSnapshot = await adminDb.collection('protocols').where('status', '==', 'active').count().get();
    const active = activeSnapshot.data().count;

    // Get draft count
    const draftsSnapshot = await adminDb.collection('protocols').where('status', '==', 'draft').count().get();
    const drafts = draftsSnapshot.data().count;

    // Get archived count
    const archivedSnapshot = await adminDb.collection('protocols').where('status', '==', 'archived').count().get();
    const archived = archivedSnapshot.data().count;

    return { total, active, drafts, archived };
  } catch (error) {
    console.error("Error fetching protocols metrics:", error);
    return { total: 0, active: 0, drafts: 0, archived: 0 };
  }
}
