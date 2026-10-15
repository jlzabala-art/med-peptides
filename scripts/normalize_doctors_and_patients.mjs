/**
 * scripts/normalize_doctors_and_patients.mjs
 *
 * Normalizes doctors and patients in Firestore:
 * 1. Ensures all 16 doctors in `users` have `role: 'doctor'`, `roles: ['doctor']`, and `isDoctor: true`.
 * 2. Enriches patients in `patients` and `users` (role=patient) with their real physician, physicianId,
 *    clinic, clinicName, doctorId derived from prescriptions, lab results, or doctor profiles.
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saPath = path.resolve(__dirname, '../serviceAccount-target.json');
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}

const db = admin.firestore();

function normalizeName(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

async function run() {
  console.log('🚀 [Normalization] Starting Doctor and Patient enrichment...\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. NORMALIZE ALL DOCTORS IN `users`
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Step 1: Normalizing Doctors in `users` collection ---');
  const allUsersSnap = await db.collection('users').get();
  const doctorMap = new Map();
  let updatedDoctorsCount = 0;

  for (const doc of allUsersSnap.docs) {
    const data = doc.data();
    const isDoc = data.role === 'doctor' || (Array.isArray(data.roles) && data.roles.includes('doctor')) || data.isDoctor;
    if (isDoc) {
      const currentRoles = Array.isArray(data.roles) ? data.roles : [];
      const newRoles = Array.from(new Set([...currentRoles, 'doctor']));
      
      const updates = {
        role: 'doctor',
        roles: newRoles,
        isDoctor: true,
        updatedAt: new Date().toISOString()
      };

      // Fill known clinics if missing
      if (!data.clinic && !data.clinicName) {
        if (doc.id === 'raffanie-lucenio') updates.clinic = 'The Masters Medical Center';
        else if (doc.id === 'z3aUIMaYsPViG1JgM95r') updates.clinic = 'Shamma Clinic by Novomed LLC';
      }
      if (updates.clinic && !data.clinicName) updates.clinicName = updates.clinic;
      if (data.clinicName && !data.clinic) updates.clinic = data.clinicName;

      await doc.ref.update(updates);
      updatedDoctorsCount++;

      const resolvedName = data.name || data.displayName || 'Doctor';
      const resolvedClinic = updates.clinic || data.clinic || data.clinicName || 'Affiliated Clinical Center';

      doctorMap.set(doc.id, {
        id: doc.id,
        name: resolvedName,
        clinic: resolvedClinic
      });
      console.log(`  ✅ Doctor normalized: ${doc.id} -> ${resolvedName} (${resolvedClinic})`);
    }
  }
  console.log(`✨ Total doctors normalized: ${updatedDoctorsCount}\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. BUILD PRESCRIPTIONS & LABS LOOKUP MAPS
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Step 2: Indexing Prescriptions and Lab Results ---');
  const [rxSnap, labSnap] = await Promise.all([
    db.collection('prescriptions').get(),
    db.collection('lab_results').get()
  ]);

  const clinicalMapByName = new Map(); // normalized patient name -> { doctorName, doctorId, clinicName, clinicId }
  const clinicalMapById = new Map();   // patientId -> { doctorName, doctorId, clinicName, clinicId }

  rxSnap.forEach(doc => {
    const d = doc.data();
    const pName = normalizeName(d.patientName || d.patient?.name);
    const pId = d.patientId || d.patient?.id;
    const docName = d.doctorName || d.doctor?.name || '';
    const docId = d.doctorId || d.doctor?.id || '';
    const clinic = d.clinicName || d.clinic || d.doctor?.clinicName || '';
    const clinicId = d.clinicId || d.doctor?.clinicId || '';

    if (docName || clinic) {
      const info = { docName, docId, clinic, clinicId };
      if (pName && !clinicalMapByName.has(pName)) clinicalMapByName.set(pName, info);
      if (pId && !clinicalMapById.has(pId)) clinicalMapById.set(pId, info);
    }
  });

  labSnap.forEach(doc => {
    const d = doc.data();
    const pName = normalizeName(d.patientName || d.patient?.name);
    const pId = d.patientId || d.patient?.id;
    const docName = d.doctorName || '';
    const docId = d.doctorId || '';
    const clinic = d.clinicName || '';
    const clinicId = d.clinicId || '';

    if (docName || clinic) {
      const info = { docName, docId, clinic, clinicId };
      if (pName && !clinicalMapByName.has(pName)) clinicalMapByName.set(pName, info);
      if (pId && !clinicalMapById.has(pId)) clinicalMapById.set(pId, info);
    }
  });
  console.log(`✨ Indexed clinical records for ${clinicalMapByName.size} unique patient names.\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. ENRICH `patients` COLLECTION
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Step 3: Enriching `patients` Collection ---');
  const patientsSnap = await db.collection('patients').get();
  let updatedPatientsCount = 0;

  for (const doc of patientsSnap.docs) {
    const p = doc.data();
    const pNameNorm = normalizeName(p.name || p.fullName);
    const clinical = clinicalMapById.get(doc.id) || clinicalMapByName.get(pNameNorm) || {};

    // Current values
    let physician = p.physician || p.doctorName || clinical.docName || '';
    let physicianId = p.physicianId || p.doctorId || clinical.docId || '';
    let clinic = p.clinic || p.clinicName || p.doctorClinic || clinical.clinic || '';
    let clinicId = p.clinicId || clinical.clinicId || '';

    // If we have physicianId but no physician name, look up doctor
    if (physicianId && !physician && doctorMap.has(physicianId)) {
      physician = doctorMap.get(physicianId).name;
    }
    // If we have physician but no clinic, look up doctor's clinic
    if (physicianId && !clinic && doctorMap.has(physicianId)) {
      clinic = doctorMap.get(physicianId).clinic;
    }

    // Default clinic for Dr. Çağatay Sezgin if needed
    if (physician.toLowerCase().includes('sezgin') && !clinic) {
      clinic = 'Hortman Clinics';
    }
    // Default clinic for Dr. Raffanie Lucenio if needed
    if (physician.toLowerCase().includes('raffanie') && !clinic) {
      clinic = 'The Masters Medical Center';
      physicianId = 'raffanie-lucenio';
    }

    const updates = {};
    if (physician && p.physician !== physician) updates.physician = physician;
    if (physician && p.doctorName !== physician) updates.doctorName = physician;
    if (physicianId && p.physicianId !== physicianId) updates.physicianId = physicianId;
    if (physicianId && p.doctorId !== physicianId) updates.doctorId = physicianId;
    if (clinic && p.clinic !== clinic) updates.clinic = clinic;
    if (clinic && p.clinicName !== clinic) updates.clinicName = clinic;
    if (clinicId && p.clinicId !== clinicId) updates.clinicId = clinicId;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await doc.ref.update(updates);
      updatedPatientsCount++;
      console.log(`  ✅ Patient updated: ${doc.id} (${p.name || p.fullName}) -> Dr: ${physician} | Clinic: ${clinic}`);
    }
  }
  console.log(`✨ Total patients enriched: ${updatedPatientsCount}\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. ENRICH `users` COLLECTION (role=patient)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Step 4: Enriching `users` (role=patient) Collection ---');
  const userPatientsSnap = await db.collection('users').where('role', '==', 'patient').get();
  let updatedUsersCount = 0;

  for (const doc of userPatientsSnap.docs) {
    const u = doc.data();
    const uNameNorm = normalizeName(u.name || `${u.firstName || ''} ${u.lastName || ''}`);
    const clinical = clinicalMapById.get(doc.id) || clinicalMapByName.get(uNameNorm) || {};

    let physician = u.physician || u.doctorName || clinical.docName || '';
    let physicianId = u.physicianId || u.doctorId || clinical.docId || '';
    let clinic = u.clinic || u.clinicName || clinical.clinic || '';

    // If physicianId but no physician name, look up doctor
    if (physicianId && !physician && doctorMap.has(physicianId)) {
      physician = doctorMap.get(physicianId).name;
    }
    // If physicianId but no clinic, look up doctor clinic
    if (physicianId && !clinic && doctorMap.has(physicianId)) {
      clinic = doctorMap.get(physicianId).clinic;
    }

    // Default clinic for Dr. Çağatay Sezgin if needed
    if (physician.toLowerCase().includes('sezgin') && !clinic) {
      clinic = 'Hortman Clinics';
    }
    // Default clinic for Dr. Raffanie Lucenio if needed
    if (physician.toLowerCase().includes('raffanie') && !clinic) {
      clinic = 'The Masters Medical Center';
      physicianId = 'raffanie-lucenio';
    }

    const updates = {};
    if (physician && u.physician !== physician) updates.physician = physician;
    if (physician && u.doctorName !== physician) updates.doctorName = physician;
    if (physicianId && u.physicianId !== physicianId) updates.physicianId = physicianId;
    if (clinic && u.clinic !== clinic) updates.clinic = clinic;
    if (clinic && u.clinicName !== clinic) updates.clinicName = clinic;

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date().toISOString();
      await doc.ref.update(updates);
      updatedUsersCount++;
      console.log(`  ✅ User (patient) updated: ${doc.id} (${u.name || u.firstName}) -> Dr: ${physician} | Clinic: ${clinic}`);
    }
  }
  console.log(`✨ Total user patients enriched: ${updatedUsersCount}\n`);

  console.log('🎉 Normalization complete!');
}

run().catch(console.error);
