import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}
const adminDb = getFirestore();

async function run() {
  const productsSnap = await adminDb.collection('products').where('category', '==', 'Peptides').get();
  
  let inactiveProducts = 0;
  let activeProducts = 0;
  
  productsSnap.forEach(doc => {
    const data = doc.data();
    const isInactive = (data.status && ['inactive', 'archived', 'draft'].includes(data.status)) || data.isActive === false;
    if (isInactive) inactiveProducts++;
    else activeProducts++;
  });
  
  console.log(`Active Peptides: ${activeProducts}, Inactive Peptides: ${inactiveProducts}`);
}
run();
