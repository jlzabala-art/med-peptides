/**
 * sync_supplier_product_counts.cjs
 * 
 * Syncs the `productsSupplied` field on each wholeseller doc
 * by counting actual products linked via `supplierId`.
 * Also reports Fagron duplicates and missing suppliers.
 */
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  // 1. Count products per supplierId
  console.log('=== Counting products per supplierId ===');
  const productsSnap = await db.collection('products').get();
  const countBySupplierId = {};
  const supplierNames = {};

  productsSnap.docs.forEach(d => {
    const data = d.data();
    const sid = data.supplierId;
    if (sid) {
      countBySupplierId[sid] = (countBySupplierId[sid] || 0) + 1;
    }
  });

  // Sort by count desc
  const sorted = Object.entries(countBySupplierId).sort((a, b) => b[1] - a[1]);
  console.log(`\nTotal unique supplierIds in products: ${sorted.length}`);
  console.log('\nTop suppliers by product count:');
  sorted.forEach(([sid, count]) => {
    console.log(`  ${sid}: ${count} products`);
  });

  // 2. Get all wholeseller docs
  console.log('\n=== Wholeseller docs ===');
  const wsSnap = await db.collection('wholesellers').get();
  const wsById = {};
  wsSnap.docs.forEach(d => {
    wsById[d.id] = { id: d.id, ...d.data() };
  });

  // 3. Find Fagron-related entries
  console.log('\n=== Fagron-related wholesellers ===');
  const fagronEntries = Object.values(wsById).filter(w => 
    (w.companyName || w.name || '').toLowerCase().includes('fagron')
  );
  fagronEntries.forEach(f => {
    console.log(`  ID: ${f.id}`);
    console.log(`    Name: ${f.companyName || f.name}`);
    console.log(`    Category: ${f.category}`);
    console.log(`    ProductsSupplied: ${f.productsSupplied || 0}`);
    console.log(`    Status: ${f.status} | B2B: ${f.statusB2B}`);
    console.log('');
  });

  // 4. Find supplierIds that have products but NO wholeseller doc
  console.log('\n=== SupplierIds with products but NO wholeseller doc ===');
  const missingWholesellers = [];
  for (const [sid, count] of sorted) {
    if (!wsById[sid]) {
      missingWholesellers.push({ sid, count });
      console.log(`  ${sid}: ${count} products (NO wholeseller doc)`);
    }
  }

  // 5. Find wholesellers with wrong productsSupplied count
  console.log('\n=== Wholesellers with mismatched productsSupplied ===');
  const updates = [];
  for (const ws of Object.values(wsById)) {
    const current = ws.productsSupplied || 0;
    const actualCount = countBySupplierId[ws.id] || 0;
    if (current !== actualCount) {
      updates.push({ id: ws.id, name: ws.companyName || ws.name, current, actual: actualCount });
      console.log(`  ${ws.companyName || ws.name} (${ws.id}): ${current} → ${actualCount}`);
    }
  }

  // 6. Apply fixes — update productsSupplied counts
  if (updates.length > 0) {
    console.log(`\n=== Applying ${updates.length} productsSupplied fixes ===`);
    const batch = db.batch();
    for (const u of updates) {
      batch.update(db.collection('wholesellers').doc(u.id), { productsSupplied: u.actual });
    }
    await batch.commit();
    console.log('✅ All productsSupplied counts updated!');
  } else {
    console.log('\n✅ All counts are already correct.');
  }

  // 7. Report Fagron product counts from products collection
  console.log('\n=== Fagron supplierIds in products collection ===');
  for (const [sid, count] of sorted) {
    if (sid.toLowerCase().includes('fagron')) {
      console.log(`  ${sid}: ${count} products`);
    }
  }
}

run().catch(console.error);
