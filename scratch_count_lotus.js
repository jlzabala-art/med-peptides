import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const adminDb = getFirestore();

async function run() {
  const [productsSnap, variantsSnap, suppliersSnap] = await Promise.all([
    adminDb.collection('products').where('category', '==', 'Peptides').get(),
    adminDb.collectionGroup('variants').get(),
    adminDb.collection('suppliers').get()
  ]);

  const supplierMap = {};
  const supplierIdToComputedId = {};
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    supplierMap[doc.id] = data;
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
    
    variantsByProduct[parentId].push({ id: doc.id, supplierId, supplierName });
  });

  let count = 0;
  productsSnap.forEach(doc => {
    const vars = variantsByProduct[doc.id] || [];
    vars.forEach(v => {
      if (v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo') count++;
    });
  });

  console.log(`Variants for Lotusland in Peptides: ${count}`);
}
run();
