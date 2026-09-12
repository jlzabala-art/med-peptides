import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkKlow() {
  console.log('--- SEARCHING PRODUCTS WITH KLOW ---');
  const prodsSnap = await db.collection('products').get();
  const klowProds = [];
  prodsSnap.forEach(doc => {
    const data = doc.data();
    const name = data.name || data.canonicalName || data.displayName || '';
    const slug = data.slug || '';
    if (name.toLowerCase().includes('klow') || slug.toLowerCase().includes('klow') || doc.id.toLowerCase().includes('klow')) {
      klowProds.push({ id: doc.id, name, slug, supplier: data.supplier, supplierName: data.supplierName, variantsCount: data.variants?.length || 0, embeddedVariants: data.variants });
    }
  });

  console.log(`Found ${klowProds.length} KLOW products:`);
  for (const p of klowProds) {
    console.log(`\nProduct ID: ${p.id}, Name: ${p.name}, Slug: ${p.slug}, Supplier: ${p.supplierName || p.supplier}`);
    console.log(`Embedded variants count: ${p.variantsCount}`);
    if (p.embeddedVariants) {
      console.log('Embedded variants:', JSON.stringify(p.embeddedVariants, null, 2));
    }
    
    // Check subcollection variants
    const varSnap = await db.collection('products').doc(p.id).collection('variants').get();
    console.log(`Subcollection variants count: ${varSnap.size}`);
    varSnap.forEach(vDoc => {
      const v = vDoc.data();
      console.log(` - Variant ID: ${vDoc.id}, format: ${v.format || v.presentation}, name: ${v.name || v.presentationName}, dosage: ${v.dosage || v.size}, price: ${v.price || v.cost || v.trade_price}, supplier: ${v.supplierName || v.supplier || v.supplierId}`);
    });
  }
}

checkKlow().catch(console.error).finally(() => process.exit(0));
