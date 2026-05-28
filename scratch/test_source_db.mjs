import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-source.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'source-app');

  const db = app.firestore();
  const collections = await db.listCollections();
  console.log('✅ Connected to source DB:', serviceAccount.project_id);
  console.log('Collections in source DB:', collections.map(c => c.id));
  
  // Let's print the count of docs in 'products' if it exists
  const prodColl = db.collection('products');
  const snap = await prodColl.limit(5).get();
  console.log('Sample docs in products:');
  snap.forEach(doc => {
    console.log(`- ${doc.id}:`, Object.keys(doc.data()));
  });

  const totalSnap = await prodColl.get();
  console.log(`Total products in source db: ${totalSnap.size}`);
} catch (e) {
  console.error('❌ Error testing source DB:', e);
}
process.exit(0);
