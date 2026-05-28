/**
 * phase11_2_autoEnrichClinicalFields.mjs
 * Uses the Gemini API (via native fetch) to auto-generate the new clinical fields:
 * - contraindications
 * - halfLife
 * - dosageRange
 * - synergies
 * - evidenceLevel
 * 
 * Usage:
 * export GEMINI_API_KEY="your-api-key"
 * node scripts/phase11_2_autoEnrichClinicalFields.mjs
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";
import { readFileSync, existsSync }         from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svcAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(svcAccount) });
const db = getFirestore();

// ── Load GEMINI_API_KEY from process environment, .env, or .env.local ───────
let apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  const envPaths = [resolve(__dirname, '../.env.local'), resolve(__dirname, '../.env')];
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

async function generateClinicalData(productName, aiContent, typeData) {
  const prompt = `
You are a top-tier clinical researcher specializing in peptides and supplements.
Analyze the following product and return a STRICT JSON object containing 5 specific advanced clinical fields.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

Product Name: ${productName}
Scientific Summary: ${aiContent?.scientificSummary || "N/A"}
Mechanism of Action: ${typeData?.mechanismOfAction || "N/A"}

You MUST return a valid JSON object with the following schema:
{
  "contraindications": ["list", "of", "strings", "e.g.", "oncological_history", "autoimmune_disorder"],
  "halfLife": "string describing half-life (e.g. '2-4 hours', '7-14 days')",
  "dosageRange": {
    "min": number (e.g. 250),
    "max": number (e.g. 500),
    "unit": "string (e.g. 'mcg', 'mg')",
    "frequency": "string (e.g. 'daily', 'weekly')"
  },
  "synergies": ["list", "of", "complementary", "products", "e.g.", "TB-500", "GHK-Cu"],
  "evidenceLevel": "string, strictly ONE of: 'in-vitro', 'animal-model', 'human-clinical-trial', 'anecdotal'"
}

Ensure the data is as scientifically accurate as possible. If an exact half-life or dosage isn't standard, provide the most commonly accepted research consensus.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.error(`Gemini API Error for ${productName}: ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return null;
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON
    return JSON.parse(textResponse);
  } catch (error) {
    console.error(`Failed to parse or fetch Gemini response for ${productName}:`, error);
    return null;
  }
}

async function run() {
  console.log("\n🔬 Phase 11.2 — Auto-Enrich Advanced Clinical Fields");
  console.log("───────────────────────────────────────────────────\n");

  if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY environment variable is missing.");
    console.log("Please export your API key before running:");
    console.log("export GEMINI_API_KEY=\"your_key_here\"");
    process.exit(1);
  }

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft" && (d.productType === "peptide" || d.productType === "supplement"));

  console.log(`Products to enrich: ${active.length}\n`);

  let patched = 0;
  let failed = 0;
  let skipped = 0;

  for (const p of active) {
    const name = p.name || p.id;
    
    // Check if it already has the new fields
    if (p.typeData?.contraindications && p.typeData?.halfLife) {
      console.log(`  ⏭️  ${name.padEnd(44)} — Already enriched. Skipping.`);
      skipped++;
      continue;
    }

    console.log(`  ⏳ Processing ${name}...`);
    const newFields = await generateClinicalData(name, p.aiContent, p.typeData);

    if (newFields) {
      const updates = {
        "typeData.contraindications": newFields.contraindications,
        "typeData.halfLife": newFields.halfLife,
        "typeData.dosageRange": newFields.dosageRange,
        "typeData.synergies": newFields.synergies,
        "typeData.evidenceLevel": newFields.evidenceLevel
      };

      await p._ref.update(updates);
      console.log(`  ✅ ${name.padEnd(44)} — Enriched successfully!`);
      patched++;
    } else {
      console.log(`  ❌ ${name.padEnd(44)} — Failed to generate data.`);
      failed++;
    }
    
    // Sleep briefly to avoid hitting rate limits too fast (15 RPM for free tier)
    await new Promise(r => setTimeout(r, 4000));
  }

  console.log("\n───────────────────────────────────────────────────");
  console.log(`✅ Patched : ${patched}`);
  console.log(`⏭️  Skipped : ${skipped}`);
  console.log(`❌ Failed  : ${failed}`);
  console.log("");
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
