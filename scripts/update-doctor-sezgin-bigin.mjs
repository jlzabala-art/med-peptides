import { adminDb } from '../src/lib/firebaseAdmin.js';

async function updateDoctorAndClinic() {
  console.log('--- Updating Dr. Sezgin Cagatay and Hortman Clinic in Firestore ---');

  const doctorData = {
    name: 'Dr. Cagatay Sezgin',
    displayName: 'Dr. Cagatay Sezgin',
    firstName: 'Cagatay',
    lastName: 'Sezgin',
    title: 'Dr.',
    email: 'sezgin@hortmanclinics.com',
    secondaryEmail: 'cagataysezgin66@gmail.com',
    phone: '+97145662615',
    mobile: '+97145662615',
    additionalPhone: '+905326879626',
    specialty: 'Hair Restoration Surgeon',
    speciality: 'Hair Restoration Surgeon',
    location: 'Dubai',
    clinic: 'Hortman Clinics',
    clinicName: 'Hortman Clinics',
    clinicId: '8StD8XLAHbGSrOJXMqIK',
    assistant: {
      name: 'Adriana Barac',
      email: 'adriana.barac@novomed.com'
    },
    assistantName: 'Adriana Barac',
    assistantEmail: 'adriana.barac@novomed.com',
    zohoContactId: '7006116000000636596',
    role: 'doctor',
    isDoctor: true,
    status: 'active',
    updatedAt: new Date()
  };

  // Update user document
  await adminDb.collection('users').doc('z3aUIMaYsPViG1JgM95r').set(doctorData, { merge: true });
  console.log('Updated users/z3aUIMaYsPViG1JgM95r with Bigin contact details and assistant Adriana Barac');

  // Update clinic document
  await adminDb.collection('clinics').doc('8StD8XLAHbGSrOJXMqIK').set({
    name: 'Hortman Clinics',
    clinicName: 'Hortman Clinics',
    primaryPhysician: 'Dr. Cagatay Sezgin',
    primaryPhysicianId: 'z3aUIMaYsPViG1JgM95r',
    physicians: [
      {
        id: 'z3aUIMaYsPViG1JgM95r',
        name: 'Dr. Cagatay Sezgin',
        email: 'sezgin@hortmanclinics.com',
        specialty: 'Hair Restoration Surgeon',
        phone: '+97145662615',
        assistantEmail: 'adriana.barac@novomed.com',
        assistantName: 'Adriana Barac'
      }
    ],
    assistantEmail: 'adriana.barac@novomed.com',
    assistantName: 'Adriana Barac',
    phone: '+97145662615',
    updatedAt: new Date()
  }, { merge: true });
  console.log('Updated clinics/8StD8XLAHbGSrOJXMqIK with Dr. Sezgin and assistant Adriana Barac');

  // Ensure Dr. Hanieh Erdmann's patient record is linked to her
  const matinRef = adminDb.collection('patients').doc('matin-rahim-delavar-rafiei');
  const matinSnap = await matinRef.get();
  if (matinSnap.exists) {
    await matinRef.set({
      physician: 'Dr. Hanieh Erdmann',
      physicianId: 'dr-hanieh-erdmann',
      assignedDoctorId: 'dr-hanieh-erdmann',
      doctorName: 'Dr. Hanieh Erdmann',
      clinic: 'Bedaya Polyclinic L.L.C.',
      clinicName: 'Bedaya Polyclinic L.L.C.',
      clinicId: 'bedaya-polyclinic'
    }, { merge: true });
    console.log('Confirmed patient Matin Rahim Delavar Rafiei assigned to Dr. Hanieh Erdmann');
  }

  // Also verify Dr. Hanieh Erdmann's user record has correct clinic
  await adminDb.collection('users').doc('dr-hanieh-erdmann').set({
    clinic: 'Bedaya Polyclinic L.L.C.',
    clinicName: 'Bedaya Polyclinic L.L.C.',
    clinicId: 'bedaya-polyclinic'
  }, { merge: true });
  console.log('Confirmed Dr. Hanieh Erdmann clinic is Bedaya Polyclinic L.L.C.');

  console.log('--- All Firestore updates completed successfully ---');
}

updateDoctorAndClinic().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
