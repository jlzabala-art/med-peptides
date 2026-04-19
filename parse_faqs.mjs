import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backupDir = path.join(__dirname, 'faq_backups');

const faqs = JSON.parse(fs.readFileSync(path.join(backupDir, 'faq_backup.json'), 'utf8'));
const mappings = JSON.parse(fs.readFileSync(path.join(backupDir, 'faq_peptide_mapping_backup.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(backupDir, 'products_backup.json'), 'utf8'));

console.log(`Loaded ${faqs.length} FAQs, ${mappings.length} mappings, ${products.length} products.`);

// Helper to normalize names
const normalize = (name) => name ? name.toLowerCase().trim().replace(/\s+/g, ' ') : '';
const ALIASES = {
  '5-amino 1 mq': '5-amino-1mq',
  '5-amino 1mq': '5-amino-1mq',
  '5-amino-1mq': '5-amino-1mq',
  'cjc-1295 without dac (modified grf 1-29)': 'cjc-1295 without dac',
  'fst-344 (follistatin)': 'fst-344',
  'hgh': 'hgh 10iu',
  'igf-1 lr3': 'igf-lr3',
  'mk-677 (ibutamoren)': 'mk-677',
  'mt2 (melanotan ii)': 'mt2',
  'pt-141 (bremelanotide)': 'pt-141',
  'tb-500 (thymosin β4)': 'thymosin b4 (tb-500)',
  'thymosin b4 (tb-500)': 'thymosin b4 (tb-500)',
};

function resolveProductName(name) {
  let lower = normalize(name);
  if (ALIASES[lower]) return ALIASES[lower];
  const numberNorm = lower.replace(/(\d)\s+(\w)/g, '$1$2').replace(/(\w)\s+(\d)/g, '$1$2');
  if (ALIASES[numberNorm]) return ALIASES[numberNorm];
  const stripped = lower.replace(/\s*\([^)]+\)\s*$/, '').trim();
  if (stripped !== lower) return stripped;
  return lower;
}

// Map each product to its family
const prodToFamily = new Map();
products.forEach(p => {
  if (p.familySlug) {
     prodToFamily.set(resolveProductName(p.name), p.familySlug);
  }
});

const newMappings = [];

// Determine Exact Matches
faqs.forEach(faq => {
  const normNames = (faq.relatedPeptideNames || []).map(resolveProductName);
  
  // If the FAQ specifically targets a peptide, it's exact.
  // We can see if the `faqId` or `question` strongly implies a specific primary product.
  // E.g. "faq_bpc_157_..." should map primarily to BPC-157.
  
  let primaryTarget = null;
  const fid = faq.faqId || faq.docId || '';
  
  // Try to find the primary product from the faqId string.
  for (const p of products) {
    const normP = resolveProductName(p.name);
    // e.g. BPC-157 -> bpc_157
    const expectedSlug = normP.replace(/[^a-z0-9]/g, '_');
    
    // Exact match in faqId (e.g. faq_bpc_157_...)
    if (expectedSlug.length > 3 && fid.includes(expectedSlug)) {
       primaryTarget = p.name;
       break;
    }
    
    // Fallback: check explicitly the first name in relatedPeptideNames
    if (!primaryTarget && normNames.length > 0 && normNames[0] === normP) {
       // Only if the question contains the name
       const qLower = (faq.question || '').toLowerCase();
       if (qLower.includes(normP) || qLower.includes(p.name.toLowerCase())) {
          primaryTarget = p.name;
          break;
       }
    }
  }

  if (primaryTarget) {
     newMappings.push({
       priority: 100, // Exact
       faqId: faq.faqId,
       peptideName: primaryTarget,
       mappingType: 'exact_product',
       familySlug: prodToFamily.get(resolveProductName(primaryTarget)) || 'none'
     });
     return; // done with this FAQ
  }
  
  // If no primary target, check if it's a family-level FAQ (scope === 'family')
  if (faq.scope === 'family' && faq.relatedFamilies && faq.relatedFamilies.length > 0) {
      const fam = faq.relatedFamilies[0];
      // Assign it to ALL products in this family
      products.forEach(p => {
         if (p.familySlug === fam) {
            newMappings.push({
               priority: 50, // Family
               faqId: faq.faqId,
               peptideName: p.name,
               mappingType: 'family',
               familySlug: p.familySlug
            });
         }
      });
  }
});

console.log(`Generated ${newMappings.length} strict, exact-product mappings.`);

// Let's audit what we just generated vs the old ones
const oldCounts = {};
mappings.forEach(m => {
  const pNames = Array.isArray(m.peptideName) ? m.peptideName : [m.peptideName];
  pNames.forEach(p => {
    oldCounts[p] = (oldCounts[p] || 0) + 1;
  });
});

const newCounts = {};
newMappings.forEach(m => {
  const pName = m.peptideName;
  newCounts[pName] = (newCounts[pName] || 0) + 1;
});

console.log("\n--- Verification Report: Old vs New ---");
products.slice(0, 10).forEach(p => {
  console.log(`Product: ${p.name.padEnd(45)} | Old: ${String(oldCounts[p.name] || 0).padEnd(3)} | New: ${String(newCounts[p.name] || 0).padEnd(3)}`);
});

fs.writeFileSync(path.join(backupDir, 'new_mappings.json'), JSON.stringify(newMappings, null, 2));
