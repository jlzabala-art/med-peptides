import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const db = getFirestore();

async function checkProtocols() {
  const snapshot = await db.collection("protocols").get();
  console.log(`Found ${snapshot.size} protocols in Firestore.`);
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data().title);
  });
}

checkProtocols().catch(console.error);
