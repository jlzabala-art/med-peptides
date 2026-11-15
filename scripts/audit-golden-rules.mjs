#!/usr/bin/env node
/**
 * Golden Rules Automated Audit (`npm run audit:rules`)
 * ─────────────────────────────────────────────────────────────────────────────
 * Checks the repository for key architectural invariants from .agents/AGENTS.md:
 *  1. No duplicate rule numbers in .agents/AGENTS.md
 *  2. No window.confirm() / window.alert() in src/ (Rules #10, #25)
 *  3. Inventory of raw <table> tags outside DataTable.jsx / PDF / print / email templates (Rule #3)
 *  4. Inventory of ad-hoc <header> tags in src/app/ (Rule #63)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

// 1. Check AGENTS.md for duplicate rule numbers
const agentsPath = path.join(ROOT, '.agents', 'AGENTS.md');
const agentsText = fs.readFileSync(agentsPath, 'utf8');
const ruleNums = [...agentsText.matchAll(/^## (\d+)\. /gm)].map((m) => Number(m[1]));
const seen = new Set();
const dupes = [];
for (const n of ruleNums) {
  if (seen.has(n)) dupes.push(n);
  seen.add(n);
}

// 2. Scan src/
const srcFiles = walk(path.join(ROOT, 'src'));
const nativeDialogs = [];
const rawTables = [];
const bespokeHeaders = [];

for (const file of srcFiles) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    const ln = i + 1;
    if (/\bwindow\.(confirm|alert)\s*\(/.test(line)) {
      nativeDialogs.push(`${rel}:${ln}`);
    }
    if (
      /<table[\s>]/.test(line) &&
      !rel.includes('DataTable') &&
      !rel.includes('pdf') &&
      !rel.includes('Pdf') &&
      !rel.includes('print') &&
      !rel.includes('Print') &&
      !rel.includes('email') &&
      !rel.includes('Email') &&
      !rel.includes('/api/')
    ) {
      rawTables.push(`${rel}:${ln}`);
    }
    if (rel.startsWith('src/app/') && /<header[\s>]/.test(line)) {
      bespokeHeaders.push(`${rel}:${ln}`);
    }
  });
}

console.log('=== Atlas Golden Rules Audit ===');
console.log(`Total rules in AGENTS.md : ${ruleNums.length} (duplicates: ${dupes.length})`);
console.log(`window.confirm/alert     : ${nativeDialogs.length}`);
console.log(`Raw <table> (non-PDF)    : ${rawTables.length}`);
console.log(`Ad-hoc <header> in app/  : ${bespokeHeaders.length}`);

if (dupes.length > 0) {
  console.error('❌ Duplicate rule numbers found in .agents/AGENTS.md:', dupes);
  process.exit(1);
}

if (nativeDialogs.length > 0) {
  console.log('\n[Warn] window.confirm/alert occurrences (Rule #10/#25):');
  nativeDialogs.slice(0, 10).forEach((x) => console.log('  -', x));
}
if (rawTables.length > 0) {
  console.log('\n[Warn] Raw <table> occurrences outside DataTable/PDF (Rule #3):');
  rawTables.slice(0, 10).forEach((x) => console.log('  -', x));
}
if (bespokeHeaders.length > 0) {
  console.log('\n[Warn] Ad-hoc <header> in src/app/ (Rule #63):');
  bespokeHeaders.slice(0, 10).forEach((x) => console.log('  -', x));
}

console.log('\n✓ Golden Rules structural check passed.');
