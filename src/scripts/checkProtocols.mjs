import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
async function run() {
  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocols in 'protocols' collection.`);
  
  if(snapshot.size === 0) {
    // maybe they are in another collection?
    const collections = await db.listCollections();
    console.log("Collections available: ", collections.map(c => c.id).join(", "));
  } else {
    console.log(snapshot.docs[0].data());
  }
}
run().catch(console.error).finally(() => process.exit(0));
