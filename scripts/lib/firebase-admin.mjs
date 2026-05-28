import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initializes Firebase Admin SDK using the service account key.
 */
export function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const rootDir = join(__dirname, '../../');
  const serviceAccountFiles = ['serviceAccount-target.json', 'serviceAccountKey.json', 'serviceAccount-source.json'];
  
  let credential;
  let selectedFile = null;

  for (const file of serviceAccountFiles) {
    try {
      const p = join(rootDir, file);
      const serviceAccount = JSON.parse(readFileSync(p, 'utf8'));
      credential = admin.credential.cert(serviceAccount);
      selectedFile = file;
      break;
    } catch (e) {
      // Continue to next file
    }
  }

  if (!credential) {
    try {
      credential = admin.credential.applicationDefault();
    } catch (defaultError) {
      console.error('❌ Failed to initialize Firebase Admin SDK.');
      console.error('   Please provide a valid service account JSON in the project root.');
      process.exit(1);
    }
  }

  return admin.initializeApp({
    credential,
    projectId: 'med-peptides-app'
  });
}

// Ensure it's initialized
const app = initializeFirebaseAdmin();

export const db = app.firestore();
export const auth = app.auth();
export { admin };
export default admin;
