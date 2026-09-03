import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";
import fs from "fs";

const envCode = fs.readFileSync("/Users/joseluiszabala/regenpept-web.nosync/.env", 'utf8');
const env = {};
envCode.split('\n').forEach(line => {
    const match = line.match(/^VITE_([^=]+)=(.*)/);
    if (match) env['VITE_' + match[1]] = match[2];
});
const app = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
});
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "products"));
  const snapshot = await getDocs(q);
  const products = [];
  snapshot.forEach(doc => products.push({ id: doc.id, ...doc.data() }));
  
  const allVariantKeys = new Set();
  const allRoutes = new Set();
  const allForms = new Set();

  products.forEach(p => {
      if (p.variants) {
          p.variants.forEach(v => {
              Object.keys(v).forEach(k => allVariantKeys.add(k));
              if (v.route) allRoutes.add(v.route);
              if (v.form) allForms.add(v.form);
          });
      }
  });

  console.log("Variant keys:", Array.from(allVariantKeys));
  console.log("Routes:", Array.from(allRoutes));
  console.log("Forms:", Array.from(allForms));
}
run().catch(console.error);
