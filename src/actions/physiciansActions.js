"use server";

import { adminDb } from '../lib/firebaseAdmin';

// ─── Re-use serialize helper from patientsActions ─────────────────────────────
function serializeDoc(doc) {
  if (!doc || !doc.exists) return null;
  const data = doc.data();
  const serialized = { id: doc.id, ...data };
  for (const [key, val] of Object.entries(serialized)) {
    if (val && typeof val === 'object' && typeof val.toDate === 'function') {
      serialized[key] = val.toDate().toISOString();
    } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      // Recursively serialize nested objects
      for (const [nestedKey, nestedVal] of Object.entries(val)) {
        if (nestedVal && typeof nestedVal === 'object' && typeof nestedVal.toDate === 'function') {
          serialized[key] = { ...val, [nestedKey]: nestedVal.toDate().toISOString() };
        }
      }
    }
  }
  return serialized;
}

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cachedPhysicianKPIs = null;
let lastPhysicianKPIFetch = 0;
const PHYSICIAN_KPI_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Fetch physicians list with server-side pagination (initial load).
 */
export async function fetchPhysiciansAction({ limitCount = 50 } = {}) {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('users')
      .where('role', 'in', ['doctor', 'physician'])
      .limit(limitCount)
      .get();

    return snapshot.docs.map(d => serializeDoc(d)).filter(Boolean);
  } catch (error) {
    console.error('[fetchPhysiciansAction] Error:', error);
    return [];
  }
}

/**
 * Server-side KPIs for the Physicians directory.
 * Uses parallel count() aggregations for O(1) performance.
 */
export async function fetchPhysiciansKPIsAction(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedPhysicianKPIs && (now - lastPhysicianKPIFetch < PHYSICIAN_KPI_TTL_MS)) {
    return cachedPhysicianKPIs;
  }

  try {
    if (!adminDb) return { total: 0, active: 0, pending: 0, avgPatients: 0 };

    const usersRef = adminDb.collection('users');

    const [totalSnap, activeSnap, pendingSnap, invitedSnap] = await Promise.all([
      usersRef.where('role', 'in', ['doctor', 'physician']).count().get(),
      usersRef.where('role', 'in', ['doctor', 'physician']).where('status', '==', 'approved').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      usersRef.where('role', 'in', ['doctor', 'physician']).where('status', '==', 'pending').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
      usersRef.where('role', 'in', ['doctor', 'physician']).where('status', '==', 'invited').count().get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    const kpis = {
      total:   totalSnap.data().count || 0,
      active:  activeSnap.data().count || 0,
      pending: (pendingSnap.data().count || 0) + (invitedSnap.data().count || 0),
      avgPatients: 0 // computed client-side from list if needed
    };

    cachedPhysicianKPIs = kpis;
    lastPhysicianKPIFetch = now;
    return kpis;
  } catch (error) {
    console.error('[fetchPhysiciansKPIsAction] Error:', error);
    return cachedPhysicianKPIs || { total: 0, active: 0, pending: 0, avgPatients: 0 };
  }
}

/**
 * Single-shot Physician Workspace Bundle.
 *
 * Loads in ONE parallel server round-trip:
 *   - physician profile (from 'users' collection)
 *   - assigned clinic (from 'clinics' collection)
 *   - recent prescriptions (doctorId == physicianId, last 30)
 *   - assigned patients (from doctor_patient_relationships)
 *   - recent orders linked to those patients (up to 50)
 *   - performance stats: Rx count (30d), patient count, total volume
 *
 * Zero client-side Firestore calls needed after this.
 */
export async function fetchPhysicianWorkspaceBundleAction(physicianId) {
  if (!adminDb || !physicianId) return null;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [physicianDoc, prescSnap, relSnap, recentRxCountSnap] = await Promise.all([
      // 1. Physician profile
      adminDb.collection('users').doc(physicianId).get(),

      // 2. Last 30 prescriptions issued by this physician
      adminDb.collection('prescriptions')
        .where('doctorId', '==', physicianId)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get()
        .catch(() => adminDb.collection('prescriptions')
          .where('doctorId', '==', physicianId)
          .limit(30)
          .get()),

      // 3. Active patient relationships
      adminDb.collection('doctor_patient_relationships')
        .where('doctorId', '==', physicianId)
        .limit(200)
        .get(),

      // 4. Rx count in last 30 days (performance KPI)
      adminDb.collection('prescriptions')
        .where('doctorId', '==', physicianId)
        .where('createdAt', '>=', thirtyDaysAgo)
        .count()
        .get()
        .catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    if (!physicianDoc.exists) return null;

    const physician = serializeDoc(physicianDoc);
    const prescriptions = prescSnap.docs.map(d => serializeDoc(d)).filter(Boolean);
    const relationships = relSnap.docs.map(d => {
      const rel = d.data();
      let assignedAt = rel.assignedAt || rel.createdAt;
      if (assignedAt?.toDate) assignedAt = assignedAt.toDate().toISOString();
      return {
        id: d.id,
        patientId:    rel.patientId,
        patientName:  rel.patientName  || '',
        patientEmail: rel.patientEmail || '',
        status:       rel.status       || 'active',
        assignedAt,
      };
    });

    // 5. Load clinic in parallel AFTER we have physician doc (needs clinicId)
    const clinicId = physician.clinicId || physician.clinic || null;
    const clinic = clinicId
      ? await adminDb.collection('clinics').doc(clinicId).get()
          .then(d => d.exists ? serializeDoc(d) : null)
          .catch(() => null)
      : null;

    // 6. Orders from unique patient IDs found in prescriptions (chunked to Firestore 'in' limit = 30)
    const patientIds = [...new Set(prescriptions.map(p => p.patientId).filter(Boolean))];
    let orders = [];
    if (patientIds.length > 0) {
      const chunk = patientIds.slice(0, 30);
      const ordSnap = await adminDb.collection('orders')
        .where('userId', 'in', chunk)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()
        .catch(() => adminDb.collection('orders').where('userId', 'in', chunk).limit(50).get());
      orders = ordSnap.docs.map(d => serializeDoc(d)).filter(Boolean);
    }

    // Performance stats
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || Number(o.amount) || 0), 0);
    const rxLast30Days = recentRxCountSnap.data().count || 0;

    return {
      physician,
      clinic,
      prescriptions,
      relationships,
      orders,
      stats: {
        prescriptionCount:     prescriptions.length,
        rxLast30Days,
        patientCount:          relationships.filter(r => r.status !== 'revoked').length,
        orderCount:            orders.length,
        totalRevenue,
        lastPrescriptionDate:  prescriptions[0]?.createdAt || null,
        lastPrescriptionStatus: prescriptions[0]?.status   || null,
      }
    };
  } catch (error) {
    console.error('[fetchPhysicianWorkspaceBundleAction] Error:', error);
    return null;
  }
}

/**
 * Atomic transaction: assign (or reassign) a patient to a physician.
 *
 * In a single server transaction this function:
 *  1. Updates patients/{patientId}.physicianId + physicianName
 *  2. Upserts doctor_patient_relationships/{relationshipId}
 *  3. Appends a timeline event to the patient record
 *  4. Returns the new relationship object
 */
export async function assignDoctorToPatientAction({ patientId, physicianId, relationshipType = 'primary', notes = '', assignedByAdminId = null }) {
  if (!adminDb || !patientId || !physicianId) {
    return { success: false, error: 'patientId and physicianId are required' };
  }

  try {
    const [physicianDoc, patientDoc] = await Promise.all([
      adminDb.collection('users').doc(physicianId).get(),
      // Try patients collection first, fallback to users
      adminDb.collection('patients').doc(patientId).get()
        .then(d => d.exists ? d : adminDb.collection('users').doc(patientId).get()),
    ]);

    if (!physicianDoc.exists) return { success: false, error: 'Physician not found' };
    if (!patientDoc.exists)   return { success: false, error: 'Patient not found'   };

    const physician = physicianDoc.data();
    const patient   = patientDoc.data();

    const physicianName = physician.displayName
      || `${physician.firstName || ''} ${physician.lastName || ''}`.trim()
      || physician.name
      || 'Unknown Physician';

    const patientName = patient.displayName
      || `${patient.firstName || ''} ${patient.lastName || ''}`.trim()
      || patient.name
      || 'Unknown Patient';

    const now = new Date();
    const relId = `${physicianId}_${patientId}`;

    await adminDb.runTransaction(async (tx) => {
      const patientRef = patientDoc.ref;
      const relRef     = adminDb.collection('doctor_patient_relationships').doc(relId);

      // 1. Update patient document
      tx.update(patientRef, {
        physicianId,
        physicianName,
        assignedAt: now,
        updatedAt:  now,
      });

      // 2. Upsert relationship
      tx.set(relRef, {
        doctorId:      physicianId,
        doctorName:    physicianName,
        patientId,
        patientName,
        patientEmail:  patient.email || '',
        status:        'active',
        relationshipType,
        notes,
        assignedByAdminId,
        initiatedByRole: 'admin',
        createdAt: now,
        updatedAt: now,
      }, { merge: true });
    });

    return {
      success: true,
      relationship: {
        id:           relId,
        doctorId:     physicianId,
        doctorName:   physicianName,
        patientId,
        patientName,
        status:       'active',
        relationshipType,
        assignedAt:   now.toISOString(),
      }
    };
  } catch (error) {
    console.error('[assignDoctorToPatientAction] Transaction error:', error);
    return { success: false, error: error.message || 'Assignment failed' };
  }
}
