/**
 * diagnosePDPMatching.mjs
 * Diagnostic script: compares product names in Firestore against
 * the peptide names in the faq_peptide_mapping and peptide_faq collections.
 * 
 * Run: node src/scripts/diagnosePDPMatching.mjs
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: "Med-Peptides-app-27a3a.firebaseapp.com",
  projectId: "Med-Peptides-app",
  storageBucket: "Med-Peptides-app.firebasestorage.app",
  messagingSenderId: "514143707883",
  appId: "1:514143707883:web:6c12470433ef6c992714ae"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('\n🔍 Med-Peptides PDP Matching Diagnostic\n');

const [prodSnap, faqSnap, mappingSnap] = await Promise.all([
  getDocs(collection(db, 'products')),
  getDocs(collection(db, 'peptide_faq')),
  getDocs(collection(db, 'faq_peptide_mapping')),
]);

const products  = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));
const faqs      = faqSnap.docs.map(d => ({ faqId: d.id, ...d.data() }));
const mappings  = mappingSnap.docs.map(d => d.data());

const PRODUCT_NAME_ALIASES = {
  '5-amino 1 mq':                           '5-amino 1mq',
  'cjc-1295 without dac (modified grf 1-29)': 'cjc-1295 without dac',
  'fst-344 (follistatin)':                   'fst-344',
  'hgh':                                     'hgh 10iu',
  'igf-1 lr3':                               'igf-lr3',
  'mk-677 (ibutamoren)':                     'mk-677',
  'mt2 (melanotan ii)':                      'mt2',
  'pt-141 (bremelanotide)':                  'pt-141',
  'tb-500 (thymosin β4)':                    'thymosin b4 (tb-500)',
  'thymosin b4 (tb-500)':                    'thymosin b4 (tb-500)',
};

function resolveProductName(name) {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (PRODUCT_NAME_ALIASES[lower]) return PRODUCT_NAME_ALIASES[lower];
  const stripped = lower.replace(/\s*\([^)]+\)\s*$/, '').trim();
  if (stripped !== lower) return stripped;
  return lower;
}

console.log(`📦 Products in Firestore:       ${products.length}`);
console.log(`❓ FAQs in Firestore:            ${faqs.length}`);
console.log(`🔗 Mappings in Firestore:        ${mappings.length}\n`);

// Build set of all peptide names that appear in mappings
const mappingNames = new Set(mappings.map(m => resolveProductName(m.peptideName)).filter(Boolean));
// Build set of all unique direct-mapped peptide names
const directMappingNames = new Set(
  mappings.filter(m => m.matchType === 'direct').map(m => resolveProductName(m.peptideName)).filter(Boolean)
);

console.log('─'.repeat(70));
console.log('📋 PRODUCT NAME vs. MAPPING COVERAGE\n');

let matched = 0;
let unmatched = 0;
const unmatchedProducts = [];

for (const product of products) {
  const pName = resolveProductName(product.name);
  const hasMapping = mappingNames.has(pName);
  const hasDirect  = directMappingNames.has(pName);
  
  const faqCount = mappings.filter(m => resolveProductName(m.peptideName) === pName).length;
  const directCount = mappings.filter(m => resolveProductName(m.peptideName) === pName && m.matchType === 'direct').length;

  if (!hasMapping) {
    unmatched++;
    unmatchedProducts.push(product.name);
    console.log(`❌  "${product.name}"  →  NO MAPPING FOUND`);
  } else {
    matched++;
    console.log(`✅  "${product.name}"  →  ${directCount} direct, ${faqCount - directCount} semantic mappings`);
  }
}

console.log('\n' + '─'.repeat(70));
console.log(`\n📊 Summary:`);
console.log(`  ✅  Products WITH FAQ mappings:    ${matched}`);
console.log(`  ❌  Products WITHOUT FAQ mappings: ${unmatched}`);

if (unmatchedProducts.length > 0) {
  console.log('\n⚠️  Unmatched products (name mismatch likely):');
  unmatchedProducts.forEach(n => console.log(`   - "${n}"`));
  
  console.log('\n💡 Available peptide names in mapping system:');
  const allMappingNames = [...new Set(mappings.map(m => m.peptideName).filter(Boolean))].sort();
  allMappingNames.forEach(n => console.log(`   • ${n}`));
}

console.log('\n' + '─'.repeat(70));
console.log('\n🔎 FAQ CONTENT CORRECTNESS AUDIT (direct mappings only)\n');

const directMappings = mappings.filter(m => m.matchType === 'direct');
const sampleProducts = products.slice(0, 5); // check first 5 products

for (const product of sampleProducts) {
  const pName = resolveProductName(product.name);
  const productFaqIds = directMappings
    .filter(m => resolveProductName(m.peptideName) === pName)
    .map(m => m.faqId);
  
  const matchedFaqs = faqs.filter(f => productFaqIds.includes(f.faqId));
  
  console.log(`\n📌 ${product.name} (${matchedFaqs.length} direct FAQs):`);
  matchedFaqs.slice(0, 4).forEach((faq, i) => {
    console.log(`   ${i + 1}. [${faq.categoryId}] ${faq.question}`);
  });
}

console.log('\n✅ Diagnostic complete.\n');
process.exit(0);
