"use strict";
/**
 * ai_personalization.js — AgentPersonalization (Onboarding & Goal Matching)
 * Migrated to createAgent() factory — v2
 *
 * Business logic unchanged. Factory handles:
 *   CORS, role guard, traceId, response envelope, async trace, error handling.
 *
 * Persists to Firestore:
 *  - users/{userId}/ai_profile/profile
 *  - users/{userId}/ai_conversations/{sessionId}
 *  - ai_sessions/{sessionId}
 */

const createAgent = require("../agents/createAgent");
const {
  callGemini, callVertexAgent, structuredLogger, AGENT_REGISTRY,
} = require("./ai_utils");
const { safetyCheck }    = require("./ai_safety");
const { formatResponse } = require("./ai_formatter");
const { FieldValue }     = require("firebase-admin/firestore");

const AGENT_ID   = "7b591a3d-f644-4505-8e38-abcfe809bd95";
const AGENT_NAME = "AgentPersonalization";

// ── Intro messages (i18n) ──────────────────────────────────────────────────────
const INTRO_MESSAGE = {
  en: `👋 **Hi! I'm ClinicAI**, your personal research guide at Atlas Health.

I'm here to help you find the right peptides, supplements, and protocols for **your specific goals**.

To give you the best recommendations, I'd love to ask you a few quick questions:

1. **What's your main health or performance goal?**
   *(e.g. recovery, longevity, hormonal balance, cognitive support, weight...)*

2. **What's your experience level with peptides and supplements?**
   *(Beginner / Intermediate / Advanced)*

3. **Any specific areas of concern?** *(optional)*
   *(e.g. sleep quality, energy levels, muscle recovery, immune support...)*

Feel free to answer all at once or one at a time — I'll adapt! 🔬`,

  es: `👋 **¡Hola! Soy ClinicAI**, tu guía de investigación personal en Atlas Health.

Estoy aquí para ayudarte a encontrar los péptidos, suplementos y protocolos adecuados para **tus objetivos específicos**.

Para darte las mejores recomendaciones, me gustaría hacerte unas preguntas rápidas:

1. **¿Cuál es tu objetivo principal de salud o rendimiento?**
   *(p. ej. recuperación, longevidad, equilibrio hormonal, apoyo cognitivo, peso...)*

2. **¿Cuál es tu nivel de experiencia con péptidos y suplementos?**
   *(Principiante / Intermedio / Avanzado)*

3. **¿Algún área de especial interés?** *(opcional)*
   *(p. ej. calidad del sueño, energía, recuperación muscular, sistema inmune...)*

¡Puedes responder todo a la vez o poco a poco — me adapto! 🔬`,
};

const GOAL_CATALOG_MAP = {
  recovery:  { path: "/collection/protocols?q=recovery",   tag: "tissue-repair"    },
  longevity: { path: "/collection/protocols?q=longevity",  tag: "anti-aging"       },
  metabolic: { path: "/collection/protocols?q=metabolic",  tag: "metabolic-health" },
  cognitive: { path: "/collection/protocols?q=cognitive",  tag: "nootropics"       },
  sleep:     { path: "/collection/protocols?q=sleep",      tag: "circadian"        },
  hormonal:  { path: "/collection/protocols?q=hormonal",   tag: "endocrine"        },
  immune:    { path: "/collection/protocols?q=immune",     tag: "immune-support"   },
};

const SYSTEM_PROMPT = `You are ClinicAI, the personalization and onboarding agent for Atlas Health.com.

Your role is to conduct a warm, conversational intake interview with new users to understand:
1. Their primary health or performance goals (recovery, longevity, metabolic, cognitive, sleep, hormonal, immune)
2. Their experience level with peptides and supplements (beginner/intermediate/advanced)
3. Any specific concerns, contraindications, or areas of interest
4. Their lifestyle context (active/sedentary, age range if volunteered, current stack if any)

PERSONALITY:
- Warm, curious, science-informed — like a knowledgeable friend who happens to be a researcher
- Never condescending, never preachy
- Ask one or two questions at a time max — don't overwhelm
- Use emojis sparingly but effectively (🔬 🧬 💪 🌙)
- Speak in the same language as the user (Spanish or English)

AFTER gathering goals and experience level:
- Summarize what you understood about the user
- Recommend 2-3 specific protocols from the catalog with links: /protocol/[slug]
- Recommend 2-3 key peptides or supplements with links: /product/[slug]
- Suggest next step: "You can explore these in our catalog, or ask me anything specific"
- If the user came from GoalEntryFlow (goal is in context), skip the goal question and go straight to experience level

CATALOG CONTEXT:
- Beginner-friendly: BPC-157 (recovery), Semax (cognitive), GHK-Cu (skin/aging), TB-500 (healing)
- Intermediate: Ipamorelin+CJC-1295 (GH axis), PT-141 (libido), Selank (anxiety/immune), KPV (gut)
- Advanced: Epithalon (telomere), MOTS-c (metabolic/longevity), Thymosin Alpha-1 (immune), LL-37
- Supplements: NMN, NR (NAD+), Berberine (metabolic), Spermidine (autophagy), Urolithin A (mitochondria)
- Protocols: Anti-aging stack, Muscle recovery stack, Gut healing stack, Neurological support stack

RULES:
- NEVER prescribe doses or frequencies — always say "research ranges" and "consult a professional"
- NEVER diagnose conditions
- If user mentions a medical condition: acknowledge it, recommend consulting their doctor, then provide educational info
- Always add: "This is for educational and research purposes only."`;

// ── Firestore helpers ──────────────────────────────────────────────────────────
async function loadUserProfile(db, userId) {
  if (!userId) return null;
  try {
    const snap = await db.doc(`users/${userId}/ai_profile/profile`).get();
    return snap.exists ? snap.data() : null;
  } catch (e) {
    structuredLogger.warn({ event: "ai_profile_read_fail", agentName: AGENT_NAME, error: e.message });
    return null;
  }
}

async function saveUserProfile(db, userId, updates) {
  if (!userId) return;
  try {
    await db.doc(`users/${userId}/ai_profile/profile`).set(
      { ...updates, last_updated: FieldValue.serverTimestamp(), source_agent: AGENT_NAME },
      { merge: true }
    );
  } catch (e) {
    structuredLogger.warn({ event: "ai_profile_write_fail", agentName: AGENT_NAME, error: e.message });
  }
}

async function appendConversation(db, userId, sessionId, userMsg, agentReply) {
  if (!userId || !sessionId) return;
  try {
    await db.doc(`users/${userId}/ai_conversations/${sessionId}`).set({
      agent: "personalization",
      created_at: FieldValue.serverTimestamp(),
      messages: FieldValue.arrayUnion(
        { role: "user",  text: userMsg,   timestamp: new Date().toISOString() },
        { role: "agent", text: agentReply, timestamp: new Date().toISOString() }
      ),
    }, { merge: true });
  } catch (e) {
    structuredLogger.warn({ event: "ai_conversation_write_fail", agentName: AGENT_NAME, error: e.message });
  }
}

async function saveSession(db, sessionId, updates) {
  if (!sessionId) return;
  try {
    await db.doc(`ai_sessions/${sessionId}`).set(
      { ...updates, last_agent: "personalization", expires_at: new Date(Date.now() + 86400000), updated_at: FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    structuredLogger.warn({ event: "ai_session_write_fail", agentName: AGENT_NAME, error: e.message });
  }
}

function extractProfileData(reply, goalContext, lifestyleContext) {
  const data = {};
  if (goalContext?.goalId)                data.primary_goal = goalContext.goalId;
  if (goalContext?.goalLabel)             data.goals = [goalContext.goalLabel];
  if (lifestyleContext?.objectives?.length) data.concerns = lifestyleContext.objectives;
  if (lifestyleContext?.lifestyle)        data.lifestyle = lifestyleContext.lifestyle;

  if (/beginner|principiante|novato/i.test(reply))   data.experience_level = "beginner";
  else if (/intermediate|intermedio/i.test(reply))   data.experience_level = "intermediate";
  else if (/advanced|avanzado|experto/i.test(reply)) data.experience_level = "advanced";

  const compoundPattern = /\b(BPC-157|TB-500|GHK-Cu|Ipamorelin|CJC-1295|Selank|Semax|Epithalon|MOTS-c|PT-141|KPV|LL-37|Thymosin|NMN|Berberine|Spermidine|Urolithin)\b/gi;
  const compounds = [...new Set((reply.match(compoundPattern) || []).map(c => c.toUpperCase()))];
  if (compounds.length) data.recommended_compounds = compounds;

  const protocolLinks = [...(reply.matchAll(/\/protocol\/[\w-]+/g) || [])].map(m => m[0]);
  if (protocolLinks.length) data.recommended_protocols = protocolLinks;

  return data;
}

// ── Agent (factory) ────────────────────────────────────────────────────────────
const agentExport = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    null,           // public — guests can use onboarding
  model:           "gemini-2.5-flash",
  maxOutputTokens: 1200,
  timeout:         60,

  handler: async (ctx) => {
    const { body, sessionId, uid: userId, role, db } = ctx;
    const {
      language        = "en",
      isNewSession    = false,
      goalContext     = null,
      lifestyleContext = null,
    } = body;
    const message = (body.message || "").trim();

    // Load existing AI profile
    const existingProfile = await loadUserProfile(db, userId);

    // New session → send intro
    if (isNewSession && !message) {
      const lang = language === "es" ? "es" : "en";
      let intro  = INTRO_MESSAGE[lang];

      if (existingProfile?.primary_goal) {
        const goal = existingProfile.primary_goal;
        intro = lang === "es"
          ? `👋 **¡Bienvenido/a de nuevo!** Recuerdo que estabas explorando **${goal}**.\n¿Quieres continuar desde donde lo dejaste, o tienes nuevos objetivos? 🔬`
          : `👋 **Welcome back!** I remember you were exploring **${goal}**.\nWould you like to continue where you left off, or do you have new goals? 🔬`;
      } else if (goalContext?.goalLabel) {
        intro = lang === "es"
          ? `👋 **¡Hola! Soy ClinicAI.** Veo que te interesa **${goalContext.goalLabel}** — ¡excelente elección! 🎯\n\nSolo una pregunta más:\n\n**¿Cuál es tu nivel de experiencia con péptidos?**\n*(Principiante / Intermedio / Avanzado)*`
          : `👋 **Hi! I'm ClinicAI.** I can see you're interested in **${goalContext.goalLabel}** — great choice! 🎯\n\nJust one more question:\n\n**What's your experience level with peptides?**\n*(Beginner / Intermediate / Advanced)*`;
      }

      await saveSession(db, sessionId, { userId, goalContext, lifestyleContext, user_role: role });

      return {
        reply: intro,
        extras: { isIntro: true, hasExistingProfile: !!existingProfile, goalContext },
      };
    }

    if (!message) throw new Error("Missing 'message' in request body");

    // Build context block
    const contextParts = [];
    if (goalContext?.goalLabel)              contextParts.push(`Selected goal: ${goalContext.goalLabel} — ${goalContext.aiPrompt || ""}`);
    if (lifestyleContext?.objectives?.length) contextParts.push(`Lifestyle objectives: ${lifestyleContext.objectives.join(", ")}`);
    if (lifestyleContext?.lifestyle)          contextParts.push(`Lifestyle: ${JSON.stringify(lifestyleContext.lifestyle)}`);
    if (existingProfile?.experience_level)   contextParts.push(`Known experience level: ${existingProfile.experience_level}`);
    if (existingProfile?.goals?.length)      contextParts.push(`Previously stated goals: ${existingProfile.goals.join(", ")}`);
    if (role !== "guest")                    contextParts.push(`User role: ${role}`);
    const contextBlock = contextParts.length > 0 ? `[CONTEXT]\n${contextParts.join("\n")}\n\n` : "";

    const rawReply = await callGemini(
      [{ role: "user", parts: [{ text: `${contextBlock}${message}` }] }],
      SYSTEM_PROMPT, "gemini-2.5-flash", "text/plain", 1200
    );

    const { reply } = await safetyCheck(rawReply, { handler: "personalization", role });

    const profileUpdates = extractProfileData(reply, goalContext, lifestyleContext);
    profileUpdates.onboarding_complete = true;

    const [formattedResult] = await Promise.allSettled([
      formatResponse(reply, {
        formatType: "onboarding", role, language,
        profileData: { ...profileUpdates, ...existingProfile },
      }),
    ]);

    await Promise.allSettled([
      userId ? saveUserProfile(db, userId, profileUpdates) : Promise.resolve(),
      appendConversation(db, userId, sessionId, message, reply),
      saveSession(db, sessionId, { userId, goalContext, lifestyleContext, user_role: role, ...profileUpdates }),
    ]);

    // Optional RAG enrichment for catalog recommendations
    let catalogEnrichment = null;
    if (/recommend|suggest|which|best for|what peptide|what protocol/i.test(message)) {
      try {
        catalogEnrichment = await callVertexAgent(
          message, sessionId, role, { goalContext, lifestyleContext }, AGENT_REGISTRY.rag
        );
      } catch (ragErr) {
        structuredLogger.warn({ event: "personalization_rag_failed", agentName: AGENT_NAME, error: ragErr.message });
      }
    }

    return {
      reply,
      formatted: formattedResult?.value || null,
      extras: {
        catalogEnrichment:  catalogEnrichment || null,
        goalCatalogHint:    goalContext?.goalId ? GOAL_CATALOG_MAP[goalContext.goalId] : null,
        profileSaved:       !!userId,
      },
    };
  },

  fallback: async () => ({
    reply: "👋 I'm having a moment — please try again in a second! 🔬",
    extras: { isIntro: false },
  }),
});

module.exports = agentExport;
// Legacy named export for ai.js router compatibility
module.exports.handlePersonalization = async (req, res) =>
  res.status(501).json({ error: "Route directly to /personalizationAiAssistant endpoint." });
