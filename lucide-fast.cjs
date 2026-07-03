#!/usr/bin/env node
/**
 * lucide-fast.cjs  — macOS-compatible lucide icon migration
 * 1. Scans src/ for all `from 'lucide-react'` imports
 * 2. Generates src/lib/icons.js with individual ESM imports
 * 3. Rewrites all source files to use '@/lib/icons'
 */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const ICONS_OUT = path.join(SRC, 'lib', 'icons.js');

// ── Walk dir ──────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', '.git', 'dist'].includes(e.name)) {
      walk(full, out);
    } else if (e.isFile() && /\.(jsx?|tsx?)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

// ── PascalCase → kebab-case ───────────────────────────────────────────────────
function toKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

const files = walk(SRC);
const allIcons = new Set();

// Match single-line imports: import { A, B, C } from 'lucide-react'
// Also match multiline via a simple state machine approach
const SINGLE = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;

for (const f of files) {
  if (f === ICONS_OUT) continue;
  const src = fs.readFileSync(f, 'utf8');
  let m;
  SINGLE.lastIndex = 0;
  while ((m = SINGLE.exec(src)) !== null) {
    m[1].split(',').forEach(n => {
      const clean = n.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Z][a-zA-Z0-9]*$/.test(clean)) allIcons.add(clean);
    });
  }
}

const sorted = [...allIcons].sort();
console.log(`Found ${sorted.length} icons across ${files.length} files`);

// ── Generate icons barrel ─────────────────────────────────────────────────────
fs.mkdirSync(path.join(SRC, 'lib'), { recursive: true });

const header = [
  '/**',
  ' * src/lib/icons.js — Centralized icon barrel',
  ' *',
  ' * Each icon is imported from its individual ESM path.',
  ' * This prevents Vite from bundling all 1,000+ lucide icons.',
  ' *',
  ' * Usage: import { Search, X, ChevronDown } from \'@/lib/icons\';',
  ' *',
  ' * To add a new icon: add one line here.',
  ' */',
  '',
].join('\n');

const exportsStr = sorted.map(icon =>
  `export { default as ${icon} } from 'lucide-react/dist/esm/icons/${toKebab(icon)}';`
).join('\n');

fs.writeFileSync(ICONS_OUT, header + exportsStr + '\n');
console.log(`✓ Generated ${ICONS_OUT}`);

// ── Rewrite imports ───────────────────────────────────────────────────────────
let count = 0;
for (const f of files) {
  if (f === ICONS_OUT) continue;
  const src = fs.readFileSync(f, 'utf8');
  if (!src.includes("'lucide-react'") && !src.includes('"lucide-react"')) continue;

  const next = src.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g,
    (_, names) => {
      const cleaned = names.split(',').map(n => n.trim()).filter(Boolean).join(', ');
      return `import { ${cleaned} } from '@/lib/icons'`;
    }
  );

  if (next !== src) {
    fs.writeFileSync(f, next, 'utf8');
    count++;
    process.stdout.write('.');
  }
}

console.log(`\n✅ Rewrote ${count} files. Run: npm run build`);
