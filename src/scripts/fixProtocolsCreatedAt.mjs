import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
async function run() {
  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocols. Fixing...`);
  
  let count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates = {};
    
    if (!data.created_at && data.metadata?.created_at) {
      // convert ISO string to Firestore Timestamp
      updates.created_at = new Date(data.metadata.created_at);
    } else if (!data.created_at) {
      updates.created_at = new Date();
    }
    
    if (!data.status) {
       updates.status = data.metadata?.visibility === 'public' ? 'active' : 'draft';
    }
    
    if (!data.protocol_name) {
       updates.protocol_name = data.metadata?.scientificName || data.title || 'Untitled';
    }
    
    if (!data.therapeutic_category) {
       updates.therapeutic_category = data.category || 'General';
    }
    
    if (Object.keys(updates).length > 0) {
      await doc.ref.update(updates);
      count++;
    }
  }
  
  console.log(`Updated ${count} protocols.`);
}
run().catch(console.error).finally(() => process.exit(0));
