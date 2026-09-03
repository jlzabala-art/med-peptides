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
  const p = products.filter(p => p.variants && p.variants.some(v => v.dosage === '30mg' || v.strength === '30mg' || v.dosage === '50mg' || v.dosage === '100mg'));
  p.forEach(x => {
    console.log("Name:", x.name);
    console.log("Category:", x.category);
    console.log("Variants:", x.variants);
  })
}
run().catch(console.error);
