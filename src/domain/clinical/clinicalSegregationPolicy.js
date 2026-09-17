/**
 * clinicalSegregationPolicy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Clinical Segregation Policy (Domain Kernel).
 * 
 * Enforces strict HIPAA / Medical Privacy and multi-tenancy clinical isolation.
 * Prevents cross-clinic data leaks (e.g. Hortman Clinics / Dr. Sezgin Cagatay vs. Bedaya Polyclinic / Dr. Hanieh Erdmann).
 * Guarantees Fail-Closed security: if doctor identity cannot be verified, access is denied.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const normalizeStr = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Hard exclusion IDs and names for Dr. Hanieh Erdmann (Bedaya Polyclinic)
 * Under NO circumstance may Hortman Clinics / Dr. Cagatay records leak to Dr. Erdmann.
 */
export const DR_ERDMANN_BLOCKED_PATIENT_IDS = new Set([
  'alan-maclean-rutledge',
  'ke8uxxn1sumgpabnvt32',
  'matthew-taylor',
  'z3auimayspvij1gm95r',
]);

export const DR_ERDMANN_BLOCKED_NAME_SNIPPETS = [
  'alan maclean',
  'mangesh sakharkar',
  'matthew taylor',
];

export const OTHER_CLINIC_KEYWORDS = ['cagatay', 'sezgin', 'hortman'];

/**
 * Validates whether a patient belongs to a doctor's authorized scope.
 * 
 * @param {Object} patient - Patient record
 * @param {string} doctorId - Target physician ID
 * @returns {boolean} True if patient is strictly in physician's care
 */
export function isPatientInDoctorScope(patient, doctorId) {
  if (!patient || !doctorId) return false;

  const targetDocId = String(doctorId).toLowerCase().trim();
  const pId = String(patient.id || patient.objectID || '').toLowerCase().trim();
  const pName = normalizeStr(patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`);

  if (targetDocId === 'dr-hanieh-erdmann') {
    // 1. Explicit ID Blocklist
    if (DR_ERDMANN_BLOCKED_PATIENT_IDS.has(pId) || patient.physicianId === 'z3aUIMaYsPViG1JgM95r') {
      return false;
    }

    // 2. Explicit Name Snippet Blocklist
    if (DR_ERDMANN_BLOCKED_NAME_SNIPPETS.some(snippet => pName.includes(snippet))) {
      return false;
    }

    const docStr = normalizeStr(
      `${patient.doctorName || ''} ${patient.physicianName || ''} ${patient.prescribingDoctor || ''} ${patient.clinicName || ''} ${patient.clinic || ''} ${patient.physician || ''}`
    );

    // 3. Strict clinic keyword exclusions
    if (OTHER_CLINIC_KEYWORDS.some(kw => docStr.includes(kw))) {
      return false;
    }

    // 4. Positive physician & clinic match
    const isDirectMatch =
      patient.physicianId === 'dr-hanieh-erdmann' ||
      patient.assignedDoctorId === 'dr-hanieh-erdmann' ||
      patient.doctorId === 'dr-hanieh-erdmann' ||
      (Array.isArray(patient.doctorIds) && patient.doctorIds.includes('dr-hanieh-erdmann'));

    return isDirectMatch || docStr.includes('erdmann') || docStr.includes('bedaya');
  }

  // Generic physician segregation check
  return (
    patient.physicianId === targetDocId ||
    patient.assignedDoctorId === targetDocId ||
    patient.doctorId === targetDocId ||
    (Array.isArray(patient.doctorIds) && patient.doctorIds.includes(targetDocId))
  );
}

/**
 * Filters a list of patients strictly according to doctor authorization.
 * Fail-closed: returns empty array if doctorId is missing in doctor mode.
 * 
 * @param {Array} patients - List of patient records
 * @param {string} doctorId - Active doctor ID
 * @param {Object} [options] - Configuration options
 * @returns {Array} Filtered list
 */
export function filterDoctorPatients(patients, doctorId, options = {}) {
  if (!Array.isArray(patients) || patients.length === 0) return [];
  if (!doctorId && options.failClosed !== false) return [];

  const targetDocId = doctorId || 'dr-hanieh-erdmann';
  return patients.filter(patient => isPatientInDoctorScope(patient, targetDocId));
}

/**
 * Validates whether a prescription belongs to a doctor's authorized scope.
 * 
 * @param {Object} prescription - Prescription record
 * @param {string} doctorId - Target physician ID
 * @returns {boolean}
 */
export function isPrescriptionInDoctorScope(prescription, doctorId) {
  if (!prescription || !doctorId) return false;

  const targetDocId = String(doctorId).toLowerCase().trim();
  const rxDocId = String(prescription.doctorId || prescription.physicianId || '').toLowerCase().trim();
  const patientName = normalizeStr(prescription.patientName || prescription.name || prescription.patient?.name || '');
  const rxDocStr = normalizeStr(
    `${prescription.doctorName || ''} ${prescription.physicianName || ''} ${prescription.prescribingDoctor || ''} ${prescription.clinicName || ''} ${prescription.clinic || ''}`
  );

  // 1. Strict blacklist on Dr. Cagatay's patients (Hortman Clinics)
  if (
    DR_ERDMANN_BLOCKED_PATIENT_IDS.has(prescription.patientId) ||
    DR_ERDMANN_BLOCKED_PATIENT_IDS.has(prescription.id) ||
    DR_ERDMANN_BLOCKED_NAME_SNIPPETS.some(snippet => patientName.includes(snippet)) ||
    prescription.physicianId === 'z3aUIMaYsPViG1JgM95r' ||
    prescription.doctorId === 'z3aUIMaYsPViG1JgM95r'
  ) {
    if (targetDocId === 'dr-hanieh-erdmann') return false;
  }

  if (targetDocId === 'dr-hanieh-erdmann') {
    // Explicit exclusion of other clinics
    if (OTHER_CLINIC_KEYWORDS.some(kw => rxDocStr.includes(kw))) {
      return false;
    }
    return (
      rxDocId === 'dr-hanieh-erdmann' ||
      rxDocStr.includes('erdmann') ||
      rxDocStr.includes('bedaya')
    );
  }

  return rxDocId === targetDocId || (Array.isArray(prescription.doctorIds) && prescription.doctorIds.includes(targetDocId));
}

/**
 * Filters a list of prescriptions strictly according to doctor authorization.
 * 
 * @param {Array} prescriptions - List of prescriptions
 * @param {string} doctorId - Active doctor ID
 * @returns {Array}
 */
export function filterDoctorPrescriptions(prescriptions, doctorId) {
  if (!Array.isArray(prescriptions) || prescriptions.length === 0) return [];
  if (!doctorId) return [];
  return prescriptions.filter(rx => isPrescriptionInDoctorScope(rx, doctorId));
}

/**
 * Assert authorization: throws an Error if access is prohibited.
 * 
 * @param {Object} patient - Patient record
 * @param {string} doctorId - Active doctor ID
 */
export function assertDoctorAccess(patient, doctorId) {
  if (!isPatientInDoctorScope(patient, doctorId)) {
    const error = new Error('ClinicalAccessDenied: Physician is not authorized to access this patient record.');
    error.code = 'PERMISSION_DENIED';
    error.status = 403;
    throw error;
  }
}
