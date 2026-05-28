"use strict";

const createAgent = require("../agents/createAgent");
const { callGemini, structuredLogger } = require("./ai_utils");

const AGENT_ID   = "catalog-builder-agent-001";
const AGENT_NAME = "AgentCatalogBuilder";

/**
 * AI Generation Handler: Builds catalog copywriting, section groupings, FAQs, and product rankings
 */
async function generateCatalogContent(ctx, body, dynamicConfig = {}) {
  const { goal, audience, products = [], protocols = [], territory = "US", language = "en", recipientName = "", clinicName = "" } = body;

  const prompt = `You are an elite B2B medical merchandising and commercial publishing assistant.
Generate a structured, highly persuasive, and clinically professional product catalog based on the parameters below.

CATALOG METADATA:
- Core Goal: ${goal}
- Target Audience: ${audience} (Tailor scientific depth and tone accordingly)
- Territory: ${territory}
- Language: ${language}
${recipientName ? `- Prepared specifically for: ${recipientName}` : ""}
${clinicName ? `- Clinic context: ${clinicName}` : ""}

AVAILABLE PRODUCTS:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description })))}

AVAILABLE CLINICAL PROTOCOLS:
${JSON.stringify(protocols.map(p => ({ id: p.id, name: p.name, goal: p.goal, description: p.description })))}

TASK:
1. Formulate a compelling, premium hero section: title, subtitle, and introduction narrative.
2. Group the products and protocols into 2-3 logical theme-based catalog sections. For each section, provide a title, description, and the list of matching product IDs and protocol IDs.
3. Generate a set of 3-5 relevant FAQs for the catalog target topic.
4. Provide 2-3 upsell suggestions and cross-sell recommendations.
5. Provide a professional clinical research disclaimer (e.g. "For research purposes only...").

Return ONLY a valid JSON object matching the schema below. Do NOT wrap in markdown code blocks. Output raw JSON.

SCHEMA:
{
  "heroTitle": "Title text",
  "heroSubtitle": "Subtitle text",
  "heroDescription": "Introductory description text",
  "sections": [
    {
      "title": "Section Title",
      "description": "Section introduction",
      "products": ["product-id-1", "product-id-2"],
      "protocols": ["protocol-id-1"]
    }
  ],
  "faq": [
    { "q": "Question", "a": "Answer" }
  ],
  "upsells": [
    { "name": "Upsell Item Name", "benefit": "Upsell explanation" }
  ],
  "crossSellRecommendations": [
    { "name": "Cross-sell Item", "why": "Why it pairs well" }
  ],
  "disclaimer": "Clinical disclaimer text"
}`;

  try {
    structuredLogger.info({ event: "catalog_builder_gemini_start", goal, audience });
    const model = dynamicConfig.model || "gemini-2.5-flash";
    const systemInstruction = dynamicConfig.systemInstruction || "You are a structured clinical merchandising catalog generator. Output only raw JSON.";
    
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction,
      model, "application/json", 2048, "catalog_builder"
    );

    const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(jsonText);
  } catch (err) {
    structuredLogger.error({ event: "catalog_builder_gemini_error", error: err.message });
    throw err;
  }
}

/**
 * AI Catalog Search: Executes semantic matching within a specific catalog's products/protocols
 */
async function searchCatalog(ctx, body, dynamicConfig = {}) {
  const { query: searchQuery, catalogContext } = body;
  if (!searchQuery) return { results: [] };

  const prompt = `You are a clinical search agent. Search for matching products or protocols inside this specific catalog based on the user's natural language query.

USER QUERY: "${searchQuery}"

CATALOG CONTEXT:
${JSON.stringify(catalogContext)}

TASK:
Identify which product IDs or protocol IDs inside the catalog context match the user query's intent (e.g. searching "weight loss" should match GLP-1/Semaglutide products, "sleep" should match DSIP, etc.).

Return ONLY a valid JSON object matching the schema below. Output raw JSON.

SCHEMA:
{
  "matchedProductIds": ["prod-1"],
  "matchedProtocolIds": ["proto-1"],
  "relevanceExplanation": "Brief search matching rationale"
}`;

  try {
    const model = dynamicConfig.model || "gemini-2.0-flash";
    const raw = await callGemini(
      [{ role: "user", parts: [{ text: prompt }] }],
      "You are a structured search engine. Output only raw JSON.",
      model, "application/json", 512, "catalog_builder"
    );
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(jsonText);
  } catch (err) {
    structuredLogger.error({ event: "catalog_search_gemini_error", error: err.message });
    throw err;
  }
}

/**
 * AI Catalog Chat Assistant: Chatbot pre-loaded and locked to the catalog's products/scope
 */
async function assistantChat(ctx, body, dynamicConfig = {}) {
  const { message, catalogContext, history = [] } = body;

  const systemInstruction = `You are a clinical assistant chatbot for a private medical product catalog.
You MUST ONLY answer questions using the catalog context provided. Do NOT recommend or mention any products, compounds, or protocols that are not explicitly present in the catalog context.

CATALOG CONTEXT:
${JSON.stringify(catalogContext)}

If the user asks about a product not in the catalog, politely reply that it is not available in their assigned catalog and direct them to contact support.`;

  const contents = [
    ...history.map(h => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];

  try {
    const model = dynamicConfig.model || "gemini-2.0-flash";
    const reply = await callGemini(
      contents,
      systemInstruction,
      model, "text/plain", 1024, "catalog_builder"
    );
    return { reply };
  } catch (err) {
    structuredLogger.error({ event: "catalog_assistant_gemini_error", error: err.message });
    throw err;
  }
}

module.exports = createAgent({
  agentId:         AGENT_ID,
  agentName:       AGENT_NAME,
  allowedRoles:    null, // Publicly accessible by guests and wholesalers alike
  model:           "gemini-2.5-flash",
  maxOutputTokens: 2048,
  timeout:         90,

  handler: async (ctx) => {
    const { body } = ctx;
    const mode = body.mode || "generate"; // "generate" | "search" | "chat"

    let dynamicConfig = {};
    try {
      const { getFirestore } = require("firebase-admin/firestore");
      const snap = await getFirestore().collection("ai_config").doc("agents").get();
      if (snap.exists && snap.data().catalog_builder) {
        dynamicConfig = snap.data().catalog_builder;
      }
    } catch (e) {
      // ignore
    }

    if (mode === "generate") {
      const generated = await generateCatalogContent(ctx, body, dynamicConfig);
      return {
        reply: `Catalog content generated for goal: ${body.goal || "custom"}.`,
        extras: { generated }
      };
    } else if (mode === "search") {
      const searchResult = await searchCatalog(ctx, body, dynamicConfig);
      return {
        reply: `Search complete for query: ${body.query}.`,
        extras: { searchResult }
      };
    } else if (mode === "chat") {
      const chatResult = await assistantChat(ctx, body, dynamicConfig);
      return {
        reply: chatResult.reply,
        extras: { chatResult }
      };
    }

    throw new Error(`Unsupported mode: ${mode}`);
  },

  fallback: async () => ({
    reply: "Catalog Assistant is temporarily offline.",
    extras: {}
  })
});
