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
  
  const categories = new Set();
  const activeProducts = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.isActive !== false && data.status !== 'draft') {
      if (data.category) categories.add(data.category);
      activeProducts.push(data);
    }
  });

  console.log('--- ACTIVE CATEGORIES ---');
  console.log(Array.from(categories));
} catch (e) {
  console.error(e);
}
process.exit(0);
