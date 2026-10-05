import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { algoliasearch } from 'algoliasearch';

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const privateKey = rawPk.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
});
const db = getFirestore(app);

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ',
  process.env.ALGOLIA_ADMIN_KEY
);

function getTimestamp(val) {
  if (!val) return Date.now();
  if (typeof val === 'number') return val;
  if (val.toDate && typeof val.toDate === 'function') return val.toDate().getTime();
  if (val._seconds) return val._seconds * 1000;
  if (val instanceof Date) return val.getTime();
  const parsed = new Date(val).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

async function syncAll() {
  console.log('🔄 Fetching prescriptions from Firestore...');
  const rxSnap = await db.collection('prescriptions').get();
  console.log('Found', rxSnap.size, 'prescriptions in Firestore');

  const rxObjects = [];
  rxSnap.forEach(doc => {
    const d = doc.data();
    const targetId = doc.id;
    const items = Array.isArray(d.items) ? d.items : (Array.isArray(d.prescriptionLines) ? d.prescriptionLines : []);
    const productNames = items.map(i => i.name || i.productName || i.product_title).filter(Boolean);
    const patientName = d.patientName || d.patient?.name || d.patient?.fullName || '';
    const doctorName = d.doctorName || d.doctor?.name || d.treatingDoctor?.name || '';
    const code = d.prescriptionCode || d.prescriptionNumber || d.code || ('RX-' + targetId.slice(0, 6).toUpperCase());

    rxObjects.push({
      objectID: targetId,
      id: targetId,
      code,
      prescriptionCode: code,
      patientName,
      patientId: d.patientId || d.patient?.id || '',
      doctorName,
      doctorId: d.doctorId || d.doctor?.id || '',
      status: (d.status || 'pending').toLowerCase(),
      items: productNames,
      itemCount: items.length,
      treatmentProgram: d.treatmentProgram || d.program || '',
      treatmentType: d.treatmentType || d.type || '',
      boxId: d.fagron?.boxId || '',
      total: Number(d.total || d.amount || 0),
      source: d.source || 'portal',
      createdAt_ts: getTimestamp(d.createdAt || d.dateIssued)
    });
  });

  console.log(`Pushing ${rxObjects.length} prescriptions to Algolia index [prescriptions]...`);
  await client.saveObjects({
    indexName: 'prescriptions',
    objects: rxObjects
  });
  console.log('✅ Prescriptions synchronized successfully!');

  console.log('🔄 Fetching patients from Firestore...');
  const patSnap = await db.collection('patients').get();
  console.log('Found', patSnap.size, 'patients in Firestore');

  const patObjects = [];
  patSnap.forEach(doc => {
    const d = doc.data();
    const targetId = doc.id;
    const name = (d.name || d.fullName || `${d.firstName || ''} ${d.lastName || ''}`).trim() || 'Patient';
    patObjects.push({
      objectID: targetId,
      id: targetId,
      name,
      fullName: name,
      email: d.email || '',
      phone: d.phone || d.phoneNumber || '',
      fileNumber: d.fileNumber || '',
      status: (d.status || 'active').toLowerCase(),
      country: d.country || 'AE',
      physicianId: d.physicianId || d.doctorId || '',
      prescribingDoctorNames: d.prescribingDoctorNames || (d.doctorName ? [d.doctorName] : []),
      createdAt_ts: getTimestamp(d.createdAt),
      lastActivityDate: getTimestamp(d.lastActivityDate || d.updatedAt || d.createdAt)
    });
  });

  console.log(`Pushing ${patObjects.length} patients to Algolia index [atlas_patients]...`);
  await client.saveObjects({
    indexName: 'atlas_patients',
    objects: patObjects
  });
  console.log('✅ Patients synchronized successfully!');
}

syncAll().catch(err => {
  console.error('❌ Sync failed:', err);
  process.exit(1);
});
