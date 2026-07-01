'use strict';

/**
 * analyzeClinicalDocument
 *
 * Firebase Cloud Function (Callable) that ingests a clinical PDF/image
 * (uploaded by the caller to Firebase Storage) and uses Gemini AI to
 * extract structured clinical data: biomarkers, genetic predispositions,
 * or prescription details — depending on document type.
 *
 * Security: file must belong to the calling user's temp_imports folder.
 * No pricing information is ever included in the output.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { getStorage } = require('firebase-admin/storage');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { executeUniversalParse } = require('./universal_parser_core');

const GEMINI_API_KEY_SECRET = defineSecret('GEMINI_API_KEY');

exports.analyzeClinicalDocument = onCall(
  {
    secrets: [GEMINI_API_KEY_SECRET],
    cors: true,
    timeoutSeconds: 300,
    memory: '1GiB',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { storagePath, mimeType, documentType } = request.data;

    // Validate required params
    if (!storagePath || !mimeType || !documentType) {
      throw new HttpsError(
        'invalid-argument',
        'Missing required fields: storagePath, mimeType, documentType.'
      );
    }

    // Validate documentType is a supported clinical context
    const ALLOWED_TYPES = ['BloodTest', 'GeneticReport', 'ClinicalDocument'];
    if (!ALLOWED_TYPES.includes(documentType)) {
      throw new HttpsError(
        'invalid-argument',
        `Invalid documentType. Allowed: ${ALLOWED_TYPES.join(', ')}`
      );
    }

    // Security: ensure the file belongs to the calling user
    const callerUid = request.auth.uid;
    if (!storagePath.startsWith(`temp_imports/${callerUid}/`)) {
      throw new HttpsError(
        'permission-denied',
        'Access denied: file does not belong to this user.'
      );
    }

    const apiKey = GEMINI_API_KEY_SECRET.value();
    if (!apiKey) {
      throw new HttpsError('internal', 'GEMINI_API_KEY secret is missing.');
    }

    const bucket = getStorage().bucket();
    const fileRef = bucket.file(storagePath);
    const tempFilePath = path.join(
      os.tmpdir(),
      path.basename(storagePath) || 'clinical_upload_tmp'
    );

    try {
      // Download from Firebase Storage to Cloud Function's /tmp
      await fileRef.download({ destination: tempFilePath });
      console.log(`[ClinicalAI] Downloaded ${storagePath} to ${tempFilePath}`);

      // Run parsing with clinical context
      const parsedData = await executeUniversalParse(
        tempFilePath,
        mimeType,
        documentType,
        request.data.instructions || '',
        apiKey
      );

      console.log(`[ClinicalAI] Extraction complete for type: ${documentType}`);

      return {
        success: true,
        documentType,
        data: parsedData,
      };
    } catch (err) {
      console.error('[ClinicalAI] Error:', err);
      throw new HttpsError('internal', err.message);
    } finally {
      // Clean up local temp file
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupErr) {
        console.warn('[ClinicalAI] Could not clean temp file:', cleanupErr.message);
      }

      // Clean up Firebase Storage temp file
      try {
        await fileRef.delete();
        console.log(`[ClinicalAI] Deleted Storage file: ${storagePath}`);
      } catch (storageErr) {
        console.warn('[ClinicalAI] Could not delete Storage file:', storageErr.message);
      }
    }
  }
);
