import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const serviceAccount = JSON.parse(await readFile(new URL('./serviceAccountKey.json', import.meta.url)));
  initializeApp({
    credential: cert(serviceAccount)
  });

  const db = getFirestore();
  const snapshot = await db.collection('protocols').get();
  
  console.log(`Found ${snapshot.size} protocols.`);
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { status: 'public' });
    count++;
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} protocols to status: 'public'.`);
  } else {
    console.log('No protocols to update.');
  }
}

run().catch(console.error);
