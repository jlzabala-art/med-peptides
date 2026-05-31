"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { getStorage } = require("firebase-admin/storage");
const { GoogleGenAI } = require("@google/genai");
const os = require("os");
const path = require("path");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.parseRFQDocument = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true, timeoutSeconds: 300, memory: "1GiB" },
  async (request) => {
    // Auth check
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { storagePath, mimeType } = request.data;
    if (!storagePath || !mimeType) {
      throw new HttpsError("invalid-argument", "Missing storagePath or mimeType data.");
    }

    // Security: ensure the file belongs to the calling user
    const callerUid = request.auth.uid;
    if (!storagePath.startsWith(`temp_imports/${callerUid}/`)) {
      throw new HttpsError("permission-denied", "Access denied: file does not belong to this user.");
    }

    const fs = require('fs');
    const bucket = getStorage().bucket();
    const fileRef = bucket.file(storagePath);
    const tempFilePath = path.join(os.tmpdir(), path.basename(storagePath) || 'rfq_tmp');

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

    let uploadedFile;
    try {
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      // Download from Firebase Storage to Cloud Function's /tmp
      await fileRef.download({ destination: tempFilePath });
      console.log(`[Import] Downloaded RFQ ${storagePath} to ${tempFilePath}`);

      const ai = new GoogleGenAI({ apiKey });

      uploadedFile = await ai.files.upload({
        file: tempFilePath,
        config: { mimeType }
      });

      const systemInstruction = `You are a clinical supply chain AI assistant. 
Your job is to identify every requested item (typically a peptide or supplement), the requested dosage, and the quantity needed from the uploaded Request For Quote (RFQ) or Purchase Order.

Here is our current Product Catalog (JSON format):
"""
${catalogString}
"""

Task:
Extract the requested items and try to match them with our Product Catalog.
If an item is NOT in our catalog, set 'productId' to null and 'requires_creation' to true.

Output a raw JSON array where each object has this strict structure:
{
  "original_text": "The raw string of the item from the RFQ",
  "peptide_name": "Cleaned up name of the peptide (e.g. BPC-157)",
  "dosage": "The requested dosage (e.g. 5 mg), if any",
  "quantity": "The requested quantity (integer)",
  "productId": "The exact ID from the catalog if it matches, otherwise null",
  "requires_creation": boolean
}

Output ONLY valid JSON, starting with [ and ending with ]. Do NOT wrap the JSON in markdown code blocks, return a raw JSON string.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            fileData: {
              fileUri: uploadedFile.uri,
              mimeType: uploadedFile.mimeType
            }
          },
          { text: "Extract the data according to the system instructions." }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      
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
      console.error("parseRFQDocument AI failed:", err);
      throw new HttpsError("internal", err.message);
    } finally {
      // 1. Delete Gemini file
      if (uploadedFile && uploadedFile.name) {
        try {
          const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY_SECRET.value() });
          await ai.files.delete({ name: uploadedFile.name });
          console.log(`[Import] Cleaned up Gemini file: ${uploadedFile.name}`);
        } catch(e) {
          console.warn("[Import] Failed to delete Gemini file:", e.message);
        }
      }

      // 2. Delete local temp file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`[Import] Cleaned up local temp file: ${tempFilePath}`);
        }
      } catch (cleanupErr) {
        console.warn("[Import] Could not clean local temp file:", cleanupErr.message);
      }

      // 3. Delete Firebase Storage file
      try {
        await fileRef.delete();
        console.log(`[Import] Deleted Storage file: ${storagePath}`);
      } catch (storageErr) {
        console.warn("[Import] Could not delete Storage file:", storageErr.message);
      }
    }
  }
);
