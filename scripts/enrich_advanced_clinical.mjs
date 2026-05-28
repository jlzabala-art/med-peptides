#!/usr/bin/env node
/**
 * scripts/enrich_advanced_clinical.mjs
 *
 * Advanced database enrichment utility using Gemini to populate:
 * Peptides:
 * - typeData.peptide.receptorTargets (e.g. MC4R, GHS-R1a)
 * - typeData.peptide.researchStage (e.g. phase_1, phase_2, approved)
 * - typeData.peptide.clinicalStudiesCount (e.g. '50+ publications')
 *
 * Protocols:
 * - dosing_enrichment.cycling_recommendation
 * - dosing_enrichment.timing_optimization
 * - monitoringSchedule (array of standard labs at week 0, 12, etc.)
 * - riskManagement.contraindications
 *
 * Usage:
 *   node scripts/enrich_advanced_clinical.mjs [--dry-run] [--limit <number>]
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
 * Call Gemini with retry and model rotation fallback.
 */
async function callGemini(prompt, attempt = 1, modelIndex = 0) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in your environment or .env file.");
  }
  const modelName = MODELS[modelIndex];
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
      try { errJson = JSON.parse(text); } catch (e) {}
      const isRateLimit = response.status === 429 || response.status === 503 || errJson?.error?.code === 429 || errJson?.error?.code === 503;
      
      if (isRateLimit) {
        if (modelIndex < MODELS.length - 1) {
          console.warn(`   ⚠️ [Attempt ${attempt}] Rate limited or service unavailable on ${modelName}. Switching to ${MODELS[modelIndex + 1]} immediately...`);
          return callGemini(prompt, attempt, modelIndex + 1);
        }
        if (attempt <= 3) {
          let delayMs = 20000;
          console.warn(`   ⚠️ [Attempt ${attempt}] All models rate limited. Waiting 20s before retrying from first model...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return callGemini(prompt, attempt + 1, 0);
        }
      }
      console.error(`❌ Gemini API Error (status ${response.status}):`);
      console.error(text);
      return null;
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return null;
    return JSON.parse(textResponse.trim());
  } catch (error) {
    if (attempt <= 3 && (error.message.includes('fetch') || error.message.includes('Network'))) {
      console.warn(`   ⚠️ [Attempt ${attempt}] Network error with ${modelName}: ${error.message}. Retrying in 10s...`);
      await new Promise(resolve => setTimeout(resolve, 10000));
      return callGemini(prompt, attempt + 1, modelIndex);
    }
    console.error(`❌ Failed to parse or fetch Gemini response:`, error.message);
    return null;
  }
}

/**
 * Generate peptide advanced clinical fields.
 */
async function generatePeptideAdvancedFields(item) {
  const name = item.name || item.displayName || item.id;
  const desc = item.desc || item.description || 'N/A';
  const scienceSummary = item.aiContent?.scientificSummary || item.aiContent?.clinicalBrief || 'N/A';
  const mechanisms = Array.isArray(item.mechanisms) ? item.mechanisms.join(', ') : (item.mechanisms || 'N/A');

  const prompt = `
You are a molecular pharmacologist specializing in peptide therapeutics.
Analyze the following peptide and return a STRICT JSON object containing 3 specific clinical properties.
Do not wrap the JSON in markdown blocks. Return raw JSON only.

Peptide Name: ${name}
Description: ${desc}
Mechanism: ${mechanisms}
Scientific Summary: ${scienceSummary}

You MUST return a valid JSON object with the following schema:
{
  "receptorTargets": ["array of specific biological receptors/pathways, e.g. 'GHS-R1a', 'MC4-R', 'EP2/EP4 receptor pathways'"],
  "researchStage": "string, strictly one of: 'preclinical', 'phase_1', 'phase_2', 'phase_3', 'approved'",
  "clinicalStudiesCount": "string describing consensus or estimated PubMed publication volume, e.g. '50+ preclinical trials', '20+ human studies', '100+ publications'"
}
`;
  return callGemini(prompt);
}

/**
 * Generate protocol advanced clinical fields.
 */
async function generateProtocolAdvancedFields(proto) {
  const title = proto.protocol_title || proto.title || proto.id;
  const overview = proto.overview_summary || '';
  const goal = proto.primary_goal || '';
  const indications = Array.isArray(proto.eligibility_rules?.indications) ? proto.eligibility_rules.indications.join(', ') : '';

  const prompt = `
You are a clinical coordinator specializing in peptide and longevity protocols.
Analyze the following optimization protocol and return a STRICT JSON object containing advanced dosing, safety, and lab monitoring specifications.
Do not wrap the JSON in markdown. Return raw JSON only.

Protocol Title: ${title}
Goal: ${goal}
Overview: ${overview}
Indications: ${indications}

You MUST return a valid JSON object with the following schema:
{
  "cyclingRecommendation": "detailed cycle description, e.g. '12 weeks active cycle followed by 4 weeks washout'",
  "timingOptimization": "timing advice, e.g. 'Administer Semax in the morning; avoid post-14:00 to prevent insomnia'",
  "monitoringSchedule": [
    {
      "week": 0,
      "labs": ["array of lab biomarkers to measure at baseline, e.g. 'CBC', 'CMP', 'Lipid Panel', 'IGF-1'"]
    },
    {
      "week": 12,
      "labs": ["array of lab biomarkers to measure after 12 weeks, e.g. 'CBC', 'CMP', 'IGF-1'"]
    }
  ],
  "contraindications": ["array of specific clinical contraindications for this combination, e.g. 'uncontrolled hypertension', 'active malignancy'"]
}
`;
  return callGemini(prompt);
}

async function run() {
  console.log("\n🔬 Unified Advanced Clinical Enrichment Utility");
  console.log("==============================================");
  if (DRY_RUN) console.log("⚠️  RUNNING IN DRY-RUN MODE (No Firestore writes)");
  if (LIMIT) console.log(`ℹ️  Limiting to ${LIMIT} items`);
  console.log("==============================================\n");

  if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY environment variable or .env entry is missing.");
    process.exit(1);
  }

  // 1. Fetch active peptides from 'products' collection
  console.log("Fetching peptides from 'products' collection...");
  const productsSnap = await db.collection("products").get();
  const peptides = [];
  productsSnap.forEach(docSnap => {
    const data = docSnap.data();
    const isPeptide = (data.productType || data.type) === 'peptide';
    const isActive = data.isActive !== false && data.status !== 'draft' && data.status !== 'inactive';
    if (isPeptide && isActive) {
      // Only enrich if missing receptorTargets or researchStage
      if (!data.typeData?.peptide?.receptorTargets || !data.typeData?.peptide?.researchStage) {
        peptides.push({ id: docSnap.id, docRef: docSnap.ref, data });
      }
    }
  });
  console.log(`Found ${peptides.length} active peptides missing advanced clinical properties.`);

  // 2. Fetch active protocols from 'protocols' collection
  console.log("Fetching protocols from 'protocols' collection...");
  const protocolsSnap = await db.collection("protocols").where("active", "==", true).get();
  const protocols = [];
  protocolsSnap.forEach(docSnap => {
    const data = docSnap.data();
    // Only enrich if missing cycle recommendation or monitoringSchedule is empty/null
    if (!data.dosing_enrichment?.cycling_recommendation || !data.monitoringSchedule || data.monitoringSchedule.length === 0) {
      protocols.push({ id: docSnap.id, docRef: docSnap.ref, data });
    }
  });
  console.log(`Found ${protocols.length} active protocols missing advanced clinical properties.`);

  let processed = 0;

  // Process peptides
  console.log("\n--- ENRICHING PEPTIDES ---");
  for (const item of peptides) {
    if (LIMIT && processed >= LIMIT) break;
    processed++;
    console.log(`⏳ [${processed}] Processing Peptide: ${item.data.name || item.id}...`);

    const result = await generatePeptideAdvancedFields(item.data);
    if (result) {
      console.log(`   Receptor Targets: [${result.receptorTargets?.join(', ')}]`);
      console.log(`   Research Stage:   ${result.researchStage}`);
      console.log(`   Studies Count:    ${result.clinicalStudiesCount}`);

      if (!DRY_RUN) {
        const typeData = item.data.typeData || {};
        typeData.peptide = {
          ...(typeData.peptide || {}),
          receptorTargets: result.receptorTargets || [],
          researchStage: result.researchStage || 'preclinical',
          clinicalStudiesCount: result.clinicalStudiesCount || ''
        };
        await item.docRef.update({ typeData });
        console.log(`   ✅ Updated Firestore peptide document.`);
      }
    } else {
      console.log(`   ❌ Failed to generate clinical properties.`);
    }

    await new Promise(resolve => setTimeout(resolve, 3500));
  }

  // Process protocols
  console.log("\n--- ENRICHING PROTOCOLS ---");
  for (const item of protocols) {
    if (LIMIT && processed >= LIMIT) break;
    processed++;
    console.log(`⏳ [${processed}] Processing Protocol: ${item.data.protocol_title || item.id}...`);

    const result = await generateProtocolAdvancedFields(item.data);
    if (result) {
      console.log(`   Cycling Recommendation: ${result.cyclingRecommendation}`);
      console.log(`   Timing Optimization:    ${result.timingOptimization}`);
      console.log(`   Monitoring schedule:    ${result.monitoringSchedule?.length} entries`);
      console.log(`   Contraindications:      [${result.contraindications?.join(', ')}]`);

      if (!DRY_RUN) {
        const dosing_enrichment = {
          ...(item.data.dosing_enrichment || {}),
          cycling_recommendation: result.cyclingRecommendation || '',
          timing_optimization: result.timingOptimization || ''
        };
        const riskManagement = {
          ...(item.data.riskManagement || {}),
          contraindications: result.contraindications || []
        };
        const monitoringSchedule = result.monitoringSchedule || [];

        await item.docRef.update({
          dosing_enrichment,
          riskManagement,
          monitoringSchedule
        });
        console.log(`   ✅ Updated Firestore protocol document.`);
      }
    } else {
      console.log(`   ❌ Failed to generate advanced protocol properties.`);
    }

    await new Promise(resolve => setTimeout(resolve, 3500));
  }

  console.log("\n==============================================");
  console.log("Advanced clinical database enrichment finished.");
  console.log("==============================================\n");
  process.exit(0);
}

run().catch(error => {
  console.error("Fatal error during enrichment run:", error);
  process.exit(1);
});
