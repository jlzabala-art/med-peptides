import admin from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});
const db = admin.firestore();
async function run() {
  const snap = await db.collection('prescriptions').get();
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id}, delivery: ${JSON.stringify(data.delivery)}`);
  });
}
run().catch(console.error);
