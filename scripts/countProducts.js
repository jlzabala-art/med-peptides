const admin = require("firebase-admin");
try { admin.initializeApp({ credential: admin.credential.cert(require("../serviceAccountKey.json")) }); } catch(e) { admin.initializeApp(); }
const db = admin.firestore();
async function run() {
  const c1 = await db.collection("products").count().get();
  const c2 = await db.collection("protocols").count().get();
  const c3 = await db.collection("supplements").count().get();
  const c4 = await db.collection("api_materials").count().get();
  const c5 = await db.collection("testing").count().get();
  console.log(`Products: ${c1.data().count}, Protocols: ${c2.data().count}, Supplements: ${c3.data().count}, APIs: ${c4.data().count}, Testing: ${c5.data().count}`);
}
run();
