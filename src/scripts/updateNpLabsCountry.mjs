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
  let count = 0;

  wSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.companyName || data.name || '').toLowerCase();
    
    if (name.includes('nplab') || name.includes('np lab')) {
      batch.update(doc.ref, { country: 'Greece' });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} wholesellers' countries.`);
  } else {
    console.log('No wholesellers needed country updates.');
  }
}

run().catch(console.error);
