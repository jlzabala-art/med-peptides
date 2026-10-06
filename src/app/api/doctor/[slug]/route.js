import { adminDb } from '@/lib/firebaseAdmin';

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

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^dr\.\s*/i, '')
    .replace(/^dr\s*/i, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * GET /api/doctor/[slug]
 * Resolves doctor profile, clinical prescriptions, operational KPIs, and patient-centric tasks.
 */
export async function GET(request, { params }) {
  try {
    if (!adminDb) {
      return Response.json({ success: false, error: 'Database uninitialized' }, { status: 500 });
    }

    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug || '').trim().toLowerCase();

    // 1. Find Doctor in users collection
    const usersSnap = await adminDb.collection('users').get();
    let doctorDoc = null;
    let doctorId = null;

    usersSnap.forEach((doc) => {
      const d = doc.data();
      const isDoc = d.role === 'doctor' || d.role === 'physician' || d.isDoctor;
      if (!isDoc) return;

      const docName = d.displayName || (d.firstName ? `${d.firstName} ${d.lastName || ''}` : '') || d.name || '';
      const docSlug = slugify(docName);
      const matchId = doc.id.toLowerCase() === cleanSlug;
      const matchSlug = docSlug === cleanSlug || docSlug.replace(/-/g, '') === cleanSlug.replace(/-/g, '');
      const matchLicense = (d.licenseNumber && d.licenseNumber.toLowerCase() === cleanSlug) ||
                           (d.dhaLicense && d.dhaLicense.toLowerCase() === cleanSlug);

      if (matchId || matchSlug || matchLicense) {
        doctorDoc = d;
        doctorId = doc.id;
      }
    });

    if (!doctorDoc) {
      // Fallback: check if slug matches any doctor in prescriptions
      const rxProbe = await adminDb.collection('prescriptions').limit(200).get();
      let matchedDoctorName = null;
      rxProbe.forEach((doc) => {
        const d = doc.data();
        const dName = d.doctorName || d.treatingDoctor?.name || d.prescribingDoctor || '';
        if (dName && slugify(dName) === cleanSlug) {
          matchedDoctorName = dName;
          doctorDoc = {
            displayName: dName,
            clinic: d.clinic || d.treatingDoctor?.clinic || 'Clinical Dispensary',
            specialty: d.treatingDoctor?.specialty || 'Regenerative Medicine',
            licenseNumber: d.doctorLicense || d.treatingDoctor?.license || ''
          };
          doctorId = d.doctorId || d.treatingDoctor?.id || cleanSlug;
        }
      });
    }

    if (!doctorDoc) {
      return Response.json({ success: false, error: 'Physician profile not found' }, { status: 404 });
    }

    const cleanDoctorName = (doctorDoc.displayName || doctorDoc.name || `${doctorDoc.firstName || ''} ${doctorDoc.lastName || ''}`).trim();
    const cleanDoctorQuery = cleanDoctorName.toLowerCase().replace('dr.', '').replace('dr ', '').trim();

    // 2. Fetch all Prescriptions for this Doctor
    const rxSnap = await adminDb.collection('prescriptions').limit(300).get();
    const prescriptions = [];
    const patientMap = new Map();

    rxSnap.forEach((doc) => {
      const d = doc.data();
      const dDocName = String(d.treatingDoctor?.name || d.doctorName || d.doctor?.name || d.prescribingDoctor || '').toLowerCase();
      const dDocId = String(d.treatingDoctor?.id || d.doctorId || d.doctor?.id || '').toLowerCase();

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

        prescriptions.push({
          id: doc.id,
          prescriptionNumber: d.prescriptionNumber || d.code || doc.id,
          code: d.code || d.prescriptionNumber || doc.id,
          patientName: patName,
          patientId: patId,
          patient: d.patient || null,
          status: d.status || d.state || 'active',
          state: d.state || d.status || 'active',
          treatmentTitle: d.treatmentTitle || d.description || d.treatmentProgram || d.program || 'Personalized Formulation',
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

    // Sort prescriptions by date descending
    prescriptions.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    // 3. Generate Patient-Centric Clinical Tasks (To-Do List)
    const clinicalTasks = [];
    const now = Date.now();

    prescriptions.forEach((rx) => {
      const rxAgeDays = rx.createdAt ? Math.floor((now - new Date(rx.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Task Type 1: Protocol Phase Progression / Titration Check (multi-phase protocols around day 25-35)
      const isMultiPhase = String(rx.treatmentTitle || '').toLowerCase().includes('phase') ||
                           String(rx.posology || '').toLowerCase().includes('phase') ||
                           (Array.isArray(rx.items) && rx.items.length >= 4);
      
      if (isMultiPhase && rx.status === 'approved') {
        clinicalTasks.push({
          id: `task-phase-${rx.id}`,
          rxId: rx.id,
          code: rx.code,
          patientName: rx.patientName,
          type: 'titration',
          priority: rxAgeDays > 25 ? 'high' : 'medium',
          title: `Protocol Phase Evaluation: ${rx.patientName}`,
          description: `Treatment is at day ${rxAgeDays || 25}. Review Phase 1 tolerance and approve Phase 2 transition formulation.`,
          dueDate: 'Next 5 days',
          actionLabel: 'Review Protocol',
          actionUrl: `/rx/${rx.code}`
        });
      }

      // Task Type 2: Refill / Quotation Follow-up (30-day supply approaching completion)
      if (rxAgeDays >= 20 && rxAgeDays <= 45 && rx.status === 'approved') {
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
      if (['pending', 'draft'].includes(rx.status.toLowerCase())) {
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

    // Fallback task if none triggered to ensure doctor always has proactive guidance
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
      slug: slugify(cleanDoctorName)
    };

    return Response.json({
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
      patients: Array.from(patientMap.values())
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('API /api/doctor/[slug] error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
