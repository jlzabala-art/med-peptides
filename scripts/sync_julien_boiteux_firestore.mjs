import { db } from './lib/firebase-admin.mjs';

async function syncJulienBoiteux() {
  console.log('🔄 [Firestore Sync] Updating Julien Boiteux prescription records...');

  const updatePayload = {
    patientName: 'Julien Boiteux',
    boxId: 'BOX03529AATRI',
    fileNumber: 'BOX03529AATRI',
    sourceFile: 'BOX03529AATRI_Julien Boiteux-signed.pdf',
    doctorName: 'Dr. Sezgin Cagatay',
    doctor: {
      name: 'Dr. Sezgin Cagatay',
      displayName: 'Dr. Sezgin Cagatay',
      license: 'DHA-00013060-006',
      clinic: 'Hortman Clinics, Dubai',
      clinicName: 'Hortman Clinics, Dubai',
      specialty: 'Hair Restoration & Trichology',
      title: 'Hair Restoration & Trichology Specialist',
      email: 'sezgin@hortmanclinics.com'
    },
    treatingDoctor: {
      name: 'Dr. Sezgin Cagatay',
      license: 'DHA-00013060-006',
      clinic: 'Hortman Clinics, Dubai'
    },
    clinicName: 'Hortman Clinics, Dubai',
    clinic: 'Hortman Clinics, Dubai',
    mfgDate: '05-10-2026',
    expDate: '04-10-2027',
    prodDate: '05-10-2026',
    expiryDate: '04-10-2027',
    dateIssued: '05-10-2026',
    batchCode: 'PHARM-2026-TRI-BOX03529',
    batchNumber: 'PHARM-2026-TRI-BOX03529',
    lote: '2609-JB1',
    storageInstructions: 'Store at room temperature',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    updatedAt: new Date().toISOString()
  };

  // 1. Update doc RX-BOX03529AATRI
  const rxDocRef1 = db.collection('prescriptions').doc('RX-BOX03529AATRI');
  const doc1 = await rxDocRef1.get();
  if (doc1.exists) {
    const d1 = doc1.data();
    // Update compoundingPhases if present
    const updatedPhases = (d1.compoundingPhases || []).map(cp => ({
      ...cp,
      prodDate: '05-10-2026',
      expDate: '04-10-2027',
      doctorName: 'Dr. Sezgin Cagatay',
      doctorLicense: 'DHA-00013060-006',
      clinicName: 'Hortman Clinics, Dubai'
    }));

    await rxDocRef1.set({
      ...updatePayload,
      code: 'BOX03529AATRI',
      prescriptionNumber: 'BOX03529AATRI',
      ...(updatedPhases.length > 0 ? { compoundingPhases: updatedPhases } : {})
    }, { merge: true });
    console.log('✅ Updated RX-BOX03529AATRI in Firestore');
  } else {
    console.log('⚠️ RX-BOX03529AATRI not found, creating it...');
    await rxDocRef1.set({
      ...updatePayload,
      id: 'RX-BOX03529AATRI',
      code: 'BOX03529AATRI',
      prescriptionNumber: 'BOX03529AATRI',
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log('✅ Created RX-BOX03529AATRI in Firestore');
  }

  // 2. Update doc RjWfjDYb7BAzyOF9Uuqu
  const rxDocRef2 = db.collection('prescriptions').doc('RjWfjDYb7BAzyOF9Uuqu');
  const doc2 = await rxDocRef2.get();
  if (doc2.exists) {
    await rxDocRef2.set({
      ...updatePayload,
      code: doc2.data().code || 'RX-20261001-16AD'
    }, { merge: true });
    console.log('✅ Updated RjWfjDYb7BAzyOF9Uuqu in Firestore');
  }

  // Also check if any other document for Julien Boiteux exists
  const allJulien = await db.collection('prescriptions').where('patientName', '==', 'Julien Boiteux').get();
  console.log(`📋 Total Julien Boiteux documents in Firestore: ${allJulien.size}`);
  allJulien.forEach(d => {
    const data = d.data();
    console.log(` - Doc ${d.id}: code=${data.code}, doctor=${data.doctorName}, mfg=${data.mfgDate}, exp=${data.expDate}`);
  });

  console.log('🎉 [Firestore Sync] Completed successfully!');
}

syncJulienBoiteux().catch(err => {
  console.error('❌ Error syncing Julien Boiteux:', err);
  process.exit(1);
});
