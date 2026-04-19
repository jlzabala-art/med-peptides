import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wholesaleDataPath = path.join(__dirname, '../wholesale_parsed.json');
const productsFilePath = path.join(__dirname, '../src/data/products.js');

// Helper to safely parse the products.js
const parseProductsFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  // We need to extract the parts for productCategories and products
  const categoryMatch = content.match(/export const productCategories = (\[[\s\S]*?\]);/);
  const categories = categoryMatch ? categoryMatch[1] : '[]';
  
  const evalSource = content
    .replace(/export const productCategories[\s\S]*?];/, '')
    .replace(/export const products = /, 'const products = ')
    .replace(/export default/, '// export default');
    
  let products = [];
  try {
    const fn = new Function(`${evalSource}\nreturn products;`);
    products = fn();
  } catch(e) {
    console.error("Failed parsing", e);
    process.exit(1);
  }
  
  return { categoriesStr: categories, products };
};

const normalizeStr = (str) => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

const run = () => {
  const wholesaleStr = fs.readFileSync(wholesaleDataPath, 'utf-8');
  const wholesaleMap = JSON.parse(wholesaleStr);
  const { categoriesStr, products } = parseProductsFile(productsFilePath);

  let updatedCount = 0;
  let newCount = 0;
  let deprecatedCount = 0;

  // Transform wholesale to a flat array to cross reference
  const wholesaleFlats = [];
  for (const [name, variants] of Object.entries(wholesaleMap)) {
    // Ignore ancillaries
    if (name.includes('Syringe') || name.includes('Bacteriostatic')) continue;
    
    variants.forEach(v => {
      wholesaleFlats.push({
        baseName: name, 
        strength: v.strength, 
        unit_price: v.unit_price, 
        kit_price: v.kit_price,
        matched: false
      });
    });
  }

  // 1. Update Existing Products in Firebase Catalog
  products.forEach(p => {
    // Reset status string to prevent carrying over old deprecated tags unless explicitly caught
    p.status = 'active'; 

    let matchedWholesale = false;
    for (const w of wholesaleFlats) {
      if (normalizeStr(p.name).includes(normalizeStr(w.baseName)) || normalizeStr(w.baseName).includes(normalizeStr(p.name))) {
        // Now check dosage match
        if (p.dosage && p.dosage.replace(' ', '').toLowerCase() === w.strength.replace(' ', '').toLowerCase()) {
          matchedWholesale = true;
          w.matched = true;
          
          if (p.perVialPriceUSD !== w.unit_price || p.kitPriceUSD !== w.kit_price) {
            console.log(`PRICE OVERRIDDEN FROM WHOLESALE FILE: ${p.name} ${p.dosage}`);
            p.perVialPriceUSD = w.unit_price;
            p.kitPriceUSD = w.kit_price;
            p.source = 'wholesale';
            updatedCount++;
          }
        }
      }
    }

    if (!matchedWholesale) {
      // Meaning the product exists in Firebase/catalog but not Wholesale
      p.status = 'deprecated';
      deprecatedCount++;
    }
  });

  // 2. Create Missing Products automatically
  wholesaleFlats.forEach(w => {
    if (!w.matched) {
      // If we don't have this, create it
      products.push({
        status: 'active',
        source: 'wholesale',
        category: "Other Research Peptides",
        name: w.baseName.trim(),
        dosage: w.strength.trim(),
        quantity: "10 vial/kit",
        perVialPriceUSD: w.unit_price,
        kitPriceUSD: w.kit_price,
        desc: "Auto-generated from wholesale pricing synchronization.",
        searchAliases: [w.baseName.toLowerCase().trim()],
        image: "/assets/vials/standard-vial.png",
      });
      console.log(`NEW PRODUCT SYNCED: ${w.baseName} ${w.strength}`);
      newCount++;
    }
  });

  // 3. Rebuild products.js file
  const newContent = `export const productCategories = ${categoriesStr};\n\nexport const products = ${JSON.stringify(products, null, 2)};\n`;
  fs.writeFileSync(productsFilePath, newContent);

  console.log('--- SYNC STATISTICS ---');
  console.log(`Updated Prices: ${updatedCount}`);
  console.log(`New Products: ${newCount}`);
  console.log(`Deprecated Products: ${deprecatedCount}`);
  console.log(`Total Products: ${products.length}`);
};

run();
