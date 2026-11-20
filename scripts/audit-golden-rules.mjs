#!/usr/bin/env node
/**
 * Golden Rules Automated Audit (`npm run audit:rules`)
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces key architectural invariants from .agents/AGENTS.md in CI & local:
 *  FAILS (exit 1) on:
 *   1. Duplicate rule numbers in .agents/AGENTS.md
 *   2. Any window.confirm() / window.alert() in src/ (Rules #10, #25)
 *   3. Any ad-hoc <header> tag in src/app/ (Rule #63)
 *  REPORTS (inventory) on:
 *   4. Raw <table> tags outside DataTable.jsx / PDF / print / email templates (Rule #3)
 *   5. Client-root page.jsx files ("use client" at route root, Rule #21)
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
const clientRootPages = [];

for (const file of srcFiles) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  if (/^src\/app\/.*\/page\.(js|jsx|ts|tsx)$/.test(rel)) {
    const head = lines.slice(0, 5).join('\n');
    if (/['"]use client['"]/.test(head)) {
      clientRootPages.push(rel);
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const ln = i + 1;

    if (
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('*') &&
      /\bwindow\.(confirm|alert)\s*\(/.test(line)
    ) {
      nativeDialogs.push(`${rel}:${ln}`);
    }
    if (
      /<table[\s>]/.test(line) &&
      !line.includes('role="presentation"') &&
      !(lines[i - 1] && lines[i - 1].includes('no-restricted-syntax')) &&
      !rel.includes('DataTable') &&
      !rel.includes('pdf') &&
      !rel.includes('Pdf') &&
      !rel.includes('print') &&
      !rel.includes('Print') &&
      !rel.includes('email') &&
      !rel.includes('Email') &&
      !rel.includes('Mailer') &&
      !rel.includes('Notifier') &&
      !rel.includes('Generator') &&
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
console.log(`window.confirm/alert     : ${nativeDialogs.length} (enforced = 0)`);
console.log(`Ad-hoc <header> in app/  : ${bespokeHeaders.length} (enforced = 0)`);
console.log(`Raw <table> (non-PDF)    : ${rawTables.length} (inventory)`);
console.log(`Client-root page.jsx     : ${clientRootPages.length} (inventory)`);

let failed = false;

if (dupes.length > 0) {
  console.error('❌ Duplicate rule numbers found in .agents/AGENTS.md:', dupes);
  failed = true;
}

if (nativeDialogs.length > 0) {
  console.error('❌ window.confirm/alert found (Rules #10/#25):');
  nativeDialogs.forEach((x) => console.error('  -', x));
  failed = true;
}

if (bespokeHeaders.length > 0) {
  console.error('❌ Ad-hoc <header> in src/app/ found (Rule #63):');
  bespokeHeaders.forEach((x) => console.error('  -', x));
  failed = true;
}

if (failed) {
  process.exit(1);
}

console.log('\n✓ All enforced Golden Rules checks passed (0 violations).');
