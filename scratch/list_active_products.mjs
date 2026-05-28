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
  const activeProducts = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.isActive !== false && data.status !== 'draft') {
      activeProducts.push({ id: doc.id, ...data });
    }
  });

  console.log(`Found ${activeProducts.length} active products:`);
  activeProducts.slice(0, 40).forEach(p => {
    console.log(`- ID: ${p.id.padEnd(45)} | Name: ${p.name.padEnd(35)} | Supplier: ${p.supplier || 'N/A'}`);
  });
  if (activeProducts.length > 40) {
    console.log(`... and ${activeProducts.length - 40} more.`);
  }

} catch (e) {
  console.error('❌ Error listing products:', e);
}
process.exit(0);
