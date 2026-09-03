import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}
const adminDb = getFirestore();

async function run() {
  const [productsSnap, variantsSnap] = await Promise.all([
    adminDb.collection('products').where('category', '==', 'Peptides').get(),
    adminDb.collectionGroup('variants').get()
  ]);

  const productNames = {};
  productsSnap.forEach(doc => {
    productNames[doc.id] = doc.data().name || doc.data().canonicalName || doc.id;
  });

  const lotusVariants = [];
  variantsSnap.forEach(doc => {
    const parentId = doc.ref.parent.parent.id;
    const data = doc.data();
    if (productNames[parentId] && data.supplierId === 'OLlBbQjgrj6tY7GmM2Jo') {
      lotusVariants.push({
        id: doc.id,
        parentProduct: productNames[parentId],
        variantName: data.name,
        dosage: data.dosage || data.dose,
      });
    }
  });

  console.log(`Total Variants found in Peptides for Lotusland: ${lotusVariants.length}`);

  const map = {};
  lotusVariants.forEach(v => {
    const key = `${v.parentProduct} --- ${v.variantName || v.dosage}`;
    if (!map[key]) map[key] = [];
    map[key].push(v);
  });

  const dups = Object.keys(map).filter(k => map[k].length > 1);
  if (dups.length > 0) {
    console.log(`\nFound ${dups.length} exact duplicate variants (same canonical + same dosage name):`);
    dups.forEach(k => {
      console.log(`- ${k}: ${map[k].length} copies`);
    });
  } else {
    console.log(`\nNo exact duplicates found. All ${lotusVariants.length} variants have unique names per canonical product.`);
  }

  // Print all variants nicely formatted to save to a file
  fs.writeFileSync('lotus_variants_final.json', JSON.stringify(lotusVariants, null, 2));
}
run();
