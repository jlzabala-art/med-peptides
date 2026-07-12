/**
 * repositories/mappers.js
 * 
 * Anti-Corruption Layer (Data Mappers)
 * This module ensures that all data coming from Firestore is clean, strict, and predictable
 * before it reaches the UI. It prevents React crashes due to legacy data structures.
 */

function safeString(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (typeof val === 'object') {
    // Try to extract known legacy object properties
    if (val.name && typeof val.name === 'string') return val.name;
    if (val.title && typeof val.title === 'string') return val.title;
    if (val.primary && typeof val.primary === 'string') return val.primary;
    if (val.description && typeof val.description === 'string') return val.description;
    if (val.afterMonths) return `${val.afterMonths} months`;
    // If it's an unrecognized object, don't crash, return fallback
    return fallback;
  }
  return fallback;
}

export function normalizePrescription(data, id = null) {
  return {
    ...data,
    id: id || data.id,
    diagnosis: safeString(data.diagnosis, '—'),
    protocol: safeString(data.protocol || data.protocolName, '—'),
    followUp: safeString(data.followUp || data.followUpDate, '—'),
    status: safeString(data.status, 'draft'),
    source: safeString(data.source || data.type, 'Manual'),
    patient: {
      ...data.patient,
      name: safeString(data.patient?.name || data.patientName, 'Unknown Patient')
    },
    doctor: {
      ...data.doctor,
      name: safeString(data.doctor?.name || data.doctorName, '—')
    },
    items: Array.isArray(data.items) ? data.items : (Array.isArray(data.products) ? data.products : [])
  };
}

export function normalizeProtocol(data, id = null) {
  return {
    ...data,
    id: id || data.id,
    name: safeString(data.name || data.title, 'Unnamed Protocol'),
    description: safeString(data.description, ''),
    primary_goal: safeString(data.primary_goal || data.goal, ''),
    status: safeString(data.status, 'draft')
  };
}

export function normalizeProduct(data, id = null) {
  return {
    ...data,
    id: id || data.id,
    name: safeString(data.name || data.title, 'Unnamed Product'),
    price: typeof data.price === 'number' ? data.price : parseFloat(data.price) || 0,
    status: safeString(data.status, 'active')
  };
}

export function normalizeUser(data, id = null) {
  return {
    ...data,
    id: id || data.id,
    uid: id || data.uid || data.id,
    firstName: safeString(data.firstName, ''),
    lastName: safeString(data.lastName, ''),
    role: safeString(data.role, 'patient'),
    email: safeString(data.email, '')
  };
}
