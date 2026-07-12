import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  let sampleFound = false;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.phases) {
      data.phases.forEach((p, i) => {
        // We look for ANY keys in phase to see what we missed
        console.log(`Protocol: ${data.protocol_name || doc.id}, Phase: ${i}`);
        console.log("Keys in phase:", Object.keys(p));
        
        if (p.supplements) console.log("supplements:", JSON.stringify(p.supplements, null, 2));
        if (p.supplements_used) console.log("supplements_used:", JSON.stringify(p.supplements_used, null, 2));
        if (p.items) {
           console.log("items:", JSON.stringify(p.items, null, 2));
        }
      });
    }
  }
}

run().catch(console.error);
