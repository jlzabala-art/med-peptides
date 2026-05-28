/**
 * sync_protocols_to_firestore.js
 * Syncs all 25 patched protocol JSON files from export/protocols/ to Firestore.
 * Uses firebase-admin with Application Default Credentials (Firebase CLI login).
 *
 * Run from project root:
 *   node scripts/sync_protocols_to_firestore.js
 */

const admin = require("../functions/node_modules/firebase-admin");
const fs = require("fs");
const path = require("path");

// ── Config ─────────────────────────────────────────────────────────────────
const PROJECT_ID = "Med-Peptides-app";
const COLLECTION = "protocols";
const EXPORT_DIR = path.join(__dirname, "../export/protocols");
const SKIP = new Set([
  "enhanced_protocols_bundle_weight_management_wm001_wm005.json",
  "audit_report.json",
]);
// ───────────────────────────────────────────────────────────────────────────

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
});

const db = admin.firestore();

async function syncAll() {
  const files = fs
    .readdirSync(EXPORT_DIR)
    .filter((f) => f.endsWith(".json") && !SKIP.has(f))
    .sort();

  console.log(`\n🚀 Syncing ${files.length} protocols to Firestore [${PROJECT_ID}/${COLLECTION}]\n`);

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const fname of files) {
    const filePath = path.join(EXPORT_DIR, fname);
    const raw = fs.readFileSync(filePath, "utf8");
    const doc = JSON.parse(raw);

    const docId = doc.protocol_id || doc.id;
    if (!docId) {
      console.warn(`  ⚠️  ${fname}: no protocol_id/id found — skipping`);
      failed++;
      continue;
    }

    try {
      const ref = db.collection(COLLECTION).doc(docId);

      // Stamp sync metadata
      doc._syncedAt = new Date().toISOString();
      doc._syncSource = "export/protocols/" + fname;
      doc._schemaVersion = "antigravity_v2";

      await ref.set(doc, { merge: true });
      console.log(`  ✅  ${docId} (${fname})`);
      success++;
    } catch (err) {
      console.error(`  ❌  ${docId} (${fname}): ${err.message}`);
      errors.push({ docId, fname, error: err.message });
      failed++;
    }
  }

  console.log(`\n── Summary ────────────────────────────────`);
  console.log(`   Synced:  ${success}/${files.length}`);
  console.log(`   Failed:  ${failed}`);
  if (errors.length) {
    console.log("\n── Errors ─────────────────────────────────");
    errors.forEach((e) => console.log(`   ${e.docId}: ${e.error}`));
  }
  console.log("\nDone.");
  process.exit(failed > 0 ? 1 : 0);
}

syncAll().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
