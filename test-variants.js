import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import fs from "fs";

const envCode = fs.readFileSync("/Users/joseluiszabala/regenpept-web.nosync/.env", 'utf8');
const env = {};
envCode.split('\n').forEach(line => {
    const match = line.match(/^VITE_([^=]+)=(.*)/);
    if (match) env['VITE_' + match[1]] = match[2];
});

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "products"));
  const snapshot = await getDocs(q);
  const products = [];
  snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
  
  // Find products that have a strength in the title
  const withStrengthInName = products.filter(p => p.name && (p.name.match(/\d+(mg|mcg|iu|ml)/i)));
  console.log("Products with strength in name:", withStrengthInName.map(p => p.name));

  // Let's check their variants
  if (withStrengthInName.length > 0) {
      console.log("Variants for first one:", JSON.stringify(withStrengthInName[0].variants, null, 2));
  }

  // Find products with different routes
  const withDifferentRoutes = products.filter(p => p.variants && new Set(p.variants.map(v => v.route)).size > 1);
  console.log("Products with multiple routes:", withDifferentRoutes.map(p => p.name));
  if (withDifferentRoutes.length > 0) {
      console.log("Variants for first multi-route:", JSON.stringify(withDifferentRoutes[0].variants, null, 2));
  }
}
run().catch(console.error);
