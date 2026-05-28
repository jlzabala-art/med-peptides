/**
 * export-incomplete-protocols.mjs
 * Fetches all blueprints from Firestore, identifies incomplete ones,
 * and exports each as a separate JSON file.
 *
 * Run: node scripts/export-incomplete-protocols.mjs
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createWriteStream, readFileSync } from "fs";
import { mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ── CONFIG ──────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json"
);

const OUTPUT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../protocol-exports"
);

// Fields that must exist and be non-empty for a protocol to be "complete"
const REQUIRED_FIELDS = [
  // top-level
  "bundleVersion",
  "dosing_enrichment",
  "monitoring_plan",
  "eligibility_rules",
  // inside metadata
  "metadata.longDescription",
  "metadata.references",
  "metadata.keywords",
];

// ── HELPERS ─────────────────────────────────────────────────────────────────
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

function isValueEmpty(val) {
  if (val == null) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === "object" && Object.keys(val).length === 0) return true;
  return false;
}

function getMissingFields(data) {
  const missing = [];
  for (const field of REQUIRED_FIELDS) {
    const val = getNestedValue(data, field);
    if (isValueEmpty(val)) {
      missing.push(field);
    }
  }
  return missing;
}

function firestoreDocToPlain(doc) {
  return doc.data();
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  // Init Firebase Admin
  let app;
  try {
    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
    app = initializeApp({ credential: cert(serviceAccount) }, "export-script");
  } catch (e) {
    console.error("❌ Could not load service account:", e.message);
    console.log("   Make sure firebase-service-account.json is in the project root.");
    process.exit(1);
  }

  const db = getFirestore(app);

  console.log("🔍 Fetching all blueprints...");
  const snapshot = await db.collection("blueprints").get();
  console.log(`   Found ${snapshot.size} protocols.\n`);

  await mkdir(OUTPUT_DIR, { recursive: true });

  const summary = {
    complete: [],
    incomplete: [],
    exported: [],
  };

  for (const doc of snapshot.docs) {
    const id = doc.id;
    const data = firestoreDocToPlain(doc);
    const missing = getMissingFields(data);

    if (missing.length === 0) {
      summary.complete.push(id);
      console.log(`✅ ${id} — complete`);
    } else {
      summary.incomplete.push({ id, missing });
      console.log(`⚠️  ${id} — missing: ${missing.join(", ")}`);

      // Export as JSON
      const outputPath = resolve(OUTPUT_DIR, `${id}.json`);
      const json = JSON.stringify({ protocol_id: id, missing_fields: missing, data }, null, 2);
      const ws = createWriteStream(outputPath);
      ws.write(json);
      ws.end();
      summary.exported.push(outputPath);
    }
  }

  // Summary file
  const summaryPath = resolve(OUTPUT_DIR, "_summary.json");
  const summaryJson = JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      total: snapshot.size,
      complete_count: summary.complete.length,
      incomplete_count: summary.incomplete.length,
      complete: summary.complete,
      incomplete: summary.incomplete,
    },
    null,
    2
  );
  const ws = createWriteStream(summaryPath);
  ws.write(summaryJson);
  ws.end();

  console.log("\n─────────────────────────────────────────────────");
  console.log(`📁 Exported ${summary.exported.length} incomplete protocol(s) to: ${OUTPUT_DIR}`);
  console.log(`📋 Summary written to: ${summaryPath}`);
  console.log(`\n✅ Complete: ${summary.complete.length}`);
  console.log(`⚠️  Incomplete: ${summary.incomplete.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
