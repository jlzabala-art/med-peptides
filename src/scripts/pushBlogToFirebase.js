 
// src/scripts/pushBlogToFirebase.js
// This script reads local blogPosts data and syncs it to Firestore using the Firebase Admin SDK.
// Run with: npm run push-blog
/* global process */
import { blogPosts } from '../data/blogData.js';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { readFileSync } from 'fs';

// Load service account credentials. Use env var or fallback to scripts/serviceAccountKey.js.
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, '../../scripts/serviceAccountKey.js');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  console.warn('⚠️ Service account file not found or invalid. Skipping Firestore sync:', e.message);
  process.exit(0);
}

// Simple guard: if placeholder values are present, abort.
if (serviceAccount.private_key && serviceAccount.private_key.includes('YOUR_PRIVATE_KEY')) {
  console.warn('⚠️ Placeholder service account detected. Replace with real credentials before running the sync.');
  process.exit(0);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function syncBlogPosts() {
  console.log('Starting blog posts sync to Firestore (admin SDK)...');
  for (const post of blogPosts) {
    const { slug, ...rest } = post;
    const postRef = db.collection('blogPosts').doc(slug);
    try {
      await postRef.set(rest, { merge: true });
      console.log(`✅ Synced: ${slug}`);
    } catch (err) {
      console.error(`❌ Failed to sync ${slug}:`, err);
    }
  }
  console.log('Sync complete.');
}

syncBlogPosts()
  .then(() => process.exit())
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
