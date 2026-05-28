import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_PATH = resolve(__dirname, '../AI Prompts/clinicalAI_rules.json');

try {
  console.log('📖 Loading clinicalAI_rules.json...');
  const rules = JSON.parse(readFileSync(RULES_PATH, 'utf8'));

  // 1. Enrich Compound Query Response Format with Pharmacokinetics
  console.log('⚡ Enriching compound_query response formats and critical rules...');
  if (rules.query_types?.compound_query?.response_format) {
    rules.query_types.compound_query.response_format.section_order = [
      "Peptide Name (H2 heading)",
      "CATEGORY",
      "WHAT IT IS — one concise paragraph, plain-language mechanism and origin",
      "PRIMARY AREAS — bullet list of main research applications and biological targets",
      "PHARMACOKINETICS & BIOAVAILABILITY — Half-life, receptor affinity, routes of research clearance",
      "AVAILABLE FORMS — vial sizes, concentrations, or oral formats if available",
      "RELATED PROTOCOLS — secondary, keep brief, list 1–3 protocol names only",
      "SIMILAR PEPTIDES — 2–4 related peptides or supplements",
      "NEXT ACTIONS — View Peptide Page / See Similar Peptides / Explore Related Protocols"
    ];
  }

  // Add new critical rules for medical-grade precision
  if (rules.query_types?.compound_query?.critical_rules) {
    const existingRules = rules.query_types.compound_query.critical_rules;
    const hasKineticsRule = existingRules.some(r => r.id === 'QT-001-CR-5');
    if (!hasKineticsRule) {
      existingRules.push({
        id: "QT-001-CR-5",
        rule: "You MUST include a dedicated 'PHARMACOKINETICS & BIOAVAILABILITY' section detailing the compound's half-life, active receptors, and biological pathways."
      });
      existingRules.push({
        id: "QT-001-CR-6",
        rule: "Proactively mention real, published scientific study outcomes or clinical literature patterns when explaining a compound's mechanisms of action."
      });
    }
  }

  // 2. Add FSE-007 and FSE-008 Few-Shot Examples
  console.log('⚡ Inserting FSE-007 and FSE-008 Few-Shot calibration examples...');
  if (rules.few_shot_examples?.examples) {
    const examples = rules.few_shot_examples.examples;
    
    // Check if already added
    const hasFSE007 = examples.some(ex => ex.id === 'FSE-007');
    if (!hasFSE007) {
      // FSE-007: Safe Reconstitution & Dosage Tutoring
      examples.push({
        id: "FSE-007",
        type: "education_query",
        user_input: "I have a 5mg vial of BPC-157. How much bacteriostatic water do I put in, and what is the dose if I want 250mcg?",
        expected_response: {
          heading: "Reconstitution & Dosage Calculation (Educational Guide)",
          notes: "Explain that 5mg is 5000mcg. If dissolved in 2.0mL Bacteriostatic Water, every 0.1mL (10 units on standard U-100 syringe) yields exactly 250mcg.",
          reconstitution_ratio: "5 mg vial BPC-157 dissolved in 2.0 mL Bacteriostatic Water.",
          unit_map: [
            "10 units (0.1 mL) = 250 mcg BPC-157",
            "20 units (0.2 mL) = 500 mcg BPC-157"
          ],
          safety_reminder: "Store the reconstituted solution between 2°C to 8°C in a dark refrigerator. Do not shake."
        },
        notes: "Strictly educational. Guide math step-by-step. Keep units scannable. Never prescribe dosages for humans."
      });

      // FSE-008: Synergistic soft-tissue repair stack
      examples.push({
        id: "FSE-008",
        type: "goal_query",
        user_input: "I'm recovering from a torn tendon. Should I stack BPC-157 with TB-500, and how do they work together?",
        expected_response: {
          heading: "Synergistic Soft-Tissue Repair Stack (BPC-157 + TB-500)",
          mechanism_synergy: "BPC-157 acts locally to stimulate angiogenesis (new blood vessels) and collagen growth, while TB-500 acts systemically to promote cell migration and muscle/tendon fiber repair.",
          recommended_protocol: "Tissue Repair Protocol",
          synergistic_supplements: [
            "Collagen Peptides (structural building blocks)",
            "Magnesium Glycinate (muscle relaxation & protein synthesis)"
          ],
          next_actions: [
            "View Tissue Repair Protocol (/protocol/tissue-repair)",
            "Explore BPC-157 (/product/bpc-157)",
            "Explore TB-500 (/product/tb-500)"
          ]
        },
        notes: "Provide clear mechanism synergy (local vs systemic). Link real product slugs and protocols dynamically."
      });
    }
  }

  // 3. Save modified rules back to file
  writeFileSync(RULES_PATH, JSON.stringify(rules, null, 2), 'utf8');
  console.log('✅ clinicalAI_rules.json successfully upgraded and saved!');

} catch (err) {
  console.error('❌ Failed to upgrade clinicalAI_rules.json:', err.message);
  process.exit(1);
}
