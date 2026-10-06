import { adminDb } from '../../../../lib/firebaseAdmin.js';

export const dynamic = 'force-dynamic';

function getPosologyString(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    return raw.regimen || raw.summary || raw.timing || raw.notes || (Array.isArray(raw.steps) ? raw.steps[0] : '') || '';
  }
  return String(raw);
}

function formatDoctorName(name) {
  if (!name) return 'Treating Physician';
  return String(name)
    .replace(/,\s*md\b/i, ', MD')
    .replace(/,\s*fishrs\b/i, ', FISHRS')
    .replace(/,\s*phd\b/i, ', PhD')
    .replace(/,\s*facp\b/i, ', FACP')
    .replace(/,\s*faad\b/i, ', FAAD')
    .replace(/\bMd\b/, 'MD')
    .replace(/\bFishrs\b/, 'FISHRS');
}

function normalizePrescriptionDoc(docId, d) {
  return {
    id: docId,
    prescriptionNumber: d.prescriptionNumber || d.code || docId,
    code: d.code || d.prescriptionNumber || docId,
    patientName: d.patientName || d.patient?.name || 'Patient',
    patient: d.patient ? {
      name: d.patient.name,
      alias: d.patient.alias,
      dob: d.patient.dob,
      phone: d.patient.phone,
      email: d.patient.email,
      id: d.patient.id || d.patientId
    } : null,
    status: d.status || d.state || 'active',
    state: d.state || d.status || 'active',
    treatmentTitle: d.treatmentTitle || d.description || d.treatmentProgram || d.program || 'Personalized Formulation',
    clinic: d.clinic || d.clinicName || d.treatingDoctor?.clinic || 'Clinical Dispensary',
    clinicName: d.clinicName || d.clinic || d.treatingDoctor?.clinic || '',
    createdAt: d.createdAt ? (typeof d.createdAt === 'string' ? d.createdAt : (d.createdAt.toMillis ? d.createdAt.toMillis() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : String(d.createdAt)))) : null,
    items: Array.isArray(d.items) ? d.items.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle, _isVehicleOrBase: i._isVehicleOrBase })) : [],
    prescriptionLines: Array.isArray(d.prescriptionLines) ? d.prescriptionLines.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle })) : [],
    compounds: Array.isArray(d.compounds) ? d.compounds.map(i => ({ name: i.name, dose: i.dose })) : [],
    posology: getPosologyString(d.posology),
    structuredPosology: d.structuredPosology ? { summary: getPosologyString(d.structuredPosology) } : null,
    treatingDoctor: d.treatingDoctor ? {
      name: formatDoctorName(d.treatingDoctor.name),
      clinic: d.treatingDoctor.clinic,
      specialty: d.treatingDoctor.specialty,
      phone: d.treatingDoctor.phone,
      license: d.treatingDoctor.license || d.treatingDoctor.licenseNumber
    } : null,
    doctorName: formatDoctorName(d.doctorName || d.treatingDoctor?.name || d.doctor?.name || 'Treating Physician'),
    doctorLicense: d.doctorLicense || d.treatingDoctor?.license || d.treatingDoctor?.licenseNumber || '',
    description: d.description || ''
  };
}

/**
 * GET /api/prescriptions/switcher-list
 * ─────────────────────────────────────────────────────────────────────────────
 * Secure server-side endpoint using Firebase Admin SDK (adminDb).
 * Returns prescriptions for the active physician or patient without hitting
 * client-side Firestore Security Rule limits on public /rx/[code] views.
 */
export async function GET(request) {
  try {
    if (!adminDb) {
      return Response.json({ success: false, error: 'Database uninitialized' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'doctor'; // 'doctor' | 'patient'
    const doctorName = (searchParams.get('doctorName') || '').trim();
    const doctorId = (searchParams.get('doctorId') || '').trim();
    const patientName = (searchParams.get('patientName') || '').trim();
    const patientId = (searchParams.get('patientId') || '').trim();
    const currentRxId = (searchParams.get('currentRxId') || '').trim();

    const cleanDoctor = doctorName.toLowerCase().replace('dr.', '').replace('dr ', '').trim();
    const cleanPatient = patientName.toLowerCase().replace('h.e.', '').trim();

    const resultsMap = new Map();

    // 1. If currentRxId is provided, fetch it directly first to guarantee it is always present
    if (currentRxId) {
      try {
        const directDoc = await adminDb.collection('prescriptions').doc(currentRxId).get();
        if (directDoc.exists) {
          resultsMap.set(directDoc.id, normalizePrescriptionDoc(directDoc.id, directDoc.data()));
        }
      } catch (e) {
        console.warn('Switcher-list: directDoc fetch error', e);
      }
    }

    // 2. Query prescriptions from Firestore Admin SDK
    const snap = await adminDb.collection('prescriptions').limit(250).get();

    snap.forEach((doc) => {
      const d = doc.data();
      const dDocName = String(d.treatingDoctor?.name || d.doctorName || d.doctor?.name || d.prescribingDoctor || '').toLowerCase();
      const dDocId = String(d.treatingDoctor?.id || d.doctorId || d.doctor?.id || '').toLowerCase();
      const dPatName = String(d.patientName || d.patient?.name || '').toLowerCase();
      const dPatId = String(d.patientId || d.patient?.id || '').toLowerCase();

      let isMatch = false;

      if (scope === 'doctor') {
        const isCurrent = currentRxId && (doc.id === currentRxId || d.prescriptionNumber === currentRxId || d.code === currentRxId);
        const isDocNameMatch = cleanDoctor && dDocName && (dDocName.includes(cleanDoctor) || cleanDoctor.includes(dDocName));
        const isDocIdMatch = doctorId && dDocId && (dDocId === doctorId.toLowerCase());
        isMatch = Boolean(isCurrent || isDocNameMatch || isDocIdMatch);
      } else {
        // Patient scope (cross-physician record matching)
        const isCurrent = currentRxId && (doc.id === currentRxId || d.prescriptionNumber === currentRxId || d.code === currentRxId);
        const patWords = cleanPatient.split(/\s+/).filter(w => w.length >= 3 && !['h.e.', 'mr', 'mrs', 'ms', 'dr'].includes(w));
        const docPatWords = dPatName.split(/\s+/).filter(w => w.length >= 3);
        const matchingWords = patWords.filter(pw => docPatWords.some(dw => dw === pw));
        const isPatNameMatch = Boolean(cleanPatient && dPatName && (
          dPatName.includes(cleanPatient) ||
          cleanPatient.includes(dPatName) ||
          (patWords.length >= 2 ? matchingWords.length >= 2 : matchingWords.length >= 1)
        ));
        const isPatIdMatch = Boolean(patientId && dPatId && (dPatId === patientId.toLowerCase()));
        isMatch = Boolean(isCurrent || isPatNameMatch || isPatIdMatch);
      }

      if (isMatch) {
        resultsMap.set(doc.id, normalizePrescriptionDoc(doc.id, d));
      }
    });

    const prescriptions = Array.from(resultsMap.values());

    return Response.json({
      success: true,
      count: prescriptions.length,
      scope,
      prescriptions
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('API /api/prescriptions/switcher-list error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
