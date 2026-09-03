const admin = require('firebase-admin');
admin.initializeApp({ projectId: "med-peptides-app" });
const db = admin.firestore();
async function run() {
  const doc = await db.collection('orders').doc('DYFQfSQW06UBPDCwAEcu').get();
  if (doc.exists) console.log('orders:', doc.data());
  else console.log('not in orders');
  
  const doc2 = await db.collection('purchase_orders').doc('DYFQfSQW06UBPDCwAEcu').get();
  if (doc2.exists) console.log('purchase_orders:', doc2.data());
  else console.log('not in purchase_orders');
}
run();
