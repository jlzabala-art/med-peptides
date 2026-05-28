import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function main() {
  const snap = await db.collection('protocols').get();
  console.log('\n=== protocols collection ===');
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`${d.id} | protocol_slug: ${data.protocol_slug || '(none)'} | title: ${data.protocol_title || ''}`);
  });

  const bSnap = await db.collection('blueprints').get();
  console.log('\n=== blueprints collection ===');
  bSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`${d.id} | protocol_slug: ${data.protocol_slug || '(none)'} | title: ${data.protocol_title || ''}`);
  });
}
main().catch(e => { console.error(e); process.exit(1); });
