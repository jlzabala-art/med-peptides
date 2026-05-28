"use strict";
/**
 * ai_utils.js — Shared utilities for all AI handler modules.
 *
 * Exports:
 *  - Secret references (for use in onRequest secrets: [])
 *  - retryAsync, timedCall, sanitizeMessage
 *  - Circuit breaker: isProxyCircuitOpen, recordProxyFailure, recordProxySuccess
 *  - callCloudAgent, callGemini, callVertexAgent
 *  - searchPubMed, detectUserLevel
 *  - catalogCache, CATALOG_CACHE_TTL_MS
 *  - AGENT_REGISTRY, resolveAgent  (Phase 5 multi-agent router)
 *  - structuredLogger
 */

const { defineSecret } = require("firebase-functions/params");
const pino = require("pino");

const structuredLogger = pino({ level: "info" });

// ── Secrets (Firebase Secret Manager) ───────────────────────────────────────
const AGENT_PROXY_URL_SECRET    = defineSecret("AGENT_PROXY_URL");
const AGENT_SECRET_KEY_SECRET   = defineSecret("AGENT_SECRET_KEY");
const AGENT_PROXY_HEADER_SECRET = defineSecret("AGENT_PROXY_HEADER");
const GEMINI_API_KEY_SECRET     = defineSecret("GEMINI_API_KEY");

// Zoho Books OAuth secrets (MEDILUXE org 662274409)
const ZOHO_CLIENT_ID_SECRET     = defineSecret("ZOHO_CLIENT_ID");
const ZOHO_CLIENT_SECRET_SECRET = defineSecret("ZOHO_CLIENT_SECRET");
const ZOHO_REFRESH_TOKEN_SECRET = defineSecret("ZOHO_REFRESH_TOKEN");

/** All secrets — pass this array to every onRequest({ secrets: ALL_SECRETS }) */
const ALL_SECRETS = [
  AGENT_PROXY_URL_SECRET,
  AGENT_SECRET_KEY_SECRET,
  AGENT_PROXY_HEADER_SECRET,
  GEMINI_API_KEY_SECRET,
  ZOHO_CLIENT_ID_SECRET,
  ZOHO_CLIENT_SECRET_SECRET,
  ZOHO_REFRESH_TOKEN_SECRET,
];

// ── Retry helper ─────────────────────────────────────────────────────────────
async function retryAsync(fn, args = [], { attempts = 3, delay = 500, factor = 2 } = {}) {
  let lastErr;
  let wait = delay;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn(...args);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, wait));
      wait *= factor;
    }
  }
  throw lastErr;
}

// ── Circuit breaker (module-scope — survives warm instances) ─────────────────
let _proxyFailureCount = 0;
let _proxyCircuitOpenUntil = 0;
const PROXY_FAILURE_THRESHOLD = 5;
const PROXY_COOLDOWN_MS = 60_000;

function isProxyCircuitOpen() {
  if (Date.now() < _proxyCircuitOpenUntil) return true;
  if (_proxyCircuitOpenUntil > 0 && Date.now() >= _proxyCircuitOpenUntil) {
    _proxyFailureCount = 0;
    _proxyCircuitOpenUntil = 0;
    structuredLogger.info({ event: "proxy_circuit_reset" });
  }
  return false;
}
function recordProxyFailure() {
  _proxyFailureCount++;
  if (_proxyFailureCount >= PROXY_FAILURE_THRESHOLD) {
    _proxyCircuitOpenUntil = Date.now() + PROXY_COOLDOWN_MS;
    structuredLogger.warn({
      event: "proxy_circuit_open",
      failureCount: _proxyFailureCount,
      cooldownUntil: new Date(_proxyCircuitOpenUntil).toISOString(),
    });
  }
}
function recordProxySuccess() {
  _proxyFailureCount = 0;
  _proxyCircuitOpenUntil = 0;
}

// ── Input sanitization ───────────────────────────────────────────────────────
function sanitizeMessage(raw) {
  if (!raw || typeof raw !== "string") return "";
  // Cap at ~2000 tokens (8000 chars) and strip non-printable control chars
  return raw.slice(0, 8000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

// ── Latency timing helper ────────────────────────────────────────────────────
async function timedCall(label, fn) {
  const t0 = Date.now();
  let status = "success";
  try {
    return await fn();
  } catch (err) {
    status = "error";
    throw err;
  } finally {
    structuredLogger.info({ event: "ai_call_latency", label, latencyMs: Date.now() - t0, status });
  }
}

// ── AI call functions ────────────────────────────────────────────────────────

async function callCloudAgent(contents, systemInstruction, modelName = "gemini-2.5-flash", responseMimeType = "text/plain") {
  if (isProxyCircuitOpen()) {
    throw new Error("Cloud Agent proxy circuit is open — skipping to fallback");
  }

  const AGENT_PROXY_URL    = AGENT_PROXY_URL_SECRET.value();
  const AGENT_SECRET_KEY   = AGENT_SECRET_KEY_SECRET.value();
  const AGENT_PROXY_HEADER = AGENT_PROXY_HEADER_SECRET.value();

  const payload = {
    originalUrl: `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${modelName}:generateContent`,
    headers: { "content-type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { temperature: 0.2, responseMimeType },
    }),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const fetchWithRetry = async () => {
      const response = await fetch(AGENT_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Proxy": AGENT_PROXY_HEADER,
          "X-App-Key": AGENT_SECRET_KEY,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Cloud Agent Proxy Error (status ${response.status}): ${errText}`);
      }
      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response format from Cloud Agent API");
      }
      return data.candidates[0].content.parts[0].text;
    };
    const result = await retryAsync(fetchWithRetry, [], { attempts: 3, delay: 500, factor: 2 });
    clearTimeout(timeoutId);
    recordProxySuccess();
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    recordProxyFailure();
    throw err;
  }
}

async function callVertexAgent(message, sessionId, role, contextData, overrideAgentId) {
  const AGENT_PROXY_URL    = AGENT_PROXY_URL_SECRET.value();
  const AGENT_SECRET_KEY   = AGENT_SECRET_KEY_SECRET.value();
  const AGENT_PROXY_HEADER = AGENT_PROXY_HEADER_SECRET.value();

  const projectId = process.env.VERTEX_PROJECT_ID || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || "med-peptides-app";
  const agentId   = overrideAgentId || process.env.VERTEX_AGENT_ID;

  if (!agentId) throw new Error("VERTEX_AGENT_ID environment variable is not configured");

  // AgentRAG is in "global"; the three new agents are in "europe-west1"
  const GLOBAL_AGENTS = new Set([
    "7f3effe5-c4bf-4b8f-b9f4-32d8d6dd09a9",  // AgentRAG (real UUID)
    "agent_1779649883481",                     // AgentRAG (legacy env alias)
  ]);
  const locationId     = GLOBAL_AGENTS.has(agentId) ? "global" : (process.env.VERTEX_LOCATION_ID || "europe-west1");
  const cleanSessionId = sessionId.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 36) || "session-default";
  const originalUrl    = `https://dialogflow.googleapis.com/v3/projects/${projectId}/locations/${locationId}/agents/${agentId}/sessions/${cleanSessionId}:detectIntent`;

  const payload = {
    originalUrl,
    headers: { "content-type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      queryInput: { text: { text: message }, languageCode: "en" },
      queryParams: { parameters: { role: role || "patient", context: contextData || {} } },
    }),
  };

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(AGENT_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Proxy": AGENT_PROXY_HEADER,
        "X-App-Key": AGENT_SECRET_KEY,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Vertex Agent API Error (status ${response.status}): ${errText}`);
    }
    const data      = await response.json();
    const replyText = data.queryResult?.responseMessages?.[0]?.text?.text?.[0];
    if (!replyText) throw new Error("Empty or invalid response from Vertex Agent API");
    return replyText;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function callGemini(contents, systemInstruction, modelName = "gemini-2.5-flash", responseMimeType = "text/plain", maxOutputTokens = null, agentKey = "unknown") {
  try {
    const key = GEMINI_API_KEY_SECRET.value();
    if (!key) throw new Error("GEMINI_API_KEY secret is missing or empty");

    const url     = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
    const genConfig = { temperature: 0.2, responseMimeType };
    if (maxOutputTokens) genConfig.maxOutputTokens = maxOutputTokens;

    const payload = {
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: genConfig,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (status ${response.status}): ${errText}`);
    }
    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Invalid response format from Gemini API");

    let resultText = data.candidates[0].content.parts[0].text;

    // Track usage asynchronously if agentKey provided
    if (agentKey && agentKey !== "unknown" && data.usageMetadata) {
      logAgentUsage(agentKey, modelName, data.usageMetadata).catch(e => structuredLogger.warn(`[logAgentUsage] failed: ${e.message}`));
      
      if (agentKey === "admin") {
        const cost = estimateCost(modelName, data.usageMetadata);
        resultText += `\n\n*(📊 Tokens de esta consulta: ${data.usageMetadata.totalTokenCount} | Coste est.: $${cost.toFixed(5)})*`;
      }
    }

    return resultText;
  } catch (directErr) {
    structuredLogger.warn(`[callGemini] Direct call failed, trying proxy: ${directErr.message}`);
    try {
      return await callCloudAgent(contents, systemInstruction, modelName, responseMimeType);
    } catch (proxyErr) {
      structuredLogger.error(`[callGemini] Both direct and proxy failed: ${proxyErr.message}`);
      throw directErr;
    }
  }
}

// ── Agent Usage Tracking ─────────────────────────────────────────────────────
function estimateCost(model, usageMetadata) {
  if (!usageMetadata) return 0;
  const prompt = usageMetadata.promptTokenCount || 0;
  const candidates = usageMetadata.candidatesTokenCount || 0;
  if (model.includes("flash")) {
    return (prompt * 0.075 / 1000000) + (candidates * 0.30 / 1000000);
  } else if (model.includes("pro")) {
    return (prompt * 1.25 / 1000000) + (candidates * 5.00 / 1000000);
  }
  return 0;
}

async function logAgentUsage(agentKey, modelName, usageMetadata) {
  if (!usageMetadata) return;
  try {
    const { getFirestore, FieldValue } = require("firebase-admin/firestore");
    const db = getFirestore();
    const cost = estimateCost(modelName, usageMetadata);
    const docRef = db.collection("ai_metrics").doc("usage");
    
    const updateData = {};
    updateData[`agents.${agentKey}.totalCalls`] = FieldValue.increment(1);
    updateData[`agents.${agentKey}.totalTokens`] = FieldValue.increment(usageMetadata.totalTokenCount || 0);
    updateData[`agents.${agentKey}.estimatedCost`] = FieldValue.increment(cost);
    updateData[`agents.${agentKey}.lastUsed`] = FieldValue.serverTimestamp();

    await docRef.set(updateData, { merge: true });
  } catch (err) {
    // Ignore db errors in tracking to not block main thread
  }
}


// ── PubMed search with in-memory cache ───────────────────────────────────────
const pubmedCache        = new Map();
const PUBMED_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function searchPubMed(query) {
  const cacheKey = query.toLowerCase().trim();
  const now = Date.now();
  if (pubmedCache.has(cacheKey)) {
    const cached = pubmedCache.get(cacheKey);
    if (now - cached.timestamp < PUBMED_CACHE_TTL_MS) return cached.data;
  }

  try {
    const searchUrl  = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=3`;
    const res        = await fetch(searchUrl);
    if (!res.ok) return [];
    const searchData = await res.json();
    const ids        = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) { pubmedCache.set(cacheKey, { timestamp: now, data: [] }); return []; }

    const summaryUrl  = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
    const sumRes      = await fetch(summaryUrl);
    if (!sumRes.ok) return [];
    const summaryData = await sumRes.json();

    const results = ids.map(id => {
      const info = summaryData.result?.[id];
      if (!info) return null;
      return {
        pmid:    id,
        title:   (info.title || "Scientific Publication").replace(/<\/?[^>]+(\>|$)/g, ""),
        journal: info.fulljournalname || info.source || "Medical Journal",
        year:    info.pubdate ? info.pubdate.substring(0, 4) : "N/D",
      };
    }).filter(Boolean);

    pubmedCache.set(cacheKey, { timestamp: now, data: results });
    return results;
  } catch (e) {
    structuredLogger.warn(`[searchPubMed] Failed for query "${query}": ${e.message}`);
    return [];
  }
}

// ── User level detection ─────────────────────────────────────────────────────
const { PROFESSIONAL_SIGNALS, BEGINNER_SIGNALS } = require("../utils/constants");

function detectUserLevel(query) {
  if (PROFESSIONAL_SIGNALS.some(s => query.includes(s))) return "professional";
  if (BEGINNER_SIGNALS.some(s => query.includes(s))) return "beginner";
  return "unknown";
}

// ── Catalog cache (shared across handlers in the same instance) ──────────────
let catalogCache       = null;
let catalogCacheExpiry = 0;
const CATALOG_CACHE_TTL_MS = 15 * 60 * 1000;

// ── Multi-agent registry (Phase 5) ───────────────────────────────────────────
// Maps query_type → Vertex AI / Dialogflow CX Agent UUID.
// AgentRAG (7f3effe5) lives in Agent Builder (global).
// All other agents live in europe-west1.
const AGENT_REGISTRY = {
  rag:              process.env.VERTEX_AGENT_ID || "7f3effe5-c4bf-4b8f-b9f4-32d8d6dd09a9",  // AgentRAG — Information Queries (global)
  prescription:     process.env.AGENT_ID_PRESCRIPTION    || "0686affe-d47d-4efd-8afb-b64c41276f88", // AgentPrescription
  clinical_data:    process.env.AGENT_ID_CLINICAL_DATA   || "4abfec3d-9305-4f34-a1b9-2fdaa8ff071a", // AgentClinicalData
  safety_check:     process.env.AGENT_ID_SAFETY          || "a0b36599-45c9-4e9d-ac0c-41fcc9a9153c", // AgentSafety
  personalization:  process.env.AGENT_ID_PERSONALIZATION || "7b591a3d-f644-4505-8e38-abcfe809bd95", // AgentPersonalization
  doctor_protocol:  process.env.AGENT_ID_DOCTOR          || "f320b876-5f0f-468d-9a7e-294026a5e613", // AgentDoctor
  
  // Native Gemini Custom Agents
  logistics:        "logistics-native-001",                   // AgentLogistics (Native)
  catalog_builder:  process.env.AGENT_ID_CATALOG         || "catalog-builder-agent-001",            // AgentCatalogBuilder
};

/**
 * Resolves the correct agent ID for a given query type.
 * Priority: client override → registered specialist → RAG default
 */
function resolveAgent(query_type, clinicAIConfig) {
  return clinicAIConfig?.agentId         // client-side feature flag override
    ?? AGENT_REGISTRY[query_type]        // specialist agent for this type
    ?? AGENT_REGISTRY["rag"];            // RAG fallback
}

// ── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  // Secrets
  AGENT_PROXY_URL_SECRET,
  AGENT_SECRET_KEY_SECRET,
  AGENT_PROXY_HEADER_SECRET,
  GEMINI_API_KEY_SECRET,
  ALL_SECRETS,
  // Logger
  structuredLogger,
  // Helpers
  retryAsync,
  sanitizeMessage,
  timedCall,
  // Circuit breaker
  isProxyCircuitOpen,
  recordProxyFailure,
  recordProxySuccess,
  // AI calls
  callCloudAgent,
  callGemini,
  callVertexAgent,
  // Data
  searchPubMed,
  detectUserLevel,
  // Catalog cache (shared mutable state — same instance)
  get catalogCache()       { return catalogCache; },
  set catalogCache(v)      { catalogCache = v; },
  get catalogCacheExpiry() { return catalogCacheExpiry; },
  set catalogCacheExpiry(v){ catalogCacheExpiry = v; },
  CATALOG_CACHE_TTL_MS,
  // Multi-agent router
  AGENT_REGISTRY,
  resolveAgent,
};
