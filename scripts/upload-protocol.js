
/**
 * upload-protocol.js
 * Usage: node scripts/upload-protocol.js <path-to-protocol-json>
 * Uploads a protocol document to Firestore blueprints collection.
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/upload-protocol.js <path-to-protocol-json>');
  process.exit(1);
}

const filePath = resolve(args[0]);
const protocol = JSON.parse(readFileSync(filePath, 'utf-8'));
const { protocol_id } = protocol;

if (!protocol_id) {
  console.error('ERROR: protocol_id is missing from the JSON.');
  process.exit(1);
}

// Initialize with Application Default Credentials (uses gcloud auth or GOOGLE_APPLICATION_CREDENTIALS)
if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? undefined // cert() with no arg uses GOOGLE_APPLICATION_CREDENTIALS env var
      : undefined),
    projectId: 'Atlas Health-app',
  });
}

const db = getFirestore();

async function upload() {
  const ref = db.collection('blueprints').doc(protocol_id);
  await ref.set(protocol, { merge: false });
  console.log(`✅ Protocol "${protocol_id}" uploaded successfully to blueprints/${protocol_id}`);
}

upload().catch((err) => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
