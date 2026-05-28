import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function inspect() {
  const snapshot = await db.collection('products')
    .where('category', '==', 'Research Supplies')
    .get();
  
  console.log(`Found ${snapshot.size} products in 'Research Supplies':`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Product ID: ${doc.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  productType: ${data.productType}`);
    console.log(`  typeData:`, JSON.stringify(data.typeData, null, 2));
  });

  const snapshot2 = await db.collection('products')
    .where('productType', '==', 'professional_material')
    .get();
  
  console.log(`\nFound ${snapshot2.size} products with productType 'professional_material':`);
  snapshot2.forEach(doc => {
    const data = doc.data();
    console.log(`Product ID: ${doc.id}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  category: ${data.category}`);
  });
}

inspect().catch(console.error);
