/**
 * roleQueryScope.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Firestore Query Security & Scope Engine.
 * Automatically injects UID tenant scoping constraints based on role claims.
 */

import { where } from 'firebase/firestore';

/**
 * Applies security scoping constraints to a Firestore query based on role.
 *
 * @param {string} collectionName - Target Firestore collection
 * @param {Object} user - Authenticated user object ({ uid, email, role })
 * @param {string} effectiveRole - Canonical role ('admin' | 'doctor' | 'patient' | 'wholesaler' | 'supplier')
 * @returns {Array} Array of Firestore query constraints
 */
export function getRoleQueryConstraints(collectionName, user, effectiveRole) {
  if (!user || !user.uid) return [];
  if (effectiveRole === 'admin') return []; // Admin has global view access

  const constraints = [];

  switch (collectionName) {
    case 'patients':
    case 'doctor_patient_relationships':
      if (effectiveRole === 'doctor') {
        constraints.push(where('doctorId', '==', user.uid));
      } else if (effectiveRole === 'patient') {
        constraints.push(where('patientId', '==', user.uid));
      }
      break;

    case 'prescriptions':
      if (effectiveRole === 'doctor') {
        constraints.push(where('doctorId', '==', user.uid));
      } else if (effectiveRole === 'patient') {
        constraints.push(where('patientId', '==', user.uid));
      }
      break;

    case 'orders':
    case 'bulk_orders':
      if (effectiveRole === 'wholesaler') {
        constraints.push(where('wholesalerId', '==', user.uid));
      } else if (effectiveRole === 'supplier') {
        constraints.push(where('supplierId', '==', user.uid));
      } else if (effectiveRole === 'patient') {
        constraints.push(where('patientId', '==', user.uid));
      } else if (effectiveRole === 'doctor') {
        constraints.push(where('doctorId', '==', user.uid));
      }
      break;

    case 'rfqs':
    case 'procurement_rfqs':
      if (effectiveRole === 'supplier') {
        constraints.push(where('supplierId', '==', user.uid));
      }
      break;

    case 'quotations':
      if (effectiveRole === 'wholesaler') {
        constraints.push(where('wholesalerId', '==', user.uid));
      } else if (effectiveRole === 'patient' || effectiveRole === 'doctor') {
        constraints.push(where('recipientId', '==', user.uid));
      }
      break;

    default:
      break;
  }

  return constraints;
}
