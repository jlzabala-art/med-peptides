/**
 * enrichPhase3Research.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 3 enrichment: adds research_status and reference_pmids to every
 * product in Firestore using researchData.json as lookup source.
 *
 * DRY RUN by default — pass --apply to write to Firestore.
 * Usage:
 *   node scripts/enrichPhase3Research.mjs           ← dry-run (safe)
 *   node scripts/enrichPhase3Research.mjs --apply   ← writes to Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require      = createRequire(import.meta.url);
const svcAcct      = require('../serviceAccountKey.json');
const researchMap  = require('./data/researchData.json');

const DRY_RUN = !process.argv.includes('--apply');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

// ─── Normalize name for lookup ────────────────────────────────────────────────
function normalize(str) {
  return str?.toLowerCase().replace(/[^a-z0-9]/g, '') ?? '';
}

const researchIndex = {};
for (const [key, val] of Object.entries(researchMap)) {
  researchIndex[normalize(key)] = { key, ...val };
}

function findResearch(productName) {
  if (!productName) return null;
  const norm = normalize(productName);
  if (researchIndex[norm]) return researchIndex[norm];
  for (const [k, v] of Object.entries(researchIndex)) {
    if (norm.startsWith(k) || k.startsWith(norm)) return v;
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN
    ? '\n🔍 DRY RUN — no writes will happen\n'
    : '\n🚀 APPLY MODE — writing to Firestore\n');

  const snap     = await db.collection('products').get();
  const now      = Timestamp.now();
  let enriched   = 0;
  let skipped    = 0;
  let notFound   = 0;
  const missing  = [];

  for (const doc of snap.docs) {
    const root = doc.data();
    const ref  = db.collection('products').doc(doc.id);

    if (root.research_status && root.reference_pmids !== undefined) {
      console.log(`⏭  [${doc.id}] already has research data — skipping`);
      skipped++;
      continue;
    }

    const research = findResearch(root.name);

    if (!research) {
      console.log(`❓ [${doc.id}] "${root.name}" — no research entry found`);
      missing.push({ id: doc.id, name: root.name ?? '(unknown)' });
      notFound++;
      continue;
    }

    const pmidCount = research.reference_pmids?.length ?? 0;
    console.log(`✅ [${doc.id}] "${root.name}"`);
    console.log(`   status: ${research.research_status} | pmids: ${pmidCount}`);

    if (!DRY_RUN) {
      await ref.update({
        research_status:  research.research_status,
        reference_pmids:  research.reference_pmids ?? [],
        _phase3At:        now,
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
    console.log('Products with NO research entry (add to researchData.json):');
    missing.forEach(p => console.log(`  • [${p.id}] ${p.name}`));
    console.log('');
  }

  if (DRY_RUN && enriched > 0) {
    console.log('👆 Review above, then run with --apply to write to Firestore.\n');
  } else if (!DRY_RUN && enriched > 0) {
    console.log('🎉 Phase 3 enrichment complete.\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
