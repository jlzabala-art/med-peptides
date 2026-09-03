import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from "fs";

const envCode = fs.readFileSync("/Users/joseluiszabala/regenpept-web.nosync/.env", 'utf8');
const env = {};
envCode.split('\n').forEach(line => {
    const match = line.match(/^VITE_([^=]+)=(.*)/);
    if (match) env['VITE_' + match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
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

async function check() {
  const products = JSON.parse(fs.readFileSync('products_merged.json', 'utf8'));
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const pId = p.id || 'test_id_' + i;
    try {
      await setDoc(doc(db, 'products_test', pId), p);
    } catch (e) {
      console.error(`Failed on product index ${i} ID ${pId}:`, e.message);
      console.log(JSON.stringify(p, null, 2));
      process.exit(1);
    }
  }
  console.log("All products are valid for upload.");
  process.exit(0);
}

check();
