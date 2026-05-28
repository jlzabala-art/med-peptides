/**
 * Antigravity v2 — WM Protocol Batch Updater
 * Updates wm_001–wm_004 in Firestore with:
 *  - Correct scientific protocol_title & protocol_slug
 *  - primary_compound (compound, half_life_days, mechanism)
 *  - required_consumables (calculated from phase dose frequencies)
 *  - phase_blueprints enriched with monitoring_markers & drug half_life_days
 *
 * Usage:
 *   node scripts/update_wm_protocols_v2.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ── Init ──────────────────────────────────────────────────────────────────
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  // Fall back to Application Default Credentials (works with `firebase login`)
  admin.initializeApp({ projectId: 'Med-Peptides-app' });
} else {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();
const COLLECTION = 'protocols';
const JSON_DIR = path.join(__dirname, '..', 'src', 'services', 'weight_management_protocols_new_schema');
const PROTOCOLS = ['wm_001', 'wm_002', 'wm_003', 'wm_004'];

// ── Main ──────────────────────────────────────────────────────────────────
async function run() {
  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const pid of PROTOCOLS) {
    const filePath = path.join(JSON_DIR, `${pid}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ${pid}.json not found — skipping`);
      continue;
    }

    const local = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const ref = db.collection(COLLECTION).doc(pid);

    // Validate protocol_id matches before overwriting
    const snap = await ref.get();
    if (!snap.exists) {
      console.warn(`⚠️  Document ${pid} does not exist in Firestore — skipping`);
      continue;
    }
    const remote = snap.data();
    if (remote.protocol_id !== pid) {
      console.error(`❌ ${pid}: remote protocol_id mismatch (${remote.protocol_id}) — aborting this doc`);
      continue;
    }

    const update = {
      protocol_title:       local.protocol_title,
      protocol_slug:        local.protocol_slug,
      primary_compound:     local.primary_compound,
      required_consumables: local.required_consumables,
      phase_blueprints:     local.phase_blueprints,
      'metadata.schema_version': 'antigravity_v2',
      'metadata.last_refactored': now,
      'metadata.updated_at': now,
    };

    batch.update(ref, update);
    console.log(`✅ Queued ${pid}: "${local.protocol_title}" [${local.protocol_slug}]`);
  }

  await batch.commit();
  console.log('\n🚀 Batch committed to Firestore successfully.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Batch update failed:', err.message);
  process.exit(1);
});
