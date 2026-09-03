import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOV2zFeLGtPsE_O2b-gR3NHZygPspiSws",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "med-peptides-app-27a3a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "med-peptides-app"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "products"), where("name", "==", "DSIP"));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.log("No DSIP found.");
    return;
  }
  const dsip = snapshot.docs[0];
  console.log("DSIP ID:", dsip.id);
  const variantsRef = collection(db, `products/${dsip.id}/variants`);
  const vSnap = await getDocs(variantsRef);
  console.log("Variants count:", vSnap.size);
  vSnap.forEach(doc => {
    const v = doc.data();
    console.log(doc.id, "=>", { strength: v.strength, dosage: v.dosage, supplier: v.supplier, format: v.format, presentation: v.presentation, isProfessional: v.isProfessional, isActive: v.isActive });
  });
  process.exit(0);
}
run();
