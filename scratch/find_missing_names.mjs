import admin from 'firebase-admin';
import fs from 'fs';

// Initialize firebase admin using one of the service account files
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

async function runAudit() {
  console.log("--- Starting Firestore name fields audit ---");
  
  // 1. Audit 'products' collection
  const productsSnap = await db.collection('products').get();
  console.log(`Auditing ${productsSnap.size} products...`);
  productsSnap.forEach(doc => {
    const data = doc.data();
    if (!data.name) {
      console.log(`❌ Product [ID: ${doc.id}] has NO 'name' field:`, data);
    }
  });

  // 2. Audit 'api_materials' collection
  const apiSnap = await db.collection('api_materials').get();
  console.log(`Auditing ${apiSnap.size} API materials...`);
  apiSnap.forEach(doc => {
    const data = doc.data();
    if (!data.name) {
      console.log(`❌ API Material [ID: ${doc.id}] has NO 'name' field:`, data);
    }
  });

  // 3. Audit 'supplements' collection
  const suppSnap = await db.collection('supplements').get();
  console.log(`Auditing ${suppSnap.size} supplements...`);
  suppSnap.forEach(doc => {
    const data = doc.data();
    if (!data.name) {
      console.log(`❌ Supplement [ID: ${doc.id}] has NO 'name' field:`, data);
    }
  });
  
  console.log("--- Audit complete ---");
}

runAudit().catch(console.error);
