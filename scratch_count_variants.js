import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const adminDb = getFirestore();

async function run() {
  const snap = await adminDb.collectionGroup('variants').get();
  let count = 0;
  let lotusCount = 0;
  
  snap.forEach(doc => {
    count++;
    const data = doc.data();
    const supplierName = (data.supplierName || data.supplier || '').toLowerCase();
    const supplierId = (data.supplierId || '').toLowerCase();
    
    if (supplierName.includes('lotusland') || supplierId.includes('lotusland')) {
      lotusCount++;
    }
  });
  
  console.log(`Total Variants in DB: ${count}`);
  console.log(`Variants matching Lotusland: ${lotusCount}`);
}
run();
