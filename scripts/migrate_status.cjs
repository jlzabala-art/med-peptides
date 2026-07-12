const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snaps = await db.collection('protocols').get();
  let count = 0;
  const batch = db.batch();
  
  snaps.forEach(doc => {
    const data = doc.data();
    const status = data.status;
    
    if (status === 'public' || status === 'Active') {
      batch.update(doc.ref, { 
        status: 'active',
        visibility: 'public' // Ensuring they are public as implied
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Migrated ${count} protocols to status: 'active'.`);
  } else {
    console.log('No protocols needed migration.');
  }
}
run();
