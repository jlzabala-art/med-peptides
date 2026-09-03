#!/usr/bin/env node
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function run() {
  const [productsSnap, allVariantsSnap, categoriesSnap, suppliersSnap] = await Promise.all([
    db.collection('products').get(),
    db.collectionGroup('variants').get(),
    db.collection('categories').get(),
    db.collection('suppliers').get()
  ]);

  const prodMap = new Map();
  productsSnap.forEach(d => prodMap.set(d.id, d.data()));

  const lotusByProduct = new Map();
  let totalLotusVariants = 0;

  for (const doc of allVariantsSnap.docs) {
    const d = doc.data();
    const sId = (d.supplierId || '').toLowerCase();
    const isLotus = sId === 'supplier-lotusland' || sId.includes('lotus') || (d.supplier && d.supplier.toLowerCase().includes('lotus'));
    if (isLotus) {
      totalLotusVariants++;
      const pId = doc.ref.parent.parent ? doc.ref.parent.parent.id : 'unknown';
      const pData = prodMap.get(pId) || {};
      if (!lotusByProduct.has(pId)) {
        lotusByProduct.set(pId, { id: pId, name: pData.name, categoryId: pData.categoryId, status: pData.status, type: pData.type, variants: [] });
      }
      lotusByProduct.get(pId).variants.push({
        id: doc.id,
        sku: d.sku,
        presentation: d.presentation,
        concentration: d.concentration,
        dosage: d.dosage,
        pricing: d.pricing,
        stock: d.stock
      });
    }
  }

  console.log(`=== LOTUS LAND IN FIRESTORE ===`);
  console.log(`Total Products: ${lotusByProduct.size}`);
  console.log(`Total Lotus Variants in Firestore: ${totalLotusVariants}`);

  const sorted = Array.from(lotusByProduct.values()).sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
  sorted.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(3, ' ')}. [${p.id}] "${p.name}" (cat: ${p.categoryId}, status: ${p.status}) -> ${p.variants.length} variant(s)`);
    p.variants.forEach(v => {
      console.log(`       • ${v.id} | SKU: ${v.sku || 'N/A'} | Pres: ${v.presentation || '-'} | Conc: ${v.concentration || v.dosage || '-'}`);
    });
  });

  // Check 104 master file
  const master = JSON.parse(readFileSync(resolve(__dirname, '..', 'lotus_variants_final.json'), 'utf8'));
  const canonical104 = master.filter(e => e.id && e.id.startsWith('var_'));
  console.log(`\nMaster Lotus Canonical Count in file: ${canonical104.length}`);

  const auditReport = {
    summary: {
      totalProductsInCatalog: productsSnap.size,
      totalVariantsInCatalog: allVariantsSnap.size,
      totalCategories: categoriesSnap.size,
      totalSuppliers: suppliersSnap.size,
      lotusLandProducts: lotusByProduct.size,
      lotusLandVariants: totalLotusVariants,
      lotusLandExpected: 104
    },
    lotusProducts: sorted
  };

  writeFileSync(resolve(__dirname, 'lotus_audit_summary.json'), JSON.stringify(auditReport, null, 2));
  console.log('\nReport written to lotus_audit_summary.json');
}

run().catch(console.error);
