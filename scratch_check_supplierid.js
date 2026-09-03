import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const adminDb = getFirestore();

async function run() {
  const snap = await adminDb.collectionGroup('variants').get();
  
  const ids = new Set();
  const names = new Set();
  snap.forEach(doc => {
    const data = doc.data();
    const supplierName = (data.supplierName || data.supplier || '').toLowerCase();
    const supplierId = (data.supplierId || '');
    
    if (supplierName.includes('lotusland') || supplierId.toLowerCase().includes('lotusland')) {
      ids.add(supplierId);
      names.add(supplierName);
    }
  });
  
  console.log(`Lotusland Supplier IDs found:`, Array.from(ids));
  console.log(`Lotusland Supplier Names found:`, Array.from(names));
}
run();
