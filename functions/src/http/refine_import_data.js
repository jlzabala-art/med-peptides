"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.refineImportData = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true, timeoutSeconds: 60, memory: "256Mi" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { currentData, instructions, context } = request.data;
    if (!currentData || !instructions || !context) {
      throw new HttpsError("invalid-argument", "Missing currentData, instructions, or context.");
    }

    try {
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const systemInstruction = `You are a data refinement AI. The user has provided an existing JSON array of extracted data (${context}) and natural language instructions for how to modify it. Apply the user's instructions to modify the data and return the updated JSON array. Do not wrap the JSON in Markdown formatting like \`\`\`json. Return ONLY a valid JSON array.`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              { text: `Existing Data: ${JSON.stringify(currentData)}` },
              { text: `Instructions: ${instructions}` }
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
      console.error("Refine Error:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
