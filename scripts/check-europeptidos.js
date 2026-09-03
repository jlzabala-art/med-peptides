import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const serviceAccount = JSON.parse(await readFile('/Users/joseluiszabala/regenpept-web.nosync/serviceAccountKey.json', 'utf8').catch(() => '{}'));
  if (Object.keys(serviceAccount).length === 0) { console.log('No service account'); return; }
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  const db = getFirestore();
  const doc = await db.collection('wholesellers').doc('supplier-europeptides').get();
  console.log(doc.data());
}
run();
