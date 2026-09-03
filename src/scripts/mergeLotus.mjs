import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const wSnap = await db.collection('wholesellers').get();
  const batch = db.batch();
  
  let lotusDocs = [];

  wSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.companyName || data.name || '').toLowerCase();
    
    if (name.includes('lotus')) {
      lotusDocs.push({ id: doc.id, data });
    }
  });

  if (lotusDocs.length > 1) {
    const mainDoc = lotusDocs[0];
    console.log('Keeping main Lotus doc:', mainDoc.id);
    for (let i = 1; i < lotusDocs.length; i++) {
      console.log('Deleting duplicate Lotus doc:', lotusDocs[i].id);
      batch.delete(db.collection('wholesellers').doc(lotusDocs[i].id));
    }
    await batch.commit();
    console.log('Merged Lotusland duplicates.');
  }
}

run().catch(console.error);
