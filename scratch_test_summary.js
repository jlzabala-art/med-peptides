import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
if (!getFirestore.length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const adminDb = getFirestore();

async function run() {
  const start = Date.now();
  const [productsSnap, variantsSnap] = await Promise.all([
    adminDb.collection('products').get(),
    adminDb.collectionGroup('variants').get()
  ]);
  
  console.log(`Fetched ${productsSnap.size} products and ${variantsSnap.size} variants in ${Date.now() - start}ms`);
  
  const variantsByProduct = {};
  variantsSnap.forEach(doc => {
    const parentId = doc.ref.parent.parent.id;
    if (!variantsByProduct[parentId]) variantsByProduct[parentId] = [];
    variantsByProduct[parentId].push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`Mapped variants to products in ${Date.now() - start}ms`);
}
run();
