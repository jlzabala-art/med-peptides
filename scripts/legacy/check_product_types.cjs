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

async function checkProductTypes() {
  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  
  const types = new Set();
  const samples = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.type) {
      types.add(data.type);
    }
    if (samples.length < 5) {
      samples.push({ id: doc.id, name: data.name, type: data.type, category: data.category });
    }
  });

  console.log("Types found in DB:", Array.from(types));
  console.log("Sample products:", samples);
}

checkProductTypes().catch(console.error);
