const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function check() {
  const pres = await db.collection('prescriptions').limit(2).get();
  console.log("Prescription data:");
  pres.docs.forEach(d => console.log(d.data()));
  
  const usersAll = await db.collection('users').get();
  console.log("Roles found:", [...new Set(usersAll.docs.map(d => d.data().role))]);
}
check();
