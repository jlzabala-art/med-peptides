
import fs from 'fs';

const content = fs.readFileSync('/Users/joseluiszabala/Documents/Antigravity/Atlas Health-web/src/data/products.js.backup', 'utf-8');

// Match the array content
const productsMatch = content.match(/export const products = (\[[\s\S]*?\]);/);
if (!productsMatch) {
    console.error('Could not find products array');
    process.exit(1);
}

// Since it's a JS file, not pure JSON, we'll use a simpler approach to extract names and dosages
const products = [];
const entryRegex = /\{([\s\S]*?)\}/g;
let match;
while ((match = entryRegex.exec(productsMatch[1])) !== null) {
    const entry = match[1];
    const nameMatch = entry.match(/"name":\s*"([^"]+)"/);
    const dosageMatch = entry.match(/"dosage":\s*"([^"]+)"/);
    if (nameMatch && dosageMatch) {
        products.push({ name: nameMatch[1], dosage: dosageMatch[1] });
    }
}

// Group by name to get unique peptides and their first dosage
const uniquePeptides = {};
products.forEach(p => {
    if (!uniquePeptides[p.name]) {
        uniquePeptides[p.name] = p.dosage;
    }
});

console.log(JSON.stringify(uniquePeptides, null, 2));
