// Comprehensive fix for BOX03483AATRI → Dr. Sezgin Cagatay / Hortman Clinics
import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sa = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const SEZGIN_DATA = {
  doctorName: 'Dr. Sezgin Cagatay',
  prescribingDoctor: 'Dr. Sezgin Cagatay (Hortman Clinics, Dubai)',
  doctorLicense: 'DHA-00013060-006',
  clinic: 'Hortman Clinics, Dubai',
  clinicName: 'Hortman Clinics, Dubai',
  treatingDoctor: {
    name: 'Dr. Sezgin Cagatay',
    license: 'DHA-00013060-006',
    clinic: 'Hortman Clinics, Dubai'
  },
  doctor: {
    id: 'z3aUIMaYsPViG1JgM95r',
    name: 'Dr. Sezgin Cagatay',
    displayName: 'Dr. Sezgin Cagatay',
    title: 'Hair Restoration & Trichology Specialist',
    specialty: 'Hair Restoration & Trichology',
    license: 'DHA-00013060-006',
    clinic: 'Hortman Clinics, Dubai',
    clinicName: 'Hortman Clinics, Dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    address: 'Street 10C, Villa 41, Jumeirah 1, Behind Jumeirah Plaza, Dubai, UAE',
    phone: '+971 4 349 8800',
    email: 'sezgin@hortmanclinics.com'
  }
};

async function fix() {
  const docRef = db.collection('prescriptions').doc('RX-BOX03483AATRI');
  const snap = await docRef.get();
  if (!snap.exists) {
    console.error('Document RX-BOX03483AATRI not found!');
    process.exit(1);
  }

  await docRef.update({
    ...SEZGIN_DATA,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('✅ RX-BOX03483AATRI successfully updated with Dr. Sezgin Cagatay full profile!');
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
