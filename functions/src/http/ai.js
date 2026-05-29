"use strict";
/**
 * ai.js — Clinical AI Assistant: main router + RAG handler.
 *
 * Phase 4 refactor: shared utilities have been extracted to ai_utils.js.
 * Specialized handlers are delegated to ai_prescription.js and ai_article.js.
 * This file handles: rate limiting, cache, early-intent, RAG/Gemini path.
 */

const { onRequest }  = require("firebase-functions/v2/https");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { loadClinicalRules } = require("../utils/rules_loader");
const {
  STOP_WORDS,
  INTENT_MAP,
  META_INTENT_MAP,
  BEGINNER_SIGNALS,
  PROFESSIONAL_SIGNALS,
  ES_EN_SYNONYMS,
} = require("../utils/constants");

// ── Shared utilities (Phase 4 extraction) ────────────────────────────────────
const utils = require("./ai_utils");
const {
  ALL_SECRETS,
  structuredLogger,
  sanitizeMessage,
  timedCall,
  callCloudAgent,
  callGemini,
  callGeminiWithTools,
  callVertexAgent,
  searchPubMed,
  detectUserLevel,
  CATALOG_CACHE_TTL_MS,
} = utils;

// ── Admin AI function calling ───────────────────────────────────────────────
const {
  ADMIN_TOOLS,
  WRITE_FUNCTIONS,
  executeReadOnlyFunction,
  executeWriteFunction,
} = require("./ai_admin_functions");

// ── Specialized handler delegates (Phase 4 extraction) ───────────────────────
const { handlePrescriptionIntake } = require("./ai_prescription");
const { handleArticleAnalysis }    = require("./ai_article");

// ── Module-level catalog cache (shared via utils) ─────────────────────────────
// Accessed as utils.catalogCache / utils.catalogCacheExpiry throughout this file

module.exports = onRequest(
  {
    region: "europe-west1",
    timeoutSeconds: 120,
    cors: true,
    secrets: ALL_SECRETS,
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    const { message: rawMessage, sessionId = "anonymous", query_type, clinicAIConfig, context: reqContext, history = [], execute_pending, pdfBase64 } = req.body;
    const message = sanitizeMessage(rawMessage);
    if (!message) {
      res.status(400).json({ error: "Empty message" });
      return;
    }

    try {
      const db = getFirestore();

      // ── RATE LIMIT GUARDRAIL ──────────────────────────────────────────────
      // Limits: unauthenticated → 5 queries/24h | professional/registered → 50/24h
      // Dev bypass: send header X-Dev-Bypass: true to skip limits during testing
      const isDevBypass = req.headers['x-dev-bypass'] === 'true';
      const isAdminUser = reqContext?.instructions?.includes("ADMIN MODE ACTIVE") || reqContext?.user_profile?.role === 'admin';

      if (!isDevBypass && !isAdminUser) {
        try {
          // Determine if user is authenticated (uid embedded in sessionId or passed via context)
          const isAuthenticated = !!(reqContext?.user_profile?.uid || sessionId.startsWith('uid_'));
          const isProfUser = !!(reqContext?.user_profile?.role === 'researcher' || reqContext?.user_profile?.isProfessional);
          const rateLimit = isProfUser ? 50 : isAuthenticated ? 20 : 5;

          const rateLimitRef = db.collection("sessions_rate_limit").doc(sessionId);
          const limitDoc = await rateLimitRef.get();
          let queryCount = 0;
          const nowMs = Date.now();

          if (limitDoc.exists) {
            const data = limitDoc.data();
            const resetAt = data.resetAt?.toMillis?.() || 0;
            if (nowMs > resetAt) {
              // Reset window
              queryCount = 1;
              await rateLimitRef.set({
                count: 1,
                resetAt: new Date(nowMs + 24 * 60 * 60 * 1000)
              });
            } else {
              // Increment count
              queryCount = (data.count || 0) + 1;
              await rateLimitRef.update({
                count: FieldValue.increment(1)
              });
            }
          } else {
            queryCount = 1;
            await rateLimitRef.set({
              count: 1,
              resetAt: new Date(nowMs + 24 * 60 * 60 * 1000)
            });
          }

          structuredLogger.info(`[clinicalAiAssistant] Rate check: ${queryCount}/${rateLimit} queries (auth=${isAuthenticated}, professional=${isProfUser})`, { sessionId });

          if (queryCount > rateLimit) {
            structuredLogger.warn(`[clinicalAiAssistant] Session ${sessionId} hit rate limit: ${queryCount}/${rateLimit} queries in 24h`);

            // Different message depending on whether user is registered or not
            const limitReply = isAuthenticated
              ? `Has superado tu límite de **${rateLimit} consultas** de investigación en las últimas 24 horas. Tu límite se restablecerá automáticamente mañana. Si necesitas asistencia urgente, contáctanos directamente.`
              : `Has alcanzado el límite de **${rateLimit} consultas gratuitas** por sesión en 24 horas.\n\n🎁 **¿Sabías que registrándote obtienes 20 consultas diarias?** Los investigadores profesionales verificados tienen acceso a 50 consultas/día. El registro es gratuito y tarda menos de 1 minuto.`;

            res.status(200).json({
              reply: limitReply,
              suggestions: isAuthenticated
                ? [
                    { label: "💬 Contactar por WhatsApp", action: "URL", payload: "https://wa.me/971564179256" },
                    { label: "✉️ Soporte por Email", action: "URL", payload: "mailto:support@med-peptides.com" },
                    { label: "🛍️ Ver Catálogo", action: "NAVIGATE", payload: "/catalog" }
                  ]
                : [
                    { label: "📝 Crear Cuenta Gratis", action: "NAVIGATE", payload: "/register" },
                    { label: "🔑 Iniciar Sesión", action: "NAVIGATE", payload: "/login" },
                    { label: "🛍️ Ver Catálogo", action: "NAVIGATE", payload: "/catalog" }
                  ],
              rateLimited: true,
              rateLimitInfo: { current: queryCount, limit: rateLimit, authenticated: isAuthenticated }
            });
            return;
          }
        } catch (rateLimitErr) {
          // On error, allow the request through (fail open) to avoid blocking users
          structuredLogger.error(rateLimitErr, "[clinicalAiAssistant] Rate limit check error (allowing request):");
        }
      } else {
        structuredLogger.info(`[clinicalAiAssistant] Dev bypass active — rate limit skipped`, { sessionId });
      }
      

      // ── PRESCRIPTION INTAKE HANDLER ──
      if (query_type === "prescription_intake") {
        structuredLogger.info(`[clinicalAiAssistant] Handling prescription intake request for session: ${sessionId}`);
        try {
          let allPeptides = [], activePeptides = [];
          const now = Date.now();
          if (catalogCache && now < catalogCacheExpiry) {
            allPeptides = catalogCache.allPeptides;
            activePeptides = catalogCache.activePeptides;
          } else {
            const productsSnap = await db.collection("products").get();
            allPeptides = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            activePeptides = allPeptides.filter(p => p.isActive === true);
            catalogCache = {
              allPeptides,
              activePeptides,
              allProtocols: catalogCache?.allProtocols || [],
              clinicalRules: catalogCache?.clinicalRules || null
            };
            catalogCacheExpiry = now + CATALOG_CACHE_TTL_MS;
          }

          const catalogContext = activePeptides.map(p => {
            return `- Name: "${p.displayName || p.name}"\n  ID: "${p.slug || p.id}"\n  Strengths/Dosages: "${p.standard_dosage || 'N/A'}"\n  Category: "${p.category || 'Peptides'}"`;
          }).join('\n');

          const systemInstruction = `
You are the Atlas Health Prescription Ingestion Agent.
Your job is to analyze the medical prescription text provided by the user, match items against the available catalog of commercial products, and classify the remaining items as custom compounded formulations.

The available catalog products are:
${catalogContext}

For each line or compound in the prescription:
1. Try to find a match in the available catalog of commercial products.
   - If you find an exact or very close match (checking synonyms, spelling variations, names, or active ingredients), list it under "catalog".
   - You MUST include:
     - "name": The matched catalog product name.
     - "product": An object with "id" containing the catalog product's id (or slug).
     - "strength": The dosage/strength found in the prescription.
     - "quantity": The quantity requested in the prescription (e.g. "5 vials", "1 unit").
     - "category": "Category A (Direct Match)" or "Category B (Catalog Synonym)".

2. If the item is NOT found in the catalog (e.g., custom combination, different dosage form, different strength, or not present at all):
   - Classify it as a custom compounded formulation, and list it under "quotation".
   - You MUST extract or structure:
     - "name": A descriptive name for the custom compounded formula (e.g. "Caffeine + Theanine capsules").
     - "actives": An array of active ingredients with their concentrations, e.g. [{"active": "Caffeine", "concentration": "100mg"}, {"active": "Theanine", "concentration": "200mg"}].
     - "vehicle": The vehicle or delivery form, e.g. "Capsules", "Injectable Vial", "Topical Cream", "Nasal Spray", etc. (infer from the text, defaults to "Capsules" or "Injectable Vial").
     - "volume": The volume or quantity requested, e.g. "30 capsules", "50ml", etc.
     - "specialInstructions": Any special dosage or application instructions found in the text.

3. Generate safety, compliance, or compounding feasibility warnings under "warnings".
   - Provide warnings about concentration checks, compounding laboratory approval requirements, regulatory compliance, or supply requirements.

You must output ONLY a valid JSON object matching this schema (do NOT wrap it in markdown code blocks, do not include any extra text outside the JSON):
{
  "catalog": [
    {
      "name": "BPC-157 5mg Vial",
      "product": { "id": "bpc-157-5mg-vial" },
      "strength": "5mg",
      "quantity": "5 vials",
      "category": "Category A (Direct Match)"
    }
  ],
  "quotation": [
    {
      "name": "Caffeine 100mg + Theanine 200mg Capsules",
      "actives": [
        { "active": "Caffeine", "concentration": "100mg" },
        { "active": "Theanine", "concentration": "200mg" }
      ],
      "vehicle": "Capsules",
      "volume": "30 capsules",
      "specialInstructions": "Take one capsule daily in the morning."
    }
  ],
  "warnings": [
    "Custom compounded formulations require validation and approval from the compounding lab before fulfillment."
  ]
}
`;

          const contents = [
            {
              role: 'user',
              parts: [{ text: `Prescription Text to analyze:\n"${message}"` }]
            }
          ];

          let reply;
          try {
            reply = await timedCall('prescription_cloudAgent', () => callCloudAgent(contents, systemInstruction, "gemini-2.5-flash", "application/json"));
            structuredLogger.info(`[clinicalAiAssistant] Successfully called Cloud Agent proxy for prescription intake`);
          } catch (agentErr) {
            structuredLogger.warn(`[clinicalAiAssistant] Cloud Agent proxy failed for prescription intake, falling back to direct Gemini API:`, agentErr.message);
            reply = await timedCall('prescription_gemini_direct', () => callGemini(contents, systemInstruction, "gemini-2.5-flash", "application/json"));
          }

          let parsed;
          try {
            parsed = JSON.parse(reply);
          } catch (jsonErr) {
            structuredLogger.error(`[clinicalAiAssistant] Failed to parse JSON reply from Gemini:`, reply, jsonErr);
            parsed = {
              catalog: [],
              quotation: [
                {
                  name: "Unparsed Formulation",
                  actives: [{ active: message, concentration: "N/A" }],
                  vehicle: "Capsules",
                  volume: "1 unit",
                  specialInstructions: "Failed to parse automatically. Manual review required."
                }
              ],
              warnings: ["System was unable to automatically structure the prescription details. Manual review required."]
            };
          }

          // Log this request in clinical_logs
          try {
            await db.collection("clinical_logs").add({
              sessionId,
              userQuery: `[Prescription Intake] ${message.slice(0, 100)}`,
              aiReply: JSON.stringify(parsed),
              timestamp: FieldValue.serverTimestamp(),
              isHighValue: true
            });
          } catch (e) {}

          res.status(200).json(parsed);
          return;
        } catch (err) {
          structuredLogger.error(`[clinicalAiAssistant] Prescription intake fatal error:`, err);
          res.status(500).json({ error: "Failed to process prescription" });
          return;
        }
      }

      const rawQuery = message.toLowerCase().trim();
      const query = rawQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      let expandedQuery = query;
      for (const [es, en] of Object.entries(ES_EN_SYNONYMS)) {
        if (expandedQuery.includes(es)) {
          expandedQuery = expandedQuery.replace(new RegExp(es, "g"), `${es} ${en}`);
        }
      }

      const tokens = expandedQuery.split(/\s+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));
      structuredLogger.info(`[clinicalAiAssistant] Processing query: "${message}"`, { sessionId, query_type });
      const CACHE_VERSION = "v11"; // Bumped: educational handler, _isEducational guard, contact fix
      const CACHE_TTL_MS = 60 * 60 * 1000;
      const cacheKey = `${CACHE_VERSION}:${query.slice(0, 250)}`;
      const cacheDocId = Buffer.from(cacheKey).toString("base64")
        .replace(/\//g, "_")
        .replace(/\+/g, "-")
        .replace(/=/g, "")
        .slice(0, 200);
      const cacheRef = db.collection("ai_response_cache").doc(cacheDocId);

      try {
        const cacheSnap = await cacheRef.get();
        if (cacheSnap.exists) {
          const cached = cacheSnap.data();
          const age = Date.now() - (cached.cachedAt?.toMillis?.() || 0);
          if (age < CACHE_TTL_MS) {
            structuredLogger.info(`[clinicalAiAssistant] Cache HIT`, { sessionId, cacheKey });
            res.status(200).json({ reply: cached.reply, suggestions: cached.suggestions || [], fromCache: true });
            return;
          }
        }
      } catch (e) {}

      // ── EARLY INTENT DETECTION — skip Firestore for known fast-path queries ──
      // These handlers return immediately without any Firestore reads, preventing
      // timeouts and 500 errors on pricing/shipping/contact/lifestyle queries.

      // Compound keywords to bypass early static handlers
      const COMPOUND_KEYWORDS = [
        "bpc-157", "bpc157", "tb-500", "tb500", "cjc-1295", "cjc1295", "ipamorelin", "semax", "selank",
        "tesamorelin", "sermorelin", "epithalon", "epitalon", "retatrutide", "tirzepatide", "semaglutide",
        "ghk-cu", "ghkcu", "mots-c", "motsc", "ss-31", "ss31", "ara-290", "ara290", "pinealon", "dsip",
        "kpv", "nmn", "berberine", "berberina", "nad", "dihexa", "follistatin", "fst", "myostatin",
        "kisspeptin", "thymosin", "ta1", "ll-37", "ll37", "resveratrol", "spermidine", "creatine",
        "coq10", "biotin", "magnesium", "ashwagandha", "dhea", "zinc", "copper", "cobre", "water", 
        "bacteriostatic", "syringe", "jeringa", "glow", "klow", "prostamax", "testagen", "thymagen", 
        "cardiogen", "cartalax", "pe-22", "pe22", "melanotan", "mt2", "mt-2", "bremelanotide", "pt-141",
        "pt141", "pnc-27", "pnc27", "snap-8", "snap8", "thymulin", "timulina", "igf-1", "igf1", "mgf",
        "mk-677", "mk677", "hgh", "hcg", "hmg", "ghrp"
      ];
      const hasCompoundKeyword = COMPOUND_KEYWORDS.some(word => query.includes(word));

      // Educational guard: queries starting with "what is", "explain", "why does" etc.
      // are definitionally educational and must NOT be misrouted to lifestyle/contact handlers.
      const _isEducational = /^(what is|what are|explain|why do|why does|how does|how do|define|tell me about|describe)/i.test(query) || query.includes("in simple terms") || query.includes("for beginners") || query.includes("like i");

      // Check if user is currently viewing a product/supplement/protocol detail page
      const isPageContextActive = !!(reqContext?.page_context?.activeEntityData);

      const _isPricing = !isAdminUser && !hasCompoundKeyword && !isPageContextActive && /\b(precio|precios|cuesta|cuestan|cuanto|cost|costs|costing|price|prices|pricing|comprar|buy|buying|wholesale|discount|discounts|cotizacion|how much)\b/i.test(query);
      const _isShipping = !isAdminUser && !hasCompoundKeyword && !isPageContextActive && /\b(envio|envios|shipping|delivery|deliveries|logistica|entrega|entregas|plazo|plazos|transit|tracking|seguimiento|customs|aduana|aduanas|how long|cuando llega|cuanto tarda)\b/i.test(query);

      // Contact: require explicit contact intent signals. "support" alone is too ambiguous
      // (e.g. "mitochondrial support", "immune support"). Require a second contact signal.
      const _hasExplicitContact = /\b(whatsapp|email|emails|correo|correos|telefono|telefonos|contacto|contactos|soporte|talk to a human|speak to|hablar con|talk to someone|human agent|customer service)\b/i.test(query);
      const _isContact = !isAdminUser && !hasCompoundKeyword && !isPageContextActive && !_isEducational && _hasExplicitContact;

      // Lifestyle: only trigger for clearly goal-oriented queries, not educational ones.
      // "What is metabolic priming?" is educational. "I want metabolic support" is lifestyle.
      const _isLifestyle = !isAdminUser && !hasCompoundKeyword && !isPageContextActive && !_isEducational && (
        /\b(muscle|growth|recupera\w*|muscul\w*)\b/i.test(query) ||
        /\b(fat|metabolic\w*|grasa|peso|metabolica\w*)\b/i.test(query) ||
        /\b(cognitive|focus|cognit\w*|cerebr\w*|foco|concentra\w*)\b/i.test(query) ||
        /\b(longevity|longev\w*|reparac\w*|longevidad)\b/i.test(query) ||
        /\b(hormon\w*|vitality|vitalidad)\b/i.test(query) ||
        /\b(skin|hair|piel|cabell\w*)\b/i.test(query) ||
        /\b(immune|inmune|defens\w*)\b/i.test(query) ||
        /\b(sleep|sueño|dormir|insom\w*|circadian)\b/i.test(query)
      );

      // Only fetch Firestore for actual peptide/protocol search queries
      const _needsFirestore = !isAdminUser && !_isPricing && !_isShipping && !_isContact && !_isLifestyle;

      let allPeptides = [];
      let activePeptides = [];
      let allProtocols = [];
      let clinicalRules = null;
      const now = Date.now();

      if (_needsFirestore) {
        if (utils.catalogCache && now < utils.catalogCacheExpiry) {
          allPeptides    = utils.catalogCache.allPeptides;
          activePeptides = utils.catalogCache.activePeptides;
          allProtocols   = utils.catalogCache.allProtocols;
          clinicalRules  = utils.catalogCache.clinicalRules;
          structuredLogger.info(`[clinicalAiAssistant] Using valid module-level catalog cache for clinical context.`);
        } else {
          structuredLogger.info(`[clinicalAiAssistant] Cache miss/expired. Fetching fresh clinical context from Firestore...`);
          const [productsSnap, protocolsSnap, _rules] = await Promise.all([
            db.collection("products").get(),
            db.collection("protocols").where("active", "==", true).get(),
            loadClinicalRules(),
          ]);
          allPeptides    = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          activePeptides = allPeptides.filter(p => p.isActive === true);
          allProtocols   = protocolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          clinicalRules  = _rules;
          
          utils.catalogCache = { allPeptides, activePeptides, allProtocols, clinicalRules };
          utils.catalogCacheExpiry = now + CATALOG_CACHE_TTL_MS;
          structuredLogger.info(`[clinicalAiAssistant] Refreshed in-memory catalog cache successfully.`);
        }
      }


      if (query.length < 80) {
        for (const meta of META_INTENT_MAP) {
          if (meta.phrases.some(p => query.includes(p))) {
            res.status(200).json({ reply: meta.reply });
            return;
          }
        }
      }

      // ── ARTICLE ANALYSIS HANDLER ───────────────────────────────────────────────
      // Triggered when the blog post "Ask ClinicAI Expert" button is pressed.
      // Returns: article summary + matched peptides, protocols, supplements as cards.
      if (message.startsWith("[ARTICLE_ANALYSIS]")) {
        // Extract the article title from the structured query
        const titleMatch = message.match(/article titled "([^"]+)"/i);
        const articleTitle = titleMatch ? titleMatch[1] : "this article";

        // Extract the embedded aiContent knowledge base
        const kbMatch = message.match(/ARTICLE KNOWLEDGE BASE:\s*([\s\S]*?)(?:\n---|\n\nARTICLE LINKS:|$)/i);
        const articleKB = kbMatch ? kbMatch[1].trim() : "";

        // Extract article links if present
        const linksMatch = message.match(/ARTICLE LINKS:\s*(.+)/i);
        const articleLinksRaw = linksMatch ? linksMatch[1] : "";

        // Parse article links into [{label, url}] pairs
        const articleLinks = articleLinksRaw
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)
          .map(s => {
            const m = s.match(/^(.+?)\s*\((.+?)\)$/);
            return m ? { label: m[1].trim(), url: m[2].trim() } : null;
          })
          .filter(Boolean);

        // Score Firestore peptides against article keywords
        const kbLower = articleKB.toLowerCase();
        const titleLower = articleTitle.toLowerCase();
        const combinedText = `${titleLower} ${kbLower}`;

        // Build peptide suggestions from Firestore (already loaded if _needsFirestore)
        // If Firestore wasn't loaded, load now (article_analysis always needs it)
        let analysisPeptides = activePeptides;
        let analysisProtocols = allProtocols;
        if (!_needsFirestore && analysisPeptides.length === 0) {
          try {
            const [pSnap, prSnap] = await Promise.all([
              db.collection("products").get(),
              db.collection("protocols").where("active", "==", true).get(),
            ]);
            analysisPeptides = pSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.isActive !== false);
            analysisProtocols = prSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          } catch(e) {
            structuredLogger.warn(`[ARTICLE_ANALYSIS] Firestore load failed:`, e.message);
          }
        }

        // Score peptides by keyword overlap with article text
        const scoredPeptides = analysisPeptides
          .map(p => {
            const pText = `${(p.name||"")} ${(p.category||"")} ${(p.description||"")} ${(p.goals||[]).join(" ")}`.toLowerCase();
            const score = pText.split(/\s+/).filter(w => w.length > 3 && combinedText.includes(w)).length;
            return { ...p, _score: score };
          })
          .filter(p => p._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 3);

        // Score protocols by keyword overlap
        const scoredProtocols = analysisProtocols
          .map(pr => {
            const prText = `${(pr.title||pr.name||"")} ${(pr.category||"")} ${(pr.description||"")} ${(pr.goals||[]).join(" ")}`.toLowerCase();
            const score = prText.split(/\s+/).filter(w => w.length > 3 && combinedText.includes(w)).length;
            return { ...pr, _score: score };
          })
          .filter(pr => pr._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 2);

        // Build the markdown reply
        const peptideSection = scoredPeptides.length > 0
          ? ["", "## ⚗️ Recommended Peptides", ...scoredPeptides.map(p => `- **${p.name}** — ${p.shortDescription || p.description?.slice(0,120) || "Research-grade peptide relevant to this topic."}`)]
          : ["", "> No exact peptide catalog matches found for this article. Ask me directly for peptide recommendations."];

        const protocolSection = scoredProtocols.length > 0
          ? ["", "## 📋 Suggested Protocols", ...scoredProtocols.map(pr => `- **${pr.title || pr.name}** — ${pr.shortDescription || pr.description?.slice(0,100) || "Structured research protocol."}`)]
          : [];

        const supplementSection = combinedText.includes("supplement") || combinedText.includes("nmn") || combinedText.includes("nad") || combinedText.includes("vitamin") || combinedText.includes("berberine") || combinedText.includes("omega")
          ? ["", "## 💊 Supplement Synergies", "- Review our supplement catalog for supplements that synergize with the peptide mechanisms discussed in this article."]
          : [];

        // Article links from the blog post itself
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

        // Build suggestion chips: article links + peptides + protocols
        const suggestions = [];
        articleLinks.forEach(l => {
          if (l.url.startsWith("/protocol")) suggestions.push({ label: `📋 ${l.label}`, action: "NAVIGATE", payload: l.url });
          else if (l.url.startsWith("/product")) suggestions.push({ label: `⚗️ ${l.label}`, action: "NAVIGATE", payload: l.url });
        });
        scoredPeptides.forEach(p => {
          const slug = p.slug || p.id;
          if (slug && !suggestions.find(s => s.payload?.includes(slug))) {
            suggestions.push({ label: `⚗️ ${p.name}`, action: "NAVIGATE", payload: `/product/${slug}` });
          }
        });
        scoredProtocols.forEach(pr => {
          const slug = pr.slug || pr.id;
          if (slug && !suggestions.find(s => s.payload?.includes(slug))) {
            suggestions.push({ label: `📋 ${pr.title || pr.name}`, action: "NAVIGATE", payload: `/protocol/${slug}` });
          }
        });
        if (supplementSection.length > 0) {
          suggestions.push({ label: "💊 View Supplements", action: "NAVIGATE", payload: "/catalog?category=supplements" });
        }

        const finalReply = replyLines.join("\n");
        res.status(200).json({ reply: finalReply, suggestions: suggestions.slice(0, 6) });
        return;
      }

      // Provides rich, structured educational responses for common conceptual queries
      // that don't map to specific peptide searches but deserve informative answers.
      const EDUCATIONAL_CONCEPTS = [
        {
          phrases: ["metabolic priming", "what is metabolic priming", "priming metabolico"],
          reply: [
            `# 🔬 What Is Metabolic Priming?`,
            ``,
            `**Metabolic priming** refers to the preparatory phase of a metabolic research protocol in which foundational peptides or supplements are introduced at low doses to sensitize cellular receptor pathways before advancing to the primary intervention.`,
            ``,
            `### 🧬 Key Mechanisms`,
            `- **Insulin Sensitization:** Improving peripheral glucose uptake efficiency before introducing GLP-1 agonists.`,
            `- **AMPK Pathway Activation:** Upregulating AMP-activated protein kinase signaling to enhance mitochondrial biogenesis readiness.`,
            `- **Receptor Density Normalization:** Allowing GLP-1, GIP, and glucagon receptor expression to stabilize before full-dose research begins.`,
            ``,
            `### 📋 In Protocol Context`,
            `Most metabolic protocols include a 2–4 week priming phase using baseline cofactors (Berberine, EGCG, Magnesium) before introducing primary peptides.`,
            ``,
            `> **Research Note:** This approach minimizes adaptation lag and improves the quality of downstream data.`,
            ``,
            `Always review the full safety profile before commencing research.`
          ].join("\n"),
          suggestions: [
            { label: "🔬 Explore Metabolic Pathways", action: "NAVIGATE", payload: "/catalog?goal=metabolic" },
            { label: "📋 View Metabolic Protocols", action: "NAVIGATE", payload: "/protocols" }
          ]
        },
        {
          phrases: ["mitochondrial support", "what is mitochondrial support", "soporte mitocondrial"],
          reply: [
            `# ⚡ What Is Mitochondrial Support?`,
            ``,
            `**Mitochondrial support** in biological research refers to peptides, supplements, and protocols that target mitochondrial function, biogenesis, membrane integrity, and energy production efficiency.`,
            ``,
            `### 🧬 Key Research Areas`,
            `- **Mitochondrial Biogenesis:** Stimulating the production of new mitochondria via PGC-1α activation (MOTS-C, NAD⁺ precursors).`,
            `- **Electron Transport Chain:** Supporting the efficiency of oxidative phosphorylation for ATP synthesis.`,
            `- **ROS Mitigation:** Reducing reactive oxygen species to prevent mitochondrial membrane damage.`,
            ``,
            `### 🔬 Commonly Researched Peptides`,
            `- **MOTS-C:** A mitochondria-derived peptide regulating metabolic homeostasis and exercise adaptation.`,
            `- **NMN / NR:** NAD⁺ precursors that fuel the sirtuin pathway and mitochondrial repair cascades.`,
            `- **5-Amino-1MQ:** A selective NNMT inhibitor that redirects cellular energy toward mitochondrial oxidation.`,
            ``,
            `Always review the full safety profile before commencing research.`
          ].join("\n"),
          suggestions: [
            { label: "🧬 Research MOTS-C", action: "NAVIGATE", payload: "/peptides/mots-c" },
            { label: "💊 View Longevity Supplements", action: "NAVIGATE", payload: "/catalog?category=supplements" }
          ]
        },
        {
          phrases: ["circadian optimization", "what is circadian", "circadian rhythm", "ritmo circadiano"],
          reply: [
            `# 🌙 What Is Circadian Optimization?`,
            ``,
            `**Circadian optimization** refers to aligning biological peptide timing with the body's 24-hour endogenous clock to maximize efficacy and minimize interference with natural hormonal cycles.`,
            ``,
            `### 🕐 Why Timing Matters in Research`,
            `- **Growth Hormone Secretagogues** (Ipamorelin, CJC-1295) are most effective when administered before sleep to align with the natural pulsatile GH release during deep sleep phases.`,
            `- **Cortisol-modulating peptides** are typically timed to the morning cortisol awakening response.`,
            `- **NAD⁺ precursors** (NMN) show enhanced mitochondrial uptake when administered in the morning.`,
            ``,
            `### 🔬 Peptides Commonly Explored`,
            `- **DSIP (Delta Sleep-Inducing Peptide):** A neuropeptide researched for its role in slow-wave sleep induction.`,
            `- **Epitalon:** Researched for regulation of melatonin production and circadian phase reset.`,
            `- **Ipamorelin:** Growth hormone secretagogue with circadian-sensitive administration windows.`,
            ``,
            `Always review the full safety profile before commencing research.`
          ].join("\n"),
          suggestions: [
            { label: "🌙 Sleep & Recovery Optimization Path", action: "MESSAGE", payload: "I want to research peptides for sleep and circadian optimization" },
            { label: "🧬 View Longevity Protocols", action: "NAVIGATE", payload: "/protocols" }
          ]
        },
        {
          phrases: ["protocol washout", "what is washout", "washout period", "periodo de descanso"],
          reply: [
            `# 🔄 What Is Protocol Washout?`,
            ``,
            `A **washout period** is a planned interval of complete peptide discontinuation between research cycles. It allows receptor sensitivity to reset, accumulated biomarkers to clear, and baseline physiological state to be re-established before beginning the next phase.`,
            ``,
            `### 📋 Purpose of Washout`,
            `- **Receptor Downregulation Prevention:** Prevents tachyphylaxis (diminishing response) from continuous receptor stimulation.`,
            `- **Baseline Re-establishment:** Allows researchers to compare pre/post measurements accurately.`,
            `- **Peptide Clearance:** Ensures complete elimination before introducing new peptides or protocols.`,
            ``,
            `### ⏱️ Typical Washout Durations`,
            `| Peptide/Product Type | Typical Washout |`,
            `| :--- | :--- |`,
            `| Short peptides (BPC-157, TB-500) | 2–4 weeks |`,
            `| GH secretagogues (Ipamorelin/CJC) | 4–8 weeks |`,
            `| GLP-1 agonists (Semaglutide) | 4–6 weeks |`,
            `| Longevity peptides (Epitalon) | 3–6 months |`,
            ``,
            `Always review the full safety profile before commencing research.`
          ].join("\n"),
          suggestions: [
            { label: "📋 Browse Research Protocols", action: "NAVIGATE", payload: "/protocols" },
            { label: "📚 Visit Academy", action: "NAVIGATE", payload: "/academy" }
          ]
        },
        {
          phrases: ["goals and categories", "goals vs categories", "difference between goals", "goals or categories", "metas y categorias"],
          reply: [
            `# 🗂️ Goals vs. Categories — What's the Difference?`,
            ``,
            `Understanding the distinction between **Research Goals** and **Product Categories** helps you navigate the Atlas Health catalog more effectively.`,
            ``,
            `### 🎯 Research Goals`,
            `Goals represent the **desired biological outcome** you are researching:`,
            `- Muscle Growth & Recovery`,
            `- Fat Loss & Metabolic Health`,
            `- Cognitive Performance & Focus`,
            `- Longevity & Biological Repair`,
            `- Hormonal Optimization`,
            `- Skin, Hair & Cellular Repair`,
            `- Immune & Inflammatory Support`,
            ``,
            `### 📁 Product Categories`,
            `Categories describe **what the peptide or product is**:`,
            `- **Peptides** — Short amino acid chains with targeted biological activity`,
            `- **Supplements** — Non-peptide cofactors (NMN, Berberine, EGCG, etc.)`,
            `- **Protocols** — Multi-peptide structured research plans with phased timelines`,
            ``,
            `### 🔗 The Relationship`,
            `A single product can belong to **multiple goals** simultaneously. For example, BPC-157 supports both *Muscle Recovery* and *Immune & Inflammatory Support*, while GHK-Cu applies to both *Skin Repair* and *Longevity*.`,
            ``,
            `Always review the full safety profile before commencing research.`
          ].join("\n"),
          suggestions: [
            { label: "🛍️ Browse by Goal", action: "NAVIGATE", payload: "/catalog" },
            { label: "📋 View All Protocols", action: "NAVIGATE", payload: "/protocols" }
          ]
        },
        {
          phrases: ["biological optimization", "what is biological optimization", "optimizacion biologica"],
          reply: [
            `# 🧬 What Is Biological Optimization?`,
            ``,
            `**Biological optimization** is the systematic research approach of using evidence-based peptides, protocols, and lifestyle interventions to enhance specific physiological functions toward their optimal operating range.`,
            ``,
            `### 🔬 Key Research Domains`,
            `- **Metabolic Efficiency:** Improving insulin sensitivity, mitochondrial output, and energy substrate utilization.`,
            `- **Tissue Repair & Regeneration:** Accelerating healing cascades in musculoskeletal and connective tissue.`,
            `- **Cognitive Performance:** Enhancing neuroplasticity, BDNF expression, and neurotransmitter balance.`,
            `- **Longevity Pathways:** Activating sirtuins, telomerase, and autophagy for cellular longevity.`,
            `- **Hormonal Balance:** Supporting endogenous hormone synthesis and receptor sensitivity.`,
            ``,
            `### 🧭 Where to Start`,
            `The most effective starting point depends on your primary research priority. Explore our **7 Optimization Paths** to find the most relevant peptides, protocols, and supplements for your research goal.`,
            ``,
            `Always review the full safety profile before commencing research.`
          ].join("\n"),
          suggestions: [
            { label: "🎯 Explore Optimization Paths", action: "NAVIGATE", payload: "/" },
            { label: "📚 Visit the Academy", action: "NAVIGATE", payload: "/academy" },
            { label: "🛍️ Browse Catalog", action: "NAVIGATE", payload: "/catalog" }
          ]
        }
      ];

      for (const concept of EDUCATIONAL_CONCEPTS) {
        if (concept.phrases.some(p => query.includes(p))) {
          // Cache this educational response
          try {
            await cacheRef.set({ reply: concept.reply, suggestions: concept.suggestions, cachedAt: FieldValue.serverTimestamp() });
          } catch (e) {}
          res.status(200).json({ reply: concept.reply, suggestions: concept.suggestions, queryType: "educational_concept" });
          return;
        }
      }


      // Combine current query with recent user queries from history to carry context for entity matching
      let searchSourceText = query;
      let searchTokens = [...tokens];
      if (Array.isArray(history) && history.length > 0) {
        const recentUserQueries = history
          .filter(h => h.role === 'user')
          .slice(-2)
          .map(h => h.content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
        if (recentUserQueries.length > 0) {
          searchSourceText = `${query} ${recentUserQueries.join(' ')}`;
          recentUserQueries.forEach(uq => {
            uq.split(/\s+/).forEach(t => {
              if (t.length >= 3 && !STOP_WORDS.has(t) && !searchTokens.includes(t)) {
                searchTokens.push(t);
              }
            });
          });
        }
      }

      const matchedGoals = new Set();
      let maxBoost = 0;
      INTENT_MAP.forEach(({ phrases, goals, boost }) => {
        if (phrases.some(p => searchSourceText.includes(p.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
          goals.forEach(g => matchedGoals.add(g));
          if (boost > maxBoost) maxBoost = boost;
        }
      });

      const userLevel = detectUserLevel(query);
      if (!isAdminUser && tokens.length === 0 && matchedGoals.size === 0) {
        res.status(200).json({
          reply: "What is your main research goal?\n\nFor example: *recovery & tissue repair*, *cognitive performance*, *metabolic support*, *hormonal optimization*, or *longevity*.",
          suggestions: ["Recovery & Repair", "Cognitive Performance", "Metabolic Support", "Hormonal Optimization", "Longevity"]
        });
        return;
      }

      const scoredPeptides = allPeptides.map(p => {
        let score = 0;
        const searchable = [
          p.name, p.displayName, p.scientificName, ...(p.synonyms || []), ...(p.searchAliases || []),
          p.category, p.objective, p.desc, p.description, ...(p.goals || []), ...(p.secondaryFactors || []),
          ...(p.tags || []), ...(p.semanticKeywords || []), ...(p.mechanisms || []),
        ].filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const nameFields = [p.name, p.displayName, p.scientificName, ...(p.synonyms || []), ...(p.searchAliases || [])].filter(Boolean).map(n => n.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim());
        const hasDirectNameMatch = nameFields.some(n => n && (query.includes(n) || n.includes(query)));
        if (hasDirectNameMatch) {
          score += 25;
        }

        if (searchable.includes(query)) score += 15;
        else if (searchable.includes(searchSourceText)) score += 8; // historical turn query match
        tokens.forEach(t => { if (searchable.includes(t)) score += 3; });
        searchTokens.forEach(t => { if (searchable.includes(t) && !tokens.includes(t)) score += 1; }); // historical token match
        if (p.goals?.some(g => matchedGoals.has(g))) score += maxBoost;
        if (p.secondaryFactors?.some(f => matchedGoals.has(f))) score += Math.ceil(maxBoost / 2);
        return { ...p, score };
      }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

      const scoredProtocols = allProtocols.map(proto => {
        let score = 0;
        const dosingText = [proto.dosing_enrichment?.maintenance_dose, proto.dosing_enrichment?.titration_note, proto.dosing_enrichment?.timing_optimization, proto.dosing_enrichment?.cycling_recommendation].filter(Boolean).join(" ");
        const searchable = [
          proto.id,
          proto.protocol_title,
          proto.title,
          proto.protocol_slug,
          proto.metadata?.scientificName,
          proto.metadata?.abbreviatedName,
          ...(proto.metadata?.keywords || []),
          proto.overview_summary,
          proto.category,
          proto.metadata?.primary_goal,
          proto.metadata?.primary_condition,
          dosingText,
          ...(proto.eligibility_rules?.indications || []),
          ...(proto.expected_outcomes?.qualitative || [])
        ].filter(Boolean).join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const cleanProtoTitle = (proto.protocol_title || proto.title || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (cleanProtoTitle && (query.includes(cleanProtoTitle) || cleanProtoTitle.includes(query))) {
          score += 25;
        }

        if (searchable.includes(query)) score += 12;
        tokens.forEach(t => { if (searchable.includes(t)) score += 3; });
        if (proto.metadata?.primary_goal && matchedGoals.has(proto.metadata.primary_goal)) score += maxBoost;
        if (dosingText && matchedGoals.has("dosage")) score += 8;
        return { ...proto, score, _dosingText: dosingText };
      }).filter(p => p.score > 0).sort((a, b) => b.score - a.score);

      // ── Lifestyle Goal Handler ──
      const normalizedQuery = query.toLowerCase().trim();
      
      const isIntroGoal = !isAdminUser && !hasCompoundKeyword && (normalizedQuery.includes("embark") || normalizedQuery.includes("journey") || normalizedQuery.includes("camino") || normalizedQuery.includes("optimization paths") || normalizedQuery.includes("8 optimization") || normalizedQuery.includes("7 clinical") || normalizedQuery.includes("ready to embark"));

      if (isIntroGoal) {
        const reply = [
          '# 🌟 Welcome to Your Clinical Research Journey!',
          'Welcome! I am the **Atlas Health Clinical Intelligence Assistant**. My purpose is to guide you through advanced cellular research, explaining peptide mechanisms, technical reconstitution protocols, and clinical literature in an accessible, structured format.',
          '',
          'Our research architecture is integrated around **8 Canonical Optimization Paths** designed to target specific biological goals. Click on any path or explore them below:',
          '',
          '### 🏋️ 1. Muscle Growth & Recovery',
          'Focuses on muscle protein synthesis, muscle fiber hypertrophy, tissue repair, and accelerated recovery cycles.',
          '- *Primary Peptides:* **[BPC-157](/product/bpc-157)**, **[TB-500](/product/tb-500)**, **[Ipamorelin](/product/ipamorelin)**, **[Sermorelin](/product/sermorelin)**.',
          '- *Synergistic Supplements:* **[NMN](/supplements/nmn)** (cellular NAD+ mitochondrial fuel), Creatine, CoQ10.',
          '',
          '### ⚡ 2. Fat Loss & Metabolic Health',
          'Focuses on fatty acid oxidation, lipolysis, insulin sensitivity, appetite regulation, and AMPK pathway activation.',
          '- *Primary Peptides:* **[Retatrutide](/product/retatrutide)**, **[Tirzepatide](/product/tirzepatide)**, **[Semaglutide](/product/semaglutide)**, **[AOD-9604](/product/aod-9604)**.',
          '- *Synergistic Supplements:* **[Berberine](/supplements/berberine)** (AMPK activator), **[NMN](/supplements/nmn)** (fat oxidation).',
          '',
          '### 🧠 3. Cognitive Performance & Focus',
          'Focuses on synaptic plasticity, neuroprotection, neurotransmitter balance, and brain-derived neurotrophic factor (BDNF).',
          '- *Primary Peptides:* **[Semax](/product/semax)**, **[Selank](/product/selank)**, **[Epitalon](/product/epitalon)**.',
          '- *Synergistic Supplements:* Alpha-GPC, L-Theanine, Magnesium L-Threonate.',
          '',
          '### 🧬 4. Longevity & Biological Repair',
          'Focuses on cellular rejuvenation, telomerase enzyme activation, DNA repair, and autophagy cascades.',
          '- *Primary Peptides:* **[Epitalon](/product/epitalon)**, **[GHK-Cu](/product/ghk-cu)**, **[MOTS-c](/product/mots-c)**.',
          '- *Synergistic Supplements:* **[NMN](/supplements/nmn)** (cellular NAD+), Resveratrol, Spermidine.',
          '',
          '### ⚖️ 5. Hormonal Vitality & Balance',
          'Focuses on endocrine pathway homeostasis, pulsatile growth hormone secretagogue activity, and HPG axis regulation.',
          '- *Primary Peptides:* **[Ipamorelin](/product/ipamorelin)**, **[CJC-1295 (No DAC)](/product/cjc-1295-no-dac)**, **[Kisspeptin-10](/product/kisspeptin-10)**.',
          '- *Synergistic Supplements:* DHEA, Zinc, Ashwagandha KSM-66.',
          '',
          '### 🧴 6. Skin, Hair & Cellular Health',
          'Focuses on extracellular matrix (ECM) remodeling, dermal collagen synthesis, and hair follicle micro-circulation.',
          '- *Primary Peptides:* **[GHK-Cu](/product/ghk-cu)**, **[TB-500](/product/tb-500)**, **[Epitalon](/product/epitalon)**.',
          '- *Synergistic Supplements:* **[GHK-Cu Topical](/product/ghk-cu)**, Collagen Peptides, Biotin, Vitamin C.',
          '',
          '### 🛡️ 7. Immune Function & Defense',
          'Focuses on T-cell maturation, cytokine modulation, mucosal barrier defense, and immune cell resilience.',
          '- *Primary Peptides:* **[Thymosin Alpha-1 (TA1)](/product/thymosin-alpha-1)**, **[BPC-157](/product/bpc-157)**, **[LL-37](/product/ll-37)**.',
          '- *Synergistic Supplements:* Vitamin D3, Zinc Picolinate, Quercetin.',
          '',
          '### 🌙 8. Better Sleep & Circadian Restoration',
          'Focuses on delta wave sleep optimization, Pineal gland regulation, melatonin synthesis, and circadian master clock synchronization.',
          '- *Primary Peptides:* **[DSIP](/product/dsip)**, **[Epitalon](/product/epitalon)**, **[Selank](/product/selank)**, **[Ipamorelin](/product/ipamorelin)**.',
          '- *Synergistic Supplements:* Magnesium L-Threonate, L-Theanine, **[NMN](/supplements/nmn)**.',
          '',
          '---',
          '### 🧭 How to Begin Your Research',
          '',
          '*   🔹 **Phase 1 — Select an Optimization Path:** Click on one of the goal cards in the lifestyle strip or type your goal here to receive a fully structured protocol analysis.',
          '',
          '*   🔹 **Phase 2 — Review Reconstitution Guides:** Learn how to accurately prepare research peptides.',
          '',
          '*   🔹 **Phase 3 — Consult Catalog & Specifications:** Search or upload a prescription/document using the Green prescription button on the bottom left to automatically analyze and bundle peptides.',
          '',
          'What is your main research goal today? I am here to assist you every step of the way!',
          '\nAlways review the full safety profile before commencing research.'
        ].join('\n');
        const suggestions = [
          { label: '🏋️ Muscle Growth & Recovery', action: 'MESSAGE', payload: 'I want to explore a protocol focused on Muscle Growth & Recovery.' },
          { label: '⚡ Fat Loss & Metabolic Health', action: 'MESSAGE', payload: 'I want to explore a protocol focused on Fat Loss & Metabolic Health.' },
          { label: '🧬 Longevity & Biological Repair', action: 'MESSAGE', payload: 'I want to explore a protocol focused on Longevity & Biological Repair.' },
          { label: '🌙 Better Sleep & Restoration', action: 'MESSAGE', payload: 'I want to explore a protocol focused on Better Sleep & Circadian Restoration.' }
        ];
        res.status(200).json({ reply, suggestions, queryType: "lifestyle_goal" });
        return;
      }

      // ── Reconstitution Query Handler ──
      const isReconQuery = !isAdminUser && !hasCompoundKeyword && (
        /\b(reconstit\w*|mezcl\w*|prepar\w*|dilu\w*|calcula\w*|jeringa\w*|syringe\w*|unit\w*|unidad\w*)\b/i.test(query) ||
        /\b(mix|mixing|mixture|mixes|mixed)\b/i.test(query) ||
        /\b(agua|aguas)\b/i.test(query) ||
        /\b(reconstitution|mixing|dilution|water|liquid|solution|bac)\s+ratio(s)?\b/i.test(query) ||
        /\bratio(s)?\s+of\s+(water|diluent|liquid|bac|solution)\b/i.test(query)
      );
      if (isReconQuery) {
        const isSpanish = query.includes("como") || query.includes("mezclar") || query.includes("preparar") || query.includes("reconstituir") || query.includes("agua");
        let reply = "";
        let suggestions = [];

        if (isSpanish) {
          reply = [
            `# 🧪 Guía de Reconstitución de Péptidos`,
            `La reconstitución es el proceso de disolver un péptido liofilizado (polvo seco) en un diluyente líquido (típicamente agua bacteriostática) para su evaluación en investigación:`,
            "",
            `### 📋 Protocolo de Preparación Estándar`,
            "",
            `*   🔹 **Paso 1 — Esterilización:** Limpie el tapón de goma del vial de péptido y el del diluyente con un algodón con alcohol isopropílico al 70%. Deje secar.`,
            "",
            `*   🔹 **Paso 2 — Extracción del Diluyente:** Aspire aire en la jeringa equivalente a la cantidad de agua que planea transferir (ej. 2 mL), inyéctelo en el vial de agua bacteriostática para equilibrar la presión, y extraiga el agua lentamente.`,
            "",
            `*   🔹 **Paso 3 — Inyección Lenta:** Inserte la aguja en el vial del péptido apuntando hacia la pared interna del vidrio. **Inyecte el líquido muy despacio.** Dejar que el agua golpee directamente el polvo puede dañar o degradar la estructura del péptido.`,
            "",
            `*   🔹 **Paso 4 — Disolución Pasiva:** **Nunca agite el vial.** Agitar el péptido puede romper sus delicados enlaces. En su lugar, gire el vial suavemente entre las manos o déjelo reposar de forma pasiva en el refrigerador hasta que el líquido sea completamente claro y sin partículas.`,
            "",
            `### 🧮 ¿Necesitas calcular la dosis exacta?`,
            `Utiliza nuestra calculadora visual de dosis para determinar los microgramos (mcg) exactos por cada unidad de tu jeringa de insulina.`,
            "",
            `Always review the full safety profile before commencing research.`
          ].join("\n");
          suggestions = [
            { label: "🧮 Calculadora de Dosis", action: "NAVIGATE", payload: "/calculator" },
            { label: "❄️ Pautas de Conservación", action: "MESSAGE", payload: "¿Cómo debo guardar los péptidos?" },
            { label: "🛍️ Catálogo Técnico", action: "NAVIGATE", payload: "/catalog" }
          ];
        } else {
          reply = [
            `# 🧪 Peptide Reconstitution Protocol`,
            `Reconstitution is the process of dissolving a freeze-dried (lyophilized) peptide powder into a sterile liquid diluent (typically Bacteriostatic Water) for research evaluation:`,
            "",
            `### 📋 Standard Preparation Steps`,
            "",
            `*   🔹 **Step 1 — Sanitization:** Wipe the rubber stoppers of both the peptide vial and the bacteriostatic water vial with a fresh 70% isopropyl alcohol swab. Let dry.`,
            "",
            `*   🔹 **Step 2 — Drawing Diluent:** Draw air into a sterile syringe equal to the volume of water you plan to transfer (e.g., 2 mL). Inject this air into the water vial to equalize pressure, then slowly draw out the bacteriostatic water.`,
            "",
            `*   🔹 **Step 3 — Gentle Transfer:** Insert the needle into the peptide vial at a 45-degree angle. **Aim the stream at the glass wall of the vial.** Slowly inject the diluent. Letting the water spray directly onto the powder can shear and degrade the peptide.`,
            "",
            `*   🔹 **Step 4 — Passive Dissolution:** **Never shake the vial.** Agitation can break the protein's delicate peptide bonds. Instead, gently swirl the vial between your palms or let it sit in the refrigerator until the solution is completely clear.`,
            "",
            `### 🧮 Need to calculate exact dosage?`,
            `Use our interactive dosage calculator to determine the exact micrograms (mcg) per unit on your syringe based on your reconstitution ratio.`,
            "",
            `Always review the full safety profile before commencing research.`
          ].join("\n");
          suggestions = [
            { label: "🧮 Dosage Calculator", action: "NAVIGATE", payload: "/calculator" },
            { label: "❄️ Storage Guidelines", action: "MESSAGE", payload: "How should I store reconstituted peptides?" },
            { label: "🛍️ Technical Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }

        res.status(200).json({ reply, suggestions, queryType: "reconstitution_query" });
        return;
      }

      // ── Storage Query Handler ──
      const isStorageQuery = !isAdminUser && !hasCompoundKeyword && /\b(store|storage|guardar|conserv\w*|temperat\w*|refriger\w*)\b/i.test(query);
      if (isStorageQuery) {
        const isSpanish = query.includes("como") || query.includes("guardar") || query.includes("conservar") || query.includes("temperatura") || query.includes("guardan");
        let reply = "";
        let suggestions = [];

        if (isSpanish) {
          reply = [
            `# ❄️ Pautas de Conservación y Almacenamiento de Péptidos`,
            `La estabilidad de las proteínas y péptidos depende críticamente de la temperatura, la luz y la humedad para evitar la hidrólisis y degradación biológica:`,
            "",
            `### 📦 Péptidos Liofilizados (Polvo Seco)`,
            `- **Corto Plazo (hasta 12 meses):** Mantener refrigerado a **2°C - 8°C (36°F - 46°F)** protegido de la luz directa.`,
            `- **Largo Plazo (hasta 36 meses):** Conservar congelado a **-20°C** en un congelador libre de ciclos de descongelación automática.`,
            "",
            `### 💧 Péptidos Reconstituidos (Líquido Preparado)`,
            `- **Temperatura Crítica:** Debe mantenerse siempre refrigerado a **2°C - 8°C (36°F - 46°F)**. **Nunca congele un péptido ya reconstituido**, ya que los cristales de hielo dañarán permanentemente su estructura.`,
            `- **Estabilidad Típica:** La mayoría de los péptidos conservan su integridad y pureza activa durante 3 a 6 semanas una vez reconstituidos, dependiendo del péptido específico.`,
            `- **Evitar Luz UV:** Guarde los viales en su caja protectora o envueltos para evitar la exposición a la luz solar directa o luz fluorescente fuerte.`,
            "",
            `Always review the full safety profile before commencing research.`
          ].join("\n");
          suggestions = [
            { label: "🧪 Guía de Reconstitución", action: "MESSAGE", payload: "¿Cómo reconstituir un vial?" },
            { label: "🧮 Calculadora de Dosis", action: "NAVIGATE", payload: "/calculator" },
            { label: "🛍️ Ver Catálogo", action: "NAVIGATE", payload: "/catalog" }
          ];
        } else {
          reply = [
            `# ❄️ Peptide Storage & Preservation Guidelines`,
            `Peptide and protein stability is highly sensitive to temperature, UV light exposure, and humidity. Proper storage is critical to prevent hydrolysis and peptide degradation:`,
            "",
            `### 📦 Lyophilized Peptides (Dry Powder)`,
            `- **Short to Medium Term (up to 12 months):** Store refrigerated at **2°C to 8°C (36°F - 46°F)** in a dark environment.`,
            `- **Long Term (up to 3 years):** Store frozen at **-20°C (-4°F)** or lower. Avoid auto-defrost freezers, as temperature fluctuations cause degradation.`,
            "",
            `### 💧 Reconstituted Peptides (Liquid Solution)`,
            `- **Critical Temperature:** Must be stored refrigerated at **2°C to 8°C (36°F - 46°F)** at all times. **Never freeze a reconstituted peptide**, as ice crystal formation will permanently shear and destroy the molecular bonds.`,
            `- **Aqueous Shelf Life:** Once reconstituted with Bacteriostatic Water, most research peptides remain stable for 21 to 45 days, depending on their amino acid sequence stability.`,
            `- **Light Protection:** Keep vials inside their storage boxes or wrapped to shield them from UV radiation and strong overhead lighting.`,
            "",
            `Always review the full safety profile before commencing research.`
          ].join("\n");
          suggestions = [
            { label: "🧪 Reconstitution Guide", action: "MESSAGE", payload: "How do I reconstitute a peptide vial?" },
            { label: "🧮 Dosage Calculator", action: "NAVIGATE", payload: "/catalog" },
            { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
          ];
        }

        res.status(200).json({ reply, suggestions, queryType: "storage_query" });
        return;
      }

      // ── Pricing & Quotes Handler ──
      const isPricingQuery = !hasCompoundKeyword && !isPageContextActive && (query.includes("precio") || query.includes("precios") || query.includes("cuest") || query.includes("cuanto") || query.includes("cost") || query.includes("price") || query.includes("comprar") || query.includes("buy") || query.includes("wholesale") || query.includes("discount") || query.includes("cotizacion") || query.includes("how much"));
      if (isPricingQuery) {
        const isSpanish = query.includes("precio") || query.includes("cuanto") || query.includes("comprar") || query.includes("descuento") || query.includes("cotizacion");
        let replyParts = [];
        let suggestions = [];

        if (isSpanish) {
          replyParts = [
            `# 💵 Consultas de Precios, Pedidos al por Mayor y Suministro`,
            "",
            `En Atlas Health, mantenemos una estricta integridad de precios y niveles de descuento personalizados para investigadores clínicos, laboratorios y clínicas:`,
            "",
            `### 🛍️ Precios al por Menor`,
            `Para formatos de investigación estándar (viales, aguas estériles, jeringas), puede consultar los precios actuales, niveles activos y configurar su carrito de compras directamente en nuestro [Catálogo de Productos](/catalog).`,
            "",
            `### 📦 Niveles para Clínicas e Investigadores (Wholesale)`,
            `Ofrecemos precios institucionales especializados y descuentos por volumen:`,
            `- **Nivel Estándar:** Precio minorista listado en el catálogo.`,
            `- **Nivel Mayorista (Wholesale):** Descuentos automáticos por volumen aplicados directamente en el carrito de compras.`,
            `- **Nivel Institucional:** Precios bajo contrato personalizado para clínicas, laboratorios académicos y organizaciones de investigación certificadas.`,
            "",
            `### 📋 Opciones de Suministro y Coordinación`,
            `Para ver precios minoristas, visite nuestro catálogo. Para solicitar una cotización personalizada o abrir una cuenta de investigación profesional, comuníquese directamente con nuestra mesa de ventas y logística.`,
            "",
            `Revise siempre el perfil de seguridad completo antes de comenzar cualquier investigación.`
          ];
          suggestions = [
            { label: `🛍️ Ver Catálogo`, action: "NAVIGATE", payload: `/catalog` },
            { label: `💬 Cotización por WhatsApp`, action: "URL", payload: `https://wa.me/971564179256?text=Hola,%20me%20gustaria%20solicitar%20una%20cotizacion%20de%20precios.` },
            { label: `✉️ Correo de Suministro`, action: "URL", payload: `mailto:support@med-peptides.com?subject=Solicitud%20de%20Cotizacion%20Institucional` }
          ];
        } else {
          replyParts = [
            `# 💵 Pricing, Bulk, & Sourcing Inquiries`,
            "",
            `At Atlas Health, we maintain strict pricing integrity and customized bulk tiers for clinical researchers, labs, and clinics:`,
            "",
            `### 🛍️ Retail Pricing`,
            `For standard research sizes (vials, sterile waters, syringes), you can find current pricing, active tiers, and shopping cart configuration directly on our [Product Catalog](/catalog).`,
            "",
            `### 📦 Bulk, Wholesale & Clinic Tiers`,
            `We offer specialized institutional pricing and volume discounts:`,
            `- **Standard Tier:** Listed retail price on the catalog.`,
            `- **Wholesale Tier:** Automatic bulk discounts applied at cart for volume research.`,
            `- **Institutional Tier:** Custom contract pricing for clinics, academic laboratories, and certified research organizations.`,
            "",
            `### 📋 Sourcing & Coordination Options`,
            `To see retail prices, visit our catalog. To request a custom wholesale quote or set up a professional research account, please contact our logistics and sales desk directly:`,
            `- **WhatsApp / Phone:** \`+971 56 417 9256\` (WhatsApp Business Desk)`,
            `- **Email:** \`support@med-peptides.com\``,
            "",
            `Always review the full safety profile before commencing research.`
          ];
          suggestions = [
            { label: `🛍️ View Catalog`, action: "NAVIGATE", payload: `/catalog` },
            { label: `💬 WhatsApp Sales Quote`, action: "URL", payload: `https://wa.me/971564179256?text=Hi,%20I'd%20like%20to%20request%20a%20pricing%20quote.` },
            { label: `✉️ Email Institutional Sourcing`, action: "URL", payload: `mailto:support@med-peptides.com?subject=Institutional%20Sourcing%20Quote%20Request` }
          ];
        }

        res.status(200).json({ reply: replyParts.join("\n"), suggestions, queryType: "pricing_query" });
        return;
      }

      // ── Shipping & Logistics Handler (Moved to Native Gemini Agent) ──

      // ── Direct Contact & Support Channels ──
      const isContactQuery = !hasCompoundKeyword && !isPageContextActive && (_hasExplicitContact || query.includes("talk to a human") || query.includes("hablar con alguien") || query.includes("need help") || query.includes("human agent") || query.includes("customer service"));
      if (isContactQuery) {
        const isSpanish = query.includes("hablar") || query.includes("contacto") || query.includes("soporte") || query.includes("correo");
        let replyParts = [];
        let suggestions = [];

        if (isSpanish) {
          replyParts = [
            `# 📞 Canales de Contacto Directo y Soporte al Cliente`,
            "",
            `Si necesita asistencia personal para pedidos, logística o cuentas personalizadas, puede ponerse en contacto con nuestros equipos clínicos y de soporte a través de varios canales alternativos:`,
            "",
            `### 💬 Canal de WhatsApp Instantáneo`,
            `Conéctese directamente con un especialista para preguntas rápidas sobre envíos, disponibilidad de stock o verificación de pagos:`,
            `- **Teléfono/WhatsApp:** \`+971 56 417 9256\` (Mesa de WhatsApp Business)`,
            `- **Horario:** Lunes a Viernes, 9:00 AM – 6:00 PM (GMT+4)`,
            "",
            `### ✉️ Correo Electrónico de Suministro Profesional`,
            `Para cuentas institucionales, facturación, contratos de investigación personalizados o logística por volumen, escriba a nuestra oficina de administración:`,
            `- **Correo Electrónico:** \`support@med-peptides.com\``,
            "",
            `### 📍 Catálogo y Academia`,
            `Siga explorando nuestros recursos clínicos automatizados:`,
            `- Explore todos los péptidos de investigación en nuestro [Catálogo de Productos](/catalog).`,
            `- Revise los parámetros técnicos de reconstitución en nuestra [Academia](/academy).`,
            "",
            `Revise siempre el perfil de seguridad completo antes de comenzar cualquier investigación.`
          ];
          suggestions = [
            { label: `💬 Chatear por WhatsApp`, action: "URL", payload: `https://wa.me/971564179256` },
            { label: `✉️ Enviar Correo`, action: "URL", payload: `mailto:support@med-peptides.com` },
            { label: `🛍️ Ver Catálogo`, action: "NAVIGATE", payload: `/catalog` }
          ];
        } else {
          replyParts = [
            `# 📞 Direct Contact & Customer Support Channels`,
            "",
            `If you need personal assistance for orders, logistics, or custom accounts, you can reach our clinical and support teams through several alternative channels:`,
            "",
            `### 💬 Instant WhatsApp Channel`,
            `Connect directly with a specialist for quick questions about shipping, stock availability, or payment verification:`,
            `- **Phone/WhatsApp:** \`+971 56 417 9256\` (WhatsApp Business Desk)`,
            `- **Hours:** Monday to Friday, 9:00 AM – 6:00 PM (GMT+4)`,
            "",
            `### ✉️ Professional Email Sourcing`,
            `For institutional accounts, billing, customized research agreements, or bulk logistics, email our administration desk:`,
            `- **Email:** \`support@med-peptides.com\``,
            "",
            `### 📍 Catalog & Academy`,
            `Feel free to continue exploring our automated clinical resources:`,
            `- Browse all research peptides on our [Product Catalog](/catalog).`,
            `- Review technical reconstitution parameters in our [Academy](/academy).`,
            "",
            `Always review the full safety profile before commencing research.`
          ];
          suggestions = [
            { label: `💬 Chat on WhatsApp`, action: "URL", payload: `https://wa.me/971564179256` },
            { label: `✉️ Email Support`, action: "URL", payload: `mailto:support@med-peptides.com` },
            { label: `🛍️ View Catalog`, action: "NAVIGATE", payload: `/catalog` }
          ];
        }

        res.status(200).json({ reply: replyParts.join("\n"), suggestions, queryType: "contact_query" });
        return;
      }

      const top3Products = scoredPeptides.slice(0, 3);
      const top2Protocols = scoredProtocols.slice(0, 2);

      // ── Gemini RAG Block ──
      try {


        // Active page context injection & prioritization
        const activeEntityData = reqContext?.page_context?.activeEntityData;
        const isProductOrSupplementPage = reqContext?.page_context?.isProductPage || reqContext?.page_context?.isSupplementPage;
        const isProtocolPage = reqContext?.page_context?.isProtocolPage;

        if (activeEntityData && isProductOrSupplementPage) {
          const existsIdx = top3Products.findIndex(p => p.id === activeEntityData.id || p.slug === activeEntityData.slug || p.name === activeEntityData.name);
          if (existsIdx !== -1) {
            const [existing] = top3Products.splice(existsIdx, 1);
            top3Products.unshift({ ...existing, ...activeEntityData });
          } else {
            top3Products.unshift(activeEntityData);
            if (top3Products.length > 3) {
              top3Products.pop();
            }
          }
        }

        if (activeEntityData && isProtocolPage) {
          const existsIdx = top2Protocols.findIndex(p => p.id === activeEntityData.id || p.slug === activeEntityData.slug || p.protocol_id === activeEntityData.protocol_id);
          if (existsIdx !== -1) {
            const [existing] = top2Protocols.splice(existsIdx, 1);
            top2Protocols.unshift({ ...existing, ...activeEntityData });
          } else {
            top2Protocols.unshift(activeEntityData);
            if (top2Protocols.length > 2) {
              top2Protocols.pop();
            }
          }
        }

        let activeViewingContextMarkdown = '';
        if (activeEntityData) {
          const typeLabel = isProductOrSupplementPage ? 'Product/Supplement' : 'Protocol';
          activeViewingContextMarkdown = `
[ACTIVE VIEWING CONTEXT]
The user is CURRENTLY VIEWING the following ${typeLabel} detail page on the website. Prioritize this compound/protocol if the user asks generic questions like "how to take it", "what are the side effects", or "what is the dose":
- Name: ${activeEntityData.displayName || activeEntityData.name || activeEntityData.protocol_title || activeEntityData.title || ''}
  Slug: ${activeEntityData.slug || activeEntityData.id || activeEntityData.protocol_id || ''}
  Description: ${activeEntityData.desc || activeEntityData.description || activeEntityData.overview_summary || ''}
  Clinical/Research Context: ${activeEntityData.objective || activeEntityData.primary_goal || ''}
  ${activeEntityData.typeData ? `Clinical Parameters:
    - Half-Life: ${activeEntityData.typeData.halfLife || 'N/A'}
    - Contraindications: ${JSON.stringify(activeEntityData.typeData.contraindications || [])}
    - Dosage Range: ${JSON.stringify(activeEntityData.typeData.dosageRange || {})}
    - Synergies: ${JSON.stringify(activeEntityData.typeData.synergies || [])}
    - Evidence Level: ${activeEntityData.typeData.evidenceLevel || 'N/A'}` : ''}
-------------------------
`;
        }

        // Dynamic PubMed Integration
        let pubmedLiterature = [];
        if (top3Products.length > 0) {
          const mainProduct = top3Products[0];
          const baseName = mainProduct.name || mainProduct.displayName || '';
          const cleanQuery = baseName.replace(/\s*\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|ui|spu)\b/gi, '').replace(/\/?\s?vial\b/gi, '').trim();
          if (cleanQuery && cleanQuery.toLowerCase() !== 'bacteriostatic water' && cleanQuery.toLowerCase() !== 'precision insulin syringes') {
            pubmedLiterature = await searchPubMed(cleanQuery);
          }
        }

        let systemInstruction = reqContext?.instructions 
          ? reqContext.instructions + "\n\n"
          : "";

        const isAdminMode = reqContext?.instructions?.includes("ADMIN MODE ACTIVE");

        if (!isAdminMode) {
          systemInstruction += `
You are the Atlas Health Clinical Intelligence Assistant (known as Atlas AI), a world-class clinical pharmacist and molecular pharmacologist specializing in peptide therapeutics, supplements, and longevity protocols.

Language Alignment: You MUST automatically respond in the same language as the user's query.

Context & History Retention:
- You must carefully analyze the conversation history (\`history\` array) to maintain context over successive questions.

Grounding & Relevance Rules:
1. Rely ONLY on the matched peptides, supplements, and protocols provided in the context below. Do not invent properties, prices, or protocols not present in the context.
2. Link Injection: Whenever you mention a compound, supplement, test, or protocol, you must format it as a markdown link using its exact slug (e.g., [BPC-157](/product/bpc-157)).
3. Active Page Prioritization: If an [ACTIVE VIEWING CONTEXT] block is provided, prioritize it for generic questions.
4. Relevance Boundary / Out of Scope: You are strictly limited to assisting with clinical pharmacy, peptide therapeutics, supplements, biological research, and longevity science. If the user asks about completely unrelated topics, you MUST politely decline to answer, stating that you are designed for biological research and catalog support.
5. Tone: Professional, clinically precise, structured (use bolding, bullet points, and headers).
6. Clinical References: If matched products list paper PMIDs, you MUST cite them using [REF:PMID].
7. Safety Disclaimer: End the response with: "Always review the full safety profile before commencing research."
8. Protocol Recommendation Priority: When recommending a protocol, check the "Matched Protocols" context first and use them.

FORMATTING & CONTENT STRUCTURE RULES (CRITICAL):
1. Bullet Points Always: Present lists and findings using bullet points.
2. Professional Tone: Avoid emojis in the text.
3. Multi-Pillar Strategy: Provide a holistic 3-pillar range of options: Peptides, Supplements, Diagnostic Testing.
4. Phased Timelines & Next Steps: Divide schedules into clear, sequential Phases.
5. Section Card Layouts: Use \`**SECTION_NAME:**\` headers.

WIDGET INJECTION RULES (VERY IMPORTANT):
1. Evidence Level Badge: Insert \`[EVIDENCE:HIGH]\` at the beginning.
2. Reconstitution Guide Widget: \`[VISUAL_RECON:{"peptideName":"PeptideName","vialMg":5,"waterMl":2,"dosageMcg":250}]\`
3. Protocol Timeline Widget: \`[TIMELINE:[{"phase":"1","title":"Title","duration":"4 weeks","desc":"Desc","color":"#0284c7"}]]\`
4. Comparison Matrix Widget: \`[COMPARE_MATRIX:CompoundA,CompoundB]\` and \`[MATRIX_DATA:{...}]\`
5. Stack Synergy Meter Widget: \`[STACK_SYNERGY:ScoreNumber][PEPTIDES:CompoundA,CompoundB]\`
6. Research Deep-Dive Drawer: \`[DEEP_DIVE:{...}]\`
7. PubMed Citation: \`[REF:PMID]\`
8. Suggestions Action Chips: \`[SUGGESTIONS: Suggestion 1 | Suggestion 2]\`
`;
        } else {
          // Option B: Live Dashboard Metrics Injection
          let adminMetricsStr = "Live Metrics currently unavailable.";
          try {
            const db = getFirestore();
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const totalUsersSnap = await db.collection("users").count().get();
            const totalUsers = totalUsersSnap.data().count;
            
            const pendingOrdersSnap = await db.collection("orders").where("status", "==", "pending").count().get();
            const pendingOrders = pendingOrdersSnap.data().count;
            
            const totalOrdersSnap = await db.collection("orders").count().get();
            const totalOrders = totalOrdersSnap.data().count;

            // Fetch today's orders to calculate volume and revenue
            const todaysOrdersSnap = await db.collection("orders")
              .where("createdAt", ">=", startOfDay)
              .get();
              
            const todaysOrderVolume = todaysOrdersSnap.size;
            let todaysRevenue = 0;
            
            todaysOrdersSnap.forEach(doc => {
              const orderData = doc.data();
              // Summing total or amount field
              if (orderData.total) todaysRevenue += Number(orderData.total);
              else if (orderData.amount) todaysRevenue += Number(orderData.amount);
            });

            adminMetricsStr = `
- Total Registered Users: ${totalUsers}
- Total Lifetime Orders: ${totalOrders}
- Pending Orders: ${pendingOrders}
- Today's Order Volume: ${todaysOrderVolume}
- Today's Total Revenue: $${todaysRevenue.toFixed(2)}
            `;
          } catch (e) {
            console.error("Failed to fetch admin metrics for AI:", e);
          }

          systemInstruction += `
You are Atlas AI, the Atlas Health administrative assistant. 
You must respond clearly and concisely in a professional, administrative tone. Do NOT provide medical advice.

Language Alignment: You MUST automatically respond in the same language as the user's query.

Context & History Retention:
- Analyze the conversation history (\`history\` array) to maintain context.

Admin Rules:
1. You assist with platform management, user analytics, metrics, inventory, orders, and system logs.
2. Here are the LIVE METRICS you have access to right now:
${adminMetricsStr}
If the user asks about these metrics, provide the exact numbers above.
3. Formatting: Use bullet points and clear professional structure. Do not use clinical widgets.

PRICING, USERS & ROLES — You have access to tools via Function Calling:
- Call get_product_pricing(product_id) to get full price breakdown.
- Call list_products_by_margin(order) to rank products by margin.
- Call update_product_price / update_product_cost to PROPOSE a price change (always requires admin confirmation).
- Call list_users(role, limit, search) to search or filter users.
- Call get_pending_approvals() to list users waiting for registration approval.
- Call update_user_role(user_id, role, approved) to update roles or approve/revoke professional access (always requires admin confirmation).

Suggestions Action Chips:
- You MUST end your response with a single line containing suggestion chips in this format:
  \`[SUGGESTIONS: Suggestion 1 | Suggestion 2 | Suggestion 3]\`
`;
        }

        const pubmedContext = pubmedLiterature.length > 0
          ? `\nPubMed Scientific Literature for matched compound:\n${pubmedLiterature.map(a => `- Title: "${a.title}" (Journal: ${a.journal}, Year: ${a.year}) [PMID: ${a.pmid}]`).join('\n')}\n`
          : '';

        const catalogContext = `
${activeViewingContextMarkdown}
Catalog Context:
Matched Products:
${top3Products.map(p => `- Name: ${p.displayName || p.name}
  Slug: ${p.slug || p.id}
  Scientific Name: ${p.scientificName || 'N/A'}
  Description: ${p.desc || p.description || ''}
  Category: ${p.category || ''}
  Goals: ${(p.goals || []).join(', ')}
  Route: ${p.route || ''}
  Clinical Benefits: ${(p.clinical_benefits || []).join(', ')}
  Mechanisms: ${(p.mechanisms || []).join(', ')}
  Half-Life / PK: ${p.typeData?.halfLife || 'N/A'}
  Dosage Range: ${JSON.stringify(p.typeData?.dosageRange || {})}
  Evidence Level: ${p.typeData?.evidenceLevel || 'N/A'}
  Clinical References (PubMed PMIDs): ${JSON.stringify(p.typeData?.references || [])}
  Synergies: ${JSON.stringify(p.typeData?.synergies || [])}
  Contraindications: ${JSON.stringify(p.typeData?.contraindications || [])}
  Storage: ${JSON.stringify(p.storage_conditions || {})}`).join('\n\n')}

Matched Protocols:
${top2Protocols.map(proto => `- Title: ${proto.protocol_title || proto.title}
  Slug: ${proto.slug || proto.id}
  Goal: ${proto.primary_goal || ''}
  Overview: ${proto.overview_summary || ''}
  Expected Outcomes: ${JSON.stringify(proto.expected_outcomes || {})}
  Eligibility: ${JSON.stringify(proto.eligibility_rules || {})}
  Timeline: ${JSON.stringify(proto.clinical_timeline || [])}
  Phases: ${JSON.stringify(proto.phases || [])}`).join('\n\n')}

PubMed Literature:
${pubmedContext}

Clinical Rules:
${JSON.stringify(clinicalRules || {})}
`;

        // Map history to Gemini's format: user -> user, assistant -> model
        const contents = [];
        if (Array.isArray(history)) {
          for (const turn of history) {
            if (turn.role && turn.content) {
              const geminiRole = turn.role === 'assistant' ? 'model' : 'user';
              
              if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
                // Merge consecutive same roles to prevent Gemini API 400 Bad Request
                contents[contents.length - 1].parts[0].text += `\\n\\n${turn.content}`;
              } else {
                contents.push({
                  role: geminiRole,
                  parts: [{ text: turn.content }]
                });
              }
            }
          }
        }

        // Add final user prompt containing the RAG context
        let finalPromptText = "";
        if (isAdminMode) {
          finalPromptText = `User Query: "${message}"`;
        } else {
          finalPromptText = `${catalogContext}\\nUser Query: "${message}"`;
        }

        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text += `\\n\\n${finalPromptText}`;
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: finalPromptText }]
          });
        }

        let reply;
        const vertexAgentId = clinicAIConfig?.agentId || process.env.VERTEX_AGENT_ID;

        // ── ADMIN: execute a confirmed pending write action ────────────────────────────
        if (isAdminMode && execute_pending) {
          try {
            const { fn, args: fnArgs } = execute_pending;
            const callerUid = reqContext?.user_profile?.uid || "admin";
            const result = await timedCall('admin_write_fn', () =>
              executeWriteFunction(fn, fnArgs, db, callerUid)
            );
            res.status(200).json({
              reply: result.message,
              auditId: result.auditId,
              queryType: "admin_write_confirmed",
              suggestions: [
                { label: '📋 Ver Audit Log', action: 'NAVIGATE', payload: '/admin/audit' },
                { label: '💰 Costes & Márgenes', action: 'NAVIGATE', payload: '/admin/costs' },
              ],
            });
          } catch (writeErr) {
            structuredLogger.error('[clinicalAiAssistant] Admin write execution failed:', writeErr.message);
            res.status(500).json({ error: `Write execution failed: ${writeErr.message}` });
          }
          return;
        }

        // ── ADMIN: process a price import PDF/CSV ────────────────────────────
        if (isAdminMode && query_type === 'price_import_pdf' && req.body.pdfBase64) {
          try {
            // Simulated extraction for now until full multimodal API is configured
            const allProducts = await db.collection("products").where("status", "==", "active").get();
            const dbProducts = allProducts.docs.map(d => ({ id: d.id, ...d.data() }));

            const extractedItems = [
              { name: "BPC-157 5mg", price: 12.50 },
              { name: "TB-500 10mg", price: 18.00 },
              { name: "GHK-Cu 50mg", price: 25.00 },
              { name: "Unknown Peptide", price: 99.00 }
            ];

            const comparison = [];
            let matched = 0; let unmatched = 0;

            for (const item of extractedItems) {
              const matchedDb = dbProducts.find(p => p.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
              if (matchedDb) {
                const dbPrice = matchedDb.pricing?.retail?.perUnit || matchedDb.price || 0;
                comparison.push({
                  id: matchedDb.id, name: matchedDb.name, rawName: item.name, filePrice: item.price, dbPrice, matched: true
                });
                matched++;
              } else {
                comparison.push({ name: item.name, rawName: item.name, filePrice: item.price, dbPrice: 0, matched: false });
                unmatched++;
              }
            }

            res.status(200).json({
              reply: `📄 **He procesado el catálogo de precios.** He encontrado ${matched} productos que coinciden y ${unmatched} que no coinciden.\n\nRevisa la tabla abajo y selecciona los que quieres actualizar.`,
              queryType: "price_import_pdf",
              comparisonData: { matched, unmatched, comparison },
              suggestions: []
            });
          } catch (importErr) {
            structuredLogger.error('[clinicalAiAssistant] Admin price import failed:', importErr.message);
            res.status(500).json({ error: `Price import failed: ${importErr.message}` });
          }
          return;
        }

        // ── ADMIN: process a stock import PDF/CSV ────────────────────────────
        if (isAdminMode && query_type === 'stock_import' && req.body.pdfBase64) {
          try {
            const allProducts = await db.collection("products").where("status", "==", "active").get();
            const dbProducts = allProducts.docs.map(d => ({ id: d.id, ...d.data() }));

            // Simulated extraction
            const extractedItems = [
              { name: "BPC-157", quantity: 500 },
              { name: "TB-500", quantity: 200 }
            ];

            const comparison = [];
            let matched = 0; let unmatched = 0;

            for (const item of extractedItems) {
              const matchedDb = dbProducts.find(p => p.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
              if (matchedDb) {
                // Find stock field (usually stock, quantity, or variants.stock)
                let dbStock = matchedDb.stock || 0;
                if (matchedDb.variants && matchedDb.variants.length > 0) {
                  dbStock = matchedDb.variants.reduce((acc, v) => acc + (v.stock || v.inventoryLevel || 0), 0);
                }
                comparison.push({
                  id: matchedDb.id, name: matchedDb.name, rawName: item.name, fileStock: item.quantity, dbStock, matched: true
                });
                matched++;
              } else {
                comparison.push({ name: item.name, rawName: item.name, fileStock: item.quantity, dbStock: 0, matched: false });
                unmatched++;
              }
            }

            res.status(200).json({
              reply: `📦 **He procesado el inventario.** He encontrado ${matched} productos que coinciden y ${unmatched} que no coinciden.\n\nRevisa la tabla abajo y selecciona los niveles de stock a actualizar.`,
              queryType: "stock_import",
              comparisonData: { matched, unmatched, comparison },
              suggestions: []
            });
          } catch (importErr) {
            structuredLogger.error('[clinicalAiAssistant] Admin stock import failed:', importErr.message);
            res.status(500).json({ error: `Stock import failed: ${importErr.message}` });
          }
          return;
        }

        // Native Gemini overrides (e.g. Logistics)
        if (vertexAgentId === "logistics-native-001" || query_type === "logistics") {
          try {
            // Fetch dynamic model and prompt
            let customModel = "gemini-2.0-flash-lite";
            let customPrompt = `You are the Atlas Health Logistics & Sourcing Agent. You handle queries about shipping, delivery times, wholesale pricing, sterile transit protocols, and customs. Be concise, polite, and use bullet points.`;
            
            try {
              const snap = await getFirestore().collection("ai_config").doc("agents").get();
              if (snap.exists) {
                const config = snap.data()?.logistics;
                if (config?.model) customModel = config.model;
                if (config?.systemInstruction) customPrompt = config.systemInstruction;
              }
            } catch (cfgErr) {
              structuredLogger.warn(`[clinicalAiAssistant] Failed to fetch config for logistics, using defaults:`, cfgErr.message);
            }

            reply = await timedCall('rag_logistics_native', () => callGemini(contents, customPrompt, customModel, 'logistics'));
            structuredLogger.info(`[clinicalAiAssistant] Successfully called Native Gemini Logistics Agent`);
          } catch (agentErr) {
            structuredLogger.error(`[clinicalAiAssistant] Native Logistics Agent failed:`, agentErr.message);
            throw agentErr;
          }
        }
        // Native Gemini overrides for pure Gemini agents (admin uses Function Calling)
        else if (vertexAgentId === "gemini-native" || isAdminMode) {
          try {
            if (isAdminMode) {
              // Admin path: use Gemini Function Calling
              const fnResult = await timedCall('admin_gemini_tools', () =>
                callGeminiWithTools(contents, systemInstruction, ADMIN_TOOLS)
              );

              if (fnResult.type === "functionCall") {
                const { name: fnName, args: fnArgs } = fnResult;

                if (WRITE_FUNCTIONS.has(fnName)) {
                  // Write action: return pending_action for frontend confirmation
                  let previewText = "";
                  if (fnName === "update_product_price") {
                    previewText = `Set **${fnArgs.tier}** price of product \`${fnArgs.product_id}\` to **$${fnArgs.new_price}**`;
                  } else if (fnName === "update_product_cost") {
                    previewText = `Set cost price of product \`${fnArgs.product_id}\` to **$${fnArgs.new_cost}**`;
                  } else if (fnName === "update_user_role") {
                    previewText = `Update user \`${fnArgs.user_id}\`: set role to **${fnArgs.role || 'unchanged'}** and approved status to **${fnArgs.approved !== undefined ? fnArgs.approved : 'unchanged'}**`;
                  } else if (fnName === "suspend_user") {
                    previewText = `**SUSPEND** user \`${fnArgs.user_id}\`. Reason: ${fnArgs.reason}`;
                  } else if (fnName === "update_order_status") {
                    previewText = `Update order \`#${fnArgs.order_id}\` to status: **${fnArgs.new_status}**`;
                  }

                  res.status(200).json({
                    reply: `⚠️ **Acción pendiente de confirmación:**\n\n${previewText}\n\n*Confirma o cancela a continuación.*`,
                    pending_action: { fn: fnName, args: fnArgs, previewText },
                    queryType: "admin_pending_write",
                    suggestions: [],
                  });
                  return;
                } else {
                  // Read-only action: execute directly, inject result as text
                  const readResult = await timedCall('admin_read_fn', () =>
                    executeReadOnlyFunction(fnName, fnArgs, db)
                  );
                  reply = readResult;
                }
              } else {
                // Normal text response from Gemini
                reply = fnResult.text;
              }
            } else {
              // Non-admin gemini-native path
              reply = await timedCall('rag_gemini_native', () => callGemini(contents, systemInstruction, "gemini-2.5-flash", "text/plain", null, "unknown"));
            }
            structuredLogger.info(`[clinicalAiAssistant] Successfully called Native Gemini Agent (admin=${isAdminMode})`);
          } catch (agentErr) {
            structuredLogger.error(`[clinicalAiAssistant] Native Gemini Agent failed:`, agentErr.message);
            throw agentErr;
          }
        }
        // Bypass Dialogflow CX for the ADK ClinicAI agent as it is registered as a Reasoning Engine in us-west1, not a Dialogflow agent.
        else if (vertexAgentId && vertexAgentId !== "agent_1779649883481") {
          try {
            const userRole = reqContext?.user_profile?.role || "patient";
            reply = await timedCall('rag_vertex_agent', () => callVertexAgent(message, sessionId, userRole, reqContext, vertexAgentId));
            structuredLogger.info(`[clinicalAiAssistant] Successfully called Vertex AI Agent: ${vertexAgentId}`);
          } catch (vertexErr) {
            structuredLogger.warn(`[clinicalAiAssistant] Vertex AI Agent call failed, falling back to Cloud Agent RAG: ${vertexErr.message}`);
            try {
              reply = await timedCall('rag_cloudAgent_fallback', () => callCloudAgent(contents, systemInstruction));
            } catch (agentErr) {
              structuredLogger.warn(`[clinicalAiAssistant] Cloud Agent proxy failed, falling back to direct Gemini API:`, agentErr.message);
              reply = await timedCall('rag_gemini_fallback', () => callGemini(contents, systemInstruction, "gemini-2.5-flash", "text/plain", null, isAdminMode ? "admin" : "unknown"));
            }
          }
        } else {
          try {
            reply = await timedCall('rag_cloudAgent', () => callCloudAgent(contents, systemInstruction));
            structuredLogger.info(`[clinicalAiAssistant] Successfully called Cloud Agent proxy directly`);
          } catch (agentErr) {
            structuredLogger.warn(`[clinicalAiAssistant] Cloud Agent proxy failed, falling back to direct Gemini API:`, agentErr.message);
            reply = await timedCall('rag_gemini_direct', () => callGemini(contents, systemInstruction, "gemini-2.5-flash", "text/plain", null, isAdminMode ? "admin" : "unknown"));
          }
        }


        // --- AUDITOR GUARDRAIL LAYER ---
        let auditedReply = reply;
        try {
          if (!isAdminMode) {
            const auditorInstruction = `
You are the ClinicAI Compliance Auditor.
Your job is to review the drafted response and ensure it meets strict safety, grounding, and formatting criteria.
CRITERIA:
1. Context Grounding: All claims (half-lives, dosages, contraindications, prices) must be supported by the provided catalog context. Do not allow hallucinated facts.
2. No Prescribing: The response must not directly prescribe a dose or dictate usage to the user (e.g., must not say "take 250mcg daily"). It should only present clinical research ranges.
3. Link Integrity: Links must be relative (/product/slug, /supplements/slug, /protocol/slug, or /testing/slug) and match the provided context.
4. Safety & Out-of-Scope: No prohibited medical claims, diagnosing, or answering out-of-scope non-medical queries.
5. Formatting & Rich Content: The response must use bullet points (-) for lists/steps, partition timelines into phases when explaining protocols, and provide a multi-layered suggestion (peptides + supplements + testing) instead of just single compounds. Correct any dry, wall-of-text formatting without using unnecessary emojis.

Output a JSON object with the following structure:
{
  "status": "valid" | "corrected",
  "correctedReply": "complete corrected markdown reply if correction was required, else null",
  "auditorNotes": "reason for correction or validation"
}
Return ONLY valid JSON.
`;
            const auditorContents = [
              {
                role: 'user',
                parts: [{ text: `Original Query: "${message}"\n\nCatalog Context: ${catalogContext}\n\nDraft Reply to Audit:\n${reply}` }]
              }
            ];
            
            const auditResStr = await timedCall('auditor_gemini', () => callGemini(auditorContents, auditorInstruction, "gemini-2.5-flash", "application/json"));
            const auditData = JSON.parse(auditResStr);
            if (auditData.status === "corrected" && auditData.correctedReply) {
              auditedReply = auditData.correctedReply;
              structuredLogger.info(`[clinicalAiAssistant] Auditor intervened`, { sessionId, notes: auditData.auditorNotes });
            } else {
              structuredLogger.info(`[clinicalAiAssistant] Auditor approved`, { sessionId, notes: auditData.auditorNotes });
            }
          }
        } catch (auditErr) {
          structuredLogger.error(`[clinicalAiAssistant] Auditor Error:`, auditErr);
          // If auditor fails, fallback to the original reply
        }

        // Build fallback suggestions dynamically based on matched items
        const defaultSuggestions = [];
        top3Products.forEach(p => {
          const slug = p.slug || p.id;
          if (slug) defaultSuggestions.push({ label: `⚗️ ${p.displayName || p.name}`, action: "NAVIGATE", payload: `/product/${slug}` });
        });
        top2Protocols.forEach(proto => {
          const slug = proto.slug || proto.id;
          if (slug) defaultSuggestions.push({ label: `📋 ${proto.protocol_title || proto.title}`, action: "NAVIGATE", payload: `/protocol/${slug}` });
        });

        // Parse inline suggestions if present
        let finalReply = auditedReply;
        let suggestions = defaultSuggestions;
        const suggestionsMatch = auditedReply.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
        if (suggestionsMatch) {
          const rawSuggs = suggestionsMatch[1];
          suggestions = rawSuggs.split('|').map(s => {
            const label = s.trim().replace(/^["']|["']$/g, '');
            // Map simple suggestion label to MESSAGE action
            return { label, action: "MESSAGE", payload: label };
          }).filter(s => s.label.length > 0);
          finalReply = auditedReply.replace(/\[SUGGESTIONS:.*?\]/i, '').trim();
        }

        // Ensure disclaimer is present for clinical/research modes
        if (!isAdminMode) {
          if (!finalReply.toLowerCase().includes("always review") && !finalReply.toLowerCase().includes("safety profile")) {
            finalReply += "\n\nAlways review the full safety profile before commencing research.";
          }
        }

        const highValueKeywords = ["bulk", "wholesale", "distribution", "institutional", "clinic", "clinical trial", "hospital", "partnership", "collaboration", "volume", "discount"];
        const isHighValue = highValueKeywords.some(kw => rawQuery.includes(kw));

        try {
          await db.collection("clinical_logs").add({
            sessionId, userQuery: message, aiReply: finalReply, timestamp: FieldValue.serverTimestamp(), isHighValue
          });
        } catch (e) {}

        let formatted = null;
        if (isAdminMode) {
          const { formatResponse } = require("./ai_formatter");
          formatted = await formatResponse(finalReply, { formatType: "rag_response", role: "admin" });
        }

        // ── Token usage estimation (Gemini 2.5-flash pricing) ──────────────
        // Input: $0.075 / 1M tokens  |  Output: $0.30 / 1M tokens
        const _inputText = (systemInstruction || '') + (finalPromptText || '');
        const estimatedInputTokens  = Math.ceil(_inputText.length / 4);
        const estimatedOutputTokens = Math.ceil(finalReply.length / 4);
        const _inputCost  = (estimatedInputTokens  / 1_000_000) * 0.075;
        const _outputCost = (estimatedOutputTokens / 1_000_000) * 0.30;
        const usage = {
          input_tokens:        estimatedInputTokens,
          output_tokens:       estimatedOutputTokens,
          total_tokens:        estimatedInputTokens + estimatedOutputTokens,
          estimated_cost_usd:  parseFloat((_inputCost + _outputCost).toFixed(6)),
          model:               'gemini-2.5-flash'
        };

        // ── Admin navigation links (contextual shortcuts) ──────────────────
        const admin_nav_links = [];
        if (isAdminMode) {
          const activeTab = reqContext?.page_context?.activeTab || '';
          const queryLower = (message || '').toLowerCase();
          const adminRoutes = [
            { label: '📊 Dashboard KPIs',   path: '/admin',               tab: 'dashboard',    keywords: ['kpi','metric','revenue','dashboard'] },
            { label: '🛒 Orders',            path: '/admin/orders',         tab: 'orders',       keywords: ['order','pedido','venta'] },
            { label: '👥 Users',             path: '/admin/users',          tab: 'users',        keywords: ['user','usuario','client','register'] },
            { label: '📦 Products',          path: '/admin/products',       tab: 'products',     keywords: ['product','producto','inventory','stock'] },
            { label: '💰 Costs & Margins',   path: '/admin/costs',          tab: 'costs',        keywords: ['cost','coste','margin','precio','price'] },
            { label: '🧾 Invoices',          path: '/admin/invoices',       tab: 'invoices',     keywords: ['invoice','factura','billing'] },
            { label: '📈 Analytics',         path: '/admin/analytics',      tab: 'analytics',    keywords: ['analytic','statistic','report','trend'] },
            { label: '⚙️ Settings',          path: '/admin/settings',       tab: 'settings',     keywords: ['setting','configuracion','config'] },
            { label: '📋 Invitations',       path: '/admin/invitations',    tab: 'invitations',  keywords: ['invitation','invitacion','invite'] },
          ];
          for (const route of adminRoutes) {
            if (route.tab === activeTab) continue; // skip current tab
            const isRelevant = route.keywords.some(kw => queryLower.includes(kw));
            if (isRelevant || admin_nav_links.length < 2) {
              admin_nav_links.push({ label: route.label, path: route.path });
              if (admin_nav_links.length >= 3) break;
            }
          }
        }

        const responsePayload = { reply: finalReply, suggestions: suggestions.slice(0, 4), usage };
        if (formatted) {
          responsePayload.formatted = formatted;
        }
        if (admin_nav_links.length > 0) {
          responsePayload.admin_nav_links = admin_nav_links;
        }

        res.status(200).json(responsePayload);
      } catch (err) {
        structuredLogger.error(err, "[clinicalAiAssistant] Gemini RAG Error:");

        const isSpanish = query.includes("como") || query.includes("precio") || query.includes("envio") || query.includes("ayuda") || query.includes("hola");
        let fallbackReply = isSpanish
          ? `### 📴 Modo de Respaldo de Catálogo\n\nNuestros servicios de IA están experimentando alta latencia temporal, pero he identificado las siguientes coincidencias en nuestro catálogo:\n\n`
          : `### 📴 Catalog Resiliency Mode\n\nOur advanced AI services are currently experiencing high latency, but I have identified the following direct matches in our catalog:\n\n`;

        if (top3Products.length > 0) {
          fallbackReply += isSpanish ? `#### 🧪 Compuestos Sugeridos:\n` : `#### 🧪 Suggested Compounds:\n`;
          top3Products.forEach(p => {
            fallbackReply += `- **${p.displayName || p.name}**: ${p.objective || 'Clinical Research Compound'}. [PRODUCT:${p.slug || p.id}]\n`;
          });
        }

        if (top2Protocols.length > 0) {
          fallbackReply += isSpanish ? `\n#### 📋 Protocolos de Investigación:\n` : `\n#### 📋 Research Protocols:\n`;
          top2Protocols.forEach(p => {
            fallbackReply += `- **${p.protocol_title || p.title}**: ${p.overview_summary || 'Standard Research Protocol'}. [PROTOCOL:${p.slug || p.id}]\n`;
          });
        }

        if (top3Products.length === 0 && top2Protocols.length === 0) {
          fallbackReply += isSpanish 
            ? `No se encontraron coincidencias exactas en el catálogo. Por favor, intenta buscando un péptido o protocolo específico (ej. *BPC-157*, *Sleep*, *Metabolic*).`
            : `No exact matches were found in the catalog. Please try searching for another specific peptide or protocol name (e.g. *BPC-157*, *Sleep*, *Metabolic*).`;
        }

        fallbackReply += isSpanish
          ? `\n\n*Nota: La síntesis avanzada de IA se reanudará automáticamente una vez restablecido el servicio.*`
          : `\n\n*Note: Full advanced AI synthesis will resume automatically once the service is restored.*`;

        const defaultSuggestions = [];
        top3Products.forEach(p => {
          const slug = p.slug || p.id;
          if (slug) defaultSuggestions.push({ label: `⚗️ ${p.displayName || p.name}`, action: "NAVIGATE", payload: `/product/${slug}` });
        });
        top2Protocols.forEach(proto => {
          const slug = proto.slug || proto.id;
          if (slug) defaultSuggestions.push({ label: `📋 ${proto.protocol_title || proto.title}`, action: "NAVIGATE", payload: `/protocol/${slug}` });
        });

        res.status(200).json({ reply: fallbackReply, suggestions: defaultSuggestions.slice(0, 4), isFallback: true });
      }
    } catch (err) {
      structuredLogger.error(err, "[clinicalAiAssistant] AI Assistant Fatal Error:");
      const errorDetail = err?.stack || err?.message || String(err);
      res.status(200).json({
        reply: `### ❌ Debug: AI Assistant Fatal Error\n\n\`\`\`\n${errorDetail}\n\`\`\``,
        suggestions: [
          { label: "🛍️ View Catalog", action: "NAVIGATE", payload: "/catalog" }
        ]
      });
    }
  }
);
