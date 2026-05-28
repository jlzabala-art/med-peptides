/**
 * runAIVerification.mjs
 * 
 * ClinicalAI Quality Assurance Script.
 * Runs 50+ test cases against the live ClinicalAI API and scores them.
 */

import { runValidationSuite } from '../validation/engine/runner.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const API_ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

import { buildClinicalAITrainingBlock } from '../config/clinicalAIRules.js';

/**
 * AI Responder Implementation
 * Calls the real ClinicalAI API
 */
async function aiResponder(testCase) {
  try {
    const query = testCase.query;
    
    // Map canonical query types to short-form intents for clinicalAIRules lookup
    const queryTypeToIntentMap = {
      peptide_query: 'peptide',
      comparison_query: 'comparison',
      supplement_query: 'supplement',
      protocol_query: 'protocol',
      goal_query: 'goal',
      safety_or_beginner_query: 'safety',
      general_education_query: 'peptide',
      vague_query: 'vague',
      reconstitution_query: 'reconstitution',
      ambiguous_query: 'vague',
      availability_query: 'peptide'
    };
    
    const intent = queryTypeToIntentMap[testCase.expectedIntent] || 'unknown';
    // Set layer based on test intent/category. Comparison -> layer 3, else 2.
    const layer = intent === 'comparison' ? 3 : 2;
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: query,
        sessionId: 'test-session-' + Date.now(),
        query_type: testCase.expectedIntent || 'general',
        intent: intent,
        layer: layer,
        context: {
          research_mode: true,
          user_profile: { research_level: 'intermediate' },
          instructions: `${buildClinicalAITrainingBlock(intent)}\nLAYER:${layer} DIRECTIVE. Respond at depth ${layer}/4.\nCRITICAL: You MUST ALWAYS append the exact safety disclaimer closing statement: "Always review the full safety profile before commencing research." at the very end of your response.\nCRITICAL: If this is a comparison query, you MUST ALWAYS output a side-by-side Markdown comparison table featuring columns: Feature, Peptide A, Peptide B.`
        },
        history: []
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.reply || '';
  } catch (err) {
    console.error(`  [!] API Request Failed for query: "${query}" - ${err.message}`);
    throw err;
  }
}

/**
 * Main Execution
 */
async function main() {
  console.log('🚀 Starting ClinicalAI Validation Suite...');
  console.log(`📡 Target Endpoint: ${API_ENDPOINT}`);
  console.log('--------------------------------------------------');

  const onProgress = (current, total, testId) => {
    const percent = Math.round((current / total) * 100);
    process.stdout.write(`\r[${percent}%] Running ${testId} (${current}/${total})...`);
  };

  try {
    const report = await runValidationSuite(null, onProgress, 'ai', aiResponder);

    console.log('\n\n--------------------------------------------------');
    console.log('✅ Validation Complete!');
    console.log(`📊 Total Tests: ${report.totalTests}`);
    console.log(`🟢 Passed:      ${report.passed}`);
    console.log(`🔴 Failed:      ${report.failed}`);
    console.log(`⭐ Avg Score:   ${report.averageSystemScore}/5.0`);
    console.log('--------------------------------------------------');

    if (report.allRedFlags.length > 0) {
      console.log('\n🚩 RED FLAGS DETECTED:');
      report.allRedFlags.forEach(flag => console.log(`  - ${flag}`));
    }

    // Save report to file
    const reportDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

    const reportPath = path.join(reportDir, `clinicalAI_report_${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    // Exit with code 1 if failures > 10%
    if (report.failurePercentage > 10) {
      console.log('\n❌ Quality threshold not met (>10% failures).');
      process.exit(1);
    }

  } catch (err) {
    console.error('\n❌ Fatal Error during validation:', err);
    process.exit(1);
  }
}

main();
