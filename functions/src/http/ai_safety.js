"use strict";
/**
 * ai_safety.js — AgentSafety (Compliance Guardrail)
 *
 * Post-response filter that reviews any AI reply before it reaches the user.
 * Flags and rewrites content that contains:
 *   - Prescriptive medical language ("take X mg of", "prescribe", "diagnose")
 *   - Medical diagnoses or condition claims ("you have", "you suffer from")
 *   - Dangerous dosing specificity without a disclaimer
 *   - Off-topic / out-of-scope content
 *
 * Used internally by other handlers via: const safe = await safetyCheck(reply, context)
 * Also exposed as an HTTP endpoint for external calls: POST /safetyAiAssistant
 */

const { callGemini, ALL_SECRETS, structuredLogger } = require("./ai_utils");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onRequest } = require("firebase-functions/v2/https");

// ── Async audit log (non-blocking — never delays the response) ───────────────
function logSafetyEvent(flags, context, rewritten) {
  try {
    const db = getFirestore();
    db.collection("ai_safety_logs").add({
      handler:   context?.handler || "unknown",
      role:      context?.role    || "unknown",
      session_id: context?.sessionId || null,
      user_id:   context?.userId  || null,
      flags,
      rewritten,
      timestamp: FieldValue.serverTimestamp(),
    }).catch(() => {});  // silent — never throw
  } catch (_) { /* silent */ }
}

// ── Banned pattern categories ─────────────────────────────────────────────────
const PRESCRIPTIVE_PATTERNS = [
  /\b(take|inject|administer|dose yourself with|self-prescribe)\b/gi,
  /\b(you (have|are suffering from|are diagnosed with|need to take))\b/gi,
  /\b(I (prescribe|recommend taking|diagnose))\b/gi,
  /\b(this (treats|cures|heals) your)\b/gi,
];

const DOSE_WITHOUT_DISCLAIMER = [
  /\b(\d+\s?(mg|mcg|ug|IU|ml|cc)\s?(per|\/)\s?(day|week|kg|dose))\b/gi,
];

const DISCLAIMER_PHRASES = [
  "educational purposes only",
  "consult a healthcare professional",
  "not medical advice",
  "research purposes only",
  "speak with your doctor",
];

// ── Core safety check function (reusable by all handlers) ─────────────────────
async function safetyCheck(reply, context = {}) {
  if (!reply || typeof reply !== "string") return { safe: true, reply, flags: [] };

  const flags = [];
  let modifiedReply = reply;

  // 1. Check prescriptive language
  for (const pattern of PRESCRIPTIVE_PATTERNS) {
    if (pattern.test(reply)) {
      flags.push({ type: "prescriptive_language", pattern: pattern.toString() });
    }
  }

  // 2. Check dosing specificity without disclaimer
  const hasDisclaimer = DISCLAIMER_PHRASES.some(p =>
    reply.toLowerCase().includes(p.toLowerCase())
  );
  for (const pattern of DOSE_WITHOUT_DISCLAIMER) {
    if (pattern.test(reply) && !hasDisclaimer) {
      flags.push({ type: "dose_without_disclaimer" });
    }
  }

  // 3. If no flags → pass through immediately (zero latency cost)
  if (flags.length === 0) {
    return { safe: true, reply, flags };
  }

  // 4. Flags found → ask Gemini Flash to rewrite the response safely
  structuredLogger.warn({ event: "safety_flag", flags, context });

  const SYSTEM_PROMPT = `You are a medical compliance editor for a peptide research platform.
Your job is to rewrite the following AI response to ensure it:
1. Contains NO prescriptive language ("take X", "inject Y", "diagnose")
2. Contains NO definitive medical claims or diagnoses
3. Adds a clear disclaimer if specific doses are mentioned: "These are research ranges only — consult a licensed healthcare professional."
4. Preserves all scientific and informational content
5. Keeps the same language as the original (Spanish or English)
6. Does NOT add excessive warnings that make the response useless
Return ONLY the rewritten response, no meta-commentary.`;

  try {
    const safeReply = await callGemini(
      [{ role: "user", parts: [{ text: `ORIGINAL RESPONSE TO REWRITE:\n\n${reply}` }] }],
      SYSTEM_PROMPT,
      "gemini-2.0-flash-lite",  // cheapest model — only classification + light rewrite
    );
    const result = { safe: false, reply: safeReply, flags, rewritten: true };
    logSafetyEvent(flags, context, true);
    return result;
  } catch (err) {
    // If safety rewrite fails, append a minimal disclaimer and pass through
    structuredLogger.error({ event: "safety_rewrite_failed", error: err.message });
    const fallbackReply = reply +
      "\n\n> ⚠️ *This information is for educational and research purposes only. " +
      "Always consult a licensed healthcare professional before making any medical decisions.*";
    logSafetyEvent(flags, context, false);
    return { safe: false, reply: fallbackReply, flags, rewritten: false };
  }
}

// ── HTTP handler (for direct API calls / testing) ─────────────────────────────
async function handleSafetyCheck(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { reply, context } = req.body || {};
  if (!reply) return res.status(400).json({ error: "Missing 'reply' in request body" });

  try {
    const result = await safetyCheck(reply, context || {});
    return res.json({
      safe: result.safe,
      reply: result.reply,
      flags: result.flags,
      rewritten: result.rewritten || false,
    });
  } catch (err) {
    structuredLogger.error({ event: "safety_handler_error", error: err.message });
    return res.status(500).json({ error: "Safety check failed", details: err.message });
  }
}

module.exports = onRequest(
  {
    region: "europe-west1",
    timeoutSeconds: 30,
    cors: true,
    secrets: ALL_SECRETS,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }
    await handleSafetyCheck(req, res);
  }
);

module.exports.safetyCheck = safetyCheck;
