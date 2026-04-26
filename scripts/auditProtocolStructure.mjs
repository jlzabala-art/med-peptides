/**
 * auditProtocolStructure.mjs
 * Audita la estructura de protocol_templates para entender los campos
 * disponibles en phase_blueprints y determinar cómo extraer products_used.
 *
 * Usage: node scripts/auditProtocolStructure.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const svcPath = resolve(__dirname, '../serviceAccountKey.json');
if (!getApps().length) {
  try {
    const svc = require(svcPath);
    initializeApp({ credential: cert(svc) });
    console.log('✅ Firebase Admin (serviceAccountKey.json)');
  } catch {
    initializeApp();
    console.log('✅ Firebase Admin (ADC)');
  }
}

const db = getFirestore();

async function main() {
  const snap = await db.collection('protocol_templates').get();
  console.log(`\n📦 Total protocols: ${snap.docs.length}\n`);

  let withPhases = 0, withBlueprints = 0, withProducts = 0, neither = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const hasPhases = Array.isArray(data.phases) && data.phases.length > 0;
    const hasBlueprints = Array.isArray(data.phase_blueprints) && data.phase_blueprints.length > 0;
    const hasProducts = Array.isArray(data.products_used) && data.products_used.length > 0;

    if (hasPhases) withPhases++;
    if (hasBlueprints) withBlueprints++;
    if (hasProducts) withProducts++;
    if (!hasPhases && !hasBlueprints && !hasProducts) neither++;

    // Show detail for blueprints docs
    if (hasBlueprints && !hasProducts) {
      console.log(`\n── ${d.id} ──`);
      const bp = data.phase_blueprints[0];
      console.log('  phase_blueprints[0] keys:', Object.keys(bp).join(', '));
      if (bp.drugs_used) {
        console.log('  drugs_used[0]:', JSON.stringify(bp.drugs_used[0], null, 2));
      }
      if (bp.compounds) {
        console.log('  compounds[0]:', JSON.stringify(bp.compounds[0], null, 2));
      }
      if (bp.products) {
        console.log('  products[0]:', JSON.stringify(bp.products[0], null, 2));
      }
    }
  }

  console.log('\n─────────────────────────────────');
  console.log(`  With phases        : ${withPhases}`);
  console.log(`  With phase_blueprints: ${withBlueprints}`);
  console.log(`  With products_used : ${withProducts}`);
  console.log(`  Neither            : ${neither}`);
  console.log('─────────────────────────────────\n');
}

main().catch(e => { console.error(e); process.exit(1); });
