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

async function inspect() {
  console.log("--- Inspecting users ---");
  const usersSnap = await db.collection('users').get();
  usersSnap.forEach(doc => {
    console.log(`User ID: ${doc.id} =>`, doc.data());
  });

  console.log("--- Inspecting viewConfigs ---");
  const configsSnap = await db.collection('viewConfigs').get();
  configsSnap.forEach(doc => {
    console.log(`ViewConfig ID: ${doc.id} =>`, doc.data());
  });
}

inspect().catch(console.error);
