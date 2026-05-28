'use strict';

/**
 * patch_phase2a_category_shortcode.cjs
 * Fase 2A — Fix `category` (top-level) and `metadata.shortCode`
 * for the 12 migrated protocols that have wrong/missing values.
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

// ── Correction map ────────────────────────────────────────────────────────────
// key = Firestore document ID
const CORRECTIONS = {
  rec_001: {
    category:  'Recovery & Tissue Repair',
    shortCode: 'REC-001',
    primary_goal: 'Recovery & Tissue Repair',
  },
  rec_002: {
    category:  'Recovery & Neurology',
    shortCode: 'REC-002',
    primary_goal: 'Recovery & Neurology',
  },
  sa_001: {
    category:  'Sexual Health & Anti-Aging',
    shortCode: 'SA-001',
    primary_goal: 'Sexual Health & Anti-Aging',
  },
  skn_001: {
    category:  'Skin & Aesthetics',
    shortCode: 'SKN-001',
    primary_goal: 'Skin & Aesthetics',
  },
  skin_001: {
    category:  'Skin & Aesthetics',
    shortCode: 'SKIN-001',
    primary_goal: 'Skin & Aesthetics',
  },
  skin_002: {
    category:  'Skin & Aesthetics',
    shortCode: 'SKIN-002',
    primary_goal: 'Skin & Aesthetics',
  },
  sleep_001: {
    category:  'Sleep & Recovery',
    shortCode: 'SLP-001',
    primary_goal: 'Sleep & Recovery',
  },
  sleep_002: {
    category:  'Sleep & Recovery',
    shortCode: 'SLP-002',
    primary_goal: 'Sleep & Recovery',
  },
  wm_001: {
    category:  'Weight Management',
    shortCode: 'WMT-001',
    primary_goal: 'Weight Management',
  },
  wm_002: {
    category:  'Weight Management',
    shortCode: 'WMT-002',
    primary_goal: 'Weight Management',
  },
  wm_003: {
    category:  'Weight Management',
    shortCode: 'WMT-003',
    primary_goal: 'Weight Management',
  },
  wm_004: {
    category:  'Weight Management',
    shortCode: 'WMT-004',
    primary_goal: 'Weight Management',
  },
  wm_005: {
    category:  'Weight Management',
    shortCode: 'WML-005',
    primary_goal: 'Weight Management',
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 2A PATCH — category + shortCode');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let patched = 0, skipped = 0, errors = 0;

  for (const [docId, fix] of Object.entries(CORRECTIONS)) {
    const ref = db.collection('protocols').doc(docId);
    const snap = await ref.get();

    if (!snap.exists) {
      console.log(`  ⚠️   ${docId.padEnd(16)} NOT FOUND in Firestore — skipping`);
      skipped++;
      continue;
    }

    const data = snap.data();
    const currentCategory = data.category || '(none)';
    const currentShortCode = data.metadata?.shortCode || '(none)';

    // Build update
    const update = {
      category:     fix.category,
      primary_goal: fix.primary_goal,
      'metadata.shortCode':    fix.shortCode,
      'metadata.primary_goal': fix.primary_goal,
    };

    try {
      await ref.update(update);
      console.log(`  ✅  ${docId.padEnd(16)} category: "${currentCategory}" → "${fix.category}"  |  shortCode: "${currentShortCode}" → "${fix.shortCode}"`);
      patched++;
    } catch (err) {
      console.error(`  ❌  ${docId.padEnd(16)} ERROR: ${err.message}`);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅  Patched: ${patched}  |  Skipped: ${skipped}  |  Errors: ${errors}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  await admin.app().delete();
}

run().catch(err => { console.error(err); process.exit(1); });
