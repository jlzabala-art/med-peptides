import { adminDb } from '@/lib/firebaseAdmin';
import { KNOWN_DOCTORS_DIRECTORY } from '@/services/doctorDirectoryService';

// ── In-Memory RAM Cache (Golden Rule #2) ─────────────────────────────────────
// Layer 1: 0ms RAM cache with 10-minute TTL
export const DOCTOR_RAM_CACHE = new Map();
export const DOCTOR_DIRECTORY_CACHE = {
  expiresAt: 0,
  doctors: []
};

export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function invalidateDoctorCache(slugOrId = null) {
  if (!slugOrId) {
    DOCTOR_RAM_CACHE.clear();
    DOCTOR_DIRECTORY_CACHE.expiresAt = 0;
    DOCTOR_DIRECTORY_CACHE.doctors = [];
  } else {
    const key = String(slugOrId).toLowerCase().trim();
    DOCTOR_RAM_CACHE.delete(key);
  }
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^dr[a]?\.\s*/i, '')
    .replace(/^dr[a]?\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Generates an opaque codified doctor identifier (e.g. "DR-XIHVYF56")
 * Ensures physician identity is not exposed in shared URLs.
 */
export function getDoctorOpaqueCode(docId, doctorData = {}) {
  if (doctorData?.doctorCode) return String(doctorData.doctorCode).toUpperCase();
  if (!docId) return 'DR-ATLAS01';
  const cleanId = String(docId).replace(/[^a-zA-Z0-9]/g, '');
  const prefix = cleanId.slice(0, 8).toUpperCase();
  return `DR-${prefix}`;
}

export function formatDoctorName(name) {
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

function getPosologyString(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    return raw.regimen || raw.summary || raw.timing || raw.notes || (Array.isArray(raw.steps) ? raw.steps[0] : '') || '';
  }
  return String(raw);
}

/**
 * Fetches the directory of doctors from Firestore (cached in RAM for 15 mins).
 */
async function getCachedDoctorDirectory() {
  const now = Date.now();
  if (DOCTOR_DIRECTORY_CACHE.expiresAt > now && DOCTOR_DIRECTORY_CACHE.doctors.length > 0) {
    return DOCTOR_DIRECTORY_CACHE.doctors;
  }

  if (!adminDb) return [];

  const usersSnap = await adminDb.collection('users').get();
  const doctors = [];

  usersSnap.forEach((doc) => {
    const d = doc.data();
    const isDoc = d.role === 'doctor' || d.role === 'physician' || d.isDoctor;
    if (!isDoc) return;

    const docName = d.displayName || (d.firstName ? `${d.firstName} ${d.lastName || ''}` : '') || d.name || '';
    const opaqueCode = getDoctorOpaqueCode(doc.id, d);
    const nameSlug = slugify(docName);

    doctors.push({
      id: doc.id,
      docId: doc.id,
      opaqueCode,
      nameSlug,
      data: d,
      name: docName,
      license: d.licenseNumber || d.dhaLicense || d.germanMedicalId || ''
    });
  });

  // Enrich with KNOWN_DOCTORS_DIRECTORY for doctors without user accounts
  if (Array.isArray(KNOWN_DOCTORS_DIRECTORY)) {
    for (const kd of KNOWN_DOCTORS_DIRECTORY) {
      const existing = doctors.find(d => d.id === kd.id || slugify(d.name) === slugify(kd.name));
      if (!existing) {
        doctors.push({
          id: kd.id,
          docId: kd.id,
          opaqueCode: getDoctorOpaqueCode(kd.id, kd),
          nameSlug: slugify(kd.name),
          data: {
            displayName: kd.name,
            name: kd.name,
            clinic: kd.clinic || kd.clinicName,
            specialty: kd.specialty,
            licenseNumber: kd.license || kd.licenseNumber,
            phone: kd.phone,
            mobile: kd.mobile,
            email: kd.email,
            address: kd.address,
            city: kd.city,
            country: kd.country
          },
          name: kd.name,
          license: kd.license || kd.licenseNumber || ''
        });
      }
    }
  }

  DOCTOR_DIRECTORY_CACHE.doctors = doctors;
  DOCTOR_DIRECTORY_CACHE.expiresAt = now + (15 * 60 * 1000);
  return doctors;
}

/**
 * High-performance cached resolver for Doctor Public Portal data.
 * Resolves by opaqueCode (e.g. "DR-XIHVYF56"), docId ("xihvYf568p39zDR3DI8t"), or nameSlug ("haytham-salem").
 */
export async function getDoctorPortalData(slug, { forceRefresh = false } = {}) {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();
  const upperSlug = cleanSlug.toUpperCase();

  // 1. In-Memory RAM Cache check
  if (!forceRefresh) {
    const cached = DOCTOR_RAM_CACHE.get(cleanSlug) || DOCTOR_RAM_CACHE.get(upperSlug);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  const doctors = await getCachedDoctorDirectory();
  
  // Find doctor matching: opaqueCode, docId, or nameSlug
  let matchedDoc = doctors.find(doc => {
    return doc.opaqueCode.toLowerCase() === cleanSlug ||
           doc.id.toLowerCase() === cleanSlug ||
           doc.nameSlug === cleanSlug ||
           doc.nameSlug.replace(/-/g, '') === cleanSlug.replace(/-/g, '') ||
           (doc.license && doc.license.toLowerCase() === cleanSlug);
  });

  let doctorDoc = matchedDoc ? matchedDoc.data : null;
  let doctorId = matchedDoc ? matchedDoc.id : null;
  let opaqueCode = matchedDoc ? matchedDoc.opaqueCode : null;

  // Fallback probe in prescriptions if not found in users collection
  if (!doctorDoc && adminDb) {
    const rxProbe = await adminDb.collection('prescriptions').limit(200).get();
    rxProbe.forEach((doc) => {
      const d = doc.data();
      const dName = d.doctorName || d.treatingDoctor?.name || d.prescribingDoctor || '';
      if (dName && slugify(dName) === cleanSlug) {
        doctorDoc = {
          displayName: dName,
          clinic: d.clinic || d.treatingDoctor?.clinic || 'Clinical Dispensary',
          specialty: d.treatingDoctor?.specialty || 'Regenerative Medicine',
          licenseNumber: d.doctorLicense || d.treatingDoctor?.license || ''
        };
        doctorId = d.doctorId || d.treatingDoctor?.id || cleanSlug;
        opaqueCode = getDoctorOpaqueCode(doctorId, doctorDoc);
      }
    });
  }

  if (!doctorDoc) return null;

  const cleanDoctorName = (doctorDoc.displayName || doctorDoc.name || `${doctorDoc.firstName || ''} ${doctorDoc.lastName || ''}`).trim();
  const cleanDoctorQuery = cleanDoctorName.toLowerCase().replace('dr.', '').replace('dr ', '').trim();
  if (!opaqueCode) opaqueCode = getDoctorOpaqueCode(doctorId, doctorDoc);

  // 2. Fetch prescriptions for this doctor
  const rxSnap = await adminDb.collection('prescriptions').limit(300).get();
  const prescriptions = [];
  const patientMap = new Map();

  rxSnap.forEach((doc) => {
    const d = doc.data();
    const treatingDocName = typeof d.treatingDoctor === 'string' ? d.treatingDoctor : d.treatingDoctor?.name;
    const treatingDocId = typeof d.treatingDoctor === 'object' ? d.treatingDoctor?.id : null;
    const dDocName = String(treatingDocName || d.doctorName || d.doctor?.name || d.prescribingDoctor || '').toLowerCase();
    const dDocId = String(treatingDocId || d.treatingDoctorId || d.doctorId || d.doctor?.id || '').toLowerCase();

    const isMatch = (doctorId && dDocId === doctorId.toLowerCase()) ||
                    (cleanDoctorQuery && dDocName && (dDocName.includes(cleanDoctorQuery) || cleanDoctorQuery.includes(dDocName)));

    if (isMatch) {
      const patName = d.patientName || d.patient?.name || 'Patient';
      const patId = d.patientId || d.patient?.id || doc.id;
      patientMap.set(patId, {
        id: patId,
        name: patName,
        dob: d.patient?.dob || null,
        phone: d.patient?.phone || null,
        email: d.patient?.email || null
      });

      // Priority to phaseName for multi-phase protocols
      const treatmentTitle = d.phaseName || d.treatmentTitle || d.description || d.treatmentProgram || d.program || 'Personalized Formulation';

      prescriptions.push({
        id: doc.id,
        prescriptionNumber: d.prescriptionNumber || d.code || doc.id,
        code: d.code || d.prescriptionNumber || doc.id,
        patientName: patName,
        patientId: patId,
        patient: d.patient || null,
        status: d.status || d.state || 'active',
        state: d.state || d.status || 'active',
        treatmentTitle: treatmentTitle,
        phaseName: d.phaseName || null,
        partNumber: d.partNumber != null ? Number(d.partNumber) : null,
        isMultiPart: !!d.isMultiPart,
        totalParts: d.totalParts || null,
        clinic: d.clinic || d.clinicName || doctorDoc.clinicName || doctorDoc.clinic || 'Clinical Dispensary',
        createdAt: d.createdAt ? (d.createdAt.toMillis ? d.createdAt.toMillis() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : String(d.createdAt))) : null,
        items: Array.isArray(d.items) ? d.items.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle, _isVehicleOrBase: i._isVehicleOrBase })) : [],
        prescriptionLines: Array.isArray(d.prescriptionLines) ? d.prescriptionLines.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle })) : [],
        compounds: Array.isArray(d.compounds) ? d.compounds.map(i => ({ name: i.name, dose: i.dose })) : [],
        posology: getPosologyString(d.posology),
        structuredPosology: d.structuredPosology || null,
        vehicles: Array.isArray(d.vehicles) ? d.vehicles : [],
        notes: d.notes || d.clinicalNotes || ''
      });
    }
  });

  // Sort: sequential phases grouped by patient, then date descending
  prescriptions.sort((a, b) => {
    if (a.patientName === b.patientName && a.partNumber != null && b.partNumber != null) {
      return a.partNumber - b.partNumber;
    }
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  // 3. Generate Patient-Centric Clinical Tasks (Deduplicated per patient)
  const clinicalTasks = [];
  const seenPatientTasks = new Set();
  const now = Date.now();

  prescriptions.forEach((rx) => {
    const rxAgeDays = rx.createdAt ? Math.floor((now - new Date(rx.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Task Type 1: Protocol Phase Progression / Titration Check
    const isMultiPhase = rx.isMultiPart || rx.partNumber != null ||
                         String(rx.treatmentTitle || '').toLowerCase().includes('phase') ||
                         String(rx.posology || '').toLowerCase().includes('phase') ||
                         (Array.isArray(rx.items) && rx.items.length >= 4);

    const titrationKey = `${rx.patientName.toLowerCase()}_titration`;
    if (isMultiPhase && rx.status === 'approved' && !seenPatientTasks.has(titrationKey)) {
      seenPatientTasks.add(titrationKey);
      const phaseNum = rx.partNumber || 1;
      const nextPhaseNum = phaseNum + 1;
      const phaseLabel = rx.phaseName ? `(${rx.phaseName.replace(/^Phase\s*\d+:\s*/i, '')})` : '';

      clinicalTasks.push({
        id: `task-phase-${rx.id}`,
        rxId: rx.id,
        code: rx.code,
        patientName: rx.patientName,
        type: 'titration',
        priority: rxAgeDays > 25 ? 'high' : 'medium',
        title: `Protocol Phase ${phaseNum} Evaluation: ${rx.patientName}`,
        description: `Treatment is at day ${rxAgeDays || 1}. Review Phase ${phaseNum} ${phaseLabel} tolerance and approve Phase ${nextPhaseNum} transition formulation.`,
        dueDate: 'Next 5 days',
        actionLabel: 'Review Protocol',
        actionUrl: `/rx/${rx.code}`
      });
    }

    // Task Type 2: Refill / Quotation Follow-up (30-day supply approaching completion)
    const refillKey = `${rx.patientName.toLowerCase()}_refill`;
    if (rxAgeDays >= 20 && rxAgeDays <= 45 && rx.status === 'approved' && !seenPatientTasks.has(refillKey)) {
      seenPatientTasks.add(refillKey);
      clinicalTasks.push({
        id: `task-refill-${rx.id}`,
        rxId: rx.id,
        code: rx.code,
        patientName: rx.patientName,
        type: 'refill',
        priority: 'medium',
        title: `Supply Refill Window Open: ${rx.patientName}`,
        description: `Patient 30-day dispensary supply reaching completion. Verify clinical adherence before refilling.`,
        dueDate: 'Next 7 days',
        actionLabel: 'Issue Refill',
        actionUrl: `/rx/${rx.code}`
      });
    }

    // Task Type 3: Pending Prescription Sign-off (draft or pending review)
    const signKey = `${rx.patientName.toLowerCase()}_approval_${rx.id}`;
    if (['pending', 'draft'].includes(rx.status.toLowerCase()) && !seenPatientTasks.has(signKey)) {
      seenPatientTasks.add(signKey);
      clinicalTasks.push({
        id: `task-sign-${rx.id}`,
        rxId: rx.id,
        code: rx.code,
        patientName: rx.patientName,
        type: 'approval',
        priority: 'urgent',
        title: `Pending Clinical Verification: ${rx.patientName}`,
        description: `Extracted formulation requires physician clinical sign-off and dispensing authorization.`,
        dueDate: 'Immediate',
        actionLabel: 'Authorize Rx',
        actionUrl: `/rx/${rx.code}`
      });
    }
  });

  // Fallback task if none triggered
  if (clinicalTasks.length === 0 && prescriptions.length > 0) {
    const topRx = prescriptions[0];
    clinicalTasks.push({
      id: `task-followup-${topRx.id}`,
      rxId: topRx.id,
      code: topRx.code,
      patientName: topRx.patientName,
      type: 'milestone',
      priority: 'normal',
      title: `Clinical Milestone Follow-up: ${topRx.patientName}`,
      description: `Routine 30-day therapeutic monitoring for ${topRx.treatmentTitle}.`,
      dueDate: 'Next 10 days',
      actionLabel: 'View Dossier',
      actionUrl: `/rx/${topRx.code}`
    });
  }

  // 4. Compute GCP Standard KPIs
  const activePrescriptions = prescriptions.filter(p => ['approved', 'active'].includes(p.status.toLowerCase())).length;
  const monitoredPatients = patientMap.size;
  const pendingTasksCount = clinicalTasks.length;
  const refillsDueCount = clinicalTasks.filter(t => t.type === 'refill' || t.type === 'titration').length;

  const nameSlug = slugify(cleanDoctorName);

  const doctorProfile = {
    id: doctorId,
    name: formatDoctorName(cleanDoctorName),
    title: doctorDoc.title || 'Dr.',
    specialty: doctorDoc.specialty || doctorDoc.speciality || 'Regenerative Medicine & Nutrigenomics',
    clinic: doctorDoc.clinicName || doctorDoc.clinic || 'Atlas Clinical Partner',
    license: doctorDoc.licenseNumber || doctorDoc.dhaLicense || doctorDoc.germanMedicalId || 'DHA-P-0319842',
    email: doctorDoc.email || '',
    phone: doctorDoc.phone || doctorDoc.mobile || '',
    location: doctorDoc.location || doctorDoc.city || 'Dubai, UAE',
    subscriptionTier: doctorDoc.subscriptionTier || 'basic',
    slug: opaqueCode, // Codified opaque URL (e.g. "DR-XIHVYF56")
    nameSlug: nameSlug,
    opaqueCode: opaqueCode
  };

    // 5. Fetch Curated Compounding Peptide Formulary (Lotusland Bioactive APIs)
    let formulary = [];
    try {
      const productsSnap = await adminDb.collection('products')
        .where('status', 'in', ['active', 'published'])
        .limit(60)
        .get();

      function sanitizeString(val, fallback = '') {
        if (!val) return fallback;
        if (typeof val === 'string') return val.trim();
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') {
          if (typeof val.summary === 'string') return val.summary.trim();
          if (typeof val.description === 'string') return val.description.trim();
          if (typeof val.text === 'string') return val.text.trim();
          if (typeof val.content === 'string') return val.content.trim();
          if (Array.isArray(val)) {
            return val
              .map(item => (typeof item === 'object' ? (item.summary || item.name || item.label || '') : String(item)))
              .filter(Boolean)
              .join(', ');
          }
          return fallback;
        }
        return String(val);
      }

      const seenNames = new Set();
      productsSnap.forEach((doc) => {
        const p = doc.data();
        const cat = String(p.categoryId || p.category || '').toLowerCase();
        const isPeptide = cat.includes('peptide') || p.productType === 'peptide' || p.isPeptide;
        if (!isPeptide) return;

        const name = sanitizeString(p.canonicalName || p.name, 'Bioactive Peptide');
        const cleanNameKey = name.toLowerCase().trim();
        if (seenNames.has(cleanNameKey)) return;
        seenNames.add(cleanNameKey);

        const primaryGoal = sanitizeString(p.primaryGoal || (Array.isArray(p.goals) && p.goals[0]), 'Cellular Optimization');
        const goals = Array.isArray(p.goals)
          ? p.goals.map(g => sanitizeString(g)).filter(Boolean)
          : [primaryGoal];

        const rawMoa = p.mechanismOfAction || p.action || p.aiSummary;
        const moa = sanitizeString(rawMoa, 'Targeted molecular signaling and receptor upregulation under medical vigilance.');
        const description = sanitizeString(p.aiDescription || p.description, 'Analytical grade bioactive peptide API for customized compounding magistral protocols.');
        const purity = sanitizeString(p.purity, '≥ 99% (HPLC Verified)');
        const route = sanitizeString(p.route, 'Lyophilized API (SubQ / Topical / Oral)');
        const casNumber = sanitizeString(p.casNumber || p.cas, null);
        const sequence = sanitizeString(p.sequence, null);
        const molecularWeight = sanitizeString(p.molecularWeight || p.mw, null);
        const halfLife = sanitizeString(p.halfLife, null);
        const contraindications = sanitizeString(p.contraindications, null);

        formulary.push({
          id: doc.id,
          slug: p.slug || doc.id,
          name,
          description,
          category: 'peptide',
          primaryGoal,
          goals,
          purity,
          casNumber,
          sequence,
          molecularWeight,
          route,
          moa,
          halfLife,
          contraindications,
          inStock: p.inStock ?? true
        });
      });
    } catch (err) {
      console.warn('Could not load products formulary in doctorCache:', err);
    }

    const payload = {
      success: true,
      doctor: doctorProfile,
      kpis: {
        activePrescriptions,
        monitoredPatients,
        pendingTasksCount,
        refillsDueCount
      },
      tasks: clinicalTasks,
      prescriptions,
      patients: Array.from(patientMap.values()),
      formulary
    };

  // Cache in RAM for 10 minutes under all lookup aliases
  const expiresAt = now + CACHE_TTL_MS;
  DOCTOR_RAM_CACHE.set(cleanSlug, { data: payload, expiresAt });
  DOCTOR_RAM_CACHE.set(opaqueCode.toLowerCase(), { data: payload, expiresAt });
  if (nameSlug) DOCTOR_RAM_CACHE.set(nameSlug, { data: payload, expiresAt });
  if (doctorId) DOCTOR_RAM_CACHE.set(String(doctorId).toLowerCase(), { data: payload, expiresAt });

  return payload;
}
