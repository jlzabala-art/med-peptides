import { adminDb } from '../src/lib/firebaseAdmin.js';

async function cleanupCapsulesInProductNames() {
  console.log('🔍 Scanning Firestore products for "Capsules/Capsule" in names...');
  if (!adminDb) {
    console.error('❌ Firebase Admin DB not initialized.');
    process.exit(1);
  }

  const productsSnap = await adminDb.collection('products').get();
  console.log(`Found ${productsSnap.size} total products in database.`);

  const capsuleRegex = /\b(capsules|capsule|caps)\b/gi;
  let updatedCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const currentName = data.name || data.canonicalName || '';
    const currentCanonical = data.canonicalName || data.name || '';

    const hasInName = capsuleRegex.test(currentName);
    const hasInCanonical = capsuleRegex.test(currentCanonical);

    if (hasInName || hasInCanonical) {
      const cleanedName = currentName
        .replace(/\s*\(\s*(capsules|capsule|caps)\s*\)/gi, '')
        .replace(/\s*[-–—]\s*(capsules|capsule|caps)\b/gi, '')
        .replace(/\b(capsules|capsule|caps)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      const cleanedCanonical = currentCanonical
        .replace(/\s*\(\s*(capsules|capsule|caps)\s*\)/gi, '')
        .replace(/\s*[-–—]\s*(capsules|capsule|caps)\b/gi, '')
        .replace(/\b(capsules|capsule|caps)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      console.log(`\n📌 Product [${doc.id}]:`);
      console.log(`   Old Name: "${currentName}" -> New Name: "${cleanedName}"`);
      console.log(`   Old Canonical: "${currentCanonical}" -> New Canonical: "${cleanedCanonical}"`);

      // Update product document
      await adminDb.collection('products').doc(doc.id).update({
        name: cleanedName,
        canonicalName: cleanedCanonical,
        updatedAt: new Date()
      });

      // Also ensure subcollection variants have format='Capsules'
      const variantsSnap = await adminDb.collection('products').doc(doc.id).collection('variants').get();
      for (const vDoc of variantsSnap.docs) {
        const vData = vDoc.data();
        const vUpdate = {};
        if (!vData.format || vData.format === 'Finished Product') {
          vUpdate.format = 'Capsules';
        }
        if (!vData.administrationRoute) {
          vUpdate.administrationRoute = 'Oral';
        }
        if (Object.keys(vUpdate).length > 0) {
          await vDoc.ref.update(vUpdate);
          console.log(`   -> Variant [${vDoc.id}] updated with format: Capsules, route: Oral`);
        }
      }

      updatedCount++;
    }
  }

  console.log(`\n✅ Completed! Successfully cleaned ${updatedCount} products with "Capsules" in their names.`);
}

cleanupCapsulesInProductNames().catch(err => {
  console.error('Error cleaning product names:', err);
  process.exit(1);
});
