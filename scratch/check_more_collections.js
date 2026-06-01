import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});
const db = admin.firestore();

async function run() {
  console.log("=== CHECKING IMPORT_HISTORY ===");
  const importHistorySnap = await db.collection('import_history').get();
  console.log(`Found ${importHistorySnap.size} documents.`);
  importHistorySnap.forEach(doc => {
    console.log(`- ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });

  console.log("\n=== CHECKING UPLOADED_DOCUMENTS ===");
  const uploadedDocsSnap = await db.collection('uploaded_documents').get();
  console.log(`Found ${uploadedDocsSnap.size} documents.`);
  uploadedDocsSnap.forEach(doc => {
    console.log(`- ID: ${doc.id}`);
    const data = doc.data();
    console.log(`  Name: ${data.name || data.fileName}`);
    console.log(`  Type: ${data.type || data.fileType}`);
    console.log(`  CreatedAt: ${JSON.stringify(data.createdAt || data.uploadedAt)}`);
  });
}

run().catch(console.error);
