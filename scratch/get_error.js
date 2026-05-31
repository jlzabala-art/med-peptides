const admin = require("firebase-admin");
const serviceAccount = require("../med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function getError() {
  const snapshot = await db.collection("sku_mappings").where("status", "==", "error").get();
  snapshot.forEach(doc => {
    console.log("ID:", doc.id);
    console.log("Error:", doc.data().last_error);
  });
}
getError().catch(console.error);
