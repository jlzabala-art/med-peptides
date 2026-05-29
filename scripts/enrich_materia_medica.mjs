#!/usr/bin/env node
import { db } from './lib/firebase-admin.mjs';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.indexOf('--limit');
const LIMIT = LIMIT_ARG !== -1 ? parseInt(process.argv[LIMIT_ARG + 1], 10) : null;

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
const MODEL = 'gemini-2.5-flash'; // Fast and supports search grounding

async function generateMateriaMedica(item, attempt = 1) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is missing.");

  const name = item.name || item.displayName || item.id;
  const productType = item.productType || item.type || 'peptide';

  const prompt = `
You are a world-class clinical researcher and pharmacologist.
We need to generate a "Materia Medica" entry for the following compound:

Product Name: ${name}
Product Type: ${productType}

You MUST use Google Search to find the most up-to-date scientific research, PubMed papers, or ClinicalTrials.gov data on this compound.
Return a STRICT JSON object containing the exact fields below. Do NOT wrap the JSON in markdown blocks (no \`\`\`json). Just raw JSON.

Schema:
{
  "mechanism_of_action_structured": [
    {
      "type": "intro_card",
      "icon": "💡",
      "text": "A one-sentence executive summary of what this compound does."
    },
    {
      "type": "pharmacology_stats",
      "stats": [
        { "label": "Half-life", "value": "e.g., 2-3 hours" },
        { "label": "Class/Type", "value": "e.g., Signaling Peptide" },
        { "label": "Primary Target", "value": "e.g., GLP-1 Receptor" }
      ]
    },
    {
      "type": "text_block",
      "title": "Biological Basis",
      "text": "A detailed paragraph explaining exactly how the compound works biologically, referencing specific pathways or cellular mechanisms."
    },
    {
      "type": "key_points",
      "title": "Metabolic & Receptor Targets",
      "items": ["Activates pathway X", "Inhibits enzyme Y"]
    },
    {
      "type": "warning_box",
      "text": "Strict pharmacological warnings or physiological risks (if any)."
    }
  ],
  "clinical_applications": ["List", "of", "specific", "conditions", "or", "outcomes", "it is used for clinically"],
  "contraindications": ["List", "of", "medical conditions", "or", "drugs", "that interact negatively"],
  "references": [
    {
      "title": "Title of the scientific paper, study, or reliable source",
      "url": "A real, valid URL to PubMed, NCBI, or the journal"
    }
  ]
}

Rules:
1. "references" MUST contain at least 2 real, verifiable links to scientific literature found via search. Do not hallucinate URLs. If you can't find exact URLs, provide the PubMed ID (PMID) URL (e.g. https://pubmed.ncbi.nlm.nih.gov/12345678/).
2. Be highly scientific and precise in the mechanism_of_action.
3. Return ONLY valid JSON.
`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      let errJson;
      try { errJson = JSON.parse(text); } catch (e) {}

      if (response.status === 429 || response.status === 503) {
        if (attempt <= 3) {
          console.warn(`   ⚠️ Rate limited. Retrying in 20s...`);
          await new Promise(resolve => setTimeout(resolve, 20000));
          return generateMateriaMedica(item, attempt + 1);
        }
      }
      console.error(`❌ Gemini API Error for ${name}:`, text);
      return null;
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return null;

    // Parse JSON block from markdown since responseMimeType is not supported with tools
    const jsonMatch = textResponse.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, textResponse];
    const jsonString = jsonMatch[1].trim();

    return JSON.parse(jsonString);
  } catch (error) {
    if (attempt <= 3 && (error.message.includes('fetch') || error.message.includes('Network'))) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      return generateMateriaMedica(item, attempt + 1);
    }
    console.error(`❌ Failed to fetch response for ${name}:`, error.message);
    return null;
  }
}

async function run() {
  console.log("\n📚 Materia Medica Enrichment (with Google Search Grounding)");
  console.log("=========================================================");
  if (DRY_RUN) console.log("⚠️  RUNNING IN DRY-RUN MODE");
  if (LIMIT) console.log(`ℹ️  Limiting to ${LIMIT} items`);
  console.log("=========================================================\n");

  const productsSnap = await db.collection("products").get();
  const supplementsSnap = await db.collection("supplements").get();
  
  const itemsToEnrich = [];

  productsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.isActive !== false && data.status !== 'draft') {
      if (!data.materia_medica) {
        itemsToEnrich.push({
          id: docSnap.id,
          collection: 'products',
          docRef: docSnap.ref,
          data,
          name: data.name || data.displayName || docSnap.id,
          productType: data.productType || 'peptide'
        });
      }
    }
  });

  supplementsSnap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.isActive !== false && data.status !== 'draft') {
      if (!data.materia_medica) {
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

  console.log(`Found ${itemsToEnrich.length} items to enrich.`);
  
  let processed = 0, successCount = 0, failedCount = 0;

  for (const item of itemsToEnrich) {
    if (LIMIT && processed >= LIMIT) break;
    processed++;
    
    console.log(`\n⏳ [${processed}/${itemsToEnrich.length}] Processing ${item.name}...`);

    const result = await generateMateriaMedica(item.data);
    if (result) {
      console.log(`   ✅ Extracted Materia Medica for ${item.name}. Found ${result.references?.length || 0} references.`);

      const updates = {
        "materia_medica": {
          mechanism_of_action_structured: result.mechanism_of_action_structured || [],
          clinical_applications: result.clinical_applications || [],
          contraindications: result.contraindications || [],
          references: result.references || [],
          updatedAt: new Date().toISOString()
        }
      };

      if (!DRY_RUN) {
        await item.docRef.update(updates);
        if (item.collection === 'supplements') {
          const productDocRef = db.collection("products").doc(item.id);
          const productDocSnap = await productDocRef.get();
          if (productDocSnap.exists) await productDocRef.update(updates);
        }
      }
      successCount++;
    } else {
      failedCount++;
    }

    if (processed < itemsToEnrich.length) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log("\nEnrichment complete.");
  console.log(`Successes: ${successCount}, Failures: ${failedCount}`);
  process.exit(0);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
