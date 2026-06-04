/**
 * scripts/enrich_ingredients_ai.mjs
 * Iterates over the 'ingredients' collection in Firestore and uses Gemini API
 * to enrich them with clinical and pharmacological information in English.
 * 
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   node scripts/enrich_ingredients_ai.mjs [--write]
 */
import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Load GEMINI_API_KEY from process environment, .env, or .env.local ───────
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

const API_KEY = apiKey;
const isWriteMode = process.argv.includes('--write');

// Initialize Firebase Admin
try {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Initialized using local serviceAccountKey.json");
} catch (error) {
  console.warn("Could not load serviceAccountKey.json, relying on default credentials/env vars.");
  admin.initializeApp();
}

const db = admin.firestore();

async function generateIngredientMetadata(ingredientName) {
  const prompt = `
You are a world-class clinical researcher and pharmacist.
Analyze the active pharmaceutical ingredient (API) or supplement: "${ingredientName}"
Return a STRICT JSON object containing scientific and clinical metadata IN ENGLISH.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

You MUST return a valid JSON object matching the following schema structure:
{
  "scientificName": "string (the IUPAC name or scientific nomenclature)",
  "pharmacology": "string (short paragraph explaining the mechanism of action)",
  "clinical_benefits": ["3-5 key clinical advantages starting with capital letters"],
  "synonyms": ["list", "of", "common", "names"],
  "contraindications": ["list", "of", "contraindications", "e.g.", "pregnancy", "severe_renal_impairment"],
  "typicalDosage": "string (e.g. '500mg - 1000mg daily')",
  "evidenceLevel": "string (e.g. 'human-clinical-trial', 'animal-model', 'anecdotal')"
}
`;

  const maxRetries = 3;
  let attempt = 0;
  let delay = 3000;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        attempt++;
        if (response.status === 429) {
          console.warn(`  ⚠️ Gemini rate limit hit (429). Attempt ${attempt}/${maxRetries}. Sleeping...`);
          await new Promise(r => setTimeout(r, delay));
          delay *= 1.5;
          continue;
        }
        console.error(`  ❌ Gemini API Error (Status ${response.status}): ${response.statusText}`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      return JSON.parse(textResponse);
    } catch (error) {
      attempt++;
      console.warn(`  ⚠️ Network/Fetch error: ${error.message}. Attempt ${attempt}/${maxRetries}.`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 1.5;
    }
  }

  return null;
}

async function run() {
  console.log("\n🧪 Ingredient API AI Enrichment");
  console.log("──────────────────────────────────────────────────\n");

  if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing. Cannot proceed with enrichment.");
    process.exit(1);
  }

  if (!isWriteMode) {
    console.log("💡 Dry-run mode active. No changes will be written to Firestore. Run with --write to save.");
  } else {
    console.log("💾 Write mode active. Updates will be saved to Firestore.");
  }

  const snapshot = await db.collection('ingredients').get();
  console.log(`Found ${snapshot.size} ingredients in Firestore.`);

  let enrichedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name;

    if (data.aiContent && data.aiContent.pharmacology && data.aiContent.clinical_benefits) {
      console.log(`  ⏭️  ${name.padEnd(36)} — Already enriched. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`  🔍 Querying Gemini API for "${name}"...`);
    const enrichment = await generateIngredientMetadata(name);

    if (enrichment) {
      console.log(`  ✨ Enriched: "${name}"`);
      if (isWriteMode) {
        await db.collection('ingredients').doc(doc.id).update({
          aiContent: enrichment,
          scientificName: enrichment.scientificName || data.scientificName || '',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      enrichedCount++;
      // Sleep to avoid rate limits
      await new Promise(r => setTimeout(r, 4500));
    } else {
      console.log(`  ❌ Failed to enrich: "${name}"`);
      failedCount++;
    }
  }

  console.log(`\nEnrichment results:`);
  console.log(`  ✨ Enriched: ${enrichedCount}`);
  console.log(`  ⏭️  Skipped : ${skippedCount}`);
  console.log(`  ❌ Failed  : ${failedCount}`);

  if (isWriteMode) {
    console.log(`✅ Enrichment complete and saved to Firestore.`);
  }
}

run().catch(err => {
  console.error("Fatal exception during ingredient enrichment:", err);
  process.exit(1);
});
