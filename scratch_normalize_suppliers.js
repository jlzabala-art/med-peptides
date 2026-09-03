import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Normalization function
const normalizeSupplierId = (sup) => {
  if (!sup) return 'lotusland'; // Default fallback
  const s = sup.trim().toLowerCase();
  if (s.includes('lotusland')) return 'lotusland';
  if (s.includes('pod poland') || s === 'pod-poland') return 'pod_poland';
  if (s.includes('fagron')) return 'fagron_iberica';
  if (s.includes('nplab')) return 'nplab';
  if (s.includes('europeptides')) return 'europeptides';
  if (s.includes('dn lab') || s.includes('dnlab')) return 'dn_lab';
  return s.replace(/\s+/g, '_'); // Fallback id creation
};

async function run() {
  const productsRef = db.collection('products');
  const pSnap = await productsRef.get();
  
  let updatedCount = 0;
  
  for (const doc of pSnap.docs) {
    const data = doc.data();
    let needsUpdate = false;
    const newData = { ...data };

    // Check top level supplier
    if (data.supplier) {
      const norm = normalizeSupplierId(data.supplier);
      if (norm !== data.supplier) {
        newData.supplier = norm;
        needsUpdate = true;
      }
    }

    // Check variants
    if (Array.isArray(data.variants)) {
      newData.variants = data.variants.map(v => {
        if (!v) return v;
        const norm = normalizeSupplierId(v.supplier);
        if (v.supplier !== norm) {
          needsUpdate = true;
          return { ...v, supplier: norm };
        }
        return v;
      });
    }
    
    if (needsUpdate) {
      await productsRef.doc(doc.id).update(newData);
      console.log(`Updated product ${doc.id} (${data.name})`);
      updatedCount++;
    }
  }
  
  console.log(`Done! Updated ${updatedCount} products.`);
}

run().catch(console.error);
