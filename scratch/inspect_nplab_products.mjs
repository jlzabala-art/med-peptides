import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'target-app');

  const db = app.firestore();
  const snapshot = await db.collection('products').get();
  
  const nplabProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.supplier === 'NPLAB') {
      nplabProducts.push({ id: doc.id, name: data.name, category: data.category, productType: data.productType });
    }
  });

  console.log(`Found ${nplabProducts.length} NPLAB products currently in the database:`);
  nplabProducts.forEach(p => {
    console.log(`- ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Type: ${p.productType}`);
  });

} catch (e) {
  console.error('❌ Error:', e);
}
process.exit(0);
