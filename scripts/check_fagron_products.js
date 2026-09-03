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
  
  const q1 = await db.collection('products').where('supplier', '==', 'Fagron Genomics').get();
  q1.docs.forEach(doc => {
    console.log(doc.id, '-> category:', doc.data().category);
  });
}
check().catch(console.error);
