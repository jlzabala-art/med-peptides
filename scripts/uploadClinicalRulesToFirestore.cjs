/**
 * uploadClinicalRulesToFirestore.js
 * ─────────────────────────────────
 * One-time (and re-runnable) migration script that uploads the ClinicalAI
 * behavioral rules from the local JSON file into Firestore.
 *
 * Firestore target:
 *   Collection : ai_config
 *   Document   : clinical_rules
 *
 * Usage:
 *   1.  Make sure you have the Firebase Admin SDK key available:
 *         export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
 *       OR run this inside the Firebase emulator (it will auto-detect).
 *
 *   2.  From the project root:
 *         node scripts/uploadClinicalRulesToFirestore.js
 *
 * The script splits the JSON into two Firestore documents to stay under the
 * 1 MiB document size limit:
 *   - ai_config/clinical_rules          → identity, hard_limits, query_types,
 *                                          safety_rules, similar_compounds_rules,
 *                                          commonly_combined_with, user_mode_rules
 *   - ai_config/clinical_rules_extended → behavioral_style, format_rules,
 *                                          few_shot_examples, guided_ux_intelligence,
 *                                          meta (everything else)
 */

const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// ── Load the rules JSON ───────────────────────────────────────────────────
const rulesPath = path.join(__dirname, "../AI Prompts/clinicalAI_rules.json");
const rules = require(rulesPath);

// ── Initialise Firebase Admin ─────────────────────────────────────────────
const PROJECT_ID = "med-peptides-app"; // from .firebaserc

if (getApps().length === 0) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    initializeApp({
      credential: cert(require(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
      projectId: PROJECT_ID,
    });
  } else {
    // Use Application Default Credentials (firebase login sets these up)
    const { applicationDefault } = require("firebase-admin/app");
    initializeApp({
      credential: applicationDefault(),
      projectId: PROJECT_ID,
    });
  }
}

const db = getFirestore();

// ── Split the ruleset into two documents (size safety) ────────────────────
const PRIMARY_KEYS = [
  "identity",
  "hard_limits",
  "query_types",
  "safety_rules",
  "similar_compounds_rules",
  "commonly_combined_with",
  "user_mode_rules",
];

const primaryDoc = {
  _uploaded_at: new Date().toISOString(),
  _version: rules._meta_version || rules.meta?.version || "6.0.0",
};
const extendedDoc = {
  _uploaded_at: new Date().toISOString(),
  _version: rules._meta_version || rules.meta?.version || "6.0.0",
};

for (const key of Object.keys(rules)) {
  if (key === "_meta_version") continue; // top-level shorthand, skip duplicate
  if (PRIMARY_KEYS.includes(key)) {
    primaryDoc[key] = rules[key];
  } else {
    extendedDoc[key] = rules[key];
  }
}

// ── Upload ────────────────────────────────────────────────────────────────
async function run() {
  console.log("🚀 Uploading ClinicalAI rules to Firestore…\n");

  // Primary rules
  await db.collection("ai_config").doc("clinical_rules").set(primaryDoc, { merge: true });
  console.log("✅ ai_config/clinical_rules uploaded.");

  // Extended rules (behavioral style, few-shot examples, UX intelligence, etc.)
  if (Object.keys(extendedDoc).length > 2) {
    await db.collection("ai_config").doc("clinical_rules_extended").set(extendedDoc, { merge: true });
    console.log("✅ ai_config/clinical_rules_extended uploaded.");
  }

  console.log("\n✨ Done. The backend will pick up the new rules on its next invocation.");
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Upload failed:", err);
  process.exit(1);
});
