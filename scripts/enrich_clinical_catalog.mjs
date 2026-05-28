#!/usr/bin/env node
/**
 * scripts/enrich_clinical_catalog.mjs
 *
 * Unified database enrichment utility using Gemini to populate:
 * - contraindications
 * - halfLife
 * - dosageRange
 * - synergies
 * - evidenceLevel
 *
 * It will enrich:
 * 1. Peptides: in 'products' collection (productType === 'peptide')
 * 2. Supplements: in 'supplements' collection AND in 'products' collection (productType === 'supplement')
 *
 * Usage:
 *   node scripts/enrich_clinical_catalog.mjs [--dry-run] [--limit <number>]
 */

import { db } from './lib/firebase-admin.mjs';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.indexOf('--limit');
const LIMIT = LIMIT_ARG !== -1 ? parseInt(process.argv[LIMIT_ARG + 1], 10) : null;

// ── Load GEMINI_API_KEY from environment ─────────────────────────────────────
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  const envPaths = [
    resolve(__dirname, '../.env.local'),
    resolve(__dirname, '../.env'),
    resolve(__dirname, '../../.env.local'),
    resolve(__dirname, '../../.env')
  ];
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

const MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

/**
 * Call Gemini to generate structured clinical JSON data with retry and model rotation fallback.
 */
async function generateClinicalData(item, attempt = 1, modelIndex = 0) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in your environment or .env file.");
  }

  const name = item.name || item.displayName || item.id;
  const productType = item.productType || item.type || 'peptide';
  const modelName = MODELS[modelIndex];

  // Gather context from item fields
  const desc = item.desc || item.description || 'N/A';
  const objective = item.objective || 'N/A';
  const mechanisms = Array.isArray(item.mechanisms) ? item.mechanisms.join(', ') : (item.mechanisms || 'N/A');
  const clinicalBenefits = Array.isArray(item.clinical_benefits || item.clinicalBenefits) 
    ? (item.clinical_benefits || item.clinicalBenefits).join(', ') 
    : 'N/A';
  const scienceSummary = item.aiContent?.scientificSummary || item.aiContent?.clinicalBrief || 'N/A';

  const prompt = `
You are a world-class clinical researcher and pharmacologist specializing in peptide therapeutics, supplements, and longevity science.
Analyze the following ${productType} and return a STRICT JSON object containing 5 specific advanced clinical fields.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

Product Name: ${name}
Product Type: ${productType}
Description: ${desc}
Objective/Goals: ${objective}
Mechanism of Action: ${mechanisms}
Clinical Benefits: ${clinicalBenefits}
Scientific Summary: ${scienceSummary}

You MUST return a valid JSON object with the following schema:
{
  "contraindications": ["list", "of", "standard", "contraindications", "e.g.", "autoimmune_disorder", "oncological_history"],
  "halfLife": "string describing half-life (e.g. '2-4 hours', '7-14 days', '4-6 hours (oral)')",
  "dosageRange": {
    "min": number (representing the lower bound of a typical daily/weekly dosage, e.g. 250),
    "max": number (representing the upper bound, e.g. 500),
    "unit": "string (e.g. 'mcg', 'mg', 'g')",
    "frequency": "string (strictly one of: 'daily', 'weekly', 'daily_oral', 'weekly_oral', 'injectable_daily', 'injectable_weekly', 'as_needed')"
  },
  "synergies": ["list", "of", "other", "active", "compounds", "or", "peptides", "or", "supplements", "e.g.", "TB-500", "BPC-157", "CoQ10"],
  "evidenceLevel": "string, strictly ONE of: 'in-vitro', 'animal-model', 'human-clinical-trial', 'anecdotal'"
}

Rules for generation:
1. Ensure the fields are as scientifically accurate as possible. If an exact half-life is unknown, provide a standard range or consensus (e.g., "unknown; standard oral absorption").
2. "evidenceLevel": For supplements, default to 'human-clinical-trial' if there is strong peer-reviewed human research, or 'anecdotal' if mostly based on subjective reports.
3. Do not include any text, notes, or markdown formatting outside the JSON object.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      let errJson;
      try {
        errJson = JSON.parse(text);
      } catch (e) {}

      const isRateLimit = response.status === 429 || response.status === 503 || errJson?.error?.code === 429 || errJson?.error?.code === 503;
      
      if (isRateLimit) {
        // Try the next model in the list first if available
        if (modelIndex < MODELS.length - 1) {
          console.warn(`   ⚠️ [Attempt ${attempt}] Rate limited or service unavailable on ${modelName} for ${name}. Switching to ${MODELS[modelIndex + 1]} immediately...`);
          return generateClinicalData(item, attempt, modelIndex + 1);
        }

        if (attempt <= 3) {
          // Retrieve retry delay if specified by API, otherwise default to 20 seconds
          let delayMs = 20000;
          if (errJson?.error?.details) {
            for (const detail of errJson.error.details) {
              if (detail.retryDelay) {
                const seconds = parseFloat(detail.retryDelay.replace('s', '')) || 20;
                delayMs = Math.ceil(seconds * 1000) + 1000; // Add 1s buffer
              }
            }
          }
          console.warn(`   ⚠️ [Attempt ${attempt}] All models rate limited. Waiting ${Math.ceil(delayMs/1000)}s before retrying from first model...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return generateClinicalData(item, attempt + 1, 0);
        }
      }

      console.error(`❌ Gemini API Error for ${name} using ${modelName} (status ${response.status}):`);
      console.error(text);
      return null;
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      console.error(`❌ Empty response from Gemini for ${name} using ${modelName}`);
      return null;
    }

    return JSON.parse(textResponse.trim());
  } catch (error) {
    if (attempt <= 3 && (error.message.includes('fetch') || error.message.includes('Network'))) {
      console.warn(`   ⚠️ [Attempt ${attempt}] Network error with ${modelName}: ${error.message}. Retrying in 10s...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return generateClinicalData(item, attempt + 1, modelIndex);
    }
    console.error(`❌ Failed to parse or fetch Gemini response for ${name} using ${modelName}:`, error.message);
    return null;
  }
}

/**
 * Checks if typeData block is missing clinical fields.
 */
function isMissingClinicalFields(typeData) {
  if (!typeData) return true;
  const required = ['contraindications', 'halfLife', 'dosageRange', 'synergies', 'evidenceLevel'];
  for (const field of required) {
    if (typeData[field] === undefined || typeData[field] === null) {
      return true;
    }
  }
  // Check dosageRange nested fields
  const dr = typeData.dosageRange;
  if (!dr || dr.min === undefined || dr.max === undefined || dr.unit === undefined || dr.frequency === undefined) {
    return true;
  }
  return false;
}

async function run() {
  console.log("\n🔬 Unified Clinical Catalog Enrichment Utility");
  console.log("==============================================");
  if (DRY_RUN) console.log("⚠️  RUNNING IN DRY-RUN MODE (No Firestore writes)");
  if (LIMIT) console.log(`ℹ️  Limiting to ${LIMIT} items`);
  console.log("==============================================\n");

  if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY environment variable or .env entry is missing.");
    console.log("Please export GEMINI_API_KEY before running this script.");
    process.exit(1);
  }

  // 1. Fetch products from 'products' collection
  console.log("Fetching documents from 'products' collection...");
  const productsSnap = await db.collection("products").get();
  console.log(`Fetched ${productsSnap.size} products.`);

  // 2. Fetch supplements from 'supplements' collection
  console.log("Fetching documents from 'supplements' collection...");
  const supplementsSnap = await db.collection("supplements").get();
  console.log(`Fetched ${supplementsSnap.size} supplements.`);

  // 3. Process items
  // Create a map to group by document ID or slug to make sure we coordinate updates
  const itemsToEnrich = [];

  // Identify active peptides in 'products' collection
  productsSnap.forEach(docSnap => {
    const data = docSnap.data();
    const isPeptide = (data.productType || data.type) === 'peptide';
    const isActive = data.isActive !== false && data.status !== 'draft' && data.status !== 'inactive';

    if (isPeptide && isActive) {
      if (isMissingClinicalFields(data.typeData)) {
        itemsToEnrich.push({
          id: docSnap.id,
          collection: 'products',
          docRef: docSnap.ref,
          data,
          name: data.name || data.displayName || docSnap.id,
          productType: 'peptide'
        });
      }
    }
  });

  // Identify active supplements in 'supplements' collection
  supplementsSnap.forEach(docSnap => {
    const data = docSnap.data();
    const isActive = data.isActive !== false && data.status !== 'draft' && data.status !== 'inactive';

    if (isActive) {
      if (isMissingClinicalFields(data.typeData)) {
        itemsToEnrich.push({
          id: docSnap.id,
          collection: 'supplements',
          docRef: docSnap.ref,
          data,
          name: data.name || data.displayName || docSnap.id,
          productType: 'supplement'
        });
      }
    }
  });

  console.log(`\nFound ${itemsToEnrich.length} active items missing clinical fields.`);
  
  let processed = 0;
  let successCount = 0;
  let failedCount = 0;

  for (const item of itemsToEnrich) {
    if (LIMIT && processed >= LIMIT) {
      console.log(`\nReached limit of ${LIMIT} items. Stopping.`);
      break;
    }

    processed++;
    const label = `[${item.productType.toUpperCase()}] ${item.name} (${item.id})`;
    console.log(`\n⏳ [${processed}/${itemsToEnrich.length}] Processing ${label}...`);

    const result = await generateClinicalData(item.data);
    if (result) {
      console.log(`   Generated JSON successfully for ${item.name}:`);
      console.log(`   - halfLife: ${result.halfLife}`);
      console.log(`   - dosageRange: ${result.dosageRange?.min} - ${result.dosageRange?.max} ${result.dosageRange?.unit} (${result.dosageRange?.frequency})`);
      console.log(`   - evidenceLevel: ${result.evidenceLevel}`);
      console.log(`   - contraindications: [${result.contraindications?.join(', ')}]`);
      console.log(`   - synergies: [${result.synergies?.join(', ')}]`);

      const updates = {
        "typeData.contraindications": result.contraindications || [],
        "typeData.halfLife": result.halfLife || "",
        "typeData.dosageRange": result.dosageRange || null,
        "typeData.synergies": result.synergies || [],
        "typeData.evidenceLevel": result.evidenceLevel || "anecdotal"
      };

      if (!DRY_RUN) {
        // Update the primary document reference (either in 'products' or 'supplements')
        await item.docRef.update(updates);
        console.log(`   ✅ Updated primary document in '${item.collection}' collection.`);

        // For supplements, if we updated the 'supplements' doc, we must check if there is a corresponding doc in 'products'
        if (item.collection === 'supplements') {
          const productDocRef = db.collection("products").doc(item.id);
          const productDocSnap = await productDocRef.get();
          if (productDocSnap.exists) {
            await productDocRef.update(updates);
            console.log(`   ✅ Synced and updated corresponding document in 'products' collection.`);
          }
        }
      } else {
        console.log(`   ℹ️ [DRY RUN] Would update '${item.collection}' collection with these fields.`);
        if (item.collection === 'supplements') {
          console.log(`   ℹ️ [DRY RUN] Would also sync update in 'products' collection.`);
        }
      }
      successCount++;
    } else {
      console.log(`   ❌ Failed to generate clinical data for ${item.name}`);
      failedCount++;
    }

    // Sleep briefly to avoid rate limits (approx 3.5 seconds)
    if (processed < itemsToEnrich.length && (!LIMIT || processed < LIMIT)) {
      await new Promise(resolve => setTimeout(resolve, 3500));
    }
  }

  console.log("\n==============================================");
  console.log(`Enrichment complete.`);
  console.log(`Total processed : ${processed}`);
  console.log(`Successes       : ${successCount}`);
  console.log(`Failures        : ${failedCount}`);
  console.log("==============================================\n");

  process.exit(0);
}

run().catch(error => {
  console.error("Fatal error during enrichment run:", error);
  process.exit(1);
});
