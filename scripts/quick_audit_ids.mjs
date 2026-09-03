import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const supplierIds = ['supplier-nplabs','supplier-europeptides','supplier-vallida','supplier-bioniq','supplier-lotusland'];

for (const sid of supplierIds) {
  const snap = await db.collection('products').where('supplierId', '==', sid).limit(4).get();
  console.log(`\n=== ${sid} (${snap.size} sampled) ===`);
  snap.docs.forEach(doc => {
    const d = doc.data();
    console.log(`  docId:        ${doc.id}`);
    console.log(`  sku:          ${d.sku || '—'}`);
    console.log(`  name:         ${d.name}`);
    console.log(`  strength:     ${d.strength || '—'}`);
    console.log(`  strengthUnit: ${d.strengthUnit || '—'}`);
    console.log(`  format:       ${d.format || d.form || '—'}`);
    console.log(`  currency:     ${d.currency || '—'}`);
    console.log(`  pricing.retail: ${JSON.stringify(d.pricing?.retail)}`);
    console.log(`  ---`);
  });
}
process.exit(0);
