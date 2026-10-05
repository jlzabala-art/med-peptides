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
    const rawItems = Array.isArray(d.items) ? d.items : (Array.isArray(d.prescriptionLines) ? d.prescriptionLines : []);
    const cleanItems = rawItems.slice(0, 15).map(i => ({
      name: i.name || i.productName || i.title || '',
      activeIngredient: i.activeIngredient || '',
      dosage: i.dosage || i.dose || '',
      dose: i.dose || i.dosage || '',
      category: i.category || '',
      form: i.form || i.dosageForm || ''
    }));
    const productNames = rawItems.map(i => i.name || i.productName || i.product_title || i.activeIngredient).filter(Boolean);
    const patientName = d.patientName || d.patient?.name || d.patient?.fullName || '';
    const doctorName = d.doctorName || d.doctor?.name || d.treatingDoctor?.name || '';
    const code = d.prescriptionCode || d.prescriptionNumber || d.code || ('RX-' + targetId.slice(0, 6).toUpperCase());

    const rawDate = d.date || d.dateIssued;
    let formattedDate = d.dateFormatted || '';
    if (!formattedDate) {
      if (rawDate && typeof rawDate === 'string') {
        const dmy = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmy) {
          const dt = new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
          formattedDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
          const dt = new Date(rawDate);
          if (!isNaN(dt.getTime())) formattedDate = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
      }
      if (!formattedDate && d.createdAt) {
        const ts = getTimestamp(d.createdAt);
        formattedDate = new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }

    rxObjects.push({
      objectID: targetId,
      id: targetId,
      code,
      prescriptionCode: code,
      patientName,
      patientId: d.patientId || d.patient?.id || '',
      doctorName,
      doctorId: d.doctorId || d.doctor?.id || '',
      clinicName: d.clinicName || d.clinic?.name || '',
      status: (d.status || 'pending').toLowerCase(),
      date: d.date || rawDate || formattedDate,
      dateIssued: d.dateIssued || rawDate || '',
      dateFormatted: formattedDate,
      rxGroupId: d.rxGroupId || d.sessionId || '',
      sessionId: d.sessionId || d.rxGroupId || '',
      partNumber: d.partNumber || null,
      totalParts: d.totalParts || null,
      items: cleanItems,
      searchableItems: productNames,
      itemCount: rawItems.length,
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
