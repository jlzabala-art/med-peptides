const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
initializeApp();
const db = getFirestore();
async function analyze() {
  const suppSnap = await db.collection("supplements").limit(2).get();
  console.log("Supplements:");
  suppSnap.forEach(d => console.log(d.data()));
  
  const apiSnap = await db.collection("api_materials").limit(2).get();
  console.log("API Materials:");
  apiSnap.forEach(d => console.log(d.data()));
}
analyze().catch(console.error);
