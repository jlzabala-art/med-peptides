const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "med-peptides-app" // or process.env.GCLOUD_PROJECT
});

const db = admin.firestore();

async function run() {
  const urls = [
    "https://uaepeptides.com/collections/peptides",
    "https://peptideuae.com/",
    "https://direct-peptides.com/"
  ];
  
  await db.collection("settings").doc("competitor_analysis").set({ targetUrls: urls }, { merge: true });
  console.log("Settings updated!");
  process.exit(0);
}

run().catch(console.error);
