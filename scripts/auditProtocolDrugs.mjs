/**
 * auditProtocolDrugs.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * Audita protocol_templates para diagnosticar exactamente:
 *  1. Cuántos tienen phases[].drugs_used[] (estructura que usa el engine)
 *  2. Cuántos tienen phase_blueprints[].drugs[] (estructura alternativa)
 *  3. Cuántos no tienen drugs en ninguno de los dos
 *  4. Muestra los campos disponibles en drugs_used para los que sí tienen
 *
 * Usage: node scripts/auditProtocolDrugs.mjs
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

  const results = {
    hasDrugsUsed: [],     // phases[].drugs_used exists and has entries
    hasBlueprintDrugs: [], // phase_blueprints[].drugs exists
    noDrugs: [],           // Neither found
  };

  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;

    // Check phases[].drugs_used (what the engine reads)
    const phases = data.phases || [];
    const drugsUsedCount = phases.reduce((acc, p) => acc + (p.drugs_used?.length || 0), 0);

    // Check phase_blueprints[].drugs (alternate key)
    const blueprints = data.phase_blueprints || [];
    const bpDrugsCount = blueprints.reduce((acc, bp) => acc + (bp.drugs?.length || 0), 0);

    if (drugsUsedCount > 0) {
      results.hasDrugsUsed.push({ id, phases: phases.length, drugCount: drugsUsedCount });
      // Show first drug's fields
      const firstDrug = phases.find(p => p.drugs_used?.length > 0)?.drugs_used?.[0];
      console.log(`\n✅ [drugs_used] ${id}`);
      console.log(`   phases: ${phases.length}, total drugs: ${drugsUsedCount}`);
      if (firstDrug) {
        console.log(`   Sample drug keys: ${Object.keys(firstDrug).join(', ')}`);
        console.log(`   Sample: ${JSON.stringify(firstDrug, null, 2)}`);
      }
    } else if (bpDrugsCount > 0) {
      results.hasBlueprintDrugs.push({ id, blueprints: blueprints.length, drugCount: bpDrugsCount });
      const firstDrug = blueprints.find(bp => bp.drugs?.length > 0)?.drugs?.[0];
      console.log(`\n⚠️  [bp.drugs] ${id}`);
      console.log(`   phase_blueprints: ${blueprints.length}, total drugs: ${bpDrugsCount}`);
      if (firstDrug) {
        console.log(`   Sample drug keys: ${Object.keys(firstDrug).join(', ')}`);
        console.log(`   Sample: ${JSON.stringify(firstDrug, null, 2)}`);
      }
    } else {
      results.noDrugs.push(id);
      console.log(`\n❌ [no drugs] ${id}`);
      console.log(`   Top-level keys: ${Object.keys(data).join(', ')}`);
      if (phases.length > 0) {
        const firstPhase = phases[0];
        console.log(`   phases[0] keys: ${Object.keys(firstPhase).join(', ')}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`  Have phases.drugs_used : ${results.hasDrugsUsed.length}`);
  console.log(`  Have bp.drugs only     : ${results.hasBlueprintDrugs.length}`);
  console.log(`  NO drugs at all        : ${results.noDrugs.length}`);
  console.log('═══════════════════════════════════════════\n');

  if (results.noDrugs.length > 0) {
    console.log('Protocols with NO drugs:');
    results.noDrugs.forEach(id => console.log(`  - ${id}`));
  }
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
