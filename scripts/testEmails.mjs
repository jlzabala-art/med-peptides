/**
 * testEmails.mjs
 * Inserts a fake order into Firestore to trigger the onNewOrder Cloud Function,
 * which sends both the admin notification and the client confirmation email.
 *
 * Usage:
 *   node scripts/testEmails.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load service account key (adjust path if needed)
const serviceAccountPath = join(__dirname, "../serviceAccountKey.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
} catch {
  console.error(
    "❌  serviceAccountKey.json not found at project root.\n" +
      "    Download it from: Firebase Console → Project Settings → Service Accounts → Generate new private key\n" +
      "    Save it as: regenpept-web/serviceAccountKey.json"
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const testOrder = {
  createdAt: new Date(),
  status: "pending",
  paymentMethod: "bank_transfer",
  customer: {
    firstName: "José",
    lastName: "Zabala",
    email: "jose@mediluxeme.com",   // ← recibirá el email de cliente
    phone: "+34 600 000 000",
    company: "MediLuxe ME",
    country: "Spain",
  },
  items: [
    {
      id: "prod_001",
      name: "BPC-157",
      variant: "5mg",
      quantity: 3,
      price: 49.99,
    },
    {
      id: "prod_002",
      name: "TB-500",
      variant: "10mg",
      quantity: 1,
      price: 89.99,
    },
  ],
  subtotal: 239.96,
  total: 239.96,
};

console.log("📤  Inserting test order into Firestore...");
const docRef = await db.collection("orders").add(testOrder);
console.log(`✅  Order created: ${docRef.id}`);
console.log("📧  The Cloud Function should trigger in a few seconds.");
console.log(`    Admin email → jose@mediluxeme.com (if set as admin in Firestore)`);
console.log(`    Client email → jose@mediluxeme.com`);
