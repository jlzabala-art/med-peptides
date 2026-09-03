import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

const TARGET_SUPPLIERS = [
  { key: 'nplabs', keywords: ['nplab', 'np labs', 'np-labs', 'nplabs'] },
  { key: 'europeptides', keywords: ['europeptides', 'euro peptides'] },
  { key: 'vallida', keywords: ['vallida'] },
  { key: 'bioniq', keywords: ['bioniq'] },
  { key: 'lotusland', keywords: ['lotusland', 'lotus land'] }
];

async function verifyAll() {
  console.log('==================================================');
  console.log(' SUPPLIER INTEGRATION DIAGNOSTIC REPORT');
  console.log('==================================================\n');

  // 1. Fetch all suppliers
  const suppliersSnap = await db.collection('suppliers').get();
  const allSuppliers = suppliersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Total Suppliers in 'suppliers' collection: ${allSuppliers.length}\n`);

  console.log('--- ALL SUPPLIERS IN FIRESTORE ---');
  allSuppliers.forEach(s => console.log(` - ID: ${s.id} | Name: "${s.name || s.companyName}" | Country: ${s.country || 'N/A'}`));
  console.log('');

  // 2. Fetch all products projection (only necessary fields to save memory)
  const productsSnap = await db.collection('products').select('supplierId', 'supplierName', 'name', 'status', 'pricing', 'variants').get();
  console.log(`Total Products in 'products' collection: ${productsSnap.size}\n`);

  const allProducts = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const summary = [];

  for (const target of TARGET_SUPPLIERS) {
    console.log(`--------------------------------------------------`);
    console.log(`🔍 Target: "${target.key.toUpperCase()}"`);
    console.log(`--------------------------------------------------`);

    // Match supplier doc
    const matchedSuppliers = allSuppliers.filter(s => {
      const name = (s.name || s.companyName || s.id || '').toLowerCase();
      return target.keywords.some(k => name.includes(k));
    });

    let suppDocInfo = '❌ MISSING';
    if (matchedSuppliers.length > 0) {
      suppDocInfo = matchedSuppliers.map(s => `${s.id} (${s.name || s.companyName}) [Country: ${s.country || 'N/A'}]`).join(', ');
      console.log(`✅ Supplier Doc(s): ${suppDocInfo}`);
    } else {
      console.log(`❌ Supplier Doc: NOT FOUND in 'suppliers' collection!`);
    }

    // Match products
    const matchedProducts = allProducts.filter(p => {
      const suppId = (p.supplierId || '').toLowerCase();
      const suppName = (p.supplierName || '').toLowerCase();
      const hasVariantMatch = (p.variants || []).some(v => 
        target.keywords.some(k => (v.supplier || v.supplierName || '').toLowerCase().includes(k))
      );
      return target.keywords.some(k => suppId.includes(k) || suppName.includes(k)) || hasVariantMatch;
    });

    console.log(`📦 Linked Products Count: ${matchedProducts.length}`);

    if (matchedProducts.length > 0) {
      let activeCount = 0;
      matchedProducts.forEach(p => {
        if (p.status === 'active' || !p.status) activeCount++;
      });
      console.log(`   - Active Status: ${activeCount} / ${matchedProducts.length}`);
      console.log(`   - Sample Product: "${matchedProducts[0].name}" (ID: ${matchedProducts[0].id})`);
    }

    summary.push({
      Supplier: target.key.toUpperCase(),
      "Supplier Doc": matchedSuppliers.length > 0 ? "✅ Found" : "❌ Missing",
      "Supplier ID(s)": matchedSuppliers.map(s => s.id).join(', ') || 'N/A',
      "Total Products": matchedProducts.length
    });
    console.log('');
  }

  console.log('==================================================');
  console.log(' SUMMARY TABLE');
  console.log('==================================================');
  console.table(summary);

  process.exit(0);
}

verifyAll().catch(err => {
  console.error(err);
  process.exit(1);
});
