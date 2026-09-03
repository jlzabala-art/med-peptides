/**
 * @file firestoreSchema.js
 * @description FUENTE ÚNICA DE VERDAD — Campos canónicos de cada colección Firestore.
 * 
 * REGLA DE ORO: Si un componente necesita acceder a datos de Firestore,
 * DEBE usar estos helpers en lugar de acceder a campos directamente.
 * Esto previene errores silenciosos por mismatch de nombres de campo.
 * 
 * Última actualización: 2026-07-24 (inspeccionado de producción)
 */

// ─── COLECCIÓN: users ────────────────────────────────────────────────────────
// Roles: 'doctor', 'patient', 'admin', 'wholeseller'
export const UserSchema = {
  // Identidad
  getId: (u) => u?.id || u?.uid || '',
  getName: (u) => u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.fullName || 'Sin nombre',
  getEmail: (u) => u?.email || '',
  getPhone: (u) => u?.phone || '',
  getClinic: (u) => u?.clinicName || u?.institution || '',
  getSpecialty: (u) => u?.specialty || 'General',
  getStatus: (u) => u?.isArchived ? 'archived' : (u?.status || 'active'),
  getRole: (u) => u?.role || u?.userType || '',

  // Contadores denormalizados (mantenidos por Cloud Functions)
  getPrescriptionCount: (u) => u?.prescriptionCount ?? 0,
  getPatientCount: (u) => u?.patientCount ?? 0,
  getOrderCount: (u) => u?.orderCount ?? 0,
  getTotalRevenue: (u) => u?.totalRevenue ?? 0,
};

// ─── COLECCIÓN: prescriptions ────────────────────────────────────────────────
// Campos del médico: doctorId | physicianId | supervisingPhysicianId (los 3 apuntan al mismo)
// CANONICAL write field: doctorId + physicianId + supervisingPhysicianId (siempre los 3)
// CANONICAL read field: usar getPhysicianId() que intenta los 3
export const PrescriptionSchema = {
  getId: (p) => p?.id || '',
  getDocumentNumber: (p) => p?.documentNumber || p?.fagron?.boxId || p?.id?.slice(0, 8).toUpperCase() || '—',

  // Médico
  getPhysicianId: (p) => p?.doctorId || p?.physicianId || p?.supervisingPhysicianId || '',
  getPhysicianName: (p) => p?.doctorName || '',
  getPhysicianEmail: (p) => p?.doctorEmail || '',

  // Paciente (sub-documento anidado)
  getPatientId: (p) => p?.patientId || p?.patient?.uid || '',
  getPatientName: (p) => p?.patient?.name || p?.patientName || 'Paciente desconocido',
  getPatientEmail: (p) => p?.patient?.email || p?.patientEmail || '',
  getPatientPhone: (p) => p?.patient?.phone || '',

  // Clínica/Origen
  getClinic: (p) => p?.clinic || '',
  getSourceType: (p) => p?.sourceType || p?.source || 'Manual',
  getType: (p) => p?.type || 'patient',

  // Contenido clínico
  getDiagnosis: (p) => p?.diagnosis || p?.fagron ? 'Fagron Genomics' : '',
  getClinicalNotes: (p) => p?.clinicalNotes || '',
  getItems: (p) => p?.items || p?.formulas || [],

  // Estado y fechas
  getStatus: (p) => p?.status || 'draft',
  getCreatedAt: (p) => p?.createdAt?.seconds ? new Date(p.createdAt.seconds * 1000) : (p?.createdAt ? new Date(p.createdAt) : null),
  getUpdatedAt: (p) => p?.updatedAt?.seconds ? new Date(p.updatedAt.seconds * 1000) : null,
  getExpiresAt: (p) => p?.expiresAt?.seconds ? new Date(p.expiresAt.seconds * 1000) : null,

  // PDF / Documentos
  getPdfUrl: (p) => p?.fileUrl || p?.fagron?.originalPdfUrl || '',
};

// ─── COLECCIÓN: doctor_patient_relationships ─────────────────────────────────
// CANONICAL write fields: doctorId, patientId, patientName, patientEmail, status, createdAt
export const DoctorPatientRelSchema = {
  getId: (r) => r?.id || '',
  getDoctorId: (r) => r?.doctorId || '',
  getPatientId: (r) => r?.patientId || '',
  getPatientName: (r) => r?.patientName || 'Paciente desconocido',
  getPatientEmail: (r) => r?.patientEmail || '',
  getStatus: (r) => r?.status || 'active',
  getCreatedAt: (r) => r?.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : null,
  getSource: (r) => r?.source || r?.initiatedByRole || 'manual',
};

// ─── COLECCIÓN: orders ───────────────────────────────────────────────────────
// IMPORTANTE: orders NO tiene campo de médico. Se asocian al paciente (userId).
// Si necesitas órdenes de un médico, debes ir por prescripción → paciente → orden.
export const OrderSchema = {
  getId: (o) => o?.id || o?.orderId || '',
  getOrderNumber: (o) => o?.orderId || o?.id?.slice(0, 8).toUpperCase() || '—',
  getCustomerName: (o) => o?.customerName || o?.customer?.fullName || [o?.customer?.firstName, o?.customer?.lastName].filter(Boolean).join(' ') || 'Desconocido',
  getCustomerEmail: (o) => o?.customer?.email || '',
  getUserId: (o) => o?.userId || o?.uid || '',
  getStatus: (o) => o?.status || 'pending',
  getPaymentStatus: (o) => o?.paymentStatus || 'pending',
  getTotal: (o) => o?.total ?? o?.subtotal ?? 0,
  getCurrency: (o) => o?.currency || 'USD',
  getCreatedAt: (o) => o?.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null,
  getItems: (o) => o?.items || [],
  getRegion: (o) => o?.region || '',
};

// ─── COLECCIÓN: protocols ────────────────────────────────────────────────────
// IMPORTANTE: protocols NO tiene authorId/doctorId. Tiene author.name (string), NO una FK.
// Los protocolos son globales, no están directamente ligados a un médico en Firestore.
export const ProtocolSchema = {
  getId: (p) => p?.id || '',
  getName: (p) => p?.name || 'Sin nombre',
  getCategory: (p) => p?.therapeutic_category || p?.category || '—',
  getStatus: (p) => p?.status || 'draft',
  getAuthorName: (p) => p?.author?.name || p?.author || '—',
  getAuthorRole: (p) => p?.author?.role || '',
  getGoal: (p) => p?.primary_goal || p?.executiveSummary?.goal || '',
  getTargetAudience: (p) => p?.target_audience || '',
  getEvidenceLevel: (p) => p?.evidence_level || p?.clinical_evidence?.evidence_level || '',
  getCreatedAt: (p) => p?.created_at?.seconds ? new Date(p.created_at.seconds * 1000) : (p?.created_at ? new Date(p.created_at) : null),
  getTags: (p) => p?.tags || [],
  getVisibility: (p) => p?.visibility || p?.is_public ? 'public' : 'private',
  getPatientsCount: (p) => p?.telemetry?.patients_treated ?? 0,
};

// ─── FIRESTORE QUERY HELPERS ─────────────────────────────────────────────────
/**
 * Fetches all prescriptions for a physician, trying all 3 canonical ID fields.
 * Returns deduped array.
 */
export async function fetchPrescriptionsForPhysician(db, collection, query, where, limit, physicianId, pageLimit = 100) {
  const [s1, s2, s3] = await Promise.all([
    getDocs(query(collection(db, 'prescriptions'), where('doctorId', '==', physicianId), limit(pageLimit))),
    getDocs(query(collection(db, 'prescriptions'), where('physicianId', '==', physicianId), limit(pageLimit))),
    getDocs(query(collection(db, 'prescriptions'), where('supervisingPhysicianId', '==', physicianId), limit(pageLimit))),
  ]);
  const map = new Map();
  [...s1.docs, ...s2.docs, ...s3.docs].forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
  return Array.from(map.values());
}
