import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
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

async function upload() {
  const mergedProducts = JSON.parse(fs.readFileSync('products_merged.json', 'utf8'));
  console.log(`Uploading ${mergedProducts.length} merged products...`);
  
  const productsRef = collection(db, 'products');
  const existingDocs = await getDocs(productsRef);
  
  let count = 0;
  for (const document of existingDocs.docs) {
    await deleteDoc(doc(db, 'products', document.id));
    count++;
    if (count % 100 === 0) console.log(`Deleted ${count} products`);
  }
  console.log(`Deleted total ${count} old products`);

  let uploadCount = 0;
  for (const p of mergedProducts) {
    const pId = p.id || doc(collection(db, 'products')).id;
    p.id = pId;
    await setDoc(doc(db, 'products', pId), p);
    uploadCount++;
    if (uploadCount % 50 === 0) console.log(`Uploaded ${uploadCount} products`);
  }
  console.log(`Upload complete. Total: ${uploadCount}`);
}

upload().catch(console.error);
