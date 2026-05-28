import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'target-app');

  const db = app.firestore();
  const snapshot = await db.collection('products').where('supplier', '==', 'NPLAB').get();
  
  console.log(`Found ${snapshot.size} NPLAB products in DB.`);
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.isActive !== false && data.status !== 'draft') {
      const varSnapshot = await doc.ref.collection('variants').get();
      console.log(`Product ID: ${doc.id} | Name: ${data.name} | Category: ${data.category}`);
      varSnapshot.forEach(vDoc => {
        const vData = vDoc.data();
        console.log(`   Variant: ${vDoc.id} | SKU: ${vData.sku} | price: ${JSON.stringify(vData.pricing)}`);
      });
    }
  }
} catch (e) {
  console.error(e);
}
process.exit(0);
