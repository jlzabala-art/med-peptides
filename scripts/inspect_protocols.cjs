const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
if (!getApps().length) { initializeApp({ projectId: 'regenpept' }); }
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  console.log(`Total protocols: ${snapshot.size}`);
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (!data.protocol_name && !data.name) {
      console.log(`Protocol missing name: ${doc.id}`);
    }
    const name = data.protocol_name || data.name || 'UNNAMED';
    if (name.toLowerCase().includes('tir') || name.toLowerCase().includes('unnamed') || !data.therapeutic_category) {
      console.log(`ID: ${doc.id} | protocol_name: ${data.protocol_name} | name: ${data.name} | category: ${data.category} | therapeutic_category: ${data.therapeutic_category}`);
    }
  });
}

run().catch(console.error);
