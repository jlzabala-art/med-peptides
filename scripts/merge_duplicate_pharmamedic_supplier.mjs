import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

async function mergePharmamedic() {
  console.log('🚀 Starting Pharmamedic supplier deduplication...');

  const oldDocRef = db.collection('suppliers').doc('pharmamedic-export-sl');
  const canonicalDocRef = db.collection('suppliers').doc('supplier-pharmamedic');

  const oldSnap = await oldDocRef.get();
  const canonicalSnap = await canonicalDocRef.get();

  if (!oldSnap.exists) {
    console.log('ℹ️  Duplicate document pharmamedic-export-sl does not exist. Nothing to delete.');
    return;
  }

  const oldData = oldSnap.data() || {};
  const canonicalData = canonicalSnap.exists ? canonicalSnap.data() : {};

  // 1. Merge metadata into canonical supplier
  const mergedData = {
    ...oldData,
    ...canonicalData,
    id: 'supplier-pharmamedic',
    name: 'PHARMAMEDIC EXPORT, S.L.',
    companyName: 'PHARMAMEDIC EXPORT, S.L.',
    status: 'active',
    statusB2B: 'active',
    specialties: Array.from(new Set([
      ...(oldData.specialties || []),
      ...(canonicalData.specialties || [])
    ])),
    updatedAt: new Date().toISOString(),
    mergedFrom: FieldValue.arrayUnion('pharmamedic-export-sl')
  };

  await canonicalDocRef.set(mergedData, { merge: true });
  console.log('✅ Canonical supplier-pharmamedic updated with merged fields.');

  // 2. Re-point any products and variants
  const productsSnap = await db.collection('products').get();
  let updatedProductsCount = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    let modified = false;

    let newSupplierId = data.supplierId || 'supplier-pharmamedic';
    if (data.supplierId === 'pharmamedic-export-sl') {
      newSupplierId = 'supplier-pharmamedic';
      modified = true;
    }

    let newVariants = data.variants;
    if (Array.isArray(data.variants)) {
      newVariants = data.variants.map(v => {
        if (v && v.supplierId === 'pharmamedic-export-sl') {
          modified = true;
          return {
            ...v,
            supplierId: 'supplier-pharmamedic',
            supplierName: 'PHARMAMEDIC EXPORT, S.L.',
            supplier: 'PHARMAMEDIC EXPORT, S.L.'
          };
        }
        return v;
      });
    }

    if (modified) {
      const updatePayload = {
        supplierId: newSupplierId,
        supplierName: 'PHARMAMEDIC EXPORT, S.L.',
        supplier: 'PHARMAMEDIC EXPORT, S.L.',
        variants: newVariants,
        updatedAt: new Date().toISOString()
      };
      batch.update(doc.ref, updatePayload);
      batchCount++;
      updatedProductsCount++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
  console.log(`✅ Repointed ${updatedProductsCount} products to supplier-pharmamedic.`);

  // 3. Delete duplicate supplier document
  await oldDocRef.delete();
  console.log('✅ Deleted duplicate supplier document: pharmamedic-export-sl.');

  console.log('\n🎉 Successfully consolidated Pharmamedic into a single supplier: supplier-pharmamedic');
}

mergePharmamedic().catch(err => {
  console.error('❌ Error during merge:', err);
  process.exit(1);
});
