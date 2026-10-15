import { adminDb } from '../src/lib/firebaseAdmin.js';

async function updateDrKhalidBiginInfo() {
  console.log('--- Updating Dr. Khalid Shukri from Zoho Bigin into Firestore ---');

  const khalidData = {
    id: 'dr-khalid-shukri',
    name: 'Dr. Khalid Shukri',
    displayName: 'Dr. Khalid Shukri',
    firstName: 'Khalid',
    lastName: 'Shukri',
    title: 'MD, FCCM',
    phone: '+971 52 425 1519',
    mobile: '+971 52 425 1519',
    telephone: '+971 52 425 1519',
    contactNumber: '+971 52 425 1519',
    email: 'Intensivedoctor@gmail.com',
    secondaryEmail: 'dr.khalid@shukriclinic.com',
    specialty: 'Anti-Aging, Functional & Regenerative Medicine | Peptide Therapy',
    speciality: 'Anti-Aging, Functional & Regenerative Medicine | Peptide Therapy',
    qualifications: 'MD, FCCM | American Board Certified in Anti-Aging & Regenerative Medicine (ABAARM)',
    bio: 'Physician with approximately 40 years of experience spanning internal medicine, critical care, functional medicine, anti-aging and regenerative medicine. American Board Certified in Anti-Aging and Regenerative Medicine. Areas of interest include BHRT, peptide therapy and peptide bioregulators, healthspan and lifespan programs, longevity supplements and preventive medicine.',
    description: 'Physician with approximately 40 years of experience spanning internal medicine, critical care, functional medicine, anti-aging and regenerative medicine. American Board Certified in Anti-Aging and Regenerative Medicine. Areas of interest include BHRT, peptide therapy and peptide bioregulators, healthspan and lifespan programs, longevity supplements and preventive medicine.',
    clinic: 'Medi-Gyn / Dr. Khalid Shukri Clinic',
    clinicName: 'Medi-Gyn / Dr. Khalid Shukri Clinic',
    clinicId: 'dr-khalid-shukri-clinic',
    address: 'Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    zohoContactId: '7006116000001127158',
    zohoAccountId: '7006116000001127153',
    accountName: 'Medi-Gyn Health Planning Consultancies LLC',
    role: 'doctor',
    isDoctor: true,
    status: 'active',
    updatedAt: new Date()
  };

  const collections = ['users', 'doctors', 'physicians'];
  for (const col of collections) {
    await adminDb.collection(col).doc('dr-khalid-shukri').set(khalidData, { merge: true });
    console.log(`Updated ${col}/dr-khalid-shukri with phone +971 52 425 1519 and email Intensivedoctor@gmail.com`);
  }

  // Also verify if there is any other user doc for Khalid Shukri
  const userSnap = await adminDb.collection('users')
    .where('email', 'in', ['Intensivedoctor@gmail.com', 'dr.khalid@shukriclinic.com'])
    .get();

  for (const doc of userSnap.docs) {
    if (doc.id !== 'dr-khalid-shukri') {
      await doc.ref.set(khalidData, { merge: true });
      console.log(`Updated duplicate user ${doc.id}`);
    }
  }

  // Update clinic
  await adminDb.collection('clinics').doc('dr-khalid-shukri-clinic').set({
    id: 'dr-khalid-shukri-clinic',
    name: 'Medi-Gyn / Dr. Khalid Shukri Clinic',
    clinicName: 'Medi-Gyn / Dr. Khalid Shukri Clinic',
    primaryPhysician: 'Dr. Khalid Shukri',
    primaryPhysicianId: 'dr-khalid-shukri',
    phone: '+971 52 425 1519',
    mobile: '+971 52 425 1519',
    email: 'Intensivedoctor@gmail.com',
    city: 'Dubai',
    country: 'United Arab Emirates',
    updatedAt: new Date()
  }, { merge: true });
  console.log('Updated clinics/dr-khalid-shukri-clinic');

  console.log('SUCCESS: Dr. Khalid Shukri telephone & Bigin metadata synchronized to Firebase.');
}

updateDrKhalidBiginInfo().catch(err => {
  console.error('Error updating Dr. Khalid:', err);
  process.exit(1);
});
