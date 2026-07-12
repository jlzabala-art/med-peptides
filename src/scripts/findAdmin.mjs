import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('src/scripts/serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function findAdmin() {
  const snapshot = await db.collection('users').where('role', '==', 'admin').get();
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().email, doc.data().role, doc.data().isProfessional);
  });
  
  const snapshot2 = await db.collection('users').where('isProfessional', '==', true).get();
  snapshot2.forEach(doc => {
    console.log(doc.id, doc.data().email, doc.data().role, doc.data().isProfessional);
  });
}

findAdmin();
