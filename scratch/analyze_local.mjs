import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

console.log(`Total items: ${data.length}`);

const uniqueGoals = new Set();
const uniqueCategories = new Set();
const uniqueSubcategories = new Set();

data.forEach(item => {
  if (item.goals) {
    item.goals.forEach(g => uniqueGoals.add(g));
  }
  if (item.category) uniqueCategories.add(item.category);
  if (item.subcategory) uniqueSubcategories.add(item.subcategory);
});

console.log('Unique Goals:', Array.from(uniqueGoals));
console.log('Unique Categories:', Array.from(uniqueCategories));
console.log('Unique Subcategories:', Array.from(uniqueSubcategories));
