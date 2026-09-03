import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}
const adminDb = getFirestore();

async function run() {
  const productsSnap = await adminDb.collection('products')
    .where('category', '==', 'Peptides')
    .get();
  
  let lotusVariants = [];
  
  for (const doc of productsSnap.docs) {
    const pData = doc.data();
    const pName = pData.name || pData.canonicalName || doc.id;

    const variantsSnap = await doc.ref.collection('variants')
      .where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo')
      .get();
    
    variantsSnap.forEach(vDoc => {
      const vData = vDoc.data();
      lotusVariants.push({
        id: vDoc.id,
        parentProduct: pName,
        variantName: vData.name,
        dosage: vData.dosage || vData.dose,
        createdAt: vData.createdAt || vData.created_at,
        price: vData.price,
        supplierName: vData.supplierName || vData.supplier
      });
    });
  }

  console.log(`Total Variants found: ${lotusVariants.length}`);

  // Look for exact duplicates in the variants list (same parent, same dosage/name)
  const map = {};
  lotusVariants.forEach(v => {
    const key = `${v.parentProduct} --- ${v.variantName || v.dosage}`;
    if (!map[key]) map[key] = [];
    map[key].push(v);
  });

  const dups = Object.keys(map).filter(k => map[k].length > 1);
  console.log(`\nFound ${dups.length} duplicate variants (same parent + same variant name):`);
  dups.forEach(k => {
    console.log(k);
    map[k].forEach(v => console.log(`   - ID: ${v.id}, created: ${v.createdAt}`));
  });

  if (dups.length > 0) {
    const totalDups = dups.reduce((acc, k) => acc + map[k].length - 1, 0);
    console.log(`\nTotal redundant variants: ${totalDups}`);
    console.log(`151 - ${totalDups} = ${151 - totalDups}`);
  }
}
run();
