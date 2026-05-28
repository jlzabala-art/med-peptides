import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function inspect() {
  const productsSnap = await db.collection('products').limit(5).get();
  console.log(`Found ${productsSnap.size} products.`);
  productsSnap.docs.forEach(doc => {
    const data = doc.data();
    console.log(`Product ID: ${doc.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  DisplayName: ${data.displayName}`);
    console.log(`  Category: ${data.category}`);
    console.log(`  Supplier: ${data.supplier}`);
    console.log(`  goals: ${JSON.stringify(data.goals)}`);
    console.log(`  secondaryFactors: ${JSON.stringify(data.secondaryFactors)}`);
    console.log(`  productType: ${data.productType}`);
  });
}

inspect().catch(console.error);
