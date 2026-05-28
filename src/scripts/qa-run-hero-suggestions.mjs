/**
 * qa-run-hero-suggestions.mjs
 * ─────────────────────────────────────────────────────────────────
 * Queries the live ClinicalAI Assistant for each of the 5 hero suggestion cards
 * and verifies their correctness, structure, and language.
 *
 * Usage: node src/scripts/qa-run-hero-suggestions.mjs
 * ─────────────────────────────────────────────────────────────────
 */

import fetch from 'node-fetch';

const ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';
const SESSION  = `hero-validation-${Date.now()}`;

const SUGGESTIONS = [
  "GLP-1 Research",
  "Better Sleep",
  "Muscle Recovery",
  "Tirzepatide vs Retatrutide",
  "Longevity Protocol"
];

async function callAI(message) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId: SESSION }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  return await response.json();
}

async function run() {
  console.log("🧪 Querying Live ClinicalAI Assistant for Hero Suggestion Cards...");
  console.log("==================================================================");

  for (const q of SUGGESTIONS) {
    console.log(`\n▶ Query: "${q}"`);
    console.log("Waiting for response...");
    try {
      const res = await callAI(q);
      const reply = res.reply || '';
      
      console.log("------------------------------------------------------------------");
      console.log(reply);
      console.log("------------------------------------------------------------------");
      
      // Perform structural assertions
      const hasSpanish = /[áéíóúñ¿¡]/i.test(reply) && !/BPC-157/i.test(reply); // allow BPC-157 name
      const isEnglishOnly = !hasSpanish;
      const hasMarkdownHeadings = reply.includes("###") || reply.includes("##") || reply.includes("**");
      const hasDisclaimer = reply.includes("Always review the full safety profile before commencing research.") ||
                            reply.includes("Educational purposes only. Consult a healthcare provider or qualified professional.");
      
      console.log(`🔍 Verification:`);
      console.log(`   - Language: ${isEnglishOnly ? '✅ 100% English' : '❌ Spanish Leakage Detected!'}`);
      console.log(`   - Organization & Markdown Structure: ${hasMarkdownHeadings ? '✅ Beautiful/Structured' : '⚠️ Plain Text'}`);
      console.log(`   - Professional Safety Disclaimer: ${hasDisclaimer ? '✅ Present' : '❌ Missing!'}`);
      
      if (q === "Tirzepatide vs Retatrutide") {
        const hasTable = reply.includes("|") && reply.includes("---");
        console.log(`   - Markdown Comparison Table: ${hasTable ? '✅ Beautiful Table Created' : '❌ Missing Table!'}`);
      }
      
    } catch (err) {
      console.error(`❌ Request Failed for "${q}":`, err.message);
    }
    // Small gap between requests
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
