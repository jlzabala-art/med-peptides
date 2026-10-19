/**
 * scripts/update_london_clinic_distributor_mediluxe.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates distributor for My London Skin Clinic to "Mediluxe Health Solutions"
 * across:
 *  1. Wholesalers collection (`wholesalers/mediluxe-health-solutions`)
 *  2. Clinic document (`clinics/IdDU1oK1VuAVVYrGz6E7`)
 *  3. All patients belonging to London Clinic
 *  4. All prescriptions belonging to London Clinic
 *  5. All lab_results belonging to London Clinic
 * ─────────────────────────────────────────────────────────────────────────────
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sa = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../serviceAccount-target.json'), 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}

const db = admin.firestore();

async function updateDistributor() {
  console.log('🚀 [Update Distributor] Setting Mediluxe Health Solutions for all London Clinic records...');

  const wholesalerId = 'mediluxe-health-solutions';
  const wholesellerName = 'Mediluxe Health Solutions';
  const wholesellerShort = 'Mediluxe Health Solutions';

  // 1. Ensure wholesalers/mediluxe-health-solutions document exists
  const wsRef = db.collection('wholesalers').doc(wholesalerId);
  await wsRef.set({
    id: wholesalerId,
    name: wholesellerName,
    legalName: 'Mediluxe Health Solutions FZE',
    companyName: wholesellerName,
    country: 'United Arab Emirates',
    countryCode: 'AE',
    city: 'Dubai',
    currency: 'AED',
    status: 'active',
    type: 'compounding_and_distributor',
    description: 'Primary Compounding & Wholeseller Partner (UAE)',
    zoho_org_id: '662274409',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`✅ [1/5] Wholesaler registered: ${wholesalerId}`);

  // 2. Update Clinic IdDU1oK1VuAVVYrGz6E7
  const clinicRef = db.collection('clinics').doc('IdDU1oK1VuAVVYrGz6E7');
  await clinicRef.update({
    wholesalerId: wholesalerId,
    wholeseller: wholesellerShort,
    wholesellerName: wholesellerName,
    distributor: wholesellerName,
    distributorName: wholesellerName,
    distributorId: wholesalerId,
    updatedAt: new Date().toISOString()
  });
  console.log(`✅ [2/5] Clinic updated: IdDU1oK1VuAVVYrGz6E7 (My London Skin Clinic)`);

  // 3. Update Patients
  const patientsSnap = await db.collection('patients').get();
  let patCount = 0;
  const patBatch = db.batch();

  patientsSnap.docs.forEach(doc => {
    const d = doc.data();
    if (d.clinicId === 'IdDU1oK1VuAVVYrGz6E7' ||
        (d.clinicName && d.clinicName.toLowerCase().includes('london')) ||
        d.doctorId === 'dr-sobia' ||
        (d.doctorName && d.doctorName.toLowerCase().includes('sobia'))) {
      patBatch.update(doc.ref, {
        wholesalerId: wholesalerId,
        wholeseller: wholesellerShort,
        wholesellerName: wholesellerName,
        distributor: wholesellerName,
        distributorName: wholesellerName,
        distributorId: wholesalerId,
        updatedAt: new Date().toISOString()
      });
      patCount++;
    }
  });

  if (patCount > 0) {
    await patBatch.commit();
  }
  console.log(`✅ [3/5] Patients updated to Mediluxe: ${patCount}`);

  // 4. Update Prescriptions
  const rxSnap = await db.collection('prescriptions').get();
  let rxCount = 0;
  const rxBatch = db.batch();

  rxSnap.docs.forEach(doc => {
    const d = doc.data();
    if (d.clinicId === 'IdDU1oK1VuAVVYrGz6E7' ||
        (d.clinicName && d.clinicName.toLowerCase().includes('london')) ||
        d.doctorId === 'dr-sobia' ||
        (d.doctorName && d.doctorName.toLowerCase().includes('sobia'))) {
      rxBatch.update(doc.ref, {
        wholesalerId: wholesalerId,
        wholeseller: wholesellerShort,
        wholesellerName: wholesellerName,
        distributor: wholesellerName,
        distributorName: wholesellerName,
        distributorId: wholesalerId,
        updatedAt: new Date().toISOString()
      });
      rxCount++;
    }
  });

  if (rxCount > 0) {
    await rxBatch.commit();
  }
  console.log(`✅ [4/5] Prescriptions updated to Mediluxe: ${rxCount}`);

  // 5. Update Lab Results
  const labSnap = await db.collection('lab_results').get();
  let labCount = 0;
  const labBatch = db.batch();

  labSnap.docs.forEach(doc => {
    const d = doc.data();
    if (d.clinicId === 'IdDU1oK1VuAVVYrGz6E7' ||
        (d.clinicName && d.clinicName.toLowerCase().includes('london')) ||
        d.doctorId === 'dr-sobia' ||
        (d.doctorName && d.doctorName.toLowerCase().includes('sobia'))) {
      labBatch.update(doc.ref, {
        wholesalerId: wholesalerId,
        wholeseller: wholesellerShort,
        wholesellerName: wholesellerName,
        distributor: wholesellerName,
        distributorName: wholesellerName,
        distributorId: wholesalerId,
        updatedAt: new Date().toISOString()
      });
      labCount++;
    }
  });

  if (labCount > 0) {
    await labBatch.commit();
  }
  console.log(`✅ [5/5] Lab Results updated to Mediluxe: ${labCount}`);

  console.log(`\n🎉 [Distributor Update Complete] Successfully set Mediluxe Health Solutions for all London Clinic records!`);
}

updateDistributor().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error updating distributor:', err);
  process.exit(1);
});
