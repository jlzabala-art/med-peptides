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
  const docRef = db.collection('settings').doc('global');
  const snap = await docRef.get();
  if (snap.exists) {
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log("No global settings found.");
  }
}

run().catch(console.error);
