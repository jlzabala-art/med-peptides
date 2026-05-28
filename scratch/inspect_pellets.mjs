import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

for (let i = 851; i <= 867; i++) {
  console.log(`\n--- Index ${i} | ID: ${data[i].id} ---`);
  console.log(`Name: "${data[i].name}"`);
  console.log(`Desc: "${data[i].desc}"`);
  console.log(`Quantity: "${data[i].quantity}"`);
  console.log(`Subcategory: "${data[i].subcategory}"`);
  console.log(`productType: "${data[i].productType}"`);
  console.log(`Variants:`, JSON.stringify(data[i].variants, null, 2));
}
