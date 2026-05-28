"use strict";

const createAgent = require("../agents/createAgent");
const { callGemini, structuredLogger } = require("./ai_utils");
const { FieldValue } = require("firebase-admin/firestore");

const AGENT_ID   = "semantic-refine-agent-001";
const AGENT_NAME = "AgentSemanticRefine";

const CANONICAL_GOALS = [
  "cognitive_mood",
  "hormonal_optimization",
  "immune_support",
  "longevity_anti_aging",
  "metabolic_weight",
  "recovery_repair",
  "sleep_circadian"
];

async function refineProductSemantics(ctx, { productId, name, category, description, currentGoals = [], currentSecondaryFactors = [], currentMechanisms = [] }) {
  if (!name) {
    throw new Error("Product name is required for semantic refinement.");
  }

  const prompt = `You are a clinical data enrichment assistant. Enrich the search metadata for a research compound/peptide product to make it highly searchable via natural language (English and Spanish queries).

PRODUCT DETAILS:
Name: ${name}
Category: ${category || "—"}
Description: ${description || "—"}

Current Goals: ${JSON.stringify(currentGoals)}
Current Secondary Factors: ${JSON.stringify(currentSecondaryFactors)}
Current Mechanisms: ${JSON.stringify(currentMechanisms)}

TASK:
Review the product and generate a refined, rich set of semantic search metadata.
1. Match the product against these 7 CANONICAL GOALS (select all that apply, but only if they are biologically relevant):
   - "cognitive_mood" (brain, memory, focus, anxiety, mood, DSIP, Semax, Selank, etc.)
   - "hormonal_optimization" (growth hormone, ipamorelin, testosterone, lean mass, etc.)
   - "immune_support" (immunity, KPV, thymosin, antiviral, immune modulation, etc.)
   - "longevity_anti_aging" (anti-aging, wrinkle reduction, cellular aging, GHK-Cu, Epithalon, skin, hair, etc.)
   - "metabolic_weight" (weight loss, fat loss, body composition, GLP-1, semaglutide, tirzepatide, metabolism)
   - "recovery_repair" (injury, tendon/ligament repair, joint pain, tissue repair, BPC-157, TB-500, etc.)
   - "sleep_circadian" (sleep quality, deep sleep, circadian rhythm, DSIP, etc.)
   Select zero or more of these exact strings.

2. Generate a list of "secondaryFactors" (search tags/synonyms/conditions) that patients or researchers might query. Provide tags strictly in English, focusing on symptoms, use-cases, and synonyms (e.g., "hair loss", "wrinkles", "acne", "wound healing", etc.). Limit to 8-12 high-quality tags.

3. Generate a list of biological "mechanisms" of action describing how it works (e.g. "angiogenesis", "collagen synthesis", "fibroblast migration"). Limit to 3-5 mechanisms.

Return ONLY a valid JSON object matching this schema (do NOT wrap in markdown block):
{
  "goals": ["<canonical_goal_1>", "<canonical_goal_2>"],
  "secondaryFactors": ["tag1", "tag2", "tag3"],
  "mechanisms": ["mechanism1", "mechanism2"]
}`;

  try {
    structuredLogger.info({ event: "semantic_refine_gemini_start", productId, productName: name });
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      "You are a clinical data parser. Output only raw JSON objects.",
      "gemini-2.0-flash", "text/plain", 1024
    );

    const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    const refined = JSON.parse(jsonText);

    if (!refined || !Array.isArray(refined.goals) || !Array.isArray(refined.secondaryFactors) || !Array.isArray(refined.mechanisms)) {
      throw new Error("AI returned an invalid semantic payload structure.");
    }

    // Clean goals to only match canonical goals
    const cleanedGoals = refined.goals.filter(g => CANONICAL_GOALS.includes(g));

    const result = {
      goals: cleanedGoals,
      secondaryFactors: refined.secondaryFactors.map(s => String(s).trim().toLowerCase()),
      mechanisms: refined.mechanisms.map(m => String(m).trim())
    };

    structuredLogger.info({ event: "semantic_refine_gemini_success", productId, result });
    return result;
  } catch (err) {
    structuredLogger.error({ event: "semantic_refine_gemini_error", productId, error: err.message });
    throw err;
  }
}

module.exports = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    new Set(["admin"]),
  model:           "gemini-2.0-flash",
  maxOutputTokens: 2048,
  timeout:         60,

  handler: async (ctx) => {
    const { body, db } = ctx;
    const mode = body.mode || "refine"; // "refine" | "refine_bulk"

    if (mode === "refine") {
      const refined = await refineProductSemantics(ctx, body);
      
      if (body.productId) {
        const docRef = db.collection("products").doc(body.productId);
        await docRef.update({
          goals: refined.goals,
          secondaryFactors: refined.secondaryFactors,
          mechanisms: refined.mechanisms,
          updatedAt: FieldValue.serverTimestamp()
        }).catch(e => {
          console.warn("Could not save refined semantics to product doc:", e.message);
        });
      }

      return {
        reply: `Refined semantics for product ${body.name || "item"}.`,
        extras: { refined }
      };
    } else if (mode === "refine_bulk") {
      const { products: productsToRefine = [] } = body;
      const results = [];
      const batch = db.batch();

      for (const p of productsToRefine) {
        try {
          const refined = await refineProductSemantics(ctx, p);
          const docRef = db.collection("products").doc(p.productId);
          
          const updateData = {
            goals: refined.goals,
            secondaryFactors: refined.secondaryFactors,
            mechanisms: refined.mechanisms,
            updatedAt: FieldValue.serverTimestamp()
          };
          
          batch.set(docRef, updateData, { merge: true });
          results.push({ productId: p.productId, status: "success", refined });
        } catch (err) {
          results.push({ productId: p.productId, status: "error", message: err.message });
        }
      }

      await batch.commit();

      return {
        reply: `Bulk semantic refinement complete: ${results.filter(r => r.status === "success").length} succeeded, ${results.filter(r => r.status === "error").length} failed.`,
        extras: { results }
      };
    }

    throw new Error(`Unsupported mode: ${mode}`);
  },

  fallback: async () => ({
    reply: "Semantic refinement agent is currently unavailable.",
    extras: {}
  })
});
