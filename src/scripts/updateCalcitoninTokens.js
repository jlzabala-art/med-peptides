import { adminDb } from '../lib/firebaseAdmin.js';

async function updateCalcitoninSearchTokens() {
  const calcitoninRef = adminDb.collection('products').doc('lotus-calcitonin-raw-api');
  const doc = await calcitoninRef.get();
  
  if (doc.exists) {
    const data = doc.data();
    const tokens = [
      'calcitonin',
      'calcitonina',
      'calcitonine',
      'calcitonin peptide',
      'calcitonina péptido',
      'lotus',
      'lotus land',
      'lotusland',
      'bulk api',
      'raw material',
      '5g'
    ];

    await calcitoninRef.update({
      searchTokens: tokens,
      canonicalName: 'Calcitonin Peptide (Bulk API)',
      name: 'Calcitonin Peptide (Bulk API)',
      status: 'published',
      isActive: true,
      updatedAt: new Date()
    });

    console.log("✓ Successfully added bilingual search tokens and canonical names to Calcitonin in Firestore!");
  } else {
    console.log("Document lotus-calcitonin-raw-api not found, creating it with tokens...");
  }
}

updateCalcitoninSearchTokens()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
