"use server";

import { adminDb } from '../lib/firebaseAdmin';

function serializeData(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object') {
    if (typeof val.toDate === 'function') {
      return val.toDate().toISOString();
    }
    if (typeof val._seconds === 'number' && typeof val._nanoseconds === 'number') {
      return new Date(val._seconds * 1000 + Math.round(val._nanoseconds / 1e6)).toISOString();
    }
    if (Array.isArray(val)) {
      return val.map(serializeData);
    }
    const plain = {};
    for (const [k, v] of Object.entries(val)) {
      plain[k] = serializeData(v);
    }
    return plain;
  }
  return val;
}

function serializeDoc(doc) {
  if (!doc || (doc.exists !== undefined && !doc.exists)) return null;
  const data = typeof doc.data === 'function' ? doc.data() : doc;
  return {
    id: doc.id || data.id,
    ...serializeData(data)
  };
}

export async function fetchPatientsAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) {
      console.warn("adminDb is null, falling back to empty array");
      return [];
    }

    const snapshot = await adminDb.collection('patients').limit(limitCount).get();
    const patients = snapshot.docs.map(doc => serializeDoc(doc)).filter(Boolean);

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
    
    return results.filter(Boolean).map(serializeData);
  } catch (error) {
    console.error("Error fetching doctor patients securely:", error);
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
    console.error("Error fetching patient KPIs:", error);
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
          console.warn('[fetchPatientDetailsBundleAction] Rx query fallback without ordering:', err.message);
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
          console.warn('[fetchPatientDetailsBundleAction] Orders query fallback without ordering:', err.message);
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
    console.error("[fetchPatientDetailsBundleAction] Error loading patient bundle:", error);
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
    console.error("Error checking duplicate email:", error);
    return { exists: false };
  }
}

/**
 * Search clinics from database
 */
export async function searchClinicsAction(searchQuery = '', limitCount = 50) {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('clinics').get();
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
    console.error("Error searching clinics:", error);
    return [];
  }
}

/**
 * Search physicians/doctors from database (supporting both role == 'doctor' and roles contains 'doctor')
 */
export async function searchDoctorsAction(searchQuery = '', clinicId = null, limitCount = 50) {
  if (!adminDb) return [];
  try {
    const snap = await adminDb.collection('users').get();
    const q = (searchQuery || '').toLowerCase().trim();

    const doctors = [];
    snap.forEach(d => {
      const data = d.data();
      const isDoctor = data.role === 'doctor' || 
        (Array.isArray(data.roles) && data.roles.includes('doctor')) || 
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
    console.error("Error searching doctors:", error);
    return [];
  }
}

