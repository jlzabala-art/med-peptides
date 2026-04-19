const fs = require('fs');

// We need to carefully read the file since it's an export const products = [...]
// Using a simpler approach: Read the file, and since it is structured like a JS object, 
// we'll try to extract the objects.
// Actually, I'll just use a small node script to import it and extract.

try {
  const productsFile = fs.readFileSync('src/data/products.js', 'utf8');
  
  // Since it's ES6 export, we might need a workaround for a plain script.
  // I'll strip the export and just eval it or similar for extraction.
  const code = productsFile.replace('export const productCategories =', 'const productCategories =')
                           .replace('export const products =', 'const products =')
                           + '\nconsole.log(JSON.stringify(products, null, 2));';
  
  // This is a bit risky but this is a controlled environment.
  // Better: Extract only what's needed with regex or a parser.
  
  // Actually, I'll just write a script that can be run with node and uses `require` or similar
  // Or just use the already converted code.
  
  fs.writeFileSync('extract_faq.js', `
const products = ${productsFile.split('export const products =')[1].split(';')[0]};
const allFaqs = [];
products.forEach(p => {
  if (p.faqModalItems) {
    p.faqModalItems.forEach(item => {
      allFaqs.push({
        product_name: p.name,
        question: item.q,
        answer: item.a,
        type: 'product',
        category: p.category,
        product_ids: [p.name.toLowerCase().replace(/\\s+/g, '_')]
      });
    });
  }
});
console.log(JSON.stringify(allFaqs, null, 2));
`);

} catch (e) {
  console.error("Extraction failed", e);
}
