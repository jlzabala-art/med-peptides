import { adminDb } from '@/lib/firebaseAdmin';
import { KNOWN_DOCTORS_DIRECTORY } from '@/services/doctorDirectoryService';
import { classifyPrescriptionRegimen } from '@/utils/prescriptionRegimenTaxonomy';

// ── In-Memory RAM Cache (Golden Rule #2) ─────────────────────────────────────
// Layer 1: 0ms RAM cache with 10-minute TTL
export const DOCTOR_RAM_CACHE = new Map();
export const DOCTOR_DIRECTORY_CACHE = {
  expiresAt: 0,
  doctors: []
};
export const DOCTORS_WITH_RX_CACHE = {
  expiresAt: 0,
  doctors: []
};

export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function invalidateDoctorCache(slugOrId = null) {
  if (!slugOrId) {
    DOCTOR_RAM_CACHE.clear();
    DOCTOR_DIRECTORY_CACHE.expiresAt = 0;
    DOCTOR_DIRECTORY_CACHE.doctors = [];
    DOCTORS_WITH_RX_CACHE.expiresAt = 0;
    DOCTORS_WITH_RX_CACHE.doctors = [];
  } else {
    const key = String(slugOrId).toLowerCase().trim();
    DOCTOR_RAM_CACHE.delete(key);
  }
}

export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

export function sanitizeEnglishText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\s*\(Propuesta de Tratamiento\)/gi, '')
    .replace(/\s*\(Sin Pedido\)/gi, '')
    .replace(/\s*\(Propuesta\)/gi, '')
    .replace(/Propuesta de Tratamiento/gi, 'Treatment Proposal')
    .replace(/Sin Pedido/gi, 'Unaccepted Offer')
    .trim();
}

/**
 * Resolves corresponding evidence-based public protocol slug (/proto/[slug])
 */
export function resolveProtocolSlug(rx) {
  if (rx?.protocolSlug) return rx.protocolSlug;
  if (rx?.protocolId) return rx.protocolId;
  
  const text = `${rx?.treatmentTitle || ''} ${rx?.phaseName || ''} ${(rx?.items || []).map(i => i.name).join(' ')}`.toLowerCase();
  
  if (text.includes('tirzepatide') || text.includes('gip') || text.includes('glp-1') || text.includes('retatrutide')) {
    return 'u0b4lq4Ol664bfv2BscE';
  }
  if (text.includes('semaglutide') || text.includes('weight') || text.includes('metabolic')) {
    return 'wm_001';
  }
  if (text.includes('bpc') && text.includes('tb')) {
    return 'bpc-157-tb-500-protocol';
  }
  if (text.includes('bpc-157') || text.includes('bpc 157') || text.includes('tissue') || text.includes('gut')) {
    return 'bpc-157-tb-500-protocol';
  }
  if (text.includes('nad') || text.includes('cellular')) {
    return 'Ks2ThxuWoPmWzc3UW06R';
  }
  if (text.includes('1mq') || text.includes('amino')) {
    return '5-amino-1mq-metabolic';
  }
  if (text.includes('selank') || text.includes('neuro') || text.includes('cognitive') || text.includes('pinealon')) {
    return 'lxv-neuro-restoration-12w';
  }
  if (text.includes('dsip') || text.includes('sleep') || text.includes('cns')) {
    return 'dsip-bpc-157-cns-rest-protocol';
  }
  if (text.includes('bremelanotide') || text.includes('pt-141') || text.includes('libido')) {
    return 'pt-141-bremelanotide-on-demand-libido-enhancement';
  }
  if (text.includes('thymosin') || text.includes('immune')) {
    return 'thymosin-alpha-1-immune-resilience';
  }
  return null;
}

/**
 * Consolidates multi-part prescription documents sharing the same sessionId
 * or patient into a single master prescription with all parts and items.
 */
export function consolidateMultiPartPrescriptions(rawPrescriptions = []) {
  if (!Array.isArray(rawPrescriptions) || rawPrescriptions.length === 0) return [];

  const consolidatedMap = new Map();
  const result = [];

  rawPrescriptions.forEach((rx) => {
    const rawSessionId = rx.sessionId || rx.groupSessionId;
    const isExplicitGroup = rawSessionId && (String(rawSessionId).startsWith('group_') || String(rawSessionId).length > 5);
    const multiPartKey = isExplicitGroup
      ? `session_${rawSessionId}`
      : (rx.patientName && rx.totalParts && rx.totalParts > 1 && rx.partNumber
          ? `pat_${String(rx.patientName).toLowerCase().trim()}_${rx.totalParts}_${rx.treatmentTitle || ''}`
          : null);

    if (!multiPartKey) {
      result.push(rx);
      return;
    }

    if (!consolidatedMap.has(multiPartKey)) {
      const masterRx = {
        ...rx,
        isMultiPart: true,
        totalParts: rx.totalParts || 1,
        parts: Array.isArray(rx.parts) && rx.parts.length > 0 ? [...rx.parts] : [],
        items: Array.isArray(rx.items) ? [...rx.items] : [],
        allDocIds: [rx.id],
        allCodes: [rx.code || rx.prescriptionNumber || rx.id]
      };
      if (masterRx.parts.length === 0) {
        masterRx.parts.push({
          partNumber: rx.partNumber || 1,
          totalParts: rx.totalParts || 1,
          title: rx.treatmentTitle || rx.regimenShortTitle || `Part ${rx.partNumber || 1}`,
          vehicle: rx.volume || rx.vehicle || '',
          posology: rx.posology || '',
          apis: (rx.items || []).map(i => ({
            name: i.name || i.drugName || '',
            dose: i.dose || i.dosage || ''
          }))
        });
      }
      consolidatedMap.set(multiPartKey, masterRx);
      result.push(masterRx);
    } else {
      const master = consolidatedMap.get(multiPartKey);
      master.allDocIds.push(rx.id);
      const code = rx.code || rx.prescriptionNumber || rx.id;
      if (!master.allCodes.includes(code)) master.allCodes.push(code);
      if (rx.totalParts && rx.totalParts > (master.totalParts || 1)) {
        master.totalParts = rx.totalParts;
      }
      (rx.items || []).forEach(newItem => {
        const alreadyHas = master.items.some(existing =>
          existing.name === newItem.name && existing.dose === newItem.dose
        );
        if (!alreadyHas) {
          master.items.push(newItem);
        }
      });
      const newPartNum = rx.partNumber || (master.parts.length + 1);
      const existingPartIdx = master.parts.findIndex(p => p.partNumber === newPartNum);
      const partObj = {
        partNumber: newPartNum,
        totalParts: master.totalParts,
        title: rx.treatmentTitle || rx.regimenShortTitle || `Part ${newPartNum}`,
        vehicle: rx.volume || rx.vehicle || '',
        posology: rx.posology || '',
        apis: (rx.items || []).map(i => ({
          name: i.name || i.drugName || '',
          dose: i.dose || i.dosage || ''
        }))
      };
      if (existingPartIdx >= 0) {
        master.parts[existingPartIdx] = { ...master.parts[existingPartIdx], ...partObj };
      } else {
        master.parts.push(partObj);
      }
      master.parts.sort((a, b) => (a.partNumber || 0) - (b.partNumber || 0));
    }
  });

  return result;
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
 * Fetches all physicians who have active/issued prescriptions in the system.
 * Cached in RAM with 10-minute TTL.
 */
export async function getDoctorsWithPrescriptions({ forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && DOCTORS_WITH_RX_CACHE.expiresAt > now && DOCTORS_WITH_RX_CACHE.doctors.length > 0) {
    return DOCTORS_WITH_RX_CACHE.doctors;
  }

  if (!adminDb) return [];

  const directory = await getCachedDoctorDirectory();
  const rxSnap = await adminDb.collection('prescriptions').limit(500).get();

  // Aggregate prescriptions by doctor
  const docCounts = new Map(); // key -> { count, docId, docName, clinic }

  rxSnap.forEach((doc) => {
    const d = doc.data();
    const docId = d.treatingDoctor?.id || d.treatingDoctorId || d.doctorId || d.doctor?.id;
    const docName = d.treatingDoctor?.name || (typeof d.treatingDoctor === 'string' ? d.treatingDoctor : null) || d.doctorName || d.doctor?.name || d.prescribingDoctor;
    const clinic = d.clinic || d.clinicName || d.treatingDoctor?.clinic || '';

    if (docId || docName) {
      const key = (docId || slugify(docName)).toLowerCase();
      const current = docCounts.get(key) || { count: 0, docId, docName, clinic };
      current.count += 1;
      if (!current.docName && docName) current.docName = docName;
      if (!current.clinic && clinic) current.clinic = clinic;
      docCounts.set(key, current);
    }
  });

  const result = [];
  const matchedDirectoryKeys = new Set();

  // Cross-reference with known directory
  for (const dirDoc of directory) {
    const keyById = (dirDoc.id || '').toLowerCase();
    const keyByName = slugify(dirDoc.name);

    let count = 0;
    if (docCounts.has(keyById)) {
      count = docCounts.get(keyById).count;
      matchedDirectoryKeys.add(keyById);
    } else if (docCounts.has(keyByName)) {
      count = docCounts.get(keyByName).count;
      matchedDirectoryKeys.add(keyByName);
    }

    if (count > 0) {
      result.push({
        id: dirDoc.id,
        name: dirDoc.name,
        clinic: dirDoc.data?.clinic || dirDoc.data?.clinicName || 'Atlas Partner Clinic',
        specialty: dirDoc.data?.specialty || 'Regenerative Medicine',
        nameSlug: dirDoc.nameSlug,
        opaqueCode: dirDoc.opaqueCode,
        rxCount: count
      });
    }
  }

  // Also include any doctors with prescriptions that might not be in directory yet
  for (const [key, val] of docCounts.entries()) {
    if (!matchedDirectoryKeys.has(key) && val.count > 0 && val.docName) {
      const slug = slugify(val.docName);
      result.push({
        id: val.docId || slug,
        name: val.docName,
        clinic: val.clinic || 'Dispensary Partner',
        specialty: 'Clinical Medicine',
        nameSlug: slug,
        opaqueCode: `DR-${(val.docId || slug).slice(0, 8).toUpperCase()}`,
        rxCount: val.count
      });
    }
  }

  // Sort descending by prescription count
  result.sort((a, b) => b.rxCount - a.rxCount);

  DOCTORS_WITH_RX_CACHE.doctors = result;
  DOCTORS_WITH_RX_CACHE.expiresAt = now + (10 * 60 * 1000);

  return result;
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
  const normalizedSlug = cleanSlug.replace(/^dr[-.]?/, '');
  
  // Find doctor matching: opaqueCode, docId, nameSlug, or alias
  const matchedDoc = doctors.find(doc => {
    const docSlugNoDr = (doc.nameSlug || '').replace(/^dr[-.]?/, '');
    const isSezginMatch = (cleanSlug.includes('sezgin') || cleanSlug.includes('cagatay')) && (doc.id === 'z3aUIMaYsPViG1JgM95r' || (doc.nameSlug || '').includes('sezgin'));
    return isSezginMatch ||
           doc.opaqueCode.toLowerCase() === cleanSlug ||
           doc.id.toLowerCase() === cleanSlug ||
           doc.nameSlug === cleanSlug ||
           docSlugNoDr === normalizedSlug ||
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
      if (dName && (slugify(dName) === cleanSlug || slugify(dName).replace(/^dr[-.]?/, '') === normalizedSlug)) {
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
  const cleanDoctorQueryNormalized = cleanDoctorQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isDoctorSezgin = (doctorId === 'z3aUIMaYsPViG1JgM95r') || cleanSlug.includes('sezgin') || cleanDoctorQuery.includes('sezgin');
  if (!opaqueCode) opaqueCode = getDoctorOpaqueCode(doctorId, doctorDoc);

  // 2. Fetch prescriptions for this doctor
  const rxSnap = await adminDb.collection('prescriptions').limit(300).get();
  const rawPrescriptionsList = [];
  const patientMap = new Map();

  rxSnap.forEach((doc) => {
    const d = doc.data();
    const treatingDocName = typeof d.treatingDoctor === 'string' ? d.treatingDoctor : d.treatingDoctor?.name;
    const treatingDocId = typeof d.treatingDoctor === 'object' ? d.treatingDoctor?.id : null;
    const dDocName = String(treatingDocName || d.doctorName || d.doctor?.name || d.prescribingDoctor || '').toLowerCase();
    const dDocId = String(treatingDocId || d.treatingDoctorId || d.doctorId || d.doctor?.id || '').toLowerCase();

    const dDocNormalized = dDocName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanDocQueryNormalized = cleanDoctorQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const isMatch = (doctorId && dDocId === doctorId.toLowerCase()) ||
                    (isDoctorSezgin && (dDocId === 'z3auimayspvig1jgm95r' || dDocId === 'dr-cagatay-sezgin' || dDocNormalized.includes('sezgin'))) ||
                    (cleanDoctorQuery && dDocNormalized && (dDocNormalized.includes(cleanDocQueryNormalized) || cleanDocQueryNormalized.includes(dDocNormalized)));

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
      // Priority to concise clinical titles, avoiding generic 'Personalized Compounded Protocol'
      let baseTitle = d.treatmentTitle;
      if (!baseTitle || baseTitle === 'Personalized Compounded Protocol' || baseTitle === 'Personalized Formulation') {
        baseTitle = d.regimenShortTitle || d.phaseName || d.treatmentProgram || 'Personalized Formulation';
      }
      const protoSlug = d.protocolSlug || d.protocolId || resolveProtocolSlug({ treatmentTitle: baseTitle, phaseName: d.phaseName, items: d.items });

      // 1. Resolve structured parts/formulations (Schema B: nested apis, Schema C: formulas, Schema D: phases/formulationBlocks)
      let resolvedParts = [];
      let resolvedItems = [];

      // Check Schema: d.formulas
      if (Array.isArray(d.formulas) && d.formulas.length > 0) {
        resolvedParts = d.formulas.map((form, fIdx) => {
          const partApis = Array.isArray(form.components) ? form.components.map(c => ({
            name: c.apiName || c.name || c.drugName || '',
            dose: c.dosage ? `${c.dosage} ${c.units || ''}`.trim() : (c.dose || ''),
            productId: c.productId || null
          })) : [];
          return {
            partNumber: fIdx + 1,
            title: form.formulaName || `Part ${fIdx + 1}`,
            vehicle: form.base || '',
            posology: form.posology || '',
            apis: partApis
          };
        });
      }
      // Check Schema: d.items with nested apis (e.g. Matthew Taylor RX-MT-0903)
      else if (Array.isArray(d.items) && d.items.some(i => Array.isArray(i.apis) && i.apis.length > 0)) {
        resolvedParts = d.items.map((item, iIdx) => {
          const partApis = Array.isArray(item.apis) ? item.apis.map(a => ({
            name: a.name || a.drugName || a.activeIngredient || '',
            dose: a.strength || a.dose || a.dosage || '',
            productId: a.productId || null
          })) : [];
          return {
            partNumber: iIdx + 1,
            title: item.productName || item.title || item.name || `Part ${iIdx + 1}`,
            format: item.format || item.dosageForm || '',
            volume: item.volume || '',
            posology: item.directions || item.posology || '',
            storage: item.storage || '',
            apis: partApis
          };
        });
      }
      // Check Schema: explicit phases or formulationBlocks
      else if (Array.isArray(d.phases) && d.phases.length > 0) {
        resolvedParts = d.phases.map((ph, pIdx) => ({
          partNumber: ph.phaseNumber || (pIdx + 1),
          title: ph.phaseName || ph.title || `Part ${pIdx + 1}`,
          vehicle: ph.vehicle?.name || ph.vehicleName || '',
          volume: ph.volume || '',
          posology: getPosologyString(ph.posology),
          apis: (ph.apis || ph.items || []).map(a => ({
            name: a.name || a.drugName || a.activeIngredient || '',
            dose: a.dose || a.dosage || a.strength || '',
            category: a.category || '',
            therapeuticClass: a.therapeuticClass || '',
            mechanism: a.mechanism || a.mechanismOfAction || '',
            cellularTarget: a.cellularTarget || ''
          }))
        }));
      }

      // Flatten items into resolvedItems
      if (resolvedParts.length > 0) {
        resolvedParts.forEach((p, pIdx) => {
          (p.apis || []).forEach(a => {
            resolvedItems.push({
              ...a,
              partNumber: p.partNumber || (pIdx + 1),
              partTitle: p.title,
              vehicle: p.vehicle || p.title || '',
              volume: p.volume || '',
              format: p.format || ''
            });
          });
        });
      } else if (Array.isArray(d.items) && d.items.length > 0) {
        resolvedItems = d.items.map(i => ({
          id: i.id,
          name: i.name || i.drugName || i.activeIngredient || i.productName || i.title || '',
          dose: i.dose || i.dosage || i.strength || i.concentration || '',
          activeIngredient: i.activeIngredient || '',
          category: i.category || '',
          therapeuticClass: i.therapeuticClass || '',
          mechanism: i.mechanism || i.mechanismOfAction || '',
          cellularTarget: i.cellularTarget || '',
          instructions: i.instructions || '',
          vehicle: i.vehicle || '',
          _isVehicleOrBase: i._isVehicleOrBase,
          format: i.format || null,
          volume: i.volume || null
        }));
      } else if (Array.isArray(d.prescriptionLines) && d.prescriptionLines.length > 0) {
        resolvedItems = d.prescriptionLines.map(i => ({
          name: i.drugName || i.name || '',
          dose: i.strength || i.dosage || i.dose || '',
          instructions: i.instructions || ''
        }));
      } else if (Array.isArray(d.compounds) && d.compounds.length > 0) {
        resolvedItems = d.compounds.map(i => ({
          name: i.name || '',
          dose: i.dose || i.dosage || ''
        }));
      }

      // Resolve standardized clinical category & concise title
      let catData = {
        category: d.regimenCategory,
        categoryId: d.regimenCategoryId,
        categoryShort: d.regimenCategoryShort,
        categoryCode: d.regimenCategoryCode,
        regimenShortTitle: d.regimenShortTitle,
        activeSummary: d.activeIngredientsSummary
      };
      if (!catData.category || !catData.regimenShortTitle) {
        catData = classifyPrescriptionRegimen({ ...d, items: resolvedItems, parts: resolvedParts, treatmentTitle: baseTitle });
      }

      const rawTitle = d.treatmentTitle && !['Personalized Compounded Protocol', 'Personalized Formulation'].includes(d.treatmentTitle)
        ? d.treatmentTitle
        : (d.regimenShortTitle || catData.regimenShortTitle || baseTitle);
      const finalTreatmentTitle = sanitizeEnglishText(rawTitle);
      const isProposal = Boolean(d.isTreatmentProposal) || d.status === 'proposal_pending' || d.orderStatus === 'Offer Not Accepted' || String(d.treatmentProgram || '').toLowerCase().includes('proposal') || String(d.invoiceRef || '').toLowerCase().includes('proposal');
      const normalizedStatus = isProposal ? 'proposal_pending' : (d.status || d.state || 'active');

      rawPrescriptionsList.push({
        id: doc.id,
        prescriptionNumber: d.prescriptionNumber || d.code || doc.id,
        code: d.code || d.prescriptionNumber || doc.id,
        patientName: patName,
        patientId: patId,
        patient: d.patient || null,
        patientPhone: d.patientPhone || d.phone || d.mobile || d.patient?.phone || d.patient?.mobile || null,
        patientEmail: d.patientEmail || d.email || d.patient?.email || null,
        status: normalizedStatus,
        state: normalizedStatus,
        isTreatmentProposal: isProposal,
        orderStatus: d.orderStatus || (isProposal ? 'Offer Not Accepted' : 'Ordered'),
        treatmentProgram: sanitizeEnglishText(d.treatmentProgram) || (isProposal ? 'Clinical Treatment Proposal (Unaccepted Offer)' : 'Personalized Compounded Protocol'),
        treatmentTitle: finalTreatmentTitle,
        regimenCategory: d.regimenCategory || catData.category || 'Follicular & Hair Restoration',
        regimenCategoryId: d.regimenCategoryId || catData.categoryId || 'follicular_hair',
        regimenCategoryShort: d.regimenCategoryShort || catData.categoryShort || 'Follicular',
        regimenCategoryCode: d.regimenCategoryCode || catData.categoryCode || 'HAIR-RX',
        regimenShortTitle: sanitizeEnglishText(d.regimenShortTitle || catData.regimenShortTitle || finalTreatmentTitle),
        activeIngredientsSummary: d.activeIngredientsSummary || catData.activeSummary || null,
        protocolSlug: protoSlug,
        protocolUrl: protoSlug ? `/proto/${protoSlug}` : null,
        phaseName: sanitizeEnglishText(d.phaseName) || null,
        sessionId: d.sessionId || null,
        groupSessionId: d.groupSessionId || null,
        partNumber: d.partNumber != null ? Number(d.partNumber) : null,
        isMultiPart: Boolean(d.isMultiPart) || resolvedParts.length > 1,
        totalParts: d.totalParts || (resolvedParts.length > 1 ? resolvedParts.length : null),
        clinic: d.clinic || d.clinicName || doctorDoc.clinicName || doctorDoc.clinic || 'Clinical Dispensary',
        invoiceRef: d.invoiceRef || d.invoiceNumber || (d.fileNumber ? `# INV ${d.fileNumber}` : null),
        invoiceNumber: d.invoiceNumber || null,
        fileNumber: d.fileNumber || null,
        dateIssued: d.dateIssued || d.date || null,
        date: d.date || d.dateIssued || null,
        startDate: d.startDate || d.treatmentStartDate || d.dateIssued || d.date || null,
        treatmentStartDate: d.treatmentStartDate || d.startDate || d.dateIssued || d.date || null,
        durationDays: d.durationDays || null,
        durationWeeks: d.durationWeeks || null,
        duration: d.duration || null,
        treatmentDuration: d.treatmentDuration || null,
        endDate: d.endDate || null,
        createdAt: d.createdAt ? (d.createdAt.toMillis ? d.createdAt.toMillis() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : String(d.createdAt))) : null,
        items: resolvedItems,
        parts: resolvedParts.length > 0 ? resolvedParts : null,
        formulas: Array.isArray(d.formulas) ? d.formulas : null,
        stickers: Array.isArray(d.stickers) ? d.stickers : [],
        volume: d.volume || null,
        prescriptionLines: Array.isArray(d.prescriptionLines) ? d.prescriptionLines.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle })) : [],
        compounds: Array.isArray(d.compounds) ? d.compounds.map(i => ({ name: i.name, dose: i.dose })) : [],
        posology: getPosologyString(d.posology),
        structuredPosology: d.structuredPosology || null,
        vehicles: Array.isArray(d.vehicles) ? d.vehicles : [],
        notes: d.notes || d.clinicalNotes || '',
        ingestionStage: d.ingestionStage || null,
        reviewEtaHours: d.reviewEtaHours || 24,
        validationStatus: d.validationStatus || null
      });
    }
  });

  // Consolidate multi-part prescriptions sharing a session or patient group
  const prescriptions = consolidateMultiPartPrescriptions(rawPrescriptionsList);

  // Sort: prescriptions grouped by patient, then date descending
  prescriptions.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });

  // 3. Generate Patient-Centric Clinical Tasks (Deduplicated per patient)
  // ONLY real clinical actions: imported/pending prescription review & sign-off
  const clinicalTasks = [];
  const seenPatientTasks = new Set();
  const now = Date.now();

  prescriptions.forEach((rx) => {
    const rxAgeDays = rx.createdAt ? Math.floor((now - new Date(rx.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const patientKey = rx.patientName.toLowerCase().trim();
    const rxStatus = String(rx.status || '').toLowerCase();

    // Clinical Action 1: Pending / Imported Prescription Review & Clinical Sign-off
    if (['pending', 'draft', 'imported', 'review'].includes(rxStatus)) {
      const existingTask = clinicalTasks.find(t => t.type === 'approval' && t.patientName.toLowerCase().trim() === patientKey);
      if (existingTask) {
        existingTask.pendingCount = (existingTask.pendingCount || 1) + 1;
        existingTask.codes = existingTask.codes || [existingTask.code];
        if (!existingTask.codes.includes(rx.code)) existingTask.codes.push(rx.code);
        if (!existingTask.patient && rx.patient) existingTask.patient = rx.patient;
        if (!existingTask.patientDob && rx.patient?.dob) existingTask.patientDob = rx.patient.dob;
        existingTask.title = `Prescription Sign-off (${existingTask.pendingCount} Formulations)`;
        existingTask.description = `${existingTask.pendingCount} compounded formulations awaiting physician digital authorization.`;
      } else {
        clinicalTasks.push({
          id: `task-sign-${rx.id}`,
          rxId: rx.id,
          code: rx.code,
          codes: [rx.code],
          patientName: rx.patientName,
          patient: rx.patient || null,
          patientDob: rx.patient?.dob || null,
          type: 'approval',
          priority: 'action_required',
          pendingCount: 1,
          title: `Prescription Sign-off`,
          description: `Compounded formulation awaiting physician digital authorization for pharmacy dispensing.`,
          dueDate: 'Immediate',
          actionLabel: 'Review & Sign-off',
          actionUrl: `/rx/${rx.code}`
        });
      }
    }

    // Clinical Action 2: Routine Supply Refill Assessment (30-day supply approaching completion)
    const refillKey = `${patientKey}_refill`;
    if (rxAgeDays >= 25 && rxAgeDays <= 45 && rxStatus === 'approved' && !seenPatientTasks.has(refillKey)) {
      seenPatientTasks.add(refillKey);
      clinicalTasks.push({
        id: `task-refill-${rx.id}`,
        rxId: rx.id,
        code: rx.code,
        patientName: rx.patientName,
        patient: rx.patient || null,
        patientDob: rx.patient?.dob || null,
        type: 'refill',
        priority: 'medium',
        title: 'Prescription Supply Refill',
        description: `30-day dispensary supply completing. Review patient adherence before refilling.`,
        dueDate: 'Next 7 days',
        actionLabel: 'Issue Refill',
        actionUrl: `/rx/${rx.code}`
      });
    }

    // Clinical Action 3: Unaccepted Treatment Proposal / Re-engagement Follow-up
    const isUnacceptedProposal = rx.isTreatmentProposal || rxStatus === 'proposal_pending' || rx.orderStatus === 'Offer Not Accepted' || String(rx.treatmentProgram || '').toLowerCase().includes('proposal');
    const proposalKey = `${patientKey}_proposal`;

    if (isUnacceptedProposal && !seenPatientTasks.has(proposalKey)) {
      seenPatientTasks.add(proposalKey);
      const treatmentName = rx.treatmentTitle || rx.regimenShortTitle || 'Compounded Protocol';
      const patientPhone = rx.patient?.phone || rx.phone || '';
      const rawDocName = (cleanDoctorName || 'Khalid Shukri').replace(/^Dr\.?\s*/i, '').trim();
      const effectiveAgeDays = rx.dateIssued || rx.date ? Math.max(1, Math.floor((now - new Date(rx.dateIssued || rx.date).getTime()) / (1000 * 60 * 60 * 24))) : rxAgeDays;

      clinicalTasks.push({
        id: `task-prop-${rx.id}`,
        rxId: rx.id,
        code: rx.code,
        codes: [rx.code],
        patientName: rx.patientName,
        patient: rx.patient || null,
        patientDob: rx.patient?.dob || null,
        patientPhone: patientPhone,
        type: 'proposal_followup',
        priority: effectiveAgeDays > 14 ? 'medium' : 'action_required',
        daysAgo: effectiveAgeDays,
        treatmentTitle: treatmentName,
        title: 'Treatment Proposal Follow-up',
        description: `Patient has not yet confirmed or purchased ${treatmentName}. Follow up via WhatsApp to assist patient.`,
        dueDate: effectiveAgeDays > 7 ? 'Re-engagement' : 'Decision Due',
        actionLabel: 'WhatsApp Reminder',
        actionUrl: `/rx/${rx.code}`,
        whatsappMessage: `Hello ${rx.patientName}, this is Dr. ${rawDocName}'s clinical practice following up on your personalized ${treatmentName} regimen. You can access your clinical proposal here: https://atlashealth-services.com/rx/${rx.code}. Please let us know if you have any questions or would like to proceed with dispensing.`
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
      patient: topRx.patient || null,
      patientDob: topRx.patient?.dob || null,
      type: 'milestone',
      priority: 'routine',
      title: 'Routine 30-day Clinical Milestone Follow-up',
      description: `Routine 30-day therapeutic monitoring for ${topRx.treatmentTitle || 'compounded regimen'}.`,
      dueDate: 'Scheduled',
      actionLabel: 'View Dossier',
      actionUrl: `/rx/${topRx.code}`
    });
  }

  // 4. Compute GCP Standard KPIs (Server-calculated for instant 0ms response)
  const activePrescriptions = prescriptions.filter(p => ['approved', 'active'].includes(p.status.toLowerCase())).length;
  const draftIntakesCount = prescriptions.filter(p => ['draft', 'pending', 'awaiting_validation'].includes(p.status.toLowerCase()) || p.ingestionStage === 'awaiting_atlas_review').length;
  const monitoredPatients = patientMap.size;
  const pendingTasksCount = clinicalTasks.length;
  const refillsDueCount = clinicalTasks.filter(t => t.type === 'refill').length;

  const nameSlug = slugify(cleanDoctorName);

  // Accurate clinic resolution (Golden Rule #2 - Authoritative Doctor Data)
  // Ensures doctor's actual clinic (e.g. NOVA Clinic, Arthregen Clinic) is preserved and never falls back to "Atlas"
  let resolvedClinic = doctorDoc.clinic || doctorDoc.clinicName || '';
  if (!resolvedClinic || resolvedClinic === 'Atlas Clinical Partner' || resolvedClinic.toLowerCase().includes('atlas partner')) {
    const rxWithClinic = prescriptions.find(p => p.clinic && !p.clinic.toLowerCase().includes('atlas partner') && !p.clinic.toLowerCase().includes('dispensary'));
    if (rxWithClinic) {
      resolvedClinic = rxWithClinic.clinic;
    }
  }
  if (!resolvedClinic || resolvedClinic === 'Atlas Clinical Partner') {
    resolvedClinic = cleanDoctorName.toLowerCase().includes('marina') ? 'NOVA Clinic' : 'Independent Medical Practice';
  }

  const resolvedClinicName = doctorDoc.clinicName || resolvedClinic;
  const resolvedEmail = doctorDoc.email || (cleanDoctorName.toLowerCase().includes('marina') ? 'dr.marina@novaclinic.ae' : '');

  const doctorProfile = {
    id: doctorId,
    name: formatDoctorName(cleanDoctorName),
    title: doctorDoc.title || 'Dr.',
    specialty: doctorDoc.specialty || doctorDoc.speciality || 'Regenerative Medicine & Nutrigenomics',
    clinic: resolvedClinic,
    clinicName: resolvedClinicName,
    license: doctorDoc.licenseNumber || doctorDoc.license || doctorDoc.dhaLicense || doctorDoc.germanMedicalId || 'DHA Registered',
    email: resolvedEmail,
    phone: doctorDoc.phone || doctorDoc.mobile || '',
    mobile: doctorDoc.mobile || doctorDoc.phone || '',
    location: doctorDoc.location || doctorDoc.city || 'Dubai, UAE',
    subscriptionTier: doctorDoc.subscriptionTier || 'basic',
    slug: opaqueCode, // Codified opaque URL (e.g. "DR-XIHVYF56")
    nameSlug: nameSlug,
    opaqueCode: opaqueCode
  };

    // 5. Fetch Curated Compounding Active Pharmaceutical Ingredients (APIs - CAT-MUWWS6JL)
    const formulary = [];
    try {
      const [snap1, snap2] = await Promise.all([
        adminDb.collection('products')
          .where('supplierIds', 'array-contains', 'supplier-lotusland')
          .where('status', 'in', ['active', 'published'])
          .limit(100)
          .get()
          .catch(() => ({ docs: [] })),
        adminDb.collection('products')
          .where('supplierId', '==', 'supplier-lotusland')
          .where('status', 'in', ['active', 'published'])
          .limit(100)
          .get()
          .catch(() => ({ docs: [] }))
      ]);

      const docMap = new Map();
      snap1.docs?.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));
      snap2.docs?.forEach(d => docMap.set(d.id, { id: d.id, ...d.data() }));

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

      const GOAL_LABEL_MAP = {
        fat_loss: 'Metabolic & Fat Loss',
        weight_management: 'Metabolic & Weight Management',
        tissue_repair: 'Tissue Repair & Gut',
        anti_aging: 'Cellular Recovery & Anti-Aging',
        cellular: 'Cellular Optimization',
        cognitive: 'Cognitive & Neuro',
        muscle_growth: 'Hypertrophy & Growth',
        libido_wellness: 'Hormonal & Sexual Wellness',
        general_health: 'General Health & Immunity',
        supplies: 'Clinical Solvents & Supplies',
        compounding_material: 'Compounding Solvents & Supplies'
      };

      const seenNames = new Set();
      docMap.forEach((p, docId) => {
        const rawName = p.canonicalName || p.name;
        if (!rawName) return;
        const name = sanitizeString(rawName, 'Bioactive Peptide API');
        const cleanNameKey = name.toLowerCase().trim();
        if (seenNames.has(cleanNameKey)) return;
        seenNames.add(cleanNameKey);

        const rawGoal = p.primaryGoal || (Array.isArray(p.goals) && p.goals[0]) || 'Cellular Optimization';
        const primaryGoal = GOAL_LABEL_MAP[rawGoal] || (typeof rawGoal === 'string' ? rawGoal.replace(/_/g, ' ') : 'Cellular Optimization');

        const goals = Array.isArray(p.goals) && p.goals.length > 0
          ? p.goals.map(g => GOAL_LABEL_MAP[g] || (typeof g === 'string' ? g.replace(/_/g, ' ') : sanitizeString(g))).filter(Boolean)
          : [primaryGoal];

        const rawMoa = p.mechanismOfAction || p.action || p.aiSummary;
        const moa = sanitizeString(rawMoa, 'Targeted molecular signaling and receptor upregulation under medical vigilance.');
        const description = sanitizeString(p.aiDescription || p.description, 'High-purity active pharmaceutical ingredient (API) for customized magistral compounding formulations.');
        const purity = sanitizeString(p.purity, '≥ 99% (HPLC Verified)');

        // Compounding API presentation: Pure API substances, not finished patient vials
        let apiForm = 'Lyophilized Pure API Powder';
        if (p.productType === 'raw_material' || p.category === 'raw_material') {
          apiForm = 'Bulk API Powder (Sub-Batch)';
        } else if (p.productType === 'solvent' || p.category === 'compounding_material') {
          apiForm = 'Sterile Compounding Reconstitution Solvent';
        }

        const casNumber = sanitizeString(p.casNumber || p.cas, null);
        const sequence = sanitizeString(p.sequence, null);
        const molecularWeight = sanitizeString(p.molecularWeight || p.mw, null);
        const halfLife = sanitizeString(p.halfLife, null);
        const contraindications = sanitizeString(p.contraindications, null);

        formulary.push({
          id: docId,
          slug: p.slug || docId,
          name,
          description,
          category: 'api_peptide',
          primaryGoal,
          goals,
          purity,
          casNumber,
          sequence,
          molecularWeight,
          route: apiForm,
          apiForm,
          moa,
          halfLife,
          contraindications,
          inStock: p.inStock ?? true,
          supplierId: 'supplier-lotusland',
          catalogRef: 'CAT-MUWWS6JL'
        });
      });
    } catch (err) {
      console.warn('Could not load products formulary in doctorCache:', err);
    }

    // 6. Fetch Certified Bloodo™ Diagnostic Panels (All 6 CE-IVDR products)
    const bloodoPanels = [];
    try {
      const bloodoSnap = await adminDb.collection('products')
        .where('supplierId', '==', 'supplier-bloodo')
        .get();

      bloodoSnap.forEach(d => {
        const bp = d.data();
        if (bp.status === 'published' || bp.status === 'active') {
          const bpSlug = bp.slug || d.id;
          let assocProtoSlug = null;
          let assocProtoTitle = null;

          if (bpSlug.includes('nad')) {
            assocProtoSlug = 'Ks2ThxuWoPmWzc3UW06R';
            assocProtoTitle = 'NAD+ Cellular Restoration Protocol';
          } else if (bpSlug.includes('cortisol')) {
            assocProtoSlug = 'dsip-bpc-157-cns-rest-protocol';
            assocProtoTitle = 'DSIP + BPC-157 CNS Rest Protocol';
          } else if (bpSlug.includes('hemoglobin') || bpSlug.includes('hba1c')) {
            assocProtoSlug = 'u0b4lq4Ol664bfv2BscE';
            assocProtoTitle = 'Advanced GLP-1/GIP Metabolic Recomposition';
          } else if (bpSlug.includes('omega')) {
            assocProtoSlug = 'bpc-157-tb-500-protocol';
            assocProtoTitle = 'BPC-157 & TB-500 Tissue Repair Protocol';
          } else if (bpSlug.includes('testosterone')) {
            assocProtoSlug = 'pt-141-bremelanotide-on-demand-libido-enhancement';
            assocProtoTitle = 'PT-141 & Endocrine Vitality Protocol';
          } else if (bpSlug.includes('vitamin-d')) {
            assocProtoSlug = 'thymosin-alpha-1-immune-resilience';
            assocProtoTitle = 'Thymosin Alpha-1 Immune Resilience Protocol';
          }

          bloodoPanels.push({
            id: d.id,
            slug: bpSlug,
            name: bp.name,
            description: bp.description || bp.shortDescription || '',
            price: bp.price || null,
            biomarkers: Array.isArray(bp.biomarkers) && bp.biomarkers.length > 0
              ? bp.biomarkers
              : (bp.name.includes('Cortisol')
                  ? ['Free Cortisol', 'Total Cortisol', 'Morning CAR Index']
                  : bp.name.includes('Testosterone')
                  ? ['Total Testosterone', 'Bioavailable Testosterone Index']
                  : ['Target Analytes']),
            presentation: bp.presentation || 'Capillary Dried Blood Spot (DBS)',
            specimen: 'Capillary Dried Blood Spot (DBS)',
            tat: bp.tat || '3-4 Business Days',
            indications: bp.indications || bp.shortDescription || (bp.description ? bp.description.slice(0, 160) + '...' : 'Pre-protocol baseline diagnostic evaluation.'),
            clinicalUtility: bp.clinicalUtility || 'Objective physiological baseline quantification prior to magistral peptide protocols.',
            datasheetUrl: `/p/${bpSlug}`,
            associatedProtocolSlug: assocProtoSlug,
            associatedProtocolTitle: assocProtoTitle,
            associatedProtocolUrl: assocProtoSlug ? `/proto/${assocProtoSlug}` : null
          });
        }
      });
    } catch (bErr) {
      console.warn('Could not load bloodo products in doctorCache:', bErr);
    }

    // 7. Fetch Evidence-Based Clinical Protocols Directory (protocols collection)
    const protocols = [];
    try {
      const pSnap = await adminDb.collection('protocols')
        .where('status', 'in', ['active', 'published'])
        .limit(30)
        .get();

      let pDocs = pSnap.docs;
      if (!pDocs || pDocs.length < 6) {
        const fallbackSnap = await adminDb.collection('protocols').limit(30).get();
        pDocs = fallbackSnap.docs;
      }

      pDocs.forEach(d => {
        const p = d.data();
        const pSlug = p.slug || d.id;
        const compounds = Array.isArray(p.peptides) ? p.peptides : (Array.isArray(p.products) ? p.products : (Array.isArray(p.compounds) ? p.compounds : []));

        protocols.push({
          id: d.id,
          slug: pSlug,
          title: p.title || p.name || 'Clinical Therapeutic Protocol',
          category: p.category || p.categoryId || 'Integrative',
          durationWeeks: p.durationWeeks || p.duration || 8,
          summary: p.summary || p.description || p.aiSummary || 'Structured chronobiological dosing protocol under physician vigilance.',
          compounds: compounds.map(c => typeof c === 'string' ? c : (c.name || c.canonicalName || 'Active Peptide API')),
          status: p.status || 'active',
          dossierUrl: `/proto/${pSlug}`
        });
      });
    } catch (pErr) {
      console.warn('Could not load protocols in doctorCache:', pErr);
    }

    // 7.5 Fetch Laboratory Diagnostic Results (Bloodo / LifeLab1 tests)
    const labResults = [];
    try {
      const labSnap = await adminDb.collection('lab_results').limit(100).get();
      labSnap.forEach(doc => {
        const ld = doc.data();
        const lDocId = (ld.doctorId || '').toLowerCase();
        const lDocName = (ld.doctorName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const isMatch = (doctorId && lDocId === doctorId.toLowerCase()) ||
                        (isDoctorSezgin && (lDocId === 'z3auimayspvig1jgm95r' || lDocName.includes('sezgin'))) ||
                        (cleanDoctorQueryNormalized && lDocName.includes(cleanDoctorQueryNormalized));
        if (isMatch) {
          labResults.push({
            id: doc.id,
            ...ld
          });
        }
      });
    } catch (labErr) {
      console.warn('Could not load lab_results in doctorCache:', labErr);
    }

    // 8. Enrich each prescription with tailored Atlas Recommendations (Peptides & Colway)
    const enrichedPrescriptions = prescriptions.map(rx => {
      const recs = getPrescriptionAtlasRecommendations(rx);
      rx.atlasRecommendations = recs;
      rx.lotuslandRecommendation = recs.peptide;
      return rx;
    });

    // 9. Compute Server-Side Clinical Analytics & Practice-Wide Lotusland Peptide Synergy
    const serverAnalytics = computeServerAnalytics(enrichedPrescriptions);

    const payload = {
      success: true,
      doctor: doctorProfile,
      kpis: {
        activePrescriptions,
        draftIntakesCount,
        monitoredPatients,
        pendingTasksCount,
        refillsDueCount
      },
      tasks: clinicalTasks,
      prescriptions: enrichedPrescriptions,
      labResults,
      patients: Array.from(patientMap.values()),
      formulary,
      bloodoPanels,
      protocols,
      serverAnalytics
    };

    function sanitizeForRsc(obj) {
      if (obj === null || obj === undefined) return obj;
      if (typeof obj?.toDate === 'function') {
        return obj.toDate().toISOString();
      }
      if (typeof obj === 'object') {
        if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
          return new Date(obj._seconds * 1000).toISOString();
        }
        if (Array.isArray(obj)) {
          return obj.map(sanitizeForRsc);
        }
        const res = {};
        for (const key of Object.keys(obj)) {
          res[key] = sanitizeForRsc(obj[key]);
        }
        return res;
      }
      return obj;
    }

    const sanitizedPayload = sanitizeForRsc(payload);

  // Cache in RAM for 10 minutes under all lookup aliases
  const expiresAt = now + CACHE_TTL_MS;
  DOCTOR_RAM_CACHE.set(cleanSlug, { data: sanitizedPayload, expiresAt });
  DOCTOR_RAM_CACHE.set(opaqueCode.toLowerCase(), { data: sanitizedPayload, expiresAt });
  if (nameSlug) DOCTOR_RAM_CACHE.set(nameSlug, { data: sanitizedPayload, expiresAt });
  if (doctorId) DOCTOR_RAM_CACHE.set(String(doctorId).toLowerCase(), { data: sanitizedPayload, expiresAt });

  return sanitizedPayload;
}

import {
  getPrescriptionAtlasRecommendations,
  getPrescriptionLotuslandMatch
} from '@/services/atlasRecommendationsEngine';

export {
  getPrescriptionAtlasRecommendations,
  getPrescriptionLotuslandMatch
};

/**
 * Helper to calculate SVG donut slice path on the server
 */
export function getDonutSlice(startAngle, endAngle, innerR, outerR, cx, cy) {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = cx + outerR * Math.cos(startRad);
  const y1 = cy + outerR * Math.sin(startRad);
  const x2 = cx + outerR * Math.cos(endRad);
  const y2 = cy + outerR * Math.sin(endRad);

  const x3 = cx + innerR * Math.cos(endRad);
  const y3 = cy + innerR * Math.sin(endRad);
  const x4 = cx + innerR * Math.cos(startRad);
  const y4 = cy + innerR * Math.sin(startRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

/**
 * Computes all clinical analytics metrics on the server (Layer 1 Cache)
 * Avoids any client-side loops or performance bottlenecks.
 */
export function computeServerAnalytics(prescriptions = []) {
  if (!Array.isArray(prescriptions) || prescriptions.length === 0) {
    return {
      serverComputed: true,
      computedAt: Date.now(),
      monthlyVolume: [],
      monthlyData: [],
      maxMonthlyCount: 1,
      avgMonthlyRx: 0,
      topApis: [],
      allTopApis: [],
      cohorts: { singleRx: { count: 0, pct: 0 }, twoRxs: { count: 0, pct: 0 }, multiRxs: { count: 0, pct: 0 }, totalPatients: 0 },
      cohortData: { totalPatients: 0, single: 0, double: 0, chronic: 0, singlePct: 0, doublePct: 0, chronicPct: 0, avgRx: 0, slices: [], cohorts: [] },
      complexity: { singleCount: 0, multiCount: 0, singlePct: 0, multiPct: 0, total: 0 },
      complexityData: { singleCount: 0, multiCount: 0, singlePct: 0, multiPct: 0, total: 0 },
      summary: { totalPrescriptions: 0, uniquePatients: 0, uniqueApis: 0, multiPartRatio: 0 },
      lotuslandPracticeRecommendations: []
    };
  }

  // 1. Monthly Volume Timeline
  const monthMap = {};
  prescriptions.forEach(rx => {
    const d = rx.dateIssued || rx.createdAt || rx.date;
    let dt = new Date(d);
    if (isNaN(dt.getTime())) {
      if (typeof d === 'string' && d.includes('/')) {
        const p = d.split('/');
        if (p.length === 3) dt = new Date(`${p[2]}-${p[1]}-${p[0]}`);
      }
      if (isNaN(dt.getTime())) dt = new Date();
    }
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `${monthNames[dt.getMonth()]} ${dt.getFullYear()}`;

    if (!monthMap[key]) {
      monthMap[key] = { monthKey: key, label, count: 0, active: 0, multipart: 0, year: dt.getFullYear(), month: dt.getMonth() };
    }
    monthMap[key].count += 1;
    if (rx.status === 'active' || rx.status === 'approved') monthMap[key].active += 1;
    if (rx.isMultiPart || (Array.isArray(rx.parts) && rx.parts.length > 1)) monthMap[key].multipart += 1;
  });

  const monthlyVolume = Object.values(monthMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  const monthlyData = monthlyVolume.slice(-8).map(m => ({
    key: m.monthKey,
    label: m.label,
    count: m.count,
    active: m.active,
    multipart: m.multipart
  }));
  const maxMonthlyCount = monthlyData.length > 0 ? Math.max(...monthlyData.map(m => m.count), 1) : 1;
  const avgMonthlyRx = monthlyData.length > 0 ? (monthlyData.reduce((acc, m) => acc + m.count, 0) / monthlyData.length).toFixed(1) : 0;

  // 2. Normalized Top APIs
  const apiCounts = {};
  const normalizeName = (raw) => {
    if (!raw) return '';
    const clean = String(raw).trim();
    const lower = clean.toLowerCase();
    if (lower.includes('minoxidil')) return 'Minoxidil';
    if (lower.includes('dutasteride')) return 'Dutasteride';
    if (lower.includes('finasteride')) return 'Finasteride';
    if (lower.includes('spironolactone')) return 'Spironolactone';
    if (lower.includes('latanoprost')) return 'Latanoprost';
    if (lower.includes('melatonin')) return 'Melatonin';
    if (lower.includes('saw palmetto') || lower.includes('serenoa')) return 'Saw Palmetto';
    if (lower.includes('metformin')) return 'Metformin';
    if (lower.includes('testosterone')) return 'Testosterone';
    if (lower.includes('astaxanthin')) return 'Astaxanthin';
    if (lower.includes('turmeric') || lower.includes('curcumin')) return 'Turmeric Extract';
    if (lower.includes('coenzyme q10') || lower.includes('coq10') || lower.includes('ubiquinol')) return 'Coenzyme Q10 / Ubiquinol';
    if (lower.includes('cysteine') || lower.includes('nac')) return 'N-Acetyl-L-Cysteine (NAC)';
    if (lower.includes('arginine')) return 'L-Arginine';
    if (lower.includes('ginkgo')) return 'Ginkgo biloba';
    if (lower.includes('ginseng')) return 'Panax Ginseng';
    if (lower.includes('caffeine')) return 'Caffeine';
    if (lower.includes('vitamin b12') || lower.includes('cyanocobalamin') || lower.includes('methylcobalamin')) return 'Vitamin B12 (Cobalamin)';
    if (lower.includes('vitamin e') || lower.includes('tocoferol')) return 'Vitamin E (Tocopherol)';
    if (lower.includes('panthenol')) return 'D-Panthenol';
    if (lower.includes('cetirizine')) return 'Cetirizine HCl';
    if (lower.includes('resveratrol')) return 'Trans-Resveratrol';
    if (lower.includes('theanine')) return 'L-Theanine';
    if (lower.includes('glycine') && !lower.includes('bisglycinate')) return 'Glycine';
    if (lower.includes('magnesium')) return 'Magnesium Bisglycinate';
    if (lower.includes('tmg') || lower.includes('betaine')) return 'Trimethylglycine (TMG)';
    return clean;
  };

  const getApiMeta = (apiName) => {
    const name = String(apiName || '').toLowerCase();
    
    // 1. Finished Product Delivery Format Detection (Golden Rule - Specificity)
    let format = 'Finished Formulation';
    let formatBadge = 'Finished Product';
    let formatColor = '#334155';
    let formatBg = '#f1f5f9';
    let formatBorder = '#cbd5e1';

    if (name.includes('nasal spray') || name.includes('spray') || name.includes('intranasal')) {
      format = 'Intranasal Spray';
      formatBadge = 'Nasal Spray';
      formatColor = '#0369a1';
      formatBg = '#e0f2fe';
      formatBorder = '#bae6fd';
    } else if (name.includes('oral capsule') || name.includes('capsule') || name.includes('caps') || name.includes('drcaps')) {
      format = 'Oral DRcaps®';
      formatBadge = 'Oral Capsules';
      formatColor = '#b45309';
      formatBg = '#fef3c7';
      formatBorder = '#fde68a';
    } else if (name.includes('troche') || name.includes('sublingual') || name.includes('drops')) {
      format = 'Sublingual Troche';
      formatBadge = 'Sublingual Troche';
      formatColor = '#4f46e5';
      formatBg = '#e0e7ff';
      formatBorder = '#c7d2fe';
    } else if (name.includes('vial') || name.includes('injection') || name.includes('subcutaneous') || name.includes('subq') || name.includes('lyophilized')) {
      format = 'Subcutaneous Vial';
      formatBadge = 'SubQ Vial';
      formatColor = '#047857';
      formatBg = '#d1fae5';
      formatBorder = '#a7f3d0';
    } else if (name.includes('shampoo') || name.includes('conditioner') || name.includes('trichology')) {
      format = 'Trichological Hygiene';
      formatBadge = 'Scalp Care';
      formatColor = '#0f766e';
      formatBg = '#ccfbf1';
      formatBorder = '#99f6e4';
    } else if (name.includes('collagen') || name.includes('peeling') || name.includes('bio-gel') || name.includes('colway')) {
      format = 'Native Tropocollagen Bio-Matrix';
      formatBadge = 'Collagen Bio-Matrix';
      formatColor = '#be185d';
      formatBg = '#fce7f3';
      formatBorder = '#fbcfe8';
    } else if (name.includes('pentravan') || name.includes('cream') || name.includes('transdermal')) {
      format = 'Transdermal Liposomal Cream';
      formatBadge = 'Liposomal Cream';
      formatColor = '#6d28d9';
      formatBg = '#ede9fe';
      formatBorder = '#ddd6fe';
    } else if (name.includes('topical') || name.includes('foam') || name.includes('solution') || name.includes('trichosol') || name.includes('serum')) {
      format = 'Topical Scalp Solution';
      formatBadge = 'Topical Solution';
      formatColor = '#1d4ed8';
      formatBg = '#dbeafe';
      formatBorder = '#bfdbfe';
    }

    // 2. Specific Finished Peptides with Formats & Roles
    if (name.includes('selank')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Neuro-Peptide · Anxiolytic & BDNF',
        color: '#1a73e8',
        bg: '#eff6ff'
      };
    }
    if (name.includes('semax')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Neuro-Peptide · Cognitive Focus & BDNF',
        color: '#1a73e8',
        bg: '#eff6ff'
      };
    }
    if (name.includes('bpc') || name.includes('bpc-157') || name.includes('tb-500') || name.includes('tb500')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Regenerative Peptide · Tissue Repair',
        color: '#0d9488',
        bg: '#f0fdfa'
      };
    }
    if (name.includes('kpv')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Anti-Inflammatory Tripeptide',
        color: '#7c3aed',
        bg: '#f5f3ff'
      };
    }
    if (name.includes('epithalon')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Pineal Epigenetic Peptide',
        color: '#7c3aed',
        bg: '#f5f3ff'
      };
    }
    if (name.includes('ghk') || name.includes('copper tripeptide')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Follicular & Matrix Remodeling Tripeptide',
        color: '#4338ca',
        bg: '#e0e7ff'
      };
    }
    if (name.includes('cjc') || name.includes('ipamorelin')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Endocrine GH Secretagogue',
        color: '#0284c7',
        bg: '#f0f9ff'
      };
    }
    if (name.includes('dsip')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Peptide · ${formatBadge}`,
        role: 'Circadian Sleep Delta-Wave Peptide',
        color: '#6366f1',
        bg: '#eef2ff'
      };
    }
    if (name.includes('tirzepatide') || name.includes('semaglutide') || name.includes('retatrutide')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Incretin · ${formatBadge}`,
        role: 'Multi-Incretin Metabolic Agonist',
        color: '#059669',
        bg: '#ecfdf5'
      };
    }

    // 3. Classical Pharmacological Active Classes
    if (name.includes('minoxidil')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Compounded · ${formatBadge}`,
        role: 'Vasodilator & Microvascular Growth Factor',
        color: '#0d9488',
        bg: '#f0fdfa'
      };
    }
    if (name.includes('dutasteride') || name.includes('finasteride') || name.includes('spironolactone') || name.includes('saw palmetto')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Compounded · ${formatBadge}`,
        role: '5α-Reductase & Androgen Blockade',
        color: '#1a73e8',
        bg: '#eff6ff'
      };
    }
    if (name.includes('metformin') || name.includes('resveratrol')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Compounded · ${formatBadge}`,
        role: 'Telomere & Genomic Activator',
        color: '#7c3aed',
        bg: '#f5f3ff'
      };
    }
    if (name.includes('astaxanthin') || name.includes('coenzyme') || name.includes('cysteine') || name.includes('nac') || name.includes('ubiquinol')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Formula · ${formatBadge}`,
        role: 'Mitochondrial & Antioxidant Shield',
        color: '#ea580c',
        bg: '#fff7ed'
      };
    }
    if (name.includes('latanoprost')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Compounded · ${formatBadge}`,
        role: 'Prostaglandin F2α Agonist',
        color: '#059669',
        bg: '#ecfdf5'
      };
    }
    if (name.includes('melatonin') || name.includes('theanine') || name.includes('glycine') || name.includes('magnesium')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Formula · ${formatBadge}`,
        role: 'Neuro-Circadian Modulator',
        color: '#6366f1',
        bg: '#eef2ff'
      };
    }
    if (name.includes('arginine') || name.includes('ginkgo') || name.includes('ginseng')) {
      return {
        format,
        formatBadge,
        formatColor,
        formatBg,
        formatBorder,
        category: `Finished Formula · ${formatBadge}`,
        role: 'Microcirculation & Bioregulator',
        color: '#0284c7',
        bg: '#f0f9ff'
      };
    }

    return {
      format,
      formatBadge,
      formatColor,
      formatBg,
      formatBorder,
      category: `Finished Product · ${formatBadge}`,
      role: 'Targeted Clinical Formulation',
      color: '#475569',
      bg: '#f1f5f9'
    };
  };

  prescriptions.forEach(rx => {
    const seenInRx = new Set();
    const extractApi = raw => {
      const isVehicle = raw?.isVehicleOrBase || raw?._isVehicleOrBase || String(raw?.name || '').toLowerCase().includes('trichosol') || String(raw?.name || '').toLowerCase().includes('trichooil') || String(raw?.name || '').toLowerCase().includes('vehicle');
      if (isVehicle) return;
      const n = normalizeName(raw?.name || raw?.activeIngredient || raw);
      if (n && !seenInRx.has(n)) {
        seenInRx.add(n);
        apiCounts[n] = (apiCounts[n] || 0) + 1;
      }
    };

    if (Array.isArray(rx.parts) && rx.parts.length > 0) {
      rx.parts.forEach(p => (p.apis || []).forEach(extractApi));
    }
    if (Array.isArray(rx.items) && rx.items.length > 0) {
      rx.items.forEach(extractApi);
    }
  });

  const totalRxCount = prescriptions.length;
  const topApis = Object.entries(apiCounts)
    .map(([name, count]) => {
      const meta = getApiMeta(name);
      return {
        name,
        count,
        percentage: totalRxCount > 0 ? Math.round((count / totalRxCount) * 100) : 0,
        format: meta.format,
        formatBadge: meta.formatBadge,
        formatColor: meta.formatColor,
        formatBg: meta.formatBg,
        formatBorder: meta.formatBorder,
        category: meta.category,
        role: meta.role,
        color: meta.color,
        bg: meta.bg,
        meta: {
          format: meta.format,
          formatBadge: meta.formatBadge,
          formatColor: meta.formatColor,
          formatBg: meta.formatBg,
          formatBorder: meta.formatBorder,
          category: meta.category,
          role: meta.role,
          color: meta.color,
          bg: meta.bg
        }
      };
    })
    .sort((a, b) => b.count - a.count);

  // 3. Patient Cohorts with Pre-computed SVG Geometry
  const patientPrescriptionCounts = {};
  prescriptions.forEach(rx => {
    const patientKey = rx.patientId || rx.patient?.id || rx.patientName || rx.code;
    if (patientKey) {
      patientPrescriptionCounts[patientKey] = (patientPrescriptionCounts[patientKey] || 0) + 1;
    }
  });

  const totalPatients = Object.keys(patientPrescriptionCounts).length;
  let singleRxPatients = 0;
  let twoRxsPatients = 0;
  let multiRxsPatients = 0;

  Object.values(patientPrescriptionCounts).forEach(count => {
    if (count === 1) singleRxPatients++;
    else if (count === 2) twoRxsPatients++;
    else multiRxsPatients++;
  });

  const singlePct = totalPatients > 0 ? Math.round((singleRxPatients / totalPatients) * 100) : 0;
  const doublePct = totalPatients > 0 ? Math.round((twoRxsPatients / totalPatients) * 100) : 0;
  const chronicPct = Math.max(0, 100 - singlePct - doublePct);
  const avgRx = (totalRxCount / Math.max(totalPatients, 1)).toFixed(1);

  const cohortsList = [
    { id: 'single', label: '1 Rx (Initial Regimen)', count: singleRxPatients, pct: singlePct, color: '#1a73e8' },
    { id: 'double', label: '2 Rxs (Treatment Follow-up)', count: twoRxsPatients, pct: doublePct, color: '#0d9488' },
    { id: 'chronic', label: '3+ Rxs (Continuous Care)', count: multiRxsPatients, pct: chronicPct, color: '#7c3aed' }
  ];

  const slices = [];
  let curAngle = 0;
  cohortsList.forEach(c => {
    const angle = (c.pct / 100) * 360;
    if (angle > 0) {
      slices.push({
        ...c,
        path: getDonutSlice(curAngle, curAngle + angle, 36, 52, 60, 60),
        startAngle: curAngle,
        endAngle: curAngle + angle
      });
      curAngle += angle;
    }
  });

  const cohorts = {
    singleRx: { count: singleRxPatients, pct: singlePct },
    twoRxs: { count: twoRxsPatients, pct: doublePct },
    multiRxs: { count: multiRxsPatients, pct: chronicPct },
    totalPatients
  };

  const cohortData = {
    totalPatients,
    single: singleRxPatients,
    double: twoRxsPatients,
    chronic: multiRxsPatients,
    singlePct,
    doublePct,
    chronicPct,
    avgRx,
    slices,
    cohorts: cohortsList
  };

  // 4. Formulation Complexity
  let multiCount = 0;
  let singleCount = 0;
  prescriptions.forEach(rx => {
    const isMulti = rx.isMultiPart === true || (Array.isArray(rx.parts) && rx.parts.length > 1);
    if (isMulti) multiCount++;
    else singleCount++;
  });

  const complexityData = {
    singleCount,
    multiCount,
    singlePct: totalRxCount > 0 ? Math.round((singleCount / totalRxCount) * 100) : 0,
    multiPct: totalRxCount > 0 ? Math.round((multiCount / totalRxCount) * 100) : 0,
    total: totalRxCount
  };

  // 5. Practice-Wide Atlas Recommendations
  const lotuslandPracticeRecommendations = [
    {
      id: 'atlas-rec-ghk-cu',
      peptideName: 'GHK-Cu (Human Copper Peptide) 50 mg / vial',
      supplier: 'Atlas Clinical Formulary',
      catalogCode: 'atlas-ghk-cu-50mg',
      matchScore: '98% Practice Fit',
      targetIndication: 'Trichological Follicular Rejuvenation & Dermal Papilla Stimulation',
      pharmacologicalClass: 'Tripeptide-Copper Bioregulator & Follicular Matrix Mitogen',
      synergisticApis: ['Minoxidil 4-5%', 'Spironolactone 1%', 'Dutasteride 0.5%', 'Latanoprost 0.005%'],
      pharmaRationale:
        'Potent follicular bioregulator stimulating dermal papilla fibroblast proliferation, downregulating TGF-β1 (the primary transcriptional driver of catagen transition and follicular miniaturization), and inducing VEGF/bFGF microvascular angiogenesis. Exhibits pronounced pharmacodynamic synergy with Minoxidil 5% and 5α-reductase inhibitors by accelerating anagen re-entry without androgenic receptor competition.',
      associatedProtocol: {
        slug: 'melanogenesis-density-protocol-zt-ghk-cu',
        title: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
        url: '/proto/melanogenesis-density-protocol-zt-ghk-cu'
      }
    },
    {
      id: 'atlas-rec-glow',
      peptideName: 'GLOW (BPC-157 / TB-500 / GHK) 10 mg | 10 mg | 75 mg',
      supplier: 'Atlas Clinical Formulary',
      catalogCode: 'atlas-glow-blend',
      matchScore: '96% Practice Fit',
      targetIndication: 'Post-FUE Graft Integration, Microvascular Perfusion & Scalp Wound Healing',
      pharmacologicalClass: 'Triple Bio-Regenerative Angiogenesis & Cytoprotective Complex',
      synergisticApis: ['PRP (Platelet-Rich Plasma)', 'TrichoOil Lipids', 'Arginine', 'Vitamin E'],
      pharmaRationale:
        'Synergistic tri-peptide complex engineered for rapid follicular graft revascularization. BPC-157 activates early growth response-1 (egr-1) and nitric oxide modulation for microvascular stability; TB-500 (Thymosin β4 fragment) accelerates actin filament sequestration driving keratinocyte and endothelial migration into ischemic recipient beds; GHK upregulates pro-collagen synthesis and reduces inflammatory metalloproteinase (MMP-1/MMP-2) degradation.',
      associatedProtocol: {
        slug: 'bpc-157-tb-500-protocol',
        title: 'BPC-157 & TB-500 Tissue Repair Protocol',
        url: '/proto/bpc-157-tb-500-protocol'
      }
    },
    {
      id: 'atlas-rec-epithalon',
      peptideName: 'Epithalon 10 mg / vial',
      supplier: 'Atlas Clinical Formulary',
      catalogCode: 'atlas-epithalon-10mg',
      matchScore: '94% Practice Fit',
      targetIndication: 'Telomerase Catalytic Activation & Follicular Stem Cell Senescence Retardation',
      pharmacologicalClass: 'Synthetic Epigenetic Telomerase Bioregulator (Ala-Glu-Asp-Gly)',
      synergisticApis: ['Metformin', 'Ubiquinol / CoQ10', 'Trans-Resveratrol', 'N-Acetyl-L-Cysteine'],
      pharmaRationale:
        'Synthetic Ala-Glu-Asp-Gly pineal biomimetic peptide inducing direct heterochromatin de-condensation and transcriptional upregulation of human Telomerase Reverse Transcriptase (TERT) catalytic subunit. Directly restores telomeric length in aging follicular bulge stem cells, counteracting replicative senescence identified in systemic telomere attrition evaluations (e.g., TeloTest).',
      associatedProtocol: {
        slug: 'epithalon-telomere-extension',
        title: 'Epithalon Telomere Extension Cycle',
        url: '/proto/epithalon-telomere-extension'
      }
    }
  ];

  return {
    serverComputed: true,
    computedAt: Date.now(),
    monthlyVolume,
    monthlyData,
    maxMonthlyCount,
    avgMonthlyRx,
    topApis: topApis.slice(0, 5),
    allTopApis: topApis,
    cohorts,
    cohortData,
    complexity: complexityData,
    complexityData,
    summary: {
      totalPrescriptions: totalRxCount,
      uniquePatients: totalPatients,
      uniqueApis: Object.keys(apiCounts).length,
      multiPartRatio: complexityData.multiPct
    },
    lotuslandPracticeRecommendations
  };
}

/**
 * Updates physician profile in Firestore and purges memory cache.
 * Adheres to Golden Rule #2 (Firestore authoritative source of truth).
 */
export async function updateDoctorProfile(slug, updates = {}) {
  if (!slug || !updates) return null;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  // Find matching doctor
  const doctors = await getCachedDoctorDirectory();
  const matchedDoc = doctors.find(doc => {
    return doc.opaqueCode.toLowerCase() === cleanSlug ||
           doc.id.toLowerCase() === cleanSlug ||
           doc.nameSlug === cleanSlug ||
           doc.nameSlug.replace(/-/g, '') === cleanSlug.replace(/-/g, '') ||
           (doc.license && doc.license.toLowerCase() === cleanSlug);
  });

  const docId = matchedDoc?.id || cleanSlug;

  if (adminDb) {
    const payload = {
      updatedAt: new Date().toISOString()
    };

    if (updates.name !== undefined) {
      payload.name = updates.name;
      payload.displayName = updates.displayName || updates.name;
    } else if (updates.displayName !== undefined) {
      payload.displayName = updates.displayName;
      payload.name = updates.displayName;
    }

    if (updates.specialty !== undefined) payload.specialty = updates.specialty;
    if (updates.clinic !== undefined) {
      payload.clinic = updates.clinic;
      payload.clinicName = updates.clinicName || updates.clinic;
    } else if (updates.clinicName !== undefined) {
      payload.clinicName = updates.clinicName;
      payload.clinic = updates.clinicName;
    }

    if (updates.license !== undefined) {
      payload.license = updates.license;
      payload.licenseNumber = updates.licenseNumber || updates.license;
    } else if (updates.licenseNumber !== undefined) {
      payload.licenseNumber = updates.licenseNumber;
      payload.license = updates.licenseNumber;
    }

    if (updates.mobile !== undefined) {
      payload.mobile = updates.mobile;
      payload.phone = updates.phone || updates.mobile;
    } else if (updates.phone !== undefined) {
      payload.phone = updates.phone;
      payload.mobile = updates.phone;
    }

    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.clinicLogo !== undefined) {
      payload.clinicLogo = updates.clinicLogo;
      payload.logoUrl = updates.clinicLogo;
    }
    if (updates.logoUrl !== undefined) {
      payload.logoUrl = updates.logoUrl;
      if (!payload.clinicLogo) payload.clinicLogo = updates.logoUrl;
    }
    if (updates.whiteLabelEnabled !== undefined) payload.whiteLabelEnabled = updates.whiteLabelEnabled;
    if (updates.tier !== undefined) payload.tier = updates.tier;

    // Update in Firestore users collection
    await adminDb.collection('users').doc(docId).set(payload, { merge: true });

    // Also update doctors collection if present
    try {
      await adminDb.collection('doctors').doc(docId).set(payload, { merge: true });
    } catch {
      // Non-critical if doctors collection doc doesn't exist
    }

    // Invalidate caches
    invalidateDoctorCache();
  }

  // Return fresh hydrated data
  return await getDoctorPortalData(slug, { forceRefresh: true });
}

