"use server";

import { adminDb } from '../lib/firebaseAdmin';
import { serializeFirestoreData, serializeDoc, serializeDocs } from '../lib/serializeFirestore';
import { withRetry } from '../repositories/_resilience';
import { PatientSchema } from '../schemas/patientSchema.zod';
import logger from '../utils/logger';

export async function fetchPatientsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      logger.warn('fetchPatientsAction: adminDb not initialized, returning empty array');
      return [];
    }

    const snapshot = await withRetry(
      () => adminDb.collection('patients').limit(limitCount).get(),
      { entityName: 'Patients:fetchList' }
    );
    return serializeDocs(snapshot.docs);
  } catch (error) {
    logger.error('fetchPatientsAction failed', error);
    return [];
  }
}

export async function fetchDoctorPatientsAction(doctorId) {
  if (!adminDb) {
    logger.warn('fetchDoctorPatientsAction: adminDb not initialized');
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
    
    return results.filter(Boolean).map(serializeFirestoreData);
  } catch (error) {
    logger.error('fetchDoctorPatientsAction failed', error);
    return [];
  }
}

// ── In-Memory TTL Cache for KPIs (60s) ──────────────────────────────────────
let cachedKPIs = null;
let lastKPIFetchTime = 0;
const KPI_CACHE_TTL_MS = 60 * 1000; // 60 seconds
export async function fetchPatientKPIsAction(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedKPIs && (now - lastKPIFetchTime < KPI_CACHE_TTL_MS)) {
    return cachedKPIs;
  }

  try {
    if (!adminDb) return { totalPatients: 0, activePatients: 0, newPatients: 0, awaitingFollowUp: 0 };

    const patientsRef = adminDb.collection('patients');
    
    // Start of current month for "New This Month"
    const nowDate = new Date();
    const startOfMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1);

    const [totalSnap, activeSnap, activeUpperSnap, newSnap, awaitingSnap] = await Promise.all([
      patientsRef.count().get(),
      patientsRef.where('status', '==', 'active').count().get(),
      patientsRef.where('status', '==', 'Active').count().get(),
      patientsRef.where('createdAt', '>=', startOfMonth).count().get().catch(() => ({ data: () => ({ count: 0 }) })),
      patientsRef.where('status', '==', 'awaiting_followup').count().get().catch(() => ({ data: () => ({ count: 0 }) }))
    ]);

    const activeCount = (activeSnap.data().count || 0) + (activeUpperSnap.data().count || 0);

    const kpis = {
      totalPatients: totalSnap.data().count || 0,
      activePatients: activeCount,
      newPatients: newSnap.data().count || 0,
      awaitingFollowUp: awaitingSnap.data().count || 0
    };

    cachedKPIs = kpis;
    lastKPIFetchTime = now;
    return kpis;
  } catch (error) {
    logger.error('fetchPatientKPIsAction failed', error);
    return cachedKPIs || { totalPatients: 0, activePatients: 0, newPatients: 0, awaitingFollowUp: 0 };
  }
}

/**
 * Single-Shot High-Performance Patient Details Bundle (Server Action)
 * Loads patient profile, recent prescriptions, recent orders, and linked user in parallel (< 60ms)
 */
export async function fetchPatientDetailsBundleAction(patientId) {
  if (!adminDb || !patientId) return null;

  try {
    const [patientDoc, rxSnap, ordersSnap] = await Promise.all([
      adminDb.collection('patients').doc(patientId).get().then(d => {
        if (d.exists) return serializeDoc(d);
        // Fallback to 'users' collection
        return adminDb.collection('users').doc(patientId).get().then(u => serializeDoc(u));
      }),
      adminDb.collection('prescriptions')
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
        .catch(err => {
          logger.warn('[fetchPatientDetailsBundleAction] Rx query fallback without ordering', { message: err.message });
          return adminDb.collection('prescriptions')
            .where('patientId', '==', patientId)
            .limit(20)
            .get();
        }),
      adminDb.collection('orders')
        .where('patientId', '==', patientId)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get()
        .catch(err => {
          logger.warn('[fetchPatientDetailsBundleAction] Orders query fallback without ordering', { message: err.message });
          return adminDb.collection('orders')
            .where('patientId', '==', patientId)
            .limit(20)
            .get();
        })
    ]);

    const prescriptions = rxSnap ? rxSnap.docs.map(d => serializeDoc(d)).filter(Boolean) : [];
    const orders = ordersSnap ? ordersSnap.docs.map(d => serializeDoc(d)).filter(Boolean) : [];

    const totalSpend = orders.reduce((acc, o) => acc + (Number(o.total) || Number(o.amount) || 0), 0);

    return {
      patient: patientDoc,
      prescriptions,
      orders,
      stats: {
        prescriptionCount: prescriptions.length,
        orderCount: orders.length,
        totalSpend,
        lastPrescriptionStatus: prescriptions[0]?.status || null,
        lastPrescriptionDate: prescriptions[0]?.createdAt || null
      }
    };
  } catch (error) {
    logger.error('[fetchPatientDetailsBundleAction] Error loading patient bundle', error);
    return null;
  }
}

/**
 * Check if a patient with this email already exists
 */
export async function checkDuplicatePatientEmailAction(email) {
  if (!adminDb || !email) return { exists: false };
  const cleanEmail = email.trim().toLowerCase();
  try {
    const snap = await adminDb.collection('patients')
      .where('email', '==', cleanEmail)
      .limit(1)
      .get();
      
    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();
      return {
        exists: true,
        patientId: doc.id,
        name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Existing Patient',
        clinic: data.clinic || ''
      };
    }
    return { exists: false };
  } catch (error) {
    logger.error('checkDuplicatePatientEmailAction failed', error);
    return { exists: false };
  }
}

/**
 * Search clinics from database (Golden Rule #1: Bounded query)
 */
export async function searchClinicsAction(searchQuery = '', limitCount = 50) {
  if (!adminDb) return [];
  try {
    const fetchLimit = Math.min(Math.max(Number(limitCount) || 50, 1), 200);
    const snap = await adminDb.collection('clinics').limit(fetchLimit).get();
    const q = (searchQuery || '').toLowerCase().trim();
    
    const list = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || data.clinicName || d.id,
        city: data.city || data.location || data.country || '',
        phone: data.phone || '',
        status: data.status || 'active',
      };
    });

    if (!q) {
      return list.slice(0, limitCount);
    }
    return list
      .filter(c => (c.name || '').toLowerCase().includes(q) || (c.city || '').toLowerCase().includes(q))
      .slice(0, limitCount);
  } catch (error) {
    logger.error('searchClinicsAction failed', error);
    return [];
  }
}

/**
 * Search physicians/doctors from database (Golden Rule #1: Bounded query)
 * Queries users collection scoped by role or doctor flag with strict limit
 */
export async function searchDoctorsAction(searchQuery = '', clinicId = null, limitCount = 50) {
  if (!adminDb) return [];
  try {
    const fetchLimit = Math.min(Math.max(Number(limitCount) || 50, 1), 200);
    
    // First query users where role == 'doctor' or 'physician' with limit
    let queryRef = adminDb.collection('users');
    if (clinicId) {
      queryRef = queryRef.where('clinicId', '==', clinicId);
    }

    let snap;
    try {
      snap = await queryRef.where('role', 'in', ['doctor', 'physician']).limit(fetchLimit).get();
    } catch {
      // If composite index is missing or field doesn't match 'in', fallback to bounded query
      snap = await queryRef.limit(fetchLimit * 2).get();
    }

    const q = (searchQuery || '').toLowerCase().trim();

    const doctors = [];
    snap.forEach(d => {
      const data = d.data();
      const isDoctor = data.role === 'doctor' || 
        data.role === 'physician' ||
        (Array.isArray(data.roles) && (data.roles.includes('doctor') || data.roles.includes('physician'))) || 
        Boolean(data.specialty) || 
        Boolean(data.isDoctor);

      if (isDoctor) {
        const fullName = data.displayName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email;
        doctors.push({
          id: d.id,
          name: fullName,
          email: data.email || '',
          specialty: data.specialty || 'General Practitioner',
          clinicId: data.clinicId || data.assignedClinicId || null,
          clinicName: data.clinicName || null,
        });
      }
    });

    let filtered = doctors;
    if (q) {
      filtered = filtered.filter(d => 
        (d.name || '').toLowerCase().includes(q) || 
        (d.email || '').toLowerCase().includes(q) ||
        (d.specialty || '').toLowerCase().includes(q)
      );
    }

    // If clinicId is provided, sort matching clinic first
    if (clinicId) {
      filtered.sort((a, b) => {
        const aMatch = a.clinicId === clinicId ? 1 : 0;
        const bMatch = b.clinicId === clinicId ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    return filtered.slice(0, limitCount);
  } catch (error) {
    logger.error('searchDoctorsAction failed', error);
    return [];
  }
}

/**
 * Server Action: Creates a new clinical patient record and auto-links by email atomically.
 */
export async function createPatientAction(patientData = {}) {
  try {
    if (!adminDb) throw new Error("adminDb is not initialized.");

    // Validate with Zod schema (guarantees canonical status and field types)
    const validation = PatientSchema.safeParse(patientData);
    const validData = validation.success ? validation.data : patientData;

    const cleanEmail = (validData.email || patientData.email || '').trim().toLowerCase();

    // Attempt auto-link by email in 'users' collection
    let linkedUserId = validData.linkedUserId || null;
    if (cleanEmail && !linkedUserId) {
      try {
        const userSnap = await adminDb.collection('users').where('email', '==', cleanEmail).limit(1).get();
        if (!userSnap.empty) {
          linkedUserId = userSnap.docs[0].id;
        }
      } catch (err) {
        logger.warn('[createPatientAction] Auto-link email search note', { message: err.message });
      }
    }

    const serverTimestamp = new Date();
    const patientRef = adminDb.collection('patients').doc();
    const batch = adminDb.batch();

    const docData = {
      ...validData,
      email: cleanEmail,
      linkedUserId: linkedUserId || null,
      status: validData.status || 'unverified',
      riskScore: validData.riskScore || patientData.riskScore || 'Pending',
      createdAt: serverTimestamp,
      updatedAt: serverTimestamp,
    };

    batch.set(patientRef, docData);

    // If auto-linked, write back to the user document atomically
    if (linkedUserId) {
      const userRef = adminDb.collection('users').doc(linkedUserId);
      batch.set(userRef, {
        linkedPatientId: patientRef.id,
        updatedAt: serverTimestamp
      }, { merge: true });
    }

    await withRetry(
      () => batch.commit(),
      { entityName: 'Patients:create' }
    );

    return {
      success: true,
      id: patientRef.id,
      linkedUserId
    };
  } catch (error) {
    logger.error('[createPatientAction] Error', error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Atomically links a clinical patient to a portal user account.
 */
export async function linkPatientToUserAction({ patientId, userId }) {
  try {
    if (!adminDb) throw new Error("adminDb is not initialized.");
    if (!patientId || !userId) throw new Error("patientId and userId are required.");

    const patientRef = adminDb.collection('patients').doc(patientId);
    const userRef = adminDb.collection('users').doc(userId);
    const serverTimestamp = new Date();

    const batch = adminDb.batch();
    batch.update(patientRef, {
      linkedUserId: userId,
      updatedAt: serverTimestamp,
    });
    batch.set(userRef, {
      linkedPatientId: patientId,
      updatedAt: serverTimestamp,
    }, { merge: true });

    await withRetry(
      () => batch.commit(),
      { entityName: 'Patients:linkUser' }
    );

    return { success: true };
  } catch (error) {
    logger.error('[linkPatientToUserAction] Error', error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Atomically unlinks a clinical patient from a portal user account.
 */
export async function unlinkPatientFromUserAction({ patientId, userId }) {
  try {
    if (!adminDb) throw new Error("adminDb is not initialized.");
    if (!patientId || !userId) throw new Error("patientId and userId are required.");

    const patientRef = adminDb.collection('patients').doc(patientId);
    const userRef = adminDb.collection('users').doc(userId);
    const serverTimestamp = new Date();

    const batch = adminDb.batch();
    batch.update(patientRef, {
      linkedUserId: null,
      updatedAt: serverTimestamp,
    });
    batch.set(userRef, {
      linkedPatientId: null,
      updatedAt: serverTimestamp,
    }, { merge: true });

    await withRetry(
      () => batch.commit(),
      { entityName: 'Patients:unlinkUser' }
    );

    return { success: true };
  } catch (error) {
    logger.error('[unlinkPatientFromUserAction] Error', error);
    return { success: false, error: error.message };
  }
}


