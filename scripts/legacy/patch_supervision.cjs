const fs = require('fs');
const file = 'src/components/admin/AdminSupervisionTab.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ MetricCard \} from '\.\.\/ui';/, 
`import { MetricCard, StatusChip } from '../ui';`);

const oldChipRegex = /\/\/ ── Helpers ──[\s\S]+?\}\n\n\/\/ ── KPI Card ──/;
content = content.replace(oldChipRegex, 
`// ── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── KPI Card ──`);

fs.writeFileSync(file, content);
console.log('patched');
