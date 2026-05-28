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
  const productsSnap = await db.collection("products").where("isActive", "==", true).get();
  const peptides = productsSnap.docs.map(d => d.data().name || d.data().displayName);
  console.log("Peptides count:", peptides.length);
  console.log("Sample Peptides:", peptides.slice(0, 10));

  const suppsSnap = await db.collection("supplements").get();
  const supplements = suppsSnap.docs.map(d => d.data().name || d.data().displayName);
  console.log("Supplements count:", supplements.length);
  console.log("Sample Supplements:", supplements.slice(0, 10));

  const protocolsSnap = await db.collection("protocols").get();
  const protocols = protocolsSnap.docs.map(d => ({
    id: d.id,
    title: d.data().title || d.data().name || d.data().overview_summary
  }));
  console.log("Protocols count:", protocols.length);
  console.log("Sample Protocols:", protocols.slice(0, 5));

  process.exit(0);
}

run().catch(console.error);
