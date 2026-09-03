const admin = require('firebase-admin');
admin.initializeApp({ projectId: "med-peptides-app" });
const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').limit(1).get();
  if (snapshot.empty) {
    console.log('no orders found');
  } else {
    const doc = snapshot.docs[0];
    console.log('Order ID:', doc.id);
    console.log(JSON.stringify(doc.data(), null, 2));
  }
}
run();
