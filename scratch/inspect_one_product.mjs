import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'inspect-app');

  const db = app.firestore();
  
  // Let's get 'berberine' product
  const doc = await db.collection('products').doc('berberine').get();
  if (doc.exists) {
    console.log('--- Product Berberine ---');
    console.log(JSON.stringify(doc.data(), null, 2));
    
    console.log('\n--- Variants of Berberine ---');
    const varSnap = await db.collection('products').doc('berberine').collection('variants').get();
    varSnap.forEach(vdoc => {
      console.log(`Variant ID: ${vdoc.id}`);
      console.log(JSON.stringify(vdoc.data(), null, 2));
    });
  } else {
    console.log('Product berberine does not exist.');
  }
} catch (e) {
  console.error('❌ Error:', e);
}
process.exit(0);
