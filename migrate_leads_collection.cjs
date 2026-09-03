/**
 * migrate_leads_collection.cjs
 *
 * One-time migration: copies all docs from `catalogLeadRequests` → `leads`
 * using merge:true so existing leads docs are preserved.
 *
 * Usage:
 *   DRY_RUN=true  node migrate_leads_collection.cjs   ← preview only
 *   DRY_RUN=false node migrate_leads_collection.cjs   ← live write
 */

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
const admin = require('firebase-admin');

const DRY_RUN = process.env.DRY_RUN !== 'false';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Leads Collection Migration`);
  console.log(`  catalogLeadRequests  →  leads`);
  console.log(`  Mode: ${DRY_RUN ? '🔍 DRY RUN' : '🚀 LIVE WRITE'}`);
  console.log(`${'='.repeat(60)}\n`);

  // 1. Read all docs from catalogLeadRequests
  const srcSnap = await db.collection('catalogLeadRequests').get();
  console.log(`  Source (catalogLeadRequests): ${srcSnap.size} docs`);

  // 2. Read existing leads to check overlap
  const destSnap = await db.collection('leads').get();
  const existingIds = new Set(destSnap.docs.map(d => d.id));
  console.log(`  Destination (leads): ${destSnap.size} docs existing\n`);

  let migrated = 0;
  let skipped  = 0;
  let errors   = 0;

  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const srcDoc of srcSnap.docs) {
    try {
      const data = srcDoc.data();
      const targetRef = db.collection('leads').doc(srcDoc.id);

      if (existingIds.has(srcDoc.id)) {
        // Doc already in leads — merge to fill any missing fields
        console.log(`  MERGE  ${srcDoc.id} | ${data.email || data.contactName || '—'}`);
        if (!DRY_RUN) {
          batch.set(targetRef, { ...data, _migratedFrom: 'catalogLeadRequests', _migratedAt: new Date().toISOString() }, { merge: true });
          batchCount++;
        }
      } else {
        // New doc — set with migration metadata
        console.log(`  COPY   ${srcDoc.id} | ${data.email || data.contactName || '—'}`);
        if (!DRY_RUN) {
          batch.set(targetRef, { ...data, _migratedFrom: 'catalogLeadRequests', _migratedAt: new Date().toISOString() });
          batchCount++;
        }
      }

      migrated++;

      // Commit batch every BATCH_SIZE ops
      if (!DRY_RUN && batchCount >= BATCH_SIZE) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
        console.log(`  ✓ Committed batch of ${BATCH_SIZE}`);
      }
    } catch (err) {
      console.error(`  ✗ Error on ${srcDoc.id}:`, err.message);
      errors++;
    }
  }

  // Commit remaining
  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
    console.log(`  ✓ Committed final batch of ${batchCount}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Migration ${DRY_RUN ? 'Preview' : 'Complete'}`);
  console.log(`  To migrate:  ${migrated}`);
  console.log(`  Errors:      ${errors}`);
  if (DRY_RUN) {
    console.log(`\n  ⚠️  This was a DRY RUN. No data was written.`);
    console.log(`  Run with DRY_RUN=false to apply.`);
  } else {
    console.log(`\n  ✅ ${migrated} docs copied/merged to 'leads'.`);
    console.log(`  Next: update catalogRepository.js to write to 'leads'.`);
  }
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(console.error).finally(() => process.exit(0));
