const admin = require('firebase-admin');
admin.initializeApp({ projectId: "med-peptides-app" });
const db = admin.firestore();
db.collection('orders').doc('DYFQfSQW06UBPDCwAEcu').get().then(doc => {
  if (doc.exists) console.log('orders:', doc.data());
  else console.log('not in orders');
});
db.collection('purchase_orders').doc('DYFQfSQW06UBPDCwAEcu').get().then(doc => {
  if (doc.exists) console.log('purchase_orders:', doc.data());
  else console.log('not in purchase_orders');
});
