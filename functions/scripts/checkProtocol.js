const admin = require("firebase-admin");
try { admin.initializeApp({ credential: admin.credential.cert(require("../../serviceAccountKey.json")) }); } catch(e) { admin.initializeApp(); }
const db = admin.firestore();
async function run() {
  const p = await db.collection("protocols").limit(1).get();
  console.log(JSON.stringify(p.docs[0].data(), null, 2));
}
run();
