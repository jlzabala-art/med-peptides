import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf-8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function setAllProtocolsPublic() {
  console.log('Fetching all protocols...');
  const protocolsRef = db.collection('protocols');
  const snapshot = await protocolsRef.get();
  
  if (snapshot.empty) {
    console.log('No protocols found.');
    return;
  }
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    batch.update(doc.ref, { visibility: 'public' });
    count++;
  });
  
  await batch.commit();
  console.log(`Updated ${count} protocols to visibility 'public'.`);
}

setAllProtocolsPublic().catch(console.error);
