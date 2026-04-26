/**
 * enrichPhase4Clinical.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 4 enrichment: writes scientificName, molecular_weight, molecular_formula,
 * mechanisms, pharmacokinetics, and storage_conditions from clinicalData.json
 * to every matching product in Firestore.
 *
 * DRY RUN by default — pass --apply to write to Firestore.
 * Usage:
 *   node scripts/enrichPhase4Clinical.mjs           ← dry-run
 *   node scripts/enrichPhase4Clinical.mjs --apply   ← writes to Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require      = createRequire(import.meta.url);
const svcAcct      = require('../serviceAccountKey.json');
const clinicalMap  = require('./data/clinicalData.json');

const DRY_RUN = !process.argv.includes('--apply');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

// ─── Normalize name for lookup ────────────────────────────────────────────────
function normalize(str) {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
}

const clinicalIndex = {};
for (const [key, val] of Object.entries(clinicalMap)) {
  clinicalIndex[normalize(key)] = { key, ...val };
}

function findClinical(productName) {
  if (!productName) return null;
  const norm = normalize(productName);
  if (clinicalIndex[norm]) return clinicalIndex[norm];
  for (const [k, v] of Object.entries(clinicalIndex)) {
    if (norm.startsWith(k) || k.startsWith(norm)) return v;
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN
    ? '\n🔍 DRY RUN — no writes will happen\n'
    : '\n🚀 APPLY MODE — writing to Firestore\n');

  const snap    = await db.collection('products').get();
  const now     = Timestamp.now();
  let enriched  = 0;
  let skipped   = 0;
  let notFound  = 0;
  const missing = [];

  for (const doc of snap.docs) {
    const root = doc.data();
    const ref  = db.collection('products').doc(doc.id);

    // Skip if all four core clinical fields already present
    if (root.scientificName && root.mechanisms && root.pharmacokinetics && root.storage_conditions) {
      console.log(`⏭  [${doc.id}] already has clinical data — skipping`);
      skipped++;
      continue;
    }

    const clinical = findClinical(root.name);

    if (!clinical) {
      console.log(`❓ [${doc.id}] "${root.name}" — no clinical entry found`);
      missing.push({ id: doc.id, name: root.name ?? '(unknown)' });
      notFound++;
      continue;
    }

    console.log(`✅ [${doc.id}] "${root.name}"`);
    console.log(`   scientificName: ${clinical.scientificName}`);
    console.log(`   MW: ${clinical.molecular_weight} | mechanisms: ${clinical.mechanisms?.length ?? 0}`);

    if (!DRY_RUN) {
      await ref.update({
        scientificName:     clinical.scientificName      ?? null,
        molecular_weight:   clinical.molecular_weight    ?? null,
        molecular_formula:  clinical.molecular_formula   ?? null,
        mechanisms:         clinical.mechanisms          ?? [],
        pharmacokinetics:   clinical.pharmacokinetics    ?? {},
        storage_conditions: clinical.storage_conditions  ?? {},
        _phase4At:          now,
      });
    }

    enriched++;
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Total products  : ${snap.size}`);
  console.log(`  ✅ Enriched     : ${enriched}`);
  console.log(`  ⏭  Skipped      : ${skipped} (already had data)`);
  console.log(`  ❓ Not matched  : ${notFound}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (missing.length > 0) {
    console.log('Products with NO clinical entry (add to clinicalData.json):');
    missing.forEach(p => console.log(`  • [${p.id}] ${p.name}`));
    console.log('');
  }

  if (DRY_RUN && enriched > 0) {
    console.log('👆 Review above, then run with --apply to write to Firestore.\n');
  } else if (!DRY_RUN && enriched > 0) {
    console.log('🎉 Phase 4 enrichment complete.\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
