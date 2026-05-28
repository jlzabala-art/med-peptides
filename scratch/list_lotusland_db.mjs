import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const snap = await db.collection('products').where('supplier', '==', 'Lotusland').get();
  console.log(`Found ${snap.size} Lotusland products in DB.`);
  const products = snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      displayName: data.displayName,
      productType: data.productType,
      status: data.status,
      category: data.category,
      variantCount: data.variants?.length || 0
    };
  });
  console.log(products.slice(0, 20));
  if (products.length > 20) console.log(`... and ${products.length - 20} more`);
}
run().catch(console.error);
