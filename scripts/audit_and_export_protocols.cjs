/**
 * audit_and_export_protocols.cjs
 * Audits all protocols in Firestore against the canonical antigravity_v2 schema
 * and exports each protocol to its own JSON file in /export/
 *
 * Usage: node scripts/audit_and_export_protocols.cjs
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ─── Firebase init ───────────────────────────────────────────────────────────
const SA_PATH = path.resolve(__dirname, '../med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
const serviceAccount = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

// ─── Canonical required fields (antigravity_v2) ──────────────────────────────
const CANONICAL_TOP_LEVEL = [
  'protocol_id', 'protocol_title', 'protocol_slug', 'protocol_duration_weeks',
  'category', 'complexity_level', 'risk_class', 'active',
  'metadata', 'phases', 'phase_blueprints',
  'eligibility_rules', 'expected_outcomes', 'safety_profile',
];

const CANONICAL_METADATA = [
  'shortCode', 'schema_version', 'primary_goal', 'description',
  'clinical_summary', 'evidence_grade', 'visibility', 'version',
  'created_at', 'updated_at',
];

const CANONICAL_PHASE_FIELDS = [
  'phase_number', 'phase_title', 'start_week', 'end_week', 'drugs_used',
];

const CANONICAL_DRUG_FIELDS = [
  'product_slug', 'productId', 'dosing_frequency',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function missingFields(obj, required) {
  return required.filter(f => obj[f] === undefined || obj[f] === null || obj[f] === '');
}

function auditProtocol(doc) {
  const d    = doc.data();
  const id   = doc.id;
  const issues = [];

  // Top-level
  const missingTop = missingFields(d, CANONICAL_TOP_LEVEL);
  if (missingTop.length) issues.push({ level: 'ERROR', msg: `Missing top-level fields: ${missingTop.join(', ')}` });

  // Metadata
  const meta = d.metadata || {};
  const missingMeta = missingFields(meta, CANONICAL_METADATA);
  if (missingMeta.length) issues.push({ level: 'WARN', msg: `Missing metadata fields: ${missingMeta.join(', ')}` });

  // Phases
  const phases = d.phases || [];
  if (!phases.length) {
    issues.push({ level: 'ERROR', msg: 'No phases defined' });
  } else {
    phases.forEach((ph, i) => {
      const missingPh = missingFields(ph, CANONICAL_PHASE_FIELDS);
      if (missingPh.length) issues.push({ level: 'WARN', msg: `Phase[${i}] missing: ${missingPh.join(', ')}` });

      const drugs = ph.drugs_used || [];
      if (!drugs.length) issues.push({ level: 'WARN', msg: `Phase[${i}] has no drugs_used` });
      drugs.forEach((dr, j) => {
        const missingDr = missingFields(dr, CANONICAL_DRUG_FIELDS);
        if (missingDr.length) issues.push({ level: 'WARN', msg: `Phase[${i}].Drug[${j}] missing: ${missingDr.join(', ')}` });
      });
    });
  }

  // phase_blueprints
  if (!d.phase_blueprints || !d.phase_blueprints.length) {
    issues.push({ level: 'WARN', msg: 'phase_blueprints is empty or missing' });
  }

  // Schema version
  if (meta.schema_version !== 'antigravity_v2') {
    issues.push({ level: 'WARN', msg: `schema_version is "${meta.schema_version}" (expected "antigravity_v2")` });
  }

  const errors = issues.filter(i => i.level === 'ERROR').length;
  const warns  = issues.filter(i => i.level === 'WARN').length;

  return {
    id,
    protocol_id: d.protocol_id,
    protocol_title: d.protocol_title,
    shortCode: meta.shortCode,
    schema_version: meta.schema_version,
    status: errors === 0 ? (warns === 0 ? '✅ PASS' : '⚠️  WARN') : '❌ FAIL',
    errors,
    warnings: warns,
    issues,
    data: d,
  };
}

async function main() {
  console.log('\n🔍  Fetching all protocols from Firestore (blueprints collection)…\n');
  const snap = await db.collection('blueprints').get();

  if (snap.empty) {
    console.log('No protocols found.');
    process.exit(0);
  }

  const results = snap.docs.map(auditProtocol);

  // ── Print audit table ────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('  PROTOCOL AUDIT — antigravity_v2 canonical schema');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`${'ID'.padEnd(14)} ${'ShortCode'.padEnd(12)} ${'Schema'.padEnd(15)} ${'Status'.padEnd(12)} ERR WARN`);
  console.log('─'.repeat(70));

  results.forEach(r => {
    const schema = (r.schema_version || 'MISSING').padEnd(15);
    const code   = (r.shortCode || 'N/A').padEnd(12);
    const id     = (r.id || '').padEnd(14);
    console.log(`${id} ${code} ${schema} ${r.status.padEnd(12)}  ${r.errors}   ${r.warnings}`);
  });

  console.log('─'.repeat(70));
  const totalErr  = results.reduce((s, r) => s + r.errors,   0);
  const totalWarn = results.reduce((s, r) => s + r.warnings, 0);
  const pass      = results.filter(r => r.status.includes('PASS')).length;
  const warn      = results.filter(r => r.status.includes('WARN')).length;
  const fail      = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`\n  Total: ${results.length} protocols  |  ✅ ${pass} pass  ⚠️  ${warn} warn  ❌ ${fail} fail`);
  console.log(`  Total issues: ${totalErr} errors, ${totalWarn} warnings\n`);

  // ── Detailed issues ──────────────────────────────────────────────────────
  results.forEach(r => {
    if (r.issues.length) {
      console.log(`\n  ► ${r.id} (${r.shortCode || 'N/A'})`);
      r.issues.forEach(i => console.log(`      [${i.level}] ${i.msg}`));
    }
  });

  // ── Export each protocol to /export/<id>.json ────────────────────────────
  const exportDir = path.resolve(__dirname, '../export');
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

  console.log('\n\n📦  Exporting protocols to /export/…\n');
  let exported = 0;
  results.forEach(r => {
    const outPath = path.join(exportDir, `${r.id}.json`);
    // Export raw data; use doc.id as filename
    fs.writeFileSync(outPath, JSON.stringify(r.data, null, 2), 'utf-8');
    console.log(`  ✅  ${r.id}.json  (${r.status.trim()})`);
    exported++;
  });

  // ── Export combined bundle ───────────────────────────────────────────────
  const bundlePath = path.join(exportDir, 'protocols_audit_bundle.json');
  const bundle = {
    exported_at: new Date().toISOString(),
    total: results.length,
    summary: { pass, warn, fail, total_errors: totalErr, total_warnings: totalWarn },
    protocols: results.reduce((acc, r) => { acc[r.id] = r.data; return acc; }, {}),
  };
  fs.writeFileSync(bundlePath, JSON.stringify(bundle, null, 2), 'utf-8');
  console.log(`\n  📄  protocols_audit_bundle.json  (all ${exported} protocols combined)`);

  // ── Export audit report ──────────────────────────────────────────────────
  const reportPath = path.join(exportDir, 'protocol_audit_report.json');
  const report = {
    generated_at: new Date().toISOString(),
    total: results.length,
    summary: { pass, warn, fail, total_errors: totalErr, total_warnings: totalWarn },
    protocols: results.map(r => ({
      id: r.id,
      protocol_id: r.protocol_id,
      protocol_title: r.protocol_title,
      shortCode: r.shortCode,
      schema_version: r.schema_version,
      status: r.status,
      errors: r.errors,
      warnings: r.warnings,
      issues: r.issues,
    })),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`  📋  protocol_audit_report.json  (audit detail)\n`);

  console.log('═'.repeat(70));
  console.log('  Done.\n');
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
