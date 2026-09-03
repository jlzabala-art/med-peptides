const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();

async function check() {
  const doc = await db.collection("settings").doc("competitor_analysis").get();
  if (doc.exists) {
    console.log("Competitor analysis settings found:", doc.data());
  } else {
    console.log("No competitor analysis settings found.");
  }
}
check().catch(console.error);
