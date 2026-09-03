const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  const wsSnap = await db.collection('wholesellers').get();
  wsSnap.docs.forEach(d => {
    const data = d.data();
    console.log(d.id, data.name || data.companyName);
  });
}

run().catch(console.error);
