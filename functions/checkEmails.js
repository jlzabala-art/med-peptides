const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Might not exist, let's try default app

// We'll try to initialize admin with default credentials
try {
  admin.initializeApp();
} catch (e) {
  console.log("Initialize error:", e.message);
}

const db = admin.firestore();
async function check() {
  const snapshot = await db.collection('inbound_emails').get();
  console.log(`Found ${snapshot.docs.length} emails in inbound_emails collection.`);
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data().subject, doc.data().status);
  });
}
check().catch(console.error);
