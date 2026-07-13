"use strict";
/**
 * ai_article.js — Article Analysis Handler
 *
 * Handles requests with message starting with "[ARTICLE_ANALYSIS]".
 * Triggered when a blog post "Ask ClinicAI Expert" button is pressed.
 * Returns: article summary + matched peptides, protocols, supplements as cards.
 *
 * Exported as a standalone Cloud Function: articleAiAssistant
 * Also exported as handleArticleAnalysis() for use by the main ai.js router.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { getFirestore } = require("firebase-admin/firestore");
const {
  ALL_SECRETS,
  structuredLogger,
  sanitizeMessage,
  CATALOG_CACHE_TTL_MS,
} = require("./ai_utils");
const utils = require("./ai_utils");

/**
 * Core article analysis handler logic.
 *
 * @param {object} params
 * @param {string}   params.message        - Sanitized message (starts with [ARTICLE_ANALYSIS])
 * @param {string}   params.sessionId
 * @param {Array}    params.activePeptides  - Pre-loaded from Firestore (may be empty)
 * @param {Array}    params.allProtocols    - Pre-loaded from Firestore (may be empty)
 * @param {boolean}  params._needsFirestore - Whether Firestore was already loaded
 * @param {object}   db                     - Firestore instance
 * @param {object}   res                    - Express response object
 */
async function handleArticleAnalysis({ message, sessionId, activePeptides = [], allProtocols = [], _needsFirestore = false }, db, res) {
  // ── Extract structured fields from the [ARTICLE_ANALYSIS] message ──────────
  const titleMatch    = message.match(/article titled "([^"]+)"/i);
  const articleTitle  = titleMatch ? titleMatch[1] : "this article";

  const kbMatch    = message.match(/ARTICLE KNOWLEDGE BASE:\s*([\s\S]*?)(?:\n---|\n\nARTICLE LINKS:|$)/i);
  const articleKB  = kbMatch ? kbMatch[1].trim() : "";

  const linksMatch     = message.match(/ARTICLE LINKS:\s*(.+)/i);
  const articleLinksRaw = linksMatch ? linksMatch[1] : "";
  const articleLinks   = articleLinksRaw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const m = s.match(/^(.+?)\s*\((.+?)\)$/);
      return m ? { label: m[1].trim(), url: m[2].trim() } : null;
    })
    .filter(Boolean);

  // ── Load catalog if not already loaded ────────────────────────────────────
  let analysisPeptides  = activePeptides;
  let analysisProtocols = allProtocols;

  if (!_needsFirestore && analysisPeptides.length === 0) {
    try {
      const now = Date.now();
      if (utils.catalogCache && now < utils.catalogCacheExpiry) {
        analysisPeptides  = utils.catalogCache.activePeptides;
        analysisProtocols = utils.catalogCache.allProtocols || [];
      } else {
        const [pSnap, prSnap] = await Promise.all([
          db.collection("products").get(),
          db.collection("protocols").where("active", "==", true).get(),
        ]);
        analysisPeptides  = pSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isActive !== false);
        analysisProtocols = prSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        utils.catalogCache = {
          allPeptides:   pSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          activePeptides: analysisPeptides,
          allProtocols:   analysisProtocols,
          clinicalRules:  utils.catalogCache?.clinicalRules || null,
        };
        utils.catalogCacheExpiry = now + CATALOG_CACHE_TTL_MS;
      }
    } catch (e) {
      structuredLogger.warn(`[articleAiAssistant] Firestore load failed: ${e.message}`);
    }
  }

  // ── Score catalog against article text ────────────────────────────────────
  const kbLower      = articleKB.toLowerCase();
  const titleLower   = articleTitle.toLowerCase();
  const combinedText = `${titleLower} ${kbLower}`;

  const scoredPeptides = analysisPeptides
    .map(p => {
      const pText = `${p.name || ""} ${p.category || ""} ${p.description || ""} ${(p.goals || []).join(" ")}`.toLowerCase();
      const score = pText.split(/\s+/).filter(w => w.length > 3 && combinedText.includes(w)).length;
      return { ...p, _score: score };
    })
    .filter(p => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3);

  const scoredProtocols = analysisProtocols
    .map(pr => {
      const prText = `${pr.title || pr.name || ""} ${pr.category || ""} ${pr.description || ""} ${(pr.goals || []).join(" ")}`.toLowerCase();
      const score = prText.split(/\s+/).filter(w => w.length > 3 && combinedText.includes(w)).length;
      return { ...pr, _score: score };
    })
    .filter(pr => pr._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 2);

  // ── Build markdown reply sections ─────────────────────────────────────────
  const peptideSection = scoredPeptides.length > 0
    ? ["", "## ⚗️ Recommended Peptides", ...scoredPeptides.map(p => `- **${p.name}** — ${p.shortDescription || p.description?.slice(0, 120) || "Research-grade peptide relevant to this topic."}`)]
    : ["", "> No exact peptide catalog matches found for this article. Ask me directly for peptide recommendations."];

  const protocolSection = scoredProtocols.length > 0
    ? ["", "## 📋 Suggested Protocols", ...scoredProtocols.map(pr => `- **${pr.title || pr.name}** — ${pr.shortDescription || pr.description?.slice(0, 100) || "Structured research protocol."}`)]
    : [];

  const supplementKeywords = ["supplement", "nmn", "nad", "vitamin", "berberine", "omega"];
  const supplementSection  = supplementKeywords.some(kw => combinedText.includes(kw))
    ? ["", "## 💊 Supplement Synergies", "- Review our supplement catalog for supplements that synergize with the peptide mechanisms discussed in this article."]
    : [];

  const articleLinkSection = articleLinks.length > 0
    ? ["", "## 🔗 Article Resources", ...articleLinks.map(l => `- [${l.label}](${l.url})`)]
    : [];

  const replyLines = [
    `## 📖 Article Summary: *${articleTitle}*`,
    "",
    articleKB
      ? articleKB.split("\n").slice(0, 8).join("\n")
      : `This article covers key scientific findings related to **${articleTitle}**. The content above highlights the primary mechanisms, biomarkers, and clinical relevance discussed in the research.`,
    "",
    "> ⚠️ Always review the full safety profile before commencing any research protocol.",
    ...peptideSection,
    ...protocolSection,
    ...supplementSection,
    ...articleLinkSection,
  ];

  // ── Build suggestion chips ────────────────────────────────────────────────
  const suggestions = [];
  articleLinks.forEach(l => {
    if (l.url.startsWith("/protocol"))     suggestions.push({ label: `📋 ${l.label}`, action: "NAVIGATE", payload: l.url });
    else if (l.url.startsWith("/product")) suggestions.push({ label: `⚗️ ${l.label}`, action: "NAVIGATE", payload: l.url });
  });
  scoredPeptides.forEach(p => {
    const slug = p.slug || p.id;
    if (slug && !suggestions.find(s => s.payload?.includes(slug)))
      suggestions.push({ label: `⚗️ ${p.name}`, action: "NAVIGATE", payload: `/product/${slug}` });
  });
  scoredProtocols.forEach(pr => {
    const slug = pr.slug || pr.id;
    if (slug && !suggestions.find(s => s.payload?.includes(slug)))
      suggestions.push({ label: `📋 ${pr.title || pr.name}`, action: "NAVIGATE", payload: `/protocol/${slug}` });
  });
  if (supplementSection.length > 0)
    suggestions.push({ label: "💊 View Supplements", action: "NAVIGATE", payload: "/catalog?category=supplements" });

  res.status(200).json({ reply: replyLines.join("\n"), suggestions: suggestions.slice(0, 6) });
}

// ── Standalone Cloud Function export ─────────────────────────────────────────
module.exports = onRequest(
  {
    region: "europe-west1",
    timeoutSeconds: 60,
    cors: true,
    secrets: ALL_SECRETS,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const { message: rawMessage, sessionId = "anonymous" } = req.body;
    const message = sanitizeMessage(rawMessage);
    if (!message || !message.startsWith("[ARTICLE_ANALYSIS]")) {
      res.status(400).json({ error: "Invalid request: message must start with [ARTICLE_ANALYSIS]" });
      return;
    }

    const db = getFirestore();
    await handleArticleAnalysis({ message, sessionId }, db, res);
  }
);

module.exports.handleArticleAnalysis = handleArticleAnalysis;
