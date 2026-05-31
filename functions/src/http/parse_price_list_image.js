"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.parsePriceListImage = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true, timeoutSeconds: 300 },
  async (request) => {
    // Auth check
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { imageBase64, mimeType, instructions } = request.data;
    if (!imageBase64 || !mimeType) {
      throw new HttpsError("invalid-argument", "Missing imageBase64 or mimeType data.");
    }

    const db = getFirestore();

    // Fetch entire catalog for matching
    let catalogString = "";
    try {
      const productsSnap = await db.collection("products").get();
      const catalog = [];
      productsSnap.forEach(doc => {
        const p = doc.data();
        catalog.push({ id: doc.id, name: p.name || p.displayName || doc.id, sku: p.sku || "", category: p.category || "" });
      });
      catalogString = JSON.stringify(catalog);
    } catch(e) {
      console.error("Failed to fetch catalog:", e);
    }

    try {
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const systemInstruction = `You are a clinical supply chain AI assistant. 
You will receive an image of a Supplier's Price List.
Your job is to read the image, identify every product (typically a peptide or supplement), its quantity/dosage, unit price, and total price for that line. 
Also look for:
1. Any global discounts applied at the bottom of the list.
2. Any shipping costs or VAT/Taxes mentioned at the bottom.

Here is our current Product Catalog (JSON format) to help you match items:
"""
${catalogString}
"""

Task:
Extract the catalog items from the image. For each item, try to find the closest matches in our Product Catalog, even if the name is slightly different (e.g. "SLUPP-332" in image vs "SLUPP 332" in catalog). Return up to 3 suggested matches for each item, ordered by probability/confidence.
If there are no good matches, set 'requires_creation' to true.

Output a raw JSON object with this exact structure:
{
  "global_discount_percentage": 25, // the global discount if found (e.g. 25 for 25%), or null
  "shipping_cost": 50.00, // the total shipping cost if found, or null
  "vat_percentage": 21, // the VAT or tax percentage if mentioned, or null
  "items": [
    {
      "original_text": "The raw string of the item from the price list",
      "peptide_name": "Cleaned up name of the peptide (e.g. BPC-157)",
      "dosage": "The specified dosage or vial size (e.g. 5 mg), if any",
      "quantity": "The numeric quantity (e.g. 10). MUST BE A NUMBER.",
      "unit_price": "The numeric base cost per unit (e.g., 24.50). MUST BE A NUMBER.",
      "partial_discount_percentage": "Any specific discount applied ONLY to this row/item (e.g. 10), or null.",
      "total_price": "The numeric total cost for this line (e.g. 245.00). MUST BE A NUMBER.",
      "suggested_matches": [
        { "productId": "exact_catalog_id", "name": "Catalog item name", "confidence": "high|medium|low" }
      ],
      "requires_creation": boolean
    }
  ]
}

Output ONLY valid JSON. Do NOT wrap the JSON in markdown code blocks, return a raw JSON string.
${instructions ? `\n\nUSER ADDITIONAL INSTRUCTIONS:\n"""\n${instructions}\n"""\n` : ''}`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64.includes("base64,") ? imageBase64.split("base64,")[1] : imageBase64
                }
              },
              { text: "Extract the data according to the system instructions." }
            ]
          }
        ],
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
      const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      let parsed = { global_discount_percentage: null, items: [] };
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error:", text);
        try {
          const cleanText = text.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();
          parsed = JSON.parse(cleanText);
        } catch (err2) {
          console.error("Failed to parse cleaned text:", err2);
        }
      }

      // If AI still returned an array instead of the object, wrap it
      if (Array.isArray(parsed)) {
        parsed = { global_discount_percentage: null, items: parsed };
      }

      return { success: true, ...parsed };

    } catch (err) {
      console.error("parsePriceListImage AI failed:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
