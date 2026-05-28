const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({ projectId: 'med-peptides-app' });
const db = getFirestore();
async function main() {
  const doc = await db.collection('users').doc('jvaUivJ4EDRYsm56FYUJiw31akI3').get();
  console.log('Doc exists?', doc.exists);
  if (doc.exists) console.log(doc.data());
}
main().catch(console.error);
