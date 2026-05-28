import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

for (let i = 220; i <= 330; i++) {
  const item = data[i];
  if (item && (item.subcategory === 'Vaginal Cream' || item.name.toLowerCase().includes('vaginal'))) {
    const retailPrice = item.variants?.[0]?.pricing?.retail?.perUnit;
    console.log(`Index ${i} | ID: ${item.id} | Name: "${item.name}" | Qty: "${item.quantity}" | Price: ${retailPrice} EUR | Subcat: "${item.subcategory}"`);
  }
}
