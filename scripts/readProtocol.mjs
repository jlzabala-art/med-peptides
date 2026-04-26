/**
 * readProtocol.mjs — Lee un protocolo de Firestore y lo imprime formateado
 * Usage: node scripts/readProtocol.mjs tirzepatide
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const slug = process.argv[2] ?? 'tirzepatide';

async function main() {
  // Try protocols collection first
  let snap = await db.collection('protocols').where('slug', '==', slug).limit(1).get();
  if (snap.empty) snap = await db.collection('protocols').doc(slug).get()
    .then(d => d.exists ? { docs: [d], empty: false } : { docs: [], empty: true });

  if (snap.empty) {
    // Try by name contains
    const all = await db.collection('protocols').get();
    const match = all.docs.find(d =>
      d.id.toLowerCase().includes(slug) ||
      (d.data().name ?? '').toLowerCase().includes(slug) ||
      (d.data().peptide ?? '').toLowerCase().includes(slug)
    );
    if (!match) { console.log(`❌ Protocol "${slug}" not found`); process.exit(1); }
    console.log(`\n📄 Protocol ID: ${match.id}`);
    console.log(JSON.stringify(match.data(), null, 2));
    return;
  }

  const doc = snap.docs[0];
  console.log(`\n📄 Protocol ID: ${doc.id}`);
  console.log(JSON.stringify(doc.data(), null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
