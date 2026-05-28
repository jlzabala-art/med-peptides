import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.resolve(__dirname, '../src/data/products.js');
const referencesPath = path.resolve(__dirname, '../scratch/peptide_references.json');

// 1. Read existing products.js
const rawProducts = readFileSync(productsPath, 'utf-8');
const productsStartMarker = 'export const products =';
const startIdx = rawProducts.indexOf(productsStartMarker);
if (startIdx === -1) {
  throw new Error("Could not find 'export const products =' in products.js");
}
const jsonStart = rawProducts.indexOf('[', startIdx);
const jsonEnd = rawProducts.lastIndexOf(']') + 1;
const products = JSON.parse(rawProducts.substring(jsonStart, jsonEnd));

console.log(`Loaded ${products.length} products to enrich clinical details.`);

// 2. Load the fetched references
const references = JSON.parse(readFileSync(referencesPath, 'utf-8'));

// Override BPC-157 references with the correct ones we verified
references['BPC-157'] = [
  {
    pmid: '40756949',
    title: 'Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review.',
    journal: 'HSS journal : the musculoskeletal journal of Hospital for Special Surgery',
    year: '2025'
  },
  {
    pmid: '30915550',
    title: 'Gastric pentadecapeptide body protection compound BPC 157 and its role in accelerating musculoskeletal soft tissue healing.',
    journal: 'Cell and tissue research',
    year: '2019'
  },
  {
    pmid: '40005999',
    title: 'Multifunctionality and Possible Medical Application of the BPC 157 Peptide-Literature and Patent Review.',
    journal: 'Pharmaceuticals (Basel, Switzerland)',
    year: '2025'
  }
];

// Normalize keys for case-insensitive matching
const refKeysMap = {};
Object.keys(references).forEach(k => {
  refKeysMap[k.toLowerCase()] = references[k];
});

let updatedCount = 0;

// 3. Merge references and PK data into products
products.forEach(p => {
  if (p.productType !== 'peptide' && p.type !== 'peptide' && p.category === 'Research Supplies') {
    return;
  }
  
  const nameKey = p.name.trim().toLowerCase();
  let matches = refKeysMap[nameKey];
  if (!matches) {
    // Try substring matching
    const foundKey = Object.keys(refKeysMap).find(k => nameKey.includes(k) || k.includes(nameKey));
    if (foundKey) {
      matches = refKeysMap[foundKey];
    }
  }
  
  if (matches) {
    if (!p.typeData) {
      p.typeData = {};
    }
    
    // Set clinical references
    p.typeData.references = matches;
    
    // Set/improve PK data based on local constants
    if (nameKey.includes('bpc-157') || nameKey.includes('bpc157')) {
      p.typeData.halfLife = '30 minutes (systemic actions cascade)';
      p.typeData.clearance = 'Kidney clearance';
    } else if (nameKey.includes('tb-500') || nameKey.includes('tb500')) {
      p.typeData.halfLife = '72-120 hours';
      p.typeData.clearance = 'Renal clearance';
    } else if (nameKey.includes('ghk')) {
      p.typeData.halfLife = '1 hour';
      p.typeData.clearance = 'Rapid tissue uptake / blood clearance';
    } else if (nameKey.includes('mots')) {
      p.typeData.halfLife = '2 hours';
      p.typeData.clearance = 'Intracellular / mitochondrial metabolic cascade';
    } else if (nameKey.includes('epitalon') || nameKey.includes('epithalon')) {
      p.typeData.halfLife = '1 hour';
      p.typeData.clearance = 'Pineal gland receptor saturation';
    } else if (nameKey.includes('semaglutide')) {
      p.typeData.halfLife = '7 days';
      p.typeData.clearance = 'Renal/fecal clearance';
    } else if (nameKey.includes('tirzepatide')) {
      p.typeData.halfLife = '5 days';
      p.typeData.clearance = 'Metabolic peptide degradation';
    }
    
    updatedCount++;
  }
});

console.log(`Enriched ${updatedCount} products with PMIDs and PK parameters.`);

// 4. Save updated products back to products.js
const prefix = rawProducts.substring(0, jsonStart);
const suffix = rawProducts.substring(jsonEnd);
const outputContent = prefix + JSON.stringify(products, null, 2) + suffix;

writeFileSync(productsPath, outputContent, 'utf-8');
console.log('✅ products.js enriched and saved successfully.');
