/**
 * scripts/upload_nutrigen_pdfs_to_storage.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Uploads the 38 individual NutriGen PDF files to Firebase Storage and
 * links their download URLs directly into the prescriptions in Firestore.
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
    credential: admin.credential.cert(sa),
    storageBucket: 'med-peptides-app.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function uploadAllPdfs() {
  console.log('🚀 Uploading 38 NutriGen PDFs to Firebase Storage...\n');

  const rawData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../scratch/nutrigen_parsed_all_fixed.json'), 'utf8'));
  let count = 0;

  for (const rep of rawData) {
    const code = rep.sampleCode;
    const localFile = path.resolve(__dirname, `../scratch/pdfs/doctor_report_${code}.pdf`);

    if (!fs.existsSync(localFile)) {
      console.warn(`⚠️ Local file not found: ${localFile}`);
      continue;
    }

    const destination = `prescriptions/fagron/nutrigen/${code}/doctor_report_${code}.pdf`;

    // Upload to bucket
    await bucket.upload(localFile, {
      destination: destination,
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          sampleCode: code,
          patientName: rep.patientName,
          testType: 'NutriGen',
          importedAt: new Date().toISOString()
        }
      }
    });

    // Make public so doctors, patients, and account managers can download/view without complex auth tokens
    try {
      await bucket.file(destination).makePublic();
    } catch (e) {
      // If uniform bucket-level access is enabled, public URL is still standard storage URL
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    const rxId = `RX-${code}`;

    // Update Firestore prescription document
    const now = new Date().toISOString();
    await db.collection('prescriptions').doc(rxId).set({
      fileUrl: publicUrl,
      pdfUrl: publicUrl,
      hasPdf: true,
      documents: [
        {
          name: `doctor_report_${code}.pdf`,
          type: 'PDF',
          url: publicUrl,
          storagePath: destination,
          uploadedAt: now,
          analyzedByAI: true
        }
      ],
      fagron: {
        originalPdfUrl: publicUrl
      },
      updatedAt: now
    }, { merge: true });

    count++;
    console.log(`[${count}/38] 📄 Uploaded & Linked: ${code} (${rep.patientName})`);
  }

  console.log(`\n🎉 All ${count} NutriGen PDFs successfully uploaded and linked in Firestore!`);
}

uploadAllPdfs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Upload failed:', err);
    process.exit(1);
  });
