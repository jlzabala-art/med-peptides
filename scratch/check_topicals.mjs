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
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.isActive !== false) {
      const varSnapshot = await doc.ref.collection('variants').get();
      varSnapshot.forEach(vDoc => {
        const vData = vDoc.data();
        if (vData.route === 'topical' || data.category === 'BHRT') {
          console.log(`Product: ${doc.id} (${data.name}) | Variant: ${vDoc.id} | route: ${vData.route} | label: ${vData.label}`);
        }
      });
    }
  }
} catch (e) {
  console.error(e);
}
process.exit(0);
