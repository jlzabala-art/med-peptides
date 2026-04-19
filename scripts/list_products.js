import { products } from '../src/data/products.js';
const names = products.map(p => `${p.name} (${p.strength || p.dosage})`);
console.log(names);
