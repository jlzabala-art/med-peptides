"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchInvitationsAction({ limitCount = 50, tenantId = null } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    let query = adminDb.collection('invitations');
    
    if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }
    
    query = query.orderBy('invitedAt', 'desc').limit(limitCount);

    const snapshot = await query.get();
    
    const invitations = snapshot.docs.map(doc => {
      const data = doc.data();
      // Serialize dates
      if (data.invitedAt && data.invitedAt.toDate) {
        data.invitedAt = data.invitedAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    return invitations;
  } catch (error) {
    console.error("Error fetching invitations securely:", error);
    return [];
  }
}
