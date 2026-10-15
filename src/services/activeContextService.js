/**
 * Active Operations Context Service (Atlas Clinical Context Hub)
 * Manages the persistent active Doctor, Patient, and Supplier context across the platform.
 * Synchronizes with sessionStorage/localStorage and emits reactive DOM events.
 */

const STORAGE_KEY = 'atlas_active_operations_context';
const EVENT_NAME = 'atlas-active-context-updated';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage || window.localStorage;
}

export function getActiveContext() {
  const storage = getStorage();
  if (!storage) {
    return {
      doctor: null,
      patient: null,
      supplier: null,
      isDockClosed: false,
      isDockMinimized: false
    };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        doctor: null,
        patient: null,
        supplier: null,
        isDockClosed: false,
        isDockMinimized: false
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[ActiveContextService] Failed to parse stored context:', e);
    return {
      doctor: null,
      patient: null,
      supplier: null,
      isDockClosed: false,
      isDockMinimized: false
    };
  }
}

function persistAndBroadcast(context) {
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(context));
    } catch (e) {
      console.warn('[ActiveContextService] Failed to persist context:', e);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: context }));
  }
  return context;
}

export function setActiveDoctor(doctor) {
  const current = getActiveContext();
  const updated = {
    ...current,
    doctor: doctor ? {
      id: doctor.id || doctor.slug || 'doc',
      name: doctor.name || doctor.title || 'Doctor',
      slug: doctor.slug || (doctor.url ? doctor.url.replace('/dr/', '') : ''),
      specialty: doctor.specialty || doctor.badge || '',
      clinic: doctor.clinic || doctor.subtitle || ''
    } : null,
    isDockClosed: false // Auto-reopen dock when setting active context
  };
  return persistAndBroadcast(updated);
}

export function setActivePatient(patient) {
  const current = getActiveContext();
  const updated = {
    ...current,
    patient: patient ? {
      id: patient.id || patient.code || 'pt',
      name: patient.name || patient.title || 'Patient',
      code: patient.code || patient.subtitle?.split(' · ')[0] || (patient.url ? patient.url.replace('/rx/', '') : ''),
      condition: patient.condition || patient.badge || '',
      doctorName: patient.doctorName || ''
    } : null,
    isDockClosed: false
  };
  return persistAndBroadcast(updated);
}

export function setActiveSupplier(supplier) {
  const current = getActiveContext();
  const updated = {
    ...current,
    supplier: supplier ? {
      id: supplier.id || supplier.slug || 'sup',
      name: supplier.name || supplier.title || 'Supplier',
      slug: supplier.slug || (supplier.url ? supplier.url.replace('/collection/', '') : ''),
      badge: supplier.badge || supplier.category || 'Supplier'
    } : null,
    isDockClosed: false
  };
  return persistAndBroadcast(updated);
}

export function clearActiveDoctor() {
  const current = getActiveContext();
  return persistAndBroadcast({ ...current, doctor: null });
}

export function clearActivePatient() {
  const current = getActiveContext();
  return persistAndBroadcast({ ...current, patient: null });
}

export function clearActiveSupplier() {
  const current = getActiveContext();
  return persistAndBroadcast({ ...current, supplier: null });
}

export function clearAllActiveContext() {
  const current = getActiveContext();
  return persistAndBroadcast({
    ...current,
    doctor: null,
    patient: null,
    supplier: null
  });
}

export function setDockMinimized(isDockMinimized) {
  const current = getActiveContext();
  return persistAndBroadcast({ ...current, isDockMinimized });
}

export function setDockClosed(isDockClosed) {
  const current = getActiveContext();
  return persistAndBroadcast({ ...current, isDockClosed });
}

export function reopenDock() {
  const current = getActiveContext();
  return persistAndBroadcast({ ...current, isDockClosed: false, isDockMinimized: false });
}

export function subscribeToActiveContext(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = (event) => {
    callback(event.detail || getActiveContext());
  };

  window.addEventListener(EVENT_NAME, handler);
  // Also listen for storage events from other tabs
  const storageHandler = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getActiveContext());
    }
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
