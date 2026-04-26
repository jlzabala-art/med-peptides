/**
 * showDrugsStructure.mjs — Muestra la estructura de drugs[] en phase_blueprints
 * Usage: node scripts/showDrugsStructure.mjs
 */
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
  } catch { initializeApp(); }
}
const db = getFirestore();

async function main() {
  // Sample a few docs with phase_blueprints
  const snap = await db.collection('protocol_templates').limit(4).get();
  for (const d of snap.docs) {
    const data = d.data();
    if (!Array.isArray(data.phase_blueprints)) continue;
    console.log(`\n══ ${d.id} ══`);
    data.phase_blueprints.forEach((bp, i) => {
      console.log(`  Phase [${i}] "${bp.phase_title}" (${bp.phase_key})`);
      if (Array.isArray(bp.drugs)) {
        bp.drugs.forEach((drug, j) => {
          console.log(`    drug[${j}]:`, JSON.stringify(drug));
        });
      } else {
        console.log('    drugs: (none)');
      }
    });
  }
}
main().catch(e => { console.error(e); process.exit(1); });
