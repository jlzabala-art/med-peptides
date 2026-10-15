import { readFileSync } from 'fs';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function analyzeAllKhalidPrescriptions() {
  const rxSnap = await db.collection('prescriptions')
    .where('doctorId', '==', 'dr-khalid-shukri')
    .get();

  const protocolsSnap = await db.collection('protocols').get();
  const catalogProtocols = [];
  protocolsSnap.forEach(d => {
    const data = d.data();
    catalogProtocols.push({
      id: d.id,
      title: data.title || data.name,
      slug: data.slug || d.id,
      durationWeeks: data.durationWeeks || 4,
      targetSystem: data.targetSystem || ''
    });
  });

  const results = [];

  rxSnap.forEach(doc => {
    const rx = doc.data();
    const patientName = rx.patientName || rx.patient?.name || 'Unnamed';
    const lines = rx.prescriptionLines || rx.items || [];
    const rawText = (rx.treatmentTitle || '') + ' ' + lines.map(l => (l.name || l.drugName || '') + ' ' + (l.dose || '') + ' ' + (l.quantity || '')).join(', ');
    const invoiceRef = rx.invoiceRef || 'N/A';
    const status = rx.status || 'active';
    const createdAt = rx.createdAt ? (rx.createdAt.toDate ? rx.createdAt.toDate() : new Date(rx.createdAt)) : new Date('2026-10-01');

    results.push({
      rxId: doc.id,
      patientName,
      invoiceRef,
      rawText,
      lines,
      status,
      createdAt
    });
  });

  console.log(`Loaded ${results.length} prescriptions for Dr. Khalid.`);
  console.log(JSON.stringify(results.slice(0, 10), null, 2));
}

analyzeAllKhalidPrescriptions().catch(console.error);
