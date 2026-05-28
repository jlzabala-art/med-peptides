#!/usr/bin/env node
/**
 * migrate_price_tiers.mjs
 *
 * Maps legacy flat price fields to the 4-tier schema used by the new
 * AdminPricesTab and B2B pricing engine.
 *
 * LEGACY fields (to keep for backward compat, marked deprecated):
 *   guestVialPrice   → tier1_vial  (public / guest)
 *   guestKitPrice    → tier1_kit
 *   proVialPrice     → tier2_vial  (pro / clinic)
 *   proKitPrice      → tier2_kit
 *
 * NEW fields (added):
 *   tier1_vial, tier1_kit   — Guest / retail
 *   tier2_vial, tier2_kit   — Pro / clinic (same as proPrice)
 *   tier3_vial, tier3_kit   — Wholesale (auto: tier2 * 0.85)
 *   tier4_vial, tier4_kit   — Institutional / bulk (auto: tier2 * 0.72)
 *
 * USAGE:
 *   node scripts/migrate_price_tiers.mjs [--dry-run] [--collection products]
 *
 * FLAGS:
 *   --dry-run       Preview changes without writing to Firestore
 *   --collection    Target Firestore collection (default: products)
 *   --batch-size    Docs per batch write (default: 400)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Parse CLI flags ───────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const COLL_FLAG = args.indexOf('--collection');
const COLLECTION = COLL_FLAG !== -1 ? args[COLL_FLAG + 1] : 'products';
const BATCH_FLAG = args.indexOf('--batch-size');
const BATCH_SIZE = BATCH_FLAG !== -1 ? parseInt(args[BATCH_FLAG + 1], 10) : 400;

// ── Tier multipliers ──────────────────────────────────────────────────────────
const TIER3_MULTIPLIER = 0.85;  // Wholesale
const TIER4_MULTIPLIER = 0.72;  // Institutional

// ── Init Firebase Admin ───────────────────────────────────────────────────────
let serviceAccountPath = resolve(__dirname, '../service-account.json');
try {
  readFileSync(serviceAccountPath);
} catch {
  serviceAccountPath = resolve(__dirname, '../firebase-service-account.json');
}

let db;
try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  const app = initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore(app);
} catch (err) {
  console.error('❌  Cannot load service account. Ensure service-account.json exists at project root.');
  console.error('    Error:', err.message);
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100; }

function buildTiers(doc) {
  const guestVial = parseFloat(doc.guestVialPrice) || 0;
  const guestKit  = parseFloat(doc.guestKitPrice)  || 0;
  const proVial   = parseFloat(doc.proVialPrice)   || round2(guestVial * 0.85);
  const proKit    = parseFloat(doc.proKitPrice)    || round2(guestKit  * 0.85);

  return {
    // Tier 1 — Guest / retail (mirrors legacy guestPrice)
    tier1_vial: guestVial,
    tier1_kit:  guestKit,
    // Tier 2 — Pro / clinic (mirrors legacy proPrice)
    tier2_vial: proVial,
    tier2_kit:  proKit,
    // Tier 3 — Wholesale (calculated)
    tier3_vial: round2(proVial * TIER3_MULTIPLIER),
    tier3_kit:  round2(proKit  * TIER3_MULTIPLIER),
    // Tier 4 — Institutional / bulk
    tier4_vial: round2(proVial * TIER4_MULTIPLIER),
    tier4_kit:  round2(proKit  * TIER4_MULTIPLIER),
    // Mark migration as done
    _priceTiersMigrated: true,
    _priceTiersMigratedAt: new Date().toISOString(),
  };
}

function needsMigration(doc) {
  return !doc._priceTiersMigrated;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🚀  Price Tier Migration`);
  console.log(`   Collection : ${COLLECTION}`);
  console.log(`   Mode       : ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '✍️  LIVE'}`);
  console.log(`   Batch size : ${BATCH_SIZE}\n`);

  const snap = await db.collection(COLLECTION).get();
  const docs  = snap.docs.filter(d => needsMigration(d.data()));

  console.log(`📦  Found ${snap.size} total docs, ${docs.length} need migration.\n`);

  if (docs.length === 0) {
    console.log('✅  Nothing to migrate. All documents already have tier pricing.\n');
    return;
  }

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;

  // Process in batches
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const chunk = docs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const docSnap of chunk) {
      const data = docSnap.data();
      const tiers = buildTiers(data);

      console.log(`  → [${docSnap.id}] ${data.name || '(no name)'}`);
      console.log(`       T1 vial: ${tiers.tier1_vial}  kit: ${tiers.tier1_kit}`);
      console.log(`       T2 vial: ${tiers.tier2_vial}  kit: ${tiers.tier2_kit}`);
      console.log(`       T3 vial: ${tiers.tier3_vial}  kit: ${tiers.tier3_kit}  (wholesale)`);
      console.log(`       T4 vial: ${tiers.tier4_vial}  kit: ${tiers.tier4_kit}  (institutional)`);

      if (!DRY_RUN) {
        batch.update(docSnap.ref, tiers);
      }
      migrated++;
    }

    if (!DRY_RUN) {
      try {
        await batch.commit();
        console.log(`\n✅  Batch ${Math.floor(i / BATCH_SIZE) + 1} committed (${chunk.length} docs)\n`);
      } catch (err) {
        console.error(`\n❌  Batch commit failed:`, err.message);
        errors += chunk.length;
        migrated -= chunk.length;
      }
    }
  }

  console.log('\n──────────────────────────────────');
  console.log(`  Migrated : ${migrated}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Errors   : ${errors}`);
  if (DRY_RUN) console.log('\n  ⚠️  DRY RUN — no changes were written to Firestore.');
  console.log('──────────────────────────────────\n');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
