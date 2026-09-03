import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import fs from "fs";

const envCode = fs.readFileSync("/Users/joseluiszabala/regenpept-web.nosync/.env.local", 'utf8');
const env = {};
envCode.split('\n').forEach(line => {
    const match = line.match(/^([A-Z_]+)=(.*)/);
    if (match) env[match[1]] = match[2];
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "products"));
  const snapshot = await getDocs(q);
  const products = [];
  snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
  
  fs.writeFileSync('products_dump.json', JSON.stringify(products, null, 2));
  console.log("Dumped " + products.length + " products to products_dump.json");
}
run().catch(console.error);
