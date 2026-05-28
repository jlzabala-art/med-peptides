import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

for (let i = 225; i <= 235; i++) {
  const item = data[i];
  if (item) {
    const retailPrice = item.variants?.[0]?.pricing?.retail?.perUnit;
    console.log(`Index ${i} | ID: ${item.id} | Name: "${item.name}" | Qty: "${item.quantity}" | Price: ${retailPrice} EUR | Subcat: "${item.subcategory}"`);
  }
}
