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
  const suppliers = {};
  for (const doc of snaps.docs) {
    const data = doc.data();
    const sup = data.supplier || 'UNKNOWN';
    if (!suppliers[sup]) suppliers[sup] = { count: 0, names: [] };
    suppliers[sup].count++;
    if (suppliers[sup].names.length < 5) suppliers[sup].names.push(data.name);
  }
  
  for (const sup of Object.keys(suppliers)) {
    console.log(`Supplier: ${sup}, Count: ${suppliers[sup].count}`);
    console.log(`  Examples: ${suppliers[sup].names.join(', ')}`);
  }
}
check().catch(console.error);
