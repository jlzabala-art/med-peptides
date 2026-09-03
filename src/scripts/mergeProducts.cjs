const fs = require('fs');

function run() {
  const products = JSON.parse(fs.readFileSync('products_dump.json', 'utf8'));

  console.log(`Starting with ${products.length} products`);

  const merged = {};

  products.forEach(p => {
    let baseName = p.name || '';
    let extractedDosage = '';
    let extractedForm = '';

    const dosageRegex = /((?:\d+(?:\.\d+)?\s*(?:mg|iu|mcg|ml)\b(?:\s*\+\s*)?)+)(?:\s*(?:\/|-)?\s*(vial|caps(?:\s*x\d+)?|tablet|injectable|anti aging|cosmetic))?/i;
    const match = baseName.match(dosageRegex);

    if (match) {
      extractedDosage = match[1].trim();
      extractedForm = match[2] ? match[2].trim() : '';
      baseName = baseName.replace(match[0], '').trim();
    }
    
    // Remove extra parentheses like (Human Copper)
    baseName = baseName.replace(/\(.*?\)/g, '').trim();
    // Remove trailing hyphens or slashes or pluses
    baseName = baseName.replace(/[\s\-\/\+|]+$/, '').trim();

    if (!baseName) baseName = p.name;

    let supplier = p.supplier || '';
    if (supplier.toLowerCase().includes('magenta') || 
        supplier.toLowerCase().includes('europeptide') || 
        supplier.toLowerCase().includes('fussion') ||
        supplier.toLowerCase().includes('fusion')) {
      p.category = 'Peptides';
      p.productType = 'peptide';
    }

    let key = baseName.toLowerCase();
    if (!merged[key]) {
      merged[key] = {
        ...p,
        name: baseName,
        variants: [],
      };
      if (p.variants && p.variants.length > 0) {
        merged[key].variants = p.variants;
      }
    } else {
      if (p.variants && p.variants.length > 0) {
        merged[key].variants.push(...p.variants);
      }
    }

    if ((!p.variants || p.variants.length === 0) && (extractedDosage || extractedForm || p.price)) {
      merged[key].variants.push({
        id: p.id + '_var',
        dosage: extractedDosage || p.strength || p.dosage || '',
        form: extractedForm || p.form || p.presentation || '',
        supplier: p.supplier,
        pricing: p.pricing || { retail: p.price || 0 }, // fallback to p.price
        isActive: p.isActive !== false,
        isProfessional: p.isProfessional || false,
      });
    }
  });

  const finalProducts = Object.values(merged);
  
  finalProducts.forEach(p => {
    if (p.variants) {
      const uniqueVariants = [];
      const seen = new Set();
      p.variants.forEach(v => {
        // Strip out some common formatting issues
        let d = (v.dosage || v.strength || '').replace(/\s+/g, '').toLowerCase();
        let f = (v.form || '').toLowerCase();
        let s = (v.supplier || '').toLowerCase();
        const sig = `${d}-${f}-${s}`;
        if (!seen.has(sig)) {
          seen.add(sig);
          uniqueVariants.push(v);
        }
      });
      p.variants = uniqueVariants;
    }
  });

  console.log(`Merged down to ${finalProducts.length} products`);
  fs.writeFileSync('products_merged.json', JSON.stringify(finalProducts, null, 2));
}

run();
