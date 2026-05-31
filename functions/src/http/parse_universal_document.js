"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.parseUniversalDocument = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true, timeoutSeconds: 120, memory: "512Mi" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { base64Data, mimeType, context } = request.data;
    if (!base64Data || !mimeType || !context) {
      throw new HttpsError("invalid-argument", "Missing base64Data, mimeType, or context.");
    }

    try {
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      let systemInstruction = "";
      if (context === "RFQ") {
        systemInstruction = `You are a clinical supply chain AI. Extract requested items, dosages, and quantities from the provided document (RFQ).
Output a JSON array of objects: { "original_text": "str", "peptide_name": "str", "dosage": "str", "quantity": number }. Return ONLY valid JSON array.`;
      } else if (context === "PriceList") {
        systemInstruction = `You are a B2B AI. Extract the price list catalog from the document.
Output a JSON array of objects: { "original_text": "str", "peptide_name": "str", "dosage": "str", "unit_cost": number, "moq": number }. Return ONLY valid JSON array.`;
      } else if (context === "COA") {
        systemInstruction = `You are a quality assurance AI. Extract the batch details from the Certificate of Analysis.
Output a JSON array (usually one object): { "batch_number": "str", "peptide_name": "str", "purity_percentage": number, "manufacture_date": "YYYY-MM-DD", "expiration_date": "YYYY-MM-DD", "test_results": "str" }. Return ONLY valid JSON array.`;
      } else {
        throw new Error("Invalid context");
      }

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: "Extract the data according to the system instructions." },
              { inlineData: { mimeType, data: base64Data } }
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
      const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
      let parsed = [];
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanText);
      }

      return { success: true, items: parsed };

    } catch (err) {
      console.error("Parse Error:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
