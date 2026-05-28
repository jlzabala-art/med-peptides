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
  console.log("--- Checking doctor_patient_relationships ---");
  const relsSnap = await db.collection('doctor_patient_relationships').get();
  console.log(`Found ${relsSnap.size} relationship documents.`);
  
  let issues = 0;
  relsSnap.forEach(doc => {
    const data = doc.data();
    if (!data.patientEmail) {
      console.log(`❌ Relationship [ID: ${doc.id}] is missing 'patientEmail':`, data);
      issues++;
    } else if (typeof data.patientEmail !== 'string') {
      console.log(`❌ Relationship [ID: ${doc.id}] 'patientEmail' is not a string:`, typeof data.patientEmail, data);
      issues++;
    }

    if (!data.patientName) {
      console.log(`⚠️ Relationship [ID: ${doc.id}] is missing 'patientName' (has fallback but check):`, data);
    }
  });

  console.log(`--- Finished. Found ${issues} critical issues. ---`);
}

run().catch(console.error);
