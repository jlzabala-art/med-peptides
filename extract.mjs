import fs from 'fs';
import { products, productCategories } from './src/data/products.js';
import { supplements } from './src/data/supplements.js';
import protocolBlueprintsV2 from './src/data/protocolBlueprintsV2.js';

fs.writeFileSync('public/data/products.json', JSON.stringify({ products, productCategories }, null, 2));
fs.writeFileSync('public/data/supplements.json', JSON.stringify(supplements, null, 2));
fs.writeFileSync('public/data/protocolBlueprintsV2.json', JSON.stringify(protocolBlueprintsV2, null, 2));

console.log("JSON generated in public/data");
