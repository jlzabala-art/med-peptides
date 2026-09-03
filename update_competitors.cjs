const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();

const NEW_URLS = [
  'https://paradigmpeptides.com/',
  'https://biotechpeptides.com/',
  'https://www.uk-peptides.com/',
  'https://swisschems.is/',
  'https://aminoasylum.shop/',
  'https://umbrellalabs.is/',
  'https://dnlabresearch.com/product-category/peptides/'
];

async function update() {
  const docRef = db.collection("settings").doc("competitor_analysis");
  const doc = await docRef.get();
  
  let targetUrls = [];
  if (doc.exists && doc.data().targetUrls) {
    targetUrls = doc.data().targetUrls;
  }
  
  console.log("Current URLs:", targetUrls.length);
  
  let added = 0;
  for (const url of NEW_URLS) {
    if (!targetUrls.includes(url)) {
      targetUrls.push(url);
      added++;
    }
  }
  
  await docRef.set({ targetUrls }, { merge: true });
  console.log(`Added ${added} new URLs. Total URLs now: ${targetUrls.length}`);
}
update().catch(console.error);
