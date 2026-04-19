const fs = require('fs');

const productsFile = fs.readFileSync('src/data/products.js', 'utf8');

// Use a simple split/substring to get the products array
const startMarker = 'export const products = [';
const startIndex = productsFile.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find start marker");
  process.exit(1);
}

// Find the end of the array by balancing brackets (rough)
let bracketCount = 0;
let endIndex = -1;
for (let i = startIndex + startMarker.length - 1; i < productsFile.length; i++) {
  if (productsFile[i] === '[') bracketCount++;
  if (productsFile[i] === ']') bracketCount--;
  if (bracketCount === 0) {
    endIndex = i;
    break;
  }
}

const productsJson = productsFile.substring(startIndex + 'export const products ='.length, endIndex + 1);

let products;
try {
  products = eval(productsJson);
} catch (e) {
  console.error("Eval failed, might be more markers? " + e.message);
  process.exit(1);
}

const allFaqs = [];
products.forEach(p => {
  if (p.faqModalItems) {
    p.faqModalItems.forEach((item, idx) => {
      const faqId = `faq_${p.name.toLowerCase().replace(/\s+/g, '_')}_${idx}`;
      allFaqs.push({
        id: faqId,
        question: item.q,
        answer_short: item.a.substring(0, 150),
        answer_long: item.a,
        type: 'product',
        category: p.category,
        tags: p.tags || [],
        product_ids: [p.name.toLowerCase().replace(/\s+/g, '_')],
        related_protocol_ids: [],
        related_faq_ids: [],
        related_theme_ids: [],
        priority_score: 5,
        verified: true,
        clinical_review_date: new Date().toISOString(),
        source_type: 'local_migration',
        language: 'en'
      });
    });
  }
});

fs.writeFileSync('faq_migration.json', JSON.stringify(allFaqs, null, 2));
console.log(`Successfully extracted ${allFaqs.length} FAQs to faq_migration.json`);
