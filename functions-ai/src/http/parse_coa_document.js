"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.parseCOADocument = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true },
  async (request) => {
    // Auth check
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { docId, storagePath } = request.data;
    if (!docId || !storagePath) {
      throw new HttpsError("invalid-argument", "Missing docId or storagePath.");
    }

    try {
      const bucket = getStorage().bucket();
      const file = bucket.file(storagePath);
      
      const [exists] = await file.exists();
      if (!exists) throw new HttpsError("not-found", "File not found in storage.");

      const [buffer] = await file.download();
      const base64Data = buffer.toString("base64");
      
      // Call Gemini API natively
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      
      const systemInstruction = `You are a medical laboratory document parser. Analyze the provided Certificate of Analysis (COA) PDF and extract: 1. peptide_name (the name of the compound, e.g., 'AOD-9604', 'Retatrutide'), 2. dosage (the dosage or fill weight, e.g., '5mg', '10 mg'), 3. purity_percentage (the purity result, e.g., '99.8%'). Return ONLY a strict JSON object with these exact keys. Example: {"peptide_name": "AOD-9604", "dosage": "5mg", "purity_percentage": "99.8%"}. Do NOT wrap the JSON in markdown code blocks, return raw JSON string.`;
      const db = getFirestore(); // Init DB here so it can be used below

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: base64Data
                }
              }
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
      
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.error("JSON parse error on first try:", text);
        try {
          const cleanText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
          parsed = JSON.parse(cleanText);
        } catch (err2) {
          console.error("Failed to parse cleaned text:", err2);
          parsed = {};
        }
      }

      // --- PHASE 8: COMPLIANCE CHECK (WORKFLOW ENGINE) ---
      let quarantine = false;
      let complianceRemarks = "";
      
      try {
        const configDoc = await db.collection("system_config").doc("workflows").get();
        if (configDoc.exists) {
          const config = configDoc.data().compliance;
          if (config && config.enabled && config.params) {
            const minPurity = config.params.min_purity || 99.0;
            
            // Extract numeric value from "99.8%" string
            const purityStr = parsed.purity_percentage || "0";
            const purityMatch = purityStr.match(/[\d.]+/);
            const purityValue = purityMatch ? parseFloat(purityMatch[0]) : 0;
            
            if (purityValue < minPurity) {
              quarantine = true;
              complianceRemarks = `Purity (${purityValue}%) is below minimum threshold (${minPurity}%).`;
            }
            
            // Note: If endotoxins were extracted by Gemini, check those too. 
            // The prompt only asked for purity originally, but we can extend this easily.
          }
        }
      } catch (err) {
        console.error("Failed to execute compliance check", err);
      }
      
      // Save extracted data to the Firestore document
      await db.collection("uploaded_documents").doc(docId).update({
        extractedData: parsed,
        status: "processed",
        quarantine: quarantine,
        complianceRemarks: complianceRemarks,
        updatedAt: FieldValue.serverTimestamp()
      });

      return { success: true, extractedData: parsed, quarantine, complianceRemarks };

    } catch (err) {
      console.error(err);
      throw new HttpsError("internal", err.message);
    }
  }
);
