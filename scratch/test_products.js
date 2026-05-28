import { products } from '../src/data/products.js';

console.log("Total products:", products.length);

const noVariants = products.filter(p => !p.variants || p.variants.length === 0);
console.log("\nProducts with NO variants:", noVariants.length);
noVariants.forEach(p => {
  console.log(`- ${p.name} (Category: ${p.category}, ProductType: ${p.productType})`);
  console.log(`  pricing: ${p.pricing ? JSON.stringify(p.pricing) : 'none'}`);
  console.log(`  dosage: ${p.dosage}`);
  console.log(`  dosageRange: ${p.typeData?.dosageRange ? JSON.stringify(p.typeData.dosageRange) : 'none'}`);
});

const noDosage = products.filter(p => !p.dosage && (!p.variants || !p.variants.some(v => v.dosage || v.strength)));
console.log("\nProducts with NO dosage at all:", noDosage.length);
noDosage.forEach(p => {
  console.log(`- ${p.name} (Category: ${p.category}, ProductType: ${p.productType})`);
});
