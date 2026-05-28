import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'target-app');

  const db = app.firestore();
  const collections = await db.listCollections();
  console.log('✅ Connected to target DB:', serviceAccount.project_id);
  console.log('Collections in target DB:', collections.map(c => c.id));
} catch (e) {
  console.error('❌ Error testing target DB:', e);
}
process.exit(0);
