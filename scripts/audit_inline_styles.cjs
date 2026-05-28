// audit_inline_styles.cjs – scans src/**/*.jsx for inline style objects (CommonJS for Vite project)
const fs = require('fs');
const path = require('path');

// Recursively collect .jsx files under src
function collectJsxFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules and dist
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      files.push(...collectJsxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const report = [];

const srcDir = path.join(__dirname, '..', 'src');
const files = collectJsxFiles(srcDir);
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('style={{')) {
      report.push({ file, line: idx + 1, snippet: line.trim() });
    }
  });
});

const outPath = path.join(__dirname, 'audit_report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(`Audit completed. ${report.length} inline style occurrences written to ${outPath}`);
