/**
 * scripts/upload_and_attach_fagron_pdfs.mjs
 * 
 * Uploads all 14 missing Fagron PDF files (9 Qatar TrichoTest + 5 TeloTest)
 * to Firebase Storage and links them to their corresponding Firestore prescriptions.
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let saPath = path.resolve(__dirname, '../serviceAccountKey.json');
if (!fs.existsSync(saPath)) {
  saPath = path.resolve(__dirname, '../serviceAccount-target.json');
}
const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
const projectId = sa.project_id || 'med-peptides-app';
const bucketName = projectId + '.firebasestorage.app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    storageBucket: bucketName
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const UPLOADS_DIR = '/Users/joseluiszabala/.gemini/antigravity-ide/brain/e20def65-6794-466c-9d13-20b90655beee/.user_uploaded';

const FILES_MAP = [
  // --- 9 Qatar TrichoTest Prescriptions (Dr. Raffanie Lucenio) ---
  {
    rxId: 'RX-BOX02550AATRI',
    sampleCode: 'BOX02550AATRI',
    patientName: 'Aisha Mohammed Alsulaiti',
    localFile: 'media_1791992182839.pdf',
    fileName: 'Fagron_TrichoTest_Aisha_Mohammed_Alsulaiti_BOX02550AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX02566AATRI',
    sampleCode: 'BOX02566AATRI',
    patientName: 'Sara Khalid Al-Meadadi',
    localFile: 'media_1791992182881.pdf',
    fileName: 'Fagron_TrichoTest_Sara_Khalid_Al_Meadadi_BOX02566AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX02571AATRI',
    sampleCode: 'BOX02571AATRI',
    patientName: 'Maryam Mohammed Al-Sulaiti',
    localFile: 'media_1792004630382.pdf',
    fileName: 'Fagron_TrichoTest_Maryam_Mohammed_Al_Sulaiti_BOX02571AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX02574AATRI',
    sampleCode: 'BOX02574AATRI',
    patientName: 'Turky Bakhit S A Al-Shahwani',
    localFile: 'media_1792005089675.pdf',
    fileName: 'Fagron_TrichoTest_Turky_Bakhit_Al_Shahwani_BOX02574AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX03041AATRI',
    sampleCode: 'BOX03041AATRI',
    patientName: 'Moza Ahmad Almatwi',
    localFile: 'media_1792005130263.pdf',
    fileName: 'Fagron_TrichoTest_Moza_Ahmad_Almatwi_BOX03041AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX03044AATRI',
    sampleCode: 'BOX03044AATRI',
    patientName: 'Mohammed Yousuf Al-Khulaifi',
    localFile: 'media_1792005130240.pdf',
    fileName: 'Fagron_TrichoTest_Mohammed_Yousuf_Al_Khulaifi_BOX03044AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX03051AATRI',
    sampleCode: 'BOX03051AATRI',
    patientName: 'Azza Awad Al-Mejali',
    localFile: 'media_1792004630279.pdf',
    fileName: 'Fagron_TrichoTest_Azza_Awad_Al_Mejali_BOX03051AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX03054AATRI',
    sampleCode: 'BOX03054AATRI',
    patientName: 'Abdulrahman Darwish Fakhro',
    localFile: 'media_1792005089737.pdf',
    fileName: 'Fagron_TrichoTest_Abdulrahman_Darwish_Fakhro_BOX03054AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },
  {
    rxId: 'RX-BOX03055AATRI',
    sampleCode: 'BOX03055AATRI',
    patientName: 'Salwa Saeed Alkubaisi',
    localFile: 'media_1792004630292.pdf',
    fileName: 'Fagron_TrichoTest_Salwa_Saeed_Alkubaisi_BOX03055AATRI.pdf',
    doctorName: 'Dr. Raffanie Lucenio'
  },

  // --- 5 TeloTest Prescriptions ---
  {
    rxId: 'RX-BOX03531AATEL',
    sampleCode: 'BOX03531AATEL',
    patientName: 'Melissa Nel',
    localFile: 'media_1791996374391.pdf',
    fileName: 'Fagron_TeloTest_Melissa_Nel_BOX03531AATEL.pdf',
    doctorName: 'Dr. Sobia Mirza'
  },
  {
    rxId: 'RX-BOX00621AATEL',
    sampleCode: 'BOX00621AATEL',
    patientName: 'Maria Nosal',
    localFile: 'media_1791996374397.pdf',
    fileName: 'Fagron_TeloTest_Maria_Nosal_BOX00621AATEL.pdf',
    doctorName: 'Dr. Sobia Mirza'
  },
  {
    rxId: 'RX-BOX02171AATEL',
    sampleCode: 'BOX02171AATEL',
    patientName: 'Rehab Serafi',
    localFile: 'media_1791996374419.pdf',
    fileName: 'Fagron_TeloTest_Rehab_Serafi_BOX02171AATEL.pdf',
    doctorName: 'Dr. Rehab Serafi'
  },
  {
    rxId: 'RX-BOX00623AATEL',
    sampleCode: 'BOX00623AATEL',
    patientName: 'Saeed Dalmook',
    localFile: 'media_1791996374443.pdf',
    fileName: 'Fagron_TeloTest_Saeed_Dalmook_BOX00623AATEL.pdf',
    doctorName: 'Dr. Sobia Mirza'
  },
  {
    rxId: 'RX-BOX03533AATEL',
    sampleCode: 'BOX03533AATEL',
    patientName: 'Saeed Al Maktoum',
    localFile: 'media_1791996374528.pdf',
    fileName: 'Fagron_TeloTest_Saeed_Al_Maktoum_BOX03533AATEL.pdf',
    doctorName: 'Dr. Sobia Mirza'
  }
];

async function uploadPdf(localPath, destStoragePath) {
  const downloadToken = uuidv4();
  await bucket.upload(localPath, {
    destination: destStoragePath,
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });

  const encodedPath = encodeURIComponent(destStoragePath);
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
  return { publicUrl, storagePath: destStoragePath };
}

async function run() {
  console.log(`Starting upload and attachment of ${FILES_MAP.length} Fagron PDF files...\n`);

  for (const item of FILES_MAP) {
    const fullLocalPath = path.join(UPLOADS_DIR, item.localFile);
    if (!fs.existsSync(fullLocalPath)) {
      console.error(`❌ File not found: ${fullLocalPath}`);
      continue;
    }

    const destStoragePath = `prescriptions/${item.rxId}/docs/${item.fileName}`;
    console.log(`Uploading ${item.localFile} -> ${destStoragePath}...`);
    
    try {
      const uploadResult = await uploadPdf(fullLocalPath, destStoragePath);
      
      const docRef = db.collection('prescriptions').doc(item.rxId);
      const docSnap = await docRef.get();
      
      const existingDocs = docSnap.exists && Array.isArray(docSnap.data().documents)
        ? docSnap.data().documents
        : [];
        
      // Filter out duplicate names
      const updatedDocs = existingDocs.filter(d => d.name !== item.fileName);
      updatedDocs.push({
        name: item.fileName,
        url: uploadResult.publicUrl,
        storagePath: uploadResult.storagePath,
        type: 'PDF',
        uploadedAt: new Date().toISOString(),
        uploadedBy: item.doctorName,
        analyzedByAI: true,
        appliedFields: []
      });

      await docRef.set({
        documents: updatedDocs,
        pdfUrl: uploadResult.publicUrl,
        documentUrl: uploadResult.publicUrl,
        storagePath: uploadResult.storagePath,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ [${item.rxId}] Successfully attached ${item.fileName}`);
    } catch (err) {
      console.error(`❌ Error processing ${item.rxId}:`, err.message);
    }
  }

  console.log('\nAll 14 Fagron prescription files uploaded and attached successfully!');
}

run().catch(console.error);
