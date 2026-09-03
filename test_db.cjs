const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount-target.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const users = await db.collection('users').where('name', '>=', 'CEI').limit(1).get();
  users.forEach(doc => console.log('User:', doc.id, doc.data()));
}

run().catch(console.error).finally(() => process.exit(0));
