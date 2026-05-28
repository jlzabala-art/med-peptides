import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

data.forEach((item, index) => {
  if (item.name.toUpperCase().includes('TESTOSTERONE')) {
    const retailPrice = item.variants?.[0]?.pricing?.retail?.perUnit;
    const format = item.variants?.[0]?.attributes?.format;
    const admin = item.variants?.[0]?.attributes?.administration;
    console.log(`Index ${index} | ID: ${item.id} | Name: "${item.name}" | Cat: "${item.category}" | Subcat: "${item.subcategory}" | Qty: "${item.quantity}" | Price: ${retailPrice} EUR | format: "${format}"`);
  }
});
