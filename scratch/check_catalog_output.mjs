import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function simulateGetCatalog() {
  const pSnap = await db.collection('products').where('isActive', '==', true).get();
  const products = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  console.log(`Total active products: ${products.length}`);
  
  let zeroVariantsCount = 0;
  let nonZeroVariantsCount = 0;
  
  for (const product of products) {
    const vSnap = await db.collection('products').doc(product.id).collection('variants').get();
    const subcollectionVariants = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Exact logic from getCatalog:
    const variants = subcollectionVariants.map((v) => ({
      ...v,
      _docId: product.id,
      dosage: v.dosage || product.dosage || null,
    }));
    
    const finalProduct = { ...product, variants };
    
    if (finalProduct.variants.length === 0) {
      zeroVariantsCount++;
      // Let's see if there was flat pricing or flat variants on the product
      const hasFlatPricing = !!product.pricing;
      const hasFlatVariants = !!product.variants;
      console.log(`- Product ${product.id} has 0 variants in catalog. Flat pricing? ${hasFlatPricing}, Flat variants? ${hasFlatVariants}`);
    } else {
      nonZeroVariantsCount++;
    }
  }
  
  console.log(`\nFinal Summary:\nProducts with >0 variants: ${nonZeroVariantsCount}\nProducts with 0 variants: ${zeroVariantsCount}`);
}

simulateGetCatalog().then(() => process.exit(0));
