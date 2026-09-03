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
  
  // check products where supplier includes fagron
  const q1 = await db.collection('products').where('supplier', '==', 'Fagron Genomics').get();
  console.log('Fagron Genomics:', q1.docs.length);

  const q2 = await db.collection('products').where('supplier', '==', 'fagron-genomics').get();
  console.log('fagron-genomics:', q2.docs.length);
  
  const q3 = await db.collection('products').where('supplier_id', '==', 'fagron-genomics').get();
  console.log('supplier_id fagron-genomics:', q3.docs.length);
}
check().catch(console.error);
