/**
 * services/securityKernel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Central Security & Data Scoping Kernel (Golden Rule #14 & Architecture Standard).
 *
 * Enforces role-scoped data access rules across all repositories and components.
 *
 * Rules:
 *   - Admin (`admin`): Global unrestricted access across all collections.
 *   - Medical Director (`medical_director`): Global access to clinical data (Patients, Doctors, Protocols, Prescriptions), zero financial/supplier data.
 *   - Doctor (`doctor`): Strict single-physician scope. Access restricted to assigned patients, doctor's prescriptions, and doctor's orders.
 *   - Patient (`patient`): Personal scope. Access restricted exclusively to patient's own profile, prescriptions, and orders.
 *   - Supplier / Wholesaler (`supplier` | `wholesaler`): Commercial scope. Access restricted to supplier's products, RFQs, and POs.
 *   - Compounding Pharmacy (`pharmacy` | `compounding_pharmacy`): Fulfillment scope. Access restricted to compounding prescriptions and assigned POs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { where } from 'firebase/firestore';

/**
 * Normalises raw role string.
 * @param {string} role
 * @returns {string}
 */
export function normalizeRole(role) {
  if (!role) return 'guest';
  const r = String(role).toLowerCase().trim();
  if (r === 'wholeseller' || r === 'wholesaler') return 'supplier';
  if (r === 'pharmacy') return 'compounding_pharmacy';
  if (r === 'physician') return 'doctor';
  return r;
}

/**
 * Build Firestore query constraints for querying Patients.
 * @param {{ uid: string, effectiveRole: string }} userContext
 * @returns {import('firebase/firestore').QueryConstraint[]}
 */
export function buildPatientQueryConstraints({ uid, effectiveRole }) {
  const role = normalizeRole(effectiveRole);

  if (role === 'admin' || role === 'medical_director') {
    // Global Access for Admin & Medical Director
    return [];
  }

  if (role === 'doctor') {
    // Physician only sees assigned patients
    return [where('doctorIds', 'array-contains', uid)];
  }

  if (role === 'patient') {
    // Patient only sees themselves
    return [where('uid', '==', uid)];
  }

  if (role === 'supplier' || role === 'compounding_pharmacy') {
    // Suppliers / Pharmacies cannot query generic patient lists
    return [where('id', '==', '__forbidden__')];
  }

  return [where('id', '==', '__forbidden__')];
}

/**
 * Build Firestore query constraints for querying Orders / POs.
 * @param {{ uid: string, effectiveRole: string }} userContext
 * @returns {import('firebase/firestore').QueryConstraint[]}
 */
export function buildOrderQueryConstraints({ uid, effectiveRole }) {
  const role = normalizeRole(effectiveRole);

  if (role === 'admin') {
    return [];
  }

  if (role === 'medical_director' || role === 'doctor') {
    return [where('doctorId', '==', uid)];
  }

  if (role === 'patient') {
    return [where('patientId', '==', uid)];
  }

  if (role === 'supplier') {
    return [where('supplierId', '==', uid)];
  }

  if (role === 'compounding_pharmacy') {
    return [where('pharmacyId', '==', uid)];
  }

  return [where('id', '==', '__forbidden__')];
}

/**
 * Build Firestore query constraints for querying Prescriptions.
 * @param {{ uid: string, effectiveRole: string }} userContext
 * @returns {import('firebase/firestore').QueryConstraint[]}
 */
export function buildPrescriptionQueryConstraints({ uid, effectiveRole }) {
  const role = normalizeRole(effectiveRole);

  if (role === 'admin' || role === 'medical_director') {
    return [];
  }

  if (role === 'doctor') {
    return [where('doctorId', '==', uid)];
  }

  if (role === 'patient') {
    return [where('patientId', '==', uid)];
  }

  if (role === 'compounding_pharmacy') {
    return [where('status', 'in', ['approved', 'processing'])];
  }

  return [where('id', '==', '__forbidden__')];
}

/**
 * Build Firestore query constraints for querying RFQs.
 * @param {{ uid: string, effectiveRole: string }} userContext
 * @returns {import('firebase/firestore').QueryConstraint[]}
 */
export function buildRfqQueryConstraints({ uid, effectiveRole }) {
  const role = normalizeRole(effectiveRole);

  if (role === 'admin') {
    return [];
  }

  if (role === 'supplier') {
    return [where('supplierId', '==', uid)];
  }

  return [where('id', '==', '__forbidden__')];
}

/**
 * Filter an in-memory patient array according to role & uid context.
 * @template T
 * @param {T[]} items
 * @param {{ uid: string, effectiveRole: string }} userContext
 * @returns {T[]}
 */
export function scopePatientArray(items, { uid, effectiveRole }) {
  if (!Array.isArray(items)) return [];
  const role = normalizeRole(effectiveRole);

  if (role === 'admin' || role === 'medical_director') {
    return items;
  }

  if (role === 'doctor') {
    return items.filter((p) => {
      if (p.physicianId === uid || p.assignedDoctorId === uid) return true;
      if (Array.isArray(p.doctorIds) && p.doctorIds.includes(uid)) return true;
      if (Array.isArray(p.assignedPhysicianIds) && p.assignedPhysicianIds.includes(uid)) return true;
      return false;
    });
  }

  if (role === 'patient') {
    return items.filter((p) => p.id === uid || p.uid === uid || p.objectID === uid);
  }

  return [];
}
