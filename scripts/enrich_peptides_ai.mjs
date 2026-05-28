/**
 * scripts/enrich_peptides_ai.mjs
 * Group local peptides by unique compound name and enrich them with
 * clinical and scientific metadata using a local-first hybrid model
 * (loading pre-validated local database details first and falling back to Gemini).
 * 
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   node scripts/enrich_peptides_ai.mjs [--write]
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

// ── Standard Goals and Routes for Validation ───────────────────────────────
const ALLOWED_GOALS = [
  'healing', 'recovery', 'inflammation', 'repair', 'sleep', 'stress_reduction',
  'focus', 'stamina', 'energy', 'circulation', 'memory', 'joint_health',
  'mobility', 'brain_health', 'neuroregeneration', 'anti_aging', 'cardio_health',
  'longevity', 'metabolism', 'weight_loss', 'blood_sugar', 'insulin_sensitivity',
  'obesity', 'appetite_suppression', 'cardiovascular_health', 'immune_support',
  'gut_health', 'joint_support', 'tendon_repair', 'skin_health', 'collagen_production',
  'wound_healing', 'rejuvenation', 'health_optimization', 'aging', 'detox',
  'hair_growth', 'cognitive', 'adaptogens_botanicals', 'amino_acids', 'cell_health', 'muscle_growth'
];

const ALLOWED_ROUTES = [
  'injectable_vial', 'injectable_pen', 'oral_capsule', 'oral_tablet', 'topical', 'nasal'
];

// ── Load Local databases ───────────────────────────────────────────────────
const clinicalData = JSON.parse(readFileSync(join(__dirname, '../src/data/v2/clinicalData.json'), 'utf-8'));
const safetyData = JSON.parse(readFileSync(join(__dirname, '../src/data/v2/safetyData.json'), 'utf-8'));
const researchData = JSON.parse(readFileSync(join(__dirname, '../src/data/v2/researchData.json'), 'utf-8'));

const normalize = (name) => name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
const clinicalKeys = Object.keys(clinicalData).map(k => ({ original: k, normalized: normalize(k) }));

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
    memory: "Enhances synaptic plasticity and memory retention",
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
    adaptogens_botanicals: "Enhances adaptogenic stress resilience",
    amino_acids: "Provides essential amino acid cellular substrates",
    cell_health: "Protects against cellular oxidative damage",
    muscle_growth: "Promotes protein synthesis and myofibrillar hypertrophy"
  };
  const benefits = (goals || []).map(g => mapping[g]).filter(Boolean);
  if (benefits.length === 0) {
    benefits.push(`Supports scientific research into the pharmacology of ${name}`);
    benefits.push(`Investigated for cellular safety and metabolic pathways`);
  }
  return benefits;
}

function getDosageRange(name, product) {
  const n = name.toUpperCase();
  if (n.includes("TIRZEPATIDE") || n.includes("SEMAGLUTIDE") || n.includes("RETATRUTIDE") || n.includes("CAGRILINTIDE")) {
    return { min: 2.5, max: 15, unit: "mg", frequency: "weekly" };
  }
  if (n.includes("BPC")) {
    return { min: 250, max: 500, unit: "mcg", frequency: "daily" };
  }
  if (n.includes("TB-500") || n.includes("TB500")) {
    return { min: 2, max: 5, unit: "mg", frequency: "twice_weekly" };
  }
  if (n.includes("IPAMORELIN") || n.includes("GHRP") || n.includes("HEXARELIN") || n.includes("SERMORELIN")) {
    return { min: 100, max: 300, unit: "mcg", frequency: "daily" };
  }
  if (n.includes("CJC")) {
    if (n.includes("WITH DAC")) {
      return { min: 1, max: 2, unit: "mg", frequency: "weekly" };
    } else {
      return { min: 100, max: 200, unit: "mcg", frequency: "daily" };
    }
  }
  if (n.includes("GHK")) {
    return { min: 1, max: 2, unit: "mg", frequency: "daily" };
  }
  if (n.includes("EPITHALON") || n.includes("EPITALON")) {
    return { min: 1, max: 10, unit: "mg", frequency: "daily" };
  }
  if (n.includes("NAD") || n.includes("NMN")) {
    return { min: 250, max: 500, unit: "mg", frequency: "daily" };
  }
  if (n.includes("SELANK") || n.includes("SEMAX")) {
    return { min: 100, max: 300, unit: "mcg", frequency: "daily" };
  }
  if (n.includes("MOTS")) {
    return { min: 5, max: 5, unit: "mg", frequency: "thrice_weekly" };
  }
  
  // Generic parsing
  const dosageStr = (product.dosage || '').toLowerCase();
  const hasMcg = dosageStr.includes('mcg');
  const hasMg = dosageStr.includes('mg');
  const numMatch = dosageStr.match(/(\d+(\.\d+)?)/);
  const num = numMatch ? parseFloat(numMatch[1]) : 1;
  
  if (hasMcg) {
    return { min: Math.round(num / 2) || 100, max: Math.round(num * 2) || 500, unit: "mcg", frequency: "daily" };
  } else if (hasMg) {
    return { min: num / 2 || 1, max: num * 2 || 10, unit: "mg", frequency: "daily" };
  } else {
    return { min: 100, max: 500, unit: "mcg", frequency: "daily" };
  }
}

function getSynergies(name) {
  const n = name.toUpperCase();
  if (n.includes("BPC")) return ["TB-500", "GHK-Cu", "KPV"];
  if (n.includes("TB-500") || n.includes("TB500")) return ["BPC-157", "GHK-Cu"];
  if (n.includes("CJC")) return ["Ipamorelin", "GHRP-2"];
  if (n.includes("IPAMORELIN")) return ["CJC-1295 without DAC", "CJC-1295 with DAC"];
  if (n.includes("SEMAGLUTIDE") || n.includes("TIRZEPATIDE")) return ["MOTS-c", "AOD-9604"];
  return ["BPC-157", "Bacteriostatic Water"];
}

function getEvidenceLevel(status) {
  if (!status) return 'anecdotal';
  const s = status.toLowerCase();
  if (s.includes('approved') || s.includes('phase')) {
    return 'human-clinical-trial';
  }
  if (s.includes('preclinical')) {
    return 'animal-model';
  }
  return 'anecdotal';
}

function mapRoute(r) {
  if (!r) return 'injectable_vial';
  const norm = r.toLowerCase();
  if (norm.includes('oral') || norm.includes('capsule')) return 'oral_capsule';
  if (norm.includes('nasal') || norm.includes('intranasal')) return 'nasal';
  if (norm.includes('topical')) return 'topical';
  return 'injectable_vial';
}

function getLocalEnrichment(name, product) {
  const normalizedProd = normalize(name);
  let found = clinicalKeys.find(ck => ck.normalized === normalizedProd);
  if (!found) {
    found = clinicalKeys.find(ck => normalizedProd.startsWith(ck.normalized) || ck.normalized.startsWith(normalizedProd));
  }
  if (!found) {
    found = clinicalKeys.find(ck => normalizedProd.includes(ck.normalized) || ck.normalized.includes(normalizedProd));
  }

  if (!found) return null;

  const k = found.original;
  const clinical = clinicalData[k] || {};
  const safety = safetyData[k] || {};
  const research = researchData[k] || {};

  const goals = product.goals || [];
  const route = product.route || (clinical.pharmacokinetics?.route?.[0] ? mapRoute(clinical.pharmacokinetics.route[0]) : 'injectable_vial');

  return {
    scientificName: clinical.scientificName || name,
    cas: product.cas && product.cas !== 'N/A' ? product.cas : (clinical.cas || 'N/A'),
    synonyms: product.synonyms || [name.toLowerCase()],
    clinical_benefits: getClinicalBenefits(goals, name),
    mechanisms: clinical.mechanisms || [],
    goals: goals,
    route: route,
    typeData: {
      halfLife: clinical.pharmacokinetics?.half_life || '',
      contraindications: safety.contraindications || [],
      dosageRange: getDosageRange(name, product),
      synergies: getSynergies(name),
      evidenceLevel: getEvidenceLevel(research.research_status),
      typicalResearchUse: clinical.pharmacokinetics?.bioavailability 
        ? `Investigated in research models via ${clinical.pharmacokinetics.bioavailability}.`
        : `Investigated in research models for its potential in modulating ${goals.join(', ')} pathways.`,
      mechanismOfAction: {
        summary: product.desc || product.description || clinical.mechanisms?.join('. ') || '',
        researchFocus: goals
      }
    },
    storage_conditions: {
      dry: clinical.storage_conditions?.temperature ? `Store at ${clinical.storage_conditions.temperature}` : 'Store in a cool, dry place (15-25°C)',
      reconstituted: 'Store at 2-8°C, do not freeze, use within 30 days'
    },
    stabilityNote: clinical.storage_conditions?.shelf_life 
      ? `Lyophilized powder remains stable for up to ${clinical.storage_conditions.shelf_life} in dry storage.`
      : 'Lyophilized powder remains stable at room temperature during transit.'
  };
}

async function generatePeptideMetadata(productName, existingDesc) {
  const prompt = `
You are a world-class clinical researcher and molecular pharmacologist specializing in peptide therapeutics.
Analyze the peptide "${productName}" and return a STRICT JSON object containing scientific and clinical metadata.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

Product Name: ${productName}
Existing Description: ${existingDesc || 'N/A'}

You MUST return a valid JSON object matching the following schema structure:
{
  "scientificName": "string (the IUPAC name, amino acid sequence representation, or scientific nomenclature, e.g. 'L-alanyl-L-glutamine' or 'Pentadecapeptide BPC 157')",
  "cas": "string (standard Chemical Abstracts Service registry number, or 'N/A')",
  "synonyms": ["list", "of", "common", "names", "or", "research", "abbreviations"],
  "clinical_benefits": ["3-5 key clinical advantages starting with capital letters"],
  "mechanisms": ["2-3 specific biochemical mechanisms, e.g. 'VEGF upregulation', 'Actin sequestration'"],
  "goals": ["strictly mapped from: ${ALLOWED_GOALS.join(', ')}"],
  "route": "string (strictly ONE of: ${ALLOWED_ROUTES.join(', ')})",
  "typeData": {
    "halfLife": "string describing half-life, e.g. '30 minutes', '2-4 hours', '7-14 days'",
    "contraindications": ["list", "of", "contraindications", "e.g.", "active_malignancy", "pregnancy", "severe_renal_impairment"],
    "dosageRange": {
      "min": number,
      "max": number,
      "unit": "string",
      "frequency": "string"
    },
    "synergies": ["list", "of", "synergistic", "compounds"],
    "evidenceLevel": "string",
    "typicalResearchUse": "string",
    "mechanismOfAction": {
      "summary": "string",
      "researchFocus": ["list"]
    }
  },
  "storage_conditions": {
    "dry": "string",
    "reconstituted": "string"
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
  console.log("\n🔬 Local Peptide Catalog Clinical AI Enrichment (Local-First Hybrid)");
  console.log("──────────────────────────────────────────────────\n");

  if (!API_KEY) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY environment variable is missing. Running in local-only fallback mode.");
  }

  const productsPath = join(__dirname, '../src/data/products.js');
  const raw = readFileSync(productsPath, 'utf-8');
  
  // Extract JSON array for products
  const productsStartMarker = 'export const products =';
  const startIdx = raw.indexOf(productsStartMarker);
  if (startIdx === -1) {
    throw new Error("Could not find 'export const products =' in products.js");
  }
  const jsonStart = raw.indexOf('[', startIdx);
  const jsonEnd = raw.lastIndexOf(']') + 1;
  const products = JSON.parse(raw.substring(jsonStart, jsonEnd));

  console.log(`Loaded ${products.length} products from local file.`);

  // Group by unique compound name (ignore case/spacing)
  const groups = new Map();
  products.forEach((p, idx) => {
    // Only enrich products that are peptides (supplements are in supplements.js)
    const productType = p.productType || p.type || 'peptide';
    if (productType !== 'peptide') return;

    const key = p.name.trim().toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push({ item: p, index: idx });
  });

  console.log(`Identified ${groups.size} unique peptides to evaluate.\n`);

  let enrichedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const [name, items] of groups.entries()) {
    const first = items[0].item;
    const representativeName = first.name;

    // Check if it already has scientific name AND typeData with halfLife
    if (first.scientificName && first.typeData?.halfLife && first.typeData?.contraindications) {
      console.log(`  ⏭️  ${representativeName.padEnd(36)} — Already enriched. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`  ⏳ Enriched details missing for peptide: "${representativeName}". Querying databases...`);
    
    // First, try local-first database lookup
    let enrichment = getLocalEnrichment(representativeName, first);
    let fromCache = true;

    if (!enrichment) {
      if (!API_KEY) {
        console.log(`  ❌ Details missing locally and no GEMINI_API_KEY provided. Cannot enrich "${representativeName}".`);
        failedCount++;
        continue;
      }
      console.log(`  🔍 Local data missing. Querying Gemini API for "${representativeName}"...`);
      enrichment = await generatePeptideMetadata(representativeName, first.desc || first.description);
      fromCache = false;
    }

    if (enrichment) {
      console.log(`  ✨ ${fromCache ? 'Local Database' : 'Gemini'} returned metadata for: "${representativeName}"`);
      
      // Propagate generated metadata to all variants of this peptide
      items.forEach(({ item }) => {
        item.scientificName = enrichment.scientificName || item.scientificName || '';
        item.cas = (enrichment.cas && enrichment.cas !== 'N/A') ? enrichment.cas : (item.cas || 'N/A');
        item.synonyms = enrichment.synonyms || item.synonyms || [representativeName.toLowerCase()];
        item.clinical_benefits = enrichment.clinical_benefits || item.clinical_benefits || [];
        item.mechanisms = enrichment.mechanisms || item.mechanisms || [];
        item.goals = enrichment.goals || item.goals || [];
        item.route = enrichment.route || item.route || 'injectable_vial';
        item.typeData = {
          halfLife: enrichment.typeData?.halfLife || '',
          contraindications: enrichment.typeData?.contraindications || [],
          dosageRange: enrichment.typeData?.dosageRange || {},
          synergies: enrichment.typeData?.synergies || [],
          evidenceLevel: enrichment.typeData?.evidenceLevel || 'anecdotal',
          typicalResearchUse: enrichment.typeData?.typicalResearchUse || '',
          mechanismOfAction: enrichment.typeData?.mechanismOfAction || {}
        };
        item.storage_conditions = enrichment.storage_conditions || item.storage_conditions || {};
        item.stabilityNote = enrichment.stabilityNote || item.stabilityNote || '';
        item.productType = 'peptide';
      });

      enrichedCount++;
      
      // Sleep to avoid rate limits if we queried Gemini API
      if (!fromCache) {
        await new Promise(r => setTimeout(r, 6500));
      }
    } else {
      console.log(`  ❌ Failed to enrich peptide: "${representativeName}"`);
      failedCount++;
    }
  }

  console.log(`\nEnrichment results:`);
  console.log(`  ✨ Enriched peptides: ${enrichedCount}`);
  console.log(`  ⏭️  Skipped peptides : ${skippedCount}`);
  console.log(`  ❌ Failed peptides  : ${failedCount}`);

  if (isWriteMode && enrichedCount > 0) {
    console.log(`\n💾 Write mode active. Saving updates back to src/data/products.js...`);
    const newContent = raw.substring(0, jsonStart) + JSON.stringify(products, null, 2) + raw.substring(jsonEnd);
    writeFileSync(productsPath, newContent, 'utf-8');
    console.log(`✅ Saved changes successfully!`);
  } else {
    console.log(`\n💡 Dry-run mode active. No changes written. Run with --write to save changes.`);
  }
}

run().catch(err => {
  console.error("Fatal exception during peptide enrichment:", err);
  process.exit(1);
});
