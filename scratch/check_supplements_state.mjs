import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";
import { readFileSync }                  from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkSupplements() {
  const snap = await db.collection("supplements").get();
  console.log(`Total supplements in Firestore: ${snap.size}`);
  
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`- [${doc.id}] ${data.displayName || data.name}`);
    if (data.science) {
      console.log(`  Science block present: ${Object.keys(data.science).join(", ")}`);
    } else {
      console.log(`  Science block MISSING`);
    }
  });
}

checkSupplements().catch(console.error);
