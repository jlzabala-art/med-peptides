const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('./firebase-adminsdk.json')) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-adminsdk.json')),
    projectId: "med-peptides-app"
  });
} else {
  admin.initializeApp({
    projectId: "med-peptides-app"
  });
}

async function updateEtherna() {
  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  
  const batch = db.batch();
  let count = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name.toLowerCase().includes('etherna') || data.name.toLowerCase().includes('eterna') || data.category?.toLowerCase().includes('testing')) {
      batch.update(doc.ref, { supplier: 'eterna' });
      count++;
      console.log(`Updating ${data.name} to supplier: eterna`);
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} products.`);
  } else {
    console.log('No etherna/testing products found.');
  }
}

updateEtherna().catch(console.error);
