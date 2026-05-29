const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
  });
} else {
  admin.initializeApp();
}

async function listAllCollections() {
  const db = admin.firestore();
  
  try {
    const collections = await db.listCollections();
    console.log(`\n=== FIRESTORE COLLECTIONS ===`);
    console.log(`Total Collections: ${collections.length}`);
    console.log(`\nList of Collections:`);
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
}

listAllCollections().catch(console.error).then(() => process.exit(0));
