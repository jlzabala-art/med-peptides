"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.parsePriceListDocument = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true },
  async (request) => {
    // Auth check
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { priceListText, supplierId } = request.data;
    if (!priceListText) {
      throw new HttpsError("invalid-argument", "Missing priceListText data.");
    }

    const db = getFirestore();

    // Fetch entire catalog for matching
    let catalogString = "";
    try {
      const productsSnap = await db.collection("products").get();
      const catalog = [];
      productsSnap.forEach(doc => {
        const p = doc.data();
        catalog.push({ id: doc.id, name: p.name || p.displayName || doc.id });
      });
      catalogString = JSON.stringify(catalog);
    } catch(e) {
      console.error("Failed to fetch catalog:", e);
    }

    try {
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const systemInstruction = `You are a clinical supply chain AI assistant. 
You will receive raw text extracted from a Supplier's Price List Excel file or CSV.
Your job is to identify every product (typically a peptide or supplement), its dosage/vial size, and its base cost/unit price.

Here is the raw Price List text:
"""
${priceListText.substring(0, 15000)}
"""

Here is our current Product Catalog (JSON format):
"""
${catalogString}
"""

Task:
Extract the catalog items and try to match them with our Product Catalog.
If an item is NOT in our catalog, set 'productId' to null and 'requires_creation' to true.

Output a raw JSON array where each object has this strict structure:
{
  "original_text": "The raw string of the item from the price list",
  "peptide_name": "Cleaned up name of the peptide (e.g. BPC-157)",
  "dosage": "The specified dosage or vial size (e.g. 5 mg), if any",
  "new_cost": "The numeric base cost per unit (e.g., 10.50). MUST BE A NUMBER.",
  "productId": "The exact ID from the catalog if it matches, otherwise null",
  "requires_creation": boolean
}

Output ONLY valid JSON, starting with [ and ending with ]. Do NOT wrap the JSON in markdown code blocks, return a raw JSON string.`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: "Extract the data according to the system instructions." }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Gemini API Error:", errText);
        throw new HttpsError("internal", "Error calling Gemini API: " + errText);
      }

      const responseData = await response.json();
      const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      let parsed = [];
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error:", text);
        try {
          const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleanText);
        } catch (err2) {
          console.error("Failed to parse cleaned text:", err2);
          parsed = [];
        }
      }

      return { success: true, items: parsed };

    } catch (err) {
      console.error("parsePriceListDocument AI failed:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
