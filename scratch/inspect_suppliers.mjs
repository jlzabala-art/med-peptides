import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const snap = await db.collection('products').get();
  const suppliers = new Set();
  const suppliersByType = {};
  snap.docs.forEach(doc => {
    const data = doc.data();
    const s = data.supplier || 'UNKNOWN';
    const type = data.productType || 'UNKNOWN';
    suppliers.add(s);
    if (!suppliersByType[s]) suppliersByType[s] = {};
    suppliersByType[s][type] = (suppliersByType[s][type] || 0) + 1;
  });
  console.log('Unique suppliers:', Array.from(suppliers));
  console.log('Supplier breakdown by type:', suppliersByType);
}
run().catch(console.error);
