/**
 * scripts/sync_prescriptions_to_gcs.cjs
 *
 * Uploads all original prescription files (PDFs / Images) from public/prescriptions/
 * to Google Cloud Storage (gs://med-peptides-app.firebasestorage.app/prescriptions/original/)
 * and updates Firestore prescriptions with secure Google Cloud Storage metadata and
 * strict access control:
 *   - allowedRoles: ['admin', 'account_manager', 'superadmin']
 *   - disallowedRoles: ['doctor', 'patient', 'clinic']
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
    credential: admin.credential.cert(sa),
    storageBucket: 'med-peptides-app.firebasestorage.app'
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function main() {
  console.log('☁️ [Google Cloud Storage Sync] Starting prescription file synchronization...');

  const prescriptionsDir = path.resolve(__dirname, '../public/prescriptions');
  if (!fs.existsSync(prescriptionsDir)) {
    console.error('Directory does not exist:', prescriptionsDir);
    process.exit(1);
  }

  const localFiles = fs.readdirSync(prescriptionsDir).filter(f => 
    f.endsWith('.pdf') || f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );

  console.log(`📁 Found ${localFiles.length} original prescription files in ${prescriptionsDir}`);

  // 1. Upload files to Google Cloud Storage under prescriptions/original/
  const uploadedFilesMap = new Map();

  for (const fileName of localFiles) {
    const localFilePath = path.join(prescriptionsDir, fileName);
    const destination = `prescriptions/original/${fileName}`;
    const contentType = fileName.endsWith('.pdf') ? 'application/pdf' :
      fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

    try {
      console.log(`  ⬆️ Uploading ${fileName} to gs://med-peptides-app.firebasestorage.app/${destination}...`);
      await bucket.upload(localFilePath, {
        destination,
        metadata: {
          contentType,
          metadata: {
            confidentiality: 'restricted_medical_record',
            allowedRoles: 'admin,account_manager,superadmin',
            disallowedRoles: 'doctor,patient,clinic',
            uploadedAt: new Date().toISOString(),
            sourceFileName: fileName
          }
        }
      });

      const fileObj = bucket.file(destination);
      // Generate a signed URL for administrative access or reference
      const [signedUrl] = await fileObj.getSignedUrl({
        action: 'read',
        expires: '2030-01-01' // Long-lived reference URL for admin backend
      });

      const gcsUri = `gs://med-peptides-app.firebasestorage.app/${destination}`;
      uploadedFilesMap.set(fileName, {
        gcsUri,
        cloudStoragePath: destination,
        signedUrl,
        contentType
      });

      console.log(`    ✓ Uploaded: ${gcsUri}`);
    } catch (err) {
      console.error(`    ❌ Failed to upload ${fileName}:`, err.message);
    }
  }

  console.log(`\n🔄 Updating Firestore prescriptions with Google Cloud Storage references...`);
  const snap = await db.collection('prescriptions').get();
  console.log(`Total prescriptions in Firestore: ${snap.size}`);

  let updatedCount = 0;

  for (const doc of snap.docs) {
    const rx = doc.data();
    let matchedFile = null;

    // Check matching by pdfUrl, imageUrl, code, or prescriptionNumber
    for (const [fileName, info] of uploadedFilesMap.entries()) {
      if (rx.pdfUrl && rx.pdfUrl.includes(fileName)) {
        matchedFile = { fileName, info };
        break;
      }
      if (rx.imageUrl && rx.imageUrl.includes(fileName)) {
        matchedFile = { fileName, info };
        break;
      }
      // Match by prescription code inside filename
      const cleanCode = (rx.id || rx.prescriptionNumber || rx.code || '').replace(/\s+/g, '-');
      if (cleanCode && cleanCode.length > 4 && fileName.includes(cleanCode)) {
        matchedFile = { fileName, info };
        break;
      }
    }

    if (matchedFile) {
      const { fileName, info } = matchedFile;
      const originalDocEntry = {
        id: 'original-signed-rx',
        title: 'Official Signed Prescription Pad (Original)',
        name: fileName,
        category: 'signed_rx',
        confidentiality: 'restricted',
        cloudStoragePath: info.cloudStoragePath,
        cloudStorageUri: info.gcsUri,
        // Secure API proxy link for authenticated administrators only:
        url: `/api/prescriptions/original-document?rxId=${doc.id}`,
        accessLevel: 'admin_only',
        allowedRoles: ['admin', 'account_manager', 'superadmin'],
        disallowedRoles: ['doctor', 'patient', 'clinic'],
        uploadedAt: new Date().toISOString()
      };

      const existingDocs = Array.isArray(rx.documents) ? rx.documents : [];
      const filteredDocs = existingDocs.filter(d => d.id !== 'original-signed-rx' && d.category !== 'signed_rx');
      filteredDocs.unshift(originalDocEntry);

      await db.collection('prescriptions').doc(doc.id).update({
        cloudStorageUri: info.gcsUri,
        cloudStoragePath: info.cloudStoragePath,
        originalFileRestricted: true,
        originalFileAccess: 'admin_only',
        allowedRoles: ['admin', 'account_manager', 'superadmin'],
        disallowedRoles: ['doctor', 'patient', 'clinic'],
        // Secure administrative route:
        originalDocumentUrl: `/api/prescriptions/original-document?rxId=${doc.id}`,
        documents: filteredDocs,
        updatedAt: new Date().toISOString()
      });

      console.log(`  ✓ Updated Rx ${doc.id} -> Linked to ${info.gcsUri}`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Completed! Uploaded ${uploadedFilesMap.size} files to Google Cloud Storage. Updated ${updatedCount} Firestore prescription records with RBAC protection.`);
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
