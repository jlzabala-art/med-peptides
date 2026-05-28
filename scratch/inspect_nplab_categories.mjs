import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

const categories = {};
data.forEach(item => {
  const cat = item.category || 'NO_CATEGORY';
  if (!categories[cat]) categories[cat] = new Set();
  categories[cat].add(item.name);
});

for (const [cat, names] of Object.entries(categories)) {
  console.log(`\nCategory: ${cat} (${names.size} unique products)`);
  console.log(Array.from(names).slice(0, 10).map(n => `  - ${n}`).join('\n'));
  if (names.size > 10) console.log(`  ... and ${names.size - 10} more`);
}
process.exit(0);
