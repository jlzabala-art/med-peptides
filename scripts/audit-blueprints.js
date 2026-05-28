/**
 * audit-blueprints.js
 * Usage: node scripts/audit-blueprints.js
 * Checks all Firestore 'blueprints' docs for missing / empty required fields
 * and prints a concise completeness report.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: 'Med-Peptides-app' });
}

const db = getFirestore();

// ─── Required top-level fields ─────────────────────────────────────────────
const REQUIRED_TOP = [
  'protocol_id',
  'protocol_title',
  'bundleVersion',
  'active',
  'complexity_level',
  'primary_goal',
  'protocol_duration_weeks',
  'overview_summary',
  'phase_blueprints',
  'eligibility_rules',
  'monitoring_plan',
  'dosing_enrichment',
  'risk_class',
  'status',
];

// ─── Required metadata sub-fields ─────────────────────────────────────────
const REQUIRED_META = [
  'description',
  'longDescription',
  'keywords',
  'references',
  'abbreviatedName',
];

// ─── Required economics sub-fields ─────────────────────────────────────────
const REQUIRED_ECON = [
  'total_vials_required',
];

function isEmpty(val) {
  if (val === undefined || val === null) return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && Object.keys(val).length === 0) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  return false;
}

async function audit() {
  const snapshot = await db.collection('blueprints').get();
  const results = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const missing = [];

    // Top-level fields
    for (const field of REQUIRED_TOP) {
      if (isEmpty(data[field])) missing.push(field);
    }

    // metadata sub-fields
    const meta = data.metadata ?? {};
    for (const field of REQUIRED_META) {
      if (isEmpty(meta[field])) missing.push(`metadata.${field}`);
    }

    // economics sub-fields
    const econ = data.economics ?? {};
    for (const field of REQUIRED_ECON) {
      if (isEmpty(econ[field])) missing.push(`economics.${field}`);
    }

    results.push({ id: doc.id, missing });
  }

  // ─── Print report ──────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log('  Blueprint Completeness Audit');
  console.log(`  Total protocols in Firestore: ${results.length}`);
  console.log('══════════════════════════════════════════════\n');

  const complete = results.filter(r => r.missing.length === 0);
  const incomplete = results.filter(r => r.missing.length > 0);

  if (complete.length) {
    console.log(`✅ Complete (${complete.length}):`);
    complete.forEach(r => console.log(`   • ${r.id}`));
    console.log();
  }

  if (incomplete.length) {
    console.log(`⚠️  Incomplete (${incomplete.length}):`);
    for (const r of incomplete.sort((a, b) => b.missing.length - a.missing.length)) {
      console.log(`\n  ❌ ${r.id}  (${r.missing.length} missing)`);
      r.missing.forEach(f => console.log(`       – ${f}`));
    }
  }

  console.log('\n══════════════════════════════════════════════\n');
}

audit().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
