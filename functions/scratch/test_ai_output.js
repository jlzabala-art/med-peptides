const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('inbound_emails').orderBy('receivedAt', 'desc').limit(1).get();
  if (snapshot.empty) { console.log('No emails found.'); return; }
  const doc = snapshot.docs[0].data();
  console.log("STATUS:", doc.status);
  console.log("AI PROPOSAL:", JSON.stringify(doc.aiProposal, null, 2));
}

run().catch(console.error);
