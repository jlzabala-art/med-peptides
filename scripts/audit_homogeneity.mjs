import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

const suppliers = [
  'supplier-nplabs',
  'supplier-europeptides',
  'supplier-vallida',
  'supplier-bioniq',
  'supplier-lotusland',
];

console.log('=======================================================');
console.log(' HOMOGENEITY AUDIT: IDs, Formats, Strength Fields');
console.log('=======================================================\n');

// Fields that express strength/dose/concentration
const STRENGTH_FIELDS = ['dose','strength','total_mg','concentration','dosage','amount','potency','unit_price','price_per_mg_usd'];
// Fields that express presentation/format
const FORMAT_FIELDS   = ['presentation','dosage_form','formatId','format','form','type','category','subcategory'];

for (const supplierId of suppliers) {
  const snap = await db.collection('products').where('supplierId','==',supplierId).get();
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`SUPPLIER: ${supplierId}  (${docs.length} products)`);
  console.log(`${'─'.repeat(60)}`);

  // 1. ID patterns
  const idPatterns = {};
  docs.forEach(p => {
    // classify id pattern
    let pattern = 'unknown';
    if (/^bioniq_/.test(p.id)) pattern = 'bioniq_prefix';
    else if (/^supplier-/.test(p.id)) pattern = 'supplier_prefix';
    else if (/^[a-z0-9]+-\d+mg/.test(p.id)) pattern = 'name-dose';
    else if (/^[a-z0-9-]+$/.test(p.id)) pattern = 'slugified';
    else pattern = 'other';
    idPatterns[pattern] = (idPatterns[pattern] || 0) + 1;
  });
  console.log('\n  📋 ID Patterns:', JSON.stringify(idPatterns));
  console.log('  Examples:');
  docs.slice(0,4).forEach(p => console.log(`    - ${p.id}`));

  // 2. Name patterns
  console.log('\n  📝 Product Names (first 5):');
  docs.slice(0,5).forEach(p => console.log(`    - "${p.name || p.displayName || p.canonicalName}"`));

  // 3. Strength/dose fields presence
  const strengthPresence = {};
  STRENGTH_FIELDS.forEach(f => {
    const count = docs.filter(p => p[f] != null).length;
    if (count > 0) strengthPresence[f] = count;
  });
  console.log('\n  💊 Strength/dose fields present:', JSON.stringify(strengthPresence));
  // Show sample values
  const primaryStrength = Object.keys(strengthPresence)[0];
  if (primaryStrength) {
    const samples = docs.filter(p => p[primaryStrength] != null).slice(0,4).map(p => `${p.id}: ${p[primaryStrength]}`);
    console.log('  Sample:', samples.join(' | '));
  }

  // 4. Format/presentation fields
  const formatPresence = {};
  FORMAT_FIELDS.forEach(f => {
    const values = [...new Set(docs.filter(p => p[f] != null).map(p => String(p[f])))];
    if (values.length > 0) formatPresence[f] = values.slice(0,6);
  });
  console.log('\n  🧪 Format fields:', JSON.stringify(formatPresence, null, 2));

  // 5. canonicalId presence
  const hasCanonical = docs.filter(p => p.canonicalId).length;
  const hasSlug      = docs.filter(p => p.slug).length;
  console.log(`\n  🔗 canonicalId: ${hasCanonical}/${docs.length} | slug: ${hasSlug}/${docs.length}`);
}

console.log('\n=======================================================');
console.log(' CROSS-SUPPLIER: Same peptide, different products?');
console.log('=======================================================');

// Try to find "duplicate" peptides across suppliers (same canonicalName)
const allDocs = [];
for (const supplierId of suppliers) {
  const snap = await db.collection('products').where('supplierId','==',supplierId).get();
  snap.docs.forEach(d => allDocs.push({ id: d.id, supplierId, ...d.data() }));
}

// Group by canonicalName
const byCanonical = {};
allDocs.forEach(p => {
  const key = (p.canonicalName || p.name || '').toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  if (!key) return;
  if (!byCanonical[key]) byCanonical[key] = [];
  byCanonical[key].push(p);
});

// Find ones with multiple suppliers
const multiSupplier = Object.entries(byCanonical)
  .filter(([k, docs]) => {
    const s = new Set(docs.map(d => d.supplierId));
    return s.size > 1;
  })
  .slice(0,10);

if (multiSupplier.length === 0) {
  console.log('\n  ⚠️  No products share the same canonicalName across suppliers.');
  console.log('  → This means canonical IDs are not being used for cross-supplier linking.\n');
} else {
  console.log(`\n  Found ${multiSupplier.length} canonical names shared across suppliers:`);
  multiSupplier.forEach(([name, docs]) => {
    console.log(`\n  "${name}":`);
    docs.forEach(d => console.log(`    → [${d.supplierId}] id=${d.id} | dose=${d.dose||d.strength||d.total_mg||'?'} | format=${d.dosage_form||d.presentation||'?'}`));
  });
}

process.exit(0);
