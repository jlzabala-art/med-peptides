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
  
  const q1 = await db.collection('products').where('supplier', '==', 'Ketone').get();
  console.log('Ketone (supplier):', q1.docs.length);

  const q2 = await db.collection('products').where('supplierId', '==', 'Ketone').get();
  console.log('Ketone (supplierId):', q2.docs.length);
}
check().catch(console.error);
