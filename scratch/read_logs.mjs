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
  console.log("Total logs in clinical_logs:", snap.size);
  const withPeptides = snap.docs.filter(d => d.data().matchedPeptides && d.data().matchedPeptides.length > 0);
  console.log("Logs with matchedPeptides:", withPeptides.length);
  if (withPeptides.length > 0) {
    console.log("Sample log with matchedPeptides:", JSON.stringify(withPeptides[0].data(), null, 2));
  } else {
    console.log("No logs have matchedPeptides.");
  }
  process.exit(0);
}

run().catch(console.error);
