/**
 * scripts/enrich_catalog_ai.mjs
 * Group NPLAB supplements by unique compound name and enrich them with
 * clinical and scientific metadata using a local-first hybrid model
 * (loading pre-validated v2 JSON details first and falling back to Gemini).
 * 
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   node scripts/enrich_catalog_ai.mjs [--write]
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
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

// ── Standard Goals for Mapping ─────────────────────────────────────────────
const CANONICAL_GOALS = [
  'healing', 'recovery', 'inflammation', 'repair', 'sleep', 'stress_reduction',
  'focus', 'stamina', 'energy', 'circulation', 'memory', 'joint_health',
  'mobility', 'brain_health', 'neuroregeneration', 'anti_aging', 'cardio_health',
  'longevity', 'metabolism', 'weight_loss', 'blood_sugar', 'insulin_sensitivity',
  'obesity', 'appetite_suppression', 'cardiovascular_health', 'immune_support',
  'gut_health', 'joint_support', 'tendon_repair', 'skin_health', 'collagen_production',
  'wound_healing', 'rejuvenation', 'health_optimization', 'aging', 'detox',
  'hair_growth', 'cognitive', 'cell_health', 'muscle_growth'
];

const CANONICAL_ROUTES = [
  'oral_capsule', 'oral_tablet', 'topical', 'nasal', 'testing'
];

// ── Load Local databases ───────────────────────────────────────────────────
const supplementsV2 = JSON.parse(readFileSync(join(__dirname, '../src/data/v2/supplements.v2.json'), 'utf-8'));
const normalize = (name) => name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
const v2Keys = supplementsV2.map(s => ({ original: s.name, normalized: normalize(s.name), data: s }));

function getClinicalBenefits(goals, name) {
  const mapping = {
    healing: "Promotes tissue repair and accelerated wound healing",
    recovery: "Supports rapid metabolic and physical recovery",
    inflammation: "Modulates inflammatory cytokines and systemic response",
    repair: "Stimulates connective tissue and joint reconstruction",
    sleep: "Enhances sleep quality and circadian rhythm alignment",
    stress_reduction: "Reduces cortisol production and stress markers",
    focus: "Improves mental clarity and attentiveness",
    stamina: "Enhances cellular energy production and physical endurance",
    energy: "Supports mitochondrial function and daily vitality",
    circulation: "Improves microvascular circulation and blood flow",
    memory: "Enhances memory retention and recall",
    joint_health: "Promotes joint structure maintenance and mobility",
    mobility: "Enhances joint flexibility and physical mobility",
    brain_health: "Supports neuronal survival and cognitive function",
    neuroregeneration: "Stimulates nerve growth factor and synaptic repair",
    anti_aging: "Slows cellular senescence and promotes longevity pathways",
    cardio_health: "Supports cardiovascular function and vascular health",
    longevity: "Upregulates longevity genes and mitochondrial efficiency",
    metabolism: "Enhances metabolic rate and cellular energy efficiency",
    weight_loss: "Promotes lipolysis and fat oxidation",
    blood_sugar: "Improves glycemic control and insulin signaling",
    insulin_sensitivity: "Upregulates insulin receptor responsiveness",
    obesity: "Suppresses appetite and reduces fat accumulation",
    appetite_suppression: "Regulates satiety signals and food intake",
    cardiovascular_health: "Supports heart and vascular endothelial function",
    immune_support: "Modulates immune cell activity and host defense",
    gut_health: "Restores intestinal barrier function and mucosal health",
    joint_support: "Supports joint lubrication and cartilage density",
    tendon_repair: "Upregulates collagen synthesis in tendon cells",
    skin_health: "Promotes dermal collagen synthesis and skin elasticity",
    collagen_production: "Stimulates fibroblasts to produce new collagen",
    wound_healing: "Accelerates tissue migration and wound closure",
    rejuvenation: "Promotes cellular regeneration and tissue renewal",
    health_optimization: "Supports overall homeostatic balance",
    aging: "Attenuates age-associated physiological decline",
    detox: "Supports cellular detoxification and antioxidant pathways",
    hair_growth: "Stimulates hair follicle activity and hair density",
    cognitive: "Supports neurotransmitter balance and brain performance",
    cell_health: "Protects against cellular oxidative damage",
    muscle_growth: "Promotes protein synthesis and muscle hypertrophy"
  };
  return (goals || []).map(g => mapping[g]).filter(Boolean).slice(0, 5);
}

function getDosageRange(name, product) {
  // Try to parse dosage from variants or product
  const dosageStr = (product.dosage || '').toLowerCase();
  if (dosageStr) {
    return `${dosageStr} daily`;
  }
  return "1 capsule daily";
}

function getLocalSupplementEnrichment(name, product) {
  const normalizedName = normalize(name);
  let found = v2Keys.find(vk => vk.normalized === normalizedName);
  if (!found) {
    found = v2Keys.find(vk => normalizedName.startsWith(vk.normalized) || vk.normalized.startsWith(normalizedName));
  }
  if (!found) {
    found = v2Keys.find(vk => normalizedName.includes(vk.normalized) || vk.normalized.includes(normalizedName));
  }

  if (!found) return null;

  const v2 = found.data;
  const science = v2.science || {};
  const classification = v2.classification || {};
  const typeData = v2.typeData?.supplement || {};

  const goals = classification.goals || product.goals || [];
  const route = product.route || v2.variants?.[0]?.route || 'oral_capsule';

  return {
    scientificName: science.scientificName || product.scientificName || 'N/A',
    cas: product.cas && product.cas !== 'N/A' ? product.cas : (v2.cas || 'N/A'),
    desc: science.desc || product.desc || product.description || '',
    synonyms: v2.identity?.synonyms || [name.toLowerCase()],
    clinical_benefits: science.clinicalBenefits?.length > 0 ? science.clinicalBenefits : getClinicalBenefits(goals, name),
    mechanisms: science.mechanisms || [],
    objective: science.objective || product.objective || 'Support',
    goals: goals,
    route: route,
    typeData: {
      dosageRange: typeData.dosageRange || getDosageRange(name, product),
      typicalResearchUse: science.researchFocus?.join(', ') 
        ? `Investigated for its role in ${science.researchFocus.join(', ')}.`
        : `Investigated for support in ${goals.join(', ')} contexts.`,
      mechanismOfAction: {
        summary: science.desc || product.desc || '',
        researchFocus: science.researchFocus || goals
      }
    },
    storage_conditions: {
      dry: science.storageConditions?.temperature ? `Store at ${science.storageConditions.temperature}` : 'Store in a cool, dry place (15°C to 25°C)',
      reconstituted: null
    },
    stabilityNote: science.storageConditions?.light ? `Protect from light. ${science.storageConditions.light}` : 'Maintain in a tightly sealed container away from direct light.'
  };
}

async function generateScientificMetadata(productName, existingDesc) {
  const prompt = `
You are a top-tier clinical pharmacist and researcher specializing in supplements, vitamins, and bio-nutrients.
Analyze the supplement "${productName}" and return a STRICT JSON object containing scientific metadata.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

Product Name: ${productName}
Existing Description: ${existingDesc || 'N/A'}

You MUST return a valid JSON object matching the following schema structure:
{
  "scientificName": "string (the Latin binomial or chemical name, e.g. 'Withania somnifera')",
  "cas": "string (standard Chemical Abstracts Service registry number, or 'N/A')",
  "desc": "string (a professional, clinically precise 1-2 sentence description)",
  "synonyms": ["list", "of", "common", "names", "or", "brand", "names"],
  "clinical_benefits": ["3-5 key clinical advantages starting with capital letters"],
  "mechanisms": ["2-3 specific biochemical mechanisms, e.g. 'AMPK activation'"],
  "objective": "string (primary therapeutic class, e.g. 'Metabolic Support', 'Neuroprotection')",
  "goals": ["strictly mapped from: ${CANONICAL_GOALS.join(', ')}"],
  "route": "string (strictly ONE of: ${CANONICAL_ROUTES.join(', ')})",
  "typeData": {
    "dosageRange": "string (suggested dosage range and frequency, e.g. '250mg - 500mg daily')",
    "typicalResearchUse": "string (brief summary of research use)",
    "mechanismOfAction": {
      "summary": "string (biochemical explanation of how it works at receptor/pathway level)",
      "researchFocus": ["2-3 scientific focus areas"]
    }
  },
  "storage_conditions": {
    "dry": "string",
    "reconstituted": "string or null"
  },
  "stabilityNote": "string"
}
`;

  const maxRetries = 10;
  let attempt = 0;
  let delay = 15000;

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
          console.warn(`  ⚠️ Gemini rate limit hit (429) for ${productName}. Attempt ${attempt}/${maxRetries}. Sleeping for ${delay / 1000} seconds...`);
          await new Promise(r => setTimeout(r, delay));
          delay = Math.min(delay * 1.5, 60000);
          continue;
        }
        console.error(`  ❌ Gemini API Error for ${productName} (Status ${response.status}): ${response.statusText}`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      return JSON.parse(textResponse);
    } catch (error) {
      attempt++;
      console.warn(`  ⚠️ Network/Fetch error for ${productName}: ${error.message}. Attempt ${attempt}/${maxRetries}. Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, 60000);
    }
  }

  console.error(`  ❌ Failed to generate scientific metadata for ${productName} after ${maxRetries} attempts.`);
  return null;
}

async function run() {
  console.log("\n🧪 NPLAB Supplements Catalog AI Enrichment (Local-First Hybrid)");
  console.log("──────────────────────────────────────────────────\n");

  if (!API_KEY) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY environment variable is missing. Running in local-only fallback mode.");
  }

  const supplementsPath = join(__dirname, '../src/data/supplements.js');
  const raw = readFileSync(supplementsPath, 'utf-8');

  // Extract JSON array for supplements
  const supplementsStartMarker = 'export const supplements =';
  const startIdx = raw.indexOf(supplementsStartMarker);
  if (startIdx === -1) {
    throw new Error("Could not find 'export const supplements =' in supplements.js");
  }
  const jsonStart = raw.indexOf('[', startIdx);
  const jsonEnd = raw.lastIndexOf(']') + 1;
  const supplements = JSON.parse(raw.substring(jsonStart, jsonEnd));

  console.log(`Loaded ${supplements.length} supplements from local file.`);

  // Group by unique compound name (ignore case/spacing)
  const groups = new Map();
  supplements.forEach((s, idx) => {
    const key = s.name.trim().toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push({ item: s, index: idx });
  });

  console.log(`Identified ${groups.size} unique supplements to evaluate.\n`);

  let enrichedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const [name, items] of groups.entries()) {
    const first = items[0].item;
    const representativeName = first.name;

    // Check if it already has scientific name AND typeData
    if (first.scientificName && first.typeData?.dosageRange && first.stabilityNote) {
      console.log(`  ⏭️  ${representativeName.padEnd(36)} — Already enriched. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`  ⏳ Enriched details missing for supplement: "${representativeName}". Querying databases...`);

    // First, try local-first database lookup
    let enrichment = getLocalSupplementEnrichment(representativeName, first);
    let fromCache = true;

    if (!enrichment) {
      if (!API_KEY) {
        console.log(`  ❌ Details missing locally and no GEMINI_API_KEY provided. Cannot enrich "${representativeName}".`);
        failedCount++;
        continue;
      }
      console.log(`  🔍 Local data missing. Querying Gemini API for "${representativeName}"...`);
      enrichment = await generateScientificMetadata(representativeName, first.desc || first.description);
      fromCache = false;
    }

    if (enrichment) {
      console.log(`  ✨ ${fromCache ? 'Local Database' : 'Gemini'} returned metadata for: "${representativeName}"`);

      // Propagate generated metadata to all variants of this supplement
      items.forEach(({ item }) => {
        item.scientificName = enrichment.scientificName || item.scientificName || 'N/A';
        item.cas = (enrichment.cas && enrichment.cas !== 'N/A') ? enrichment.cas : (item.cas || 'N/A');
        item.desc = enrichment.desc || item.desc || '';
        item.synonyms = enrichment.synonyms || item.synonyms || [representativeName.toLowerCase()];
        item.clinical_benefits = enrichment.clinical_benefits || item.clinical_benefits || [];
        item.mechanisms = enrichment.mechanisms || item.mechanisms || [];
        item.objective = enrichment.objective || item.objective || '';
        item.goals = enrichment.goals || item.goals || [];
        item.route = enrichment.route || item.route || 'oral_capsule';
        item.typeData = {
          dosageRange: enrichment.typeData?.dosageRange || '',
          typicalResearchUse: enrichment.typeData?.typicalResearchUse || '',
          mechanismOfAction: {
            summary: enrichment.typeData?.mechanismOfAction?.summary || '',
            researchFocus: enrichment.typeData?.mechanismOfAction?.researchFocus || []
          }
        };
        item.storage_conditions = enrichment.storage_conditions || item.storage_conditions || {};
        item.stabilityNote = enrichment.stabilityNote || item.stabilityNote || '';
        item.productType = 'supplement';
      });

      enrichedCount++;

      // Sleep to avoid rate limits if we queried Gemini API
      if (!fromCache) {
        await new Promise(r => setTimeout(r, 6500));
      }
    } else {
      console.log(`  ❌ Failed to enrich supplement: "${representativeName}"`);
      failedCount++;
    }
  }

  console.log(`\nEnrichment results:`);
  console.log(`  ✨ Enriched supplements: ${enrichedCount}`);
  console.log(`  ⏭️  Skipped supplements : ${skippedCount}`);
  console.log(`  ❌ Failed supplements  : ${failedCount}`);

  if (isWriteMode && enrichedCount > 0) {
    console.log(`\n💾 Write mode active. Saving updates back to src/data/supplements.js...`);
    const newContent = raw.substring(0, jsonStart) + JSON.stringify(supplements, null, 2) + raw.substring(jsonEnd);
    writeFileSync(supplementsPath, newContent, 'utf-8');
    console.log(`✅ Saved changes successfully!`);
  } else {
    console.log(`\n💡 Dry-run mode active. No changes written. Run with --write to save changes.`);
  }
}

run().catch(err => {
  console.error("Fatal exception during supplement enrichment:", err);
  process.exit(1);
});
