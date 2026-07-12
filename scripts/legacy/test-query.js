import admin from 'firebase-admin';
import fs from 'fs';
admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});
const db = admin.firestore();
async function run() {
  const snap = await db.collection('prescriptions').get();
  console.log(`Found ${snap.size} prescriptions.`);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`- ID: ${doc.id}`);
    console.log(`  Patient: ${data.patient?.name}`);
    console.log(`  WholesalerIds: ${JSON.stringify(data.wholesalerIds)}`);
    console.log(`  WholesalerId: ${data.wholesalerId}`);
    console.log(`  Status: ${data.status}`);
  });
}
run().catch(console.error);
