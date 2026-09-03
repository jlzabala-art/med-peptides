import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function checkNad() {
  const prods = await db.collection('products').get();
  for (const d of prods.docs) {
    const data = d.data();
    const name = (data.canonicalName || data.name || '').toLowerCase();
    if (name.includes('nad') || d.id.includes('nad')) {
      console.log(`Product found: ${d.id} (${data.canonicalName || data.name})`);
      const varSnap = await d.ref.collection('variants').get();
      console.log(`  Subcollection variants (${varSnap.docs.length}):`);
      varSnap.docs.forEach(v => console.log('    - Subcollection var:', v.id, v.data().supplier, v.data().dosage, v.data().unitOfMeasure, v.data().presentation));
      if (Array.isArray(data.variants)) {
        console.log(`  Embedded variants array (${data.variants.length}):`);
        data.variants.forEach(v => console.log('    - Embedded var:', v.id, v.supplier, v.dose || v.dosage, v.unitOfMeasure, v.presentation));
      }
    }
  }
}

checkNad().catch(console.error);
