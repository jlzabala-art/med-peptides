/**
 * ============================================================
 *  ANTIGRAVITY — Pharma-Grade Protocol Renaming Script
 *  Collection: protocol_templates (Firestore)
 *  Author: Principal Clinical Data Architect
 *  Date: 2026-04-21
 * ============================================================
 *
 *  USAGE:
 *    node scripts/rename-protocols-pharma-grade.js          <- Safe Mode (dry-run, prints diff)
 *    node scripts/rename-protocols-pharma-grade.js --apply  <- Commits changes to Firestore
 *
 *  DEPENDENCIES:
 *    npm install firebase-admin
 *
 *  SETUP:
 *    Place your Firebase service account key at:
 *    scripts/serviceAccountKey.json
 * ============================================================
 */

const admin = require('firebase-admin');
const path  = require('path');

// ── Firebase Init ────────────────────────────────────────────
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── Nomenclature Map (Pharma-Grade) ─────────────────────────
//
//  Format:  [Therapeutic Target] + [Mechanism of Action] + [Protocol Type]
//  Rules:
//    - Derived from pharmacodynamics of primary compounds
//    - No marketing language (Structured / Personalized / Advanced)
//    - Slug: lowercase, hyphens, mechanism-anchored
// ─────────────────────────────────────────────────────────────

const RENAME_MAP = [
  {
    docId: 'wm_001',
    compound: 'Tirzepatide (LY3298176)',
    mechanism: 'GLP-1 + GIP dual receptor agonism → enhanced incretin response + insulin secretion',
    OLD: {
      protocol_title: 'GLP-1/GIP Dual-Agonist Metabolic Titration Protocol',
      protocol_slug:  'glp1-gip-titration-12w',
    },
    NEW: {
      protocol_title: 'GLP-1/GIP Receptor Dual-Agonist Titration Protocol',
      protocol_slug:  'glp1-gip-dual-agonist-titration',
    },
  },
  {
    docId: 'wm_002',
    compound: 'Semaglutide + Cagrilintide (GCA)',
    mechanism: 'GLP-1 receptor agonism + long-acting amylin analogue → synergistic satiety signalling',
    OLD: {
      protocol_title: 'Semaglutide-Cagrilintide (GCA) Investigational Pathway',
      protocol_slug:  'semaglutide-cagrilintide-research-12w',
    },
    NEW: {
      protocol_title: 'Semaglutide-Cagrilintide Synergistic Research Pathway',
      protocol_slug:  'sema-cagri-amylin-glp1-synergy',
    },
  },
  {
    docId: 'wm_003',
    compound: 'Retatrutide (LY3437943)',
    mechanism: 'Triple agonism: GLP-1 + GIP + Glucagon receptor → maximal metabolic flux',
    OLD: {
      protocol_title: 'Triple-Hormone Agonist (GLP-1/GIP/GCGR) Research Protocol',
      protocol_slug:  'triple-agonist-retatrutide-16w',
    },
    NEW: {
      protocol_title: 'Triple-Hormone Agonist (GLP-1/GIP/GCGR) Intensive Protocol',
      protocol_slug:  'triple-agonist-glp1-gip-gcgr-intensive',
    },
  },
  {
    docId: 'wm_004',
    compound: 'Tirzepatide + Metabolic Adjuvants (Metformin, SGLT2i, NNMT-i)',
    mechanism: 'GIP/GLP-1 agonism potentiated by adjuvant metabolic modulators → multi-pathway energy balance',
    OLD: {
      protocol_title: 'GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants',
      protocol_slug:  'tirzepatide-metabolic-adjunct-12w',
    },
    NEW: {
      protocol_title: 'GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants',
      protocol_slug:  'gip-glp1-agonism-metabolic-adjuvants',
    },
  },
];

// ── Safe Mode Output ─────────────────────────────────────────
function printDiff() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SAFE MODE — Human Validation Required Before Apply         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  RENAME_MAP.forEach(({ docId, compound, mechanism, OLD, NEW }) => {
    const titleChanged = OLD.protocol_title !== NEW.protocol_title;
    const slugChanged  = OLD.protocol_slug  !== NEW.protocol_slug;

    console.log(`┌─ [${docId.toUpperCase()}] ─────────────────────────────────────────`);
    console.log(`│  Compound  : ${compound}`);
    console.log(`│  Mechanism : ${mechanism}`);
    console.log(`│`);
    console.log(`│  protocol_title`);
    console.log(`│    OLD: "${OLD.protocol_title}"`);
    console.log(`│    NEW: "${NEW.protocol_title}" ${titleChanged ? '← CHANGED' : '← NO CHANGE'}`);
    console.log(`│`);
    console.log(`│  protocol_slug`);
    console.log(`│    OLD: "${OLD.protocol_slug}"`);
    console.log(`│    NEW: "${NEW.protocol_slug}" ${slugChanged ? '← CHANGED' : '← NO CHANGE'}`);
    console.log(`└──────────────────────────────────────────────────────────────\n`);
  });

  console.log('► To apply changes, run:');
  console.log('    node scripts/rename-protocols-pharma-grade.js --apply\n');
}

// ── Batch Apply ──────────────────────────────────────────────
async function applyRenames() {
  console.log('\n⚡ Applying pharma-grade renaming — Firestore Batch Write...\n');

  const batch = db.batch();
  const now   = admin.firestore.FieldValue.serverTimestamp();

  RENAME_MAP.forEach(({ docId, NEW }) => {
    const ref = db.collection('protocol_templates').doc(docId);
    batch.update(ref, {
      protocol_title: NEW.protocol_title,
      protocol_slug:  NEW.protocol_slug,
      'metadata.updated_at': now,
    });
    console.log(`  ✔ Queued: ${docId}  →  "${NEW.protocol_title}"`);
  });

  await batch.commit();

  console.log('\n✅ Batch commit successful. All protocol_templates updated atomically.');
  console.log('   Fields modified per document:');
  console.log('     • protocol_title');
  console.log('     • protocol_slug');
  console.log('     • metadata.updated_at (server timestamp)\n');
}

// ── Entry Point ──────────────────────────────────────────────
const APPLY = process.argv.includes('--apply');

if (APPLY) {
  applyRenames()
    .then(() => process.exit(0))
    .catch(err => { console.error('❌ Error during batch apply:', err); process.exit(1); });
} else {
  printDiff();
}
