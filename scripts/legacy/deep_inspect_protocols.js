import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let hasSupplements = false;
    let structure = [];
    
    // recursive search for "supplements" or "dosage"
    function searchObj(obj, path) {
      if (!obj) return;
      if (typeof obj === 'object') {
        for (const k in obj) {
          if (k.toLowerCase().includes('supplement')) {
            console.log(`FOUND SUPPLEMENTS at ${path}.${k} in ${doc.id}`);
            console.log(JSON.stringify(obj[k], null, 2));
            hasSupplements = true;
          }
          if (k.toLowerCase().includes('dose') || k.toLowerCase().includes('dosage')) {
            console.log(`FOUND DOSAGE at ${path}.${k} in ${doc.id}:`, obj[k]);
          }
          searchObj(obj[k], path + '.' + k);
        }
      }
    }
    searchObj(data, 'root');
  }
}

run().catch(console.error);
