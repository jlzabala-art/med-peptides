#!/usr/bin/env node
/**
 * migrate-aicontent.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Sub-Fase 10.5 — Deriva y rellena aiContent.summary / beginnerExplanation /
 * scientificSummary para los 113 productos (péptidos + suplementos) del
 * catálogo v2, usando los campos ya existentes como fuente de verdad.
 *
 * SEGURO: no modifica ningún campo estructural (id, slug, typeData, variants…).
 * Solo escribe los 3 campos de texto dentro de aiContent si están vacíos.
 *
 * Uso:
 *   node scripts/migrate-aicontent.mjs            # dry-run (preview)
 *   node scripts/migrate-aicontent.mjs --write    # escribe en disco
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DRY_RUN = !process.argv.includes('--write');

// ── Colour helpers ────────────────────────────────────────────────────────────
const c = {
  green : (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan  : (s) => `\x1b[36m${s}\x1b[0m`,
  bold  : (s) => `\x1b[1m${s}\x1b[0m`,
  dim   : (s) => `\x1b[2m${s}\x1b[0m`,
  red   : (s) => `\x1b[31m${s}\x1b[0m`,
};

// ── File helpers ──────────────────────────────────────────────────────────────
function loadJSON(rel) {
  const full = resolve(ROOT, rel);
  const raw  = JSON.parse(readFileSync(full, 'utf8'));
  // Support both array root and { products: [] } wrapper
  return { data: Array.isArray(raw) ? raw : (raw.products || Object.values(raw)), raw, full };
}

function saveJSON(filePath, rawOriginal, updatedArray) {
  let out;
  if (Array.isArray(rawOriginal)) {
    out = updatedArray;
  } else {
    // Preserve wrapper key
    const key = Object.keys(rawOriginal).find(k => Array.isArray(rawOriginal[k]));
    out = key ? { ...rawOriginal, [key]: updatedArray } : updatedArray;
  }
  writeFileSync(filePath, JSON.stringify(out, null, 2), 'utf8');
}

// ── Text generation helpers ───────────────────────────────────────────────────

/** Capitalise first letter */
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

/** Format a goals array into readable prose */
function goalsToText(goals) {
  if (!goals || !goals.length) return '';
  return goals.map(g => g.replace(/_/g, ' ')).join(', ');
}

/** Format a mechanisms array into readable prose */
function mechanismsToText(mechs) {
  if (!mechs || !mechs.length) return '';
  return mechs.join(', ');
}

/**
 * Generate aiContent fields from a product's existing v2 data.
 * Returns { summary, beginnerExplanation, scientificSummary }
 */
function deriveAIContent(p) {
  const type = p.productType; // 'peptide' | 'supplement'
  const sci  = p.science || {};
  const cls  = p.classification || {};
  const td   = (p.typeData || {})[type] || {};
  const id   = p.identity || {};

  // ── Source fields ────────────────────────────────────────────────────────
  const desc         = sci.desc            || '';
  const mechanismArr = sci.mechanisms      || [];
  const mechanismStr = td.mechanismOfAction || sci.mechanismSummary || '';
  const goalsArr     = cls.goals           || [];
  const goalsStr     = goalsToText(goalsArr);
  const researchUse  = td.typicalResearchUse || sci.objective || '';
  const clinBenefits = sci.clinicalBenefits || [];
  const displayName  = p.displayName || p.name || '';
  const safetyNote   = sci.safetyNote || '';

  // ── summary (1–2 sentences, shown in chat suggestions & product cards) ───
  // Detect generic placeholder descriptions ("High-purity X for research…")
  const isGenericDesc = desc && /^high-purity/i.test(desc.trim());
  let summary = '';
  if (desc && !isGenericDesc) {
    summary = cap(desc);
    if (researchUse && !desc.toLowerCase().includes(researchUse.toLowerCase().split(',')[0].trim())) {
      summary += ` Research focus: ${researchUse}.`;
    }
  } else if (clinBenefits.length) {
    summary = `${displayName} is studied for ${researchUse ? researchUse.toLowerCase() : 'general wellness'}, with documented benefits including ${clinBenefits.slice(0, 2).join(' and ').toLowerCase()}.`;
  } else if (researchUse) {
    summary = `${displayName} is studied for ${researchUse.toLowerCase()}.`;
  } else {
    summary = cap(desc);
  }

  // ── beginnerExplanation (plain-English, 2–3 sentences) ───────────────────
  let beginnerExplanation = '';
  if (type === 'peptide') {
    const moa  = mechanismStr || mechanismsToText(mechanismArr);
    const use  = researchUse || goalsStr;
    beginnerExplanation =
      `${displayName} is a research peptide${use ? ` studied in the context of ${use.toLowerCase()}` : ''}.` +
      (moa ? ` It works through ${moa.toLowerCase()}.` : '') +
      (safetyNote ? ` Note: ${safetyNote}` : ' For research use only.');
  } else {
    // supplement
    const objective = td.typicalObjective || researchUse || goalsStr;
    const mechs     = mechanismsToText(mechanismArr);
    const benefits  = clinBenefits.length ? clinBenefits.slice(0, 3).join(', ').toLowerCase() : '';
    beginnerExplanation =
      `${displayName} is a supplement commonly used for ${objective ? objective.toLowerCase() : 'general wellness'}.` +
      (mechs    ? ` It works through ${mechs.toLowerCase()}.` : '') +
      (benefits ? ` Key benefits include ${benefits}.` : '');
  }

  // ── scientificSummary (clinical/research language, used in sci modal) ────
  let scientificSummary = '';
  const mechsFull  = mechanismStr || mechanismsToText(mechanismArr);
  const focusArr   = sci.researchFocus || [];
  const focusStr   = focusArr.length ? focusArr.join(', ') : '';

  if (type === 'peptide') {
    scientificSummary =
      (desc ? cap(desc) + ' ' : '') +
      (mechsFull ? `Primary mechanisms: ${mechanismsToText(mechanismArr) || mechsFull}. ` : '') +
      (focusStr  ? `Research focus areas: ${focusStr}. ` : '') +
      (researchUse ? `Typical research application: ${researchUse}.` : '');
  } else {
    scientificSummary =
      (desc ? cap(desc) + ' ' : '') +
      (mechsFull ? `Mechanisms: ${mechsFull}. ` : '') +
      (clinBenefits.length ? `Clinical benefits documented: ${clinBenefits.join(', ')}.` : '');
  }

  return {
    summary            : summary.trim(),
    beginnerExplanation: beginnerExplanation.trim(),
    scientificSummary  : scientificSummary.trim(),
  };
}

// ── Migration core ────────────────────────────────────────────────────────────
function migrateFile(rel, label) {
  const { data, raw, full } = loadJSON(rel);
  let filled = 0;
  let skipped = 0;

  const updated = data.map(p => {
    const ai     = p.aiContent || {};
    const needs  = !ai.summary || !ai.beginnerExplanation || !ai.scientificSummary;

    if (!needs) { skipped++; return p; }

    const derived = deriveAIContent(p);

    const newAI = {
      ...ai,
      summary            : ai.summary             || derived.summary,
      beginnerExplanation: ai.beginnerExplanation  || derived.beginnerExplanation,
      scientificSummary  : ai.scientificSummary    || derived.scientificSummary,
    };

    filled++;

    if (DRY_RUN) {
      console.log(c.cyan(`\n  [${p.slug}] ${p.displayName}`));
      if (!ai.summary)              console.log(c.yellow(`    summary            → ${derived.summary.slice(0,120)}…`));
      if (!ai.beginnerExplanation)  console.log(c.yellow(`    beginnerExplanation→ ${derived.beginnerExplanation.slice(0,120)}…`));
      if (!ai.scientificSummary)    console.log(c.yellow(`    scientificSummary  → ${derived.scientificSummary.slice(0,120)}…`));
    }

    return { ...p, aiContent: newAI };
  });

  if (!DRY_RUN) {
    saveJSON(full, raw, updated);
  }

  console.log(
    `  ${label}: ${c.green(filled + ' updated')}, ${c.dim(skipped + ' already had content')}`
  );
  return { filled, skipped };
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log(c.bold('\n════════════════════════════════════════════════════════'));
console.log(c.bold('  Sub-Fase 10.5 — aiContent Migration'));
console.log(c.bold('════════════════════════════════════════════════════════'));
console.log(DRY_RUN
  ? c.yellow('  Mode: DRY-RUN (pass --write to apply changes)\n')
  : c.green ('  Mode: WRITE — files will be updated\n')
);

const r1 = migrateFile('src/data/v2/products.v2.json',     'Peptides/Stacks');
const r2 = migrateFile('src/data/v2/supplements.v2.json',  'Supplements    ');

const total = r1.filled + r2.filled;
console.log(c.bold(`\n════════════════════════════════════════════════════════`));
console.log(`  Total products updated : ${c.green(total)}`);
console.log(`  Total already complete : ${c.dim(r1.skipped + r2.skipped)}`);
if (DRY_RUN) {
  console.log(c.yellow(`\n  Run with --write to apply:\n  node scripts/migrate-aicontent.mjs --write`));
}
console.log(c.bold('════════════════════════════════════════════════════════\n'));
