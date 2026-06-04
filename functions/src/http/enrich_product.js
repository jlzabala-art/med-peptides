"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { callGemini, searchPubMed, structuredLogger } = require("./ai_utils");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.enrichProductData = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true, timeoutSeconds: 120 },
  async (request) => {
    // Auth check
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");
    // Only allow admin roles, assuming token.admin is set
    // if (!request.auth.token.admin) throw new HttpsError("permission-denied", "Admin only.");

    const { productId } = request.data;
    if (!productId) {
      throw new HttpsError("invalid-argument", "Missing productId.");
    }

    const db = getFirestore();
    const productRef = db.collection("products").doc(productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new HttpsError("not-found", "Product not found.");
    }

    const product = productSnap.data();
    const productName = product.name || productId;

    structuredLogger.info(`Starting AI enrichment for product: ${productName}`);

    // Search PubMed for clinical literature
    let pubMedResults = "";
    try {
      pubMedResults = await searchPubMed(productName);
      if (!pubMedResults) {
        pubMedResults = "No PubMed results found.";
      }
    } catch (e) {
      structuredLogger.warn(`PubMed search failed: ${e.message}`);
      pubMedResults = "PubMed search failed.";
    }

    // Prepare prompt
    const systemInstruction = `You are a clinical researcher and biomedical data extractor.
Your task is to extract and compile canonical product data for the molecule/substance: "${productName}".
Use the provided PubMed abstracts and your broad biomedical knowledge.

Output ONLY valid JSON matching this schema exactly. Do not use markdown \`\`\`json blocks, just return the raw JSON object.

Schema:
{
  "clinical_summary": "A concise 2-paragraph summary of its clinical use and significance.",
  "mechanism_of_action": "Detailed explanation of how it works biologically.",
  "half_life": "Half-life duration (e.g., '2-3 hours')",
  "side_effects": "Common side effects and contraindications.",
  "molecular_formula": "e.g., 'C6H12O6'",
  "pubchem_cid": "PubChem Compound ID (numeric string) if found.",
  "cas_number": "CAS Registry Number if found",
  "clinical_benefits": ["benefit 1", "benefit 2", "benefit 3"]
}

If you cannot find reliable information for a field, leave it as an empty string or empty array.
`;

    let generatedData = {};
    try {
      const responseText = await callGemini(
        pubMedResults,
        systemInstruction,
        "gemini-2.5-flash",
        "application/json",
        2048,
        "enrich_product"
      );

      generatedData = JSON.parse(responseText.trim());
    } catch (e) {
      structuredLogger.error(`Gemini call failed or JSON parse error: ${e.message}`);
      throw new HttpsError("internal", "Failed to generate AI enrichment data.");
    }

    // Merge: Only overwrite missing or empty fields
    const updates = {};
    const fieldsToEnrich = [
      "clinical_summary",
      "mechanism_of_action",
      "half_life",
      "side_effects",
      "molecular_formula",
      "pubchem_cid",
      "cas_number",
      "clinical_benefits"
    ];

    for (const field of fieldsToEnrich) {
      const existingValue = product[field];
      const newValue = generatedData[field];

      const isExistingEmpty = 
        existingValue === undefined || 
        existingValue === null || 
        existingValue === "" || 
        (Array.isArray(existingValue) && existingValue.length === 0);

      const isNewValid = 
        newValue !== undefined && 
        newValue !== null && 
        newValue !== "" && 
        (!Array.isArray(newValue) || newValue.length > 0);

      if (isExistingEmpty && isNewValid) {
        updates[field] = newValue;
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.lastEnrichedAt = new Date().toISOString();
      await productRef.update(updates);
      structuredLogger.info(`Updated product ${productId} with enriched fields: ${Object.keys(updates).join(", ")}`);
    } else {
      structuredLogger.info(`No new missing fields could be enriched for product ${productId}.`);
    }

    return { 
      success: true, 
      enrichedFields: Object.keys(updates),
      data: updates
    };
  }
);
