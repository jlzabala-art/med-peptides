/**
 * scripts/enrich_protocols_ai.mjs
 * Enrich local protocols in src/data/protocolBlueprintsV2.json with advanced clinical
 * data (synergy_rationale, expected_outcomes, eligibility_rules, clinical_timeline)
 * using a local-first hybrid model (loading pre-validated files first and falling back to Gemini).
 * 
 * Usage:
 *   export GEMINI_API_KEY="your-api-key"
 *   node scripts/enrich_protocols_ai.mjs [--write]
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

function getLocalProtocolEnrichment(protocolId, protocol) {
  const exportPath = join(__dirname, `../export/protocols/${protocolId}.json`);
  if (!existsSync(exportPath)) return null;

  const exported = JSON.parse(readFileSync(exportPath, 'utf-8'));

  // 1. synergy_rationale
  const synergy_rationale = exported.metadata?.clinical_summary 
    || exported.metadata?.longDescription 
    || exported.clinical_summary 
    || exported.synergy_rationale 
    || `A professional multi-phase protocol structured to address the primary goal of ${protocol.primary_goal} using coordinated compound delivery.`;

  // 2. expected_outcomes
  const qualOutcomes = exported.expected_outcomes?.qualitative || exported.expected_outcomes || [];
  const qualArray = Array.isArray(qualOutcomes) ? qualOutcomes : [];
  const expected_outcomes = {
    qualitative: qualArray.length > 0 ? qualArray : (protocol.expected_outcomes || []),
    quantitative_ranges: exported.expected_outcomes?.quantitative_ranges || {},
    responder_rate_pct: exported.expected_outcomes?.responder_rate_pct || '70-85%',
    time_to_onset_weeks: exported.expected_outcomes?.time_to_onset_weeks || '2-4 weeks'
  };

  // 3. eligibility_rules
  const indications = exported.eligibility_rules?.indications 
    || [ `${protocol.primary_goal.toLowerCase()} support needed`, `metabolic optimization candidate` ];
  const contraindications = exported.eligibility_rules?.contraindications || exported.riskManagement?.contraindications || [];
  const relative_cautions = exported.eligibility_rules?.relative_cautions || [];
  const supported_age_groups = exported.eligibility_rules?.supported_age_groups || ['adults_18_plus'];
  const supported_goals = exported.eligibility_rules?.supported_goals || [ protocol.primary_goal.toLowerCase().replace(/[^a-z0-9_]/g, '_') ];

  const eligibility_rules = {
    indications: Array.isArray(indications) ? indications : [],
    contraindications: Array.isArray(contraindications) ? contraindications : [],
    relative_cautions: Array.isArray(relative_cautions) ? relative_cautions : [],
    supported_age_groups: Array.isArray(supported_age_groups) ? supported_age_groups : [],
    supported_goals: Array.isArray(supported_goals) ? supported_goals : []
  };

  // 4. clinical_timeline
  const clinical_timeline = [];
  if (exported.phase_blueprints) {
    exported.phase_blueprints.forEach(pb => {
      clinical_timeline.push({
        phase: pb.phase_title,
        expected: `Focuses on ${pb.clinical_purpose?.join(', ') || 'general therapeutic support'} for weeks ${pb.default_start_week} to ${pb.default_start_week + pb.default_duration_weeks - 1}.`
      });
    });
  } else if (protocol.phases) {
    protocol.phases.forEach(p => {
      clinical_timeline.push({
        phase: p.phase_title || `Phase ${p.phase_number}`,
        expected: `Targeted administration phase to initiate physiological response.`
      });
    });
  } else {
    clinical_timeline.push({
      phase: "Initial Phase",
      expected: "Initiate protocol and monitor baseline tolerance."
    });
  }

  return {
    synergy_rationale,
    expected_outcomes,
    eligibility_rules,
    clinical_timeline
  };
}

async function generateProtocolMetadata(protocol) {
  const compoundSlugs = [];
  if (protocol.phases) {
    protocol.phases.forEach(phase => {
      if (phase.drugs_used) {
        phase.drugs_used.forEach(drug => {
          if (drug.product_slug && !compoundSlugs.includes(drug.product_slug)) {
            compoundSlugs.push(drug.product_slug);
          }
        });
      }
    });
  }

  const prompt = `
You are a world-class clinical researcher and pharmacologist specializing in peptide combinations and medical protocols.
Analyze the following research protocol and return a STRICT JSON object containing scientific and clinical metadata.
Do not wrap the JSON in markdown blocks (like \`\`\`json). Return raw JSON only.

Protocol Title: ${protocol.protocol_title || protocol.title}
Primary Goal: ${protocol.primary_goal}
Overview Summary: ${protocol.overview_summary || 'N/A'}
Compounds Used: ${compoundSlugs.join(', ')}

You MUST return a valid JSON object matching the following schema structure:
{
  "synergy_rationale": "string (a professional, scientifically rigorous 2-3 sentence explanation of how these compounds work synergistically at a cellular and receptor level to achieve the primary goal)",
  "expected_outcomes": {
    "qualitative": ["4-6 specific biological outcomes, e.g. 'Reduction of systemic inflammatory markers', 'Upregulated cellular actin-sequestering'"],
    "quantitative_ranges": {
      "metric_name_lowercase_with_underscores": "string range (e.g. '10% - 15% reduction', '20-30% increase', '2-4 weeks')"
    },
    "responder_rate_pct": "string (e.g. '85%', '92%')",
    "time_to_onset_weeks": "string or number (e.g. '2', '3-4 weeks')"
  },
  "eligibility_rules": {
    "indications": ["4-6 clinical indications or signs the patient is a good candidate for this protocol"],
    "contraindications": ["4-6 absolute contraindications where this protocol should NOT be used"],
    "relative_cautions": ["3-5 relative cautions or side effect warning signs to monitor"],
    "supported_age_groups": ["strictly list subset of: 'adults_18_plus', 'adults_35_plus', 'geriatric'"],
    "supported_goals": ["strictly list subset of: 'healing', 'recovery', 'inflammation', 'repair', 'sleep', 'stress_reduction', 'focus', 'stamina', 'energy', 'anti_aging', 'longevity', 'metabolism', 'weight_loss', 'blood_sugar', 'insulin_sensitivity', 'obesity', 'appetite_suppression', 'immune_support', 'gut_health', 'joint_support', 'tendon_repair', 'skin_health', 'collagen_production', 'wound_healing', 'cell_health', 'muscle_growth'"]
  },
  "clinical_timeline": [
    {
      "phase": "string",
      "expected": "string"
    }
  ]
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
          console.warn(`  ⚠️ Gemini rate limit hit (429) for protocol ${protocol.protocol_title}. Attempt ${attempt}/${maxRetries}. Sleeping for ${delay / 1000} seconds...`);
          await new Promise(r => setTimeout(r, delay));
          delay = Math.min(delay * 1.5, 60000);
          continue;
        }
        console.error(`  ❌ Gemini API Error for protocol ${protocol.protocol_title} (Status ${response.status}): ${response.statusText}`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      const data = await response.json();
      const textResponse = data.candidates[0].content.parts[0].text;
      return JSON.parse(textResponse);
    } catch (error) {
      attempt++;
      console.warn(`  ⚠️ Network/Fetch error for protocol ${protocol.protocol_title}: ${error.message}. Attempt ${attempt}/${maxRetries}. Retrying in ${delay / 1000}s...`);
      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, 60000);
    }
  }

  console.error(`  ❌ Failed to generate scientific metadata for protocol ${protocol.protocol_title} after ${maxRetries} attempts.`);
  return null;
}

async function run() {
  console.log("\n🔬 Local Protocols Catalog Clinical AI Enrichment (Local-First Hybrid)");
  console.log("──────────────────────────────────────────────────\n");

  if (!API_KEY) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY environment variable is missing. Running in local-only fallback mode.");
  }

  const protocolsPath = join(__dirname, '../src/data/protocolBlueprintsV2.json');
  const protocols = JSON.parse(readFileSync(protocolsPath, 'utf-8'));

  console.log(`Loaded ${protocols.length} protocols from local file.`);

  let enrichedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (let protocol of protocols) {
    const title = protocol.protocol_title || protocol.title;
    const protocolId = protocol.protocol_id;

    // Check if it already has expected_outcomes.qualitative and eligibility_rules.indications
    if (protocol.expected_outcomes?.qualitative && protocol.eligibility_rules?.indications) {
      console.log(`  ⏭️  ${title.padEnd(44)} — Already enriched. Skipping.`);
      skippedCount++;
      continue;
    }

    console.log(`  ⏳ Enriched details missing for protocol: "${title}". Querying databases...`);
    
    // First, try local-first database lookup
    let enrichment = getLocalProtocolEnrichment(protocolId, protocol);
    let fromCache = true;

    if (!enrichment) {
      if (!API_KEY) {
        console.log(`  ❌ Details missing locally and no GEMINI_API_KEY provided. Cannot enrich "${title}".`);
        failedCount++;
        continue;
      }
      console.log(`  🔍 Local data missing. Querying Gemini API for "${title}"...`);
      enrichment = await generateProtocolMetadata(protocol);
      fromCache = false;
    }

    if (enrichment) {
      console.log(`  ✨ ${fromCache ? 'Local Export' : 'Gemini'} returned metadata for: "${title}"`);
      
      protocol.synergy_rationale = enrichment.synergy_rationale || protocol.synergy_rationale || '';
      protocol.expected_outcomes = {
        ...(protocol.expected_outcomes || {}),
        qualitative: enrichment.expected_outcomes?.qualitative || [],
        quantitative_ranges: enrichment.expected_outcomes?.quantitative_ranges || {},
        responder_rate_pct: enrichment.expected_outcomes?.responder_rate_pct || '',
        time_to_onset_weeks: enrichment.expected_outcomes?.time_to_onset_weeks || ''
      };
      protocol.eligibility_rules = {
        ...(protocol.eligibility_rules || {}),
        indications: enrichment.eligibility_rules?.indications || [],
        contraindications: enrichment.eligibility_rules?.contraindications || [],
        relative_cautions: enrichment.eligibility_rules?.relative_cautions || [],
        supported_age_groups: enrichment.eligibility_rules?.supported_age_groups || [],
        supported_goals: enrichment.eligibility_rules?.supported_goals || []
      };
      protocol.clinical_timeline = enrichment.clinical_timeline || protocol.clinical_timeline || [];

      enrichedCount++;
      
      // Sleep to avoid rate limits if we queried Gemini API
      if (!fromCache) {
        await new Promise(r => setTimeout(r, 6500));
      }
    } else {
      console.log(`  ❌ Failed to enrich protocol: "${title}"`);
      failedCount++;
    }
  }

  console.log(`\nEnrichment results:`);
  console.log(`  ✨ Enriched protocols: ${enrichedCount}`);
  console.log(`  ⏭️  Skipped protocols : ${skippedCount}`);
  console.log(`  ❌ Failed protocols  : ${failedCount}`);

  if (isWriteMode && enrichedCount > 0) {
    console.log(`\n💾 Write mode active. Saving updates back to src/data/protocolBlueprintsV2.json...`);
    writeFileSync(protocolsPath, JSON.stringify(protocols, null, 2), 'utf-8');
    console.log(`✅ Saved changes successfully!`);
  } else {
    console.log(`\n💡 Dry-run mode active. No changes written. Run with --write to save changes.`);
  }
}

run().catch(err => {
  console.error("Fatal exception during protocol enrichment:", err);
  process.exit(1);
});
