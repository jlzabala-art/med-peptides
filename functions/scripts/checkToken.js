const admin = require("firebase-admin");
try { admin.initializeApp({ credential: admin.credential.cert(require("../../serviceAccountKey.json")) }); } catch(e) { admin.initializeApp(); }
const db = admin.firestore();
async function run() {
  const doc = await db.doc("token_cache/access_token_v2").get();
  console.log(doc.data());
}
run();
