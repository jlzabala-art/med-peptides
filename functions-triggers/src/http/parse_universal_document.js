"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { getStorage } = require("firebase-admin/storage");
const os = require("os");
const path = require("path");
const { executeUniversalParse } = require("./universal_parser_core");

const GEMINI_API_KEY_SECRET = defineSecret("GEMINI_API_KEY");

exports.parseUniversalDocument = onCall(
  { secrets: [GEMINI_API_KEY_SECRET], cors: true, timeoutSeconds: 300, memory: "1GiB" },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth required.");

    const { storagePath, mimeType, context } = request.data;
    if (!storagePath || !mimeType || !context) {
      throw new HttpsError("invalid-argument", "Missing storagePath, mimeType, or context.");
    }

    // Security: ensure the file belongs to the calling user
    const callerUid = request.auth.uid;
    if (!storagePath.startsWith(`temp_imports/${callerUid}/`)) {
      throw new HttpsError("permission-denied", "Access denied: file does not belong to this user.");
    }

    const fs = require('fs');
    const bucket = getStorage().bucket();
    const fileRef = bucket.file(storagePath);
    const tempFilePath = path.join(os.tmpdir(), path.basename(storagePath) || 'upload_tmp');

    try {
      const apiKey = GEMINI_API_KEY_SECRET.value();
      if (!apiKey) throw new Error("GEMINI_API_KEY secret is missing or empty");

      // Download from Firebase Storage to Cloud Function's /tmp
      await fileRef.download({ destination: tempFilePath });
      console.log(`[Import] Downloaded ${storagePath} to ${tempFilePath}`);

      const parsedData = await executeUniversalParse(tempFilePath, mimeType, context, request.data.instructions || "", apiKey);
      
      return { success: true, items: parsedData };

    } catch (err) {
      console.error("Parse Error:", err);
      throw new HttpsError("internal", err.message);
    } finally {
      // Always clean up: local /tmp file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log(`[Import] Cleaned up local temp file: ${tempFilePath}`);
        }
      } catch (cleanupErr) {
        console.warn("[Import] Could not clean local temp file:", cleanupErr.message);
      }

      // Always clean up: Firebase Storage temp file
      try {
        await fileRef.delete();
        console.log(`[Import] Deleted Storage file: ${storagePath}`);
      } catch (storageErr) {
        console.warn("[Import] Could not delete Storage file:", storageErr.message);
      }
    }
  }
);
