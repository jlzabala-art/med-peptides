/**
 * deleteEmptyDuplicates.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Deletes product documents that have NO variants subcollection AND no pricing
 * fields — these are the short-slug legacy duplicates (e.g. bpc-157, tirzepatide).
 *
 * DRY RUN by default — pass --apply to delete from Firestore.
 * Usage:
 *   node scripts/deleteEmptyDuplicates.mjs           ← dry-run (safe)
 *   node scripts/deleteEmptyDuplicates.mjs --apply   ← deletes from Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require  = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');
const DRY_RUN  = !process.argv.includes('--apply');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const PRICE_FIELDS = [
  'guestVialPrice', 'proVialPrice', 'guestKitPrice', 'proKitPrice',
  'perVialPriceUSD', 'kitPriceUSD',
];

function hasPricingFields(data) {
  return PRICE_FIELDS.some(f => data[f] !== undefined && data[f] !== null);
}

async function main() {
  console.log(DRY_RUN
    ? '\n🔍 DRY RUN — no deletes will happen\n'
    : '\n🗑  APPLY MODE — deleting from Firestore\n');

  const snap = await db.collection('products').get();
  let deleted  = 0;
  let kept     = 0;
  const toDelete = [];

  for (const doc of snap.docs) {
    const root = doc.data();
    const ref  = db.collection('products').doc(doc.id);

    // Keep if it has pricing fields in root
    if (hasPricingFields(root)) { kept++; continue; }

    // Keep if it has a variants subcollection
    const variants = await ref.collection('variants').limit(1).get();
    if (!variants.empty) { kept++; continue; }

    // Keep if it has _variantsMigrated flag (just migrated)
    if (root._variantsMigrated) { kept++; continue; }

    // This doc has no price data and no variants → candidate for deletion
    toDelete.push({ id: doc.id, name: root.name ?? '(unknown)', ref });
    console.log(`🗑  [${doc.id}] "${root.name ?? '(unknown)'}" — empty duplicate`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Total scanned : ${snap.size}`);
  console.log(`  🗑  To delete  : ${toDelete.length}`);
  console.log(`  ✅ Kept        : ${kept}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (!DRY_RUN && toDelete.length > 0) {
    console.log('Deleting...');
    // Batch delete in chunks of 400
    const CHUNK = 400;
    for (let i = 0; i < toDelete.length; i += CHUNK) {
      const batch = db.batch();
      toDelete.slice(i, i + CHUNK).forEach(({ ref }) => batch.delete(ref));
      await batch.commit();
      deleted += Math.min(CHUNK, toDelete.length - i);
      console.log(`  Deleted ${deleted}/${toDelete.length}...`);
    }
    console.log(`\n🎉 Done — ${deleted} empty duplicates removed.\n`);
  } else if (DRY_RUN && toDelete.length > 0) {
    console.log('👆 Review above, then run with --apply to delete.\n');
  } else {
    console.log('✅ Nothing to delete.\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
