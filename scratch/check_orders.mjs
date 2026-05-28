import admin from 'firebase-admin';
import fs from 'fs';

const saFile = './serviceAccountKey.json';
if (!fs.existsSync(saFile)) {
  console.error("Service account key file not found!");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(saFile, 'utf8'))),
  projectId: "med-peptides-app"
});

const db = admin.firestore();

async function run() {
  console.log("--- Checking orders collection ---");
  const snap = await db.collection('orders').get();
  console.log(`Found ${snap.size} orders.`);
  
  let issues = 0;
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Order ID: ${doc.id}, createdAt:`, data.createdAt, typeof data.createdAt);
    if (!data.createdAt) {
      console.log(`❌ Order [ID: ${doc.id}] is missing 'createdAt'`);
      issues++;
    }
  });
  console.log(`--- Finished. Found ${issues} issues. ---`);
}

run().catch(console.error);
