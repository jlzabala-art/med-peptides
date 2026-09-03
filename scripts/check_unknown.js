import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

async function check() {
  const db = admin.firestore();
  
  const snaps = await db.collection('products').get();
  const categories = {};
  for (const doc of snaps.docs) {
    const data = doc.data();
    const sup = data.supplier || 'UNKNOWN';
    if (sup === 'UNKNOWN') {
       const cat = data.category || 'UNKNOWN_CAT';
       if (!categories[cat]) categories[cat] = 0;
       categories[cat]++;
    }
  }
  
  console.log('Categories of UNKNOWN supplier:');
  for (const cat of Object.keys(categories)) {
    console.log(`  ${cat}: ${categories[cat]}`);
  }
}
check().catch(console.error);
