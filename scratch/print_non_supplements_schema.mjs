import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

const subcategories = {};
data.forEach(item => {
  const cat = item.category || 'NO_CATEGORY';
  const subcat = item.subcategory || 'NO_SUBCATEGORY';
  const type = item.productType || 'NO_TYPE';
  const key = `${cat} | ${subcat} | ${type}`;
  if (!subcategories[key]) subcategories[key] = item;
});

for (const [key, item] of Object.entries(subcategories)) {
  console.log('========================================================================');
  console.log(`Key: ${key}`);
  console.log(JSON.stringify(item, null, 2));
}
