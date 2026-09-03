import { adminDb } from '../lib/firebaseAdmin.js';

async function fixRawMaterialsAndStock() {
  console.log("Fixing raw materials presentations and stock...");

  const calcitoninRef = adminDb.collection('products').doc('lotus-calcitonin-raw-api');
  const doc = await calcitoninRef.get();

  if (doc.exists) {
    const data = doc.data();
    const updatedVariants = (data.variants || []).map(v => ({
      ...v,
      stock: 0,
      inStock: false,
      presentation: 'bulk_powder_gram',
      presentationName: 'Bulk Powder (g)',
      format: 'bulk_powder_gram',
      moq: 5
    }));

    await calcitoninRef.update({
      stock: 0,
      totalStock: 0,
      inStock: false,
      productType: 'raw_material',
      presentation: 'bulk_powder_gram',
      format: 'bulk_powder_gram',
      variants: updatedVariants,
      updatedAt: new Date()
    });

    console.log("✓ Successfully updated Calcitonin to Raw Material Bulk API (stock: 0, format: bulk_powder_gram, MOQ: 5g)!");
  }
}

fixRawMaterialsAndStock()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
