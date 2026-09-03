import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function run() {
  const toRevert = ['pod-poland', 'supplier-europeptides', 'supplier-fusion', 'supplier-magenta', 'vallida'];
  
  for (const id of toRevert) {
      await db.collection('wholesellers').doc(id).update({
          category: 'Peptides'
      });
      console.log(`Reverted ${id} to Peptides`);
  }
  process.exit(0);
}

run();
