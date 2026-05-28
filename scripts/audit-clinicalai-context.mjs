#!/usr/bin/env node
/**
 * audit-clinicalai-context.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Sub-Fase 10.4 — ClinicalAI Context Integrity Audit
 *
 * Validates that every product in the v2 catalogue supplies the data fields
 * required by ClinicalAssistant.jsx to build accurate, type-differentiated
 * system-prompt blocks:
 *
 *   1. productType        → must be 'peptide' | 'supplement' | 'stack'
 *   2. aiContent          → must be an object (summary recommended)
 *   3. typeData           → must be an object whose key matches productType
 *   4. goals / mechanisms → must be non-empty arrays (or live in aiContent/typeData)
 *   5. semanticKeywords   → must be a non-empty array (search + AI alias expansion)
 *   6. slug / id          → must be present (used in [PRODUCT:slug] tags)
 *
 * Run:
 *   node scripts/audit-clinicalai-context.mjs
 *
 * Exit codes:
 *   0 — all checks passed (or only warnings)
 *   1 — critical violations found
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Load v2 catalogues ───────────────────────────────────────────────────────
function loadJSON(relPath) {
  const abs = resolve(ROOT, relPath);
  try {
    return JSON.parse(readFileSync(abs, 'utf8'));
  } catch (err) {
    console.error(`❌ Cannot load ${relPath}: ${err.message}`);
    process.exit(1);
  }
}

const peptidesRaw   = loadJSON('src/data/v2/products.v2.json');
const supplementsRaw = loadJSON('src/data/v2/supplements.v2.json');

// Normalise: both files can be an array or { products: [...] }
function normalise(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.products)) return raw.products;
  return Object.values(raw); // fallback: plain object map
}

const peptides    = normalise(peptidesRaw);
const supplements = normalise(supplementsRaw);
const allProducts = [...peptides, ...supplements];

// ── Colour helpers ───────────────────────────────────────────────────────────
const RED    = (s) => `\x1b[31m${s}\x1b[0m`;
const YELLOW = (s) => `\x1b[33m${s}\x1b[0m`;
const GREEN  = (s) => `\x1b[32m${s}\x1b[0m`;
const CYAN   = (s) => `\x1b[36m${s}\x1b[0m`;
const BOLD   = (s) => `\x1b[1m${s}\x1b[0m`;

// ── Counters ─────────────────────────────────────────────────────────────────
let totalChecks    = 0;
let violations     = 0;       // critical — will cause wrong AI output
let warnings       = 0;       // degraded quality but not broken
let missingType    = [];
let badTypeData    = [];
let missingAICont  = [];
let missingGoals   = [];
let missingMechs   = [];
let missingKeywords = [];
let missingSlug    = [];
let wrongTypeDataKey = [];

// ── Per-product audit ────────────────────────────────────────────────────────
function auditProduct(p) {
  const label = p.displayName || p.name || p.id || '(unknown)';
  const id    = p.id || p.slug || '???';

  totalChecks++;

  // 1 — productType
  const VALID_TYPES = new Set(['peptide', 'supplement', 'stack']);
  if (!p.productType) {
    violations++;
    missingType.push({ id, label, issue: 'MISSING productType → AI will default to peptide (may be wrong)' });
  } else if (!VALID_TYPES.has(p.productType)) {
    violations++;
    missingType.push({ id, label, issue: `INVALID productType: "${p.productType}"` });
  }

  // 2 — aiContent (object with at least one key)
  const hasAIContent = p.aiContent && typeof p.aiContent === 'object' && Object.keys(p.aiContent).length > 0;
  if (!hasAIContent) {
    warnings++;
    missingAICont.push({ id, label });
  }

  // 3 — typeData: must be an object whose key matches productType
  const pType = p.productType || 'peptide';
  const hasTypeData = p.typeData && typeof p.typeData === 'object';
  if (!hasTypeData) {
    violations++;
    badTypeData.push({ id, label, issue: 'MISSING typeData object' });
  } else {
    // The canonical key inside typeData should match productType
    const hasMatchingKey = Object.prototype.hasOwnProperty.call(p.typeData, pType);
    if (!hasMatchingKey) {
      warnings++;
      wrongTypeDataKey.push({ id, label, pType, keys: Object.keys(p.typeData).join(', ') });
    }
  }


  // ── v2 real field resolution ───────────────────────────────────────────────
  // ClinicalAssistant reads these chains:
  //   goals:      p.goals || aiContent.goals || typeData[pType].goals
  //   mechanisms: p.mechanisms || aiContent.mechanisms || typeData[pType].mechanisms
  //   keywords:   p.semanticKeywords || typeData[pType].semanticKeywords
  //
  // The v2 catalogue ACTUALLY stores:
  //   goals      → detectedThemes[] OR typeData[pType].typicalResearchUse (string)
  //   mechanisms → typeData[pType].mechanismOfAction (string)
  //   keywords   → searchKeywords[] OR semanticKeywords[]
  //
  // We accept either form so warnings only fire when BOTH are absent.
  const tdInner = p.typeData?.[pType];

  // 4 — goals (v2 real location: classification.goals)
  const goalsCanonical = p.goals || p.aiContent?.goals || tdInner?.goals
                      || p.classification?.goals;
  const goalsV2Arr     = p.detectedThemes;
  const goalsV2Str     = tdInner?.typicalResearchUse || p.science?.objective;
  const hasGoals = (Array.isArray(goalsCanonical) && goalsCanonical.length > 0)
                || (Array.isArray(goalsV2Arr) && goalsV2Arr.length > 0)
                || (typeof goalsV2Str === 'string' && goalsV2Str.trim().length > 0);
  if (!hasGoals) {
    warnings++;
    missingGoals.push({ id, label });
  }

  // 5 — mechanisms (peptides/stacks only; supplements may legitimately omit)
  if (pType !== 'supplement') {
    const mechsCanonical = p.mechanisms || p.aiContent?.mechanisms || tdInner?.mechanisms;
    const mechsV2Str     = tdInner?.mechanismOfAction; // string in real v2
    const hasMechs = (Array.isArray(mechsCanonical) && mechsCanonical.length > 0)
                  || (typeof mechsV2Str === 'string' && mechsV2Str.trim().length > 0);
    if (!hasMechs) {
      warnings++;
      missingMechs.push({ id, label });
    }
  }

  // 6 — semanticKeywords (v2 real location: identity.semanticKeywords)
  const kwCanonical = p.semanticKeywords || tdInner?.semanticKeywords
                   || p.identity?.semanticKeywords || p.identity?.searchAliases;
  const kwV2        = p.searchKeywords;
  const hasKeywords = (Array.isArray(kwCanonical) && kwCanonical.length > 0)
                   || (Array.isArray(kwV2) && kwV2.length > 0);
  if (!hasKeywords) {
    warnings++;
    missingKeywords.push({ id, label });
  }

  // 7 — slug / id (critical: used in [PRODUCT:slug] tags)
  if (!p.slug && !p.id) {
    violations++;
    missingSlug.push({ id: '???', label });
  }

  // 8 — aiContent.summary blank (degrades compound education quality)
  if (hasAIContent) {
    const summary = (p.aiContent?.summary || '').trim();
    if (!summary) {
      warnings++;
      missingAICont.push({ id, label, issue: 'aiContent.summary blank → AI falls back to generic description' });
    }
  }
}

// ── Run audit ────────────────────────────────────────────────────────────────
console.log(BOLD('\n════════════════════════════════════════════════════════'));
console.log(BOLD('  Sub-Fase 10.4 — ClinicalAI Context Integrity Audit'));
console.log(BOLD('════════════════════════════════════════════════════════\n'));
console.log(CYAN(`  Catalogue: ${peptides.length} peptides/products + ${supplements.length} supplements = ${allProducts.length} total products\n`));

allProducts.forEach(auditProduct);

// ── Report: VIOLATIONS (critical) ───────────────────────────────────────────
console.log(BOLD('── CRITICAL VIOLATIONS ─────────────────────────────────'));

if (missingType.length) {
  console.log(RED(`\n[VIOLATION] productType — ${missingType.length} products affected:`));
  missingType.forEach(({ id, label, issue }) =>
    console.log(`  • ${id.padEnd(30)} ${label.padEnd(40)} → ${issue}`)
  );
} else {
  console.log(GREEN('  ✓ productType — all products have a valid productType'));
}

if (badTypeData.length) {
  console.log(RED(`\n[VIOLATION] typeData — ${badTypeData.length} products missing typeData:`));
  badTypeData.forEach(({ id, label, issue }) =>
    console.log(`  • ${id.padEnd(30)} ${label.padEnd(40)} → ${issue}`)
  );
} else {
  console.log(GREEN('  ✓ typeData — all products have a typeData object'));
}

if (missingSlug.length) {
  console.log(RED(`\n[VIOLATION] slug/id — ${missingSlug.length} products missing identifier (breaks [PRODUCT:slug] tags):`));
  missingSlug.forEach(({ label }) => console.log(`  • ${label}`));
} else {
  console.log(GREEN('  ✓ slug/id — all products have an identifier'));
}

// ── Report: WARNINGS (degraded quality) ─────────────────────────────────────
console.log(BOLD('\n── WARNINGS (Degraded AI Quality) ──────────────────────'));

if (wrongTypeDataKey.length) {
  console.log(YELLOW(`\n[WARNING] typeData key mismatch — ${wrongTypeDataKey.length} products:`));
  wrongTypeDataKey.slice(0, 10).forEach(({ id, label, pType, keys }) =>
    console.log(`  • ${id.padEnd(30)} type="${pType}" but typeData has keys: [${keys}]`)
  );
  if (wrongTypeDataKey.length > 10) console.log(`  ... and ${wrongTypeDataKey.length - 10} more`);
} else {
  console.log(GREEN('  ✓ typeData keys — all match their productType'));
}

if (missingAICont.length) {
  console.log(YELLOW(`\n[WARNING] aiContent — ${missingAICont.length} products missing (AI falls back to description field):`));
  missingAICont.slice(0, 10).forEach(({ id, label }) =>
    console.log(`  • ${id.padEnd(30)} ${label}`)
  );
  if (missingAICont.length > 10) console.log(`  ... and ${missingAICont.length - 10} more`);
} else {
  console.log(GREEN('  ✓ aiContent — all products have an aiContent block'));
}

if (missingGoals.length) {
  console.log(YELLOW(`\n[WARNING] goals — ${missingGoals.length} products have no goals array (AI cannot ground goal-alignment):`));
  missingGoals.slice(0, 10).forEach(({ id, label }) =>
    console.log(`  • ${id.padEnd(30)} ${label}`)
  );
  if (missingGoals.length > 10) console.log(`  ... and ${missingGoals.length - 10} more`);
} else {
  console.log(GREEN('  ✓ goals — all products have goals data'));
}

if (missingMechs.length) {
  console.log(YELLOW(`\n[WARNING] mechanisms — ${missingMechs.length} peptides/stacks missing mechanisms (affects MOA explanations):`));
  missingMechs.slice(0, 10).forEach(({ id, label }) =>
    console.log(`  • ${id.padEnd(30)} ${label}`)
  );
  if (missingMechs.length > 10) console.log(`  ... and ${missingMechs.length - 10} more`);
} else {
  console.log(GREEN('  ✓ mechanisms — all peptides/stacks have mechanism data'));
}

if (missingKeywords.length) {
  console.log(YELLOW(`\n[WARNING] semanticKeywords — ${missingKeywords.length} products missing (reduces AI alias expansion):`));
  missingKeywords.slice(0, 10).forEach(({ id, label }) =>
    console.log(`  • ${id.padEnd(30)} ${label}`)
  );
  if (missingKeywords.length > 10) console.log(`  ... and ${missingKeywords.length - 10} more`);
} else {
  console.log(GREEN('  ✓ semanticKeywords — all products have keyword data'));
}

// ── Summary ──────────────────────────────────────────────────────────────────
const criticalPct = ((violations / totalChecks) * 100).toFixed(1);
const warningPct  = ((warnings  / totalChecks) * 100).toFixed(1);

console.log(BOLD('\n════════════════════════════════════════════════════════'));
console.log(BOLD('  AUDIT SUMMARY'));
console.log('════════════════════════════════════════════════════════');
console.log(`  Products audited : ${totalChecks}`);
console.log(violations > 0
  ? RED(`  Critical violations: ${violations} (${criticalPct}%)`)
  : GREEN(`  Critical violations: 0 ✓`));
console.log(warnings > 0
  ? YELLOW(`  Warnings           : ${warnings} (${warningPct}%)`)
  : GREEN(`  Warnings           : 0 ✓`));

// ── Scoring (mirrors the runner's 1–5 scale) ─────────────────────────────────
// Each violation deducts 1.0pt; each warning deducts 0.2pt from a 5pt baseline.
const score = Math.max(1, 5 - violations * 1.0 - warnings * 0.2).toFixed(2);
const scoreLabel = score >= 4.5 ? '🟢 EXCELLENT' : score >= 3.5 ? '🟡 ACCEPTABLE' : score >= 2.5 ? '🟠 QUESTIONABLE' : '🔴 POOR';

console.log(BOLD(`\n  Context Pipeline Score: ${score}/5.0 — ${scoreLabel}`));
console.log('════════════════════════════════════════════════════════\n');

// ── Exit code ─────────────────────────────────────────────────────────────────
process.exit(violations > 0 ? 1 : 0);
