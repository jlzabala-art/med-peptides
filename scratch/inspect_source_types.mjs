import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

const subcategories = {};
data.forEach(item => {
  const cat = item.category || 'NO_CATEGORY';
  const subcat = item.subcategory || 'NO_SUBCATEGORY';
  const type = item.productType || 'NO_TYPE';
  const key = `${cat} | ${subcat} | ${type}`;
  if (!subcategories[key]) subcategories[key] = [];
  subcategories[key].push(item.name);
});

console.log('Category | Subcategory | productType -> Count (Samples)');
for (const [key, names] of Object.entries(subcategories)) {
  console.log(`- ${key}: ${names.length} items`);
  console.log(`  Samples: ${names.slice(0, 3).join(', ')}`);
}
