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
  const snap = await db.collection('products').where('isActive', '==', true).get();
  const activePeptides = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p => p.productType === 'peptide');

  console.log(`Active Peptides: ${activePeptides.length}`);
  
  if (activePeptides.length > 0) {
    const sample = activePeptides.slice(0, 3);
    for (const p of sample) {
      console.log(`\n--- PEPTIDE: ${p.name || p.id} ---`);
      console.log(`Scientific Name: ${p.scientificName || '(none)'}`);
      console.log(`Half Life: ${p.typeData?.halfLife || '(none)'}`);
      console.log(`Contraindications: ${JSON.stringify(p.typeData?.contraindications || null)}`);
      console.log(`Dosage Range: ${JSON.stringify(p.typeData?.dosageRange || null)}`);
      console.log(`Synergies: ${JSON.stringify(p.typeData?.synergies || null)}`);
      console.log(`Evidence Level: ${p.typeData?.evidenceLevel || '(none)'}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
