import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
  } catch {
    initializeApp();
  }
}
const db = getFirestore();

async function main() {
  const doc = await db.collection('protocols').doc('wm_003').get();
  console.log(JSON.stringify(doc.data(), null, 2));
}

main().catch(e => { console.error(e); });
