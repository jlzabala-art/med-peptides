import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });
const app = initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') }) });
const db = getFirestore(app);

const snap = await db.collection('products').where('supplierId','==','supplier-bioniq').limit(10).get();
snap.docs.forEach(d => {
  const p = d.data();
  console.log('id:', d.id);
  console.log('  name:', p.name);
  console.log('  strength:', JSON.stringify(p.strength));
  console.log('  total_mg:', p.total_mg, '| dosage_form:', p.dosage_form, '| formatId:', p.formatId);
  console.log('  canonicalId:', p.canonicalId || 'MISSING');
  console.log('');
});
process.exit(0);
