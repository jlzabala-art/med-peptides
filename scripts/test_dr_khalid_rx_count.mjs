import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function checkDrKhalidRx() {
  const allRxSnap = await db.collection('prescriptions').get();
  console.log('Total prescriptions in Firestore:', allRxSnap.size);

  let khalidCount = 0;
  const khalidRxList = [];

  allRxSnap.forEach(d => {
    const rx = d.data();
    const docName = String(rx.doctorName || rx.treatingDoctor || rx.treatingDoctor?.name || rx.prescribingDoctor || '').toLowerCase();
    const docId = String(rx.doctorId || rx.treatingDoctorId || rx.treatingDoctor?.id || '').toLowerCase();
    if (docId === 'dr-khalid-shukri' || docName.includes('khalid')) {
      khalidCount++;
      khalidRxList.push({ id: d.id, patientName: rx.patientName, product: rx.items?.[0]?.name || rx.prescriptionLines?.[0]?.name || rx.treatmentTitle, status: rx.status, invoiceRef: rx.invoiceRef });
    }
  });

  console.log('Prescriptions belonging to Dr. Khalid in entire DB:', khalidCount);

  // Now check the first 300
  const first300 = await db.collection('prescriptions').limit(300).get();
  let inFirst300 = 0;
  first300.forEach(d => {
    const rx = d.data();
    const docName = String(rx.doctorName || rx.treatingDoctor || rx.treatingDoctor?.name || rx.prescribingDoctor || '').toLowerCase();
    const docId = String(rx.doctorId || rx.treatingDoctorId || rx.treatingDoctor?.id || '').toLowerCase();
    if (docId === 'dr-khalid-shukri' || docName.includes('khalid')) {
      inFirst300++;
    }
  });
  console.log('Prescriptions found in limit(300):', inFirst300);

  // Check unique patients
  const patientSnap = await db.collection('patients').where('doctorId', '==', 'dr-khalid-shukri').get();
  console.log('Patients in patients collection for Dr. Khalid:', patientSnap.size);

  // Sample recommendations check
  console.log('Sample 5 Dr Khalid prescriptions:');
  khalidRxList.slice(0, 5).forEach(k => console.log(k));
}

checkDrKhalidRx().catch(console.error);
