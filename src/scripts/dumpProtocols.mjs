import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function dump() {
  const snapshot = await db.collection('protocols').get();
  const protocols = [];
  snapshot.docs.forEach(doc => {
    protocols.push({ id: doc.id, ...doc.data() });
  });
  
  fs.writeFileSync('../data/dumped_protocols.json', JSON.stringify(protocols, null, 2));
  console.log(`Dumped ${protocols.length} protocols to src/data/dumped_protocols.json`);
}

dump().catch(console.error).finally(() => process.exit(0));
