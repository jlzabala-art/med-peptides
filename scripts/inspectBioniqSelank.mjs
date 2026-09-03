import { db } from './lib/firebase-admin.mjs';

async function inspectBioniqSelank() {
  console.log('--- INSPECTING BIONIQ SELANK VARIANT IN FIRESTORE ---\n');

  // Fetch the selank product variants
  const vSnap = await db.collection('products').doc('selank').collection('variants').get();

  for (const doc of vSnap.docs) {
    const d = doc.data();
    const supp = (d.supplierName || d.supplierId || d.supplier || '').toLowerCase();
    if (!supp.includes('bioniq')) continue;

    console.log('=== BIONIQ VARIANT ===');
    console.log(JSON.stringify(d, null, 2));
  }

  // Also search across all products for any bioniq variant with dosage data
  console.log('\n--- SEARCHING ALL BIONIQ VARIANTS FOR SELANK ---');
  const allDocs = await db.collectionGroup('variants').where('supplierId', '==', 'supplier-bioniq').get();
  for (const doc of allDocs.docs) {
    const d = doc.data();
    const name = (d.name || d.peptideName || doc.ref.parent.parent?.id || '').toLowerCase();
    if (!name.includes('selank') && !doc.ref.parent.parent?.id?.includes('selank')) continue;
    console.log(`[${doc.ref.path}]`);
    console.log(JSON.stringify(d, null, 2));
  }
}

inspectBioniqSelank()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
