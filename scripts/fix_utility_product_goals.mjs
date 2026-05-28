/**
 * fix_utility_product_goals.mjs
 * Removes the 'dosage' non-canonical goal from utility products (Bacteriostatic Water, Precision Insulin Syringes)
 * These products exist as utility accessories; their goals should be empty or contain only valid canonical terms.
 *
 * Run: node scripts/fix_utility_product_goals.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const UTILITY_SLUGS = ["bacteriostatic-water", "precision-insulin-syringes"];

async function fix() {
  console.log("\n🔧 Fixing utility product goals (removing 'dosage')...\n");

  const snap = await db.collection("products").get();
  const batch = db.batch();
  let count = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const slug = data.slug || data.id || doc.id;

    const isUtility = UTILITY_SLUGS.some(u => slug?.toLowerCase().includes(u.replace(/-/g, ''))) ||
                      (data.name || '').toLowerCase().includes('bacteriostatic') ||
                      (data.name || '').toLowerCase().includes('precision insulin');

    if (!isUtility) continue;

    const oldGoals = data.goals || [];
    const newGoals = oldGoals.filter(g => g !== 'dosage');
    const oldSecondary = data.secondaryFactors || [];
    const newSecondary = oldSecondary.filter(g => g !== 'dosage');

    if (JSON.stringify(oldGoals) === JSON.stringify(newGoals) &&
        JSON.stringify(oldSecondary) === JSON.stringify(newSecondary)) continue;

    console.log(`  📦 ${data.name || doc.id}`);
    console.log(`     goals: [${oldGoals.join(', ')}] → [${newGoals.join(', ')}]`);
    console.log(`     secondaryFactors: [${oldSecondary.join(', ')}] → [${newSecondary.join(', ')}]`);

    batch.update(doc.ref, { goals: newGoals, secondaryFactors: newSecondary });
    count++;
  }

  if (count > 0) {
    await batch.commit();
    console.log(`\n✅ Fixed ${count} utility products.`);
  } else {
    console.log("✅ No utility products needed fixing.");
  }
}

fix().catch(err => { console.error("Fatal:", err); process.exit(1); });
