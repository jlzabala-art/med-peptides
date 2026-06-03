const admin = require('firebase-admin');
admin.initializeApp({
  projectId: "med-peptides-app" 
});

const db = admin.firestore();

async function run() {
  const newUrls = [
    "https://www.peptidesciences.com/peptides",
    "https://limitlesslifenootropics.com/product-category/peptides/",
    "https://corepeptides.com/buy-peptides/"
  ];
  
  const docRef = db.collection("settings").doc("competitor_analysis");
  const docSnap = await docRef.get();
  
  let existingUrls = [];
  if (docSnap.exists) {
    const data = docSnap.data();
    if (data.targetUrls) {
      existingUrls = data.targetUrls;
    }
  }
  
  // Merge uniquely
  const allUrls = Array.from(new Set([...existingUrls, ...newUrls]));
  
  await docRef.set({ targetUrls: allUrls }, { merge: true });
  console.log("Competitors updated successfully:", allUrls);
  process.exit(0);
}

run().catch(console.error);
