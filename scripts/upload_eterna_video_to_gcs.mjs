/**
 * scripts/upload_eterna_video_to_gcs.mjs
 * 
 * Uploads ETERNA_Precision_Health.mp4 to Firebase / Google Cloud Storage
 * and outputs the permanent media URL for the product page.
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

const bucket = admin.storage().bucket();

async function uploadVideo() {
  const localVideoPath = path.resolve(__dirname, '../public/videos/eterna/ETERNA_Precision_Health.mp4');
  if (!fs.existsSync(localVideoPath)) {
    console.error('Local video file not found at:', localVideoPath);
    process.exit(1);
  }

  const destStoragePath = 'videos/eterna/ETERNA_Precision_Health.mp4';
  const downloadToken = uuidv4();

  console.log(`🚀 Uploading ${localVideoPath} to gs://${bucket.name}/${destStoragePath}...`);

  await bucket.upload(localVideoPath, {
    destination: destStoragePath,
    metadata: {
      contentType: 'video/mp4',
      cacheControl: 'public, max-age=31536000, immutable',
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    }
  });

  const encodedPath = encodeURIComponent(destStoragePath);
  const cloudUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${downloadToken}`;
  
  console.log('✅ Upload complete!');
  console.log('🔗 Cloud Media URL:', cloudUrl);
  console.log('📁 Local Path:', '/videos/eterna/ETERNA_Precision_Health.mp4');

  // Also update Firestore product record if it exists
  const db = admin.firestore();
  const productRef = db.collection('products').doc('eterna-epigenetic-age-test');
  const snap = await productRef.get();
  if (snap.exists) {
    await productRef.update({
      videoUrl: cloudUrl,
      localVideoUrl: '/videos/eterna/ETERNA_Precision_Health.mp4',
      videoMetadata: {
        title: 'ETERNA Precision Health & Longevity Ecosystem',
        fileName: 'ETERNA_Precision_Health.mp4',
        uploadedAt: new Date().toISOString()
      }
    });
    console.log('✅ Firestore product document updated with videoUrl metadata');
  } else {
    console.log('ℹ️ Product document "eterna-epigenetic-age-test" not found in Firestore products collection (will rely on code layout)');
  }
}

uploadVideo().catch(err => {
  console.error('❌ Upload error:', err);
  process.exit(1);
});
