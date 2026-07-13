"use strict";

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { executeUniversalParse } = require("./universal_parser_core");
const cors = require("cors")({ origin: true });

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.apiParseDocument = onRequest(
  { secrets: [GEMINI_API_KEY_SECRET], timeoutSeconds: 120, memory: "512Mi" },
  (req, res) => {
    cors(req, res, async () => {
      // Basic security check: You can implement a real API Key validation here
      const authHeader = req.headers.authorization || '';
      if (!authHeader.startsWith('Bearer ') && req.query.apiKey !== 'test-api-key-123') {
        return res.status(401).json({ success: false, error: "Unauthorized: Invalid or missing API Key." });
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: "Method Not Allowed. Use POST." });
      }

      const { base64Data, mimeType, context, instructions } = req.body;

      if (!base64Data || !mimeType || !context) {
        return res.status(400).json({ success: false, error: "Missing base64Data, mimeType, or context in payload." });
      }

      try {
        const apiKey = GEMINI_API_KEY_SECRET.value();
        if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

        const parsedData = await executeUniversalParse(base64Data, mimeType, context, instructions || "", apiKey);
        
        return res.status(200).json({ success: true, items: parsedData });
      } catch (err) {
        console.error("API Parse Error:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
    });
  }
);
