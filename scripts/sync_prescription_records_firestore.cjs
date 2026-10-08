/**
 * scripts/sync_prescription_records_firestore.cjs
 *
 * Synchronizes Firestore prescription records with verbatim clinical prescription source data
 * for:
 *   1. RX-51857-A (Amna Sultan - Phase 1: Ubiquinol + Saw Palmetto, 60 caps, 2 months)
 *   2. RX-51857-B (Amna Sultan - Phase 2: Red Yeast Rice + Berberine + Citrus Bergamot + Chromium, 120 caps, 2 months)
 *   3. RX-BOX03483AATRI (Mohammed Ahmad Aishehhi - Dr. Sezgin Cagatay, Hortman Clinics, 100 mL TrichoSol)
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const saPath = path.resolve(__dirname, '../serviceAccount-target.json');
if (!fs.existsSync(saPath)) {
  console.error('Service account not found at', saPath);
  process.exit(1);
}
const sa = require(saPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}

const db = admin.firestore();

async function runSync() {
  console.log('🔄 [Firestore Sync] Updating prescription records...');

  // 1. RX-51857-A
  const rx51857ARef = db.collection('prescriptions').doc('RX-51857-A');
  await rx51857ARef.set({
    date: '23/09/2026',
    prescriptionDate: '23/09/2026',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctor: {
      name: 'Dr. Marina Cordeiro Fernandes',
      license: 'DHA-91105367',
      specialty: 'Aesthetic & Anti-Aging Medicine'
    },
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    clinic: 'NOVA Plastic Surgery Clinic, Dubai',
    duration: '2 months',
    quantity: '60 capsules (2 Months)',
    volume: '60 capsules (2 Months)',
    posology: {
      regimen: 'Take 1 dose once daily with breakfast.',
      timing: 'Morning with breakfast',
      notes: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 2 months.'
    },
    dosageInstructions: 'Take 1 dose once daily with breakfast.',
    mfgDate: '05-10-2026',
    expDate: '04-10-2027',
    batchCode: 'PHARM-2026-UBISWP',
    batchNumber: 'PHARM-2026-UBISWP',
    lote: '2609-AMN1',
    storageInstructions: 'Store in a cool dry place',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    vehicle: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Updated RX-51857-A');

  // 2. RX-51857-B
  const rx51857BRef = db.collection('prescriptions').doc('RX-51857-B');
  await rx51857BRef.set({
    date: '23/09/2026',
    prescriptionDate: '23/09/2026',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctor: {
      name: 'Dr. Marina Cordeiro Fernandes',
      license: 'DHA-91105367',
      specialty: 'Aesthetic & Anti-Aging Medicine'
    },
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    clinic: 'NOVA Plastic Surgery Clinic, Dubai',
    duration: '2 months',
    quantity: '120 capsules (2 Months)',
    volume: '120 capsules (2 Months)',
    posology: {
      regimen: 'Take 1 dose with lunch and 1 dose with dinner.',
      timing: 'With lunch and with dinner (twice daily)',
      notes: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 2 months.'
    },
    dosageInstructions: 'Take 1 dose with lunch and 1 dose with dinner.',
    mfgDate: '05-10-2026',
    expDate: '04-10-2027',
    batchCode: 'PHARM-2026-RYRBER',
    batchNumber: 'PHARM-2026-RYRBER',
    lote: '2609-AMN2',
    storageInstructions: 'Store in a cool dry place',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    vehicle: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Updated RX-51857-B');

  // 3. RX-BOX03483AATRI
  const rxAishehhiRef = db.collection('prescriptions').doc('RX-BOX03483AATRI');
  await rxAishehhiRef.set({
    doctorName: 'Dr. Sezgin Cagatay',
    doctor: {
      name: 'Dr. Sezgin Cagatay',
      license: 'DHA-00013060-006',
      specialty: 'Hair Restoration & Trichology'
    },
    clinicName: 'Hortman Clinics, Dubai',
    clinic: 'Hortman Clinics, Dubai',
    posology: {
      regimen: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
      timing: 'At night before bedtime',
      notes: 'TrichoSol™ patented hydrophilic vehicle. Leave on scalp for as long as possible; wash the next day.',
      summary: 'Apply at night before bedtime. Leave on scalp for as long as possible. Wash scalp next day.'
    },
    dosageInstructions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    duration: '3 months (3 bottles x 100 mL)',
    quantity: '100 mL topical solution in TrichoSol™',
    volume: '100 mL',
    mfgDate: '05-10-2026',
    expDate: '04-10-2027',
    batchCode: 'PHARM-2026-TRICHO-BOX03483',
    batchNumber: 'PHARM-2026-TRICHO-BOX03483',
    lote: '2609-AIS1',
    storageInstructions: 'Store in a cool dry place',
    pharmacy: 'Pharmapolis Compounding Pharmacy',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Updated RX-BOX03483AATRI');

  console.log('🎉 [Firestore Sync] All records synchronized successfully!');
}

runSync().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error during Firestore sync:', err);
  process.exit(1);
});
