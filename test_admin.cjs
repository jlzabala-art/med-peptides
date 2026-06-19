const admin = require('firebase-admin');
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
  const db = admin.firestore();
  db.collection('products').limit(1).get().then(snap => {
    console.log("Success! Found " + snap.size + " products.");
  }).catch(e => {
    console.error("Auth failed:", e.message);
  });
} catch (e) {
  console.error("Init failed:", e.message);
}
