/**
 * scripts/import_23_new_prescriptions.cjs
 * 
 * Imports the 23 eligible new prescriptions from the Google Sheet into Firestore Atlas.
 * - Authoritative Doctor from column 'DOCTOR' of the spreadsheet.
 * - Downloads PDFs / Images directly from Google Drive.
 * - Extracts formulations, posology, and patient data using Gemini Multimodal AI.
 * - Strictly prevents false-positive NutriGen classification (sets compounding/galenic).
 * - Creates both the prescription and updates/creates the patient record.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { JWT } = require('google-auth-library');
const admin = require('firebase-admin');
const { GoogleGenAI, Type } = require('@google/genai');

// Load environment variables
if (fs.existsSync('.env.local')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  for (const k in envConfig) {
    if (!process.env[k]) process.env[k] = envConfig[k];
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not defined in .env.local');
  process.exit(1);
}

const saPath = path.resolve(__dirname, '../serviceAccount-target.json');
const sa = require(saPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa)
  });
}
const db = admin.firestore();

// Doctor directory mapping strictly from spreadsheet's DOCTOR column
const DOCTOR_MAP = {
  'Dr Marina Cordeiro, Nova': {
    name: 'Dr. Marina Cordeiro Fernandes',
    slug: 'dr-marina-cordeiro',
    id: 'dr-marina-cordeiro',
    clinicName: 'NOVA Clinic',
    clinic: 'NOVA Clinic · Dubai Healthcare City, Dubai, UAE',
    address: 'Dubai Healthcare City, Dubai, UAE',
    licenseNumber: 'DHA-91105367',
    email: 'dr.marina@novaclinic.ae'
  },
  'Raffanie Lucenio, The Masters': {
    name: 'Raffanie Lucenio',
    slug: 'raffanie-lucenio',
    id: 'raffanie-lucenio',
    clinicName: 'The Masters Medical Center',
    clinic: 'The Masters Medical Center · Doha, Qatar',
    address: 'Building 81, Street 555, Leabaib Zone 70, Doha, Qatar',
    licenseNumber: 'QCHP Registered',
    email: 'raffanie@themasters.qa'
  },
  'Dr Khalid Shukri': {
    name: 'Dr. Khalid Shukri',
    slug: 'dr-khalid-shukri',
    id: 'dr-khalid-shukri',
    clinicName: 'Dr. Khalid Shukri Clinic',
    clinic: 'Dr. Khalid Shukri Clinic · Dubai, UAE',
    address: 'Dubai, UAE',
    licenseNumber: 'DHA Registered',
    email: 'dr.khalid@shukriclinic.com'
  },
  'Dr Sezgin Cagatay, Hortman': {
    name: 'Dr. Çağatay Sezgin, MD, FISHRS',
    slug: 'dr-cagatay-sezgin',
    id: 'z3aUIMaYsPViG1JgM95r',
    clinicName: 'Hortman Clinics / Shamma Clinic',
    clinic: 'Shamma Clinic by Novomed LLC / Novomed Clinics',
    address: 'Street 10C, Villa 41, Jumeirah 1, Behind Jumeirah Plaza, Dubai, UAE',
    licenseNumber: 'DHA 00208953-005',
    email: 'cagataysezgin66@gmail.com'
  },
  'Dr Sobia, MLSC': {
    name: 'Dr. Sobia',
    slug: 'dr-sobia',
    id: 'dr-sobia',
    clinicName: 'Mediluxe Longevity Center (MLSC)',
    clinic: 'Mediluxe Longevity Center · Jumeirah, Dubai, UAE',
    address: 'Jumeirah, Dubai, UAE',
    licenseNumber: 'DHA Registered',
    email: 'dr.sobia@mediluxeme.com'
  },
  'Dr Fahed Abdulaziz Al Mutawah, My Skin KW': {
    name: 'Dr. Fahed Abdulaziz Al Mutawah',
    slug: 'dr-fahed-al-mutawah',
    id: 'dr-fahed-al-mutawah',
    clinicName: 'My Skin Clinic (Kuwait)',
    clinic: 'My Skin Clinic · Kuwait City, Kuwait',
    address: 'Kuwait City, Kuwait',
    licenseNumber: 'MOH Registered',
    email: 'dr.fahed@myskin.com.kw'
  },
  'Dr Hanieh Erdmann': {
    name: 'Dr. Hanieh Erdmann',
    slug: 'dr-hanieh-erdmann',
    id: 'dr-hanieh-erdmann',
    clinicName: 'Bedaya Polyclinic',
    clinic: 'Bedaya Polyclinic · Al Wasl Road, Jumeirah, Dubai, UAE',
    address: 'Al Wasl Road, Jumeirah, Dubai, UAE',
    licenseNumber: 'DHA Registered',
    email: 'dr.hanieh@bedayaclinic.com'
  }
};

function resolveDoctor(docString) {
  if (!docString) return DOCTOR_MAP['Dr Marina Cordeiro, Nova'];
  const trim = docString.trim();
  if (DOCTOR_MAP[trim]) return DOCTOR_MAP[trim];
  for (const k in DOCTOR_MAP) {
    if (trim.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(trim.toLowerCase())) {
      return DOCTOR_MAP[k];
    }
  }
  return DOCTOR_MAP['Dr Marina Cordeiro, Nova'];
}

function extractDriveFileId(url) {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const idMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return null;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function getDriveAuthToken() {
  const client = new JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });
  const token = await client.getAccessToken();
  return token.token;
}

async function downloadDriveFile(fileId, token) {
  const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!metaRes.ok) {
    throw new Error(`Failed to get file meta: ${metaRes.statusText}`);
  }
  const meta = await metaRes.json();

  const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!contentRes.ok) {
    throw new Error(`Failed to download file content: ${contentRes.statusText}`);
  }
  const arrayBuffer = await contentRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return { meta, buffer };
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    documentType: {
      type: Type.STRING,
      enum: ['StandardPrescription', 'FagronGenomics', 'CompoundingFormula', 'ClinicalReport', 'Unknown']
    },
    prescriptionNumber: { type: Type.STRING },
    fileNumber: { type: Type.STRING },
    clinicalCategory: {
      type: Type.STRING,
      enum: ['trichotest', 'nutrigen', 'hormone', 'peptide', 'compounding', 'standard']
    },
    patient: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        dob: { type: Type.STRING },
        gender: { type: Type.STRING },
        fileNumber: { type: Type.STRING }
      }
    },
    date: { type: Type.STRING },
    formulationBlocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phaseNumber: { type: Type.INTEGER },
          phaseName: { type: Type.STRING },
          treatmentType: { type: Type.STRING },
          dispensingForm: { type: Type.STRING },
          volume: { type: Type.STRING },
          duration: { type: Type.STRING },
          posology: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                dosage: { type: Type.STRING },
                concentration: { type: Type.STRING },
                isVehicleOrBase: { type: Type.BOOLEAN }
              },
              required: ['name']
            }
          }
        },
        required: ['phaseName', 'items']
      }
    }
  },
  required: ['patient', 'formulationBlocks']
};

const SYSTEM_PROMPT = `You are a clinical pharmacologist and medical OCR extractor.
Extract all details from the provided prescription / clinical document with 100% fidelity.

CRITICAL RULES:
1. Patient name and file number must be exact as written.
2. Clinical Category:
   - For oral capsules (e.g. Ubiquinol, Berberine, Red Yeast Rice, CoQ10, Saw Palmetto, Vitamins, etc.) or galenic ointments/creams: USE 'compounding' or 'standard'.
   - NEVER use 'nutrigen' unless the document is an official Fagron Genomics NutriGen DNA test report with an official Fagron Box ID.
3. Formulation blocks:
   - Separate distinct phases or formulas (e.g. Morning Formula vs Metabolic & Lipid Formula, or Topical Solution vs Scalp Oil).
   - Extract every active ingredient with its exact dosage/concentration.
   - Extract the posology / directions for use verbatim.`;

async function extractPrescriptionWithAi(buffer, mimeType) {
  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-flash-latest'
  ];

  let lastError = null;
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType,
                  data: buffer.toString('base64')
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: EXTRACTION_SCHEMA,
          temperature: 0.1
        }
      });

      let text = response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        text = text.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        return JSON.parse(text);
      }
    } catch (err) {
      console.warn(`    ⚠️ Model ${model} failed: ${err.message}. Trying next candidate...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All AI extraction models failed');
}

async function main() {
  console.log('=== STARTING BATCH IMPORT OF 23 NEW PRESCRIPTIONS ===\n');

  const auditPath = path.resolve(__dirname, 'patient_dedup_audit.json');
  const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
  const eligible = audit.eligibleNew || [];

  console.log(`Found ${eligible.length} eligible prescriptions ready for clean import.`);

  const driveToken = await getDriveAuthToken();
  console.log('✓ Google Drive Auth Token obtained.\n');

  const publicPrescDir = path.resolve(__dirname, '../public/prescriptions');
  if (!fs.existsSync(publicPrescDir)) {
    fs.mkdirSync(publicPrescDir, { recursive: true });
  }

  let importedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let idx = 0; idx < eligible.length; idx++) {
    const item = eligible[idx];
    const itemNum = idx + 1;
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`[${itemNum}/${eligible.length}] Row ${item.row}: ${item.basePatientName}`);
    console.log(`Spreadsheet Doctor: "${item.doctor}"`);

    const driveFileId = extractDriveFileId(item.signedPrescription);
    if (!driveFileId) {
      console.log(`  ❌ No valid Drive file ID found in: ${item.signedPrescription}`);
      failedCount++;
      continue;
    }

    // Double check patient in Firestore to avoid duplicate
    const pSnap = await db.collection('patients')
      .where('name', '==', item.basePatientName)
      .limit(1)
      .get();
    
    // Check if prescription already exists by patient name
    const rxSnap = await db.collection('prescriptions')
      .where('patientName', '==', item.basePatientName)
      .limit(1)
      .get();

    if (!rxSnap.empty) {
      console.log(`  ⚠️ Patient prescription already exists in Atlas (${rxSnap.docs[0].id}). Skipping.`);
      skippedCount++;
      continue;
    }

    try {
      // 1. Download from Google Drive
      console.log(`  Downloading from Google Drive (${driveFileId})...`);
      const { meta, buffer } = await downloadDriveFile(driveFileId, driveToken);
      console.log(`  ✓ Downloaded ${meta.name} (${Math.round(buffer.length / 1024)} KB, ${meta.mimeType})`);

      // 2. Save file to public/prescriptions
      const ext = meta.mimeType.includes('pdf') ? '.pdf' : (meta.mimeType.includes('png') ? '.png' : '.jpg');
      const safeFileCode = slugify(item.basePatientName);
      const savedFileName = `RX-ROW${item.row}-${safeFileCode}${ext}`;
      const savedFilePath = path.join(publicPrescDir, savedFileName);
      fs.writeFileSync(savedFilePath, buffer);
      const publicUrl = `/prescriptions/${savedFileName}`;
      console.log(`  ✓ Saved static file to ${publicUrl}`);

      // 3. Multimodal AI Extraction
      console.log(`  Running Gemini multimodal extraction...`);
      const extracted = await extractPrescriptionWithAi(buffer, meta.mimeType);
      console.log(`  ✓ AI Extraction successful. Found ${extracted.formulationBlocks?.length || 0} formulation blocks.`);

      // 4. Resolve Doctor strictly from DOCTOR column
      const doctorProfile = resolveDoctor(item.doctor);
      console.log(`  ✓ Assigned Authoritative Doctor: ${doctorProfile.name} (${doctorProfile.clinicName})`);

      // 5. Build clean prescription document
      const fileCode = extracted.fileNumber || extracted.prescriptionNumber || `518${item.row + 50}`;
      const rxId = `RX-${fileCode}`;

      // Strictly force compounding / non-nutrigen
      let clinicalCategory = extracted.clinicalCategory || 'compounding';
      if (clinicalCategory === 'nutrigen') {
        clinicalCategory = 'compounding';
      }

      const allBlocks = extracted.formulationBlocks || [];
      const isMultiPart = allBlocks.length > 1;

      // Extract all items for the prescription
      const allItems = allBlocks.flatMap((b, bIdx) => {
        return (b.items || []).map((it, itIdx) => ({
          id: `line_${item.row}_${bIdx}_${itIdx}`,
          name: it.name,
          productName: it.name,
          activeIngredient: it.name,
          dosage: it.dosage || it.concentration || 'As directed',
          concentration: it.concentration || it.dosage || '',
          formulationBlock: b.phaseName || `Phase ${bIdx + 1}`,
          formulationIndex: bIdx + 1,
          isVehicleOrBase: !!it.isVehicleOrBase,
          category: 'Compounding / Magistral',
          status: 'pending'
        }));
      });

      const combinedPosology = allBlocks.map((b, bIdx) => 
        `[${b.phaseName || `Phase ${bIdx + 1}`}]: ${b.posology || 'Take / apply as directed by physician.'}`
      ).join('\n\n');

      const dispensingForm = allBlocks.map(b => b.dispensingForm || 'Compounded Formulation').join(' / ');
      const treatmentType = allBlocks.map(b => b.treatmentType || b.phaseName || 'Compounded Protocol').join(' + ');

      const prescriptionDoc = {
        id: rxId,
        prescriptionId: rxId,
        prescriptionNumber: rxId,
        prescriptionCode: rxId,
        code: rxId,
        fileNumber: String(fileCode),
        patientName: item.basePatientName,
        patientGender: extracted.patient?.gender || 'Unknown',
        patientDob: extracted.patient?.dob || null,
        patient: {
          name: item.basePatientName,
          gender: extracted.patient?.gender || 'Unknown',
          dob: extracted.patient?.dob || null,
          fileNumber: String(fileCode)
        },
        doctorName: doctorProfile.name,
        doctorId: doctorProfile.id,
        doctorSlug: doctorProfile.slug,
        prescribingDoctor: doctorProfile.name,
        treatingDoctor: doctorProfile.name,
        clinic: doctorProfile.clinic,
        clinicName: doctorProfile.clinicName,
        doctor: {
          name: doctorProfile.name,
          id: doctorProfile.id,
          slug: doctorProfile.slug,
          clinicName: doctorProfile.clinicName,
          clinicAddress: doctorProfile.address,
          licenseNumber: doctorProfile.licenseNumber
        },
        clinicalCategory,
        treatmentProgram: 'Personalized Compounded Protocol',
        treatmentType,
        dispensingForm,
        posology: combinedPosology,
        duration: allBlocks[0]?.duration || '60 days',
        items: allItems,
        prescriptionLines: allItems,
        isMultiPart,
        totalParts: isMultiPart ? allBlocks.length : 1,
        partNumber: 1,
        status: 'draft',
        validationStatus: 'Ready',
        quotationStatus: 'Pending',
        orderStatus: 'Pending',
        pdfUrl: publicUrl,
        imageUrl: publicUrl,
        gdriveSource: item.signedPrescription,
        source: 'google_sheet_import',
        sourceType: 'IMPORT',
        importSource: 'sheet_signed_import',
        isAtlasRegistered: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: extracted.date || new Date().toISOString().slice(0, 10),
        dateFormatted: extracted.date || new Date().toISOString().slice(0, 10)
      };

      // 6. Save Prescription in Firestore
      await db.collection('prescriptions').doc(rxId).set(prescriptionDoc);
      console.log(`  ✓ Saved Prescription ${rxId} in Firestore.`);

      // 7. Save / Update Patient Record in Firestore
      const patientId = `patient-${slugify(item.basePatientName)}`;
      await db.collection('patients').doc(patientId).set({
        id: patientId,
        name: item.basePatientName,
        gender: extracted.patient?.gender || 'Unknown',
        dob: extracted.patient?.dob || null,
        fileNumber: String(fileCode),
        doctorName: doctorProfile.name,
        assignedDoctorId: doctorProfile.id,
        prescriptionsCount: 1,
        activePrescriptions: [rxId],
        prescriptions: [rxId],
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        source: 'sheet_import'
      }, { merge: true });
      console.log(`  ✓ Linked Patient ${patientId} in Firestore.`);

      importedCount++;
    } catch (err) {
      console.error(`  ❌ Failed importing row ${item.row}:`, err.message);
      failedCount++;
    }

    // Brief pause to respect API rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n================================================================================`);
  console.log(`=== BATCH IMPORT COMPLETE ===`);
  console.log(`  ✓ Successfully Imported: ${importedCount}`);
  console.log(`  ⚠️ Skipped (Already existed): ${skippedCount}`);
  console.log(`  ❌ Failed: ${failedCount}`);
  console.log(`================================================================================\n`);
}

main().catch(console.error);
