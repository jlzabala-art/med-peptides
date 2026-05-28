import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snap = await db.collection("clinical_logs").get();
  console.log("Total logs:", snap.size);
  let hasPeptides = 0;
  let hasProtocols = 0;
  let hasSupplements = 0;
  let hasFaqs = 0;
  
  const allFields = new Set();
  
  for (const doc of snap.docs) {
    const data = doc.data();
    Object.keys(data).forEach(k => allFields.add(k));
    if (data.matchedPeptides?.length) hasPeptides++;
    if (data.matchedProtocols?.length) hasProtocols++;
    if (data.matchedSupplements?.length) hasSupplements++;
    if (data.matchedFaqs?.length) hasFaqs++;
  }
  
  console.log("Fields in collection:", Array.from(allFields));
  console.log("Logs with matchedPeptides:", hasPeptides);
  console.log("Logs with matchedProtocols:", hasProtocols);
  console.log("Logs with matchedSupplements:", hasSupplements);
  console.log("Logs with matchedFaqs:", hasFaqs);
  
  process.exit(0);
}

run().catch(console.error);
