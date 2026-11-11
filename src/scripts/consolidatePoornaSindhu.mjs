import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.join(process.cwd(), 'src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  console.log('🔍 Searching for Poorna Sindhu Jetty / 03505 prescriptions in Firestore...');

  const snap = await db.collection('prescriptions').get();
  const matched = [];

  snap.forEach(docSnap => {
    const d = docSnap.data();
    const id = docSnap.id;
    const code = String(d.code || d.prescriptionNumber || d.rxCode || '').trim();
    const patient = String(d.patientName || d.patient?.name || '').toLowerCase();

    if (code.includes('03505') || patient.includes('poorna')) {
      matched.push({ id, ...d });
    }
  });

  console.log(`Found ${matched.length} matching documents in Firestore:`);
  matched.forEach(m => {
    console.log(`- ID: ${m.id} | Code: ${m.code || m.prescriptionNumber} | Patient: ${m.patientName || m.patient?.name} | Doctor: ${m.doctorName || m.doctor?.name || 'NONE'}`);
  });

  if (matched.length <= 1) {
    console.log('No split documents need consolidation or already consolidated.');
    return;
  }

  // Find the primary master document: ideally code === '03505' or the first one
  let primaryDoc = matched.find(m => (m.code === '03505' || m.prescriptionNumber === '03505'));
  if (!primaryDoc) primaryDoc = matched[0];

  const docsToDelete = matched.filter(m => m.id !== primaryDoc.id);

  console.log(`\nMaster document to retain: ID ${primaryDoc.id} (code: ${primaryDoc.code})`);
  console.log(`Split documents to merge and delete (${docsToDelete.length}):`, docsToDelete.map(d => `${d.id} (${d.code})`));

  // Consolidate all lines and phases
  const allItems = [];
  const allPhases = [];
  const combinedVolumes = [];
  const combinedPosologies = [];

  // Sort documents: 03505, 03505-1, 03505-2, etc.
  matched.sort((a, b) => {
    const codeA = String(a.code || '');
    const codeB = String(b.code || '');
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  });

  matched.forEach((doc, idx) => {
    const lines = Array.isArray(doc.prescriptionLines) && doc.prescriptionLines.length > 0
      ? doc.prescriptionLines
      : (Array.isArray(doc.items) ? doc.items : []);

    lines.forEach(l => {
      allItems.push({
        ...l,
        formulationIndex: idx + 1,
        formulationBlock: doc.treatmentType || l.formulationBlock || `Phase ${idx + 1}`
      });
    });

    const vol = doc.volume || doc.blockVolume;
    if (vol && !combinedVolumes.includes(vol)) combinedVolumes.push(vol);

    const pos = doc.posology || doc.instructions;
    if (pos) {
      combinedPosologies.push(`[Phase ${idx + 1}: ${doc.treatmentType || 'Formulation'}]: ${pos}`);
    }

    allPhases.push({
      id: `phase-${idx + 1}`,
      phaseNumber: idx + 1,
      phaseName: doc.treatmentType || `Phase ${idx + 1}`,
      dispensingForm: doc.dispensingForm || 'Magistral Formulation',
      volume: vol || '100 mL',
      posology: pos || '',
      items: lines
    });
  });

  const masterCode = '03505';

  const consolidatedUpdate = {
    code: masterCode,
    rxCode: masterCode,
    prescriptionNumber: masterCode,
    isMultiPart: true,
    totalParts: matched.length,
    phases: allPhases,
    prescriptionLines: allItems,
    items: allItems,
    volume: combinedVolumes.join(' + ') || primaryDoc.volume || '',
    posology: combinedPosologies.join('\n\n') || primaryDoc.posology || '',
    treatmentType: matched.map(d => d.treatmentType).filter(Boolean).join(' + ') || primaryDoc.treatmentType || 'Compounded Formula',
    patientName: 'Poorna Sindhu Jetty',
    // Doctor auto-link to Dr. Sobia Mirza
    doctorId: 'dr-sobia',
    doctorSlug: 'dr-sobia',
    doctorName: 'Dr. Sobia Mirza',
    doctorLicense: 'DHA Registered',
    clinicName: 'My London Skin Clinic',
    clinicId: 'IdDU1oK1VuAVVYrGz6E7',
    doctor: {
      id: 'dr-sobia',
      name: 'Dr. Sobia Mirza',
      displayName: 'Dr. Sobia Mirza',
      license: 'DHA Registered',
      clinic: 'My London Skin Clinic',
      clinicName: 'My London Skin Clinic'
    },
    updatedAt: new Date().toISOString()
  };

  console.log('\nUpdating master document in Firestore...');
  await db.collection('prescriptions').doc(primaryDoc.id).set(consolidatedUpdate, { merge: true });
  console.log(`✅ Master document ${primaryDoc.id} updated with ${allPhases.length} phases and Dr. Sobia Mirza assigned.`);

  console.log('\nDeleting redundant split documents...');
  for (const doc of docsToDelete) {
    await db.collection('prescriptions').doc(doc.id).delete();
    console.log(`🗑️ Deleted split document: ${doc.id} (code: ${doc.code})`);
  }

  console.log('\n🎉 Consolidation complete! Only single master prescription 03505 remains.');
}

run().catch(err => {
  console.error('Fatal error during consolidation:', err);
  process.exit(1);
});

