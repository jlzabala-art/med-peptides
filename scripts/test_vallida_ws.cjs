const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  const ws1 = await db.collection('wholesellers').doc('supplier-vallida').get();
  console.log('supplier-vallida:', ws1.data());
  
  const ws2 = await db.collection('wholesellers').doc('vallida').get();
  console.log('vallida:', ws2.data());
}

run().catch(console.error);
