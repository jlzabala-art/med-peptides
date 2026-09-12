import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { sanitizePublicProduct } from '../repositories/publicDataSanitizer.js';
import { processProductVariants } from '../utils/productVariantProcessing.js';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function testKlow() {
  const target = 'klow-peptide';
  const supplierFilter = 'supplier-magenta';

  console.log('Testing getPublicProduct for', target, supplierFilter);

  const byId = await db.collection('products').doc(target).get().catch(err => {
    console.error('byId error:', err);
    return null;
  });

  if (!byId?.exists) {
    console.log('Product doc does not exist!');
    return;
  }

  const raw = { id: byId.id, ...byId.data() };
  console.log('Found product:', raw.name, 'status:', raw.status, 'type:', raw.type, 'category:', raw.category);

  let rawVariants = Array.isArray(raw.variants) && raw.variants.length > 0 ? raw.variants : null;
  console.log('rawVariants length:', rawVariants?.length);

  const activeSupplier = (supplierFilter || raw.supplierName || raw.supplier || raw.supplierId || '').toLowerCase().trim();
  console.log('activeSupplier:', activeSupplier);

  if (activeSupplier.includes('lotusland')) {
    console.log('Matched lotusland');
  } else if (supplierFilter) {
    const sFilterLower = supplierFilter.toLowerCase();
    const filtered = (rawVariants || []).filter(v => {
      const vSupp = (v.supplierName || v.supplier || v.supplierId || '').toLowerCase();
      return vSupp.includes(sFilterLower) || sFilterLower.includes(vSupp);
    });
    console.log('Filtered variants count for supplierFilter:', filtered.length);
  }

  try {
    const sanitized = sanitizePublicProduct(raw, rawVariants);
    console.log('Sanitized successfully, variants:', sanitized?.variants?.length);

    const processedHierarchy = processProductVariants(sanitized.variants || []);
    console.log('processedHierarchy:', JSON.stringify(processedHierarchy, null, 2));
  } catch (err) {
    console.error('Error in sanitize/hierarchy:', err);
  }
}

testKlow().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
