"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { executeUniversalParse } = require("./universal_parser_core");

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

      const parsedData = await executeUniversalParse(base64Data, mimeType, context, request.data.instructions || "", apiKey);
      
      return { success: true, items: parsedData };

    } catch (err) {
      console.error("Parse Error:", err);
      throw new HttpsError("internal", err.message);
    }
  }
);
