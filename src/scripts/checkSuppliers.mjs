import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const wsSnap = await getDocs(collection(db, 'wholesellers'));
  console.log(`Found ${wsSnap.size} wholesellers`);
  
  const productsSnap = await getDocs(collection(db, 'products'));
  console.log(`Found ${productsSnap.size} products`);
  
  const supplierCounts = {};
  productsSnap.docs.forEach(doc => {
    const data = doc.data();
    const sup = data.supplier || data.manufacturer || 'Unknown';
    supplierCounts[sup] = (supplierCounts[sup] || 0) + 1;
  });
  
  console.log("Products grouped by supplier string:", supplierCounts);
  
  const lotusland = wsSnap.docs.find(d => (d.data().companyName || d.data().name || '').toLowerCase().includes('lotusland'));
  if (lotusland) {
    console.log("Lotusland document:", lotusland.id, lotusland.data());
  } else {
    console.log("Lotusland not found in wholesellers collection!");
  }
}

run().catch(console.error);
