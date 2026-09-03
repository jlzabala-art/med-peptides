import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {
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
    
    if (supplierId === 'OLlBbQjgrj6tY7GmM2Jo') {
      variantsByProduct[parentId].push({ id: doc.id, name: data.name, dosage: data.dosage });
    }
  });

  const lotuslandProducts = [];
  productsSnap.forEach(doc => {
    const vars = variantsByProduct[doc.id];
    if (vars && vars.length > 0) {
      lotuslandProducts.push({
        name: doc.data().name || doc.data().canonicalName,
        variants: vars.length
      });
    }
  });

  lotuslandProducts.sort((a,b) => a.name.localeCompare(b.name));
  
  fs.writeFileSync('lotusland_peptides.json', JSON.stringify(lotuslandProducts, null, 2));
  console.log('Written to lotusland_peptides.json');
}
run();
