"use strict";
/**
 * ai_doctor.js — AgentDoctor (Protocol Builder for Physicians)
 * Migrated to createAgent() factory — v2
 *
 * Business logic unchanged. Factory handles:
 *   CORS, role guard, traceId, response envelope, async trace, error handling.
 *
 * Persists to Firestore:
 *  - doctor_protocols/{protocolId}
 *  - ai_sessions/{sessionId}
 */

const createAgent = require("../agents/createAgent");
const {
  callGemini, callVertexAgent, structuredLogger, AGENT_REGISTRY,
} = require("./ai_utils");
const { safetyCheck }   = require("./ai_safety");
const { formatResponse } = require("./ai_formatter");
const { FieldValue }     = require("firebase-admin/firestore");

const AGENT_ID   = "f320b876-5f0f-468d-9a7e-294026a5e613";
const AGENT_NAME = "AgentDoctor";

// ── System prompt ──────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are AgentDoctor, a specialized clinical protocol builder for licensed healthcare professionals on Med-Peptides.com.

You assist physicians, clinicians, and medical researchers to:
1. Design evidence-based peptide and supplement protocols for specific patient profiles
2. Interpret lab biomarkers and map findings to relevant compounds
3. Understand compound mechanisms, interactions, and contraindications
4. Generate structured protocol documents with dosing research ranges and monitoring plans
5. Draft clinical recommendation summaries

CLINICAL OUTPUT FORMAT (when building a protocol):
Use this exact structure:
---
## Protocol: [Name]
**Patient Profile:** [brief description]
**Primary Objectives:** [list]

### Phase 1 — Foundation (Weeks 1-4)
| Compound | Research Range | Frequency | Route | Notes |
|---|---|---|---|---|
| [compound] | [range] | [freq] | [SC/IM/oral] | [notes] |

### Phase 2 — Optimization (Weeks 5-12)
[table]

### Monitoring Markers
- Biomarkers to track: [list]
- Frequency: [schedule]
- Flags: [red flags to watch for]

### Compound Notes
**[Compound]:** Mechanism... Contraindications... Interactions...

### Disclaimer
*These are research dosing ranges for licensed healthcare professionals only.
This protocol is not a prescription. Adapt based on individual patient response and clinical judgment.*
---

RULES:
- Only provide full protocols to verified medical professionals (role = doctor | clinic)
- Always include a disclaimer in any protocol document
- Always recommend monitoring (labs, symptoms) alongside any compound
- Be explicit and conservative with contraindications
- Flag dangerous combinations clearly with ⚠️
- Reference specific biomarker values when provided
- Respond in the same language as the physician (ES/EN)`;

// ── Firestore helpers ──────────────────────────────────────────────────────────
function parseProtocolStructure(rawText) {
  const titleMatch   = rawText.match(/##\s+Protocol:\s*(.+)/);
  const title        = titleMatch ? titleMatch[1].trim() : null;
  const monitoringSection = rawText.match(/###\s+Monitoring Markers([\s\S]*?)(?:###|$)/);
  const monitoring   = monitoringSection
    ? monitoringSection[1].match(/- (.+)/g)?.map(l => l.replace(/^- /, "").trim()) || []
    : [];
  const flags        = (rawText.match(/⚠️[^\n]+/g) || []).map(f => f.trim());
  const phases       = [...rawText.matchAll(/###\s+(Phase\s+\d+[^\n]+)/g)].map(m => ({ name: m[1].trim() }));
  const compounds    = [...rawText.matchAll(/\|\s*([A-Za-z0-9-]+)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g)]
    .filter(r => !r[0].includes("---") && !r[0].toLowerCase().includes("compound"))
    .map(r => ({ name: r[1].trim(), range: r[2].trim(), frequency: r[3].trim(), route: r[4].trim() }));
  return { title, phases, compounds, monitoring, flags };
}

function generateProtocolId(doctorId) {
  const ts   = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `proto_${(doctorId || "anon").slice(-4)}_${ts}_${rand}`;
}

async function saveProtocol(db, protocolId, doctorId, patientData, rawReply, requestType, ragUsed, safetyFlags) {
  const structured = parseProtocolStructure(rawReply);
  await db.doc(`doctor_protocols/${protocolId}`).set({
    doctor_id:    doctorId,
    patient_id:   patientData?.patientId || null,
    title:        structured.title || "Protocol — " + new Date().toLocaleDateString(),
    status:       "draft",
    generated_by: AGENT_NAME,
    agent_version: "2.0",
    raw_markdown:  rawReply,
    structured,
    patient_data_snapshot: {
      age:         patientData?.age || null,
      sex:         patientData?.sex || null,
      biomarkers:  patientData?.biomarkers || {},
      goals:       patientData?.goals || [],
      currentMeds: patientData?.currentMeds || [],
    },
    request_type:     requestType,
    rag_context_used: ragUsed,
    safety_flags:     safetyFlags || [],
    created_at:       FieldValue.serverTimestamp(),
    updated_at:       FieldValue.serverTimestamp(),
    versions:         [],
  });
}

async function updateProtocol(db, protocolId, rawReply, doctorId, safetyFlags) {
  const structured = parseProtocolStructure(rawReply);
  const current    = await db.doc(`doctor_protocols/${protocolId}`).get();
  if (current.exists) {
    const prev = current.data();
    await db.doc(`doctor_protocols/${protocolId}`).update({
      raw_markdown: rawReply,
      structured,
      safety_flags: safetyFlags || [],
      updated_at:   FieldValue.serverTimestamp(),
      versions:     FieldValue.arrayUnion({
        raw_markdown: prev.raw_markdown,
        updated_at:   prev.updated_at,
        updated_by:   doctorId,
      }),
    });
  }
}

async function saveSession(db, sessionId, updates) {
  if (!sessionId) return;
  try {
    await db.doc(`ai_sessions/${sessionId}`).set(
      { ...updates, last_agent: "doctor_protocol", expires_at: new Date(Date.now() + 86400000), updated_at: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    structuredLogger.warn({ event: "ai_session_write_fail", agentName: AGENT_NAME, error: e.message });
  }
}

// ── Agent (factory) ────────────────────────────────────────────────────────────
module.exports = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    new Set(["doctor", "clinic", "admin"]),
  model:           "gemini-2.5-pro",
  maxOutputTokens: 4096,
  timeout:         120,

  handler: async (ctx) => {
    const { body, sessionId, role, uid: doctorId, traceId, db } = ctx;
    const {
      patientData  = {},
      requestType  = "chat",
      protocolId:  existingProtocolId = null,
    } = body;
    const message = (body.message || "").trim();

    if (!message) throw new Error("Missing 'message' in request body");

    // Build patient context
    const contextParts = [`Physician role: ${role}`];
    if (patientData?.age)             contextParts.push(`Patient age: ${patientData.age}`);
    if (patientData?.sex)             contextParts.push(`Patient sex: ${patientData.sex}`);
    if (patientData?.goals?.length)   contextParts.push(`Patient goals: ${patientData.goals.join(", ")}`);
    if (patientData?.currentMeds?.length) contextParts.push(`Current meds/supplements: ${patientData.currentMeds.join(", ")}`);
    if (patientData?.biomarkers && Object.keys(patientData.biomarkers).length > 0)
      contextParts.push(`Biomarkers: ${Object.entries(patientData.biomarkers).map(([k, v]) => `${k}: ${v}`).join(", ")}`);

    let enrichedMessage = `[CLINICAL CONTEXT]\n${contextParts.join("\n")}\n\n`;
    if      (requestType === "build_protocol")   enrichedMessage += `BUILD PROTOCOL REQUEST: ${message}\nUse the full clinical output format.`;
    else if (requestType === "interpret_labs")   enrichedMessage += `LAB INTERPRETATION REQUEST: ${message}\nInterpret biomarkers, flag out-of-range values.`;
    else if (requestType === "interaction_check") enrichedMessage += `INTERACTION CHECK: ${message}\nEvaluate interactions, contraindications, and safety.`;
    else                                          enrichedMessage += message;

    // RAG enrichment
    let ragContext = "";
    const compoundMentioned = message.match(/\b(BPC-157|TB-500|GHK-Cu|Ipamorelin|Selank|Semax|Epithalon|MOTS-c|PT-141|KPV|LL-37|Thymosin|Follistatin|Kisspeptin|Tesamorelin|GHRP|CJC|NMN|NR|Berberine)\b/gi);
    if (compoundMentioned?.length > 0) {
      try {
        ragContext = await callVertexAgent(
          `Clinical briefing for ${[...new Set(compoundMentioned)].join(", ")}`,
          sessionId, "doctor", patientData, AGENT_REGISTRY.rag
        );
      } catch (ragErr) {
        structuredLogger.warn({ event: "doctor_rag_failed", agentName: AGENT_NAME, traceId, error: ragErr.message });
      }
    }

    const fullMessage = ragContext
      ? `${enrichedMessage}\n\n[CATALOG & COA DATA FROM AGENTRAG]\n${ragContext}`
      : enrichedMessage;

    const rawReply = await callGemini(
      [{ role: "user", parts: [{ text: fullMessage }] }],
      SYSTEM_PROMPT, "gemini-2.5-pro", "text/plain", 4096
    );

    const { reply, flags: safetyFlags } = await safetyCheck(rawReply, { handler: "doctor_protocol", role });

    // Persist protocol
    let savedProtocolId = existingProtocolId;
    if (requestType === "build_protocol" && doctorId) {
      savedProtocolId = existingProtocolId || generateProtocolId(doctorId);
      if (existingProtocolId) await updateProtocol(db, existingProtocolId, reply, doctorId, safetyFlags);
      else                    await saveProtocol(db, savedProtocolId, doctorId, patientData, reply, requestType, !!ragContext, safetyFlags);
    }

    // Save session
    await saveSession(db, sessionId, {
      userId: doctorId, user_role: role, last_protocol_id: savedProtocolId,
      biomarkers: patientData?.biomarkers || {},
      identified_compounds: compoundMentioned ? [...new Set(compoundMentioned)] : [],
    });

    // Format response
    const structuredData = requestType === "build_protocol" ? parseProtocolStructure(reply) : null;
    const formatterType  = requestType === "build_protocol"  ? "protocol"
                         : requestType === "interpret_labs"  ? "lab_analysis"
                         : "rag_response";
    let formatted = null;
    try {
      formatted = await formatResponse(structuredData || reply, { formatType: formatterType, role, language: "en" });
    } catch (_) { /* non-fatal */ }

    return {
      reply,
      formatted,
      extras: {
        requestType,
        ragEnriched:  !!ragContext,
        protocolId:   savedProtocolId || null,
        protocolSaved: requestType === "build_protocol" && !!doctorId,
        structured:   structuredData,
      },
    };
  },

  fallback: async (_, err) => ({
    reply: `AgentDoctor temporarily unavailable. Please try again in a moment. (${err?.message || "unknown error"})`,
  }),
});

// Export handleDoctorProtocol for ai.js router compatibility
module.exports.handleDoctorProtocol = async function handleDoctorProtocol(req, res) {
  // Legacy shim — the main handler is now handled by the factory-wrapped export.
  // This export exists for ai.js which may import it directly.
  res.status(501).json({ error: "Route directly to /doctorAiAssistant endpoint." });
};
