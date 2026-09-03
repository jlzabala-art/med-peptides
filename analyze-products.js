const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products_dump.json', 'utf8'));

// 1. Find the BPC-157 product that the user might be referring to
const bpc157 = products.filter(p => p.name && p.name.includes("BPC-157"));
console.log("BPC-157 products:", bpc157.map(p => ({
    id: p.id,
    name: p.name,
    supplier: p.supplier,
    variants: p.variants
})));

// 2. Find any product that has a "30mg" variant but also "50mg" or "100mg"
const weirdVariants = products.filter(p => 
    p.variants && p.variants.some(v => v.dosage === '30mg') && 
    p.variants.some(v => v.dosage === '50mg' || v.dosage === '100mg' || v.strength === '50mg' || v.strength === '100mg')
);
console.log("Products with 30mg AND (50mg or 100mg):", weirdVariants.map(p => p.name));

// 3. Let's see how drops are defined
const drops = products.filter(p => p.variants && p.variants.some(v => v.route === 'Oral' || v.route === 'sublingual' || v.dosage && v.dosage.includes('drops')));
console.log("Products with drops/oral:", drops.map(p => ({
    name: p.name,
    variants: p.variants
})));
