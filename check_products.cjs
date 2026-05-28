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

async function checkProducts() {
  const db = admin.firestore();
  const snapshot = await db.collection('products').get();
  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });

  console.log("Found", products.length, "products.");
  let lotuslandCount = 0;
  let nplabCount = 0;
  
  products.forEach(p => {
    const supplier = p.supplier || p.manufacturer || '';
    if (supplier.toLowerCase().includes('lotusland')) lotuslandCount++;
    if (supplier.toLowerCase().includes('nplab')) nplabCount++;
  });
  
  console.log("Products with Lotusland:", lotuslandCount);
  console.log("Products with NPLAB:", nplabCount);
  if (products.length > 0) {
    console.log("Sample supplier fields:", products.slice(0,5).map(p => ({ id: p.id, name: p.name, supplier: p.supplier, manufacturer: p.manufacturer })));
  }
}

checkProducts().catch(console.error);
