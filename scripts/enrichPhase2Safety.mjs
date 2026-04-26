/**
 * enrichPhase2Safety.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2 enrichment: adds safetyNote and contraindications to every product
 * in Firestore by matching product names against the safetyData.json lookup.
 *
 * DRY RUN by default — pass --apply to write to Firestore.
 * Usage:
 *   node scripts/enrichPhase2Safety.mjs           ← dry-run (safe)
 *   node scripts/enrichPhase2Safety.mjs --apply   ← writes to Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require   = createRequire(import.meta.url);
const svcAcct   = require('../serviceAccountKey.json');
const safetyMap = require('./data/safetyData.json');

const DRY_RUN = !process.argv.includes('--apply');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

// ─── Normalize name for lookup ────────────────────────────────────────────────
function normalize(str) {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
}

// Build normalized index from safetyData keys
const safetyIndex = {};
for (const [key, val] of Object.entries(safetyMap)) {
  safetyIndex[normalize(key)] = { key, ...val };
}

function findSafety(productName) {
  if (!productName) return null;
  const norm = normalize(productName);
  // Exact match
  if (safetyIndex[norm]) return safetyIndex[norm];
  // Partial match — product name starts with a key
  for (const [k, v] of Object.entries(safetyIndex)) {
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

    // Skip if already has safety data
    if (root.safetyNote && root.contraindications) {
      console.log(`⏭  [${doc.id}] already has safety data — skipping`);
      skipped++;
      continue;
    }

    const safety = findSafety(root.name);

    if (!safety) {
      console.log(`❓ [${doc.id}] "${root.name}" — no safety entry found`);
      missing.push({ id: doc.id, name: root.name ?? '(unknown)' });
      notFound++;
      continue;
    }

    console.log(`✅ [${doc.id}] "${root.name}"`);
    console.log(`   safetyNote: ${safety.safetyNote?.slice(0, 80)}…`);
    console.log(`   contraindications: ${safety.contraindications?.join(', ')}`);

    if (!DRY_RUN) {
      await ref.update({
        safetyNote:        safety.safetyNote,
        contraindications: safety.contraindications,
        _phase2At:         now,
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
    console.log('Products with NO safety entry (add to safetyData.json):');
    missing.forEach(p => console.log(`  • [${p.id}] ${p.name}`));
    console.log('');
  }

  if (DRY_RUN && enriched > 0) {
    console.log('👆 Review above, then run with --apply to write to Firestore.\n');
  } else if (!DRY_RUN && enriched > 0) {
    console.log('🎉 Phase 2 enrichment complete.\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
