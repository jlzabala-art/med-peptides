const fs = require('fs');
const path = require('path');

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

const SINGLE = /import\s*\{([^}]+)\}\s*from\s*['"](.*?(?:lib\/icons|lucide-react))['"]/g;

for (const f of files) {
  if (f === ICONS_OUT) continue;
  const src = fs.readFileSync(f, 'utf8');
  let m;
  SINGLE.lastIndex = 0;
  while ((m = SINGLE.exec(src)) !== null) {
    m[1].split(',').forEach(n => {
      const clean = n.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Z][a-zA-Z0-9]*$/.test(clean)) {
        allIcons.add(clean);
      }
    });
  }
}

const sorted = [...allIcons].sort();
console.log(`Found ${sorted.length} icons`);

const exportsStr = sorted.map(icon =>
  `export { default as ${icon} } from 'lucide-react/dist/esm/icons/${toKebab(icon)}';`
).join('\n');

fs.writeFileSync(ICONS_OUT, exportsStr + '\n');
console.log(`✓ Generated ${ICONS_OUT}`);
