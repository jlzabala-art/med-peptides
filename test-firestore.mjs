import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

import('dotenv').then(dotenv => {
  dotenv.config({path: '.env.local'});
  const app = initializeApp({ credential: applicationDefault() });
  run(getFirestore(app));
});

async function run(db) {
  const snap = await db.collection('wholesellers').get();
  snap.forEach(doc => console.log(doc.id, '->', doc.data().companyName || doc.data().name));
}
