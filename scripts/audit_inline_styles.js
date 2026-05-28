const fs = require('fs');
const path = require('path');
const glob = require('glob');
const report = [];

glob('src/**/*.jsx', { ignore: ['node_modules/**', 'dist/**'] }, (err, files) => {
  if (err) { console.error(err); process.exit(1); }
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
});
