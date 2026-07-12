#!/usr/bin/env node
/**
 * lucide-migrate.cjs
 * 
 * 1. Scans all src/**\/*.{jsx,js} files for `from 'lucide-react'` imports
 * 2. Collects every unique icon name used
 * 3. Generates src/lib/icons.js - a barrel that imports each icon individually
 * 4. Rewrites every source file to import from '@/lib/icons' instead
 *
 * Run: node lucide-migrate.cjs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, 'src');
const ICONS_FILE = path.join(SRC_DIR, 'lib', 'icons.js');

// ── Helpers ──────────────────────────────────────────────────────────────────

function walkDir(dir, ext, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      walkDir(full, ext, results);
    } else if (entry.isFile() && ext.some(e => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// Convert PascalCase icon name to kebab-case file path
// e.g.  ChevronDown  ->  chevron-down
//        AlertCircle  ->  alert-circle
function toKebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

// ── Step 1: collect all unique icon names ────────────────────────────────────

const files = walkDir(SRC_DIR, ['.jsx', '.js']);
const allIcons = new Set();

// Regex to match:
//   import { X, Y, Z } from 'lucide-react'
//   import { X, Y,\n  Z } from 'lucide-react'   (multiline)
const IMPORT_RE = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = IMPORT_RE.exec(src)) !== null) {
    const names = m[1]
      .split(',')
      .map(n => n.trim().split(/\s+as\s+/)[0].trim()) // handle "X as Y"
      .filter(Boolean);
    for (const n of names) {
      if (/^[A-Z]/.test(n)) allIcons.add(n); // only PascalCase = component icon
    }
  }
}

const sortedIcons = [...allIcons].sort();
console.log(`\n✓ Found ${sortedIcons.length} unique lucide icons across ${files.length} src files.\n`);
console.log('Icons:', sortedIcons.join(', '));

// ── Step 2: generate src/lib/icons.js ────────────────────────────────────────

fs.mkdirSync(path.join(SRC_DIR, 'lib'), { recursive: true });

const lines = [
  '/**',
  ' * src/lib/icons.js',
  ' *',
  ' * Centralized icon barrel — each icon imported from its individual ESM path.',
  ' * This prevents Vite from bundling ALL of lucide-react (1000+ icons).',
  ' *',
  ' * Usage:',
  " *   import { X, ChevronDown, Search } from '@/lib/icons';",
  ' *',
  ' * To add a new icon: add it here and import from @/lib/icons everywhere.',
  ' */',
  '',
];

for (const icon of sortedIcons) {
  const kebab = toKebab(icon);
  lines.push(`export { default as ${icon} } from 'lucide-react/dist/esm/icons/${kebab}';`);
}

lines.push('');
fs.writeFileSync(ICONS_FILE, lines.join('\n'), 'utf8');
console.log(`\n✓ Generated: ${ICONS_FILE}`);

// ── Step 3: rewrite all source files ─────────────────────────────────────────

let rewrittenCount = 0;
let skippedCount = 0;

for (const file of files) {
  // Skip the icons barrel itself
  if (file === ICONS_FILE) continue;

  let src = fs.readFileSync(file, 'utf8');
  
  if (!src.includes("from 'lucide-react'") && !src.includes('from "lucide-react"')) {
    continue;
  }

  // Replace import { ... } from 'lucide-react' or "lucide-react"
  // Handles multiline imports too
  const replaced = src.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g,
    (match, names) => {
      const cleaned = names
        .split(',')
        .map(n => n.trim())
        .filter(Boolean)
        .join(', ');
      return `import { ${cleaned} } from '@/lib/icons'`;
    }
  );

  if (replaced !== src) {
    fs.writeFileSync(file, replaced, 'utf8');
    rewrittenCount++;
    const rel = path.relative(SRC_DIR, file);
    console.log(`  ↳ Rewrote: src/${rel}`);
  } else {
    skippedCount++;
  }
}

console.log(`\n✅ Done!`);
console.log(`   ${rewrittenCount} files rewritten`);
console.log(`   ${skippedCount} files skipped (already using individual imports or no lucide-react)`);
console.log('\nNext steps:');
console.log('  1. Run: npm run build  (should complete without hanging)');
console.log('  2. If a new icon is needed, add it to src/lib/icons.js');
