/**
 * phase5_markSupplementStubsDraft.mjs
 *
 * Finds all documents in the `products/` collection that have NO
 * `variants` subcollection and marks them as:
 *   status: 'draft'
 *   isActive: false
 *   _stubReason: 'no-variants-subcollection'
 *
 * These are the ~112 supplement/orphan stub docs that pre-date the
 * canonical migration and are not used by the live frontend (which
 * reads from the `supplements/` collection instead).
 *
 * The docs are NOT deleted — they are merely de-activated so they
 * won't pollute catalog queries that filter by isActive: true.
 *
 * Run: node scripts/phase5_markSupplementStubsDraft.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { createRequire }       from 'module';

const require = createRequire(import.meta.url);
const sa      = require('../serviceAccountKey.json');

initializeApp({ credential: cert(sa) });
const db = getFirestore();

const BATCH_SIZE = 400;

async function run() {
  const productsSnap = await db.collection('products').get();
  console.log(`\nScanning ${productsSnap.size} product documents for variant-less stubs…\n`);

  let batch    = db.batch();
  let opCount  = 0;
  let stubs    = 0;
  let skipped  = 0;

  const flush = async () => {
    if (opCount > 0) {
      await batch.commit();
      batch   = db.batch();
      opCount = 0;
    }
  };

  const now = new Date().toISOString();

  for (const productDoc of productsSnap.docs) {
    const variantsSnap = await productDoc.ref.collection('variants').limit(1).get();

    if (!variantsSnap.empty) {
      // Has at least one variant — leave it alone
      skipped++;
      continue;
    }

    // No variants → stub document
    const data = productDoc.data();

    // Skip if already marked as draft (idempotent)
    if (data.status === 'draft' && data.isActive === false) {
      skipped++;
      continue;
    }

    batch.update(productDoc.ref, {
      status:       'draft',
      isActive:     false,
      _stubReason:  'no-variants-subcollection',
      _stubMarkedAt: now,
    });

    opCount++;
    stubs++;
    console.log(`  ⟶  ${productDoc.id}`);

    if (opCount >= BATCH_SIZE) await flush();
  }

  await flush();

  console.log('\n────────────────────────────────────────');
  console.log(`✅  Phase 5 complete.`);
  console.log(`    Stubs marked as draft : ${stubs}`);
  console.log(`    Already clean / skipped: ${skipped}`);
  console.log('────────────────────────────────────────\n');
  process.exit(0);
}

run().catch(err => { console.error('Fatal:', err); process.exit(1); });
