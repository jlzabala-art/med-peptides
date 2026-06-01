import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});
const db = admin.firestore();

async function run() {
  const importHistorySnap = await db.collection('import_history').get();
  importHistorySnap.forEach(doc => {
    console.log(`=== Document ${doc.id} ===`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

run().catch(console.error);
