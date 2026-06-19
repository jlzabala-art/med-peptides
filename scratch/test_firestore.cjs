const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

async function run() {
  try {
    const usersSnap = await db.collection('users').get();
    console.log(`TOTAL USERS: ${usersSnap.size}`);
    
    const ordersSnap = await db.collection('orders').get();
    console.log(`TOTAL ORDERS: ${ordersSnap.size}`);
    
    const rfqsSnap = await db.collection('purchase_rfqs').get();
    console.log(`TOTAL PURCHASE RFQS: ${rfqsSnap.size}`);
    
    const posSnap = await db.collection('purchaseOrders').get();
    console.log(`TOTAL PURCHASE ORDERS: ${posSnap.size}`);

    const catalogsSnap = await db.collection('catalogs').get();
    console.log(`TOTAL CATALOGS: ${catalogsSnap.size}`);

    // Print details of the first order if exists
    if (ordersSnap.size > 0) {
      console.log("Sample order:", JSON.stringify(ordersSnap.docs[0].data(), null, 2));
    }
  } catch (err) {
    console.error("Error executing query:", err);
  }
}

run();
