import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./scratch/nplab_non_supplements.json', 'utf8'));

const indices = [229, 318, 230, 319, 231, 321, 232, 322, 233, 323];
indices.forEach(i => {
  console.log(`\n--- Index ${i} | ID: ${data[i].id} ---`);
  console.log(`Name: "${data[i].name}"`);
  console.log(`Desc: "${data[i].desc}"`);
  console.log(`Quantity: "${data[i].quantity}"`);
  console.log(`Subcategory: "${data[i].subcategory}"`);
  console.log(`productType: "${data[i].productType}"`);
  console.log(`Variants:`, JSON.stringify(data[i].variants, null, 2));
});
