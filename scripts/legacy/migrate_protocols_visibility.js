import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function migrate() {
  console.log("Starting migration of protocols to add visibility: 'public'...");
  const protocolsSnap = await db.collection('protocols').get();
  
  let updatedCount = 0;
  for (const doc of protocolsSnap.docs) {
    const data = doc.data();
    if (!data.visibility) {
      await doc.ref.update({ visibility: 'public', authorId: 'system' });
      updatedCount++;
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} protocols.`);
}

migrate().catch(console.error);
