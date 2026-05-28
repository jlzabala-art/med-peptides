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

async function runAudit() {
  console.log("--- Starting Firestore products field integrity audit ---");
  const productsSnap = await db.collection('products').get();
  console.log(`Auditing ${productsSnap.size} products...`);
  
  let issues = 0;
  productsSnap.forEach(doc => {
    const data = doc.data();
    if (!data.name) {
      console.log(`❌ Product [ID: ${doc.id}] has missing or empty 'name':`, data);
      issues++;
    } else if (typeof data.name !== 'string') {
      console.log(`❌ Product [ID: ${doc.id}] 'name' is not a string:`, typeof data.name, data);
      issues++;
    }
    
    if (!data.category) {
      console.log(`❌ Product [ID: ${doc.id}] has missing or empty 'category':`, data.name || doc.id);
      issues++;
    } else if (typeof data.category !== 'string') {
      console.log(`❌ Product [ID: ${doc.id}] 'category' is not a string:`, typeof data.category, data.name || doc.id);
      issues++;
    }
  });
  
  console.log(`--- Audit complete. Found ${issues} issues. ---`);
}

runAudit().catch(console.error);
