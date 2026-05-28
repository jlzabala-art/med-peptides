"use strict";
/**
 * ai_prescription.js — Prescription Intake Handler
 *
 * Handles query_type === "prescription_intake" requests.
 * Analyzes medical prescription text, matches against the product catalog,
 * and classifies unmatched items as custom compounded formulations.
 *
 * Exported as a standalone Cloud Function: prescriptionAiAssistant
 * Also exported as handlePrescriptionIntake() for use by the main ai.js router.
 */

const { onRequest }  = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const {
  ALL_SECRETS,
  structuredLogger,
  sanitizeMessage,
  timedCall,
  callCloudAgent,
  callGemini,
  catalogCache: _unused,
  CATALOG_CACHE_TTL_MS,
} = require("./ai_utils");
const utils = require("./ai_utils");
const { formatResponse } = require("./ai_formatter");

/**
 * Core prescription handler logic.
 * Called either by the standalone Cloud Function or by the main ai.js router.
 *
 * @param {object} params
 * @param {string} params.message   - Sanitized prescription text
 * @param {string} params.sessionId
 * @param {object} db               - Firestore instance
 * @param {object} res              - Express response object
 */
async function handlePrescriptionIntake({ message, sessionId }, db, res) {
  structuredLogger.info(`[prescriptionAiAssistant] Handling prescription intake for session: ${sessionId}`);
  try {
    // ── Load / use catalog cache ──────────────────────────────────────────────
    let allPeptides = [], activePeptides = [];
    const now = Date.now();

    if (utils.catalogCache && now < utils.catalogCacheExpiry) {
      allPeptides     = utils.catalogCache.allPeptides;
      activePeptides  = utils.catalogCache.activePeptides;
    } else {
      const productsSnap = await db.collection("products").get();
      allPeptides        = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      activePeptides     = allPeptides.filter(p => p.isActive === true);
      utils.catalogCache = {
        allPeptides,
        activePeptides,
        allProtocols:  utils.catalogCache?.allProtocols  || [],
        clinicalRules: utils.catalogCache?.clinicalRules || null,
      };
      utils.catalogCacheExpiry = now + CATALOG_CACHE_TTL_MS;
    }

    // ── Build system instruction with catalog context ─────────────────────────
    const catalogContext = activePeptides.map(p =>
      `- Name: "${p.displayName || p.name}"\n  ID: "${p.slug || p.id}"\n  Strengths/Dosages: "${p.standard_dosage || "N/A"}"\n  Category: "${p.category || "Peptides"}"`
    ).join("\n");

    const systemInstruction = `
You are the Med-Peptides Prescription Ingestion Agent.
Your job is to analyze the medical prescription text provided by the user, match items against the available catalog of commercial products, and classify the remaining items as custom compounded formulations.

The available catalog products are:
${catalogContext}

For each line or compound in the prescription:
1. Try to find a match in the available catalog of commercial products.
   - If you find an exact or very close match (checking synonyms, spelling variations, names, or active ingredients), list it under "catalog".
   - You MUST include:
     - "name": The matched catalog product name.
     - "product": An object with "id" containing the catalog product's id (or slug).
     - "strength": The dosage/strength found in the prescription.
     - "quantity": The quantity requested in the prescription (e.g. "5 vials", "1 unit").
     - "category": "Category A (Direct Match)" or "Category B (Catalog Synonym)".

2. If the item is NOT found in the catalog (e.g., custom combination, different dosage form, different strength, or not present at all):
   - Classify it as a custom compounded formulation, and list it under "quotation".
   - You MUST extract or structure:
     - "name": A descriptive name for the custom compounded formula.
     - "actives": An array of active ingredients with their concentrations, e.g. [{"active": "Caffeine", "concentration": "100mg"}].
     - "vehicle": The vehicle or delivery form, e.g. "Capsules", "Injectable Vial", "Topical Cream", "Nasal Spray".
     - "volume": The volume or quantity requested.
     - "specialInstructions": Any special dosage or application instructions found in the text.

3. Generate safety, compliance, or compounding feasibility warnings under "warnings".

You must output ONLY a valid JSON object matching this schema (do NOT wrap it in markdown code blocks):
{
  "catalog": [
    {
      "name": "BPC-157 5mg Vial",
      "product": { "id": "bpc-157-5mg-vial" },
      "strength": "5mg",
      "quantity": "5 vials",
      "category": "Category A (Direct Match)"
    }
  ],
  "quotation": [
    {
      "name": "Caffeine 100mg + Theanine 200mg Capsules",
      "actives": [
        { "active": "Caffeine", "concentration": "100mg" },
        { "active": "Theanine", "concentration": "200mg" }
      ],
      "vehicle": "Capsules",
      "volume": "30 capsules",
      "specialInstructions": "Take one capsule daily in the morning."
    }
  ],
  "warnings": [
    "Custom compounded formulations require validation and approval from the compounding lab before fulfillment."
  ]
}
`;

    const contents = [{ role: "user", parts: [{ text: `Prescription Text to analyze:\n"${message}"` }] }];

    // ── Call AI (Cloud Agent → Gemini fallback) ───────────────────────────────
    let reply;
    try {
      reply = await timedCall("prescription_cloudAgent", () =>
        callCloudAgent(contents, systemInstruction, "gemini-2.5-flash", "application/json")
      );
      structuredLogger.info(`[prescriptionAiAssistant] Cloud Agent responded successfully`);
    } catch (agentErr) {
      structuredLogger.warn(`[prescriptionAiAssistant] Cloud Agent failed, falling back to Gemini: ${agentErr.message}`);
      reply = await timedCall("prescription_gemini_direct", () =>
        callGemini(contents, systemInstruction, "gemini-2.5-flash", "application/json")
      );
    }

    // ── Parse JSON response ───────────────────────────────────────────────────
    let parsed;
    try {
      parsed = JSON.parse(reply);
    } catch (jsonErr) {
      structuredLogger.error(`[prescriptionAiAssistant] Failed to parse JSON reply:`, reply, jsonErr);
      parsed = {
        catalog: [],
        quotation: [{
          name: "Unparsed Formulation",
          actives: [{ active: message, concentration: "N/A" }],
          vehicle: "Capsules",
          volume: "1 unit",
          specialInstructions: "Failed to parse automatically. Manual review required.",
        }],
        warnings: ["System was unable to automatically structure the prescription details. Manual review required."],
      };
    }

    // ── Log to Firestore ──────────────────────────────────────────────────────
    try {
      await db.collection("clinical_logs").add({
        sessionId,
        userQuery: `[Prescription Intake] ${message.slice(0, 100)}`,
        aiReply: JSON.stringify(parsed),
        timestamp: FieldValue.serverTimestamp(),
        isHighValue: true,
      });
    } catch (e) { /* non-fatal */ }

    // ── Format for rich UI rendering (zero Gemini cost — prescription renderer) ───
    let formatted = null;
    try {
      formatted = await formatResponse(parsed, { formatType: "prescription", role: "doctor", language: "en" });
    } catch (_) { /* non-fatal */ }

    res.status(200).json({ ...parsed, formatted });
  } catch (err) {
    structuredLogger.error(`[prescriptionAiAssistant] Fatal error:`, err);
    res.status(500).json({ error: "Failed to process prescription" });
  }
}

// ── Standalone Cloud Function export ─────────────────────────────────────────
// URL: /prescriptionAiAssistant
// Timeout: 180s (longer than RAG — OCR + AI parsing can be slow)
module.exports = onRequest(
  {
    region: "europe-west1",
    timeoutSeconds: 180,
    cors: true,
    secrets: ALL_SECRETS,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const { message: rawMessage, sessionId = "anonymous" } = req.body;
    const message = sanitizeMessage(rawMessage);
    if (!message) { res.status(400).json({ error: "Empty message" }); return; }

    const db = getFirestore();
    await handlePrescriptionIntake({ message, sessionId }, db, res);
  }
);

// Also export the handler function for use by the main ai.js router
module.exports.handlePrescriptionIntake = handlePrescriptionIntake;
