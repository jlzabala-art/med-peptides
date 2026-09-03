import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
  // Ignore already initialized
}
const adminDb = getFirestore();

async function run() {
  const [productsSnap, variantsSnap, suppliersSnap] = await Promise.all([
    adminDb.collection('products').where('category', '==', 'Peptides').get(),
    adminDb.collectionGroup('variants').get(),
    adminDb.collection('suppliers').get()
  ]);

  const supplierIdToComputedId = {};
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    const computed = (data.companyName || data.name || '').toLowerCase().replace(/\s+/g, '-');
    supplierIdToComputedId[doc.id] = computed;
  });

  const variantsByProduct = {};
  variantsSnap.forEach(doc => {
    const parentId = doc.ref.parent.parent.id;
    if (!variantsByProduct[parentId]) variantsByProduct[parentId] = [];
    const data = doc.data();
    
    const supplierName = data.supplierName || data.supplier || 'Unknown';
    let supplierId = data.supplierId;
    if (!supplierId) {
      const computed = supplierName.toLowerCase().replace(/\s+/g, '-');
      const foundId = Object.keys(supplierIdToComputedId).find(key => {
        const s = supplierIdToComputedId[key];
        return s === computed || s.includes(computed) || computed.includes(s);
      });
      supplierId = foundId || computed;
    }
    
    // Only care about Lotusland variants
    if (supplierId === 'OLlBbQjgrj6tY7GmM2Jo') {
      variantsByProduct[parentId].push({
        id: doc.id,
        name: data.name,
        dosage: data.dosage,
        canonicalId: parentId,
        supplierId
      });
    }
  });

  const lotuslandProducts = [];
  productsSnap.forEach(doc => {
    const vars = variantsByProduct[doc.id];
    if (vars && vars.length > 0) {
      lotuslandProducts.push({
        id: doc.id,
        name: doc.data().name || doc.data().canonicalName,
        variants: vars
      });
    }
  });

  console.log(`Total Canonical Products for Lotusland in Peptides: ${lotuslandProducts.length}`);
  const totalVars = lotuslandProducts.reduce((acc, p) => acc + p.variants.length, 0);
  console.log(`Total Variants: ${totalVars}`);

  // Find exact duplicates by name
  const nameMap = {};
  lotuslandProducts.forEach(p => {
    const n = (p.name || '').toLowerCase().trim();
    if (!nameMap[n]) nameMap[n] = [];
    nameMap[n].push(p);
  });

  const duplicates = Object.keys(nameMap).filter(k => nameMap[k].length > 1);
  if (duplicates.length > 0) {
    console.log(`\nFound ${duplicates.length} duplicated canonical product names:`);
    for (let i = 0; i < Math.min(10, duplicates.length); i++) {
      const k = duplicates[i];
      console.log(`\nName: "${k}"`);
      nameMap[k].forEach(p => {
        console.log(`  - Doc ID: ${p.id}, Variants: ${p.variants.length} (${p.variants.map(v => v.id).join(', ')})`);
      });
    }
    if (duplicates.length > 10) console.log(`... and ${duplicates.length - 10} more.`);
  } else {
    console.log('\nNo exact name duplicates found in canonical products.');
  }

  // Find duplicate canonical ids across variants?
}
run();
