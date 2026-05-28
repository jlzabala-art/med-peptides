"use strict";
/**
 * createAgent.js — Agent Factory
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all cross-cutting concerns in every AI agent.
 *
 * What it standardises:
 *   ✓ CORS + OPTIONS handling
 *   ✓ HTTP method guard (POST only)
 *   ✓ Input sanitization
 *   ✓ Role-based access guard
 *   ✓ Standard request context extraction (message, sessionId, userProfile, role, uid)
 *   ✓ Unique traceId per request (UUID v4)
 *   ✓ Structured logging with agentName on every event
 *   ✓ Standard response envelope: { reply, formatted, agentName, agentId, traceId, duration }
 *   ✓ Token budget per agent (maxOutputTokens)
 *   ✓ Async observability trace written to Firestore (fire-and-forget)
 *   ✓ Graceful degradation via optional fallback fn
 *   ✓ Centralised error handling (single try/catch wrapping handler)
 *
 * Usage:
 *   const createAgent = require('../agents/createAgent');
 *
 *   module.exports = createAgent({
 *     agentId:        "my-agent-uuid",
 *     agentName:      "AgentFoo",
 *     allowedRoles:   new Set(["admin", "doctor"]),  // null = public
 *     model:          "gemini-2.0-flash",
 *     maxOutputTokens: 1500,
 *     timeout:        60,
 *     handler: async (ctx) => {
 *       const { message, role, callModel } = ctx;
 *       const reply = await callModel([{ role: "user", parts: [{ text: message }] }], SYSTEM_PROMPT);
 *       return { reply };
 *       //      ↑ Only business logic. All envelope fields added by factory.
 *     },
 *     fallback: async (ctx, err) => ({ reply: "Service temporarily unavailable." }),
 *   });
 *
 * ctx fields available in handler:
 *   req              – raw Express Request (for non-standard body fields)
 *   body             – req.body (convenience)
 *   message          – sanitized req.body.message
 *   sessionId        – req.body.sessionId
 *   userProfile      – req.body.userProfile || {}
 *   role             – userProfile.role || "guest"
 *   uid              – userProfile.uid || null
 *   traceId          – UUID v4 string
 *   t0               – Date.now() at request start
 *   agentName        – from config
 *   agentId          – from config
 *   callModel        – callGemini pre-bound with this agent's model + maxOutputTokens
 *   db               – Firestore instance (lazy, same per warm instance)
 *
 * handler return shape:
 *   { reply, formatted?, extras? }
 *   extras → merged into response envelope as-is
 */

const { onRequest }      = require("firebase-functions/v2/https");
const { getFirestore }   = require("firebase-admin/firestore");
const crypto             = require("crypto");
const {
  ALL_SECRETS,
  structuredLogger,
  sanitizeMessage,
  callGemini,
} = require("../http/ai_utils");

// ── Lazy Firestore singleton ──────────────────────────────────────────────────
let _db = null;
function db() {
  if (!_db) _db = getFirestore();
  return _db;
}

// ── Async trace writer (fire-and-forget, never blocks response) ───────────────
function writeTrace(traceDoc) {
  db()
    .collection("agent_traces")
    .doc(traceDoc.traceId)
    .set(traceDoc)
    .catch((e) =>
      structuredLogger.warn({ event: "trace_write_failed", error: e.message })
    );
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * @param {object}   config
 * @param {string}   config.agentId         - UUID from AGENT_REGISTRY
 * @param {string}   config.agentName       - e.g. "AgentDoctor"
 * @param {Set|null} config.allowedRoles    - null = public; Set = role guard
 * @param {string}   [config.model]         - Gemini model name (default: gemini-2.0-flash)
 * @param {number}   [config.maxOutputTokens] - Token budget (default: 1500)
 * @param {number}   [config.timeout]       - Cloud Function timeout in seconds (default: 90)
 * @param {Function} config.handler         - async (ctx) => { reply, formatted?, extras? }
 * @param {Function} [config.fallback]      - async (ctx, err) => { reply, ... } — called on handler failure
 *
 * @returns {FirebaseFunction} — ready to export from functions/index.js
 */
function createAgent({
  agentId,
  agentName,
  allowedRoles = null,
  model = "gemini-2.0-flash",
  maxOutputTokens = 1500,
  timeout = 90,
  handler,
  fallback = null,
}) {
  if (!agentName) throw new Error("[createAgent] agentName is required");
  if (typeof handler !== "function") throw new Error(`[createAgent:${agentName}] handler must be a function`);

  return onRequest(
    {
      region: "europe-west1",
      timeoutSeconds: timeout,
      secrets: ALL_SECRETS,
    },
    async (req, res) => {
      // ── CORS ──────────────────────────────────────────────────────────────
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (req.method === "OPTIONS") return res.status(204).send("");
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed", agentName });
      }

      // ── Request context ────────────────────────────────────────────────────
      const traceId     = crypto.randomUUID();
      const t0          = Date.now();
      const body        = req.body || {};
      const message     = sanitizeMessage(body.message || "");
      const sessionId   = body.sessionId  || null;
      const userProfile = body.userProfile || {};
      const role        = userProfile.role || "guest";
      const uid         = userProfile.uid  || null;

      // ── Role guard ─────────────────────────────────────────────────────────
      if (allowedRoles && !allowedRoles.has(role)) {
        structuredLogger.warn({
          event:     "agent_access_denied",
          agentName,
          traceId,
          role,
        });
        return res.status(403).json({
          error: "Access restricted",
          message: `${agentName} is not available for your current role.`,
          agentName,
          traceId,
        });
      }

      // ── Log request start ──────────────────────────────────────────────────
      structuredLogger.info({
        event:     "agent_request_start",
        agentName,
        agentId,
        traceId,
        sessionId,
        role,
        messageLen: message.length,
        model,
      });

      // ── callModel helper — pre-bound with this agent's config ─────────────
      const callModel = (contents, systemInstruction, overrideModel) =>
        callGemini(
          contents,
          systemInstruction,
          overrideModel || model,
          "text/plain",
          maxOutputTokens,
        );

      // ── Build context for handler ──────────────────────────────────────────
      const ctx = {
        req,
        body,
        message,
        sessionId,
        userProfile,
        role,
        uid,
        traceId,
        t0,
        agentName,
        agentId,
        model,
        maxOutputTokens,
        callModel,
        db: db(),
      };

      let result;
      let success = true;
      let errorMsg = null;

      try {
        result = await handler(ctx);
      } catch (err) {
        success  = false;
        errorMsg = err.message;

        structuredLogger.error({
          event:     "agent_handler_error",
          agentName,
          traceId,
          error:     err.message,
          sessionId,
          role,
        });

        // ── Graceful degradation ─────────────────────────────────────────────
        if (typeof fallback === "function") {
          try {
            result = await fallback(ctx, err);
            success = true; // degraded — but responded
          } catch (fbErr) {
            structuredLogger.error({
              event: "agent_fallback_error",
              agentName,
              traceId,
              error: fbErr.message,
            });
          }
        }

        if (!result) {
          // Write trace before returning 500
          writeTrace({
            traceId,
            agentName,
            agentId,
            sessionId,
            role,
            model,
            requestTimestamp: new Date(t0).toISOString(),
            durationMs:       Date.now() - t0,
            success:          false,
            errorMessage:     errorMsg,
          });
          return res.status(500).json({
            error:     `${agentName} error`,
            traceId,
            agentName,
          });
        }
      }

      // ── Standard response envelope ─────────────────────────────────────────
      const duration = Date.now() - t0;
      const envelope = {
        reply:     result.reply     ?? "",
        formatted: result.formatted ?? null,
        agentName,
        agentId,
        traceId,
        duration,
        ...(result.extras || {}),
      };

      // ── Async observability trace ──────────────────────────────────────────
      writeTrace({
        traceId,
        agentName,
        agentId,
        sessionId,
        role,
        model,
        requestTimestamp:  new Date(t0).toISOString(),
        durationMs:        duration,
        estimatedTokens:   Math.round((message.length + (envelope.reply?.length || 0)) / 4),
        success,
        errorMessage:      errorMsg,
        degraded:          success && !!errorMsg,
      });

      // ── Log completion ─────────────────────────────────────────────────────
      structuredLogger.info({
        event:     "agent_request_done",
        agentName,
        traceId,
        duration,
        success,
        role,
      });

      return res.json(envelope);
    }
  );
}

module.exports = createAgent;
