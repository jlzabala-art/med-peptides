const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

async function run() {
  try {
    const mappings = await db.collection('sku_mappings').limit(5).get();
    console.log(`Number of sku_mappings: ${mappings.size}`);
    mappings.forEach(d => console.log(d.id, d.data()));

    const products = await db.collection('products').limit(5).get();
    console.log(`Number of products: ${products.size}`);
    products.forEach(d => console.log(d.id, d.data()));
  } catch (err) {
    console.error('Error querying firestore:', err);
  }
}

run();
