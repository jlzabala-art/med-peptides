import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

// Helper to normalize name to slug
function toSlug(name) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const groups = {};
data.forEach(item => {
  const slug = toSlug(item.name);
  if (!groups[slug]) {
    groups[slug] = [];
  }
  groups[slug].push(item);
});

console.log(`Total items: ${data.length}`);
console.log(`Total unique slugs: ${Object.keys(groups).length}`);

// Let's print slugs with more than 1 item and their quantities/variants
console.log('\n--- SLUGS WITH MULTIPLE ITEMS ---');
Object.entries(groups)
  .filter(([slug, items]) => items.length > 1)
  .slice(0, 10)
  .forEach(([slug, items]) => {
    console.log(`Slug: ${slug} (${items[0].name}) - ${items.length} items`);
    items.forEach(item => {
      console.log(`  - quantity: "${item.quantity}" | id: "${item.id}" | category: "${item.category}" | subcategory: "${item.subcategory}"`);
      if (item.variants) {
        item.variants.forEach(v => {
          console.log(`    └─ Var: "${v.label}" | ${JSON.stringify(v.attributes)}`);
        });
      }
    });
  });
