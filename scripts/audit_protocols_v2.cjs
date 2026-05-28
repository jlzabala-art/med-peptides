/**
 * audit_protocols_v2.cjs
 * Comprehensive audit of ALL documents in the `protocols` Firestore collection.
 * Exports per-protocol JSON + a markdown summary report to /export/
 *
 * Usage: node scripts/audit_protocols_v2.cjs
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ── Firebase init ─────────────────────────────────────────────────────────────
const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

// ── Output directory ──────────────────────────────────────────────────────────
const EXPORT_DIR = path.resolve(__dirname, '../export');
if (!fs.existsSync(EXPORT_DIR)) fs.mkdirSync(EXPORT_DIR, { recursive: true });

// ── Canonical schema checks ───────────────────────────────────────────────────
const TOP_LEVEL_REQUIRED = [
  'protocol_id', 'protocol_title', 'protocol_slug', 'protocol_duration_weeks',
  'category', 'complexity_level', 'risk_class', 'active',
  'metadata', 'phases',
  'expected_outcomes', 'monitoringSchedule', 'riskManagement',
];

const METADATA_REQUIRED = [
  'shortCode', 'schema_version', 'primary_goal', 'description',
  'evidence_grade', 'visibility',
];

const PHASE_REQUIRED = [
  'phase_number', 'phase_title', 'start_week', 'end_week', 'drugs_used',
];

const DRUG_REQUIRED = [
  'product_slug', 'dosing_frequency', 'weekly_dose',
];

// ── PDF-readiness checklist ───────────────────────────────────────────────────
function pdfReadinessScore(d) {
  const checks = {
    has_overview_summary:   !!(d.overview_summary),
    has_expected_outcomes:  !!(Array.isArray(d.expected_outcomes) ? d.expected_outcomes.length : (d.expected_outcomes?.qualitative?.length)),
    has_monitoring_schedule:!!(d.monitoringSchedule?.length),
    has_risk_management:    !!(d.riskManagement && Object.keys(d.riskManagement).length > 0),
    has_cost_data:          !!(d.computedCost || d.costData),
    has_evidence_cache:     !!(d.evidenceCache && Object.keys(d.evidenceCache).length > 0),
    has_provenance:         !!(d.provenance && Object.keys(d.provenance).length > 0),
    phases_have_objectives: !!(d.phases?.every(p => p.phase_objectives?.length > 0)),
    drugs_have_strength:    !!(d.phases?.every(p => p.drugs_used?.every(dr => dr.strength || dr.selected_strength || dr.vial_strength_used))),
    drugs_have_route:       !!(d.phases?.every(p => p.drugs_used?.every(dr => dr.route || dr.variantRef?.route))),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { score, total: Object.keys(checks).length, checks };
}

// ── Phase-level audit ─────────────────────────────────────────────────────────
function auditPhases(phases) {
  const issues = [];
  if (!Array.isArray(phases) || phases.length === 0) {
    issues.push({ level: 'ERROR', msg: 'No phases defined' });
    return issues;
  }

  phases.forEach((ph, i) => {
    PHASE_REQUIRED.forEach(f => {
      if (ph[f] === undefined || ph[f] === null || ph[f] === '') {
        issues.push({ level: 'WARN', msg: `Phase[${i}] missing field: ${f}` });
      }
    });

    const drugs = ph.drugs_used || [];
    if (!drugs.length) {
      issues.push({ level: 'WARN', msg: `Phase[${i}] "${ph.phase_title}" has no drugs_used` });
    }

    drugs.forEach((dr, j) => {
      DRUG_REQUIRED.forEach(f => {
        if (dr[f] === undefined || dr[f] === null || dr[f] === '') {
          issues.push({ level: 'WARN', msg: `Phase[${i}].Drug[${j}] missing: ${f}` });
        }
      });

      // Check weekly_dose is numeric
      if (dr.weekly_dose && isNaN(parseFloat(dr.weekly_dose))) {
        issues.push({ level: 'WARN', msg: `Phase[${i}].Drug[${j}] weekly_dose is not numeric: "${dr.weekly_dose}"` });
      }

      // Check strength parseable
      const strength = dr.strength || dr.selected_strength || dr.vial_strength_used || '';
      if (!strength) {
        issues.push({ level: 'WARN', msg: `Phase[${i}].Drug[${j}] no strength/vial_strength_used` });
      }
    });

    // Week continuity
    if (typeof ph.start_week === 'number' && typeof ph.end_week === 'number') {
      if (ph.end_week < ph.start_week) {
        issues.push({ level: 'ERROR', msg: `Phase[${i}] end_week (${ph.end_week}) < start_week (${ph.start_week})` });
      }
    }
  });

  return issues;
}

// ── Main audit function per protocol ─────────────────────────────────────────
function auditProtocol(doc) {
  const d      = doc.data();
  const id     = doc.id;
  const issues = [];
  const meta   = d.metadata || {};

  // 1. Top-level fields
  TOP_LEVEL_REQUIRED.forEach(f => {
    if (d[f] === undefined || d[f] === null || d[f] === '') {
      issues.push({ level: 'ERROR', msg: `Missing top-level field: ${f}` });
    }
  });

  // 2. Metadata fields
  METADATA_REQUIRED.forEach(f => {
    if (meta[f] === undefined || meta[f] === null || meta[f] === '') {
      issues.push({ level: 'WARN', msg: `Missing metadata.${f}` });
    }
  });

  // 3. Schema version
  if (meta.schema_version !== 'antigravity_v2') {
    issues.push({ level: 'WARN', msg: `schema_version is "${meta.schema_version}" (expected "antigravity_v2")` });
  }

  // 4. Phase audit
  const phaseIssues = auditPhases(d.phases || []);
  issues.push(...phaseIssues);

  // 5. Duration consistency
  const phases       = d.phases || [];
  const lastEndWeek  = phases.length ? Math.max(...phases.map(p => p.end_week || 0)) : 0;
  const statedDur    = d.protocol_duration_weeks || 0;
  if (lastEndWeek > 0 && statedDur > 0 && lastEndWeek !== statedDur) {
    issues.push({ level: 'WARN', msg: `Duration mismatch: protocol_duration_weeks=${statedDur} but last phase ends at week ${lastEndWeek}` });
  }

  // 6. PDF readiness
  const pdf = pdfReadinessScore(d);

  const errors   = issues.filter(i => i.level === 'ERROR').length;
  const warnings = issues.filter(i => i.level === 'WARN').length;
  const status   = errors > 0 ? '❌ FAIL' : warnings > 0 ? '⚠️  WARN' : '✅ PASS';

  return {
    id,
    protocol_id:      d.protocol_id,
    protocol_title:   d.protocol_title || '(untitled)',
    shortCode:        meta.shortCode,
    category:         d.category,
    complexity_level: d.complexity_level,
    schema_version:   meta.schema_version,
    duration_weeks:   statedDur,
    num_phases:       phases.length,
    num_drugs:        phases.reduce((s, p) => s + (p.drugs_used?.length || 0), 0),
    active:           d.active,
    status,
    errors,
    warnings,
    issues,
    pdf_readiness:    pdf,
    data:             d,
  };
}

// ── Render markdown report ────────────────────────────────────────────────────
function renderMarkdown(results, { pass, warn, fail, totalErr, totalWarn }) {
  const now = new Date().toISOString();
  const lines = [
    `# Protocol Audit Report`,
    `**Generated:** ${now}  `,
    `**Collection:** \`protocols\`  `,
    `**Total:** ${results.length} protocols — ✅ ${pass} pass · ⚠️ ${warn} warn · ❌ ${fail} fail  `,
    `**Issues:** ${totalErr} errors, ${totalWarn} warnings`,
    '',
    '---',
    '',
    '## Summary Table',
    '',
    '| ShortCode | Title | Cat | Phases | Drugs | Duration | PDF% | Status |',
    '|-----------|-------|-----|--------|-------|----------|------|--------|',
  ];

  results.forEach(r => {
    const pdfPct = Math.round((r.pdf_readiness.score / r.pdf_readiness.total) * 100);
    const title  = (r.protocol_title || '').slice(0, 45);
    lines.push(
      `| \`${r.shortCode || 'N/A'}\` | ${title} | ${r.category || '—'} | ${r.num_phases} | ${r.num_drugs} | ${r.duration_weeks}w | ${pdfPct}% | ${r.status} |`
    );
  });

  lines.push('', '---', '', '## Detailed Issues', '');
  results.forEach(r => {
    if (r.issues.length === 0) return;
    lines.push(`### ${r.shortCode || r.id} — ${r.protocol_title}`);
    lines.push('');
    r.issues.forEach(i => lines.push(`- **[${i.level}]** ${i.msg}`));
    lines.push('');
  });

  lines.push('---', '', '## PDF Readiness Breakdown', '');
  lines.push('| ShortCode | Score | Missing Checks |');
  lines.push('|-----------|-------|----------------|');
  results.forEach(r => {
    const missing = Object.entries(r.pdf_readiness.checks)
      .filter(([, v]) => !v)
      .map(([k]) => k.replace('has_', '').replace(/_/g, ' '))
      .join(', ');
    lines.push(`| \`${r.shortCode || r.id}\` | ${r.pdf_readiness.score}/${r.pdf_readiness.total} | ${missing || '—'} |`);
  });

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔍  Fetching protocols collection from Firestore…\n');
  const snap = await db.collection('protocols').get();

  if (snap.empty) {
    console.error('❌  No documents found in `protocols` collection.');
    process.exit(1);
  }

  console.log(`📋  Found ${snap.size} protocol(s). Running audit…\n`);
  const results = snap.docs.map(auditProtocol);

  // ── Console summary ───────────────────────────────────────────────────────
  const pass      = results.filter(r => r.status.includes('PASS')).length;
  const warn      = results.filter(r => r.status.includes('WARN')).length;
  const fail      = results.filter(r => r.status.includes('FAIL')).length;
  const totalErr  = results.reduce((s, r) => s + r.errors,   0);
  const totalWarn = results.reduce((s, r) => s + r.warnings, 0);

  console.log('═'.repeat(90));
  console.log('  PROTOCOL AUDIT — antigravity_v2 | protocols collection');
  console.log('═'.repeat(90));
  console.log(`${'ShortCode'.padEnd(12)} ${'Title'.padEnd(48)} ${'Ph'.padEnd(4)} ${'Dr'.padEnd(4)} ${'Wk'.padEnd(5)} ${'PDF%'.padEnd(6)} Status`);
  console.log('─'.repeat(90));

  results.forEach(r => {
    const pdfPct = Math.round((r.pdf_readiness.score / r.pdf_readiness.total) * 100);
    const code   = (r.shortCode || 'N/A').padEnd(12);
    const title  = (r.protocol_title || '').slice(0, 46).padEnd(48);
    console.log(`${code} ${title} ${String(r.num_phases).padEnd(4)} ${String(r.num_drugs).padEnd(4)} ${String(r.duration_weeks).padEnd(5)} ${String(pdfPct + '%').padEnd(6)} ${r.status}`);
  });

  console.log('─'.repeat(90));
  console.log(`\n  Total: ${results.length} protocols  |  ✅ ${pass} pass  ⚠️  ${warn} warn  ❌ ${fail} fail`);
  console.log(`  Issues: ${totalErr} errors · ${totalWarn} warnings\n`);

  // ── Detailed issues console output ────────────────────────────────────────
  results.filter(r => r.issues.length > 0).forEach(r => {
    console.log(`\n  ► ${r.shortCode || r.id}  "${r.protocol_title}"`);
    r.issues.forEach(i => console.log(`      [${i.level}] ${i.msg}`));
  });

  // ── PHASE 2: Export per-protocol JSON ─────────────────────────────────────
  console.log('\n\n📦  Exporting per-protocol JSON files to /export/protocols/…\n');
  const protocolsDir = path.join(EXPORT_DIR, 'protocols');
  if (!fs.existsSync(protocolsDir)) fs.mkdirSync(protocolsDir, { recursive: true });

  results.forEach(r => {
    const file = path.join(protocolsDir, `${r.id}.json`);
    fs.writeFileSync(file, JSON.stringify(r.data, null, 2), 'utf-8');
    const pdfPct = Math.round((r.pdf_readiness.score / r.pdf_readiness.total) * 100);
    console.log(`  ✅  ${(r.id).padEnd(20)} ${r.status.trim()}  PDF:${pdfPct}%`);
  });

  // ── PHASE 3: Export combined audit bundle ─────────────────────────────────
  const bundlePath = path.join(EXPORT_DIR, 'protocols_bundle.json');
  fs.writeFileSync(bundlePath, JSON.stringify({
    exported_at: new Date().toISOString(),
    total: results.length,
    summary: { pass, warn, fail, totalErr, totalWarn },
    protocols: results.reduce((acc, r) => { acc[r.id] = r.data; return acc; }, {}),
  }, null, 2), 'utf-8');
  console.log(`\n  📄  protocols_bundle.json  (${results.length} protocols combined)`);

  // ── PHASE 3b: Export audit report JSON ───────────────────────────────────
  const reportJsonPath = path.join(EXPORT_DIR, 'protocol_audit_report.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    total: results.length,
    summary: { pass, warn, fail, totalErr, totalWarn },
    protocols: results.map(r => ({
      id:               r.id,
      protocol_id:      r.protocol_id,
      protocol_title:   r.protocol_title,
      shortCode:        r.shortCode,
      category:         r.category,
      complexity_level: r.complexity_level,
      schema_version:   r.schema_version,
      duration_weeks:   r.duration_weeks,
      num_phases:       r.num_phases,
      num_drugs:        r.num_drugs,
      active:           r.active,
      status:           r.status,
      errors:           r.errors,
      warnings:         r.warnings,
      issues:           r.issues,
      pdf_readiness:    r.pdf_readiness,
    })),
  }, null, 2), 'utf-8');
  console.log(`  📋  protocol_audit_report.json`);

  // ── PHASE 3c: Export markdown report ─────────────────────────────────────
  const mdPath = path.join(EXPORT_DIR, 'protocol_audit_report.md');
  fs.writeFileSync(mdPath, renderMarkdown(results, { pass, warn, fail, totalErr, totalWarn }), 'utf-8');
  console.log(`  📝  protocol_audit_report.md`);

  console.log('\n' + '═'.repeat(90));
  console.log('  ✅  Audit complete. All files written to /export/\n');
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
