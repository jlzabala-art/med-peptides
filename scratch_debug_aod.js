import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const pSnap = await db.collection('products').where('name', '==', 'AOD-9604').get();
  
  if (pSnap.empty) {
    console.log("Not found.");
    return;
  }
  
  pSnap.forEach(doc => {
    console.log("ID:", doc.id);
    console.log("Variants:", JSON.stringify(doc.data().variants, null, 2));
  });
}

run().catch(console.error);
