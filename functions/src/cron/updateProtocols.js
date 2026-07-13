'use strict';
/**
 * updateProtocols.js
 *
 * Cron Job: Daily AI-Powered Protocol Enrichment
 *
 * Runs every day at 02:00 AM (Europe/London).
 * Each execution picks 1 protocol that has not been reviewed in the longest
 * time (or has never been reviewed), evaluates it against the latest
 * clinical knowledge using Gemini, and if changes are necessary, writes
 * back to Firestore with a bumped version number and a changelog entry.
 *
 * ── Design Principles ──────────────────────────────────────────────────────
 * • Firestore is the SINGLE source of truth. Local JSON bundles are only
 *   used for the initial seed import, never as authority thereafter.
 * • Only ONE protocol is evaluated per run to minimise AI costs and to
 *   stay within Cloud Function timeout limits.
 * • If Gemini determines nothing has changed the function only writes
 *   `lastVerifiedAt` — no version bump, no changelog entry.
 * • The client layer caches protocol documents (via localStorage or React
 *   Query) with a 60-minute TTL so stale data is never served to users
 *   without an internet round-trip to Firestore.
 */

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require('@google/genai');

const db = getFirestore();

// ── Gemini initialisation ─────────────────────────────────────────────────────
function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set.');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Bump the patch component of a semver-style version string.
 * "1.0" → "1.1",  "1.0.0" → "1.0.1",  undefined → "1.0.1"
 */
function bumpPatchVersion(current) {
  if (!current || typeof current !== 'string') return '1.0.1';
  const parts = current.split('.').map(Number);
  while (parts.length < 3) parts.push(0);
  parts[2] += 1;
  return parts.join('.');
}

/**
 * Build the evaluation prompt for Gemini.
 */
function buildEvaluationPrompt(protocol) {
  const summary = JSON.stringify({
    title: protocol.title || protocol.name,
    slug: protocol.slug || protocol.protocol_id,
    compounds: (protocol.compounds || protocol.drugs || []).map(c => c.name || c),
    dosing: protocol.dosing || protocol.dosage || null,
    indications: protocol.indications || null,
    contraindications: protocol.contraindications || null,
    version: protocol.version || '1.0',
  }, null, 2);

  return `You are a clinical pharmacology expert specialising in peptide therapy.
The following is a medical protocol currently stored in our clinical database.
Your task is to:
1. Evaluate whether the information is current and accurate based on your training knowledge.
2. Identify any outdated dosing recommendations, newly recognised contraindications, or safety warnings worth noting.
3. Suggest any improvements to the protocol wording for clinical clarity.

Respond ONLY with a valid JSON object in the following format (no markdown, no extra text):
{
  "changesRequired": true | false,
  "changeReason": "Short human-readable description (max 120 chars) of what was updated. Empty string if no changes.",
  "updatedFields": {
    /* Only include fields that need to be changed. Use the same keys as the input. */
    /* e.g. "dosing": "Updated dosing recommendation", "warnings": ["New warning 1"] */
  }
}

Current protocol:
${summary}`;
}

// ── Main Scheduled Function ───────────────────────────────────────────────────
exports.dailyProtocolReview = onSchedule(
  {
    schedule: '0 2 * * *',
    timeZone: 'Europe/London',
    secrets: ['GEMINI_API_KEY'],
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async (_event) => {
    console.log('[dailyProtocolReview] Starting daily protocol AI review...');

    // 1. Pick the protocol least recently verified (or never verified first)
    const protocolsRef = db.collection('protocols');

    // Try to find a protocol that has NEVER been verified
    let snap = await protocolsRef
      .where('lastVerifiedAt', '==', null)
      .orderBy('createdAt', 'asc')
      .limit(1)
      .get();

    if (snap.empty) {
      // All protocols have been verified — pick the oldest verification
      snap = await protocolsRef
        .orderBy('lastVerifiedAt', 'asc')
        .limit(1)
        .get();
    }

    if (snap.empty) {
      console.log('[dailyProtocolReview] No protocols found in Firestore. Exiting.');
      return;
    }

    const docSnap = snap.docs[0];
    const protocol = docSnap.data();
    const protocolId = docSnap.id;
    console.log(`[dailyProtocolReview] Reviewing protocol: ${protocolId} (version: ${protocol.version || 'unversioned'})`);

    // 2. Build prompt and call Gemini
    let geminiResult;
    try {
      const model = getGeminiModel();
      const prompt = buildEvaluationPrompt(protocol);
      const response = await model.generateContent(prompt);
      const rawText = response.response.text().trim();

      // Strip potential markdown code fences
      const jsonText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      geminiResult = JSON.parse(jsonText);
    } catch (err) {
      console.error('[dailyProtocolReview] Gemini call or JSON parse failed:', err.message);
      // Still update lastVerifiedAt so we don't keep retrying this protocol
      await docSnap.ref.update({ lastVerifiedAt: FieldValue.serverTimestamp() });
      return;
    }

    const { changesRequired, changeReason, updatedFields } = geminiResult;

    if (!changesRequired || !updatedFields || Object.keys(updatedFields).length === 0) {
      // No changes needed — only bump lastVerifiedAt
      console.log(`[dailyProtocolReview] Protocol ${protocolId} is up-to-date. No changes needed.`);
      await docSnap.ref.update({ lastVerifiedAt: FieldValue.serverTimestamp() });
      return;
    }

    // 3. Changes required — write updated fields + bump version + changelog
    const newVersion = bumpPatchVersion(protocol.version);

    const changelogEntry = {
      version: newVersion,
      reason: changeReason || 'AI-assisted review',
      changedFields: Object.keys(updatedFields),
      reviewedAt: new Date().toISOString(),
      source: 'gemini-daily-review',
    };

    const updatePayload = {
      ...updatedFields,
      version: newVersion,
      lastVerifiedAt: FieldValue.serverTimestamp(),
      changelog: FieldValue.arrayUnion(changelogEntry),
    };

    await docSnap.ref.update(updatePayload);

    console.log(
      `[dailyProtocolReview] ✅ Protocol ${protocolId} updated to version ${newVersion}. Reason: "${changeReason}"`
    );
  }
);
