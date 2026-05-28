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
  console.log("--- Checking faqs collection ---");
  const snap = await db.collection('faqs').get();
  console.log(`Found ${snap.size} FAQs.`);
  
  let issues = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.relatedPeptideNames) {
      if (!Array.isArray(data.relatedPeptideNames)) {
        console.log(`❌ FAQ [ID: ${doc.id}] relatedPeptideNames is not an array:`, typeof data.relatedPeptideNames, data);
        issues++;
      } else {
        data.relatedPeptideNames.forEach((name, idx) => {
          if (typeof name !== 'string') {
            console.log(`❌ FAQ [ID: ${doc.id}] relatedPeptideNames[${idx}] is not a string:`, typeof name, data);
            issues++;
          }
        });
      }
    }
  });
  console.log(`--- Finished. Found ${issues} issues. ---`);
}

run().catch(console.error);
