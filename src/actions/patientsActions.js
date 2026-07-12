"use server";

import { adminDb } from '../lib/firebaseAdmin';

export async function fetchPatientsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('patients').limit(limitCount).get();
    
    const patients = snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });

    return patients;
  } catch (error) {
    console.error("Error fetching patients securely:", error);
    return [];
  }
}

export async function fetchDoctorPatientsAction(doctorId) {
  if (!adminDb) {
    console.warn("adminDb is null, falling back to empty array");
    return [];
  }
  if (!doctorId) return [];

  try {
    const relSnap = await adminDb.collection('doctor_patient_relationships')
      .where('doctorId', '==', doctorId)
      .get();
      
    const results = await Promise.all(
      relSnap.docs.map(async (relDoc) => {
        const rel = relDoc.data();
        if (rel.status === 'revoked' || rel.status === 'rejected') return null;
        
        const patientId = rel.patientId;
        let profile = {};
        
        if (!rel.patientName && patientId) {
          const userSnap = await adminDb.collection('users').doc(patientId).get();
          if (userSnap.exists) profile = userSnap.data();
        }

        const fallbackFullName = rel.patientName || '';
        const parts = fallbackFullName.split(' ');
        const fallbackFirstName = parts[0] || '';
        const fallbackLastName = parts.slice(1).join(' ') || '';
        
        let assignedAt = rel.assignedAt || rel.createdAt || null;
        if (assignedAt && assignedAt.toDate) assignedAt = assignedAt.toDate().toISOString();

        return {
          id: patientId || relDoc.id,
          relId: relDoc.id,
          status: rel.status ?? 'active',
          assignedAt: assignedAt,
          firstName: profile.firstName || fallbackFirstName || '',
          lastName: profile.lastName || fallbackLastName || '',
          email: profile.email || rel.patientEmail || '',
          goals: profile.goals || [],
          initiatedByRole: rel.initiatedByRole || 'doctor',
          notes: rel.notes || '',
        };
      })
    );
    
    return results.filter(Boolean);
  } catch (error) {
    console.error("Error fetching doctor patients securely:", error);
    return [];
  }
}
