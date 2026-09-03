/**
 * Diagnostic script — checks presentations collection, _meta facets, and supplier variant counts
 * Usage: node scripts/diagnostic_check.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

console.log('=== 1. presentations collection ===');
const presSnap = await db.collection('presentations').get();
console.log('Total docs:', presSnap.size);
presSnap.forEach(d => console.log(' ', d.id, '->', JSON.stringify(d.data())));

console.log('\n=== 2. _meta/catalog_facets.presentations ===');
const meta = await db.collection('_meta').doc('catalog_facets').get();
const facets = meta.data();
console.log('presentations field:', JSON.stringify(facets?.presentations));

console.log('\n=== 3. Lotusland variant counts by supplierId value ===');
const allVarSnap = await db.collectionGroup('variants')
  .select('supplierId','supplier','supplierName','isActive','status')
  .get();
console.log('Total variants:', allVarSnap.size);

const supplierCounts = {};
let lotuslandTotal = 0;
allVarSnap.forEach(d => {
  const { supplierId, supplier, supplierName, isActive, status } = d.data();
  const sid = supplierId || supplier;
  if (!sid) return;
  if (!supplierCounts[sid]) supplierCounts[sid] = { total: 0, inactive: 0 };
  supplierCounts[sid].total++;
  if (isActive === false || ['inactive','archived','draft'].includes(status)) {
    supplierCounts[sid].inactive++;
  }
  if (sid?.toLowerCase().includes('lotus') || supplierName?.toLowerCase().includes('lotus')) {
    lotuslandTotal++;
  }
});

const sorted = Object.entries(supplierCounts).sort((a,b) => b[1].total - a[1].total);
console.log('Supplier breakdown (top 10):');
sorted.slice(0,10).forEach(([sid, { total, inactive }]) =>
  console.log(`  ${sid}: ${total} total, ${inactive} inactive`)
);
console.log('\nLotus-related total:', lotuslandTotal);

process.exit(0);
