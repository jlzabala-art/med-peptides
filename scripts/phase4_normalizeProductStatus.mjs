/**
 * phase4_normalizeProductStatus.mjs
 *
 * Adds missing fields to ALL products and their variants:
 *   Product doc:
 *     - status     → 'active'  (if not already set)
 *     - slug       → Firestore doc ID  (deterministic, already used by routing)
 *     - isActive   → true  (if not already set)
 *
 *   Each variant doc:
 *     - isActive   → true  (if not already set)
 *     - currency in master pricing → 'USD'  (for consistency)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { createRequire }       from 'module';

const require = createRequire(import.meta.url);
const sa      = require('../serviceAccountKey.json');

initializeApp({ credential: cert(sa) });
const db = getFirestore();

const BATCH_SIZE = 400; // Firestore max = 500 ops per batch

async function run() {
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products`);

  let batch      = db.batch();
  let opCount    = 0;
  let pUpdated   = 0;
  let vUpdated   = 0;

  const flush = async () => {
    if (opCount > 0) {
      await batch.commit();
      batch   = db.batch();
      opCount = 0;
    }
  };

  for (const productDoc of productsSnap.docs) {
    const data   = productDoc.data();
    const ref    = productDoc.ref;
    const update = {};

    if (!data.status)            update.status   = 'active';
    if (!data.slug)              update.slug     = productDoc.id;   // doc ID is already the slug
    if (data.isActive === undefined) update.isActive = true;

    if (Object.keys(update).length > 0) {
      batch.update(ref, update);
      opCount++;
      pUpdated++;
    }

    // ── Variants ────────────────────────────────────────────────
    const variantsSnap = await ref.collection('variants').get();
    for (const variantDoc of variantsSnap.docs) {
      const vData  = variantDoc.data();
      const vRef   = variantDoc.ref;
      const vUpdate = {};

      if (vData.isActive === undefined) vUpdate.isActive = true;

      // Ensure master pricing has currency field
      if (vData.pricing?.master && !vData.pricing.master.currency) {
        vUpdate['pricing.master.currency'] = 'USD';
      }

      if (Object.keys(vUpdate).length > 0) {
        batch.update(vRef, vUpdate);
        opCount++;
        vUpdated++;
      }

      if (opCount >= BATCH_SIZE) await flush();
    }

    if (opCount >= BATCH_SIZE) await flush();
  }

  await flush();

  console.log(`\n✅ Done.`);
  console.log(`   Products updated : ${pUpdated}/${productsSnap.size}`);
  console.log(`   Variants updated : ${vUpdated}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
