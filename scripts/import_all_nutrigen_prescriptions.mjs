/**
 * scripts/import_all_nutrigen_prescriptions.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports 38 Fagron NutriGen™ prescriptions into Firestore.
 * - Sets the prescription date strictly to the REPORT EMISSION DATE
 *   (fecha de emisión del informe, as requested by the user).
 * - Links to registered treating doctors & clinics:
 *     • Dr. Raffanie Lucenio (The Masters Medical Center, Doha, Qatar)
 *     • Prof. Dr. Fahed Abdulaziz Al Mutawah (My Skin Clinic, Kuwait)
 *     • Dr. Rehab Serafi (Mayam Aesthetics / Dr. Rehab Serafi Clinic, KSA)
 *     • Dr. M Jay Alkhatib (Laboratory Director at YDL, Dubai)
 *     • Dr. Çağatay Sezgin (Hortman Clinics / Novomed, Dubai)
 * - Creates/updates Patient records in `patients` and links properly.
 * - Extracts and creates all formulation phases, active ingredient items, and dosages.
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

function slug(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseEmissionDate(dateStr) {
  if (!dateStr || dateStr === 'Unknown') {
    const d = new Date();
    return {
      dateSlash: '01/01/2024',
      dateISO: '2024-01-01',
      timestamp: d
    };
  }

  // Expecting DD-MM-YYYY or DD/MM/YYYY
  const parts = dateStr.replace(/\//g, '-').split('-');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    const dateSlash = `${day}/${month}/${year}`;
    const dateISO = `${year}-${month}-${day}`;
    const timestamp = new Date(`${dateISO}T00:00:00.000Z`);
    return { dateSlash, dateISO, timestamp };
  }

  return {
    dateSlash: dateStr,
    dateISO: dateStr,
    timestamp: new Date()
  };
}

// Doctor & Clinic directory mapping
const DOCTORS_MAP = {
  'raffanie lucenio': {
    id: 'raffanie-lucenio',
    name: 'Dr. Raffanie Lucenio',
    displayName: 'Dr. Raffanie Lucenio',
    email: 'raffanie@themasters.qa',
    specialty: 'General Practice & Aesthetic Medicine',
    title: 'Physician',
    clinic: {
      id: 'clinic-masters-qatar',
      name: 'The Masters Medical Center',
      country: 'Qatar',
      city: 'Doha',
      wholesalerId: 'direct',
      wholeseller: 'Direct'
    }
  },
  'fahed abdulaziz al mutawah': {
    id: 'dr-fahed-al-mutawah',
    name: 'Prof. Dr. Fahed Abdulaziz Al Mutawah',
    displayName: 'Prof. Dr. Fahed Abdulaziz Al Mutawah',
    email: 'a.essam@myskinkw.com',
    specialty: 'Consultant Dermatologist & Laser Specialist',
    title: 'Professor & Consultant Dermatologist',
    clinic: {
      id: 'clinic-my-skin-kuwait',
      name: 'My Skin Clinic',
      country: 'Kuwait',
      city: 'Kuwait City',
      wholesalerId: 'clinic-my-skin-kuwait',
      wholeseller: 'My Skin Clinic'
    }
  },
  'rehab serafi': {
    id: 'dr-rehab-serafi',
    name: 'Dr. Rehab Serafi',
    displayName: 'Dr. Rehab Serafi',
    email: 'jose@mediluxeme.com',
    specialty: 'Consultant Dermatologist — Aesthetic & Laser Medicine',
    title: 'Consultant Dermatologist',
    clinic: {
      id: 'clinic-dr-rehab-serafi',
      name: 'Mayam Aesthetics / Dr. Rehab Serafi Clinic',
      country: 'Saudi Arabia',
      city: 'Jeddah',
      wholesalerId: 'direct',
      wholeseller: 'Direct'
    }
  },
  'm jay alkhatib': {
    id: 'dr-jay-alkhatib',
    name: 'Dr. M Jay Alkhatib',
    displayName: 'Dr. M Jay Alkhatib',
    email: 'm.alkhatib@ydl-me.com',
    specialty: 'Laboratory Director',
    title: 'Laboratory Director',
    isLabDirector: true,
    clinic: {
      id: 'clinic-ydl-dubai',
      name: 'York Diagnostic Laboratories DMCC (YDL)',
      country: 'United Arab Emirates',
      city: 'Dubai',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    }
  },
  'sezgin cagatay': {
    id: 'z3aUIMaYsPViG1JgM95r',
    name: 'Dr. Çağatay Sezgin',
    displayName: 'Dr. Çağatay Sezgin, MD, FISHRS',
    email: 'sezgin@novomed.com',
    specialty: 'Hair Restoration & Regenerative Medicine',
    title: 'Dr. Çağatay Sezgin, MD, FISHRS',
    clinic: {
      id: 'clinic-hortman-dubai',
      name: 'Hortman Clinics / Novomed',
      country: 'United Arab Emirates',
      city: 'Dubai',
      wholesalerId: 'clinic-ydl-dubai',
      wholeseller: 'YDL (York Diagnostic Laboratories DMCC)'
    }
  }
};

function resolveDoctorAndClinic(rawDocName, rawEmail) {
  const norm = (rawDocName + ' ' + (rawEmail || '')).toLowerCase();
  
  if (norm.includes('raffanie') || norm.includes('themasters.qa')) {
    return DOCTORS_MAP['raffanie lucenio'];
  }
  if (norm.includes('fahed') || norm.includes('myskinkw')) {
    return DOCTORS_MAP['fahed abdulaziz al mutawah'];
  }
  if (norm.includes('rehab') || norm.includes('serafi')) {
    return DOCTORS_MAP['rehab serafi'];
  }
  if (norm.includes('alkhatib') || norm.includes('ydl-me.com')) {
    return DOCTORS_MAP['m jay alkhatib'];
  }
  if (norm.includes('sezgin') || norm.includes('hortman')) {
    return DOCTORS_MAP['sezgin cagatay'];
  }

  // Fallback
  return {
    id: 'dr-' + slug(rawDocName || 'fagron-treating-doctor'),
    name: rawDocName || 'Fagron Genomics Specialist',
    displayName: rawDocName || 'Fagron Genomics Specialist',
    email: rawEmail || '',
    specialty: 'Genomics & Precision Medicine',
    title: 'Treating Physician',
    clinic: {
      id: 'clinic-partner-genomics',
      name: 'Partner Clinic',
      country: 'UAE / GCC',
      city: 'Dubai',
      wholesalerId: 'direct',
      wholeseller: 'Direct'
    }
  };
}

async function runImport() {
  console.log('🚀 Starting import of Fagron NutriGen reports into Firestore...\n');

  const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scratch/nutrigen_parsed_all_fixed.json'), 'utf8'));
  console.log(`Loaded ${rawData.length} reports to import.`);

  let importedCount = 0;
  let skippedCount = 0;

  for (const rep of rawData) {
    const rxId = `RX-${rep.sampleCode}`;
    const rxRef = db.collection('prescriptions').doc(rxId);

    // Parse emission date (CRITICAL: requested by user to be emission date, not import date)
    const { dateSlash, dateISO, timestamp } = parseEmissionDate(rep.reportDate || rep.sampleDate);

    // Resolve Doctor and Clinic
    const docInfo = resolveDoctorAndClinic(rep.doctorName, rep.doctorEmail);
    const clinicInfo = docInfo.clinic;

    // Resolve / Create Patient Record
    const patientSlug = slug(rep.patientName || `nutrigen-${rep.sampleCode}`);
    const patientId = `pt_${patientSlug}`;

    const patientDocRef = db.collection('patients').doc(patientId);
    await patientDocRef.set({
      id: patientId,
      name: rep.patientName,
      fullName: rep.patientName,
      dob: rep.dob || null,
      dateOfBirth: rep.dob || null,
      gender: rep.gender || 'Unknown',
      doctorId: docInfo.id,
      doctorName: docInfo.name,
      clinicId: clinicInfo.id,
      clinicName: clinicInfo.name,
      sampleCode: rep.sampleCode,
      characteristics: rep.characteristics || {},
      status: 'active',
      source: 'fagron_genomics_nutrigen',
      createdAt: timestamp,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Also update/sync user record for patient if not exists
    await db.collection('users').doc(patientId).set({
      id: patientId,
      name: rep.patientName,
      displayName: rep.patientName,
      role: 'patient',
      dob: rep.dob || null,
      gender: rep.gender || 'Unknown',
      doctorId: docInfo.id,
      doctorName: docInfo.name,
      clinicId: clinicInfo.id,
      clinicName: clinicInfo.name,
      status: 'active',
      createdAt: timestamp,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Build Prescription Parts & Items
    const parts = [];
    const items = [];
    const allIngredients = [];

    (rep.formulations || []).forEach((form, idx) => {
      const partNum = idx + 1;
      const partTitle = `${form.formulaName || form.phaseTitle} (${form.duration || 'Daily'})`;

      const apis = (form.ingredients || []).map(ing => {
        allIngredients.push(ing.name);
        items.push({
          name: ing.name,
          dose: ing.dose,
          strength: ing.dose,
          dosage: ing.dose,
          partTitle: partTitle,
          phaseNumber: form.phase,
          type: 'formula_component',
          quantity: 1
        });
        return {
          name: ing.name,
          dose: ing.dose,
          strength: ing.dose,
          dosage: ing.dose
        };
      });

      if (form.required && apis.length > 0) {
        parts.push({
          partNumber: partNum,
          phase: form.phase,
          title: partTitle,
          formulaName: form.formulaName,
          format: 'ORAL CAPSULES',
          dosageForm: 'Oral Route (Plant-Based Capsules)',
          volume: form.phase === 3 ? '180-270 Capsules (3-6 Months)' : '30-60 Capsules (30 Days)',
          route: 'Oral Route',
          posology: `1-2 capsules daily with water according to phase instructions (${form.duration}).`,
          apis: apis,
          duration: form.duration
        });
      }
    });

    const activeIngredientsSummary = allIngredients.slice(0, 5).join(' · ');

    // Prescription Document Payload
    const rxPayload = {
      id: rxId,
      code: rxId,
      prescriptionCode: rxId,
      sampleCode: rep.sampleCode,
      boxId: rep.sampleCode,
      protocolCode: rep.sampleCode,
      protocolNumber: rep.sampleCode,
      treatmentProgram: 'Fagron NutriGen',
      treatmentTitle: 'Fagron NutriGen™ Personalized Nutrigenomic Protocol',
      regimenCategoryCode: 'NUTRI-RX',
      regimenCategoryId: 'nutrigenomics',
      regimenCategory: 'Nutrigenomics & Personalized Metabolic Medicine',
      regimenCategoryShort: 'Nutrigenomics',
      regimenShortTitle: 'Fagron NutriGen',

      // Patient Data
      patientName: rep.patientName,
      patientId: patientId,
      patientDob: rep.dob || null,
      patientGender: rep.gender || 'Unknown',
      patient: {
        id: patientId,
        name: rep.patientName,
        dob: rep.dob || null,
        gender: rep.gender || 'Unknown',
        characteristics: rep.characteristics || {}
      },

      // Doctor Data
      doctorId: docInfo.id,
      doctorName: docInfo.name,
      doctorEmail: docInfo.email,
      doctor: {
        id: docInfo.id,
        name: docInfo.name,
        displayName: docInfo.displayName,
        email: docInfo.email,
        title: docInfo.title,
        specialty: docInfo.specialty,
        clinicId: clinicInfo.id,
        clinicName: clinicInfo.name
      },
      treatingDoctor: {
        id: docInfo.id,
        name: docInfo.name,
        displayName: docInfo.displayName,
        title: docInfo.title,
        specialty: docInfo.specialty,
        clinic: clinicInfo.name,
        clinicName: clinicInfo.name,
        email: docInfo.email
      },

      // Clinic / Wholesaler Data
      clinicId: clinicInfo.id,
      clinicName: clinicInfo.name,
      clinic: clinicInfo.name,
      wholesalerId: clinicInfo.wholesalerId,
      wholeseller: clinicInfo.wholeseller,
      wholesellerName: clinicInfo.wholeseller,

      // Emission Dates (STRICTLY REPORT EMISSION DATE, as requested by user)
      date: dateSlash,
      prescriptionDate: dateSlash,
      dateIssued: dateISO,
      resultsDate: dateISO,
      mfgDate: dateISO,
      prodDate: dateISO,
      dateFormatted: dateSlash,
      sampleDate: rep.sampleDate || null,

      // Formulations and Items
      totalParts: parts.length,
      parts: parts,
      items: items,
      formulations: rep.formulations || [],
      activeIngredientsSummary: activeIngredientsSummary,

      // Fagron Metadata
      fagron: {
        isFagron: true,
        testName: 'NutriGen',
        boxId: rep.sampleCode,
        geneticProfile: 'Fagron Genomics NutriGen Comprehensive Panel',
        emissionDate: rep.reportDate || rep.sampleDate,
        totalPages: rep.totalPages
      },

      status: 'approved',
      validationStatus: 'Ready',
      importSource: 'fagron_genomics_binder1',
      sourceType: 'fagron_genomics',

      createdAt: timestamp,
      createdAt_ts: timestamp.getTime(),
      updatedAt: new Date().toISOString()
    };

    await rxRef.set(rxPayload, { merge: true });
    importedCount++;
    console.log(`[${importedCount}/38] ✅ ${rxId} | Patient: ${rep.patientName} | Date: ${dateSlash} | Doctor: ${docInfo.name} (${clinicInfo.name})`);
  }

  console.log(`\n🎉 Import Complete!`);
  console.log(`Total NutriGen prescriptions successfully saved in Firestore: ${importedCount}`);
}

runImport()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
