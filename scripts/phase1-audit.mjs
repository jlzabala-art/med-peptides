/**
 * PHASE 1 — AUDIT CURRENT PRODUCT METADATA
 * =========================================
 * Goal: Identify current schema inconsistencies BEFORE any migration.
 *
 * Audits both products.js (peptides) and supplements.js against the
 * canonical field set defined in the migration plan.
 *
 * Output: scripts/phase1-audit-report.json
 *
 * Rules:
 *   - Read-only. Does NOT touch Firebase.
 *   - Does NOT modify any source files.
 */

import fs from 'fs';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── Canonical fields expected at root level ──────────────────────────────────
const CANONICAL_ROOT_FIELDS = [
  'id',
  'slug',
  'name',
  'productType',
  'status',
  'categories',
  'goals',
  'secondaryFactors',
  'tags',
  'mechanisms',
  'semanticKeywords',
  'synonyms',
  'safetyNote',
  'variants',
];

// ── Fields that must live inside aiContent ───────────────────────────────────
const CANONICAL_AI_CONTENT_FIELDS = [
  'summary',
  'beginnerExplanation',
  'scientificSummary',
  'faqModalEnabled',
  'scientificModalEnabled',
  'faqModalItems',
];

// ── Legacy fields that should eventually move to aiContent ───────────────────
const LEGACY_AI_FIELDS = ['faqModalItems', 'faqModalEnabled', 'scientificModalEnabled'];

// ── Type-specific fields by productType ──────────────────────────────────────
const TYPE_DATA_EXPECTED = {
  peptide: ['mechanismOfAction', 'administrationRoutes', 'reconstitutionRelevant', 'protocolRoles', 'typicalResearchUse'],
  supplement: ['nutrientCategory', 'supportPathways', 'servingFormat', 'dailyUseContext'],
  genetic_test: ['sampleType', 'reportSections', 'turnaroundTime', 'clinicalArea'],
  professional_material: ['requiresVerification', 'bulkAvailable', 'documentationRequired'],
};

// ── Load source data files dynamically ───────────────────────────────────────
async function loadDataModule(relPath) {
  const absPath = pathToFileURL(path.resolve(ROOT, relPath)).href;
  const mod = await import(absPath);
  return mod;
}

// ── Audit a single product record ────────────────────────────────────────────
function auditProduct(p, source) {
  const name = p.name || p.displayName || '(unnamed)';
  const productType = p.productType || p.type || null;

  const presentFields = [];
  const missingRootFields = [];
  const inconsistencies = [];

  // Check canonical root fields
  for (const f of CANONICAL_ROOT_FIELDS) {
    if (p[f] !== undefined && p[f] !== null && p[f] !== '') {
      presentFields.push(f);
    } else {
      missingRootFields.push(f);
    }
  }

  // Detect legacy AI fields still at root (not nested in aiContent)
  const legacyAiFieldsAtRoot = LEGACY_AI_FIELDS.filter((f) => p[f] !== undefined);

  // Check if aiContent block already exists
  const hasAiContent = !!p.aiContent;
  if (hasAiContent) {
    const missingAi = CANONICAL_AI_CONTENT_FIELDS.filter((f) => p.aiContent[f] === undefined);
    if (missingAi.length > 0) {
      inconsistencies.push(`aiContent exists but missing: [${missingAi.join(', ')}]`);
    }
  }

  // Check typeData block
  const hasTypeData = !!p.typeData;
  let typeDataIssues = [];
  if (productType && TYPE_DATA_EXPECTED[productType]) {
    const expectedTypeFields = TYPE_DATA_EXPECTED[productType];
    if (hasTypeData && p.typeData[productType]) {
      const missing = expectedTypeFields.filter((f) => p.typeData[productType][f] === undefined);
      if (missing.length > 0) {
        typeDataIssues.push(`typeData.${productType} missing: [${missing.join(', ')}]`);
      }
    } else {
      typeDataIssues.push(`typeData block missing for productType="${productType}"`);
    }
  }

  // Detect productType field problems
  if (!productType) {
    inconsistencies.push('productType is missing — cannot determine type-specific schema');
  }

  // Detect missing slug
  if (!p.slug) {
    inconsistencies.push('slug is missing');
  }

  // Detect missing variants
  if (!p.variants || !Array.isArray(p.variants) || p.variants.length === 0) {
    inconsistencies.push('variants array is missing or empty');
  }

  // Detect "compound" usage in any string field (forbidden word per migration rules)
  const allStringValues = Object.values(p)
    .filter((v) => typeof v === 'string')
    .join(' ');
  if (/\bcompound\b/i.test(allStringValues)) {
    inconsistencies.push('Contains forbidden word "compound" — use peptide/supplement/product instead');
  }

  return {
    name,
    source,
    productType: productType || 'MISSING',
    slug: p.slug || null,
    hasVariants: !!(p.variants && p.variants.length > 0),
    hasAiContent,
    hasTypeData,
    presentRootFields: presentFields,
    missingRootFields,
    legacyAiFieldsAtRoot,
    typeDataIssues,
    inconsistencies,
    status: missingRootFields.length === 0 && inconsistencies.length === 0 && typeDataIssues.length === 0
      ? 'OK'
      : 'NEEDS_MIGRATION',
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('📋 PHASE 1 — Auditing product metadata...\n');

  const { products } = await loadDataModule('src/data/products.js');
  const { supplements } = await loadDataModule('src/data/supplements.js');

  const allRecords = [
    ...products.map((p) => auditProduct(p, 'products.js')),
    ...supplements.map((s) => auditProduct(s, 'supplements.js')),
  ];

  // ── Summary stats ──────────────────────────────────────────────────────────
  const total = allRecords.length;
  const okCount = allRecords.filter((r) => r.status === 'OK').length;
  const needsMigration = allRecords.filter((r) => r.status === 'NEEDS_MIGRATION').length;

  const productTypeBreakdown = allRecords.reduce((acc, r) => {
    acc[r.productType] = (acc[r.productType] || 0) + 1;
    return acc;
  }, {});

  // ── Most common missing fields ─────────────────────────────────────────────
  const missingFieldCounts = {};
  for (const r of allRecords) {
    for (const f of r.missingRootFields) {
      missingFieldCounts[f] = (missingFieldCounts[f] || 0) + 1;
    }
  }

  // ── Legacy AI fields still at root ────────────────────────────────────────
  const legacyAiSummary = allRecords.reduce((acc, r) => {
    for (const f of r.legacyAiFieldsAtRoot) {
      acc[f] = (acc[f] || 0) + 1;
    }
    return acc;
  }, {});

  // ── Records with inconsistencies ──────────────────────────────────────────
  const withInconsistencies = allRecords.filter(
    (r) => r.inconsistencies.length > 0 || r.typeDataIssues.length > 0
  );

  const report = {
    generatedAt: new Date().toISOString(),
    phase: 'Phase 1 — Audit Current Product Metadata',
    summary: {
      totalRecords: total,
      okRecords: okCount,
      needsMigration,
      productTypeBreakdown,
    },
    missingRootFieldCounts: missingFieldCounts,
    legacyAiFieldsStillAtRoot: legacyAiSummary,
    recordsWithInconsistencies: withInconsistencies.map((r) => ({
      name: r.name,
      source: r.source,
      productType: r.productType,
      slug: r.slug,
      missingRootFields: r.missingRootFields,
      legacyAiFieldsAtRoot: r.legacyAiFieldsAtRoot,
      typeDataIssues: r.typeDataIssues,
      inconsistencies: r.inconsistencies,
    })),
    allRecords: allRecords.map((r) => ({
      name: r.name,
      source: r.source,
      productType: r.productType,
      slug: r.slug,
      status: r.status,
      hasAiContent: r.hasAiContent,
      hasTypeData: r.hasTypeData,
      hasVariants: r.hasVariants,
      missingRootFields: r.missingRootFields,
      legacyAiFieldsAtRoot: r.legacyAiFieldsAtRoot,
      typeDataIssues: r.typeDataIssues,
      inconsistencies: r.inconsistencies,
    })),
  };

  const outPath = path.resolve(ROOT, 'scripts/phase1-audit-report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

  // ── Console summary ────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PHASE 1 AUDIT REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Total records audited : ${total}`);
  console.log(`  ✅ OK (canonical)     : ${okCount}`);
  console.log(`  ⚠️  Needs migration    : ${needsMigration}`);
  console.log('');
  console.log('  Product type breakdown:');
  for (const [type, count] of Object.entries(productTypeBreakdown)) {
    console.log(`    ${type.padEnd(22)} ${count}`);
  }
  console.log('');
  console.log('  Most missing root fields:');
  const sortedMissing = Object.entries(missingFieldCounts).sort((a, b) => b[1] - a[1]);
  for (const [field, count] of sortedMissing) {
    console.log(`    ${field.padEnd(22)} missing in ${count} records`);
  }
  console.log('');
  console.log('  Legacy AI fields still at root level:');
  for (const [field, count] of Object.entries(legacyAiSummary)) {
    console.log(`    ${field.padEnd(22)} ${count} records`);
  }
  console.log('');
  console.log(`  Records with inconsistencies: ${withInconsistencies.length}`);
  console.log('');
  console.log(`  📄 Full report written to: scripts/phase1-audit-report.json`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('  ✅ Phase 1 complete. Firebase has NOT been modified.');
  console.log('  👉 Review the report, then proceed to Phase 2.');
  console.log('═══════════════════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
