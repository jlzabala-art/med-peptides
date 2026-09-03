import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { readdirSync } from 'fs';

let accountPath;
try {
  const files = readdirSync('/Users/joseluiszabala/regenpept-web.nosync/secrets');
  for (const f of files) {
    if (f.endsWith('.json')) {
      accountPath = '/Users/joseluiszabala/regenpept-web.nosync/secrets/' + f;
      break;
    }
  }
} catch (e) {
  // no secrets folder
}

if (!accountPath) {
  accountPath = '/Users/joseluiszabala/Downloads/regenpept-firebase-adminsdk-v22q0-a5fb93c3b5.json'; // Maybe?
}

try {
  const serviceAccount = JSON.parse(readFileSync(accountPath, 'utf8'));
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  async function check() {
    const v = await db.collectionGroup('variants').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').limit(2).get();
    v.forEach(d => console.log(d.id, d.data()));
  }
  await check();
} catch (e) {
  console.log("Could not read db:", e.message);
}
