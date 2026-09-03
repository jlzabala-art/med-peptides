const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products_dump.json', 'utf8'));

const bpc157 = products.filter(p => p.name && p.name.includes("BPC"));
console.log("BPC-157 products:", JSON.stringify(bpc157.map(p => ({
    id: p.id,
    name: p.name,
    supplier: p.supplier,
    variants: p.variants
})), null, 2));

const drops = products.filter(p => p.variants && p.variants.some(v => v.route === 'Oral' || v.route === 'sublingual' || v.dosage && v.dosage.includes('drops') || v.form === 'drops'));
console.log("Products with drops/oral:");
drops.forEach(p => console.log(p.name, JSON.stringify(p.variants)));

