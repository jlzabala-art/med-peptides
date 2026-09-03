const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve('/Users/joseluiszabala/regenpept-web.nosync', '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocols.`);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Protocol: ${data.name || data.title}`);
    console.log(`  - goal: ${data.goal}`);
    console.log(`  - primary_goal: ${data.primary_goal}`);
    console.log(`  - category: ${data.category}`);
    console.log(`  - tags: ${JSON.stringify(data.tags)}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
