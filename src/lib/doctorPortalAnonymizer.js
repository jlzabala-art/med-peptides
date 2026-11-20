import {
  sanitizePrescriptionCode,
  getCodifiedPatientId,
  maskDateOfBirth,
  maskMedicalLicense
} from '@/lib/prescriptionSanitizer';

/**
 * Server-Side DHA / UAE Health Data Law / HIPAA Anonymizer
 * Strips nominal patient PII from SSR initialData when the incoming request
 * has no verified workstation cookie, auth session, or magic/auth token.
 */
export function anonymizeDoctorPortalData(portalData) {
  if (!portalData || typeof portalData !== 'object') return portalData;

  const opaqueCode = portalData.doctor?.opaqueCode || portalData.doctor?.slug || 'PHYSICIAN';
  const docLicense = portalData.doctor?.license || '';

  const tasks = Array.isArray(portalData.tasks)
    ? portalData.tasks.map((t) => {
        const cleanCode = sanitizePrescriptionCode(t.code || t.id, t.patientName);
        const codifiedPt = getCodifiedPatientId(t.patientName, cleanCode);
        return {
          ...t,
          code: cleanCode,
          patientName: `Patient ${codifiedPt}`,
          patient: {
            ...(t.patient || {}),
            name: `Patient ${codifiedPt}`,
            phone: '',
            mobile: '',
            email: '',
            dob: maskDateOfBirth(t.patient?.dob || t.patientDob, false)
          },
          patientPhone: '',
          patientDob: maskDateOfBirth(t.patientDob, false),
          phone: '',
          mobile: '',
          whatsappMessage: `Hello Patient ${codifiedPt}, your clinical follow-up for ${t.treatmentTitle || 'treatment plan'} is on file (Ref #${cleanCode}).`,
          description: (t.description || '').replace(new RegExp(t.patientName || 'XYZPATIENT', 'gi'), `Patient ${codifiedPt}`)
        };
      })
    : [];

  const prescriptions = Array.isArray(portalData.prescriptions)
    ? portalData.prescriptions.map((p) => {
        const cleanCode = sanitizePrescriptionCode(p.code || p.prescriptionNumber || p.id, p.patientName);
        const codifiedPt = getCodifiedPatientId(p.patientName, cleanCode);
        return {
          ...p,
          code: cleanCode,
          prescriptionNumber: cleanCode,
          patientName: `Patient ${codifiedPt}`,
          patient: {
            ...(p.patient || {}),
            name: `Patient ${codifiedPt}`,
            phone: '',
            mobile: '',
            email: '',
            dob: maskDateOfBirth(p.patient?.dob || p.dob, false)
          },
          patientPhone: '',
          patientEmail: '',
          phone: '',
          mobile: '',
          email: '',
          doctorLicense: maskMedicalLicense(p.doctorLicense || docLicense, false, opaqueCode)
        };
      })
    : [];

  const labResults = Array.isArray(portalData.labResults)
    ? portalData.labResults.map((l) => {
        const cleanCode = sanitizePrescriptionCode(l.code || l.id, l.patientName);
        const codifiedPt = getCodifiedPatientId(l.patientName, cleanCode);
        return {
          ...l,
          code: cleanCode,
          patientName: `Patient ${codifiedPt}`,
          patient: {
            ...(l.patient || {}),
            name: `Patient ${codifiedPt}`,
            phone: '',
            dob: maskDateOfBirth(l.patient?.dob, false)
          },
          patientPhone: '',
          doctorName: `Physician (${opaqueCode})`
        };
      })
    : [];

  const patients = Array.isArray(portalData.patients)
    ? portalData.patients.map((pt, idx) => {
        const refCode = pt.prescriptions?.[0]?.code || pt.id || `P-${idx + 1}`;
        const cleanCode = sanitizePrescriptionCode(refCode, pt.name || pt.patientName);
        const codifiedPt = getCodifiedPatientId(pt.name || pt.patientName, cleanCode);
        return {
          ...pt,
          name: `Patient ${codifiedPt}`,
          patientName: `Patient ${codifiedPt}`,
          phone: '',
          mobile: '',
          email: '',
          dob: maskDateOfBirth(pt.dob, false)
        };
      })
    : [];

  return {
    ...portalData,
    serverAnonymized: true,
    tasks,
    prescriptions,
    labResults,
    patients
  };
}
