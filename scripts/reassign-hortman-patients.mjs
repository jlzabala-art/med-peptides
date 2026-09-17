import { adminDb } from '../src/lib/firebaseAdmin.js';

async function reassignHortmanRecords() {
  console.log('--- Starting Hortman Records & Dr. Erdmann isolation ---');

  const HORTMAN_DOCTOR = {
    id: 'z3aUIMaYsPViG1JgM95r',
    name: 'Dr. Sezgin Cagatay',
    email: 'sezgin@hortmanclinics.com'
  };

  const HORTMAN_CLINIC = {
    id: '8StD8XLAHbGSrOJXMqIK',
    name: 'Hortman Clinics'
  };

  // 1. Fix the 3 misassigned prescriptions that had Dr. Hanieh Erdmann but belonged to Hortman Clinics
  const misassignedRxIds = [
    'RX-PHARM-2026-0903-MS',
    'RX-PHARM-2026-0903-MT',
    'RX-PHARM-2026-50957'
  ];

  for (const rxId of misassignedRxIds) {
    const rxRef = adminDb.collection('prescriptions').doc(rxId);
    const snap = await rxRef.get();
    if (snap.exists) {
      console.log(`Fixing prescription ${rxId} -> assigning to ${HORTMAN_DOCTOR.name}`);
      await rxRef.set({
        doctorName: HORTMAN_DOCTOR.name,
        physician: HORTMAN_DOCTOR.name,
        physicianId: HORTMAN_DOCTOR.id,
        doctorId: HORTMAN_DOCTOR.id,
        clinic: HORTMAN_CLINIC.name,
        clinicName: HORTMAN_CLINIC.name,
        clinicId: HORTMAN_CLINIC.id
      }, { merge: true });
    }
  }

  // 2. Fix the 3 patients corresponding to those prescriptions
  const misassignedPatientIds = [
    'alan-maclean-rutledge',
    'kE8uxXN1SumgPaBNvt32',
    'matthew-taylor'
  ];

  for (const pId of misassignedPatientIds) {
    const pRef = adminDb.collection('patients').doc(pId);
    const snap = await pRef.get();
    if (snap.exists) {
      console.log(`Fixing patient ${pId} -> assigning to ${HORTMAN_DOCTOR.name}`);
      await pRef.set({
        physician: HORTMAN_DOCTOR.name,
        physicianId: HORTMAN_DOCTOR.id,
        assignedDoctorId: HORTMAN_DOCTOR.id,
        clinic: HORTMAN_CLINIC.name,
        clinicName: HORTMAN_CLINIC.name,
        clinicId: HORTMAN_CLINIC.id
      }, { merge: true });
    }
  }

  // 3. Reassign all Hortman Clinic patients with "Direct Medical Desk" to Dr. Sezgin Cagatay
  const patientsSnap = await adminDb.collection('patients').get();
  let reassignedCount = 0;

  const batchSize = 100;
  let batch = adminDb.batch();
  let countInBatch = 0;

  patientsSnap.forEach(doc => {
    const p = doc.data();
    const clinic = (p.clinic || p.clinicName || '').toLowerCase();
    
    // If it belongs to Hortman and doesn't have a specific doctor, or has Direct Medical Desk
    if (clinic.includes('hortman') && (!p.physicianId || p.physician === 'Direct Medical Desk' || !p.physician)) {
      batch.update(doc.ref, {
        physician: HORTMAN_DOCTOR.name,
        physicianId: HORTMAN_DOCTOR.id,
        assignedDoctorId: HORTMAN_DOCTOR.id,
        clinic: HORTMAN_CLINIC.name,
        clinicName: HORTMAN_CLINIC.name,
        clinicId: HORTMAN_CLINIC.id
      });
      reassignedCount++;
      countInBatch++;
    }
  });

  if (countInBatch > 0) {
    await batch.commit();
    console.log(`Committed batch of ${countInBatch} Hortman patients assigned to ${HORTMAN_DOCTOR.name}`);
  }

  // 4. Verify Dr. Hanieh Erdmann's remaining patients
  const verifiedSnap = await adminDb.collection('patients').get();
  const erdmannRemaining = [];
  verifiedSnap.forEach(d => {
    const p = d.data();
    if (p.physicianId === 'dr-hanieh-erdmann' || (p.physician || '').includes('Erdmann')) {
      erdmannRemaining.push({ id: d.id, name: p.name || `${p.firstName} ${p.lastName}`, clinic: p.clinic });
    }
  });

  console.log('Dr. Hanieh Erdmann verified patients:', JSON.stringify(erdmannRemaining, null, 2));
  console.log('Total Hortman patients updated:', reassignedCount + misassignedPatientIds.length);
}

reassignHortmanRecords()
  .then(() => {
    console.log('--- Completed successfully ---');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
