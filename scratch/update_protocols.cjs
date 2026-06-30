const admin = require('firebase-admin');
const serviceAccount = require('../src/scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateProtocols() {
  const protocolsRef = db.collection('protocols');
  const snapshot = await protocolsRef.get();
  
  let updatedCount = 0;
  let batch = db.batch();
  let batchCount = 0;

  console.log(`Found ${snapshot.size} protocols. Starting update...`);

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.visibility !== 'public') {
      batch.update(doc.ref, { visibility: 'public' });
      updatedCount++;
      batchCount++;
      
      // Firestore batches are limited to 500 operations
      if (batchCount === 450) {
        batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  });

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Update complete. ${updatedCount} protocols updated to visibility: 'public'.`);
}

updateProtocols().catch(console.error);
