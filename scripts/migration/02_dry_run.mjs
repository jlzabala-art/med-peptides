/**
 * PHASE 2 — Dry Run (ESM, read-only)
 * Shows exactly what the migration WOULD do — no writes.
 *
 * Run: node scripts/migration/02_dry_run.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { readFileSync, writeFileSync }   from 'fs';
import { join, dirname }                 from 'path';
import { fileURLToPath }                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// Collections to scan for stale references
const REF_COLLECTIONS = [
  { collection: 'prescriptions', field: 'productId' },
  { collection: 'prescriptions', field: 'items',    isArray: true, subField: 'productId' },
  { collection: 'protocols',     field: 'productId' },
  { collection: 'protocols',     field: 'products', isArray: true, subField: 'productId' },
  { collection: 'product_usage', docIdIsProductId: true },
  { collection: 'cart_items',    field: 'productId' },
];

/** Pick the canonical "winner" doc from a group sharing the same canonicalName.
 *  Prefer the shortest, cleanest ID (no supplier prefix or dosage suffix). */
function pickWinner(docs) {
  const isClean = id =>
    !id.startsWith('lotusland_') &&
    !id.startsWith('bioniq_') &&
    !id.startsWith('nplabs_') &&
    !/_(mg|mcg|ml|vial|caps|pen|spray|nasal|single_use)/.test(id);

  const clean = docs.filter(d => isClean(d.id));
  const pool  = clean.length > 0 ? clean : docs;
  return pool.sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id))[0];
}

async function dryRun() {
  console.log('🔍  Loading all products…');
  const productsSnap = await db.collection('products').get();

  console.log('🔍  Loading all variants…');
  const varSnap = await db.collectionGroup('variants').get();
  const varsByParent = {};
  varSnap.forEach(v => {
    const pid = v.ref.parent.parent.id;
    if (!varsByParent[pid]) varsByParent[pid] = [];
    varsByParent[pid].push({ id: v.id, ...v.data() });
  });

  // Group by normalised canonicalName
  const groups = {};
  productsSnap.forEach(doc => {
    const cn  = (doc.data().canonicalName || doc.data().name || doc.id).trim();
    const key = cn.toLowerCase();
    if (!groups[key]) groups[key] = { canonicalName: cn, docs: [] };
    groups[key].docs.push({
      id:       doc.id,
      data:     doc.data(),
      variants: varsByParent[doc.id] || [],
    });
  });

  const singletons = Object.values(groups).filter(g => g.docs.length === 1);
  const duplicates = Object.values(groups).filter(g => g.docs.length > 1);

  // Build merge plan
  const plan = [];
  let totalToDelete = 0, totalVarsToMove = 0;

  for (const group of duplicates) {
    const winner = pickWinner(group.docs);
    const losers = group.docs.filter(d => d.id !== winner.id);
    const loserVarCount = losers.reduce((s, d) => s + d.variants.length, 0);

    totalToDelete   += losers.length;
    totalVarsToMove += loserVarCount;

    plan.push({
      canonicalName:      group.canonicalName,
      winner:             winner.id,
      winnerCurrentVars:  winner.variants.length,
      finalVarCount:      winner.variants.length + loserVarCount,
      losers: losers.map(d => ({
        id:           d.id,
        variantCount: d.variants.length,
        variantIds:   d.variants.map(v => v.id),
      })),
    });
  }

  // Scan for cross-collection references
  console.log('🔍  Scanning cross-collection references…');
  const deletedIds = new Set(plan.flatMap(p => p.losers.map(l => l.id)));
  const refHits = {};

  for (const cfg of REF_COLLECTIONS) {
    let snap;
    try { snap = await db.collection(cfg.collection).limit(1000).get(); }
    catch (_) { continue; }

    snap.forEach(doc => {
      if (cfg.docIdIsProductId && deletedIds.has(doc.id)) {
        (refHits[cfg.collection] ??= []).push({ docId: doc.id, field: 'doc_id' });
        return;
      }
      const d = doc.data();
      if (cfg.isArray && Array.isArray(d[cfg.field])) {
        d[cfg.field].forEach(item => {
          if (item?.[cfg.subField] && deletedIds.has(item[cfg.subField])) {
            (refHits[cfg.collection] ??= []).push({ docId: doc.id, field: cfg.field, staleId: item[cfg.subField] });
          }
        });
      } else if (cfg.field && deletedIds.has(d[cfg.field])) {
        (refHits[cfg.collection] ??= []).push({ docId: doc.id, field: cfg.field, staleId: d[cfg.field] });
      }
    });
  }

  // Print summary
  const totalRefHits = Object.values(refHits).reduce((s, a) => s + a.length, 0);
  console.log('\n══════════════════════════════════════════════════');
  console.log('  DRY-RUN REPORT');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Total product docs       : ${productsSnap.size}`);
  console.log(`  Unique canonical names   : ${Object.keys(groups).length}`);
  console.log(`  Already clean            : ${singletons.length}`);
  console.log(`  Groups needing merge     : ${duplicates.length}`);
  console.log(`  Docs to delete           : ${totalToDelete}`);
  console.log(`  Variants to move         : ${totalVarsToMove}`);
  console.log(`  Cross-collection refs    : ${totalRefHits === 0 ? '✅ None' : `⚠️  ${totalRefHits} in ${Object.keys(refHits).length} collections`}`);
  if (totalRefHits > 0) {
    Object.entries(refHits).forEach(([col, hits]) =>
      console.log(`    → ${col}: ${hits.length} docs`)
    );
  }
  console.log('══════════════════════════════════════════════════');

  console.log('\n  Top merge groups (by loser count):');
  [...plan]
    .sort((a, b) => b.losers.length - a.losers.length)
    .slice(0, 15)
    .forEach(p => {
      console.log(`  [${p.losers.length + 1} docs → 1] "${p.canonicalName}"`);
      console.log(`    winner  : ${p.winner}  (${p.winnerCurrentVars} vars → ${p.finalVarCount} after merge)`);
      p.losers.forEach(l => console.log(`    delete  : ${l.id}  (${l.variantCount} vars to move)`));
    });

  // Write JSON report
  const report = {
    generatedAt: new Date().toISOString(),
    stats: {
      totalProductDocs: productsSnap.size,
      uniqueCanonicalNames: Object.keys(groups).length,
      cleanSingletons: singletons.length,
      groupsNeedingMerge: duplicates.length,
      totalDocsToDelete: totalToDelete,
      totalVariantsToMove: totalVarsToMove,
    },
    crossCollectionRefs: refHits,
    mergePlan: plan,
  };

  const ts      = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outFile = join(__dirname, `dry_run_report_${ts}.json`);
  writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n✅  Full report → ${outFile}`);
  console.log('\nReview it, then run: node scripts/migration/03_merge.mjs');
}

dryRun().catch(err => { console.error('❌ Dry-run failed:', err); process.exit(1); });
