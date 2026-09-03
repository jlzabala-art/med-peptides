const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount-target.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const products = await db.collection('products').where('name', '>=', 'Retatrutide').limit(5).get();
  console.log('--- Products ---');
  products.forEach(doc => console.log(doc.id, doc.data().name));
  
  const suppliers = await db.collection('suppliers').limit(50).get();
  console.log('--- Suppliers ---');
  suppliers.forEach(doc => console.log(doc.id, doc.data().name));
}

run().catch(console.error).finally(() => process.exit(0));
