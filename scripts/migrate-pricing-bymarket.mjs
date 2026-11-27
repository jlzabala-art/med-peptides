#!/usr/bin/env node
/**
 * migrate-pricing-bymarket.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Idempotent Firestore migration utility that populates the canonical
 * `pricing.byMarket.qatar` and `byMarket.qatar` blocks on 24Genetics & Colway
 * products so regional Qatar schedules live in Firestore (Single Source of Truth).
 *
 * Safe by default: runs in --dry-run mode unless --apply is passed.
 *
 * Usage:
 *   node scripts/migrate-pricing-bymarket.mjs          # preview only
 *   node scripts/migrate-pricing-bymarket.mjs --apply  # write to Firestore
 */

import 'dotenv/config';

const APPLY = process.argv.includes('--apply');

const QATAR_24GENETICS_PRICES = [
  { slug: '24genetics-pharmacogenetics', distributor: 475.00, currency: 'QAR' },
  { slug: '24genetics-health-dna-test', distributor: 550.00, currency: 'QAR' },
  { slug: '24genetics-nutrigenetics-dna-test', distributor: 475.00, currency: 'QAR' },
  { slug: '24genetics-complete-pack', distributor: 1048.44, currency: 'QAR' },
  { slug: '24genetics-skin-care-dna-test', distributor: 799.56, currency: 'QAR' },
  { slug: '24genetics-sport-dna-test', distributor: 750.67, currency: 'QAR' },
];

async function run() {
  console.log(`🔍 [migrate-pricing-bymarket] Mode: ${APPLY ? 'APPLY (writes to Firestore)' : 'DRY-RUN (no writes)'}`);
  const { adminDb } = await import('../src/lib/firebaseAdmin.js');
  if (!adminDb) {
    console.error('❌ Firebase Admin not initialized. Check FIREBASE_SERVICE_ACCOUNT env.');
    process.exit(1);
  }

  let updated = 0;
  for (const row of QATAR_24GENETICS_PRICES) {
    const snap = await adminDb.collection('products').where('slug', '==', row.slug).limit(1).get();
    if (snap.empty) {
      console.log(`⚠️  Not found in Firestore: slug=${row.slug}`);
      continue;
    }
    const docSnap = snap.docs[0];
    const wholesale = Number((row.distributor * 1.15).toFixed(2));
    const clinic = Number((wholesale * 1.15).toFixed(2));
    const patch = {
      byMarket: {
        ...(docSnap.data().byMarket || {}),
        qatar: { currency: row.currency, distributor: row.distributor, wholesale, clinic },
      },
      'pricing.byMarket.qatar': { currency: row.currency, distributor: row.distributor, wholesale, clinic },
      updatedAt: new Date().toISOString(),
    };
    console.log(`→ ${docSnap.id} (${row.slug}): qatar distributor=${row.distributor} QAR, wholesale=${wholesale} QAR`);
    if (APPLY) {
      await docSnap.ref.set(patch, { merge: true });
      updated++;
    }
  }

  console.log(APPLY ? `✅ Migrated ${updated} product documents.` : 'ℹ️  Dry-run complete. Re-run with --apply to commit.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
