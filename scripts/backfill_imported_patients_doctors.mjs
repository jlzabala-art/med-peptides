import { adminDb } from '../src/lib/firebaseAdmin.js';

async function backfillImportedPatients() {
  console.log('--- Backfilling Imported Patients with Doctor & Clinic ---');

  const DOCTORS = {
    raffanie: {
      id: 'raffanie-lucenio',
      name: 'Dr. Raffanie Lucenio',
      clinic: 'The Masters Medical Center',
      clinicId: 'clinic-masters-medical-center'
    },
    sobia: {
      id: 'dr-sobia',
      name: 'Dr. Sobia Mirza',
      clinic: 'My London Skin Clinic',
      clinicId: 'IdDU1oK1VuAVVYrGz6E7'
    },
    sezgin: {
      id: 'z3aUIMaYsPViG1JgM95r',
      name: 'Dr. Sezgin Cagatay',
      clinic: 'Hortman Clinics',
      clinicId: '8StD8XLAHbGSrOJXMqIK'
    }
  };

  // 1. Process users collection (role == 'patient')
  const usersSnap = await adminDb.collection('users').where('role', '==', 'patient').get();
  console.log(`Checking ${usersSnap.size} user patients...`);

  let userUpdated = 0;
  for (const doc of usersSnap.docs) {
    const data = doc.data();
    const notes = (data.notes || '').toLowerCase();
    const country = (data.country || '').toUpperCase();
    const clinic = (data.clinic || data.clinicName || '').toLowerCase();

    let assignedDoc = null;

    if (notes.includes('trichotest') || country === 'QATAR') {
      assignedDoc = DOCTORS.raffanie;
    } else if (notes.includes('telotest')) {
      assignedDoc = DOCTORS.sobia;
    } else if (clinic.includes('hortman') || (!data.physician && !data.doctorName && data.defaultSupplier === 'PharmaPolis')) {
      assignedDoc = DOCTORS.sezgin;
    }

    if (assignedDoc && (!data.physician || data.physician === 'Direct Medical Desk' || !data.physicianId)) {
      await doc.ref.update({
        physician: assignedDoc.name,
        doctorName: assignedDoc.name,
        physicianId: assignedDoc.id,
        doctorId: assignedDoc.id,
        clinic: assignedDoc.clinic,
        clinicName: assignedDoc.clinic,
        clinicId: assignedDoc.clinicId
      });
      userUpdated++;
      console.log(`Updated user ${doc.id} (${data.name}) -> ${assignedDoc.name} (${assignedDoc.clinic})`);
    }
  }

  // 2. Process patients collection
  const patientsSnap = await adminDb.collection('patients').get();
  console.log(`Checking ${patientsSnap.size} patients collection docs...`);

  let patientUpdated = 0;
  for (const doc of patientsSnap.docs) {
    const data = doc.data();
    const notes = (data.notes || '').toLowerCase();
    const country = (data.country || '').toUpperCase();
    const clinic = (data.clinic || data.clinicName || '').toLowerCase();

    let assignedDoc = null;

    if (notes.includes('trichotest') || country === 'QATAR') {
      assignedDoc = DOCTORS.raffanie;
    } else if (notes.includes('telotest')) {
      assignedDoc = DOCTORS.sobia;
    } else if (clinic.includes('hortman') || (!data.physician && !data.doctorName && (data.defaultSupplier === 'PharmaPolis' || !clinic))) {
      assignedDoc = DOCTORS.sezgin;
    }

    if (assignedDoc && (!data.physician || data.physician === 'Direct Medical Desk' || !data.physicianId)) {
      await doc.ref.update({
        physician: assignedDoc.name,
        doctorName: assignedDoc.name,
        physicianId: assignedDoc.id,
        doctorId: assignedDoc.id,
        clinic: assignedDoc.clinic,
        clinicName: assignedDoc.clinic,
        clinicId: assignedDoc.clinicId
      });
      patientUpdated++;
      console.log(`Updated patient ${doc.id} (${data.name}) -> ${assignedDoc.name} (${assignedDoc.clinic})`);
    }
  }

  console.log(`✅ Completed: Updated ${userUpdated} users and ${patientUpdated} patients with doctor and clinic.`);
}

backfillImportedPatients().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
