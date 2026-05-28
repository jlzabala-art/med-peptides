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

async function checkCategories() {
  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  const categories = new Set();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.category) {
      categories.add(data.category);
    }
  });

  console.log("Categories found in DB:", Array.from(categories));
}

checkCategories().catch(console.error);
