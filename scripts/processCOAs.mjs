/**
 * scripts/processCOAs.mjs
 * 
 * Batch process all documents in Firestore that are in "processing" state.
 * Uses Gemini 2.5 Flash to read the PDF and extract:
 *  - Product Name (to match with DB)
 *  - Purity
 *  - Lab Name
 *  - Batch / Lot Number
 * 
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   node scripts/processCOAs.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load GEMINI_API_KEY ───────
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  const envPaths = [join(__dirname, '../.env.local'), join(__dirname, '../.env')];
  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const lines = readFileSync(envPath, 'utf-8').split('\n');
      for (const line of lines) {
        const parts = line.split('=');
        if (parts[0]?.trim() === 'GEMINI_API_KEY') {
          apiKey = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
    }
    if (apiKey) break;
  }
}

if (!apiKey) {
  console.error("❌ ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

// ── Initialize Firebase Admin ───────
let serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
if (!existsSync(serviceAccountPath)) {
  serviceAccountPath = join(__dirname, '../med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
}

if (!existsSync(serviceAccountPath)) {
  console.error("❌ ERROR: Firebase Service Account key not found.");
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "med-peptides-app.firebasestorage.app" // Update if different
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function downloadPdfAsBase64(storagePath) {
  try {
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();
    return buffer.toString('base64');
  } catch (err) {
    console.error(`Error downloading file ${storagePath}:`, err.message);
    return null;
  }
}

async function extractPdfData(base64Data, fileName) {
  const prompt = `
You are an expert clinical laboratory data extractor.
Analyze this Certificate of Analysis (CoA) or Document PDF and extract the following information.
If a value is not found, leave it as null.

Return ONLY a valid JSON object with no markdown wrappers:
{
  "productName": "Detected product/peptide name (e.g. Enclomiphene, BPC-157)",
  "labName": "Name of the laboratory that performed the test",
  "purity": "Purity percentage as a string, e.g. '99.8%'",
  "batchNumber": "Lot or Batch number"
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.error(`Gemini API Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return null;

    return JSON.parse(textResponse);
  } catch (error) {
    console.error("Error communicating with Gemini API:", error.message);
    return null;
  }
}

async function processDocuments() {
  console.log("🔍 Fetching documents in 'processing' status...");
  
  // Load products to match extracted name -> productId
  const productsSnap = await db.collection('products').get();
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const docsSnap = await db.collection('uploaded_documents')
    .where('status', '==', 'processing')
    .get();

  if (docsSnap.empty) {
    console.log("✅ No documents found requiring processing.");
    return;
  }

  console.log(`Found ${docsSnap.size} documents to process.`);

  let successCount = 0;
  for (const doc of docsSnap.docs) {
    const data = doc.data();
    console.log(`\n⏳ Processing [${data.fileName}]...`);

    if (!data.storagePath) {
      console.log("  ⚠️ No storagePath found. Skipping.");
      continue;
    }

    // 1. Download PDF to base64
    const base64Data = await downloadPdfAsBase64(data.storagePath);
    if (!base64Data) continue;

    // 2. Ask Gemini to extract data
    const extracted = await extractPdfData(base64Data, data.fileName);
    if (!extracted) {
      console.log("  ❌ Extraction failed.");
      continue;
    }

    console.log(`  ✨ Extracted: Product=${extracted.productName}, Purity=${extracted.purity}, Lab=${extracted.labName}`);

    // 3. Try to match Product Name to an ID
    let matchedProductId = data.productId || null;
    if (!matchedProductId && extracted.productName) {
      const lowerExtracted = extracted.productName.toLowerCase();
      const match = products.find(p => lowerExtracted.includes(p.name.toLowerCase()));
      if (match) {
         matchedProductId = match.id;
         console.log(`  🔗 Matched product in DB: ${match.name}`);
      }
    }

    // 4. Update Firestore
    await db.collection('uploaded_documents').doc(doc.id).update({
      status: 'completed',
      extractedData: extracted,
      productId: matchedProductId,
      processedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`  ✅ Document updated successfully.`);
    successCount++;

    // Sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 4000));
  }

  console.log(`\n🎉 Processing Complete. Successfully processed ${successCount} documents.`);
}

processDocuments().catch(err => {
  console.error("Fatal Error:", err);
  process.exit(1);
});
