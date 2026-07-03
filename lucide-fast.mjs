/**
 * lucide-fast.mjs — ESM version for projects with "type": "module"
 * Run: node lucide-fast.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, 'src');
const ICONS_OUT = path.join(SRC, 'lib', 'icons.js');

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

function toKebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9]+)/g, '$1-$2')
    .toLowerCase();
}

const files = walk(SRC);
const allIcons = new Set();
const IMPORT_RE = /import\s*\{([^}]+)\}\s*from\s*['"](?:lucide-react|@\/lib\/icons)['"]/g;

for (const f of files) {
  if (f === ICONS_OUT) continue;
  const src = fs.readFileSync(f, 'utf8');
  IMPORT_RE.lastIndex = 0;
  let m;
  while ((m = IMPORT_RE.exec(src)) !== null) {
    m[1].split(',').forEach(n => {
      const clean = n.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Z][a-zA-Z0-9]*$/.test(clean)) allIcons.add(clean);
    });
  }
}

const sorted = [...allIcons].sort();
console.log(`\nFound ${sorted.length} unique icons in ${files.length} source files.\n`);
if (sorted.length > 0) console.log('Icons:', sorted.join(', '), '\n');

fs.mkdirSync(path.join(SRC, 'lib'), { recursive: true });

const iconLines = sorted.map(icon =>
  `export { default as ${icon} } from 'lucide-react/dist/esm/icons/${toKebab(icon)}';`
).join('\n');

const content = `/**
 * src/lib/icons.js — Centralized icon barrel
 *
 * Each icon is imported from its individual ESM path.
 * This prevents Vite from bundling all 1000+ lucide icons during build.
 *
 * Usage:
 *   import { Search, X, ChevronDown } from '@/lib/icons';
 *
 * To add a new icon: add one export line here following the pattern.
 */

${iconLines}
`;

fs.writeFileSync(ICONS_OUT, content, 'utf8');
console.log(`✓ Generated: src/lib/icons.js`);

// Rewrite imports
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

console.log(`\n\n✅ Done! Rewrote ${count} files.`);
console.log('Next: npm run build');
