import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});
const db = admin.firestore();

async function run() {
  console.log("=== LISTING ALL COLLECTIONS ===");
  const collections = await db.listCollections();
  console.log(`Found ${collections.length} collections:`);
  for (const col of collections) {
    const snap = await col.limit(5).get();
    console.log(`- Collection: "${col.id}" has approx. document count/sample size: ${snap.size}`);
    snap.forEach(doc => {
      console.log(`  - Doc ID: ${doc.id}`);
    });
  }
}

run().catch(console.error);
